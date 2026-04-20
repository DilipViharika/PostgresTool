/**
 * _overviewV3Helpers.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Pure helpers for OverviewTabV3 — types, rule-based AI summary synthesis,
 * health derivation, and small formatters. Theme-free so it can be unit
 * tested and swapped for a real `/api/ai/overview` endpoint later.
 * ────────────────────────────────────────────────────────────────────── */

export interface OverviewStats {
    activeConnections?: number;
    maxConnections?: number;
    uptimeSeconds?: number;
    diskUsedGB?: number;
    diskTotalGB?: number;
    cpuPercent?: number;
    memoryPercent?: number;
    networkPercent?: number;
    avgQueryMs?: number;
    indexHitRatio?: string | number;
    cacheHitRatio?: string | number;
    slowQueries?: number;
    qps?: number;
}

export interface OverviewTraffic {
    tup_fetched?: number;
    tup_inserted?: number;
    tup_updated?: number;
    tup_deleted?: number;
}

export interface TimeseriesPoint {
    t?: string;
    time?: string;
    reads?: number;
    writes?: number;
    qps?: number;
}

export interface TimeseriesData {
    opsPerSec?: TimeseriesPoint[];
    velocity?: TimeseriesPoint[];
}

export interface AlertItem {
    id?: string | number;
    severity?: 'critical' | 'warning' | 'info' | string;
    title?: string;
    message?: string;
    source?: string;
    time?: string;
}

export interface TopTable {
    name?: string;
    schema?: string;
    sizeGB?: number;
    rows?: number;
    health?: 'healthy' | 'slow' | 'offline' | string;
    avgMs?: number;
}

export type HealthTone = 'ok' | 'warn' | 'bad';

export interface Health {
    tone: HealthTone;
    statusPct: number; // 0-100, higher = healthier
    title: string;
    detail: string;
}

export interface Anomaly {
    id: string;
    title: string;
    detail: string;
    severity: 'critical' | 'warning' | 'info';
    confidencePct: number;
    category: 'traffic' | 'resource' | 'query' | 'connection' | 'alert';
}

