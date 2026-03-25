/**
 * routes/userRoutes.ts
 * User management endpoints.
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

function log(level: string, message: string, meta: Record<string, any> = {}): void {
    const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export default function userRoutes(pool: Pool, authenticate: any, requireScreen: any): Router {
    const router = Router();
    const guard = [authenticate, requireScreen('UserManagement')];

    router.get('/users', ...guard, async (req: Request, res: Response) => {
        try {
            res.json([]);
        } catch (err: any) {
            log('ERROR', 'Failed to list users', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
