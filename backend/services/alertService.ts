// ==========================================================================
//  VIGIL — Enhanced Alert System Module
// ==========================================================================

import { v4 as uuid } from 'uuid';
import { Pool, QueryResult } from 'pg';
import WebSocket from 'ws';
import { sendAlert } from './slackService.js';

interface LogEntry {
  ts: string;
  level: string;
  msg: string;
  [key: string]: any;
}

interface AlertConfig {
  ALERT_THRESHOLDS: {
    CONNECTION_USAGE_PCT: number;
    LONG_QUERY_SEC: number;
    CACHE_HIT_RATIO: number;
    REPLICATION_LAG_MB: number;
    LOCK_COUNT: number;
    DEAD_TUPLE_RATIO: number;
  };
}

interface Alert {
  id: string;
  timestamp: string;
  severity: string;
  category: string;
  message: string;
  data: any;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  slack_ts?: string;
}

interface Metrics {
  activeConnections?: number;
  maxConnections?: number;
  slowQueries?: any[];
  cacheHitRatio?: number;
  bloatedTables?: any[];
  replicationLag?: number;
  blockingLocks?: number;
  diskUsedGB?: number;
  [key: string]: any;
}

interface AlertRule {
  id: string;
  name: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  condition: (metrics: Metrics) => boolean;
  message: (metrics: Metrics) => string;
}

interface AlertStatistics {
  summary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    unacknowledged: number;
    categories_affected: number;
  };
  byCategory: Array<{
    category: string;
    count: number;
  }>;
  timeRange: string;
}

interface BroadcastMessage {
  type: string;
  payload: any;
}

function log(level: string, message: string, meta: Record<string, any> = {}): void {
  const entry: LogEntry = { ts: new Date().toISOString(), level, msg: message, ...meta };
  const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
  fn(JSON.stringify(entry));
}

class EnhancedAlertEngine {
  private pool: Pool;
  private config: AlertConfig;
  private emailService: any;
  private subscribers: Set<WebSocket>;
  private dedup: Map<string, number>;
  private monitoringInterval: NodeJS.Timeout | null;
  private alertRules: AlertRule[];

  constructor(pool: Pool, config: AlertConfig, emailService: any = null) {
    this.pool = pool;
    this.config = config;
    this.emailService = emailService;
    this.subscribers = new Set();
    this.dedup = new Map();
    this.monitoringInterval = null;
    this.alertRules = this.initializeAlertRules();
  }

