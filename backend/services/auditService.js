/**
 * services/auditService.js
 * ────────────────────────
 * Append-only audit log. Never UPDATE or DELETE rows here.
 * Call log() from any route after a significant action.
 */

const S = 'pgmonitoringtool';

/**
 * Append one audit event.
 *
 * @param {import('pg').Pool} pool
 * @param {{
 *   actorId?:      number|null,
 *   actorUsername: string,
 *   action:        string,          // e.g. 'USER_CREATED', 'ROLE_CHANGED'
 *   resourceType?: string,          // e.g. 'user', 'api_key', 'session'
 *   resourceId?:   string|number,
 *   level?:        'info'|'warn'|'critical'|'success',
 *   detail?:       string,
 *   metadata?:     object,
 *   ip?:           string,
 * }} event
 */
export async function writeAudit(pool, event) {
    const {
        actorId      = null,
        actorUsername,
        action,
        resourceType = null,
        resourceId   = null,
        level        = 'info',
        detail       = null,
        metadata     = null,
        ip           = null,
    } = event;

    await pool.query(
        `INSERT INTO ${S}.audit_log
            (actor_id, actor_username, action, resource_type, resource_id,
             level, detail, metadata, ip_address)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::inet)`,
        [
            actorId,
            actorUsername,
            action,
            resourceType,
            resourceId !== null ? String(resourceId) : null,
            level,
            detail,
            metadata ? JSON.stringify(metadata) : null,
            ip,
        ]
    ).catch(err => {
        // Audit failures must never crash the main request
        console.error('[audit] write failed', err.message);
    });
}

/**
 * Paginated audit log for the UI.
 *
 * @param {import('pg').Pool} pool
 * @param {{ level?: string, action?: string, limit?: number, offset?: number }} opts
 */
export async function listAuditEvents(pool, opts = {}) {
    const limit  = Math.min(Number(opts.limit)  || 50,  500);
    const offset = Math.max(Number(opts.offset) || 0,   0);

    const conditions = [];
    const params     = [];

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
        pool.query(
            `SELECT id, actor_id, actor_username, action, resource_type, resource_id,
                    level, detail, metadata, ip_address, created_at
             FROM   ${S}.audit_log
             ${where}
             ORDER  BY created_at DESC
             LIMIT  $${params.length - 1} OFFSET $${params.length}`,
            params
        ),
        pool.query(
            `SELECT COUNT(*) AS total FROM ${S}.audit_log ${where}`,
            params.slice(0, -2)
        ),
    ]);

    return {
        rows:   dataRes.rows,
        total:  Number(countRes.rows[0].total),
        limit,
        offset,
    };
}