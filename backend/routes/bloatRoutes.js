/**
 * routes/bloatRoutes.js
 * ─────────────────────
 * Postgres bloat and vacuum analysis endpoints.
 *
 * GET  /advisor/bloat/tables?connectionId=&schema=
 * GET  /advisor/bloat/indexes?connectionId=&schema=
 * GET  /advisor/bloat/autovacuum?connectionId=
 * POST /advisor/bloat/preview-vacuum body: { schema, table, full?, analyze? }
 *
 * Mount with:
 *   app.use(prefix, bloatRoutes(pool, authenticate, getPool, ...))
 */

import { Router } from 'express';
import {
    estimateTableBloat,
    estimateIndexBloat,
    getAutovacuumLag,
    recommendVacuum,
    generateVacuumDdl,
    formatBytes,
} from '../services/bloatWatcher.js';
import { resolveWorkspace, requireWorkspaceRole } from '../middleware/workspaceRbac.js';

export default function bloatRoutes(
    pool,
    authenticate,
    getPool,
) {
    const router = Router();

    // ── GET /advisor/bloat/tables ────────────────────────────────────────────
    router.get(
        '/advisor/bloat/tables',
        authenticate,
        resolveWorkspace,
        requireWorkspaceRole('viewer'),
        async (req, res, next) => {
            try {
                const { connectionId, schema = 'public' } = req.query || {};
                if (!connectionId) {
                    return res.status(400).json({ error: 'connectionId required' });
                }

                const pgPool = getPool ? getPool(connectionId) : null;
                if (!pgPool) return res.status(404).json({ error: 'connection not found' });

                const client = await pgPool.connect();
                try {
                    const bloat = await estimateTableBloat(client, { schema });
                    res.json({
                        schema,
                        connectionId,
                        tables: bloat,
                        summary: {
                            totalTables: bloat.length,
                            totalBloatBytes: bloat.reduce((s, t) => s + t.bloatBytes, 0),
                            maxBloatRatio: bloat.length > 0
                                ? Math.max(...bloat.map(t => t.bloatRatio))
                                : 0,
                        },
                    });
                } finally {
                    client.release();
                }
            } catch (err) { next(err); }
        }
    );

    // ── GET /advisor/bloat/indexes ───────────────────────────────────────────
    router.get(
        '/advisor/bloat/indexes',
        authenticate,
        resolveWorkspace,
        requireWorkspaceRole('viewer'),
        async (req, res, next) => {
            try {
                const { connectionId, schema = 'public' } = req.query || {};
                if (!connectionId) {
                    return res.status(400).json({ error: 'connectionId required' });
                }

                const pgPool = getPool ? getPool(connectionId) : null;
                if (!pgPool) return res.status(404).json({ error: 'connection not found' });

                const client = await pgPool.connect();
                try {
                    const bloat = await estimateIndexBloat(client, { schema });
                    res.json({
                        schema,
                        connectionId,
                        indexes: bloat,
                        summary: {
                            totalIndexes: bloat.length,
                            totalBloatBytes: bloat.reduce((s, i) => s + i.bloatBytes, 0),
                            maxBloatRatio: bloat.length > 0
                                ? Math.max(...bloat.map(i => i.bloatRatio))
                                : 0,
                        },
                    });
                } finally {
                    client.release();
                }
            } catch (err) { next(err); }
        }
    );

    // ── GET /advisor/bloat/autovacuum ────────────────────────────────────────
    router.get(
        '/advisor/bloat/autovacuum',
        authenticate,
        resolveWorkspace,
        requireWorkspaceRole('viewer'),
        async (req, res, next) => {
            try {
                const { connectionId } = req.query || {};
                if (!connectionId) {
                    return res.status(400).json({ error: 'connectionId required' });
                }

                const pgPool = getPool ? getPool(connectionId) : null;
                if (!pgPool) return res.status(404).json({ error: 'connection not found' });

                const client = await pgPool.connect();
                try {
                    const lag = await getAutovacuumLag(client);

                    // Enrich with recommendations
                    const withRecs = lag.map(row => {
                        const rec = recommendVacuum({
                            ...row,
                            sizeBytes: row.estimatedSizeBytes,
                        });
                        return { ...row, recommendation: rec };
                    });

                    res.json({
                        connectionId,
                        tables: withRecs,
                        summary: {
                            totalTables: withRecs.length,
                            totalDeadTups: withRecs.reduce((s, t) => s + t.nDeadTup, 0),
                            tablesNeedingVacuum: withRecs.filter(
                                t => t.recommendation.action !== 'none'
                            ).length,
                        },
                    });
                } finally {
                    client.release();
                }
            } catch (err) { next(err); }
        }
    );

    // ── POST /advisor/bloat/preview-vacuum ───────────────────────────────────
    router.post(
        '/advisor/bloat/preview-vacuum',
        authenticate,
        resolveWorkspace,
        requireWorkspaceRole('admin'),
        async (req, res, next) => {
            try {
                const { schema = 'public', table, full = false, analyze = true } = req.body || {};
                if (!table) {
                    return res.status(400).json({ error: 'table name required' });
                }

                try {
                    const ddl = generateVacuumDdl({ schema, table, full, analyze });
                    res.json({
                        schema,
                        table,
                        full,
                        analyze,
                        ddl,
                        warning: 'Preview only. DDL is NOT executed automatically.',
                    });
                } catch (err) {
                    return res.status(400).json({ error: err.message });
                }
            } catch (err) { next(err); }
        }
    );

    return router;
}
