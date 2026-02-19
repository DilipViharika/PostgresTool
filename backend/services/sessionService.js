/**
 * services/sessionService.js
 * ──────────────────────────
 * DB operations for user_sessions and user_api_keys.
 * Also handles login_activity stamping on every auth event.
 */

import crypto from 'crypto';

const S = 'pgmonitoringtool';

/* ─── SESSION HELPERS ──────────────────────────────────────────────────────── */

function toClientSession(row) {
    return {
        id:          row.id,
        userId:      row.user_id,
        user:        row.user_name ?? row.username,
        ip:          row.ip_address,
        device:      row.device_label,
        location:    row.location,
        risk:        row.risk_level,
        active:      row.is_active,
        expiresAt:   row.expires_at,
        createdAt:   row.created_at,
    };
}

/**
 * Create a session record when a user logs in.
 * Returns the UUID session id (store in JWT as `sid` for revocation checks).
 */
export async function createSession(pool, { userId, ip, userAgent, deviceLabel, location, riskLevel = 'low' }) {
    const { rows } = await pool.query(
        `INSERT INTO ${S}.user_sessions
            (user_id, ip_address, user_agent, device_label, location, risk_level)
         VALUES ($1, $2::inet, $3, $4, $5, $6)
         RETURNING id`,
        [userId, ip ?? null, userAgent ?? null, deviceLabel ?? null, location ?? null, riskLevel]
    );
    return rows[0].id;
}

/**
 * Verify a session is still active and not expired.
 * Call this in the authenticate middleware for revocation support.
 */
export async function isSessionActive(pool, sessionId) {
    const { rows } = await pool.query(
        `SELECT 1 FROM ${S}.user_sessions
         WHERE id = $1 AND is_active = TRUE AND expires_at > NOW()`,
        [sessionId]
    );
    return rows.length > 0;
}

/** All active sessions for admin Security panel. */
export async function listActiveSessions(pool) {
    const { rows } = await pool.query(
        `SELECT * FROM ${S}.v_active_sessions ORDER BY created_at DESC`
    );
    return rows.map(toClientSession);
}

/** Active sessions for a specific user (User detail drawer). */
export async function listUserSessions(pool, userId) {
    const { rows } = await pool.query(
        `SELECT * FROM ${S}.user_sessions
         WHERE user_id = $1 AND is_active = TRUE AND expires_at > NOW()
         ORDER BY created_at DESC`,
        [userId]
    );
    return rows.map(toClientSession);
}

/** Revoke a single session by UUID. Returns true if it was active. */
export async function revokeSession(pool, sessionId, revokedBy = null) {
    const { rowCount } = await pool.query(
        `UPDATE ${S}.user_sessions
         SET is_active  = FALSE,
             revoked_at = NOW(),
             revoked_by = $2
         WHERE id = $1 AND is_active = TRUE`,
        [sessionId, revokedBy]
    );
    return rowCount > 0;
}

/** Revoke all active sessions for a user (admin action or user logout-all). */
export async function revokeAllUserSessions(pool, userId, revokedBy = null) {
    const { rowCount } = await pool.query(
        `UPDATE ${S}.user_sessions
         SET is_active  = FALSE,
             revoked_at = NOW(),
             revoked_by = $2
         WHERE user_id = $1 AND is_active = TRUE`,
        [userId, revokedBy]
    );
    return rowCount;
}

/** Revoke every active session across all users (admin emergency action). */
export async function revokeAllSessions(pool, revokedBy = null) {
    const { rowCount } = await pool.query(
        `UPDATE ${S}.user_sessions
         SET is_active  = FALSE,
             revoked_at = NOW(),
             revoked_by = $1
         WHERE is_active = TRUE`,
        [revokedBy]
    );
    return rowCount;
}

/* ─── LOGIN ACTIVITY ───────────────────────────────────────────────────────── */

/**
 * Increment the daily login counter for a user.
 * Call after every successful authentication.
 */
export async function recordLogin(pool, userId) {
    await pool.query(
        `INSERT INTO ${S}.user_login_activity (user_id, day, login_count, failed_count)
         VALUES ($1, CURRENT_DATE, 1, 0)
         ON CONFLICT (user_id, day)
         DO UPDATE SET login_count = ${S}.user_login_activity.login_count + 1`,
        [userId]
    );
}

