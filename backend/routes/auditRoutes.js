/**
 * routes/auditRoutes.js
 * ─────────────────────
 * Audit log read endpoints for the Audit Log tab.
 * Mount with:
 *   app.use('/api', auditRoutes(pool, authenticate, requireScreen));
 */

import { Router }        from 'express';
import { listAuditEvents } from '../services/auditService.js';

function log(level, message, meta = {}) {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export default function auditRoutes(pool, authenticate, requireScreen) {
    const router  = Router();
    const isAdmin = [authenticate, requireScreen('admin')];

    /* ── GET /api/audit ────────────────────────────────────────────────────
       Paginated, filterable audit log.
       Query params: level, action, username, limit, offset               */
    router.get('/audit', ...isAdmin, async (req, res) => {
        try {
            const result = await listAuditEvents(pool, {
                level:    req.query.level,
                action:   req.query.action,
                username: req.query.username,
                limit:    req.query.limit,
                offset:   req.query.offset,
            });
            res.json(result);
        } catch (err) {
            log('ERROR', 'Failed to fetch audit log', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}