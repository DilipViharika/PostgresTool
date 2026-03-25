// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef, FC } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { fetchData } from '../../../utils/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
    CheckCircle, RefreshCw, AlertTriangle, Clock, Zap,
    HardDrive, Activity, Settings, AlertCircle
} from 'lucide-react';

// Types
interface CheckpointData {
    bgwriter?: {
        buffers_checkpoint?: number;
        buffers_clean?: number;
        buffers_backend?: number;
        buffers_alloc?: number;
        buffers_backend_fsync?: number;
        checkpoints_timed?: number;
        checkpoints_req?: number;
        checkpoint_write_ms?: number;
        checkpoint_sync_ms?: number;
        maxwritten_clean?: number;
        stats_reset?: string;
    };
    wal?: {
        current_wal?: string;
        max_wal_mb?: number;
        checkpoint_timeout_sec?: number;
    };
    settings?: Array<{
        name: string;
        setting: string;
        unit?: string;
    }>;
}

interface HistoryEntry {
    t: string;
    checkpoint: number;
    bgwriter: number;
    backend: number;
}

interface MetricCardProps {
    icon: any;
    label: string;
    value: string;
    sub?: string;
    color?: string;
    warn?: boolean;
}

const fmt = (n: number | null | undefined) => n === null || n === undefined ? '—' : Number(n).toLocaleString();
const fmtMs = (ms: number | null | undefined) => {
    if (ms === null || ms === undefined) return '—';
    const m = Number(ms);
    if (m < 1000) return `${m}ms`;
    if (m < 60000) return `${(m / 1000).toFixed(1)}s`;
    return `${(m / 60000).toFixed(1)}min`;
};
const fmtDate = (d: string | null | undefined) => d ? new Date(d).toLocaleString() : '—';

const MetricCard: FC<MetricCardProps> = ({ icon: Icon, label, value, sub, color = THEME.primary, warn }) => (
    <div
        className={`flex items-center gap-3 p-4 rounded-xl border transition-all
            ${warn ? `border-vigil-amber/40 bg-vigil-amber/8` : `border-vigil-accent/20 bg-vigil-surface`}
        `}
    >
        <div
            className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0"
            style={{
                background: `${color}15`,
                borderColor: `${color}40`,
            }}
        >
            <Icon size={20} style={{ color }} />
        </div>
        <div className="flex-1">
            <div className="text-2xl font-black text-vigil-text leading-none">{value}</div>
            <div className="text-xs font-semibold text-vigil-muted mt-1 uppercase tracking-wider">{label}</div>
            {sub && <div className="text-xs mt-0.5" style={{ color: warn ? THEME.warning : THEME.textDim }}>{sub}</div>}
        </div>
    </div>
);

const ChartTip: FC<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-vigil-surface border border-vigil-accent/20 rounded-lg p-2 text-xs">
            <div className="text-vigil-muted mb-1">{label}</div>
            {payload.map((p: any) => (
                <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {fmt(p.value)}</div>
            ))}
        </div>
    );
};

