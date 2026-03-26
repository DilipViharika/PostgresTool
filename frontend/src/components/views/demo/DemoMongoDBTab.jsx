import React, { useMemo } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import DemoLayout, {
    Panel,
    StatusBadge,
    RingGauge,
    MiniSparkline,
    HeroMetric,
    MetricCard,
    LiveMetric,
    TabPills,
    AlertRow,
    DataTable,
    ChartTip,
    generateChartData,
} from './DemoLayout.jsx';
import {
    Activity,
    Database,
    Zap,
    HardDrive,
    Brain,
    RefreshCw,
    Settings,
    Clock,
    TrendingUp,
    Server,
    Shield,
    Lock,
    Users,
    Eye,
    Network,
    Gauge,
    BarChart3,
    AlertCircle,
    CheckCircle,
    Layers,
    Code,
    GitBranch,
    Map,
    Download,
    Upload,
    Filter,
    Copy,
    AlertTriangle,
    Cpu,
    Globe,
    Archive,
    Lightbulb,
    Zap as ZapAlt,
    TrendingDown,
    Workflow,
    Compass,
    Radio,
    FileCog,
    Inbox,
    FileCode,
    BarChart4,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

function DemoMongoDBTab({ tabId }) {
    useAdaptiveTheme();

    const demoData = useMemo(() => {
        const base24h = generateChartData(24);
        const base30d = generateChartData(30);
        const indexed24h = base24h.map((d, i) => ({ ...d, index: i }));
        const indexed30d = base30d.map((d, i) => ({ ...d, index: i }));

        return {
            // ═══════════════════════════════════════════════════════════════════════════
            // 1. OVERVIEW (5 items)
            // ═══════════════════════════════════════════════════════════════════════════

            // Executive Dashboard
            clusterHealth: {
                status: 'HEALTHY',
                uptime: '45d 14h',
                primaryNode: 'replica-0',
                secondaries: 2,
                version: '7.0.4',
            },
            clusterMetrics: indexed24h.map((d) => ({
                ...d,
                throughput: Math.floor(8400 + Math.sin(d.index / 6) * 1200 + Math.random() * 500),
                latency: Math.floor(12 + Math.sin(d.index / 8) * 5 + Math.random() * 3),
            })),

            // Connection
            connectionStats: {
                active: 78,
                idle: 32,
                available: 190,
                maxPoolSize: 300,
            },
            connectionTrends: indexed24h.map((d) => ({
                ...d,
                active: Math.floor(78 + Math.sin(d.index / 7) * 12 + Math.random() * 8),
                idle: Math.floor(32 + Math.cos(d.index / 8) * 10 + Math.random() * 6),
            })),

            // Server Info
            serverInfo: {
                hostname: 'mongo-primary-01.prod.vigil',
                port: 27017,
                memory: '32 GB',
                storage: 'WiredTiger',
                os: 'Ubuntu 22.04 LTS',
                arch: 'x86_64',
            },

            // Databases
            databases: [
                { name: 'production', collections: 24, size: '156.4 GB', indexes: 182, doc_count: 45200000 },
                { name: 'analytics', collections: 18, size: '89.2 GB', indexes: 98, doc_count: 12400000 },
                { name: 'staging', collections: 24, size: '78.1 GB', indexes: 180, doc_count: 42100000 },
                { name: 'cache', collections: 6, size: '12.3 GB', indexes: 14, doc_count: 3200000 },
            ],

            // Collection Relationships
            collectionRelationships: [
                { from: 'orders', to: 'customers', type: '$lookup', count: 2840000 },
                { from: 'orders', to: 'products', type: '$lookup', count: 1850000 },
                { from: 'customers', to: 'addresses', type: 'embedded', count: 145000 },
                { from: 'transactions', to: 'orders', type: '$lookup', count: 5620000 },
            ],

            // ═══════════════════════════════════════════════════════════════════════════
            // 2. PERFORMANCE (13 items)
            // ═══════════════════════════════════════════════════════════════════════════

            // Server Status
            serverStatus: {
                connectionsCreated: 42850,
                networkBytesIn: '284.2 GB',
                networkBytesOut: '156.3 GB',
                operationsIns: 184250,
                operationsUpd: 92340,
                operationsDel: 23450,
                operationsQry: 1284500,
            },

            // Real-time Ops
            realtimeOps: indexed24h.map((d) => ({
                ...d,
                read: Math.floor(4200 + Math.sin(d.index / 6) * 800 + Math.random() * 400),
                write: Math.floor(2100 + Math.cos(d.index / 6) * 500 + Math.random() * 300),
                command: Math.floor(890 + Math.sin(d.index / 8) * 200 + Math.random() * 120),
            })),

            // Latency Percentiles
            latencyPercentiles: indexed24h.map((d) => ({
                ...d,
                p50: Math.floor(8 + Math.sin(d.index / 7) * 3 + Math.random() * 2),
                p95: Math.floor(35 + Math.sin(d.index / 5) * 10 + Math.random() * 6),
                p99: Math.floor(92 + Math.cos(d.index / 4) * 18 + Math.random() * 10),
            })),

            // Namespace Insights
            namespaceMetrics: [
                { ns: 'production.orders', ops_sec: 2840, avg_latency: 12, size_mb: 4200, index_count: 6 },
                { ns: 'production.customers', ops_sec: 450, avg_latency: 8, size_mb: 2100, index_count: 4 },
                { ns: 'production.transactions', ops_sec: 5620, avg_latency: 18, size_mb: 18900, index_count: 8 },
                { ns: 'analytics.events', ops_sec: 1280, avg_latency: 24, size_mb: 89200, index_count: 5 },
            ],

            // Explain Plan
            explainPlanExample: {
                query: 'db.orders.find({status:"pending"}).sort({createdAt:-1}).limit(100)',
                executionStage: 'COLLSCAN',
                nReturned: 100,
                executionTimeMillis: 2840,
                totalKeysExamined: 2840000,
                totalDocsExamined: 2840000,
                executionStats: {
                    stage: 'COLLSCAN',
                    nReturned: 100,
                    executionTimeMillis: 2840,
                },
            },

            // Active Operations
            activeOps: [
                { id: 'op-12401', ns: 'production.orders', cmd: 'find', active_time: '2.3s', blocks: 'op-12402' },
                { id: 'op-12402', ns: 'production.customers', cmd: 'update', active_time: '1.8s', blocks: null },
                { id: 'op-12403', ns: 'analytics.events', cmd: 'insert', active_time: '0.4s', blocks: null },
            ],

            // Slow Queries
            slowQueries: [
                {
                    query: 'db.orders.find({status:{$in:["pending","processing"]}}).sort({createdAt:-1})',
                    duration: 2840,
                    scanned: 485200,
                    returned: 2100,
                },
                {
                    query: 'db.transactions.aggregate([{$match:{amount:{$gt:1000}}},{$group:{_id:"$userId"}}])',
                    duration: 1950,
                    scanned: 1240000,
                    returned: 34500,
                },
                {
                    query: 'db.logs.find({level:"ERROR"}).limit(10000)',
                    duration: 1620,
                    scanned: 18200000,
                    returned: 10000,
                },
            ],

            // Query Profiler
            profiledQueries: [
                { timestamp: '14:32:18', ns: 'production.orders', millis: 2340, docs: 8420 },
                { timestamp: '14:32:15', ns: 'production.customers', millis: 340, docs: 145 },
                { timestamp: '14:32:12', ns: 'analytics.events', millis: 8920, docs: 34200 },
                { timestamp: '14:32:09', ns: 'production.transactions', millis: 1840, docs: 2340 },
            ],

            // Query Cost Estimator
            costEstimate: {
                query: 'db.orders.find({status:"pending"}).hint({createdAt:-1})',
                estimatedCost: 2.84,
                estimatedRows: 2100,
                indexedFields: ['createdAt', 'status'],
                recommendation: 'USE_INDEX',
            },

            // Lock Analysis
            lockMetrics: indexed24h.map((d) => ({
                ...d,
                waits: Math.floor(12 + Math.sin(d.index / 6) * 6 + Math.random() * 4),
                deadlocks: Math.floor(0 + Math.random() * 2),
            })),

            // Anomaly Detection
            anomalies: [
                {
                    type: 'SPIKE',
                    metric: 'write_latency',
                    time: '14:28',
                    value: '245ms',
                    baseline: '18ms',
                    severity: 'high',
                },
                {
                    type: 'DROP',
                    metric: 'query_throughput',
                    time: '14:15',
                    value: '1240 ops/s',
                    baseline: '4200 ops/s',
                    severity: 'warning',
                },
                {
                    type: 'TREND',
                    metric: 'cache_evictions',
                    time: '14:00',
                    value: '+32% per hour',
                    baseline: 'stable',
                    severity: 'medium',
                },
            ],

            // Metrics Preview
            metricsPreview: indexed24h.map((d) => ({
                ...d,
                opcounters_read: Math.floor(4200 + Math.sin(d.index / 6) * 600 + Math.random() * 300),
                opcounters_write: Math.floor(2100 + Math.cos(d.index / 7) * 400 + Math.random() * 200),
                connections_current: Math.floor(110 + Math.sin(d.index / 8) * 25 + Math.random() * 15),
            })),

            // Live Agent
            liveAgentStatus: {
                agent_id: 'vigil-mongo-01',
                status: 'CONNECTED',
                last_heartbeat: '2s ago',
                version: '2.4.1',
                metrics_collected: 8420,
            },

            // ═══════════════════════════════════════════════════════════════════════════
            // 3. STORAGE (7 items)
            // ═══════════════════════════════════════════════════════════════════════════

            // Index Advisor
            indexRecommendations: [
                {
                    collection: 'orders',
                    field: 'status',
                    selectivity: '0.94',
                    est_size: '12.4 MB',
                    potential_save: '850ms',
                },
                {
                    collection: 'orders',
                    field: 'createdAt',
                    selectivity: '1.0',
                    est_size: '18.2 MB',
                    potential_save: '1240ms',
                },
                {
                    collection: 'customers',
                    field: 'email',
                    selectivity: '1.0',
                    est_size: '2.1 MB',
                    potential_save: '340ms',
                },
            ],

            // Schema Analyzer
            schemaAnalysis: [
                { collection: 'orders', field_count: 18, avg_doc_size: 4.6, type_consistency: '98.4%' },
                { collection: 'customers', field_count: 24, avg_doc_size: 15.2, type_consistency: '95.2%' },
                { collection: 'transactions', field_count: 22, avg_doc_size: 3.4, type_consistency: '99.1%' },
            ],

            // Collection Stats
            collectionStats: [
                { name: 'orders', docs: 2840000, size: '12.4 GB', indexes: 6, avgDocSize: 4.6, storage: '11.2 GB' },
                { name: 'customers', docs: 145000, size: '2.1 GB', indexes: 4, avgDocSize: 15.2, storage: '1.9 GB' },
                {
                    name: 'transactions',
                    docs: 5620000,
                    size: '18.9 GB',
                    indexes: 8,
                    avgDocSize: 3.4,
                    storage: '17.1 GB',
                },
                { name: 'logs', docs: 18200000, size: '34.2 GB', indexes: 3, avgDocSize: 1.9, storage: '32.4 GB' },
            ],

            // WiredTiger Cache
            wiredTigerMetrics: indexed24h.map((d) => ({
                ...d,
                evictions: Math.floor(240 + Math.sin(d.index / 5) * 100 + Math.random() * 50),
                cacheFillPct: Math.floor(73 + Math.sin(d.index / 8) * 12 + Math.random() * 6),
            })),

            // Backup Monitor
            backups: [
                {
                    timestamp: '2025-03-26 02:00 UTC',
                    size: '42.3 GB',
                    duration: '12m 34s',
                    status: 'SUCCESS',
                    type: 'full',
                },
                {
                    timestamp: '2025-03-25 02:00 UTC',
                    size: '41.8 GB',
                    duration: '12m 18s',
                    status: 'SUCCESS',
                    type: 'full',
                },
                {
                    timestamp: '2025-03-24 02:00 UTC',
                    size: '40.9 GB',
                    duration: '13m 02s',
                    status: 'SUCCESS',
                    type: 'full',
                },
            ],

            // Capacity Planning
            capacityPlanning: {
                current_used: 284.2,
                current_total: 512,
                current_usage_pct: 55.5,
                projected_12m: 380,
                projected_usage_12m: 74.2,
                days_until_full: 420,
            },

            // Network
            networkMetrics: indexed24h.map((d) => ({
                ...d,
                inbound: Math.floor(850 + Math.sin(d.index / 5) * 200 + Math.random() * 100),
                outbound: Math.floor(420 + Math.cos(d.index / 6) * 150 + Math.random() * 75),
            })),

            // ═══════════════════════════════════════════════════════════════════════════
            // 4. DATA (7 items)
            // ═══════════════════════════════════════════════════════════════════════════

            // Document Editor
            documentExample: {
                _id: 'ObjectId("507f1f77bcf86cd799439011")',
                collection: 'orders',
                doc: {
                    _id: 'ObjectId("507f1f77bcf86cd799439011")',
                    orderId: 'ORD-2025-0012840',
                    customer: 'Alice Johnson',
                    status: 'processing',
                    items: 3,
                    total: 1284.5,
                    createdAt: '2025-03-26T14:32:18Z',
                    updatedAt: '2025-03-26T14:35:42Z',
                },
            },

            // Aggregation Builder
            aggregationPipeline: [
                { stage: '$match', condition: '{status: "pending"}' },
                { stage: '$group', groupBy: '$customer', count: 'sum: 1' },
                { stage: '$sort', field: 'count', order: -1 },
                { stage: '$limit', value: 100 },
            ],

            // NL Query Generator
            naturalLanguageExamples: [
                {
                    input: 'Find all orders from the last 7 days sorted by amount',
                    query: 'db.orders.find({createdAt:{$gte:ISODate("2025-03-19")}}).sort({total:-1})',
                },
                {
                    input: 'Count distinct customers who spent over 1000',
                    query: 'db.orders.aggregate([{$match:{total:{$gt:1000}}},{$group:{_id:"$customer"}},{$count:"unique"}])',
                },
                {
                    input: 'Get top 10 products by order frequency',
                    query: 'db.orders.aggregate([{$unwind:"$items"},{$group:{_id:"$items.id",count:{$sum:1}}},{$sort:{count:-1}},{$limit:10}])',
                },
            ],

            // Import/Export
            importExportOps: [
                {
                    timestamp: '2025-03-26 14:22',
                    operation: 'IMPORT',
                    source: 'orders_backup.json',
                    records: 2840000,
                    status: 'COMPLETED',
                    duration: '8m 24s',
                },
                {
                    timestamp: '2025-03-26 10:15',
                    operation: 'EXPORT',
                    target: 'customers_dump.json',
                    records: 145000,
                    status: 'COMPLETED',
                    duration: '2m 18s',
                },
                {
                    timestamp: '2025-03-25 23:30',
                    operation: 'IMPORT',
                    source: 'transactions.csv',
                    records: 5620000,
                    status: 'COMPLETED',
                    duration: '24m 12s',
                },
            ],

            // SQL Translator
            sqlToMongoExamples: [
                {
                    sql: "SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10",
                    mongo: 'db.orders.find({status:"pending"}).sort({createdAt:-1}).limit(10)',
                },
                {
                    sql: 'SELECT COUNT(*) FROM orders GROUP BY customer_id',
                    mongo: 'db.orders.aggregate([{$group:{_id:"$customerId",count:{$sum:1}}}])',
                },
            ],

            // Schema Compare
            schemaComparison: [
                {
                    collection: 'orders',
                    prod: { fields: 18, avg_size: 4.6, doc_count: 2840000 },
                    staging: { fields: 18, avg_size: 4.6, doc_count: 2100000 },
                },
                {
                    collection: 'customers',
                    prod: { fields: 24, avg_size: 15.2, doc_count: 145000 },
                    staging: { fields: 24, avg_size: 15.1, doc_count: 120000 },
                },
            ],

            // Geo-spatial
            geoMetrics: [
                { location: 'US-East', documents: 1240000, avg_lat: 40.7128, avg_lng: -74.006 },
                { location: 'US-West', documents: 820000, avg_lat: 47.6062, avg_lng: -122.3321 },
                { location: 'EU-West', documents: 580000, avg_lat: 51.5074, avg_lng: -0.1278 },
                { location: 'Asia-Pacific', documents: 320000, avg_lat: 35.6762, avg_lng: 139.6503 },
            ],

            // ═══════════════════════════════════════════════════════════════════════════
            // 5. INTELLIGENCE (5 items)
            // ═══════════════════════════════════════════════════════════════════════════

            // AI Hints
            aiHints: [
                {
                    hint_id: 'h001',
                    category: 'PERFORMANCE',
                    message:
                        'Collection "orders" has 6 unused indexes. Removing could free 28 MB and improve write performance by 12%',
                    confidence: 0.94,
                },
                {
                    hint_id: 'h002',
                    category: 'SCHEMA',
                    message:
                        'Field "metadata" is sparse in 34% of documents. Consider reorganizing schema to improve compression',
                    confidence: 0.87,
                },
                {
                    hint_id: 'h003',
                    category: 'REPLICATION',
                    message: 'Secondary replica-2 is lagging by 45ms. Network bandwidth to that instance is at 85%',
                    confidence: 0.92,
                },
            ],

            // Compare Clusters
            clusterComparison: [
                { metric: 'Throughput (ops/s)', prod: 8420, staging: 3840, diff_pct: '+119%' },
                { metric: 'Avg Latency (ms)', prod: 12.4, staging: 8.2, diff_pct: '-51%' },
                { metric: 'Cache Fill %', prod: 73.4, staging: 65.2, diff_pct: '-11%' },
                { metric: 'Storage Used (GB)', prod: 284.2, staging: 156.8, diff_pct: '+81%' },
            ],

            // Historical Trends
            historicalTrends: indexed30d.map((d) => ({
                ...d,
                avg_latency: Math.floor(14 + Math.sin(d.index / 8) * 6 + Math.random() * 4),
                throughput: Math.floor(7800 + Math.cos(d.index / 10) * 1200 + Math.random() * 600),
            })),

            // Perf Advisor v2
            perfAdvisor: [
                {
                    recommendation: 'Add compound index on (status, createdAt) for collection "orders"',
                    impact: 'Save 840ms per query',
                    priority: 1,
                    effort: 'low',
                },
                {
                    recommendation: 'Enable compression on collection "logs" to reduce storage by 24%',
                    impact: 'Save 8.2 GB, improve read speed 6%',
                    priority: 2,
                    effort: 'medium',
                },
                {
                    recommendation: 'Migrate collection "archive" to different tier based on access patterns',
                    impact: 'Reduce peak latency by 180ms',
                    priority: 3,
                    effort: 'high',
                },
            ],

            // Trace Correlator
            traceCorrelations: [
                {
                    trace_id: 'tr-001',
                    operation: 'batch_insert',
                    duration: 2340,
                    stages: ['auth', 'validation', 'write', 'replication'],
                    bottleneck: 'replication',
                },
                {
                    trace_id: 'tr-002',
                    operation: 'aggregation',
                    duration: 8920,
                    stages: ['compile', 'execute', 'fetch'],
                    bottleneck: 'execute',
                },
            ],

            // ═══════════════════════════════════════════════════════════════════════════
            // 6. REPLICATION (3 items)
            // ═══════════════════════════════════════════════════════════════════════════

            // Replica Set + Failover
            replicas: [
                { id: 'replica-0', role: 'PRIMARY', state: 'PRIMARY', syncLag: '0ms', health: 1.0, uptime: '45d' },
                { id: 'replica-1', role: 'SECONDARY', state: 'SECONDARY', syncLag: '2ms', health: 0.98, uptime: '45d' },
                { id: 'replica-2', role: 'SECONDARY', state: 'SECONDARY', syncLag: '3ms', health: 0.97, uptime: '44d' },
                { id: 'arbiter-0', role: 'ARBITER', state: 'ARBITER', syncLag: 'N/A', health: 0.99, uptime: '45d' },
            ],

            // Sharding
            shards: [
                { id: 'shard-0', docs: 1850000, size: '8.2 GB', chunks: 24, status: 'active', health: 1.0 },
                { id: 'shard-1', docs: 1910000, size: '8.5 GB', chunks: 25, status: 'active', health: 0.98 },
                { id: 'shard-2', docs: 1880000, size: '8.3 GB', chunks: 23, status: 'active', health: 0.99 },
            ],

            // Oplog Tail
            oplogEvents: [
                { timestamp: 'Timestamp(1711449138,1)', operation: 'insert', ns: 'production.orders', duration: 2.3 },
                {
                    timestamp: 'Timestamp(1711449137,2)',
                    operation: 'update',
                    ns: 'production.customers',
                    duration: 1.8,
                },
                { timestamp: 'Timestamp(1711449136,1)', operation: 'delete', ns: 'production.logs', duration: 0.4 },
                { timestamp: 'Timestamp(1711449135,1)', operation: 'insert', ns: 'analytics.events', duration: 3.2 },
            ],

            // ═══════════════════════════════════════════════════════════════════════════
            // 7. MANAGEMENT (8 items)
            // ═══════════════════════════════════════════════════════════════════════════

            // Alert Manager
            alertsManager: {
                total: 24,
                critical: 2,
                warning: 5,
                info: 17,
            },
            activeAlerts: [
                { severity: 'critical', title: 'Cache Eviction Rate Critical', time: '8m ago', source: 'WiredTiger' },
                {
                    severity: 'critical',
                    title: 'Write Lock Contention Detected',
                    time: '12m ago',
                    source: 'GlobalLock',
                },
                { severity: 'warning', title: 'Replication Lag on replica-2', time: '24m ago', source: 'Replication' },
                { severity: 'warning', title: 'Index Fragmentation High', time: '45m ago', source: 'IndexStats' },
                { severity: 'warning', title: 'Slow Query: orders.find()', time: '1h ago', source: 'Profiler' },
            ],

            // Prometheus Export
            prometheusMetrics: [
                {
                    metric: 'mongodb_connections_current',
                    value: 110,
                    timestamp: 'now',
                    help: 'Current number of connections',
                },
                {
                    metric: 'mongodb_op_counters_total',
                    value: 1284500,
                    timestamp: 'now',
                    help: 'Cumulative operations counter',
                },
                {
                    metric: 'mongodb_wiredtiger_cache_evictions',
                    value: 24800,
                    timestamp: 'now',
                    help: 'WiredTiger cache evictions',
                },
                {
                    metric: 'mongodb_replication_lag_seconds',
                    value: 0.002,
                    timestamp: 'now',
                    help: 'Replication lag in seconds',
                },
            ],

            // SSO/Auth
            authConfig: {
                mechanism: 'SCRAM-SHA-256',
                ldap_enabled: true,
                oauth2_enabled: true,
                mfa_required: true,
                password_policy: 'strong',
                session_timeout: '30m',
            },

            // Atlas API Bridge
            atlasAPIMetrics: [
                { endpoint: 'GET /groups/{groupId}/clusters', calls: 2840, avg_response: 240, errors: 0 },
                { endpoint: 'POST /groups/{groupId}/backups', calls: 24, avg_response: 3200, errors: 0 },
                { endpoint: 'GET /orgs/{orgId}/users', calls: 450, avg_response: 180, errors: 2 },
            ],

            // Dashboards
            customDashboards: [
                { name: 'Operations Overview', widgets: 8, shared: true, last_modified: '2d ago' },
                { name: 'Performance Diagnostics', widgets: 12, shared: false, last_modified: '4h ago' },
                { name: 'SLA Compliance', widgets: 5, shared: true, last_modified: '1w ago' },
            ],

            // Reports
            reports: [
                { name: 'Monthly Performance Report', generated: '2025-03-26', recipients: 12, format: 'PDF' },
                { name: 'Capacity Planning Summary', generated: '2025-03-20', recipients: 8, format: 'HTML' },
                { name: 'Security Audit Log', generated: '2025-03-15', recipients: 5, format: 'JSON' },
            ],

            // Audit Log
            auditLog: [
                {
                    timestamp: '2025-03-26 14:32',
                    action: 'CREATE_INDEX',
                    user: 'alice@company.com',
                    collection: 'orders',
                    status: 'SUCCESS',
                },
                {
                    timestamp: '2025-03-26 13:45',
                    action: 'DROP_COLLECTION',
                    user: 'bob@company.com',
                    collection: 'temp_data',
                    status: 'SUCCESS',
                },
                {
                    timestamp: '2025-03-26 12:20',
                    action: 'ADD_USER',
                    user: 'admin@company.com',
                    target: 'charlie@company.com',
                    status: 'SUCCESS',
                },
                {
                    timestamp: '2025-03-26 11:10',
                    action: 'EXPORT_DATA',
                    user: 'data-team@company.com',
                    database: 'analytics',
                    status: 'SUCCESS',
                },
            ],

            // Users
            users: [
                { username: 'alice@company.com', role: 'Admin', created: '6m ago', last_login: '12m ago', mfa: true },
                { username: 'bob@company.com', role: 'Developer', created: '2m ago', last_login: '8m ago', mfa: false },
                {
                    username: 'charlie@company.com',
                    role: 'Analyst',
                    created: '1w ago',
                    last_login: '2h ago',
                    mfa: true,
                },
                {
                    username: 'data-team@company.com',
                    role: 'Service Account',
                    created: '3w ago',
                    last_login: '1m ago',
                    mfa: false,
                },
            ],
        };
    }, []);

    const sections = [
        {
            key: 'overview',
            label: 'Overview',
            icon: Database,
            accent: THEME.primary,
            items: [
                { key: 'executive', label: 'Executive Dashboard' },
                { key: 'connection', label: 'Connection' },
                { key: 'serverinfo', label: 'Server Info' },
                { key: 'databases', label: 'Databases' },
                { key: 'relationships', label: 'Collection Relationships' },
            ],
        },
        {
            key: 'performance',
            label: 'Performance',
            icon: Zap,
            accent: THEME.success,
            items: [
                { key: 'serverstatus', label: 'Server Status' },
                { key: 'realtimeops', label: 'Real-time Ops' },
                { key: 'latency', label: 'Latency Percentiles' },
                { key: 'namespace', label: 'Namespace Insights' },
                { key: 'explain', label: 'Explain Plan' },
                { key: 'activeops', label: 'Active Operations' },
                { key: 'slowqueries', label: 'Slow Queries' },
                { key: 'profiler', label: 'Query Profiler' },
                { key: 'costestimator', label: 'Query Cost Estimator' },
                { key: 'locks', label: 'Lock Analysis' },
                { key: 'anomaly', label: 'Anomaly Detection' },
                { key: 'metricspreview', label: 'Metrics Preview' },
                { key: 'liveagent', label: 'Live Agent' },
            ],
        },
        {
            key: 'storage',
            label: 'Storage',
            icon: HardDrive,
            accent: THEME.warning,
            items: [
                { key: 'indexadvisor', label: 'Index Advisor' },
                { key: 'schemaanalyzer', label: 'Schema Analyzer' },
                { key: 'collectionstats', label: 'Collection Stats' },
                { key: 'wiredtiger', label: 'WiredTiger Cache' },
                { key: 'backup', label: 'Backup Monitor' },
                { key: 'capacity', label: 'Capacity Planning' },
                { key: 'network', label: 'Network' },
            ],
        },
        {
            key: 'data',
            label: 'Data',
            icon: Code,
            accent: THEME.primary,
            items: [
                { key: 'editor', label: 'Document Editor' },
                { key: 'aggregation', label: 'Aggregation Builder' },
                { key: 'nlquery', label: 'NL Query Generator' },
                { key: 'importexport', label: 'Import/Export' },
                { key: 'sqltranslator', label: 'SQL Translator' },
                { key: 'schemacompare', label: 'Schema Compare' },
                { key: 'geospatial', label: 'Geo-spatial' },
            ],
        },
        {
            key: 'intelligence',
            label: 'Intelligence',
            icon: Brain,
            accent: THEME.ai,
            items: [
                { key: 'aihints', label: 'AI Hints' },
                { key: 'clustercompare', label: 'Compare Clusters' },
                { key: 'historicaltrends', label: 'Historical Trends' },
                { key: 'perfadvisor', label: 'Perf Advisor v2' },
                { key: 'tracecorrelator', label: 'Trace Correlator' },
            ],
        },
        {
            key: 'replication',
            label: 'Replication',
            icon: GitBranch,
            accent: THEME.info || THEME.primary,
            items: [
                { key: 'replicaset', label: 'Replica Set + Failover' },
                { key: 'sharding', label: 'Sharding' },
                { key: 'oplog', label: 'Oplog Tail' },
            ],
        },
        {
            key: 'management',
            label: 'Management',
            icon: Settings,
            accent: THEME.secondary || THEME.primary,
            items: [
                { key: 'alerts', label: 'Alert Manager' },
                { key: 'prometheus', label: 'Prometheus Export' },
                { key: 'auth', label: 'SSO/Auth' },
                { key: 'atlasapi', label: 'Atlas API Bridge' },
                { key: 'dashboards', label: 'Dashboards' },
                { key: 'reports', label: 'Reports' },
                { key: 'auditlog', label: 'Audit Log' },
                { key: 'users', label: 'Users' },
            ],
        },
    ];

    const renderContent = (sectionKey, itemKey) => {
        switch (sectionKey) {
            // ═════════════════════════════════════════════════════════════════════════
            // OVERVIEW SECTION
            // ═════════════════════════════════════════════════════════════════════════
            case 'overview':
                switch (itemKey) {
                    case 'executive':
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                        gap: 12,
                                    }}
                                    className="dpg-stagger"
                                >
                                    <MetricCard
                                        icon={Database}
                                        label="Cluster"
                                        value={demoData.clusterHealth.status}
                                        sub={`${demoData.clusterHealth.primaryNode}`}
                                        color={THEME.success}
                                        spark={Array.from({ length: 12 }, () => Math.random() * 100)}
                                    />
                                    <MetricCard
                                        icon={Clock}
                                        label="Uptime"
                                        value={demoData.clusterHealth.uptime}
                                        color={THEME.primary}
                                        spark={Array.from({ length: 12 }, () => 90 + Math.random() * 10)}
                                    />
                                    <MetricCard
                                        icon={Server}
                                        label="Secondaries"
                                        value={demoData.clusterHealth.secondaries}
                                        color={THEME.info || THEME.primary}
                                        spark={Array.from({ length: 12 }, () => 2 + Math.random() * 0.2)}
                                    />
                                    <MetricCard
                                        icon={Zap}
                                        label="Version"
                                        value={demoData.clusterHealth.version}
                                        color={THEME.primary}
                                    />
                                </div>

                                <Panel title="Cluster Performance" icon={Activity} accentColor={THEME.success}>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <AreaChart data={demoData.clusterMetrics}>
                                            <defs>
                                                <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={THEME.success} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                            <XAxis dataKey="time" stroke={THEME.textDim} />
                                            <YAxis stroke={THEME.textDim} />
                                            <Tooltip content={<ChartTip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="throughput"
                                                stroke={THEME.success}
                                                fill="url(#colorThroughput)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Panel>
                            </div>
                        );
                    case 'connection':
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div
                                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}
                                    className="dpg-stagger"
                                >
                                    <MetricCard
                                        icon={Network}
                                        label="Active"
                                        value={demoData.connectionStats.active}
                                        color={THEME.success}
                                    />
                                    <MetricCard
                                        icon={Eye}
                                        label="Idle"
                                        value={demoData.connectionStats.idle}
                                        color={THEME.warning}
                                    />
                                    <MetricCard
                                        icon={Filter}
                                        label="Available"
                                        value={demoData.connectionStats.available}
                                        color={THEME.primary}
                                    />
                                    <MetricCard
                                        icon={Database}
                                        label="Max Pool"
                                        value={demoData.connectionStats.maxPoolSize}
                                        color={THEME.info || THEME.primary}
                                    />
                                </div>

                                <Panel title="Connection Trends" icon={TrendingUp} accentColor={THEME.success}>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <AreaChart data={demoData.connectionTrends}>
                                            <defs>
                                                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={THEME.success} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorIdle" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={THEME.warning} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                            <XAxis dataKey="time" stroke={THEME.textDim} />
                                            <YAxis stroke={THEME.textDim} />
                                            <Tooltip content={<ChartTip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="active"
                                                stroke={THEME.success}
                                                fill="url(#colorActive)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="idle"
                                                stroke={THEME.warning}
                                                fill="url(#colorIdle)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Panel>
                            </div>
                        );
                    case 'serverinfo':
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Panel title="Server Configuration" icon={Settings} accentColor={THEME.primary}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        {[
                                            { label: 'Hostname', value: demoData.serverInfo.hostname },
                                            { label: 'Port', value: demoData.serverInfo.port },
                                            { label: 'Memory', value: demoData.serverInfo.memory },
                                            { label: 'Storage', value: demoData.serverInfo.storage },
                                            { label: 'OS', value: demoData.serverInfo.os },
                                            { label: 'Architecture', value: demoData.serverInfo.arch },
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: THEME.textDim,
                                                        fontWeight: 600,
                                                        letterSpacing: '0.05em',
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    {item.label.toUpperCase()}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        color: THEME.textMain,
                                                        fontFamily: THEME.fontMono,
                                                    }}
                                                >
                                                    {item.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Panel>
                            </div>
                        );
                    case 'databases':
                        return (
                            <Panel title="Databases" icon={Database} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'name', label: 'Database', width: '25%' },
                                        { key: 'collections', label: 'Collections', align: 'right' },
                                        { key: 'size', label: 'Size', align: 'right', mono: true },
                                        { key: 'indexes', label: 'Indexes', align: 'right' },
                                        { key: 'doc_count', label: 'Document Count', align: 'right', mono: true },
                                    ]}
                                    rows={demoData.databases}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'relationships':
                        return (
                            <Panel title="Collection Relationships" icon={GitBranch} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'from', label: 'From Collection', width: '25%', mono: true },
                                        { key: 'to', label: 'To Collection', width: '25%', mono: true },
                                        { key: 'type', label: 'Type', align: 'center' },
                                        { key: 'count', label: 'Operations', align: 'right', mono: true },
                                    ]}
                                    rows={demoData.collectionRelationships}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    default:
                        return null;
                }

            // ═════════════════════════════════════════════════════════════════════════
            // PERFORMANCE SECTION
            // ═════════════════════════════════════════════════════════════════════════
            case 'performance':
                switch (itemKey) {
                    case 'serverstatus':
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                        gap: 12,
                                    }}
                                    className="dpg-stagger"
                                >
                                    <MetricCard
                                        icon={Zap}
                                        label="Created"
                                        value={demoData.serverStatus.connectionsCreated}
                                        color={THEME.primary}
                                        trend={12}
                                        trendUp
                                    />
                                    <MetricCard
                                        icon={Upload}
                                        label="Bytes In"
                                        value={demoData.serverStatus.networkBytesIn}
                                        color={THEME.success}
                                    />
                                    <MetricCard
                                        icon={Download}
                                        label="Bytes Out"
                                        value={demoData.serverStatus.networkBytesOut}
                                        color={THEME.warning}
                                    />
                                    <MetricCard
                                        icon={Copy}
                                        label="Inserts"
                                        value={demoData.serverStatus.operationsIns}
                                        color={THEME.info || THEME.primary}
                                        trend={8}
                                        trendUp
                                    />
                                    <MetricCard
                                        icon={RefreshCw}
                                        label="Updates"
                                        value={demoData.serverStatus.operationsUpd}
                                        color={THEME.success}
                                        trend={5}
                                        trendUp
                                    />
                                    <MetricCard
                                        icon={Layers}
                                        label="Deletes"
                                        value={demoData.serverStatus.operationsDel}
                                        color={THEME.danger}
                                        trend={2}
                                        trendUp
                                    />
                                    <MetricCard
                                        icon={Eye}
                                        label="Queries"
                                        value={demoData.serverStatus.operationsQry}
                                        color={THEME.primary}
                                        trend={15}
                                        trendUp
                                    />
                                </div>

                                <Panel title="Server Status Trends" icon={Activity} accentColor={THEME.success}>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <LineChart data={demoData.realtimeOps}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                            <XAxis dataKey="time" stroke={THEME.textDim} />
                                            <YAxis stroke={THEME.textDim} />
                                            <Tooltip content={<ChartTip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="read"
                                                stroke={THEME.primary}
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="write"
                                                stroke={THEME.warning}
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Panel>
                            </div>
                        );
                    case 'realtimeops':
                        return (
                            <Panel title="Real-time Operations" icon={Activity} accentColor={THEME.success}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={demoData.realtimeOps}>
                                        <defs>
                                            <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorWrite" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.warning} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} />
                                        <YAxis stroke={THEME.textDim} />
                                        <Tooltip content={<ChartTip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="read"
                                            stroke={THEME.primary}
                                            fill="url(#colorRead)"
                                            stackId="1"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="write"
                                            stroke={THEME.warning}
                                            fill="url(#colorWrite)"
                                            stackId="1"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        );
                    case 'latency':
                        return (
                            <Panel title="Latency Percentiles" icon={Gauge} accentColor={THEME.warning}>
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={demoData.latencyPercentiles}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} />
                                        <YAxis stroke={THEME.textDim} />
                                        <Tooltip content={<ChartTip />} />
                                        <Legend wrapperStyle={{ color: THEME.textMuted }} />
                                        <Line
                                            type="monotone"
                                            dataKey="p50"
                                            stroke={THEME.success}
                                            strokeWidth={2}
                                            name="p50"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="p95"
                                            stroke={THEME.warning}
                                            strokeWidth={2}
                                            name="p95"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="p99"
                                            stroke={THEME.danger}
                                            strokeWidth={2}
                                            name="p99"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Panel>
                        );
                    case 'namespace':
                        return (
                            <Panel title="Namespace Insights" icon={Database} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'ns', label: 'Namespace', mono: true },
                                        { key: 'ops_sec', label: 'Ops/sec', align: 'right' },
                                        { key: 'avg_latency', label: 'Avg Latency (ms)', align: 'right', mono: true },
                                        { key: 'size_mb', label: 'Size (MB)', align: 'right', mono: true },
                                        { key: 'index_count', label: 'Indexes', align: 'right' },
                                    ]}
                                    rows={demoData.namespaceMetrics}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'explain':
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <Panel title="Explain Plan" icon={Eye} accentColor={THEME.info || THEME.primary}>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                            gap: 12,
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    letterSpacing: '0.05em',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                EXECUTION STAGE
                                            </div>
                                            <StatusBadge
                                                label={demoData.explainPlanExample.executionStage}
                                                color={THEME.warning}
                                            />
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    letterSpacing: '0.05em',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                RETURNED DOCS
                                            </div>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: THEME.primary }}>
                                                {demoData.explainPlanExample.nReturned.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    letterSpacing: '0.05em',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                EXEC TIME (MS)
                                            </div>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: THEME.warning }}>
                                                {demoData.explainPlanExample.executionTimeMillis}
                                            </div>
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    letterSpacing: '0.05em',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                KEYS EXAMINED
                                            </div>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: THEME.textMuted }}>
                                                {(demoData.explainPlanExample.totalKeysExamined / 1000000).toFixed(1)}M
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 16,
                                            padding: 12,
                                            background: THEME.glass,
                                            borderRadius: 8,
                                            border: `1px solid ${THEME.glassBorder}`,
                                            fontFamily: THEME.fontMono,
                                            fontSize: 11,
                                            color: THEME.textMuted,
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {demoData.explainPlanExample.query}
                                    </div>
                                </Panel>
                            </div>
                        );
                    case 'activeops':
                        return (
                            <Panel title="Active Operations" icon={Activity} accentColor={THEME.success}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {demoData.activeOps.map((op, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: `${THEME.primary}08`,
                                                borderLeft: `3px solid ${THEME.primary}`,
                                                borderRadius: 6,
                                                fontSize: 12,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <span style={{ fontWeight: 600, color: THEME.textMain }}>{op.id}</span>
                                                <span style={{ color: THEME.textDim }}>Active: {op.active_time}</span>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: 16,
                                                    fontSize: 11,
                                                    color: THEME.textMuted,
                                                }}
                                            >
                                                <span>Namespace: {op.ns}</span>
                                                <span>Cmd: {op.cmd}</span>
                                                {op.blocks && (
                                                    <span style={{ color: THEME.warning }}>Blocks: {op.blocks}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'slowqueries':
                        return (
                            <Panel title="Slow Queries" icon={AlertTriangle} accentColor={THEME.danger}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {demoData.slowQueries.map((q, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: `${THEME.danger}08`,
                                                borderLeft: `3px solid ${THEME.danger}`,
                                                borderRadius: 6,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    fontFamily: THEME.fontMono,
                                                    color: THEME.textMuted,
                                                    marginBottom: 6,
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {q.query}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                                    gap: 12,
                                                    fontSize: 10,
                                                }}
                                            >
                                                <div>
                                                    <span style={{ color: THEME.textDim }}>Duration</span>
                                                    <div style={{ fontWeight: 600, color: THEME.danger }}>
                                                        {q.duration}ms
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{ color: THEME.textDim }}>Scanned</span>
                                                    <div style={{ fontWeight: 600 }}>
                                                        {(q.scanned / 1000).toFixed(0)}k
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{ color: THEME.textDim }}>Returned</span>
                                                    <div style={{ fontWeight: 600 }}>
                                                        {(q.returned / 1000).toFixed(1)}k
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'profiler':
                        return (
                            <Panel title="Query Profiler" icon={Radar} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'timestamp', label: 'Timestamp', mono: true },
                                        { key: 'ns', label: 'Namespace', mono: true },
                                        { key: 'millis', label: 'Duration (ms)', align: 'right', mono: true },
                                        { key: 'docs', label: 'Docs', align: 'right' },
                                    ]}
                                    rows={demoData.profiledQueries}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'costestimator':
                        return (
                            <Panel title="Query Cost Estimator" icon={Lightbulb} accentColor={THEME.warning}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: THEME.textDim,
                                                fontWeight: 600,
                                                letterSpacing: '0.05em',
                                                marginBottom: 8,
                                            }}
                                        >
                                            ESTIMATED COST
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: THEME.primary }}>
                                            {demoData.costEstimate.estimatedCost.toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: THEME.textDim,
                                                fontWeight: 600,
                                                letterSpacing: '0.05em',
                                                marginBottom: 8,
                                            }}
                                        >
                                            ESTIMATED ROWS
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: THEME.success }}>
                                            {demoData.costEstimate.estimatedRows.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: THEME.textDim,
                                            fontWeight: 600,
                                            letterSpacing: '0.05em',
                                            marginBottom: 8,
                                        }}
                                    >
                                        RECOMMENDATION
                                    </div>
                                    <StatusBadge label={demoData.costEstimate.recommendation} color={THEME.success} />
                                </div>
                            </Panel>
                        );
                    case 'locks':
                        return (
                            <Panel title="Lock Analysis" icon={Lock} accentColor={THEME.warning}>
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={demoData.lockMetrics}>
                                        <defs>
                                            <linearGradient id="colorWaits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.warning} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} />
                                        <YAxis stroke={THEME.textDim} />
                                        <Tooltip content={<ChartTip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="waits"
                                            stroke={THEME.warning}
                                            fill="url(#colorWaits)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        );
                    case 'anomaly':
                        return (
                            <Panel title="Anomaly Detection" icon={AlertTriangle} accentColor={THEME.danger}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {demoData.anomalies.map((a, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: `${a.severity === 'high' ? THEME.danger : THEME.warning}08`,
                                                borderLeft: `3px solid ${a.severity === 'high' ? THEME.danger : THEME.warning}`,
                                                borderRadius: 6,
                                                fontSize: 11,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <span style={{ fontWeight: 600 }}>{a.type}</span>
                                                <span style={{ color: THEME.textDim }}>{a.time}</span>
                                            </div>
                                            <div style={{ color: THEME.textMuted }}>{a.metric}</div>
                                            <div style={{ marginTop: 4, fontSize: 10 }}>
                                                Current: <span style={{ fontWeight: 600 }}>{a.value}</span> | Baseline:{' '}
                                                <span style={{ fontWeight: 600 }}>{a.baseline}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'metricspreview':
                        return (
                            <Panel title="Metrics Preview" icon={BarChart3} accentColor={THEME.primary}>
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={demoData.metricsPreview}>
                                        <defs>
                                            <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorWrite" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.success} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} />
                                        <YAxis stroke={THEME.textDim} />
                                        <Tooltip content={<ChartTip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="opcounters_read"
                                            stroke={THEME.primary}
                                            fill="url(#colorRead)"
                                            stackId="1"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="opcounters_write"
                                            stroke={THEME.success}
                                            fill="url(#colorWrite)"
                                            stackId="1"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        );
                    case 'liveagent':
                        return (
                            <Panel title="Live Agent Status" icon={Radio} accentColor={THEME.success}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: THEME.textDim,
                                                fontWeight: 600,
                                                letterSpacing: '0.05em',
                                                marginBottom: 8,
                                            }}
                                        >
                                            AGENT ID
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: THEME.fontMono }}>
                                            {demoData.liveAgentStatus.agent_id}
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: THEME.textDim,
                                                fontWeight: 600,
                                                letterSpacing: '0.05em',
                                                marginBottom: 8,
                                            }}
                                        >
                                            STATUS
                                        </div>
                                        <StatusBadge
                                            label={demoData.liveAgentStatus.status}
                                            color={THEME.success}
                                            pulse
                                        />
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: THEME.textDim,
                                                fontWeight: 600,
                                                letterSpacing: '0.05em',
                                                marginBottom: 8,
                                            }}
                                        >
                                            LAST HEARTBEAT
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                                            {demoData.liveAgentStatus.last_heartbeat}
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: THEME.textDim,
                                                fontWeight: 600,
                                                letterSpacing: '0.05em',
                                                marginBottom: 8,
                                            }}
                                        >
                                            VERSION
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                                            {demoData.liveAgentStatus.version}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: 16,
                                        padding: 12,
                                        background: THEME.glass,
                                        borderRadius: 8,
                                        borderLeft: `3px solid ${THEME.success}`,
                                    }}
                                >
                                    <div
                                        style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, marginBottom: 6 }}
                                    >
                                        METRICS COLLECTED
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: THEME.success }}>
                                        {demoData.liveAgentStatus.metrics_collected.toLocaleString()}
                                    </div>
                                </div>
                            </Panel>
                        );
                    default:
                        return null;
                }

            // ═════════════════════════════════════════════════════════════════════════
            // STORAGE SECTION
            // ═════════════════════════════════════════════════════════════════════════
            case 'storage':
                switch (itemKey) {
                    case 'indexadvisor':
                        return (
                            <Panel title="Index Advisor Recommendations" icon={Lightbulb} accentColor={THEME.warning}>
                                <DataTable
                                    columns={[
                                        { key: 'collection', label: 'Collection', mono: true },
                                        { key: 'field', label: 'Field', mono: true },
                                        { key: 'selectivity', label: 'Selectivity', align: 'right' },
                                        { key: 'est_size', label: 'Est. Size', align: 'right', mono: true },
                                        { key: 'potential_save', label: 'Potential Save', align: 'right', mono: true },
                                    ]}
                                    rows={demoData.indexRecommendations}
                                    accentColor={THEME.warning}
                                />
                            </Panel>
                        );
                    case 'schemaanalyzer':
                        return (
                            <Panel title="Schema Analysis" icon={Code} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'collection', label: 'Collection', mono: true },
                                        { key: 'field_count', label: 'Fields', align: 'right' },
                                        { key: 'avg_doc_size', label: 'Avg Doc Size (KB)', align: 'right', mono: true },
                                        { key: 'type_consistency', label: 'Type Consistency', align: 'right' },
                                    ]}
                                    rows={demoData.schemaAnalysis}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'collectionstats':
                        return (
                            <Panel title="Collection Statistics" icon={Database} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'name', label: 'Collection', mono: true },
                                        { key: 'docs', label: 'Documents', align: 'right', mono: true },
                                        { key: 'size', label: 'Size', align: 'right', mono: true },
                                        { key: 'indexes', label: 'Indexes', align: 'right' },
                                        { key: 'avgDocSize', label: 'Avg Doc Size', align: 'right', mono: true },
                                    ]}
                                    rows={demoData.collectionStats}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'wiredtiger':
                        return (
                            <Panel title="WiredTiger Cache Metrics" icon={HardDrive} accentColor={THEME.warning}>
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={demoData.wiredTigerMetrics}>
                                        <defs>
                                            <linearGradient id="colorEvictions" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.danger} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.danger} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} />
                                        <YAxis yAxisId="left" stroke={THEME.textDim} />
                                        <YAxis yAxisId="right" orientation="right" stroke={THEME.textDim} />
                                        <Tooltip content={<ChartTip />} />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="evictions"
                                            stroke={THEME.danger}
                                            fill="url(#colorEvictions)"
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="cacheFillPct"
                                            stroke={THEME.success}
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        );
                    case 'backup':
                        return (
                            <Panel title="Backup Monitor" icon={Archive} accentColor={THEME.success}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {demoData.backups.map((b, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: THEME.glass,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderRadius: 6,
                                                borderLeft: `3px solid ${b.status === 'SUCCESS' ? THEME.success : THEME.danger}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <span style={{ fontWeight: 600 }}>{b.timestamp}</span>
                                                <StatusBadge
                                                    label={b.status}
                                                    color={b.status === 'SUCCESS' ? THEME.success : THEME.danger}
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                                    gap: 12,
                                                    fontSize: 11,
                                                }}
                                            >
                                                <div>
                                                    <span style={{ color: THEME.textDim }}>Size</span>
                                                    <div style={{ fontWeight: 600 }}>{b.size}</div>
                                                </div>
                                                <div>
                                                    <span style={{ color: THEME.textDim }}>Duration</span>
                                                    <div style={{ fontWeight: 600 }}>{b.duration}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'capacity':
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                        gap: 12,
                                    }}
                                >
                                    <MetricCard
                                        icon={HardDrive}
                                        label="Current"
                                        value={demoData.capacityPlanning.current_used + ' GB'}
                                        sub={demoData.capacityPlanning.current_usage_pct + '%'}
                                        color={THEME.warning}
                                    />
                                    <MetricCard
                                        icon={TrendingDown}
                                        label="Projected 12m"
                                        value={demoData.capacityPlanning.projected_12m + ' GB'}
                                        sub={demoData.capacityPlanning.projected_usage_12m + '%'}
                                        color={THEME.primary}
                                    />
                                    <MetricCard
                                        icon={Clock}
                                        label="Days to Full"
                                        value={demoData.capacityPlanning.days_until_full + 'd'}
                                        color={THEME.success}
                                        trend={-15}
                                        trendUp={false}
                                    />
                                </div>
                                <Panel title="Capacity Trend" icon={HardDrive} accentColor={THEME.warning}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '16px 0',
                                        }}
                                    >
                                        <RingGauge
                                            value={demoData.capacityPlanning.current_usage_pct}
                                            color={THEME.warning}
                                            label="CURRENT"
                                        />
                                        <div style={{ flex: 1, minHeight: 0 }}>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    marginBottom: 8,
                                                }}
                                            >
                                                PROJECTION IN 12 MONTHS
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 18,
                                                    fontWeight: 700,
                                                    color: THEME.primary,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                {demoData.capacityPlanning.projected_12m} GB (
                                                {demoData.capacityPlanning.projected_usage_12m}%)
                                            </div>
                                            <div style={{ fontSize: 11, color: THEME.textMuted }}>
                                                At current growth rate, storage will reach capacity in ~
                                                {demoData.capacityPlanning.days_until_full} days
                                            </div>
                                        </div>
                                    </div>
                                </Panel>
                            </div>
                        );
                    case 'network':
                        return (
                            <Panel title="Network Metrics" icon={Network} accentColor={THEME.success}>
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={demoData.networkMetrics}>
                                        <defs>
                                            <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.success} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} />
                                        <YAxis stroke={THEME.textDim} />
                                        <Tooltip content={<ChartTip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="inbound"
                                            stroke={THEME.primary}
                                            fill="url(#colorInbound)"
                                            stackId="1"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="outbound"
                                            stroke={THEME.success}
                                            fill="url(#colorOutbound)"
                                            stackId="1"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        );
                    default:
                        return null;
                }

            // ═════════════════════════════════════════════════════════════════════════
            // DATA SECTION
            // ═════════════════════════════════════════════════════════════════════════
            case 'data':
                switch (itemKey) {
                    case 'editor':
                        return (
                            <Panel title="Document Editor" icon={FileCode} accentColor={THEME.primary}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: THEME.textDim,
                                                fontWeight: 600,
                                                letterSpacing: '0.05em',
                                                marginBottom: 8,
                                            }}
                                        >
                                            COLLECTION
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: THEME.fontMono }}>
                                            {demoData.documentExample.collection}
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: THEME.textDim,
                                                fontWeight: 600,
                                                letterSpacing: '0.05em',
                                                marginBottom: 8,
                                            }}
                                        >
                                            DOCUMENT ID
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                fontFamily: THEME.fontMono,
                                                color: THEME.textMuted,
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {demoData.documentExample._id}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: 16,
                                        padding: 12,
                                        background: THEME.glass,
                                        borderRadius: 8,
                                        border: `1px solid ${THEME.glassBorder}`,
                                        fontFamily: THEME.fontMono,
                                        fontSize: 10,
                                        color: THEME.textMuted,
                                        maxHeight: 300,
                                        overflow: 'auto',
                                    }}
                                >
                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {JSON.stringify(demoData.documentExample.doc, null, 2)}
                                    </pre>
                                </div>
                            </Panel>
                        );
                    case 'aggregation':
                        return (
                            <Panel title="Aggregation Pipeline Builder" icon={Workflow} accentColor={THEME.primary}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {demoData.aggregationPipeline.map((stage, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: `${THEME.primary}08`,
                                                borderLeft: `3px solid ${THEME.primary}`,
                                                borderRadius: 6,
                                                fontFamily: THEME.fontMono,
                                                fontSize: 11,
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                                Stage {i + 1}: {stage.stage}
                                            </div>
                                            <div style={{ color: THEME.textMuted }}>
                                                {Object.entries(stage)
                                                    .filter(([k]) => k !== 'stage')
                                                    .map(([k, v]) => `${k}: ${v}`)
                                                    .join(' | ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'nlquery':
                        return (
                            <Panel title="Natural Language Query Generator" icon={Brain} accentColor={THEME.ai}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {demoData.naturalLanguageExamples.map((ex, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: THEME.glass,
                                                borderRadius: 8,
                                                border: `1px solid ${THEME.glassBorder}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                NATURAL LANGUAGE INPUT
                                            </div>
                                            <div style={{ fontSize: 12, marginBottom: 10, fontStyle: 'italic' }}>
                                                {ex.input}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                GENERATED MONGO QUERY
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    fontFamily: THEME.fontMono,
                                                    color: THEME.textMuted,
                                                    background: THEME.glass,
                                                    padding: 8,
                                                    borderRadius: 4,
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {ex.query}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'importexport':
                        return (
                            <Panel title="Import / Export Operations" icon={Download} accentColor={THEME.success}>
                                <DataTable
                                    columns={[
                                        { key: 'timestamp', label: 'Timestamp', mono: true },
                                        { key: 'operation', label: 'Operation', align: 'center' },
                                        { key: 'records', label: 'Records', align: 'right', mono: true },
                                        { key: 'status', label: 'Status', align: 'center' },
                                        { key: 'duration', label: 'Duration', align: 'right', mono: true },
                                    ]}
                                    rows={demoData.importExportOps}
                                    accentColor={THEME.success}
                                />
                            </Panel>
                        );
                    case 'sqltranslator':
                        return (
                            <Panel
                                title="SQL to MongoDB Translator"
                                icon={Code}
                                accentColor={THEME.info || THEME.primary}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {demoData.sqlToMongoExamples.map((ex, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: THEME.glass,
                                                borderRadius: 8,
                                                border: `1px solid ${THEME.glassBorder}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                SQL QUERY
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    fontFamily: THEME.fontMono,
                                                    color: THEME.textMuted,
                                                    background: THEME.glass,
                                                    padding: 8,
                                                    borderRadius: 4,
                                                    marginBottom: 10,
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {ex.sql}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    marginBottom: 6,
                                                }}
                                            >
                                                MONGODB QUERY
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    fontFamily: THEME.fontMono,
                                                    color: THEME.success,
                                                    background: THEME.glass,
                                                    padding: 8,
                                                    borderRadius: 4,
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {ex.mongo}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'schemacompare':
                        return (
                            <Panel title="Schema Comparison" icon={Compass} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'collection', label: 'Collection', mono: true },
                                        { key: 'prod', label: 'Production', align: 'center' },
                                        { key: 'staging', label: 'Staging', align: 'center' },
                                    ]}
                                    rows={demoData.schemaComparison.map((s) => ({
                                        collection: s.collection,
                                        prod: `${s.prod.fields}F / ${s.prod.doc_count / 1000}k`,
                                        staging: `${s.staging.fields}F / ${s.staging.doc_count / 1000}k`,
                                    }))}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'geospatial':
                        return (
                            <Panel title="Geo-spatial Data" icon={Map} accentColor={THEME.success}>
                                <DataTable
                                    columns={[
                                        { key: 'location', label: 'Location', width: '30%' },
                                        { key: 'documents', label: 'Documents', align: 'right', mono: true },
                                        { key: 'avg_lat', label: 'Avg Latitude', align: 'right', mono: true },
                                        { key: 'avg_lng', label: 'Avg Longitude', align: 'right', mono: true },
                                    ]}
                                    rows={demoData.geoMetrics}
                                    accentColor={THEME.success}
                                />
                            </Panel>
                        );
                    default:
                        return null;
                }

            // ═════════════════════════════════════════════════════════════════════════
            // INTELLIGENCE SECTION
            // ═════════════════════════════════════════════════════════════════════════
            case 'intelligence':
                switch (itemKey) {
                    case 'aihints':
                        return (
                            <Panel title="AI Hints & Recommendations" icon={Brain} accentColor={THEME.ai}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {demoData.aiHints.map((h, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: `${THEME.ai}08`,
                                                borderLeft: `3px solid ${THEME.ai}`,
                                                borderRadius: 6,
                                                fontSize: 11,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <span style={{ fontWeight: 600, color: THEME.ai }}>
                                                    ID: {h.hint_id}
                                                </span>
                                                <span style={{ color: THEME.textDim }}>
                                                    Confidence: {(h.confidence * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div style={{ marginBottom: 4 }}>
                                                <StatusBadge label={h.category} color={THEME.ai} />
                                            </div>
                                            <div style={{ color: THEME.textMuted }}>{h.message}</div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'clustercompare':
                        return (
                            <Panel title="Cluster Comparison" icon={GitBranch} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'metric', label: 'Metric', width: '40%' },
                                        { key: 'prod', label: 'Production', align: 'right', mono: true },
                                        { key: 'staging', label: 'Staging', align: 'right', mono: true },
                                        { key: 'diff_pct', label: 'Difference', align: 'right', mono: true },
                                    ]}
                                    rows={demoData.clusterComparison}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'historicaltrends':
                        return (
                            <Panel title="Historical Trends (30 days)" icon={TrendingUp} accentColor={THEME.success}>
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={demoData.historicalTrends}>
                                        <defs>
                                            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.warning} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.warning} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
                                        <XAxis dataKey="time" stroke={THEME.textDim} />
                                        <YAxis yAxisId="left" stroke={THEME.textDim} />
                                        <YAxis yAxisId="right" orientation="right" stroke={THEME.textDim} />
                                        <Tooltip content={<ChartTip />} />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="avg_latency"
                                            stroke={THEME.warning}
                                            fill="url(#colorLatency)"
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="throughput"
                                            stroke={THEME.success}
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Panel>
                        );
                    case 'perfadvisor':
                        return (
                            <Panel title="Performance Advisor v2" icon={Lightbulb} accentColor={THEME.warning}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {demoData.perfAdvisor.map((rec, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: THEME.glass,
                                                borderRadius: 6,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderLeft: `3px solid ${i === 0 ? THEME.danger : i === 1 ? THEME.warning : THEME.info || THEME.primary}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <div style={{ fontWeight: 600 }}>
                                                    Priority {rec.priority}: {rec.recommendation}
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: 10,
                                                        color: THEME.textDim,
                                                        whiteSpace: 'nowrap',
                                                        marginLeft: 8,
                                                    }}
                                                >
                                                    {rec.effort}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 11, color: THEME.textMuted }}>{rec.impact}</div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'tracecorrelator':
                        return (
                            <Panel title="Trace Correlator" icon={Radio} accentColor={THEME.primary}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {demoData.traceCorrelations.map((trace, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: THEME.glass,
                                                borderRadius: 6,
                                                border: `1px solid ${THEME.glassBorder}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <span style={{ fontWeight: 600, fontFamily: THEME.fontMono }}>
                                                    {trace.trace_id}
                                                </span>
                                                <span style={{ color: THEME.textMuted }}>{trace.duration}ms</span>
                                            </div>
                                            <div style={{ fontSize: 11, marginBottom: 6 }}>
                                                Operation: {trace.operation}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {trace.stages.map((s, si) => (
                                                    <div
                                                        key={si}
                                                        style={{
                                                            fontSize: 9,
                                                            padding: '3px 8px',
                                                            background:
                                                                s === trace.bottleneck
                                                                    ? `${THEME.danger}20`
                                                                    : `${THEME.primary}15`,
                                                            borderRadius: 4,
                                                            color:
                                                                s === trace.bottleneck ? THEME.danger : THEME.primary,
                                                            fontWeight: s === trace.bottleneck ? 600 : 500,
                                                        }}
                                                    >
                                                        {s}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    default:
                        return null;
                }

            // ═════════════════════════════════════════════════════════════════════════
            // REPLICATION SECTION
            // ═════════════════════════════════════════════════════════════════════════
            case 'replication':
                switch (itemKey) {
                    case 'replicaset':
                        return (
                            <Panel title="Replica Set & Failover" icon={GitBranch} accentColor={THEME.success}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {demoData.replicas.map((replica, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: THEME.glass,
                                                borderRadius: 6,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                borderLeft: `3px solid ${replica.role === 'PRIMARY' ? THEME.success : THEME.info || THEME.primary}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <div style={{ fontWeight: 600, fontFamily: THEME.fontMono }}>
                                                    {replica.id}
                                                </div>
                                                <StatusBadge
                                                    label={replica.role}
                                                    color={
                                                        replica.role === 'PRIMARY'
                                                            ? THEME.success
                                                            : THEME.info || THEME.primary
                                                    }
                                                />
                                            </div>
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                                    gap: 8,
                                                    fontSize: 10,
                                                }}
                                            >
                                                <div>
                                                    <span style={{ color: THEME.textDim }}>Sync Lag</span>
                                                    <div style={{ fontWeight: 600 }}>{replica.syncLag}</div>
                                                </div>
                                                <div>
                                                    <span style={{ color: THEME.textDim }}>Health</span>
                                                    <div style={{ fontWeight: 600 }}>
                                                        {(replica.health * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <span style={{ color: THEME.textDim }}>Uptime</span>
                                                    <div style={{ fontWeight: 600 }}>{replica.uptime}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'sharding':
                        return (
                            <Panel title="Sharding Configuration" icon={Layers} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'id', label: 'Shard ID', mono: true },
                                        { key: 'docs', label: 'Documents', align: 'right', mono: true },
                                        { key: 'size', label: 'Size', align: 'right', mono: true },
                                        { key: 'chunks', label: 'Chunks', align: 'right' },
                                        { key: 'health', label: 'Health', align: 'right' },
                                    ]}
                                    rows={demoData.shards.map((s) => ({
                                        ...s,
                                        health: (s.health * 100).toFixed(0) + '%',
                                    }))}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'oplog':
                        return (
                            <Panel title="Oplog Tail" icon={Activity} accentColor={THEME.success}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {demoData.oplogEvents.map((event, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 10,
                                                background: `${THEME.success}08`,
                                                borderLeft: `3px solid ${THEME.success}`,
                                                borderRadius: 6,
                                                fontSize: 11,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <span style={{ fontWeight: 600, fontFamily: THEME.fontMono }}>
                                                    {event.timestamp}
                                                </span>
                                                <span style={{ color: THEME.textDim }}>{event.duration}ms</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
                                                <span>
                                                    Op: <span style={{ fontWeight: 600 }}>{event.operation}</span>
                                                </span>
                                                <span>
                                                    Namespace:{' '}
                                                    <span style={{ fontWeight: 600, fontFamily: THEME.fontMono }}>
                                                        {event.ns}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    default:
                        return null;
                }

            // ═════════════════════════════════════════════════════════════════════════
            // MANAGEMENT SECTION
            // ═════════════════════════════════════════════════════════════════════════
            case 'management':
                switch (itemKey) {
                    case 'alerts':
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div
                                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}
                                    className="dpg-stagger"
                                >
                                    <MetricCard
                                        icon={AlertTriangle}
                                        label="Critical"
                                        value={demoData.alertsManager.critical}
                                        color={THEME.danger}
                                        warn
                                    />
                                    <MetricCard
                                        icon={AlertCircle}
                                        label="Warning"
                                        value={demoData.alertsManager.warning}
                                        color={THEME.warning}
                                    />
                                    <MetricCard
                                        icon={Eye}
                                        label="Info"
                                        value={demoData.alertsManager.info}
                                        color={THEME.info || THEME.primary}
                                    />
                                    <MetricCard
                                        icon={CheckCircle}
                                        label="Total"
                                        value={demoData.alertsManager.total}
                                        color={THEME.primary}
                                    />
                                </div>

                                <Panel title="Active Alerts" icon={AlertTriangle} accentColor={THEME.danger}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {demoData.activeAlerts.map((alert, i) => (
                                            <AlertRow
                                                key={i}
                                                severity={alert.severity}
                                                title={alert.title}
                                                time={alert.time}
                                                source={alert.source}
                                                color={alert.severity === 'critical' ? THEME.danger : THEME.warning}
                                            />
                                        ))}
                                    </div>
                                </Panel>
                            </div>
                        );
                    case 'prometheus':
                        return (
                            <Panel title="Prometheus Export" icon={Radio} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'metric', label: 'Metric', mono: true, width: '50%' },
                                        { key: 'value', label: 'Value', align: 'right', mono: true },
                                        { key: 'timestamp', label: 'Timestamp', align: 'center', mono: true },
                                    ]}
                                    rows={demoData.prometheusMetrics}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'auth':
                        return (
                            <Panel title="SSO / Auth Configuration" icon={Shield} accentColor={THEME.primary}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                    {[
                                        { label: 'Mechanism', value: demoData.authConfig.mechanism },
                                        {
                                            label: 'LDAP Enabled',
                                            value: demoData.authConfig.ldap_enabled ? 'Yes' : 'No',
                                        },
                                        {
                                            label: 'OAuth2 Enabled',
                                            value: demoData.authConfig.oauth2_enabled ? 'Yes' : 'No',
                                        },
                                        {
                                            label: 'MFA Required',
                                            value: demoData.authConfig.mfa_required ? 'Yes' : 'No',
                                        },
                                        { label: 'Password Policy', value: demoData.authConfig.password_policy },
                                        { label: 'Session Timeout', value: demoData.authConfig.session_timeout },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    color: THEME.textDim,
                                                    fontWeight: 600,
                                                    letterSpacing: '0.05em',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                {item.label.toUpperCase()}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: THEME.textMain,
                                                    fontFamily: THEME.fontMono,
                                                }}
                                            >
                                                {item.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'atlasapi':
                        return (
                            <Panel title="Atlas API Bridge" icon={Network} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'endpoint', label: 'Endpoint', mono: true, width: '50%' },
                                        { key: 'calls', label: 'Calls', align: 'right' },
                                        { key: 'avg_response', label: 'Avg Response (ms)', align: 'right', mono: true },
                                        { key: 'errors', label: 'Errors', align: 'right' },
                                    ]}
                                    rows={demoData.atlasAPIMetrics}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'dashboards':
                        return (
                            <Panel title="Custom Dashboards" icon={BarChart3} accentColor={THEME.primary}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {demoData.customDashboards.map((dash, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: THEME.glass,
                                                borderRadius: 6,
                                                border: `1px solid ${THEME.glassBorder}`,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600, marginBottom: 4 }}>{dash.name}</div>
                                                <div style={{ fontSize: 10, color: THEME.textDim }}>
                                                    {dash.widgets} widgets | Shared: {dash.shared ? 'Yes' : 'No'} |
                                                    Modified: {dash.last_modified}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'reports':
                        return (
                            <Panel title="Reports" icon={FileCog} accentColor={THEME.primary}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {demoData.reports.map((report, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: 12,
                                                background: THEME.glass,
                                                borderRadius: 6,
                                                border: `1px solid ${THEME.glassBorder}`,
                                            }}
                                        >
                                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{report.name}</div>
                                            <div
                                                style={{ fontSize: 10, color: THEME.textDim, display: 'flex', gap: 12 }}
                                            >
                                                <span>Generated: {report.generated}</span>
                                                <span>{report.recipients} recipients</span>
                                                <span>Format: {report.format}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        );
                    case 'auditlog':
                        return (
                            <Panel title="Audit Log" icon={Inbox} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'timestamp', label: 'Timestamp', mono: true },
                                        { key: 'action', label: 'Action', mono: true },
                                        { key: 'user', label: 'User', mono: true },
                                        { key: 'status', label: 'Status', align: 'center' },
                                    ]}
                                    rows={demoData.auditLog}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    case 'users':
                        return (
                            <Panel title="Users" icon={Users} accentColor={THEME.primary}>
                                <DataTable
                                    columns={[
                                        { key: 'username', label: 'Username', mono: true },
                                        { key: 'role', label: 'Role', width: '20%' },
                                        { key: 'last_login', label: 'Last Login', align: 'center' },
                                        { key: 'mfa', label: 'MFA', align: 'center' },
                                    ]}
                                    rows={demoData.users.map((u) => ({
                                        ...u,
                                        mfa: u.mfa ? 'Enabled' : 'Disabled',
                                    }))}
                                    accentColor={THEME.primary}
                                />
                            </Panel>
                        );
                    default:
                        return null;
                }

            default:
                return null;
        }
    };

    return (
        <DemoLayout
            sections={sections}
            renderContent={renderContent}
            title="MongoDB Demo"
            accentColor={THEME.primary}
            titleIcon={Database}
        />
    );
}

export default DemoMongoDBTab;
