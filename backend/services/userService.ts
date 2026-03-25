/**
 * services/userService.ts
 * ───────────────────────
 * Every database operation for pgmonitoringtool.users.
 * Route handlers import these — no raw SQL lives in routes.
 */

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const S = 'pgmonitoringtool';

/* ─── TYPE DEFINITIONS ───────────────────────────────────────────────────── */

interface UserRow {
  id: string;
  username: string;
  password_hash?: string;
  name: string;
  email: string;
  role: string;
  access_level: string;
  allowed_screens?: string[];
  data_access: string;
  department?: string | null;
  location?: string | null;
  mfa_enabled: boolean;
  api_access: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
  login_activity?: number[];
  failed_logins?: number;
  risk_score?: number;
  session_count?: number;
}

interface ClientUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  accessLevel: string;
  allowedScreens: string[];
  dataAccess: string;
  department: string | null;
  location: string | null;
  mfa: boolean;
  apiAccess: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  loginActivity: number[];
  failedLogins: number;
  riskScore: number;
  sessions: number;
}

interface CreateUserData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
  allowedScreens?: string[];
  status?: string;
  department?: string | null;
  location?: string | null;
  mfa?: boolean;
  apiAccess?: boolean;
  dataAccess?: string;
}

interface UpdateUserData {
  name?: string | null;
  email?: string | null;
  role?: string;
  allowedScreens?: string[] | null;
  status?: string | null;
  department?: string | null;
  location?: string | null;
  mfa?: boolean | null;
  apiAccess?: boolean | null;
  dataAccess?: string | null;
}

/* ─── Row normaliser ───────────────────────────────────────────────────────── */
function toClient(row: UserRow | null): ClientUser | null {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    role: row.role,
    accessLevel: row.access_level,
    allowedScreens: row.allowed_screens ?? [],
    dataAccess: row.data_access,
    department: row.department ?? null,
    location: row.location ?? null,
    mfa: row.mfa_enabled,
    apiAccess: row.api_access,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at ?? null,
    loginActivity: row.login_activity ?? [],
    failedLogins: Number(row.failed_logins ?? 0),
    riskScore: Number(row.risk_score ?? 0),
    sessions: Number(row.session_count ?? 0),
  };
}

function accessLevelFor(role: string): string {
  return ['super_admin', 'admin'].includes(role) ? 'write' : 'read';
}

/* ─── READ ─────────────────────────────────────────────────────────────────── */

/**
 * Full user list enriched with 28-day login activity, failed-login count,
 * computed risk score and active session count — everything the UI needs.
 */
export async function listUsers(pool: Pool): Promise<ClientUser[]> {
  const { rows } = await pool.query<UserRow>(`
    SELECT
        u.*,
        COALESCE((
            SELECT json_agg(login_count ORDER BY day ASC)
            FROM   ${S}.user_login_activity
            WHERE  user_id = u.id
              AND  day >= CURRENT_DATE - INTERVAL '27 days'
        ), '[]'::json) AS login_activity,

        COALESCE((
            SELECT SUM(failed_count)
            FROM   ${S}.user_login_activity
            WHERE  user_id = u.id
              AND  day >= CURRENT_DATE - INTERVAL '30 days'
        ), 0) AS failed_logins,

        (
            SELECT COUNT(*)
            FROM   ${S}.user_sessions
            WHERE  user_id   = u.id
              AND  is_active = TRUE
              AND  expires_at > NOW()
        ) AS session_count

    FROM ${S}.v_users u
    ORDER BY u.created_at ASC
  `);

  return rows.map((row) => {
    const daysSince = row.last_login_at ? (Date.now() - new Date(row.last_login_at).getTime()) / 86_400_000 : 30;
    (row as any).risk_score = Math.min(100, Number(row.failed_logins) * 7 + (daysSince > 14 ? 20 : 0));
    return toClient(row)!;
  });
}

