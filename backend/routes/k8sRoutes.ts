/**
 * routes/k8sRoutes.ts
 * ──────────────────
 * Kubernetes/container monitoring endpoints.
 * Mount with:
 *   app.use('/api', k8sRoutes(pool, authenticate));
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import {
    getContainerMetrics,
    getPodInfo,
    getResourceLimits,
    getConnectionsByPod,
    getReplicaTopology,
    getK8sHealthCheck,
    getContainerResourceHistory,
} from '../services/k8sService';

function log(level: string, message: string, meta: Record<string, any> = {}): void {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export default function k8sRoutes(pool: Pool, authenticate: any): Router {
    const router = Router();

    /* ── GET /api/k8s/metrics ───────────────────────────────────────────────────
       Get container metrics (CPU, memory, etc).                                */
    router.get('/k8s/metrics', authenticate, async (req: Request, res: Response) => {
        try {
            const metrics = await getContainerMetrics(pool);
            res.json(metrics);
        } catch (err: any) {
            log('ERROR', 'Failed to get container metrics', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/k8s/pod-info ──────────────────────────────────────────────────
       Get pod/container metadata.                                              */
    router.get('/k8s/pod-info', authenticate, async (req: Request, res: Response) => {
        try {
            const podInfo = await getPodInfo(pool);
            res.json(podInfo);
        } catch (err: any) {
            log('ERROR', 'Failed to get pod info', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/k8s/resources ────────────────────────────────────────────────
       Get resource limits vs actual usage.                                     */
    router.get('/k8s/resources', authenticate, async (req: Request, res: Response) => {
        try {
            const resources = await getResourceLimits(pool);
            res.json(resources);
        } catch (err: any) {
            log('ERROR', 'Failed to get resource limits', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/k8s/connections ───────────────────────────────────────────────
       Get connections grouped by pod.                                          */
    router.get('/k8s/connections', authenticate, async (req: Request, res: Response) => {
        try {
            const connections = await getConnectionsByPod(pool);
            res.json({
                podCount: connections.length,
                pods: connections,
            });
        } catch (err: any) {
            log('ERROR', 'Failed to get connections by pod', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/k8s/topology ──────────────────────────────────────────────────
       Get replica topology.                                                    */
    router.get('/k8s/topology', authenticate, async (req: Request, res: Response) => {
        try {
            const topology = await getReplicaTopology(pool);
            res.json(topology);
        } catch (err: any) {
            log('ERROR', 'Failed to get replica topology', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/k8s/health ────────────────────────────────────────────────────
       Get Kubernetes liveness/readiness probe status.                          */
    router.get('/k8s/health', authenticate, async (req: Request, res: Response) => {
        try {
            const health = await getK8sHealthCheck(pool);
            res.json(health);
        } catch (err: any) {
            log('ERROR', 'Failed to get K8s health check', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/k8s/history ───────────────────────────────────────────────────
       Get resource usage history.
       Query params: hours (default 24)                                         */
    router.get('/k8s/history', authenticate, async (req: Request, res: Response) => {
        try {
            const hours = Number(req.query.hours) || 24;
            const history = await getContainerResourceHistory(pool, hours);

            res.json({
                hours,
                count: history.length,
                data: history,
            });
        } catch (err: any) {
            log('ERROR', 'Failed to get container resource history', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
