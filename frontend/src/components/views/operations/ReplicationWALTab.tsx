import React, { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { fetchData } from '../../../utils/api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    type TooltipProps
} from 'recharts';
import {
    Radio, RefreshCw, AlertTriangle, CheckCircle, Database,
    Wifi, WifiOff, Clock, Activity, Server, AlertCircle, Layers, Zap,
    type LucideIcon
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface ReplicaStatus {
    application_name?: string;
    client_addr?: string;
    state?: string;
    sync_state?: string;
    write_lag_bytes?: number;
    flush_lag_bytes?: number;
    replay_lag_bytes?: number;
    replay_lag_sec?: number;
    total_lag_bytes?: number;
    reply_time?: string;
}

interface ReplicationSlot {
    slot_name: string;
    slot_type: string;
    active: boolean;
    lag_bytes: number;
    lag_pretty?: string;
    wal_status: string;
    plugin?: string;
    database?: string;
}

interface WALReceiver {
    status: string;
    sender_host: string;
    sender_port: string;
    slot_name?: string;
    last_msg_send_time?: string;
    last_msg_receipt_time?: string;
    latest_end_lsn: string;
}

interface WALSender {
    in_recovery?: boolean;
    replica_count: number;
    current_wal?: string;
    current_lsn?: string;
}

interface DBSetting {
    name: string;
    setting: string;
    unit?: string;
}

interface ReplicationData {
    replicas: ReplicaStatus[];
    slots: ReplicationSlot[];
    walReceiver: WALReceiver | null;
    walSender: WALSender;
    settings: DBSetting[];
}

interface ChartDataPoint {
    name: string;
    write: number;
    flush: number;
    replay: number;
}

/* ─── Formatting Helpers ────────────────────────────────────────────────── */
const fmt = (n: number | null | undefined): string =>
    n == null ? '—' : Number(n).toLocaleString();

const fmtBytes = (b: number | null | undefined): string => {
    const n = Number(b) || 0;
    if (n < 1024) return `${n} B`;
    if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1073741824) return `${(n / 1048576).toFixed(1)} MB`;
    return `${(n / 1073741824).toFixed(2)} GB`;
};

const fmtLag = (s: number | null | undefined): string => {
    const n = Number(s) || 0;
    if (n === 0) return 'In sync';
    if (n < 60) return `${n}s`;
    return `${Math.floor(n / 60)}m ${n % 60}s`;
};

const fmtDate = (d: string | null | undefined): string =>
    d ? new Date(d).toLocaleTimeString() : '—';

const fmtRel = (d: number | null | undefined): string => {
    if (!d) return '';
    const s = Math.floor((Date.now() - d) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
};

/* ─── Components ────────────────────────────────────────────────────────── */
interface StateBadgeProps {
    state?: string;
    sync?: string;
}

const StateBadge: React.FC<StateBadgeProps> = ({ state, sync }) => {
    const color =
        state === 'streaming' ? THEME.success :
        state === 'catchup' ? THEME.warning : THEME.danger;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-bold"
            style={{
                background: `${color}15`,
                color,
                border: `1px solid ${color}30`
            }}>
            {state === 'streaming' && (
                <span className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{
                        background: color,
                        animation: 'pulse 1.5s infinite',
                        opacity: 1
                    }} />
            )}
            {state || '—'}
            {sync && ` · ${sync}`}
        </span>
    );
};

