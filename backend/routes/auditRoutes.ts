/**
 * routes/auditRoutes.ts
 * ─────────────────────
 * Audit log read endpoints for the Audit Log tab.
 * Mount with:
 *   app.use('/api', auditRoutes(pool, authenticate, requireScreen));
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { listAuditEvents } from '../services/auditService';

function log(level: string, message: string, meta: Record<string, any> = {}): void {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export default function auditRoutes(pool: Pool, authenticate: any, requireScreen: any): Router {
    const router = Router();
    const isAdmin = [authenticate, requireScreen('admin')];

    /* ── GET /api/audit ────────────────────────────────────────────────────
       Paginated, filterable audit log.
       Query params: level, action, username, limit, offset               */
    router.get('/audit', ...isAdmin, async (req: Request, res: Response) => {
        try {
            const result = await listAuditEvents(pool, {
                level: req.query.level as string | undefined,
                action: req.query.action as string | undefined,
                username: req.query.username as string | undefined,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                offset: req.query.offset ? Number(req.query.offset) : undefined,
            });
            res.json(result);
        } catch (err: any) {
            log('ERROR', 'Failed to fetch audit log', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
