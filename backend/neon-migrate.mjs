/**
 * Neon Control-Plane Migration
 * Creates all tables needed for VIGIL auth, users, sessions, connections, feedback.
 */
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_3G1jtgQubfLl@ep-still-rice-a1l05u37-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false },
});

const S = 'pgmonitoringtool';

const migrations = [

    // 1. Schema
    `CREATE SCHEMA IF NOT EXISTS ${S}`,

    // 2. Users table
    `CREATE TABLE IF NOT EXISTS ${S}.users (
        id              SERIAL       PRIMARY KEY,
        username        TEXT         NOT NULL UNIQUE,
        password_hash   TEXT         NOT NULL,
        name            TEXT         NOT NULL DEFAULT '',
        email           TEXT         NOT NULL DEFAULT '',
        role            TEXT         NOT NULL DEFAULT 'viewer',
        access_level    TEXT         NOT NULL DEFAULT 'read',
        allowed_screens TEXT[]       NOT NULL DEFAULT '{}',
        data_access     TEXT         NOT NULL DEFAULT 'internal',
        department      TEXT,
        location        TEXT,
        mfa_enabled     BOOLEAN      NOT NULL DEFAULT true,
        api_access      BOOLEAN      NOT NULL DEFAULT false,
        status          TEXT         NOT NULL DEFAULT 'active',
        deleted_at      TIMESTAMPTZ,
        last_login_at   TIMESTAMPTZ,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
        updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
    )`,

    // 3. User sessions
    `CREATE TABLE IF NOT EXISTS ${S}.user_sessions (
        id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         INTEGER      NOT NULL REFERENCES ${S}.users(id) ON DELETE CASCADE,
        ip_address      INET,
        user_agent      TEXT,
        device_label    TEXT,
        location        TEXT,
        risk_level      TEXT         NOT NULL DEFAULT 'low',
        is_active       BOOLEAN      NOT NULL DEFAULT true,
        expires_at      TIMESTAMPTZ  NOT NULL DEFAULT (now() + interval '24 hours'),
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
    )`,

    // 4. User login activity (daily aggregates)
    `CREATE TABLE IF NOT EXISTS ${S}.user_login_activity (
        id              SERIAL       PRIMARY KEY,
        user_id         INTEGER      NOT NULL REFERENCES ${S}.users(id) ON DELETE CASCADE,
        day             DATE         NOT NULL DEFAULT CURRENT_DATE,
        login_count     INTEGER      NOT NULL DEFAULT 0,
        failed_count    INTEGER      NOT NULL DEFAULT 0,
        UNIQUE (user_id, day)
    )`,

    // 5. Connection registry (encrypted)
    `CREATE TABLE IF NOT EXISTS ${S}.vigil_connections (
        id              SERIAL       PRIMARY KEY,
        user_id         INTEGER,
        name            TEXT         NOT NULL,
        host            TEXT         NOT NULL DEFAULT '',
        port            INTEGER      NOT NULL DEFAULT 5432,
        db_name         TEXT         NOT NULL DEFAULT 'postgres',
        username        TEXT         NOT NULL DEFAULT 'postgres',
        password        TEXT         NOT NULL DEFAULT '',
        ssl             BOOLEAN      NOT NULL DEFAULT false,
        ssh_enabled     BOOLEAN      NOT NULL DEFAULT false,
        ssh_host        TEXT         NOT NULL DEFAULT '',
        ssh_port        INTEGER      NOT NULL DEFAULT 22,
        ssh_user        TEXT         NOT NULL DEFAULT '',
        ssh_auth_type   TEXT         NOT NULL DEFAULT 'key',
        ssh_private_key TEXT         NOT NULL DEFAULT '',
        ssh_passphrase  TEXT         NOT NULL DEFAULT '',
        ssh_password    TEXT         NOT NULL DEFAULT '',
        is_default      BOOLEAN      NOT NULL DEFAULT false,
        status          TEXT,
        last_tested     TIMESTAMPTZ,
        db_type         TEXT         NOT NULL DEFAULT 'postgresql',
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
        UNIQUE (user_id, name)
    )`,

    // 6. User feedback
    `CREATE TABLE IF NOT EXISTS ${S}.user_feedback (
        id              SERIAL       PRIMARY KEY,
        username        TEXT,
        feedback_type   TEXT,
        rating          INTEGER,
        comment         TEXT,
        remarks         TEXT,
        section         TEXT,
        feature_title   TEXT,
        feature_priority TEXT,
        section_feedback TEXT,
        status          TEXT         NOT NULL DEFAULT 'new',
        user_metadata   JSONB,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
    )`,

    // 7. Audit log
    `CREATE TABLE IF NOT EXISTS ${S}.audit_log (
        id              BIGSERIAL    PRIMARY KEY,
        actor_id        INTEGER,
        actor_username  TEXT,
        action          TEXT         NOT NULL,
        level           TEXT         NOT NULL DEFAULT 'info',
        detail          TEXT,
        ip              TEXT,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
    )`,

    // 8. Alerts table
    `CREATE TABLE IF NOT EXISTS ${S}.alerts (
        id              BIGSERIAL    PRIMARY KEY,
        severity        TEXT         NOT NULL DEFAULT 'info',
        title           TEXT         NOT NULL,
        message         TEXT,
        fingerprint     TEXT         UNIQUE,
        source          TEXT         DEFAULT 'auto',
        acknowledged    BOOLEAN      NOT NULL DEFAULT false,
        acknowledged_by INTEGER,
        acknowledged_at TIMESTAMPTZ,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
    )`,

    // 9. View: v_users (used by listUsers)
    `CREATE OR REPLACE VIEW ${S}.v_users AS
     SELECT * FROM ${S}.users WHERE deleted_at IS NULL`,

    // 10. View: v_active_sessions (used by listActiveSessions)
    `CREATE OR REPLACE VIEW ${S}.v_active_sessions AS
     SELECT s.*, u.username AS user_name
     FROM ${S}.user_sessions s
     JOIN ${S}.users u ON u.id = s.user_id
     WHERE s.is_active = TRUE AND s.expires_at > NOW()`,

    // 11. Indexes
    `CREATE INDEX IF NOT EXISTS idx_users_username ON ${S}.users(username)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_user ON ${S}.user_sessions(user_id, is_active)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_expires ON ${S}.user_sessions(expires_at)`,
    `CREATE INDEX IF NOT EXISTS idx_login_activity_user ON ${S}.user_login_activity(user_id, day)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_log_created ON ${S}.audit_log(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_alerts_created ON ${S}.alerts(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_connections_user ON ${S}.vigil_connections(user_id)`,
];

async function migrate() {
    const client = await pool.connect();
    console.log('[neon-migrate] Connected to Neon.');
    try {
        for (let i = 0; i < migrations.length; i++) {
            const sql = migrations[i].trim();
            const preview = sql.split('\n')[0].slice(0, 70);
            console.log(`  [${i + 1}/${migrations.length}] ${preview}...`);
            await client.query(sql);
        }
        console.log('[neon-migrate] All migrations applied successfully!');

        // Create default admin user (password: admin123)
        const bcrypt = await import('bcryptjs');
        const hash = bcrypt.default.hashSync('admin123', 12);
        await client.query(`
            INSERT INTO ${S}.users (username, password_hash, name, email, role, access_level, allowed_screens, status)
            VALUES ('admin', $1, 'System Administrator', 'admin@vigil.app', 'super_admin', 'write', '{}', 'active')
            ON CONFLICT (username) DO NOTHING
        `, [hash]);
        console.log('[neon-migrate] Default admin user created (admin / admin123)');

    } catch (err) {
        console.error('[neon-migrate] ERROR:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
