/**
 * OverviewTabLight.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reimagined Database Overview based on the static mockup at
 * `uploads/Database Overview.html`. The mockup is dark; this implementation
 * uses the shared THEME tokens so it automatically inverts to a light palette
 * when the user toggles light mode in the theme switcher (see
 * `utils/theme.tsx` — useAdaptiveTheme).
 *
 * Layout mirrors the mockup section-by-section:
 *   1. Header strip   — title + connection name + live status pill
 *   2. KPI band       — 7 compact metric cards (size, conns, cache hit,
 *                       tx/s, rollback %, slow queries, deadlocks)
 *   3. Two-column     — Throughput · 1h chart (left, 2/3)
 *                       Active sessions list (right, 1/3)
 *   4. Long-running transactions table
 *   5. Two-column     — Replication panel + Top tables by size
 *   6. Backup & PITR  — 4-tile horizontal strip
 *
 * Data sources are unchanged from OverviewTab.tsx — same `/api/overview/*`
 * endpoints, same fetch + cache helpers. The intent here is purely visual
 * + structural: better hierarchy, fewer overlapping charts, table-first
 * layout for at-a-glance scanning.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { THEME, useAdaptiveTheme, useGlobalRefresh } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import { useConnection } from '../../../context/ConnectionContext';
import { useNavigation } from '../../../context/NavigationContext';
import { fmtNum } from '../../../lib/utils';

import {
    Activity, AlertCircle, AlertTriangle, ArrowDown, ArrowUp, Clock,
    Database, HardDrive, RefreshCw, Server, Zap,
} from 'lucide-react';

import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

import { PanelCard, KpiCard, StatusBadge, LiveDot, ChartTooltip, TremorStyles } from '../../ui/tremor';

/* ════════════════════════════════════════════════════════════════════════════
   Small inline helpers
   ════════════════════════════════════════════════════════════════════════════ */

const fmtRelTime = (iso: string | null | undefined): string => {
    if (!iso) return 'never';
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return 'never';
    const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

/* ════════════════════════════════════════════════════════════════════════════
   KPI BAND — 7 compact cards matching the mockup row
   ════════════════════════════════════════════════════════════════════════════ */

interface KpiTile {
    label: string;
    value: string;
    sub: string;
    tone: 'normal' | 'success' | 'warning' | 'danger';
}

const KpiBand = React.memo(({ tiles }: { tiles: KpiTile[] }) => {
    const toneColor = (t: KpiTile['tone']) => ({
        normal:  THEME.textMain,
        success: THEME.success,
        warning: THEME.warning,
        danger:  THEME.danger,
    }[t]);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${tiles.length}, 1fr)`,
            gap: 10,
        }}>
            {tiles.map((t) => (
                <div key={t.label} style={{
                    background: THEME.surface,
                    border: `1px solid ${THEME.glassBorder}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}>
                    <span style={{
                        fontSize: 10, fontWeight: 600, color: THEME.textMuted,
                        fontFamily: THEME.fontMono, letterSpacing: '0.04em',
                    }}>
                        {t.label}
                    </span>
                    <span style={{
                        fontSize: 21, fontWeight: 700, color: toneColor(t.tone),
                        fontFamily: THEME.fontMono, lineHeight: 1.1,
                    }}>
                        {t.value}
                    </span>
                    <span style={{
                        fontSize: 10.5, color: THEME.textDim,
                        fontFamily: THEME.fontMono,
                    }}>
                        {t.sub}
                    </span>
                </div>
            ))}
        </div>
    );
});
KpiBand.displayName = 'KpiBand';

/* ════════════════════════════════════════════════════════════════════════════
   THROUGHPUT PANEL — area chart + sub-stats grid
   ════════════════════════════════════════════════════════════════════════════ */

