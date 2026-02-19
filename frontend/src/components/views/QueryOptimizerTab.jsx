import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { postData } from '../../utils/api';
import {
    Zap, Search, Play, Clock, Database, Server,
    AlertTriangle, CheckCircle, ArrowRight, Activity,
    Layers, Cpu, HardDrive, Filter, TrendingUp,
    History, Save, ChevronRight, ChevronDown,
    Maximize2, Minimize2, Info, X, Share2,
    FileText, Settings, BarChart3, HelpCircle,
    Target, Sparkles, AlertCircle, ArrowUpRight,
    GitCompare, Lightbulb, RefreshCw, Users,
    Eye, Code2, Table, Columns, Plus, Trash2,
    ChevronLeft, Download, Copy, Check, BookOpen,
    Terminal, TrendingDown, Gauge, Network,
    Lock, Unlock, Star, Hash, Flame, Tag,
    Wrench, ShieldAlert, SlidersHorizontal,
    TimerReset, Workflow, PackageOpen, Boxes,
    SquareSlash, CircleDot, Siren, Hourglass,
    XCircle, RotateCcw, Award, Percent
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const OptimizerStyles = () => (
    <style>{`
        @keyframes optFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes optSlideRight { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes optPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes optGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes optSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes scoreReveal { from { stroke-dashoffset: 283; } to { } }
        @keyframes flamePop { 0% { transform: scaleY(0); transform-origin: bottom; } 100% { transform: scaleY(1); } }

        .opt-card {
            background: ${THEME.glass};
            backdrop-filter: blur(16px) saturate(180%);
            border: 1px solid ${THEME.glassBorder};
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .opt-card:hover {
            box-shadow: 0 4px 24px rgba(0,0,0,0.18);
            border-color: ${THEME.primary}35;
        }
        .opt-tab-btn { transition: all 0.18s; cursor: pointer; }
        .opt-tab-btn:hover { opacity: 1 !important; }
        .plan-node { position: relative; transition: all 0.2s; }
        .plan-node:hover > .node-content {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px ${THEME.primary}15;
            border-color: ${THEME.primary}50;
        }
        .plan-tree-line {
            position: absolute;
            left: 24px; top: 40px; bottom: -20px;
            width: 2px;
            background: linear-gradient(180deg, ${THEME.grid}80, transparent);
        }
        .stat-bar-bg { background: ${THEME.surface}; border-radius: 4px; overflow: hidden; height: 6px; }
        .stat-bar-fill {
            height: 100%; border-radius: 4px;
            animation: optGrow 0.8s cubic-bezier(0.4,0,0.2,1) forwards;
            transform-origin: left;
        }
        .sql-editor {
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
            caret-color: ${THEME.primary};
            line-height: 1.7;
        }
        .sql-editor::selection { background: ${THEME.primary}30; }
        .opt-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .opt-scroll::-webkit-scrollbar-thumb { background: ${THEME.grid}; border-radius: 3px; }
        .opt-scroll::-webkit-scrollbar-thumb:hover { background: ${THEME.textDim}; }
        .opt-row-hover:hover { background: ${THEME.primary}08 !important; }
        .opt-btn { transition: all 0.15s; cursor: pointer; }
        .opt-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .opt-btn:active { transform: translateY(0); filter: brightness(0.95); }
        .skeleton {
            background: linear-gradient(90deg, ${THEME.surface} 25%, ${THEME.grid}60 50%, ${THEME.surface} 75%);
            background-size: 200% 100%;
            animation: shimmer 1.4s infinite;
        }
        .active-user-dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: ${THEME.danger};
            animation: optPulse 1.5s infinite;
            display: inline-block; flex-shrink: 0;
        }
        .flame-bar {
            transform-origin: bottom;
            animation: flamePop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .score-ring {
            animation: scoreReveal 1.2s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .lock-chain-line {
            stroke: ${THEME.danger};
            stroke-dasharray: 4 3;
            animation: optPulse 2s infinite;
        }
        .config-row-changed { background: ${THEME.warning}08 !important; }
        .tag-pill {
            padding: 1px 7px; border-radius: 10px; font-size: 9px; font-weight: 700;
            cursor: pointer; transition: all 0.15s;
        }
        .tag-pill:hover { filter: brightness(1.2); }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */
const formatDuration = (ms) => {
    if (!ms && ms !== 0) return '—';
    if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
    return `${ms.toFixed(2)}ms`;
};
const formatRows = (num) => {
    if (num === undefined || num === null) return '—';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toString();
};
const formatBytes = (b) => {
    if (!b) return '0 B';
    if (b >= 1073741824) return `${(b / 1073741824).toFixed(1)} GB`;
    if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
    if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${b} B`;
};
const getCostColor = (ratio) => {
    if (ratio > 0.7) return THEME.danger;
    if (ratio > 0.35) return THEME.warning;
    return THEME.success;
};
const getSeverityIcon = (type) => {
    if (type === 'danger') return <AlertTriangle size={13} color={THEME.danger} />;
    if (type === 'warning') return <AlertCircle size={13} color={THEME.warning} />;
    if (type === 'info') return <Info size={13} color={THEME.info || THEME.primary} />;
    return <CheckCircle size={13} color={THEME.success} />;
};

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const generateMockPlan = (query) => {
    const isComplex = query.toLowerCase().includes('join') || query.toLowerCase().includes('group');
    return {
        "Plan": {
            "Node Type": "Limit",
            "Startup Cost": 0.00,
            "Total Cost": isComplex ? 342.80 : 124.50,
            "Plan Rows": 10,
            "Actual Startup Time": 0.02,
            "Actual Total Time": isComplex ? 287.4 : 145.2,
            "Actual Rows": 10,
            "Shared Hit Blocks": 450,
            "Shared Read Blocks": 120,
            "Temp Written Blocks": isComplex ? 34 : 0,
            "Workers Launched": isComplex ? 2 : 0,
            "Plans": [{
                "Node Type": isComplex ? "Hash Join" : "Nested Loop",
                "Parent Relationship": "Outer",
                "Startup Cost": 0.00,
                "Total Cost": isComplex ? 340.00 : 124.50,
                "Plan Rows": 100,
                "Actual Startup Time": 0.8,
                "Actual Total Time": isComplex ? 286.9 : 145.1,
                "Actual Rows": 100,
                "Hash Cond": isComplex ? "(o.user_id = u.id)" : null,
                "Plans": [
                    {
                        "Node Type": "Seq Scan",
                        "Parent Relationship": "Outer",
                        "Relation Name": "users",
                        "Alias": "u",
                        "Startup Cost": 0.00,
                        "Total Cost": isComplex ? 185.00 : 45.00,
                        "Plan Rows": isComplex ? 15000 : 5000,
                        "Actual Rows": isComplex ? 15000 : 5000,
                        "Actual Total Time": isComplex ? 120.3 : 40.1,
                        "Filter": "(active = true)",
                        "Rows Removed by Filter": isComplex ? 3200 : 800,
                        "Shared Hit Blocks": 180, "Shared Read Blocks": 60,
                    },
                    {
                        "Node Type": "Index Scan",
                        "Parent Relationship": "Inner",
                        "Relation Name": "orders",
                        "Alias": "o",
                        "Index Name": "orders_user_id_idx",
                        "Startup Cost": 0.43,
                        "Total Cost": isComplex ? 12.80 : 0.45,
                        "Plan Rows": 5, "Actual Rows": 2,
                        "Actual Total Time": isComplex ? 8.2 : 1.1,
                        "Index Cond": "(user_id = u.id)",
                        "Shared Hit Blocks": 12, "Shared Read Blocks": 3,
                    }
                ]
            }]
        },
        "Planning Time": isComplex ? 3.4 : 1.2,
        "Execution Time": isComplex ? 287.4 : 145.2,
        "Triggers": [],
        "JIT": {
            "Worker Number": -1, "Functions": 4,
            "Options": { "Inlining": false, "Optimization": false, "Expressions": true, "Deforming": true }
        }
    };
};

const MOCK_INDEXES = [
    { table: 'users', column: 'active', type: 'btree', size: '4.2 MB', scans: 12450, bloat: '8%', status: 'healthy' },
    { table: 'users', column: 'email', type: 'btree', size: '8.1 MB', scans: 45200, bloat: '3%', status: 'healthy' },
    { table: 'orders', column: 'user_id', type: 'btree', size: '12.5 MB', scans: 89340, bloat: '2%', status: 'healthy' },
    { table: 'orders', column: 'created_at', type: 'brin', size: '0.2 MB', scans: 3210, bloat: '0%', status: 'healthy' },
    { table: 'products', column: 'name', type: 'gin', size: '22.8 MB', scans: 180, bloat: '34%', status: 'bloated' },
    { table: 'sessions', column: 'token', type: 'hash', size: '6.4 MB', scans: 0, bloat: '0%', status: 'unused' },
];

const MOCK_TABLE_STATS = [
    { table: 'users', rows: 185000, size: '142 MB', dead_tuples: 1240, last_vacuum: '2h ago', seq_scans: 8420, idx_scans: 45200 },
    { table: 'orders', rows: 4200000, size: '2.4 GB', dead_tuples: 84200, last_vacuum: '14h ago', seq_scans: 120, idx_scans: 892000 },
    { table: 'products', rows: 12400, size: '38 MB', dead_tuples: 82, last_vacuum: '1d ago', seq_scans: 3400, idx_scans: 18200 },
    { table: 'sessions', rows: 920000, size: '860 MB', dead_tuples: 420000, last_vacuum: '5d ago', seq_scans: 0, idx_scans: 920000 },
];

const SAMPLE_QUERIES = [
    { label: 'Basic JOIN', sql: `SELECT u.name, u.email, COUNT(o.id) AS order_count\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE u.active = true\nGROUP BY u.id, u.name, u.email\nORDER BY order_count DESC\nLIMIT 20;` },
    { label: 'Window Function', sql: `SELECT\n  product_id,\n  sale_date,\n  amount,\n  SUM(amount) OVER (\n    PARTITION BY product_id\n    ORDER BY sale_date\n    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n  ) AS rolling_7d\nFROM sales\nORDER BY product_id, sale_date;` },
    { label: 'CTE + Subquery', sql: `WITH top_customers AS (\n  SELECT user_id, SUM(total) AS ltv\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY user_id\n  HAVING SUM(total) > 1000\n)\nSELECT u.name, u.email, tc.ltv\nFROM users u\nJOIN top_customers tc ON tc.user_id = u.id\nORDER BY tc.ltv DESC;` },
    { label: 'Heavy Aggregation', sql: `SELECT\n  DATE_TRUNC('day', created_at) AS day,\n  status,\n  COUNT(*) AS count,\n  AVG(total) AS avg_total,\n  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total) AS p95\nFROM orders\nWHERE created_at >= NOW() - INTERVAL '30 days'\nGROUP BY 1, 2\nORDER BY 1 DESC, 2;` },
];

const MOCK_SLOW_QUERIES = [
    { id: 1, query: 'SELECT * FROM orders o JOIN users u ON u.id = o.user_id WHERE u.active = true ORDER BY o.created_at DESC', calls: 8420, mean_time: 287.4, p95_time: 412.8, p99_time: 891.2, total_time: 2419908, rows: 142, stddev: 64.2, tags: ['no-index', 'seq-scan'], db: 'production' },
    { id: 2, query: 'SELECT product_id, SUM(qty) FROM order_items GROUP BY product_id HAVING SUM(qty) > 100', calls: 3210, mean_time: 145.2, p95_time: 198.4, p99_time: 344.1, total_time: 466192, rows: 843, stddev: 22.8, tags: ['aggregation'], db: 'production' },
    { id: 3, query: 'UPDATE sessions SET last_seen = NOW() WHERE token = $1', calls: 124500, mean_time: 12.4, p95_time: 28.9, p99_time: 84.2, total_time: 1543800, rows: 1, stddev: 8.1, tags: ['hot-table'], db: 'production' },
    { id: 4, query: 'SELECT u.*, p.* FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.created_at > $1', calls: 890, mean_time: 634.8, p95_time: 1240.0, p99_time: 2890.4, total_time: 565012, rows: 4820, stddev: 198.4, tags: ['no-index', 'wide-select'], db: 'production' },
    { id: 5, query: 'DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL \'90 days\'', calls: 24, mean_time: 4821.0, p95_time: 6200.0, p99_time: 7100.0, total_time: 115704, rows: 284200, stddev: 812.4, tags: ['bulk-delete', 'locks'], db: 'production' },
    { id: 6, query: 'SELECT DISTINCT category, COUNT(*) FROM products WHERE status = \'active\' GROUP BY category ORDER BY 2 DESC', calls: 18200, mean_time: 89.2, p95_time: 142.4, p99_time: 198.8, total_time: 1623440, rows: 48, stddev: 18.4, tags: ['aggregation', 'seq-scan'], db: 'analytics' },
];

const MOCK_LOCKS = [
    { pid: 18432, state: 'active', wait_event: null, lock_type: 'relation', granted: true, duration: 0.2, query: 'UPDATE orders SET status = $1 WHERE id = $2', relation: 'orders', mode: 'RowExclusiveLock', blocking: [19841, 20012] },
    { pid: 19841, state: 'idle in transaction', wait_event: 'relation', lock_type: 'relation', granted: false, duration: 12.8, query: 'SELECT * FROM orders WHERE user_id = $1 FOR UPDATE', relation: 'orders', mode: 'RowShareLock', blocked_by: 18432 },
    { pid: 20012, state: 'active', wait_event: 'relation', lock_type: 'relation', granted: false, duration: 8.4, query: 'UPDATE orders SET total = total * 1.1 WHERE created_at > $1', relation: 'orders', mode: 'RowExclusiveLock', blocked_by: 18432 },
    { pid: 21044, state: 'active', wait_event: null, lock_type: 'relation', granted: true, duration: 0.1, query: 'SELECT COUNT(*) FROM users WHERE active = true', relation: 'users', mode: 'AccessShareLock', blocking: [] },
    { pid: 21890, state: 'active', wait_event: null, lock_type: 'relation', granted: true, duration: 2.1, query: 'INSERT INTO audit_log (event, user_id, ts) VALUES ($1, $2, NOW())', relation: 'audit_log', mode: 'RowExclusiveLock', blocking: [] },
];

const MOCK_MAINTENANCE = [
    { table: 'users', size: '142 MB', dead_tuples: 1240, live_tuples: 185000, bloat_pct: 3.2, last_vacuum: '2h ago', last_autovacuum: '6h ago', last_analyze: '6h ago', next_vacuum_at: 185000 * 0.2, vacuum_count: 48, needs_vacuum: false },
    { table: 'orders', size: '2.4 GB', dead_tuples: 84200, live_tuples: 4200000, bloat_pct: 14.8, last_vacuum: '14h ago', last_autovacuum: '14h ago', last_analyze: '14h ago', next_vacuum_at: 4200000 * 0.2, vacuum_count: 12, needs_vacuum: false },
    { table: 'products', size: '38 MB', dead_tuples: 82, live_tuples: 12400, bloat_pct: 0.8, last_vacuum: '1d ago', last_autovacuum: '1d ago', last_analyze: '1d ago', next_vacuum_at: 12400 * 0.2, vacuum_count: 210, needs_vacuum: false },
    { table: 'sessions', size: '860 MB', dead_tuples: 420000, live_tuples: 920000, bloat_pct: 48.2, last_vacuum: '5d ago', last_autovacuum: '5d ago', last_analyze: '5d ago', next_vacuum_at: 920000 * 0.2, vacuum_count: 3, needs_vacuum: true },
    { table: 'audit_log', size: '4.2 GB', dead_tuples: 1840000, live_tuples: 12000000, bloat_pct: 22.4, last_vacuum: '3d ago', last_autovacuum: '3d ago', last_analyze: '3d ago', next_vacuum_at: 12000000 * 0.2, vacuum_count: 8, needs_vacuum: true },
];

const MOCK_PG_CONFIG = [
    { name: 'shared_buffers', current: '128MB', recommended: '4GB', category: 'Memory', impact: 'HIGH', desc: 'Main PostgreSQL memory cache. Should be ~25% of total RAM.', unit: 'memory' },
    { name: 'work_mem', current: '4MB', recommended: '64MB', category: 'Memory', impact: 'HIGH', desc: 'Memory for sort/hash operations per query. Low values cause disk spills.', unit: 'memory' },
    { name: 'effective_cache_size', current: '512MB', recommended: '12GB', category: 'Planner', impact: 'MEDIUM', desc: 'Planner estimate of total cache. Affects index vs seq scan decisions.', unit: 'memory' },
    { name: 'max_parallel_workers_per_gather', current: '2', recommended: '4', category: 'Parallelism', impact: 'MEDIUM', desc: 'Max parallel workers per query. Increase for large analytical queries.', unit: 'integer' },
    { name: 'random_page_cost', current: '4.0', recommended: '1.1', category: 'Planner', impact: 'HIGH', desc: 'If using SSDs, lower this to 1.1. Planner prefers seq scans when too high.', unit: 'float' },
    { name: 'checkpoint_completion_target', current: '0.5', recommended: '0.9', category: 'WAL', impact: 'MEDIUM', desc: 'Spreads checkpoints over more time to reduce I/O spikes.', unit: 'float' },
    { name: 'wal_buffers', current: '4MB', recommended: '64MB', category: 'WAL', impact: 'LOW', desc: 'WAL buffer size. -1 = auto (1/32 shared_buffers). Increase for write-heavy.', unit: 'memory' },
    { name: 'autovacuum_vacuum_scale_factor', current: '0.2', recommended: '0.05', category: 'Autovacuum', impact: 'HIGH', desc: 'Fraction of table rows that trigger vacuum. 0.2 is too high for large tables.', unit: 'float' },
    { name: 'log_min_duration_statement', current: '-1', recommended: '1000', category: 'Logging', impact: 'LOW', desc: 'Log queries slower than N ms. -1 disables. Set to catch slow queries.', unit: 'integer' },
    { name: 'max_connections', current: '100', recommended: '200', category: 'Connections', impact: 'MEDIUM', desc: 'Maximum client connections. Use PgBouncer for connection pooling.', unit: 'integer' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYSIS ENGINE
   ═══════════════════════════════════════════════════════════════════════════ */
const analyzePlan = (result) => {
    const insights = [], indexRecommendations = [], rewrites = [];

    const walk = (node) => {
        if (!node) return;
        if (node["Node Type"] === "Seq Scan") {
            const rows = node["Actual Rows"] || node["Plan Rows"] || 0;
            if (rows > 1000 || (node["Total Cost"] || 0) > 50) {
                insights.push({ type: 'danger', category: 'Performance', title: 'Full Table Scan Detected', desc: `Sequential scan on "${node["Relation Name"]}" reading ${formatRows(rows)} rows. An index on filter/join columns would dramatically reduce I/O.`, node: node["Relation Name"], impact: 'HIGH', fix: `CREATE INDEX CONCURRENTLY idx_${node["Relation Name"]}_filter\n  ON ${node["Relation Name"]} (active); -- adjust column name` });
                indexRecommendations.push({ table: node["Relation Name"], suggestion: `CREATE INDEX CONCURRENTLY idx_${node["Relation Name"]}_filter\n  ON ${node["Relation Name"]} (/* your filter column */);`, reason: `Eliminates sequential scan of ${formatRows(rows)} rows`, estimatedGain: '60–90% cost reduction' });
            }
        }
        if (node["Actual Rows"] > 0 && node["Plan Rows"] > 0) {
            const ratio = Math.abs(node["Actual Rows"] - node["Plan Rows"]) / node["Actual Rows"];
            if (ratio > 5) insights.push({ type: 'danger', category: 'Statistics', title: 'Stale Planner Statistics', desc: `Planner expected ${formatRows(node["Plan Rows"])} rows but got ${formatRows(node["Actual Rows"])}. Run ANALYZE to refresh stats.`, node: node["Relation Name"], impact: 'HIGH', fix: `ANALYZE ${node["Relation Name"] || ''};` });
        }
        if (node["Node Type"] === "Hash Join" && (node["Temp Written Blocks"] || 0) > 0) {
            insights.push({ type: 'warning', category: 'Memory', title: 'Hash Join Spilling to Disk', desc: `Wrote ${node["Temp Written Blocks"]} temp blocks to disk. Increasing work_mem will keep this in RAM.`, impact: 'MEDIUM', fix: `SET work_mem = '${Math.max(64, ((node["Temp Written Blocks"] || 0) * 8 / 1024 * 4)).toFixed(0)}MB';` });
        }
        if (node["Node Type"] === "Nested Loop" && (node["Actual Rows"] || 0) > 10000) {
            insights.push({ type: 'warning', category: 'Join Strategy', title: 'Nested Loop on Large Dataset', desc: `Nested loop with ${formatRows(node["Actual Rows"])} rows is O(n²). Hash Join may be more efficient for this cardinality.`, impact: 'MEDIUM', fix: `SET enable_nestloop = off; -- force planner to try alternatives` });
        }
        if ((node["Rows Removed by Filter"] || 0) > (node["Actual Rows"] || 1) * 2) {
            insights.push({ type: 'warning', category: 'Filter Efficiency', title: 'High Filter Rejection Rate', desc: `Filter removed ${formatRows(node["Rows Removed by Filter"])} rows from "${node["Relation Name"]}". A partial or composite index would reduce rows read.`, node: node["Relation Name"], impact: 'MEDIUM' });
        }
        if ((node["Workers Launched"] === 0) && (node["Actual Total Time"] || 0) > 500) {
            insights.push({ type: 'info', category: 'Parallelism', title: 'Parallel Query Not Used', desc: 'This slow query ran single-threaded. Raising max_parallel_workers_per_gather may help.', impact: 'LOW', fix: `SET max_parallel_workers_per_gather = 4;` });
        }
        if (node.Plans) node.Plans.forEach(walk);
    };

    walk(result?.Plan);

    rewrites.push({ title: 'Use a covering index to avoid heap fetch', desc: 'Include all projected columns in the index to avoid going back to the table (Index-Only Scan).', example: `CREATE INDEX CONCURRENTLY idx_orders_cover\n  ON orders (user_id)\n  INCLUDE (id, total, status, created_at);` });

    if (insights.some(i => i.category === 'Statistics')) {
        rewrites.push({ title: 'Refresh table statistics', desc: 'Planner estimates are stale. Run targeted ANALYZE or adjust autovacuum thresholds.', example: `ANALYZE users;\nANALYZE orders;\n\n-- For high-write tables, lower autovacuum threshold:\nALTER TABLE orders SET (\n  autovacuum_analyze_scale_factor = 0.01\n);` });
    }

    return { insights, indexRecommendations, rewrites };
};

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

// Recursive plan tree node
const PlanNode = ({ node, maxCost, totalTime, depth = 0 }) => {
    const [expanded, setExpanded] = useState(true);
    const costRatio = node["Total Cost"] / (maxCost || 1);
    const timeRatio = (node["Actual Total Time"] || 0) / (totalTime || 1);
    const isSeqScan = node["Node Type"] === "Seq Scan";
    const color = getCostColor(costRatio);

    const misest = node["Actual Rows"] > 0
        ? Math.abs((node["Plan Rows"] || 0) - node["Actual Rows"]) / node["Actual Rows"]
        : 0;
    const badEstimate = misest > 5;

    const NodeIcon = useMemo(() => {
        const t = node["Node Type"];
        if (t.includes("Scan")) return Search;
        if (t.includes("Join") || t.includes("Loop")) return Network;
        if (t.includes("Sort")) return Filter;
        if (t.includes("Aggregate") || t.includes("Group")) return BarChart3;
        if (t.includes("Hash")) return Hash;
        return Activity;
    }, [node]);

    return (
        <div className="plan-node" style={{ paddingLeft: depth ? 32 : 0, position: 'relative' }}>
            {depth > 0 && (
                <div style={{ position: 'absolute', left: 0, top: 24, width: 24, height: 2, background: `${THEME.grid}80` }} />
            )}
            {node.Plans && expanded && (
                <div className="plan-tree-line" style={{ left: depth ? 56 : 24 }} />
            )}

            <div
                className="node-content opt-card"
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                style={{
                    padding: '10px 14px', borderRadius: 10, marginBottom: 10,
                    cursor: 'pointer', borderLeft: `4px solid ${color}`,
                    background: `linear-gradient(135deg, ${THEME.surface}f8 0%, ${THEME.surface}ee 100%)`
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <NodeIcon size={14} color={color} />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                {node["Node Type"]}
                                {node["Relation Name"] && <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 400 }}>→ {node["Relation Name"]}</span>}
                                {node["Index Name"] && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${THEME.success}20`, color: THEME.success, fontWeight: 700 }}>IDX</span>}
                                {badEstimate && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${THEME.danger}20`, color: THEME.danger, fontWeight: 700 }}>MISEST</span>}
                                {node["Parallel Aware"] && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${THEME.primary}20`, color: THEME.primary, fontWeight: 700 }}>PARALLEL</span>}
                            </div>
                            <div style={{ fontSize: 10, color: THEME.textMuted, display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={9} /> {formatDuration(node["Actual Total Time"] || 0)}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Database size={9} /> {formatRows(node["Actual Rows"] || 0)} rows</span>
                                {node["Filter"] && <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: THEME.warning }}><Filter size={9} /> {node["Filter"]}</span>}
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color }}>{node["Total Cost"].toFixed(1)}</div>
                        <div style={{ fontSize: 9, color: THEME.textMuted }}>{(costRatio * 100).toFixed(0)}% total</div>
                        {node.Plans && <div style={{ marginTop: 3, color: THEME.textMuted }}>{expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}</div>}
                    </div>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 3 }}>
                    <div style={{ flex: 1, height: 3, background: `${THEME.grid}40`, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, costRatio * 100)}%`, height: '100%', background: color }} />
                    </div>
                    <div style={{ flex: 1, height: 3, background: `${THEME.grid}40`, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, timeRatio * 100)}%`, height: '100%', background: THEME.primary }} />
                    </div>
                </div>
            </div>

            {expanded && node.Plans && (
                <div style={{ animation: 'optFadeIn 0.2s' }}>
                    {node.Plans.map((child, i) => (
                        <PlanNode key={i} node={child} maxCost={maxCost} totalTime={totalTime} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Cost bar chart
const CostBreakdownChart = ({ plan }) => {
    const nodes = [];
    const flatten = (n) => {
        if (!n) return;
        nodes.push({
            label: `${n["Node Type"]}${n["Relation Name"] ? ` (${n["Relation Name"]})` : ''}`,
            cost: n["Total Cost"], time: n["Actual Total Time"] || 0
        });
        if (n.Plans) n.Plans.forEach(flatten);
    };
    flatten(plan?.Plan);
    const maxCost = Math.max(...nodes.map(n => n.cost), 1);
    const maxTime = Math.max(...nodes.map(n => n.time), 1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 140 }} />
                <div style={{ flex: 1, fontSize: 9, color: THEME.textDim, fontWeight: 700, textTransform: 'uppercase' }}>Cost</div>
                <div style={{ flex: 1, fontSize: 9, color: THEME.textDim, fontWeight: 700, textTransform: 'uppercase' }}>Time</div>
            </div>
            {nodes.slice(0, 8).map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 140, fontSize: 10, color: THEME.textMuted, textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.label}</div>
                    <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center' }}>
                        <div style={{ flex: 1, height: 10, background: `${THEME.grid}40`, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${(n.cost / maxCost) * 100}%`, height: '100%', background: getCostColor(n.cost / maxCost), borderRadius: 3 }} />
                        </div>
                        <span style={{ width: 48, fontSize: 9, color: THEME.textMuted, textAlign: 'right' }}>{n.cost.toFixed(1)}</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center' }}>
                        <div style={{ flex: 1, height: 10, background: `${THEME.grid}40`, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${(n.time / maxTime) * 100}%`, height: '100%', background: THEME.primary, borderRadius: 3 }} />
                        </div>
                        <span style={{ width: 48, fontSize: 9, color: THEME.textMuted, textAlign: 'right' }}>{formatDuration(n.time)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Analysis Insights Panel
const InsightsPanel = ({ insights, rewrites, indexRecs }) => {
    const [section, setSection] = useState('issues');
    const [copiedIdx, setCopiedIdx] = useState(null);
    const copy = (text, key) => { navigator.clipboard?.writeText(text).catch(() => {}); setCopiedIdx(key); setTimeout(() => setCopiedIdx(null), 1800); };

    const tabs = [
        { id: 'issues', label: 'Issues', count: insights.length },
        { id: 'indexes', label: 'Index Recs', count: indexRecs.length },
        { id: 'rewrites', label: 'Rewrites', count: rewrites.length },
    ];
    const sorted = [...insights].sort((a, b) => ({ danger: 0, warning: 1, info: 2 }[a.type] - ({ danger: 0, warning: 1, info: 2 }[b.type] ?? 3)));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 2, padding: '8px 12px', borderBottom: `1px solid ${THEME.grid}`, flexShrink: 0 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setSection(t.id)} className="opt-tab-btn" style={{
                        padding: '4px 10px', borderRadius: 5, border: 'none', fontSize: 10, fontWeight: 600,
                        background: section === t.id ? `${THEME.primary}25` : 'transparent',
                        color: section === t.id ? THEME.primary : THEME.textDim, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5
                    }}>
                        {t.label}
                        {t.count > 0 && (
                            <span style={{ background: section === t.id ? THEME.primary : THEME.grid, color: section === t.id ? '#fff' : THEME.textMuted, borderRadius: 9, padding: '0 5px', fontSize: 8, fontWeight: 700 }}>
                                {t.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                {section === 'issues' && (
                    <>
                        {sorted.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 24, color: THEME.textDim }}>
                                <CheckCircle size={26} color={THEME.success} style={{ display: 'block', margin: '0 auto 8px' }} />
                                <div style={{ fontSize: 12, fontWeight: 600 }}>No issues found</div>
                                <div style={{ fontSize: 10, marginTop: 4 }}>Query plan looks optimal</div>
                            </div>
                        )}
                        {sorted.map((item, i) => (
                            <div key={i} style={{
                                marginBottom: 10, padding: 11, borderRadius: 8,
                                background: item.type === 'danger' ? `${THEME.danger}08` : item.type === 'warning' ? `${THEME.warning}08` : `${THEME.primary}08`,
                                border: `1px solid ${item.type === 'danger' ? THEME.danger : item.type === 'warning' ? THEME.warning : THEME.primary}25`,
                                animation: `optFadeIn 0.3s ${i * 0.04}s both`
                            }}>
                                <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 5 }}>
                                    {getSeverityIcon(item.type)}
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain }}>{item.title}</div>
                                        <div style={{ fontSize: 9, color: THEME.textDim, marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.category} · {item.impact} IMPACT</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 10, color: THEME.textMuted, lineHeight: 1.5, marginBottom: item.fix ? 8 : 0 }}>{item.desc}</div>
                                {item.fix && (
                                    <div style={{ position: 'relative' }}>
                                        <pre style={{ fontSize: 9, fontFamily: 'monospace', background: `${THEME.bg}80`, borderRadius: 5, padding: '6px 28px 6px 8px', color: THEME.success, margin: 0, whiteSpace: 'pre-wrap', border: `1px solid ${THEME.grid}40` }}>{item.fix}</pre>
                                        <button onClick={() => copy(item.fix, `fix-${i}`)} style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 2 }}>
                                            {copiedIdx === `fix-${i}` ? <Check size={10} color={THEME.success} /> : <Copy size={10} />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {section === 'indexes' && (
                    indexRecs.length === 0
                        ? <div style={{ textAlign: 'center', padding: 24, color: THEME.textDim, fontSize: 12 }}>No index recommendations</div>
                        : indexRecs.map((rec, i) => (
                            <div key={i} style={{ marginBottom: 10, padding: 11, borderRadius: 8, background: `${THEME.primary}06`, border: `1px solid ${THEME.primary}20` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                    <Layers size={12} color={THEME.primary} />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain }}>→ {rec.table}</span>
                                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${THEME.success}20`, color: THEME.success }}>{rec.estimatedGain}</span>
                                </div>
                                <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 7 }}>{rec.reason}</div>
                                <div style={{ position: 'relative' }}>
                                    <pre style={{ fontSize: 9, fontFamily: 'monospace', background: `${THEME.bg}80`, borderRadius: 5, padding: '6px 28px 6px 8px', color: THEME.success, margin: 0, whiteSpace: 'pre-wrap', border: `1px solid ${THEME.grid}40` }}>{rec.suggestion}</pre>
                                    <button onClick={() => copy(rec.suggestion, `idx-${i}`)} style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 2 }}>
                                        {copiedIdx === `idx-${i}` ? <Check size={10} color={THEME.success} /> : <Copy size={10} />}
                                    </button>
                                </div>
                            </div>
                        ))
                )}

                {section === 'rewrites' && rewrites.map((rw, i) => (
                    <div key={i} style={{ marginBottom: 10, padding: 11, borderRadius: 8, background: `${THEME.warning}06`, border: `1px solid ${THEME.warning}20` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                            <Lightbulb size={12} color={THEME.warning} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain }}>{rw.title}</span>
                        </div>
                        <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 7 }}>{rw.desc}</div>
                        {rw.example && (
                            <div style={{ position: 'relative' }}>
                                <pre style={{ fontSize: 9, fontFamily: 'monospace', background: `${THEME.bg}80`, borderRadius: 5, padding: '6px 28px 6px 8px', color: THEME.primary, margin: 0, whiteSpace: 'pre-wrap', border: `1px solid ${THEME.grid}40` }}>{rw.example}</pre>
                                <button onClick={() => copy(rw.example, `rw-${i}`)} style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 2 }}>
                                    {copiedIdx === `rw-${i}` ? <Check size={10} color={THEME.success} /> : <Copy size={10} />}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Active users indicator — always shows 0 (no one using it)
const ActiveUsersBadge = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 5, background: `${THEME.success}12`, border: `1px solid ${THEME.success}30` }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.success, flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: THEME.success, fontWeight: 600 }}>Quiet — 0 active users</span>
    </div>
);

