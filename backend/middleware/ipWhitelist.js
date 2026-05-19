/**
 * middleware/ipWhitelist.js
 * ────────────────────────
 * Checks incoming IP against the organization's whitelist.
 * Only enforced for orgs that have IP whitelisting enabled.
 * Enterprise tier feature.
 */

import { isIpAllowed } from '../enterprise/security/ipWhitelistService.js';
import { isFeatureEnabled } from '../enterprise/licensing/licenseService.js';

function log(level, message, meta = {}) {
    const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export function ipWhitelistMiddleware(pool) {
    return async function (req, res, next) {
        const orgId = req.orgId;

        // No org context or super_admin — skip
        if (!orgId || req.user?.role === 'super_admin') return next();

        try {
            // Check if IP whitelisting is enabled for this org's license
            const enabled = await isFeatureEnabled(pool, orgId, 'ip_whitelisting');
            if (!enabled) return next();

            const clientIp = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
            if (!clientIp) return next();

            const allowed = await isIpAllowed(pool, orgId, clientIp);
            if (!allowed) {
                return res.status(403).json({
                    error: 'Access denied: IP not whitelisted',
                    ip: clientIp
                });
            }
            next();
        } catch (err) {
            log('ERROR', 'IP whitelist check failed', {
                component: 'ipWhitelist',
                orgId,
                error: err.message,
            });
            // Fail open — don't block users if whitelist check fails
            next();
        }
    };
}
