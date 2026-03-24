import { useState, useMemo } from 'react';
import {
  Database, Server, HardDrive, Cpu, Cloud,
  ChevronDown, ChevronRight, Activity, AlertTriangle,
  CheckCircle, XCircle, Search
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────── */
/* METRIC DEFINITIONS - All metrics from all 5 database types */
/* ─────────────────────────────────────────────────────────────────────────── */
const METRIC_DEFINITIONS = {
  postgresql: [
    { id: 'cache_hit_ratio', label: 'Cache Hit Ratio', unit: '%', category: 'performance', thresholds: { warning: 90, critical: 80 }, description: 'Percentage of heap blocks served from cache vs disk' },
    { id: 'active_connections', label: 'Active Connections', unit: 'count', category: 'connections', thresholds: { warning: 80, critical: 95 }, description: 'Number of actively executing connections' },
    { id: 'transactions_per_sec', label: 'TPS', unit: 'tx/s', category: 'performance', thresholds: { warning: 500, critical: 1000 }, description: 'Transactions committed and rolled back per second' },
    { id: 'deadlock_count', label: 'Deadlocks', unit: 'count', category: 'health', thresholds: { warning: 1, critical: 5 }, description: 'Total number of deadlocks detected' },
    { id: 'replication_lag', label: 'Replication Lag', unit: 'bytes', category: 'replication', thresholds: { warning: 52428800, critical: 104857600 }, description: 'WAL bytes behind on replica (50MB warning, 100MB critical)' },
    { id: 'dead_tuples_ratio', label: 'Dead Tuple Ratio', unit: '%', category: 'maintenance', thresholds: { warning: 10, critical: 20 }, description: 'Percentage of dead tuples across all tables' },
    { id: 'db_size', label: 'Database Size', unit: 'bytes', category: 'storage', thresholds: { warning: 10737418240, critical: 21474836480 }, description: 'Total size of the current database (10GB warning, 20GB critical)' },
    { id: 'index_hit_ratio', label: 'Index Hit Ratio', unit: '%', category: 'performance', thresholds: { warning: 95, critical: 85 }, description: 'Percentage of index blocks served from cache' },
    { id: 'longest_transaction', label: 'Longest Transaction', unit: 'seconds', category: 'health', thresholds: { warning: 300, critical: 900 }, description: 'Duration of longest running transaction (5min warning, 15min critical)' },
    { id: 'wal_generation_rate', label: 'WAL Generation', unit: 'bytes/s', category: 'replication', thresholds: { warning: 10485760, critical: 20971520 }, description: 'WAL generation rate (10MB/s warning, 20MB/s critical)' },
    { id: 'temp_files_size', label: 'Temp Files', unit: 'bytes', category: 'performance', thresholds: { warning: 1073741824, critical: 5368709120 }, description: 'Total size of temporary files created (1GB warning, 5GB critical)' },
    { id: 'vacuum_running', label: 'Active Vacuums', unit: 'count', category: 'maintenance', thresholds: { warning: 2, critical: 4 }, description: 'Number of active VACUUM operations' },
  ],
  mysql: [
    { id: 'innodb_buffer_hit_ratio', label: 'InnoDB Buffer Hit Ratio', unit: '%', category: 'performance', thresholds: { warning: 95, critical: 85 }, description: 'Percentage of InnoDB buffer pool reads from cache' },
    { id: 'innodb_buffer_pool_utilization', label: 'InnoDB Buffer Pool Utilization', unit: '%', category: 'performance', thresholds: { warning: 85, critical: 95 }, description: 'Percentage of InnoDB buffer pool currently in use' },
    { id: 'innodb_log_waits', label: 'InnoDB Log Waits', unit: 'count', category: 'health', thresholds: { warning: 5, critical: 20 }, description: 'Number of waits due to InnoDB log buffer being full' },
    { id: 'innodb_deadlocks', label: 'InnoDB Deadlocks', unit: 'count', category: 'health', thresholds: { warning: 1, critical: 5 }, description: 'Total number of InnoDB deadlocks detected' },
    { id: 'innodb_data_reads', label: 'InnoDB Data Reads/sec', unit: 'reads/s', category: 'performance', thresholds: { warning: 500, critical: 1000 }, description: 'InnoDB physical data reads per second' },
    { id: 'innodb_data_writes', label: 'InnoDB Data Writes/sec', unit: 'writes/s', category: 'performance', thresholds: { warning: 500, critical: 1000 }, description: 'InnoDB physical data writes per second' },
    { id: 'threads_running', label: 'Threads Running', unit: 'count', category: 'connections', thresholds: { warning: 50, critical: 100 }, description: 'Number of threads currently executing queries' },
    { id: 'threads_cached', label: 'Threads Cached', unit: 'count', category: 'connections', thresholds: { warning: 0, critical: 0 }, description: 'Number of cached threads ready to handle new connections' },
    { id: 'threads_connected', label: 'Threads Connected', unit: 'count', category: 'connections', thresholds: { warning: 80, critical: 95 }, description: 'Number of open connections' },
    { id: 'max_used_connections', label: 'Max Used Connections', unit: 'count', category: 'connections', thresholds: { warning: 100, critical: 150 }, description: 'Maximum number of connections used at any time' },
    { id: 'aborted_connections', label: 'Aborted Connections', unit: 'count', category: 'health', thresholds: { warning: 5, critical: 20 }, description: 'Number of connections aborted due to client not closing properly' },
    { id: 'aborted_clients', label: 'Aborted Clients', unit: 'count', category: 'health', thresholds: { warning: 5, critical: 20 }, description: 'Number of connections aborted due to client dead or timeout' },
    { id: 'com_select', label: 'SELECT Statements/sec', unit: 'stmts/s', category: 'performance', thresholds: { warning: 500, critical: 1000 }, description: 'SELECT statements executed per second' },
    { id: 'com_insert', label: 'INSERT Statements/sec', unit: 'stmts/s', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'INSERT statements executed per second' },
    { id: 'com_update', label: 'UPDATE Statements/sec', unit: 'stmts/s', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'UPDATE statements executed per second' },
    { id: 'com_delete', label: 'DELETE Statements/sec', unit: 'stmts/s', category: 'performance', thresholds: { warning: 50, critical: 200 }, description: 'DELETE statements executed per second' },
    { id: 'bytes_sent', label: 'Bytes Sent/sec', unit: 'bytes/s', category: 'performance', thresholds: { warning: 10485760, critical: 52428800 }, description: 'Bytes sent to all clients per second' },
    { id: 'bytes_received', label: 'Bytes Received/sec', unit: 'bytes/s', category: 'performance', thresholds: { warning: 10485760, critical: 52428800 }, description: 'Bytes received from all clients per second' },
    { id: 'innodb_row_lock_time_avg', label: 'InnoDB Avg Row Lock Wait Time', unit: 'ms', category: 'health', thresholds: { warning: 10, critical: 50 }, description: 'Average time in milliseconds for InnoDB row lock waits' },
    { id: 'innodb_rows_read_per_sec', label: 'InnoDB Rows Read/sec', unit: 'rows/s', category: 'performance', thresholds: { warning: 1000, critical: 5000 }, description: 'InnoDB rows read per second' },
    { id: 'innodb_rows_inserted_per_sec', label: 'InnoDB Rows Inserted/sec', unit: 'rows/s', category: 'performance', thresholds: { warning: 500, critical: 2000 }, description: 'InnoDB rows inserted per second' },
    { id: 'binary_log_space', label: 'Binary Log Space', unit: 'bytes', category: 'replication', thresholds: { warning: 1073741824, critical: 5368709120 }, description: 'Cumulative space used by binary logs (1GB warning, 5GB critical)' },
    { id: 'binlog_cache_disk_use', label: 'Binlog Cache Disk Use', unit: 'count', category: 'replication', thresholds: { warning: 10, critical: 50 }, description: 'Number of transactions using disk cache for binary log' },
    { id: 'open_files', label: 'Open Files', unit: 'count', category: 'storage', thresholds: { warning: 1000, critical: 2000 }, description: 'Number of currently open files' },
    { id: 'open_tables', label: 'Open Tables', unit: 'count', category: 'storage', thresholds: { warning: 500, critical: 1000 }, description: 'Number of currently open tables' },
    { id: 'table_locks_waited', label: 'Table Locks Waited', unit: 'count', category: 'health', thresholds: { warning: 10, critical: 50 }, description: 'Number of table lock requests that required waits' },
    { id: 'handler_read_rnd_next', label: 'Full Table Scans/sec', unit: 'scans/s', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Number of full table scans per second (indicator of inefficient queries)' },
    { id: 'key_buffer_hit_ratio', label: 'Key Buffer Hit Ratio', unit: '%', category: 'performance', thresholds: { warning: 95, critical: 85 }, description: 'MyISAM key buffer hit ratio (higher is better)' },
    { id: 'sort_merge_passes', label: 'Sort Merge Passes', unit: 'count', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Number of merge passes required by the sort algorithm' },
    { id: 'select_full_join', label: 'Full Joins Without Index', unit: 'count', category: 'performance', thresholds: { warning: 5, critical: 20 }, description: 'Number of full joins performed without using indexes' },
    { id: 'slow_queries', label: 'Slow Queries', unit: 'count', category: 'performance', thresholds: { warning: 5, critical: 20 }, description: 'Number of queries exceeding long_query_time' },
    { id: 'innodb_row_lock_waits', label: 'Row Lock Waits', unit: 'count', category: 'health', thresholds: { warning: 10, critical: 50 }, description: 'Number of InnoDB row lock waits' },
    { id: 'questions_per_sec', label: 'Queries/sec', unit: 'q/s', category: 'performance', thresholds: { warning: 500, critical: 1000 }, description: 'Questions (statements) per second' },
    { id: 'table_open_cache_misses', label: 'Table Open Cache Misses', unit: 'count', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Number of table open cache misses' },
    { id: 'replication_lag_seconds', label: 'Replication Lag', unit: 'seconds', category: 'replication', thresholds: { warning: 5, critical: 30 }, description: 'Seconds behind master in replication' },
    { id: 'tmp_disk_tables', label: 'Temp Disk Tables', unit: 'count', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Number of temporary tables created on disk' },
  ],
  mssql: [
    { id: 'page_life_expectancy', label: 'Page Life Expectancy', unit: 'seconds', category: 'performance', thresholds: { warning: 300, critical: 100 }, description: 'Average lifetime in cache of buffer pages (higher is better)' },
    { id: 'buffer_cache_hit_ratio', label: 'Buffer Cache Hit Ratio', unit: '%', category: 'performance', thresholds: { warning: 95, critical: 85 }, description: 'Percentage of page requests satisfied from buffer cache' },
    { id: 'user_connections', label: 'User Connections', unit: 'count', category: 'connections', thresholds: { warning: 100, critical: 200 }, description: 'Number of user connections to SQL Server' },
    { id: 'active_transactions', label: 'Active Transactions', unit: 'count', category: 'health', thresholds: { warning: 10, critical: 50 }, description: 'Number of currently active transactions' },
    { id: 'processes_blocked', label: 'Blocked Processes', unit: 'count', category: 'health', thresholds: { warning: 1, critical: 5 }, description: 'Number of processes currently blocked' },
    { id: 'memory_grants_pending', label: 'Memory Grants Pending', unit: 'count', category: 'performance', thresholds: { warning: 5, critical: 20 }, description: 'Number of processes waiting for memory grant' },
    { id: 'memory_grants_outstanding', label: 'Memory Grants Outstanding', unit: 'count', category: 'performance', thresholds: { warning: 50, critical: 200 }, description: 'Total number of memory grants currently outstanding' },
    { id: 'total_server_memory_kb', label: 'Total Server Memory', unit: 'bytes', category: 'performance', thresholds: { warning: 1099511627776, critical: 2199023255552 }, description: 'Total memory used by SQL Server (1TB warning, 2TB critical)' },
    { id: 'target_server_memory_kb', label: 'Target Server Memory', unit: 'bytes', category: 'performance', thresholds: { warning: 1099511627776, critical: 2199023255552 }, description: 'Target memory for SQL Server buffer pool' },
    { id: 'lazy_writes_per_sec', label: 'Lazy Writes/sec', unit: 'writes/s', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Number of lazy writer threads writing pages to disk per second' },
    { id: 'checkpoint_pages_per_sec', label: 'Checkpoint Pages/sec', unit: 'pages/s', category: 'performance', thresholds: { warning: 500, critical: 2000 }, description: 'Pages written to disk by checkpoint process per second' },
    { id: 'free_list_stalls_per_sec', label: 'Free List Stalls/sec', unit: 'stalls/s', category: 'performance', thresholds: { warning: 2, critical: 10 }, description: 'Number of free page requests that had to wait per second' },
    { id: 'full_scans_per_sec', label: 'Full Scans/sec', unit: 'scans/s', category: 'performance', thresholds: { warning: 50, critical: 200 }, description: 'Number of full table scans per second' },
    { id: 'index_searches_per_sec', label: 'Index Searches/sec', unit: 'searches/s', category: 'performance', thresholds: { warning: 500, critical: 2000 }, description: 'Number of index searches per second' },
    { id: 'forwarded_records_per_sec', label: 'Forwarded Records/sec', unit: 'recs/s', category: 'performance', thresholds: { warning: 10, critical: 50 }, description: 'Records per second that were forwarded from heap' },
    { id: 'log_flushes_per_sec', label: 'Log Flushes/sec', unit: 'flushes/s', category: 'replication', thresholds: { warning: 500, critical: 1000 }, description: 'Number of log file flushes per second' },
    { id: 'log_flush_wait_time', label: 'Log Flush Wait Time', unit: 'ms', category: 'replication', thresholds: { warning: 10, critical: 50 }, description: 'Average wait time for log flushes in milliseconds' },
    { id: 'plan_cache_hit_ratio', label: 'Plan Cache Hit Ratio', unit: '%', category: 'performance', thresholds: { warning: 80, critical: 70 }, description: 'Percentage of cached query plans being reused' },
    { id: 'sql_recompilations_per_sec', label: 'SQL Recompilations/sec', unit: 'recomps/s', category: 'performance', thresholds: { warning: 10, critical: 50 }, description: 'Number of query recompilations per second' },
    { id: 'disk_read_latency_ms', label: 'Disk Read Latency', unit: 'ms', category: 'storage', thresholds: { warning: 10, critical: 50 }, description: 'Average disk read latency in milliseconds' },
    { id: 'disk_write_latency_ms', label: 'Disk Write Latency', unit: 'ms', category: 'storage', thresholds: { warning: 10, critical: 50 }, description: 'Average disk write latency in milliseconds' },
    { id: 'tempdb_size_mb', label: 'TempDB Size', unit: 'bytes', category: 'storage', thresholds: { warning: 1073741824, critical: 5368709120 }, description: 'Current size of tempdb database (1GB warning, 5GB critical)' },
    { id: 'tempdb_version_store_size', label: 'TempDB Version Store Size', unit: 'bytes', category: 'storage', thresholds: { warning: 536870912, critical: 1073741824 }, description: 'TempDB version store size (500MB warning, 1GB critical)' },
    { id: 'availability_group_sync_health', label: 'Availability Group Sync Health', unit: 'count', category: 'replication', thresholds: { warning: 1, critical: 2 }, description: 'Number of unhealthy replicas in availability groups' },
    { id: 'log_send_queue_size', label: 'Log Send Queue Size', unit: 'bytes', category: 'replication', thresholds: { warning: 52428800, critical: 104857600 }, description: 'Size of unsent log in primary replica (50MB warning, 100MB critical)' },
    { id: 'worker_threads_in_use', label: 'Worker Threads In Use', unit: 'count', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Number of worker threads currently executing work' },
    { id: 'runnable_tasks_count', label: 'Runnable Tasks', unit: 'count', category: 'performance', thresholds: { warning: 10, critical: 50 }, description: 'Number of tasks waiting to be scheduled' },
    { id: 'average_wait_time_ms', label: 'Average Wait Time', unit: 'ms', category: 'performance', thresholds: { warning: 10, critical: 100 }, description: 'Average wait time in milliseconds across all wait types' },
    { id: 'batch_requests_per_sec', label: 'Batch Requests/sec', unit: 'req/s', category: 'performance', thresholds: { warning: 500, critical: 1000 }, description: 'Batch requests received per second' },
    { id: 'sql_compilations', label: 'SQL Compilations/sec', unit: 'comp/s', category: 'performance', thresholds: { warning: 50, critical: 100 }, description: 'Number of SQL compilations per second' },
    { id: 'lock_waits', label: 'Lock Waits/sec', unit: 'waits/s', category: 'health', thresholds: { warning: 5, critical: 20 }, description: 'Number of lock requests that resulted in a wait' },
    { id: 'deadlocks', label: 'Deadlocks/sec', unit: 'dls/s', category: 'health', thresholds: { warning: 1, critical: 5 }, description: 'Number of lock requests that resulted in a deadlock per second' },
  ],
  oracle: [
    { id: 'sga_hit_ratio', label: 'SGA Hit Ratio', unit: '%', category: 'performance', thresholds: { warning: 90, critical: 80 }, description: 'System Global Area cache hit ratio' },
    { id: 'db_block_gets_per_sec', label: 'DB Block Gets/sec', unit: 'gets/s', category: 'performance', thresholds: { warning: 1000, critical: 5000 }, description: 'Database block gets from buffer cache per second' },
    { id: 'consistent_gets_per_sec', label: 'Consistent Gets/sec', unit: 'gets/s', category: 'performance', thresholds: { warning: 1000, critical: 5000 }, description: 'Consistent reads from buffer cache per second' },
    { id: 'physical_reads_per_sec', label: 'Physical Reads/sec', unit: 'reads/s', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Physical reads from disk per second' },
    { id: 'physical_writes_per_sec', label: 'Physical Writes/sec', unit: 'writes/s', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Physical writes to disk per second' },
    { id: 'user_commits_per_sec', label: 'User Commits/sec', unit: 'commits/s', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'User commit operations per second' },
    { id: 'user_rollbacks_per_sec', label: 'User Rollbacks/sec', unit: 'rollbacks/s', category: 'performance', thresholds: { warning: 10, critical: 50 }, description: 'User rollback operations per second' },
    { id: 'enqueue_waits', label: 'Enqueue Waits', unit: 'count', category: 'health', thresholds: { warning: 100, critical: 500 }, description: 'Total number of enqueue (lock) waits' },
    { id: 'enqueue_timeouts', label: 'Enqueue Timeouts', unit: 'count', category: 'health', thresholds: { warning: 10, critical: 50 }, description: 'Total number of enqueue timeouts' },
    { id: 'enqueue_deadlocks', label: 'Enqueue Deadlocks', unit: 'count', category: 'health', thresholds: { warning: 1, critical: 5 }, description: 'Total number of enqueue deadlocks' },
    { id: 'sorts_disk', label: 'Disk Sorts', unit: 'count', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Number of sorts performed on disk' },
    { id: 'sorts_memory', label: 'Memory Sorts', unit: 'count', category: 'performance', thresholds: { warning: 0, critical: 0 }, description: 'Number of sorts performed in memory' },
    { id: 'sort_ratio', label: 'Disk Sort Ratio', unit: '%', category: 'performance', thresholds: { warning: 5, critical: 10 }, description: 'Percentage of sorts requiring disk I/O (lower is better)' },
    { id: 'tablespace_usage_percent', label: 'Tablespace Usage', unit: '%', category: 'storage', thresholds: { warning: 80, critical: 95 }, description: 'Percentage of total tablespace in use' },
    { id: 'undo_tablespace_usage', label: 'Undo Tablespace Usage', unit: '%', category: 'storage', thresholds: { warning: 70, critical: 90 }, description: 'Percentage of undo tablespace in use' },
    { id: 'library_cache_hit_ratio', label: 'Library Cache Hit Ratio', unit: '%', category: 'performance', thresholds: { warning: 98, critical: 95 }, description: 'Library cache hit ratio (higher is better)' },
    { id: 'dictionary_cache_hit_ratio', label: 'Dictionary Cache Hit Ratio', unit: '%', category: 'performance', thresholds: { warning: 98, critical: 95 }, description: 'Row cache (dictionary cache) hit ratio' },
    { id: 'shared_pool_free_pct', label: 'Shared Pool Free %', unit: '%', category: 'performance', thresholds: { warning: 10, critical: 5 }, description: 'Free space in shared pool (lower is worse)' },
    { id: 'redo_writes_per_sec', label: 'Redo Writes/sec', unit: 'writes/s', category: 'replication', thresholds: { warning: 100, critical: 500 }, description: 'Redo log writes per second' },
    { id: 'redo_size_per_sec', label: 'Redo Size/sec', unit: 'bytes/s', category: 'replication', thresholds: { warning: 10485760, critical: 52428800 }, description: 'Redo log size generated per second' },
    { id: 'open_cursors_current', label: 'Open Cursors Current', unit: 'count', category: 'connections', thresholds: { warning: 500, critical: 1000 }, description: 'Number of currently open cursors' },
    { id: 'session_cursor_cache_hits', label: 'Session Cursor Cache Hits', unit: '%', category: 'performance', thresholds: { warning: 80, critical: 60 }, description: 'Session cursor cache hit ratio (percentage)' },
    { id: 'db_time_per_sec', label: 'Database Time/sec', unit: 'microseconds/s', category: 'performance', thresholds: { warning: 1000000, critical: 5000000 }, description: 'Database time consumed per second (in microseconds)' },
    { id: 'cpu_time_per_sec', label: 'CPU Time/sec', unit: 'microseconds/s', category: 'performance', thresholds: { warning: 500000, critical: 2000000 }, description: 'CPU time used per second (in microseconds)' },
    { id: 'wait_time_per_sec', label: 'Wait Time/sec', unit: 'microseconds/s', category: 'performance', thresholds: { warning: 100000, critical: 500000 }, description: 'Wait time per second (in microseconds)' },
    { id: 'temp_space_used_bytes', label: 'Temp Space Used', unit: 'bytes', category: 'storage', thresholds: { warning: 1073741824, critical: 5368709120 }, description: 'Current temporary space usage (1GB warning, 5GB critical)' },
    { id: 'flash_recovery_area_usage', label: 'FRA Usage', unit: '%', category: 'storage', thresholds: { warning: 80, critical: 95 }, description: 'Flash Recovery Area usage percentage' },
    { id: 'data_guard_lag_seconds', label: 'DataGuard Lag', unit: 'seconds', category: 'replication', thresholds: { warning: 10, critical: 60 }, description: 'Maximum Data Guard replication lag in seconds' },
    { id: 'archive_log_rate', label: 'Archive Log Rate', unit: 'bytes/s', category: 'replication', thresholds: { warning: 10485760, critical: 52428800 }, description: 'Archive log generation rate per second' },
    { id: 'pga_usage', label: 'PGA Usage', unit: 'bytes', category: 'performance', thresholds: { warning: 1073741824, critical: 2147483648 }, description: 'Total Program Global Area memory in use (1GB warning, 2GB critical)' },
    { id: 'redo_log_switches', label: 'Redo Log Switches/hr', unit: 'switches/hr', category: 'replication', thresholds: { warning: 4, critical: 8 }, description: 'Number of redo log switches per hour' },
    { id: 'active_sessions', label: 'Active Sessions', unit: 'count', category: 'connections', thresholds: { warning: 50, critical: 100 }, description: 'Number of active user sessions' },
    { id: 'parse_ratio', label: 'Parse Ratio', unit: '%', category: 'performance', thresholds: { warning: 5, critical: 10 }, description: 'Percentage of hard parses (lower is better)' },
  ],
  mongodb: [
    { id: 'connections_current', label: 'Current Connections', unit: 'count', category: 'overview', thresholds: { warning: 80, critical: 95 }, description: 'Number of current active connections to MongoDB' },
    { id: 'connections_available', label: 'Available Connections', unit: 'count', category: 'overview', thresholds: { warning: 20, critical: 10 }, description: 'Number of available connections in the connection pool' },
    { id: 'ops_per_sec', label: 'Operations/sec', unit: 'ops/s', category: 'overview', thresholds: { warning: 500, critical: 1000 }, description: 'Total database operations per second' },
    { id: 'avg_read_latency_ms', label: 'Average Read Latency', unit: 'ms', category: 'overview', thresholds: { warning: 10, critical: 50 }, description: 'Average latency for read operations in milliseconds' },
    { id: 'avg_write_latency_ms', label: 'Average Write Latency', unit: 'ms', category: 'overview', thresholds: { warning: 20, critical: 100 }, description: 'Average latency for write operations in milliseconds' },
    { id: 'replication_lag_sec', label: 'Replication Lag', unit: 'seconds', category: 'overview', thresholds: { warning: 5, critical: 30 }, description: 'Maximum replication lag across all replica set members' },
    { id: 'cpu_usage_percent', label: 'CPU Usage', unit: '%', category: 'overview', thresholds: { warning: 75, critical: 90 }, description: 'Current CPU usage percentage (user + system)' },
    { id: 'memory_usage_percent', label: 'Memory Usage', unit: '%', category: 'overview', thresholds: { warning: 80, critical: 95 }, description: 'Current memory usage percentage' },
    { id: 'wt_cache_usage_percent', label: 'WiredTiger Cache Usage', unit: '%', category: 'overview', thresholds: { warning: 80, critical: 95 }, description: 'Percentage of allocated WiredTiger cache currently in use' },
    { id: 'disk_iops', label: 'Disk IOPS', unit: 'iops', category: 'overview', thresholds: { warning: 10000, critical: 20000 }, description: 'Disk input/output operations per second' },
    { id: 'cache_fill_ratio', label: 'Cache Fill Ratio', unit: '%', category: 'overview', thresholds: { warning: 60, critical: 40 }, description: 'Cache fill ratio showing memory utilization effectiveness' },
    { id: 'uptime_seconds', label: 'Server Uptime', unit: 'seconds', category: 'overview', thresholds: { warning: 0, critical: 0 }, description: 'MongoDB server uptime in seconds' },
    { id: 'current_connections', label: 'Current Connections', unit: 'count', category: 'performance', thresholds: { warning: 80, critical: 95 }, description: 'Total number of currently open connections' },
    { id: 'active_ops', label: 'Active Operations', unit: 'count', category: 'performance', thresholds: { warning: 50, critical: 100 }, description: 'Number of currently active database operations' },
    { id: 'network_bytes_in', label: 'Network Bytes In', unit: 'bytes/s', category: 'performance', thresholds: { warning: 104857600, critical: 209715200 }, description: 'Network bytes received per second (100MB/s warning)' },
    { id: 'network_bytes_out', label: 'Network Bytes Out', unit: 'bytes/s', category: 'performance', thresholds: { warning: 104857600, critical: 209715200 }, description: 'Network bytes transmitted per second' },
    { id: 'total_ops_per_sec', label: 'Total Ops/sec', unit: 'ops/s', category: 'performance', thresholds: { warning: 500, critical: 1000 }, description: 'Total operations per second across all operation types' },
    { id: 'reads_per_sec', label: 'Reads/sec', unit: 'ops/s', category: 'performance', thresholds: { warning: 300, critical: 600 }, description: 'Read operations per second' },
    { id: 'writes_per_sec', label: 'Writes/sec', unit: 'ops/s', category: 'performance', thresholds: { warning: 200, critical: 400 }, description: 'Write operations per second (insert, update, delete)' },
    { id: 'commands_per_sec', label: 'Commands/sec', unit: 'cmds/s', category: 'performance', thresholds: { warning: 100, critical: 300 }, description: 'Administrative commands executed per second' },
    { id: 'latency_p50_ms', label: 'Latency P50', unit: 'ms', category: 'performance', thresholds: { warning: 5, critical: 20 }, description: 'Median read operation latency in milliseconds' },
    { id: 'latency_p95_ms', label: 'Latency P95', unit: 'ms', category: 'performance', thresholds: { warning: 20, critical: 100 }, description: 'P95 read operation latency percentile' },
    { id: 'latency_p99_ms', label: 'Latency P99', unit: 'ms', category: 'performance', thresholds: { warning: 50, critical: 200 }, description: 'P99 read operation latency percentile' },
    { id: 'latency_p999_ms', label: 'Latency P99.9', unit: 'ms', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'P99.9 read operation latency percentile' },
    { id: 'docs_examined', label: 'Documents Examined/sec', unit: 'docs/s', category: 'performance', thresholds: { warning: 100000, critical: 500000 }, description: 'Documents examined per second during queries' },
    { id: 'docs_returned', label: 'Documents Returned/sec', unit: 'docs/s', category: 'performance', thresholds: { warning: 50000, critical: 250000 }, description: 'Documents returned per second to clients' },
    { id: 'scan_ratio', label: 'Collection Scan Ratio', unit: '%', category: 'performance', thresholds: { warning: 50, critical: 80 }, description: 'Percentage of queries performing full collection scans' },
    { id: 'execution_time_ms', label: 'Average Query Execution Time', unit: 'ms', category: 'performance', thresholds: { warning: 10, critical: 50 }, description: 'Average query execution time in milliseconds' },
    { id: 'active_operations', label: 'Active Database Operations', unit: 'count', category: 'performance', thresholds: { warning: 50, critical: 100 }, description: 'Total number of active database operations' },
    { id: 'longest_running_op_sec', label: 'Longest Running Operation', unit: 'seconds', category: 'performance', thresholds: { warning: 300, critical: 900 }, description: 'Duration of longest running operation in seconds' },
    { id: 'read_ops_active', label: 'Active Read Operations', unit: 'count', category: 'performance', thresholds: { warning: 30, critical: 60 }, description: 'Number of currently active read operations' },
    { id: 'write_ops_active', label: 'Active Write Operations', unit: 'count', category: 'performance', thresholds: { warning: 20, critical: 40 }, description: 'Number of currently active write operations' },
    { id: 'slow_queries_count', label: 'Slow Queries (24h)', unit: 'count', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Count of queries exceeding 100ms threshold in last 24 hours' },
    { id: 'avg_slow_query_duration_ms', label: 'Avg Slow Query Duration', unit: 'ms', category: 'performance', thresholds: { warning: 200, critical: 500 }, description: 'Average duration of slow queries' },
    { id: 'collscan_queries', label: 'Collection Scan Queries', unit: 'count', category: 'performance', thresholds: { warning: 50, critical: 200 }, description: 'Number of queries performing collection scans in 24h' },
    { id: 'profiler_level', label: 'Profiler Level', unit: 'level', category: 'performance', thresholds: { warning: 1, critical: 0 }, description: 'Current database profiling level (0=off, 1=slow, 2=all)' },
    { id: 'slow_ms_threshold', label: 'Slow Query Threshold', unit: 'ms', category: 'performance', thresholds: { warning: 0, critical: 0 }, description: 'Profiling slow query threshold in milliseconds' },
    { id: 'profile_entries', label: 'Profile Collection Size', unit: 'count', category: 'performance', thresholds: { warning: 100000, critical: 500000 }, description: 'Number of entries in profiler collection' },
    { id: 'global_read_queue', label: 'Global Read Queue Depth', unit: 'count', category: 'performance', thresholds: { warning: 10, critical: 50 }, description: 'Number of operations queued waiting for read lock' },
    { id: 'global_write_queue', label: 'Global Write Queue Depth', unit: 'count', category: 'performance', thresholds: { warning: 5, critical: 20 }, description: 'Number of operations queued waiting for write lock' },
    { id: 'wt_read_tickets_available', label: 'WiredTiger Read Tickets Available', unit: 'count', category: 'performance', thresholds: { warning: 10, critical: 5 }, description: 'Number of available WiredTiger read tickets' },
    { id: 'wt_write_tickets_available', label: 'WiredTiger Write Tickets Available', unit: 'count', category: 'performance', thresholds: { warning: 5, critical: 2 }, description: 'Number of available WiredTiger write tickets' },
    { id: 'page_faults_per_sec', label: 'Page Faults/sec', unit: 'faults/s', category: 'performance', thresholds: { warning: 100, critical: 500 }, description: 'Page faults per second' },
    { id: 'anomalies_24h', label: 'Anomalies (24h)', unit: 'count', category: 'performance', thresholds: { warning: 10, critical: 50 }, description: 'Detected performance anomalies in last 24 hours' },
    { id: 'total_indexes', label: 'Total Indexes', unit: 'count', category: 'storage', thresholds: { warning: 500, critical: 1000 }, description: 'Total number of indexes across all collections' },
    { id: 'unused_indexes', label: 'Unused Indexes', unit: 'count', category: 'storage', thresholds: { warning: 10, critical: 50 }, description: 'Number of indexes that have never been used' },
    { id: 'collscan_percent', label: 'Collection Scan Percentage', unit: '%', category: 'storage', thresholds: { warning: 50, critical: 80 }, description: 'Percentage of queries without proper indexes' },
    { id: 'est_index_savings_mb', label: 'Est. Index Savings', unit: 'MB', category: 'storage', thresholds: { warning: 100, critical: 500 }, description: 'Estimated storage savings from removing unused indexes' },
    { id: 'total_collections', label: 'Total Collections', unit: 'count', category: 'storage', thresholds: { warning: 1000, critical: 5000 }, description: 'Number of user collections in database' },
    { id: 'total_documents', label: 'Total Documents', unit: 'count', category: 'storage', thresholds: { warning: 100000000, critical: 500000000 }, description: 'Total number of documents across all collections' },
    { id: 'total_data_size_bytes', label: 'Data Size', unit: 'bytes', category: 'storage', thresholds: { warning: 10737418240, critical: 21474836480 }, description: 'Total data size across all collections (10GB warning, 20GB critical)' },
    { id: 'total_index_size_bytes', label: 'Index Size', unit: 'bytes', category: 'storage', thresholds: { warning: 5368709120, critical: 10737418240 }, description: 'Total size of all indexes (5GB warning)' },
    { id: 'wt_cache_size_bytes', label: 'WiredTiger Cache Size', unit: 'bytes', category: 'storage', thresholds: { warning: 0, critical: 0 }, description: 'Configured WiredTiger cache size' },
    { id: 'wt_cache_used_bytes', label: 'WiredTiger Cache Used', unit: 'bytes', category: 'storage', thresholds: { warning: 0, critical: 0 }, description: 'Currently used WiredTiger cache size' },
    { id: 'wt_dirty_pages_percent', label: 'WiredTiger Dirty Pages', unit: '%', category: 'storage', thresholds: { warning: 50, critical: 80 }, description: 'Percentage of WiredTiger cache pages that are dirty' },
    { id: 'wt_cache_hit_ratio', label: 'WiredTiger Cache Hit Ratio', unit: '%', category: 'storage', thresholds: { warning: 80, critical: 60 }, description: 'Cache hit ratio for WiredTiger storage engine' },
    { id: 'last_backup_age_hours', label: 'Last Backup Age', unit: 'hours', category: 'storage', thresholds: { warning: 24, critical: 72 }, description: 'Hours since last successful backup' },
    { id: 'backup_size_bytes', label: 'Last Backup Size', unit: 'bytes', category: 'storage', thresholds: { warning: 0, critical: 0 }, description: 'Size of last backup (estimated from data+index size)' },
    { id: 'storage_growth_per_month_bytes', label: 'Monthly Storage Growth', unit: 'bytes/month', category: 'storage', thresholds: { warning: 1073741824, critical: 5368709120 }, description: 'Average monthly storage growth rate' },
    { id: 'days_until_disk_full', label: 'Days Until Disk Full', unit: 'days', category: 'storage', thresholds: { warning: 30, critical: 7 }, description: 'Estimated days before disk runs out of space (requires system metrics)' },
    { id: 'ops_growth_per_month', label: 'Monthly Ops Growth', unit: '%', category: 'storage', thresholds: { warning: 20, critical: 50 }, description: 'Percentage monthly growth in operation volume' },
    { id: 'repl_lag_sec', label: 'Replication Lag', unit: 'seconds', category: 'replication', thresholds: { warning: 5, critical: 30 }, description: 'Maximum replication lag across replica set members' },
    { id: 'oplog_window_hours', label: 'Oplog Window', unit: 'hours', category: 'replication', thresholds: { warning: 24, critical: 12 }, description: 'Hours of operations stored in oplog (12 hour warning)' },
    { id: 'elections_7d', label: 'Elections (7d)', unit: 'count', category: 'replication', thresholds: { warning: 2, critical: 5 }, description: 'Number of elections in last 7 days' },
    { id: 'failover_ready', label: 'Failover Ready', unit: 'boolean', category: 'replication', thresholds: { warning: 0, critical: 0 }, description: 'Whether cluster is ready for automatic failover' },
    { id: 'shard_count', label: 'Shard Count', unit: 'count', category: 'replication', thresholds: { warning: 0, critical: 0 }, description: 'Number of shards in the cluster' },
    { id: 'chunks_total', label: 'Total Chunks', unit: 'count', category: 'replication', thresholds: { warning: 1000, critical: 5000 }, description: 'Total number of chunks across all shards' },
    { id: 'balanced_percent', label: 'Chunk Balance', unit: '%', category: 'replication', thresholds: { warning: 90, critical: 80 }, description: 'Percentage of even chunk distribution across shards' },
    { id: 'oplog_entries_per_sec', label: 'Oplog Entries/sec', unit: 'entries/s', category: 'replication', thresholds: { warning: 1000, critical: 5000 }, description: 'Number of oplog entries created per second' },
    { id: 'document_count', label: 'Document Count', unit: 'count', category: 'data', thresholds: { warning: 100000000, critical: 500000000 }, description: 'Total number of documents in database' },
    { id: 'avg_document_size_bytes', label: 'Avg Document Size', unit: 'bytes', category: 'data', thresholds: { warning: 16384, critical: 65536 }, description: 'Average document size across all collections' },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* HELPER FUNCTIONS */
/* ─────────────────────────────────────────────────────────────────────────── */

// Seeded random generator for deterministic demo values
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate deterministic demo value for a metric
function generateDemoValue(metricId, metric) {
  const seed = metricId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const rand = seededRandom(seed);

  // Percentages and ratios: 85-99.5%
  if (metric.unit === '%') {
    return Math.round((85 + rand * 14.5) * 100) / 100;
  }

  // Counts: scale based on thresholds
  if (metric.unit.includes('count')) {
    const warning = metric.thresholds.warning || 100;
    return Math.max(1, Math.floor(rand * (warning * 0.5)));
  }

  // Rates (per sec, /sec): reasonable production values
  if (metric.unit.includes('/s') || metric.unit.includes('per sec')) {
    const warning = metric.thresholds.warning || 500;
    return Math.round(rand * (warning * 0.6) * 100) / 100;
  }

  // Bytes: scale reasonably
  if (metric.unit === 'bytes' || metric.unit === 'bytes/s') {
    const warning = metric.thresholds.warning || 1073741824;
    return Math.floor(rand * (warning * 0.3));
  }

  // Time values (seconds, ms): reasonable ranges
  if (metric.unit === 'seconds' || metric.unit === 'ms') {
    const warning = metric.thresholds.warning || 100;
    return Math.round(rand * warning * 0.4 * 100) / 100;
  }

  // Default: scale by warning threshold
  const warning = metric.thresholds.warning || 100;
  return Math.round(rand * warning * 0.5 * 100) / 100;
}

// Get health status color
function getHealthStatus(value, metric) {
  const isInverted = metric.unit.includes('%') || metric.unit.includes('ratio') || metric.unit.includes('hit');
  const { warning, critical } = metric.thresholds;

  if (isInverted) {
    if (value <= critical) return 'critical';
    if (value <= warning) return 'warning';
  } else {
    if (value >= critical) return 'critical';
    if (value >= warning) return 'warning';
  }
  return 'ok';
}

// Get health color
function getHealthColor(status) {
  switch (status) {
    case 'critical': return '#ff5555';
    case 'warning': return '#ffaa55';
    case 'ok': return '#55dd55';
    default: return '#888888';
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* DATABASE CONFIGURATIONS */
/* ─────────────────────────────────────────────────────────────────────────── */
const DB_CONFIGS = {
  postgresql: { icon: Database, name: 'PostgreSQL', color: '#6495ED' },
  mysql: { icon: Database, name: 'MySQL', color: '#00B4D8' },
  mssql: { icon: Server, name: 'SQL Server', color: '#F97316' },
  oracle: { icon: HardDrive, name: 'Oracle', color: '#FF4560' },
  mongodb: { icon: Cloud, name: 'MongoDB', color: '#2EE89C' },
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* MAIN COMPONENT */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function DemoDataTab() {
  const [selectedDb, setSelectedDb] = useState('postgresql');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  // Generate demo data
  const metricsData = useMemo(() => {
    const metrics = METRIC_DEFINITIONS[selectedDb] || [];
    return metrics.map(metric => ({
      ...metric,
      demoValue: generateDemoValue(metric.id, metric),
    }));
  }, [selectedDb]);

  // Filter metrics by search
  const filteredMetrics = useMemo(() => {
    if (!searchQuery.trim()) return metricsData;
    const query = searchQuery.toLowerCase();
    return metricsData.filter(m =>
      m.label.toLowerCase().includes(query) ||
      m.id.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query)
    );
  }, [metricsData, searchQuery]);

  // Group by category
  const groupedMetrics = useMemo(() => {
    const groups = {};
    filteredMetrics.forEach(metric => {
      if (!groups[metric.category]) {
        groups[metric.category] = [];
      }
      groups[metric.category].push(metric);
    });
    return groups;
  }, [filteredMetrics]);

  const categories = Object.keys(groupedMetrics).sort();

  // Summary stats
  const stats = useMemo(() => {
    const totalMetrics = METRIC_DEFINITIONS[selectedDb].length;
    const categoriesCount = new Set(METRIC_DEFINITIONS[selectedDb].map(m => m.category)).size;

    let healthCounts = { ok: 0, warning: 0, critical: 0 };
    metricsData.forEach(m => {
      const status = getHealthStatus(m.demoValue, m);
      healthCounts[status]++;
    });

    return { totalMetrics, categoriesCount, healthCounts };
  }, [selectedDb, metricsData]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div style={{ background: '#0d1117', color: '#e6edf3', minHeight: '100vh', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>Demo Data Browser</h1>
        <p style={{ margin: '0', fontSize: '14px', color: '#8b949e' }}>
          Browse all available metrics for each database type with realistic sample values
        </p>
      </div>

      {/* Database Type Selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {Object.entries(DB_CONFIGS).map(([dbKey, config]) => {
          const Icon = config.icon;
          const metricCount = METRIC_DEFINITIONS[dbKey].length;
          const isSelected = selectedDb === dbKey;

          return (
            <button
              key={dbKey}
              onClick={() => setSelectedDb(dbKey)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '16px',
                background: isSelected ? config.color + '20' : '#161b22',
                border: `2px solid ${isSelected ? config.color : '#30363d'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                color: '#e6edf3',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = config.color + '80';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = '#30363d';
              }}
            >
              <Icon size={24} color={config.color} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>{config.name}</span>
              <span style={{ fontSize: '11px', color: '#8b949e' }}>{metricCount} metrics</span>
            </button>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{ background: '#161b22', padding: '16px', borderRadius: '8px', border: '1px solid #30363d' }}>
          <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>Total Metrics</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#58a6ff' }}>{stats.totalMetrics}</div>
        </div>
        <div style={{ background: '#161b22', padding: '16px', borderRadius: '8px', border: '1px solid #30363d' }}>
          <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>Categories</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#58a6ff' }}>{stats.categoriesCount}</div>
        </div>
        <div style={{ background: '#161b22', padding: '16px', borderRadius: '8px', border: '1px solid #30363d' }}>
          <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '8px' }}>Health Distribution</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#55dd55', fontWeight: '600' }}>●</span> {stats.healthCounts.ok}
            </div>
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#ffaa55', fontWeight: '600' }}>●</span> {stats.healthCounts.warning}
            </div>
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#ff5555', fontWeight: '600' }}>●</span> {stats.healthCounts.critical}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <Search size={18} style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#8b949e',
        }} />
        <input
          type="text"
          placeholder="Search metrics by name, ID, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 12px 12px 40px',
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            color: '#e6edf3',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Metrics Grid by Category */}
      <div>
        {categories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#8b949e',
          }}>
            <Activity size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <p>No metrics match your search</p>
          </div>
        ) : (
          categories.map(category => {
            const isExpanded = expandedCategories[category] !== false;
            const categoryMetrics = groupedMetrics[category];
            const dbColor = DB_CONFIGS[selectedDb].color;

            return (
              <div key={category} style={{ marginBottom: '20px' }}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    background: '#161b22',
                    border: `1px solid ${dbColor}40`,
                    borderRadius: '8px',
                    color: '#e6edf3',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = dbColor + '80';
                    e.currentTarget.style.background = '#1c2128';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = dbColor + '40';
                    e.currentTarget.style.background = '#161b22';
                  }}
                >
                  {isExpanded ? <ChevronDown size={18} color={dbColor} /> : <ChevronRight size={18} color={dbColor} />}
                  <span style={{ color: dbColor }}>{category}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#8b949e', fontWeight: 'normal' }}>
                    {categoryMetrics.length} metrics
                  </span>
                </button>

                {/* Metrics Grid */}
                {isExpanded && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '12px',
                    marginTop: '12px',
                  }}>
                    {categoryMetrics.map(metric => {
                      const value = metric.demoValue;
                      const status = getHealthStatus(value, metric);
                      const statusColor = getHealthColor(status);

                      return (
                        <div
                          key={metric.id}
                          style={{
                            background: '#161b22',
                            border: '1px solid #30363d',
                            borderRadius: '8px',
                            padding: '16px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#58a6ff';
                            e.currentTarget.style.boxShadow = '0 0 12px rgba(88, 166, 255, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#30363d';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Label and Health Indicator */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                            <h3 style={{
                              margin: '0',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#e6edf3',
                              flex: 1,
                            }}>
                              {metric.label}
                            </h3>
                            <div style={{ fontSize: '20px' }}>
                              {status === 'critical' && <XCircle size={20} color={statusColor} />}
                              {status === 'warning' && <AlertTriangle size={20} color={statusColor} />}
                              {status === 'ok' && <CheckCircle size={20} color={statusColor} />}
                            </div>
                          </div>

                          {/* Value */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#58a6ff' }}>
                              {value.toLocaleString()}
                              <span style={{ fontSize: '12px', color: '#8b949e', marginLeft: '4px' }}>{metric.unit}</span>
                            </div>
                          </div>

                          {/* Mini Bar */}
                          <div style={{
                            height: '4px',
                            background: '#30363d',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            marginBottom: '12px',
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, (value / (metric.thresholds.critical || 100)) * 100)}%`,
                              background: statusColor,
                              transition: 'width 0.3s ease',
                            }} />
                          </div>

                          {/* Thresholds */}
                          <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <span style={{ color: '#ffaa55' }}>⚠</span> W: {(metric.thresholds.warning || 'N/A').toLocaleString()}
                            </div>
                            <div>
                              <span style={{ color: '#ff5555' }}>🔴</span> C: {(metric.thresholds.critical || 'N/A').toLocaleString()}
                            </div>
                          </div>

                          {/* Description */}
                          <p style={{
                            margin: '0 0 12px 0',
                            fontSize: '12px',
                            color: '#8b949e',
                            lineHeight: '1.4',
                          }}>
                            {metric.description}
                          </p>

                          {/* Metric ID */}
                          <div style={{
                            padding: '8px',
                            background: '#0d1117',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: '#8b949e',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                          }}>
                            {metric.id}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
