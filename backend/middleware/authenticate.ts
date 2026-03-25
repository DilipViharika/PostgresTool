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
