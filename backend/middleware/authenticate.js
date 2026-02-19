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
import { isSessionActive }          from '../services/sessionService.js';
import { authenticateApiKey }       from '../services/sessionService.js';

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
            payload = jwt.verify(header.slice(7), config.JWT_SECRET);
        } catch {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Optional session revocation check (sid stored in JWT on login)
        if (payload.sid) {
            const active = await isSessionActive(pool, payload.sid).catch(() => true);
            if (!active) return res.status(401).json({ error: 'Session revoked' });
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