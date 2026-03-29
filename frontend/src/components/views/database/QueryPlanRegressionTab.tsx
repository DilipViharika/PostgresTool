import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData, postData, deleteData } from '../../../utils/api';
import {
    TrendingUp, RefreshCw, AlertTriangle, CheckCircle, Play, Trash2,
    Database, Clock, AlertCircle, PlusCircle, GitCompare, BookOpen,
    Zap, Activity, BarChart2, Tag, Bell, BellOff, Settings, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
    ResponsiveContainer, Area, AreaChart, Legend, ComposedChart, Bar
} from 'recharts';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const Styles = () => (
    <style>{`
        @keyframes qrSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes qrFade  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes qrPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes qrSlide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .qr-card        { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:12px; padding:20px; animation:qrFade .3s ease; }
        .qr-metric      { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:10px; padding:16px 20px; display:flex; align-items:center; gap:14px; }
        .qr-badge       { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; }
        .qr-textarea    { width:100%; background:${THEME.bg}90; border:1px solid ${THEME.grid}; color:${THEME.textMain}; border-radius:8px; padding:12px; font-family:${THEME.fontMono}; font-size:12px; outline:none; resize:vertical; line-height:1.6; box-sizing:border-box; }
        .qr-textarea:focus { border-color:${THEME.primary}60; }
        .qr-btn         { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; border:none; }
        .qr-btn:hover   { filter:brightness(1.1); }
        .qr-btn:disabled{ opacity:.45; cursor:not-allowed; filter:none; }
        .qr-baseline-row { padding:14px 16px; border-bottom:1px solid ${THEME.grid}20; display:flex; align-items:center; gap:12px; font-size:12px; transition:background .15s; }
        .qr-baseline-row:last-child { border-bottom:none; }
        .qr-baseline-row:hover { background:${THEME.primary}05; }
        .qr-plan-box    { background:${THEME.bg}; border:1px solid ${THEME.grid}; border-radius:8px; padding:14px; font-family:${THEME.fontMono}; font-size:11px; color:${THEME.textMuted}; white-space:pre-wrap; overflow-x:auto; max-height:320px; overflow-y:auto; line-height:1.7; }
        .qr-tab-btn     { display:flex; align-items:center; gap:7px; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; }
        .qr-tab-btn.active { border-color:${THEME.primary}!important; background:${THEME.primary}12!important; color:${THEME.primary}!important; }
        .qr-watcher-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .qr-watcher-dot.active { background:${THEME.success}; animation:qrPulse 1.5s ease-in-out infinite; box-shadow:0 0 6px ${THEME.success}; }
        .qr-watcher-dot.inactive { background:${THEME.textDim}; }
        .qr-deploy-label { font-size:10px; font-weight:700; fill:${THEME.warning}; }
        .qr-input { background:${THEME.bg}; border:1px solid ${THEME.grid}; color:${THEME.textMain}; border-radius:8px; padding:8px 12px; font-size:13px; outline:none; width:100%; box-sizing:border-box; }
        .qr-input:focus { border-color:${THEME.primary}60; }
        .qr-select { background:${THEME.bg}; border:1px solid ${THEME.grid}; color:${THEME.textMain}; border-radius:8px; padding:8px 12px; font-size:13px; outline:none; cursor:pointer; }
        .qr-section-label { font-size:11px; font-weight:700; color:${THEME.textMuted}; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; display:block; }
    `}</style>
);

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt    = n => n == null ? '—' : Number(n).toLocaleString();
const fmtMs  = ms => { const m = Number(ms) || 0; if (m < 1000) return `${m.toFixed(1)}ms`; return `${(m / 1000).toFixed(2)}s`; };
const fmtDate = d => d ? new Date(d).toLocaleString() : '—';
const fmtRel  = d => {
    if (!d) return '';
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
};
const fmtShortDate = d => {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2, '0')}`;
};

/* ─── Sub-components ──────────────────────────────────────────────────────── */
const StatusBadge = ({ status, change }) => {
    if (status === 'regression') return <span className="qr-badge" style={{ background: `${THEME.danger}15`, color: THEME.danger, border: `1px solid ${THEME.danger}30` }}><AlertTriangle size={10} /> Regression +{change}%</span>;
    if (status === 'ok') return <span className="qr-badge" style={{ background: `${THEME.success}15`, color: THEME.success, border: `1px solid ${THEME.success}30` }}><CheckCircle size={10} /> OK {change > 0 ? `+${change}%` : change < 0 ? `${change}%` : ''}</span>;
    if (status === 'no_baseline') return <span className="qr-badge" style={{ background: `${THEME.primary}15`, color: THEME.primary, border: `1px solid ${THEME.primary}30` }}><BookOpen size={10} /> No Baseline</span>;
    return null;
};

const MetricCard = ({ icon: Icon, label, value, sub, color = THEME.primary }) => (
    <div className="qr-metric">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} color={color} />
        </div>
        <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: THEME.textMain, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>
            {sub && <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 2 }}>{sub}</div>}
        </div>
    </div>
);

const PlanTree = ({ plan, title, accent }) => {
    if (!plan) return null;
    const node = plan['Plan'] || plan;
    const renderNode = (n, depth = 0) => {
        if (!n) return null;
        const type = n['Node Type'] || 'Unknown';
        const cost = n['Total Cost']?.toFixed(2);
        const rows = n['Plan Rows'];
        const rel = n['Relation Name'] || n['Alias'] || '';
        const children = n['Plans'] || [];
        return (
            <div key={`${depth}-${type}`} style={{ paddingLeft: depth > 0 ? 14 : 0, borderLeft: depth > 0 ? `1px solid ${accent}30` : undefined, marginLeft: depth > 0 ? 6 : 0 }}>
                <div style={{ color: accent, fontWeight: 700, fontSize: 11 }}>{type}{rel ? ` → ${rel}` : ''}</div>
                <div style={{ color: THEME.textDim, fontSize: 10, marginBottom: 4 }}>cost={cost} rows={fmt(rows)}</div>
                {children.map((c, i) => renderNode(c, depth + 1))}
            </div>
        );
    };
    return (
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>{title}</div>
            <div style={{ background: THEME.bg, border: `1px solid ${THEME.grid}`, borderRadius: 8, padding: 12, maxHeight: 280, overflowY: 'auto' }}>
                {renderNode(node)}
            </div>
        </div>
    );
};

/* ─── Deployment Marker Tooltip ───────────────────────────────────────────── */
const DeployTooltip = ({ x, y, payload, deployEvents }) => {
    if (!payload?.length) return null;
    const ts = payload[0]?.payload?.ts;
    const deploy = deployEvents?.find(d => Math.abs(new Date(d.ts) - new Date(ts)) < 60000 * 30);
    return (
        <div style={{ background: THEME.surface, border: `1px solid ${THEME.grid}`, borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ color: THEME.textMain, fontWeight: 700 }}>{fmtShortDate(ts)}</div>
            {payload.map(p => (
                <div key={p.dataKey} style={{ color: p.color, marginTop: 4 }}>
                    {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
                </div>
            ))}
            {deploy && (
                <div style={{ marginTop: 6, padding: '4px 8px', background: `${THEME.warning}15`, border: `1px solid ${THEME.warning}30`, borderRadius: 5, color: THEME.warning, fontSize: 11, fontWeight: 700 }}>
                    🚀 Deploy: {deploy.version || deploy.label}
                </div>
            )}
        </div>
    );
};

/* ─── Regression Timeline Chart ───────────────────────────────────────────── */
const RegressionTimeline = ({ history, deployEvents, regressionThreshold }) => {
    if (!history?.length) return (
        <div style={{ padding: 40, textAlign: 'center', color: THEME.textDim }}>
            <Activity size={36} style={{ opacity: .2, display: 'block', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted }}>No history yet</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Run comparisons to populate the regression timeline.</div>
        </div>
    );

    const data = history.map(h => ({
        ts: h.ts,
        label: fmtShortDate(h.ts),
        baselineCost: h.baselineCost,
        currentCost: h.currentCost,
        change: h.costChange,
        regression: h.regression,
    }));

    // Identify deploy event X-positions
    const deployXLabels = (deployEvents || []).map(d => fmtShortDate(d.ts));

    return (
        <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME.success} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}50`} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: THEME.textDim }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: THEME.textDim }} tickLine={false} axisLine={false} />
                <Tooltip content={<DeployTooltip deployEvents={deployEvents} />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

                {/* Deploy event vertical markers */}
                {deployXLabels.map((lbl, i) => (
                    <ReferenceLine
                        key={`deploy-${i}`}
                        x={lbl}
                        stroke={THEME.warning}
                        strokeDasharray="4 2"
                        strokeWidth={1.5}
                        label={{ value: '🚀', position: 'top', fontSize: 10 }}
                    />
                ))}

                {/* Regression threshold reference line */}
                {regressionThreshold && (
                    <ReferenceLine
                        y={regressionThreshold}
                        stroke={THEME.danger}
                        strokeDasharray="3 3"
                        strokeWidth={1}
                        label={{ value: `+${regressionThreshold}% threshold`, position: 'right', fontSize: 9, fill: THEME.danger }}
                    />
                )}

                <Area type="monotone" dataKey="baselineCost" name="Baseline Cost" stroke={THEME.success} strokeWidth={1.5} fill="url(#baselineGrad)" dot={false} />
                <Area type="monotone" dataKey="currentCost" name="Current Cost" stroke={THEME.primary} strokeWidth={2} fill="url(#currentGrad)"
                      dot={(props) => {
                          const { cx, cy, payload } = props;
                          if (!payload.regression) return <circle key={`dot-${cx}`} cx={cx} cy={cy} r={3} fill={THEME.primary} />;
                          return <circle key={`dot-r-${cx}`} cx={cx} cy={cy} r={5} fill={THEME.danger} stroke={THEME.surface} strokeWidth={2} />;
                      }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

/* ─── Generic vs Custom Plan Ratio Chart ──────────────────────────────────── */
const PlanRatioChart = ({ ratioHistory }) => {
    if (!ratioHistory?.length) return (
        <div style={{ padding: 32, textAlign: 'center', color: THEME.textDim }}>
            <BarChart2 size={32} style={{ opacity: .2, display: 'block', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 12, color: THEME.textMuted }}>No ratio data yet. Enable the watcher to track plan type switches.</div>
        </div>
    );

    return (
        <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ratioHistory} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.grid}50`} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: THEME.textDim }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: THEME.textDim }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip
                    contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.grid}`, borderRadius: 8, fontSize: 12 }}
                    formatter={(v, name) => [`${v.toFixed(1)}%`, name]}
                />
                <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="customPct" name="Custom Plan %" stackId="a" fill={THEME.success} radius={0} />
                <Bar dataKey="genericPct" name="Generic Plan %" stackId="a" fill={THEME.warning} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

