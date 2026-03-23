// ==========================================================================
//  VIGIL — Demo Data Provider
// ==========================================================================
//  Returns realistic sample data for every API endpoint when demo mode
//  is active. No real database connection needed.
// ==========================================================================

const now = () => new Date().toISOString();
const ago = (min) => new Date(Date.now() - min * 60000).toISOString();
const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Overview / Stats ─────────────────────────────────────────────────────────
const overviewStats = () => ({
    active: rand(8, 45),
    total_conn: rand(50, 150),
    max_conn: 200,
    db_size: `${rand(1.2, 8.5)} GB`,
    uptime: `${Math.floor(rand(2, 90))} days`,
    version: 'PostgreSQL 16.2',
    cache_hit: rand(96, 99.8),
    tps: rand(120, 850),
    deadlocks: Math.floor(rand(0, 3)),
    conflicts: Math.floor(rand(0, 5)),
    temp_files: Math.floor(rand(0, 15)),
    temp_bytes: `${rand(0, 512)} MB`,
    blk_read_time: rand(0.1, 5.0),
    blk_write_time: rand(0.05, 2.0),
    xact_commit: Math.floor(rand(50000, 500000)),
    xact_rollback: Math.floor(rand(10, 500)),
    tup_returned: Math.floor(rand(100000, 2000000)),
    tup_fetched: Math.floor(rand(80000, 1500000)),
    tup_inserted: Math.floor(rand(1000, 50000)),
    tup_updated: Math.floor(rand(500, 20000)),
    tup_deleted: Math.floor(rand(100, 5000)),
});

// ── Performance ──────────────────────────────────────────────────────────────
const performanceData = () => ({
    queries: Array.from({ length: 15 }, (_, i) => ({
        queryid: `q-${1000 + i}`,
        query: pick([
            'SELECT * FROM users WHERE email = $1',
            'UPDATE orders SET status = $1 WHERE id = $2',
            'INSERT INTO events (type, payload) VALUES ($1, $2)',
            'SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.created_at > $1',
            'DELETE FROM sessions WHERE expires_at < NOW()',
            'SELECT count(*) FROM products WHERE category_id = $1 AND active = true',
            'WITH monthly AS (SELECT date_trunc(\'month\', created_at) AS m, sum(total) FROM orders GROUP BY 1) SELECT * FROM monthly',
        ]),
        calls: Math.floor(rand(100, 50000)),
        total_exec_time: rand(50, 15000),
        mean_exec_time: rand(0.1, 45),
        rows: Math.floor(rand(1, 10000)),
        shared_blks_hit: Math.floor(rand(1000, 100000)),
        shared_blks_read: Math.floor(rand(10, 5000)),
        cache_hit_ratio: rand(92, 99.9),
    })),
});

// ── Connections / Pool ───────────────────────────────────────────────────────
const connectionPool = () => ({
    connections: Array.from({ length: 20 }, (_, i) => ({
        pid: 10000 + i,
        usename: pick(['app_user', 'admin', 'readonly', 'migration_bot', 'analytics']),
        application_name: pick(['web-api', 'worker', 'cron', 'pgAdmin', 'migration']),
        client_addr: `10.0.${Math.floor(rand(1, 5))}.${Math.floor(rand(1, 254))}`,
        state: pick(['active', 'active', 'idle', 'idle', 'idle', 'idle in transaction']),
        wait_event_type: pick([null, null, null, 'Lock', 'IO', 'Client']),
        wait_event: pick([null, null, null, 'relation', 'DataFileRead', 'ClientRead']),
        query: pick(['SELECT 1', 'COMMIT', 'BEGIN', 'SELECT * FROM orders WHERE id = $1', 'UPDATE users SET last_seen = NOW()']),
        backend_start: ago(rand(1, 1440)),
        xact_start: ago(rand(0, 30)),
        query_start: ago(rand(0, 10)),
        state_change: ago(rand(0, 5)),
    })),
    summary: {
        total: 45,
        active: 12,
        idle: 28,
        idle_in_transaction: 3,
        waiting: 2,
        max_connections: 200,
    },
});

