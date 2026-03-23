/**
 * middleware/tenantIsolation.js
 * ─────────────────────────────
 * Ensures all API requests are scoped to the user's active organization.
 * Requires authentication middleware to have run first (req.user must exist).
 *
 * Usage:
 *   app.use('/api/...', authenticate, tenantIsolation(pool));
 */

import { getUserOrganizations } from '../enterprise/organization/orgService.js';

export function tenantIsolation(pool) {
    return async function (req, res, next) {
        // Skip for super_admin — they can access all orgs
        if (req.user?.role === 'super_admin') {
            req.orgId = req.headers['x-org-id'] ? parseInt(req.headers['x-org-id']) : null;
            return next();
        }

        const orgId = req.headers['x-org-id'];
        if (!orgId) {
            // No org context — use default behavior (backward compatible)
            req.orgId = null;
            return next();
        }

        try {
            // Verify user belongs to the org
            const userOrgs = await getUserOrganizations(pool, req.user.id);
            const membership = userOrgs.find(o => o.id === parseInt(orgId));

            if (!membership) {
                return res.status(403).json({ error: 'Access denied to this organization' });
            }

            req.orgId = parseInt(orgId);
            req.orgRole = membership.role; // 'owner', 'admin', 'member', 'viewer'
            next();
        } catch (err) {
            console.error('[tenantIsolation] Error:', err.message);
            return res.status(500).json({ error: 'Failed to verify organization access' });
        }
    };
}

/**
 * Require a minimum organization role.
 * Must run after tenantIsolation.
 */
export function requireOrgRole(...roles) {
    return (req, res, next) => {
        if (req.user?.role === 'super_admin') return next();
        if (!req.orgRole || !roles.includes(req.orgRole)) {
            return res.status(403).json({ error: 'Insufficient organization role' });
        }
        next();
    };
}
