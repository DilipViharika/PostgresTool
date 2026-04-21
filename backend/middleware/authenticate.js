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

/**
 * Per-API-key rate limiting
 * Tracks requests per minute for each API key
 */
const apiKeyRateLimits = new Map(); // { apiKey: { count, resetTime } }
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX = 100; // 100 requests per minute

/**
 * Check if API key has exceeded rate limit
 */
function checkApiKeyRateLimit(apiKey) {
    const now = Date.now();
    let bucket = apiKeyRateLimits.get(apiKey);

    if (!bucket || now > bucket.resetTime) {
        // Create or reset bucket
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
        if (payload.sid) {
            let active;
            try {
                active = await isSessionActive(pool, payload.sid);
            } catch (err) {
                console.error('[SECURITY] Session revocation lookup failed', {
                    sid: payload.sid,
                    error: err.message,
                });
                return res.status(503).json({ error: 'Session validation unavailable, try again' });
            }
            if (!active) return res.status(401).json({ error: 'Session revoked' });
        } else {
            // Legacy token without sid detected — could be revoked but cannot verify
            // Log warning and set upgrade header to prompt frontend re-authentication
            console.warn('[SECURITY] Token without sid detected — legacy token may be revoked', {
                userId: payload.id,
                timestamp: new Date().toISOString(),
            });
            res.set('X-Token-Upgrade-Required', 'true');
        }

        req.user = payload;
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