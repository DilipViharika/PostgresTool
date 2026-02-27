// ==========================================================================
//  VIGIL — Database Pool  (db.js)
//
//  NOTE: server.js creates and owns the primary connection pool using the
//  individual PG* environment variables (PGHOST, PGUSER, etc.).  This file
//  provides a secondary convenience pool that can be used in standalone
//  scripts (e.g. migrations) or unit tests via DATABASE_URL.
//
//  If DATABASE_URL is not set, it falls back to the same PG* variables that
//  server.js uses, so both pools will connect to the same database.
// ==========================================================================

import pg from 'pg';

const { Pool } = pg;

// Build a connection config that works whether DATABASE_URL is set or not.
function buildPoolConfig() {
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
        };
    }
    // Fall back to the same individual variables used by server.js
    return {
        user:     process.env.PGUSER     || 'postgres',
        host:     process.env.PGHOST,
        database: process.env.PGDATABASE || 'postgres',
        password: process.env.PGPASSWORD,
        port:     Number(process.env.PGPORT) || 5432,
        ssl: { rejectUnauthorized: false },
    };
}

export const pool = new Pool({
    ...buildPoolConfig(),
    max:              10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    options: '--search_path=pgmonitoringtool,public',
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
});

/**
 * Convenience wrapper — runs a single query and returns the result.
 * @param {string} text
 * @param {any[]}  params
 */
export const query = (text, params) => pool.query(text, params);
