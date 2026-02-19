
import express                from 'express';
import cors                   from 'cors';
import http                   from 'http';
import { Pool }               from 'pg';
import jwt                    from 'jsonwebtoken';
import bcrypt                 from 'bcryptjs';
import { v4 as uuid }         from 'uuid';
import { WebSocketServer }    from 'ws';
import fs                     from 'fs/promises';
import path                   from 'path';
import { fileURLToPath }      from 'url';
import { dirname }            from 'path';

import repoRoutes             from './routes/repoRoutes.js';
import EnhancedAlertEngine    from './enhanced-alerts.js';
import EmailNotificationService from './email-notification-service.js';

// ── New modular imports ────────────────────────────────────────────────────────
import { buildAuthenticate, requireScreen } from './middleware/authenticate.js';
import userRoutes                           from './routes/userRoutes.js';
import sessionRoutes                        from './routes/sessionRoutes.js';
import auditRoutes                          from './routes/auditRoutes.js';
import { getUserByUsername, touchLastLogin } from './services/userService.js';
import { createSession, recordLogin, recordFailedLogin } from './services/sessionService.js';
import { writeAudit }                       from './services/auditService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = Object.freeze({
    PORT:           Number(process.env.PORT) || 5000,
    JWT_SECRET:     process.env.JWT_SECRET  || 'vigil-change-me-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
    CORS_ORIGINS: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://postgres-tool.vercel.app',
        process.env.CORS_ORIGIN,
    ].filter(Boolean),
    SLOW_QUERY_MIN:  Number(process.env.SLOW_QUERY_MINUTES) || 5,
    WS_INTERVAL_MS:  Number(process.env.WS_INTERVAL_MS)     || 5000,
    REPOSITORY_PATH: process.env.REPOSITORY_PATH || path.join(__dirname, 'repositories'),
    ALERT_MONITORING_INTERVAL: Number(process.env.ALERT_MONITORING_INTERVAL) || 30_000,
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
        LONG_QUERY_SEC:       300,
        DEAD_TUPLE_RATIO:     20,
        REPLICATION_LAG_MB:   100,
        CACHE_HIT_RATIO:      90,
        LOCK_COUNT:           5,
    },
    EMAIL: {
        enabled:      process.env.EMAIL_ENABLED === 'true',
        provider:     process.env.EMAIL_PROVIDER    || 'smtp',
        minSeverity:  process.env.EMAIL_MIN_SEVERITY || 'warning',
        recipients:   process.env.EMAIL_RECIPIENTS?.split(',').map(e => e.trim()) || [],
        from:         process.env.EMAIL_FROM || '"VIGIL Alert System" <alerts@vigil.local>',
        dashboardUrl: process.env.DASHBOARD_URL   || 'http://localhost:5173',
        databaseName: process.env.PGDATABASE      || 'postgres',
        gmail:   { user: process.env.GMAIL_USER,       appPassword: process.env.GMAIL_APP_PASSWORD },
        sendgrid:{ apiKey: process.env.SENDGRID_API_KEY },
        ses: {
            region:          process.env.AWS_SES_REGION      || 'us-east-1',
            accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        smtp: {
            host:              process.env.SMTP_HOST,
            port:              Number(process.env.SMTP_PORT) || 587,
            secure:            process.env.SMTP_SECURE === 'true',
            user:              process.env.SMTP_USER,
            password:          process.env.SMTP_PASSWORD,
            rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
        },
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGGER
// ─────────────────────────────────────────────────────────────────────────────
function log(level, message, meta = {}) {
    const entry = { ts: new Date().toISOString(), level, msg: message, ...meta };
    const fn    = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    fn(JSON.stringify(entry));
}

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE POOL
// ─────────────────────────────────────────────────────────────────────────────
const pool = new Pool({
    user:     process.env.PGUSER     || 'postgres',
    host:     process.env.PGHOST,
    database: process.env.PGDATABASE || 'postgres',
    password: process.env.PGPASSWORD,
    port:     Number(process.env.PGPORT) || 5432,
    max:      10,
    idleTimeoutMillis:       10_000,
    connectionTimeoutMillis: 15_000,
    statement_timeout:       30_000,
    ssl: { rejectUnauthorized: false },
});
pool.on('error', (err) => log('ERROR', 'Pool background error', { err: err.message }));

// ─────────────────────────────────────────────────────────────────────────────
// CACHE & RATE LIMITER
// ─────────────────────────────────────────────────────────────────────────────
class LRUCache {
    constructor(maxSize = 256) { this.maxSize = maxSize; this.cache = new Map(); }
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
    const ip  = req.ip || 'unknown';
    const now = Date.now();
    let bucket = rateBuckets.get(ip);
    if (!bucket || now - bucket.windowStart > CONFIG.RATE_LIMIT.WINDOW_MS) {
        bucket = { windowStart: now, count: 0 };
        rateBuckets.set(ip, bucket);
    }
    if (++bucket.count > CONFIG.RATE_LIMIT.MAX_REQUESTS) {
        return res.status(429).json({ error: 'Rate limit exceeded.' });
    }
    next();
}

// ─────────────────────────────────────────────────────────────────────────────
// ALERT ENGINE & EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const emailService = new EmailNotificationService(CONFIG.EMAIL);
const alerts       = new EnhancedAlertEngine(pool, CONFIG, emailService);

// ─────────────────────────────────────────────────────────────────────────────
// QUERY HISTORY  (in-memory, intentionally)
// ─────────────────────────────────────────────────────────────────────────────
const queryHistory = {
    entries: [],
    add(e)     { this.entries.unshift({ id: uuid(), ts: new Date().toISOString(), favourite: false, ...e }); if (this.entries.length > 200) this.entries.pop(); },
    list(limit) { return this.entries.slice(0, limit); },
};

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTIONS  (in-memory — acceptable as they're reconfigured via env anyway)
// ─────────────────────────────────────────────────────────────────────────────
let CONNECTIONS = [
    {
        id: 1, name: 'Default Connection',
        host:     process.env.PGHOST     || '',
        port:     parseInt(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || 'postgres',
        username: process.env.PGUSER     || 'postgres',
        password: process.env.PGPASSWORD || '',
        ssl:      process.env.PGSSL === 'true',
        isDefault: true, status: 'success',
        lastTested: new Date().toISOString(),
        createdAt:  new Date().toISOString(),
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXPRESS APP
// ─────────────────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

app.use(cors({ origin: CONFIG.CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimiter);

if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => { log('INFO', `${req.method} ${req.path}`, { ip: req.ip }); next(); });
}

// ── Build middleware from pool + config ───────────────────────────────────────
const authenticate = buildAuthenticate(pool, CONFIG);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
    version:   '3.0.0',
    alerts:    { monitoring: alerts.monitoringInterval !== null },
}));

/**
 * POST /api/auth/login
 * Authenticates against pgmonitoringtool.users, creates a session row,
 * records login activity, and returns a signed JWT.
 */
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }

    try {
        const user = await getUserByUsername(pool, username);

        // Failed attempt tracking (user may or may not exist)
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            if (user) {
                await recordFailedLogin(pool, user.id).catch(() => {});
                await writeAudit(pool, {
                    actorId:       user.id,
                    actorUsername: username,
                    action:        'LOGIN_FAILED',
                    level:         'warn',
                    detail:        'Invalid credentials',
                    ip:            req.ip,
                }).catch(() => {});
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ error: `Account is ${user.status}` });
        }

        // Create a session row so admins can revoke individual logins
        const sessionId = await createSession(pool, {
            userId:      user.id,
            ip:          req.ip,
            userAgent:   req.headers['user-agent'],
            deviceLabel: req.headers['user-agent']?.slice(0, 255) ?? 'Unknown',
            location:    null, // populate with GeoIP in production
        });

        // Build JWT payload — never include password_hash
        const payload = {
            id:             user.id,
            username:       user.username,
            name:           user.name,
            email:          user.email,
            role:           user.role,
            accessLevel:    user.access_level,
            allowedScreens: user.allowed_screens ?? [],
            sid:            sessionId, // session id for revocation check
        };

        const token = jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });

        // Fire-and-forget side effects
        Promise.all([
            touchLastLogin(pool, user.id),
            recordLogin(pool, user.id),
            writeAudit(pool, {
                actorId:       user.id,
                actorUsername: user.username,
                action:        'LOGIN_SUCCESS',
                level:         'info',
                detail:        req.headers['user-agent']?.slice(0, 120),
                ip:            req.ip,
            }),
        ]).catch(err => log('WARN', 'Post-login side effects failed', { error: err.message }));

        res.json({ token, user: payload });
    } catch (err) {
        log('ERROR', 'Login error', { error: err.message });
        res.status(500).json({ error: 'Login failed' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// MODULAR ROUTE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api', userRoutes(pool, authenticate, requireScreen));
app.use('/api', sessionRoutes(pool, authenticate, requireScreen));
app.use('/api', auditRoutes(pool, authenticate, requireScreen));

// ─────────────────────────────────────────────────────────────────────────────
// POSTGRES MONITORING ROUTES  (unchanged from v2)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/overview/stats', authenticate, cached('ov:stats', CONFIG.CACHE_TTL.STATS), async (req, res) => {
    const { rows: [d] } = await pool.query(`
        SELECT
            (SELECT count(*) FROM pg_stat_activity WHERE state='active')                             AS active,
            (SELECT count(*) FROM pg_stat_activity)                                                  AS total_conn,
            (SELECT setting::int FROM pg_settings WHERE name='max_connections')                      AS max_conn,
            (SELECT pg_database_size(current_database()))                                            AS db_size_bytes,
            (SELECT date_part('epoch', now() - pg_postmaster_start_time()))                          AS uptime_seconds,
            (SELECT sum(heap_blks_hit)/NULLIF(sum(heap_blks_hit)+sum(heap_blks_read),0)*100
             FROM pg_statio_user_tables)                                                             AS hit_ratio
    `);
    res.json({
        activeConnections: Number(d.active),
        maxConnections:    Number(d.max_conn),
        uptimeSeconds:     Number(d.uptime_seconds),
        diskUsedGB:        parseFloat((d.db_size_bytes / 1024 ** 3).toFixed(2)),
        indexHitRatio:     parseFloat(d.hit_ratio || 0).toFixed(1),
    });
});

app.get('/api/overview/traffic', authenticate, cached('ov:traffic', CONFIG.CACHE_TTL.TRAFFIC), async (req, res) => {
    const r = await pool.query("SELECT tup_fetched, tup_inserted, tup_updated, tup_deleted FROM pg_stat_database WHERE datname=current_database()");
    res.json(r.rows[0]);
});

app.get('/api/performance/stats', authenticate, cached('perf:stats', CONFIG.CACHE_TTL.PERFORMANCE), async (req, res) => {
    try {
        const ext = await pool.query("SELECT n.nspname FROM pg_extension e JOIN pg_namespace n ON e.extnamespace=n.oid WHERE e.extname='pg_stat_statements'");
        if (ext.rowCount === 0) return res.json({ available: false, slowQueries: [] });
        const schema = ext.rows[0].nspname;
        const q = await pool.query(`SELECT query, calls, mean_exec_time AS mean_time_ms, round((shared_blks_hit::numeric/NULLIF(shared_blks_hit+shared_blks_read,0))*100,1) AS cache_hit_pct FROM "${schema}".pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10`);
        res.json({ available: true, slowQueries: q.rows });
    } catch (e) { res.json({ available: false, error: e.message, slowQueries: [] }); }
});

app.get('/api/performance/table-io', authenticate, cached('perf:io', CONFIG.CACHE_TTL.TABLE_STATS), async (req, res) => {
    const r = await pool.query("SELECT relname AS table_name, seq_scan, idx_scan FROM pg_stat_user_tables ORDER BY seq_scan DESC LIMIT 20");
    res.json(r.rows);
});

app.get('/api/reliability/active-connections', authenticate, async (req, res) => {
    const r = await pool.query(`
        SELECT pid, usename, state, query,
               extract(epoch FROM (now()-query_start))::int AS duration_sec,
               (now()-query_start > interval '5 minutes') AS is_slow
        FROM pg_stat_activity WHERE pid<>pg_backend_pid() ORDER BY duration_sec DESC
    `);
    res.json(r.rows);
});

app.get('/api/reliability/locks', authenticate, async (req, res) => {
    const r = await pool.query(`
        SELECT bl.pid AS blocked_pid, kl.pid AS blocking_pid, ka.query AS blocking_query
        FROM   pg_locks bl
        JOIN   pg_locks kl ON kl.locktype=bl.locktype AND kl.pid<>bl.pid
        JOIN   pg_stat_activity ka ON ka.pid=kl.pid
        WHERE  NOT bl.granted
    `);
    res.json(r.rows);
});

app.get('/api/reliability/replication', authenticate, async (req, res) => {
    const r = await pool.query("SELECT application_name, state, pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replication_lag_bytes FROM pg_stat_replication");
    res.json(r.rows);
});

app.post('/api/optimizer/analyze', authenticate, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query is required' });
        const result = await pool.query(`EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON) ${query}`);
        res.json(result.rows[0]);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// ALERTS ROUTES  (unchanged from v2)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/alerts', authenticate, async (req, res) => {
    try {
        const limit               = parseInt(req.query.limit) || 50;
        const includeAcknowledged = req.query.includeAcknowledged === 'true';
        res.json(await alerts.getRecent(limit, includeAcknowledged));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/alerts/statistics', authenticate, async (req, res) => {
    try { res.json(await alerts.getStatistics(req.query.timeRange || '24h')); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/alerts/:id/acknowledge', authenticate, async (req, res) => {
    try {
        const result = await alerts.acknowledge(req.params.id, req.user.id, req.user.username);
        if (!result) return res.status(404).json({ error: 'Alert not found' });
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/alerts/bulk-acknowledge', authenticate, async (req, res) => {
    try {
        const { alertIds } = req.body;
        if (!Array.isArray(alertIds) || !alertIds.length) return res.status(400).json({ error: 'Invalid alert IDs' });
        const results = await alerts.bulkAcknowledge(alertIds, req.user.id, req.user.username);
        res.json({ acknowledged: results.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/alerts/manual', authenticate, async (req, res) => {
    try {
        const { severity, category, message, data } = req.body;
        if (!severity || !category || !message) return res.status(400).json({ error: 'Missing required fields' });
        const alert = await alerts.fire(severity, category, message, { ...data, manual: true, createdBy: req.user.username });
        res.json(alert);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/alerts/cleanup', authenticate, requireScreen('admin'), async (req, res) => {
    try { res.json({ deleted: await alerts.cleanup(parseInt(req.query.days) || 30) }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/alerts/email/test', authenticate, requireScreen('admin'), async (req, res) => {
    try {
        const { recipient } = req.body;
        if (!recipient) return res.status(400).json({ error: 'Recipient email required' });
        res.json(await emailService.sendTestEmail(recipient));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/alerts/email/config', authenticate, requireScreen('admin'), (req, res) => {
    res.json({
        enabled:     emailService.enabled,
        provider:    CONFIG.EMAIL.provider,
        recipients:  CONFIG.EMAIL.recipients,
        minSeverity: CONFIG.EMAIL.minSeverity,
        from:        CONFIG.EMAIL.from,
    });
});

app.post('/api/alerts/email/digest', authenticate, requireScreen('admin'), async (req, res) => {
    try {
        const { recipients } = req.body;
        const recentAlerts   = await alerts.getRecent(50, false);
        res.json(await emailService.sendDigest(recentAlerts, recipients));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN / CACHE ROUTES  (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/admin/settings', authenticate, cached('admin:settings', CONFIG.CACHE_TTL.SETTINGS), async (req, res) => {
    const r = await pool.query("SELECT name, setting, unit, context FROM pg_settings WHERE name IN ('max_connections','shared_buffers','work_mem','maintenance_work_mem','effective_cache_size','wal_level','checkpoint_completion_target') ORDER BY name");
    res.json(r.rows);
});

app.get('/api/admin/extensions', authenticate, cached('admin:ext', CONFIG.CACHE_TTL.EXTENSIONS), async (req, res) => {
    const r = await pool.query("SELECT extname AS name, extversion AS version FROM pg_extension");
    res.json(r.rows);
});

app.get('/api/admin/cache/stats', authenticate, (req, res) => res.json(cache.stats()));
app.post('/api/admin/cache/clear', authenticate, (req, res) => { cache.clear(); res.json({ success: true }); });

// ─────────────────────────────────────────────────────────────────────────────
// SQL CONSOLE  (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/query', authenticate, async (req, res) => {
    try {
        const client = await pool.connect();
        const r = await client.query(req.body.sql);
        client.release();
        queryHistory.add({ sql: req.body.sql, success: true });
        res.json({ rows: r.rows, rowCount: r.rowCount, fields: r.fields.map(f => ({ name: f.name })) });
    } catch (e) {
        queryHistory.add({ sql: req.body.sql, success: false, error: e.message });
        res.status(400).json({ error: e.message });
    }
});

app.use('/api/repo', authenticate, requireScreen('repository'), repoRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTIONS  (in-memory, unchanged)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/connections', authenticate, (req, res) => {
    res.json(CONNECTIONS.map(c => ({ ...c, password: undefined })));
});

app.get('/api/connections/:id', authenticate, (req, res) => {
    const c = CONNECTIONS.find(c => c.id === parseInt(req.params.id));
    if (!c) return res.status(404).json({ error: 'Connection not found' });
    res.json({ ...c, password: undefined });
});

app.post('/api/connections', authenticate, (req, res) => {
    const { name, host, port, database, username, password, ssl, isDefault } = req.body;
    if (!name || !host || !port || !database || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (CONNECTIONS.find(c => c.name === name)) return res.status(409).json({ error: 'Connection name already exists' });
    if (isDefault) CONNECTIONS.forEach(c => c.isDefault = false);
    const newConn = {
        id: Math.max(...CONNECTIONS.map(c => c.id), 0) + 1,
        name, host, port: parseInt(port), database, username, password,
        ssl: ssl || false, isDefault: isDefault || false,
        status: null, lastTested: null, createdAt: new Date().toISOString(),
    };
    CONNECTIONS.push(newConn);
    res.status(201).json({ ...newConn, password: undefined });
});

app.put('/api/connections/:id', authenticate, (req, res) => {
    const id    = parseInt(req.params.id);
    const index = CONNECTIONS.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Connection not found' });
    const { name, host, port, database, username, password, ssl } = req.body;
    if (CONNECTIONS.find(c => c.name === name && c.id !== id)) return res.status(409).json({ error: 'Connection name already exists' });
    CONNECTIONS[index] = { ...CONNECTIONS[index], name: name || CONNECTIONS[index].name, host: host || CONNECTIONS[index].host, port: port ? parseInt(port) : CONNECTIONS[index].port, database: database || CONNECTIONS[index].database, username: username || CONNECTIONS[index].username, password: password || CONNECTIONS[index].password, ssl: ssl !== undefined ? ssl : CONNECTIONS[index].ssl, status: null, lastTested: null };
    res.json({ ...CONNECTIONS[index], password: undefined });
});

app.delete('/api/connections/:id', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const c  = CONNECTIONS.find(c => c.id === id);
    if (!c) return res.status(404).json({ error: 'Connection not found' });
    if (c.isDefault) return res.status(403).json({ error: 'Cannot delete the default connection' });
    CONNECTIONS = CONNECTIONS.filter(c => c.id !== id);
    res.json({ success: true });
});

app.post('/api/connections/:id/default', authenticate, (req, res) => {
    const c = CONNECTIONS.find(c => c.id === parseInt(req.params.id));
    if (!c) return res.status(404).json({ error: 'Connection not found' });
    CONNECTIONS.forEach(c => c.isDefault = false);
    c.isDefault = true;
    res.json({ success: true });
});

app.post('/api/connections/:id/test', authenticate, async (req, res) => {
    const c = CONNECTIONS.find(c => c.id === parseInt(req.params.id));
    if (!c) return res.status(404).json({ error: 'Connection not found' });
    const testPool = new Pool({ host: c.host, port: c.port, database: c.database, user: c.username, password: c.password, ssl: c.ssl ? { rejectUnauthorized: false } : undefined, connectionTimeoutMillis: 5000 });
    try {
        const client = await testPool.connect();
        await client.query('SELECT 1');
        client.release();
        await testPool.end();
        c.status = 'success'; c.lastTested = new Date().toISOString();
        res.json({ success: true, message: 'Connection successful' });
    } catch (e) {
        c.status = 'failed'; c.lastTested = new Date().toISOString();
        await testPool.end().catch(() => {});
        res.json({ success: false, error: e.message });
    }
});

app.post('/api/connections/:id/switch', authenticate, (req, res) => {
    const c = CONNECTIONS.find(c => c.id === parseInt(req.params.id));
    if (!c) return res.status(404).json({ error: 'Connection not found' });
    CONNECTIONS.forEach(c => c.isDefault = false);
    c.isDefault = true;
    res.json({ success: true, message: 'Connection switched. Please restart to apply.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK ROUTES  (unchanged from v2)
// ─────────────────────────────────────────────────────────────────────────────
function parseFeedbackBody(body) {
    const { feedback_type, rating, comment = '', remarks = '', section = 'all', feature_title = '', feature_priority, section_feedback, user_metadata = {} } = body;
    const type = (feedback_type || 'general').toLowerCase().trim();
    const ALLOWED_TYPES = new Set(['feature', 'bug', 'general']);
    if (!ALLOWED_TYPES.has(type)) return { valid: false, error: `Invalid feedback_type. Must be one of: ${[...ALLOWED_TYPES].join(', ')}` };
    if (type === 'feature') {
        if (!feature_title?.trim()) return { valid: false, error: 'Feature requests require a feature_title' };
        if (!comment.trim())        return { valid: false, error: 'Feature requests require a description in the comment field' };
    } else {
        const hasInline = Array.isArray(section_feedback) && section_feedback.some(s => s.comment?.trim());
        if (!comment.trim() && !hasInline) return { valid: false, error: 'A comment is required' };
    }
    let parsedRating = null;
    if (rating !== null && rating !== undefined && rating !== '') {
        parsedRating = Number(rating);
        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) return { valid: false, error: 'Rating must be an integer between 1 and 5' };
    }
    const cap = (str, max) => String(str || '').trim().slice(0, max);
    return { valid: true, fields: { type, rating: parsedRating, comment: cap(comment, 2000), remarks: cap(remarks, 2000), section: cap(section, 100), feature_title: cap(feature_title, 120), feature_priority: ['Low','Medium','High'].includes(feature_priority) ? feature_priority : null, section_feedback: Array.isArray(section_feedback) ? section_feedback : null, user_metadata } };
}

app.post('/api/feedback', authenticate, async (req, res) => {
    try {
        const parsed = parseFeedbackBody(req.body);
        if (!parsed.valid) return res.status(400).json({ error: parsed.error });
        const { type, rating, comment, remarks, section, feature_title, feature_priority, section_feedback, user_metadata } = parsed.fields;
        const result = await pool.query(
            `INSERT INTO pgmonitoringtool.user_feedback
                (username, feedback_type, rating, comment, remarks, section, feature_title, feature_priority, section_feedback, status, user_metadata)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'new',$10) RETURNING id, created_at`,
            [req.user.username, type, rating, comment, remarks || null, section, feature_title || null, feature_priority || null, section_feedback ? JSON.stringify(section_feedback) : null, JSON.stringify(user_metadata)]
        );
        res.status(201).json({ success: true, feedbackId: result.rows[0].id, created_at: result.rows[0].created_at });
    } catch (e) { res.status(500).json({ error: 'Failed to submit feedback' }); }
});

app.get('/api/feedback/mine', authenticate, async (req, res) => {
    try {
        const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
        const offset = Math.max(parseInt(req.query.offset) || 0,  0);
        const result = await pool.query(
            `SELECT id, feedback_type, rating, comment, remarks, section, feature_title, feature_priority, status, created_at
             FROM pgmonitoringtool.user_feedback WHERE username = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [req.user.username, limit, offset]
        );
        res.json({ rows: result.rows, limit, offset });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/feedback', authenticate, requireScreen('admin'), async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const offset = Math.max(parseInt(req.query.offset) || 0, 0);
        const conditions = []; const params = [];
        if (req.query.type)     { params.push(req.query.type);          conditions.push(`feedback_type = $${params.length}`); }
        if (req.query.status)   { params.push(req.query.status);        conditions.push(`status = $${params.length}`); }
        if (req.query.section)  { params.push(req.query.section);       conditions.push(`section = $${params.length}`); }
        if (req.query.username) { params.push(`%${req.query.username}%`); conditions.push(`username ILIKE $${params.length}`); }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        params.push(limit, offset);
        const [rows, countRow] = await Promise.all([
            pool.query(`SELECT id,username,feedback_type,rating,comment,remarks,section,feature_title,feature_priority,section_feedback,status,created_at,user_metadata FROM pgmonitoringtool.user_feedback ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`, params),
            pool.query(`SELECT COUNT(*) AS total FROM pgmonitoringtool.user_feedback ${where}`, params.slice(0,-2)),
        ]);
        res.json({ rows: rows.rows, total: parseInt(countRow.rows[0].total), limit, offset });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/admin/feedback/:id/status', authenticate, requireScreen('admin'), async (req, res) => {
    try {
        const ALLOWED = ['new','reviewed','implemented','rejected'];
        if (!ALLOWED.includes(req.body.status)) return res.status(400).json({ error: `Status must be one of: ${ALLOWED.join(', ')}` });
        const result = await pool.query(`UPDATE pgmonitoringtool.user_feedback SET status=$1 WHERE id=$2 RETURNING id,status`, [req.body.status, parseInt(req.params.id)]);
        if (!result.rowCount) return res.status(404).json({ error: 'Feedback not found' });
        res.json({ success: true, ...result.rows[0] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/feedback/summary', authenticate, requireScreen('admin'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) AS total,
                   COUNT(*) FILTER (WHERE status='new')         AS new_count,
                COUNT(*) FILTER (WHERE status='reviewed')    AS reviewed_count,
                COUNT(*) FILTER (WHERE status='implemented') AS implemented_count,
                ROUND(AVG(rating) FILTER (WHERE rating IS NOT NULL),2) AS avg_rating,
                   COUNT(*) FILTER (WHERE feedback_type='bug')     AS bug_count,
                COUNT(*) FILTER (WHERE feedback_type='feature') AS feature_count,
                COUNT(*) FILTER (WHERE feedback_type='general') AS general_count,
                COUNT(*) FILTER (WHERE created_at >= NOW()-INTERVAL '7 days') AS last_7_days
            FROM pgmonitoringtool.user_feedback`
        );
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// WEBSOCKET
// ─────────────────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => {
    log('INFO', 'WebSocket connection established');
    alerts.addSubscriber(ws);
    alerts.getRecent(10, false).then(recent => {
        ws.send(JSON.stringify({ type: 'alert_summary', payload: { count: recent.length, alerts: recent } }));
    });
    ws.on('close', () => { log('INFO', 'WebSocket closed'); alerts.removeSubscriber(ws); });
    ws.on('error', (e) => log('ERROR', 'WebSocket error', { error: e.message }));
});

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    log('ERROR', 'Unhandled error', { error: err.message });
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.use((req, res) => {
    log('WARN', '404', { path: req.path, method: req.method });
    res.status(404).json({ error: 'Endpoint not found' });
});

// ─────────────────────────────────────────────────────────────────────────────
// STARTUP
// ─────────────────────────────────────────────────────────────────────────────
async function startup() {
    try {
        try {
            await fs.mkdir(CONFIG.REPOSITORY_PATH, { recursive: true });
            log('INFO', 'Repository directory ready');
        } catch (e) {
            log('WARN', 'Could not create repository directory', { error: e.message });
        }

        try {
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            log('INFO', 'Database connection successful');
        } catch (e) {
            log('WARN', 'Database unreachable at startup — will retry on requests', { error: e.message });
        }

        try {
            await alerts.initializeDatabase();
            alerts.startMonitoring(CONFIG.ALERT_MONITORING_INTERVAL);
            log('INFO', 'Alert monitoring started', { interval: CONFIG.ALERT_MONITORING_INTERVAL });
        } catch (e) {
            log('WARN', 'Alert system could not initialize', { error: e.message });
        }

        server.listen(CONFIG.PORT, '0.0.0.0', () => {
            console.log(`🚀 VIGIL v3.0.0 running on port ${CONFIG.PORT}`);
        });
    } catch (e) {
        log('ERROR', 'Startup failed', { error: e.message });
        process.exit(1);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────────────────────
async function shutdown(signal) {
    log('INFO', `${signal} — shutting down`);
    alerts.stopMonitoring();
    server.close(() => pool.end(() => process.exit(0)));
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

startup();
export default app;