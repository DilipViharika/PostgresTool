/**
 * middleware/authenticate.ts
 * ──────────────────────────
 * TypeScript version of the authenticate middleware.
 * Supports both Bearer JWT and X-API-Key header authentication.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { isSessionActive, authenticateApiKey } from '../services/sessionService.js';
import type { Pool } from 'pg';

/**
 * Per-API-key rate limiting
 * Tracks requests per minute for each API key
 */
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const apiKeyRateLimits = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX = 60; // 60 requests per minute (reduced from 100 for stricter rate limiting)

/**
 * Check if API key has exceeded rate limit
 * Returns { allowed: boolean, remaining: number, resetTime: number }
 */
function checkApiKeyRateLimit(apiKey: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  let bucket = apiKeyRateLimits.get(apiKey);

  if (!bucket || now > bucket.resetTime) {
    // Create or reset bucket
    bucket = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    apiKeyRateLimits.set(apiKey, bucket);
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetTime: bucket.resetTime
    };
  }

  bucket.count++;
  return {
    allowed: bucket.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - bucket.count),
    resetTime: bucket.resetTime
  };
}

/**
 * Cleanup stale rate limit entries (run every 60 seconds)
 */
function startRateLimitCleanup(): void {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of apiKeyRateLimits.entries()) {
      if (now > bucket.resetTime) {
        apiKeyRateLimits.delete(key);
      }
    }
  }, 60 * 1000);
}

// Start cleanup on module load
startRateLimitCleanup();

// ── Types (inline to avoid complex path resolution with NodeNext) ────────────
export type UserRole = 'super_admin' | 'admin' | 'analyst' | 'viewer' | 'demo';
export type AccessLevel = 'read' | 'write';

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  allowedScreens: string[];
  accessLevel: AccessLevel;
  sid?: string;
  iat?: number;
  exp?: number;
}

// ── Express Request is extended in types/express.d.ts ──────────────────────

export interface AuthenticatedUser {
  id: number;
  username: string;
  role: UserRole;
  allowedScreens: string[];
  accessLevel: AccessLevel;
  sid?: string;
}

export interface ServerConfig {
  JWT_SECRET: string;
  [key: string]: unknown;
}

/**
 * Build the authenticate middleware with access to pool and config.
 */
export function buildAuthenticate(
  pool: Pool | null,
  config: ServerConfig
): RequestHandler {
  return async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // ── API Key auth (X-API-Key header) ─────────────────────────────
    const apiKey = req.headers['x-api-key'] as string | undefined;
    if (apiKey) {
      // Check rate limit before authenticating
      const rateLimitCheck = checkApiKeyRateLimit(apiKey);

      // Add rate limit info to response headers
      res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
      res.setHeader('X-RateLimit-Remaining', String(rateLimitCheck.remaining));
      res.setHeader('X-RateLimit-Reset', String(rateLimitCheck.resetTime));

      if (!rateLimitCheck.allowed) {
        res.status(429).json({
          error: `Rate limit exceeded (${RATE_LIMIT_MAX} requests per minute per API key)`
        });
        return;
      }

      const user = await authenticateApiKey(pool!, apiKey).catch(() => null);
      if (!user) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
      }
      if (user.status !== 'active') {
        res.status(403).json({ error: 'Account suspended' });
        return;
      }
      req.user = {
        id: typeof user.id === 'string' ? parseInt(user.id) : user.id,
        username: user.username,
        role: user.role as UserRole,
        allowedScreens: user.allowed_screens ?? [],
        accessLevel: user.access_level as AccessLevel,
      };
      return next();
    }

    // ── JWT Bearer auth ──────────────────────────────────────────────
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing token' });
      return;
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(header.slice(7), config.JWT_SECRET) as JwtPayload;
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Optional session revocation check
    if (payload.sid) {
      const active = await isSessionActive(pool!, payload.sid).catch(
        () => true
      );
      if (!active) {
        res.status(401).json({ error: 'Session revoked' });
        return;
      }
    }

    req.user = payload as AuthenticatedUser;
    next();
  };
}

/**
 * requireScreen — guards a route to users whose allowedScreens includes `screen`.
 */
export function requireScreen(screen: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.allowedScreens?.includes(screen)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    next();
  };
}

/**
 * requireRole — guards a route to specific user roles.
 */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient role' });
      return;
    }
    next();
  };
}