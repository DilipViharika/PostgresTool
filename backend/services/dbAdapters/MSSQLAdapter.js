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
                    (SELECT count(*) FROM sys.dm_exec_requests WHERE session_id > 50) AS active_queries,
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%Memory Manager%' AND counter_name = 'Memory Grants Pending') AS memory_grants_pending,
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%Buffer Manager%' AND counter_name = 'Lazy writes/sec') AS lazy_writes_sec,
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%Buffer Manager%' AND counter_name = 'Checkpoint pages/sec') AS checkpoint_pages_sec,
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%Access Methods%' AND counter_name = 'Full Scans/sec') AS full_scans_sec,
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%Access Methods%' AND counter_name = 'Index Searches/sec') AS index_searches_sec,
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%SQL Statistics%' AND counter_name = 'SQL Compilations/sec') AS sql_compilations,
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%SQL Statistics%' AND counter_name = 'SQL Re-compilations/sec') AS sql_recompilations,
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%General Statistics%' AND counter_name = 'Processes blocked') AS processes_blocked,
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%Locks%' AND counter_name = 'Lock Waits/sec') AS lock_waits_sec,
                    (SELECT cntr_value FROM sys.dm_os_performance_counters
                     WHERE object_name LIKE '%Locks%' AND counter_name = 'Deadlocks/sec') AS deadlocks_sec,
                    (SELECT COUNT(DISTINCT task_address) FROM sys.dm_exec_requests WHERE wait_type IS NOT NULL) AS waiting_tasks,
                    (SELECT SUM(used_memory_kb) FROM sys.dm_os_memory_cache_hash_tables) AS memory_cache_kb,
                    (SELECT SUM(pages_allocated_count * 8) FROM sys.dm_os_memory_brokers) AS memory_brokers_kb
            `);

            const row = perfResult.rows[0] || {};

            // 1. Buffer cache hit ratio
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

            // 2. Active connections
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

            // 3. Active queries
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

            // 4. Memory grants pending
            const memoryGrantsPending = this.toNumber(row.memory_grants_pending, 0);
            metrics.push({
                id: 'memory_grants_pending',
                label: 'Memory Grants Pending',
                value: memoryGrantsPending,
                unit: 'count',
                category: 'performance',
                severity: memoryGrantsPending > 10 ? 'critical' : memoryGrantsPending > 0 ? 'warning' : 'ok',
                thresholds: { warning: 0, critical: 10 },
                description: 'Queries waiting for memory grants',
                dbSpecific: true,
            });

            // 5. Lazy writes per second
            const lazyWritesSec = this.toNumber(row.lazy_writes_sec, 0);
            metrics.push({
                id: 'lazy_writes_per_sec',
                label: 'Lazy Writes/sec',
                value: lazyWritesSec,
                unit: 'writes/sec',
                category: 'performance',
                severity: lazyWritesSec > 100 ? 'critical' : lazyWritesSec > 10 ? 'warning' : 'ok',
                thresholds: { warning: 10, critical: 100 },
                description: 'Lazy writer activity per second',
                dbSpecific: true,
            });

            // 6. Checkpoint pages per second
            const checkpointPagesSec = this.toNumber(row.checkpoint_pages_sec, 0);
            metrics.push({
                id: 'checkpoint_pages_per_sec',
                label: 'Checkpoint Pages/sec',
                value: checkpointPagesSec,
                unit: 'pages/sec',
                category: 'performance',
                severity: checkpointPagesSec > 1000 ? 'critical' : checkpointPagesSec > 100 ? 'warning' : 'ok',
                thresholds: { warning: 100, critical: 1000 },
                description: 'Pages flushed by checkpoint per second',
                dbSpecific: true,
            });

            // 7. Full scans per second
            const fullScansSec = this.toNumber(row.full_scans_sec, 0);
            metrics.push({
                id: 'full_scans_per_sec',
                label: 'Full Scans/sec',
                value: fullScansSec,
                unit: 'scans/sec',
                category: 'performance',
                severity: fullScansSec > 100 ? 'critical' : fullScansSec > 10 ? 'warning' : 'ok',
                thresholds: { warning: 10, critical: 100 },
                description: 'Full table/index scans per second',
                dbSpecific: false,
            });

            // 8. Index searches per second
            const indexSearchesSec = this.toNumber(row.index_searches_sec, 0);
            metrics.push({
                id: 'index_searches_per_sec',
                label: 'Index Searches/sec',
                value: indexSearchesSec,
                unit: 'searches/sec',
                category: 'performance',
                severity: 'ok',
                thresholds: { warning: 100000, critical: 500000 },
                description: 'Index searches per second',
                dbSpecific: false,
            });

            // 9. SQL compilations per second
            const sqlCompilations = this.toNumber(row.sql_compilations, 0);
            metrics.push({
                id: 'sql_compilations_per_sec',
                label: 'SQL Compilations/sec',
                value: sqlCompilations,
                unit: 'compilations/sec',
                category: 'performance',
                severity: sqlCompilations > 1000 ? 'critical' : sqlCompilations > 100 ? 'warning' : 'ok',
                thresholds: { warning: 100, critical: 1000 },
                description: 'SQL query compilations per second',
                dbSpecific: false,
            });

            // 10. SQL recompilations per second
            const sqlRecompilations = this.toNumber(row.sql_recompilations, 0);
            metrics.push({
                id: 'sql_recompilations_per_sec',
                label: 'SQL Recompilations/sec',
                value: sqlRecompilations,
                unit: 'recompilations/sec',
                category: 'performance',
                severity: sqlRecompilations > 100 ? 'critical' : sqlRecompilations > 10 ? 'warning' : 'ok',
                thresholds: { warning: 10, critical: 100 },
                description: 'SQL query recompilations per second',
                dbSpecific: false,
            });

            // 11. Processes blocked
            const processesBlocked = this.toNumber(row.processes_blocked, 0);
            metrics.push({
                id: 'processes_blocked',
                label: 'Blocked Processes',
                value: processesBlocked,
                unit: 'count',
                category: 'locks',
                severity: processesBlocked > 10 ? 'critical' : processesBlocked > 0 ? 'warning' : 'ok',
                thresholds: { warning: 0, critical: 10 },
                description: 'Number of currently blocked processes',
                dbSpecific: false,
            });

            // 12. Lock waits per second
            const lockWaitsSec = this.toNumber(row.lock_waits_sec, 0);
            metrics.push({
                id: 'lock_waits_per_sec',
                label: 'Lock Waits/sec',
                value: lockWaitsSec,
                unit: 'waits/sec',
                category: 'locks',
                severity: lockWaitsSec > 100 ? 'critical' : lockWaitsSec > 10 ? 'warning' : 'ok',
                thresholds: { warning: 10, critical: 100 },
                description: 'Lock waits per second',
                dbSpecific: true,
            });

            // 13. Deadlocks per second
            const deadlocksSec = this.toNumber(row.deadlocks_sec, 0);
            metrics.push({
                id: 'deadlocks_per_sec',
                label: 'Deadlocks/sec',
                value: deadlocksSec,
                unit: 'deadlocks/sec',
                category: 'locks',
                severity: deadlocksSec > 1 ? 'critical' : deadlocksSec > 0 ? 'warning' : 'ok',
                thresholds: { warning: 0, critical: 1 },
                description: 'Deadlocks per second',
                dbSpecific: true,
            });

            // 14. Tasks waiting
            const waitingTasks = this.toNumber(row.waiting_tasks, 0);
            metrics.push({
                id: 'waiting_tasks',
                label: 'Waiting Tasks',
                value: waitingTasks,
                unit: 'count',
                category: 'performance',
                severity: waitingTasks > 50 ? 'critical' : waitingTasks > 10 ? 'warning' : 'ok',
                thresholds: { warning: 10, critical: 50 },
                description: 'Tasks currently waiting',
                dbSpecific: true,
            });

            // 15. Memory cache KB
            const memoryCacheKb = this.toNumber(row.memory_cache_kb, 0);
            metrics.push({
                id: 'memory_cache_kb',
                label: 'Memory Cache',
                value: memoryCacheKb,
                unit: 'MB',
                category: 'performance',
                severity: 'ok',
                thresholds: { warning: 1000000, critical: 2000000 },
                description: 'Total memory cache usage in KB',
                dbSpecific: true,
            });

            // 16. Plan cache ratio
            const planCacheRatioResult = await this.query(`
                SELECT
                    (SELECT COUNT(*) FROM sys.dm_exec_cached_plans WHERE objtype = 'Proc' AND usecounts > 1) AS reused_plans,
                    (SELECT COUNT(*) FROM sys.dm_exec_cached_plans) AS total_plans
            `);
            const planRow = planCacheRatioResult.rows[0] || { reused_plans: 0, total_plans: 0 };
            const totalPlans = this.toNumber(planRow.total_plans, 1);
            const reusedPlans = this.toNumber(planRow.reused_plans, 0);
            const planCacheRatio = totalPlans > 0 ? this.round((reusedPlans / totalPlans) * 100, 2) : 0;
            metrics.push({
                id: 'plan_cache_hit_ratio',
                label: 'Plan Cache Hit Ratio',
                value: planCacheRatio,
                unit: '%',
                category: 'performance',
                severity: planCacheRatio >= 80 ? 'ok' : planCacheRatio >= 50 ? 'warning' : 'critical',
                thresholds: { warning: 50, critical: 20 },
                description: 'Percentage of reused execution plans',
                dbSpecific: true,
            });

            // 17. Tempdb size
            const tempdbResult = await this.query(`
                SELECT SUM(size * 8 / 1024.0) AS tempdb_size_mb FROM sys.master_files WHERE database_id = 2
            `);
            const tempdbSize = this.toNumber((tempdbResult.rows[0] || {}).tempdb_size_mb, 0);
            metrics.push({
                id: 'tempdb_size_mb',
                label: 'TempDB Size',
                value: tempdbSize,
                unit: 'MB',
                category: 'performance',
                severity: tempdbSize > 5000 ? 'critical' : tempdbSize > 1000 ? 'warning' : 'ok',
                thresholds: { warning: 1000, critical: 5000 },
                description: 'Current TempDB size',
                dbSpecific: true,
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