/* ─── Auto Watcher Panel ──────────────────────────────────────────────────── */
const AutoWatcherPanel = ({ watcherConfig, setWatcherConfig, watcherActive, setWatcherActive, baselines }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="qr-card" style={{ borderColor: watcherActive ? `${THEME.success}40` : `${THEME.grid}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Zap size={15} color={watcherActive ? THEME.success : THEME.textMuted} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: THEME.textMain }}>Automated Regression Watcher</span>
                    <div className={`qr-watcher-dot ${watcherActive ? 'active' : 'inactive'}`} />
                    <span style={{ fontSize: 11, color: watcherActive ? THEME.success : THEME.textDim, fontWeight: 600 }}>
                        {watcherActive ? `Running — checks every ${watcherConfig.intervalMin}m` : 'Inactive'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="qr-btn" onClick={() => setExpanded(v => !v)}
                            style={{ background: `${THEME.primary}10`, color: THEME.primary, border: `1px solid ${THEME.primary}30`, padding: '6px 10px' }}>
                        <Settings size={13} /> {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    <button className="qr-btn"
                            onClick={() => setWatcherActive(v => !v)}
                            style={{
                                background: watcherActive ? `${THEME.danger}12` : `${THEME.success}12`,
                                color: watcherActive ? THEME.danger : THEME.success,
                                border: `1px solid ${watcherActive ? THEME.danger : THEME.success}30`
                            }}>
                        {watcherActive ? <><BellOff size={13} /> Stop Watcher</> : <><Bell size={13} /> Start Watcher</>}
                    </button>
                </div>
            </div>

            {expanded && (
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, paddingTop: 16, borderTop: `1px solid ${THEME.grid}30` }}>
                    <div>
                        <label className="qr-section-label">Check Interval</label>
                        <select className="qr-select" value={watcherConfig.intervalMin} onChange={e => setWatcherConfig(c => ({ ...c, intervalMin: +e.target.value }))}>
                            {[5, 15, 30, 60, 120, 360].map(v => <option key={v} value={v}>{v} minutes</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="qr-section-label">Regression Threshold</label>
                        <select className="qr-select" value={watcherConfig.threshold} onChange={e => setWatcherConfig(c => ({ ...c, threshold: +e.target.value }))}>
                            {[10, 15, 20, 30, 50].map(v => <option key={v} value={v}>+{v}% cost increase</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="qr-section-label">Alert Channel</label>
                        <select className="qr-select" value={watcherConfig.alertChannel} onChange={e => setWatcherConfig(c => ({ ...c, alertChannel: e.target.value }))}>
                            {['In-App Only', 'Webhook', 'Email', 'Slack'].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="qr-section-label">Queries to Watch</label>
                        <div style={{ fontSize: 12, color: THEME.textMuted, padding: '8px 12px', background: `${THEME.bg}`, border: `1px solid ${THEME.grid}`, borderRadius: 8 }}>
                            {baselines.length === 0 ? 'No baselines yet' : `All ${baselines.length} stored baseline${baselines.length !== 1 ? 's' : ''}`}
                        </div>
                    </div>
                    <div>
                        <label className="qr-section-label">Capture New Baseline on Fix</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <input type="checkbox" checked={watcherConfig.autoRebaseline} onChange={e => setWatcherConfig(c => ({ ...c, autoRebaseline: e.target.checked }))}
                                   style={{ accentColor: THEME.primary, width: 15, height: 15 }} />
                            <span style={{ fontSize: 12, color: THEME.textMuted }}>Auto-rebaseline after manual fix</span>
                        </div>
                    </div>
                    <div>
                        <label className="qr-section-label">Track Plan Type Changes</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <input type="checkbox" checked={watcherConfig.trackPlanType} onChange={e => setWatcherConfig(c => ({ ...c, trackPlanType: e.target.checked }))}
                                   style={{ accentColor: THEME.primary, width: 15, height: 15 }} />
                            <span style={{ fontSize: 12, color: THEME.textMuted }}>Alert on custom→generic plan switch</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── Deploy Event Manager ────────────────────────────────────────────────── */
const DeployEventManager = ({ deployEvents, setDeployEvents }) => {
    const [newVersion, setNewVersion] = useState('');
    const addDeploy = () => {
        if (!newVersion.trim()) return;
        setDeployEvents(prev => [...prev, { ts: new Date().toISOString(), version: newVersion.trim(), label: `Deploy ${newVersion.trim()}` }]);
        setNewVersion('');
    };
    return (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${THEME.grid}30` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>
                Deployment Event Markers
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input className="qr-input" placeholder="Version tag (e.g. v2.4.1, release-42)" value={newVersion} onChange={e => setNewVersion(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && addDeploy()} style={{ flex: 1 }} />
                <button className="qr-btn" onClick={addDeploy}
                        style={{ background: `${THEME.warning}15`, color: THEME.warning, border: `1px solid ${THEME.warning}30`, flexShrink: 0 }}>
                    <Tag size={13} /> Mark Deploy
                </button>
            </div>
            {deployEvents.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {deployEvents.map((d, i) => (
                        <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 6, background: `${THEME.warning}12`, border: `1px solid ${THEME.warning}30`, fontSize: 11 }}>
                            <span style={{ color: THEME.warning }}>🚀</span>
                            <span style={{ color: THEME.textMain, fontWeight: 600 }}>{d.version}</span>
                            <span style={{ color: THEME.textDim }}>{fmtRel(d.ts)}</span>
                            <button onClick={() => setDeployEvents(prev => prev.filter((_, j) => j !== i))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 0, marginLeft: 2, display: 'flex' }}>
                                <Trash2 size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function QueryPlanRegressionTab() {
    useAdaptiveTheme();

    // Core state
    const [baselines,     setBaselines]     = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [query,         setQuery]         = useState('');
    const [label,         setLabel]         = useState('');
    const [capturing,     setCapturing]     = useState(false);
    const [comparing,     setComparing]     = useState(false);
    const [captureMsg,    setCaptureMsg]    = useState(null);
    const [compareResult, setCompareResult] = useState(null);
    const [error,         setError]         = useState(null);
    const [activeTab,     setActiveTab]     = useState('compare');

    // New feature state
    const [history,        setHistory]       = useState([]); // [{ts, baselineCost, currentCost, costChange, regression, queryLabel}]
    const [deployEvents,   setDeployEvents]  = useState([]); // [{ts, version, label}]
    const [ratioHistory,   setRatioHistory]  = useState([]); // [{label, customPct, genericPct, ts}]
    const [watcherActive,  setWatcherActive] = useState(false);
    const [watcherConfig,  setWatcherConfig] = useState({
        intervalMin:   15,
        threshold:     20,
        alertChannel:  'In-App Only',
        autoRebaseline: false,
        trackPlanType:  true,
    });
    const [watcherAlerts, setWatcherAlerts] = useState([]);
    const watcherTimer = useRef(null);

    // ── Load baselines ──────────────────────────────────────────────────────
    const loadBaselines = useCallback(async () => {
        try {
            const d = await fetchData('/api/regression/baselines');
            setBaselines(d || []);
        } catch (e) {
            console.warn('Could not load baselines', e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadBaselines(); }, [loadBaselines]);

    // ── Auto-watcher tick ───────────────────────────────────────────────────
    const runWatcherCheck = useCallback(async () => {
        if (!baselines.length) return;
        const alerts = [];
        for (const b of baselines) {
            try {
                const r = await postData('/api/regression/compare', { query: b.queryPreview });
                if (r.regression) {
                    alerts.push({ ts: new Date().toISOString(), label: b.label, change: r.costChange, fingerprint: b.fingerprint });
                }
            } catch (e) { /* skip */ }
        }
        if (alerts.length) setWatcherAlerts(prev => [...alerts, ...prev].slice(0, 20));
    }, [baselines]);

    useEffect(() => {
        if (watcherActive) {
            runWatcherCheck();
            watcherTimer.current = setInterval(runWatcherCheck, watcherConfig.intervalMin * 60 * 1000);
        } else {
            clearInterval(watcherTimer.current);
        }
        return () => clearInterval(watcherTimer.current);
    }, [watcherActive, watcherConfig.intervalMin, runWatcherCheck]);

    // ── Capture ─────────────────────────────────────────────────────────────
    const handleCapture = async () => {
        if (!query.trim()) return;
        setCapturing(true); setCaptureMsg(null); setError(null);
        try {
            const r = await postData('/api/regression/capture', { query: query.trim(), label: label.trim() || undefined });
            setCaptureMsg({ ok: true, cost: r.cost, fp: r.fingerprint });
            await loadBaselines();

            // Seed plan ratio history
            if (watcherConfig.trackPlanType) {
                setRatioHistory(prev => [...prev, {
                    ts:         new Date().toISOString(),
                    label:      fmtShortDate(new Date()),
                    customPct:  r.planType === 'custom' ? 100 : 0,
                    genericPct: r.planType === 'generic' ? 100 : 0,
                }]);
            }
        } catch (e) {
            setCaptureMsg({ ok: false, msg: e.message });
        } finally {
            setCapturing(false);
        }
    };

    // ── Compare ─────────────────────────────────────────────────────────────
    const handleCompare = async () => {
        if (!query.trim()) return;
        setComparing(true); setCompareResult(null); setError(null);
        try {
            const r = await postData('/api/regression/compare', { query: query.trim() });
            setCompareResult(r);

            // Append to history for timeline
            if (r.status !== 'no_baseline') {
                const entry = {
                    ts:           new Date().toISOString(),
                    baselineCost: r.baseline?.cost,
                    currentCost:  r.current?.cost,
                    costChange:   r.costChange,
                    regression:   r.regression,
                    queryLabel:   label || 'Query',
                };
                setHistory(prev => [...prev, entry].slice(-60));

                // Plan type ratio
                if (watcherConfig.trackPlanType && r.current?.planType) {
                    setRatioHistory(prev => [...prev, {
                        ts:         new Date().toISOString(),
                        label:      fmtShortDate(new Date()),
                        customPct:  r.current.planType === 'custom'  ? 100 : 0,
                        genericPct: r.current.planType === 'generic' ? 100 : 0,
                    }].slice(-30));
                }
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setComparing(false);
        }
    };

    const handleDelete = async (fp) => {
        try {
            await deleteData(`/api/regression/baselines/${fp}`);
            setBaselines(prev => prev.filter(b => b.fingerprint !== fp));
        } catch (e) {
            console.warn('Delete failed', e.message);
        }
    };

    const regressionCount = history.filter(h => h.regression).length;

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: THEME.textMuted }}>
            <RefreshCw size={24} style={{ animation: 'qrSpin 1s linear infinite', marginRight: 10 }} /> Loading regression data…
        </div>
    );

    const TABS = [
        { id: 'compare',  label: 'Compare & Detect',         icon: GitCompare  },
        { id: 'timeline', label: 'Timeline',                  icon: Activity    },
        { id: 'ratio',    label: 'Plan Type Ratio',           icon: BarChart2   },
        { id: 'watcher',  label: `Watcher${watcherAlerts.length ? ` (${watcherAlerts.length})` : ''}`, icon: Bell },
        { id: 'baselines',label: `Baselines (${baselines.length})`, icon: BookOpen },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Styles />

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: THEME.surface, borderRadius: 12, border: `1px solid ${THEME.grid}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <TrendingUp size={20} color={THEME.primary} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: THEME.textMain }}>Query Plan Regression Detection</span>
                    {watcherActive && (
                        <span className="qr-badge" style={{ background: `${THEME.success}15`, color: THEME.success, border: `1px solid ${THEME.success}30` }}>
                            <Zap size={10} /> Watcher Active
                        </span>
                    )}
                    {regressionCount > 0 && (
                        <span className="qr-badge" style={{ background: `${THEME.danger}15`, color: THEME.danger, border: `1px solid ${THEME.danger}30` }}>
                            <AlertTriangle size={10} /> {regressionCount} regression{regressionCount !== 1 ? 's' : ''} detected
                        </span>
                    )}
                </div>
                <button onClick={loadBaselines} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: `1px solid ${THEME.primary}40`, background: `${THEME.primary}10`, color: THEME.primary, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            {/* ── Metric cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                <MetricCard icon={BookOpen}      label="Stored Baselines"  value={baselines.length}                              sub="Query plan snapshots"                        color={THEME.primary}   />
                <MetricCard icon={Activity}      label="History Points"    value={history.length}                                sub="Comparison data points"                      color={THEME.secondary} />
                <MetricCard icon={AlertTriangle} label="Regressions Found" value={regressionCount}                              sub="Across all comparisons"                      color={regressionCount ? THEME.danger : THEME.textDim} />
                <MetricCard icon={Tag}           label="Deploy Markers"    value={deployEvents.length}                           sub="Release event overlays"                      color={THEME.warning}   />
            </div>

            {/* ── Watcher alert strip ── */}
            {watcherAlerts.length > 0 && (
                <div style={{ padding: '12px 16px', background: `${THEME.danger}10`, border: `1px solid ${THEME.danger}30`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, animation: 'qrSlide .3s ease' }}>
                    <Bell size={15} color={THEME.danger} />
                    <div style={{ flex: 1, fontSize: 12, color: THEME.danger, fontWeight: 600 }}>
                        Watcher alert: <strong>{watcherAlerts[0].label}</strong> regressed by <strong>+{watcherAlerts[0].change}%</strong>
                        {watcherAlerts.length > 1 && <span style={{ opacity: .7 }}> and {watcherAlerts.length - 1} more</span>}
                    </div>
                    <button onClick={() => setWatcherAlerts([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.danger, fontSize: 11 }}>Dismiss</button>
                </div>
            )}

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TABS.map(({ id, label: lbl, icon: Icon }) => (
                    <button key={id} className={`qr-tab-btn ${activeTab === id ? 'active' : ''}`}
                            onClick={() => setActiveTab(id)}
                            style={{ border: `1px solid ${activeTab === id ? THEME.primary : THEME.grid}`, background: activeTab === id ? `${THEME.primary}12` : 'transparent', color: activeTab === id ? THEME.primary : THEME.textMuted }}>
                        <Icon size={14} /> {lbl}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── COMPARE TAB ── */}
            {activeTab === 'compare' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="qr-card">
                        <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <GitCompare size={15} color={THEME.primary} /> Analyze a Query
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label className="qr-section-label">SQL Query</label>
                            <textarea className="qr-textarea" rows={6}
                                      placeholder="SELECT * FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.created_at > NOW() - INTERVAL '30 days';"
                                      value={query} onChange={e => setQuery(e.target.value)} />
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label className="qr-section-label">Label (optional)</label>
                            <input className="qr-input" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Orders last 30 days — before index" />
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button className="qr-btn" onClick={handleCapture} disabled={!query.trim() || capturing}
                                    style={{ background: `${THEME.secondary}15`, color: THEME.secondary, border: `1px solid ${THEME.secondary}30` }}>
                                {capturing ? <RefreshCw size={13} style={{ animation: 'qrSpin 1s linear infinite' }} /> : <PlusCircle size={13} />}
                                {capturing ? 'Capturing…' : 'Capture as Baseline'}
                            </button>
                            <button className="qr-btn" onClick={handleCompare} disabled={!query.trim() || comparing}
                                    style={{ background: `linear-gradient(135deg,${THEME.primary},${THEME.secondary})`, color: '#fff' }}>
                                {comparing ? <RefreshCw size={13} style={{ animation: 'qrSpin 1s linear infinite' }} /> : <Play size={13} />}
                                {comparing ? 'Comparing…' : 'Compare vs Baseline'}
                            </button>
                        </div>

                        {captureMsg && (
                            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: captureMsg.ok ? `${THEME.success}10` : `${THEME.danger}10`, border: `1px solid ${captureMsg.ok ? THEME.success : THEME.danger}30`, color: captureMsg.ok ? THEME.success : THEME.danger, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {captureMsg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                {captureMsg.ok ? `✓ Baseline captured — cost ${captureMsg.cost?.toFixed(2)} (fingerprint: ${captureMsg.fp?.slice(0, 12)}…)` : captureMsg.msg}
                            </div>
                        )}
                        {error && (
                            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: `${THEME.danger}10`, border: `1px solid ${THEME.danger}30`, color: THEME.danger, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}
                    </div>

                    {compareResult && (
                        <div className="qr-card" style={{ borderColor: compareResult.regression ? `${THEME.danger}40` : compareResult.status === 'ok' ? `${THEME.success}30` : `${THEME.primary}30` }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <GitCompare size={15} color={THEME.primary} /> Comparison Result
                                    <StatusBadge status={compareResult.status} change={compareResult.costChange} />
                                </div>
                                {compareResult.baseline && (
                                    <div style={{ fontSize: 11, color: THEME.textDim }}>Baseline from {fmtRel(compareResult.baseline.ts)}</div>
                                )}
                            </div>

                            {compareResult.status === 'no_baseline' ? (
                                <div style={{ padding: 20, textAlign: 'center', color: THEME.textMuted, fontSize: 13 }}>
                                    <BookOpen size={32} style={{ opacity: .3, display: 'block', margin: '0 auto 12px' }} />
                                    No baseline found for this query. Click "Capture as Baseline" first to establish a reference plan.
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                        {[
                                            { label: 'Baseline Plan Cost', value: compareResult.baseline?.cost?.toFixed(2), color: THEME.success },
                                            { label: 'Current Plan Cost',  value: compareResult.current?.cost?.toFixed(2),  color: compareResult.regression ? THEME.danger : THEME.success },
                                        ].map(({ label: lbl, value, color }) => (
                                            <div key={lbl} style={{ padding: 16, background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 10, textAlign: 'center' }}>
                                                <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
                                                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4, fontWeight: 600 }}>{lbl}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {compareResult.regression && (
                                        <div style={{ marginBottom: 16, padding: 12, background: `${THEME.danger}10`, border: `1px solid ${THEME.danger}30`, borderRadius: 8, fontSize: 12, color: THEME.danger }}>
                                            ⚠ <strong>Plan regression detected!</strong> The planner chose a significantly more expensive plan (+{compareResult.costChange}%).
                                            Consider running ANALYZE, checking for missing indexes, or reviewing recent schema changes.
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <PlanTree plan={compareResult.baseline?.plan} title="Baseline Plan" accent={THEME.success} />
                                        <PlanTree plan={compareResult.current?.plan}  title="Current Plan"  accent={compareResult.regression ? THEME.danger : THEME.primary} />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── TIMELINE TAB ── */}
            {activeTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="qr-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Activity size={15} color={THEME.primary} /> Plan Cost Regression Timeline
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: THEME.textDim }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 12, height: 2, background: THEME.warning, borderRadius: 1 }} />
                                    Deploy marker
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.danger }} />
                                    Regression
                                </div>
                            </div>
                        </div>
                        <RegressionTimeline history={history} deployEvents={deployEvents} regressionThreshold={watcherConfig.threshold} />
                        <DeployEventManager deployEvents={deployEvents} setDeployEvents={setDeployEvents} />
                    </div>

                    {/* History table */}
                    {history.length > 0 && (
                        <div className="qr-card" style={{ padding: 0 }}>
                            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${THEME.grid}`, fontSize: 13, fontWeight: 700, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Clock size={14} color={THEME.primary} /> Comparison History
                            </div>
                            {history.slice().reverse().map((h, i) => (
                                <div key={i} className="qr-baseline-row">
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: h.regression ? THEME.danger : THEME.success }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain }}>{h.queryLabel || 'Query'}</div>
                                        <div style={{ fontSize: 11, color: THEME.textDim }}>{fmtRel(h.ts)}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: 12 }}>
                                        <div style={{ color: THEME.textMuted }}>{h.baselineCost?.toFixed(2)} → <span style={{ color: h.regression ? THEME.danger : THEME.success, fontWeight: 700 }}>{h.currentCost?.toFixed(2)}</span></div>
                                        <div style={{ color: h.regression ? THEME.danger : THEME.success, fontWeight: 700, fontSize: 11 }}>
                                            {h.costChange > 0 ? `+${h.costChange}%` : `${h.costChange}%`}
                                        </div>
                                    </div>
                                    <StatusBadge status={h.regression ? 'regression' : 'ok'} change={h.costChange} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── PLAN TYPE RATIO TAB ── */}
            {activeTab === 'ratio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="qr-card">
                        <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart2 size={15} color={THEME.primary} /> Generic vs. Custom Plan Ratio
                        </div>
                        <div style={{ fontSize: 12, color: THEME.textDim, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Info size={12} />
                            PostgreSQL may switch from a <strong style={{ color: THEME.success }}>custom plan</strong> (optimized per parameter) to a <strong style={{ color: THEME.warning }}>generic plan</strong> (one-size-fits-all) for prepared statements.
                            A rising generic plan ratio can silently degrade performance.
                        </div>
                        <PlanRatioChart ratioHistory={ratioHistory} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div className="qr-card" style={{ borderColor: `${THEME.success}30` }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.success, marginBottom: 8 }}>✓ Custom Plan</div>
                            <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.7 }}>
                                PostgreSQL generates a plan tailored to the actual parameter values. Usually more efficient for queries with high cardinality variation.
                                Enabled when <code style={{ background: `${THEME.bg}`, padding: '1px 4px', borderRadius: 3 }}>plan_cache_mode = auto</code> and custom plan wins cost comparison.
                            </div>
                        </div>
                        <div className="qr-card" style={{ borderColor: `${THEME.warning}30` }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.warning, marginBottom: 8 }}>⚠ Generic Plan</div>
                            <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.7 }}>
                                A single cached plan is reused for all parameter values. After 5 executions PostgreSQL may switch to generic if average custom plan cost exceeds generic.
                                Force custom with <code style={{ background: `${THEME.bg}`, padding: '1px 4px', borderRadius: 3 }}>plan_cache_mode = force_custom_plan</code>.
                            </div>
                        </div>
                    </div>

                    <div className="qr-card" style={{ borderColor: `${THEME.primary}20` }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, marginBottom: 10 }}>Detection Tips</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            {[
                                { title: 'Enable tracking', desc: 'Toggle "Track Plan Type Changes" in the Watcher settings. Each compare call will record whether the returned plan is custom or generic.' },
                                { title: 'Alert condition', desc: 'A custom→generic switch is flagged as a soft regression. The cost may look similar but generic plans can be catastrophic for skewed data.' },
                                { title: 'Fix strategies', desc: 'Run ANALYZE to refresh statistics, force custom plan via plan_cache_mode, or use pg_hint_plan to pin the preferred join order.' },
                            ].map(({ title, desc }) => (
                                <div key={title} style={{ padding: '12px 14px', background: `${THEME.bg}60`, borderRadius: 8, border: `1px solid ${THEME.grid}` }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, marginBottom: 6 }}>{title}</div>
                                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6 }}>{desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── WATCHER TAB ── */}
            {activeTab === 'watcher' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <AutoWatcherPanel
                        watcherConfig={watcherConfig}
                        setWatcherConfig={setWatcherConfig}
                        watcherActive={watcherActive}
                        setWatcherActive={setWatcherActive}
                        baselines={baselines}
                    />

                    {/* Alert log */}
                    <div className="qr-card" style={{ padding: 0 }}>
                        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${THEME.grid}`, fontSize: 13, fontWeight: 700, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Bell size={14} color={THEME.primary} /> Watcher Alert Log
                            </div>
                            {watcherAlerts.length > 0 && (
                                <button onClick={() => setWatcherAlerts([])} style={{ fontSize: 11, color: THEME.textDim, background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
                            )}
                        </div>
                        {watcherAlerts.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: THEME.textDim }}>
                                <CheckCircle size={32} style={{ opacity: .2, display: 'block', margin: '0 auto 12px' }} />
                                <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted }}>No alerts</div>
                                <div style={{ fontSize: 12, marginTop: 6 }}>{watcherActive ? 'All baselines are within normal cost range.' : 'Start the watcher to begin monitoring.'}</div>
                            </div>
                        ) : watcherAlerts.map((a, i) => (
                            <div key={i} className="qr-baseline-row">
                                <AlertTriangle size={14} color={THEME.danger} style={{ flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>{a.label}</div>
                                    <div style={{ fontSize: 11, color: THEME.textDim }}>{fmtRel(a.ts)}</div>
                                </div>
                                <span className="qr-badge" style={{ background: `${THEME.danger}15`, color: THEME.danger, border: `1px solid ${THEME.danger}30` }}>
                                    +{a.change}% cost
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* How watcher works */}
                    <div className="qr-card" style={{ borderColor: `${THEME.primary}20` }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Info size={13} /> How the Watcher Works
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                            {[
                                { step: '1. Schedule', desc: 'Runs a compare call for every stored baseline at the configured interval using the browser session.' },
                                { step: '2. Detect',   desc: 'Flags any query whose current plan cost exceeds its baseline by the configured threshold (default 20%).' },
                                { step: '3. Alert',    desc: 'Fires an in-app notification banner. Optional webhook/Slack/email when configured.' },
                                { step: '4. Log',      desc: 'All watcher check results are appended to the timeline for trend analysis.' },
                            ].map(({ step, desc }) => (
                                <div key={step} style={{ padding: '12px 14px', background: `${THEME.bg}60`, borderRadius: 8, border: `1px solid ${THEME.grid}` }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, marginBottom: 6 }}>{step}</div>
                                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6 }}>{desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── BASELINES TAB ── */}
            {activeTab === 'baselines' && (
                <div className="qr-card" style={{ padding: 0 }}>
                    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${THEME.grid}`, fontSize: 13, fontWeight: 700, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={15} color={THEME.primary} /> Stored Plan Baselines
                        <span style={{ fontSize: 11, color: THEME.textDim, fontWeight: 400, marginLeft: 'auto' }}>{baselines.length} baseline{baselines.length !== 1 ? 's' : ''} in memory — cleared on server restart</span>
                    </div>
                    {baselines.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: THEME.textDim }}>
                            <BookOpen size={36} style={{ opacity: .25, display: 'block', margin: '0 auto 12px' }} />
                            <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted }}>No baselines stored</div>
                            <div style={{ fontSize: 12, marginTop: 6 }}>Go to Compare, enter a query, and click "Capture as Baseline" to start tracking.</div>
                        </div>
                    ) : baselines.map((b) => (
                        <div key={b.fingerprint} className="qr-baseline-row">
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, color: THEME.textMain, fontSize: 13 }}>{b.label}</div>
                                <div style={{ fontFamily: THEME.fontMono, fontSize: 10, color: THEME.textDim, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.queryPreview}</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary }}>Cost: {Number(b.cost).toFixed(2)}</div>
                                <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 2 }}>{fmtRel(b.ts)}</div>
                            </div>
                            <button onClick={() => handleDelete(b.fingerprint)}
                                    style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${THEME.danger}30`, background: `${THEME.danger}10`, color: THEME.danger, cursor: 'pointer', marginLeft: 12, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                                <Trash2 size={12} /> Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ── How it works footer ── */}
            <div className="qr-card" style={{ borderColor: `${THEME.primary}25` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={14} /> How Plan Regression Detection Works
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                        { step: '1. Capture Baseline',  desc: 'Run a query at a known-good state (after fresh ANALYZE, with correct indexes). The planner cost is stored as your reference point.' },
                        { step: '2. Compare Later',     desc: 'After schema changes, new indexes, or PostgreSQL upgrades, compare the current plan against the baseline. A >20% cost increase flags a regression.' },
                        { step: '3. Investigate',       desc: 'Side-by-side plan trees show exactly which nodes changed — e.g. a sequential scan replacing an index scan signals a missing or bloated index.' },
                    ].map(({ step, desc }) => (
                        <div key={step} style={{ padding: '12px 14px', background: `${THEME.bg}60`, borderRadius: 8, border: `1px solid ${THEME.grid}` }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, marginBottom: 6 }}>{step}</div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.6 }}>{desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}