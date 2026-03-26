/**
 * middleware/rateLimiter.ts
 * ─────────────────────────
 * In-memory sliding-window rate limiter.
 * Supports per-user, per-IP, and per-org limits.
 * Enterprise tiers get higher limits.
 */

import { Request, Response, NextFunction } from 'express';
import '../types/express.js';

interface RateLimitBucket {
  windowStart: number;
  count: number;
}

interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
  keyFn?: (req: Request) => string;
}

const buckets = new Map<string, RateLimitBucket>();

/**
 * Creates a rate limiting middleware with configurable options.
 * @param {RateLimiterOptions} opts Configuration options
 */
export function rateLimiter(opts: RateLimiterOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  const windowMs = opts.windowMs || 60_000;
  const maxDefault = opts.maxRequests || 300;
  const keyFn = opts.keyFn || ((req: Request) => (req.user?.id as string | number)?.toString() || req.ip || 'anonymous');

  // Cleanup interval — purge stale buckets every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.windowStart > windowMs * 2) buckets.delete(key);
    }
  }, 300_000);

  return function (req: Request, res: Response, next: NextFunction): void {
    const key = keyFn(req);
    const now = Date.now();

    // Tier-based limits: enterprise gets 5x, pro gets 2x
    let max = maxDefault;
    if (req.licenseTier === 'enterprise') max *= 5;
    else if (req.licenseTier === 'pro') max *= 2;

    let bucket = buckets.get(key);
    if (!bucket || now - bucket.windowStart > windowMs) {
      bucket = { windowStart: now, count: 0 };
      buckets.set(key, bucket);
    }

    bucket.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - bucket.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(bucket.windowStart + windowMs).toISOString());

    if (bucket.count > max) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((bucket.windowStart + windowMs - now) / 1000),
      });
      return;
    }
    next();
  };
}
