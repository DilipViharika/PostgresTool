/**
 * services/retentionService.ts
 * ────────────────────────────
 * Historical data retention management.
 * Manages retention policies and executes cleanup based on retention settings.
 */

import { Pool } from 'pg';

const S = 'pgmonitoringtool';

interface LogEntry {
  ts: string;
  level: string;
  msg: string;
  [key: string]: any;
}

interface RetentionPolicy {
  orgId: number;
  metricsRetentionDays: number;
  logsRetentionDays: number;
  alertsRetentionDays: number;
  auditRetentionDays: number;
  updatedAt: Date;
}

interface RetentionStats {
  tableName: string;
  rowCount: number;
  sizeBytes: number;
  sizeMb: string;
}

interface RetentionCleanupResult {
  deleted: Record<string, number>;
}

interface DataGrowthTrend {
  days: number;
  totalRows: number;
  estimatedDailyRows: number;
  estimatedDailyMb: string;
}

interface RetentionPolicyInput {
  metricsRetentionDays?: number;
  logsRetentionDays?: number;
  alertsRetentionDays?: number;
  auditRetentionDays?: number;
}

interface RetentionPolicyRow {
  org_id: number;
  metrics_retention_days: number;
  logs_retention_days: number;
  alerts_retention_days: number;
  audit_retention_days: number;
  updated_at: Date;
}

function log(level: string, message: string, meta: Record<string, any> = {}): void {
  const entry: LogEntry = { ts: new Date().toISOString(), level, msg: message, ...meta };
  const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
  fn(JSON.stringify(entry));
}

/**
 * Get current retention policy for an organization.
 * @param {Pool} pool PostgreSQL connection pool
 * @param {number} orgId Organization ID
 * @returns {Promise<RetentionPolicy>}
 */
export async function getRetentionPolicy(pool: Pool, orgId: number): Promise<RetentionPolicy> {
  const res = await pool.query<RetentionPolicyRow>(
    `SELECT org_id, metrics_retention_days, logs_retention_days,
            alerts_retention_days, audit_retention_days, updated_at
     FROM   ${S}.retention_policies
     WHERE  org_id = $1`,
    [orgId]
  );

  if (res.rows.length === 0) {
    // Return defaults if not configured
    return {
      orgId,
      metricsRetentionDays: 30,
      logsRetentionDays: 90,
      alertsRetentionDays: 90,
      auditRetentionDays: 365,
      updatedAt: new Date(),
    };
  }

  const row = res.rows[0];
  return {
    orgId: row.org_id,
    metricsRetentionDays: row.metrics_retention_days,
    logsRetentionDays: row.logs_retention_days,
    alertsRetentionDays: row.alerts_retention_days,
    auditRetentionDays: row.audit_retention_days,
    updatedAt: row.updated_at,
  };
}

/**
 * Update retention policy for an organization.
 * @param {Pool} pool PostgreSQL connection pool
 * @param {number} orgId Organization ID
 * @param {RetentionPolicyInput} policy Policy settings
 * @returns {Promise<void>}
 */
export async function updateRetentionPolicy(pool: Pool, orgId: number, policy: RetentionPolicyInput): Promise<void> {
  const { metricsRetentionDays = 30, logsRetentionDays = 90, alertsRetentionDays = 90, auditRetentionDays = 365 } = policy;

  // Validate
  if (metricsRetentionDays <= 0 || logsRetentionDays <= 0 || alertsRetentionDays <= 0 || auditRetentionDays <= 0) {
    throw new Error('All retention days must be positive');
  }

  await pool.query(
    `INSERT INTO ${S}.retention_policies
      (org_id, metrics_retention_days, logs_retention_days, alerts_retention_days, audit_retention_days)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (org_id) DO UPDATE
     SET metrics_retention_days = $2,
         logs_retention_days = $3,
         alerts_retention_days = $4,
         audit_retention_days = $5,
         updated_at = NOW()`,
    [orgId, metricsRetentionDays, logsRetentionDays, alertsRetentionDays, auditRetentionDays]
  );

  log('INFO', 'Updated retention policy', { orgId, ...policy });
}

/**
 * Get current data sizes and row counts for all timeseries tables.
 * @param {Pool} pool PostgreSQL connection pool
 * @returns {Promise<RetentionStats[]>}
 */
