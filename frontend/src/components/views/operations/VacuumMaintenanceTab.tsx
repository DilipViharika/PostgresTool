// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { fetchData, postData } from '../../../utils/api';
import {
    Zap, RefreshCw, AlertTriangle, Clock, CheckCircle,
    Database, Activity, Settings, AlertCircle, Play, Search, Filter, TrendingUp,
    type LucideIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from 'recharts';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface VacuumTableRow {
    schemaname: string;
    relname: string;
    n_dead_tup?: number;
    n_live_tup?: number;
    dead_pct?: number;
    last_autovacuum?: string;
    last_vacuum?: string;
    autovacuum_count?: number;
    manual_vacuum_count?: number;
}

interface VacuumWorker {
    pid: string | number;
    table_name?: string;
    datname?: string;
    duration_sec?: number;
}

interface VacuumSetting {
    name: string;
    setting: string;
}

interface VacuumData {
    tables: VacuumTableRow[];
    workers: VacuumWorker[];
    settings: VacuumSetting[];
}

interface DeadTupleTableRow {
    relname: string;
    n_dead_tup: number;
    n_live_tup: number;
    dead_pct: number;
    last_autovacuum: string;
}

/* ─── Styles ────────────────────────────────────────────────────────────── */
const VM_STYLE_ID = 'vm-adaptive-styles';

function ensureVmStyles() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById(VM_STYLE_ID);
    if (!el) {
        el = document.createElement('style');
        el.id = VM_STYLE_ID;
        document.head.appendChild(el);
    }
    el.textContent = [
        `@keyframes vmSpin { to { transform: rotate(360deg) } }`,
        `@keyframes vmFadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`,
        `@keyframes vmPulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }`,
        `@keyframes vmGlow { 0%,100% { box-shadow: 0 0 8px ${THEME.danger}66 } 50% { box-shadow: 0 0 20px ${THEME.danger}99 } }`,
        `@keyframes vmSlide { from { width: 0 } }`,
        `@keyframes vmCounter { from { opacity:0; transform: scale(.8) } to { opacity:1; transform: scale(1) } }`,
        `@keyframes vmSuccessGlow { 0%,100% { box-shadow: 0 0 6px ${THEME.success}66 } 50% { box-shadow: 0 0 18px ${THEME.success}99 } }`,

        `.vm-wrap { font-family: ${THEME.fontBody}; }`,
        `.vm-mono { font-family: ${THEME.fontMono} !important; }`,

        `.vm-card {
            background: linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.surface} 100%);
            border: 1px solid ${THEME.grid};
            border-radius: 14px;
            padding: 20px;
            animation: vmFadeUp .4s ease both;
            backdrop-filter: blur(4px);
            position: relative;
            overflow: hidden;
        }`,
        `.vm-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 14px;
            background: linear-gradient(135deg, ${THEME.surface} 0%, transparent 60%);
            pointer-events: none;
        }`,

        `.vm-metric-card {
            background: linear-gradient(145deg, ${THEME.surfaceHover} 0%, ${THEME.surface} 100%);
            border: 1px solid ${THEME.grid};
            border-radius: 16px;
            padding: 20px 24px;
            display: flex; flex-direction: column; gap: 10px;
            position: relative; overflow: hidden;
            transition: transform .2s, border-color .2s;
            cursor: default;
            animation: vmFadeUp .4s ease both;
        }`,
        `.vm-metric-card:hover { transform: translateY(-2px); border-color: ${THEME.grid}; }`,
        `.vm-metric-card::after {
            content: '';
            position: absolute;
            top: -30px; right: -30px;
            width: 100px; height: 100px;
            border-radius: 50%;
            opacity: .06;
        }`,
        `.vm-metric-card.warn { border-color: ${THEME.warning}4D; }`,
        `.vm-metric-card.crit { border-color: ${THEME.danger}59; animation: vmGlow 2s ease-in-out infinite; }`,

        `.vm-row {
            display: grid;
            align-items: center;
            padding: 11px 16px;
            border-bottom: 1px solid ${THEME.surface};
            font-size: 12.5px;
            transition: background .15s;
            position: relative;
        }`,
        `.vm-row:hover { background: ${THEME.surfaceHover}; }`,
        `.vm-row:last-child { border-bottom: none; }`,

        `.vm-head {
            display: grid;
            gap: 8px;
            padding: 10px 16px;
            font-size: 10px;
            font-weight: 700;
            color: ${THEME.textDim};
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid ${THEME.grid};
            background: ${THEME.surfaceHover};
        }`,

        `.vm-input {
            background: ${THEME.surface};
            border: 1px solid ${THEME.grid};
            color: ${THEME.textMain};
            border-radius: 10px;
            padding: 9px 12px;
            font-size: 13px;
            outline: none;
            transition: border-color .2s, background .2s;
            font-family: ${THEME.fontBody};
        }`,
        `.vm-input:focus { border-color: ${THEME.primary}99; background: ${THEME.surfaceHover}; }`,
        `.vm-input::placeholder { color: ${THEME.textDim}; }`,

        `.vm-tab {
            padding: 8px 18px;
            border-radius: 9px;
            border: 1px solid ${THEME.grid};
            background: transparent;
            color: ${THEME.textMuted};
            cursor: pointer;
            font-size: 13px;
            font-weight: 700;
            font-family: ${THEME.fontBody};
            transition: all .2s;
            letter-spacing: .3px;
            display: inline-flex; align-items: center; gap: 7px;
        }`,
        `.vm-tab.active {
            background: linear-gradient(135deg, ${THEME.primary}40, ${THEME.primary}26);
            border-color: ${THEME.primary}80;
            color: ${THEME.primary};
            box-shadow: 0 0 16px ${THEME.primary}33;
        }`,
        `.vm-tab:hover:not(.active) { border-color: ${THEME.grid}; color: ${THEME.textMain}; }`,

        `.vm-badge {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 3px 9px;
            border-radius: 6px;
            font-size: 11px; font-weight: 700;
            animation: vmCounter .3s ease;
        }`,

        `.vm-progress-track {
            height: 6px;
            border-radius: 3px;
            background: ${THEME.grid};
            overflow: visible;
            position: relative;
        }`,
        `.vm-progress-fill {
            height: 100%;
            border-radius: 3px;
            animation: vmSlide .6s ease both;
            position: relative;
        }`,
        `.vm-progress-fill::after {
            content: '';
            position: absolute;
            right: -1px; top: -2px;
            width: 10px; height: 10px;
            border-radius: 50%;
            background: inherit;
            box-shadow: 0 0 8px currentColor;
        }`,

        `.vm-dot {
            width: 6px; height: 6px; border-radius: 50%;
            display: inline-block; flex-shrink: 0;
        }`,
        `.vm-dot.critical { background: ${THEME.danger}; box-shadow: 0 0 6px ${THEME.danger}; animation: vmPulse 1.5s ease infinite; }`,
        `.vm-dot.high { background: ${THEME.warning}; }`,
        `.vm-dot.ok { background: ${THEME.success}; }`,
        `.vm-dot.active { background: ${THEME.success}; box-shadow: 0 0 6px ${THEME.success}; animation: vmPulse 1.5s ease infinite; }`,

        `.vm-action-btn {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 5px 12px;
            border-radius: 7px;
            font-size: 11px; font-weight: 700;
            cursor: pointer;
            border: 1px solid ${THEME.primary}4D;
            background: ${THEME.primary}1A;
            color: ${THEME.primary};
            transition: all .15s;
            font-family: ${THEME.fontBody};
        }`,
        `.vm-action-btn:hover:not(:disabled) {
            background: ${THEME.primary}33;
            border-color: ${THEME.primary}80;
            box-shadow: 0 0 12px ${THEME.primary}33;
        }`,
        `.vm-action-btn:disabled { opacity: .5; cursor: not-allowed; }`,

        `.vm-setting-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid ${THEME.surface};
            font-size: 12px;
        }`,
        `.vm-setting-row:last-child { border-bottom: none; }`,

        `.vm-worker {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 16px;
            background: ${THEME.success}0F;
            border-radius: 10px;
            border: 1px solid ${THEME.success}2E;
            animation: vmFadeUp .3s ease both;
        }`,

        `::-webkit-scrollbar { width: 4px; height: 4px; }`,
        `::-webkit-scrollbar-track { background: transparent; }`,
        `::-webkit-scrollbar-thumb { background: ${THEME.grid}; border-radius: 2px; }`,
        `::-webkit-scrollbar-thumb:hover { background: ${THEME.grid}; }`,
    ].join('\n');
}

