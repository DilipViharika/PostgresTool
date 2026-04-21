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

// Resolve SSL config from environment.
// Set DB_SSL=true to enable SSL. By default we validate the server's certificate
// (strict TLS). To opt into accepting self-signed certs (non-production use):
//   VIGIL_TLS_ALLOW_SELF_SIGNED=true
// To trust a private CA, set VIGIL_TLS_CA_CERT to the PEM bundle contents.
function resolveSsl() {
    if (process.env.DB_SSL !== 'true') return false;
    const isProd = process.env.NODE_ENV === 'production';
    const allowSelfSigned =
        process.env.VIGIL_TLS_ALLOW_SELF_SIGNED === 'true'
        || (!isProd && process.env.VIGIL_TLS_STRICT !== 'true');
    const ca = process.env.VIGIL_TLS_CA_CERT;
    const opt = { rejectUnauthorized: !allowSelfSigned };
    if (ca) opt.ca = ca;
    return opt;
}

// Build a connection config that works whether DATABASE_URL is set or not.
function buildPoolConfig() {
    const ssl = resolveSsl();
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl,
        };
    }
    // Fall back to the same individual variables used by server.js
    return {
        user:     process.env.PGUSER     || 'postgres',
        host:     process.env.PGHOST,
        database: process.env.PGDATABASE || 'postgres',
        password: process.env.PGPASSWORD,
        port:     Number(process.env.PGPORT) || 5432,
        ssl,
    };
}

export const pool = new Pool({
    ...buildPoolConfig(),
    max:              10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
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
