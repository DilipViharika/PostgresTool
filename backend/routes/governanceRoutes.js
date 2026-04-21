/**
 * routes/governanceRoutes.js
 * ──────────────────────────
 * IP allow-list CRUD, SCIM token management, audit export trigger.
 */

import crypto from 'node:crypto';
import { Router } from 'express';
import { query } from '../db.js';
import { runAuditExport } from '../services/auditExport.js';
import { resolveWorkspace, requireWorkspaceRole } from '../middleware/workspaceRbac.js';
import { writeAudit } from '../services/auditService.js';
import { invalidateIpAllowListCache } from '../middleware/ipAllowList.js';

export default function governanceRoutes(pool, authenticate) {
    const router = Router();

    // ── IP allow-list ────────────────────────────────────────────────────────
    router.get(
        '/governance/ip-allowlist',
        authenticate, resolveWorkspace,
        async (req, res, next) => {
            try {
                const { rows } = await query(
                    `SELECT id, cidr, label, created_at
                       FROM pgmonitoringtool.ip_allowlist
                      WHERE workspace_id = $1 ORDER BY created_at DESC`,
                    [req.workspace.id]
                );
                res.json({ entries: rows });
            } catch (err) { next(err); }
        }
    );

    router.post(
        '/governance/ip-allowlist',
        authenticate, resolveWorkspace, requireWorkspaceRole('admin'),
        async (req, res, next) => {
            try {
                const { cidr, label = null } = req.body || {};
                if (!cidr) return res.status(400).json({ error: 'cidr required' });
                const { rows } = await query(
                    `INSERT INTO pgmonitoringtool.ip_allowlist
                        (workspace_id, cidr, label, created_by)
                     VALUES ($1,$2,$3,$4) RETURNING id`,
                    [req.workspace.id, cidr, label, req.user?.id]
                );
                invalidateIpAllowListCache(req.workspace.id);
                await writeAudit({
                    actor_id: req.user?.id,
                    action: 'ip_allowlist.add',
                    target: `ws:${req.workspace.id}`,
                    details: { cidr, label },
                }).catch(() => {});
                res.status(201).json({ id: rows[0].id });
            } catch (err) { next(err); }
        }
    );

    router.delete(
        '/governance/ip-allowlist/:id',
        authenticate, resolveWorkspace, requireWorkspaceRole('admin'),
        async (req, res, next) => {
            try {
                await query(
                    `DELETE FROM pgmonitoringtool.ip_allowlist
                      WHERE id = $1 AND workspace_id = $2`,
                    [Number(req.params.id), req.workspace.id]
                );
                invalidateIpAllowListCache(req.workspace.id);
                await writeAudit({
                    actor_id: req.user?.id,
                    action: 'ip_allowlist.remove',
                    target: `rule:${req.params.id}`,
                }).catch(() => {});
                res.status(204).end();
            } catch (err) { next(err); }
        }
    );

    // ── SCIM tokens (issue / rotate / revoke) ────────────────────────────────
    //   MED-3 fix: tokens carry an explicit expires_at (default 365 days,
    //   client can request shorter via body.ttlDays). SCIM auth rejects
    //   expired tokens. See scimRoutes.js.
    router.post(
        '/governance/scim-tokens',
        authenticate, resolveWorkspace, requireWorkspaceRole('owner'),
        async (req, res, next) => {
            try {
                const ttlDays = Math.min(Math.max(Number(req.body?.ttlDays) || 365, 1), 3650);
                const token = `fathom_scim_${crypto.randomBytes(24).toString('base64url')}`;
                const hash = crypto.createHash('sha256').update(token).digest('hex');
                const prefix = token.slice(0, 16);
                const { rows } = await query(
                    `INSERT INTO pgmonitoringtool.scim_tokens
                        (workspace_id, token_hash, token_prefix, created_by,
                         expires_at)
                     VALUES ($1,$2,$3,$4, now() + ($5 || ' days')::interval)
                     RETURNING id, created_at, expires_at`,
                    [req.workspace.id, hash, prefix, req.user?.id, ttlDays]
                );
                await writeAudit({
                    actor_id: req.user?.id,
                    action: 'scim_token.create',
                    target: `ws:${req.workspace.id}`,
                    details: { ttlDays },
                }).catch(() => {});
                // Token is returned ONCE — never stored in plaintext.
                res.status(201).json({
                    id: rows[0].id,
                    token,
                    prefix,
                    created_at: rows[0].created_at,
                    expires_at: rows[0].expires_at,
                    warning: 'Store this token now — it will never be shown again.',
                });
            } catch (err) { next(err); }
        }
    );

    router.get(
        '/governance/scim-tokens',
        authenticate, resolveWorkspace, requireWorkspaceRole('admin'),
        async (req, res, next) => {
            try {
                const { rows } = await query(
                    `SELECT id, token_prefix, created_at, last_used_at,
                            revoked_at, expires_at
                       FROM pgmonitoringtool.scim_tokens
                      WHERE workspace_id = $1
                      ORDER BY created_at DESC`,
                    [req.workspace.id]
                );
                res.json({ tokens: rows });
            } catch (err) { next(err); }
        }
    );

    router.delete(
        '/governance/scim-tokens/:id',
        authenticate, resolveWorkspace, requireWorkspaceRole('owner'),
        async (req, res, next) => {
            try {
                await query(
                    `UPDATE pgmonitoringtool.scim_tokens
                        SET revoked_at = now()
                      WHERE id = $1 AND workspace_id = $2`,
                    [Number(req.params.id), req.workspace.id]
                );
                res.status(204).end();
            } catch (err) { next(err); }
        }
    );

    // ── Audit export: on-demand trigger (cron handles periodic) ──────────────
    //   HIGH-1 fix: resolveWorkspace must run before requireWorkspaceRole or
    //   the role check fails closed for everyone and the feature is dead.
    router.post(
        '/governance/audit-export/run',
        authenticate, resolveWorkspace, requireWorkspaceRole('owner'),
        async (req, res, next) => {
            try {
                const summary = await runAuditExport({
                    fromTs: req.body?.from ? new Date(req.body.from) : undefined,
                    toTs: req.body?.to ? new Date(req.body.to) : undefined,
                });
                res.json(summary);
            } catch (err) { next(err); }
        }
    );

    return router;
}
