/**
 * middleware/workspaceRbac.js
 * ───────────────────────────
 * Workspace-scoped role-based access control.
 *
 * Expects `authenticate` to have already populated req.user with { id, role }.
 * The active workspace is resolved from:
 *   1. req.headers['x-workspace-id']
 *   2. req.query.workspace
 *   3. req.user.defaultWorkspaceId
 *
 * Exposes:
 *   resolveWorkspace       — populates req.workspace = { id, role }
 *   requireWorkspaceRole   — gate routes by workspace role
 *
 * Role hierarchy (high→low): owner > admin > editor > viewer
 */

import { query } from '../db.js';

const ROLE_RANK = { owner: 40, admin: 30, editor: 20, viewer: 10 };

/**
 * Resolve the active workspace for the request and attach { id, role }
 * as req.workspace. A `superadmin` user is treated as owner of any workspace.
 */
export async function resolveWorkspace(req, res, next) {
    try {
        if (!req.user) return res.status(401).json({ error: 'unauthenticated' });

        const headerWs = req.headers['x-workspace-id'];
        const queryWs = req.query.workspace;
        const wsId = Number(headerWs || queryWs || req.user.defaultWorkspaceId || 0);

        if (!wsId) {
            // Fall back to the user's first workspace if any.
            const { rows } = await query(
                `SELECT workspace_id, role
                   FROM pgmonitoringtool.workspace_members
                  WHERE user_id = $1
                  ORDER BY created_at ASC
                  LIMIT 1`,
                [req.user.id]
            );
            if (!rows[0]) return res.status(403).json({ error: 'no_workspace_membership' });
            req.workspace = { id: rows[0].workspace_id, role: rows[0].role };
            return next();
        }

        // Platform-admin / superadmin bypass.
        //   MED-5 fix: require the workspace row to actually exist before
        //   granting owner-equivalent access, and audit the impersonation so
        //   a compromised platform-admin account leaves forensic traces.
        if (req.user.role === 'superadmin' || req.user.role === 'admin') {
            const { rows: w } = await query(
                `SELECT id FROM pgmonitoringtool.workspaces WHERE id = $1 LIMIT 1`,
                [wsId]
            );
            if (!w[0]) return res.status(404).json({ error: 'workspace_not_found' });
            req.workspace = { id: wsId, role: 'owner', impersonated: true };
            // Fire-and-forget audit — never block the request on audit failures.
            import('../services/auditService.js').then(({ writeAudit }) =>
                writeAudit({
                    actor_id: req.user.id,
                    action: 'workspace.impersonate',
                    target: `ws:${wsId}`,
                    details: { actor_role: req.user.role },
                }).catch(() => {})
            ).catch(() => {});
            return next();
        }

        const { rows } = await query(
            `SELECT role
               FROM pgmonitoringtool.workspace_members
              WHERE workspace_id = $1 AND user_id = $2
              LIMIT 1`,
            [wsId, req.user.id]
        );
        if (!rows[0]) {
            return res.status(403).json({ error: 'forbidden_workspace' });
        }
        req.workspace = { id: wsId, role: rows[0].role };
        next();
    } catch (err) {
        next(err);
    }
}

/**
 * Gate a route by minimum workspace role. Use AFTER resolveWorkspace.
 *   router.post('/x', authenticate, resolveWorkspace, requireWorkspaceRole('admin'), handler)
 */
export function requireWorkspaceRole(minRole) {
    const min = ROLE_RANK[minRole];
    if (!min) throw new Error(`Unknown role ${minRole}`);
    return (req, res, next) => {
        const role = req.workspace?.role;
        if (!role) return res.status(403).json({ error: 'no_workspace' });
        const rank = ROLE_RANK[role] || 0;
        if (rank < min) {
            return res.status(403).json({
                error: 'insufficient_workspace_role',
                required: minRole,
                have: role,
            });
        }
        next();
    };
}
