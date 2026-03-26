/**
 * routes/otelRoutes.ts
 * ────────────────────
 * OpenTelemetry metrics ingestion and query endpoints.
 * Mount with:
 *   app.use('/api', otelRoutes(pool, authenticate, requireRole));
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import {
    ingestMetrics,
    queryMetrics,
    getMetricNames,
    getServiceMap,
    getMetricStats,
    deleteOldMetrics,
} from '../services/otelService';

function log(level: string, message: string, meta: Record<string, any> = {}): void {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

/**
 * Extract numeric value from OTel metric.
 */
function extractMetricValue(metric: any): number {
    if (metric.gauge && metric.gauge.dataPoints && metric.gauge.dataPoints[0]) {
        const dp = metric.gauge.dataPoints[0];
        return dp.asDouble || dp.asInt || 0;
    }
    if (metric.sum && metric.sum.dataPoints && metric.sum.dataPoints[0]) {
        const dp = metric.sum.dataPoints[0];
        return dp.asDouble || dp.asInt || 0;
    }
    if (metric.histogram && metric.histogram.dataPoints && metric.histogram.dataPoints[0]) {
        const dp = metric.histogram.dataPoints[0];
        return dp.sum || 0;
    }
    return 0;
}

/**
 * Extract labels from OTel metric.
 */
function extractLabels(metric: any): Record<string, any> {
    const labels: Record<string, any> = {};
    if (metric.gauge && metric.gauge.dataPoints && metric.gauge.dataPoints[0]) {
        const dp = metric.gauge.dataPoints[0];
        if (dp.attributes) {
            for (const [k, v] of Object.entries(dp.attributes)) {
                labels[k] = (v as any).stringValue || (v as any).intValue || (v as any).doubleValue || (v as any).boolValue;
            }
        }
    }
    return labels;
}

export default function otelRoutes(pool: Pool, authenticate: any, requireRole: any): Router {
    const router = Router();
    const isAdmin = [authenticate, requireRole('admin')];

    /* ── POST /api/otel/v1/metrics ────────────────────────────────────────────
       OTLP-compatible metrics ingestion endpoint.
       Accepts JSON array of {name, value, timestamp, labels, resource}           */
    router.post('/otel/v1/metrics', async (req: Request, res: Response) => {
        try {
            const { resourceMetrics } = req.body;

            if (!Array.isArray(resourceMetrics)) {
                return res.status(400).json({ error: 'resourceMetrics must be an array' });
            }

            let totalIngested = 0;

            for (const resource of resourceMetrics) {
                if (resource.scopeMetrics && Array.isArray(resource.scopeMetrics)) {
                    for (const scope of resource.scopeMetrics) {
                        if (scope.metrics && Array.isArray(scope.metrics)) {
                            const metrics = scope.metrics.map((m: any) => ({
                                name: m.name,
                                value: extractMetricValue(m),
                                timestamp: m.timeUnixNano ? Number(m.timeUnixNano) / 1000000 : Date.now(),
                                labels: extractLabels(m),
                                resource: resource.resource || {},
                            }));

                            totalIngested += await ingestMetrics(pool, metrics);
                        }
                    }
                }
            }

            res.status(202).json({
                success: true,
                ingested: totalIngested,
            });
        } catch (err: any) {
            log('ERROR', 'Failed to ingest metrics', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/otel/metrics ──────────────────────────────────────────────────
       Query metrics with filters.
       Query params: name, startTime, endTime, labels (JSON), limit, offset       */
    router.get('/otel/metrics', authenticate, async (req: Request, res: Response) => {
        try {
            const opts = {
                name: req.query.name as string | undefined,
                startTime: req.query.startTime ? Number(req.query.startTime) : undefined,
                endTime: req.query.endTime ? Number(req.query.endTime) : undefined,
                labels: req.query.labels ? JSON.parse(req.query.labels as string) : undefined,
                limit: req.query.limit as string | undefined,
                offset: req.query.offset as string | undefined,
            };

            const result = await queryMetrics(pool, opts);
            res.json(result);
        } catch (err: any) {
            log('ERROR', 'Failed to query metrics', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/otel/metrics/names ────────────────────────────────────────────
       List all distinct metric names.                                           */
    router.get('/otel/metrics/names', authenticate, async (req: Request, res: Response) => {
        try {
            const names = await getMetricNames(pool);
            res.json({ names });
        } catch (err: any) {
            log('ERROR', 'Failed to get metric names', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/otel/services ────────────────────────────────────────────────
       List unique service names from resource labels.                           */
    router.get('/otel/services', authenticate, async (req: Request, res: Response) => {
        try {
            const services = await getServiceMap(pool);
            res.json({ services });
        } catch (err: any) {
            log('ERROR', 'Failed to get services', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/otel/metrics/:name/stats ──────────────────────────────────────
       Get aggregated stats for a metric.
       Query params: startTime, endTime, interval (default 5 minutes)             */
    router.get('/otel/metrics/:name/stats', authenticate, async (req: Request, res: Response) => {
        try {
            const name = (typeof req.params.name === 'string') ? req.params.name : '';
            const intervalRaw = req.query.interval;
            let interval: string = '5 minutes';
            if (Array.isArray(intervalRaw)) {
              if (typeof intervalRaw[0] === 'string') {
                interval = intervalRaw[0];
              }
            } else if (typeof intervalRaw === 'string') {
              interval = intervalRaw;
            }
            const opts = {
                startTime: req.query.startTime ? Number(req.query.startTime) : undefined,
                endTime: req.query.endTime ? Number(req.query.endTime) : undefined,
            };

            const stats = await getMetricStats(pool, name, interval, opts);
            res.json({ metric: name, stats });
        } catch (err: any) {
            log('ERROR', 'Failed to get metric stats', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── DELETE /api/otel/metrics/cleanup ───────────────────────────────────────
       Manual cleanup (admin only).
       Query params: retentionDays (default 30)                                  */
    router.delete('/otel/metrics/cleanup', ...isAdmin, async (req: Request, res: Response) => {
        try {
            const retentionDays = Number(req.query.retentionDays) || 30;
            const deleted = await deleteOldMetrics(pool, retentionDays);

            log('INFO', 'OTel metrics cleanup executed', { deleted, retentionDays });
            res.json({
                success: true,
                deleted,
                retentionDays,
            });
        } catch (err: any) {
            log('ERROR', 'Failed to cleanup metrics', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
