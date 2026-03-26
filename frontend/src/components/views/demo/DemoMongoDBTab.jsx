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
    Workflow,
    BellRing,
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
function DemoMongoDBTab({ tabId = 'demo-mongo-overview' }) {
    useAdaptiveTheme();

    // Detect section from tabId
    const isOverview = [
        'demo-mongo-exec-dash',
        'demo-mongo-connection',
        'demo-mongo-serverinfo',
        'demo-mongo-databases',
        'demo-mongo-join-viz',
    ].some((t) => tabId.includes(t));
    const isPerformance = [
        'demo-mongo-serverstatus',
        'demo-mongo-realtimeops',
        'demo-mongo-latency',
        'demo-mongo-namespace',
        'demo-mongo-explain',
        'demo-mongo-activeops',
        'demo-mongo-slowqueries',
        'demo-mongo-profiler',
        'demo-mongo-cost',
        'demo-mongo-locks',
        'demo-mongo-anomaly',
        'demo-mongo-metrics',
        'demo-mongo-agent',
    ].some((t) => tabId.includes(t));
    const isStorage = [
        'demo-mongo-index-advisor',
        'demo-mongo-schema',
        'demo-mongo-collstats',
        'demo-mongo-wiredtiger',
        'demo-mongo-backup',
        'demo-mongo-capacity',
        'demo-mongo-network',
    ].some((t) => tabId.includes(t));
    const isData = [
        'demo-mongo-doceditor',
        'demo-mongo-pipeline',
        'demo-mongo-nl-query',
        'demo-mongo-import-export',
        'demo-mongo-sql-translator',
        'demo-mongo-schema-compare',
        'demo-mongo-geo',
    ].some((t) => tabId.includes(t));
    const isIntelligence = [
        'demo-mongo-ai-hints',
        'demo-mongo-compare',
        'demo-mongo-historical',
        'demo-mongo-perf-advisor',
        'demo-mongo-trace',
    ].some((t) => tabId.includes(t));
    const isReplication = ['demo-mongo-failover', 'demo-mongo-sharding', 'demo-mongo-oplog'].some((t) =>
        tabId.includes(t),
    );
    const isManagement = [
        'demo-mongo-alert-mgr',
        'demo-mongo-prometheus',
        'demo-mongo-sso',
        'demo-mongo-atlas',
        'demo-mongo-dashboards',
        'demo-mongo-reports',
        'demo-mongo-auditlog',
        'demo-mongo-users',
    ].some((t) => tabId.includes(t));

    // Generate demo data
    const demoData = useMemo(() => {
        const baseHours = generateChartData(24);

        if (isOverview) {
            return {
                metrics: [
                    { icon: Zap, label: 'Operations/sec', value: '4,231', trend: 2, color: THEME.primary },
                    { icon: Network, label: 'Connections', value: '127/500', trend: 1, color: THEME.secondary },
                    { icon: Database, label: 'Documents', value: '2.4M', trend: 3, color: THEME.success },
                    { icon: HardDrive, label: 'Data Size', value: '18.6 GB', trend: 2, color: THEME.ai },
                    { icon: Radio, label: 'Repl Lag', value: '0.1s', trend: -1, color: THEME.warning },
                    { icon: MemoryStick, label: 'Cache', value: '98.2%', trend: 1, color: THEME.success },
                ],
                operationsData: baseHours.map((t) => ({
                    ...t,
                    queries: 1800 + Math.round(Math.random() * 800),
                    inserts: 1200 + Math.round(Math.random() * 600),
                })),
                connectionsData: baseHours.map((t) => ({
                    ...t,
                    active: 85 + Math.round(Math.random() * 35),
                    idle: 20 + Math.round(Math.random() * 15),
                })),
                sparklines: {
                    operations: Array.from({ length: 8 }, () => 3500 + Math.random() * 1500),
                    connections: Array.from({ length: 8 }, () => 100 + Math.random() * 40),
                    memory: Array.from({ length: 8 }, () => 90 + Math.random() * 8),
                },
            };
        }

        if (isPerformance) {
            return {
                opMetrics: [
                    { label: 'Query', ops: 2100, color: THEME.primary },
                    { label: 'Insert', ops: 1200, color: THEME.success },
                    { label: 'Update', ops: 780, color: THEME.secondary },
                    { label: 'Delete', ops: 151, color: THEME.warning },
                ],
                latencyData: baseHours.map((t) => ({
                    ...t,
                    readMs: 2.4 + Math.random() * 1.6,
                    writeMs: 4.2 + Math.random() * 2.8,
                })),
                slowOps: [
                    { id: 1, op: 'aggregate', ns: 'app.orders', ms: 856, docs: '124K' },
                    { id: 2, op: 'updateMany', ns: 'app.inventory', ms: 542, docs: '8.4K' },
                    { id: 3, op: 'find', ns: 'app.analytics', ms: 428, docs: '4.8M' },
                    { id: 4, op: 'insertMany', ns: 'app.events', ms: 325, docs: '890K' },
                ],
                pageFaults: baseHours.map((t) => ({
                    ...t,
                    faults: 15 + Math.round(Math.random() * 45),
                })),
            };
        }

        if (isStorage) {
            return {
                cacheUsage: 78,
                collectionSizes: [
                    { name: 'orders', size: 8.4 },
                    { name: 'users', size: 4.2 },
                    { name: 'products', size: 2.8 },
                    { name: 'analytics', size: 1.6 },
                    { name: 'events', size: 1.4 },
                ],
                indexSizes: [
                    { name: '_id', size: 1.2 },
                    { name: 'user_id', size: 0.8 },
                    { name: 'created_at', size: 0.6 },
                    { name: 'status', size: 0.4 },
                ],
                wtStats: {
                    cachePct: 78,
                    writeQueueSize: 2400,
                    compressedSize: '14.2 GB',
                    uncompressedSize: '24.8 GB',
                },
            };
        }

        if (isData) {
            return {
                docStats: baseHours.map((t) => ({
                    ...t,
                    documents: 2200 + Math.round(Math.random() * 400),
                    collections: 22,
                })),
                crudOps: baseHours.map((t) => ({
                    ...t,
                    create: 480 + Math.round(Math.random() * 200),
                    read: 1800 + Math.round(Math.random() * 600),
                    update: 320 + Math.round(Math.random() * 150),
                    delete: 80 + Math.round(Math.random() * 40),
                })),
                pipelines: [
                    { id: 1, name: 'Daily Aggregation', docs: '2.4M', stages: 5 },
                    { id: 2, name: 'User Analytics', docs: '180K', stages: 8 },
                    { id: 3, name: 'Revenue Report', docs: '45K', stages: 3 },
                ],
            };
        }

        if (isIntelligence) {
            return {
                hints: [
                    { severity: 'warning', hint: 'Missing index on user_id field in orders collection' },
                    { severity: 'info', hint: 'Consider pagination for large result sets' },
                    { severity: 'info', hint: 'Query could benefit from aggregation pipeline' },
                ],
                historicalData: baseHours.map((t) => ({
                    ...t,
                    opsPerSec: 4000 + Math.round(Math.random() * 800),
                })),
                anomalyData: baseHours.map((t) => ({
                    ...t,
                    anomaly: Math.random() < 0.95 ? 0 : Math.random() > 0.5 ? 1 : -1,
                })),
            };
        }

        if (isReplication) {
            return {
                replicaSetStatus: [
                    { member: 'PRIMARY', status: 'healthy', ping: 0, optime: 'up-to-date' },
                    { member: 'SECONDARY', status: 'healthy', ping: 2, optime: '1.2s ago' },
                    { member: 'SECONDARY', status: 'healthy', ping: 3, optime: '0.8s ago' },
                ],
                oplogData: baseHours.map((t) => ({
                    ...t,
                    window: 4800 + Math.round(Math.random() * 1200),
                })),
                shardData: [
                    { name: 'shard1', docs: '850K', size: '6.4 GB' },
                    { name: 'shard2', docs: '890K', size: '6.8 GB' },
                    { name: 'shard3', docs: '820K', size: '6.2 GB' },
                    { name: 'shard4', docs: '840K', size: '6.5 GB' },
                ],
            };
        }

        if (isManagement) {
            return {
                alerts: [
                    { severity: 'warning', ts: '3m ago', msg: 'High memory usage detected' },
                    { severity: 'warning', ts: '15m ago', msg: 'Slow query detected on orders collection' },
                    { severity: 'info', ts: '42m ago', msg: 'Backup completed: 18.6 GB' },
                ],
                promEndpoints: [
                    { addr: 'prom-node-1:9090', status: 'connected', metrics: '2.4K' },
                    { addr: 'prom-node-2:9090', status: 'connected', metrics: '2.3K' },
                ],
                users: [
                    { name: 'app_user', role: 'readWrite', dbs: ['app', 'logs'] },
                    { name: 'analytics', role: 'read', dbs: ['app'] },
                    { name: 'backup', role: 'backup', dbs: ['admin'] },
                ],
                auditLogs: [
                    { action: 'authentication', user: 'app_user', result: 'success', ts: '2m ago' },
                    { action: 'command', user: 'analytics', cmd: 'find', result: 'success', ts: '8m ago' },
                    { action: 'createUser', user: 'admin', newUser: 'backup_reader', result: 'success', ts: '1h ago' },
                ],
            };
        }

        return {};
    }, [isOverview, isPerformance, isStorage, isData, isIntelligence, isReplication, isManagement]);

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
                        <StatusBadge label="MongoDB 7.0" color={THEME.success} pulse />
                        <StatusBadge label="Replica Set" color={THEME.primary} />
                        <StatusBadge label="3 Nodes" color={THEME.secondary} />
                        <StatusBadge label="Connected" color={THEME.ai} />
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
                        <Panel title="Operations Breakdown" icon={Zap} accentColor={THEME.primary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.operationsData}>
                                    <defs>
                                        <linearGradient id="dmOvQuery" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="dmOvInsert" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.success} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.success} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="queries"
                                        stroke={THEME.primary}
                                        fill="url(#dmOvQuery)"
                                        strokeWidth={1.5}
                                        dot={false}
                                        name="Queries/sec"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="inserts"
                                        stroke={THEME.success}
                                        fill="url(#dmOvInsert)"
                                        strokeWidth={1.5}
                                        dot={false}
                                        name="Inserts/sec"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="Cluster Health" icon={Gauge} accentColor={THEME.success}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                    height: 220,
                                }}
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <RingGauge value={92} color={THEME.success} label="Replica Health" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <RingGauge value={78} color={THEME.ai} label="Cache Usage" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <RingGauge value={65} color={THEME.warning} label="Queue" />
                                </div>
                            </div>
                        </Panel>
                    </div>

                    {/* Details Panels */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                        <Panel title="Cluster Status" icon={Network} accentColor={THEME.secondary}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>VERSION</div>
                                    <div style={{ fontSize: 14, fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        7.0.1
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>UPTIME</div>
                                    <div style={{ fontSize: 14, fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        28d 4h
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>MODE</div>
                                    <StatusBadge label="Replica Set" color={THEME.secondary} />
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Storage Engine" icon={HardDrive} accentColor={THEME.primary}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>ENGINE</div>
                                    <div style={{ fontSize: 14, fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        WiredTiger
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>
                                        COMPRESSION
                                    </div>
                                    <StatusBadge label="Snappy" color={THEME.primary} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>
                                        DATA SIZE
                                    </div>
                                    <div style={{ fontSize: 14, fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        18.6 GB
                                    </div>
                                </div>
                            </div>
                        </Panel>

                        <Panel title="Connections" icon={Network} accentColor={THEME.ai}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>ACTIVE</div>
                                    <div style={{ fontSize: 14, fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        127
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>IDLE</div>
                                    <div style={{ fontSize: 14, fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        23
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>WAITING</div>
                                    <StatusBadge label="2" color={THEME.warning} />
                                </div>
                            </div>
                        </Panel>
                    </div>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                PERFORMANCE SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isPerformance && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                        {demoData.opMetrics?.map((item, i) => (
                            <HeroMetric
                                key={i}
                                icon={Zap}
                                label={item.label}
                                value={fmtNum(item.ops)}
                                color={item.color}
                            />
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                        <Panel title="Read/Write Latency" icon={Clock} accentColor={THEME.secondary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={demoData.latencyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} unit=" ms" />
                                    <Tooltip content={<ChartTip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="readMs"
                                        stroke={THEME.primary}
                                        strokeWidth={2}
                                        dot={false}
                                        name="Read (ms)"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="writeMs"
                                        stroke={THEME.danger}
                                        strokeWidth={2}
                                        dot={false}
                                        name="Write (ms)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="Page Faults" icon={AlertTriangle} accentColor={THEME.warning}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.pageFaults}>
                                    <defs>
                                        <linearGradient id="dmPf" x1="0" y1="0" x2="0" y2="1">
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
                                        dataKey="faults"
                                        stroke={THEME.warning}
                                        fill="url(#dmPf)"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Faults"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>

                    <Panel title="Slow Operations" icon={BarChart3} accentColor={THEME.danger}>
                        {demoData.slowOps?.map((q, i) => (
                            <div key={i} className="dpg-table-row">
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 11, color: THEME.textMain, marginBottom: 4 }}>
                                        {q.op.toUpperCase()} on {q.ns}
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
                                        <span style={{ color: THEME.textDim }}>
                                            Duration: <strong style={{ color: THEME.primary }}>{q.ms}ms</strong>
                                        </span>
                                        <span style={{ color: THEME.textDim }}>
                                            Documents: <strong style={{ color: THEME.textMain }}>{q.docs}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Panel>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                STORAGE SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isStorage && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                        <Panel title="WiredTiger Cache" icon={MemoryStick} accentColor={THEME.ai}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}
                            >
                                <RingGauge value={demoData.cacheUsage} color={THEME.ai} size={120} label="Usage %" />
                            </div>
                        </Panel>

                        <Panel title="Collection Sizes" icon={Database} accentColor={THEME.primary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={demoData.collectionSizes}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="name" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} unit=" GB" />
                                    <Tooltip content={<ChartTip />} />
                                    <Bar dataKey="size" fill={THEME.primary} stroke={THEME.primary} strokeWidth={1} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>

                    <Panel title="Index Statistics" icon={Layers} accentColor={THEME.secondary}>
                        {demoData.indexSizes?.map((idx, i) => (
                            <div key={i} className="dpg-table-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                        {idx.name}
                                    </span>
                                </div>
                                <span style={{ color: THEME.textDim, fontFamily: THEME.fontMono }}>{idx.size} GB</span>
                            </div>
                        ))}
                    </Panel>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                DATA SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isData && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                        <Panel title="Document Count" icon={Database} accentColor={THEME.primary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.docStats}>
                                    <defs>
                                        <linearGradient id="dmDoc" x1="0" y1="0" x2="0" y2="1">
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
                                        dataKey="documents"
                                        stroke={THEME.primary}
                                        fill="url(#dmDoc)"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Documents"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="CRUD Operations" icon={Zap} accentColor={THEME.secondary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.crudOps}>
                                    <defs>
                                        <linearGradient id="dmCreate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.success} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.success} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="dmRead" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="dmUpdate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.secondary} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.secondary} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="dmDelete" x1="0" y1="0" x2="0" y2="1">
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
                                        dataKey="create"
                                        stroke={THEME.success}
                                        fill="url(#dmCreate)"
                                        strokeWidth={1}
                                        dot={false}
                                        name="Create"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="read"
                                        stroke={THEME.primary}
                                        fill="url(#dmRead)"
                                        strokeWidth={1}
                                        dot={false}
                                        name="Read"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="update"
                                        stroke={THEME.secondary}
                                        fill="url(#dmUpdate)"
                                        strokeWidth={1}
                                        dot={false}
                                        name="Update"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="delete"
                                        stroke={THEME.danger}
                                        fill="url(#dmDelete)"
                                        strokeWidth={1}
                                        dot={false}
                                        name="Delete"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>

                    <Panel title="Aggregation Pipelines" icon={Workflow} accentColor={THEME.ai}>
                        {demoData.pipelines?.map((p, i) => (
                            <div key={i} className="dpg-table-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontFamily: THEME.fontMono, color: THEME.textMain }}>{p.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
                                    <span style={{ color: THEME.textDim }}>
                                        Documents: <strong style={{ color: THEME.textMain }}>{p.docs}</strong>
                                    </span>
                                    <span style={{ color: THEME.textDim }}>
                                        Stages: <strong style={{ color: THEME.textMain }}>{p.stages}</strong>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </Panel>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                INTELLIGENCE SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isIntelligence && (
                <>
                    <Panel
                        title="AI Performance Hints"
                        icon={Sparkles}
                        accentColor={THEME.ai}
                        style={{ marginBottom: 18 }}
                    >
                        {demoData.hints?.map((h, i) => (
                            <div key={i} className="dpg-table-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <StatusBadge
                                        label={h.severity.toUpperCase()}
                                        color={h.severity === 'warning' ? THEME.warning : THEME.info}
                                    />
                                    <span style={{ color: THEME.textMain }}>{h.hint}</span>
                                </div>
                            </div>
                        ))}
                    </Panel>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                        <Panel title="Historical Trend" icon={TrendingUp} accentColor={THEME.primary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.historicalData}>
                                    <defs>
                                        <linearGradient id="dmHist" x1="0" y1="0" x2="0" y2="1">
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
                                        dataKey="opsPerSec"
                                        stroke={THEME.primary}
                                        fill="url(#dmHist)"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Ops/sec"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="Anomaly Detection" icon={AlertTriangle} accentColor={THEME.danger}>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={demoData.anomalyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} />
                                    <Tooltip content={<ChartTip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="anomaly"
                                        stroke={THEME.danger}
                                        strokeWidth={2}
                                        dot={false}
                                        name="Anomaly Score"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                REPLICATION SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isReplication && (
                <>
                    <Panel
                        title="Replica Set Members"
                        icon={Network}
                        accentColor={THEME.primary}
                        style={{ marginBottom: 18 }}
                    >
                        {demoData.replicaSetStatus?.map((m, i) => (
                            <div key={i} className="dpg-table-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <StatusBadge
                                        label={m.member}
                                        color={m.member === 'PRIMARY' ? THEME.success : THEME.secondary}
                                    />
                                    <span style={{ color: THEME.textMain }}>
                                        Ping: {m.ping}ms | Optime: {m.optime}
                                    </span>
                                </div>
                                <StatusBadge label="HEALTHY" color={THEME.success} />
                            </div>
                        ))}
                    </Panel>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                        <Panel title="Oplog Window (seconds)" icon={Clock} accentColor={THEME.secondary}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={demoData.oplogData}>
                                    <defs>
                                        <linearGradient id="dmOplog" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.secondary} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.secondary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} unit=" s" />
                                    <Tooltip content={<ChartTip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="window"
                                        stroke={THEME.secondary}
                                        fill="url(#dmOplog)"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Oplog Window"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel title="Shard Distribution" icon={Database} accentColor={THEME.ai}>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={demoData.shardData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.5} />
                                    <XAxis dataKey="name" stroke={THEME.textDim} fontSize={10} />
                                    <YAxis stroke={THEME.textDim} fontSize={10} unit=" K" />
                                    <Tooltip content={<ChartTip />} />
                                    <Bar dataKey="docs" fill={THEME.ai} stroke={THEME.ai} strokeWidth={1} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Panel>
                    </div>
                </>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                MANAGEMENT SECTION
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {isManagement && (
                <>
                    <Panel
                        title="Active Alerts"
                        icon={BellRing}
                        accentColor={THEME.danger}
                        style={{ marginBottom: 18 }}
                    >
                        {demoData.alerts?.map((a, i) => (
                            <div key={i} className="dpg-table-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <StatusBadge
                                        label={a.severity.toUpperCase()}
                                        color={a.severity === 'warning' ? THEME.warning : THEME.info}
                                    />
                                    <span style={{ color: THEME.textMain }}>{a.msg}</span>
                                </div>
                                <span style={{ color: THEME.textDim }}>{a.ts}</span>
                            </div>
                        ))}
                    </Panel>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 18 }}>
                        <Panel title="Prometheus Endpoints" icon={Activity} accentColor={THEME.secondary}>
                            {demoData.promEndpoints?.map((p, i) => (
                                <div key={i} className="dpg-table-row">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                            {p.addr}
                                        </span>
                                        <StatusBadge label={p.status.toUpperCase()} color={THEME.success} />
                                    </div>
                                    <span style={{ color: THEME.textDim }}>{p.metrics} metrics</span>
                                </div>
                            ))}
                        </Panel>

                        <Panel title="Database Users" icon={Shield} accentColor={THEME.primary}>
                            {demoData.users?.map((u, i) => (
                                <div key={i} className="dpg-table-row">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontFamily: THEME.fontMono, color: THEME.textMain }}>
                                            {u.name}
                                        </span>
                                        <StatusBadge label={u.role} color={THEME.secondary} />
                                    </div>
                                    <span style={{ color: THEME.textDim }}>{u.dbs.join(', ')}</span>
                                </div>
                            ))}
                        </Panel>
                    </div>

                    <Panel title="Audit Log" icon={GitCommit} accentColor={THEME.ai}>
                        {demoData.auditLogs?.map((log, i) => (
                            <div key={i} className="dpg-table-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <StatusBadge label={log.action.toUpperCase()} color={THEME.primary} />
                                    <span style={{ color: THEME.textMain }}>
                                        User: <strong>{log.user}</strong>
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <StatusBadge
                                        label={log.result.toUpperCase()}
                                        color={log.result === 'success' ? THEME.success : THEME.danger}
                                    />
                                    <span style={{ color: THEME.textDim }}>{log.ts}</span>
                                </div>
                            </div>
                        ))}
                    </Panel>
                </>
            )}
        </div>
    );
}

export default DemoMongoDBTab;
