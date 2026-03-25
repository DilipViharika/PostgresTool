/**
 * routes/reportRoutes.ts
 * Report generation and management endpoints.
 */

import { Router, Request, Response } from 'express';

function log(level: string, message: string, meta: Record<string, any> = {}): void {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export default function reportRoutes(pool: any, authenticate: any, requireScreen: any): Router {
    const router = Router();
    const isAdmin = [authenticate, requireScreen('admin')];

    router.get('/reports/data', ...isAdmin, async (req: Request, res: Response) => {
        try {
            res.json({ success: true });
        } catch (err: any) {
            log('ERROR', 'Failed to fetch report data', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
