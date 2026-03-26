import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

export default function orgRoutes(pool: Pool, authenticate: any, requireRole: any): Router {
    const router = Router();

    router.get('/', authenticate, async (req: Request, res: Response) => {
        try {
            res.json([]);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