  private initializeAlertRules(): AlertRule[] {
    return [
      {
        id: 'high_connections',
        name: 'High Connection Usage',
        category: 'resources',
        severity: 'warning',
        condition: (metrics: Metrics) => {
          const usage = ((metrics.activeConnections || 0) / (metrics.maxConnections || 1)) * 100;
          return usage > this.config.ALERT_THRESHOLDS.CONNECTION_USAGE_PCT;
        },
        message: (metrics: Metrics) => {
          const usage = (((metrics.activeConnections || 0) / (metrics.maxConnections || 1)) * 100).toFixed(1);
          return `Connection usage at ${usage}% (${metrics.activeConnections}/${metrics.maxConnections})`;
        },
      },
      {
        id: 'critical_connections',
        name: 'Critical Connection Usage',
        category: 'resources',
        severity: 'critical',
        condition: (metrics: Metrics) => {
          const usage = ((metrics.activeConnections || 0) / (metrics.maxConnections || 1)) * 100;
          return usage > 95;
        },
        message: (metrics: Metrics) => {
          const usage = (((metrics.activeConnections || 0) / (metrics.maxConnections || 1)) * 100).toFixed(1);
          return `CRITICAL: Connection usage at ${usage}% - approaching maximum capacity!`;
        },
      },
      {
        id: 'slow_queries',
        name: 'Slow Queries Detected',
        category: 'performance',
        severity: 'warning',
        condition: (metrics: Metrics) => !!(metrics.slowQueries && metrics.slowQueries.length > 0),
        message: (metrics: Metrics) =>
          `${metrics.slowQueries?.length || 0} slow queries detected (>${this.config.ALERT_THRESHOLDS.LONG_QUERY_SEC}s)`,
      },
      {
        id: 'low_cache_hit',
        name: 'Low Cache Hit Ratio',
        category: 'performance',
        severity: 'warning',
        condition: (metrics: Metrics) => {
          return !!(metrics.cacheHitRatio != null &&
          parseFloat(metrics.cacheHitRatio.toString()) < this.config.ALERT_THRESHOLDS.CACHE_HIT_RATIO);
        },
        message: (metrics: Metrics) =>
          `Cache hit ratio is ${metrics.cacheHitRatio}% (threshold: ${this.config.ALERT_THRESHOLDS.CACHE_HIT_RATIO}%)`,
      },
      {
        id: 'high_bloat',
        name: 'High Table Bloat',
        category: 'maintenance',
        severity: 'warning',
        condition: (metrics: Metrics) => !!(metrics.bloatedTables && metrics.bloatedTables.length > 0),
        message: (metrics: Metrics) => {
          const count = metrics.bloatedTables?.length || 0;
          const worst = metrics.bloatedTables?.[0];
          return `${count} tables with high bloat detected. Worst: ${worst.table_name} (${worst.bloat_ratio_pct}%)`;
        },
      },
      {
        id: 'replication_lag',
        name: 'Replication Lag Detected',
        category: 'reliability',
        severity: 'critical',
        condition: (metrics: Metrics) =>
          metrics.replicationLag != null &&
          metrics.replicationLag > this.config.ALERT_THRESHOLDS.REPLICATION_LAG_MB * 1024 * 1024,
        message: (metrics: Metrics) => {
          const lagMB = ((metrics.replicationLag || 0) / (1024 * 1024)).toFixed(2);
          return `Replication lag: ${lagMB} MB`;
        },
      },
      {
        id: 'blocking_locks',
        name: 'Blocking Locks Detected',
        category: 'reliability',
        severity: 'critical',
        condition: (metrics: Metrics) => {
          return !!(metrics.blockingLocks != null && metrics.blockingLocks >= this.config.ALERT_THRESHOLDS.LOCK_COUNT);
        },
        message: (metrics: Metrics) => `${metrics.blockingLocks} blocking locks detected`,
      },
      {
        id: 'disk_space_warning',
        name: 'High Disk Usage',
        category: 'resources',
        severity: 'warning',
        condition: (metrics: Metrics) => !!(metrics.diskUsedGB && metrics.diskUsedGB > 50),
        message: (metrics: Metrics) => `Database size: ${metrics.diskUsedGB} GB`,
      },
    ];
  }

