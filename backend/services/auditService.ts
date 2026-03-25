/**
 * services/auditService.ts
 * ────────────────────────
 * Append-only audit log. Never UPDATE or DELETE rows here.
 * Call log() from any route after a significant action.
 */

import { Pool } from 'pg';

const S = 'pgmonitoringtool';

interface AuditEvent {
  actorId?: number | null;
  actorUsername: string;
  action: string; // e.g. 'USER_CREATED', 'ROLE_CHANGED'
  resourceType?: string; // e.g. 'user', 'api_key', 'session'
  resourceId?: string | number;
  level?: 'info' | 'warn' | 'critical' | 'success';
  detail?: string | null;
  metadata?: Record<string, any> | null;
  ip?: string | null;
}

interface AuditEventRow {
  id: number;
  actor_id: number | null;
  actor_username: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  level: string;
  detail: string | null;
  metadata: any;
  ip_address: string | null;
  created_at: string;
}

interface AuditListOptions {
  level?: string;
  action?: string;
  username?: string;
  limit?: number;
  offset?: number;
}

interface AuditListResult {
  rows: AuditEventRow[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Append one audit event.
 *
 * @param {Pool} pool PostgreSQL connection pool
 * @param {AuditEvent} event Audit event details
 */
export async function writeAudit(pool: Pool, event: AuditEvent): Promise<void> {
  const {
    actorId = null,
    actorUsername,
    action,
    resourceType = null,
    resourceId = null,
    level = 'info',
    detail = null,
    metadata = null,
    ip = null,
  } = event;

  await pool
    .query(
      `INSERT INTO ${S}.audit_log
        (actor_id, actor_username, action, resource_type, resource_id,
         level, detail, metadata, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::inet)`,
      [actorId, actorUsername, action, resourceType, resourceId !== null ? String(resourceId) : null, level, detail, metadata ? JSON.stringify(metadata) : null, ip]
    )
    .catch((err: Error) => {
      // Audit failures must never crash the main request
      console.error('[audit] write failed', err.message);
    });
}

/**
 * Paginated audit log for the UI.
 *
 * @param {Pool} pool PostgreSQL connection pool
 * @param {AuditListOptions} opts Query options
 */
export async function listAuditEvents(pool: Pool, opts: AuditListOptions = {}): Promise<AuditListResult> {
  const limit = Math.min(Number(opts.limit) || 50, 500);
  const offset = Math.max(Number(opts.offset) || 0, 0);

  const conditions: string[] = [];
  const params: any[] = [];

  if (opts.level) {
    params.push(opts.level);
    conditions.push(`level = $${params.length}`);
  }
  if (opts.action) {
    params.push(`%${opts.action}%`);
    conditions.push(`action ILIKE $${params.length}`);
  }
  if (opts.username) {
    params.push(`%${opts.username}%`);
    conditions.push(`actor_username ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const [dataRes, countRes] = await Promise.all([
    pool.query<AuditEventRow>(
      `SELECT id, actor_id, actor_username, action, resource_type, resource_id,
              level, detail, metadata, ip_address, created_at
       FROM   ${S}.audit_log
       ${where}
       ORDER  BY created_at DESC
       LIMIT  $${params.length - 1} OFFSET $${params.length}`,
      params
    ),
    pool.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ${S}.audit_log ${where}`,
      params.slice(0, -2)
    ),
  ]);

  return {
    rows: dataRes.rows,
    total: Number(countRes.rows[0].total),
    limit,
    offset,
  };
}
