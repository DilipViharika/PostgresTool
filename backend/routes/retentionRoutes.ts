/**
 * routes/retentionRoutes.ts
 * Data retention management endpoints.
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

function log(level: string, message: string, meta: Record<string, any> = {}): void {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export default function retentionRoutes(pool: Pool, authenticate: any, requireRole: any): Router {
    const router = Router();
    const isAdmin = [authenticate, requireRole('admin')];

    router.get('/retention/policy', authenticate, async (req: Request, res: Response) => {
        try {
            res.json({ success: true });
        } catch (err: any) {
            log('ERROR', 'Failed to get retention policy', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