// Query Score Ring — grade A-F based on issue count/severity
const QueryScoreRing = ({ insights }) => {
    const dangerCount = insights.filter(i => i.type === 'danger').length;
    const warningCount = insights.filter(i => i.type === 'warning').length;
    const score = Math.max(0, 100 - dangerCount * 25 - warningCount * 10);
    const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 45 ? 'D' : 'F';
    const gradeColor = score >= 90 ? THEME.success : score >= 75 ? '#4ade80' : score >= 60 ? THEME.warning : score >= 45 ? '#f97316' : THEME.danger;
    const circumference = 2 * Math.PI * 28;
    const dashOffset = circumference - (score / 100) * circumference;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 8, background: `${gradeColor}10`, border: `1px solid ${gradeColor}30` }}>
            <svg width={52} height={52} style={{ flexShrink: 0 }}>
                <circle cx={26} cy={26} r={22} fill="none" stroke={`${gradeColor}20`} strokeWidth={4} />
                <circle cx={26} cy={26} r={22} fill="none" stroke={gradeColor} strokeWidth={4}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 26 26)"
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x={26} y={31} textAnchor="middle" fill={gradeColor} fontSize={18} fontWeight={800} fontFamily="monospace">{grade}</text>
            </svg>
            <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>Query Score</div>
                <div style={{ fontSize: 10, color: THEME.textDim }}>{score}/100 · {dangerCount} critical, {warningCount} warnings</div>
            </div>
        </div>
    );
};

