import React, { useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
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
    CheckCircle,
    AlertCircle,
    Info,
    Shield,
    Network,
    RefreshCw,
    Hourglass,
    BarChart3,
    ArrowUp,
    ArrowDown,
    Lock,
    Unlock,
    Sparkles,
    Terminal,
    GitCommit,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
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
        .dpg-metric { transition: transform 0.2s ease, border-color 0.2s ease; }
        .dpg-table-row { border-bottom: 1px solid ${THEME.glassBorder}; padding: 12px 0; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
        .dpg-table-row:last-child { border-bottom: none; }
    `}</style>
);

/* ─── Panel Component ────────────────────────────────────────────────────── */
const Panel = ({ title, icon: TIcon, rightNode, children, noPad, accentColor, style = {} }) => (
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
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    minHeight: 44,
                    background: accentColor ? `${accentColor}06` : 'rgba(255,255,255,0.02)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                {rightNode}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '16px 18px' }}>{children}</div>
    </div>
);

/* ─── StatusBadge Component ──────────────────────────────────────────────── */
const StatusBadge = ({ label, color, pulse }) => (
    <span
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 9.5,
            fontWeight: 700,
            padding: '4px 11px',
            borderRadius: 12,
            background: `${color}12`,
            color,
            border: `1px solid ${color}28`,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            fontFamily: THEME.fontMono,
            letterSpacing: '0.05em',
        }}
    >
        <span
            style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 8px ${color}80, 0 0 12px ${color}40`,
                flexShrink: 0,
                animation: pulse ? 'ovPulse 1.5s ease-in-out infinite' : 'none',
            }}
        />
        {label}
    </span>
);

/* ─── RingGauge Component ────────────────────────────────────────────────── */
const RingGauge = ({
    value,
    color,
    size = 80,
    strokeWidth = 6,
    label,
    showValue = true,
    secondaryValue,
    secondaryColor,
}) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const filled = (circ * Math.min(value, 100)) / 100;
    const r2 = r - strokeWidth - 3;
    const circ2 = 2 * Math.PI * r2;
    const filled2 = secondaryValue !== null ? (circ2 * Math.min(secondaryValue, 100)) / 100 : 0;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={`${THEME.grid}45`}
                    strokeWidth={strokeWidth}
                />
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
                        filter: `drop-shadow(0 0 6px ${color}60) drop-shadow(0 0 12px ${color}30)`,
                    }}
                />
                {secondaryValue !== null && (
                    <>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={r2}
                            fill="none"
                            stroke={`${THEME.grid}35`}
                            strokeWidth={strokeWidth - 1.5}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={r2}
                            fill="none"
                            stroke={secondaryColor}
                            strokeWidth={strokeWidth - 1.5}
                            strokeDasharray={`${filled2} ${circ2 - filled2}`}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            style={{
                                transition: 'stroke-dasharray 1.3s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
                                filter: `drop-shadow(0 0 5px ${secondaryColor}50) drop-shadow(0 0 10px ${secondaryColor}25)`,
                            }}
                        />
                    </>
                )}
            </svg>
            {showValue && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                    }}
                >
                    <span
                        style={{
                            fontSize: size > 70 ? 17 : 10,
                            fontWeight: 700,
                            color,
                            lineHeight: 1,
                            fontFamily: THEME.fontMono,
                        }}
                    >
                        {value}%
                    </span>
                    {label && (
                        <span
                            style={{
                                fontSize: 7.5,
                                color: THEME.textDim,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginTop: 1,
                            }}
                        >
                            {label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── MiniSparkline Component ────────────────────────────────────────────── */
const MiniSparkline = ({ data = [], color = THEME.primary, width = 64, height = 20, filled = true }) => {
    if (!data || data.length < 2) return <div style={{ width, height }} />;
    const min = Math.min(...data),
        max = Math.max(...data),
        range = max - min || 1;
    const pts = data
        .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`)
        .join(' ');
    const uid = `dpgsp-${color.replace(/[^a-z0-9]/gi, '')}-${width}`;
    return (
        <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
                <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            {filled && <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${uid})`} />}
            <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

/* ─── HeroMetric Card ────────────────────────────────────────────────────── */
const HeroMetric = ({ icon: Icon, label, value, trend, color }) => (
    <div
        style={{
            background: THEME.glass,
            backdropFilter: 'blur(16px)',
            borderRadius: 12,
            border: `1px solid ${THEME.glassBorder}`,
            padding: '14px 16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 0 0 1px ${THEME.glassBorder}, 0 4px 12px rgba(0,0,0,0.08)`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
        }}
    >
        <div className="dpg-card-shine" />
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
                flexShrink: 0,
            }}
        >
            <Icon size={18} color={color} />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
            <div
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: THEME.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 4,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: THEME.fontMono,
                    color: THEME.textMain,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}
            >
                {value}
                {trend && (
                    <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 2, color }}>
                        {trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    </span>
                )}
            </div>
        </div>
    </div>
);

