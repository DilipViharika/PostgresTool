// ==========================================================================
//  VIGIL — Demo Data Provider (v2 — shapes match actual component expectations)
// ==========================================================================

const now = () => new Date().toISOString();
const ago = (min) => new Date(Date.now() - min * 60000).toISOString();
const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════════════════
//  ROUTE → DATA MAP (regex → generator)
//  Order matters: more specific patterns first.
// ═══════════════════════════════════════════════════════════════════════════

const DEMO_ROUTES = [

    // ── ConnectionContext ────────────────────────────────────────────────────
    [/\/api\/connections\/active/, () => ({ connectionId: 'demo-conn-1' })],
    [/\/api\/connections\/[^/]+\/test/, () => ({ success: true })],
    [/\/api\/connections\/[^/]+\/default/, () => ({ success: true })],
    [/\/api\/connections\/[^/]+\/switch/, () => ({ success: true })],
    [/\/api\/connections$/, () => ([
        { id: 'demo-conn-1', name: 'Production DB', host: 'prod-pg.example.com', port: 5432, database: 'vigil_prod', isDefault: true, status: 'connected', created_at: ago(43200) },
        { id: 'demo-conn-2', name: 'Staging DB', host: 'staging-pg.example.com', port: 5432, database: 'vigil_staging', isDefault: false, status: 'disconnected', created_at: ago(21600) },
    ])],

    // ── Overview (flat object with specific keys) ────────────────────────────
    [/\/api\/overview\/stats/, () => ({
        activeConnections: Math.floor(rand(8, 45)),
        maxConnections: 200,
        uptimeSeconds: Math.floor(rand(172800, 7776000)),
        diskUsedGB: rand(1.2, 8.5),
        indexHitRatio: rand(96, 99.8),
        cacheHitRatio: rand(95, 99.9),
        tps: rand(120, 850),
        deadlocks: Math.floor(rand(0, 3)),
        dbSize: `${rand(1.2, 8.5)} GB`,
        version: 'PostgreSQL 16.2',
        active: Math.floor(rand(8, 45)),
        total_conn: Math.floor(rand(50, 150)),
        max_conn: 200,
    })],
    [/\/api\/overview\/traffic/, () => ({
        tup_fetched: Math.floor(rand(80000, 1500000)),
        tup_inserted: Math.floor(rand(1000, 50000)),
        tup_updated: Math.floor(rand(500, 20000)),
        tup_deleted: Math.floor(rand(100, 5000)),
    })],
    [/\/api\/overview\/growth/, () => Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
        size_gb: +(3.0 + i * 0.04 + Math.random() * 0.02).toFixed(2),
    }))],

    // ── Performance (object with slowQueries array) ──────────────────────────
    [/\/api\/performance\/table-io/, () => Array.from({ length: 8 }, () => ({
        schemaname: 'public',
        relname: pick(['users', 'orders', 'products', 'events', 'sessions']),
        heap_blks_read: Math.floor(rand(100, 50000)),
        heap_blks_hit: Math.floor(rand(10000, 500000)),
        idx_blks_read: Math.floor(rand(50, 10000)),
        idx_blks_hit: Math.floor(rand(5000, 200000)),
    }))],
    [/\/api\/performance\/stats/, () => ({
        available: true,
        slowQueries: Array.from({ length: 10 }, (_, i) => ({
            queryid: `q-${1000 + i}`,
            query: pick([
                'SELECT * FROM users WHERE email = $1',
                'UPDATE orders SET status = $1 WHERE id = $2',
                'SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id',
                'DELETE FROM sessions WHERE expires_at < NOW()',
            ]),
            calls: Math.floor(rand(100, 50000)),
            total_exec_time: rand(50, 15000),
            mean_exec_time: rand(0.1, 45),
            rows: Math.floor(rand(1, 10000)),
            shared_blks_hit: Math.floor(rand(1000, 100000)),
            shared_blks_read: Math.floor(rand(10, 5000)),
        })),
    })],
    [/\/api\/performance/, () => ({
        available: true,
        slowQueries: Array.from({ length: 10 }, (_, i) => ({
            queryid: `q-${1000 + i}`,
            query: pick(['SELECT * FROM users WHERE email = $1', 'UPDATE orders SET status = $1']),
            calls: Math.floor(rand(100, 50000)),
            total_exec_time: rand(50, 15000),
            mean_exec_time: rand(0.1, 45),
            rows: Math.floor(rand(1, 10000)),
        })),
    })],

    // ── Reliability (arrays for sub-endpoints) ───────────────────────────────
    [/\/api\/reliability\/active-connections/, () => Array.from({ length: 15 }, (_, i) => ({
        pid: 10000 + i,
        usename: pick(['app_user', 'admin', 'readonly']),
        application_name: pick(['web-api', 'worker', 'cron']),
        client_addr: `10.0.${Math.floor(rand(1, 5))}.${Math.floor(rand(1, 254))}`,
        state: pick(['active', 'idle', 'idle']),
        query: pick(['SELECT 1', 'COMMIT', 'BEGIN']),
        backend_start: ago(rand(1, 1440)),
    }))],
    [/\/api\/reliability\/locks/, () => Array.from({ length: 3 }, (_, i) => ({
        pid: 10010 + i,
        locktype: pick(['relation', 'transactionid']),
        mode: pick(['AccessShareLock', 'RowExclusiveLock']),
        granted: true,
        relation: pick(['users', 'orders', 'products']),
    }))],
    [/\/api\/reliability\/replication/, () => ([
        { client_addr: '10.0.2.10', state: 'streaming', replay_lag: '00:00:00.150', sync_state: 'async' },
        { client_addr: '10.0.2.11', state: 'streaming', replay_lag: '00:00:00.350', sync_state: 'async' },
    ])],
    [/\/api\/reliability/, () => ({ score: 94.5, checks: [{ name: 'Replication', status: 'pass' }, { name: 'Backups', status: 'pass' }, { name: 'Security', status: 'warning' }] })],

    // ── Resources (all arrays) ───────────────────────────────────────────────
    [/\/api\/resources\/growth-trend/, () => Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
        total_size_gb: +(3.0 + i * 0.04).toFixed(2),
    }))],
    [/\/api\/resources\/vacuum-status/, () => Array.from({ length: 8 }, () => ({
        schemaname: 'public', relname: pick(['users', 'orders', 'products', 'events']),
        n_dead_tup: Math.floor(rand(0, 50000)), n_live_tup: Math.floor(rand(1000, 500000)),
        last_autovacuum: ago(rand(30, 4320)),
    }))],
    [/\/api\/resources\/disk-io/, () => Array.from({ length: 24 }, (_, i) => ({
        timestamp: ago((23 - i) * 60), blks_read: Math.floor(rand(100, 5000)), blks_hit: Math.floor(rand(10000, 100000)),
    }))],
    [/\/api\/resources\/maintenance-logs/, () => Array.from({ length: 5 }, () => ({
        action: pick(['VACUUM', 'ANALYZE', 'REINDEX']), table: pick(['users', 'orders']),
        started_at: ago(rand(60, 10080)), duration_ms: rand(200, 45000),
    }))],
    [/\/api\/resources\/growth/, () => Array.from({ length: 10 }, () => ({
        schemaname: 'public', relname: pick(['users', 'orders', 'products', 'events', 'sessions']),
        row_count: Math.floor(rand(1000, 500000)), index_size_gb: rand(0.01, 0.5),
        total_size_gb: rand(0.05, 2.5), seq_scan: Math.floor(rand(0, 200)), idx_scan: Math.floor(rand(1000, 100000)),
    }))],

    // ── Alerts ({alerts: [...]}) ─────────────────────────────────────────────
    [/\/api\/alerts\/statistics/, () => ({
        hourlyBreakdown: Array.from({ length: 24 }, (_, i) => ({
            hour: i, count: Math.floor(rand(0, 8)), severity: pick(['critical', 'warning', 'info']),
        })),
        total: 42, critical: 5, warning: 18, info: 19,
    })],
    [/\/api\/alerts\/correlation/, () => ({
        correlationGroups: [
            {
                id: 'cg-001', severity: 'critical', type: 'Lock Contention Cascade',
                root_cause: 'Long-running transaction on orders table blocking 3 concurrent writers, causing connection pool exhaustion',
                start_ts: Math.floor(Date.now() / 1000) - 1800, end_ts: Math.floor(Date.now() / 1000) - 600,
                types: ['lock_contention', 'connection_spike', 'slow_query'],
                events: [
                    { severity: 'critical', timestamp: ago(30), message: 'Transaction on orders table running for 25 minutes (pid 10567)' },
                    { severity: 'warning', timestamp: ago(25), message: 'Connection pool usage reached 85% (170/200)' },
                    { severity: 'warning', timestamp: ago(22), message: '3 queries waiting on RowExclusiveLock for > 10s' },
                    { severity: 'critical', timestamp: ago(18), message: 'Active connections exceeded threshold: 185/200' },
                ],
            },
            {
                id: 'cg-002', severity: 'warning', type: 'Replication Lag Spike',
                root_cause: 'Bulk INSERT on events table generating high WAL volume, replicas falling behind',
                start_ts: Math.floor(Date.now() / 1000) - 7200, end_ts: Math.floor(Date.now() / 1000) - 5400,
                types: ['replication_lag', 'high_io', 'wal_volume'],
                events: [
                    { severity: 'warning', timestamp: ago(120), message: 'WAL generation rate spiked to 45 MB/s (normal: 2 MB/s)' },
                    { severity: 'warning', timestamp: ago(115), message: 'Replica postgres-replica-0 lag reached 8.2s' },
                    { severity: 'warning', timestamp: ago(110), message: 'Replica postgres-replica-1 lag reached 12.5s' },
                    { severity: 'info', timestamp: ago(90), message: 'Bulk INSERT completed, WAL rate returning to normal' },
                ],
            },
            {
                id: 'cg-003', severity: 'warning', type: 'Cache Pressure Event',
                root_cause: 'Analytics query scanning large table bypassed shared_buffers, evicting hot pages',
                start_ts: Math.floor(Date.now() / 1000) - 14400, end_ts: Math.floor(Date.now() / 1000) - 13200,
                types: ['cache_miss', 'slow_query', 'io_spike'],
                events: [
                    { severity: 'warning', timestamp: ago(240), message: 'Cache hit ratio dropped to 89.2% (threshold: 95%)' },
                    { severity: 'info', timestamp: ago(235), message: 'Sequential scan on events table: 2.8M rows, 1.2 GB read from disk' },
                    { severity: 'warning', timestamp: ago(230), message: 'Read IOPS spiked to 4500 (baseline: 800)' },
                ],
            },
        ],
        recentEvents: [
            { severity: 'critical', timestamp: ago(18), message: 'Active connections exceeded threshold: 185/200' },
            { severity: 'critical', timestamp: ago(30), message: 'Transaction on orders table running for 25 minutes' },
            { severity: 'warning', timestamp: ago(22), message: '3 queries waiting on RowExclusiveLock for > 10s' },
            { severity: 'warning', timestamp: ago(25), message: 'Connection pool usage reached 85%' },
            { severity: 'warning', timestamp: ago(115), message: 'Replica postgres-replica-0 lag reached 8.2s' },
            { severity: 'warning', timestamp: ago(230), message: 'Read IOPS spiked to 4500' },
            { severity: 'warning', timestamp: ago(240), message: 'Cache hit ratio dropped to 89.2%' },
            { severity: 'info', timestamp: ago(90), message: 'Bulk INSERT completed, WAL rate returning to normal' },
            { severity: 'info', timestamp: ago(235), message: 'Sequential scan on events table: 2.8M rows' },
        ],
        sessionStates: [
            { state: 'active', wait_event_type: null, cnt: '18' },
            { state: 'idle', wait_event_type: null, cnt: '24' },
            { state: 'idle in transaction', wait_event_type: 'Lock', cnt: '5' },
            { state: 'active', wait_event_type: 'IO', cnt: '8' },
            { state: 'active', wait_event_type: 'Client', cnt: '3' },
            { state: 'idle in transaction', wait_event_type: 'Client', cnt: '2' },
            { state: 'active', wait_event_type: 'LWLock', cnt: '4' },
        ],
        longTransactions: [
            { pid: 10567, usename: 'admin', xact_age_sec: 1520, state: 'idle in transaction', query: 'UPDATE orders SET status = $1 WHERE batch_id = $2', datname: 'vigil_prod', backend_start: ago(180) },
            { pid: 10890, usename: 'app_user', xact_age_sec: 480, state: 'active', query: 'INSERT INTO events SELECT generate_series(...)', datname: 'vigil_prod', backend_start: ago(45) },
            { pid: 11023, usename: 'analytics_user', xact_age_sec: 320, state: 'active', query: 'SELECT date_trunc(day, created_at), count(*) FROM events GROUP BY 1', datname: 'vigil_analytics', backend_start: ago(30) },
        ],
        lockSummary: [
            { locktype: 'relation', mode: 'AccessShareLock', count: 42 },
            { locktype: 'relation', mode: 'RowExclusiveLock', count: 15 },
            { locktype: 'relation', mode: 'ShareLock', count: 3 },
            { locktype: 'transactionid', mode: 'ShareLock', count: 7 },
            { locktype: 'tuple', mode: 'ExclusiveLock', count: 2 },
            { locktype: 'advisory', mode: 'ExclusiveLock', count: 4 },
        ],
        bloatedTables: [
            { relname: 'events', schema: 'public', dead_pct: '22.5', n_dead_tup: 680000, n_live_tup: 2340000, total_size: '2.8 GB', last_autovacuum: ago(45) },
            { relname: 'sessions', schema: 'public', dead_pct: '18.3', n_dead_tup: 125000, n_live_tup: 558000, total_size: '256 MB', last_autovacuum: ago(120) },
            { relname: 'audit_log', schema: 'public', dead_pct: '8.7', n_dead_tup: 89000, n_live_tup: 934000, total_size: '1.1 GB', last_autovacuum: ago(180) },
            { relname: 'notifications', schema: 'public', dead_pct: '6.2', n_dead_tup: 45000, n_live_tup: 680000, total_size: '380 MB', last_autovacuum: ago(60) },
            { relname: 'orders', schema: 'public', dead_pct: '3.1', n_dead_tup: 23000, n_live_tup: 720000, total_size: '1.0 GB', last_autovacuum: ago(30) },
        ],
    })],
    [/\/api\/alerts\/[^/]+\/acknowledge/, () => ({ success: true })],
    [/\/api\/alerts\/bulk-acknowledge/, () => ({ success: true })],
    [/\/api\/alerts\/recent/, () => ({ alerts: [] })],
    [/\/api\/alerts/, () => ({
        alerts: Array.from({ length: 8 }, (_, i) => ({
            id: `alert-${i + 1}`,
            severity: pick(['critical', 'warning', 'warning', 'info', 'info']),
            type: pick(['connection_spike', 'slow_query', 'replication_lag', 'disk_usage']),
            message: pick(['Connection usage exceeded 80%', 'Query running for over 5 minutes', 'Replication lag exceeds 100MB', 'Cache hit ratio dropped below 95%']),
            created_at: ago(rand(5, 1440)),
            acknowledged: i > 3,
            resolved: i > 5,
        })),
    })],

    // ── Indexes (arrays for sub-endpoints) ───────────────────────────────────
    [/\/api\/indexes\/health/, () => ({ score: 87, total: 24, unused: 2, duplicate: 1, bloated: 3, missing_suggested: 2 })],
    [/\/api\/indexes\/missing/, () => Array.from({ length: 3 }, () => ({
        table: pick(['orders', 'events', 'products']), column: pick(['created_at', 'user_id', 'category_id']),
        reason: 'Sequential scan detected', estimated_improvement: `${Math.floor(rand(40, 90))}%`,
    }))],
    [/\/api\/indexes\/unused/, () => ([
        { indexname: 'idx_old_legacy_status', tablename: 'orders', size: '45 MB', idx_scan: 0, schemaname: 'public' },
        { indexname: 'idx_users_deprecated_field', tablename: 'users', size: '12 MB', idx_scan: 0, schemaname: 'public' },
    ])],
    [/\/api\/indexes\/duplicates/, () => ([
        { indexes: ['idx_orders_user_id', 'idx_orders_user_id_v2'], tablename: 'orders', total_size: '89 MB', schemaname: 'public' },
    ])],
    [/\/api\/indexes\/bloat/, () => ([
        { indexname: 'idx_events_created', tablename: 'events', bloat_pct: 22.1, wasted_bytes: 88000000, schemaname: 'public' },
    ])],
    [/\/api\/indexes/, () => Array.from({ length: 12 }, (_, i) => ({
        schemaname: 'public', tablename: pick(['users', 'orders', 'products', 'events']),
        indexname: `idx_${pick(['email', 'created_at', 'sku', 'type'])}${i}`,
        idx_scan: Math.floor(rand(0, 50000)), idx_tup_read: Math.floor(rand(0, 200000)),
        size: `${rand(0.1, 256)} MB`, is_unique: i % 3 === 0, is_primary: i === 0,
    }))],

    // ── Bloat (arrays for tables/indexes) ────────────────────────────────────
    [/\/api\/bloat\/tables/, () => Array.from({ length: 5 }, () => ({
        schemaname: 'public', tablename: pick(['events', 'sessions', 'orders']),
        bloat_pct: rand(5, 25), wasted_bytes: Math.floor(rand(1000000, 500000000)),
        dead_tuples: Math.floor(rand(10000, 3000000)),
    }))],
    [/\/api\/bloat\/indexes/, () => Array.from({ length: 3 }, () => ({
        schemaname: 'public', indexname: pick(['idx_events_created', 'idx_sessions_token']),
        bloat_pct: rand(10, 30), wasted_bytes: Math.floor(rand(5000000, 100000000)),
    }))],
    [/\/api\/bloat\/summary/, () => ({ total_bloat_gb: 0.62, tables_bloated: 5, indexes_bloated: 3, worst_table: 'events', worst_pct: 18.5 })],
    [/\/api\/bloat/, () => Array.from({ length: 5 }, () => ({
        schemaname: 'public', tablename: pick(['events', 'sessions', 'orders']),
        bloat_pct: rand(5, 25), wasted_bytes: Math.floor(rand(1000000, 500000000)),
    }))],

    // ── Databases (for TableAnalytics filter) ──────────────────────────────
    [/\/api\/databases$/, () => ([
        { name: 'vigil_prod', owner: 'app_user', size: '4.2 GB', tables: 42, encoding: 'UTF8' },
        { name: 'vigil_analytics', owner: 'analytics_user', size: '1.8 GB', tables: 18, encoding: 'UTF8' },
        { name: 'postgres', owner: 'postgres', size: '8.5 MB', tables: 12, encoding: 'UTF8' },
    ])],

    // ── Tables (TableAnalytics sub-endpoints) ──────────────────────────────
    [/\/api\/tables\/stats/, () => Array.from({ length: 12 }, (_, i) => ({
        name: pick(['users', 'orders', 'products', 'events', 'sessions', 'audit_log', 'notifications', 'payments', 'inventory', 'categories']),
        schema: 'public', db: 'vigil_prod',
        liveRows: Math.floor(rand(5000, 800000)), deadRows: Math.floor(rand(0, 60000)),
        deadPct: rand(0, 15), rows: Math.floor(rand(5000, 800000)),
        seqScans: Math.floor(rand(0, 300)), idxScans: Math.floor(rand(500, 120000)),
        inserts: Math.floor(rand(100, 50000)), updates: Math.floor(rand(50, 20000)),
        vacuumCount: Math.floor(rand(10, 500)), analyzeCount: Math.floor(rand(10, 300)),
        lastVacuum: i < 8 ? ago(rand(60, 10080)) : null,
        lastAutovacuum: i < 10 ? ago(rand(30, 4320)) : null,
        lastAnalyze: ago(rand(30, 2880)),
        lastAutoanalyze: ago(rand(60, 4320)),
        hotPct: rand(0, 35),
    }))],
    [/\/api\/tables\/columns/, () => [
        { tablename: 'users', schema: 'public', name: 'id', nullPct: 0, distinct: -1, topValues: null },
        { tablename: 'users', schema: 'public', name: 'email', nullPct: 0.2, distinct: -0.98, topValues: null },
        { tablename: 'users', schema: 'public', name: 'created_at', nullPct: 0, distinct: -0.95, topValues: null },
        { tablename: 'users', schema: 'public', name: 'status', nullPct: 0, distinct: 4, topValues: ['active', 'inactive', 'suspended', 'pending'] },
        { tablename: 'orders', schema: 'public', name: 'id', nullPct: 0, distinct: -1, topValues: null },
        { tablename: 'orders', schema: 'public', name: 'user_id', nullPct: 0, distinct: 45200, topValues: null },
        { tablename: 'orders', schema: 'public', name: 'status', nullPct: 0, distinct: 5, topValues: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
        { tablename: 'orders', schema: 'public', name: 'total_amount', nullPct: 0, distinct: 8900, topValues: null },
        { tablename: 'events', schema: 'public', name: 'type', nullPct: 0, distinct: 12, topValues: ['page_view', 'click', 'purchase', 'signup', 'login'] },
        { tablename: 'events', schema: 'public', name: 'payload', nullPct: 8.5, distinct: -0.99, topValues: null },
        { tablename: 'sessions', schema: 'public', name: 'token', nullPct: 0, distinct: -1, topValues: null },
        { tablename: 'sessions', schema: 'public', name: 'expires_at', nullPct: 0, distinct: -0.85, topValues: null },
    ]],
    [/\/api\/tables\/toast/, () => [
        { table: 'events', toastTable: 'pg_toast_16485', toastSize: '892 MB', deadPct: 4.2 },
        { table: 'audit_log', toastTable: 'pg_toast_16512', toastSize: '345 MB', deadPct: 1.8 },
        { table: 'notifications', toastTable: 'pg_toast_16538', toastSize: '128 MB', deadPct: 0.5 },
    ]],
    [/\/api\/tables\/temp/, () => [
        { app: 'web-api', user: 'app_user', pid: 10234, size: '24 MB', age_sec: 180 },
        { app: 'analytics-worker', user: 'analytics_user', pid: 10567, size: '156 MB', age_sec: 3600 },
        { app: 'migration-tool', user: 'admin', pid: 10890, size: '8 MB', age_sec: 45 },
    ]],
    [/\/api\/tables\/dependencies/, () => [
        { name: 'orders', refsTo: ['users', 'products'], refsBy: ['order_items', 'payments', 'shipments'] },
        { name: 'users', refsTo: [], refsBy: ['orders', 'sessions', 'audit_log', 'notifications'] },
        { name: 'products', refsTo: ['categories'], refsBy: ['orders', 'inventory', 'reviews'] },
        { name: 'payments', refsTo: ['orders'], refsBy: ['refunds'] },
        { name: 'sessions', refsTo: ['users'], refsBy: [] },
        { name: 'events', refsTo: ['users'], refsBy: [] },
    ]],
    [/\/api\/tables\/indexes/, () => Array.from({ length: 10 }, (_, i) => ({
        name: pick(['idx_users_email', 'idx_orders_created_at', 'idx_orders_user_id', 'idx_events_type_created', 'idx_sessions_token', 'idx_products_sku', 'idx_payments_order_id', 'idx_audit_timestamp', 'pk_users', 'pk_orders']),
        schema: 'public',
        tableName: pick(['users', 'orders', 'events', 'sessions', 'products', 'payments']),
        scans: Math.floor(rand(0, 80000)),
        sizeBytes: Math.floor(rand(500000, 200000000)),
        size: `${rand(0.5, 190)} MB`,
        type: pick(['btree', 'btree', 'btree', 'hash', 'gin']),
        definition: pick(['CREATE INDEX idx ON users USING btree (email)', 'CREATE INDEX idx ON orders USING btree (created_at DESC)', 'CREATE UNIQUE INDEX pk ON users USING btree (id)']),
        isPrimary: i < 2,
        isUnique: i < 3,
    }))],
    [/\/api\/tables\/sizes/, () => [
        { name: 'events', schema: 'public', heapBytes: 2684354560, indexBytes: 536870912, toastBytes: 935329792, bloatPct: 8.2 },
        { name: 'orders', schema: 'public', heapBytes: 1073741824, indexBytes: 268435456, toastBytes: 0, bloatPct: 5.1 },
        { name: 'users', schema: 'public', heapBytes: 536870912, indexBytes: 134217728, toastBytes: 0, bloatPct: 2.3 },
        { name: 'sessions', schema: 'public', heapBytes: 268435456, indexBytes: 67108864, toastBytes: 0, bloatPct: 12.5 },
        { name: 'audit_log', schema: 'public', heapBytes: 805306368, indexBytes: 201326592, toastBytes: 361758720, bloatPct: 3.7 },
        { name: 'products', schema: 'public', heapBytes: 134217728, indexBytes: 33554432, toastBytes: 0, bloatPct: 1.1 },
        { name: 'notifications', schema: 'public', heapBytes: 402653184, indexBytes: 100663296, toastBytes: 134217728, bloatPct: 6.8 },
    ]],
    [/\/api\/tables\/queries/, () => [
        { query: 'SELECT * FROM users WHERE email = $1', calls: 245000, meanMs: 0.8 },
        { query: 'SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = $1', calls: 89000, meanMs: 12.4 },
        { query: 'INSERT INTO events (type, user_id, payload) VALUES ($1, $2, $3)', calls: 567000, meanMs: 1.2 },
        { query: 'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', calls: 34000, meanMs: 3.8 },
        { query: 'DELETE FROM sessions WHERE expires_at < NOW()', calls: 8900, meanMs: 45.2 },
        { query: 'SELECT count(*) FROM events WHERE type = $1 AND created_at > $2', calls: 12000, meanMs: 280.5 },
    ]],
    [/\/api\/tables\/locks/, () => [
        { pid: 10234, lockType: 'relation', mode: 'AccessShareLock', granted: true, blocked: false, waiting: false, relation: 'users', query: 'SELECT * FROM users WHERE id = $1' },
        { pid: 10567, lockType: 'relation', mode: 'RowExclusiveLock', granted: true, blocked: false, waiting: false, relation: 'orders', query: 'UPDATE orders SET status = $1' },
        { pid: 10890, lockType: 'transactionid', mode: 'ShareLock', granted: false, blocked: true, waiting: true, relation: 'orders', query: 'UPDATE orders SET total = $1 WHERE id = $2' },
    ]],
    [/\/api\/tables\/autovacuum/, () => [
        { name: 'events', schema: 'public', lastVacuum: ago(180), lastAutovacuum: ago(45), vacuumCount: 342, analyzeCount: 285 },
        { name: 'orders', schema: 'public', lastVacuum: ago(360), lastAutovacuum: ago(90), vacuumCount: 288, analyzeCount: 240 },
        { name: 'users', schema: 'public', lastVacuum: ago(720), lastAutovacuum: ago(120), vacuumCount: 150, analyzeCount: 200 },
        { name: 'sessions', schema: 'public', lastVacuum: null, lastAutovacuum: ago(30), vacuumCount: 500, analyzeCount: 480 },
        { name: 'audit_log', schema: 'public', lastVacuum: ago(1440), lastAutovacuum: ago(60), vacuumCount: 120, analyzeCount: 100 },
        { name: 'notifications', schema: 'public', lastVacuum: null, lastAutovacuum: ago(240), vacuumCount: 85, analyzeCount: 90 },
    ]],
    [/\/api\/tables\/connections/, () => [
        { appName: 'web-api', useName: 'app_user', datName: 'vigil_prod', state: 'active', count: 18 },
        { appName: 'worker', useName: 'app_user', datName: 'vigil_prod', state: 'idle', count: 12 },
        { appName: 'cron', useName: 'app_user', datName: 'vigil_prod', state: 'idle', count: 3 },
        { appName: 'analytics-worker', useName: 'analytics_user', datName: 'vigil_analytics', state: 'active', count: 5 },
        { appName: 'admin-panel', useName: 'admin', datName: 'vigil_prod', state: 'idle', count: 2 },
    ]],
    [/\/api\/table-stats/, () => Array.from({ length: 8 }, () => ({
        schemaname: 'public', relname: pick(['users', 'orders', 'products', 'events', 'sessions']),
        n_live_tup: Math.floor(rand(1000, 500000)), n_dead_tup: Math.floor(rand(0, 50000)),
        seq_scan: Math.floor(rand(0, 200)), idx_scan: Math.floor(rand(1000, 100000)),
        total_size: `${rand(10, 2800)} MB`,
    }))],
    [/\/api\/table-sizes/, () => Array.from({ length: 8 }, () => ({
        schemaname: 'public', tablename: pick(['users', 'orders', 'products', 'events', 'sessions']),
        total_size: `${rand(10, 2800)} MB`, table_size: `${rand(8, 2400)} MB`, index_size: `${rand(2, 400)} MB`,
        row_count: Math.floor(rand(1000, 15000000)),
    }))],
    [/\/api\/table-indexes/, () => Array.from({ length: 6 }, (_, i) => ({
        schemaname: 'public', tablename: pick(['users', 'orders']),
        indexname: `idx_${i}`, idx_scan: Math.floor(rand(0, 50000)), size: `${rand(1, 200)} MB`,
    }))],
    [/\/api\/tables/, () => Array.from({ length: 8 }, () => ({
        schemaname: 'public', tablename: pick(['users', 'orders', 'products', 'events', 'sessions']),
        total_size: `${rand(10, 2800)} MB`, row_count: Math.floor(rand(1000, 15000000)),
    }))],

    // ── Replication (object) ─────────────────────────────────────────────────
    [/\/api\/replication\/status/, () => ({
        replicas: [
            { client_addr: '10.0.2.10', state: 'streaming', sent_lsn: '0/3A000148', replay_lsn: '0/39FFFFE0', replay_lag: '00:00:00.150', sync_state: 'async' },
            { client_addr: '10.0.2.11', state: 'streaming', sent_lsn: '0/3A000148', replay_lsn: '0/39FFFF00', replay_lag: '00:00:00.350', sync_state: 'async' },
        ],
        wal: { current_lsn: '0/3A000148', wal_level: 'replica', archive_mode: 'on', wal_rate_mbps: rand(0.5, 8.0) },
        primary: { is_primary: true, pg_version: '16.2' },
    })],
    [/\/api\/replication/, () => ({ replicas: [{ client_addr: '10.0.2.10', state: 'streaming', replay_lag: '00:00:00.150', sync_state: 'async' }] })],

    // ── Vacuum / Maintenance (object) ────────────────────────────────────────
    [/\/api\/vacuum\/dead-tuple-rate/, () => ({
        tables: Array.from({ length: 8 }, () => ({
            relname: pick(['users', 'orders', 'products', 'events', 'sessions', 'audit_log', 'notifications']),
            n_dead_tup: Math.floor(rand(500, 80000)),
            n_live_tup: Math.floor(rand(10000, 600000)),
            dead_pct: rand(0.5, 18),
            last_autovacuum: pick(['2h ago', '45m ago', '6h ago', '1d ago', '12h ago', 'never']),
        })),
    })],
    [/\/api\/maintenance\/vacuum-stats/, () => ({
        tables: Array.from({ length: 10 }, (_, i) => ({
            schemaname: 'public', relname: pick(['users', 'orders', 'products', 'events', 'sessions']),
            n_live_tup: Math.floor(rand(1000, 500000)), n_dead_tup: Math.floor(rand(0, 50000)),
            dead_pct: rand(0, 25), dead_ratio: rand(0, 25),
            last_vacuum: i < 7 ? ago(rand(60, 10080)) : null,
            last_autovacuum: i < 8 ? ago(rand(30, 4320)) : null, last_analyze: ago(rand(60, 7200)),
        })),
        workers: [
            { table_name: 'events', datname: 'vigil_prod', phase: 'scanning heap', heap_blks_total: 50000, heap_blks_scanned: 23000 },
        ],
        settings: [
            { name: 'autovacuum', setting: 'on' },
            { name: 'autovacuum_vacuum_cost_delay', setting: '20ms' },
            { name: 'autovacuum_vacuum_cost_limit', setting: '200' },
            { name: 'autovacuum_naptime', setting: '60s' },
            { name: 'autovacuum_vacuum_threshold', setting: '50' },
            { name: 'autovacuum_vacuum_scale_factor', setting: '0.2' },
        ],
    })],
    [/\/api\/maintenance\/vacuum/, () => ({ success: true, message: 'VACUUM ANALYZE completed' })],
    [/\/api\/maintenance/, () => ({ tables: Array.from({ length: 8 }, () => ({ schemaname: 'public', relname: pick(['users', 'orders']), n_dead_tup: Math.floor(rand(0, 50000)), last_autovacuum: ago(rand(30, 4320)) })) })],

    // ── Backup (object) ──────────────────────────────────────────────────────
    [/\/api\/backup\/status/, () => ({
        backups: [
            { id: 'bk-001', type: 'full', status: 'completed', size: '2.1 GB', started_at: ago(180), completed_at: ago(165), duration: '15m 22s' },
            { id: 'bk-002', type: 'incremental', status: 'completed', size: '145 MB', started_at: ago(60), completed_at: ago(57), duration: '3m 08s' },
        ],
        schedule: { full: 'Daily at 02:00 UTC', incremental: 'Every 6 hours', retention: '30 days' },
        pitr: { enabled: true, oldest_available: ago(43200), wal_archiving: 'active' },
    })],
    [/\/api\/backup/, () => ({ backups: [{ id: 'bk-001', type: 'full', status: 'completed', size: '2.1 GB', started_at: ago(180) }] })],

    // ── Checkpoint (object) ──────────────────────────────────────────────────
    [/\/api\/checkpoint\/stats/, () => ({
        checkpoints_timed: 288, checkpoints_req: 5, checkpoint_write_time: 45230.5, checkpoint_sync_time: 1230.2,
        buffers_checkpoint: 125000, buffers_clean: 8500, buffers_backend: 3200, maxwritten_clean: 0, stats_reset: ago(43200),
    })],
    [/\/api\/checkpoint/, () => ({ checkpoints_timed: 288, checkpoints_req: 5 })],

    // ── Capacity ─────────────────────────────────────────────────────────────
    [/\/api\/capacity/, () => ({
        current: { db_size: '4.2 GB', tables_size: '3.1 GB', indexes_size: '1.1 GB', connections_used: 45, connections_max: 200 },
        growth: Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10), size_gb: +(3.0 + i * 0.04).toFixed(2) })),
        forecast: { days_to_80_pct: 142, growth_rate_gb_day: 0.042 },
    })],

    // ── Security ─────────────────────────────────────────────────────────────
    [/\/api\/security\/superuser-activity/, () => ({
        active_sessions: Array.from({ length: 3 }, (_, i) => ({
            pid: 10100 + i, usename: 'postgres', client_addr: '10.0.1.5', state: pick(['active', 'idle']),
            query: pick(['SELECT 1', 'VACUUM ANALYZE']), backend_start: ago(rand(60, 1440)),
        })),
        superuser_roles: [{ rolname: 'postgres', rolsuper: true }],
    })],
    [/\/api\/security/, () => ({
        roles: [{ rolname: 'app_user', rolsuper: false, rolconnlimit: 50 }, { rolname: 'admin', rolsuper: true, rolconnlimit: -1 }],
        ssl: { total: 45, ssl_enabled: 42, percentage: 93.3 },
    })],

    // ── Log Patterns (object) ────────────────────────────────────────────────
    [/\/api\/log-patterns\/summary/, () => ({
        lockWaits: [
            { blocked_pid: 10234, blocked_user: 'app_user', blocked_query: 'UPDATE orders SET status = $1 WHERE id = $2', blocking_pid: 10567, blocking_user: 'admin', wait_sec: '12.4' },
            { blocked_pid: 10890, blocked_user: 'app_user', blocked_query: 'DELETE FROM sessions WHERE expires_at < NOW()', blocking_pid: 10234, blocking_user: 'app_user', wait_sec: '5.8' },
            { blocked_pid: 11023, blocked_user: 'analytics_user', blocked_query: 'SELECT count(*) FROM events WHERE type = $1', blocking_pid: 10567, blocking_user: 'admin', wait_sec: '3.2' },
        ],
        waitEvents: [
            { wait_event_type: 'Lock', wait_event: 'relation', count: '18' },
            { wait_event_type: 'Lock', wait_event: 'transactionid', count: '7' },
            { wait_event_type: 'IO', wait_event: 'DataFileRead', count: '45' },
            { wait_event_type: 'IO', wait_event: 'WALWrite', count: '12' },
            { wait_event_type: 'Client', wait_event: 'ClientRead', count: '156' },
            { wait_event_type: 'LWLock', wait_event: 'buffer_content', count: '8' },
            { wait_event_type: 'LWLock', wait_event: 'WALInsertLock', count: '3' },
            { wait_event_type: 'Activity', wait_event: 'LogicalLauncherMain', count: '2' },
        ],
        slowQueries: [
            { query_preview: 'SELECT o.*, u.name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.created_at > $1 ORDER BY o.created_at DESC', calls: 12450, mean_ms: '245.8', max_ms: '4820.3', stddev_ms: '189.2', pct_total: '18.4' },
            { query_preview: 'SELECT count(*) FROM events WHERE type = $1 AND created_at BETWEEN $2 AND $3 GROUP BY date_trunc($4, created_at)', calls: 3200, mean_ms: '890.5', max_ms: '12500.0', stddev_ms: '1250.8', pct_total: '12.1' },
            { query_preview: 'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2 AND warehouse_id = $3', calls: 45000, mean_ms: '15.2', max_ms: '2340.5', stddev_ms: '85.4', pct_total: '8.7' },
            { query_preview: 'DELETE FROM sessions WHERE expires_at < NOW() - interval $1', calls: 8900, mean_ms: '52.3', max_ms: '3400.0', stddev_ms: '245.1', pct_total: '6.2' },
            { query_preview: 'INSERT INTO audit_log (user_id, action, details, created_at) VALUES ($1, $2, $3, NOW())', calls: 156000, mean_ms: '3.8', max_ms: '890.2', stddev_ms: '28.5', pct_total: '4.5' },
            { query_preview: 'SELECT p.*, array_agg(c.name) AS categories FROM products p JOIN product_categories pc ON p.id = pc.product_id JOIN categories c ON pc.category_id = c.id GROUP BY p.id', calls: 5600, mean_ms: '125.4', max_ms: '1890.0', stddev_ms: '95.2', pct_total: '3.8' },
        ],
        dbActivity: [
            { datname: 'vigil_prod', numbackends: 42, cache_hit_pct: '97.8', rollback_pct: '0.3', xact_commit: '4562000', temp_files: '12', deadlocks: '3' },
            { datname: 'vigil_analytics', numbackends: 8, cache_hit_pct: '94.2', rollback_pct: '1.1', xact_commit: '890000', temp_files: '45', deadlocks: '0' },
            { datname: 'postgres', numbackends: 2, cache_hit_pct: '99.9', rollback_pct: '0.0', xact_commit: '12000', temp_files: '0', deadlocks: '0' },
        ],
    })],
    [/\/api\/log-patterns/, () => ({
        lockWaits: [], waitEvents: [], slowQueries: [], dbActivity: [],
    })],

    // ── CloudWatch (datapoints with t/v keys) ──────────────────────────────
    [/\/api\/cloudwatch\/metrics/, () => ({
        datapoints: Array.from({ length: 60 }, (_, i) => ({
            t: new Date(Date.now() - (59 - i) * 60000).toISOString(),
            v: rand(5, 95),
        })),
    })],
    [/\/api\/cloudwatch/, () => ({
        metrics: {
            CPUUtilization: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(15, 65) })),
            FreeableMemory: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(2000, 6000) })),
            ReadIOPS: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(100, 2000) })),
        },
        status: 'available', instance: 'db.r6g.xlarge',
    })],

    // ── Tasks (array — DBATaskSchedulerTab) ──────────────────────────────────
    [/\/api\/tasks\/reset/, () => ({ success: true, message: 'All tasks reset to pending' })],
    [/\/api\/tasks\/[^/]+$/, () => ({ success: true, message: 'Task updated' })],
    [/\/api\/tasks$/, () => ([
        { id: 'task-1', title: 'Run VACUUM ANALYZE on all tables', category: 'Daily', priority: 'high', recurrence: 'daily', done: true, assignee: 'dba_admin', dueDate: ago(-1440), notes: 'Essential for maintaining query performance after heavy writes' },
        { id: 'task-2', title: 'Review and terminate idle connections', category: 'Daily', priority: 'medium', recurrence: 'daily', done: false, assignee: 'dba_admin', dueDate: ago(-60), notes: 'Kill connections idle for more than 30 minutes' },
        { id: 'task-3', title: 'Check replication lag across replicas', category: 'Daily', priority: 'high', recurrence: 'daily', done: true, assignee: 'dba_admin', dueDate: ago(-720), notes: 'Ensure replicas are within 1s lag tolerance' },
        { id: 'task-4', title: 'Reindex bloated indexes (>20% bloat)', category: 'Weekly', priority: 'medium', recurrence: 'weekly', done: false, assignee: 'dba_admin', dueDate: ago(-4320), notes: 'REINDEX CONCURRENTLY to avoid downtime' },
        { id: 'task-5', title: 'Review pg_stat_statements for new slow queries', category: 'Weekly', priority: 'high', recurrence: 'weekly', done: false, assignee: 'dba_senior', dueDate: ago(-2880), notes: 'Focus on queries > 500ms mean execution time' },
        { id: 'task-6', title: 'Validate backup integrity and test restore', category: 'Weekly', priority: 'critical', recurrence: 'weekly', done: true, assignee: 'dba_senior', dueDate: ago(-10080), notes: 'Full restore test on staging environment' },
        { id: 'task-7', title: 'Partition maintenance — detach old partitions', category: 'Monthly', priority: 'medium', recurrence: 'monthly', done: false, assignee: 'dba_admin', dueDate: ago(-20160), notes: 'Archive partitions older than 12 months for events table' },
        { id: 'task-8', title: 'Review and rotate pg_hba.conf entries', category: 'Monthly', priority: 'low', recurrence: 'monthly', done: false, assignee: 'dba_senior', dueDate: ago(-43200), notes: 'Audit access rules and remove stale entries' },
        { id: 'task-9', title: 'Investigate deadlock on orders table', category: 'Ad-hoc', priority: 'critical', recurrence: 'daily', done: false, assignee: 'dba_admin', dueDate: ago(-120), notes: 'Deadlock detected between order placement and inventory update transactions' },
        { id: 'task-10', title: 'Upgrade pg_stat_statements extension', category: 'Ad-hoc', priority: 'low', recurrence: 'monthly', done: false, assignee: 'dba_senior', dueDate: ago(-7200), notes: 'New version 1.11 available with better deallocation tracking' },
    ])],

    // ── Schema ───────────────────────────────────────────────────────────────
    [/\/api\/schema/, () => ({
        versions: [
            { version: '20240301_001', name: 'Add events partitioning', applied_at: ago(43200), status: 'applied', duration: '2.3s' },
            { version: '20240215_002', name: 'Create indexes for orders', applied_at: ago(64800), status: 'applied', duration: '4.1s' },
        ],
        pending: [{ version: '20240315_001', name: 'Add user preferences table', status: 'pending' }],
    })],

    // ── Regression ───────────────────────────────────────────────────────────
    [/\/api\/regression\/baselines/, () => Array.from({ length: 5 }, (_, i) => ({
        id: `bl-${i + 1}`, query: pick(['SELECT * FROM orders WHERE id = $1', 'SELECT count(*) FROM events']),
        fingerprint: `fp-${1000 + i}`, cost: rand(10, 5000), label: `baseline-${i + 1}`, captured_at: ago(rand(1440, 43200)),
    }))],
    [/\/api\/regression\/compare/, () => ({ regression: false, costChange: rand(-20, 20), status: 'stable' })],
    [/\/api\/regression\/capture/, () => ({ cost: rand(10, 500), fingerprint: `fp-${Date.now()}` })],

    // ── SQL Console ──────────────────────────────────────────────────────────
    [/\/api\/query$/, () => ({
        fields: [{ name: 'id' }, { name: 'name' }, { name: 'email' }, { name: 'created_at' }],
        rows: [
            { id: 1, name: 'Alice Johnson', email: 'alice@example.com', created_at: ago(43200) },
            { id: 2, name: 'Bob Smith', email: 'bob@example.com', created_at: ago(21600) },
            { id: 3, name: 'Carol White', email: 'carol@example.com', created_at: ago(10080) },
        ],
        rowCount: 3,
    })],

    // ── Admin ────────────────────────────────────────────────────────────────
    [/\/api\/admin\/hba/, () => ([
        { type: 'host', database: 'all', user: 'all', address: '10.0.0.0/8', method: 'scram-sha-256' },
        { type: 'local', database: 'all', user: 'postgres', address: '', method: 'peer' },
    ])],
    [/\/api\/admin\/settings/, () => ([
        { name: 'max_connections', setting: '200', unit: null, category: 'Connections', context: 'postmaster', vartype: 'integer' },
        { name: 'shared_buffers', setting: '4GB', unit: null, category: 'Memory', context: 'postmaster', vartype: 'string' },
        { name: 'effective_cache_size', setting: '12GB', unit: null, category: 'Planner', context: 'user', vartype: 'string' },
        { name: 'work_mem', setting: '64MB', unit: null, category: 'Memory', context: 'user', vartype: 'string' },
        { name: 'wal_level', setting: 'replica', unit: null, category: 'WAL', context: 'postmaster', vartype: 'enum' },
    ])],
    [/\/api\/admin\/extensions/, () => ([
        { name: 'pg_stat_statements', installed_version: '1.10', default_version: '1.10', comment: 'Track planning and execution stats' },
        { name: 'pgcrypto', installed_version: '1.3', default_version: '1.3', comment: 'Cryptographic functions' },
        { name: 'uuid-ossp', installed_version: '1.1', default_version: '1.1', comment: 'Generate UUIDs' },
    ])],
    [/\/api\/admin\/cache\/clear/, () => ({ success: true })],
    [/\/api\/admin\/cache\/stats/, () => ({ size: 1234, hits: 45000, misses: 2300, hit_ratio: 95.1, entries: 156 })],
    [/\/api\/admin\/connections\/kill/, () => ({ success: true })],
    [/\/api\/admin\/connections/, () => Array.from({ length: 15 }, (_, i) => ({
        pid: 10000 + i, usename: pick(['app_user', 'admin', 'readonly']),
        application_name: pick(['web-api', 'worker', 'cron']),
        client_addr: `10.0.${Math.floor(rand(1, 5))}.${Math.floor(rand(1, 254))}`,
        state: pick(['active', 'idle', 'idle']),
        query: pick(['SELECT 1', 'COMMIT', 'BEGIN']),
        backend_start: ago(rand(1, 1440)),
    }))],
    [/\/api\/admin\/feedback/, () => ([
        { id: 1, user: 'admin', message: 'Dashboard loading time has improved significantly after the connection pool tuning', rating: 5, timestamp: ago(1440) },
        { id: 2, user: 'dba_admin', message: 'The alert correlation feature saved us 2 hours during the last incident', rating: 4, timestamp: ago(4320) },
        { id: 3, user: 'dev_lead', message: 'Would love to see query plan diff support for comparing before/after optimization', rating: 3, timestamp: ago(10080) },
    ])],
    [/\/api\/admin/, () => ({
        stats: { total_users: 8, active_sessions: 3, uptime_hours: 2184 },
        system: { pg_version: '16.2', os: 'Ubuntu 22.04', cpu_cores: 8, memory_gb: 32 },
    })],

    // ── Repository / AI Chat ─────────────────────────────────────────────────
    [/\/api\/ai\/chat/, () => ({ content: [{ text: 'This is a demo response. In live mode, this connects to an AI assistant.' }] })],
    [/\/api\/repo/, () => ([])],
    [/\/api\/api-queries/, () => ([])],

    // ── Users / Sessions / Audit ─────────────────────────────────────────────
    [/\/api\/users/, () => ([{ id: 'demo-1', username: 'demo', name: 'Demo User', role: 'super_admin', created_at: ago(43200) }])],
    [/\/api\/sessions/, () => ([])],
    [/\/api\/audit/, () => ({ events: [] })],
    [/\/api\/feedback/, () => ({ success: true })],

    // ── Pool ─────────────────────────────────────────────────────────────────
    [/\/api\/pool/, () => ({
        connections: Array.from({ length: 20 }, (_, i) => ({
            pid: 10000 + i, usename: pick(['app_user', 'admin', 'readonly']),
            state: pick(['active', 'idle', 'idle', 'idle in transaction']),
            query: pick(['SELECT 1', 'COMMIT', 'BEGIN']),
            backend_start: ago(rand(1, 1440)),
        })),
        summary: { total: 45, active: 12, idle: 28, idle_in_transaction: 3, waiting: 2, max_connections: 200 },
    })],
    [/\/api\/wal/, () => ({ current_lsn: '0/3A000148', wal_level: 'replica', archive_mode: 'on', wal_rate_mbps: rand(0.5, 8.0) })],

    // ═══════════════════════════════════════════════════════════════════════
    //  GAP FEATURES — OpenTelemetry
    // ═══════════════════════════════════════════════════════════════════════

    [/\/api\/otel\/services$/, () => ({
        services: ['web-api', 'worker-service', 'cron-jobs', 'auth-service'],
    })],
    [/\/api\/otel\/metrics\/names$/, () => ({
        names: ['pg_connections_active', 'pg_query_duration_ms', 'pg_transactions_total', 'pg_cache_hit_ratio', 'pg_rows_fetched', 'pg_deadlocks'],
    })],
    [/\/api\/otel\/metrics\/data/, () => ({
        data: Array.from({ length: 60 }, (_, i) => ({
            timestamp: ago((59 - i) * 5),
            value: rand(5, 95),
        })),
        stats: {
            avg: rand(20, 60),
            min: rand(1, 15),
            max: rand(70, 100),
            p95: rand(80, 98),
            lastIngested: ago(1),
        },
    })],
    [/\/api\/otel\/metrics/, () => ({
        metrics: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(10, 50) })),
        services: ['web-api', 'worker-service'],
        names: ['pg_connections_active', 'pg_query_duration_ms'],
        stats: { total_ingested: 45230, ingestion_rate: 125.4, unique_metrics: 7, services_count: 4 },
    })],
    [/\/api\/otel/, () => ({
        services: ['web-api', 'worker-service'],
        stats: { total_ingested: 45230, ingestion_rate: 125.4, unique_metrics: 7, services_count: 4 },
    })],

    // ═══════════════════════════════════════════════════════════════════════
    //  GAP FEATURES — Kubernetes
    // ═══════════════════════════════════════════════════════════════════════

    [/\/api\/k8s\/health/, () => ({ cluster: 'healthy', primary: 'running', replicas: { total: 2, healthy: 2 }, pgbouncer: 'running' })],
    [/\/api\/k8s\/pod-info/, () => ({
        name: 'postgres-primary-0',
        namespace: 'database',
        node: 'gke-prod-pool-1-abc123',
        containerId: 'docker://a1b2c3d4e5f6',
    })],
    [/\/api\/k8s\/metrics$/, () => ({
        readinessProbe: true,
        livenessProbe: true,
    })],
    [/\/api\/k8s\/connections/, () => ({
        connections: [
            { podName: 'postgres-primary-0', activeConnections: 42, maxConnections: 200, usagePercent: 21 },
            { podName: 'postgres-replica-0', activeConnections: 28, maxConnections: 200, usagePercent: 14 },
            { podName: 'postgres-replica-1', activeConnections: 15, maxConnections: 200, usagePercent: 7.5 },
        ],
    })],
    [/\/api\/k8s\/topology/, () => ({
        primary: 'postgres-primary-0',
        replicas: ['postgres-replica-0', 'postgres-replica-1'],
    })],
    [/\/api\/k8s\/resources/, (_path, qs) => {
        if (qs && qs.includes('history=true')) {
            return {
                history: Array.from({ length: 48 }, (_, i) => ({
                    timestamp: ago((47 - i) * 30),
                    cpuPercent: rand(15, 75),
                    memoryPercent: rand(40, 85),
                })),
            };
        }
        return {
            cpuUsagePercent: rand(20, 65),
            cpuUsage: '480m',
            cpuLimit: '1000m',
            memoryUsagePercent: rand(45, 80),
            memoryUsage: 536870912,
            memoryLimit: 1073741824,
        };
    }],
    [/\/api\/k8s/, () => ({
        metrics: { pods: [{ name: 'postgres-primary-0', status: 'Running', cpu: '250m', memory: '512Mi' }], nodes: [{ name: 'node-1', cpu_pct: 45, memory_pct: 62, status: 'Ready' }] },
        health: { cluster: 'healthy', primary: 'running', replicas: { total: 2, healthy: 2 } },
    })],

    // ═══════════════════════════════════════════════════════════════════════
    //  GAP FEATURES — Status Page
    // ═══════════════════════════════════════════════════════════════════════

    [/\/api\/status\/public/, () => ({
        status: 'operational',
        uptime30d: 99.94,
        lastUpdate: ago(15),
        components: [
            { name: 'PostgreSQL Primary', description: 'Main database cluster', status: 'operational' },
            { name: 'PgBouncer', description: 'Connection pooler', status: 'operational' },
            { name: 'Replication', description: 'Streaming replication to replicas', status: 'operational' },
            { name: 'Backup Service', description: 'Automated backup pipeline', status: 'degraded' },
        ],
    })],
    [/\/api\/status\/incidents\/[^/]+/, () => ({ success: true })],
    [/\/api\/status\/incidents$/, () => ({
        incidents: [
            { id: 'inc-001', title: 'Elevated query latency on primary', description: 'Avg query time exceeded 200ms threshold', status: 'resolved', createdAt: ago(2880), severity: 'degraded' },
            { id: 'inc-002', title: 'Backup service delayed', description: 'Nightly backup took 3x longer than usual', status: 'active', createdAt: ago(120), severity: 'degraded' },
            { id: 'inc-003', title: 'Replica lag spike', description: 'Replication lag exceeded 30s during bulk import', status: 'resolved', createdAt: ago(7200), severity: 'outage' },
        ],
    })],
    [/\/api\/status\/summary/, () => ({ overall_uptime: 99.94, incidents_30d: 3, mttr_minutes: 18 })],
    [/\/api\/status\/uptime/, () => ({
        data: Array.from({ length: 90 }, (_, i) => ({
            date: new Date(Date.now() - (89 - i) * 86400000).toISOString().slice(0, 10),
            uptime: +(99 + Math.random()).toFixed(2),
        })),
    })],
    [/\/api\/status/, () => ({
        status: 'operational',
        components: [{ name: 'PostgreSQL Primary', status: 'operational', uptime: 99.97 }],
    })],

    [/\/api\/ai-query\/analyze/, () => ({ analysis: { has_issues: true }, suggestions: [{ type: 'add_index', description: 'Add index on orders(created_at)', impact: 'high' }], explain_plan: 'Seq Scan on orders' })],
    [/\/api\/ai-query\/suggestions/, () => ([{ query: 'SELECT * FROM orders WHERE created_at > NOW()', issue: 'Sequential scan', suggestion: 'Add index on orders(created_at)', impact: 'high' }])],
    [/\/api\/ai-query\/indexes/, () => ([{ column: 'created_at', type: 'btree', reason: 'Range queries', estimated_improvement: '85%' }])],
    [/\/api\/ai-query\/anti-patterns/, () => ({ patterns: [{ pattern: 'SELECT *', count: 23, severity: 'warning', description: 'Selecting all columns' }] })],
    [/\/api\/ai-query\/report/, () => ({ queries_analyzed: 156, issues_found: 28, estimated_total_improvement: '45%', last_analysis: now() })],
    [/\/api\/ai-query/, () => ({ suggestions: [], report: { queries_analyzed: 0 } })],

    [/\/api\/retention\/policy/, () => ({ metrics_retention_days: 90, logs_retention_days: 30, alerts_retention_days: 365, backups_retention_days: 30, audit_retention_days: 365 })],
    [/\/api\/retention\/stats/, () => ({ total_data_size: '4.2 GB', metrics_size: '1.8 GB', logs_size: '900 MB', oldest_data: ago(129600) })],
    [/\/api\/retention\/growth/, () => Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10), size_mb: Math.floor(3800 + i * 15) }))],
    [/\/api\/retention\/cleanup/, () => ({ success: true, deleted_rows: 15420 })],
    [/\/api\/retention/, () => ({ policy: { metrics_retention_days: 90, logs_retention_days: 30 }, stats: { total_data_size: '4.2 GB' } })],

    // ── Export API (TerraformExportTab uses /api/export/*) ──────────────────
    [/\/api\/export\/bundle/, () => ({ code: 'resource "postgresql_database" "vigil_prod" {\n  name     = "vigil_prod"\n  owner    = "app_user"\n  encoding = "UTF8"\n}\n\nresource "postgresql_role" "app_user" {\n  name             = "app_user"\n  login            = true\n  connection_limit = 50\n}\n\nresource "postgresql_role" "analytics_user" {\n  name             = "analytics_user"\n  login            = true\n  connection_limit = 20\n}\n\nresource "postgresql_extension" "pg_stat_statements" {\n  name     = "pg_stat_statements"\n  database = postgresql_database.vigil_prod.name\n}' })],
    [/\/api\/export\/alert-rules/, () => ({ code: 'resource "postgresql_alert_rule" "high_connections" {\n  name      = "high_connections"\n  metric    = "active_connections"\n  threshold = 150\n  severity  = "warning"\n}\n\nresource "postgresql_alert_rule" "replication_lag" {\n  name      = "replication_lag"\n  metric    = "replication_lag_bytes"\n  threshold = 104857600\n  severity  = "critical"\n}' })],
    [/\/api\/export\/connections/, () => ({ code: 'resource "postgresql_connection" "prod" {\n  host     = "prod-pg.example.com"\n  port     = 5432\n  database = "vigil_prod"\n  username = "app_user"\n  sslmode  = "require"\n}' })],
    [/\/api\/export\/retention/, () => ({ code: 'resource "postgresql_retention_policy" "metrics" {\n  type           = "metrics"\n  retention_days = 90\n}\n\nresource "postgresql_retention_policy" "logs" {\n  type           = "logs"\n  retention_days = 30\n}' })],
    [/\/api\/export\/users/, () => ({ code: 'resource "postgresql_role" "app_user" {\n  name             = "app_user"\n  login            = true\n  connection_limit = 50\n  roles            = ["pg_read_all_data"]\n}\n\nresource "postgresql_role" "readonly" {\n  name  = "readonly"\n  login = true\n  roles = ["pg_read_all_data"]\n}' })],
    [/\/api\/export/, () => ({ code: 'resource "postgresql_database" "vigil_prod" {\n  name  = "vigil_prod"\n  owner = "app_user"\n}' })],

    [/\/api\/terraform\/export\/json/, () => ({ roles: [{ name: 'app_user', login: true }], databases: [{ name: 'vigil', owner: 'app_user' }], extensions: ['pg_stat_statements'] })],
    [/\/api\/terraform\/export/, () => 'resource "postgresql_role" "app_user" {\n  name     = "app_user"\n  login    = true\n  connection_limit = 50\n}'],
    [/\/api\/terraform/, () => ({ export: 'resource "postgresql_database" "vigil" {\n  name = "vigil"\n}' })],

    [/\/api\/custom-dashboard/, () => ({ dashboards: [{ id: 'dash-1', name: 'Production Overview', widgets: 6, created_at: ago(10080) }], available_metrics: ['connections.active', 'cache.hit_ratio', 'tps.commit'] })],

    // ── Metrics API (used by CustomDashboardTab) ────────────────────────────
    [/\/api\/metrics\/names/, () => ({
        names: [
            'connections.active', 'connections.idle', 'connections.total',
            'cache.hit_ratio', 'cache.block_reads', 'cache.block_hits',
            'tps.commit', 'tps.rollback', 'tps.total',
            'query.avg_time_ms', 'query.slow_count',
            'disk.usage_gb', 'disk.read_iops', 'disk.write_iops',
            'replication.lag_bytes', 'replication.lag_seconds',
            'locks.total', 'locks.waiting', 'deadlocks.count',
            'temp_files.count', 'temp_files.size_mb',
        ],
    })],
    [/\/api\/metrics\/data/, () =>
        Array.from({ length: 60 }, (_, i) => ({
            timestamp: ago((59 - i) * 5),
            value: rand(10, 90),
        }))
    ],

    [/\/api\/optimizer/, () => ({ slow_queries: Array.from({ length: 5 }, (_, i) => ({ queryid: `sq-${i + 1}`, query: 'SELECT * FROM orders WHERE status = $1', mean_exec_time: rand(50, 5000), calls: Math.floor(rand(10, 5000)) })) })],
    [/\/api\/query-plan/, () => ({ plan: 'Seq Scan on orders (cost=0.00..45230.00)' })],
    [/\/api\/slow-queries/, () => Array.from({ length: 5 }, (_, i) => ({ queryid: `sq-${i + 1}`, query: 'SELECT * FROM orders', mean_exec_time: rand(50, 5000), calls: Math.floor(rand(10, 5000)) }))],
    [/\/api\/query-stats/, () => ({ available: true, slowQueries: [] })],

    [/\/api\/settings/, () => ([
        { name: 'max_connections', setting: '200', unit: null, category: 'Connections', context: 'postmaster' },
        { name: 'shared_buffers', setting: '4GB', unit: null, category: 'Memory', context: 'postmaster' },
        { name: 'effective_cache_size', setting: '12GB', unit: null, category: 'Planner', context: 'user' },
        { name: 'work_mem', setting: '64MB', unit: null, category: 'Memory', context: 'user' },
    ])],
    [/\/api\/migrations/, () => ({
        versions: [
            { version: '20240301_001', name: 'Add events partitioning', applied_at: ago(43200), status: 'applied', duration: '2.3s' },
            { version: '20240215_002', name: 'Create indexes for orders', applied_at: ago(64800), status: 'applied', duration: '4.1s' },
            { version: '20240201_001', name: 'Add user preferences table', applied_at: ago(86400), status: 'applied', duration: '0.8s' },
        ],
        pending: [
            { version: '20240320_001', name: 'Add notifications partitioning', status: 'pending' },
            { version: '20240322_001', name: 'Create audit_log archive table', status: 'pending' },
        ],
    })],
    [/\/api\/roles/, () => ([
        { rolname: 'postgres', rolsuper: true, rolcreaterole: true, rolcreatedb: true, rolconnlimit: -1 },
        { rolname: 'app_user', rolsuper: false, rolcreaterole: false, rolcreatedb: false, rolconnlimit: 50 },
        { rolname: 'analytics_user', rolsuper: false, rolcreaterole: false, rolcreatedb: false, rolconnlimit: 20 },
        { rolname: 'readonly', rolsuper: false, rolcreaterole: false, rolcreatedb: false, rolconnlimit: 10 },
        { rolname: 'admin', rolsuper: true, rolcreaterole: true, rolcreatedb: true, rolconnlimit: -1 },
    ])],
    [/\/api\/logs/, () => ({
        patterns: [
            { pattern: 'ERROR: deadlock detected', count: 12, severity: 'error', first_seen: ago(1440), last_seen: ago(15) },
            { pattern: 'WARNING: archive command failed with exit code 1', count: 3, severity: 'warning', first_seen: ago(720), last_seen: ago(180) },
            { pattern: 'LOG: automatic vacuum of table "vigil_prod.public.events"', count: 288, severity: 'info', first_seen: ago(1440), last_seen: ago(5) },
            { pattern: 'ERROR: canceling statement due to statement timeout', count: 7, severity: 'error', first_seen: ago(960), last_seen: ago(45) },
            { pattern: 'WARNING: could not send data to client: Broken pipe', count: 22, severity: 'warning', first_seen: ago(2880), last_seen: ago(30) },
        ],
        total_entries: 15230, error_count: 40, warning_count: 85,
    })],
    [/\/api\/scheduler/, () => ([
        { id: 'sched-1', name: 'VACUUM ANALYZE (all tables)', cron: '0 2 * * *', last_run: ago(180), next_run: ago(-1260), status: 'success', enabled: true },
        { id: 'sched-2', name: 'Reindex bloated indexes', cron: '0 3 * * 0', last_run: ago(7200), next_run: ago(-2880), status: 'success', enabled: true },
        { id: 'sched-3', name: 'Cleanup expired sessions', cron: '*/30 * * * *', last_run: ago(15), next_run: ago(-15), status: 'success', enabled: true },
        { id: 'sched-4', name: 'Refresh materialized views', cron: '0 4 * * *', last_run: ago(240), next_run: ago(-1200), status: 'success', enabled: true },
        { id: 'sched-5', name: 'Archive old partitions', cron: '0 1 1 * *', last_run: ago(20160), next_run: ago(-23040), status: 'success', enabled: false },
    ])],

    [/\/health/, () => ({ status: 'ok' })],
    [/\/api\/auth/, () => ({ success: true })],
    [/\/api\/metrics/, () => ({ tps: rand(120, 850), connections: Math.floor(rand(20, 80)), cache_hit: rand(95, 99.9) })],
];

/**
 * Look up demo data for a given API path.
 */
export function getDemoData(path) {
    const [cleanPath, queryString] = path.split('?');
    for (const [regex, generator] of DEMO_ROUTES) {
        if (regex.test(cleanPath)) {
            return generator(cleanPath, queryString || '');
        }
    }
    console.warn(`[DEMO] No mock data for: ${cleanPath}`);
    return {};
}

/**
 * Check if demo mode is currently active.
 */
export function isDemoMode() {
    try { return localStorage.getItem('vigil_demo_mode') === 'true'; }
    catch { return false; }
}