// Flamegraph-style horizontal stacked visualizer
const FlameGraph = ({ plan }) => {
    const nodes = [];
    const flatten = (n, depth = 0) => {
        if (!n) return;
        nodes.push({ label: `${n["Node Type"]}${n["Relation Name"] ? ` · ${n["Relation Name"]}` : ''}`, cost: n["Total Cost"] || 0, time: n["Actual Total Time"] || 0, depth, rows: n["Actual Rows"] || 0 });
        if (n.Plans) n.Plans.forEach(p => flatten(p, depth + 1));
    };
    flatten(plan?.Plan);
    const maxDepth = Math.max(...nodes.map(n => n.depth), 0);
    const maxTime = Math.max(...nodes.map(n => n.time), 1);
    const FLAME_COLORS = [THEME.primary, THEME.warning, THEME.danger, '#a78bfa', '#34d399', '#f472b6'];

    return (
        <div>
            <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 10, display: 'flex', gap: 16, alignItems: 'center' }}>
                <span>Width = execution time proportion</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {['Root', 'Level 1', 'Level 2+'].map((l, i) => (
                        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: FLAME_COLORS[i] }} />{l}
                        </span>
                    ))}
                </span>
            </div>
            {nodes.map((n, i) => (
                <div key={i} title={`${n.label}\nTime: ${formatDuration(n.time)}\nRows: ${formatRows(n.rows)}`}
                     style={{
                         marginBottom: 3, marginLeft: `${n.depth * 20}px`,
                         width: `calc(${Math.max(4, (n.time / maxTime) * 100)}% - ${n.depth * 20}px)`,
                         height: 26, borderRadius: 4,
                         background: `${FLAME_COLORS[Math.min(n.depth, FLAME_COLORS.length - 1)]}cc`,
                         display: 'flex', alignItems: 'center', padding: '0 8px',
                         cursor: 'default', overflow: 'hidden',
                         border: `1px solid ${FLAME_COLORS[Math.min(n.depth, FLAME_COLORS.length - 1)]}40`,
                         animation: `flamePop 0.4s ${i * 0.06}s both`,
                         transition: 'filter 0.15s',
                         minWidth: 30,
                     }}
                     className="opt-btn"
                >
                    <span style={{ fontSize: 9, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {n.label} · {formatDuration(n.time)}
                    </span>
                </div>
            ))}
        </div>
    );
};

