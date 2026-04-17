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

/**
 * Validates user input for creation and updates.
 * Returns an object with { valid: boolean, error?: string }
 */
function validateUserInput(userData: Record<string, any>): { valid: boolean; error?: string } {
    const { username, password, name, email, role } = userData;

    // Email validation - simple regex
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, error: 'Email must be in valid format (e.g., user@example.com)' };
        }
    }

    // Username validation - 3-50 chars, alphanumeric + underscore only
    if (username) {
        if (username.length < 3 || username.length > 50) {
            return { valid: false, error: 'Username must be between 3 and 50 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
        }
    }

    // Password validation — SEC-016: enforce strong password policy
    if (password) {
        if (password.length < 12) {
            return { valid: false, error: 'Password must be at least 12 characters' };
        }
        if (password.length > 128) {
            return { valid: false, error: 'Password must not exceed 128 characters' };
        }
        if (!/[a-z]/.test(password)) {
            return { valid: false, error: 'Password must contain at least one lowercase letter' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, error: 'Password must contain at least one uppercase letter' };
        }
        if (!/\d/.test(password)) {
            return { valid: false, error: 'Password must contain at least one digit' };
        }
        if (!/[^a-zA-Z0-9]/.test(password)) {
            return { valid: false, error: 'Password must contain at least one special character' };
        }
        // Check against common weak passwords
        const commonPasswords = ['password123', 'admin1234', 'letmein123', 'welcome123', 'changeme123', 'qwerty1234'];
        if (commonPasswords.includes(password.toLowerCase())) {
            return { valid: false, error: 'This password is too common. Please choose a stronger password.' };
        }
    }

    // Name validation - 1-100 characters
    if (name) {
        if (name.length < 1 || name.length > 100) {
            return { valid: false, error: 'Name must be between 1 and 100 characters' };
        }
    }

    // Role validation - must be one of allowed roles
    if (role) {
        const VALID_ROLES = ['super_admin', 'admin', 'developer', 'analyst', 'viewer'];
        if (!VALID_ROLES.includes(role)) {
            return { valid: false, error: `Role must be one of: ${VALID_ROLES.join(', ')}` };
        }
    }

    return { valid: true };
}

export default function userRoutes(pool: Pool, authenticate: any, requireScreen: any): Router {
    const router = Router();
    const guard = [authenticate, requireScreen('UserManagement')];

    router.get('/users', ...guard, async (req: Request, res: Response) => {
        try {
            res.json([]);
        } catch (err: any) {
            log('ERROR', 'Failed to list users', { error: err.message });
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
}