/* ─── Chart Tooltip ──────────────────────────────────────────────────────── */
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

/* ─── Helper Functions ───────────────────────────────────────────────────── */
const generateChartData = (hours = 24) =>
    Array.from({ length: hours }, (_, i) => ({
        time: `${String(i).padStart(2, '0')}:00`,
    }));

const fmtNum = (n) => {
    if (n === null) return '—';
    const v = Number(n);
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return String(Math.round(v));
};

const fmtRelTime = (isoStr) => {
    if (!isoStr) return 'Never';
    const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
    if (diff < 60) return `${Math.round(diff)}s ago`;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
function DemoPostgresTab({ tabId = 'demo-pg-overview' }) {
    useAdaptiveTheme();

    // Detect section from tabId
    const isOverview = [
        'demo-pg-fleet',
        'demo-pg-overview',
        'demo-pg-performance',
        'demo-pg-resources',
        'demo-pg-reliability',
    ].some((t) => tabId.includes(t));
    const isAlerts = ['demo-pg-alerts', 'demo-pg-alert-rules', 'demo-pg-alert-correlation'].some((t) =>
        tabId.includes(t),
    );
    const isQuery = [
        'demo-pg-optimizer',
        'demo-pg-query-plan',
        'demo-pg-regression',
        'demo-pg-indexes',
        'demo-pg-bloat',
        'demo-pg-table',
    ].some((t) => tabId.includes(t));
    const isSchema = [
        'demo-pg-schema-tree',
        'demo-pg-schema',
        'demo-pg-schema-viz',
        'demo-pg-table-deps',
        'demo-pg-chart-builder',
    ].some((t) => tabId.includes(t));
    const isInfra = [
        'demo-pg-pool',
        'demo-pg-pool-metrics',
        'demo-pg-replication',
        'demo-pg-checkpoint',
        'demo-pg-maintenance',
        'demo-pg-capacity',
        'demo-pg-backup',
    ].some((t) => tabId.includes(t));
    const isSecurity = tabId.includes('demo-pg-security');
    const isObservability = [
        'demo-pg-obs-hub',
        'demo-pg-cloudwatch',
        'demo-pg-log-patterns',
        'demo-pg-opentelemetry',
        'demo-pg-kubernetes',
        'demo-pg-status-page',
        'demo-pg-ai-monitoring',
    ].some((t) => tabId.includes(t));
    const isDeveloper = ['demo-pg-sql', 'demo-pg-api', 'demo-pg-repository', 'demo-pg-ai-advisor'].some((t) =>
        tabId.includes(t),
    );

    // Generate demo data
    const demoData = useMemo(() => {
        const baseHours = generateChartData(24);

        if (isOverview) {
            return {
                metrics: [
                    { icon: Clock, label: 'Uptime', value: '63d', trend: null, color: THEME.secondary },
                    { icon: Activity, label: 'Active Sessions', value: '52/100', trend: 3, color: THEME.primary },
                    { icon: Gauge, label: 'Cache Hit Ratio', value: '99.4%', trend: 2, color: THEME.success },
                    { icon: Database, label: 'DB Size', value: '148 GB', trend: 1, color: THEME.ai },
                    { icon: Radio, label: 'Long Txns', value: '3', trend: -1, color: THEME.warning },
                    { icon: RefreshCw, label: 'Urgent Vacuum', value: '5', trend: 2, color: THEME.danger },
                ],
                connData: baseHours.map((t) => ({
                    ...t,
                    active: 35 + Math.round(Math.random() * 25),
                    idle: 15 + Math.round(Math.random() * 10),
                })),
                tpsData: baseHours.map((t) => ({
                    ...t,
                    qps: 420 + Math.round(Math.random() * 180),
                    tps: 380 + Math.round(Math.random() * 160),
                })),
                sparklines: {
                    sessions: Array.from({ length: 8 }, () => 40 + Math.random() * 30),
                    cache: Array.from({ length: 8 }, () => 95 + Math.random() * 4),
                    vacuum: Array.from({ length: 8 }, () => 2 + Math.random() * 4),
                },
            };
        }

        if (isAlerts) {
            return {
                alertSummary: [
                    { label: 'Critical', count: 2, color: THEME.danger },
                    { label: 'Warning', count: 5, color: THEME.warning },
                    { label: 'Info', count: 12, color: THEME.info },
                    { label: 'Resolved', count: 47, color: THEME.success },
                ],
                alerts: [
                    { severity: 'critical', ts: '2m ago', msg: 'High replication lag detected' },
                    { severity: 'critical', ts: '5m ago', msg: 'Cache hit ratio below threshold' },
                    { severity: 'warning', ts: '12m ago', msg: 'Slow query: SELECT * FROM orders' },
                    { severity: 'warning', ts: '18m ago', msg: 'Disk usage at 78%' },
                    { severity: 'info', ts: '24m ago', msg: 'Backup completed successfully' },
                ],
                trendData: baseHours.map((t) => ({
                    ...t,
                    critical: Math.floor(2 + Math.random() * 3),
                    warning: Math.floor(4 + Math.random() * 6),
                })),
            };
        }

        if (isQuery) {
            return {
                slowQueries: [
                    {
                        id: 1,
                        query: 'SELECT o.*, u.name FROM orders o JOIN users u ON ...',
                        ms: 842,
                        calls: '12K',
                        rows: '1.2M',
                    },
                    {
                        id: 2,
                        query: 'UPDATE inventory SET stock = stock - $1 WHERE ...',
                        ms: 534,
                        calls: '8.4K',
                        rows: '340K',
                    },
                    {
                        id: 3,
                        query: 'SELECT COUNT(*) FROM analytics WHERE ts > ...',
                        ms: 421,
                        calls: '2.1K',
                        rows: '4.8M',
                    },
                    {
                        id: 4,
                        query: 'INSERT INTO audit_log SELECT * FROM staging ...',
                        ms: 318,
                        calls: '960',
                        rows: '890K',
                    },
                ],
                distData: baseHours.map((t) => ({
                    ...t,
                    fast: 2400 + Math.random() * 400,
                    medium: 1200 + Math.random() * 300,
                    slow: 200 + Math.random() * 100,
                })),
            };
        }

        if (isSchema) {
            return {
                stats: { tables: 42, views: 8, functions: 15, triggers: 3 },
                tableSize: [
                    { name: 'orders', value: 52 },
                    { name: 'users', value: 28 },
                    { name: 'products', value: 15 },
                    { name: 'analytics', value: 5 },
                ],
            };
        }

        if (isInfra) {
            return {
                poolMetrics: {
                    active: 28,
                    idle: 12,
                    waiting: 2,
                    maxConnections: 100,
                },
                replData: baseHours.map((t) => ({
                    ...t,
                    lag: +(Math.random() * 2).toFixed(2),
                })),
                walData: baseHours.map((t) => ({
                    ...t,
                    walMB: 40 + Math.round(Math.random() * 60),
                })),
            };
        }

        if (isSecurity) {
            return {
                sslRatio: 94,
                roles: [
                    { name: 'postgres', type: 'superuser', connections: 1 },
                    { name: 'app_user', type: 'regular', connections: 28 },
                    { name: 'readonly', type: 'limited', connections: 12 },
                ],
            };
        }

        if (isObservability) {
            return {
                logData: baseHours.map((t) => ({
                    ...t,
                    volume: 1200 + Math.round(Math.random() * 800),
                    errors: 15 + Math.round(Math.random() * 30),
                })),
            };
        }

        if (isDeveloper) {
            return {
                recentQueries: [
                    { query: 'SELECT * FROM pg_stat_statements LIMIT 10', type: 'SELECT' },
                    { query: 'ANALYZE inventory', type: 'UTILITY' },
                    { query: 'SELECT version()', type: 'SELECT' },
                ],
            };
        }

        return {};
    }, [isOverview, isAlerts, isQuery, isSchema, isInfra, isSecurity, isObservability, isDeveloper]);

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
            <DemoStyles />

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                OVERVIEW SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isOverview && (
                <>
                    {/* Status Row */}
                    <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <StatusBadge label="Operational" color={THEME.success} pulse />
                        <StatusBadge label="Production" color={THEME.primary} />
                        <StatusBadge label="PostgreSQL 16.2" color={THEME.secondary} />
                        <StatusBadge label="0 Connections" color={THEME.warning} />
                    </div>

                    {/* Metrics Grid */}
                    <div
                        className="dpg-stagger"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}
                    >
                        {demoData.metrics?.map((m, i) => (
                            <HeroMetric key={i} {...m} />
                        ))}
                    </div>

                    {/* Charts */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                        <Panel title="Cluster Velocity" icon={Zap} accentColor={THEME.primary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.connData}>
                                    <defs>
                                        <linearGradient id="dpgOvQps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="dpgOvTps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.secondary} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.secondary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="active"
                                        stroke={THEME.primary}
                                        fill="url(#dpgOvQps)"
                                        strokeWidth={1.5}
                                        dot={false}
                                        name="QPS"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="idle"
                                        stroke={THEME.secondary}
                                        fill="url(#dpgOvTps)"
                                        strokeWidth={1.5}
                                        dot={false}
                                        name="TPS"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="Database Health" icon={Gauge} accentColor={THEME.success}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                    height: 220,
                                }}
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <RingGauge value={80} color={THEME.success} label="Cache Hit" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <RingGauge value={65} color={THEME.primary} label="Repl Health" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <RingGauge value={42} color={THEME.warning} label="Bloat" />
                                </div>
                            </div>
                        </Panel>
                    </div>

                    {/* Details Panels */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                        <Panel title="Last Backup" icon={Database} accentColor={THEME.secondary}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>TIME</div>
                                    <div style={{ fontSize: 14, fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        4h ago
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>STATUS</div>
                                    <StatusBadge label="Verified" color={THEME.success} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>SIZE</div>
                                    <div style={{ fontSize: 14, fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        148 GB
                                    </div>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Long-Running Txns" icon={Hourglass} accentColor={THEME.danger}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { pid: 1024, duration: '2h 34m' },
                                    { pid: 1027, duration: '1h 12m' },
                                    { pid: 1031, duration: '47m' },
                                ].map((t, i) => (
                                    <div key={i} style={{ fontSize: 11, color: THEME.textMuted }}>
                                        <span style={{ fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                            PID {t.pid}
                                        </span>{' '}
                                        ({t.duration})
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        <Panel title="Vacuum Health" icon={RefreshCw} accentColor={THEME.success}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>
                                        TABLES TRACKED
                                    </div>
                                    <div style={{ fontSize: 14, fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        200
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>
                                        DEAD TUPLES
                                    </div>
                                    <div style={{ fontSize: 14, fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        2.4M
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>
                                        AUTOVAC RUNNING
                                    </div>
                                    <StatusBadge label="2 Tables" color={THEME.secondary} />
                                </div>
                            </div>
                        </Panel>
                    </div>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                ALERTS SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isAlerts && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                        {demoData.alertSummary?.map((item, i) => (
                            <HeroMetric
                                key={i}
                                icon={AlertCircle}
                                label={item.label}
                                value={String(item.count)}
                                color={item.color}
                            />
                        ))}
                    </div>

                    <Panel title="Active Alerts" icon={BellRing} accentColor={THEME.danger}>
                        {demoData.alerts?.map((a, i) => (
                            <div key={i} className="dpg-table-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <StatusBadge
                                        label={a.severity.toUpperCase()}
                                        color={a.severity === 'critical' ? THEME.danger : THEME.warning}
                                    />
                                    <span style={{ color: THEME.textMain }}>{a.msg}</span>
                                </div>
                                <span style={{ color: THEME.textDim }}>{a.ts}</span>
                            </div>
                        ))}
                    </Panel>

                    <div style={{ marginTop: 18 }}>
                        <Panel title="Alert Trend" icon={TrendingUp} accentColor={THEME.warning}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.trendData}>
                                    <defs>
                                        <linearGradient id="dpgCrit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.danger} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.danger} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="dpgWarn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.warning} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.warning} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="critical"
                                        stroke={THEME.danger}
                                        fill="url(#dpgCrit)"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Critical"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="warning"
                                        stroke={THEME.warning}
                                        fill="url(#dpgWarn)"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Warning"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                QUERY ANALYSIS SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isQuery && (
                <>
                    <Panel title="Slow Queries" icon={BarChart3} accentColor={THEME.warning}>
                        {demoData.slowQueries?.map((q, i) => (
                            <div key={i} className="dpg-table-row">
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, color: THEME.textMain, marginBottom: 4 }}>
                                        {q.query}
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
                                        <span style={{ color: THEME.textDim }}>
                                            Duration: <strong style={{ color: THEME.primary }}>{q.ms}ms</strong>
                                        </span>
                                        <span style={{ color: THEME.textDim }}>
                                            Calls: <strong style={{ color: THEME.textMain }}>{q.calls}</strong>
                                        </span>
                                        <span style={{ color: THEME.textDim }}>
                                            Rows: <strong style={{ color: THEME.textMain }}>{q.rows}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Panel>

                    <div style={{ marginTop: 18 }}>
                        <Panel title="Query Distribution" icon={PieChart} accentColor={THEME.secondary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.distData}>
                                    <defs>
                                        <linearGradient id="dpgFast" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.success} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.success} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="dpgMed" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.warning} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.warning} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="dpgSlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.danger} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.danger} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="fast"
                                        stroke={THEME.success}
                                        fill="url(#dpgFast)"
                                        strokeWidth={1.5}
                                        dot={false}
                                        name="< 10ms"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="medium"
                                        stroke={THEME.warning}
                                        fill="url(#dpgMed)"
                                        strokeWidth={1.5}
                                        dot={false}
                                        name="10-100ms"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="slow"
                                        stroke={THEME.danger}
                                        fill="url(#dpgSlow)"
                                        strokeWidth={1.5}
                                        dot={false}
                                        name="> 100ms"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                SCHEMA SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isSchema && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                        {[
                            { label: 'Tables', value: demoData.stats?.tables, icon: Database, color: THEME.primary },
                            { label: 'Views', value: demoData.stats?.views, icon: Layers, color: THEME.secondary },
                            { label: 'Functions', value: demoData.stats?.functions, icon: GitCommit, color: THEME.ai },
                            { label: 'Triggers', value: demoData.stats?.triggers, icon: Zap, color: THEME.warning },
                        ].map((item, i) => (
                            <HeroMetric
                                key={i}
                                icon={item.icon}
                                label={item.label}
                                value={String(item.value)}
                                color={item.color}
                            />
                        ))}
                    </div>

                    <Panel title="Table Size Breakdown" icon={Database} accentColor={THEME.primary}>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={demoData.tableSize}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                <XAxis dataKey="name" stroke={THEME.textDim} fontSize={10} />
                                <YAxis stroke={THEME.textDim} fontSize={10} />
                                <Tooltip content={<ChartTip />} />
                                <Bar dataKey="value" fill={THEME.primary} stroke={THEME.primary} strokeWidth={1} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                INFRASTRUCTURE SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isInfra && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                        <HeroMetric
                            icon={Activity}
                            label="Active Connections"
                            value={String(demoData.poolMetrics?.active)}
                            color={THEME.primary}
                        />
                        <HeroMetric
                            icon={Server}
                            label="Idle Connections"
                            value={String(demoData.poolMetrics?.idle)}
                            color={THEME.secondary}
                        />
                        <HeroMetric
                            icon={Clock}
                            label="Waiting Clients"
                            value={String(demoData.poolMetrics?.waiting)}
                            color={THEME.warning}
                        />
                        <HeroMetric
                            icon={Gauge}
                            label="Max Connections"
                            value={String(demoData.poolMetrics?.maxConnections)}
                            color={THEME.ai}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                        <Panel title="Replication Lag" icon={Radio} accentColor={THEME.secondary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={demoData.replData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} unit=" s" />
                                    <Tooltip content={<ChartTip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="lag"
                                        stroke={THEME.secondary}
                                        strokeWidth={2}
                                        dot={false}
                                        name="Lag (sec)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="WAL Generation" icon={GitCommit} accentColor={THEME.primary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.walData}>
                                    <defs>
                                        <linearGradient id="dpgWal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} unit=" MB" />
                                    <Tooltip content={<ChartTip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="walMB"
                                        stroke={THEME.primary}
                                        fill="url(#dpgWal)"
                                        strokeWidth={2}
                                        dot={false}
                                        name="WAL (MB)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                SECURITY SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isSecurity && (
                <>
                    <div style={{ marginBottom: 24 }}>
                        <Panel title="SSL Connections" icon={Lock} accentColor={THEME.success}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}
                            >
                                <RingGauge value={94} color={THEME.success} size={120} label="SSL %" />
                            </div>
                        </Panel>
                    </div>

                    <Panel title="Database Roles" icon={Shield} accentColor={THEME.primary}>
                        {demoData.roles?.map((role, i) => (
                            <div key={i} className="dpg-table-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        {role.name}
                                    </span>
                                    <StatusBadge
                                        label={role.type}
                                        color={role.type === 'superuser' ? THEME.danger : THEME.info}
                                    />
                                </div>
                                <span style={{ color: THEME.textDim }}>{role.connections} connections</span>
                            </div>
                        ))}
                    </Panel>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                OBSERVABILITY SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isObservability && (
                <Panel title="Log Volume & Errors" icon={BarChart3} accentColor={THEME.warning}>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={demoData.logData}>
                            <defs>
                                <linearGradient id="dpgLogVol" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="dpgLogErr" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={THEME.danger} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={THEME.danger} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                            <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                            <YAxis yAxisId="left" stroke={THEME.textDim} fontSize={10} />
                            <YAxis yAxisId="right" orientation="right" stroke={THEME.textDim} fontSize={10} />
                            <Tooltip content={<ChartTip />} />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="volume"
                                stroke={THEME.primary}
                                fill="url(#dpgLogVol)"
                                strokeWidth={2}
                                dot={false}
                                name="Volume"
                            />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="errors"
                                stroke={THEME.danger}
                                fill="url(#dpgLogErr)"
                                strokeWidth={2}
                                dot={false}
                                name="Errors"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Panel>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                DEVELOPER TOOLS SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isDeveloper && (
                <Panel title="Recent Queries" icon={Terminal} accentColor={THEME.secondary}>
                    {demoData.recentQueries?.map((q, i) => (
                        <div key={i} className="dpg-table-row">
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: THEME.textMain,
                                        fontFamily: THEME.fontMono,
                                        marginBottom: 4,
                                    }}
                                >
                                    {q.query}
                                </div>
                            </div>
                            <StatusBadge label={q.type} color={q.type === 'SELECT' ? THEME.primary : THEME.secondary} />
                        </div>
                    ))}
                </Panel>
            )}
        </div>
    );
}

export default DemoPostgresTab;