// Slow Query Log Panel
const SlowQueryPanel = ({ onLoadQuery }) => {
    const [sortBy, setSortBy] = useState('mean_time');
    const [selectedId, setSelectedId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [tagFilter, setTagFilter] = useState(null);

    const allTags = [...new Set(MOCK_SLOW_QUERIES.flatMap(q => q.tags))];
    const filtered = MOCK_SLOW_QUERIES
        .filter(q => !searchText || q.query.toLowerCase().includes(searchText.toLowerCase()))
        .filter(q => !tagFilter || q.tags.includes(tagFilter))
        .sort((a, b) => b[sortBy] - a[sortBy]);

    const selected = filtered.find(q => q.id === selectedId);
    const tagColors = { 'no-index': THEME.danger, 'seq-scan': THEME.warning, 'aggregation': THEME.primary, 'hot-table': '#a78bfa', 'wide-select': THEME.warning, 'bulk-delete': THEME.danger, 'locks': THEME.danger };

    return (
        <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
            {/* Left: Query list */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${THEME.grid}`, overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 120 }}>
                        <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: THEME.textDim }} />
                        <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search queries…"
                               style={{ width: '100%', background: `${THEME.surface}`, border: `1px solid ${THEME.grid}`, borderRadius: 5, padding: '5px 8px 5px 26px', fontSize: 10, color: THEME.textMain, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: THEME.surface, border: `1px solid ${THEME.grid}`, borderRadius: 5, padding: '4px 8px', fontSize: 10, color: THEME.textMain, cursor: 'pointer' }}>
                        <option value="mean_time">Sort: Mean Time</option>
                        <option value="p99_time">Sort: P99 Time</option>
                        <option value="total_time">Sort: Total Time</option>
                        <option value="calls">Sort: Calls</option>
                    </select>
                </div>
                {/* Tag filters */}
                <div style={{ padding: '6px 12px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', gap: 5, flexWrap: 'wrap', flexShrink: 0 }}>
                    <button onClick={() => setTagFilter(null)} className="tag-pill" style={{ background: !tagFilter ? `${THEME.primary}25` : `${THEME.grid}40`, color: !tagFilter ? THEME.primary : THEME.textDim, border: `1px solid ${!tagFilter ? THEME.primary : 'transparent'}` }}>All</button>
                    {allTags.map(tag => (
                        <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? null : tag)} className="tag-pill"
                                style={{ background: tagFilter === tag ? `${tagColors[tag] || THEME.primary}30` : `${THEME.grid}30`, color: tagFilter === tag ? (tagColors[tag] || THEME.primary) : THEME.textDim, border: `1px solid ${tagFilter === tag ? (tagColors[tag] || THEME.primary) : 'transparent'}` }}>
                            {tag}
                        </button>
                    ))}
                </div>

                <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                    {filtered.map((q, i) => (
                        <div key={q.id} onClick={() => setSelectedId(q.id === selectedId ? null : q.id)}
                             className="opt-row-hover"
                             style={{ padding: '10px 12px', borderBottom: `1px solid ${THEME.grid}25`, cursor: 'pointer', background: selectedId === q.id ? `${THEME.primary}08` : 'transparent', borderLeft: selectedId === q.id ? `3px solid ${THEME.primary}` : '3px solid transparent', animation: `optFadeIn 0.3s ${i * 0.04}s both` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 10, color: THEME.textMain, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{q.query}</div>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                        {q.tags.map(tag => (
                                            <span key={tag} className="tag-pill" style={{ background: `${tagColors[tag] || THEME.primary}20`, color: tagColors[tag] || THEME.primary }}>{tag}</span>
                                        ))}
                                        <span style={{ fontSize: 9, color: THEME.textDim }}>{q.db}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: q.mean_time > 500 ? THEME.danger : q.mean_time > 100 ? THEME.warning : THEME.success }}>{formatDuration(q.mean_time)}</div>
                                    <div style={{ fontSize: 9, color: THEME.textDim }}>{q.calls.toLocaleString()} calls</div>
                                </div>
                            </div>
                            {/* Sparkline of p50/p95/p99 */}
                            <div style={{ display: 'flex', gap: 3, marginTop: 6, alignItems: 'flex-end', height: 16 }}>
                                {[q.mean_time, q.p95_time, q.p99_time].map((val, j) => {
                                    const maxVal = q.p99_time;
                                    const h = Math.max(3, (val / maxVal) * 16);
                                    return <div key={j} style={{ width: 6, height: h, borderRadius: 1, background: j === 0 ? THEME.success : j === 1 ? THEME.warning : THEME.danger, flexShrink: 0 }} />;
                                })}
                                <span style={{ fontSize: 8, color: THEME.textDim, marginLeft: 4 }}>p50/p95/p99</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Detail panel */}
            {selected ? (
                <div className="opt-scroll" style={{ width: 340, overflowY: 'auto', padding: 16, flexShrink: 0 }}>
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.06em' }}>Query Text</div>
                        <pre style={{ fontSize: 10, fontFamily: 'monospace', color: THEME.textMain, background: `${THEME.bg}80`, borderRadius: 6, padding: 10, whiteSpace: 'pre-wrap', border: `1px solid ${THEME.grid}40`, margin: 0 }}>{selected.query}</pre>
                        <button onClick={() => onLoadQuery(selected.query)} className="opt-btn" style={{ marginTop: 8, width: '100%', padding: '6px', borderRadius: 5, border: `1px solid ${THEME.primary}40`, background: `${THEME.primary}15`, color: THEME.primary, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                            Load into Editor & Analyze →
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        {[
                            { label: 'Mean Time', value: formatDuration(selected.mean_time), color: THEME.primary },
                            { label: 'P95 Time', value: formatDuration(selected.p95_time), color: THEME.warning },
                            { label: 'P99 Time', value: formatDuration(selected.p99_time), color: THEME.danger },
                            { label: 'Total Time', value: formatDuration(selected.total_time), color: THEME.textDim },
                            { label: 'Calls', value: selected.calls.toLocaleString(), color: THEME.textMain },
                            { label: 'Avg Rows', value: formatRows(selected.rows), color: THEME.textMuted },
                        ].map((s, i) => (
                            <div key={i} style={{ padding: '8px 10px', borderRadius: 7, background: `${THEME.grid}25`, textAlign: 'center' }}>
                                <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase', marginBottom: 2 }}>{s.label}</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Time distribution bar */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', marginBottom: 8 }}>Time Distribution</div>
                        <div style={{ position: 'relative', height: 24, borderRadius: 4, overflow: 'hidden', background: `${THEME.grid}30` }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(selected.mean_time / selected.p99_time) * 100}%`, background: THEME.success, borderRadius: 4 }} />
                            <div style={{ position: 'absolute', left: `${(selected.mean_time / selected.p99_time) * 100}%`, top: 0, bottom: 0, width: `${((selected.p95_time - selected.mean_time) / selected.p99_time) * 100}%`, background: THEME.warning }} />
                            <div style={{ position: 'absolute', left: `${(selected.p95_time / selected.p99_time) * 100}%`, top: 0, bottom: 0, right: 0, background: THEME.danger, borderRadius: '0 4px 4px 0' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: THEME.textDim, marginTop: 4 }}>
                            <span style={{ color: THEME.success }}>p50: {formatDuration(selected.mean_time)}</span>
                            <span style={{ color: THEME.warning }}>p95: {formatDuration(selected.p95_time)}</span>
                            <span style={{ color: THEME.danger }}>p99: {formatDuration(selected.p99_time)}</span>
                        </div>
                    </div>

                    <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', marginBottom: 6 }}>StdDev: <span style={{ color: THEME.textMuted }}>{formatDuration(selected.stddev)}</span></div>
                </div>
            ) : (
                <div style={{ width: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: THEME.textDim }}>
                    <Flame size={28} opacity={0.3} />
                    <div style={{ fontSize: 11 }}>Select a query to inspect</div>
                </div>
            )}
        </div>
    );
};

