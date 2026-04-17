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

/** SEC-005: Safely parse org ID — rejects NaN, negative, zero, non-integer, and overflow values */
function safeParseOrgId(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0 || num > Number.MAX_SAFE_INTEGER) return undefined;
  return num;
}

export function tenantIsolation(pool: Pool) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    // Skip for super_admin — they can access all orgs
    if (req.user?.role === 'super_admin') {
      const orgIdHeader = safeParseOrgId(req.headers['x-org-id'] as string);
      if (orgIdHeader) {
        // SEC-020: Validate org exists even for super admins
        try {
          const { rows } = await pool.query('SELECT id FROM vigil_schema.organizations WHERE id = $1', [orgIdHeader]);
          if (rows.length === 0) {
            res.status(404).json({ error: 'Organization not found' });
            return;
          }
        } catch {
          // If org table doesn't exist yet, allow super admin through
        }
      }
      req.orgId = orgIdHeader;
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
      const parsedOrgId = safeParseOrgId(orgId as string);
      if (!parsedOrgId) {
        res.status(400).json({ error: 'Invalid organization ID' });
        return;
      }
      const membership = userOrgs.find((o: UserOrganization) => o.id === parsedOrgId);

      if (!membership) {
        res.status(403).json({ error: 'Access denied to this organization' });
        return;
      }

      req.orgId = parsedOrgId;
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
