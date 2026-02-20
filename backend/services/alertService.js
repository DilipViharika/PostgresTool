// ==========================================================================
//  VIGIL — Enhanced Alert System Module
// ==========================================================================

import { v4 as uuid } from 'uuid';

function log(level, message, meta = {}) {
    const entry = { ts: new Date().toISOString(), level, msg: message, ...meta };
    const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    fn(JSON.stringify(entry));
}

class EnhancedAlertEngine {
    constructor(pool, config, emailService = null) {
        this.pool = pool;
        this.config = config;
        this.emailService = emailService;
        this.subscribers = new Set();
        this.dedup = new Map();
        this.monitoringInterval = null;
        this.alertRules = this.initializeAlertRules();
    }

    initializeAlertRules() {
        return [
            {
                id: 'high_connections',
                name: 'High Connection Usage',
                category: 'resources',
                severity: 'warning',
                condition: (metrics) => {
                    const usage = (metrics.activeConnections / metrics.maxConnections) * 100;
                    return usage > this.config.ALERT_THRESHOLDS.CONNECTION_USAGE_PCT;
                },
                message: (metrics) => {
                    const usage = ((metrics.activeConnections / metrics.maxConnections) * 100).toFixed(1);
                    return `Connection usage at ${usage}% (${metrics.activeConnections}/${metrics.maxConnections})`;
                },
            },
            {
                id: 'critical_connections',
                name: 'Critical Connection Usage',
                category: 'resources',
                severity: 'critical',
                condition: (metrics) => {
                    const usage = (metrics.activeConnections / metrics.maxConnections) * 100;
                    return usage > 95;
                },
                message: (metrics) => {
                    const usage = ((metrics.activeConnections / metrics.maxConnections) * 100).toFixed(1);
                    return `CRITICAL: Connection usage at ${usage}% - approaching maximum capacity!`;
                },
            },
            {
                id: 'slow_queries',
                name: 'Slow Queries Detected',
                category: 'performance',
                severity: 'warning',
                condition: (metrics) => metrics.slowQueries && metrics.slowQueries.length > 0,
                message: (metrics) =>
                    `${metrics.slowQueries.length} slow queries detected (>${this.config.ALERT_THRESHOLDS.LONG_QUERY_SEC}s)`,
            },
            {
                id: 'low_cache_hit',
                name: 'Low Cache Hit Ratio',
                category: 'performance',
                severity: 'warning',
                condition: (metrics) =>
                    metrics.cacheHitRatio != null &&
                    parseFloat(metrics.cacheHitRatio) < this.config.ALERT_THRESHOLDS.CACHE_HIT_RATIO,
                message: (metrics) =>
                    `Cache hit ratio is ${metrics.cacheHitRatio}% (threshold: ${this.config.ALERT_THRESHOLDS.CACHE_HIT_RATIO}%)`,
            },
            {
                id: 'high_bloat',
                name: 'High Table Bloat',
                category: 'maintenance',
                severity: 'warning',
                condition: (metrics) => metrics.bloatedTables && metrics.bloatedTables.length > 0,
                message: (metrics) => {
                    const count = metrics.bloatedTables.length;
                    const worst = metrics.bloatedTables[0];
                    return `${count} tables with high bloat detected. Worst: ${worst.table_name} (${worst.bloat_ratio_pct}%)`;
                },
            },
            {
                id: 'replication_lag',
                name: 'Replication Lag Detected',
                category: 'reliability',
                severity: 'critical',
                condition: (metrics) =>
                    metrics.replicationLag != null &&
                    metrics.replicationLag > this.config.ALERT_THRESHOLDS.REPLICATION_LAG_MB * 1024 * 1024,
                message: (metrics) => {
                    const lagMB = (metrics.replicationLag / (1024 * 1024)).toFixed(2);
                    return `Replication lag: ${lagMB} MB`;
                },
            },
            {
                id: 'blocking_locks',
                name: 'Blocking Locks Detected',
                category: 'reliability',
                severity: 'critical',
                condition: (metrics) =>
                    metrics.blockingLocks != null &&
                    metrics.blockingLocks >= this.config.ALERT_THRESHOLDS.LOCK_COUNT,
                message: (metrics) => `${metrics.blockingLocks} blocking locks detected`,
            },
            {
                id: 'disk_space_warning',
                name: 'High Disk Usage',
                category: 'resources',
                severity: 'warning',
                condition: (metrics) => metrics.diskUsedGB && metrics.diskUsedGB > 50,
                message: (metrics) => `Database size: ${metrics.diskUsedGB} GB`,
            },
        ];
    }

