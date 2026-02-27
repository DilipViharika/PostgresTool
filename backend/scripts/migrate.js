// ==========================================================================
//  VIGIL — Database Migration  (scripts/migrate.js)
//  Run once: node scripts/migrate.js
// ==========================================================================

import 'dotenv/config';
import { pool } from '../db.js';

const migrations = [

    // ── Metric snapshots (time-series store) ──
    `
    CREATE TABLE IF NOT EXISTS vigil_metric_snapshots (
        time_bucket           TIMESTAMPTZ PRIMARY KEY,
        avg_qps               NUMERIC     DEFAULT 0,
        avg_tps               NUMERIC     DEFAULT 0,
        avg_latency_p50_ms    NUMERIC     DEFAULT 0,
        avg_latency_p95_ms    NUMERIC     DEFAULT 0,
        avg_latency_p99_ms    NUMERIC     DEFAULT 0,
        reads                 NUMERIC     DEFAULT 0,
        writes                NUMERIC     DEFAULT 0,
        commits               NUMERIC     DEFAULT 0,
        created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
    )
    `,

    // ── Backup history ──
    `
    CREATE TABLE IF NOT EXISTS vigil_backup_history (
        id                BIGSERIAL    PRIMARY KEY,
        backup_type       TEXT         NOT NULL DEFAULT 'Full',
        status            TEXT         NOT NULL DEFAULT 'success',
        started_at        TIMESTAMPTZ  NOT NULL,
        finished_at       TIMESTAMPTZ,
        size_bytes        BIGINT       DEFAULT 0,
        label             TEXT,
        next_scheduled_at TIMESTAMPTZ,
        notes             TEXT,
        created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
    )
    `,

    // ── Alerts ──
    `
    CREATE TABLE IF NOT EXISTS vigil_alerts (
        id          BIGSERIAL    PRIMARY KEY,
        severity    TEXT         NOT NULL DEFAULT 'info',
        title       TEXT         NOT NULL,
        message     TEXT,
        fingerprint TEXT         UNIQUE,
        source      TEXT         DEFAULT 'auto',
        read        BOOLEAN      NOT NULL DEFAULT false,
        dismissed   BOOLEAN      NOT NULL DEFAULT false,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
    )
    `,

    // ── Index on alerts for fast unread lookups ──
    `CREATE INDEX IF NOT EXISTS idx_vigil_alerts_unread ON vigil_alerts (read, dismissed, created_at DESC)`,

    // ── Index on snapshots for time-range queries ──
    `CREATE INDEX IF NOT EXISTS idx_vigil_snapshots_bucket ON vigil_metric_snapshots (time_bucket DESC)`,

    // ── Auto-prune snapshots older than 48 hours (optional pg rule) ──
    // Uncomment if you want DB-level enforcement:
    // `CREATE RULE vigil_snapshot_ttl AS ON INSERT TO vigil_metric_snapshots
    //  DO ALSO DELETE FROM vigil_metric_snapshots WHERE time_bucket < now() - interval '48 hours'`,
];

async function migrate() {
    console.log('[migrate] Connecting to database...');
    const client = await pool.connect();
    try {
        for (let i = 0; i < migrations.length; i++) {
            const sql = migrations[i].trim();
            const preview = sql.split('\n')[0].slice(0, 60);
            console.log(`[migrate] Running migration ${i + 1}/${migrations.length}: ${preview}...`);
            await client.query(sql);
            console.log(`[migrate] ✓ Done`);
        }
        console.log('[migrate] All migrations applied successfully.');
    } catch (err) {
        console.error('[migrate] ERROR:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();