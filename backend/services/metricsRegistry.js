// ═════════════════════════════════════════════════════════════════════════════
// METRICS REGISTRY SERVICE — Dynamic metrics definitions by database type
// ═════════════════════════════════════════════════════════════════════════════

const METRIC_DEFINITIONS = {
    postgresql: [
        {
            id: 'cache_hit_ratio',
            label: 'Cache Hit Ratio',
            unit: '%',
            category: 'performance',
            query: `SELECT ROUND(100.0 * sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit + heap_blks_read), 0), 2) FROM pg_statio_user_tables`,
            thresholds: { warning: 90, critical: 80 },
            description: 'Percentage of heap blocks served from cache vs disk',
        },
        {
            id: 'active_connections',
            label: 'Active Connections',
            unit: 'count',
            category: 'connections',
            query: `SELECT count(*) FROM pg_stat_activity WHERE state = 'active'`,
            thresholds: { warning: 80, critical: 95 },
            description: 'Number of actively executing connections',
        },
        {
            id: 'transactions_per_sec',
            label: 'TPS',
            unit: 'tx/s',
            category: 'performance',
            query: `SELECT ROUND((sum(xact_commit) + sum(xact_rollback)) / EXTRACT(EPOCH FROM (now() - stats_reset)), 2) FROM pg_stat_database WHERE datname = current_database()`,
            thresholds: { warning: 500, critical: 1000 },
            description: 'Transactions committed and rolled back per second',
        },
        {
            id: 'deadlock_count',
            label: 'Deadlocks',
            unit: 'count',
            category: 'health',
            query: `SELECT sum(deadlocks) FROM pg_stat_database WHERE datname = current_database()`,
            thresholds: { warning: 1, critical: 5 },
            description: 'Total number of deadlocks detected',
        },
        {
            id: 'replication_lag',
            label: 'Replication Lag',
            unit: 'bytes',
            category: 'replication',
            query: `SELECT COALESCE(MAX(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)), 0) FROM pg_replication_slots`,
            thresholds: { warning: 52428800, critical: 104857600 },
            description: 'WAL bytes behind on replica (50MB warning, 100MB critical)',
        },
        {
            id: 'dead_tuples_ratio',
            label: 'Dead Tuple Ratio',
            unit: '%',
            category: 'maintenance',
            query: `SELECT ROUND(100.0 * sum(n_dead_tup) / NULLIF(sum(n_live_tup + n_dead_tup), 0), 2) FROM pg_stat_user_tables`,
            thresholds: { warning: 10, critical: 20 },
            description: 'Percentage of dead tuples across all tables',
        },
        {
            id: 'db_size',
            label: 'Database Size',
            unit: 'bytes',
            category: 'storage',
            query: `SELECT pg_database_size(current_database())`,
            thresholds: { warning: 10737418240, critical: 21474836480 },
            description: 'Total size of the current database (10GB warning, 20GB critical)',
        },
        {
            id: 'index_hit_ratio',
            label: 'Index Hit Ratio',
            unit: '%',
            category: 'performance',
            query: `SELECT ROUND(100.0 * sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0), 2) FROM pg_statio_user_indexes`,
            thresholds: { warning: 95, critical: 85 },
            description: 'Percentage of index blocks served from cache',
        },
        {
            id: 'longest_transaction',
            label: 'Longest Transaction',
            unit: 'seconds',
            category: 'health',
            query: `SELECT EXTRACT(EPOCH FROM max(NOW() - xact_start)) FROM pg_stat_activity WHERE xact_start IS NOT NULL`,
            thresholds: { warning: 300, critical: 900 },
            description: 'Duration of longest running transaction (5min warning, 15min critical)',
        },
        {
            id: 'wal_generation_rate',
            label: 'WAL Generation',
            unit: 'bytes/s',
            category: 'replication',
            query: `SELECT ROUND(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0') / EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())), 2)`,
            thresholds: { warning: 10485760, critical: 20971520 },
            description: 'WAL generation rate (10MB/s warning, 20MB/s critical)',
        },
        {
            id: 'temp_files_size',
            label: 'Temp Files',
            unit: 'bytes',
            category: 'performance',
            query: `SELECT COALESCE(sum(temp_files), 0) FROM pg_stat_statements WHERE temp_files > 0`,
            thresholds: { warning: 1073741824, critical: 5368709120 },
            description: 'Total size of temporary files created (1GB warning, 5GB critical)',
        },
        {
            id: 'vacuum_running',
            label: 'Active Vacuums',
            unit: 'count',
            category: 'maintenance',
            query: `SELECT count(*) FROM pg_stat_activity WHERE query ILIKE '%VACUUM%'`,
            thresholds: { warning: 2, critical: 4 },
            description: 'Number of active VACUUM operations',
        },
    ],
    mysql: [
        {
            id: 'innodb_buffer_hit_ratio',
            label: 'InnoDB Buffer Hit Ratio',
            unit: '%',
            category: 'performance',
            query: `SELECT ROUND(100 * (1 - (VARIABLE_VALUE / (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests'))), 2) FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads'`,
            thresholds: { warning: 95, critical: 85 },
            description: 'Percentage of InnoDB buffer pool reads from cache',
        },
        {
            id: 'threads_connected',
            label: 'Threads Connected',
            unit: 'count',
            category: 'connections',
            query: `SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Threads_connected'`,
            thresholds: { warning: 80, critical: 95 },
            description: 'Number of open connections',
        },
        {
            id: 'slow_queries',
            label: 'Slow Queries',
            unit: 'count',
            category: 'performance',
            query: `SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Slow_queries'`,
            thresholds: { warning: 5, critical: 20 },
            description: 'Number of queries exceeding long_query_time',
        },
        {
            id: 'innodb_row_lock_waits',
            label: 'Row Lock Waits',
            unit: 'count',
            category: 'health',
            query: `SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_row_lock_waits'`,
            thresholds: { warning: 10, critical: 50 },
            description: 'Number of InnoDB row lock waits',
        },
        {
            id: 'questions_per_sec',
            label: 'Queries/sec',
            unit: 'q/s',
            category: 'performance',
            query: `SELECT ROUND(VARIABLE_VALUE / (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Uptime'), 2) FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Questions'`,
            thresholds: { warning: 500, critical: 1000 },
            description: 'Questions (statements) per second',
        },
        {
            id: 'table_open_cache_misses',
            label: 'Table Open Cache Misses',
            unit: 'count',
            category: 'performance',
            query: `SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Table_open_cache_misses'`,
            thresholds: { warning: 100, critical: 500 },
            description: 'Number of table open cache misses',
        },
        {
            id: 'replication_lag_seconds',
            label: 'Replication Lag',
            unit: 'seconds',
            category: 'replication',
            query: `SHOW SLAVE STATUS`,
            thresholds: { warning: 5, critical: 30 },
            description: 'Seconds behind master in replication',
        },
        {
            id: 'tmp_disk_tables',
            label: 'Temp Disk Tables',
            unit: 'count',
            category: 'performance',
            query: `SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Created_tmp_disk_tables'`,
            thresholds: { warning: 100, critical: 500 },
            description: 'Number of temporary tables created on disk',
        },
    ],
    mssql: [
        {
            id: 'page_life_expectancy',
            label: 'Page Life Expectancy',
            unit: 'seconds',
            category: 'performance',
            query: `SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'Page life expectancy'`,
            thresholds: { warning: 300, critical: 100 },
            description: 'Average lifetime in cache of buffer pages (higher is better)',
        },
        {
            id: 'buffer_cache_hit_ratio',
            label: 'Buffer Cache Hit Ratio',
            unit: '%',
            category: 'performance',
            query: `SELECT ROUND(100.0 * a.cntr_value / b.cntr_value, 2) FROM sys.dm_os_performance_counters a JOIN sys.dm_os_performance_counters b ON a.counter_name = 'Buffer cache hit ratio' AND b.counter_name = 'Buffer cache hit ratio base'`,
            thresholds: { warning: 95, critical: 85 },
            description: 'Percentage of page requests satisfied from buffer cache',
        },
        {
            id: 'batch_requests_per_sec',
            label: 'Batch Requests/sec',
            unit: 'req/s',
            category: 'performance',
            query: `SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'Batch Requests/sec'`,
            thresholds: { warning: 500, critical: 1000 },
            description: 'Batch requests received per second',
        },
        {
            id: 'sql_compilations',
            label: 'SQL Compilations/sec',
            unit: 'comp/s',
            category: 'performance',
            query: `SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'SQL Compilations/sec'`,
            thresholds: { warning: 50, critical: 100 },
            description: 'Number of SQL compilations per second',
        },
        {
            id: 'lock_waits',
            label: 'Lock Waits/sec',
            unit: 'waits/s',
            category: 'health',
            query: `SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'Lock Waits/sec'`,
            thresholds: { warning: 5, critical: 20 },
            description: 'Number of lock requests that resulted in a wait',
        },
        {
            id: 'deadlocks',
            label: 'Deadlocks/sec',
            unit: 'dls/s',
            category: 'health',
            query: `SELECT cntr_value FROM sys.dm_os_performance_counters WHERE counter_name = 'Number of Deadlocks/sec'`,
            thresholds: { warning: 1, critical: 5 },
            description: 'Number of lock requests that resulted in a deadlock per second',
        },
    ],
    oracle: [
        {
            id: 'sga_hit_ratio',
            label: 'SGA Hit Ratio',
            unit: '%',
            category: 'performance',
            query: `SELECT ROUND(100 * (1 - (phys_reads / (db_block_gets + consistent_gets))), 2) FROM v$sysstat WHERE name IN ('physical reads', 'db block gets', 'consistent gets')`,
            thresholds: { warning: 90, critical: 80 },
            description: 'System Global Area cache hit ratio',
        },
        {
            id: 'pga_usage',
            label: 'PGA Usage',
            unit: 'bytes',
            category: 'performance',
            query: `SELECT sum(pga_used_mem) FROM v$process`,
            thresholds: { warning: 1073741824, critical: 2147483648 },
            description: 'Total Program Global Area memory in use (1GB warning, 2GB critical)',
        },
        {
            id: 'redo_log_switches',
            label: 'Redo Log Switches/hr',
            unit: 'switches/hr',
            category: 'replication',
            query: `SELECT count(*) FROM v$log_history WHERE time > sysdate - 1/24`,
            thresholds: { warning: 4, critical: 8 },
            description: 'Number of redo log switches per hour',
        },
        {
            id: 'active_sessions',
            label: 'Active Sessions',
            unit: 'count',
            category: 'connections',
            query: `SELECT count(*) FROM v$session WHERE type != 'BACKGROUND' AND status = 'ACTIVE'`,
            thresholds: { warning: 50, critical: 100 },
            description: 'Number of active user sessions',
        },
        {
            id: 'parse_ratio',
            label: 'Parse Ratio',
            unit: '%',
            category: 'performance',
            query: `SELECT ROUND(100 * parse_count_hard / parse_count_total, 2) FROM v$sysstat WHERE name IN ('parse count (hard)', 'parse count (total)')`,
            thresholds: { warning: 5, critical: 10 },
            description: 'Percentage of hard parses (lower is better)',
        },
    ],
    mongodb: [
        {
            id: 'ops_per_sec',
            label: 'Operations/sec',
            unit: 'ops/s',
            category: 'performance',
            query: `db.serverStatus().opcounters`,
            thresholds: { warning: 500, critical: 1000 },
            description: 'Database operations per second',
        },
        {
            id: 'connections_current',
            label: 'Current Connections',
            unit: 'count',
            category: 'connections',
            query: `db.serverStatus().connections.current`,
            thresholds: { warning: 80, critical: 95 },
            description: 'Number of current connections',
        },
        {
            id: 'cache_usage',
            label: 'WiredTiger Cache Usage',
            unit: '%',
            category: 'performance',
            query: `db.serverStatus().wiredTiger.cache`,
            thresholds: { warning: 80, critical: 95 },
            description: 'WiredTiger cache bytes currently in use',
        },
        {
            id: 'repl_lag',
            label: 'Replication Lag',
            unit: 'seconds',
            category: 'replication',
            query: `rs.status().members.optimeDate`,
            thresholds: { warning: 5, critical: 30 },
            description: 'Replication lag in seconds',
        },
        {
            id: 'page_faults',
            label: 'Page Faults/sec',
            unit: 'faults/s',
            category: 'performance',
            query: `db.serverStatus().extra_info.page_faults`,
            thresholds: { warning: 100, critical: 500 },
            description: 'Number of page faults per second',
        },
    ],
};