interface MetricCardProps {
    icon: LucideIcon;
    label: string;
    value: ReactNode;
    sub?: ReactNode;
    color?: string;
    warn?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
    icon: Icon,
    label,
    value,
    sub,
    color = THEME.primary,
    warn
}) => (
    <div className="flex items-center gap-3.5 p-5 rounded-lg border"
        style={{
            background: THEME.surface,
            borderColor: warn ? `${THEME.warning}40` : THEME.grid
        }}>
        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg"
            style={{ background: `${color}15` }}>
            <Icon size={20} color={color} />
        </div>
        <div>
            <div className="text-2xl font-black leading-none" style={{ color: THEME.textMain }}>
                {value}
            </div>
            <div className="text-xs font-semibold uppercase tracking-widest mt-0.5"
                style={{ color: THEME.textMuted }}>
                {label}
            </div>
            {sub && (
                <div className="text-xs mt-0.5"
                    style={{ color: warn ? THEME.warning : THEME.textDim }}>
                    {sub}
                </div>
            )}
        </div>
    </div>
);

interface ChartTipProps extends TooltipProps<number, string> {
    active?: boolean;
    payload?: Array<{ name: string; value: number; fill: string }>;
    label?: string;
}

const ChartTip: React.FC<ChartTipProps> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border p-3"
            style={{
                background: THEME.surface,
                border: `1px solid ${THEME.grid}`
            }}>
            <div className="text-xs mb-1" style={{ color: THEME.textMuted }}>
                {label}
            </div>
            {payload.map(p => (
                <div key={p.name} className="font-semibold text-xs" style={{ color: p.fill }}>
                    {p.name}: {fmtBytes(p.value)}
                </div>
            ))}
        </div>
    );
};

interface StylesProps { }

