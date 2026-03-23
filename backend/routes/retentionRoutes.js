/**
 * routes/retentionRoutes.js
 * ─────────────────────────
 * Data retention management endpoints.
 * Mount with:
 *   app.use('/api', retentionRoutes(pool, authenticate, requireRole));
 */

import { Router } from 'express';
import {
    getRetentionPolicy,
    updateRetentionPolicy,
    getRetentionStats,
    runRetentionCleanup,
    getDataGrowthTrend,
} from '../services/retentionService.js';

function log(level, message, meta = {}) {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export default function retentionRoutes(pool, authenticate, requireRole) {
    const router = Router();
    const isAdmin = [authenticate, requireRole('admin')];

    /* ── GET /api/retention/policy ──────────────────────────────────────────────
       Get current retention policy for organization.                            */
    router.get('/retention/policy', authenticate, async (req, res) => {
        try {
            // For now, use org_id 1 as default; in multi-tenant system, extract from req.user
            const orgId = req.user?.orgId || 1;

            const policy = await getRetentionPolicy(pool, orgId);
            res.json(policy);
        } catch (err) {
            log('ERROR', 'Failed to get retention policy', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── PUT /api/retention/policy ──────────────────────────────────────────────
       Update retention policy (admin only).                                    */
    router.put('/retention/policy', ...isAdmin, async (req, res) => {
        try {
            const orgId = req.user?.orgId || 1;
            const policy = {
                metricsRetentionDays: req.body.metricsRetentionDays,
                logsRetentionDays: req.body.logsRetentionDays,
                alertsRetentionDays: req.body.alertsRetentionDays,
                auditRetentionDays: req.body.auditRetentionDays,
            };

            await updateRetentionPolicy(pool, orgId, policy);

            log('INFO', 'Retention policy updated', { orgId, ...policy });
            res.json({
                success: true,
                message: 'Retention policy updated',
                policy,
            });
        } catch (err) {
            log('ERROR', 'Failed to update retention policy', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/retention/stats ───────────────────────────────────────────────
       Get data size and row count statistics.                                  */
    router.get('/retention/stats', authenticate, async (req, res) => {
        try {
            const stats = await getRetentionStats(pool);
            res.json({ stats });
        } catch (err) {
            log('ERROR', 'Failed to get retention stats', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── POST /api/retention/cleanup ────────────────────────────────────────────
       Trigger manual cleanup (admin only).                                     */
    router.post('/retention/cleanup', ...isAdmin, async (req, res) => {
        try {
            const orgId = req.user?.orgId || 1;

            const result = await runRetentionCleanup(pool, orgId);

            log('INFO', 'Manual retention cleanup executed', { orgId, ...result.deleted });
            res.json({
                success: true,
                message: 'Cleanup completed',
                ...result,
            });
        } catch (err) {
            log('ERROR', 'Failed to run retention cleanup', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/retention/growth ──────────────────────────────────────────────
       Get data growth trend estimate.
       Query params: days (default 7)                                            */
    router.get('/retention/growth', authenticate, async (req, res) => {
        try {
            const days = Number(req.query.days) || 7;
            const trend = await getDataGrowthTrend(pool, days);

            res.json(trend);
        } catch (err) {
            log('ERROR', 'Failed to get growth trend', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
