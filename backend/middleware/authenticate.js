/**
 * middleware/authenticate.js
 * ──────────────────────────
 * Drop-in replacement for the inline `authenticate` function in server.js.
 *
 * Changes vs original:
 *  - Supports both Bearer JWT and X-API-Key header
 *  - Checks session revocation table (user_sessions.is_active)
 *  - requireScreen() stays unchanged in API
 */

import jwt                          from 'jsonwebtoken';
import { isSessionActive, authenticateApiKey } from '../services/sessionService.js';

function log(level, message, meta = {}) {
    const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

/**
 * Per-API-key rate limiting
 * Tracks requests per minute for each API key
 */
const apiKeyRateLimits = new Map(); // { apiKey: { count, resetTime } }
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX = 100; // 100 requests per minute
// Hard cap on the bucket map so an attacker can't grow it without bound
// by sending requests under thousands of synthetic API keys. Map iteration
// order is insertion order, so dropping from the front evicts the oldest.
const API_KEY_BUCKET_MAX = 20_000;

/**
 * Check if API key has exceeded rate limit
 */
function checkApiKeyRateLimit(apiKey) {
    const now = Date.now();
    let bucket = apiKeyRateLimits.get(apiKey);

    if (!bucket || now > bucket.resetTime) {
        // Create or reset bucket
        if (apiKeyRateLimits.size >= API_KEY_BUCKET_MAX) {
            const overflow = apiKeyRateLimits.size - API_KEY_BUCKET_MAX + 1;
            let dropped = 0;
            for (const k of apiKeyRateLimits.keys()) {
                if (dropped >= overflow) break;
                apiKeyRateLimits.delete(k);
                dropped++;
            }
        }
        bucket = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
        apiKeyRateLimits.set(apiKey, bucket);
        return true; // Within limit
    }

    bucket.count++;
    return bucket.count <= RATE_LIMIT_MAX;
}

/**
 * Cleanup stale rate limit entries (run every 60 seconds)
 */
function startRateLimitCleanup() {
    setInterval(() => {
        const now = Date.now();
        for (const [key, bucket] of apiKeyRateLimits.entries()) {
            if (now > bucket.resetTime) {
                apiKeyRateLimits.delete(key);
            }
        }
    }, 60 * 1000);
}

// Start cleanup on module load
startRateLimitCleanup();

/**
 * Build the authenticate middleware with access to pool and config.
 * Call once at app startup:
 *   app.use('/api/...', buildAuthenticate(pool, CONFIG))
 *
 * Or assign to a variable and pass as middleware:
 *   const authenticate = buildAuthenticate(pool, CONFIG);
 */
export function buildAuthenticate(pool, config) {
    return async function authenticate(req, res, next) {
        // ── API Key auth (X-API-Key header) ─────────────────────────────
        const apiKey = req.headers['x-api-key'];
        if (apiKey) {
            // Check rate limit before authenticating
            if (!checkApiKeyRateLimit(apiKey)) {
                return res.status(429).json({ error: 'Rate limit exceeded (100 requests per minute per API key)' });
            }

            const user = await authenticateApiKey(pool, apiKey).catch(() => null);
            if (!user) return res.status(401).json({ error: 'Invalid API key' });
            if (user.status !== 'active') return res.status(403).json({ error: 'Account suspended' });
            req.user = {
                id:             user.id,
                username:       user.username,
                role:           user.role,
                allowedScreens: user.allowed_screens ?? [],
                accessLevel:    user.access_level,
            };
            return next();
        }

        // ── JWT Bearer auth ──────────────────────────────────────────────
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing token' });
        }

        let payload;
        try {
            payload = jwt.verify(header.slice(7), config.JWT_SECRET, {
                audience: config.JWT_AUDIENCE || 'fathom-api',
                issuer:   config.JWT_ISSUER   || 'fathom-auth',
            });
        } catch {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Session revocation check (sid stored in JWT on login).
        // SEC-05 (audit): fail-CLOSED — if the lookup throws (e.g. admin DB
        // unreachable) we MUST NOT treat the session as active, otherwise a
        // revoked token would silently keep working during DB blips.
        //
        // SEC-11: legacy tokens minted before the sid claim was added are now
        // rejected outright. Such a token cannot be revoked via the session
        // table, so accepting it (even with a warning header) means a stolen
        // pre-rollover JWT keeps working forever. Clients must re-authenticate.
        if (!payload.sid) {
            log('WARN', 'Rejecting legacy token without sid claim', {
                component: 'auth',
                userId: payload.id,
            });
            res.set('X-Token-Upgrade-Required', 'true');
            return res.status(401).json({
                error: 'Token must be reissued (missing sid claim) — please log in again',
            });
        }
        let active;
        try {
            active = await isSessionActive(pool, payload.sid);
        } catch (err) {
            log('ERROR', 'Session revocation lookup failed', {
                component: 'auth',
                sid: payload.sid,
                error: err.message,
            });
            return res.status(503).json({ error: 'Session validation unavailable, try again' });
        }
        if (!active) return res.status(401).json({ error: 'Session revoked' });

        req.user = payload;
        next();
    };
}

/**
 * Block API access until the user has changed their (forced) password.
 *
 * Mounted after `authenticate` so `req.user` is populated. The flag lives
 * on the user row, not the JWT, so we re-read it from the DB on every
 * request (cheap query, indexed PK lookup). Allowed escape hatches:
 *   - POST /api/auth/change-password   (the actual change)
 *   - POST /api/auth/logout            (so a user can bail out)
 *   - GET  /api/auth/me                (so the frontend can render the
 *                                       "change your password" screen)
 *   - GET  /api/csrf-token             (front-end bootstrap)
 *
 * Tokens minted before this middleware existed don't carry an
 * `mustChangePassword` claim, so the DB read is authoritative.
 */
const PASSWORD_CHANGE_BYPASS = new Set([
    'POST /api/auth/change-password',
    'POST /api/auth/logout',
    'GET /api/auth/me',
    'GET /api/csrf-token',
]);

export function buildEnforcePasswordChange(pool) {
    return async function enforcePasswordChange(req, res, next) {
        if (!req.user?.id) return next();
        const key = `${req.method} ${req.path}`;
        if (PASSWORD_CHANGE_BYPASS.has(key)) return next();

        try {
            const { rows } = await pool.query(
                'SELECT must_change_password FROM pgmonitoringtool.users WHERE id = $1 AND deleted_at IS NULL',
                [req.user.id]
            );
            if (rows[0]?.must_change_password) {
                return res.status(403).json({
                    error: 'password_change_required',
                    detail: 'You must change your password before using the API. POST /api/auth/change-password.',
                });
            }
        } catch (err) {
            // Fail-OPEN: if the lookup fails (e.g. admin DB blip) we don't
            // want to lock every authenticated user out. We do log so the
            // failure is visible.
            log('WARN', 'must_change_password lookup failed', {
                userId: req.user.id,
                error: err.message,
            });
        }
        next();
    };
}

/**
 * requireScreen — unchanged API from the original server.js.
 * Guards a route to users whose allowedScreens includes `screen`.
 *
 * @param {string} screen
 */
export function requireScreen(screen) {
    return (req, res, next) => {
        if (!req.user?.allowedScreens?.includes(screen)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
}

/**
 * requireRole — additional guard for role-based access.
 * @param {...string} roles
 */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({ error: 'Insufficient role' });
        }
        next();
    };
}