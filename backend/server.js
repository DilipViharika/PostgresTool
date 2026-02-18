import express from 'express';
import cors from 'cors';
import http from 'http';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { WebSocketServer } from 'ws';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import repository routes
import repoRoutes from './Routes/repoRoutes.js';

// Import enhanced alert system
import EnhancedAlertEngine from './enhanced-alerts.js';

// Import email notification service
import EmailNotificationService from './email-notification-service.js';

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const CONFIG = Object.freeze({
    PORT:            Number(process.env.PORT) || 5000,
    JWT_SECRET:      process.env.JWT_SECRET || 'vigil-change-me-in-production',
    JWT_EXPIRES_IN:  process.env.JWT_EXPIRES_IN || '8h',
    CORS_ORIGINS: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://postgres-tool.vercel.app',
        process.env.CORS_ORIGIN,
    ].filter(Boolean),
    SLOW_QUERY_MIN:  Number(process.env.SLOW_QUERY_MINUTES) || 5,
    WS_INTERVAL_MS:  Number(process.env.WS_INTERVAL_MS) || 5000,
    REPOSITORY_PATH: process.env.REPOSITORY_PATH || path.join(__dirname, 'repositories'),
    ALERT_MONITORING_INTERVAL: Number(process.env.ALERT_MONITORING_INTERVAL) || 30000,
    RATE_LIMIT: {
        WINDOW_MS:    60_000,
        MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX) || 300,
    },
    CACHE_TTL: {
        STATS: 10_000, TRAFFIC: 15_000, GROWTH: 30_000, INDEXES: 30_000,
        VACUUM: 30_000, PERFORMANCE: 15_000, CACHE_HIT: 15_000,
        EXTENSIONS: 60_000, SEQUENCES: 30_000, BLOAT: 60_000,
        WAL: 10_000, SETTINGS: 120_000, TABLE_STATS: 30_000, SCHEMAS: 60_000,
    },
    ALERT_THRESHOLDS: {
        CONNECTION_USAGE_PCT: 80,
        LONG_QUERY_SEC: 300,
        DEAD_TUPLE_RATIO: 20,
        REPLICATION_LAG_MB: 100,
        CACHE_HIT_RATIO: 90,
        LOCK_COUNT: 5,
    },
    EMAIL: {
        enabled: process.env.EMAIL_ENABLED === 'true',
        provider: process.env.EMAIL_PROVIDER || 'smtp',
        minSeverity: process.env.EMAIL_MIN_SEVERITY || 'warning',
        recipients: process.env.EMAIL_RECIPIENTS?.split(',').map(e => e.trim()) || [],
        from: process.env.EMAIL_FROM || '"VIGIL Alert System" <alerts@vigil.local>',
        dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:5173',
        databaseName: process.env.PGDATABASE || 'postgres',
        gmail: {
            user: process.env.GMAIL_USER,
            appPassword: process.env.GMAIL_APP_PASSWORD
        },
        sendgrid: {
            apiKey: process.env.SENDGRID_API_KEY
        },
        ses: {
            region: process.env.AWS_SES_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        },
        smtp: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            user: process.env.SMTP_USER,
            password: process.env.SMTP_PASSWORD,
            rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
        }
    },
});

// ---------------------------------------------------------------------------
// LOGGER
// ---------------------------------------------------------------------------
function log(level, message, meta = {}) {
    const entry = { ts: new Date().toISOString(), level, msg: message, ...meta };
    const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    fn(JSON.stringify(entry));
}

// ---------------------------------------------------------------------------
// DATABASE
// ---------------------------------------------------------------------------
const pool = new Pool({
    user:     process.env.PGUSER     || 'postgres',
    host:     process.env.PGHOST     || 'vigil-sandbox.cvzs4t5czgnu.ap-southeast-1.rds.amazonaws.com',
    database: process.env.PGDATABASE || 'postgres',
    password: process.env.PGPASSWORD || 'Foxsense123',
    port:     Number(process.env.PGPORT) || 5432,
    max:      3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000,
    statement_timeout: 30000,
    ssl: { rejectUnauthorized: false },  // ✅ always SSL, no condition
});
pool.on('error', (err) => log('ERROR', 'Pool background error', { err: err.message }));

