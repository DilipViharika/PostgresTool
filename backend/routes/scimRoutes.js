/**
 * routes/scimRoutes.js
 * ────────────────────
 * SCIM 2.0 (RFC 7644) Users + Groups endpoints for automated user
 * provisioning from identity providers (Okta, Entra ID, OneLogin, etc.).
 *
 * Auth: a dedicated Bearer token stored in `scim_tokens`. Every SCIM request
 * must authenticate with that token — JWT/session auth is NOT accepted, so
 * the blast radius of a compromised SCIM token is limited to the IdP surface.
 *
 * Mount with:
 *   app.use(prefix, scimRoutes(pool));
 *
 * Endpoints (mounted under /scim/v2):
 *   GET    /scim/v2/Users
 *   GET    /scim/v2/Users/:id
 *   POST   /scim/v2/Users
 *   PATCH  /scim/v2/Users/:id
 *   DELETE /scim/v2/Users/:id
 *   GET    /scim/v2/Groups
 *   POST   /scim/v2/Groups
 *   GET    /scim/v2/ServiceProviderConfig
 */

import crypto from 'node:crypto';
import { Router } from 'express';
import { query } from '../db.js';

const SCIM_USER_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:User';
const SCIM_GROUP_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:Group';
const LIST_RESP = 'urn:ietf:params:scim:api:messages:2.0:ListResponse';
const ERROR_SCHEMA = 'urn:ietf:params:scim:api:messages:2.0:Error';

