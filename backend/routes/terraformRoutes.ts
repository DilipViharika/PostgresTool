/**
 * routes/terraformRoutes.ts
 * Terraform/IaC export endpoints.
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

function log(level: string, message: string, meta: Record<string, any> = {}): void {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

export default function terraformRoutes(pool: Pool, authenticate: any, requireRole: any): Router {
    const router = Router();
    const isAdmin = [authenticate, requireRole('admin')];

    router.get('/terraform/export', ...isAdmin, async (req: Request, res: Response) => {
        try {
            res.setHeader('Content-Type', 'text/plain');
            res.send('# Terraform export');
        } catch (err: any) {
            log('ERROR', 'Failed to export Terraform bundle', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