// ── Alerts ───────────────────────────────────────────────────────────────────
const alertsData = () => ({
    alerts: Array.from({ length: 8 }, (_, i) => ({
        id: `alert-${i + 1}`,
        severity: pick(['critical', 'warning', 'warning', 'info', 'info']),
        type: pick(['connection_spike', 'slow_query', 'replication_lag', 'disk_usage', 'cache_ratio_low']),
        message: pick([
            'Connection usage exceeded 80% threshold',
            'Query running for over 5 minutes detected',
            'Replication lag exceeds 100MB',
            'Disk usage at 85% on pg_default tablespace',
            'Cache hit ratio dropped below 95%',
            'Deadlock detected between two transactions',
            'High number of temporary files created',
            'WAL generation rate unusually high',
        ]),
        created_at: ago(rand(5, 1440)),
        acknowledged: i > 3,
        resolved: i > 5,
    })),
});

// ── Indexes ──────────────────────────────────────────────────────────────────
const indexesData = () => ({
    indexes: Array.from({ length: 12 }, (_, i) => ({
        schemaname: 'public',
        tablename: pick(['users', 'orders', 'products', 'events', 'sessions', 'payments']),
        indexname: `idx_${pick(['users_email', 'orders_created', 'products_sku', 'events_type', 'sessions_token', 'payments_order'])}${i}`,
        idx_scan: Math.floor(rand(0, 50000)),
        idx_tup_read: Math.floor(rand(0, 200000)),
        idx_tup_fetch: Math.floor(rand(0, 150000)),
        idx_blks_read: Math.floor(rand(0, 10000)),
        idx_blks_hit: Math.floor(rand(5000, 100000)),
        size: `${rand(0.1, 256)} MB`,
        is_unique: i % 3 === 0,
        is_primary: i === 0,
    })),
    unused: [
        { indexname: 'idx_old_legacy_status', tablename: 'orders', size: '45 MB', idx_scan: 0 },
        { indexname: 'idx_users_deprecated_field', tablename: 'users', size: '12 MB', idx_scan: 0 },
    ],
    duplicate: [
        { indexes: ['idx_orders_user_id', 'idx_orders_user_id_v2'], tablename: 'orders', total_size: '89 MB' },
    ],
});

// ── Replication ──────────────────────────────────────────────────────────────
const replicationData = () => ({
    replicas: [
        { client_addr: '10.0.2.10', state: 'streaming', sent_lsn: '0/3A000148', write_lsn: '0/3A000148', flush_lsn: '0/3A000148', replay_lsn: '0/39FFFFE0', write_lag: '00:00:00.002', flush_lag: '00:00:00.004', replay_lag: '00:00:00.150', sync_state: 'async' },
        { client_addr: '10.0.2.11', state: 'streaming', sent_lsn: '0/3A000148', write_lsn: '0/3A000100', flush_lsn: '0/3A000100', replay_lsn: '0/39FFFF00', write_lag: '00:00:00.008', flush_lag: '00:00:00.012', replay_lag: '00:00:00.350', sync_state: 'async' },
    ],
    wal: {
        current_lsn: '0/3A000148',
        wal_level: 'replica',
        archive_mode: 'on',
        max_wal_size: '1 GB',
        wal_keep_size: '256 MB',
        wal_rate_mbps: rand(0.5, 8.0),
    },
});

// ── Vacuum / Maintenance ─────────────────────────────────────────────────────
const vacuumData = () => ({
    tables: Array.from({ length: 10 }, (_, i) => ({
        schemaname: 'public',
        relname: pick(['users', 'orders', 'products', 'events', 'sessions', 'payments', 'audit_log', 'notifications']),
        n_live_tup: Math.floor(rand(1000, 500000)),
        n_dead_tup: Math.floor(rand(0, 50000)),
        dead_ratio: rand(0, 25),
        last_vacuum: i < 7 ? ago(rand(60, 10080)) : null,
        last_autovacuum: i < 8 ? ago(rand(30, 4320)) : null,
        last_analyze: ago(rand(60, 7200)),
        last_autoanalyze: ago(rand(30, 2880)),
    })),
});

// ── Capacity Planning ────────────────────────────────────────────────────────
const capacityData = () => ({
    current: {
        db_size: '4.2 GB',
        tables_size: '3.1 GB',
        indexes_size: '1.1 GB',
        connections_used: 45,
        connections_max: 200,
    },
    growth: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
        size_gb: +(3.0 + i * 0.04 + Math.random() * 0.02).toFixed(2),
        rows_total: Math.floor(500000 + i * 15000 + Math.random() * 5000),
    })),
    forecast: {
        days_to_80_pct: 142,
        growth_rate_gb_day: 0.042,
        estimated_size_30d: '5.5 GB',
        estimated_size_90d: '7.8 GB',
    },
});

