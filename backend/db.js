// ==========================================================================
//  VIGIL — Database Pool  (db.js)
// ==========================================================================

import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max:              10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err);
});

/**
 * Convenience wrapper — runs a single query and returns rows.
 * @param {string} text
 * @param {any[]}  params
 */
export const query = (text, params) => pool.query(text, params);