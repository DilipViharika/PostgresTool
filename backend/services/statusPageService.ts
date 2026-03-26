/**
 * services/statusPageService.ts
 * ─────────────────────────────
 * Public status page service.
 * Tracks uptime, incidents, and provides sanitized public health status.
 */

import { Pool } from 'pg';

const S = 'pgmonitoringtool';

interface LogEntry {
  ts: string;
  level: string;
  msg: string;
  [key: string]: any;
}

interface PublicStatus {
  status: 'operational' | 'degraded' | 'down';
  statusColor: 'green' | 'yellow' | 'red';
  responseTimeMs: number;
  uptime: number;
  lastChecked: Date;
}

interface UptimeEntry {
  date: string;
  uptimePercent: number;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

interface IncidentInput {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  status?: 'investigating' | 'identified' | 'monitoring' | 'resolved';
}

interface IncidentUpdate {
  title?: string;
  description?: string;
  status?: string;
}

interface Component {
  name: string;
  status: string;
  uptime: number;
}

interface StatusSummary {
  overallStatus: 'operational' | 'degraded' | 'down';
  components: Component[];
  lastIncident?: Incident | null;
  uptimePercent: number;
}

interface StatusCheckRow {
  avg_uptime?: number;
  data?: Record<string, any>;
}

interface UptimeHistoryRow {
  date: Date;
  uptime_percent: number;
}

interface IncidentRow {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: Date;
  resolved_at?: Date;
}

function log(level: string, message: string, meta: Record<string, any> = {}): void {
  const entry: LogEntry = { ts: new Date().toISOString(), level, msg: message, ...meta };
  const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
  fn(JSON.stringify(entry));
}

/**
 * Get sanitized public health status.
 * @param {Pool} pool PostgreSQL connection pool
 * @returns {Promise<PublicStatus>}
 */
export async function getPublicStatus(pool: Pool): Promise<PublicStatus> {
  try {
    const startTime = Date.now();

    // Perform health check
    await pool.query('SELECT NOW()');
    const responseTime = Date.now() - startTime;

    // Get uptime from last 24 hours
    const uptimeRes = await pool.query<StatusCheckRow>(
      `SELECT ROUND(AVG(CAST(data->>'uptime_percent' AS numeric)), 2) as avg_uptime
       FROM   ${S}.status_checks
       WHERE  created_at >= NOW() - INTERVAL '24 hours'`
    );

    const uptime = uptimeRes.rows[0]?.avg_uptime || 100;

    // Determine status
    let status: 'operational' | 'degraded' | 'down' = 'operational';
    if (uptime < 99) {
      status = 'degraded';
    }
    if (uptime < 95 || responseTime > 5000) {
      status = 'down';
    }

    const statusColor = status === 'operational' ? 'green' : status === 'degraded' ? 'yellow' : 'red';

    return {
      status,
      statusColor,
      responseTimeMs: responseTime,
      uptime: parseFloat(uptime.toString()),
      lastChecked: new Date(),
    };
  } catch (err) {
    log('WARN', 'Health check failed', { error: (err as Error).message });
    return {
      status: 'down',
      statusColor: 'red',
      responseTimeMs: 0,
      uptime: 0,
      lastChecked: new Date(),
    };
  }
}

/**
 * Get daily uptime percentages for past N days.
 * @param {Pool} pool PostgreSQL connection pool
 * @param {number} days Number of days to retrieve
 * @returns {Promise<UptimeEntry[]>}
 */
export async function getUptimeHistory(pool: Pool, days: number = 30): Promise<UptimeEntry[]> {
  if (days <= 0) {
    throw new Error('days must be positive');
  }

  try {
    const res = await pool.query<UptimeHistoryRow>(
      `SELECT
        DATE(created_at) as date,
        ROUND(AVG(CAST(data->>'uptime_percent' AS numeric)), 2) as uptime_percent
       FROM   ${S}.status_checks
       WHERE  created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP  BY DATE(created_at)
       ORDER  BY date DESC`,
      [days]
    );

    return res.rows.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      uptimePercent: parseFloat(row.uptime_percent.toString()),
    }));
  } catch (err) {
    log('WARN', 'Failed to get uptime history', { error: (err as Error).message });
    return [];
  }
}

/**
 * List recent incidents/outages.
 * @param {Pool} pool PostgreSQL connection pool
 * @param {number} limit Maximum number of incidents to return
 * @returns {Promise<Incident[]>}
 */