const Styles: React.FC<StylesProps> = () => (
    <style>{`
        @keyframes rwSpin  { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes rwFade  { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes rwPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.35 } }
        .rw-card {
            background: ${THEME.surface};
            border: 1px solid ${THEME.grid};
            border-radius: 12px;
            padding: 20px;
            animation: rwFade 0.3s ease;
        }
        .rw-metric {
            background: ${THEME.surface};
            border: 1px solid ${THEME.grid};
            border-radius: 10px;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .rw-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 9px 0;
            border-bottom: 1px solid ${THEME.grid}30;
            font-size: 12px;
        }
        .rw-row:last-child { border-bottom: none; }
        .rw-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 5px;
            font-size: 10px;
            font-weight: 700;
        }
        .rw-table-head {
            display: grid;
            gap: 8px;
            padding: 8px 14px;
            font-size: 10px;
            font-weight: 700;
            color: ${THEME.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid ${THEME.grid};
        }
        .rw-table-row {
            display: grid;
            gap: 8px;
            padding: 11px 14px;
            font-size: 12px;
            border-bottom: 1px solid ${THEME.grid}20;
            align-items: center;
        }
        .rw-table-row:hover { background: ${THEME.primary}05; }
        .rw-table-row:last-child { border-bottom: none; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   REPLICATION & WAL TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const ReplicationWALTab: React.FC = () => {
    useAdaptiveTheme();
    const [data, setData] = useState<ReplicationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastAt, setLastAt] = useState<number | null>(null);
    const [autoRfsh, setAutoRfsh] = useState(10);
    const [activeTab, setActiveTab] = useState<'replicas' | 'slots' | 'wal'>('replicas');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const load = useCallback(async (initial = false) => {
        if (!initial) setRefreshing(true);
        try {
            const d = await fetchData('/api/replication/status') as ReplicationData;
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

    useEffect(() => { load(true); }, [load]);
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (autoRfsh > 0) intervalRef.current = setInterval(() => load(false), autoRfsh * 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [autoRfsh, load]);

    const replicas = data?.replicas || [];
    const slots = data?.slots || [];
    const walReceiver = data?.walReceiver || null;
    const walSender = data?.walSender || { replica_count: 0 };
    const settings = data?.settings || [];

    const inRecovery = walSender.in_recovery;
    const replicaCount = Number(walSender.replica_count) || 0;
    const maxLagBytes = replicas.length ? Math.max(...replicas.map(r => Number(r.total_lag_bytes) || 0)) : 0;
    const maxLagSec = replicas.length ? Math.max(...replicas.map(r => Number(r.replay_lag_sec) || 0)) : 0;
    const lagWarn = maxLagBytes > 104857600; // 100 MB
    const inactiveSlots = slots.filter(s => !s.active).length;

    const lagChart: ChartDataPoint[] = replicas.map(r => ({
        name: r.application_name || r.client_addr || 'replica',
        write: Number(r.write_lag_bytes) || 0,
        flush: Number(r.flush_lag_bytes) || 0,
        replay: Number(r.replay_lag_bytes) || 0,
    }));

    if (loading) return (
        <div className="flex items-center justify-center h-75" style={{ color: THEME.textMuted }}>
            <RefreshCw size={24} style={{ animation: 'rwSpin 1s linear infinite', marginRight: 10 }} />
            Loading replication status…
        </div>
    );

    return (
        <div className="flex flex-col gap-5">
            <Styles />

            {/* Toolbar */}
            <div className="flex justify-between items-center p-5 rounded-lg border"
                style={{
                    background: THEME.surface,
                    borderColor: THEME.grid
                }}>
                <div className="flex items-center gap-3">
                    <Radio size={20} color={THEME.primary} />
                    <span className="font-bold text-base" style={{ color: THEME.textMain }}>
                        Replication & WAL
                    </span>
                    <span className="rw-badge"
                        style={{
                            background: inRecovery ? `${THEME.warning}15` : `${THEME.success}15`,
                            color: inRecovery ? THEME.warning : THEME.success,
                            border: `1px solid ${inRecovery ? THEME.warning : THEME.success}30`,
                            fontSize: 11
                        }}>
                        {inRecovery ? <WifiOff size={10} /> : <Wifi size={10} />}
                        {inRecovery ? 'REPLICA' : 'PRIMARY'}
                    </span>
                    {lagWarn && (
                        <span className="rw-badge"
                            style={{
                                background: `${THEME.danger}15`,
                                color: THEME.danger,
                                border: `1px solid ${THEME.danger}30`,
                                fontSize: 11
                            }}>
                            <AlertTriangle size={10} /> High Lag
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="text-xs" style={{ color: THEME.textDim }}>
                        {lastAt ? `Updated ${fmtRel(lastAt)}` : ''}
                    </span>
                    <select value={autoRfsh} onChange={e => setAutoRfsh(+e.target.value)}
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{
                            background: THEME.surface,
                            border: `1px solid ${THEME.grid}`,
                            color: THEME.textMain
                        }}>
                        <option value={5}>5s</option>
                        <option value={10}>10s</option>
                        <option value={30}>30s</option>
                        <option value={0}>Off</option>
                    </select>
                    <button onClick={() => load(false)} disabled={refreshing}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold"
                        style={{
                            background: `${THEME.primary}10`,
                            border: `1px solid ${THEME.primary}40`,
                            color: THEME.primary,
                            cursor: 'pointer'
                        }}>
                        <RefreshCw size={13}
                            style={{ animation: refreshing ? 'rwSpin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-lg border"
                    style={{
                        padding: 14,
                        background: `${THEME.danger}10`,
                        border: `1px solid ${THEME.danger}30`,
                        color: THEME.danger,
                        fontSize: 13
                    }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Metric cards */}
            <div className="grid grid-cols-4 gap-3.5">
                <MetricCard icon={Server} label="Streaming Replicas" value={replicaCount}
                    sub={replicaCount === 0 ? 'No replicas connected' : 'Active connections'}
                    color={replicaCount > 0 ? THEME.success : THEME.textDim} />
                <MetricCard icon={Activity} label="Max Replay Lag" value={fmtLag(maxLagSec)}
                    sub={fmtBytes(maxLagBytes)}
                    color={lagWarn ? THEME.danger : THEME.success}
                    warn={lagWarn} />
                <MetricCard icon={Layers} label="Replication Slots" value={slots.length}
                    sub={inactiveSlots > 0 ? `⚠ ${inactiveSlots} inactive` : 'All active'}
                    color={inactiveSlots > 0 ? THEME.warning : THEME.primary} />
                <MetricCard icon={Database} label="Current WAL File"
                    value={walSender.current_wal?.slice(-8) || '—'}
                    sub={walSender.current_lsn || '—'}
                    color={THEME.secondary} />
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1.5">
                {[
                    { id: 'replicas' as const, label: 'Streaming Replicas', icon: Radio },
                    { id: 'slots' as const, label: 'Replication Slots', icon: Layers },
                    { id: 'wal' as const, label: 'WAL Settings', icon: Zap }
                ].map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        className="inline-flex items-center gap-1.75 px-4 py-2 rounded-lg border font-semibold text-xs"
                        style={{
                            borderColor: activeTab === id ? THEME.primary : THEME.grid,
                            background: activeTab === id ? `${THEME.primary}12` : 'transparent',
                            color: activeTab === id ? THEME.primary : THEME.textMuted,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {/* Streaming Replicas tab */}
            {activeTab === 'replicas' && (
                <>
                    {replicas.length === 0 ? (
                        <div className="rw-card text-center p-10" style={{ background: THEME.surface }}>
                            <WifiOff size={40} style={{ opacity: 0.3, margin: '0 auto 12px', color: THEME.textDim }} />
                            <div className="font-semibold" style={{ color: THEME.textMuted }}>
                                No streaming replicas connected
                            </div>
                            <div className="text-xs mt-1.5" style={{ color: THEME.textDim }}>
                                {inRecovery
                                    ? 'This server is a replica — check the primary for replication status.'
                                    : 'Set wal_level=replica and configure max_wal_senders > 0 to enable streaming replication.'
                                }
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Lag chart */}
                            <div className="rw-card" style={{ background: THEME.surface }}>
                                <div className="flex items-center gap-2 mb-4 font-bold text-xs"
                                    style={{ color: THEME.textMain }}>
                                    <Activity size={15} color={THEME.primary} />
                                    Replication Lag by Replica
                                </div>
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={lagChart} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barGap={2}>
                                        <XAxis dataKey="name"
                                            tick={{ fontSize: 11, fill: THEME.textDim }}
                                            tickLine={false} axisLine={false} />
                                        <YAxis tickFormatter={fmtBytes}
                                            tick={{ fontSize: 10, fill: THEME.textDim }}
                                            tickLine={false} axisLine={false} width={60} />
                                        <Tooltip content={<ChartTip />} />
                                        <Bar dataKey="write" name="Write Lag" fill={THEME.primary} radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="flush" name="Flush Lag" fill={THEME.secondary} radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="replay" name="Replay Lag" fill={THEME.warning} radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="flex gap-4 mt-1.5">
                                    {[
                                        { c: THEME.primary, l: 'Write' },
                                        { c: THEME.secondary, l: 'Flush' },
                                        { c: THEME.warning, l: 'Replay' }
                                    ].map(({ c, l }) => (
                                        <div key={l} className="flex items-center gap-1.25 text-xs"
                                            style={{ color: THEME.textMuted }}>
                                            <div className="w-2.5 h-0.75 rounded"
                                                style={{ background: c }} />
                                            {l} Lag
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Replica detail table */}
                            <div className="rw-card p-0" style={{ background: THEME.surface }}>
                                <div className="flex items-center gap-2 p-3.5 border-b font-bold text-xs"
                                    style={{
                                        borderColor: THEME.grid,
                                        color: THEME.textMain
                                    }}>
                                    <Radio size={15} color={THEME.primary} />
                                    Replica Details
                                </div>
                                <div className="rw-table-head" style={{
                                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr'
                                }}>
                                    <span>Application</span>
                                    <span>Client</span>
                                    <span>State</span>
                                    <span>Write Lag</span>
                                    <span>Flush Lag</span>
                                    <span>Replay Lag</span>
                                </div>
                                {replicas.map((r, i) => (
                                    <div key={i} className="rw-table-row" style={{
                                        gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr'
                                    }}>
                                        <div>
                                            <div className="font-bold" style={{ color: THEME.textMain }}>
                                                {r.application_name || '—'}
                                            </div>
                                            <div className="text-xs mt-0.5" style={{ color: THEME.textDim }}>
                                                {r.reply_time ? `Last reply ${fmtDate(r.reply_time)}` : ''}
                                            </div>
                                        </div>
                                        <span style={{ fontFamily: 'monospace', color: THEME.textMuted }}>
                                            {r.client_addr || '—'}
                                        </span>
                                        <StateBadge state={r.state} sync={r.sync_state} />
                                        <span style={{ fontFamily: 'monospace', color: THEME.textMain }}>
                                            {fmtBytes(r.write_lag_bytes)}
                                        </span>
                                        <span style={{ fontFamily: 'monospace', color: THEME.textMain }}>
                                            {fmtBytes(r.flush_lag_bytes)}
                                        </span>
                                        <span style={{
                                            fontFamily: 'monospace',
                                            color: Number(r.replay_lag_bytes) > 104857600 ? THEME.danger : THEME.textMain,
                                            fontWeight: Number(r.replay_lag_bytes) > 104857600 ? 700 : 400
                                        }}>
                                            {fmtBytes(r.replay_lag_bytes)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* WAL Receiver panel */}
                    {walReceiver && (
                        <div className="rw-card" style={{
                            background: THEME.surface,
                            borderColor: `${THEME.warning}30`
                        }}>
                            <div className="flex items-center gap-2 mb-3.5 font-bold text-xs"
                                style={{ color: THEME.warning }}>
                                <Wifi size={15} />
                                WAL Receiver Status (This server is a replica)
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                {[
                                    { label: 'Status', value: walReceiver.status },
                                    { label: 'Sender Host', value: `${walReceiver.sender_host}:${walReceiver.sender_port}` },
                                    { label: 'Slot Name', value: walReceiver.slot_name || '—' },
                                    { label: 'Last Msg Sent', value: fmtDate(walReceiver.last_msg_send_time) },
                                    { label: 'Last Msg Recv', value: fmtDate(walReceiver.last_msg_receipt_time) },
                                    { label: 'Latest LSN', value: walReceiver.latest_end_lsn },
                                ].map(({ label, value }) => (
                                    <div key={label} className="rw-row">
                                        <span style={{ color: THEME.textMuted }}>{label}</span>
                                        <span style={{
                                            fontFamily: 'monospace',
                                            color: THEME.textMain,
                                            fontWeight: 600,
                                            fontSize: 11
                                        }}>
                                            {value || '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Replication Slots tab */}
            {activeTab === 'slots' && (
                <div className="rw-card p-0" style={{ background: THEME.surface }}>
                    <div className="flex items-center gap-2 p-3.5 border-b font-bold text-xs"
                        style={{
                            borderColor: THEME.grid,
                            color: THEME.textMain
                        }}>
                        <Layers size={15} color={THEME.primary} />
                        Replication Slots
                        {inactiveSlots > 0 && (
                            <span className="rw-badge ml-auto"
                                style={{
                                    background: `${THEME.danger}15`,
                                    color: THEME.danger,
                                    border: `1px solid ${THEME.danger}30`
                                }}>
                                <AlertTriangle size={9} /> {inactiveSlots} inactive — may cause WAL accumulation
                            </span>
                        )}
                    </div>
                    {slots.length === 0 ? (
                        <div className="p-10 text-center text-xs"
                            style={{ color: THEME.textDim }}>
                            No replication slots configured.
                        </div>
                    ) : (
                        <>
                            <div className="rw-table-head" style={{
                                gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr'
                            }}>
                                <span>Slot Name</span>
                                <span>Type</span>
                                <span>Active</span>
                                <span>Lag</span>
                                <span>WAL Status</span>
                            </div>
                            {slots.map((s, i) => (
                                <div key={i} className="rw-table-row" style={{
                                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr'
                                }}>
                                    <div>
                                        <div className="font-bold" style={{ color: THEME.textMain }}>
                                            {s.slot_name}
                                        </div>
                                        <div className="text-xs" style={{ color: THEME.textDim }}>
                                            {s.plugin || 'physical'} · {s.database || 'global'}
                                        </div>
                                    </div>
                                    <span style={{
                                        color: THEME.textMuted,
                                        textTransform: 'capitalize'
                                    }}>
                                        {s.slot_type}
                                    </span>
                                    <span className="flex items-center gap-1.25 font-bold"
                                        style={{ color: s.active ? THEME.success : THEME.danger }}>
                                        {s.active ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                        {s.active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span style={{
                                        fontFamily: 'monospace',
                                        color: Number(s.lag_bytes) > 104857600 ? THEME.danger : THEME.textMain,
                                        fontWeight: Number(s.lag_bytes) > 104857600 ? 700 : 400
                                    }}>
                                        {s.lag_pretty || '—'}
                                    </span>
                                    <span style={{
                                        color: s.wal_status === 'reserved' ? THEME.success :
                                            s.wal_status === 'extended' ? THEME.warning : THEME.danger,
                                        fontWeight: 600,
                                        textTransform: 'capitalize'
                                    }}>
                                        {s.wal_status || '—'}
                                    </span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* WAL Settings tab */}
            {activeTab === 'wal' && (
                <div className="grid grid-cols-2 gap-5">
                    <div className="rw-card" style={{ background: THEME.surface }}>
                        <div className="flex items-center gap-2 mb-3.5 font-bold text-xs"
                            style={{ color: THEME.textMain }}>
                            <Zap size={15} color={THEME.secondary} />
                            WAL Configuration
                        </div>
                        {settings.map(s => (
                            <div key={s.name} className="rw-row">
                                <span style={{ color: THEME.textMuted }}>{s.name}</span>
                                <span style={{
                                    fontFamily: 'monospace',
                                    color: THEME.textMain,
                                    fontWeight: 600,
                                    fontSize: 11
                                }}>
                                    {s.setting}{s.unit ? ` ${s.unit}` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="rw-card" style={{
                        background: THEME.surface,
                        borderColor: `${THEME.primary}30`
                    }}>
                        <div className="flex items-center gap-2 mb-3 font-bold text-xs"
                            style={{ color: THEME.primary }}>
                            <CheckCircle size={15} />
                            Replication Health Checklist
                        </div>
                        {[
                            {
                                label: 'WAL level is replica or logical',
                                ok: ['replica', 'logical'].includes(settings.find(s => s.name === 'wal_level')?.setting || '')
                            },
                            {
                                label: 'max_wal_senders > 0',
                                ok: parseInt(settings.find(s => s.name === 'max_wal_senders')?.setting || '0') > 0
                            },
                            {
                                label: 'max_replication_slots > 0',
                                ok: parseInt(settings.find(s => s.name === 'max_replication_slots')?.setting || '0') > 0
                            },
                            { label: 'No inactive replication slots', ok: inactiveSlots === 0 },
                            {
                                label: 'All replicas streaming (not catchup)',
                                ok: replicas.every(r => r.state === 'streaming')
                            },
                            { label: 'Replay lag < 100 MB', ok: maxLagBytes < 104857600 },
                        ].map(({ label, ok }) => (
                            <div key={label} className="flex items-center gap-2 py-2 border-b text-xs"
                                style={{ borderColor: `${THEME.grid}20` }}>
                                {ok
                                    ? <CheckCircle size={14} color={THEME.success} />
                                    : <AlertTriangle size={14} color={THEME.warning} />
                                }
                                <span style={{ color: ok ? THEME.textMain : THEME.textMuted }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReplicationWALTab;