/** Fetch one user with password_hash — for internal auth only, never send to client. */
export async function getUserById(pool: Pool, id: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(`SELECT * FROM ${S}.users WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return rows[0] ?? null;
}

export async function getUserByUsername(pool: Pool, username: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(`SELECT * FROM ${S}.users WHERE username = $1 AND deleted_at IS NULL`, [username]);
  return rows[0] ?? null;
}

/* ─── CREATE ───────────────────────────────────────────────────────────────── */

export async function createUser(pool: Pool, data: CreateUserData): Promise<ClientUser> {
  const { username, password, name, email, role, allowedScreens = [], status = 'active', department = null, location = null, mfa = true, apiAccess = false, dataAccess = 'internal' } = data;

  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO ${S}.users
      (username, password_hash, name, email, role, access_level,
       allowed_screens, data_access, department, location,
       mfa_enabled, api_access, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [username, passwordHash, name, email, role, accessLevelFor(role), allowedScreens, dataAccess, department, location, mfa, apiAccess, status]
  );
  return toClient(rows[0])!;
}

/* ─── UPDATE ───────────────────────────────────────────────────────────────── */

export async function updateUser(pool: Pool, id: string, data: UpdateUserData): Promise<ClientUser | null> {
  const existing = await getUserById(pool, id);
  if (!existing) return null;

  const role = data.role ?? existing.role;
  const { rows } = await pool.query<UserRow>(
    `UPDATE ${S}.users SET
      name            = COALESCE($1,  name),
      email           = COALESCE($2,  email),
      role            = $3,
      access_level    = $4,
      allowed_screens = COALESCE($5,  allowed_screens),
      status          = COALESCE($6,  status),
      department      = COALESCE($7,  department),
      location        = COALESCE($8,  location),
      mfa_enabled     = COALESCE($9,  mfa_enabled),
      api_access      = COALESCE($10, api_access),
      data_access     = COALESCE($11, data_access)
     WHERE id = $12 AND deleted_at IS NULL
     RETURNING *`,
    [
      data.name ?? null,
      data.email ?? null,
      role,
      accessLevelFor(role),
      data.allowedScreens ?? null,
      data.status ?? null,
      data.department ?? null,
      data.location ?? null,
      data.mfa ?? null,
      data.apiAccess ?? null,
      data.dataAccess ?? null,
      id,
    ]
  );
  return rows[0] ? toClient(rows[0]) : null;
}

/* ─── DELETE ───────────────────────────────────────────────────────────────── */

export async function deleteUser(pool: Pool, id: string): Promise<boolean> {
  const { rowCount } = await pool.query(`UPDATE ${S}.users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
  return (rowCount || 0) > 0;
}

export async function bulkDeleteUsers(pool: Pool, ids: string[]): Promise<number> {
  const safe = [...new Set(ids)].filter((id) => id !== '1');
  if (!safe.length) return 0;
  const { rowCount } = await pool.query(`UPDATE ${S}.users SET deleted_at = NOW()
     WHERE id = ANY($1::int[]) AND deleted_at IS NULL`, [safe]);
  return rowCount || 0;
}

/* ─── PASSWORD ─────────────────────────────────────────────────────────────── */

export async function resetUserPassword(pool: Pool, id: string, newPassword: string): Promise<boolean> {
  const hash = await bcrypt.hash(newPassword, 12);
  const { rowCount } = await pool.query(`UPDATE ${S}.users SET password_hash = $1 WHERE id = $2 AND deleted_at IS NULL`, [hash, id]);
  return (rowCount || 0) > 0;
}

/* ─── LAST LOGIN ───────────────────────────────────────────────────────────── */

export async function touchLastLogin(pool: Pool, id: string): Promise<void> {
  await pool.query(`UPDATE ${S}.users SET last_login_at = NOW() WHERE id = $1`, [id]);
}

/* ─── UNIQUENESS GUARDS ────────────────────────────────────────────────────── */

export async function usernameExists(pool: Pool, username: string, excludeId: string | null = null): Promise<boolean> {
  const { rows } = await pool.query<{ _: number }>(
    `SELECT 1 FROM ${S}.users
     WHERE username = $1 AND deleted_at IS NULL
       AND ($2::int IS NULL OR id <> $2)`,
    [username, excludeId]
  );
  return rows.length > 0;
}

export async function emailExists(pool: Pool, email: string, excludeId: string | null = null): Promise<boolean> {
  const { rows } = await pool.query<{ _: number }>(
    `SELECT 1 FROM ${S}.users
     WHERE email = $1 AND deleted_at IS NULL
       AND ($2::int IS NULL OR id <> $2)`,
    [email, excludeId]
  );
  return rows.length > 0;
}