// ---------------------------------------------------------------------------
// CACHE & RATE LIMITER
// ---------------------------------------------------------------------------
class LRUCache {
    constructor(maxSize = 128) { this.maxSize = maxSize; this.cache = new Map(); }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) { this.cache.delete(key); return undefined; }
        return entry.value;
    }
    set(key, value, ttlMs) {
        if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value);
        this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    }
    clear() { this.cache.clear(); }
    stats() { return { size: this.cache.size, maxSize: this.maxSize }; }
}
const cache = new LRUCache(256);

function cached(key, ttl) {
    return (_req, res, next) => {
        const hit = cache.get(key);
        if (hit) { res.setHeader('X-Cache', 'HIT'); return res.json(hit); }
        res.setHeader('X-Cache', 'MISS');
        const origJson = res.json.bind(res);
        res.json = (body) => { cache.set(key, body, ttl); return origJson(body); };
        next();
    };
}

const rateBuckets = new Map();
function rateLimiter(req, res, next) {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    let bucket = rateBuckets.get(ip);
    if (!bucket || now - bucket.windowStart > CONFIG.RATE_LIMIT.WINDOW_MS) {
        bucket = { windowStart: now, count: 0 };
        rateBuckets.set(ip, bucket);
    }
    bucket.count++;
    if (bucket.count > CONFIG.RATE_LIMIT.MAX_REQUESTS) {
        return res.status(429).json({ error: 'Rate limit exceeded.' });
    }
    next();
}

// ---------------------------------------------------------------------------
// ENHANCED ALERT ENGINE & EMAIL SERVICE
// ---------------------------------------------------------------------------
const emailService = new EmailNotificationService(CONFIG.EMAIL);
const alerts = new EnhancedAlertEngine(pool, CONFIG, emailService);

// ---------------------------------------------------------------------------
// QUERY HISTORY
// ---------------------------------------------------------------------------
const queryHistory = {
    entries: [],
    add(e) { this.entries.unshift({ id: uuid(), ts: new Date().toISOString(), favourite: false, ...e }); if(this.entries.length>200) this.entries.pop(); },
    list(limit) { return this.entries.slice(0, limit); }
};

// ---------------------------------------------------------------------------
// USERS (In-memory storage)
// ---------------------------------------------------------------------------
let USERS = [
    {
        id: 1, username: 'admin', passwordHash: bcrypt.hashSync('admin', 10),
        name: 'System Administrator', email: 'admin@sys.local',
        role: 'super_admin', accessLevel: 'write', status: 'active',
        allowedScreens: ['overview','performance','resources','reliability', 'indexes','api','admin','sql','alerts','repository','UserManagement','Connections','AlertsComponent','optimizer','pool','schema','security','capacity'],
        createdAt: new Date('2024-01-01').toISOString(),
    },
    {
        id: 2, username: 'developer', passwordHash: bcrypt.hashSync('dev123', 10),
        name: 'John Developer', email: 'john@dev.local',
        role: 'admin', accessLevel: 'write', status: 'active',
        allowedScreens: ['overview','performance','resources','reliability','indexes','sql','api','repository','UserManagement','optimizer'],
        createdAt: new Date('2024-02-15').toISOString(),
    },
    {
        id: 3, username: 'analyst', passwordHash: bcrypt.hashSync('analyst123', 10),
        name: 'Sarah Analyst', email: 'sarah@analytics.local',
        role: 'user', accessLevel: 'read', status: 'active',
        allowedScreens: ['overview','performance','resources','reliability','indexes'],
        createdAt: new Date('2024-03-10').toISOString(),
    },
];

// In-memory storage for connections
let CONNECTIONS = [
    {
        id: 1,
        name: 'Default Connection',
        host: process.env.PGHOST || 'vigil-sandbox.cvzs4t5czgnu.ap-southeast-1.rds.amazonaws.com',
        port: parseInt(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || 'postgres',
        username: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'Foxsense123',
        ssl: process.env.PGSSL === 'true',
        isDefault: true,
        status: 'success',
        lastTested: new Date().toISOString(),
        createdAt: new Date().toISOString()
    }
];

// ---------------------------------------------------------------------------
// APP & MIDDLEWARE
// ---------------------------------------------------------------------------
const app = express();
const server = http.createServer(app);

app.use(cors({ origin: CONFIG.CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(rateLimiter);

if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        log('INFO', `${req.method} ${req.path}`, { ip: req.ip });
        next();
    });
}

function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
    try { req.user = jwt.verify(header.slice(7), CONFIG.JWT_SECRET); next(); }
    catch { return res.status(401).json({ error: 'Invalid token' }); }
}

