/**
 * OracleAdapter.js
 *
 * Oracle Database-specific adapter using the oracledb driver.
 * Note: The oracledb package should be added to dependencies.
 *
 * Metrics sourced from:
 * - V$SESSION for connections and sessions
 * - V$SYSSTAT for server statistics
 * - DBA_TABLES for table information
 * - DBA_INDEXES for index information
 * - V$LOCK for lock information
 */

import { BaseAdapter } from './BaseAdapter.js';

let oracledb;
try {
    oracledb = await import('oracledb');
} catch (error) {
    oracledb = null;
}

export class OracleAdapter extends BaseAdapter {
    constructor(config) {
        super(config);
        this.dbType = 'oracle';
        this.connection = null;
    }

    getDriverName() {
        return 'Oracle Database';
    }

    _checkDriver() {
        if (!oracledb) {
            throw new Error('Oracle driver (oracledb) not installed. Install with: npm install oracledb');
        }
    }

    async connect() {
        this._checkDriver();
        try {
            this.connection = await oracledb.getConnection({
                user: this.config.user,
                password: this.config.password,
                connectString: `${this.config.host}:${this.config.port || 1521}/${this.config.database || 'ORCL'}`,
            });
            this.connected = true;
        } catch (error) {
            throw new Error(`Oracle connection failed: ${error.message}`);
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
            this.connected = false;
        }
    }

    async query(sql) {
        if (!this.connection) {
            throw new Error('Not connected to Oracle');
        }
        const startTime = Date.now();
        const result = await this.connection.execute(sql);
        const duration = Date.now() - startTime;

        // Convert Oracle result to standard format
        const rows = (result.rows || []).map(row => {
            const obj = {};
            if (result.metaData) {
                result.metaData.forEach((col, idx) => {
                    obj[col.name] = row[idx];
                });
            }
            return obj;
        });

        return { rows, duration };
    }

    async getOverviewStats() {
        const result = await this.query(`
            SELECT
                (SELECT count(*) FROM v$session WHERE type != 'BACKGROUND') AS active_connections,
                (SELECT count(*) FROM v$session) AS total_connections,
                (SELECT sum(bytes) FROM dba_data_files) AS db_size_bytes,
                (SELECT trunc((sysdate - startup_time) * 86400) FROM v$instance) AS uptime_seconds,
                (SELECT banner FROM v$version WHERE rownum = 1) AS version,
                (SELECT round((1 - (sum(decode(name, 'physical reads', value, 0)) /
                    (sum(decode(name, 'db block gets', value, 0)) + sum(decode(name, 'consistent gets', value, 0))))) * 100, 2)
                 FROM v$sysstat) AS cache_hit_ratio,
                (SELECT round(value / 3600, 2) FROM v$sysstat WHERE name = 'user commits') AS transactions_per_sec,
                (SELECT value FROM v$sysstat WHERE name = 'rows inserted') AS tuples_inserted,
                (SELECT value FROM v$sysstat WHERE name = 'rows updated') AS tuples_updated,
                (SELECT value FROM v$sysstat WHERE name = 'rows deleted') AS tuples_deleted,
                (SELECT value FROM v$sysstat WHERE name = 'table fetch by rowid') AS tuples_fetched
        `);

        const row = result.rows[0];
        return {
            activeConnections: this.toNumber(row.active_connections),
            totalConnections: this.toNumber(row.total_connections),
            dbSizeBytes: this.toNumber(row.db_size_bytes),
            uptimeSeconds: this.toNumber(row.uptime_seconds),
            version: row.version,
            cacheHitRatio: this.round(row.cache_hit_ratio),
            transactionsPerSec: this.round(row.transactions_per_sec),
            tuplesInserted: this.toNumber(row.tuples_inserted),
            tuplesUpdated: this.toNumber(row.tuples_updated),
            tuplesDeleted: this.toNumber(row.tuples_deleted),
            tuplesFetched: this.toNumber(row.tuples_fetched),
        };
    }

    async getPerformanceStats() {
        const result = await this.query(`
            SELECT
                (SELECT round(avg(elapsed_time / executions / 1000), 2) FROM v$sql WHERE executions > 0) AS avg_query_time_ms,
                (SELECT count(*) FROM v$session WHERE state = 'ACTIVE' AND type != 'BACKGROUND') AS active_queries,
                (SELECT count(*) FROM v$session WHERE event LIKE '%wait%') AS queries_waiting,
                (SELECT round((1 - (sum(decode(name, 'physical reads', value, 0)) /
                    (sum(decode(name, 'db block gets', value, 0)) + sum(decode(name, 'consistent gets', value, 0))))) * 100, 2)
                 FROM v$sysstat) AS cache_hit_ratio
        `);

        const row = result.rows[0];
        return {
            avgQueryTimeMs: this.toNumber(row.avg_query_time_ms),
            activeQueries: this.toNumber(row.active_queries),
            queriesWaiting: this.toNumber(row.queries_waiting),
            cacheHitRatio: this.round(row.cache_hit_ratio),
        };
    }

