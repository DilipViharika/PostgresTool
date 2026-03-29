/**
 * middleware/rateLimiter.js
 * ─────────────────────────
 * In-memory sliding-window rate limiter.
 * Supports per-user, per-IP, and per-org limits.
 * Enterprise tiers get higher limits.
 */

const buckets = new Map();
const MAX_BUCKETS = 100000;

/**
 * @param {{ windowMs?: number, maxRequests?: number, keyFn?: Function }} opts
 */
export function rateLimiter(opts = {}) {
    const windowMs = opts.windowMs || 60_000;
    const maxDefault = opts.maxRequests || 300;
    const keyFn = opts.keyFn || ((req) => req.user?.id || req.ip || 'anonymous');

    // Cleanup interval — purge stale buckets every 5 minutes
    setInterval(() => {
        const now = Date.now();
        for (const [key, bucket] of buckets) {
            if (now - bucket.windowStart > windowMs * 2) buckets.delete(key);
        }
    }, 300_000);

    return function (req, res, next) {
        const key = keyFn(req);
        const now = Date.now();

        // Emergency purge if buckets exceed MAX_BUCKETS
        if (buckets.size > MAX_BUCKETS) {
            const sortedEntries = Array.from(buckets.entries())
                .sort((a, b) => b[1].windowStart - a[1].windowStart)
                .slice(0, Math.floor(MAX_BUCKETS * 0.8));
            buckets.clear();
            sortedEntries.forEach(([k, v]) => buckets.set(k, v));
            console.warn(`[RateLimiter] Emergency purge triggered: reduced buckets from ${buckets.size} to ${Math.floor(MAX_BUCKETS * 0.8)}`);
        }

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
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - bucket.count));
        res.setHeader('X-RateLimit-Reset', new Date(bucket.windowStart + windowMs).toISOString());

        if (bucket.count > max) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil((bucket.windowStart + windowMs - now) / 1000),
            });
        }
        next();
    };
}
