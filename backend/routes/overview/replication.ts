import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();

router.get('/', async (_req: Request, res: Response, next) => {
    try {
        res.json({ isReplica: false, replicas: [] });
    } catch (err) {
        next(err);
    }
});

export default router;
