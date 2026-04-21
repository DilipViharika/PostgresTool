/**
 * routes/copilotRoutes.js
 * ───────────────────────
 * AI SQL copilot endpoints.
 *
 * Mount with:
 *   app.use('/api', copilotRoutes(pool, authenticate));
 *
 * Endpoints
 *   POST /api/copilot/sql        NL → SQL with schema context
 *   POST /api/copilot/explain    Review an EXPLAIN plan
 *   POST /api/copilot/rca        Draft an incident RCA
 *   GET  /api/copilot/history    Recent turns for the workspace
 *   GET  /api/copilot/provider   Current provider info (no secrets)
 */

import { Router } from 'express';
import {
    generateSql,
    explainPlan,
    draftIncidentRca,
    saveConversationTurn,
    getProvider,
    isSafeToRun,
} from '../services/copilotService.js';
import { resolveWorkspace } from '../middleware/workspaceRbac.js';
import { query } from '../db.js';

export default function copilotRoutes(pool, authenticate) {
    const router = Router();

    router.get('/copilot/provider', authenticate, (_req, res) => {
        const p = getProvider();
        res.json({ provider: p.name, model: p.model });
    });

    router.post('/copilot/sql', authenticate, resolveWorkspace, async (req, res, next) => {
        try {
            const { prompt, schema = 'public' } = req.body || {};
            if (!prompt || typeof prompt !== 'string') {
                return res.status(400).json({ error: 'prompt is required' });
            }
            const result = await generateSql(pool, { prompt, schema });
            await saveConversationTurn({
                workspaceId: req.workspace?.id,
                userId: req.user?.id,
                kind: 'sql',
                input: prompt,
                output: result.sql,
            });
            res.json(result);
        } catch (err) { next(err); }
    });

    router.post('/copilot/explain', authenticate, resolveWorkspace, async (req, res, next) => {
        try {
            const { plan, sql } = req.body || {};
            if (!plan) return res.status(400).json({ error: 'plan is required' });
            const result = await explainPlan(pool, { plan, sql });
            await saveConversationTurn({
                workspaceId: req.workspace?.id,
                userId: req.user?.id,
                kind: 'explain',
                input: sql || '(no sql)',
                output: result.review,
            });
            res.json(result);
        } catch (err) { next(err); }
    });

    router.post('/copilot/rca', authenticate, resolveWorkspace, async (req, res, next) => {
        try {
            const { incident } = req.body || {};
            if (!incident) return res.status(400).json({ error: 'incident is required' });
            const result = await draftIncidentRca(pool, { incident });
            await saveConversationTurn({
                workspaceId: req.workspace?.id,
                userId: req.user?.id,
                kind: 'rca',
                input: JSON.stringify(incident).slice(0, 4000),
                output: result.rca,
            });
            res.json(result);
        } catch (err) { next(err); }
    });

    router.get('/copilot/history', authenticate, resolveWorkspace, async (req, res, next) => {
        try {
            const limit = Math.min(Number(req.query.limit) || 50, 200);
            const { rows } = await query(
                `SELECT id, kind, input, output, created_at
                   FROM pgmonitoringtool.copilot_turns
                  WHERE workspace_id = $1
                  ORDER BY created_at DESC LIMIT $2`,
                [req.workspace.id, limit]
            );
            res.json({ turns: rows });
        } catch (err) {
            if (/relation .* does not exist/.test(err.message)) return res.json({ turns: [] });
            next(err);
        }
    });

    // Echo of the safety guard so clients can preflight without a provider call.
    router.post('/copilot/validate-sql', authenticate, (req, res) => {
        res.json(isSafeToRun(String(req.body?.sql || '')));
    });

    return router;
}