const CheckpointMonitorTab: FC = () => {
    useAdaptiveTheme();
    const [data, setData] = useState<CheckpointData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastAt, setLastAt] = useState<number | null>(null);
    const [autoRfsh, setAutoRfsh] = useState(30);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [showSets, setShowSets] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const load = useCallback(async (initial = false) => {
        if (!initial) setRefreshing(true);
        try {
            const d = await fetchData('/api/checkpoint/stats');
            setData(d);
            setError(null);
            setHistory(prev => {
                const entry = {
                    t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    checkpoint: Number(d?.bgwriter?.buffers_checkpoint ?? 0),
                    bgwriter: Number(d?.bgwriter?.buffers_clean ?? 0),
                    backend: Number(d?.bgwriter?.buffers_backend ?? 0),
                };
                return [...prev.slice(-19), entry];
            });
        } catch (e: any) {
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

    const bg = data?.bgwriter || {};
    const wal = data?.wal || {};
    const settings = data?.settings || [];

    const totalCheckpoints = (Number(bg.checkpoints_timed) || 0) + (Number(bg.checkpoints_req) || 0);
    const reqRatio = totalCheckpoints > 0
        ? Math.round((Number(bg.checkpoints_req) / totalCheckpoints) * 100)
        : 0;
    const reqWarn = reqRatio > 30;

    const totalBufs = (Number(bg.buffers_checkpoint) || 0) + (Number(bg.buffers_clean) || 0) + (Number(bg.buffers_backend) || 0);
    const bufferPie = [
        { name: 'Checkpoint', value: Number(bg.buffers_checkpoint) || 0, color: THEME.primary },
        { name: 'BGWriter', value: Number(bg.buffers_clean) || 0, color: THEME.secondary },
        { name: 'Backend', value: Number(bg.buffers_backend) || 0, color: THEME.warning },
    ].filter(d => d.value > 0);

    const fmtRelative = (d: number | null) => {
        if (!d) return '';
        const s = Math.floor((Date.now() - d) / 1000);
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        return `${Math.floor(s / 3600)}h ago`;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-80 text-vigil-muted">
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} />
            Loading checkpoint stats…
        </div>
    );

    return (
        <div className="flex flex-col gap-5">
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* Toolbar */}
            <div className="flex justify-between items-center p-4 bg-vigil-surface rounded-xl border border-vigil-accent/10">
                <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-vigil-cyan" />
                    <span className="font-bold text-sm text-vigil-text">Checkpoint Monitor</span>
                    {reqWarn && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-vigil-amber/15 border border-vigil-amber/30 text-vigil-amber">
                            <AlertTriangle size={10} /> High requested-checkpoint rate
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="text-xs text-vigil-muted">{lastAt ? `Updated ${fmtRelative(lastAt)}` : ''}</span>
                    <select
                        value={autoRfsh}
                        onChange={e => setAutoRfsh(+e.target.value)}
                        className="bg-vigil-surface border border-vigil-accent/10 text-vigil-text rounded-lg px-2 py-1 text-xs cursor-pointer"
                    >
                        <option value={10}>10s</option>
                        <option value={30}>30s</option>
                        <option value={60}>1m</option>
                        <option value={0}>Off</option>
                    </select>
                    <button
                        onClick={() => load(false)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-vigil-cyan/40 bg-vigil-cyan/10 text-vigil-cyan cursor-pointer text-xs font-semibold hover:bg-vigil-cyan/20 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-vigil-rose/10 border border-vigil-rose/30 text-vigil-rose text-xs font-semibold">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Metric cards */}
            <div className="grid grid-cols-4 gap-3.5">
                <MetricCard icon={CheckCircle} label="Total Checkpoints" value={fmt(totalCheckpoints)} sub={`Since ${fmtDate(bg.stats_reset).split(',')[0]}`} color={THEME.primary} />
                <MetricCard icon={AlertTriangle} label="Requested (Forced)" value={`${reqRatio}%`} sub={reqWarn ? '⚠ Above 30% threshold' : `${fmt(bg.checkpoints_req)} of ${fmt(totalCheckpoints)}`} color={reqWarn ? THEME.warning : THEME.success} warn={reqWarn} />
                <MetricCard icon={Clock} label="Avg Write Time" value={fmtMs(bg.checkpoint_write_ms)} sub="Time writing dirty buffers" color={THEME.secondary} />
                <MetricCard icon={HardDrive} label="Buffers Allocated" value={fmt(bg.buffers_alloc)} sub={`BGWriter stops: ${fmt(bg.maxwritten_clean)}`} color={THEME.primary} />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-2 gap-5">

                {/* Buffer write history chart */}
                <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-vigil-text mb-4">
                        <Activity size={15} className="text-vigil-cyan" /> Buffer Writes Over Time
                        <span className="text-xs text-vigil-muted font-normal ml-auto">Cumulative — last {history.length} snapshots</span>
                    </div>
                    {history.length < 2 ? (
                        <div className="h-40 flex items-center justify-center text-vigil-muted text-xs">
                            Collecting data… refresh again in {autoRfsh || 30}s
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={history} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gcChk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gcBgw" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.secondary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={THEME.secondary} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gcBe" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={THEME.warning} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="t" tick={{ fontSize: 10, fill: THEME.textDim }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: THEME.textDim }} tickLine={false} axisLine={false} width={45} />
                                <Tooltip content={<ChartTip />} />
                                <Area type="monotone" dataKey="checkpoint" name="Checkpoint" stroke={THEME.primary} fill="url(#gcChk)" strokeWidth={1.5} />
                                <Area type="monotone" dataKey="bgwriter" name="BGWriter" stroke={THEME.secondary} fill="url(#gcBgw)" strokeWidth={1.5} />
                                <Area type="monotone" dataKey="backend" name="Backend" stroke={THEME.warning} fill="url(#gcBe)" strokeWidth={1.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                    <div className="flex gap-4 mt-2">
                        {[{ color: THEME.primary, label: 'Checkpoint' }, { color: THEME.secondary, label: 'BGWriter' }, { color: THEME.warning, label: 'Backend' }].map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-1.5 text-xs text-vigil-muted">
                                <div className="w-2.5 h-0.5 rounded-full" style={{ background: color }} />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buffer distribution pie */}
                <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-vigil-text mb-2">
                        <HardDrive size={15} className="text-vigil-secondary" /> Buffer Write Distribution
                    </div>
                    {totalBufs === 0 ? (
                        <div className="h-40 flex items-center justify-center text-vigil-muted text-xs">No buffer data yet</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={bufferPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                    {bufferPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(v: any) => [fmt(v), 'Buffers']} />
                                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    <div className="flex flex-col gap-0 mt-1">
                        {[
                            { label: 'Checkpoint buffers', value: bg.buffers_checkpoint, color: THEME.primary },
                            { label: 'BGWriter buffers', value: bg.buffers_clean, color: THEME.secondary },
                            { label: 'Backend writes', value: bg.buffers_backend, color: THEME.warning },
                            { label: 'Backend fsync calls', value: bg.buffers_backend_fsync, color: THEME.danger },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="flex justify-between items-center py-1.5 px-0 border-b border-vigil-accent/10 last:border-b-0 text-xs">
                                <span className="text-vigil-muted flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded flex-shrink-0" style={{ background: color }} />
                                    {label}
                                </span>
                                <span className="font-bold text-vigil-text font-mono text-xs">{fmt(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timing breakdown */}
            <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-vigil-text mb-4">
                    <Clock size={15} className="text-vigil-cyan" /> Checkpoint Timing Breakdown
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Write Time (total)', value: fmtMs(bg.checkpoint_write_ms), desc: 'Time spent writing dirty buffers to disk', color: THEME.primary },
                        { label: 'Sync Time (total)', value: fmtMs(bg.checkpoint_sync_ms), desc: 'Time spent syncing files to durable storage (fsync)', color: THEME.secondary },
                        { label: 'Timed Checkpoints', value: fmt(bg.checkpoints_timed), desc: 'Scheduled by checkpoint_timeout (healthy)', color: THEME.success },
                    ].map(({ label, value, desc, color }) => (
                        <div key={label} className="p-3.5 rounded-xl border border-vigil-accent/10 bg-vigil-accent/5">
                            <div className="text-xl font-black leading-none mb-1.5" style={{ color }}>{value}</div>
                            <div className="text-xs font-bold text-vigil-text mb-1">{label}</div>
                            <div className="text-xs text-vigil-muted leading-relaxed">{desc}</div>
                        </div>
                    ))}
                </div>
                {Number(bg.checkpoint_sync_ms) > Number(bg.checkpoint_write_ms) && (
                    <div className="mt-3.5 p-3 rounded-lg bg-vigil-amber/10 border border-vigil-amber/30 text-vigil-amber text-xs">
                        ⚠ Sync time exceeds write time — this may indicate slow storage I/O. Consider faster disks or adjusting <code className="font-mono text-xs">checkpoint_completion_target</code>.
                    </div>
                )}
            </div>

            {/* Settings */}
            <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
                <div className="flex justify-between items-center" style={{ marginBottom: showSets ? 16 : 0 }}>
                    <div className="flex items-center gap-2 text-xs font-bold text-vigil-text">
                        <Settings size={15} className="text-vigil-muted" /> Checkpoint & BGWriter Settings
                    </div>
                    <button
                        onClick={() => setShowSets(s => !s)}
                        className="bg-none border-none text-vigil-muted cursor-pointer text-xs font-semibold p-1"
                    >
                        {showSets ? 'Hide' : 'Show'}
                    </button>
                </div>
                {showSets && (
                    <div className="grid grid-cols-2 gap-x-8">
                        {settings.map(s => (
                            <div key={s.name} className="flex justify-between py-2.5 px-0 border-b border-vigil-accent/10 last:border-b-0 text-xs">
                                <span className="text-vigil-muted">{s.name}</span>
                                <span className="font-mono text-vigil-text font-semibold text-xs">
                                    {s.setting}{s.unit ? ` ${s.unit}` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* WAL info */}
            <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-vigil-text mb-3">
                    <Zap size={15} className="text-vigil-secondary" /> WAL Configuration
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Current WAL File', value: wal.current_wal || '—' },
                        { label: 'Max WAL Size', value: wal.max_wal_mb ? `${wal.max_wal_mb} MB` : '—' },
                        { label: 'Checkpoint Timeout', value: wal.checkpoint_timeout_sec ? `${wal.checkpoint_timeout_sec}s` : '—' },
                    ].map(({ label, value }) => (
                        <div key={label} className="p-3 rounded-lg bg-vigil-accent/5 border border-vigil-accent/10">
                            <div className="text-xs text-vigil-muted uppercase tracking-wider mb-1.5 font-semibold">{label}</div>
                            <div className="font-mono text-xs font-bold text-vigil-text">{value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CheckpointMonitorTab;