function requireScreen(screen) {
    return (req, res, next) => {
        if (!req.user.allowedScreens?.includes(screen)) return res.status(403).json({ error: 'Access denied' });
        next();
    };
}

// ---------------------------------------------------------------------------
// ROUTES
// ---------------------------------------------------------------------------

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.2.0',
        alerts: { monitoring: alerts.monitoringInterval !== null }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ ...user, passwordHash: undefined }, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });
    res.json({ user, token });
});

app.get('/api/overview/stats', authenticate, cached('ov:stats', CONFIG.CACHE_TTL.STATS), async (req, res) => {
    const { rows: [d] } = await pool.query(`
        SELECT
            (SELECT count(*) FROM pg_stat_activity WHERE state='active') as active,
            (SELECT count(*) FROM pg_stat_activity) as total_conn,
            (SELECT setting::int FROM pg_settings WHERE name='max_connections') as max_conn,
            (SELECT pg_database_size(current_database())) as db_size_bytes,
            (SELECT date_part('epoch', now() - pg_postmaster_start_time())) as uptime_seconds,
            (SELECT sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit)+sum(heap_blks_read),0)*100 FROM pg_statio_user_tables) as hit_ratio
    `);
    res.json({
        activeConnections: Number(d.active),
        maxConnections: Number(d.max_conn),
        uptimeSeconds: Number(d.uptime_seconds),
        diskUsedGB: parseFloat((d.db_size_bytes / 1024**3).toFixed(2)),
        indexHitRatio: parseFloat(d.hit_ratio || 0).toFixed(1)
    });
});

app.get('/api/overview/traffic', authenticate, cached('ov:traffic', CONFIG.CACHE_TTL.TRAFFIC), async (req, res) => {
    const r = await pool.query("SELECT tup_fetched, tup_inserted, tup_updated, tup_deleted FROM pg_stat_database WHERE datname=current_database()");
    res.json(r.rows[0]);
});

app.get('/api/performance/stats', authenticate, cached('perf:stats', CONFIG.CACHE_TTL.PERFORMANCE), async (req, res) => {
    try {
        const ext = await pool.query("SELECT n.nspname FROM pg_extension e JOIN pg_namespace n ON e.extnamespace = n.oid WHERE e.extname='pg_stat_statements'");
        if(ext.rowCount===0) return res.json({ available: false, slowQueries: [] });
        const schema = ext.rows[0].nspname;
        const q = await pool.query(`SELECT query, calls, mean_exec_time as mean_time_ms, round((shared_blks_hit::numeric/NULLIF(shared_blks_hit+shared_blks_read,0))*100,1) as cache_hit_pct FROM "${schema}".pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10`);
        res.json({ available: true, slowQueries: q.rows });
    } catch(e) { res.json({ available: false, error: e.message, slowQueries: [] }); }
});

app.get('/api/performance/table-io', authenticate, cached('perf:io', CONFIG.CACHE_TTL.TABLE_STATS), async (req, res) => {
    const r = await pool.query("SELECT relname as table_name, seq_scan, idx_scan FROM pg_stat_user_tables ORDER BY seq_scan DESC LIMIT 20");
    res.json(r.rows);
});

app.get('/api/reliability/active-connections', authenticate, async (req, res) => {
    const r = await pool.query(`
        SELECT pid, usename, state, query, extract(epoch FROM (now()-query_start))::int as duration_sec,
            (now()-query_start > interval '5 minutes') as is_slow
        FROM pg_stat_activity WHERE pid<>pg_backend_pid() ORDER BY duration_sec DESC
    `);
    res.json(r.rows);
});

app.get('/api/reliability/locks', authenticate, async (req, res) => {
    const r = await pool.query(`
        SELECT bl.pid as blocked_pid, kl.pid as blocking_pid, ka.query as blocking_query
        FROM pg_locks bl JOIN pg_locks kl ON kl.locktype=bl.locktype AND kl.pid<>bl.pid
                         JOIN pg_stat_activity ka ON ka.pid=kl.pid WHERE NOT bl.granted
    `);
    res.json(r.rows);
});