// ── Backup & Recovery ────────────────────────────────────────────────────────
const backupData = () => ({
    backups: [
        { id: 'bk-001', type: 'full', status: 'completed', size: '2.1 GB', started_at: ago(180), completed_at: ago(165), duration: '15m 22s' },
        { id: 'bk-002', type: 'incremental', status: 'completed', size: '145 MB', started_at: ago(60), completed_at: ago(57), duration: '3m 08s' },
        { id: 'bk-003', type: 'full', status: 'in_progress', size: null, started_at: ago(5), completed_at: null, duration: null },
    ],
    schedule: { full: 'Daily at 02:00 UTC', incremental: 'Every 6 hours', retention: '30 days' },
    pitr: { enabled: true, oldest_available: ago(43200), wal_archiving: 'active' },
});

// ── Log Patterns ─────────────────────────────────────────────────────────────
const logPatterns = () => ({
    patterns: [
        { pattern: 'ERROR: deadlock detected', count: 12, severity: 'error', first_seen: ago(1440), last_seen: ago(15) },
        { pattern: 'WARNING: archive command failed', count: 3, severity: 'warning', first_seen: ago(720), last_seen: ago(180) },
        { pattern: 'LOG: checkpoint starting', count: 288, severity: 'info', first_seen: ago(1440), last_seen: ago(5) },
        { pattern: 'ERROR: could not serialize access', count: 28, severity: 'error', first_seen: ago(1440), last_seen: ago(45) },
        { pattern: 'LOG: autovacuum: found table needing vacuum', count: 156, severity: 'info', first_seen: ago(1440), last_seen: ago(10) },
        { pattern: 'WARNING: connection slots remaining: 5', count: 2, severity: 'warning', first_seen: ago(360), last_seen: ago(340) },
    ],
});

// ── Security & Compliance ────────────────────────────────────────────────────
const securityData = () => ({
    roles: [
        { rolname: 'app_user', rolsuper: false, rolcreatedb: false, rolcreaterole: false, rolconnlimit: 50, member_of: ['readonly'] },
        { rolname: 'admin', rolsuper: true, rolcreatedb: true, rolcreaterole: true, rolconnlimit: -1, member_of: [] },
        { rolname: 'readonly', rolsuper: false, rolcreatedb: false, rolcreaterole: false, rolconnlimit: 20, member_of: [] },
        { rolname: 'analytics', rolsuper: false, rolcreatedb: false, rolcreaterole: false, rolconnlimit: 10, member_of: ['readonly'] },
    ],
    ssl_connections: { total: 45, ssl_enabled: 42, ssl_percentage: 93.3 },
    password_policy: { min_length: 12, require_uppercase: true, require_number: true, max_age_days: 90 },
});

// ── OpenTelemetry ────────────────────────────────────────────────────────────
const otelData = () => ({
    services: ['web-api', 'worker-service', 'cron-jobs', 'auth-service'],
    metrics: [
        { name: 'pg_connections_active', service: 'web-api', value: 23, timestamp: now() },
        { name: 'pg_query_duration_ms', service: 'web-api', value: 12.5, timestamp: now() },
        { name: 'pg_transactions_total', service: 'worker-service', value: 8542, timestamp: now() },
        { name: 'pg_cache_hit_ratio', service: 'web-api', value: 98.7, timestamp: now() },
        { name: 'pg_replication_lag_bytes', service: 'auth-service', value: 1024, timestamp: now() },
    ],
    names: ['pg_connections_active', 'pg_query_duration_ms', 'pg_transactions_total', 'pg_cache_hit_ratio', 'pg_replication_lag_bytes', 'pg_deadlocks_total', 'pg_temp_bytes'],
    stats: { total_ingested: 45230, ingestion_rate: 125.4, unique_metrics: 7, services_count: 4 },
    timeline: Array.from({ length: 24 }, (_, i) => ({
        timestamp: ago((23 - i) * 60),
        value: rand(10, 50),
    })),
});