const ThroughputPanel = React.memo(({ chartData, traffic }: { chartData: any[]; traffic: any }) => {
    const fetched  = Number(traffic?.tup_fetched  || 0);
    const inserted = Number(traffic?.tup_inserted || 0);
    const updated  = Number(traffic?.tup_updated  || 0);
    const deleted  = Number(traffic?.tup_deleted  || 0);

    const subStats = [
        { label: 'Tuples fetched',   value: fmtNum(fetched),  sub: 'reads · 1h',      tone: THEME.textMain },
        { label: 'Tuples inserted',  value: fmtNum(inserted), sub: '↑ writes',        tone: THEME.success },
        { label: 'Tuples updated',   value: fmtNum(updated),  sub: '↑ writes',        tone: THEME.warning },
        { label: 'Tuples deleted',   value: fmtNum(deleted),  sub: 'vacuum target',   tone: THEME.danger },
    ];

    const hasChartData = Array.isArray(chartData) && chartData.length > 0;

    return (
        <PanelCard title="Throughput · 1h" icon={Activity}>
            <div style={{ height: 160, marginBottom: 14 }}>
                {hasChartData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 4, right: 6, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="ovl-reads" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%"   stopColor={THEME.primary} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="ovl-writes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%"   stopColor={THEME.success} stopOpacity={0.30} />
                                    <stop offset="100%" stopColor={THEME.success} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke={THEME.glassBorder} strokeDasharray="2 4" vertical={false} />
                            <XAxis dataKey="t" tick={{ fill: THEME.textDim, fontSize: 9, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: THEME.textDim, fontSize: 9, fontFamily: THEME.fontMono }} axisLine={false} tickLine={false} width={28} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="reads"  stroke={THEME.primary} fill="url(#ovl-reads)"  strokeWidth={1.5} />
                            <Area type="monotone" dataKey="writes" stroke={THEME.success} fill="url(#ovl-writes)" strokeWidth={1.5} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{
                        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontMono,
                    }}>
                        No timeseries data — /api/overview/timeseries returned empty
                    </div>
                )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {subStats.map((s) => (
                    <div key={s.label}>
                        <div style={{
                            fontSize: 10, fontWeight: 600, color: THEME.textMuted,
                            fontFamily: THEME.fontMono, letterSpacing: '0.04em',
                        }}>
                            {s.label}
                        </div>
                        <div style={{
                            fontSize: 16, fontWeight: 700, color: s.tone,
                            fontFamily: THEME.fontMono, lineHeight: 1.2, marginTop: 2,
                        }}>
                            {s.value}
                        </div>
                        <div style={{
                            fontSize: 10.5, color: THEME.textDim, fontFamily: THEME.fontMono,
                            marginTop: 2,
                        }}>
                            {s.sub}
                        </div>
                    </div>
                ))}
            </div>
        </PanelCard>
    );
});
ThroughputPanel.displayName = 'ThroughputPanel';

/* ════════════════════════════════════════════════════════════════════════════
   ACTIVE SESSIONS — list of currently-running queries
   ════════════════════════════════════════════════════════════════════════════ */

