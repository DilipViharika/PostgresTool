// ==========================================================================
//  VIGIL — Enterprise Features Migration  (scripts/migrate-enterprise.ts)
//  Run once: npx ts-node scripts/migrate-enterprise.ts
// ==========================================================================

import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool();

const migrations = [
    `CREATE TABLE IF NOT EXISTS pgmonitoringtool.organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS pgmonitoringtool.licenses (
        id SERIAL PRIMARY KEY,
        license_key TEXT NOT NULL UNIQUE,
        tier VARCHAR(20) NOT NULL
    )`,
];

async function runMigrations(): Promise<void> {
    try {
        for (const migration of migrations) {
            await pool.query(migration);
            console.log('✓ Enterprise migration executed');
        }
        console.log('✓ All enterprise migrations completed');
    } catch (err: any) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrations();