  async fire(severity: string, category: string, message: string, data: any = {}): Promise<Alert | null> {
    const key = `${category}:${severity}:${message}`;

    if (this.dedup.get(key) && Date.now() - this.dedup.get(key)! < 300_000) {
      return null;
    }
    this.dedup.set(key, Date.now());

    const alert: Alert = {
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
        [alert.id, alert.timestamp, alert.severity, alert.category, alert.message, JSON.stringify(alert.data), alert.acknowledged]
      );

      this.broadcast({ type: 'alert', payload: alert });

      if (this.emailService) {
        this.emailService.sendAlert(alert).catch((err: Error) => log('ERROR', 'Failed to send alert email', { error: err.message }));
      }

      // ── Slack notification ──────────────────────────────────────
      const slackChannel = process.env.SLACK_ALERT_CHANNEL || '#alerts';
      sendAlert(slackChannel, alert)
        .catch((err: Error) => log('ERROR', 'Failed to send Slack alert', { error: err.message }));

      return alert;
    } catch (error) {
      log('ERROR', 'Failed to save alert', { error: (error as Error).message });
      return alert; // still return so caller has the object
    }
  }

  async getRecent(limit: number = 50, includeAcknowledged: boolean = false): Promise<Alert[]> {
    try {
      const query = includeAcknowledged
        ? `SELECT * FROM alerts ORDER BY timestamp DESC LIMIT $1`
        : `SELECT * FROM alerts WHERE acknowledged = false ORDER BY timestamp DESC LIMIT $1`;

      const result = await this.pool.query<any>(query, [limit]);
      return result.rows.map((row) => ({
        ...row,
        data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      }));
    } catch (error) {
      log('ERROR', 'Failed to fetch alerts', { error: (error as Error).message });
      return [];
    }
  }

  async acknowledge(alertId: string, userId: string, username: string): Promise<Alert | null> {
    try {
      const result = await this.pool.query<any>(
        `UPDATE alerts
         SET acknowledged = true, acknowledged_by = $2, acknowledged_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [alertId, username]
      );

      if (result.rows.length > 0) {
        const updatedAlert = result.rows[0];

        this.broadcast({
          type: 'alert_acknowledged',
          payload: {
            alertId,
            acknowledgedBy: username,
            acknowledgedAt: new Date().toISOString(),
          },
        });

        // ── Sync acknowledgement back to Slack message ──────────
        // Note: updateAlertMessage is not available in current slackService, skipping
        // if (updatedAlert.slack_ts) {
        //   updateAlertMessage(updatedAlert.slack_ts, updatedAlert).catch((err: Error) =>
        //     log('ERROR', 'Failed to update Slack message on acknowledge', { error: err.message })
        //   );
        // }

        return updatedAlert;
      }
      return null;
    } catch (error) {
      log('ERROR', 'Failed to acknowledge alert', { error: (error as Error).message });
      throw error;
    }
  }

  async bulkAcknowledge(alertIds: string[], userId: string, username: string): Promise<Alert[]> {
    try {
      const result = await this.pool.query<{ id: string }>(
        `UPDATE alerts
         SET acknowledged = true, acknowledged_by = $2, acknowledged_at = NOW()
         WHERE id = ANY($1)
         RETURNING id`,
        [alertIds, username]
      );

      this.broadcast({
        type: 'alerts_acknowledged',
        payload: {
          alertIds: result.rows.map((r) => r.id),
          acknowledgedBy: username,
          acknowledgedAt: new Date().toISOString(),
        },
      });

      return result.rows as any;
    } catch (error) {
      log('ERROR', 'Failed to bulk acknowledge alerts', { error: (error as Error).message });
      throw error;
    }
  }

  async getStatistics(timeRange: string = '24h'): Promise<AlertStatistics | null> {
    // Whitelist timeRange — never interpolated from user input
    const timeConditions: Record<string, string> = {
      '1h': "timestamp > NOW() - INTERVAL '1 hour'",
      '24h': "timestamp > NOW() - INTERVAL '24 hours'",
      '7d': "timestamp > NOW() - INTERVAL '7 days'",
      '30d': "timestamp > NOW() - INTERVAL '30 days'",
    };
    const timeCondition = timeConditions[timeRange] ?? timeConditions['24h'];

    try {
      const [summary, categoryBreakdown] = await Promise.all([
        this.pool.query<any>(
          `
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE severity = 'critical')   AS critical,
                COUNT(*) FILTER (WHERE severity = 'warning')    AS warning,
                COUNT(*) FILTER (WHERE severity = 'info')       AS info,
                COUNT(*) FILTER (WHERE acknowledged = false)    AS unacknowledged,
                COUNT(DISTINCT category)                         AS categories_affected
            FROM alerts WHERE ${timeCondition}
        `
        ),
        this.pool.query<any>(
          `
            SELECT category, COUNT(*) AS count
            FROM alerts WHERE ${timeCondition}
            GROUP BY category ORDER BY count DESC
        `
        ),
      ]);

      return { summary: summary.rows[0], byCategory: categoryBreakdown.rows, timeRange };
    } catch (error) {
      log('ERROR', 'Failed to get alert statistics', { error: (error as Error).message });
      return null;
    }
  }

  async cleanup(daysToKeep: number = 30): Promise<number> {
    // FIX: was template literal SQL injection — now fully parameterized
    try {
      const result = await this.pool.query(
        `DELETE FROM alerts WHERE timestamp < NOW() - ($1 * INTERVAL '1 day') RETURNING id`,
        [daysToKeep]
      );
      return result.rowCount || 0;
    } catch (error) {
      log('ERROR', 'Failed to cleanup old alerts', { error: (error as Error).message });
      return 0;
    }
  }

  async collectMetrics(): Promise<Metrics | null> {
    try {
      const metrics: Metrics = {};

      // Connection stats
      const connResult = await this.pool.query<any>(`
        SELECT
            (SELECT count(*) FROM pg_stat_activity WHERE state='active') AS active,
            (SELECT count(*) FROM pg_stat_activity)                      AS total_conn,
            (SELECT setting::int FROM pg_settings WHERE name='max_connections') AS max_conn
      `);
      metrics.activeConnections = Number(connResult.rows[0].active);
      metrics.maxConnections = Number(connResult.rows[0].max_conn);

      // Slow queries — FIX: was template literal SQL injection — now parameterized
      const slowResult = await this.pool.query<any>(
        `SELECT pid, usename, query,
                extract(epoch FROM (now()-query_start))::int AS duration_sec
         FROM pg_stat_activity
         WHERE state = 'active'
           AND query NOT LIKE '%pg_stat_activity%'
           AND (now()-query_start) > ($1 * INTERVAL '1 second')
           AND pid <> pg_backend_pid()`,
        [this.config.ALERT_THRESHOLDS.LONG_QUERY_SEC]
      );
      metrics.slowQueries = slowResult.rows;

      // Cache hit ratio
      const cacheResult = await this.pool.query<any>(`
        SELECT round(
            sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit)+sum(heap_blks_read), 0) * 100,
            1
        ) AS hit_ratio
        FROM pg_statio_user_tables
      `);
      metrics.cacheHitRatio = cacheResult.rows[0]?.hit_ratio ?? 100;

      // Table bloat — FIX: was template literal SQL injection — now parameterized
      const bloatResult = await this.pool.query<any>(
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
        [this.config.ALERT_THRESHOLDS.DEAD_TUPLE_RATIO]
      );
      metrics.bloatedTables = bloatResult.rows;

      // Replication lag
      const replResult = await this.pool.query<any>(`
        SELECT MAX(pg_wal_lsn_diff(sent_lsn, replay_lsn)) AS max_lag
        FROM pg_stat_replication
      `);
      metrics.replicationLag = replResult.rows[0]?.max_lag ?? 0;

      // Blocking locks
      const lockResult = await this.pool.query<any>(`
        SELECT COUNT(*) AS count
        FROM pg_locks bl
        JOIN pg_locks kl ON kl.locktype = bl.locktype AND kl.pid <> bl.pid
        WHERE NOT bl.granted
      `);
      metrics.blockingLocks = Number(lockResult.rows[0].count);

      // Disk usage
      const diskResult = await this.pool.query<any>(`SELECT pg_database_size(current_database()) AS db_size_bytes`);
      metrics.diskUsedGB = parseFloat(((diskResult.rows[0].db_size_bytes / 1024 ** 3).toFixed(2)).toString());

      return metrics;
    } catch (error) {
      log('ERROR', 'Failed to collect metrics', { error: (error as Error).message });
      return null;
    }
  }

  async runMonitoring(): Promise<void> {
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
        log('ERROR', `Failed to evaluate alert rule ${rule.id}`, { error: (error as Error).message });
      }
    }
  }

  startMonitoring(intervalMs: number = 30_000): void {
    if (this.monitoringInterval) clearInterval(this.monitoringInterval);
    log('INFO', 'Alert monitoring started', { intervalMs });
    this.runMonitoring();
    this.monitoringInterval = setInterval(() => this.runMonitoring(), intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      log('INFO', 'Alert monitoring stopped');
    }
  }

  broadcast(message: BroadcastMessage): void {
    const payload = JSON.stringify(message);
    this.subscribers.forEach((ws) => {
      if (ws.readyState === 1) ws.send(payload);
    });
  }

  addSubscriber(ws: WebSocket): void {
    this.subscribers.add(ws);
  }

  removeSubscriber(ws: WebSocket): void {
    this.subscribers.delete(ws);
  }

  async initializeDatabase(): Promise<void> {
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
            slack_ts        VARCHAR(50),
            created_at      TIMESTAMP   DEFAULT NOW()
        );

        -- Add slack_ts to existing tables that were created before this column existed
        ALTER TABLE alerts ADD COLUMN IF NOT EXISTS slack_ts VARCHAR(50);

        CREATE INDEX IF NOT EXISTS idx_alerts_timestamp    ON alerts(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_alerts_severity     ON alerts(severity);
        CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
        CREATE INDEX IF NOT EXISTS idx_alerts_category     ON alerts(category);
        CREATE INDEX IF NOT EXISTS idx_alerts_slack_ts     ON alerts(slack_ts);
      `);
      log('INFO', 'Alert database tables initialized');
    } catch (error) {
      log('ERROR', 'Failed to initialize alert database', { error: (error as Error).message });
      throw error;
    }
  }
}

export default EnhancedAlertEngine;