// ── Kubernetes ────────────────────────────────────────────────────────────────
const k8sData = () => ({
    metrics: {
        pods: [
            { name: 'postgres-primary-0', status: 'Running', cpu: '250m', memory: '512Mi', restarts: 0, age: '14d', node: 'node-1' },
            { name: 'postgres-replica-0', status: 'Running', cpu: '180m', memory: '384Mi', restarts: 0, age: '14d', node: 'node-2' },
            { name: 'postgres-replica-1', status: 'Running', cpu: '160m', memory: '356Mi', restarts: 1, age: '7d', node: 'node-3' },
            { name: 'pgbouncer-0', status: 'Running', cpu: '50m', memory: '64Mi', restarts: 0, age: '14d', node: 'node-1' },
        ],
        nodes: [
            { name: 'node-1', cpu_pct: 45, memory_pct: 62, pods_count: 12, status: 'Ready' },
            { name: 'node-2', cpu_pct: 38, memory_pct: 55, pods_count: 10, status: 'Ready' },
            { name: 'node-3', cpu_pct: 52, memory_pct: 71, pods_count: 14, status: 'Ready' },
        ],
    },
    health: {
        cluster: 'healthy',
        primary: 'running',
        replicas: { total: 2, healthy: 2 },
        pgbouncer: 'running',
    },
});

// ── Status Page ──────────────────────────────────────────────────────────────
const statusPageData = () => ({
    public: {
        status: 'operational',
        services: [
            { name: 'PostgreSQL Primary', status: 'operational', uptime: 99.97 },
            { name: 'PostgreSQL Replica 1', status: 'operational', uptime: 99.95 },
            { name: 'PostgreSQL Replica 2', status: 'degraded', uptime: 99.42 },
            { name: 'PgBouncer', status: 'operational', uptime: 99.99 },
            { name: 'WAL Archiving', status: 'operational', uptime: 99.98 },
        ],
    },
    incidents: [
        { id: 'inc-001', title: 'Elevated query latency on replica-2', status: 'monitoring', severity: 'minor', created_at: ago(120), updated_at: ago(30) },
        { id: 'inc-002', title: 'Scheduled maintenance — index rebuild', status: 'resolved', severity: 'maintenance', created_at: ago(2880), resolved_at: ago(2820) },
    ],
    uptime: Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (89 - i) * 86400000).toISOString().slice(0, 10),
        uptime_pct: +(99 + Math.random()).toFixed(2),
    })),
    summary: { overall_uptime: 99.94, incidents_30d: 3, mttr_minutes: 18 },
});

// ── AI Query Advisor ─────────────────────────────────────────────────────────
const aiQueryData = () => ({
    suggestions: [
        { query: 'SELECT * FROM orders WHERE created_at > NOW() - interval \'7 days\'', issue: 'Sequential scan on large table', suggestion: 'Add index on orders(created_at)', impact: 'high', estimated_improvement: '85%' },
        { query: 'SELECT u.*, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id', issue: 'Missing index on join column', suggestion: 'Add index on orders(user_id)', impact: 'medium', estimated_improvement: '60%' },
        { query: 'SELECT * FROM products WHERE LOWER(name) LIKE \'%widget%\'', issue: 'Function call prevents index usage', suggestion: 'Create expression index on LOWER(name) or use pg_trgm', impact: 'high', estimated_improvement: '90%' },
    ],
    anti_patterns: [
        { pattern: 'SELECT *', count: 23, severity: 'warning', description: 'Selecting all columns when only a few are needed' },
        { pattern: 'Missing WHERE clause', count: 5, severity: 'critical', description: 'Full table scans without filtering' },
        { pattern: 'N+1 query pattern', count: 8, severity: 'warning', description: 'Multiple queries where one JOIN would suffice' },
    ],
    report: { queries_analyzed: 156, issues_found: 28, estimated_total_improvement: '45%', last_analysis: now() },
});

// ── Retention Management ─────────────────────────────────────────────────────
const retentionData = () => ({
    policy: {
        metrics_retention_days: 90,
        logs_retention_days: 30,
        alerts_retention_days: 365,
        backups_retention_days: 30,
        audit_retention_days: 365,
    },
    stats: {
        total_data_size: '4.2 GB',
        metrics_size: '1.8 GB',
        logs_size: '900 MB',
        alerts_size: '200 MB',
        oldest_data: ago(129600),
    },
    growth: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
        size_mb: Math.floor(3800 + i * 15 + Math.random() * 20),
    })),
});

