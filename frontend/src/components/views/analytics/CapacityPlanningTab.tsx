// ==========================================================================
//  VIGIL — Capacity Planning & Forecasting (v1.0)
// ==========================================================================
import React, { useState, useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import {
    TrendingUp, HardDrive, Database, DollarSign, Calendar,
    AlertTriangle, CheckCircle, ArrowRight, Zap, Layers,
    Maximize2, Minimize2, BarChart2, PieChart, Activity,
    Sliders, Calculator, Cloud, Server
} from 'lucide-react';
import {
    ResponsiveContainer, ComposedChart, AreaChart, Area, Line, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const CapStyles = () => (
    <style>{`
        .analytics-card {
            background: ${THEME.surface};
            border: 1px solid ${THEME.glassBorder};
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            backdrop-filter: blur(12px);
            transition: all 0.25s ease;
        }
        .analytics-card:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
            transform: translateY(-2px);
        }
        .analytics-card-ribbon {
            height: 50px;
            background: linear-gradient(135deg, var(--ribbon-color, ${THEME.primary}) 0%, var(--ribbon-end, ${THEME.primary}cc) 100%);
            display: flex;
            align-items: center;
            padding: 0 20px;
            gap: 12px;
            color: white;
            font-weight: 600;
            font-size: 13px;
            letter-spacing: 0.02em;
        }
        .analytics-card-body {
            padding: 20px;
        }

        .forecast-badge {
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .scenario-input {
            background: ${THEME.bg};
            border: 1px solid ${THEME.glassBorder};
            color: ${THEME.textMain};
            padding: 8px;
            border-radius: 10px;
            width: 100%;
            font-size: 12px;
            box-sizing: border-box;
        }

        .rec-item {
            padding: 14px;
            border-radius: 14px;
            background: ${THEME.surfaceHigh};
            border: 1px solid ${THEME.glassBorder};
            margin-bottom: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .export-btn:hover { opacity: 0.85; }
        .action-btn:hover { background: ${THEME.primary}20 !important; }

        .window-btn {
            padding: 6px 14px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            border: 1px solid ${THEME.glassBorder};
            transition: all 0.15s ease;
        }
        .window-btn.active {
            background: ${THEME.primary};
            color: #fff;
            border-color: ${THEME.primary};
        }
        .window-btn:not(.active) {
            background: ${THEME.bg};
            color: ${THEME.textDim};
        }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA GENERATORS
   ═══════════════════════════════════════════════════════════════════════════ */
const generateStorageForecast = (windowDays = 90) => {
    const data = [];
    let used = 450;
    const total = 1000;
    const growthRate = 1.2;

    for (let i = -windowDays; i <= windowDays; i++) {
        const isFuture = i > 0;
        const noise = isFuture ? 0 : (0 - 0.5) * 5;
        used += growthRate + noise;

        const date = new Date();
        date.setDate(date.getDate() + i);

        data.push({
            date: date.toLocaleDateString(),
            used: Math.round(used),
            limit: total,
            type: isFuture ? 'forecast' : 'history',
            predicted: isFuture ? Math.round(used) : null
        });
    }
    return data;
};

const generateConnectionForecast = () => {
    const data = [];
    const conns = 65;
    for (let i = 0; i < 24; i++) {
        const hourLoad = Math.sin((i - 6) / 24 * Math.PI * 2) * 40;
        const val = Math.max(20, Math.min(190, conns + hourLoad + 0 * 10));
        data.push({
            time: `${i}:00`,
            connections: Math.round(val),
            limit: 200,
            safe_threshold: 160
        });
    }
    return data;
};

const generateCostForecast = () => {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    let cost = 380;
    return months.map((m, i) => {
        cost += i < 5 ? 8 : 18;
        return { month: m, cost: Math.round(cost), projected: i >= 5 };
    });
};

const RECOMMENDATIONS = [
    {
        type: 'upgrade', resource: 'Storage', urgency: 'high',
        title: 'Expand Disk Volume',
        desc: 'Projected to hit 90% utilization in 14 days.',
        action: 'Add 500GB', cost: '+$40/mo',
        tooltip: 'Increase EBS volume from 1TB to 1.5TB via AWS Console → RDS → Modify Instance.'
    },
    {
        type: 'downgrade', resource: 'CPU', urgency: 'low',
        title: 'Downsize Instance',
        desc: 'Average CPU usage is only 12%. Consider shifting to m6g.large.',
        action: 'Downgrade', cost: '-$85/mo',
        tooltip: 'Switch from db.m6g.xlarge to db.m6g.large during a maintenance window.'
    },
    {
        type: 'config', resource: 'Connections', urgency: 'medium',
        title: 'Tune Max Connections',
        desc: 'Connection spikes approaching limit. Increase max_connections or add PgBouncer.',
        action: 'Review Config', cost: '$0',
        tooltip: 'Edit max_connections in RDS Parameter Group or deploy PgBouncer as a connection pooler.'
    }
];

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

// Gauge Bar
const GaugeBar = ({ used, total, color, unit = '' }) => {
    const pct = Math.min(100, Math.round((used / total) * 100));
    const barColor = pct > 85 ? THEME.danger : pct > 65 ? THEME.warning : color;
    return (
        <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: THEME.textDim, marginBottom: 3 }}>
                <span>{used}{unit} used</span>
                <span style={{ color: barColor, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 4, background: THEME.glassBorder, borderRadius: 4 }}>
                <div style={{
                    width: `${pct}%`, height: '100%',
                    background: barColor, borderRadius: 14,
                    transition: 'width 0.6s ease'
                }} />
            </div>
        </div>
    );
};

// Stat Tile
const StatTile = ({ label, value, sub, icon: Icon, color, gauge }) => {
    const valueColor = label === 'Storage Runway'
        ? (parseInt(value) < 30 ? THEME.danger : parseInt(value) < 60 ? THEME.warning : THEME.textMain)
        : THEME.textMain;

    return (
        <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="analytics-card-ribbon" style={{ '--ribbon-color': color, '--ribbon-end': color + 'cc' }}>
                <Icon size={16} color="white" />
                <span>{label}</span>
            </div>
            <div className="analytics-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: valueColor }}>{value}</div>
                <div style={{ fontSize: 11, color: THEME.textMuted }}>{sub}</div>
                {gauge && <GaugeBar {...gauge} color={color} />}
            </div>
        </div>
    );
};

// Recommendation Card
const RecommendationCard = ({ rec }) => {
    const [showTip, setShowTip] = useState(false);
    const colors = { high: THEME.danger, medium: THEME.warning, low: THEME.success };
    const c = colors[rec.urgency];

    return (
        <div className="rec-item" style={{ borderLeft: `3px solid ${c}`, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>{rec.title}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: c }}>{rec.urgency}</div>
            </div>
            <div style={{ fontSize: 11, color: THEME.textDim, marginBottom: 8, lineHeight: 1.4 }}>{rec.desc}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: rec.cost.startsWith('+') ? THEME.danger : rec.cost === '$0' ? THEME.textDim : THEME.success }}>
                    {rec.cost}
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', position: 'relative' }}>
                    <button
                        onMouseEnter={() => setShowTip(true)}
                        onMouseLeave={() => setShowTip(false)}
                        style={{ background: 'transparent', border: 'none', color: THEME.textDim, cursor: 'pointer', fontSize: 13, padding: '0 2px', lineHeight: 1 }}
                        title={rec.tooltip}
                    >ⓘ</button>
                    {showTip && (
                        <div style={{
                            position: 'absolute', bottom: '120%', right: 0,
                            background: THEME.surfaceHigh, border: `1px solid ${THEME.glassBorder}`,
                            borderRadius: 6, padding: '8px 10px', fontSize: 11,
                            color: THEME.textDim, width: 220, zIndex: 10,
                            lineHeight: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            {rec.tooltip}
                        </div>
                    )}
                    <button
                        className="action-btn"
                        style={{ padding: '4px 10px', borderRadius: 14, background: THEME.bg, border: `1px solid ${THEME.glassBorder}`, color: THEME.textMain, fontSize: 10, cursor: 'pointer' }}
                    >
                        {rec.action}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const CapacityPlanningTab = () => {
    useAdaptiveTheme(); // keeps THEME in sync with dark/light toggle
    const [forecastWindow, setForecastWindow] = useState(90);
    const [scenario, setScenario] = useState({ growth: 10, users: 500 });
    const [thresholds, setThresholds] = useState({ storage: 85, connections: 80 });
    const [connData] = useState(generateConnectionForecast());
    const [costData] = useState(generateCostForecast());
    const [lastUpdated] = useState(new Date().toLocaleTimeString());

    const storageData = useMemo(() => generateStorageForecast(forecastWindow), [forecastWindow]);

    // Days until full (respects forecast window)
    const daysUntilFull = useMemo(() => {
        const current = storageData.find(d => d.type === 'forecast');
        const fullDay = storageData.find(d => d.predicted >= d.limit);
        if (!current || !fullDay) return `> ${forecastWindow} days`;
        const diffTime = Math.abs(new Date(fullDay.date) - new Date(current.date));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + ' days';
    }, [storageData, forecastWindow]);

    // Current storage used
    const currentUsedGB = useMemo(() => {
        const today = storageData.find(d => d.type === 'history');
        return today ? today.used : 450;
    }, [storageData]);

    // Dynamic What-If Analysis
    const scenarioImpact = useMemo(() => {
        const baseGrowth = 1.2;
        const adjustedGrowth = baseGrowth * (1 + Number(scenario.growth) / 100);
        const remaining = 1000 - currentUsedGB;
        const daysLeft = Math.max(0, Math.floor(remaining / adjustedGrowth));

        const baseConns = 65;
        const projectedConns = Math.round(baseConns + Number(scenario.users) * 0.1);
        const warningLimit = 200 * (thresholds.connections / 100);
        const connExceededAt = projectedConns > warningLimit
            ? `${Math.max(0, Math.floor(12 - (projectedConns - warningLimit) / 5))}:00`
            : 'Never';

        const storageImpactDays = Math.floor(remaining / baseGrowth) - daysLeft;

        return { daysLeft, connExceededAt, projectedConns, storageImpactDays };
    }, [scenario, currentUsedGB, thresholds]);

    // CSV Export
    const exportForecast = () => {
        const csv = [
            ['Date', 'Used (GB)', 'Predicted (GB)', 'Type'],
            ...storageData.map(d => [d.date, d.used, d.predicted ?? '', d.type])
        ].map(r => r.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `capacity_forecast_${forecastWindow}d.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Peak connection
    const peakConn = useMemo(() => Math.max(...connData.map(d => d.connections)), [connData]);
    const connHeadroom = Math.round(((200 - peakConn) / 200) * 100);

    return (
        <div style={{ padding: '0 0 40px 0' }}>
            <CapStyles />

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.textMain, margin: 0 }}>Capacity Planning</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: 12, color: THEME.textDim }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={13} color={THEME.primary} />
                            Forecast Window:
                        </span>
                        {[30, 60, 90].map(w => (
                            <button
                                key={w}
                                className={`window-btn ${forecastWindow === w ? 'active' : ''}`}
                                onClick={() => setForecastWindow(w)}
                            >{w}d</button>
                        ))}
                        <span style={{ marginLeft: 8, color: THEME.textMuted }}>
                            Last updated: {lastUpdated}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="export-btn"
                        onClick={exportForecast}
                        style={{ background: THEME.surface, color: THEME.textMain, border: `1px solid ${THEME.glassBorder}`, padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}
                    >
                        <Database size={14} /> Export CSV
                    </button>
                    <button style={{ background: THEME.primary, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Calculator size={14} /> Run What-If Scenario
                    </button>
                </div>
            </div>

            {/* ── KPI Tiles ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <StatTile
                    label="Storage Runway"
                    value={daysUntilFull}
                    sub={`At current growth rate (1.2GB/day)`}
                    icon={HardDrive}
                    color={THEME.warning}
                    gauge={{ used: currentUsedGB, total: 1000, unit: 'GB' }}
                />
                <StatTile
                    label="Connection Headroom"
                    value={`${connHeadroom}%`}
                    sub={`Peak: ${peakConn} / 200 max_connections`}
                    icon={Activity}
                    color={THEME.success}
                    gauge={{ used: peakConn, total: 200 }}
                />
                <StatTile
                    label="Est. Cost (Next Mo)"
                    value="$482.50"
                    sub="Based on current instance size"
                    icon={DollarSign}
                    color={THEME.primary}
                />
                <StatTile
                    label="Instance Sizing"
                    value="Over-provisioned"
                    sub="CPU usage consistently < 20%"
                    icon={Server}
                    color={THEME.info}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

                {/* ── Left Column: Charts ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Storage Forecast Chart */}
                    <div className="analytics-card">
                        <div className="analytics-card-ribbon" style={{ '--ribbon-color': THEME.primary, '--ribbon-end': THEME.primary + 'cc' }}>
                            <TrendingUp size={16} color="white" />
                            <span>Storage Utilization Forecast</span>
                        </div>
                        <div className="analytics-card-body">
                            <div className="forecast-badge" style={{ background: `${THEME.primary}15`, color: THEME.primary, marginBottom: 16 }}>
                                <TrendingUp size={12} /> Linear Growth Model
                            </div>
                            <div style={{ height: 250, width: '100%' }}>
                                <ResponsiveContainer>
                                    <ComposedChart data={storageData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} vertical={false} />
                                        <XAxis dataKey="date" hide />
                                        <YAxis stroke={THEME.textDim} fontSize={10} unit="GB" />
                                        <Tooltip contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.glassBorder}` }} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Area type="monotone" dataKey="used" stroke={THEME.primary} fill={`${THEME.primary}20`} strokeWidth={2} name="History" />
                                        <Line type="monotone" dataKey="predicted" stroke={THEME.warning} strokeDasharray="5 5" strokeWidth={2} name="Forecast" dot={false} />
                                        <ReferenceLine
                                            y={1000 * (thresholds.storage / 100)}
                                            label={`Warning (${thresholds.storage}%)`}
                                            stroke={THEME.warning}
                                            strokeDasharray="3 3"
                                        />
                                        <ReferenceLine y={1000} label="Disk Limit (1TB)" stroke={THEME.danger} strokeDasharray="3 3" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Connection Saturation Chart */}
                    <div className="analytics-card">
                        <div className="analytics-card-ribbon" style={{ '--ribbon-color': THEME.info, '--ribbon-end': THEME.info + 'cc' }}>
                            <Activity size={16} color="white" />
                            <span>Daily Connection Saturation</span>
                        </div>
                        <div className="analytics-card-body">
                            <div style={{ height: 200, width: '100%' }}>
                                <ResponsiveContainer>
                                    <AreaChart data={connData}>
                                        <defs>
                                            <linearGradient id="colorConn" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.info} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.info} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} vertical={false} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} fontSize={10} interval={4} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.glassBorder}` }} />
                                        <Area type="monotone" dataKey="connections" stroke={THEME.info} fill="url(#colorConn)" strokeWidth={2} name="Connections" />
                                        <ReferenceLine y={200} label="Max Conns" stroke={THEME.danger} />
                                        <ReferenceLine
                                            y={200 * (thresholds.connections / 100)}
                                            label={`Warning (${thresholds.connections}%)`}
                                            stroke={THEME.warning}
                                            strokeDasharray="3 3"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Cost Trend Chart */}
                    <div className="analytics-card">
                        <div className="analytics-card-ribbon" style={{ '--ribbon-color': THEME.success, '--ribbon-end': THEME.success + 'cc' }}>
                            <DollarSign size={16} color="white" />
                            <span>Monthly Cost Trend</span>
                        </div>
                        <div className="analytics-card-body">
                            <div className="forecast-badge" style={{ background: `${THEME.success}15`, color: THEME.success, marginBottom: 16 }}>
                                <DollarSign size={12} /> AWS RDS Estimate
                            </div>
                            <div style={{ height: 180, width: '100%' }}>
                                <ResponsiveContainer>
                                    <ComposedChart data={costData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.glassBorder} vertical={false} />
                                        <XAxis dataKey="month" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} tickFormatter={v => `$${v}`} />
                                        <Tooltip
                                            formatter={v => [`$${v}`, 'Cost']}
                                            contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.glassBorder}` }}
                                        />
                                        <Bar dataKey="cost" fill={THEME.primary} radius={[4, 4, 0, 0]} name="Cost" />
                                        <ReferenceLine y={482.50} stroke={THEME.warning} strokeDasharray="4 4" label="Current" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── Right Column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* What-If Modeling */}
                    <div className="analytics-card">
                        <div className="analytics-card-ribbon" style={{ '--ribbon-color': THEME.primary, '--ribbon-end': THEME.primary + 'cc' }}>
                            <Calculator size={16} color="white" />
                            <span>What-If Modeling</span>
                        </div>
                        <div className="analytics-card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 11, color: THEME.textDim, display: 'block', marginBottom: 4 }}>Expected Data Growth (%)</label>
                                    <input
                                        type="number"
                                        className="scenario-input"
                                        value={scenario.growth}
                                        onChange={e => setScenario({ ...scenario, growth: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, color: THEME.textDim, display: 'block', marginBottom: 4 }}>New Concurrent Users</label>
                                    <input
                                        type="number"
                                        className="scenario-input"
                                        value={scenario.users}
                                        onChange={e => setScenario({ ...scenario, users: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginTop: 4, padding: 12, background: `${THEME.primary}10`, borderRadius: 8, border: `1px solid ${THEME.primary}30` }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: THEME.primary, marginBottom: 6 }}>Impact Analysis</div>
                                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.8 }}>
                                        • Storage runway: <strong style={{ color: scenarioImpact.daysLeft < 30 ? THEME.danger : THEME.textMain }}>{scenarioImpact.daysLeft} days</strong><br />
                                        • Runway reduction: <strong style={{ color: THEME.warning }}>−{scenarioImpact.storageImpactDays} days</strong><br />
                                        • Projected peak conns: <strong>{scenarioImpact.projectedConns}</strong><br />
                                        • Conn warning exceeded: <strong style={{ color: scenarioImpact.connExceededAt !== 'Never' ? THEME.danger : THEME.success }}>{scenarioImpact.connExceededAt}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alert Thresholds */}
                    <div className="analytics-card">
                        <div className="analytics-card-ribbon" style={{ '--ribbon-color': THEME.warning, '--ribbon-end': THEME.warning + 'cc' }}>
                            <Sliders size={16} color="white" />
                            <span>Alert Thresholds</span>
                        </div>
                        <div className="analytics-card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <label style={{ fontSize: 11, color: THEME.textDim }}>Storage Warning</label>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: THEME.warning }}>{thresholds.storage}%</span>
                                    </div>
                                    <input
                                        type="range" min={50} max={95}
                                        value={thresholds.storage}
                                        onChange={e => setThresholds({ ...thresholds, storage: +e.target.value })}
                                        style={{ width: '100%', accentColor: THEME.primary }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: THEME.textMuted, marginTop: 2 }}>
                                        <span>50%</span><span>95%</span>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <label style={{ fontSize: 11, color: THEME.textDim }}>Connection Warning</label>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: THEME.warning }}>{thresholds.connections}%</span>
                                    </div>
                                    <input
                                        type="range" min={50} max={95}
                                        value={thresholds.connections}
                                        onChange={e => setThresholds({ ...thresholds, connections: +e.target.value })}
                                        style={{ width: '100%', accentColor: THEME.primary }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: THEME.textMuted, marginTop: 2 }}>
                                        <span>50%</span><span>95%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Smart Recommendations */}
                    <div className="analytics-card">
                        <div className="analytics-card-ribbon" style={{ '--ribbon-color': THEME.warning, '--ribbon-end': THEME.warning + 'cc' }}>
                            <Zap size={16} color="white" />
                            <span>Smart Recommendations</span>
                        </div>
                        <div className="analytics-card-body">
                            {RECOMMENDATIONS.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                    <CheckCircle size={28} color={THEME.success} style={{ marginBottom: 8 }} />
                                    <div style={{ fontSize: 13, color: THEME.textDim }}>All systems healthy. No actions needed.</div>
                                </div>
                            ) : (
                                RECOMMENDATIONS.map((rec, i) => <RecommendationCard key={i} rec={rec} />)
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CapacityPlanningTab;