/**
 * Get metric definitions for a specific database type
 */
export function getMetricsForDbType(dbType) {
    return METRIC_DEFINITIONS[dbType] || [];
}

/**
 * Get all unique categories across all database types
 */
export function getAllCategories() {
    const categories = new Set();
    Object.values(METRIC_DEFINITIONS).forEach(metrics => {
        metrics.forEach(m => categories.add(m.category));
    });
    return Array.from(categories).sort();
}

/**
 * Get metrics that are common to all database types
 */
export function getUniversalMetrics() {
    return {
        connections: 'active_connections',
        storage: 'db_size',
        performance: 'cache_hit_ratio',
    };
}

/**
 * Evaluate metric health based on thresholds
 * Returns: { status: 'ok'|'warning'|'critical', value, threshold }
 */
export function evaluateMetricHealth(metricId, value, dbType) {
    const metrics = getMetricsForDbType(dbType);
    const metric = metrics.find(m => m.id === metricId);

    if (!metric) {
        return { status: 'unknown', value, threshold: null };
    }

    const { thresholds } = metric;

    // For most metrics, lower is better (except hit ratios and percentages)
    const isInverted = metric.id.includes('ratio') || metric.id.includes('hit') || metric.id === 'cache_usage';

    if (isInverted) {
        // Higher is better
        if (value <= thresholds.critical) {
            return { status: 'critical', value, threshold: thresholds.critical };
        }
        if (value <= thresholds.warning) {
            return { status: 'warning', value, threshold: thresholds.warning };
        }
        return { status: 'ok', value, threshold: null };
    } else {
        // Lower is better
        if (value >= thresholds.critical) {
            return { status: 'critical', value, threshold: thresholds.critical };
        }
        if (value >= thresholds.warning) {
            return { status: 'warning', value, threshold: thresholds.warning };
        }
        return { status: 'ok', value, threshold: null };
    }
}

/**
 * Get metric by ID and database type
 */
export function getMetricById(metricId, dbType) {
    const metrics = getMetricsForDbType(dbType);
    return metrics.find(m => m.id === metricId);
}

/**
 * Get metrics by category
 */
export function getMetricsByCategory(category, dbType) {
    const metrics = getMetricsForDbType(dbType);
    return metrics.filter(m => m.category === category);
}