// ── Terraform Export ─────────────────────────────────────────────────────────
const terraformData = () => ({
    export: `resource "postgresql_role" "app_user" {\n  name     = "app_user"\n  login    = true\n  password = var.app_user_password\n  connection_limit = 50\n}\n\nresource "postgresql_database" "vigil" {\n  name  = "vigil"\n  owner = postgresql_role.app_user.name\n}\n\nresource "postgresql_extension" "pg_stat_statements" {\n  name     = "pg_stat_statements"\n  database = postgresql_database.vigil.name\n}`,
    json: { roles: [{ name: 'app_user', login: true, connection_limit: 50 }], databases: [{ name: 'vigil', owner: 'app_user' }], extensions: ['pg_stat_statements', 'pgcrypto'] },
});

// ── Custom Dashboard ─────────────────────────────────────────────────────────
const customDashboardData = () => ({
    dashboards: [
        { id: 'dash-1', name: 'Production Overview', widgets: 6, created_at: ago(10080), updated_at: ago(60) },
        { id: 'dash-2', name: 'Query Performance', widgets: 4, created_at: ago(7200), updated_at: ago(120) },
    ],
    available_metrics: [
        'connections.active', 'connections.idle', 'cache.hit_ratio',
        'tps.commit', 'tps.rollback', 'disk.usage_pct',
        'replication.lag_bytes', 'queries.mean_time', 'temp.files_count',
    ],
});

// ── Table Analysis ───────────────────────────────────────────────────────────
const tableData = () => ({
    tables: [
        { schemaname: 'public', tablename: 'users', total_size: '245 MB', table_size: '180 MB', index_size: '65 MB', row_count: 125000, seq_scan: 45, idx_scan: 89000 },
        { schemaname: 'public', tablename: 'orders', total_size: '1.2 GB', table_size: '890 MB', index_size: '310 MB', row_count: 2500000, seq_scan: 12, idx_scan: 450000 },
        { schemaname: 'public', tablename: 'products', total_size: '89 MB', table_size: '62 MB', index_size: '27 MB', row_count: 35000, seq_scan: 120, idx_scan: 95000 },
        { schemaname: 'public', tablename: 'events', total_size: '2.8 GB', table_size: '2.4 GB', index_size: '400 MB', row_count: 15000000, seq_scan: 3, idx_scan: 780000 },
        { schemaname: 'public', tablename: 'sessions', total_size: '156 MB', table_size: '120 MB', index_size: '36 MB', row_count: 450000, seq_scan: 8, idx_scan: 210000 },
    ],
});

// ── Bloat ────────────────────────────────────────────────────────────────────
const bloatData = () => ({
    tables: [
        { schemaname: 'public', tablename: 'events', bloat_pct: 18.5, wasted_bytes: 450000000, dead_tuples: 2800000 },
        { schemaname: 'public', tablename: 'sessions', bloat_pct: 12.3, wasted_bytes: 18000000, dead_tuples: 55000 },
        { schemaname: 'public', tablename: 'orders', bloat_pct: 8.1, wasted_bytes: 72000000, dead_tuples: 200000 },
    ],
    indexes: [
        { schemaname: 'public', indexname: 'idx_events_created', bloat_pct: 22.1, wasted_bytes: 88000000 },
        { schemaname: 'public', indexname: 'idx_sessions_token', bloat_pct: 15.4, wasted_bytes: 5500000 },
    ],
});

// ── Schema Versioning ────────────────────────────────────────────────────────
const schemaData = () => ({
    versions: [
        { version: '20240301_001', name: 'Add events partitioning', applied_at: ago(43200), status: 'applied', duration: '2.3s' },
        { version: '20240215_002', name: 'Create indexes for orders', applied_at: ago(64800), status: 'applied', duration: '4.1s' },
        { version: '20240201_001', name: 'Initial schema', applied_at: ago(86400), status: 'applied', duration: '1.8s' },
    ],
    pending: [
        { version: '20240315_001', name: 'Add user preferences table', status: 'pending' },
    ],
});

// ── Connections data ─────────────────────────────────────────────────────────
const connectionsData = () => ({
    connections: [
        { id: 'demo-conn-1', name: 'Production DB', host: 'prod-pg.example.com', port: 5432, database: 'vigil_prod', status: 'connected', created_at: ago(43200) },
        { id: 'demo-conn-2', name: 'Staging DB', host: 'staging-pg.example.com', port: 5432, database: 'vigil_staging', status: 'disconnected', created_at: ago(21600) },
    ],
});