export async function getIncidents(pool: Pool, limit: number = 10): Promise<Incident[]> {
  try {
    const res = await pool.query<IncidentRow>(
      `SELECT id, title, description, severity, status, created_at, resolved_at
       FROM   ${S}.incidents
       ORDER  BY created_at DESC
       LIMIT  $1`,
      [limit]
    );

    return res.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      severity: row.severity as 'info' | 'warning' | 'critical',
      status: row.status as 'investigating' | 'identified' | 'monitoring' | 'resolved',
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
    }));
  } catch (err) {
    log('WARN', 'Failed to get incidents', { error: (err as Error).message });
    return [];
  }
}

/**
 * Create a new incident.
 * @param {Pool} pool PostgreSQL connection pool
 * @param {IncidentInput} incident Incident details
 * @returns {Promise<string>} Incident ID
 */
export async function createIncident(pool: Pool, incident: IncidentInput): Promise<string> {
  const { title, description, severity, status = 'investigating' } = incident;

  if (!title || !description || !severity) {
    throw new Error('title, description, and severity are required');
  }

  if (!['info', 'warning', 'critical'].includes(severity)) {
    throw new Error('severity must be info, warning, or critical');
  }

  const res = await pool.query<{ id: string }>(
    `INSERT INTO ${S}.incidents (title, description, severity, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [title, description, severity, status]
  );

  const incidentId = res.rows[0].id;
  log('INFO', 'Incident created', { incidentId, severity });

  return incidentId;
}

/**
 * Update an existing incident.
 * @param {Pool} pool PostgreSQL connection pool
 * @param {string} incidentId Incident ID
 * @param {IncidentUpdate} updates Fields to update
 * @returns {Promise<void>}
 */
export async function updateIncident(pool: Pool, incidentId: string, updates: IncidentUpdate): Promise<void> {
  if (!incidentId) {
    throw new Error('incidentId is required');
  }

  const { title, description, status } = updates;

  const setClauses: string[] = [];
  const params: any[] = [];

  if (title !== undefined) {
    params.push(title);
    setClauses.push(`title = $${params.length}`);
  }
  if (description !== undefined) {
    params.push(description);
    setClauses.push(`description = $${params.length}`);
  }
  if (status !== undefined) {
    params.push(status);
    setClauses.push(`status = $${params.length}`);
  }

  if (setClauses.length === 0) {
    return; // No updates
  }

  params.push(incidentId);
  const setClause = setClauses.join(', ');

  await pool.query(
    `UPDATE ${S}.incidents
     SET ${setClause}, updated_at = NOW()
     WHERE id = $${params.length}`,
    params
  );

  log('INFO', 'Incident updated', { incidentId });
}

/**
 * Mark an incident as resolved.
 * @param {Pool} pool PostgreSQL connection pool
 * @param {string} incidentId Incident ID
 * @returns {Promise<void>}
 */
export async function resolveIncident(pool: Pool, incidentId: string): Promise<void> {
  if (!incidentId) {
    throw new Error('incidentId is required');
  }

  await pool.query(
    `UPDATE ${S}.incidents
     SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [incidentId]
  );

  log('INFO', 'Incident resolved', { incidentId });
}

/**
 * Get overall status summary with component breakdown.
 * @param {Pool} pool PostgreSQL connection pool
 * @returns {Promise<StatusSummary>}
 */
export async function getStatusSummary(pool: Pool): Promise<StatusSummary> {
  try {
    const publicStatus = await getPublicStatus(pool);

    // Get last incident
    const incidentRes = await pool.query<IncidentRow>(
      `SELECT title, severity FROM ${S}.incidents
       WHERE status != 'resolved'
       ORDER BY created_at DESC
       LIMIT 1`
    );

    const lastIncident = incidentRes.rows[0] || null;

    // Component status (we track PostgreSQL as main component)
    const components: Component[] = [
      {
        name: 'Database (PostgreSQL)',
        status: publicStatus.status,
        uptime: publicStatus.uptime,
      },
    ];

    // Get 24h uptime
    const uptimeRes = await pool.query<StatusCheckRow>(
      `SELECT ROUND(AVG(CAST(data->>'uptime_percent' AS numeric)), 2) as avg_uptime
       FROM   ${S}.status_checks
       WHERE  created_at >= NOW() - INTERVAL '24 hours'`
    );

    const uptimePercent = parseFloat((uptimeRes.rows[0]?.avg_uptime || 100).toString());

    return {
      overallStatus: publicStatus.status,
      components,
      lastIncident: lastIncident as any,
      uptimePercent,
    };
  } catch (err) {
    log('ERROR', 'Failed to get status summary', { error: (err as Error).message });
    throw err;
  }
}