const ActiveSessions = React.memo(({ sessions, activeCount, waitCount }: {
    sessions: any[]; activeCount: number; waitCount: number;
}) => {
    return (
        <PanelCard
            title="Active sessions"
            icon={Activity}
            actions={
                <div style={{ display: 'flex', gap: 8 }}>
                    <StatusBadge label={`${activeCount} active`} color={THEME.success} />
                    {waitCount > 0 && <StatusBadge label={`${waitCount} wait`} color={THEME.warning} />}
                </div>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                {sessions.length === 0 && (
                    <div style={{
                        fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontMono,
                        padding: '14px 0', textAlign: 'center',
                    }}>
                        No active sessions
                    </div>
                )}
                {sessions.slice(0, 6).map((s, i) => {
                    const isWaiting = s.state === 'waiting' || s.waitEvent;
                    const isIdle = (s.state || '').includes('idle');
                    const stateColor = isWaiting ? THEME.warning : isIdle ? THEME.textDim : THEME.success;
                    return (
                        <div key={s.pid || i} style={{
                            display: 'flex', flexDirection: 'column', gap: 2,
                            padding: '6px 8px', borderRadius: 6,
                            background: i % 2 === 0 ? 'transparent' : `${THEME.surface}80`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: THEME.fontMono, fontSize: 11 }}>
                                <span style={{ color: THEME.textMain, fontWeight: 500 }}>
                                    {s.user || s.username || `pid ${s.pid || '—'}`}
                                </span>
                                <span style={{ color: stateColor, fontSize: 10.5 }}>
                                    {s.state || 'active'}
                                </span>
                                {s.waitEvent && (
                                    <span style={{ color: THEME.warning, fontSize: 11, fontWeight: 600 }}>
                                        {s.waitEvent}
                                    </span>
                                )}
                                <span style={{ marginLeft: 'auto', color: THEME.textMuted, fontSize: 11 }}>
                                    {s.duration || '—'}
                                </span>
                            </div>
                            {s.query && (
                                <div style={{
                                    fontSize: 10.5, color: THEME.textDim, fontFamily: THEME.fontMono,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {s.query}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </PanelCard>
    );
});
ActiveSessions.displayName = 'ActiveSessions';

/* ════════════════════════════════════════════════════════════════════════════
   LONG-RUNNING TRANSACTIONS TABLE
   ════════════════════════════════════════════════════════════════════════════ */

const LongTxnTable = React.memo(({ txns }: { txns: any[] }) => {
    const hasTxns = Array.isArray(txns) && txns.length > 0;
    const overOneMin = hasTxns ? txns.filter((t) => {
        const m = (t.duration || '').match(/(\d+)m/);
        return m && Number(m[1]) >= 1;
    }).length : 0;

    return (
        <PanelCard
            title="Long-running transactions"
            icon={Clock}
            actions={overOneMin > 0
                ? <StatusBadge label={`${overOneMin} over 1min`} color={THEME.warning} />
                : <StatusBadge label="all within threshold" color={THEME.success} />
            }
        >
            {!hasTxns ? (
                <div style={{
                    fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontMono,
                    padding: '18px 0', textAlign: 'center',
                }}>
                    No long-running transactions detected
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['PID', 'User', 'State', 'Application', 'Duration', ''].map((h) => (
                                <th key={h} style={{
                                    textAlign: h === '' ? 'right' : 'left',
                                    padding: '6px 8px', fontSize: 10, fontWeight: 600,
                                    color: THEME.textMuted, fontFamily: THEME.fontMono,
                                    letterSpacing: '0.04em', borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {txns.slice(0, 6).map((t, i) => {
                            const isIdle = (t.state || '').includes('idle');
                            const stateColor = isIdle ? THEME.warning : THEME.success;
                            const durColor = t.duration?.match(/^[3-9]m|^\d{2,}m/) ? THEME.danger
                                           : t.duration?.match(/^[1-2]m/) ? THEME.warning
                                           : THEME.textMain;
                            return (
                                <tr key={t.pid || i}>
                                    <td style={cellStyle()}>{t.pid || '—'}</td>
                                    <td style={cellStyle(THEME.textMain)}>{t.user || t.username || '—'}</td>
                                    <td style={cellStyle(stateColor)}>{t.state || '—'}</td>
                                    <td style={cellStyle()}>{t.application_name || t.application || '—'}</td>
                                    <td style={{ ...cellStyle(durColor), fontWeight: 600 }}>{t.duration || '—'}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>
                                        <button style={{
                                            padding: '3px 8px', borderRadius: 5,
                                            background: `${THEME.danger}14`,
                                            border: `1px solid ${THEME.danger}30`,
                                            color: THEME.danger, fontSize: 10.5, fontWeight: 600,
                                            cursor: 'pointer', fontFamily: THEME.fontBody,
                                        }}>
                                            pg_terminate
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </PanelCard>
    );
});
LongTxnTable.displayName = 'LongTxnTable';

const cellStyle = (color?: string): React.CSSProperties => ({
    padding: '8px',
    fontSize: 11.5,
    fontFamily: THEME.fontMono,
    color: color || THEME.textMuted,
    borderBottom: `1px solid ${THEME.glassBorder}40`,
});

/* ════════════════════════════════════════════════════════════════════════════
   REPLICATION PANEL
   ════════════════════════════════════════════════════════════════════════════ */

const ReplicationPanel = React.memo(({ data }: { data: any }) => {
    const replicas = data?.replicas || data?.standbys || [];
    const isPrimary = data?.role === 'primary' || replicas.length > 0;

    return (
        <PanelCard title="Replication · primary view" icon={Server}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Primary row */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 8,
                    background: `${THEME.success}10`, border: `1px solid ${THEME.success}30`,
                }}>
                    <LiveDot color={THEME.success} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain, fontFamily: THEME.fontMono }}>
                            {data?.primaryName || 'primary'}
                        </div>
                        <div style={{ fontSize: 10.5, color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: 1 }}>
                            primary · accepting writes
                        </div>
                    </div>
                    <StatusBadge label="in sync" color={THEME.success} />
                </div>

                {/* Replica rows */}
                {replicas.length === 0 ? (
                    <div style={{
                        fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontBody,
                        padding: '8px 4px', textAlign: 'center',
                    }}>
                        Standalone · no replicas
                    </div>
                ) : (
                    replicas.slice(0, 3).map((r: any, i: number) => {
                        const lagSec = Number(r.lagSeconds || r.lag_seconds || 0);
                        const ok = lagSec < 5;
                        const accent = ok ? THEME.success : lagSec < 30 ? THEME.warning : THEME.danger;
                        return (
                            <div key={r.name || i} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '8px 12px', borderRadius: 8,
                                border: `1px solid ${THEME.glassBorder}`,
                            }}>
                                <LiveDot color={accent} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: THEME.textMain, fontFamily: THEME.fontMono }}>
                                        {r.name || `replica-${i + 1}`}
                                    </div>
                                    <div style={{ fontSize: 10.5, color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: 1 }}>
                                        {r.state || 'streaming'} · lag {lagSec}s
                                    </div>
                                </div>
                                <StatusBadge
                                    label={ok ? 'healthy' : 'lagging'}
                                    color={accent}
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </PanelCard>
    );
});
ReplicationPanel.displayName = 'ReplicationPanel';

/* ════════════════════════════════════════════════════════════════════════════
   TOP TABLES BY SIZE
   ════════════════════════════════════════════════════════════════════════════ */

const TopTablesPanel = React.memo(({ tables, onViewAll }: { tables: any[]; onViewAll?: () => void }) => {
    const hasTables = Array.isArray(tables) && tables.length > 0;

    return (
        <PanelCard
            title="Top tables by size"
            icon={Database}
            actions={onViewAll && (
                <button onClick={onViewAll} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 500, color: THEME.textMuted,
                    fontFamily: THEME.fontBody,
                }}>
                    View all {hasTables ? `${tables.length} →` : '→'}
                </button>
            )}
        >
            {!hasTables ? (
                <div style={{
                    fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontMono,
                    padding: '18px 0', textAlign: 'center',
                }}>
                    No table data available
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Table', 'Size', 'Rows', 'Bloat', 'Last vacuum'].map((h) => (
                                <th key={h} style={{
                                    textAlign: 'left', padding: '6px 8px',
                                    fontSize: 10.5, fontWeight: 600, color: THEME.textMuted,
                                    fontFamily: THEME.fontMono, letterSpacing: '0.04em',
                                    borderBottom: `1px solid ${THEME.glassBorder}`,
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tables.slice(0, 6).map((t: any, i: number) => {
                            const bloatPct = Number(t.bloatPct || t.bloat_pct || 0);
                            const bloatColor = bloatPct >= 30 ? THEME.danger
                                             : bloatPct >= 15 ? THEME.warning
                                             : THEME.textMuted;
                            return (
                                <tr key={t.name || i}>
                                    <td style={cellStyle(THEME.textMain)}>
                                        {t.schemaname ? `${t.schemaname}.${t.relname || t.name}` : (t.name || '—')}
                                    </td>
                                    <td style={cellStyle(THEME.textMain)}>
                                        {t.sizePretty || t.size || '—'}
                                    </td>
                                    <td style={cellStyle()}>{fmtNum(Number(t.rows || t.n_live_tup || 0))}</td>
                                    <td style={{ ...cellStyle(bloatColor), fontWeight: bloatPct >= 15 ? 600 : 400 }}>
                                        {bloatPct ? `${Math.round(bloatPct)}%` : '—'}
                                    </td>
                                    <td style={cellStyle(THEME.textDim)}>
                                        {t.lastVacuum ? fmtRelTime(t.lastVacuum) : t.last_vacuum ? fmtRelTime(t.last_vacuum) : '—'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </PanelCard>
    );
});
TopTablesPanel.displayName = 'TopTablesPanel';

/* ════════════════════════════════════════════════════════════════════════════
   BACKUP & PITR STRIP — 4 horizontal tiles
   ════════════════════════════════════════════════════════════════════════════ */

const BackupStrip = React.memo(({ backup }: { backup: any }) => {
    const ts = backup?.timestamp || backup?.lastBackup;
    const sizeGB = Number(backup?.sizeGB || backup?.size_gb || 0);
    const region = backup?.crossRegion || backup?.cross_region_target || 'eu-west-1';
    const dailyAgo = backup?.dailyAgo || backup?.daily?.timestamp;
    const dailyCount = backup?.dailyRetained || backup?.daily_retained || 30;
    const crossRegionAgo = backup?.crossRegionAgo || backup?.cross_region?.timestamp;
    const walLag = backup?.walLagSeconds || backup?.wal_lag_seconds;

    const tiles = [
        {
            title: 'Continuous WAL',
            value: walLag != null ? `streaming · lag ${walLag}s` : (ts ? 'streaming' : 'no data'),
            ok: ts != null,
        },
        {
            title: 'Hourly snapshot',
            value: ts ? `${fmtRelTime(ts)} · ${sizeGB ? `${sizeGB} GB` : '—'}` : 'no data',
            ok: ts != null,
        },
        {
            title: 'Daily snapshot',
            value: dailyAgo ? `${fmtRelTime(dailyAgo)} · ${dailyCount} retained` : 'no data',
            ok: dailyAgo != null,
        },
        {
            title: 'Cross-region copy',
            value: crossRegionAgo ? `${fmtRelTime(crossRegionAgo)} · ${region}` : 'no data',
            ok: crossRegionAgo != null,
        },
    ];

    return (
        <PanelCard
            title="Backup & PITR"
            icon={HardDrive}
            actions={
                <div style={{ display: 'flex', gap: 8, fontSize: 11.5, color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                    <span>RPO 1h · RTO 15m</span>
                    <span style={{ color: THEME.glassBorder }}>·</span>
                    <span>PITR window: 35 days</span>
                </div>
            }
        >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {tiles.map((tile) => (
                    <div key={tile.title} style={{
                        padding: '10px 12px', borderRadius: 8,
                        background: tile.ok ? `${THEME.success}08` : THEME.surface,
                        border: `1px solid ${tile.ok ? `${THEME.success}30` : THEME.glassBorder}`,
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: THEME.textMain, fontFamily: THEME.fontBody }}>
                            {tile.title}
                        </div>
                        <div style={{ fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono, marginTop: 4 }}>
                            {tile.value}
                        </div>
                    </div>
                ))}
            </div>
        </PanelCard>
    );
});
BackupStrip.displayName = 'BackupStrip';

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */

const OV_CACHE_KEY = 'fathom_overview_cache_v1';
function readCache() {
    try { return JSON.parse(localStorage.getItem(OV_CACHE_KEY) || 'null'); } catch { return null; }
}
function writeCache(obj: any) {
    try { localStorage.setItem(OV_CACHE_KEY, JSON.stringify({ ...obj, _ts: Date.now() })); } catch {}
}

const OverviewTabLight = () => {
    useAdaptiveTheme();
    const { activeConnection, loading: connectionsLoading } = useConnection();
    const nav = useNavigation();

    const cached = useMemo(() => readCache(), []);
    const [data, setData] = useState<any>(cached?.data ?? null);
    const [loading, setLoading] = useState(!cached?.data);
    const [longTxns, setLongTxns] = useState<any[]>(cached?.longTxns ?? []);
    const [activeSessions, setActiveSessions] = useState<any[]>(cached?.sessions ?? []);
    const [backupData, setBackupData] = useState<any>(cached?.backupData ?? null);
    const [replicationData, setReplicationData] = useState<any>(cached?.replicationData ?? null);
    const [topTables, setTopTables] = useState<any[]>(cached?.topTables ?? []);
    const [timeseriesData, setTimeseriesData] = useState<any>(cached?.timeseriesData ?? null);
    const intervalRef = useRef<any>(null);

    const load = useCallback(async () => {
        if (!activeConnection) { setLoading(false); return; }
        try {
            const withTimeout = (p: any, ms = 5000) =>
                Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
            const [statsRes, trafficRes, longTxnRes, backupRes, replicationRes, topTablesRes, timeseriesRes, sessionsRes] =
                await Promise.allSettled([
                    withTimeout(fetchData('/api/overview/stats')),
                    withTimeout(fetchData('/api/overview/traffic')),
                    withTimeout(fetchData('/api/overview/long-transactions')),
                    withTimeout(fetchData('/api/overview/backup')),
                    withTimeout(fetchData('/api/overview/replication')),
                    withTimeout(fetchData('/api/overview/top-tables')),
                    withTimeout(fetchData('/api/overview/timeseries')),
                    withTimeout(fetchData('/api/overview/active-sessions')),
                ]);
            const val = (r: any) => (r.status === 'fulfilled' && !r.value?.error ? r.value : null);

            const newData = {
                stats: val(statsRes)   || { activeConnections: 0, maxConnections: 0, uptimeSeconds: 0, diskUsedGB: 0, indexHitRatio: 0 },
                traffic: val(trafficRes) || { tup_fetched: 0, tup_inserted: 0, tup_updated: 0, tup_deleted: 0 },
            };
            setData(newData);

            const newLongTxns = (() => {
                const d = val(longTxnRes);
                return Array.isArray(d) ? d : (d?.transactions || []);
            })();
            setLongTxns(newLongTxns);

            const newBackup = val(backupRes);
            const newReplication = val(replicationRes);
            const newTopTables = (() => {
                const d = val(topTablesRes);
                return Array.isArray(d) ? d : (d?.tables || []);
            })();
            const newTimeseries = val(timeseriesRes);
            const newSessions = (() => {
                const d = val(sessionsRes);
                return Array.isArray(d) ? d : (d?.sessions || []);
            })();

            setBackupData(newBackup);
            setReplicationData(newReplication);
            setTopTables(newTopTables);
            setTimeseriesData(newTimeseries);
            setActiveSessions(newSessions);

            writeCache({
                data: newData, longTxns: newLongTxns, backupData: newBackup,
                replicationData: newReplication, topTables: newTopTables,
                timeseriesData: newTimeseries, sessions: newSessions,
            });
        } catch (e) {
            console.error('OverviewTabLight load failed', e);
        } finally {
            setLoading(false);
        }
    }, [activeConnection]);

    useGlobalRefresh(React.useCallback(() => load(), [load]));

    useEffect(() => {
        if (activeConnection) load();
        else setLoading(false);
    }, [activeConnection]);

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (activeConnection) intervalRef.current = setInterval(load, 30000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [activeConnection, load]);

    // ── Empty state: no connection yet ──────────────────────────────────────
    if (!activeConnection && !connectionsLoading) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: 80, minHeight: 400,
                background: THEME.bg, color: THEME.textMain,
            }}>
                <Database size={48} color={THEME.primary} style={{ marginBottom: 16, opacity: 0.7 }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, marginBottom: 8 }}>
                    Connect a database to begin
                </div>
                <div style={{ fontSize: 13, color: THEME.textMuted, maxWidth: 480, textAlign: 'center' }}>
                    Pick a connection from the top-right switcher or add a new one
                    in the Connection Pool tab.
                </div>
            </div>
        );
    }

    // ── Loading skeleton ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0 40px' }}>
                <TremorStyles />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} style={{
                            height: 78, borderRadius: 10,
                            background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                            opacity: 0.4,
                            animation: 'tremorPulse 1.5s ease-in-out infinite',
                            animationDelay: `${i * 0.08}s`,
                        }} />
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                    {[0, 1].map((i) => (
                        <div key={i} style={{
                            height: 280, borderRadius: 12,
                            background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                            opacity: 0.3,
                            animation: 'tremorPulse 1.5s ease-in-out infinite',
                            animationDelay: `${0.2 + i * 0.1}s`,
                        }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: 40, textAlign: 'center', background: THEME.bg, color: THEME.textMain }}>
                <AlertTriangle size={32} color={THEME.warning} style={{ marginBottom: 12, opacity: 0.5 }} />
                <div style={{ fontSize: 14, color: THEME.textMuted }}>Unable to load dashboard data.</div>
            </div>
        );
    }

    // ── Derived ──────────────────────────────────────────────────────────────
    const { stats, traffic } = data;
    const activeConns = Number(stats?.activeConnections || 0);
    const maxConns    = Number(stats?.maxConnections || 0);
    const cacheHit    = Number(stats?.indexHitRatio || 0);
    const diskGB      = Number(stats?.diskUsedGB || 0);
    const uptimeSec   = Number(stats?.uptimeSeconds || 0);
    const uptimeStr   = (() => {
        const d = Math.floor(uptimeSec / 86400);
        const h = Math.floor((uptimeSec % 86400) / 3600);
        return d > 0 ? `${d}d ${h}h` : `${h}h`;
    })();
    const tps         = Number(stats?.transactionsPerSec || stats?.tps || 0);
    const rollbackPct = Number(stats?.rollbackPct || stats?.rollback_pct || 0);
    const slowQueries = Number(stats?.slowQueries || stats?.slow_queries || 0);
    const deadlocks   = Number(stats?.deadlocks || traffic?.deadlocks || 0);

    const connPct = maxConns ? (activeConns / maxConns) * 100 : 0;

    const kpiTiles: KpiTile[] = [
        {
            label: 'Size on disk',
            value: diskGB > 0 ? `${diskGB} GB` : '—',
            sub: '+ tracking via stats',
            tone: 'normal',
        },
        {
            label: 'Connections',
            value: maxConns > 0 ? `${activeConns}/${maxConns}` : `${activeConns}`,
            sub: connPct > 85 ? 'critical' : connPct > 65 ? 'moderate' : 'healthy',
            tone: connPct > 85 ? 'danger' : connPct > 65 ? 'warning' : 'normal',
        },
        {
            label: 'Cache hit',
            value: cacheHit > 0 ? `${cacheHit}%` : '—',
            sub: cacheHit >= 99 ? 'on target' : cacheHit >= 95 ? 'acceptable' : 'below target',
            tone: cacheHit >= 99 ? 'success' : cacheHit >= 95 ? 'warning' : 'danger',
        },
        {
            label: 'Transactions/s',
            value: tps > 0 ? fmtNum(tps) : '—',
            sub: 'pg_stat_database',
            tone: 'normal',
        },
        {
            label: 'Rollback %',
            value: rollbackPct > 0 ? `${rollbackPct.toFixed(2)}%` : '—',
            sub: rollbackPct < 1 ? 'healthy' : 'investigate',
            tone: rollbackPct < 1 ? 'success' : 'warning',
        },
        {
            label: 'Slow queries',
            value: slowQueries > 0 ? `${slowQueries}` : '0',
            sub: 'last 15m · pg_stat_statements',
            tone: slowQueries > 10 ? 'danger' : slowQueries > 0 ? 'warning' : 'normal',
        },
        {
            label: 'Deadlocks',
            value: `${deadlocks}`,
            sub: 'pg_stat_database',
            tone: deadlocks > 0 ? 'danger' : 'normal',
        },
    ];

    const chartData = (() => {
        if (timeseriesData?.opsPerSec && Array.isArray(timeseriesData.opsPerSec) && timeseriesData.opsPerSec.length > 0) {
            return timeseriesData.opsPerSec.map((v: any) => ({
                t: v.t || v.time || '',
                reads: Number(v.reads || 0),
                writes: Number(v.writes || 0),
            }));
        }
        return [];
    })();

    const sessionsActive = activeSessions.filter((s) => !(s.state || '').includes('idle')).length;
    const sessionsWait   = activeSessions.filter((s) => s.state === 'waiting' || s.waitEvent).length;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 14,
            padding: '12px 0 40px',
            background: THEME.bg,
            minHeight: '100%',
        }}>
            <TremorStyles />

            {/* HEADER */}
            <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                paddingBottom: 4,
            }}>
                <div>
                    <div style={{
                        fontSize: 16, fontWeight: 600, color: THEME.textMain,
                        fontFamily: THEME.fontBody,
                    }}>
                        Database overview
                    </div>
                    <div style={{
                        fontSize: 11.5, color: THEME.textMuted, fontFamily: THEME.fontMono,
                        marginTop: 2,
                    }}>
                        {activeConnection?.name || activeConnection?.host || 'unknown'}
                        {stats?.pgVersion ? ` · postgres ${stats.pgVersion}` : ''}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                        fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono,
                        padding: '4px 10px', borderRadius: 6,
                        border: `1px solid ${THEME.glassBorder}`,
                        background: THEME.surface,
                    }}>
                        uptime {uptimeStr}
                    </span>
                    <StatusBadge label="LIVE" color={THEME.success} />
                </div>
            </div>

            {/* KPI BAND */}
            <KpiBand tiles={kpiTiles} />

            {/* THROUGHPUT + ACTIVE SESSIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <ThroughputPanel chartData={chartData} traffic={traffic} />
                <ActiveSessions
                    sessions={activeSessions}
                    activeCount={sessionsActive}
                    waitCount={sessionsWait}
                />
            </div>

            {/* LONG-RUNNING TXNS */}
            <LongTxnTable txns={longTxns} />

            {/* REPLICATION + TOP TABLES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <ReplicationPanel data={replicationData} />
                <TopTablesPanel
                    tables={topTables}
                    onViewAll={() => nav?.goToTab('table-analytics')}
                />
            </div>

            {/* BACKUP STRIP */}
            <BackupStrip backup={backupData} />
        </div>
    );
};

export default React.memo(OverviewTabLight);
