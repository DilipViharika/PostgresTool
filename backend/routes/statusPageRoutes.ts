/**
 * routes/statusPageRoutes.ts
 * Public status page endpoints.
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

function log(level: string, message: string, meta: Record<string, any> = {}): void {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export default function statusPageRoutes(pool: Pool, authenticate: any, requireRole: any): Router {
    const router = Router();
    const isAdmin = [authenticate, requireRole('admin')];

    router.get('/status/public', async (req: Request, res: Response) => {
        try {
            res.json({ status: 'up' });
        } catch (err: any) {
            log('ERROR', 'Failed to get public status', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
