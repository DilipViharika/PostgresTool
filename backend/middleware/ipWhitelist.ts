/**
 * middleware/ipWhitelist.ts
 * ────────────────────────
 * Checks incoming IP against the organization's whitelist.
 * Only enforced for orgs that have IP whitelisting enabled.
 * Enterprise tier feature.
 */

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { isIpAllowed } from '../enterprise/security/ipWhitelistService.js';
import { isFeatureEnabled } from '../enterprise/licensing/licenseService.js';
import '../types/express.js';

export function ipWhitelistMiddleware(pool: Pool) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    const orgId = req.orgId;

    // No org context or super_admin — skip
    if (!orgId || req.user?.role === 'super_admin') return next();

    try {
      // Check if IP whitelisting is enabled for this org's license
      const enabled = await isFeatureEnabled(pool, String(orgId), 'ip_whitelisting');
      if (!enabled) return next();

      const clientIp = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
      if (!clientIp) return next();

      const allowed = await isIpAllowed(pool, String(orgId), clientIp);
      if (!allowed) {
        res.status(403).json({
          error: 'Access denied: IP not whitelisted',
          ip: clientIp,
        });
        return;
      }
      next();
    } catch (err) {
      console.error('[ipWhitelist] Error:', (err as Error).message);
      // SEC-014: Fail closed — block access if whitelist check fails
      res.status(503).json({
        error: 'IP whitelist service temporarily unavailable. Access denied for safety.',
      });
      return;
    }
  };
}