export default function scimRoutes(pool) {
    const router = Router();

    router.use(async (req, res, next) => {
        try {
            const header = req.headers.authorization || '';
            const token = header.replace(/^Bearer\s+/i, '').trim();
            if (!token) return scimError(res, 401, 'missing bearer token');
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const { rows } = await query(
                `SELECT workspace_id FROM pgmonitoringtool.scim_tokens
                  WHERE token_hash = $1 AND revoked_at IS NULL LIMIT 1`,
                [tokenHash]
            );
            if (!rows[0]) return scimError(res, 401, 'invalid SCIM token');
            req.workspaceId = rows[0].workspace_id;
            await query(
                `UPDATE pgmonitoringtool.scim_tokens
                    SET last_used_at = now() WHERE token_hash = $1`,
                [tokenHash]
            );
            next();
        } catch (err) { next(err); }
    });

    // ── Discovery ────────────────────────────────────────────────────────────
    router.get('/scim/v2/ServiceProviderConfig', (_req, res) => {
        res.json({
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
            documentationUri: 'https://docs.vigil.dev/scim',
            patch:            { supported: true },
            bulk:             { supported: false },
            filter:           { supported: true, maxResults: 200 },
            changePassword:   { supported: false },
            sort:             { supported: false },
            etag:             { supported: false },
            authenticationSchemes: [
                { name: 'OAuth Bearer Token', type: 'oauthbearertoken', primary: true },
            ],
        });
    });

    // ── Users ────────────────────────────────────────────────────────────────
    router.get('/scim/v2/Users', async (req, res, next) => {
        try {
            const count = Math.min(Number(req.query.count) || 100, 200);
            const startIndex = Math.max(Number(req.query.startIndex) || 1, 1);
            const filter = String(req.query.filter || '');
            const emailMatch = /userName eq "([^"]+)"/.exec(filter);
            const params = [req.workspaceId];
            let where = 'wm.workspace_id = $1';
            if (emailMatch) {
                params.push(emailMatch[1]);
                where += ` AND lower(u.email) = lower($${params.length})`;
            }
            params.push(count, startIndex - 1);
            const { rows } = await query(
                `SELECT u.id, u.email, u.username, u.status, wm.role, u.created_at
                   FROM pgmonitoringtool.workspace_members wm
                   JOIN pgmonitoringtool.users u ON u.id = wm.user_id
                  WHERE ${where}
                  ORDER BY u.id
                  LIMIT $${params.length - 1} OFFSET $${params.length}`,
                params
            );
            res.json({
                schemas: [LIST_RESP],
                totalResults: rows.length,
                startIndex,
                itemsPerPage: rows.length,
                Resources: rows.map(toScimUser),
            });
        } catch (err) { next(err); }
    });

    router.get('/scim/v2/Users/:id', async (req, res, next) => {
        try {
            const user = await findUserInWorkspace(req.workspaceId, req.params.id);
            if (!user) return scimError(res, 404, 'user not found');
            res.json(toScimUser(user));
        } catch (err) { next(err); }
    });

    router.post('/scim/v2/Users', async (req, res, next) => {
        try {
            const email = req.body.userName || req.body.emails?.[0]?.value;
            if (!email) return scimError(res, 400, 'userName is required');
            const active = req.body.active !== false;
            const name = req.body.name?.formatted
                || [req.body.name?.givenName, req.body.name?.familyName].filter(Boolean).join(' ')
                || email;

            // Upsert user.
            const passwordHash = crypto.randomBytes(32).toString('hex');
            const { rows } = await query(
                `INSERT INTO pgmonitoringtool.users
                    (username, email, password_hash, role, status, created_at)
                 VALUES ($1,$2,$3,'viewer',$4, now())
                 ON CONFLICT (email) DO UPDATE SET
                    username = EXCLUDED.username,
                    status = EXCLUDED.status
                 RETURNING id, email, username, status, created_at`,
                [email, email, passwordHash, active ? 'active' : 'suspended']
            );
            const user = rows[0];
            await query(
                `INSERT INTO pgmonitoringtool.workspace_members
                    (workspace_id, user_id, role)
                 VALUES ($1,$2,'viewer')
                 ON CONFLICT (workspace_id, user_id) DO NOTHING`,
                [req.workspaceId, user.id]
            );
            res.status(201).json(toScimUser({ ...user, role: 'viewer' }));
        } catch (err) { next(err); }
    });

    router.patch('/scim/v2/Users/:id', async (req, res, next) => {
        try {
            const ops = req.body.Operations || [];
            let active;
            for (const op of ops) {
                if (op.op?.toLowerCase() === 'replace' && op.path === 'active') {
                    active = !!op.value;
                }
                if (op.op?.toLowerCase() === 'replace' && op.value && typeof op.value === 'object') {
                    if ('active' in op.value) active = !!op.value.active;
                }
            }
            if (active !== undefined) {
                await query(
                    `UPDATE pgmonitoringtool.users SET status = $2 WHERE id = $1`,
                    [Number(req.params.id), active ? 'active' : 'suspended']
                );
            }
            const user = await findUserInWorkspace(req.workspaceId, req.params.id);
            if (!user) return scimError(res, 404, 'user not found');
            res.json(toScimUser(user));
        } catch (err) { next(err); }
    });

    router.delete('/scim/v2/Users/:id', async (req, res, next) => {
        try {
            await query(
                `DELETE FROM pgmonitoringtool.workspace_members
                  WHERE workspace_id = $1 AND user_id = $2`,
                [req.workspaceId, Number(req.params.id)]
            );
            res.status(204).end();
        } catch (err) { next(err); }
    });

    // ── Groups (minimal — role-as-group model) ───────────────────────────────
    router.get('/scim/v2/Groups', async (req, res) => {
        const groups = ['owner', 'admin', 'editor', 'viewer'].map(role => ({
            id: role,
            schemas: [SCIM_GROUP_SCHEMA],
            displayName: `vigil-${role}`,
        }));
        res.json({
            schemas: [LIST_RESP],
            totalResults: groups.length,
            Resources: groups,
        });
    });

    return router;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function findUserInWorkspace(workspaceId, userId) {
    const { rows } = await query(
        `SELECT u.id, u.email, u.username, u.status, wm.role, u.created_at
           FROM pgmonitoringtool.workspace_members wm
           JOIN pgmonitoringtool.users u ON u.id = wm.user_id
          WHERE wm.workspace_id = $1 AND u.id = $2`,
        [workspaceId, Number(userId)]
    );
    return rows[0] || null;
}

function toScimUser(u) {
    return {
        schemas: [SCIM_USER_SCHEMA],
        id: String(u.id),
        userName: u.email,
        displayName: u.username || u.email,
        emails: [{ primary: true, value: u.email, type: 'work' }],
        active: u.status !== 'suspended',
        meta: {
            resourceType: 'User',
            created: u.created_at,
        },
    };
}

function scimError(res, status, detail) {
    res.status(status).json({
        schemas: [ERROR_SCHEMA],
        status: String(status),
        detail,
    });
}
