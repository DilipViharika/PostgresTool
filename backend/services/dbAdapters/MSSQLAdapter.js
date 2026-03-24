/**
 * MSSQLAdapter.js
 *
 * Microsoft SQL Server-specific adapter using the mssql driver.
 * Note: The mssql package should be added to dependencies.
 *
 * Metrics sourced from:
 * - sys.dm_exec_sessions for connections
 * - sys.dm_os_performance_counters for server stats
 * - sys.databases for database info
 * - sys.indexes for index stats
 */

import { BaseAdapter } from './BaseAdapter.js';

let mssql;
try {
    mssql = await import('mssql');
} catch (error) {
    mssql = null;
}

export class MSSQLAdapter extends BaseAdapter {
    constructor(config) {
        super(config);
        this.dbType = 'mssql';
        this.pool = null;
    }

    getDriverName() {
        return 'Microsoft SQL Server';
    }

    _checkDriver() {
        if (!mssql) {
            throw new Error('MSSQL driver (mssql) not installed. Install with: npm install mssql');
        }
    }

    async connect() {
        this._checkDriver();
        try {
            this.pool = new mssql.ConnectionPool({
                server: this.config.host,
                port: this.config.port || 1433,
                database: this.config.database || 'master',
                user: this.config.user,
                password: this.config.password,
                authentication: {
                    type: 'default',
                },
                options: {
                    encrypt: this.config.ssl !== false,
                    trustServerCertificate: true,
                    connectionTimeout: 5000,
                    requestTimeout: 5000,
                },
            });

            await this.pool.connect();
            this.connected = true;
        } catch (error) {
            throw new Error(`MSSQL connection failed: ${error.message}`);
        }
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
            this.connected = false;
        }
    }

    async query(sql) {
        if (!this.pool) {
            throw new Error('Not connected to MSSQL');
        }
        const startTime = Date.now();
        const request = this.pool.request();
        const result = await request.query(sql);
        const duration = Date.now() - startTime;
        return { rows: result.recordset || [], duration };
    }

    async getOverviewStats() {
        const result = await this.query(`
            SELECT
                (SELECT count(*) FROM sys.dm_exec_sessions WHERE session_id > 50) AS active_connections,
                (SELECT count(*) FROM sys.dm_exec_sessions WHERE session_id > 50) AS total_connections,
                (SELECT sum(size * 8 / 1024.0 / 1024.0) FROM sys.master_files WHERE database_id = db_id()) AS db_size_mb,
                (SELECT datediff(second, login_time, getdate()) FROM sys.dm_exec_sessions WHERE session_id = 1) AS uptime_seconds,
                @@version AS version,
                (SELECT cntr_value FROM sys.dm_os_performance_counters
                 WHERE object_name LIKE '%Buffer Manager%' AND counter_name = 'Buffer cache hit ratio') AS cache_hit_ratio,
                0 AS transactions_per_sec,
                0 AS tuples_inserted,
                0 AS tuples_updated,
                0 AS tuples_deleted,
                0 AS tuples_fetched
        `);

        const row = result.rows[0];
        return {
            activeConnections: this.toNumber(row.active_connections),
            totalConnections: this.toNumber(row.total_connections),
            dbSizeBytes: this.toNumber(row.db_size_mb) * 1024 * 1024,
            uptimeSeconds: this.toNumber(row.uptime_seconds),
            version: row.version,
            cacheHitRatio: this.toNumber(row.cache_hit_ratio),
            transactionsPerSec: 0,
            tuplesInserted: 0,
            tuplesUpdated: 0,
            tuplesDeleted: 0,
            tuplesFetched: 0,
        };
    }

    async getPerformanceStats() {
        const result = await this.query(`
            SELECT
                (SELECT avg(total_elapsed_time / execution_count / 1000.0)
                 FROM sys.dm_exec_query_stats) AS avg_query_time_ms,
                (SELECT count(*) FROM sys.dm_exec_requests WHERE session_id > 50) AS active_queries,
                (SELECT count(*) FROM sys.dm_exec_requests WHERE wait_type IS NOT NULL) AS queries_waiting,
                (SELECT cntr_value FROM sys.dm_os_performance_counters
                 WHERE object_name LIKE '%Buffer Manager%' AND counter_name = 'Buffer cache hit ratio') AS cache_hit_ratio
        `);

        const row = result.rows[0];
        return {
            avgQueryTimeMs: this.toNumber(row.avg_query_time_ms),
            activeQueries: this.toNumber(row.active_queries),
            queriesWaiting: this.toNumber(row.queries_waiting),
            cacheHitRatio: this.toNumber(row.cache_hit_ratio),
        };
    }

    async getTableStats() {
        const result = await this.query(`
            SELECT
                s.name AS [schema],
                t.name AS name,
                p.rows AS row_estimate,
                (select sum(s_reserved.used_page_count)*8192 from sys.dm_db_partition_stats ps where ps.object_id = t.object_id) AS total_size_bytes,
                (select sum(s_used.used_page_count)*8192 from sys.dm_db_partition_stats ps, (select used_page_count, object_id, index_id from sys.dm_db_page_info(db_id(), null, null, 'LIMITED')) s_used
                 where ps.object_id = s_used.object_id and ps.index_id = s_used.index_id) AS table_size_bytes,
                (select sum(s_reserved.used_page_count)*8192 from sys.dm_db_partition_stats ps where ps.object_id = t.object_id and ps.index_id > 0) AS index_size_bytes,
                0 AS dead_tuples,
                NULL AS last_vacuum,
                NULL AS last_autovacuum,
                NULL AS last_analyze,
                NULL AS last_autoanalyze
            FROM sys.tables t
            JOIN sys.schemas s ON t.schema_id = s.schema_id
            JOIN sys.dm_db_partition_stats p ON t.object_id = p.object_id AND p.index_id < 2
            ORDER BY total_size_bytes DESC
        `);

        return result.rows.map(row => ({
            schema: row.schema,
            name: row.name,
            rowEstimate: this.toNumber(row.row_estimate),
            totalSizeBytes: this.toNumber(row.total_size_bytes),
            tableSizeBytes: this.toNumber(row.table_size_bytes),
            indexSizeBytes: this.toNumber(row.index_size_bytes),
            deadTuples: 0,
            lastVacuum: row.last_vacuum,
            lastAutovacuum: row.last_autovacuum,
            lastAnalyze: row.last_analyze,
            lastAutoanalyze: row.last_autoanalyze,
        }));
    }

    async getIndexStats() {
        const result = await this.query(`
            SELECT
                s.name AS [schema],
                t.name AS [table],
                i.name AS name,
                (select sum(used_page_count)*8192 from sys.dm_db_page_info(db_id(), null, null, 'LIMITED') ps where ps.object_id = i.object_id and ps.index_id = i.index_id) AS size_bytes,
                ps.user_seeks + ps.user_scans + ps.user_lookups AS scans,
                0 AS rows_read,
                0 AS rows_fetched
            FROM sys.indexes i
            JOIN sys.objects o ON i.object_id = o.object_id
            JOIN sys.schemas s ON o.schema_id = s.schema_id
            JOIN sys.tables t ON o.object_id = t.object_id
            LEFT JOIN sys.dm_db_index_usage_stats ps ON i.object_id = ps.object_id AND i.index_id = ps.index_id
            WHERE i.index_id > 0
            ORDER BY size_bytes DESC
        `);

        return result.rows.map(row => ({
            schema: row.schema,
            table: row.table,
            name: row.name,
            sizeBytes: this.toNumber(row.size_bytes),
            scans: this.toNumber(row.scans),
            rowsRead: this.toNumber(row.rows_read),
            rowsFetched: this.toNumber(row.rows_fetched),
        }));
    }

    async getActiveConnections() {
        const result = await this.query(`
            SELECT
                es.session_id AS pid,
                es.login_name AS user,
                db_name(es.database_id) AS database,
                er.status AS state,
                SUBSTRING(st.text, er.statement_start_offset/2, (er.statement_end_offset - er.statement_start_offset)/2) AS query,
                datediff(second, es.login_time, getdate()) AS duration_seconds,
                es.client_interface_name AS client_addr
            FROM sys.dm_exec_sessions es
            LEFT JOIN sys.dm_exec_requests er ON es.session_id = er.session_id
            CROSS APPLY sys.dm_exec_sql_text(er.sql_handle) st
            WHERE es.session_id > 50
            ORDER BY es.login_time DESC
        `);

        return result.rows.map(row => ({
            pid: this.toNumber(row.pid),
            user: row.user,
            database: row.database,
            state: row.state || 'sleeping',
            query: row.query,
            durationSeconds: this.toNumber(row.duration_seconds),
            clientAddr: row.client_addr,
        }));
    }

    async getLockInfo() {
        try {
            const result = await this.query(`
                SELECT
                    er.session_id AS blocked_pid,
                    blocked_by.blocking_session_id AS blocking_pid,
                    'exclusive' AS lock_mode
                FROM sys.dm_exec_requests er
                CROSS APPLY sys.dm_exec_sql_text(er.sql_handle) st
                JOIN (
                    SELECT session_id, blocking_session_id
                    FROM sys.dm_exec_requests
                    WHERE blocking_session_id <> 0
                ) blocked_by ON er.session_id = blocked_by.session_id
            `);
            return result.rows.map(row => ({
                blockedPid: this.toNumber(row.blocked_pid),
                blockingPid: this.toNumber(row.blocking_pid),
                blockingUser: null,
                blockedQuery: null,
                blockingQuery: null,
                lockMode: row.lock_mode,
            }));
        } catch {
            return [];
        }
    }

    async getReplicationStatus() {
        return {
            isReplica: false,
            replicaAppName: null,
            maxReplicationLagMb: 0,
            replicaCount: 0,
        };
    }

    async getDatabaseList() {
        const result = await this.query(`
            SELECT
                name AS name,
                (SELECT sum(size * 8 / 1024.0 / 1024.0) FROM sys.master_files WHERE database_id = d.database_id) * 1024 * 1024 AS size_bytes,
                is_read_only AS is_template
            FROM sys.databases d
            WHERE database_id > 4
            ORDER BY size_bytes DESC
        `);

        return result.rows.map(row => ({
            name: row.name,
            sizeBytes: this.toNumber(row.size_bytes),
            isTemplate: row.is_template,
            connections: 0,
        }));
    }

    async getServerVersion() {
        const result = await this.query(`SELECT @@version AS version, @@microsoftversion AS version_num`);

        const row = result.rows[0];
        const versionStr = row.version || '';
        const parts = versionStr.split(' ')[0].split('.');
        const major = this.toNumber(parts[0], 0);
        const minor = this.toNumber(parts[1], 0);

        return {
            version: versionStr,
            versionNum: this.toNumber(row.version_num),
            major,
            minor,
            dbType: 'mssql',
        };
    }

    async executeQuery(sql) {
        const startTime = Date.now();
        const request = this.pool.request();
        const result = await request.query(sql);
        const duration = Date.now() - startTime;

        const rows = result.recordset || [];
        const fields = rows.length > 0 ? Object.keys(rows[0]).map(name => ({ name, type: typeof rows[0][name] })) : [];

        return {
            rows,
            fields,
            rowCount: rows.length,
            duration,
        };
    }

    async getKeyMetrics() {
        const metrics = [];

        try {
            const perfResult = await this.query(`
                SELECT
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%Buffer Manager%' AND counter_name = 'Buffer cache hit ratio') AS hit_ratio,
                    (SELECT count(*) FROM sys.dm_exec_sessions WHERE session_id > 50) AS connections,
                    (SELECT count(*) FROM sys.dm_exec_requests WHERE session_id > 50) AS active_queries
            `);

            const row = perfResult.rows[0];
            const hitRatio = this.toNumber(row.hit_ratio, 0);

            metrics.push({
                id: 'buffer_cache_hit_ratio',
                label: 'Buffer Cache Hit Ratio',
                value: hitRatio,
                unit: '%',
                category: 'performance',
                severity: hitRatio >= 99 ? 'ok' : hitRatio >= 90 ? 'warning' : 'critical',
                thresholds: { warning: 90, critical: 80 },
                description: 'Percentage of buffer cache hits',
                dbSpecific: false,
            });

            const connections = this.toNumber(row.connections, 0);
            metrics.push({
                id: 'active_connections',
                label: 'Active Connections',
                value: connections,
                unit: 'count',
                category: 'connections',
                severity: connections > 100 ? 'warning' : connections > 200 ? 'critical' : 'ok',
                thresholds: { warning: 100, critical: 200 },
                description: 'Number of active connections',
                dbSpecific: false,
            });

            const activeQueries = this.toNumber(row.active_queries, 0);
            metrics.push({
                id: 'active_queries',
                label: 'Active Queries',
                value: activeQueries,
                unit: 'count',
                category: 'performance',
                severity: activeQueries > 50 ? 'warning' : activeQueries > 100 ? 'critical' : 'ok',
                thresholds: { warning: 50, critical: 100 },
                description: 'Number of active queries',
                dbSpecific: false,
            });
        } catch (error) {
            console.error('Error getting MSSQL metrics:', error.message);
        }

        return metrics;
    }

    getCapabilities() {
        return {
            replication: true,
            vacuum: false,
            indexes: true,
            locks: true,
            queryPlan: true,
            wal: false,
            schemas: true,
            storedProcedures: true,
            partitioning: true,
            sharding: false,
        };
    }
}

export default MSSQLAdapter;
