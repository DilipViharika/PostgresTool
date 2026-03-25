/**
 * middleware/tenantIsolation.ts
 * ─────────────────────────────
 * Ensures all API requests are scoped to the user's active organization.
 * Requires authentication middleware to have run first (req.user must exist).
 *
 * Usage:
 *   app.use('/api/...', authenticate, tenantIsolation(pool));
 */

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { getUserOrganizations } from '../enterprise/organization/orgService.js';
import '../types/express.js';

interface UserOrganization {
  id: number;
  name: string;
  role: string;
  [key: string]: any;
}

export function tenantIsolation(pool: Pool) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    // Skip for super_admin — they can access all orgs
    if (req.user?.role === 'super_admin') {
      req.orgId = req.headers['x-org-id'] ? parseInt(req.headers['x-org-id'] as string) : undefined;
      return next();
    }

    const orgId = req.headers['x-org-id'];
    if (!orgId) {
      // No org context — use default behavior (backward compatible)
      req.orgId = undefined;
      return next();
    }

    try {
      // Verify user belongs to the org
      const userOrgs = await getUserOrganizations(pool, req.user!.id as number);
      const membership = userOrgs.find((o: UserOrganization) => o.id === parseInt(orgId as string));

      if (!membership) {
        res.status(403).json({ error: 'Access denied to this organization' });
        return;
      }

      req.orgId = parseInt(orgId as string);
      req.orgRole = membership.role; // 'owner', 'admin', 'member', 'viewer'
      next();
    } catch (err) {
      console.error('[tenantIsolation] Error:', (err as Error).message);
      res.status(500).json({ error: 'Failed to verify organization access' });
    }
  };
}

/**
 * Require a minimum organization role.
 * Must run after tenantIsolation.
 */
export function requireOrgRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user?.role === 'super_admin') return next();
    if (!req.orgRole || !roles.includes(req.orgRole)) {
      res.status(403).json({ error: 'Insufficient organization role' });
      return;
    }
    next();
  };
}
