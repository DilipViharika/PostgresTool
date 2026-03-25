// ==========================================================================
//  VIGIL — Database Migration  (scripts/migrate.ts)
//  Run once: npx ts-node scripts/migrate.ts
// ==========================================================================

import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool();

const migrations = [
    'CREATE SCHEMA IF NOT EXISTS pgmonitoringtool',
    `CREATE TABLE IF NOT EXISTS pgmonitoringtool.vigil_connections (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL DEFAULT 5432
    )`,
];

async function runMigrations(): Promise<void> {
    try {
        for (const migration of migrations) {
            await pool.query(migration);
            console.log('✓ Migration executed');
        }
        console.log('✓ All migrations completed');
    } catch (err: any) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrations();
