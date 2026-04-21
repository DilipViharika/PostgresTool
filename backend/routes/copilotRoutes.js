/**
 * routes/copilotRoutes.js
 * ───────────────────────
 * AI SQL copilot endpoints.
 *
 * Factory signature matches the other DB-aware routes:
 *   app.use('/api', copilotRoutes(pool, authenticate, getPool))
 *     pool       — FATHOM control-plane pool (used for copilot_turns only)
 *     getPool    — (connectionId) => pg Pool for a MONITORED database.
 *                  Same helper already used by mysqlRoutes / explain.
 *
 * Endpoints
 *   POST /api/copilot/sql        NL → SQL with monitored-DB schema context
 *                                (editor role required — LLM cost gate)
 *   POST /api/copilot/explain    Review an EXPLAIN plan
 *   POST /api/copilot/rca        Draft an incident RCA
 *   GET  /api/copilot/history    Recent turns for the workspace
 *   GET  /api/copilot/provider   Current provider info (admin only)
 *   POST /api/copilot/validate-sql   Pure string safety check (no LLM call)
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
import { resolveWorkspace, requireWorkspaceRole } from '../middleware/workspaceRbac.js';
import { query } from '../db.js';

export default function copilotRoutes(pool, authenticate, getPool) {
    const router = Router();

    // LOW-1: admin role so the configured provider isn't leaked to every user.
    router.get('/copilot/provider',
        authenticate, resolveWorkspace, requireWorkspaceRole('admin'),
        (_req, res) => {
            const p = getProvider();
            res.json({ provider: p.name, model: p.model });
        }
    );

    // MED-1: editor role — LLM endpoints cost money; viewers cannot drive them.
    router.post('/copilot/sql',
        authenticate, resolveWorkspace, requireWorkspaceRole('editor'),
        async (req, res, next) => {
            try {
                const { prompt, schema = 'public', connectionId } = req.body || {};
                if (!prompt || typeof prompt !== 'string') {
                    return res.status(400).json({ error: 'prompt is required' });
                }
                if (!connectionId) {
                    return res.status(400).json({
                        error: 'connectionId is required — schema context is sourced from the monitored database',
                    });
                }
                let monitored = null;
                try {
                    monitored = typeof getPool === 'function'
                        ? await getPool(connectionId, req.user?.id)
                        : null;
                } catch (err) {
                    return res.status(400).json({ error: `unknown connectionId: ${err.message}` });
                }
                if (!monitored) {
                    return res.status(400).json({ error: 'unknown connectionId' });
                }
                const result = await generateSql(monitored, { prompt, schema });
                await saveConversationTurn({
                    workspaceId: req.workspace?.id,
                    userId: req.user?.id,
                    kind: 'sql',
                    input: prompt,
                    output: result.sql,
                });
                res.json(result);
            } catch (err) { next(err); }
        }
    );

    router.post('/copilot/explain',
        authenticate, resolveWorkspace, requireWorkspaceRole('editor'),
        async (req, res, next) => {
            try {
                const { plan, sql } = req.body || {};
                if (!plan) return res.status(400).json({ error: 'plan is required' });
                const result = await explainPlan(null, { plan, sql });
                await saveConversationTurn({
                    workspaceId: req.workspace?.id,
                    userId: req.user?.id,
                    kind: 'explain',
                    input: sql || '(no sql)',
                    output: result.review,
                });
                res.json(result);
            } catch (err) { next(err); }
        }
    );

    router.post('/copilot/rca',
        authenticate, resolveWorkspace, requireWorkspaceRole('editor'),
        async (req, res, next) => {
            try {
                const { incident } = req.body || {};
                if (!incident) return res.status(400).json({ error: 'incident is required' });
                const result = await draftIncidentRca(null, { incident });
                await saveConversationTurn({
                    workspaceId: req.workspace?.id,
                    userId: req.user?.id,
                    kind: 'rca',
                    input: JSON.stringify(incident).slice(0, 4000),
                    output: result.rca,
                });
                res.json(result);
            } catch (err) { next(err); }
        }
    );

    router.get('/copilot/history',
        authenticate, resolveWorkspace,
        async (req, res, next) => {
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
        }
    );

    // Pure string safety check — no LLM call, no cost — so this stays
    // available to any authenticated user for client-side preflight.
    router.post('/copilot/validate-sql', authenticate, (req, res) => {
        res.json(isSafeToRun(String(req.body?.sql || '')));
    });

    return router;
}