/**
 * Increment the daily failed-login counter.
 * Call after every failed authentication attempt.
 */
export async function recordFailedLogin(pool, userId) {
    await pool.query(
        `INSERT INTO ${S}.user_login_activity (user_id, day, login_count, failed_count)
         VALUES ($1, CURRENT_DATE, 0, 1)
         ON CONFLICT (user_id, day)
         DO UPDATE SET failed_count = ${S}.user_login_activity.failed_count + 1`,
        [userId]
    );
}

/**
 * 28-day heatmap data for a single user.
 * Returns array of 28 numbers (0-padded if day has no record).
 */
export async function getLoginHeatmap(pool, userId) {
    const { rows } = await pool.query(
        `SELECT day, login_count
         FROM   ${S}.user_login_activity
         WHERE  user_id = $1
           AND  day >= CURRENT_DATE - INTERVAL '27 days'
         ORDER  BY day ASC`,
        [userId]
    );

    // Build a full 28-slot array padded with 0 for missing days
    const map = Object.fromEntries(rows.map(r => [r.day.toISOString().slice(0, 10), Number(r.login_count)]));
    return Array.from({ length: 28 }, (_, i) => {
        const d = new Date(Date.now() - (27 - i) * 86_400_000).toISOString().slice(0, 10);
        return map[d] ?? 0;
    });
}

/* ─── API KEYS ─────────────────────────────────────────────────────────────── */

function toClientKey(row) {
    return {
        id:         row.id,
        userId:     row.user_id,
        name:       row.name,
        prefix:     row.key_prefix,
        scope:      row.scope,
        totalCalls: Number(row.total_calls),
        lastUsedAt: row.last_used_at ?? null,
        status:     row.status,
        createdAt:  row.created_at,
    };
}

/**
 * Generate a new API key.
 * Returns { key, record } — `key` is the full plaintext shown ONCE to the user.
 */
export async function createApiKey(pool, userId, name, scope = 'read:all') {
    const rawKey   = `pk_live_${crypto.randomBytes(18).toString('base64url')}`;
    const prefix   = rawKey.slice(0, 12);
    const keyHash  = crypto.createHash('sha256').update(rawKey).digest('hex');

    const { rows } = await pool.query(
        `INSERT INTO ${S}.user_api_keys (user_id, name, key_prefix, key_hash, scope)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, name, prefix, keyHash, scope]
    );
    return { key: rawKey, record: toClientKey(rows[0]) };
}

/** List active API keys for a user (prefix shown, hash never returned). */
export async function listApiKeys(pool, userId = null) {
    const { rows } = await pool.query(
        `SELECT * FROM ${S}.user_api_keys
         WHERE status = 'active'
           AND ($1::int IS NULL OR user_id = $1)
         ORDER BY created_at DESC`,
        [userId]
    );
    return rows.map(toClientKey);
}

/** Revoke an API key. Returns true if it was active. */
export async function revokeApiKey(pool, keyId, revokedBy = null) {
    const { rowCount } = await pool.query(
        `UPDATE ${S}.user_api_keys
         SET status     = 'revoked',
             revoked_at = NOW(),
             revoked_by = $2
         WHERE id = $1 AND status = 'active'`,
        [keyId, revokedBy]
    );
    return rowCount > 0;
}

/**
 * Authenticate an API key from a request.
 * Returns the associated user row or null.
 */
export async function authenticateApiKey(pool, rawKey) {
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const { rows } = await pool.query(
        `SELECT u.* FROM ${S}.user_api_keys k
         JOIN   ${S}.users u ON u.id = k.user_id
         WHERE  k.key_hash = $1
           AND  k.status   = 'active'
           AND  u.deleted_at IS NULL`,
        [keyHash]
    );
    if (!rows[0]) return null;

    // Bump call counter asynchronously (don't await — don't slow the request)
    pool.query(
        `UPDATE ${S}.user_api_keys
         SET total_calls = total_calls + 1, last_used_at = NOW()
         WHERE key_hash = $1`, [keyHash]
    ).catch(() => {});

    return rows[0];
}