app.get('/api/reliability/replication', authenticate, async (req, res) => {
    const r = await pool.query("SELECT application_name, state, pg_wal_lsn_diff(sent_lsn, replay_lsn) as replication_lag_bytes FROM pg_stat_replication");
    res.json(r.rows);
});

app.post('/api/optimizer/analyze', authenticate, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query is required' });
        const result = await pool.query(`EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON) ${query}`);
        res.json(result.rows[0]);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.get('/api/alerts', authenticate, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const includeAcknowledged = req.query.includeAcknowledged === 'true';
        const alerts_list = await alerts.getRecent(limit, includeAcknowledged);
        res.json(alerts_list);
    } catch (error) {
        log('ERROR', 'Failed to fetch alerts', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/alerts/statistics', authenticate, async (req, res) => {
    try {
        const timeRange = req.query.timeRange || '24h';
        const stats = await alerts.getStatistics(timeRange);
        res.json(stats);
    } catch (error) {
        log('ERROR', 'Failed to fetch alert statistics', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/alerts/:id/acknowledge', authenticate, async (req, res) => {
    try {
        const alertId = req.params.id;
        const result = await alerts.acknowledge(alertId, req.user.id, req.user.username);
        if (!result) return res.status(404).json({ error: 'Alert not found' });
        res.json(result);
    } catch (error) {
        log('ERROR', 'Failed to acknowledge alert', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/alerts/bulk-acknowledge', authenticate, async (req, res) => {
    try {
        const { alertIds } = req.body;
        if (!Array.isArray(alertIds) || alertIds.length === 0) {
            return res.status(400).json({ error: 'Invalid alert IDs' });
        }
        const results = await alerts.bulkAcknowledge(alertIds, req.user.id, req.user.username);
        res.json({ acknowledged: results.length });
    } catch (error) {
        log('ERROR', 'Failed to bulk acknowledge alerts', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/alerts/manual', authenticate, async (req, res) => {
    try {
        const { severity, category, message, data } = req.body;
        if (!severity || !category || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const alert = await alerts.fire(severity, category, message, {
            ...data, manual: true, createdBy: req.user.username
        });
        res.json(alert);
    } catch (error) {
        log('ERROR', 'Failed to create manual alert', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/alerts/cleanup', authenticate, requireScreen('admin'), async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const deleted = await alerts.cleanup(days);
        res.json({ deleted });
    } catch (error) {
        log('ERROR', 'Failed to cleanup alerts', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/alerts/email/test', authenticate, requireScreen('admin'), async (req, res) => {
    try {
        const { recipient } = req.body;
        if (!recipient) return res.status(400).json({ error: 'Recipient email required' });
        const result = await emailService.sendTestEmail(recipient);
        res.json(result);
    } catch (error) {
        log('ERROR', 'Failed to send test email', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/alerts/email/config', authenticate, requireScreen('admin'), (req, res) => {
    res.json({
        enabled: emailService.enabled,
        provider: CONFIG.EMAIL.provider,
        recipients: CONFIG.EMAIL.recipients,
        minSeverity: CONFIG.EMAIL.minSeverity,
        from: CONFIG.EMAIL.from
    });
});

app.post('/api/alerts/email/digest', authenticate, requireScreen('admin'), async (req, res) => {
    try {
        const { recipients } = req.body;
        const recentAlerts = await alerts.getRecent(50, false);
        const result = await emailService.sendDigest(recentAlerts, recipients);
        res.json(result);
    } catch (error) {
        log('ERROR', 'Failed to send digest email', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/resources/growth', authenticate, cached('res:growth', CONFIG.CACHE_TTL.GROWTH), async (req, res) => {
    const r = await pool.query("SELECT relname as table_name, round(pg_total_relation_size(relid)/(1024.0*1024*1024),2) as total_size_gb, pg_size_pretty(pg_total_relation_size(relid)) as total_size_pretty FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC LIMIT 10");
    res.json(r.rows);
});

app.get('/api/resources/vacuum-status', authenticate, cached('res:vac', CONFIG.CACHE_TTL.VACUUM), async (req, res) => {
    const r = await pool.query("SELECT relname as table_name, n_dead_tup as dead_tuples, last_autovacuum, CASE WHEN n_live_tup>0 THEN round((n_dead_tup::numeric/n_live_tup)*100,2) ELSE 0 END as bloat_ratio_pct FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 20");
    res.json(r.rows);
});

app.get('/api/indexes/analysis', authenticate, cached('idx:an', CONFIG.CACHE_TTL.INDEXES), async (req, res) => {
    const missing = await pool.query("SELECT relname as table, seq_scan, idx_scan FROM pg_stat_user_tables WHERE seq_scan > idx_scan AND pg_relation_size(relid) > 1000000 LIMIT 10");
    const unused = await pool.query("SELECT indexrelname as indexName, pg_size_pretty(pg_relation_size(indexrelid)) as size FROM pg_stat_user_indexes WHERE idx_scan=0 LIMIT 10");
    res.json({ missing: missing.rows, unused: unused.rows, lowHit: [] });
});

app.get('/api/admin/settings', authenticate, cached('admin:settings', CONFIG.CACHE_TTL.SETTINGS), async (req, res) => {
    const r = await pool.query("SELECT name, setting, unit, short_desc FROM pg_settings");
    res.json(r.rows);
});

app.get('/api/admin/extensions', authenticate, cached('admin:ext', CONFIG.CACHE_TTL.EXTENSIONS), async (req, res) => {
    const r = await pool.query("SELECT extname as name, extversion as version FROM pg_extension");
    res.json(r.rows);
});

app.get('/api/admin/cache/stats', authenticate, (req, res) => res.json(cache.stats()));
app.post('/api/admin/cache/clear', authenticate, (req, res) => { cache.clear(); res.json({ success: true }); });

app.post('/api/query', authenticate, async (req, res) => {
    try {
        const client = await pool.connect();
        const r = await client.query(req.body.sql);
        client.release();
        queryHistory.add({ sql: req.body.sql, success: true });
        res.json({ rows: r.rows, rowCount: r.rowCount, fields: r.fields.map(f=>({name:f.name})) });
    } catch(e) {
        queryHistory.add({ sql: req.body.sql, success: false, error: e.message });
        res.status(400).json({ error: e.message });
    }
});

app.use('/api/repo', authenticate, requireScreen('repository'), repoRoutes);

app.get('/api/connections', authenticate, (req, res) => {
    try {
        const safeConnections = CONNECTIONS.map(conn => ({ ...conn, password: undefined }));
        res.json(safeConnections);
    } catch (error) {
        log('ERROR', 'Failed to fetch connections', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/connections/:id', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const connection = CONNECTIONS.find(c => c.id === id);
        if (!connection) return res.status(404).json({ error: 'Connection not found' });
        res.json({ ...connection, password: undefined });
    } catch (error) {
        log('ERROR', 'Failed to fetch connection', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/connections', authenticate, async (req, res) => {
    try {
        const { name, host, port, database, username, password, ssl, isDefault } = req.body;
        if (!name || !host || !port || !database || !username || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (CONNECTIONS.find(c => c.name === name)) {
            return res.status(400).json({ error: 'Connection name already exists' });
        }
        if (isDefault) CONNECTIONS.forEach(c => c.isDefault = false);

        const newConnection = {
            id: Math.max(...CONNECTIONS.map(c => c.id), 0) + 1,
            name, host, port: parseInt(port), database, username, password,
            ssl: ssl || false, isDefault: isDefault || false,
            status: null, lastTested: null, createdAt: new Date().toISOString()
        };
        CONNECTIONS.push(newConnection);
        res.json({ ...newConnection, password: undefined });
    } catch (error) {
        log('ERROR', 'Failed to create connection', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/connections/:id', authenticate, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, host, port, database, username, password, ssl } = req.body;
        const index = CONNECTIONS.findIndex(c => c.id === id);
        if (index === -1) return res.status(404).json({ error: 'Connection not found' });
        if (CONNECTIONS.find(c => c.name === name && c.id !== id)) {
            return res.status(400).json({ error: 'Connection name already exists' });
        }
        CONNECTIONS[index] = {
            ...CONNECTIONS[index],
            name: name || CONNECTIONS[index].name,
            host: host || CONNECTIONS[index].host,
            port: port ? parseInt(port) : CONNECTIONS[index].port,
            database: database || CONNECTIONS[index].database,
            username: username || CONNECTIONS[index].username,
            password: password || CONNECTIONS[index].password,
            ssl: ssl !== undefined ? ssl : CONNECTIONS[index].ssl,
            status: null, lastTested: null
        };
        res.json({ ...CONNECTIONS[index], password: undefined });
    } catch (error) {
        log('ERROR', 'Failed to update connection', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/connections/:id', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const connection = CONNECTIONS.find(c => c.id === id);
        if (!connection) return res.status(404).json({ error: 'Connection not found' });
        if (connection.isDefault) return res.status(403).json({ error: 'Cannot delete default connection' });
        CONNECTIONS = CONNECTIONS.filter(c => c.id !== id);
        res.json({ success: true });
    } catch (error) {
        log('ERROR', 'Failed to delete connection', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/connections/:id/default', authenticate, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const connection = CONNECTIONS.find(c => c.id === id);
        if (!connection) return res.status(404).json({ error: 'Connection not found' });
        CONNECTIONS.forEach(c => c.isDefault = false);
        connection.isDefault = true;
        res.json({ success: true });
    } catch (error) {
        log('ERROR', 'Failed to set default connection', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// ⚠️ Fixed: removed require('pg') inside handler — use top-level import instead
app.post('/api/connections/:id/test', authenticate, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const connection = CONNECTIONS.find(c => c.id === id);
        if (!connection) return res.status(404).json({ error: 'Connection not found' });

        const testPool = new Pool({
            host: connection.host,
            port: connection.port,
            database: connection.database,
            user: connection.username,
            password: connection.password,
            ssl: connection.ssl ? { rejectUnauthorized: false } : undefined,
            connectionTimeoutMillis: 5000
        });

        try {
            const client = await testPool.connect();
            await client.query('SELECT 1');
            client.release();
            await testPool.end();
            connection.status = 'success';
            connection.lastTested = new Date().toISOString();
            res.json({ success: true, message: 'Connection successful' });
        } catch (testError) {
            connection.status = 'failed';
            connection.lastTested = new Date().toISOString();
            await testPool.end().catch(() => {});
            res.json({ success: false, error: testError.message });
        }
    } catch (error) {
        log('ERROR', 'Failed to test connection', { error: error.message });
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/connections/:id/switch', authenticate, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const connection = CONNECTIONS.find(c => c.id === id);
        if (!connection) return res.status(404).json({ error: 'Connection not found' });
        CONNECTIONS.forEach(c => c.isDefault = false);
        connection.isDefault = true;
        res.json({ success: true, message: 'Connection switched. Please restart the server to apply changes.' });
    } catch (error) {
        log('ERROR', 'Failed to switch connection', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users', authenticate, requireScreen('UserManagement'), (req, res) => {
    const safeUsers = USERS.map(u => ({ ...u, passwordHash: undefined }));
    res.json(safeUsers);
});

app.post('/api/users', authenticate, requireScreen('UserManagement'), async (req, res) => {
    try {
        const { username, password, name, email, role, allowedScreens, status = 'active' } = req.body;
        if (!username || !password || !name || !email || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (USERS.find(u => u.username === username)) return res.status(400).json({ error: 'Username already exists' });
        if (USERS.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });

        const newUser = {
            id: Math.max(...USERS.map(u => u.id), 0) + 1,
            username, passwordHash: bcrypt.hashSync(password, 10), name, email, role,
            accessLevel: role === 'super_admin' || role === 'admin' ? 'write' : 'read',
            status, allowedScreens: allowedScreens || [],
            createdAt: new Date().toISOString(),
        };
        USERS.push(newUser);
        res.json({ ...newUser, passwordHash: undefined });
    } catch (error) {
        log('ERROR', 'Failed to create user', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/:id', authenticate, requireScreen('UserManagement'), async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userIndex = USERS.findIndex(u => u.id === userId);
        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

        const { name, email, role, allowedScreens, status } = req.body;
        if (email && email !== USERS[userIndex].email) {
            if (USERS.find(u => u.email === email && u.id !== userId)) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }
        USERS[userIndex] = {
            ...USERS[userIndex],
            name: name || USERS[userIndex].name,
            email: email || USERS[userIndex].email,
            role: role || USERS[userIndex].role,
            allowedScreens: allowedScreens || USERS[userIndex].allowedScreens,
            status: status !== undefined ? status : USERS[userIndex].status,
            accessLevel: role === 'super_admin' || role === 'admin' ? 'write' : 'read',
        };
        res.json({ ...USERS[userIndex], passwordHash: undefined });
    } catch (error) {
        log('ERROR', 'Failed to update user', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/users/:id', authenticate, requireScreen('UserManagement'), (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (userId === 1) return res.status(403).json({ error: 'Cannot delete system administrator' });
        const userIndex = USERS.findIndex(u => u.id === userId);
        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
        USERS.splice(userIndex, 1);
        res.json({ success: true });
    } catch (error) {
        log('ERROR', 'Failed to delete user', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users/bulk-delete', authenticate, requireScreen('UserManagement'), (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'Invalid user IDs' });
        if (ids.includes(1)) return res.status(403).json({ error: 'Cannot delete system administrator' });
        USERS = USERS.filter(u => !ids.includes(u.id));
        res.json({ success: true, deleted: ids.length });
    } catch (error) {
        log('ERROR', 'Failed to bulk delete users', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users/:id/reset-password', authenticate, requireScreen('UserManagement'), async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { newPassword } = req.body;
        if (!newPassword) return res.status(400).json({ error: 'New password required' });
        const userIndex = USERS.findIndex(u => u.id === userId);
        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
        USERS[userIndex].passwordHash = bcrypt.hashSync(newPassword, 10);
        res.json({ success: true, password: newPassword });
    } catch (error) {
        log('ERROR', 'Failed to reset password', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------------------------
// WEBSOCKET
// ---------------------------------------------------------------------------
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
    log('INFO', 'WebSocket connection established');
    alerts.addSubscriber(ws);

    alerts.getRecent(10, false).then(recent => {
        ws.send(JSON.stringify({
            type: 'alert_summary',
            payload: { count: recent.length, alerts: recent }
        }));
    });

    ws.on('close', () => {
        log('INFO', 'WebSocket connection closed');
        alerts.removeSubscriber(ws);
    });

    ws.on('error', (error) => {
        log('ERROR', 'WebSocket error', { error: error.message });
    });
});

// ---------------------------------------------------------------------------
// ERROR HANDLING
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
    log('ERROR', 'Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.use((req, res) => {
    log('WARN', '404 Not Found', { path: req.path, method: req.method });
    res.status(404).json({ error: 'Endpoint not found' });
});

// ---------------------------------------------------------------------------
// STARTUP
// ---------------------------------------------------------------------------
async function startup() {
    try {
        // Skip mkdir on serverless environments (Vercel)
        try {
            await fs.mkdir(CONFIG.REPOSITORY_PATH, { recursive: true });
            log('INFO', 'Repository directory ready', { path: CONFIG.REPOSITORY_PATH });
        } catch (mkdirError) {
            log('WARN', 'Could not create repository directory (serverless env)', { error: mkdirError.message });
        }

        // Don't crash if DB is unreachable at startup
        try {
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            log('INFO', 'Database connection successful');
        } catch (dbError) {
            log('WARN', 'Database unreachable at startup - will retry on requests', { error: dbError.message });
        }

        // Don't crash if alert DB init fails
        try {
            await alerts.initializeDatabase();
            log('INFO', 'Alert system initialized');
            alerts.startMonitoring(CONFIG.ALERT_MONITORING_INTERVAL);
            log('INFO', 'Alert monitoring started', { interval: CONFIG.ALERT_MONITORING_INTERVAL });
        } catch (alertError) {
            log('WARN', 'Alert system could not initialize', { error: alertError.message });
        }

        server.listen(CONFIG.PORT, '0.0.0.0', () => {
            console.log(`🚀 VIGIL Backend running on port ${CONFIG.PORT}`);
        });
    } catch (error) {
        log('ERROR', 'Startup failed', { error: error.message });
        process.exit(1);
    }
}

process.on('SIGTERM', async () => {
    log('INFO', 'SIGTERM received, shutting down gracefully');
    alerts.stopMonitoring();
    server.close(() => {
        pool.end(() => { process.exit(0); });
    });
});

process.on('SIGINT', async () => {
    log('INFO', 'SIGINT received, shutting down gracefully');
    alerts.stopMonitoring();
    server.close(() => {
        pool.end(() => { process.exit(0); });
    });
});

startup();

export default app;