// ── CloudWatch ───────────────────────────────────────────────────────────────
const cloudwatchData = () => ({
    metrics: {
        CPUUtilization: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(15, 65) })),
        FreeableMemory: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(2000, 6000) })),
        ReadIOPS: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(100, 2000) })),
        WriteIOPS: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(50, 800) })),
    },
    status: 'available',
    instance: 'db.r6g.xlarge',
});

// ── Checkpoint ───────────────────────────────────────────────────────────────
const checkpointData = () => ({
    stats: {
        checkpoints_timed: 288,
        checkpoints_req: 5,
        checkpoint_write_time: 45230.5,
        checkpoint_sync_time: 1230.2,
        buffers_checkpoint: 125000,
        buffers_clean: 8500,
        buffers_backend: 3200,
        maxwritten_clean: 0,
    },
    history: Array.from({ length: 20 }, (_, i) => ({
        time: ago((19 - i) * 30),
        type: i % 6 === 0 ? 'requested' : 'timed',
        duration_ms: rand(200, 5000),
        wal_written: `${rand(10, 200)} MB`,
    })),
});

// ── DBA Task Scheduler ───────────────────────────────────────────────────────
const tasksData = () => ({
    tasks: [
        { id: 'task-1', name: 'Daily VACUUM ANALYZE', schedule: '0 2 * * *', last_run: ago(180), next_run: ago(-1260), status: 'success', duration: '12m 30s' },
        { id: 'task-2', name: 'Reindex concurrently', schedule: '0 3 * * 0', last_run: ago(7200), next_run: ago(-2880), status: 'success', duration: '45m 12s' },
        { id: 'task-3', name: 'Cleanup expired sessions', schedule: '*/30 * * * *', last_run: ago(15), next_run: ago(-15), status: 'success', duration: '8s' },
        { id: 'task-4', name: 'pg_dump backup', schedule: '0 1 * * *', last_run: ago(300), next_run: ago(-1140), status: 'success', duration: '8m 45s' },
    ],
});

// ── Alert Correlation ────────────────────────────────────────────────────────
const alertCorrelationData = () => ({
    correlations: [
        { alert_group: 'Connection Spike + Slow Queries', alerts: ['Connection usage 85%', 'Query > 5min detected', 'Lock wait timeout'], confidence: 0.92, root_cause: 'Likely a long-running transaction holding locks' },
        { alert_group: 'Replication Lag + Disk IO', alerts: ['Replication lag 150MB', 'High write IOPS'], confidence: 0.78, root_cause: 'High write workload saturating disk IO on replica' },
    ],
});

// ── Query Optimizer ──────────────────────────────────────────────────────────
const optimizerData = () => ({
    slow_queries: Array.from({ length: 8 }, (_, i) => ({
        queryid: `sq-${i + 1}`,
        query: pick([
            'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC LIMIT 50',
            'SELECT u.*, count(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id',
            'UPDATE products SET price = price * 1.1 WHERE category_id = $1',
        ]),
        mean_exec_time: rand(50, 5000),
        calls: Math.floor(rand(10, 5000)),
        total_exec_time: rand(500, 50000),
        plan: 'Seq Scan on orders (cost=0.00..45230.00 rows=2500000 width=120)',
    })),
});

// ── Admin ────────────────────────────────────────────────────────────────────
const adminSettings = () => ({
    settings: [
        { name: 'max_connections', setting: '200', unit: null, category: 'Connections and Authentication' },
        { name: 'shared_buffers', setting: '4GB', unit: null, category: 'Resource Usage / Memory' },
        { name: 'effective_cache_size', setting: '12GB', unit: null, category: 'Query Tuning / Planner Cost Constants' },
        { name: 'work_mem', setting: '64MB', unit: null, category: 'Resource Usage / Memory' },
        { name: 'maintenance_work_mem', setting: '512MB', unit: null, category: 'Resource Usage / Memory' },
        { name: 'wal_level', setting: 'replica', unit: null, category: 'Write-Ahead Log / Settings' },
    ],
});

// ═══════════════════════════════════════════════════════════════════════════
//  ROUTE MATCHER — maps API path patterns to demo data generators
// ═══════════════════════════════════════════════════════════════════════════

