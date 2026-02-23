import React, { useState, useEffect, useCallback, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { fetchData, postData } from '../../utils/api';
import {
    Zap, RefreshCw, AlertTriangle, Clock, CheckCircle,
    Database, Activity, Settings, AlertCircle, Play, Search, Filter
} from 'lucide-react';

/* ── Styles ─────────────────────────────────────────────────────────────────
   Matches BloatAnalysisTab visual system exactly:
   - Fonts: Syne (display) + JetBrains Mono (data)
   - Cards: glassmorphic gradient surfaces, 14px radius, baFadeUp entrance
   - Metric cards: column layout, accent glow ::after orb, hover lift
   - Progress bars: baSlide animation, glowing tip
   - Badges: inline-flex, animated entrance
   - Tabs: indigo active state with glow
   - Rows: subtle hover, left-border severity
   - Dots: pulsing critical / static high / ok
────────────────────────────────────────────────────────────────────────────*/
const Styles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@600;700;800&display=swap');

        @keyframes vmSpin    { to { transform: rotate(360deg) } }
        @keyframes vmFadeUp  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes vmPulse   { 0%,100% { opacity:1 } 50% { opacity:.4 } }
        @keyframes vmGlow    { 0%,100% { box-shadow: 0 0 8px #ef444440 } 50% { box-shadow: 0 0 20px #ef444470 } }
        @keyframes vmSlide   { from { width: 0 } }
        @keyframes vmCounter { from { opacity:0; transform: scale(.8) } to { opacity:1; transform: scale(1) } }
        @keyframes vmSuccessGlow { 0%,100% { box-shadow: 0 0 6px #10b98140 } 50% { box-shadow: 0 0 18px #10b98170 } }

        .vm-wrap { font-family: 'Syne', system-ui, sans-serif; }
        .vm-mono { font-family: 'JetBrains Mono', monospace !important; }

        /* ── Base card ── */
        .vm-card {
            background: linear-gradient(135deg, rgba(255,255,255,.03) 0%, rgba(255,255,255,.01) 100%);
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 14px;
            padding: 20px;
            animation: vmFadeUp .4s ease both;
            backdrop-filter: blur(4px);
            position: relative;
            overflow: hidden;
        }
        .vm-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 14px;
            background: linear-gradient(135deg, rgba(255,255,255,.015) 0%, transparent 60%);
            pointer-events: none;
        }

        /* ── Metric card ── */
        .vm-metric-card {
            background: linear-gradient(145deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.01) 100%);
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 16px;
            padding: 20px 24px;
            display: flex; flex-direction: column; gap: 10px;
            position: relative; overflow: hidden;
            transition: transform .2s, border-color .2s;
            cursor: default;
            animation: vmFadeUp .4s ease both;
        }
        .vm-metric-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.18); }
        .vm-metric-card::after {
            content: '';
            position: absolute;
            top: -30px; right: -30px;
            width: 100px; height: 100px;
            border-radius: 50%;
            opacity: .06;
        }
        .vm-metric-card.warn  { border-color: rgba(245,158,11,.3); }
        .vm-metric-card.crit  { border-color: rgba(239,68,68,.35); animation: vmGlow 2s ease-in-out infinite; }

        /* ── Table rows ── */
        .vm-row {
            display: grid;
            align-items: center;
            padding: 11px 16px;
            border-bottom: 1px solid rgba(255,255,255,.04);
            font-size: 12.5px;
            transition: background .15s;
            position: relative;
        }
        .vm-row:hover { background: rgba(255,255,255,.03); }
        .vm-row:last-child { border-bottom: none; }

        /* ── Column header ── */
        .vm-head {
            display: grid;
            gap: 8px;
            padding: 10px 16px;
            font-size: 10px;
            font-weight: 700;
            color: rgba(255,255,255,.35);
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid rgba(255,255,255,.06);
            background: rgba(0,0,0,.2);
        }

        /* ── Input ── */
        .vm-input {
            background: rgba(255,255,255,.05);
            border: 1px solid rgba(255,255,255,.1);
            color: rgba(255,255,255,.9);
            border-radius: 10px;
            padding: 9px 12px;
            font-size: 13px;
            outline: none;
            transition: border-color .2s, background .2s;
            font-family: 'Syne', system-ui, sans-serif;
        }
        .vm-input:focus { border-color: rgba(99,102,241,.6); background: rgba(255,255,255,.07); }
        .vm-input::placeholder { color: rgba(255,255,255,.3); }

        /* ── Tabs ── */
        .vm-tab {
            padding: 8px 18px;
            border-radius: 9px;
            border: 1px solid rgba(255,255,255,.1);
            background: transparent;
            color: rgba(255,255,255,.5);
            cursor: pointer;
            font-size: 13px;
            font-weight: 700;
            font-family: 'Syne', system-ui;
            transition: all .2s;
            letter-spacing: .3px;
            display: inline-flex; align-items: center; gap: 7px;
        }
        .vm-tab.active {
            background: linear-gradient(135deg, rgba(99,102,241,.25), rgba(139,92,246,.15));
            border-color: rgba(99,102,241,.5);
            color: #a5b4fc;
            box-shadow: 0 0 16px rgba(99,102,241,.2);
        }
        .vm-tab:hover:not(.active) { border-color: rgba(255,255,255,.2); color: rgba(255,255,255,.8); }

        /* ── Badge ── */
        .vm-badge {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 3px 9px;
            border-radius: 6px;
            font-size: 11px; font-weight: 700;
            animation: vmCounter .3s ease;
        }

        /* ── Progress bar ── */
        .vm-progress-track {
            height: 6px;
            border-radius: 3px;
            background: rgba(255,255,255,.08);
            overflow: visible;
            position: relative;
        }
        .vm-progress-fill {
            height: 100%;
            border-radius: 3px;
            animation: vmSlide .6s ease both;
            position: relative;
        }
        .vm-progress-fill::after {
            content: '';
            position: absolute;
            right: -1px; top: -2px;
            width: 10px; height: 10px;
            border-radius: 50%;
            background: inherit;
            box-shadow: 0 0 8px currentColor;
        }

        /* ── Severity dots ── */
        .vm-dot {
            width: 6px; height: 6px; border-radius: 50%;
            display: inline-block; flex-shrink: 0;
        }
        .vm-dot.critical { background: #ef4444; box-shadow: 0 0 6px #ef4444; animation: vmPulse 1.5s ease infinite; }
        .vm-dot.high     { background: #f59e0b; }
        .vm-dot.ok       { background: #10b981; }
        .vm-dot.active   { background: #10b981; box-shadow: 0 0 6px #10b981; animation: vmPulse 1.5s ease infinite; }

        /* ── Action button ── */
        .vm-action-btn {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 5px 12px;
            border-radius: 7px;
            font-size: 11px; font-weight: 700;
            cursor: pointer;
            border: 1px solid rgba(99,102,241,.3);
            background: rgba(99,102,241,.1);
            color: #a5b4fc;
            transition: all .15s;
            font-family: 'Syne', system-ui;
        }
        .vm-action-btn:hover:not(:disabled) {
            background: rgba(99,102,241,.2);
            border-color: rgba(99,102,241,.5);
            box-shadow: 0 0 12px rgba(99,102,241,.2);
        }
        .vm-action-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* ── Setting row ── */
        .vm-setting-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,.05);
            font-size: 12px;
        }
        .vm-setting-row:last-child { border-bottom: none; }

        /* ── Worker card ── */
        .vm-worker {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 16px;
            background: rgba(16,185,129,.06);
            border-radius: 10px;
            border: 1px solid rgba(16,185,129,.18);
            animation: vmFadeUp .3s ease both;
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.22); }
    `}</style>
);

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) => n == null ? '—' : Number(n).toLocaleString();

const fmtDate = (d) => {
    if (!d) return <span style={{ color: 'rgba(255,255,255,.2)', fontStyle: 'italic', fontSize: 11 }}>Never</span>;
    const ago = Math.floor((Date.now() - new Date(d)) / 86400000);
    const label = ago === 0 ? 'Today' : ago === 1 ? 'Yesterday' : `${ago}d ago`;
    return <span title={new Date(d).toLocaleString()} style={{ color: 'rgba(255,255,255,.5)' }}>{label}</span>;
};

const deadCol = (pct) => {
    const p = Number(pct) || 0;
    if (p > 20) return '#ef4444';
    if (p > 10) return '#f59e0b';
    return '#10b981';
};

/* ── DeadBar ─────────────────────────────────────────────────────────────── */
const DeadBar = ({ pct }) => {
    const p = Math.min(100, Number(pct) || 0);
    const c = deadCol(pct);
    const grad = p > 20
        ? `linear-gradient(90deg, #ef444490, #ef4444)`
        : p > 10
            ? `linear-gradient(90deg, #f59e0b90, #f59e0b)`
            : `linear-gradient(90deg, #10b98190, #10b981)`;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="vm-progress-track" style={{ flex: 1, minWidth: 50 }}>
                <div className="vm-progress-fill" style={{ width: `${p}%`, background: grad }} />
            </div>
            <span className="vm-mono" style={{ fontSize: 11, fontWeight: 700, color: c, minWidth: 34, textAlign: 'right' }}>{p.toFixed(1)}%</span>
        </div>
    );
};

/* ── MetricCard ──────────────────────────────────────────────────────────── */
const MetricCard = ({ icon: Icon, label, value, sub, accent = '#6366f1', warn, critical, delay = 0 }) => {
    const borderColor = critical ? 'rgba(239,68,68,.35)' : warn ? 'rgba(245,158,11,.3)' : 'rgba(255,255,255,.1)';
    return (
        <div
            className={`vm-metric-card${critical ? ' crit' : warn ? ' warn' : ''}`}
            style={{ borderColor, animationDelay: `${delay}ms` }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${accent}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${accent}30`
                }}>
                    <Icon size={18} color={accent} />
                </div>
                {(warn || critical) && (
                    <span className={`vm-dot ${critical ? 'critical' : 'high'}`} style={{ marginTop: 6 }} />
                )}
            </div>
            <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: -.5 }}>{value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8 }}>{label}</div>
                {sub && <div style={{ fontSize: 11, color: critical ? '#ef4444' : warn ? '#f59e0b' : 'rgba(255,255,255,.3)', marginTop: 3 }}>{sub}</div>}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   VACUUM & MAINTENANCE TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const COLS = '2.2fr 1fr 1.4fr 1fr 1fr 100px';

export default function VacuumMaintenanceTab() {
    const [data,       setData]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error,      setError]      = useState(null);
    const [lastAt,     setLastAt]     = useState(null);
    const [autoRfsh,   setAutoRfsh]   = useState(30);
    const [search,     setSearch]     = useState('');
    const [filterHigh, setFilterHigh] = useState(false);
    const [activeTab,  setActiveTab]  = useState('tables');
    const [vacuuming,  setVacuuming]  = useState({});
    const [vacMsg,     setVacMsg]     = useState({});
    const intervalRef                 = useRef(null);

    const load = useCallback(async (initial = false) => {
        if (!initial) setRefreshing(true);
        try {
            const d = await fetchData('/api/maintenance/vacuum-stats');
            setData(d);
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLastAt(Date.now());
            setRefreshing(false);
            if (initial) setLoading(false);
        }
    }, []);

    useEffect(() => { load(true); }, [load]);
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (autoRfsh > 0) intervalRef.current = setInterval(() => load(false), autoRfsh * 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [autoRfsh, load]);

    const runVacuum = async (schema, relname) => {
        const key = `${schema}.${relname}`;
        setVacuuming(v => ({ ...v, [key]: true }));
        setVacMsg(m => ({ ...m, [key]: null }));
        try {
            const r = await postData('/api/maintenance/vacuum', { schema, table: relname, analyze: true });
            setVacMsg(m => ({ ...m, [key]: r.success ? '✓ Done' : 'Error' }));
            setTimeout(() => load(false), 2000);
        } catch (e) {
            setVacMsg(m => ({ ...m, [key]: `✗ ${e.message?.slice(0, 40) || 'Error'}` }));
        } finally {
            setVacuuming(v => ({ ...v, [key]: false }));
        }
    };

    /* ── Derived ── */
    const tables   = data?.tables   || [];
    const workers  = data?.workers  || [];
    const settings = data?.settings || [];

    const filtered = tables.filter(t => {
        const matchSearch = !search || `${t.schemaname}.${t.relname}`.toLowerCase().includes(search.toLowerCase());
        const matchHigh   = !filterHigh || Number(t.dead_pct) > 10;
        return matchSearch && matchHigh;
    });

    const highBloat  = tables.filter(t => Number(t.dead_pct) > 10).length;
    const critBloat  = tables.filter(t => Number(t.dead_pct) > 20).length;
    const neverVac   = tables.filter(t => !t.last_autovacuum && !t.last_vacuum).length;
    const totalDead  = tables.reduce((s, t) => s + (Number(t.n_dead_tup) || 0), 0);
    const avgDeadPct = tables.length > 0
        ? (tables.reduce((s, t) => s + (Number(t.dead_pct) || 0), 0) / tables.length).toFixed(1)
        : 0;

    const fmtRel = (d) => {
        if (!d) return '';
        const s = Math.floor((Date.now() - new Date(d)) / 1000);
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        return `${Math.floor(s / 3600)}h ago`;
    };

    /* ── Loading ── */
    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, gap: 16, color: 'rgba(255,255,255,.4)' }}>
            <Styles />
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid rgba(99,102,241,.3)', borderTopColor: '#6366f1', animation: 'vmSpin 1s linear infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: .5, fontFamily: 'Syne, system-ui' }}>Loading vacuum statistics…</span>
        </div>
    );

    return (
        <div className="vm-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Styles />

            {/* ── Toolbar ───────────────────────────────────────────────── */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,.08)',
                backdropFilter: 'blur(8px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(99,102,241,.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(99,102,241,.3)'
                    }}>
                        <Zap size={18} color="#a5b4fc" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9', letterSpacing: -.2 }}>Vacuum & Maintenance</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{fmt(tables.length)} tables monitored</div>
                    </div>
                    {workers.length > 0 && (
                        <span className="vm-badge" style={{ background: 'rgba(16,185,129,.12)', color: '#34d399', border: '1px solid rgba(16,185,129,.3)', animation: 'vmPulse 2s infinite' }}>
                            <Activity size={10} /> {workers.length} worker{workers.length > 1 ? 's' : ''} active
                        </span>
                    )}
                    {critBloat > 0 && (
                        <span className="vm-badge" style={{ background: 'rgba(239,68,68,.12)', color: '#f87171', border: '1px solid rgba(239,68,68,.3)' }}>
                            <AlertTriangle size={10} /> {critBloat} critical
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {lastAt && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
                            <Clock size={11} /> {fmtRel(lastAt)}
                        </div>
                    )}
                    <select
                        value={autoRfsh}
                        onChange={e => setAutoRfsh(+e.target.value)}
                        style={{
                            background: 'rgba(255,255,255,.06)',
                            border: '1px solid rgba(255,255,255,.1)',
                            color: 'rgba(255,255,255,.7)',
                            borderRadius: 8, padding: '5px 10px',
                            fontSize: 12, outline: 'none', cursor: 'pointer',
                            fontFamily: 'inherit'
                        }}
                    >
                        <option value={10}>10s</option>
                        <option value={30}>1m</option>
                        <option value={60}>5m</option>
                        <option value={0}>Off</option>
                    </select>
                    <button
                        onClick={() => load(false)}
                        disabled={refreshing}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            padding: '7px 16px', borderRadius: 9,
                            border: '1px solid rgba(99,102,241,.4)',
                            background: 'rgba(99,102,241,.12)',
                            color: '#a5b4fc', cursor: 'pointer',
                            fontSize: 13, fontWeight: 700,
                            fontFamily: 'inherit', transition: 'all .2s'
                        }}
                    >
                        <RefreshCw size={13} style={{ animation: refreshing ? 'vmSpin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Error ─────────────────────────────────────────────────── */}
            {error && (
                <div style={{
                    padding: 14, background: 'rgba(239,68,68,.1)',
                    border: '1px solid rgba(239,68,68,.3)',
                    borderRadius: 12, color: '#f87171',
                    fontSize: 13, display: 'flex', alignItems: 'center', gap: 9
                }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* ── Metric cards ──────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                <MetricCard
                    icon={Activity}
                    label="Active Workers"
                    value={workers.length}
                    sub={workers.length === 0 ? 'All idle' : workers.map(w => w.table_name || w.datname).join(', ').slice(0, 28) + '…'}
                    accent={workers.length > 0 ? '#10b981' : '#6366f1'}
                    delay={0}
                />
                <MetricCard
                    icon={AlertTriangle}
                    label="High-Bloat Tables"
                    value={highBloat}
                    sub=">10% dead tuples"
                    accent="#f59e0b"
                    warn={highBloat > 0}
                    delay={60}
                />
                <MetricCard
                    icon={Database}
                    label="Never Vacuumed"
                    value={neverVac}
                    sub="No vacuum history"
                    accent="#ef4444"
                    critical={neverVac > 0}
                    delay={120}
                />
                <MetricCard
                    icon={Zap}
                    label="Avg Dead Tuple %"
                    value={`${avgDeadPct}%`}
                    sub={`${fmt(totalDead)} total dead rows`}
                    accent={Number(avgDeadPct) > 10 ? '#f59e0b' : '#10b981'}
                    warn={Number(avgDeadPct) > 10}
                    delay={180}
                />
            </div>

            {/* ── Active autovacuum workers ─────────────────────────────── */}
            {workers.length > 0 && (
                <div className="vm-card" style={{ borderColor: 'rgba(16,185,129,.25)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={14} color="#10b981" />
                        Active Autovacuum Workers
                        <span className="vm-badge" style={{ background: 'rgba(16,185,129,.1)', color: '#34d399', border: '1px solid rgba(16,185,129,.2)', marginLeft: 4 }}>
                            {workers.length} running
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {workers.map((w, i) => (
                            <div key={w.pid} className="vm-worker" style={{ animationDelay: `${i * 60}ms` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className="vm-dot active" />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{w.table_name || w.datname}</div>
                                        <div className="vm-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>PID {w.pid} · {w.datname}</div>
                                    </div>
                                </div>
                                <span className="vm-mono" style={{ fontSize: 12, color: '#34d399', fontWeight: 700 }}>
                                    {w.duration_sec ? `${w.duration_sec}s` : 'Running'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Sub-tabs ──────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[
                    { id: 'tables',   label: 'Table Bloat',          icon: Database  },
                    { id: 'settings', label: 'Autovacuum Settings',   icon: Settings  },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={`vm-tab${activeTab === id ? ' active' : ''}`}
                        onClick={() => setActiveTab(id)}
                    >
                        <Icon size={13} /> {label}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,.25)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {activeTab === 'tables' ? `${filtered.length} of ${tables.length} tables` : `${settings.length} settings`}
                </span>
            </div>

            {/* ── Table bloat view ──────────────────────────────────────── */}
            {activeTab === 'tables' && (
                <div className="vm-card" style={{ padding: 0 }}>
                    {/* Filters */}
                    <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)' }} />
                            <input
                                className="vm-input"
                                placeholder="Search tables…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: 34, width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button
                            onClick={() => setFilterHigh(f => !f)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 14px', borderRadius: 9,
                                border: `1px solid ${filterHigh ? 'rgba(245,158,11,.5)' : 'rgba(255,255,255,.1)'}`,
                                background: filterHigh ? 'rgba(245,158,11,.1)' : 'transparent',
                                color: filterHigh ? '#fbbf24' : 'rgba(255,255,255,.4)',
                                cursor: 'pointer', fontSize: 12, fontWeight: 700,
                                fontFamily: 'inherit', transition: 'all .2s'
                            }}
                        >
                            <Filter size={12} /> High Bloat Only
                        </button>
                    </div>

                    {/* Column headers */}
                    <div className="vm-head" style={{ gridTemplateColumns: COLS }}>
                        <span>Table</span>
                        <span>Dead Tuples</span>
                        <span>Dead %</span>
                        <span>Last Vacuum</span>
                        <span>Last Analyze</span>
                        <span>Action</span>
                    </div>

                    {/* Rows */}
                    <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: 50, textAlign: 'center', color: 'rgba(255,255,255,.25)', fontSize: 13 }}>
                                No tables match the current filter.
                            </div>
                        ) : (
                            filtered.map(t => {
                                const dead = Number(t.dead_pct) || 0;
                                const isCritical = dead > 20;
                                const isHigh = dead > 10 && dead <= 20;
                                const key = `${t.schemaname}.${t.relname}`;
                                const isRunning = vacuuming[key];
                                const msg = vacMsg[key];
                                return (
                                    <div
                                        key={key}
                                        className="vm-row"
                                        style={{
                                            gridTemplateColumns: COLS,
                                            borderLeft: `3px solid ${isCritical ? '#ef4444' : isHigh ? '#f59e0b' : 'transparent'}`
                                        }}
                                    >
                                        {/* Table name */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <span className={`vm-dot ${isCritical ? 'critical' : isHigh ? 'high' : 'ok'}`} />
                                                <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.relname}</span>
                                            </div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2, marginLeft: 14 }}>{t.schemaname} · {t.total_size}</div>
                                        </div>

                                        {/* Dead tuples */}
                                        <span className="vm-mono" style={{ fontSize: 12, color: Number(t.n_dead_tup) > 0 ? '#fbbf24' : 'rgba(255,255,255,.3)' }}>
                                            {fmt(t.n_dead_tup)}
                                        </span>

                                        {/* Dead % bar */}
                                        <DeadBar pct={t.dead_pct} />

                                        {/* Last vacuum */}
                                        <span style={{ fontSize: 12 }}>{fmtDate(t.last_autovacuum || t.last_vacuum)}</span>

                                        {/* Last analyze */}
                                        <span style={{ fontSize: 12 }}>{fmtDate(t.last_autoanalyze || t.last_analyze)}</span>

                                        {/* Action */}
                                        <div>
                                            {msg ? (
                                                <span className="vm-mono" style={{ fontSize: 11, fontWeight: 700, color: msg.startsWith('✓') ? '#34d399' : '#f87171' }}>
                                                    {msg}
                                                </span>
                                            ) : (
                                                <button
                                                    className="vm-action-btn"
                                                    onClick={() => runVacuum(t.schemaname, t.relname)}
                                                    disabled={isRunning}
                                                >
                                                    {isRunning
                                                        ? <RefreshCw size={10} style={{ animation: 'vmSpin 1s linear infinite' }} />
                                                        : <Play size={10} />}
                                                    {isRunning ? 'Running…' : 'Vacuum'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.25)' }}>
                            {filtered.length} of {tables.length} tables
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.25)' }}>
                            Left border = severity · Click Vacuum to run VACUUM ANALYZE
                        </span>
                    </div>
                </div>
            )}

            {/* ── Autovacuum settings ───────────────────────────────────── */}
            {activeTab === 'settings' && (
                <div className="vm-card">
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Settings size={14} color="rgba(255,255,255,.4)" />
                        Autovacuum Configuration
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginBottom: 20, lineHeight: 1.6 }}>
                        Read from <span className="vm-mono" style={{ color: 'rgba(255,255,255,.5)', fontSize: 11 }}>pg_settings</span>. To modify, edit <span className="vm-mono" style={{ color: 'rgba(255,255,255,.5)', fontSize: 11 }}>postgresql.conf</span> or use <span className="vm-mono" style={{ color: '#a5b4fc', fontSize: 11 }}>ALTER SYSTEM</span> + <span className="vm-mono" style={{ color: '#a5b4fc', fontSize: 11 }}>SELECT pg_reload_conf()</span>.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px' }}>
                        {settings.map(s => (
                            <div key={s.name} className="vm-setting-row">
                                <div style={{ flex: 1 }}>
                                    <div className="vm-mono" style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 12 }}>{s.name}</div>
                                    {s.short_desc && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 3 }}>{s.short_desc}</div>}
                                </div>
                                <span className="vm-mono" style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginLeft: 16, whiteSpace: 'nowrap' }}>
                                    {s.setting}{s.unit ? ` ${s.unit}` : ''}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Tuning tips */}
                    <div style={{
                        marginTop: 24, padding: '16px 18px',
                        background: 'rgba(99,102,241,.07)',
                        border: '1px solid rgba(99,102,241,.2)',
                        borderRadius: 12
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Zap size={12} color="#a5b4fc" /> Tuning Tips
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.8 }}>
                            • Reduce <span className="vm-mono" style={{ color: '#e2e8f0', fontSize: 11 }}>autovacuum_vacuum_scale_factor</span> (e.g. 0.01) for large tables to vacuum more aggressively.<br />
                            • Increase <span className="vm-mono" style={{ color: '#e2e8f0', fontSize: 11 }}>autovacuum_vacuum_cost_delay</span> to reduce I/O impact during business hours.<br />
                            • Set <span className="vm-mono" style={{ color: '#e2e8f0', fontSize: 11 }}>autovacuum_max_workers</span> higher if multiple large tables bloat simultaneously.<br />
                            • Use per-table storage parameters (<span className="vm-mono" style={{ color: '#a5b4fc', fontSize: 11 }}>ALTER TABLE … SET autovacuum_…</span>) to override global settings.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}