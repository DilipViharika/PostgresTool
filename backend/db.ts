// ==========================================================================
//  VIGIL — Database Pool  (db.ts)
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
import type { QueryResultRow } from 'pg';

const { Pool } = pg;

interface PoolConfigWithUrl {
  connectionString: string;
  ssl: boolean | { rejectUnauthorized: boolean };
}

interface PoolConfigWithParams {
  user: string;
  host?: string;
  database: string;
  password?: string;
  port: number;
  ssl: boolean | { rejectUnauthorized: boolean };
}

type PoolConfig = PoolConfigWithUrl | PoolConfigWithParams;

// Resolve SSL config from environment.
// Set DB_SSL=true to enable SSL.
// Leave unset (or set to false) for plain-text connections (e.g. localhost dev).
function resolveSsl(): boolean | { rejectUnauthorized: boolean } {
  if (process.env.DB_SSL !== 'true') return false;
  // SEC-009: Only disable certificate validation in development
  const rejectUnauthorized = process.env.NODE_ENV === 'production'
    ? (process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false')  // default true in prod
    : false;  // allow self-signed in dev
  return { rejectUnauthorized };
}

// Build a connection config that works whether DATABASE_URL is set or not.
function buildPoolConfig(): PoolConfig {
  const ssl = resolveSsl();
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl,
    };
  }
  // Fall back to the same individual variables used by server.js
  return {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST,
    database: process.env.PGDATABASE || 'postgres',
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT) || 5432,
    ssl,
  };
}

export const pool = new Pool({
  ...buildPoolConfig(),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err: Error) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

/**
 * Convenience wrapper — runs a single query and returns the result.
 * @param {string} text SQL query text
 * @param {any[]}  params Query parameters
 */
export const query = <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> =>
  pool.query<T>(text, params);