export interface AISummary {
    tone: HealthTone;
    statusPct: number;
    headline: string;
    drivers: string[];
    anomalies: Anomaly[];
    confidencePct: number;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Tiny utilities
 * ────────────────────────────────────────────────────────────────────── */

export const clamp01 = (v: number): number =>
    Math.min(100, Math.max(0, Number.isFinite(v) ? v : 0));

export const withTimeout = <T>(p: Promise<T>, ms = 5000): Promise<T> =>
    Promise.race([
        p,
        new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
    ]);

export const deltaPct = (cur: number, prev: number): number => {
    if (!prev || !Number.isFinite(prev)) return 0;
    return ((cur - prev) / prev) * 100;
};

export const meanOf = (xs: number[]): number =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

export const last = <T>(xs: T[]): T | undefined => xs[xs.length - 1];

/* ─────────────────────────────────────────────────────────────────────────
 * Health derivation — single source of truth for the top banner tone.
 * ────────────────────────────────────────────────────────────────────── */

export const deriveHealth = (
    stats: OverviewStats,
    alerts: AlertItem[],
): Health => {
    const critical = alerts.filter((a) => (a.severity || '').toLowerCase() === 'critical').length;
    const warnings = alerts.filter((a) => (a.severity || '').toLowerCase() === 'warning').length;

    const cpu = Number(stats.cpuPercent ?? 0);
    const memory = Number(stats.memoryPercent ?? 0);
    const disk = stats.diskTotalGB
        ? (Number(stats.diskUsedGB ?? 0) / Number(stats.diskTotalGB)) * 100
        : 0;
    const connPct = stats.maxConnections
        ? (Number(stats.activeConnections ?? 0) / Number(stats.maxConnections)) * 100
        : 0;

    // Pressure score: higher = more stress on the system.
    const pressure =
        Math.max(0, cpu - 70) * 2 +
        Math.max(0, memory - 80) * 1.5 +
        Math.max(0, disk - 80) * 1.5 +
        Math.max(0, connPct - 80) * 1 +
        critical * 25 +
        warnings * 7;

    const statusPct = clamp01(100 - pressure);

    if (critical > 0 || disk >= 90 || cpu >= 90) {
        return {
            tone: 'bad',
            statusPct,
            title: 'Attention needed',
            detail: critical > 0
                ? `${critical} critical alert${critical === 1 ? '' : 's'} open`
                : disk >= 90
                    ? `Disk at ${disk.toFixed(0)}%`
                    : `CPU at ${cpu.toFixed(0)}%`,
        };
    }
    if (warnings > 0 || cpu >= 70 || memory >= 85 || disk >= 75 || connPct >= 80) {
        return {
            tone: 'warn',
            statusPct,
            title: 'Running with warnings',
            detail: warnings > 0
                ? `${warnings} warning${warnings === 1 ? '' : 's'} to review`
                : cpu >= 70 ? `CPU at ${cpu.toFixed(0)}%`
                    : memory >= 85 ? `Memory at ${memory.toFixed(0)}%`
                        : disk >= 75 ? `Disk at ${disk.toFixed(0)}%`
                            : `Connections at ${connPct.toFixed(0)}%`,
        };
    }
    return {
        tone: 'ok',
        statusPct,
        title: 'All systems healthy',
        detail: 'No alerts in the last 15 minutes',
    };
};

/* ─────────────────────────────────────────────────────────────────────────
 * AI summary — synthesized from real data signals (not hardcoded).
 *   • Looks at recent QPS trend, CPU/memory/disk pressure, alerts, and
 *     top-table health to pick 3-5 drivers + up to 4 ranked anomalies.
 *   • Confidence rises with the amount of data we see.
 * ────────────────────────────────────────────────────────────────────── */

export const buildAISummary = (
    stats: OverviewStats,
    alerts: AlertItem[],
    series: TimeseriesPoint[],
    topTables: TopTable[],
): AISummary => {
    const health = deriveHealth(stats, alerts);

    const reads = series.map((p) => Number(p.reads ?? p.qps ?? 0));
    const writes = series.map((p) => Number(p.writes ?? 0));
    const qpsNow = (last(reads) ?? 0) + (last(writes) ?? 0);
    const qpsRecent = meanOf([...reads.slice(-12), ...writes.slice(-12)]);
    const qpsEarlier = meanOf([...reads.slice(-24, -12), ...writes.slice(-24, -12)]);
    const qpsDelta = deltaPct(qpsRecent, qpsEarlier);

    const cpu = Number(stats.cpuPercent ?? 0);
    const memory = Number(stats.memoryPercent ?? 0);
    const disk = stats.diskTotalGB
        ? (Number(stats.diskUsedGB ?? 0) / Number(stats.diskTotalGB)) * 100
        : 0;
    const connPct = stats.maxConnections
        ? (Number(stats.activeConnections ?? 0) / Number(stats.maxConnections)) * 100
        : 0;

    // Drivers — always 3-5, preferring the most informative signals.
    const drivers: string[] = [];
    if (Math.abs(qpsDelta) >= 10 && Number.isFinite(qpsDelta)) {
        drivers.push(
            `Traffic is ${qpsDelta > 0 ? 'up' : 'down'} ${Math.abs(qpsDelta).toFixed(0)}% ` +
            `vs. the previous 12 samples (now ~${qpsNow.toFixed(0)} ops/sec).`,
        );
    } else if (qpsNow > 0) {
        drivers.push(`Traffic is steady at ~${qpsNow.toFixed(0)} ops/sec.`);
    }

    if (cpu >= 70) drivers.push(`CPU is at ${cpu.toFixed(0)}% — approaching the 80% alert threshold.`);
    else if (cpu > 0) drivers.push(`CPU is comfortable at ${cpu.toFixed(0)}%.`);

    if (memory >= 85) drivers.push(`Memory at ${memory.toFixed(0)}% — watch for cache evictions.`);
    if (disk >= 75) drivers.push(`Disk at ${disk.toFixed(0)}% — capacity planning should begin.`);

    if (connPct >= 80) drivers.push(
        `Connections at ${connPct.toFixed(0)}% of the pool — consider increasing \`max_connections\`.`,
    );

    const slowTables = topTables.filter((t) => (t.health || '').toLowerCase() === 'slow');
    if (slowTables.length) {
        drivers.push(
            `${slowTables.length} slow table${slowTables.length === 1 ? '' : 's'} flagged — ` +
            `top offender: ${slowTables[0].name || 'unknown'}.`,
        );
    }

    const hitRatio = Number(stats.indexHitRatio ?? stats.cacheHitRatio ?? 0);
    if (hitRatio >= 99) {
        drivers.push(`Index hit ratio at ${hitRatio.toFixed(1)}% — caching is working well.`);
    } else if (hitRatio > 0 && hitRatio < 97) {
        drivers.push(`Index hit ratio at ${hitRatio.toFixed(1)}% — below the 99% target.`);
    }

    if (drivers.length === 0) {
        drivers.push('No material changes in the last 15 minutes.');
    }

    // Anomalies — ranked, each with a confidence score.
    const anomalies: Anomaly[] = [];

    if (cpu >= 80) anomalies.push({
        id: 'cpu-high',
        title: `CPU at ${cpu.toFixed(0)}%`,
        detail: 'Sustained CPU above 80% for this window. Check top slow queries and background jobs.',
        severity: cpu >= 90 ? 'critical' : 'warning',
        confidencePct: 92,
        category: 'resource',
    });

    if (memory >= 88) anomalies.push({
        id: 'mem-high',
        title: `Memory at ${memory.toFixed(0)}%`,
        detail: 'Memory headroom is tight. Watch for increased swap and cache pressure.',
        severity: memory >= 95 ? 'critical' : 'warning',
        confidencePct: 85,
        category: 'resource',
    });

    if (disk >= 80) anomalies.push({
        id: 'disk-high',
        title: `Disk at ${disk.toFixed(0)}%`,
        detail: 'Storage pressure is building. Visit Capacity planning for an archive plan.',
        severity: disk >= 90 ? 'critical' : 'warning',
        confidencePct: 94,
        category: 'resource',
    });

    if (connPct >= 85) anomalies.push({
        id: 'conn-high',
        title: `${(stats.activeConnections ?? 0)}/${stats.maxConnections ?? 0} connections in use`,
        detail: `The pool is ${connPct.toFixed(0)}% full. New queries may queue if usage keeps climbing.`,
        severity: connPct >= 95 ? 'critical' : 'warning',
        confidencePct: 88,
        category: 'connection',
    });

    if (qpsDelta >= 50 && qpsNow > 50) anomalies.push({
        id: 'traffic-spike',
        title: `Traffic spike detected (+${qpsDelta.toFixed(0)}%)`,
        detail: `QPS jumped from ~${qpsEarlier.toFixed(0)} to ~${qpsRecent.toFixed(0)} in the latest window.`,
        severity: qpsDelta >= 100 ? 'critical' : 'warning',
        confidencePct: 78,
        category: 'traffic',
    });

    if (slowTables.length >= 2) anomalies.push({
        id: 'slow-tables',
        title: `${slowTables.length} slow tables flagged`,
        detail: `Investigate ${slowTables.slice(0, 2).map((t) => t.name).join(', ')}. ` +
            'Missing indexes or stale statistics are the most common causes.',
        severity: slowTables.length >= 4 ? 'critical' : 'warning',
        confidencePct: 72,
        category: 'query',
    });

    // Promote any explicit critical alerts.
    alerts.filter((a) => (a.severity || '').toLowerCase() === 'critical').slice(0, 2).forEach((a, i) => {
        anomalies.push({
            id: `alert-${a.id ?? i}`,
            title: a.title || 'Critical alert',
            detail: a.message || 'See Alerts panel for details.',
            severity: 'critical',
            confidencePct: 100,
            category: 'alert',
        });
    });

    // Rank: critical first, then warning, then info, ties broken by confidence.
    const sevRank: Record<Anomaly['severity'], number> = { critical: 3, warning: 2, info: 1 };
    anomalies.sort((a, b) =>
        sevRank[b.severity] - sevRank[a.severity] || b.confidencePct - a.confidencePct,
    );

    // Overall summary confidence grows with how much data we observed.
    let confidencePct = 60;
    if (series.length >= 24) confidencePct += 12;
    if (alerts.length > 0) confidencePct += 6;
    if (topTables.length > 0) confidencePct += 6;
    if (stats.maxConnections) confidencePct += 6;
    confidencePct = Math.min(98, confidencePct);

    // Craft the headline from the most informative anomaly / driver.
    let headline: string;
    const topAnomaly = anomalies[0];
    if (health.tone === 'bad') {
        headline = topAnomaly
            ? `${topAnomaly.title} — ${topAnomaly.detail}`
            : `${health.title}: ${health.detail.toLowerCase()}.`;
    } else if (health.tone === 'warn') {
        headline = topAnomaly
            ? `Running with warnings: ${topAnomaly.title.toLowerCase()}.`
            : `Running with warnings — ${health.detail.toLowerCase()}.`;
    } else {
        headline = qpsNow > 0
            ? `All systems healthy — handling ~${qpsNow.toFixed(0)} ops/sec with ${cpu.toFixed(0)}% CPU.`
            : `All systems healthy. No alerts in the last 15 minutes.`;
    }

    return {
        tone: health.tone,
        statusPct: health.statusPct,
        headline,
        drivers: drivers.slice(0, 5),
        anomalies: anomalies.slice(0, 4),
        confidencePct,
    };
};

/* ─────────────────────────────────────────────────────────────────────────
 * Formatters
 * ────────────────────────────────────────────────────────────────────── */

export const fmtPct = (v: number): string => `${v.toFixed(0)}%`;
export const fmtMs = (v: number): string => `${v.toFixed(1)} ms`;
export const fmtOps = (v: number): string =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v.toFixed(0)}`;

export const severityColor = (s: Anomaly['severity'] | string, theme: {
    danger: string; warning: string; info: string;
}): string =>
    s === 'critical' ? theme.danger : s === 'warning' ? theme.warning : theme.info;

export const toneColor = (tone: HealthTone, theme: {
    success: string; warning: string; danger: string;
}): string =>
    tone === 'bad' ? theme.danger : tone === 'warn' ? theme.warning : theme.success;