    async getTableStats() {
        const result = await this.query(`
            SELECT
                owner AS schema,
                table_name AS name,
                num_rows AS row_estimate,
                (SELECT sum(bytes) FROM dba_segments WHERE segment_name = table_name AND owner = dba_tables.owner) AS total_size_bytes,
                (SELECT sum(bytes) FROM dba_segments WHERE segment_name = table_name AND owner = dba_tables.owner AND segment_type = 'TABLE') AS table_size_bytes,
                (SELECT sum(bytes) FROM dba_segments WHERE segment_name = table_name AND owner = dba_tables.owner AND segment_type = 'INDEX') AS index_size_bytes,
                0 AS dead_tuples,
                last_analyzed AS last_analyze,
                NULL AS last_vacuum,
                NULL AS last_autovacuum,
                NULL AS last_autoanalyze
            FROM dba_tables
            WHERE owner NOT IN ('SYS', 'SYSTEM')
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
            lastVacuum: null,
            lastAutovacuum: null,
            lastAnalyze: this.formatTimestamp(row.last_analyze),
            lastAutoanalyze: null,
        }));
    }

    async getIndexStats() {
        const result = await this.query(`
            SELECT
                owner AS schema,
                table_name AS table,
                index_name AS name,
                (SELECT sum(bytes) FROM dba_segments WHERE segment_name = index_name AND owner = dba_indexes.owner) AS size_bytes,
                0 AS scans,
                0 AS rows_read,
                0 AS rows_fetched
            FROM dba_indexes
            WHERE owner NOT IN ('SYS', 'SYSTEM')
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
                sid AS pid,
                username AS user,
                null AS database,
                status AS state,
                (SELECT sql_text FROM v$sql WHERE hash_value = v$session.sql_hash_value AND address = v$session.sql_address) AS query,
                trunc((sysdate - logon_time) * 86400) AS duration_seconds,
                machine AS client_addr
            FROM v$session
            WHERE type != 'BACKGROUND' AND status = 'ACTIVE'
            ORDER BY logon_time DESC
        `);

        return result.rows.map(row => ({
            pid: this.toNumber(row.pid),
            user: row.user,
            database: row.database,
            state: row.state,
            query: row.query,
            durationSeconds: this.toNumber(row.duration_seconds),
            clientAddr: row.client_addr,
        }));
    }

    async getLockInfo() {
        try {
            const result = await this.query(`
                SELECT
                    l.sid AS blocked_pid,
                    (SELECT sid FROM v$lock WHERE id1 = l.id1 AND id2 = l.id2 AND block = 0) AS blocking_pid,
                    l.type AS lock_mode
                FROM v$lock l
                WHERE l.block = 1
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
                (SELECT sum(bytes) FROM dba_data_files WHERE tablespace_name = (SELECT default_tablespace FROM dba_users WHERE username = name)) AS size_bytes,
                0 AS is_template
            FROM dba_users
            WHERE username NOT IN ('SYS', 'SYSTEM')
        `);

        return result.rows.map(row => ({
            name: row.name,
            sizeBytes: this.toNumber(row.size_bytes),
            isTemplate: row.is_template,
            connections: 0,
        }));
    }

    async getServerVersion() {
        const result = await this.query(`SELECT banner FROM v$version WHERE rownum = 1`);

        const versionStr = result.rows[0]?.banner || 'Unknown';
        const parts = versionStr.split(' ');
        const major = parseInt(parts[2]?.split('.')[0], 10) || 0;
        const minor = parseInt(parts[2]?.split('.')[1], 10) || 0;

        return {
            version: versionStr,
            versionNum: major * 10000 + minor * 100,
            major,
            minor,
            dbType: 'oracle',
        };
    }

    async executeQuery(sql) {
        const startTime = Date.now();
        const result = await this.query(sql);
        const duration = Date.now() - startTime;

        const fields = result.rows.length > 0 ? Object.keys(result.rows[0]).map(name => ({ name, type: typeof result.rows[0][name] })) : [];

        return {
            rows: result.rows,
            fields,
            rowCount: result.rows.length,
            duration,
        };
    }

    async getKeyMetrics() {
        const metrics = [];

        try {
            const statResult = await this.query(`
                SELECT
                    round((1 - (sum(decode(name, 'physical reads', value, 0)) /
                        (sum(decode(name, 'db block gets', value, 0)) + sum(decode(name, 'consistent gets', value, 0))))) * 100, 2) AS hit_ratio
                FROM v$sysstat
            `);

            const hitRatio = this.toNumber(statResult.rows[0]?.hit_ratio, 0);
            metrics.push({
                id: 'sga_hit_ratio',
                label: 'SGA Cache Hit Ratio',
                value: hitRatio,
                unit: '%',
                category: 'performance',
                severity: hitRatio >= 99 ? 'ok' : hitRatio >= 90 ? 'warning' : 'critical',
                thresholds: { warning: 90, critical: 80 },
                description: 'System Global Area cache hit ratio',
                dbSpecific: true,
            });

            // Active connections
            const connResult = await this.query(`
                SELECT count(*) AS active_conn FROM v$session WHERE type != 'BACKGROUND'
            `);
            const activeConn = this.toNumber(connResult.rows[0]?.active_conn, 0);
            metrics.push({
                id: 'active_connections',
                label: 'Active Connections',
                value: activeConn,
                unit: 'count',
                category: 'connections',
                severity: activeConn > 100 ? 'warning' : activeConn > 200 ? 'critical' : 'ok',
                thresholds: { warning: 100, critical: 200 },
                description: 'Number of active user sessions',
                dbSpecific: false,
            });

            // Redo log switches per hour
            const redoResult = await this.query(`
                SELECT count(*) AS switches FROM v$log_history WHERE first_time > sysdate - 1/24
            `);
            const redoSwitches = this.toNumber(redoResult.rows[0]?.switches, 0);
            metrics.push({
                id: 'redo_log_switches',
                label: 'Redo Log Switches/Hour',
                value: redoSwitches,
                unit: 'count',
                category: 'performance',
                severity: redoSwitches > 10 ? 'warning' : redoSwitches > 50 ? 'critical' : 'ok',
                thresholds: { warning: 10, critical: 50 },
                description: 'Number of redo log switches in the last hour',
                dbSpecific: true,
            });
        } catch (error) {
            console.error('Error getting Oracle metrics:', error.message);
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

export default OracleAdapter;
