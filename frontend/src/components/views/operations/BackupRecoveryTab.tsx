import React, { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { fetchData } from '../../../utils/api';
import {
    Archive, CheckCircle, AlertTriangle, RefreshCw, Clock, Database,
    Wifi, WifiOff, HardDrive, Shield, Radio, FileCheck, AlertCircle,
    type LucideIcon
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface ArchiverStatus {
    archived_count?: number;
    failed_count?: number | string;
    last_archived_time?: string;
    last_failed_time?: string;
    last_archived_wal?: string;
    last_failed_wal?: string;
    stats_reset?: string;
}

interface WALStatus {
    in_recovery?: boolean;
    current_lsn?: string;
    current_wal?: string;
    started_at?: string;
}

interface DBSetting {
    name: string;
    setting: string;
    unit?: string;
}

interface BackupData {
    archiver: ArchiverStatus;
    wal: WALStatus;
    settings: DBSetting[];
}

/* ─── Formatting Helpers ────────────────────────────────────────────────── */
const fmtDate = (d: string | null | undefined): string =>
    d ? new Date(d).toLocaleString() : '—';

const fmtRelative = (d: string | null | undefined): string => {
    if (!d) return '—';
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
};

/* ─── Components ────────────────────────────────────────────────────────── */
interface HealthBadgeProps {
    ok: boolean;
    label: string;
}

const HealthBadge: React.FC<HealthBadgeProps> = ({ ok, label }) => (
    <span className="inline-flex items-center gap-1.25 px-2.5 py-1.5 rounded-md font-bold text-xs"
        style={{
            background: ok ? `${THEME.success}15` : `${THEME.danger}15`,
            color: ok ? THEME.success : THEME.danger,
            border: `1px solid ${ok ? THEME.success : THEME.danger}30`
        }}>
        {ok ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
        {label}
    </span>
);

interface MetricCardProps {
    icon: LucideIcon;
    label: string;
    value: ReactNode;
    sub?: ReactNode;
    color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
    icon: Icon,
    label,
    value,
    sub,
    color = THEME.primary
}) => (
    <div className="flex items-center gap-3.5 p-5 rounded-lg border"
        style={{
            background: THEME.surface,
            borderColor: THEME.grid
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
                <div className="text-xs mt-0.5" style={{ color: THEME.textDim }}>
                    {sub}
                </div>
            )}
        </div>
    </div>
);

interface StylesProps { }

const Styles: React.FC<StylesProps> = () => (
    <style>{`
        @keyframes brSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes brFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes brPulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
        .br-card {
            background: ${THEME.surface};
            border: 1px solid ${THEME.grid};
            border-radius: 12px;
            padding: 20px;
            animation: brFade 0.3s ease;
        }
        .br-metric {
            background: ${THEME.surface};
            border: 1px solid ${THEME.grid};
            border-radius: 10px;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .br-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
        }
        .br-setting-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid ${THEME.grid}40;
            font-size: 13px;
        }
        .br-setting-row:last-child { border-bottom: none; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   BACKUP & RECOVERY TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const BackupRecoveryTab: React.FC = () => {
    useAdaptiveTheme();
    const [data, setData] = useState<BackupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastAt, setLastAt] = useState<number | null>(null);
    const [interval, setInterval_] = useState(30);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const load = useCallback(async (initial = false) => {
        if (!initial) setRefreshing(true);
        try {
            const d = await fetchData('/api/backup/status') as BackupData;
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
        if (interval > 0) intervalRef.current = setInterval(() => load(false), interval * 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [interval, load]);

    /* ── Derived values ────────────────────────────────────────────────── */
    const archiver = data?.archiver || {};
    const wal = data?.wal || {};
    const settings = data?.settings || [];

    const archiveEnabled = settings.find(s => s.name === 'archive_mode')?.setting === 'on';
    const walLevel = settings.find(s => s.name === 'wal_level')?.setting || '—';
    const archiveCmd = settings.find(s => s.name === 'archive_command')?.setting || '(none)';
    const maxWalSenders = settings.find(s => s.name === 'max_wal_senders')?.setting || '0';
    const replicationOk = parseInt(maxWalSenders) > 0;
    const archiveHealthy = archiver.failed_count === 0 || archiver.failed_count === '0';
    const inRecovery = wal.in_recovery;

    const settingLabel: Record<string, string> = {
        archive_mode: 'Archive Mode',
        archive_command: 'Archive Command',
        wal_level: 'WAL Level',
        restore_command: 'Restore Command',
        recovery_target_timeline: 'Recovery Target Timeline',
        max_wal_senders: 'Max WAL Senders',
        wal_keep_size: 'WAL Keep Size (MB)',
    };

    if (loading) return (
        <div className="flex items-center justify-center h-75" style={{ color: THEME.textMuted }}>
            <RefreshCw size={24} style={{ animation: 'brSpin 1s linear infinite', marginRight: 10 }} />
            Loading backup status…
        </div>
    );

    return (
        <div className="flex flex-col gap-5">
            <Styles />

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="flex justify-between items-center p-5 rounded-lg border"
                style={{
                    background: THEME.surface,
                    borderColor: THEME.grid
                }}>
                <div className="flex items-center gap-3">
                    <Archive size={20} color={THEME.primary} />
                    <span className="font-bold text-base" style={{ color: THEME.textMain }}>
                        Backup & Recovery
                    </span>
                    {inRecovery && (
                        <span className="br-badge"
                            style={{
                                background: `${THEME.warning}15`,
                                color: THEME.warning,
                                border: `1px solid ${THEME.warning}30`
                            }}>
                            <Radio size={10} /> REPLICA / RECOVERY MODE
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="text-xs" style={{ color: THEME.textDim }}>
                        {lastAt ? `Updated ${fmtRelative(new Date(lastAt).toISOString())}` : ''}
                    </span>
                    <select value={interval} onChange={e => setInterval_(+e.target.value)}
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{
                            background: THEME.surface,
                            border: `1px solid ${THEME.grid}`,
                            color: THEME.textMain
                        }}>
                        <option value={10}>10s</option>
                        <option value={30}>30s</option>
                        <option value={60}>1m</option>
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
                            style={{ animation: refreshing ? 'brSpin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3.5 rounded-lg border"
                    style={{
                        background: `${THEME.danger}10`,
                        border: `1px solid ${THEME.danger}30`,
                        color: THEME.danger,
                        fontSize: 13
                    }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* ── Metric cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-3.5">
                <MetricCard icon={FileCheck} label="WAL Files Archived"
                    value={archiver.archived_count ?? '—'}
                    sub={`Last: ${fmtRelative(archiver.last_archived_time)}`}
                    color={THEME.success} />
                <MetricCard icon={AlertTriangle} label="Archive Failures"
                    value={archiver.failed_count ?? '—'}
                    sub={archiver.last_failed_time
                        ? `Last fail: ${fmtRelative(archiver.last_failed_time)}`
                        : 'No failures'}
                    color={parseInt(String(archiver.failed_count)) > 0 ? THEME.danger : THEME.success} />
                <MetricCard icon={Database} label="WAL Level"
                    value={walLevel.toUpperCase()}
                    sub={`Senders: ${maxWalSenders}`}
                    color={THEME.primary} />
                <MetricCard icon={Shield} label="Server Role"
                    value={inRecovery ? 'Replica' : 'Primary'}
                    sub={inRecovery ? 'In recovery mode' : 'Read-write primary'}
                    color={inRecovery ? THEME.warning : THEME.secondary} />
            </div>

            {/* ── Main grid ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-5">

                {/* WAL Archiving Status */}
                <div className="br-card">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 font-bold text-xs"
                            style={{ color: THEME.textMain }}>
                            <Archive size={15} color={THEME.primary} />
                            WAL Archiving
                        </div>
                        <HealthBadge ok={archiveEnabled && archiveHealthy}
                            label={archiveEnabled
                                ? (archiveHealthy ? 'Healthy' : 'Failures Detected')
                                : 'Disabled'} />
                    </div>

                    <div className="flex flex-col">
                        {[
                            { label: 'Archive Mode', value: archiveEnabled ? 'Enabled' : 'Disabled' },
                            { label: 'Total Archived', value: `${archiver.archived_count ?? 0} WAL files` },
                            { label: 'Last Archived WAL', value: archiver.last_archived_wal || '—' },
                            { label: 'Last Archive Time', value: fmtDate(archiver.last_archived_time) },
                            { label: 'Failed Archives', value: archiver.failed_count ?? 0 },
                            { label: 'Last Failed WAL', value: archiver.last_failed_wal || '—' },
                            { label: 'Stats Reset', value: fmtDate(archiver.stats_reset) },
                        ].map(({ label, value }) => (
                            <div key={label} className="br-setting-row">
                                <span style={{ color: THEME.textMuted }}>{label}</span>
                                <span className="font-semibold max-w-55 truncate"
                                    style={{
                                        color: THEME.textMain,
                                        fontFamily: 'monospace',
                                        fontSize: 12
                                    }}>
                                    {String(value)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {!archiveEnabled && (
                        <div className="mt-4 p-3 rounded-lg text-xs"
                            style={{
                                background: `${THEME.warning}10`,
                                border: `1px solid ${THEME.warning}30`,
                                color: THEME.warning
                            }}>
                            ⚠ WAL archiving is disabled. Set <code style={{ fontFamily: 'monospace' }}>archive_mode = on</code> in postgresql.conf to enable point-in-time recovery.
                        </div>
                    )}
                    {parseInt(String(archiver.failed_count)) > 0 && (
                        <div className="mt-3 p-3 rounded-lg text-xs"
                            style={{
                                background: `${THEME.danger}10`,
                                border: `1px solid ${THEME.danger}30`,
                                color: THEME.danger
                            }}>
                            ❌ Archive failures detected. Last failed: <strong>{archiver.last_failed_wal}</strong> at {fmtDate(archiver.last_failed_time)}
                        </div>
                    )}
                </div>

                {/* Current WAL Position */}
                <div className="br-card">
                    <div className="flex items-center gap-2 mb-4 font-bold text-xs"
                        style={{ color: THEME.textMain }}>
                        <HardDrive size={15} color={THEME.secondary} />
                        Current WAL Position
                    </div>

                    <div className="flex flex-col">
                        {[
                            { label: 'Current LSN', value: wal.current_lsn || '—' },
                            { label: 'Current WAL File', value: wal.current_wal || '—' },
                            { label: 'Server Started', value: fmtDate(wal.started_at) },
                        ].map(({ label, value }) => (
                            <div key={label} className="br-setting-row">
                                <span style={{ color: THEME.textMuted }}>{label}</span>
                                <span className="font-semibold"
                                    style={{
                                        color: THEME.textMain,
                                        fontFamily: 'monospace',
                                        fontSize: 12
                                    }}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Replication readiness */}
                    <div className="mt-5">
                        <div className="text-xs font-bold uppercase tracking-wide mb-2.5"
                            style={{ color: THEME.textMuted }}>
                            Replication Readiness
                        </div>
                        <div className="flex flex-col gap-2">
                            {[
                                { label: 'WAL Level ≥ replica', ok: ['replica', 'logical'].includes(walLevel) },
                                { label: 'Archive mode enabled', ok: archiveEnabled },
                                { label: 'max_wal_senders > 0', ok: replicationOk },
                                { label: 'No archive failures', ok: archiveHealthy },
                            ].map(({ label, ok }) => (
                                <div key={label} className="flex items-center gap-2 text-xs">
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
                </div>
            </div>

            {/* ── Configuration settings ────────────────────────────────── */}
            <div className="br-card">
                <div className="flex items-center gap-2 mb-4 font-bold text-xs"
                    style={{ color: THEME.textMain }}>
                    <Shield size={15} color={THEME.primary} />
                    Backup-Relevant Configuration
                </div>
                <div className="grid grid-cols-2 gap-8">
                    {settings.map(s => (
                        <div key={s.name} className="br-setting-row">
                            <span className="text-xs" style={{ color: THEME.textMuted }}>
                                {settingLabel[s.name] || s.name}
                            </span>
                            <span className="font-semibold max-w-50 truncate text-xs"
                                style={{
                                    fontFamily: 'monospace',
                                    color: THEME.textMain
                                }}>
                                {s.setting || '—'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Guidance panel ────────────────────────────────────────── */}
            <div className="br-card"
                style={{ borderColor: `${THEME.primary}30` }}>
                <div className="flex items-center gap-2 mb-3 font-bold text-xs"
                    style={{ color: THEME.primary }}>
                    <CheckCircle size={15} />
                    Backup Best Practices
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                    {[
                        { title: 'pg_basebackup', desc: 'Use pg_basebackup for physical full backups. Schedule nightly off-peak.' },
                        { title: 'WAL Archiving', desc: 'Enable archive_mode=on and configure archive_command to copy WAL to secure storage.' },
                        { title: 'PITR Testing', desc: 'Regularly test point-in-time recovery to verify backups are restorable.' },
                        { title: 'Retention Policy', desc: 'Keep at least 7 daily + 4 weekly + 12 monthly backups following a 3-2-1 rule.' },
                    ].map(({ title, desc }) => (
                        <div key={title} className="p-3.5 rounded-lg border text-xs"
                            style={{
                                background: `${THEME.bg}80`,
                                borderColor: THEME.grid
                            }}>
                            <div className="font-bold mb-1" style={{ color: THEME.primary }}>
                                {title}
                            </div>
                            <div style={{
                                color: THEME.textMuted,
                                lineHeight: 1.5
                            }}>
                                {desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BackupRecoveryTab;