const DEMO_ROUTES = [
    // Overview
    [/\/api\/overview\/stats/, overviewStats],
    [/\/api\/overview\/traffic/, () => ({ traffic: Array.from({ length: 60 }, (_, i) => ({ time: ago(59 - i), tps: rand(50, 500), connections: Math.floor(rand(20, 80)) })) })],
    [/\/api\/overview\/growth/, () => capacityData().growth],

    // Performance
    [/\/api\/performance/, performanceData],
    [/\/api\/slow-queries/, () => optimizerData().slow_queries],
    [/\/api\/query-stats/, performanceData],

    // Connections
    [/\/api\/connections$/, connectionsData],
    [/\/api\/connections\/pool/, connectionPool],
    [/\/api\/pool/, connectionPool],

    // Alerts
    [/\/api\/alerts/, alertsData],

    // Indexes
    [/\/api\/indexes/, indexesData],
    [/\/api\/table-indexes/, indexesData],

    // Tables
    [/\/api\/tables/, tableData],
    [/\/api\/table-sizes/, tableData],
    [/\/api\/table-stats/, tableData],

    // Replication
    [/\/api\/replication/, replicationData],
    [/\/api\/wal/, () => replicationData().wal],

    // Vacuum
    [/\/api\/vacuum/, vacuumData],
    [/\/api\/maintenance/, vacuumData],

    // Bloat
    [/\/api\/bloat/, bloatData],

    // Capacity
    [/\/api\/capacity/, capacityData],

    // Backup
    [/\/api\/backup/, backupData],

    // Schema
    [/\/api\/schema/, schemaData],
    [/\/api\/migrations/, schemaData],

    // Security
    [/\/api\/security/, securityData],
    [/\/api\/roles/, () => securityData().roles],

    // Log Patterns
    [/\/api\/log-patterns/, logPatterns],
    [/\/api\/logs/, logPatterns],

    // CloudWatch
    [/\/api\/cloudwatch/, cloudwatchData],

    // Checkpoint
    [/\/api\/checkpoint/, checkpointData],

    // Tasks
    [/\/api\/tasks/, tasksData],
    [/\/api\/scheduler/, tasksData],

    // Alert Correlation
    [/\/api\/alert-correlation/, alertCorrelationData],

    // Optimizer
    [/\/api\/optimizer/, optimizerData],
    [/\/api\/query-plan/, optimizerData],

    // Admin / Settings
    [/\/api\/admin\/settings/, adminSettings],
    [/\/api\/settings/, adminSettings],
    [/\/api\/admin\/feedback/, () => ({ feedback: [] })],

    // Users / Sessions / Audit
    [/\/api\/users/, () => ({ users: [{ id: 'demo-1', username: 'demo', name: 'Demo User', role: 'super_admin', created_at: ago(43200) }] })],
    [/\/api\/sessions/, () => ({ sessions: [] })],
    [/\/api\/audit/, () => ({ events: [] })],

    // Repository
    [/\/api\/repo/, () => ({ repositories: [] })],

    // API Tracing
    [/\/api\/api-queries/, () => ({ queries: [] })],

    // ── Gap features ──
    [/\/api\/otel/, otelData],
    [/\/api\/k8s/, k8sData],
    [/\/api\/status/, statusPageData],
    [/\/api\/ai-query/, aiQueryData],
    [/\/api\/retention/, retentionData],
    [/\/api\/terraform/, terraformData],
    [/\/api\/custom-dashboard/, customDashboardData],

    // Reliability
    [/\/api\/reliability/, () => ({ score: 94.5, checks: [{ name: 'Replication', status: 'pass' }, { name: 'Backups', status: 'pass' }, { name: 'Monitoring', status: 'pass' }, { name: 'Security', status: 'warning' }] })],

    // Feedback
    [/\/api\/feedback/, () => ({ success: true })],
];

/**
 * Look up demo data for a given API path.
 * Returns the data object if a match is found, or null if no match.
 */
export function getDemoData(path) {
    // Strip query params for matching
    const cleanPath = path.split('?')[0];
    for (const [regex, generator] of DEMO_ROUTES) {
        if (regex.test(cleanPath)) {
            return generator();
        }
    }
    // Fallback — return empty success response so tabs don't crash
    console.warn(`[DEMO] No mock data for: ${cleanPath}`);
    return { demo: true, message: 'Demo data not available for this endpoint' };
}

/**
 * Check if demo mode is currently active.
 */
export function isDemoMode() {
    try { return localStorage.getItem('vigil_demo_mode') === 'true'; }
    catch { return false; }
}
