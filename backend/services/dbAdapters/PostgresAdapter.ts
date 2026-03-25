/**
 * PostgresAdapter.ts
 *
 * PostgreSQL-specific adapter using the pg driver.
 * This is the most feature-complete adapter since PostgreSQL has extensive monitoring views.
 */

import { Pool } from 'pg';
import { BaseAdapter } from './BaseAdapter.js';

interface PoolConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  max?: number;
}

interface QueryResult {
  rows: any[];
  rowCount?: number;
  duration?: number;
}

export class PostgresAdapter extends BaseAdapter {
  protected pool: Pool | null;

  constructor(config: any) {
    super(config);
    this.dbType = 'postgresql';
    this.pool = null;
  }

  getDriverName(): string {
    return 'PostgreSQL';
  }

  async connect(): Promise<void> {
    try {
      // Build connection config from this.config
      const poolConfig: PoolConfig = {
        host: this.config.host,
        port: this.config.port || 5432,
        database: this.config.database || 'postgres',
        user: this.config.user || 'postgres',
        password: this.config.password,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 10,
      };

      // Filter out undefined values
      Object.keys(poolConfig).forEach((key) => {
        if ((poolConfig as any)[key] === undefined) {
          delete (poolConfig as any)[key];
        }
      });

      this.pool = new Pool(poolConfig);
      await this.pool.query('SELECT 1');
      this.connected = true;
    } catch (error) {
      throw new Error(`PostgreSQL connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.connected = false;
    }
  }

  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!this.pool) {
      throw new Error('Not connected to PostgreSQL');
    }
    const startTime = Date.now();
    const result = await this.pool.query(sql, params);
    const duration = Date.now() - startTime;
    return { rows: result.rows, rowCount: result.rowCount ?? undefined, duration };
  }

  async getOverviewStats(): Promise<any> {
    const result = await this.query(`
      SELECT
          (SELECT count(*) FROM pg_stat_activity WHERE state='active')        AS active_connections,
          (SELECT count(*) FROM pg_stat_activity)                             AS total_connections,
          (SELECT pg_database_size(current_database()))                       AS db_size_bytes,
          (SELECT EXTRACT(EPOCH FROM now() - pg_postmaster_start_time()))     AS uptime_seconds,
          (SELECT version())                                                   AS version
    `);
    return result.rows[0] || {};
  }

  async getPerformanceStats(): Promise<any> {
    const result = await this.query(`
      SELECT
          ROUND((SELECT COALESCE(sum(heap_blks_hit)::numeric / NULLIF(sum(heap_blks_hit + heap_blks_read), 0), 0) * 100, 2))
              FROM pg_statio_user_tables AS cache_hit_ratio,
          COALESCE((SELECT sum(xact_commit + xact_rollback) FROM pg_stat_database WHERE datname = current_database()), 0) /
              GREATEST(EXTRACT(EPOCH FROM now() - pg_postmaster_start_time()), 1) AS transactions_per_sec
    `);
    return result.rows[0] || {};
  }

  async getTableStats(): Promise<any[]> {
    const result = await this.query(`
      SELECT
          schemaname, tablename, n_live_tup, n_dead_tup,
          pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
      FROM pg_stat_user_tables
      ORDER BY size_bytes DESC
    `);
    return result.rows;
  }

  async getIndexStats(): Promise<any[]> {
    const result = await this.query(`
      SELECT
          schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch,
          pg_relation_size(indexrelid) AS size_bytes
      FROM pg_stat_user_indexes
      ORDER BY size_bytes DESC
    `);
    return result.rows;
  }

  async getActiveConnections(): Promise<any[]> {
    const result = await this.query(`
      SELECT pid, usename, application_name, client_addr, state, query, query_start
      FROM pg_stat_activity
      WHERE pid <> pg_backend_pid()
      ORDER BY query_start DESC
    `);
    return result.rows;
  }

  async getLockInfo(): Promise<any[]> {
    const result = await this.query(`
      SELECT
          a.pid, a.usename, a.query,
          l.locktype, l.relation, l.granted
      FROM pg_locks l
      JOIN pg_stat_activity a ON l.pid = a.pid
      WHERE NOT l.granted
    `);
    return result.rows;
  }

  async getReplicationStatus(): Promise<any> {
    const result = await this.query(`
      SELECT
          slot_name, slot_type, active, restart_lsn
      FROM pg_replication_slots
      LIMIT 1
    `);
    return result.rows[0] || {};
  }

  async getDatabaseList(): Promise<any[]> {
    const result = await this.query(`
      SELECT datname, pg_database_size(datname) AS size_bytes
      FROM pg_database
      WHERE datistemplate = false
      ORDER BY datname
    `);
    return result.rows;
  }

  async getServerVersion(): Promise<any> {
    const result = await this.query(`SELECT version()`);
    return { version: result.rows[0]?.version || 'Unknown' };
  }

  async executeQuery(sql: string, params: any[] = []): Promise<any> {
    return this.query(sql, params);
  }

  async getKeyMetrics(): Promise<any[]> {
    return [];
  }

  getCapabilities(): any {
    return {
      replication: true,
      vacuum: true,
      indexes: true,
      locks: true,
      queryPlan: true,
      wal: true,
      schemas: true,
      storedProcedures: true,
      partitioning: true,
    };
  }
}

export default PostgresAdapter;
