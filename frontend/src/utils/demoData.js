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
        correlations: [
            { alert_group: 'Connection Spike + Slow Queries', alerts: ['Connection usage 85%', 'Query > 5min'], confidence: 0.92, root_cause: 'Long-running transaction holding locks' },
            { alert_group: 'Replication Lag + Disk IO', alerts: ['Replication lag 150MB', 'High write IOPS'], confidence: 0.78, root_cause: 'High write workload saturating IO' },
        ],
    })],
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

    // ── Tables ───────────────────────────────────────────────────────────────
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
    [/\/api\/maintenance\/vacuum-stats/, () => ({
        tables: Array.from({ length: 10 }, (_, i) => ({
            schemaname: 'public', relname: pick(['users', 'orders', 'products', 'events', 'sessions']),
            n_live_tup: Math.floor(rand(1000, 500000)), n_dead_tup: Math.floor(rand(0, 50000)),
            dead_ratio: rand(0, 25), last_vacuum: i < 7 ? ago(rand(60, 10080)) : null,
            last_autovacuum: i < 8 ? ago(rand(30, 4320)) : null, last_analyze: ago(rand(60, 7200)),
        })),
        settings: { autovacuum: 'on', vacuum_cost_delay: 20, vacuum_cost_limit: 200 },
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
        patterns: [
            { pattern: 'ERROR: deadlock detected', count: 12, severity: 'error', first_seen: ago(1440), last_seen: ago(15) },
            { pattern: 'WARNING: archive command failed', count: 3, severity: 'warning', first_seen: ago(720), last_seen: ago(180) },
            { pattern: 'LOG: checkpoint starting', count: 288, severity: 'info', first_seen: ago(1440), last_seen: ago(5) },
        ],
        total_entries: 15230, error_count: 40, warning_count: 85,
    })],
    [/\/api\/log-patterns/, () => ({ patterns: [{ pattern: 'ERROR: deadlock detected', count: 12, severity: 'error' }] })],

    // ── CloudWatch (object with metrics) ─────────────────────────────────────
    [/\/api\/cloudwatch/, () => ({
        metrics: {
            CPUUtilization: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(15, 65) })),
            FreeableMemory: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(2000, 6000) })),
            ReadIOPS: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(100, 2000) })),
        },
        status: 'available', instance: 'db.r6g.xlarge',
    })],

    // ── Tasks (array) ────────────────────────────────────────────────────────
    [/\/api\/tasks/, () => ([
        { id: 'task-1', name: 'Daily VACUUM ANALYZE', schedule: '0 2 * * *', last_run: ago(180), next_run: ago(-1260), status: 'success', duration: '12m 30s', enabled: true },
        { id: 'task-2', name: 'Reindex concurrently', schedule: '0 3 * * 0', last_run: ago(7200), next_run: ago(-2880), status: 'success', duration: '45m 12s', enabled: true },
        { id: 'task-3', name: 'Cleanup expired sessions', schedule: '*/30 * * * *', last_run: ago(15), next_run: ago(-15), status: 'success', duration: '8s', enabled: true },
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
    [/\/api\/admin\/feedback/, () => ([])],
    [/\/api\/admin/, () => ({})],

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
    //  GAP FEATURES
    // ═══════════════════════════════════════════════════════════════════════

    [/\/api\/otel\/services/, () => ['web-api', 'worker-service', 'cron-jobs', 'auth-service']],
    [/\/api\/otel\/metrics\/names/, () => ['pg_connections_active', 'pg_query_duration_ms', 'pg_transactions_total', 'pg_cache_hit_ratio']],
    [/\/api\/otel\/metrics\/[^/]+\/stats/, () => ({ avg: rand(10, 50), min: rand(1, 10), max: rand(50, 100), count: Math.floor(rand(100, 5000)) })],
    [/\/api\/otel\/metrics/, () => ({ metrics: Array.from({ length: 24 }, (_, i) => ({ timestamp: ago((23 - i) * 60), value: rand(10, 50) })), services: ['web-api', 'worker-service'], names: ['pg_connections_active', 'pg_query_duration_ms'], stats: { total_ingested: 45230, ingestion_rate: 125.4, unique_metrics: 7, services_count: 4 } })],
    [/\/api\/otel/, () => ({ services: ['web-api', 'worker-service'], stats: { total_ingested: 45230, ingestion_rate: 125.4, unique_metrics: 7, services_count: 4 } })],

    [/\/api\/k8s\/health/, () => ({ cluster: 'healthy', primary: 'running', replicas: { total: 2, healthy: 2 }, pgbouncer: 'running' })],
    [/\/api\/k8s\/pod-info/, () => ([{ name: 'postgres-primary-0', status: 'Running', cpu: '250m', memory: '512Mi', restarts: 0, node: 'node-1' }])],
    [/\/api\/k8s/, () => ({ metrics: { pods: [{ name: 'postgres-primary-0', status: 'Running', cpu: '250m', memory: '512Mi' }], nodes: [{ name: 'node-1', cpu_pct: 45, memory_pct: 62, status: 'Ready' }] }, health: { cluster: 'healthy', primary: 'running', replicas: { total: 2, healthy: 2 } } })],

    [/\/api\/status\/public/, () => ({ status: 'operational', services: [{ name: 'PostgreSQL Primary', status: 'operational', uptime: 99.97 }, { name: 'PgBouncer', status: 'operational', uptime: 99.99 }] })],
    [/\/api\/status\/incidents/, () => ([{ id: 'inc-001', title: 'Elevated query latency', status: 'monitoring', severity: 'minor', created_at: ago(120) }])],
    [/\/api\/status\/summary/, () => ({ overall_uptime: 99.94, incidents_30d: 3, mttr_minutes: 18 })],
    [/\/api\/status\/uptime/, () => Array.from({ length: 90 }, (_, i) => ({ date: new Date(Date.now() - (89 - i) * 86400000).toISOString().slice(0, 10), uptime_pct: +(99 + Math.random()).toFixed(2) }))],
    [/\/api\/status/, () => ({ status: 'operational', services: [{ name: 'PostgreSQL Primary', status: 'operational', uptime: 99.97 }] })],

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

    [/\/api\/terraform\/export\/json/, () => ({ roles: [{ name: 'app_user', login: true }], databases: [{ name: 'vigil', owner: 'app_user' }], extensions: ['pg_stat_statements'] })],
    [/\/api\/terraform\/export/, () => 'resource "postgresql_role" "app_user" {\n  name     = "app_user"\n  login    = true\n  connection_limit = 50\n}'],
    [/\/api\/terraform/, () => ({ export: 'resource "postgresql_database" "vigil" {\n  name = "vigil"\n}' })],

    [/\/api\/custom-dashboard/, () => ({ dashboards: [{ id: 'dash-1', name: 'Production Overview', widgets: 6, created_at: ago(10080) }], available_metrics: ['connections.active', 'cache.hit_ratio', 'tps.commit'] })],

    [/\/api\/optimizer/, () => ({ slow_queries: Array.from({ length: 5 }, (_, i) => ({ queryid: `sq-${i + 1}`, query: 'SELECT * FROM orders WHERE status = $1', mean_exec_time: rand(50, 5000), calls: Math.floor(rand(10, 5000)) })) })],
    [/\/api\/query-plan/, () => ({ plan: 'Seq Scan on orders (cost=0.00..45230.00)' })],
    [/\/api\/slow-queries/, () => Array.from({ length: 5 }, (_, i) => ({ queryid: `sq-${i + 1}`, query: 'SELECT * FROM orders', mean_exec_time: rand(50, 5000), calls: Math.floor(rand(10, 5000)) }))],
    [/\/api\/query-stats/, () => ({ available: true, slowQueries: [] })],

    [/\/api\/settings/, () => ([{ name: 'max_connections', setting: '200' }, { name: 'shared_buffers', setting: '4GB' }])],
    [/\/api\/migrations/, () => ({ versions: [], pending: [] })],
    [/\/api\/roles/, () => ([{ rolname: 'app_user', rolsuper: false }, { rolname: 'admin', rolsuper: true }])],
    [/\/api\/logs/, () => ({ patterns: [] })],
    [/\/api\/scheduler/, () => ([])],

    [/\/health/, () => ({ status: 'ok' })],
    [/\/api\/auth/, () => ({ success: true })],
    [/\/api\/metrics/, () => ({ tps: rand(120, 850), connections: Math.floor(rand(20, 80)), cache_hit: rand(95, 99.9) })],
];

/**
 * Look up demo data for a given API path.
 */
export function getDemoData(path) {
    const cleanPath = path.split('?')[0];
    for (const [regex, generator] of DEMO_ROUTES) {
        if (regex.test(cleanPath)) {
            return generator();
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