    async fire(severity, category, message, data = {}) {
        const key = `${category}:${severity}:${message}`;

        if (this.dedup.get(key) && Date.now() - this.dedup.get(key) < 300_000) {
            return null;
        }
        this.dedup.set(key, Date.now());

        const alert = {
            id: uuid(),
            timestamp: new Date().toISOString(),
            severity,
            category,
            message,
            data,
            acknowledged: false,
            acknowledged_by: null,
            acknowledged_at: null,
        };

        try {
            await this.pool.query(
                `INSERT INTO alerts (id, timestamp, severity, category, message, data, acknowledged)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [alert.id, alert.timestamp, alert.severity, alert.category, alert.message,
                    JSON.stringify(alert.data), alert.acknowledged],
            );

            this.broadcast({ type: 'alert', payload: alert });

            if (this.emailService) {
                this.emailService.sendAlert(alert).catch(err =>
                    log('ERROR', 'Failed to send alert email', { error: err.message }),
                );
            }

            return alert;
        } catch (error) {
            log('ERROR', 'Failed to save alert', { error: error.message });
            return alert; // still return so caller has the object
        }
    }

    async getRecent(limit = 50, includeAcknowledged = false) {
        try {
            const query = includeAcknowledged
                ? `SELECT * FROM alerts ORDER BY timestamp DESC LIMIT $1`
                : `SELECT * FROM alerts WHERE acknowledged = false ORDER BY timestamp DESC LIMIT $1`;

            const result = await this.pool.query(query, [limit]);
            return result.rows.map(row => ({
                ...row,
                data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
            }));
        } catch (error) {
            log('ERROR', 'Failed to fetch alerts', { error: error.message });
            return [];
        }
    }

    async acknowledge(alertId, userId, username) {
        try {
            const result = await this.pool.query(
                `UPDATE alerts
                 SET acknowledged = true, acknowledged_by = $2, acknowledged_at = NOW()
                 WHERE id = $1
                 RETURNING *`,
                [alertId, username],
            );

            if (result.rows.length > 0) {
                this.broadcast({
                    type: 'alert_acknowledged',
                    payload: {
                        alertId,
                        acknowledgedBy: username,
                        acknowledgedAt: new Date().toISOString(),
                    },
                });
                return result.rows[0];
            }
            return null;
        } catch (error) {
            log('ERROR', 'Failed to acknowledge alert', { error: error.message });
            throw error;
        }
    }

    async bulkAcknowledge(alertIds, userId, username) {
        try {
            const result = await this.pool.query(
                `UPDATE alerts
                 SET acknowledged = true, acknowledged_by = $2, acknowledged_at = NOW()
                 WHERE id = ANY($1)
                 RETURNING id`,
                [alertIds, username],
            );

            this.broadcast({
                type: 'alerts_acknowledged',
                payload: {
                    alertIds: result.rows.map(r => r.id),
                    acknowledgedBy: username,
                    acknowledgedAt: new Date().toISOString(),
                },
            });

            return result.rows;
        } catch (error) {
            log('ERROR', 'Failed to bulk acknowledge alerts', { error: error.message });
            throw error;
        }
    }

    async getStatistics(timeRange = '24h') {
        // Whitelist timeRange — never interpolated from user input
        const timeConditions = {
            '1h':  "timestamp > NOW() - INTERVAL '1 hour'",
            '24h': "timestamp > NOW() - INTERVAL '24 hours'",
            '7d':  "timestamp > NOW() - INTERVAL '7 days'",
            '30d': "timestamp > NOW() - INTERVAL '30 days'",
        };
        const timeCondition = timeConditions[timeRange] ?? timeConditions['24h'];

        try {
            const [summary, categoryBreakdown] = await Promise.all([
                this.pool.query(`
                    SELECT
                        COUNT(*) AS total,
                        COUNT(*) FILTER (WHERE severity = 'critical')   AS critical,
                        COUNT(*) FILTER (WHERE severity = 'warning')    AS warning,
                        COUNT(*) FILTER (WHERE severity = 'info')       AS info,
                        COUNT(*) FILTER (WHERE acknowledged = false)    AS unacknowledged,
                        COUNT(DISTINCT category)                         AS categories_affected
                    FROM alerts WHERE ${timeCondition}
                `),
                this.pool.query(`
                    SELECT category, COUNT(*) AS count
                    FROM alerts WHERE ${timeCondition}
                    GROUP BY category ORDER BY count DESC
                `),
            ]);

            return { summary: summary.rows[0], byCategory: categoryBreakdown.rows, timeRange };
        } catch (error) {
            log('ERROR', 'Failed to get alert statistics', { error: error.message });
            return null;
        }
    }

    async cleanup(daysToKeep = 30) {
        // FIX: was template literal SQL injection — now fully parameterized
        try {
            const result = await this.pool.query(
                `DELETE FROM alerts WHERE timestamp < NOW() - ($1 * INTERVAL '1 day') RETURNING id`,
                [daysToKeep],
            );
            return result.rowCount;
        } catch (error) {
            log('ERROR', 'Failed to cleanup old alerts', { error: error.message });
            return 0;
        }
    }

    async collectMetrics() {
        try {
            const metrics = {};

            // Connection stats
            const connResult = await this.pool.query(`
                SELECT
                    (SELECT count(*) FROM pg_stat_activity WHERE state='active') AS active,
                    (SELECT count(*) FROM pg_stat_activity)                      AS total_conn,
                    (SELECT setting::int FROM pg_settings WHERE name='max_connections') AS max_conn
            `);
            metrics.activeConnections = Number(connResult.rows[0].active);
            metrics.maxConnections    = Number(connResult.rows[0].max_conn);

            // Slow queries — FIX: was template literal SQL injection — now parameterized
            const slowResult = await this.pool.query(
                `SELECT pid, usename, query,
                        extract(epoch FROM (now()-query_start))::int AS duration_sec
                 FROM pg_stat_activity
                 WHERE state = 'active'
                   AND query NOT LIKE '%pg_stat_activity%'
                   AND (now()-query_start) > ($1 * INTERVAL '1 second')
                   AND pid <> pg_backend_pid()`,
                [this.config.ALERT_THRESHOLDS.LONG_QUERY_SEC],
            );
            metrics.slowQueries = slowResult.rows;

            // Cache hit ratio
            const cacheResult = await this.pool.query(`
                SELECT round(
                    sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit)+sum(heap_blks_read), 0) * 100,
                    1
                ) AS hit_ratio
                FROM pg_statio_user_tables
            `);
            metrics.cacheHitRatio = cacheResult.rows[0]?.hit_ratio ?? 100;

            // Table bloat — FIX: was template literal SQL injection — now parameterized
            const bloatResult = await this.pool.query(
                `SELECT relname AS table_name,
                        n_dead_tup AS dead_tuples,
                        CASE WHEN n_live_tup > 0
                             THEN round((n_dead_tup::numeric / n_live_tup) * 100, 2)
                             ELSE 0
                        END AS bloat_ratio_pct
                 FROM pg_stat_user_tables
                 WHERE n_live_tup > 0
                   AND (n_dead_tup::numeric / n_live_tup) * 100 > $1
                 ORDER BY bloat_ratio_pct DESC
                 LIMIT 5`,
                [this.config.ALERT_THRESHOLDS.DEAD_TUPLE_RATIO],
            );
            metrics.bloatedTables = bloatResult.rows;

            // Replication lag
            const replResult = await this.pool.query(`
                SELECT MAX(pg_wal_lsn_diff(sent_lsn, replay_lsn)) AS max_lag
                FROM pg_stat_replication
            `);
            metrics.replicationLag = replResult.rows[0]?.max_lag ?? 0;

            // Blocking locks
            const lockResult = await this.pool.query(`
                SELECT COUNT(*) AS count
                FROM pg_locks bl
                JOIN pg_locks kl ON kl.locktype = bl.locktype AND kl.pid <> bl.pid
                WHERE NOT bl.granted
            `);
            metrics.blockingLocks = Number(lockResult.rows[0].count);

            // Disk usage
            const diskResult = await this.pool.query(
                `SELECT pg_database_size(current_database()) AS db_size_bytes`,
            );
            metrics.diskUsedGB = parseFloat(
                (diskResult.rows[0].db_size_bytes / 1024 ** 3).toFixed(2),
            );

            return metrics;
        } catch (error) {
            log('ERROR', 'Failed to collect metrics', { error: error.message });
            return null;
        }
    }

    async runMonitoring() {
        const metrics = await this.collectMetrics();
        if (!metrics) return;

        for (const rule of this.alertRules) {
            try {
                if (rule.condition(metrics)) {
                    await this.fire(rule.severity, rule.category, rule.message(metrics), {
                        rule: rule.id,
                        metrics,
                    });
                }
            } catch (error) {
                log('ERROR', `Failed to evaluate alert rule ${rule.id}`, { error: error.message });
            }
        }
    }

    startMonitoring(intervalMs = 30_000) {
        if (this.monitoringInterval) clearInterval(this.monitoringInterval);
        log('INFO', 'Alert monitoring started', { intervalMs });
        this.runMonitoring();
        this.monitoringInterval = setInterval(() => this.runMonitoring(), intervalMs);
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            log('INFO', 'Alert monitoring stopped');
        }
    }

    broadcast(message) {
        const payload = JSON.stringify(message);
        this.subscribers.forEach(ws => {
            if (ws.readyState === 1) ws.send(payload);
        });
    }

    addSubscriber(ws)    { this.subscribers.add(ws); }
    removeSubscriber(ws) { this.subscribers.delete(ws); }

    async initializeDatabase() {
        try {
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS alerts (
                    id              VARCHAR(36) PRIMARY KEY,
                    timestamp       TIMESTAMP   NOT NULL,
                    severity        VARCHAR(20) NOT NULL,
                    category        VARCHAR(50) NOT NULL,
                    message         TEXT        NOT NULL,
                    data            JSONB,
                    acknowledged    BOOLEAN     DEFAULT false,
                    acknowledged_by VARCHAR(100),
                    acknowledged_at TIMESTAMP,
                    created_at      TIMESTAMP   DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_alerts_timestamp    ON alerts(timestamp DESC);
                CREATE INDEX IF NOT EXISTS idx_alerts_severity     ON alerts(severity);
                CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
                CREATE INDEX IF NOT EXISTS idx_alerts_category     ON alerts(category);
            `);
            log('INFO', 'Alert database tables initialized');
        } catch (error) {
            log('ERROR', 'Failed to initialize alert database', { error: error.message });
            throw error;
        }
    }
}

export default EnhancedAlertEngine;