// Lock Monitor Panel
const LockMonitorPanel = () => {
    const [selected, setSelected] = useState(null);
    const blockedCount = MOCK_LOCKS.filter(l => l.blocked_by).length;
    const blockingCount = MOCK_LOCKS.filter(l => l.blocking?.length > 0).length;

    const stateColor = (s) => s === 'active' ? THEME.success : s === 'idle in transaction' ? THEME.danger : THEME.warning;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Summary KPIs */}
            <div style={{ padding: '10px 16px', display: 'flex', gap: 12, borderBottom: `1px solid ${THEME.grid}`, flexShrink: 0 }}>
                {[
                    { label: 'Total Locks', value: MOCK_LOCKS.length, color: THEME.textMain, icon: Lock },
                    { label: 'Blocked', value: blockedCount, color: blockedCount > 0 ? THEME.danger : THEME.success, icon: XCircle },
                    { label: 'Blocking', value: blockingCount, color: blockingCount > 0 ? THEME.warning : THEME.success, icon: ShieldAlert },
                    { label: 'Idle in Txn', value: MOCK_LOCKS.filter(l => l.state === 'idle in transaction').length, color: THEME.warning, icon: Hourglass },
                ].map((k, i) => (
                    <div key={i} className="opt-card" style={{ flex: 1, padding: '8px 12px', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <k.icon size={16} color={k.color} />
                        <div>
                            <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase' }}>{k.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>{k.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lock chain visualization */}
            {blockedCount > 0 && (
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.grid}`, background: `${THEME.danger}05`, flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: THEME.danger, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Siren size={12} /> Lock Chain Detected
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {MOCK_LOCKS.filter(l => l.blocking?.length > 0).map(blocker => (
                            <React.Fragment key={blocker.pid}>
                                <div style={{ padding: '4px 10px', borderRadius: 6, background: `${THEME.danger}20`, border: `1px solid ${THEME.danger}40`, fontSize: 10, color: THEME.danger, fontFamily: 'monospace', fontWeight: 700 }}>
                                    PID {blocker.pid}
                                    <span style={{ fontSize: 8, color: THEME.textDim, fontWeight: 400, marginLeft: 4 }}>blocking</span>
                                </div>
                                <ArrowRight size={14} color={THEME.danger} />
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {blocker.blocking.map(pid => (
                                        <div key={pid} style={{ padding: '4px 10px', borderRadius: 6, background: `${THEME.warning}20`, border: `1px solid ${THEME.warning}40`, fontSize: 10, color: THEME.warning, fontFamily: 'monospace', fontWeight: 700 }}>
                                            PID {pid}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginLeft: 8, fontSize: 9, color: THEME.textDim }}>
                                    → <code style={{ color: THEME.textMuted, fontFamily: 'monospace' }}>SELECT pg_cancel_backend({blocker.pid});</code>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Lock table */}
            <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                    <tr style={{ borderBottom: `1px solid ${THEME.grid}` }}>
                        {['PID', 'State', 'Mode', 'Relation', 'Granted', 'Duration', 'Blocked By', 'Query'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {MOCK_LOCKS.map((lock, i) => (
                        <tr key={i} onClick={() => setSelected(selected === lock.pid ? null : lock.pid)}
                            className="opt-row-hover"
                            style={{ borderBottom: `1px solid ${THEME.grid}25`, cursor: 'pointer', background: selected === lock.pid ? `${THEME.primary}08` : lock.blocked_by ? `${THEME.danger}05` : 'transparent' }}>
                            <td style={{ padding: '9px 12px', color: THEME.primary, fontFamily: 'monospace', fontWeight: 700 }}>{lock.pid}</td>
                            <td style={{ padding: '9px 12px' }}><span style={{ padding: '2px 7px', borderRadius: 9, background: `${stateColor(lock.state)}18`, color: stateColor(lock.state), fontSize: 9, fontWeight: 700 }}>{lock.state}</span></td>
                            <td style={{ padding: '9px 12px', fontSize: 9, color: THEME.textMuted, fontFamily: 'monospace' }}>{lock.mode.replace('Lock', '')}</td>
                            <td style={{ padding: '9px 12px', color: THEME.textMain, fontFamily: 'monospace' }}>{lock.relation}</td>
                            <td style={{ padding: '9px 12px' }}>{lock.granted ? <CheckCircle size={13} color={THEME.success} /> : <XCircle size={13} color={THEME.danger} />}</td>
                            <td style={{ padding: '9px 12px', color: lock.duration > 10 ? THEME.danger : THEME.textMuted }}>{lock.duration.toFixed(1)}s</td>
                            <td style={{ padding: '9px 12px', color: THEME.warning, fontFamily: 'monospace' }}>{lock.blocked_by ? `PID ${lock.blocked_by}` : '—'}</td>
                            <td style={{ padding: '9px 12px', color: THEME.textMuted, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10, fontFamily: 'monospace' }}>{lock.query}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div style={{ padding: '8px 16px', borderTop: `1px solid ${THEME.grid}`, fontSize: 10, color: THEME.textDim, flexShrink: 0, display: 'flex', gap: 16 }}>
                <span>Tip: Long-running "idle in transaction" sessions hold locks indefinitely.</span>
                <span style={{ marginLeft: 'auto', color: THEME.primary, fontFamily: 'monospace', cursor: 'pointer' }}>SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction';</span>
            </div>
        </div>
    );
};

// Maintenance / Autovacuum Panel
const MaintenancePanel = () => {
    const [running, setRunning] = useState({});
    const triggerVacuum = (table) => {
        setRunning(r => ({ ...r, [table]: true }));
        setTimeout(() => setRunning(r => { const n = { ...r }; delete n[table]; return n; }), 2400);
    };

    const urgency = (row) => {
        if (row.bloat_pct > 30 || row.dead_tuples > row.live_tuples * 0.1) return 'critical';
        if (row.bloat_pct > 15 || row.dead_tuples > row.live_tuples * 0.05) return 'warning';
        return 'ok';
    };
    const urgencyColor = (u) => u === 'critical' ? THEME.danger : u === 'warning' ? THEME.warning : THEME.success;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Summary */}
            <div style={{ padding: '10px 16px', display: 'flex', gap: 12, borderBottom: `1px solid ${THEME.grid}`, flexShrink: 0 }}>
                {[
                    { label: 'Tables Monitored', value: MOCK_MAINTENANCE.length, color: THEME.textMain },
                    { label: 'Need Vacuum', value: MOCK_MAINTENANCE.filter(t => urgency(t) !== 'ok').length, color: THEME.warning },
                    { label: 'Critical Bloat', value: MOCK_MAINTENANCE.filter(t => urgency(t) === 'critical').length, color: THEME.danger },
                    { label: 'Total Dead Tuples', value: formatRows(MOCK_MAINTENANCE.reduce((s, t) => s + t.dead_tuples, 0)), color: THEME.textMuted },
                ].map((k, i) => (
                    <div key={i} className="opt-card" style={{ flex: 1, padding: '8px 12px', borderRadius: 7 }}>
                        <div style={{ fontSize: 9, color: THEME.textDim, textTransform: 'uppercase', marginBottom: 2 }}>{k.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>{k.value}</div>
                    </div>
                ))}
            </div>

            <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                    <tr style={{ borderBottom: `1px solid ${THEME.grid}` }}>
                        {['Table', 'Size', 'Live Tuples', 'Dead Tuples', 'Bloat %', 'Last Vacuum', 'Last Analyze', 'Vacuums', 'Status', 'Action'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {MOCK_MAINTENANCE.map((t, i) => {
                        const u = urgency(t);
                        const uc = urgencyColor(u);
                        const isRunning = running[t.table];
                        return (
                            <tr key={i} className="opt-row-hover" style={{ borderBottom: `1px solid ${THEME.grid}25`, background: u === 'critical' ? `${THEME.danger}04` : 'transparent' }}>
                                <td style={{ padding: '9px 12px', color: THEME.textMain, fontFamily: 'monospace', fontWeight: 600 }}>{t.table}</td>
                                <td style={{ padding: '9px 12px', color: THEME.textMuted }}>{t.size}</td>
                                <td style={{ padding: '9px 12px', color: THEME.textMuted }}>{formatRows(t.live_tuples)}</td>
                                <td style={{ padding: '9px 12px', color: t.dead_tuples > t.live_tuples * 0.05 ? THEME.warning : THEME.textMuted }}>
                                    {formatRows(t.dead_tuples)}
                                    {t.dead_tuples > t.live_tuples * 0.05 && <span style={{ marginLeft: 4 }}>⚠</span>}
                                </td>
                                <td style={{ padding: '9px 12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 40, height: 5, background: `${THEME.grid}40`, borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(100, t.bloat_pct)}%`, height: '100%', background: uc }} />
                                        </div>
                                        <span style={{ fontSize: 9, color: uc, fontWeight: 700 }}>{t.bloat_pct.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td style={{ padding: '9px 12px', color: t.last_vacuum.includes('5d') || t.last_vacuum.includes('3d') ? THEME.danger : THEME.textMuted, fontSize: 10 }}>{t.last_vacuum}</td>
                                <td style={{ padding: '9px 12px', color: THEME.textMuted, fontSize: 10 }}>{t.last_analyze}</td>
                                <td style={{ padding: '9px 12px', color: THEME.textMuted }}>{t.vacuum_count}</td>
                                <td style={{ padding: '9px 12px' }}>
                                    <span style={{ padding: '2px 7px', borderRadius: 9, background: `${uc}18`, color: uc, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>{u}</span>
                                </td>
                                <td style={{ padding: '9px 12px' }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button onClick={() => triggerVacuum(t.table)} disabled={isRunning}
                                                style={{ fontSize: 9, padding: '2px 8px', borderRadius: 3, background: isRunning ? `${THEME.primary}10` : `${THEME.primary}15`, color: isRunning ? THEME.textDim : THEME.primary, border: `1px solid ${THEME.primary}30`, cursor: isRunning ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                                            {isRunning ? <><RefreshCw size={8} style={{ animation: 'optSpin 1s linear infinite' }} /> Running…</> : 'VACUUM'}
                                        </button>
                                        {u === 'critical' && !isRunning && (
                                            <button onClick={() => triggerVacuum(`${t.table}_analyze`)}
                                                    style={{ fontSize: 9, padding: '2px 8px', borderRadius: 3, background: `${THEME.warning}15`, color: THEME.warning, border: `1px solid ${THEME.warning}30`, cursor: 'pointer' }}>
                                                ANALYZE
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
            <div style={{ padding: '8px 16px', borderTop: `1px solid ${THEME.grid}`, fontSize: 10, color: THEME.textDim, flexShrink: 0 }}>
                Tip: Run <code style={{ color: THEME.primary }}>VACUUM ANALYZE</code> on tables with &gt;10% bloat. Schedule autovacuum more aggressively for high-write tables.
            </div>
        </div>
    );
};

// PostgreSQL Configuration Advisor
const ConfigAdvisorPanel = () => {
    const [category, setCategory] = useState('All');
    const categories = ['All', ...new Set(MOCK_PG_CONFIG.map(c => c.category))];
    const filtered = category === 'All' ? MOCK_PG_CONFIG : MOCK_PG_CONFIG.filter(c => c.category === category);
    const [copiedKey, setCopiedKey] = useState(null);
    const copy = (text, key) => { navigator.clipboard?.writeText(text).catch(() => {}); setCopiedKey(key); setTimeout(() => setCopiedKey(null), 1800); };

    const impactColor = (i) => i === 'HIGH' ? THEME.danger : i === 'MEDIUM' ? THEME.warning : THEME.success;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                <SlidersHorizontal size={13} color={THEME.primary} />
                <span style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, marginRight: 6, textTransform: 'uppercase' }}>Category:</span>
                {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)} style={{ padding: '3px 10px', borderRadius: 4, border: `1px solid ${category === c ? THEME.primary : THEME.grid}`, background: category === c ? `${THEME.primary}20` : 'transparent', color: category === c ? THEME.primary : THEME.textMuted, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{c}</button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 10, color: THEME.textDim }}>
                    {filtered.filter(c => c.current !== c.recommended).length} settings need tuning
                </span>
            </div>

            <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map((cfg, i) => {
                        const needsChange = cfg.current !== cfg.recommended;
                        const setCmd = `ALTER SYSTEM SET ${cfg.name} = '${cfg.recommended}';`;
                        return (
                            <div key={i} className="opt-card" style={{
                                padding: '14px 16px', borderRadius: 9,
                                borderLeft: `4px solid ${needsChange ? impactColor(cfg.impact) : THEME.success}`,
                                animation: `optFadeIn 0.3s ${i * 0.04}s both`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <code style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, fontFamily: 'monospace' }}>{cfg.name}</code>
                                            <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 3, background: `${impactColor(cfg.impact)}18`, color: impactColor(cfg.impact), fontWeight: 700 }}>{cfg.impact}</span>
                                            <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 3, background: `${THEME.grid}60`, color: THEME.textDim, fontWeight: 600 }}>{cfg.category}</span>
                                        </div>
                                        <div style={{ fontSize: 10, color: THEME.textMuted, lineHeight: 1.5, marginBottom: 8 }}>{cfg.desc}</div>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                <span style={{ fontSize: 9, color: THEME.textDim }}>Current:</span>
                                                <code style={{ fontSize: 11, fontWeight: 700, color: needsChange ? THEME.danger : THEME.success, fontFamily: 'monospace', padding: '1px 6px', borderRadius: 3, background: needsChange ? `${THEME.danger}15` : `${THEME.success}15` }}>{cfg.current}</code>
                                            </div>
                                            {needsChange && (
                                                <>
                                                    <ArrowRight size={12} color={THEME.textDim} />
                                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                        <span style={{ fontSize: 9, color: THEME.textDim }}>Recommended:</span>
                                                        <code style={{ fontSize: 11, fontWeight: 700, color: THEME.success, fontFamily: 'monospace', padding: '1px 6px', borderRadius: 3, background: `${THEME.success}15` }}>{cfg.recommended}</code>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {needsChange && (
                                        <div style={{ position: 'relative', flexShrink: 0 }}>
                                            <div style={{ fontSize: 9, background: `${THEME.bg}90`, border: `1px solid ${THEME.grid}40`, borderRadius: 5, padding: '5px 28px 5px 8px', fontFamily: 'monospace', color: THEME.success, whiteSpace: 'nowrap' }}>
                                                {setCmd}
                                            </div>
                                            <button onClick={() => copy(setCmd, cfg.name)} style={{ position: 'absolute', top: '50%', right: 5, transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 2 }}>
                                                {copiedKey === cfg.name ? <Check size={10} color={THEME.success} /> : <Copy size={10} />}
                                            </button>
                                        </div>
                                    )}
                                    {!needsChange && <CheckCircle size={16} color={THEME.success} style={{ flexShrink: 0 }} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ padding: '8px 16px', borderTop: `1px solid ${THEME.grid}`, fontSize: 10, color: THEME.textDim, flexShrink: 0 }}>
                After applying changes, run: <code style={{ color: THEME.primary }}>SELECT pg_reload_conf();</code> — or restart PostgreSQL for settings that require it.
            </div>
        </div>
    );
};

// Index Advisor
const IndexAdvisorPanel = () => {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? MOCK_INDEXES : MOCK_INDEXES.filter(i => i.status === filter);
    const statusColor = (s) => s === 'healthy' ? THEME.success : s === 'bloated' ? THEME.warning : THEME.danger;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, marginRight: 4, textTransform: 'uppercase' }}>Filter:</span>
                {['all', 'healthy', 'bloated', 'unused'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '3px 10px', borderRadius: 4, border: `1px solid ${filter === f ? THEME.primary : THEME.grid}`, background: filter === f ? `${THEME.primary}20` : 'transparent', color: filter === f ? THEME.primary : THEME.textMuted, fontSize: 10, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
                ))}
            </div>
            <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                    <tr style={{ borderBottom: `1px solid ${THEME.grid}` }}>
                        {['Table', 'Column', 'Type', 'Size', 'Scans/mo', 'Bloat', 'Status', 'Action'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((idx, i) => (
                        <tr key={i} className="opt-row-hover" style={{ borderBottom: `1px solid ${THEME.grid}30` }}>
                            <td style={{ padding: '9px 12px', color: THEME.textMain, fontFamily: 'monospace' }}>{idx.table}</td>
                            <td style={{ padding: '9px 12px', color: THEME.primary, fontFamily: 'monospace' }}>{idx.column}</td>
                            <td style={{ padding: '9px 12px' }}><span style={{ padding: '2px 6px', borderRadius: 3, background: `${THEME.grid}60`, fontSize: 9, fontFamily: 'monospace', color: THEME.textMuted }}>{idx.type}</span></td>
                            <td style={{ padding: '9px 12px', color: THEME.textMuted }}>{idx.size}</td>
                            <td style={{ padding: '9px 12px', color: idx.scans === 0 ? THEME.danger : THEME.textMuted }}>{idx.scans.toLocaleString()}</td>
                            <td style={{ padding: '9px 12px', color: parseFloat(idx.bloat) > 20 ? THEME.warning : THEME.textMuted }}>{idx.bloat}</td>
                            <td style={{ padding: '9px 12px' }}><span style={{ padding: '2px 7px', borderRadius: 9, background: `${statusColor(idx.status)}18`, color: statusColor(idx.status), fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>{idx.status}</span></td>
                            <td style={{ padding: '9px 12px' }}>
                                {idx.status === 'unused' && <button style={{ fontSize: 9, padding: '2px 8px', borderRadius: 3, background: `${THEME.danger}15`, color: THEME.danger, border: `1px solid ${THEME.danger}30`, cursor: 'pointer' }}>DROP</button>}
                                {idx.status === 'bloated' && <button style={{ fontSize: 9, padding: '2px 8px', borderRadius: 3, background: `${THEME.warning}15`, color: THEME.warning, border: `1px solid ${THEME.warning}30`, cursor: 'pointer' }}>REINDEX</button>}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div style={{ padding: '8px 16px', borderTop: `1px solid ${THEME.grid}`, display: 'flex', gap: 16, fontSize: 10, color: THEME.textDim, flexShrink: 0 }}>
                {[{ label: 'Total', value: MOCK_INDEXES.length, color: THEME.textMuted }, { label: 'Healthy', value: MOCK_INDEXES.filter(i => i.status === 'healthy').length, color: THEME.success }, { label: 'Bloated', value: MOCK_INDEXES.filter(i => i.status === 'bloated').length, color: THEME.warning }, { label: 'Unused', value: MOCK_INDEXES.filter(i => i.status === 'unused').length, color: THEME.danger }].map(s => (
                    <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ color: s.color, fontWeight: 700 }}>{s.value}</span>{s.label}</span>
                ))}
            </div>
        </div>
    );
};

// Table Statistics
const TableStatsPanel = () => {
    const maxRows = Math.max(...MOCK_TABLE_STATS.map(t => t.rows));
    return (
        <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                    <tr style={{ borderBottom: `1px solid ${THEME.grid}` }}>
                        {['Table', 'Rows', 'Size', 'Dead Tuples', 'Last Vacuum', 'Seq Scans', 'Idx Scans', 'Idx Hit %'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {MOCK_TABLE_STATS.map((t, i) => {
                        const total = t.seq_scans + t.idx_scans;
                        const idxPct = total > 0 ? (t.idx_scans / total) * 100 : 0;
                        const deadRatio = t.dead_tuples / (t.rows || 1);
                        return (
                            <tr key={i} className="opt-row-hover" style={{ borderBottom: `1px solid ${THEME.grid}30` }}>
                                <td style={{ padding: '9px 12px', color: THEME.textMain, fontFamily: 'monospace', fontWeight: 600 }}>{t.table}</td>
                                <td style={{ padding: '9px 12px' }}>
                                    <div style={{ fontSize: 11, color: THEME.textMain }}>{formatRows(t.rows)}</div>
                                    <div style={{ width: 60, height: 3, background: `${THEME.grid}40`, borderRadius: 2, overflow: 'hidden', marginTop: 3 }}>
                                        <div style={{ width: `${(t.rows / maxRows) * 100}%`, height: '100%', background: THEME.primary }} />
                                    </div>
                                </td>
                                <td style={{ padding: '9px 12px', color: THEME.textMuted }}>{t.size}</td>
                                <td style={{ padding: '9px 12px', color: deadRatio > 0.1 ? THEME.danger : deadRatio > 0.05 ? THEME.warning : THEME.textMuted }}>
                                    {formatRows(t.dead_tuples)}{deadRatio > 0.05 && <span style={{ marginLeft: 4, color: THEME.warning }}>⚠</span>}
                                </td>
                                <td style={{ padding: '9px 12px', color: t.last_vacuum.includes('5d') ? THEME.danger : THEME.textMuted }}>{t.last_vacuum}</td>
                                <td style={{ padding: '9px 12px', color: t.seq_scans > 1000 ? THEME.warning : THEME.textMuted }}>{t.seq_scans.toLocaleString()}</td>
                                <td style={{ padding: '9px 12px', color: THEME.textMuted }}>{t.idx_scans.toLocaleString()}</td>
                                <td style={{ padding: '9px 12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 48, height: 5, background: `${THEME.grid}40`, borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ width: `${idxPct}%`, height: '100%', background: idxPct > 80 ? THEME.success : THEME.warning }} />
                                        </div>
                                        <span style={{ fontSize: 9, color: THEME.textMuted }}>{idxPct.toFixed(0)}%</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
            <div style={{ padding: '8px 16px', borderTop: `1px solid ${THEME.grid}`, fontSize: 10, color: THEME.textDim, flexShrink: 0 }}>
                Tip: Tables with &gt;10% dead tuples need <strong style={{ color: THEME.textMain }}>VACUUM</strong>. High seq_scans suggest missing indexes.
            </div>
        </div>
    );
};

// Side-by-side compare
const ComparePanel = () => {
    const [queryA, setQueryA] = useState(SAMPLE_QUERIES[0].sql);
    const [queryB, setQueryB] = useState(SAMPLE_QUERIES[2].sql);
    const [resultA, setResultA] = useState(null);
    const [resultB, setResultB] = useState(null);
    const [loading, setLoading] = useState(false);

    const runBoth = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1400));
        setResultA(generateMockPlan(queryA));
        setResultB(generateMockPlan(queryB));
        setLoading(false);
    };

    const DiffBadge = ({ a, b, label }) => {
        if (!a || !b) return null;
        const diff = b - a, pct = ((diff / a) * 100).toFixed(1), better = diff < 0;
        return (
            <div style={{ textAlign: 'center', padding: '8px 12px', borderRadius: 6, background: better ? `${THEME.success}10` : `${THEME.danger}10`, border: `1px solid ${better ? THEME.success : THEME.danger}25` }}>
                <div style={{ fontSize: 9, color: THEME.textDim, marginBottom: 2, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: better ? THEME.success : THEME.danger }}>{better ? '▼' : '▲'} {Math.abs(pct)}%</div>
                <div style={{ fontSize: 9, color: THEME.textMuted }}>B vs A</div>
            </div>
        );
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: THEME.textDim }}>Compare two query variants side-by-side</span>
                <div style={{ marginLeft: 'auto' }}>
                    <button onClick={runBoth} disabled={loading} className="opt-btn" style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`, color: '#fff', fontSize: 11, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? 0.7 : 1 }}>
                        {loading ? <RefreshCw size={13} style={{ animation: 'optSpin 1s linear infinite' }} /> : <GitCompare size={13} />}
                        {loading ? 'Running…' : 'Compare Both'}
                    </button>
                </div>
            </div>

            <div style={{ flex: '0 0 170px', display: 'flex', borderBottom: `1px solid ${THEME.grid}`, flexShrink: 0 }}>
                {[{ label: 'Query A', q: queryA, setQ: setQueryA, r: resultA, color: THEME.primary }, { label: 'Query B', q: queryB, setQ: setQueryB, r: resultB, color: THEME.warning }].map((p, idx) => (
                    <div key={idx} style={{ flex: 1, borderRight: idx === 0 ? `1px solid ${THEME.grid}` : 'none', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '5px 12px', background: THEME.surface, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: p.color }}>{p.label}</span>
                            {p.r && <span style={{ fontSize: 9, color: THEME.textMuted }}>Cost: <strong style={{ color: THEME.textMain }}>{p.r.Plan["Total Cost"].toFixed(1)}</strong> · {formatDuration(p.r.Plan["Actual Total Time"])}</span>}
                        </div>
                        <textarea value={p.q} onChange={e => p.setQ(e.target.value)} className="sql-editor" spellCheck="false" style={{ flex: 1, background: 'transparent', color: THEME.textMain, border: 'none', padding: 12, resize: 'none', outline: 'none', fontSize: 11 }} />
                    </div>
                ))}
            </div>

            {resultA && resultB && (
                <div style={{ padding: '10px 16px', display: 'flex', gap: 10, background: THEME.surface, borderBottom: `1px solid ${THEME.grid}`, flexShrink: 0 }}>
                    <DiffBadge a={resultA.Plan["Total Cost"]} b={resultB.Plan["Total Cost"]} label="Cost" />
                    <DiffBadge a={resultA.Plan["Actual Total Time"]} b={resultB.Plan["Actual Total Time"]} label="Exec Time" />
                    <DiffBadge a={resultA.Plan["Shared Read Blocks"] || 1} b={resultB.Plan["Shared Read Blocks"] || 1} label="Disk Reads" />
                    <div style={{ flex: 1 }} />
                    <div style={{ fontSize: 10, color: THEME.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: THEME.primary, fontWeight: 700 }}>A:</span>{formatDuration(resultA.Plan["Actual Total Time"])} ·
                        <span style={{ color: THEME.warning, fontWeight: 700 }}>B:</span>{formatDuration(resultB.Plan["Actual Total Time"])}
                    </div>
                </div>
            )}

            {resultA && resultB ? (
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {[{ r: resultA }, { r: resultB }].map(({ r }, idx) => (
                        <div key={idx} className="opt-scroll" style={{ flex: 1, overflowY: 'auto', padding: 14, borderRight: idx === 0 ? `1px solid ${THEME.grid}` : 'none' }}>
                            <PlanNode node={r.Plan} maxCost={r.Plan["Total Cost"]} totalTime={r.Plan["Actual Total Time"]} />
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.textDim, flexDirection: 'column', gap: 10 }}>
                    <GitCompare size={36} opacity={0.3} />
                    <div style={{ fontSize: 12 }}>Click "Compare Both" to see side-by-side execution plans</div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const QueryOptimizerTab = () => {
    const [query, setQuery] = useState(SAMPLE_QUERIES[0].sql);
    const [history, setHistory] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [viewMode, setViewMode] = useState('visual');
    const [showHistory, setShowHistory] = useState(false);
    const [showSamples, setShowSamples] = useState(false);
    const [activeTab, setActiveTab] = useState('plan');
    const [copiedQuery, setCopiedQuery] = useState(false);

    const loadQuery = useCallback((sql) => {
        setQuery(sql);
        setActiveTab('plan');
    }, []);

    const handleAnalyze = async () => {
        if (!query.trim()) return;
        setAnalyzing(true);
        try {
            await new Promise(r => setTimeout(r, 1100 + Math.random() * 400));
            const data = generateMockPlan(query);
            setResult(data);
            setHistory(prev => [{ id: Date.now(), query: query.substring(0, 52) + (query.length > 52 ? '…' : ''), fullQuery: query, timestamp: new Date().toLocaleTimeString(), cost: data.Plan["Total Cost"], time: data.Plan["Actual Total Time"] }, ...prev.slice(0, 19)]);
            setActiveTab('plan');
        } catch (err) { console.error(err); }
        finally { setAnalyzing(false); }
    };

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleAnalyze(); }
    };

    const copyQuery = () => { navigator.clipboard?.writeText(query).catch(() => {}); setCopiedQuery(true); setTimeout(() => setCopiedQuery(false), 1800); };

    const exportPlan = () => {
        if (!result) return;
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'query_plan.json'; a.click();
        URL.revokeObjectURL(url);
    };

    const rootNode = result?.Plan;
    const maxCost = rootNode?.["Total Cost"] || 100;
    const totalTime = rootNode?.["Actual Total Time"] || 100;
    const bufferHit = rootNode?.["Shared Hit Blocks"] || 0;
    const bufferRead = rootNode?.["Shared Read Blocks"] || 0;
    const hitRate = ((bufferHit / (bufferHit + bufferRead || 1)) * 100).toFixed(1);

    const { insights, indexRecommendations, rewrites } = useMemo(() => {
        if (!result) return { insights: [], indexRecommendations: [], rewrites: [] };
        return analyzePlan(result);
    }, [result]);

    const mainTabs = [
        { id: 'plan', label: 'Execution Plan', icon: Share2 },
        { id: 'breakdown', label: 'Cost Breakdown', icon: BarChart3 },
        { id: 'flamegraph', label: 'Flamegraph', icon: Flame },
        { id: 'slow', label: 'Slow Queries', icon: TrendingDown },
        { id: 'locks', label: 'Lock Monitor', icon: Lock },
        { id: 'indexes', label: 'Index Advisor', icon: Layers },
        { id: 'tables', label: 'Table Stats', icon: Table },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'config', label: 'PG Config', icon: SlidersHorizontal },
        { id: 'compare', label: 'Compare', icon: GitCompare },
    ];

    return (
        <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: THEME.bg, color: THEME.textMain, overflow: 'hidden', margin: '-32px' }}>
            <OptimizerStyles />

            {/* HEADER */}
            <div style={{ height: 52, padding: '0 20px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: THEME.glass, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ padding: 7, borderRadius: 8, background: `linear-gradient(135deg, ${THEME.primary}25, ${THEME.secondary || THEME.primary}25)`, border: `1px solid ${THEME.primary}30` }}>
                        <Zap size={15} color={THEME.primary} />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>Query Optimizer</div>
                        <div style={{ fontSize: 10, color: THEME.textDim }}>EXPLAIN ANALYZE · Index Advisor · Plan Diff · Table Stats</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ActiveUsersBadge />

                    {result && (
                        <button onClick={exportPlan} className="opt-btn" style={{ background: 'transparent', color: THEME.textMuted, border: `1px solid ${THEME.grid}`, padding: '5px 10px', borderRadius: 5, cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center', fontSize: 11 }}>
                            <Download size={12} /> Export Plan
                        </button>
                    )}

                    <button onClick={() => setShowSamples(!showSamples)} className="opt-btn" style={{ background: showSamples ? `${THEME.primary}20` : 'transparent', color: showSamples ? THEME.primary : THEME.textMuted, border: `1px solid ${showSamples ? THEME.primary : THEME.grid}`, padding: '5px 10px', borderRadius: 5, cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center', fontSize: 11 }}>
                        <BookOpen size={12} /> Samples
                    </button>

                    <button onClick={() => setShowHistory(!showHistory)} className="opt-btn" style={{ background: showHistory ? `${THEME.primary}20` : 'transparent', color: showHistory ? THEME.primary : THEME.textMuted, border: `1px solid ${showHistory ? THEME.primary : THEME.grid}`, padding: '5px 10px', borderRadius: 5, cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center', fontSize: 11 }}>
                        <History size={12} /> History {history.length > 0 && `(${history.length})`}
                    </button>
                </div>
            </div>

            {/* Sample queries strip */}
            {showSamples && (
                <div style={{ padding: '8px 20px', borderBottom: `1px solid ${THEME.grid}`, background: `${THEME.surface}90`, display: 'flex', gap: 7, flexWrap: 'wrap', flexShrink: 0 }}>
                    {SAMPLE_QUERIES.map((s, i) => (
                        <button key={i} onClick={() => { setQuery(s.sql); setShowSamples(false); }} className="opt-btn" style={{ padding: '4px 12px', borderRadius: 4, border: `1px solid ${THEME.grid}`, background: 'transparent', color: THEME.textMuted, fontSize: 10, cursor: 'pointer' }}>
                            {s.label}
                        </button>
                    ))}
                </div>
            )}

            {/* MAIN LAYOUT */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* LEFT: Editor */}
                <div style={{ width: 380, flexShrink: 0, borderRight: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '8px 14px', borderBottom: `1px solid ${THEME.grid}`, background: THEME.surface, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SQL Query</span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontSize: 9, color: THEME.textMuted, display: 'flex', alignItems: 'center', gap: 3 }}><Database size={9} /> postgres</span>
                            <button onClick={copyQuery} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textDim, padding: 2 }}>
                                {copiedQuery ? <Check size={11} color={THEME.success} /> : <Copy size={11} />}
                            </button>
                        </div>
                    </div>

                    {/* Editor with line numbers */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, background: `${THEME.surface}80`, borderRight: `1px solid ${THEME.grid}30`, display: 'flex', flexDirection: 'column', paddingTop: 14, userSelect: 'none', pointerEvents: 'none', zIndex: 1 }}>
                            {query.split('\n').map((_, i) => (
                                <div key={i} style={{ fontSize: 9, color: `${THEME.textDim}55`, height: 22.4, lineHeight: '22.4px', textAlign: 'center', fontFamily: 'monospace' }}>{i + 1}</div>
                            ))}
                        </div>
                        <textarea
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="sql-editor opt-scroll"
                            spellCheck="false" autoCorrect="off"
                            style={{ width: '100%', height: '100%', background: 'transparent', color: THEME.textMain, border: 'none', paddingLeft: 48, paddingTop: 14, paddingRight: 14, paddingBottom: 14, resize: 'none', outline: 'none', fontSize: 12, boxSizing: 'border-box', overflowY: 'auto' }}
                        />
                    </div>

                    <div style={{ padding: '10px 14px', borderTop: `1px solid ${THEME.grid}`, flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 9, color: THEME.textDim }}>⌘ + Enter to run</span>
                        <button onClick={handleAnalyze} disabled={analyzing} className="opt-btn" style={{ background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`, color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: analyzing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: `0 3px 12px ${THEME.primary}40`, opacity: analyzing ? 0.75 : 1 }}>
                            {analyzing ? <><RefreshCw size={14} style={{ animation: 'optSpin 1s linear infinite' }} /> Analyzing…</> : <><Play size={14} fill="currentColor" /> Explain Analyze</>}
                        </button>
                    </div>

                    {/* History */}
                    {showHistory && history.length > 0 && (
                        <div style={{ height: 220, borderTop: `1px solid ${THEME.grid}`, background: THEME.surface, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                            <div style={{ padding: '6px 14px', borderBottom: `1px solid ${THEME.grid}`, fontSize: 9, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>RECENT RUNS</div>
                            <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                                {history.map(item => (
                                    <div key={item.id} onClick={() => setQuery(item.fullQuery)} className="opt-row-hover" style={{ padding: '7px 14px', borderBottom: `1px solid ${THEME.grid}30`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 10, color: THEME.textMain, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.query}</div>
                                            <div style={{ fontSize: 9, color: THEME.textDim, marginTop: 2 }}>{item.timestamp}</div>
                                        </div>
                                        <div style={{ fontSize: 9, color: THEME.textMuted, textAlign: 'right', marginLeft: 8, flexShrink: 0 }}>
                                            <div>Cost {item.cost.toFixed(0)}</div>
                                            <div>{formatDuration(item.time)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Results */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* Main tab bar - scrollable */}
                    <div style={{ flexShrink: 0, borderBottom: `1px solid ${THEME.grid}`, background: THEME.surface, display: 'flex', alignItems: 'center', paddingLeft: 12, overflowX: 'auto' }} className="opt-scroll">
                        {mainTabs.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} className="opt-tab-btn" style={{ padding: '11px 14px', border: 'none', borderBottom: activeTab === t.id ? `2px solid ${THEME.primary}` : '2px solid transparent', background: 'transparent', color: activeTab === t.id ? THEME.primary : THEME.textMuted, fontSize: 11, fontWeight: activeTab === t.id ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: -1, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                <t.icon size={12} />
                                {t.label}
                                {t.id === 'plan' && insights.length > 0 && (
                                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: THEME.danger, color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{insights.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* PLAN TAB */}
                    {activeTab === 'plan' && (
                        !result ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: THEME.textDim }}>
                                <div style={{ width: 72, height: 72, borderRadius: 18, background: `${THEME.grid}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                                    <Layers size={36} opacity={0.3} />
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Ready to Optimize</div>
                                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 22 }}>Paste a query and click Explain Analyze</div>
                                <div style={{ display: 'flex', gap: 16, fontSize: 10, color: THEME.textDim, flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {['Execution Plan Tree', 'Cost & Time Breakdown', 'Index Recommendations', 'Query Rewrite Suggestions'].map(f => (
                                        <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={10} color={THEME.success} /> {f}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                {/* KPI bar */}
                                <div style={{ padding: '10px 16px', display: 'flex', gap: 10, borderBottom: `1px solid ${THEME.grid}`, flexShrink: 0, alignItems: 'stretch' }}>
                                    <QueryScoreRing insights={insights} />
                                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                                        {[
                                            { label: 'Total Cost', value: result.Plan["Total Cost"].toFixed(2), icon: TrendingUp, color: THEME.textMain },
                                            { label: 'Planning', value: formatDuration(result["Planning Time"] || 0), icon: Cpu, color: THEME.textDim },
                                            { label: 'Execution', value: formatDuration(result["Execution Time"] || totalTime), icon: Clock, color: THEME.primary },
                                            { label: 'Buffer Hit', value: `${hitRate}%`, icon: HardDrive, color: parseFloat(hitRate) > 90 ? THEME.success : THEME.warning },
                                            { label: 'Rows Out', value: formatRows(result.Plan["Actual Rows"]), icon: Database, color: THEME.info || THEME.primary },
                                        ].map((stat, i) => (
                                            <div key={i} className="opt-card" style={{ padding: '8px 12px', borderRadius: 7 }}>
                                                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 3 }}>
                                                    <stat.icon size={10} color={stat.color} />
                                                    <span style={{ fontSize: 9, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</span>
                                                </div>
                                                <div style={{ fontSize: 16, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Plan tree + analysis sidebar */}
                                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div style={{ padding: '8px 16px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Share2 size={12} /> Execution Plan Tree</div>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {['visual', 'json'].map(mode => (
                                                    <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '3px 9px', borderRadius: 4, border: `1px solid ${viewMode === mode ? THEME.primary : THEME.grid}`, background: viewMode === mode ? `${THEME.primary}20` : 'transparent', color: viewMode === mode ? THEME.primary : THEME.textMuted, fontSize: 10, cursor: 'pointer', textTransform: 'capitalize' }}>{mode}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                                            {viewMode === 'visual'
                                                ? <PlanNode node={result.Plan} maxCost={maxCost} totalTime={totalTime} />
                                                : <pre style={{ fontSize: 10, fontFamily: 'monospace', color: THEME.textMuted, margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>
                                            }
                                        </div>
                                    </div>

                                    {/* Insights sidebar */}
                                    <div style={{ width: 300, borderLeft: `1px solid ${THEME.grid}`, background: THEME.surface, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', gap: 7, background: `linear-gradient(135deg, ${THEME.primary}08, transparent)`, flexShrink: 0 }}>
                                            <Sparkles size={13} color={THEME.primary} />
                                            <span style={{ fontSize: 11, fontWeight: 700 }}>Analysis</span>
                                            {insights.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 7px', borderRadius: 9, background: `${THEME.danger}20`, color: THEME.danger, fontWeight: 700 }}>{insights.length} issue{insights.length > 1 ? 's' : ''}</span>}
                                        </div>
                                        <InsightsPanel insights={insights} rewrites={rewrites} indexRecs={indexRecommendations} />
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* COST BREAKDOWN TAB */}
                    {activeTab === 'breakdown' && (
                        <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                            {!result
                                ? <div style={{ textAlign: 'center', color: THEME.textDim, paddingTop: 60, fontSize: 13 }}>Run a query first to see cost breakdown</div>
                                : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        <div className="opt-card" style={{ padding: 20, borderRadius: 10 }}>
                                            <h3 style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', margin: '0 0 16px', letterSpacing: '0.06em' }}>Node-by-Node Cost & Time</h3>
                                            <CostBreakdownChart plan={result} />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div className="opt-card" style={{ padding: 20, borderRadius: 10 }}>
                                                <h3 style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', margin: '0 0 14px', letterSpacing: '0.06em' }}>Buffer Usage</h3>
                                                {[
                                                    { label: 'Shared Hit Blocks', value: result.Plan["Shared Hit Blocks"] || 0, color: THEME.success, desc: 'From cache' },
                                                    { label: 'Shared Read Blocks', value: result.Plan["Shared Read Blocks"] || 0, color: THEME.danger, desc: 'From disk' },
                                                    { label: 'Temp Blocks Written', value: result.Plan["Temp Written Blocks"] || 0, color: THEME.warning, desc: 'Spilled to disk' },
                                                ].map((b, i) => (
                                                    <div key={i} style={{ marginBottom: 12 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                                                            <span style={{ color: THEME.textMuted }}>{b.label}</span>
                                                            <span style={{ color: b.color, fontWeight: 700 }}>{b.value.toLocaleString()}</span>
                                                        </div>
                                                        <div style={{ height: 6, background: `${THEME.grid}40`, borderRadius: 3, overflow: 'hidden' }}>
                                                            <div style={{ width: `${Math.min(100, (b.value / ((result.Plan["Shared Hit Blocks"] || 1) + (result.Plan["Shared Read Blocks"] || 1))) * 100)}%`, height: '100%', background: b.color, borderRadius: 3 }} />
                                                        </div>
                                                        <div style={{ fontSize: 9, color: THEME.textDim, marginTop: 2 }}>{b.desc} · {formatBytes(b.value * 8192)}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="opt-card" style={{ padding: 20, borderRadius: 10 }}>
                                                <h3 style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', margin: '0 0 14px', letterSpacing: '0.06em' }}>JIT Compilation</h3>
                                                {result.JIT ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                                            <span style={{ color: THEME.textMuted }}>Functions compiled</span>
                                                            <span style={{ color: THEME.textMain, fontWeight: 700 }}>{result.JIT.Functions}</span>
                                                        </div>
                                                        {Object.entries(result.JIT.Options || {}).map(([k, v]) => (
                                                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                                                <span style={{ color: THEME.textMuted }}>{k}</span>
                                                                <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, background: v ? `${THEME.success}15` : `${THEME.danger}15`, color: v ? THEME.success : THEME.danger, fontWeight: 700 }}>{v ? 'ON' : 'OFF'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <div style={{ fontSize: 11, color: THEME.textDim }}>JIT not used</div>}
                                            </div>
                                        </div>

                                        <div className="opt-card" style={{ padding: 20, borderRadius: 10 }}>
                                            <h3 style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', margin: '0 0 14px', letterSpacing: '0.06em' }}>Timing Summary</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                                {[
                                                    { label: 'Planning', val: formatDuration(result["Planning Time"] || 1.2), color: THEME.textDim },
                                                    { label: 'Execution', val: formatDuration(result["Execution Time"] || totalTime), color: THEME.primary },
                                                    { label: 'Buffer Hit Rate', val: `${hitRate}%`, color: parseFloat(hitRate) > 90 ? THEME.success : THEME.warning },
                                                    { label: 'Workers', val: `${result.Plan["Workers Launched"] || 0}`, color: THEME.textMuted },
                                                ].map((s, i) => (
                                                    <div key={i} style={{ textAlign: 'center', padding: 12, borderRadius: 8, background: `${THEME.grid}30` }}>
                                                        <div style={{ fontSize: 9, color: THEME.textDim, marginBottom: 4, textTransform: 'uppercase' }}>{s.label}</div>
                                                        <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    )}

                    {activeTab === 'indexes' && <IndexAdvisorPanel />}
                    {activeTab === 'tables' && <TableStatsPanel />}
                    {activeTab === 'compare' && <ComparePanel />}
                    {activeTab === 'slow' && <SlowQueryPanel onLoadQuery={loadQuery} />}
                    {activeTab === 'locks' && <LockMonitorPanel />}
                    {activeTab === 'maintenance' && <MaintenancePanel />}
                    {activeTab === 'config' && <ConfigAdvisorPanel />}

                    {/* FLAMEGRAPH TAB */}
                    {activeTab === 'flamegraph' && (
                        <div className="opt-scroll" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                            {!result
                                ? <div style={{ textAlign: 'center', color: THEME.textDim, paddingTop: 60, fontSize: 13 }}>Run a query first to see the flamegraph</div>
                                : (
                                    <div>
                                        <div style={{ marginBottom: 16 }}>
                                            <h3 style={{ fontSize: 12, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '0.06em' }}>Plan Flamegraph</h3>
                                            <div style={{ fontSize: 10, color: THEME.textDim }}>Each bar's width represents its share of total execution time. Hover for details.</div>
                                        </div>
                                        <div className="opt-card" style={{ padding: 20, borderRadius: 10 }}>
                                            <FlameGraph plan={result} />
                                        </div>
                                        <div className="opt-card" style={{ marginTop: 20, padding: 20, borderRadius: 10 }}>
                                            <h3 style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', margin: '0 0 14px', letterSpacing: '0.06em' }}>Node-by-Node Cost & Time</h3>
                                            <CostBreakdownChart plan={result} />
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QueryOptimizerTab;