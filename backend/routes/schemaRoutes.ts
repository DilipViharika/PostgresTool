/**
 * routes/schemaRoutes.ts
 * Schema relationships, dependencies, and column details.
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

function log(level: string, message: string, meta: Record<string, any> = {}): void {
    const fn = level === 'ERROR' ? console.error : console.log;
    fn(JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...meta }));
}

/**
 * Sanitizes and validates pagination parameters.
 * Returns an object with { valid: boolean; limit?: number; offset?: number; error?: string }
 * limit: integer, min 1, max 1000, default 100
 * offset: integer, min 0, default 0
 */
function sanitizePagination(limit?: any, offset?: any): { valid: boolean; limit?: number; offset?: number; error?: string } {
    let cleanLimit = 100;  // default
    let cleanOffset = 0;   // default

    // Validate and parse limit
    if (limit !== undefined) {
        const parsedLimit = parseInt(limit, 10);
        if (isNaN(parsedLimit) || parsedLimit < 1) {
            return { valid: false, error: 'limit must be a positive integer (min 1)' };
        }
        if (parsedLimit > 1000) {
            return { valid: false, error: 'limit must not exceed 1000' };
        }
        cleanLimit = parsedLimit;
    }

    // Validate and parse offset
    if (offset !== undefined) {
        const parsedOffset = parseInt(offset, 10);
        if (isNaN(parsedOffset) || parsedOffset < 0) {
            return { valid: false, error: 'offset must be a non-negative integer' };
        }
        cleanOffset = parsedOffset;
    }

    return { valid: true, limit: cleanLimit, offset: cleanOffset };
}

export default function schemaRoutes(pool: Pool, authenticate: any, reqPool?: (req: Request) => Promise<Pool>): Router {
    const router = Router();

    router.get('/schema/relationships', authenticate, async (req: Request, res: Response) => {
        try {
            res.json({ tables: [], relationships: [] });
        } catch (err: any) {
            log('ERROR', 'Failed to fetch schema relationships', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