interface StylesProps { }

const Styles: React.FC<StylesProps> = () => {
    useAdaptiveTheme();
    ensureVmStyles();
    return null;
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const fmt = (n: number | null | undefined): string =>
    n === null || n === undefined ? '—' : Number(n).toLocaleString();

const fmtDate = (d: string | null | undefined): ReactNode => {
    if (!d) return <span style={{ color: THEME.textDim, fontStyle: 'italic', fontSize: 11 }}>Never</span>;
    const ago = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    const label = ago === 0 ? 'Today' : ago === 1 ? 'Yesterday' : `${ago}d ago`;
    return <span title={new Date(d).toLocaleString()} style={{ color: THEME.textMuted }}>{label}</span>;
};

const deadCol = (pct: number | null | undefined): string => {
    const p = Number(pct) || 0;
    if (p > 20) return THEME.danger;
    if (p > 10) return THEME.warning;
    return THEME.success;
};

/* ─── Components ────────────────────────────────────────────────────────── */
interface DeadBarProps {
    pct: number | null | undefined;
}

const DeadBar: React.FC<DeadBarProps> = ({ pct }) => {
    const p = Math.min(100, Number(pct) || 0);
    const c = deadCol(pct);
    const grad = p > 20
        ? `linear-gradient(90deg, ${THEME.danger}55, ${THEME.danger})`
        : p > 10
            ? `linear-gradient(90deg, ${THEME.warning}55, ${THEME.warning})`
            : `linear-gradient(90deg, ${THEME.success}55, ${THEME.success})`;
    return (
        <div className="flex items-center gap-2">
            <div className="vm-progress-track flex-1 min-w-12">
                <div className="vm-progress-fill" style={{ width: `${p}%`, background: grad }} />
            </div>
            <span className="vm-mono text-xs font-bold min-w-8 text-right"
                style={{ color: c }}>
                {p.toFixed(1)}%
            </span>
        </div>
    );
};

interface MetricCardProps {
    icon: LucideIcon;
    label: string;
    value: ReactNode;
    sub?: ReactNode;
    accent?: string;
    warn?: boolean;
    critical?: boolean;
    delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
    icon: Icon,
    label,
    value,
    sub,
    accent = THEME.primary,
    warn = false,
    critical = false,
    delay = 0
}) => {
    const borderColor = critical ? `${THEME.danger}59` : warn ? `${THEME.warning}4D` : THEME.grid;
    return (
        <div
            className={`vm-metric-card${critical ? ' crit' : warn ? ' warn' : ''}`}
            style={{ borderColor, animationDelay: `${delay}ms` }}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center justify-center flex-shrink-0 w-9.5 h-9.5 rounded-lg border"
                    style={{
                        background: `${accent}18`,
                        borderColor: `${accent}30`
                    }}>
                    <Icon size={18} color={accent} />
                </div>
                {(warn || critical) && (
                    <span className={`vm-dot ${critical ? 'critical' : 'high'}`}
                        style={{ marginTop: 6 }} />
                )}
            </div>
            <div>
                <div className="text-2xl font-black leading-none tracking-tight"
                    style={{ color: THEME.textMain }}>
                    {value}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest mt-1"
                    style={{ color: THEME.textDim }}>
                    {label}
                </div>
                {sub && (
                    <div className="text-xs mt-0.75"
                        style={{
                            color: critical ? THEME.danger : warn ? THEME.warning : THEME.textDim
                        }}>
                        {sub}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   VACUUM & MAINTENANCE TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const COLS = '2.2fr 1fr 1.4fr 1fr 1fr 100px';

const VacuumMaintenanceTab: React.FC = () => {
    useAdaptiveTheme();
    const [data, setData] = useState<VacuumData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastAt, setLastAt] = useState<number | null>(null);
    const [autoRfsh, setAutoRfsh] = useState(30);
    const [search, setSearch] = useState('');
    const [filterHigh, setFilterHigh] = useState(false);
    const [activeTab, setActiveTab] = useState<'tables' | 'settings'>('tables');
    const [vacuuming, setVacuuming] = useState<Record<string, boolean>>({});
    const [vacMsg, setVacMsg] = useState<Record<string, string | null>>({});
    const [deadTupleData, setDeadTupleData] = useState<DeadTupleTableRow[]>([]);
    const [deadTupleLoading, setDeadTupleLoading] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const load = useCallback(async (initial = false) => {
        if (!initial) setRefreshing(true);
        try {
            const d = await fetchData('/api/maintenance/vacuum-stats') as VacuumData;
            setData(d);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLastAt(Date.now());
            setRefreshing(false);
            if (initial) setLoading(false);
        }
    }, []);

    const fetchDeadTupleRate = useCallback(async () => {
        setDeadTupleLoading(true);
        try {
            const token = localStorage.getItem('vigil_token') || localStorage.getItem('authToken');
            const API_BASE = import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';
            const res = await fetch(`${API_BASE}/api/vacuum/dead-tuple-rate`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                setDeadTupleData(json.tables || json || []);
            }
        } catch {
            setDeadTupleData([
                { relname: 'orders', n_dead_tup: 45200, n_live_tup: 892000, dead_pct: 4.8, last_autovacuum: '2h ago' },
                { relname: 'events', n_dead_tup: 38100, n_live_tup: 1240000, dead_pct: 3.0, last_autovacuum: '45m ago' },
                { relname: 'sessions', n_dead_tup: 29400, n_live_tup: 156000, dead_pct: 15.9, last_autovacuum: '6h ago' },
                { relname: 'audit_log', n_dead_tup: 18900, n_live_tup: 440000, dead_pct: 4.1, last_autovacuum: '3h ago' },
                { relname: 'users', n_dead_tup: 6700, n_live_tup: 52000, dead_pct: 11.4, last_autovacuum: '1h ago' },
            ]);
        } finally {
            setDeadTupleLoading(false);
        }
    }, []);

    useEffect(() => { load(true); }, [load]);
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (autoRfsh > 0) intervalRef.current = setInterval(() => load(false), autoRfsh * 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [autoRfsh, load]);
    useEffect(() => { fetchDeadTupleRate(); }, [fetchDeadTupleRate]);

    const runVacuum = async (schema: string, relname: string) => {
        const key = `${schema}.${relname}`;
        setVacuuming(v => ({ ...v, [key]: true }));
        setVacMsg(m => ({ ...m, [key]: null }));
        try {
            const r = await postData('/api/maintenance/vacuum', { schema, table: relname, analyze: true });
            if (r.success) {
                setVacMsg(m => ({ ...m, [key]: '✓ Done' }));
                setTimeout(() => load(false), 2000);
            } else {
                const errMsg = r.message || r.error || 'Vacuum failed';
                setVacMsg(m => ({ ...m, [key]: `✗ ${errMsg.slice(0, 40)}` }));
            }
        } catch (e: any) {
            setVacMsg(m => ({ ...m, [key]: `✗ ${e.message?.slice(0, 40) || 'Error'}` }));
        } finally {
            setVacuuming(v => ({ ...v, [key]: false }));
        }
    };

    const tables = data?.tables || [];
    const workers = data?.workers || [];
    const settings = data?.settings || [];

    const filtered = tables.filter(t => {
        const matchSearch = !search || `${t.schemaname}.${t.relname}`.toLowerCase().includes(search.toLowerCase());
        const matchHigh = !filterHigh || Number(t.dead_pct) > 10;
        return matchSearch && matchHigh;
    });

    const highBloat = tables.filter(t => Number(t.dead_pct) > 10).length;
    const critBloat = tables.filter(t => Number(t.dead_pct) > 20).length;
    const neverVac = tables.filter(t => !t.last_autovacuum && !t.last_vacuum).length;
    const totalDead = tables.reduce((s, t) => s + (Number(t.n_dead_tup) || 0), 0);
    const avgDeadPct = tables.length > 0
        ? (tables.reduce((s, t) => s + (Number(t.dead_pct) || 0), 0) / tables.length).toFixed(1)
        : 0;

    const fmtRel = (d: number | null | undefined): string => {
        if (!d) return '';
        const s = Math.floor((Date.now() - d) / 1000);
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        return `${Math.floor(s / 3600)}h ago`;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-80 gap-4"
            style={{ color: THEME.textDim }}>
            <Styles />
            <div className="w-12 h-12 rounded-full border-2 border-opacity-30"
                style={{
                    borderColor: THEME.primary,
                    borderTopColor: THEME.primary,
                    animation: 'vmSpin 1s linear infinite'
                }} />
            <span className="text-xs font-semibold tracking-wide"
                style={{ fontFamily: THEME.fontBody }}>
                Loading vacuum statistics…
            </span>
        </div>
    );

    return (
        <div className="vm-wrap flex flex-col gap-4.5">
            <Styles />

            {/* ── Toolbar ───────────────────────────────────────────────── */}
            <div className="flex justify-between items-center p-3.5 rounded-2xl border"
                style={{
                    background: `linear-gradient(135deg, ${THEME.surfaceHover}, ${THEME.surface})`,
                    borderColor: THEME.grid,
                    backdropFilter: 'blur(8px)'
                }}>
                <div className="flex items-center gap-3.5">
                    <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-lg border"
                        style={{
                            background: `${THEME.primary}26`,
                            borderColor: `${THEME.primary}4D`
                        }}>
                        <Zap size={18} color={THEME.primary} />
                    </div>
                    <div>
                        <div className="font-black text-4xl leading-tight tracking-tight"
                            style={{ color: THEME.textMain }}>
                            Vacuum & Maintenance
                        </div>
                        <div className="text-xs" style={{ color: THEME.textDim }}>
                            {fmt(tables.length)} tables monitored
                        </div>
                    </div>
                    {workers.length > 0 && (
                        <span className="vm-badge"
                            style={{
                                background: `${THEME.success}1F`,
                                color: THEME.success,
                                border: `1px solid ${THEME.success}4D`,
                                animation: 'vmPulse 2s infinite'
                            }}>
                            <Activity size={10} /> {workers.length} worker{workers.length > 1 ? 's' : ''} active
                        </span>
                    )}
                    {critBloat > 0 && (
                        <span className="vm-badge"
                            style={{
                                background: `${THEME.danger}1F`,
                                color: THEME.danger,
                                border: `1px solid ${THEME.danger}4D`
                            }}>
                            <AlertTriangle size={10} /> {critBloat} critical
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2.5">
                    {lastAt && (
                        <div className="flex items-center gap-1.25 text-xs"
                            style={{ color: THEME.textDim }}>
                            <Clock size={11} /> {fmtRel(lastAt)}
                        </div>
                    )}
                    <select
                        value={autoRfsh}
                        onChange={e => setAutoRfsh(+e.target.value)}
                        className="rounded border py-1 px-2.5 text-xs outline-none cursor-pointer"
                        style={{
                            background: THEME.surface,
                            borderColor: THEME.grid,
                            color: THEME.textMain,
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
                        className="inline-flex items-center gap-1.75 px-4 py-1.75 rounded border font-bold text-xs"
                        style={{
                            background: `${THEME.primary}1F`,
                            borderColor: `${THEME.primary}66`,
                            color: THEME.primary,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={13}
                            style={{ animation: refreshing ? 'vmSpin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Error ─────────────────────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-2.25 p-3.5 rounded-2xl border text-xs"
                    style={{
                        background: `${THEME.danger}1A`,
                        borderColor: `${THEME.danger}4D`,
                        color: THEME.danger
                    }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* ── Metric cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-3.5">
                <MetricCard
                    icon={Activity}
                    label="Active Workers"
                    value={workers.length}
                    sub={workers.length === 0
                        ? 'All idle'
                        : workers.map(w => w.table_name || w.datname).join(', ').slice(0, 28) + '…'
                    }
                    accent={workers.length > 0 ? THEME.success : THEME.primary}
                    delay={0}
                />
                <MetricCard
                    icon={AlertTriangle}
                    label="High-Bloat Tables"
                    value={highBloat}
                    sub=">10% dead tuples"
                    accent={THEME.warning}
                    warn={highBloat > 0}
                    delay={60}
                />
                <MetricCard
                    icon={Database}
                    label="Never Vacuumed"
                    value={neverVac}
                    sub="No vacuum history"
                    accent={THEME.danger}
                    critical={neverVac > 0}
                    delay={120}
                />
                <MetricCard
                    icon={Zap}
                    label="Avg Dead Tuple %"
                    value={`${avgDeadPct}%`}
                    sub={`${fmt(totalDead)} total dead rows`}
                    accent={Number(avgDeadPct) > 10 ? THEME.warning : THEME.success}
                    warn={Number(avgDeadPct) > 10}
                    delay={180}
                />
            </div>

            {/* ── Active autovacuum workers ─────────────────────────────── */}
            {workers.length > 0 && (
                <div className="vm-card" style={{
                    background: THEME.surface,
                    borderColor: `${THEME.success}40`
                }}>
                    <div className="flex items-center gap-2 mb-3.5 font-bold text-xs"
                        style={{ color: THEME.textMain }}>
                        <Activity size={14} color={THEME.success} />
                        Active Autovacuum Workers
                        <span className="vm-badge ml-auto"
                            style={{
                                background: `${THEME.success}1A`,
                                color: THEME.success,
                                border: `1px solid ${THEME.success}33`
                            }}>
                            {workers.length} running
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {workers.map((w, i) => (
                            <div key={String(w.pid)} className="vm-worker"
                                style={{ animationDelay: `${i * 60}ms` }}>
                                <div className="flex items-center gap-3">
                                    <span className="vm-dot active" />
                                    <div>
                                        <div className="font-bold text-xs" style={{ color: THEME.textMain }}>
                                            {w.table_name || w.datname}
                                        </div>
                                        <div className="vm-mono text-xs mt-0.5"
                                            style={{ color: THEME.textDim }}>
                                            PID {w.pid} · {w.datname}
                                        </div>
                                    </div>
                                </div>
                                <span className="vm-mono text-xs font-bold"
                                    style={{ color: THEME.success }}>
                                    {w.duration_sec ? `${w.duration_sec}s` : 'Running'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Sub-tabs ──────────────────────────────────────────────── */}
            <div className="flex gap-2">
                {[
                    { id: 'tables' as const, label: 'Table Bloat', icon: Database },
                    { id: 'settings' as const, label: 'Autovacuum Settings', icon: Settings },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={`vm-tab${activeTab === id ? ' active' : ''}`}
                        onClick={() => setActiveTab(id)}
                    >
                        <Icon size={13} /> {label}
                    </button>
                ))}
            </div>

            {/* ── Tables tab ────────────────────────────────────────────── */}
            {activeTab === 'tables' && (
                <div className="vm-card">
                    {/* Search & filter */}
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1 relative">
                            <Search size={13}
                                style={{
                                    position: 'absolute',
                                    left: 12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: THEME.textMuted,
                                    pointerEvents: 'none'
                                }} />
                            <input
                                type="text"
                                placeholder="Search tables..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="vm-input w-full pl-9"
                            />
                        </div>
                        <button
                            onClick={() => setFilterHigh(!filterHigh)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded border font-bold text-xs ${filterHigh ? 'active' : ''}`}
                            style={{
                                background: filterHigh ? `${THEME.warning}1A` : 'transparent',
                                borderColor: filterHigh ? `${THEME.warning}66` : THEME.grid,
                                color: filterHigh ? THEME.warning : THEME.textMuted,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            <Filter size={12} /> {filterHigh ? 'High bloat' : 'All'}
                        </button>
                    </div>

                    {/* Table */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 text-xs" style={{ color: THEME.textDim }}>
                            {search ? 'No tables match your search' : 'No tables to display'}
                        </div>
                    ) : (
                        <>
                            <div className="vm-head" style={{ gridTemplateColumns: COLS }}>
                                <span>Table Name</span>
                                <span>Schema</span>
                                <span>Dead Tuples</span>
                                <span>Dead %</span>
                                <span>Last Vacuum</span>
                                <span>Action</span>
                            </div>
                            {filtered.map((t, i) => {
                                const key = `${t.schemaname}.${t.relname}`;
                                const isVacuuming = vacuuming[key];
                                const msg = vacMsg[key];
                                return (
                                    <div key={i} className="vm-row" style={{ gridTemplateColumns: COLS }}>
                                        <div className="font-semibold text-xs" style={{ color: THEME.textMain }}>
                                            {t.relname}
                                        </div>
                                        <span className="text-xs" style={{ color: THEME.textMuted }}>
                                            {t.schemaname}
                                        </span>
                                        <span className="vm-mono text-xs" style={{ color: THEME.textDim }}>
                                            {fmt(t.n_dead_tup)}
                                        </span>
                                        <DeadBar pct={t.dead_pct} />
                                        <span className="text-xs">{fmtDate(t.last_autovacuum || t.last_vacuum)}</span>
                                        <button
                                            onClick={() => runVacuum(t.schemaname, t.relname)}
                                            disabled={isVacuuming}
                                            className="vm-action-btn"
                                            title={msg || 'Run vacuum now'}
                                        >
                                            {msg ? <span className="text-xs">{msg}</span> : <>
                                                <Play size={9} /> {isVacuuming ? '...' : 'Vac'}
                                            </>}
                                        </button>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}

            {/* ── Settings tab ──────────────────────────────────────────── */}
            {activeTab === 'settings' && (
                <div className="vm-card">
                    {settings.length === 0 ? (
                        <div className="text-center py-12 text-xs" style={{ color: THEME.textDim }}>
                            No settings available
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {settings.map(s => (
                                <div key={s.name} className="vm-setting-row">
                                    <span style={{ color: THEME.textMuted }}>{s.name}</span>
                                    <span className="vm-mono font-semibold text-xs"
                                        style={{ color: THEME.textMain }}>
                                        {s.setting}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VacuumMaintenanceTab;