export async function getRetentionStats(pool: Pool): Promise<RetentionStats[]> {
  const tables = ['otel_metrics', 'timeseries', 'audit_log', 'alert_history'];
  const stats: RetentionStats[] = [];

  for (const table of tables) {
    try {
      const countRes = await pool.query<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM ${S}.${table}`);
      const sizeRes = await pool.query<{ bytes: number }>(`SELECT pg_total_relation_size('${S}.${table}'::regclass) as bytes`);

      const rowCount = Number(countRes.rows[0].cnt);
      const sizeBytes = Number(sizeRes.rows[0].bytes);
      const sizeMb = (sizeBytes / 1024 / 1024).toFixed(2);

      stats.push({
        tableName: table,
        rowCount,
        sizeBytes,
        sizeMb: `${sizeMb} MB`,
      });
    } catch (err) {
      log('WARN', `Failed to get stats for table ${table}`, { error: (err as Error).message });
    }
  }

  return stats;
}

/**
 * Execute retention cleanup for an organization based on its policy.
 * @param {Pool} pool PostgreSQL connection pool
 * @param {number} orgId Organization ID
 * @returns {Promise<RetentionCleanupResult>}
 */
export async function runRetentionCleanup(pool: Pool, orgId: number): Promise<RetentionCleanupResult> {
  const policy = await getRetentionPolicy(pool, orgId);
  const deleted: Record<string, number> = {};

  try {
    // Delete old metrics
    const metricsRes = await pool.query(
      `DELETE FROM ${S}.otel_metrics
       WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
      [policy.metricsRetentionDays]
    );
    deleted.otel_metrics = metricsRes.rowCount || 0;

    // Delete old timeseries
    const timeseriesRes = await pool.query(
      `DELETE FROM ${S}.timeseries
       WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
      [policy.metricsRetentionDays]
    );
    deleted.timeseries = timeseriesRes.rowCount || 0;

    // Delete old audit logs
    const auditRes = await pool.query(
      `DELETE FROM ${S}.audit_log
       WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
      [policy.auditRetentionDays]
    );
    deleted.audit_log = auditRes.rowCount || 0;

    // Delete old alert history
    const alertRes = await pool.query(
      `DELETE FROM ${S}.alert_history
       WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
      [policy.alertsRetentionDays]
    );
    deleted.alert_history = alertRes.rowCount || 0;

    const totalDeleted = Object.values(deleted).reduce((a, b) => a + b, 0);
    log('INFO', 'Retention cleanup completed', { orgId, ...deleted });

    return { deleted };
  } catch (err) {
    log('ERROR', 'Retention cleanup failed', { orgId, error: (err as Error).message });
    throw err;
  }
}

/**
 * Estimate daily data growth rate over the past N days.
 * @param {Pool} pool PostgreSQL connection pool
 * @param {number} days Number of days to analyze
 * @returns {Promise<DataGrowthTrend>}
 */
export async function getDataGrowthTrend(pool: Pool, days: number = 7): Promise<DataGrowthTrend> {
  if (days <= 0) {
    throw new Error('days must be positive');
  }

  try {
    const res = await pool.query<{ total_rows: number; total_bytes: number }>(
      `SELECT
        COUNT(*) as total_rows,
        pg_total_relation_size('${S}.otel_metrics'::regclass) +
        pg_total_relation_size('${S}.timeseries'::regclass) +
        pg_total_relation_size('${S}.alert_history'::regclass) as total_bytes
       FROM ${S}.otel_metrics
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1`,
      [days]
    );

    const totalRows = Number(res.rows[0].total_rows);
    const totalBytes = Number(res.rows[0].total_bytes);
    const estimatedDailyRows = Math.round(totalRows / days);
    const estimatedDailyMb = (totalBytes / 1024 / 1024 / days).toFixed(2);

    return {
      days,
      totalRows,
      estimatedDailyRows,
      estimatedDailyMb: `${estimatedDailyMb} MB`,
    };
  } catch (err) {
    log('WARN', 'Failed to calculate growth trend', { error: (err as Error).message });
    return {
      days,
      totalRows: 0,
      estimatedDailyRows: 0,
      estimatedDailyMb: '0.00 MB',
    };
  }
}
