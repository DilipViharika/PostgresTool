export const mockConnections = [
    { pid: 14023, user: 'postgres', db: 'production', app: 'pgAdmin 4', state: 'active', duration: '00:00:04', query: "SELECT * FROM pg_stat_activity WHERE state = 'active';", ip: '192.168.1.5' },
    { pid: 14099, user: 'app_user', db: 'production', app: 'NodeJS Backend', state: 'idle in transaction', duration: '00:15:23', query: "UPDATE orders SET status = 'processing' WHERE id = 4591;", ip: '10.0.0.12' },
    { pid: 15102, user: 'analytics', db: 'warehouse', app: 'Metabase', state: 'active', duration: '00:42:10', query: 'SELECT region, SUM(amount) FROM sales GROUP BY region ORDER BY 2 DESC;', ip: '10.0.0.8' },
    { pid: 15201, user: 'app_user', db: 'production', app: 'Go Worker', state: 'active', duration: '00:00:01', query: "INSERT INTO logs (level, msg) VALUES ('info', 'Job started');", ip: '10.0.0.15' },
];

export const mockErrorLogs = [
    { id: 101, type: 'Connection Timeout', timestamp: '10:42:15', user: 'app_svc', db: 'production', query: 'SELECT * FROM large_table_v2...', detail: 'Client closed connection before response' },
    { id: 102, type: 'Deadlock Detected', timestamp: '10:45:22', user: 'worker_01', db: 'warehouse', query: 'UPDATE inventory SET stock = stock - 1...', detail: 'Process 14022 waits for ShareLock on transaction 99201' },
];

export const missingIndexesData = [
    { id: 1, table: 'orders', column: 'customer_id', impact: 'Critical', scans: '1.2M', improvement: '94%', recommendation: 'Create B-Tree index concurrently on customer_id.' },
    { id: 2, table: 'transactions', column: 'created_at', impact: 'High', scans: '850k', improvement: '98%', recommendation: 'BRIN index recommended for time-series data.' },
];

export const unusedIndexesData = [
    { id: 1, table: 'users', indexName: 'idx_users_last_login_old', size: '450MB', lastUsed: '2023-11-04', recommendation: 'Safe to drop. Index has not been accessed in over 90 days.' },
    { id: 2, table: 'orders', indexName: 'idx_orders_temp_v2', size: '1.2GB', lastUsed: 'Never', recommendation: 'High Impact: Drop immediately.' },
];

export const lowHitRatioData = [
    { id: 1, table: 'large_audit_logs', ratio: 12, total_scans: '5.4M', problem_query: "SELECT * FROM large_audit_logs WHERE event_data LIKE '%error%'", recommendation: 'Leading wildcard forces Seq Scan.' },
];

export const apiQueryData = [
    {
        id: 'api_1', method: 'GET', endpoint: '/api/v1/dashboard/stats', avg_duration: 320, calls_per_min: 850, db_time_pct: 85,
        queries: [{ sql: "SELECT count(*) FROM orders WHERE status = 'pending'", calls: 1, duration: 120 }],
        ai_insight: 'Heavy aggregation on payments table. Consider creating a materialized view.'
    },
    {
        id: 'api_2', method: 'POST', endpoint: '/api/v1/orders/create', avg_duration: 180, calls_per_min: 120, db_time_pct: 60,
        queries: [{ sql: 'BEGIN TRANSACTION', calls: 1, duration: 2 }],
        ai_insight: 'Detected N+1 Query issue.'
    }
];

export const initialUsers = [
    {
        id: 1, email: 'admin', name: 'System Administrator', role: 'Super Admin', accessLevel: 'write',
        // This ensures ALL sections are visible for the admin
        allowedScreens: ['overview', 'performance', 'resources', 'reliability', 'indexes', 'api', 'admin']
    },
    {
        id: 2, email: 'analyst@sys.local', name: 'Data Analyst', role: 'User', accessLevel: 'read',
        allowedScreens: ['overview', 'performance', 'api']
    }
];