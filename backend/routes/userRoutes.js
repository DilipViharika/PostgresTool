/**
 * routes/userRoutes.js
 * ────────────────────
 * All /api/users endpoints — replaces the in-memory USERS array in server.js.
 * Mount with:
 *   import userRoutes from './routes/userRoutes.js';
 *   app.use('/api', userRoutes(pool, authenticate, requireScreen));
 */

import { Router }            from 'express';
import {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    resetUserPassword,
    usernameExists,
    emailExists,
} from '../services/userService.js';
import { writeAudit }        from '../services/auditService.js';

function log(level, message, meta = {}) {
    const entry = { ts: new Date().toISOString(), level, msg: message, ...meta };
    const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    fn(JSON.stringify(entry));
}

/**
 * @param {import('pg').Pool} pool
 * @param {Function} authenticate  - middleware
 * @param {Function} requireScreen - middleware factory
 */
export default function userRoutes(pool, authenticate, requireScreen) {
    const router = Router();
    const guard  = [authenticate, requireScreen('UserManagement')];

    /* ── GET /api/users ─────────────────────────────────────────────────────
       Returns all active users enriched with login activity + risk score.    */
    router.get('/users', ...guard, async (req, res) => {
        try {
            const users = await listUsers(pool);
            res.json(users);
        } catch (err) {
            log('ERROR', 'Failed to list users', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── GET /api/users/:id ────────────────────────────────────────────────*/
    router.get('/users/:id', ...guard, async (req, res) => {
        try {
            const user = await getUserById(pool, parseInt(req.params.id));
            if (!user) return res.status(404).json({ error: 'User not found' });
            const { password_hash, ...safe } = user;
            res.json(safe);
        } catch (err) {
            log('ERROR', 'Failed to fetch user', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── POST /api/users ───────────────────────────────────────────────────
       Create a new user.                                                      */
    router.post('/users', ...guard, async (req, res) => {
        try {
            const { username, password, name, email, role } = req.body;

            // Required field validation
            if (!username || !password || !name || !email || !role) {
                return res.status(400).json({ error: 'username, password, name, email and role are required' });
            }
            if (password.length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters' });
            }
            const VALID_ROLES = ['super_admin', 'admin', 'developer', 'analyst', 'viewer'];
            if (!VALID_ROLES.includes(role)) {
                return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
            }

            // Uniqueness checks
            if (await usernameExists(pool, username)) {
                return res.status(409).json({ error: 'Username already exists' });
            }
            if (await emailExists(pool, email)) {
                return res.status(409).json({ error: 'Email already exists' });
            }

            const newUser = await createUser(pool, req.body);

            await writeAudit(pool, {
                actorId:      req.user.id,
                actorUsername: req.user.username,
                action:       'USER_CREATED',
                resourceType: 'user',
                resourceId:   newUser.id,
                level:        'info',
                detail:       `Created user ${newUser.username} with role ${newUser.role}`,
                ip:           req.ip,
            });

            log('INFO', 'User created', { by: req.user.username, newUser: newUser.username });
            res.status(201).json(newUser);
        } catch (err) {
            log('ERROR', 'Failed to create user', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── PUT /api/users/:id ────────────────────────────────────────────────
       Update editable fields (partial update, no password here).             */
    router.put('/users/:id', ...guard, async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { email } = req.body;

            if (email && await emailExists(pool, email, id)) {
                return res.status(409).json({ error: 'Email already in use' });
            }

            const updated = await updateUser(pool, id, req.body);
            if (!updated) return res.status(404).json({ error: 'User not found' });

            await writeAudit(pool, {
                actorId:       req.user.id,
                actorUsername: req.user.username,
                action:        'USER_UPDATED',
                resourceType:  'user',
                resourceId:    id,
                level:         'info',
                detail:        `Updated fields: ${Object.keys(req.body).join(', ')}`,
                ip:            req.ip,
            });

            log('INFO', 'User updated', { by: req.user.username, userId: id });
            res.json(updated);
        } catch (err) {
            log('ERROR', 'Failed to update user', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── DELETE /api/users/:id ─────────────────────────────────────────────
       Soft-delete a single user. id=1 (system admin) is protected.          */
    router.delete('/users/:id', ...guard, async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            if (id === 1) return res.status(403).json({ error: 'Cannot delete the system administrator' });

            const deleted = await deleteUser(pool, id);
            if (!deleted) return res.status(404).json({ error: 'User not found' });

            await writeAudit(pool, {
                actorId:       req.user.id,
                actorUsername: req.user.username,
                action:        'USER_DELETED',
                resourceType:  'user',
                resourceId:    id,
                level:         'warn',
                detail:        `User ${id} soft-deleted`,
                ip:            req.ip,
            });

            log('INFO', 'User deleted', { by: req.user.username, userId: id });
            res.json({ success: true });
        } catch (err) {
            log('ERROR', 'Failed to delete user', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── POST /api/users/bulk-delete ───────────────────────────────────────*/
    router.post('/users/bulk-delete', ...guard, async (req, res) => {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ error: 'ids must be a non-empty array' });
            }
            if (ids.includes(1)) {
                return res.status(403).json({ error: 'Cannot delete the system administrator' });
            }

            const count = await bulkDeleteUsers(pool, ids);

            await writeAudit(pool, {
                actorId:       req.user.id,
                actorUsername: req.user.username,
                action:        'USERS_BULK_DELETED',
                level:         'warn',
                detail:        `Bulk-deleted ${count} users`,
                metadata:      { ids },
                ip:            req.ip,
            });

            log('INFO', 'Bulk delete', { by: req.user.username, count });
            res.json({ success: true, deleted: count });
        } catch (err) {
            log('ERROR', 'Failed to bulk-delete users', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    /* ── POST /api/users/:id/reset-password ────────────────────────────────*/
    router.post('/users/:id/reset-password', ...guard, async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { newPassword } = req.body;

            if (!newPassword || newPassword.length < 8) {
                return res.status(400).json({ error: 'newPassword must be at least 8 characters' });
            }

            const ok = await resetUserPassword(pool, id, newPassword);
            if (!ok) return res.status(404).json({ error: 'User not found' });

            await writeAudit(pool, {
                actorId:       req.user.id,
                actorUsername: req.user.username,
                action:        'PASSWORD_RESET',
                resourceType:  'user',
                resourceId:    id,
                level:         'warn',
                detail:        `Password reset by ${req.user.username}`,
                ip:            req.ip,
            });

            log('INFO', 'Password reset', { by: req.user.username, userId: id });
            res.json({ success: true }); // never return the password
        } catch (err) {
            log('ERROR', 'Failed to reset password', { error: err.message });
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}