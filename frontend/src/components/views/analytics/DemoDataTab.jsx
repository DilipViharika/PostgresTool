import React, { useState, useMemo } from 'react';
import { THEME } from '../../../utils/theme.jsx';
import {
  Database, Activity, Zap, Clock, HardDrive, Shield,
  ArrowUpRight, ArrowDownRight, Leaf, Hourglass,
  CheckCircle, AlertTriangle, Server, Cpu, Network,
  BarChart3, Lock, Globe, ChevronDown, GitBranch,
  Gauge, MemoryStick, Layers, Radio, Eye, Code
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line
} from 'recharts';

const DB_COLORS = {
  postgresql: '#6495ED',
  mysql: '#00B4D8',
  mssql: '#F97316',
  sqlserver: '#F97316',
  oracle: '#FF4560',
  mongodb: '#2EE89C',
};

const DATABASE_STRUCTURE = {
  postgresql: {
    name: 'PostgreSQL',
    color: DB_COLORS.postgresql,
    icon: Database,
    kpis: [
      { label: 'TPS', value: '1,247', unit: '/s', status: 'healthy', sparkline: [1100, 1200, 1150, 1300, 1400, 1250, 1200] },
      { label: 'Cache Hit', value: '99.2', unit: '%', status: 'healthy', sparkline: [98, 98.5, 99, 99.1, 99.2, 99.1, 99.2] },
      { label: 'Connections', value: '42', unit: '', status: 'healthy', sparkline: [38, 40, 39, 42, 41, 42, 42] },
      { label: 'Uptime', value: '47d', unit: '12h', status: 'healthy', sparkline: [30, 35, 40, 45, 46, 47, 47] },
      { label: 'DB Size', value: '14.8', unit: 'GB', status: 'warning', sparkline: [10, 11, 12, 13, 14, 14.5, 14.8] },
    ],
    sections: [
      {
        id: 'core',
        name: 'Core Monitoring',
        tabs: [
          { name: 'Overview', metrics: [{ label: 'QPS', value: '1,247', unit: '/s' }, { label: 'Commits', value: '98.5', unit: '%' }, { label: 'Rollbacks', value: '0.2', unit: '%' }, { label: 'Uptime', value: '47', unit: 'days' }] },
          { name: 'Performance', metrics: [{ label: 'Avg Query Time', value: '2.3', unit: 'ms' }, { label: 'Slow Queries', value: '12', unit: '' }, { label: 'Query Count', value: '18,450', unit: '/hour' }, { label: 'P95 Latency', value: '5.8', unit: 'ms' }] },
          { name: 'Resources', metrics: [{ label: 'CPU Usage', value: '34', unit: '%' }, { label: 'Memory Usage', value: '62', unit: '%' }, { label: 'Disk I/O', value: '245', unit: 'MB/s' }, { label: 'Swap Usage', value: '0', unit: 'MB' }] },
          { name: 'Reliability', metrics: [{ label: 'Error Rate', value: '0.01', unit: '%' }, { label: 'Failed Transactions', value: '0', unit: '/hour' }, { label: 'Recovery Time', value: '2.1', unit: 's' }, { label: 'Availability', value: '99.99', unit: '%' }] },
          { name: 'Alerts', metrics: [{ label: 'Active Alerts', value: '0', unit: '' }, { label: 'Total Rules', value: '34', unit: '' }, { label: 'Triggered Today', value: '2', unit: '' }, { label: 'Avg Response', value: '5', unit: 'mins' }] },
        ]
      },
      {
        id: 'query',
        name: 'Query & Indexes',
        tabs: [
          { name: 'Query Optimizer', metrics: [{ label: 'Index Scans', value: '89', unit: '%' }, { label: 'Sequential Scans', value: '11', unit: '%' }, { label: 'Avg Cost', value: '245.7', unit: 'units' }, { label: 'Plans Cached', value: '8,234', unit: '' }] },
          { name: 'Indexes', metrics: [{ label: 'Total Indexes', value: '342', unit: '' }, { label: 'Unused Indexes', value: '23', unit: '' }, { label: 'Bloated Indexes', value: '5', unit: '' }, { label: 'Index Hit Ratio', value: '94.2', unit: '%' }] },
          { name: 'Plan Regression', metrics: [{ label: 'Plan Changes', value: '3', unit: '' }, { label: 'Regressions', value: '0', unit: '' }, { label: 'Performance Delta', value: '+2.1', unit: '%' }, { label: 'Last Analyzed', value: '15', unit: 'mins' }] },
          { name: 'Bloat Analysis', metrics: [{ label: 'Bloated Tables', value: '8', unit: '' }, { label: 'Total Bloat', value: '234', unit: 'MB' }, { label: 'Bloat Ratio', value: '12.3', unit: '%' }, { label: 'Vacuum Needed', value: '3', unit: '' }] },
          { name: 'Table Analysis', metrics: [{ label: 'Total Tables', value: '567', unit: '' }, { label: 'Analyzed', value: '98.2', unit: '%' }, { label: 'Autovacuum Runs', value: '456', unit: '/day' }, { label: 'Last Analyze', value: '2', unit: 'hours' }] },
        ]
      },
      {
        id: 'infra',
        name: 'Infrastructure',
        tabs: [
          { name: 'Connection Pool', metrics: [{ label: 'Active Conn', value: '42', unit: '' }, { label: 'Idle Conn', value: '8', unit: '' }, { label: 'Max Pool Size', value: '100', unit: '' }, { label: 'Pool Efficiency', value: '95.3', unit: '%' }] },
          { name: 'Replication & WAL', metrics: [{ label: 'WAL Level', value: 'replica', unit: '' }, { label: 'Replication Lag', value: '0.3', unit: 'ms' }, { label: 'WAL Files', value: '42', unit: '' }, { label: 'Archiving Status', value: 'active', unit: '' }] },
          { name: 'Checkpoint Monitor', metrics: [{ label: 'Checkpoints/Day', value: '288', unit: '' }, { label: 'Checkpoint Duration', value: '12.5', unit: 's' }, { label: 'Avg Interval', value: '300', unit: 's' }, { label: 'Last Checkpoint', value: '45', unit: 's ago' }] },
          { name: 'Vacuum & Maintenance', metrics: [{ label: 'Vacuum Runs/Day', value: '576', unit: '' }, { label: 'Analyze Runs', value: '288', unit: '/day' }, { label: 'Dead Tuples Removed', value: '234K', unit: '/day' }, { label: 'Avg Runtime', value: '2.3', unit: 's' }] },
          { name: 'Capacity Planning', metrics: [{ label: 'DB Size Growth', value: '2.1', unit: 'GB/week' }, { label: 'Projected Size', value: '45.2', unit: 'GB/90d' }, { label: 'Tablespace Util', value: '62.1', unit: '%' }, { label: 'Estimated Time Full', value: '180', unit: 'days' }] },
          { name: 'Backup & Recovery', metrics: [{ label: 'Last Backup', value: '1', unit: 'hour' }, { label: 'Backup Size', value: '8.9', unit: 'GB' }, { label: 'Restore Time Est', value: '12', unit: 'mins' }, { label: 'Backup Status', value: 'healthy', unit: '' }] },
        ]
      },
      {
        id: 'schema',
        name: 'Schema & Security',
        tabs: [
          { name: 'Schema & Migrations', metrics: [{ label: 'Tables', value: '234', unit: '' }, { label: 'Views', value: '89', unit: '' }, { label: 'Pending Migrations', value: '0', unit: '' }, { label: 'Last Migration', value: '3', unit: 'days' }] },
          { name: 'Schema Visualizer', metrics: [{ label: 'Relations', value: '456', unit: '' }, { label: 'Foreign Keys', value: '178', unit: '' }, { label: 'Constraints', value: '234', unit: '' }, { label: 'Triggers', value: '42', unit: '' }] },
          { name: 'Security & Compliance', metrics: [{ label: 'Roles', value: '18', unit: '' }, { label: 'Policies', value: '23', unit: '' }, { label: 'Audit Events', value: '12,450', unit: '/day' }, { label: 'Failed Auth', value: '0', unit: '' }] },
        ]
      },
      {
        id: 'observability',
        name: 'Observability',
        tabs: [
          { name: 'CloudWatch', metrics: [{ label: 'Metrics', value: '124', unit: '' }, { label: 'Alarms Active', value: '0', unit: '' }, { label: 'Data Points', value: '98.2M', unit: '' }, { label: 'Last Sync', value: '30', unit: 's' }] },
          { name: 'Log Pattern Analysis', metrics: [{ label: 'Patterns', value: '34', unit: '' }, { label: 'Anomalies', value: '0', unit: '' }, { label: 'Log Volume', value: '2.3', unit: 'GB/day' }, { label: 'Error Rate', value: '0.02', unit: '%' }] },
          { name: 'Alert Correlation', metrics: [{ label: 'Correlations', value: '12', unit: '' }, { label: 'Root Cause ID', value: '89', unit: '%' }, { label: 'False Positives', value: '2', unit: '' }, { label: 'Accuracy', value: '94.5', unit: '%' }] },
          { name: 'OpenTelemetry', metrics: [{ label: 'Traces/sec', value: '4,500', unit: '' }, { label: 'Spans Collected', value: '234M', unit: '/day' }, { label: 'Trace Sampling', value: '100', unit: '%' }, { label: 'Latency P99', value: '12.3', unit: 'ms' }] },
          { name: 'Kubernetes', metrics: [{ label: 'Nodes', value: '12', unit: '' }, { label: 'Pods Running', value: '45', unit: '' }, { label: 'CPU Util', value: '62.3', unit: '%' }, { label: 'Memory Util', value: '71.2', unit: '%' }] },
          { name: 'Status Page', metrics: [{ label: 'Component Status', value: 'operational', unit: '' }, { label: 'Last Incident', value: '15', unit: 'days' }, { label: 'Uptime SLA', value: '99.99', unit: '%' }, { label: 'Subscriber Count', value: '234', unit: '' }] },
          { name: 'AI Monitoring', metrics: [{ label: 'Anomalies Detected', value: '2', unit: '/day' }, { label: 'AI Accuracy', value: '96.2', unit: '%' }, { label: 'Model Training', value: 'daily', unit: '' }, { label: 'Forecast Horizon', value: '30', unit: 'days' }] },
        ]
      },
      {
        id: 'dev',
        name: 'Developer Tools',
        tabs: [
          { name: 'SQL Console', metrics: [{ label: 'Queries Run', value: '1,245', unit: '/day' }, { label: 'Avg Time', value: '3.2', unit: 'ms' }, { label: 'Favorites', value: '34', unit: '' }, { label: 'Recent', value: '12', unit: '' }] },
          { name: 'API Tracing', metrics: [{ label: 'Traces', value: '456K', unit: '/hour' }, { label: 'Span Count', value: '2.1M', unit: '' }, { label: 'Error Rate', value: '0.1', unit: '%' }, { label: 'P99 Latency', value: '234', unit: 'ms' }] },
          { name: 'Repository', metrics: [{ label: 'Commits', value: '3,456', unit: '' }, { label: 'Branches', value: '24', unit: '' }, { label: 'Pull Requests', value: '12', unit: 'open' }, { label: 'Deployments', value: '45', unit: '/week' }] },
          { name: 'AI Query Advisor', metrics: [{ label: 'Queries Analyzed', value: '234K', unit: '' }, { label: 'Optimizations', value: '89', unit: '/week' }, { label: 'Avg Improvement', value: '23.4', unit: '%' }, { label: 'Adoption Rate', value: '76.2', unit: '%' }] },
        ]
      },
      {
        id: 'admin',
        name: 'Admin',
        tabs: [
          { name: 'DBA Task Scheduler', metrics: [{ label: 'Scheduled Tasks', value: '34', unit: '' }, { label: 'Running', value: '2', unit: '' }, { label: 'Failed', value: '0', unit: '' }, { label: 'Success Rate', value: '99.8', unit: '%' }] },
          { name: 'User Management', metrics: [{ label: 'Users', value: '234', unit: '' }, { label: 'Roles', value: '18', unit: '' }, { label: 'Active Sessions', value: '42', unit: '' }, { label: 'Failed Logins', value: '0', unit: '/day' }] },
          { name: 'Admin', metrics: [{ label: 'Config Changes', value: '23', unit: '/day' }, { label: 'Restarts', value: '0', unit: '/week' }, { label: 'Maintenance', value: 'scheduled', unit: '' }, { label: 'Last Backup', value: '2', unit: 'hours' }] },
          { name: 'Data Retention', metrics: [{ label: 'Retention Policies', value: '12', unit: '' }, { label: 'Data Purged', value: '234', unit: 'GB/week' }, { label: 'Compliance Status', value: 'compliant', unit: '' }, { label: 'Archive Rate', value: '98.5', unit: '%' }] },
          { name: 'Terraform Export', metrics: [{ label: 'Resources', value: '456', unit: '' }, { label: 'Modules', value: '23', unit: '' }, { label: 'Last Export', value: '2', unit: 'hours' }, { label: 'Drift Detected', value: '1', unit: '' }] },
          { name: 'Custom Dashboards', metrics: [{ label: 'Dashboards', value: '18', unit: '' }, { label: 'Shared', value: '12', unit: '' }, { label: 'Total Panels', value: '567', unit: '' }, { label: 'Users With Access', value: '89', unit: '' }] },
        ]
      }
    ]
  },
  mongodb: {
    name: 'MongoDB',
    color: DB_COLORS.mongodb,
    icon: Database,
    kpis: [
      { label: 'Ops/sec', value: '12,450', unit: '/s', status: 'healthy', sparkline: [10000, 11200, 12100, 12300, 12450, 12200, 12450] },
      { label: 'Connections', value: '234', unit: '', status: 'healthy', sparkline: [200, 210, 220, 230, 234, 232, 234] },
      { label: 'Documents', value: '45.2', unit: 'M', status: 'healthy', sparkline: [40, 42, 43, 44, 45, 45.1, 45.2] },
      { label: 'Latency', value: '1.2', unit: 'ms', status: 'healthy', sparkline: [1.5, 1.4, 1.3, 1.2, 1.2, 1.2, 1.2] },
      { label: 'Memory', value: '78', unit: '%', status: 'warning', sparkline: [60, 65, 70, 75, 77, 78, 78] },
    ],
    sections: [
      {
        id: 'overview',
        name: 'Overview',
        tabs: [
          { name: 'Executive Dashboard', metrics: [{ label: 'Ops/sec', value: '12,450', unit: '/s' }, { label: 'Uptime', value: '99.98', unit: '%' }, { label: 'Replica Set', value: 'healthy', unit: '' }, { label: 'Sharding', value: '8 shards', unit: '' }] },
          { name: 'Connection', metrics: [{ label: 'Active Conn', value: '234', unit: '' }, { label: 'Idle Conn', value: '45', unit: '' }, { label: 'Max Conn Pool', value: '500', unit: '' }, { label: 'Conn Efficiency', value: '96.2', unit: '%' }] },
          { name: 'Server Info', metrics: [{ label: 'Version', value: '7.0.0', unit: '' }, { label: 'Storage Engine', value: 'WiredTiger', unit: '' }, { label: 'CPU Cores', value: '16', unit: '' }, { label: 'Memory', value: '128', unit: 'GB' }] },
          { name: 'Databases', metrics: [{ label: 'Total Databases', value: '45', unit: '' }, { label: 'Largest DB', value: '234', unit: 'GB' }, { label: 'Database Count Growth', value: '+3', unit: '/week' }, { label: 'Total Size', value: '1.2', unit: 'TB' }] },
          { name: 'Collection Relationships', metrics: [{ label: 'Total Collections', value: '567', unit: '' }, { label: 'Relationships', value: '234', unit: '' }, { label: 'Foreign Keys', value: '456', unit: '' }, { label: 'Cross-DB Refs', value: '89', unit: '' }] },
        ]
      },
      {
        id: 'performance',
        name: 'Performance',
        tabs: [
          { name: 'Server Status', metrics: [{ label: 'TPS', value: '12,450', unit: '/s' }, { label: 'Index Hits', value: '99.2', unit: '%' }, { label: 'Page Faults', value: '0', unit: '/s' }, { label: 'Uptime', value: '45', unit: 'days' }] },
          { name: 'Real-time Ops', metrics: [{ label: 'Read Ops', value: '7,800', unit: '/s' }, { label: 'Write Ops', value: '3,200', unit: '/s' }, { label: 'Command Ops', value: '1,450', unit: '/s' }, { label: 'Queue Depth', value: '0', unit: '' }] },
          { name: 'Latency Percentiles', metrics: [{ label: 'P50', value: '0.8', unit: 'ms' }, { label: 'P95', value: '2.1', unit: 'ms' }, { label: 'P99', value: '5.3', unit: 'ms' }, { label: 'Max', value: '23.4', unit: 'ms' }] },
          { name: 'Namespace Insights', metrics: [{ label: 'Active Namespaces', value: '234', unit: '' }, { label: 'Top Namespace Ops', value: '8,450', unit: '/s' }, { label: 'Namespace Growth', value: '+12', unit: '/week' }, { label: 'Avg Document Size', value: '4.2', unit: 'KB' }] },
          { name: 'Explain Plan', metrics: [{ label: 'Plans Analyzed', value: '456K', unit: '' }, { label: 'Slow Plans', value: '23', unit: '' }, { label: 'Index Coverage', value: '96.2', unit: '%' }, { label: 'Execution Time', value: '1.2', unit: 'ms' }] },
          { name: 'Active Operations', metrics: [{ label: 'Active Ops', value: '45', unit: '' }, { label: 'Longest Op', value: '234', unit: 's' }, { label: 'Op Lock Waits', value: '0', unit: '' }, { label: 'Killed Ops', value: '2', unit: '/hour' }] },
          { name: 'Slow Queries', metrics: [{ label: 'Slow Queries', value: '12', unit: '/hour' }, { label: 'Avg Time', value: '2.3', unit: 's' }, { label: 'Slowest Query', value: '45.6', unit: 's' }, { label: 'Trending', value: 'stable', unit: '' }] },
          { name: 'Query Profiler', metrics: [{ label: 'Profile Level', value: '1', unit: '' }, { label: 'Sample Size', value: '98.2M', unit: '/day' }, { label: 'Cache Hit', value: '87.3', unit: '%' }, { label: 'Data Retention', value: '7', unit: 'days' }] },
          { name: 'Query Cost Estimator', metrics: [{ label: 'Est Accuracy', value: '94.2', unit: '%' }, { label: 'Queries Estimated', value: '567K', unit: '' }, { label: 'Cost Variance', value: '2.3', unit: '%' }, { label: 'Model Accuracy', value: '96.1', unit: '%' }] },
          { name: 'Lock Analysis', metrics: [{ label: 'Lock Contention', value: '0.1', unit: '%' }, { label: 'Read Locks', value: '78.5', unit: '%' }, { label: 'Write Locks', value: '21.5', unit: '%' }, { label: 'Avg Hold Time', value: '2.3', unit: 'ms' }] },
          { name: 'Anomaly Detection', metrics: [{ label: 'Anomalies', value: '2', unit: '/day' }, { label: 'Detection Accuracy', value: '98.3', unit: '%' }, { label: 'False Positives', value: '1', unit: '/week' }, { label: 'Severity High', value: '0', unit: '' }] },
          { name: 'Metrics Preview', metrics: [{ label: 'Metrics Count', value: '1,234', unit: '' }, { label: 'Update Frequency', value: '1', unit: 's' }, { label: 'Data Points', value: '234M', unit: '/day' }, { label: 'Retention', value: '30', unit: 'days' }] },
          { name: 'Live Agent', metrics: [{ label: 'Agent Status', value: 'connected', unit: '' }, { label: 'Messages/sec', value: '450', unit: '' }, { label: 'Latency', value: '12.3', unit: 'ms' }, { label: 'Uptime', value: '99.99', unit: '%' }] },
        ]
      },
      {
        id: 'storage',
        name: 'Storage',
        tabs: [
          { name: 'Index Advisor', metrics: [{ label: 'Missing Indexes', value: '12', unit: '' }, { label: 'Unused Indexes', value: '3', unit: '' }, { label: 'Bloated Indexes', value: '1', unit: '' }, { label: 'Index Efficiency', value: '94.3', unit: '%' }] },
          { name: 'Schema Analyzer', metrics: [{ label: 'Collections', value: '456', unit: '' }, { label: 'Avg Doc Size', value: '4.2', unit: 'KB' }, { label: 'Total Size', value: '234', unit: 'GB' }, { label: 'Data Compression', value: '62', unit: '%' }] },
          { name: 'Collection Stats', metrics: [{ label: 'Top Collection', value: 'users', unit: '' }, { label: 'Largest Size', value: '45.2', unit: 'GB' }, { label: 'Document Count', value: '23.4M', unit: '' }, { label: 'Avg Queries', value: '1,250', unit: '/s' }] },
          { name: 'WiredTiger Cache', metrics: [{ label: 'Cache Size', value: '64', unit: 'GB' }, { label: 'Cache Util', value: '78.3', unit: '%' }, { label: 'Evictions/sec', value: '234', unit: '' }, { label: 'Cache Hit Rate', value: '94.2', unit: '%' }] },
          { name: 'Backup Monitor', metrics: [{ label: 'Last Backup', value: '1', unit: 'hour' }, { label: 'Backup Size', value: '234', unit: 'GB' }, { label: 'Backup Duration', value: '15', unit: 'mins' }, { label: 'Backup Status', value: 'healthy', unit: '' }] },
          { name: 'Capacity Planning', metrics: [{ label: 'Growth Rate', value: '2.3', unit: 'GB/week' }, { label: 'Storage Util', value: '67.2', unit: '%' }, { label: 'Projected 90d', value: '456', unit: 'GB' }, { label: 'Days Until Full', value: '180', unit: '' }] },
          { name: 'Network', metrics: [{ label: 'Bytes In/sec', value: '234', unit: 'MB/s' }, { label: 'Bytes Out/sec', value: '156', unit: 'MB/s' }, { label: 'Network Util', value: '45.2', unit: '%' }, { label: 'Latency', value: '0.5', unit: 'ms' }] },
        ]
      },
      {
        id: 'data',
        name: 'Data',
        tabs: [
          { name: 'Document Editor', metrics: [{ label: 'Documents Edited', value: '2,345', unit: '/day' }, { label: 'Failed Updates', value: '0', unit: '' }, { label: 'Validation Errors', value: '12', unit: '' }, { label: 'Bulk Ops', value: '45', unit: '/hour' }] },
          { name: 'Aggregation Builder', metrics: [{ label: 'Pipelines', value: '234', unit: '' }, { label: 'Avg Stages', value: '4.2', unit: '' }, { label: 'Cache Hit Rate', value: '78.3', unit: '%' }, { label: 'Execution Time', value: '1.2', unit: 's' }] },
          { name: 'Import/Export', metrics: [{ label: 'Imports', value: '12', unit: '/day' }, { label: 'Exports', value: '34', unit: '/day' }, { label: 'Total Transferred', value: '12.4', unit: 'GB' }, { label: 'Transfer Rate', value: '45', unit: 'MB/s' }] },
          { name: 'NL Query Generator', metrics: [{ label: 'Queries Generated', value: '456', unit: '/day' }, { label: 'Conversion Rate', value: '87.2', unit: '%' }, { label: 'Avg Accuracy', value: '92.3', unit: '%' }, { label: 'Execution Time', value: '0.8', unit: 's' }] },
          { name: 'SQL Translator', metrics: [{ label: 'Translations', value: '234', unit: '/day' }, { label: 'Success Rate', value: '94.1', unit: '%' }, { label: 'Avg Convert Time', value: '2.1', unit: 'ms' }, { label: 'Supported Syntax', value: '98.5', unit: '%' }] },
          { name: 'Schema Compare', metrics: [{ label: 'Schema Versions', value: '45', unit: '' }, { label: 'Differences', value: '12', unit: '' }, { label: 'Compatibility', value: '98.3', unit: '%' }, { label: 'Last Compare', value: '5', unit: 'mins' }] },
          { name: 'Geo-spatial', metrics: [{ label: 'Geo Queries', value: '234K', unit: '/day' }, { label: 'Geo Indexes', value: '34', unit: '' }, { label: 'Avg Query Time', value: '3.4', unit: 'ms' }, { label: 'Coverage', value: '98.7', unit: '%' }] },
        ]
      },
      {
        id: 'intelligence',
        name: 'Intelligence',
        tabs: [
          { name: 'AI Hints', metrics: [{ label: 'Suggestions', value: '23', unit: '' }, { label: 'Implemented', value: '18', unit: '' }, { label: 'Performance Gain', value: '12.5', unit: '%' }, { label: 'Accuracy', value: '94.2', unit: '%' }] },
          { name: 'Compare Clusters', metrics: [{ label: 'Clusters', value: '3', unit: '' }, { label: 'Differences', value: '5', unit: '' }, { label: 'Performance Ratio', value: '1.23x', unit: '' }, { label: 'Last Sync', value: '5', unit: 'mins' }] },
          { name: 'Historical Trends', metrics: [{ label: 'Data Points', value: '98.2M', unit: '' }, { label: 'Trend Accuracy', value: '92.1', unit: '%' }, { label: 'Anomalies', value: '0', unit: '' }, { label: 'Forecast Days', value: '30', unit: '' }] },
          { name: 'Perf Advisor v2', metrics: [{ label: 'Recommendations', value: '45', unit: '' }, { label: 'Impl Rate', value: '78.2', unit: '%' }, { label: 'Avg Improvement', value: '18.3', unit: '%' }, { label: 'Confidence', value: '96.1', unit: '%' }] },
          { name: 'Trace Correlator', metrics: [{ label: 'Traces Correlated', value: '234K', unit: '/day' }, { label: 'Correlation Accuracy', value: '96.2', unit: '%' }, { label: 'Latency P99', value: '2.3', unit: 'ms' }, { label: 'Root Cause ID Rate', value: '89.3', unit: '%' }] },
        ]
      },
      {
        id: 'replication',
        name: 'Replication',
        tabs: [
          { name: 'Replica Set + Failover', metrics: [{ label: 'Members', value: '3', unit: '' }, { label: 'Primary', value: 'healthy', unit: '' }, { label: 'Replication Lag', value: '0.2', unit: 'ms' }, { label: 'Last Sync', value: '0.1', unit: 's' }] },
          { name: 'Sharding', metrics: [{ label: 'Shards', value: '8', unit: '' }, { label: 'Chunks', value: '1,024', unit: '' }, { label: 'Balancer', value: 'active', unit: '' }, { label: 'Migration Queue', value: '0', unit: '' }] },
          { name: 'Oplog Tail', metrics: [{ label: 'Oplog Size', value: '50', unit: 'GB' }, { label: 'Oplog Window', value: '24', unit: 'hours' }, { label: 'Current Lag', value: '0.3', unit: 'ms' }, { label: 'Entries/sec', value: '12,450', unit: '' }] },
        ]
      },
      {
        id: 'management',
        name: 'Management',
        tabs: [
          { name: 'Alert Manager', metrics: [{ label: 'Active Alerts', value: '0', unit: '' }, { label: 'Total Rules', value: '45', unit: '' }, { label: 'Fired/Hour', value: '2', unit: '' }, { label: 'False Positives', value: '1', unit: '%' }] },
          { name: 'Prometheus Export', metrics: [{ label: 'Metrics', value: '567', unit: '' }, { label: 'Series', value: '234K', unit: '' }, { label: 'Scrape Rate', value: '15', unit: 's' }, { label: 'Last Scrape', value: '2', unit: 's ago' }] },
          { name: 'Dashboards', metrics: [{ label: 'Custom Dashboards', value: '12', unit: '' }, { label: 'Shared', value: '8', unit: '' }, { label: 'Total Panels', value: '234', unit: '' }, { label: 'Total Viewers', value: '45', unit: '' }] },
          { name: 'SSO/Auth', metrics: [{ label: 'SSO Users', value: '456', unit: '' }, { label: 'Auth Failures', value: '1', unit: '/day' }, { label: 'Avg Auth Time', value: '0.8', unit: 's' }, { label: 'Session Duration', value: '8', unit: 'hours' }] },
          { name: 'Atlas API Bridge', metrics: [{ label: 'API Calls', value: '234K', unit: '/day' }, { label: 'Success Rate', value: '99.9', unit: '%' }, { label: 'Avg Response', value: '45', unit: 'ms' }, { label: 'Rate Limit Hit', value: '0', unit: '/day' }] },
          { name: 'Reports', metrics: [{ label: 'Generated Reports', value: '23', unit: '/week' }, { label: 'Scheduled Reports', value: '12', unit: '' }, { label: 'Email Sent', value: '234', unit: '/week' }, { label: 'Open Rate', value: '67.2', unit: '%' }] },
          { name: 'Audit Log', metrics: [{ label: 'Log Entries', value: '234K', unit: '/day' }, { label: 'Changes Made', value: '456', unit: '/day' }, { label: 'Users Modified', value: '45', unit: '' }, { label: 'Retention Days', value: '90', unit: '' }] },
          { name: 'Users', metrics: [{ label: 'Total Users', value: '234', unit: '' }, { label: 'Active Users', value: '189', unit: '' }, { label: 'Admin Users', value: '8', unit: '' }, { label: 'Last Activity', value: '5', unit: 'mins' }] },
        ]
      }
    ]
  },
  mysql: {
    name: 'MySQL',
    color: DB_COLORS.mysql,
    icon: Database,
    kpis: [
      { label: 'QPS', value: '2,840', unit: '/s', status: 'healthy', sparkline: [2400, 2500, 2600, 2700, 2800, 2820, 2840] },
      { label: 'Buffer Hit', value: '98.7', unit: '%', status: 'healthy', sparkline: [97, 97.5, 98, 98.3, 98.5, 98.6, 98.7] },
      { label: 'Threads', value: '156', unit: '', status: 'healthy', sparkline: [120, 130, 140, 150, 154, 155, 156] },
      { label: 'Uptime', value: '92d', unit: '5h', status: 'healthy', sparkline: [50, 60, 70, 80, 90, 91, 92] },
      { label: 'DB Size', value: '28.4', unit: 'GB', status: 'warning', sparkline: [15, 18, 21, 24, 26, 27.5, 28.4] },
    ],
    sections: [
      {
        id: 'core',
        name: 'Core Monitoring',
        tabs: [
          { name: 'Overview', metrics: [{ label: 'QPS', value: '2,840', unit: '/s' }, { label: 'TPS', value: '1,234', unit: '/s' }, { label: 'Connections', value: '156', unit: '' }, { label: 'Uptime', value: '92', unit: 'days' }] },
          { name: 'Performance', metrics: [{ label: 'Avg Query Time', value: '1.8', unit: 'ms' }, { label: 'Slow Queries', value: '3', unit: '' }, { label: 'Query Count', value: '245M', unit: '/day' }, { label: 'P95 Latency', value: '4.2', unit: 'ms' }] },
          { name: 'Resources', metrics: [{ label: 'CPU Usage', value: '28', unit: '%' }, { label: 'Memory Usage', value: '71', unit: '%' }, { label: 'Disk I/O', value: '156', unit: 'MB/s' }, { label: 'Swap Usage', value: '0', unit: 'MB' }] },
          { name: 'Reliability', metrics: [{ label: 'Error Rate', value: '0.01', unit: '%' }, { label: 'Failed Transactions', value: '0', unit: '/hour' }, { label: 'Recovery Time', value: '1.8', unit: 's' }, { label: 'Availability', value: '99.99', unit: '%' }] },
          { name: 'Alerts', metrics: [{ label: 'Active Alerts', value: '0', unit: '' }, { label: 'Total Rules', value: '28', unit: '' }, { label: 'Triggered Today', value: '1', unit: '' }, { label: 'Avg Response', value: '6', unit: 'mins' }] },
        ]
      },
      {
        id: 'query',
        name: 'Query & Indexes',
        tabs: [
          { name: 'Query Optimizer', metrics: [{ label: 'Full Scans', value: '2.3', unit: '%' }, { label: 'Index Scans', value: '97.7', unit: '%' }, { label: 'Avg Cost', value: '156.3', unit: 'units' }, { label: 'Query Cache Hit', value: '78.5', unit: '%' }] },
          { name: 'Slow Query Log', metrics: [{ label: 'Slow Queries', value: '3', unit: '/hour' }, { label: 'Avg Time', value: '2.3', unit: 's' }, { label: 'Lock Waits', value: '0', unit: '' }, { label: 'Rows Examined', value: '234K', unit: '/hour' }] },
          { name: 'Index Statistics', metrics: [{ label: 'Indexes', value: '245', unit: '' }, { label: 'Unused', value: '12', unit: '' }, { label: 'Duplicate', value: '3', unit: '' }, { label: 'Hit Ratio', value: '96.2', unit: '%' }] },
          { name: 'Query Cache Analysis', metrics: [{ label: 'Cache Enabled', value: 'true', unit: '' }, { label: 'Cache Size', value: '256', unit: 'MB' }, { label: 'Hit Rate', value: '78.5', unit: '%' }, { label: 'Efficiency', value: '92.1', unit: '%' }] },
        ]
      },
      {
        id: 'infra',
        name: 'Infrastructure',
        tabs: [
          { name: 'Connection Pool', metrics: [{ label: 'Active Conn', value: '156', unit: '' }, { label: 'Max Conn', value: '200', unit: '' }, { label: 'Aborted Conn', value: '0', unit: '' }, { label: 'Conn Efficiency', value: '98.1', unit: '%' }] },
          { name: 'InnoDB Engine', metrics: [{ label: 'Pool Usage', value: '71', unit: '%' }, { label: 'Log Writes', value: '1,234', unit: '/s' }, { label: 'Page Reads', value: '23', unit: '/s' }, { label: 'Page Writes', value: '45', unit: '/s' }] },
          { name: 'Replication Status', metrics: [{ label: 'Lag Seconds', value: '0', unit: '' }, { label: 'Relay Log Size', value: '234', unit: 'MB' }, { label: 'Worker Threads', value: '4', unit: '' }, { label: 'Last Error', value: 'none', unit: '' }] },
          { name: 'Binary Log', metrics: [{ label: 'Binlog Position', value: '1,234,567', unit: '' }, { label: 'Binlog Size', value: '512', unit: 'MB' }, { label: 'Purge Age', value: '7', unit: 'days' }, { label: 'Format', value: 'ROW', unit: '' }] },
          { name: 'Buffer Pool', metrics: [{ label: 'Pool Size', value: '8.0', unit: 'GB' }, { label: 'Pool Util', value: '71.2', unit: '%' }, { label: 'Reads/sec', value: '234', unit: '' }, { label: 'Hit Ratio', value: '98.7', unit: '%' }] },
        ]
      },
      {
        id: 'schema',
        name: 'Schema & Security',
        tabs: [
          { name: 'Schema Browser', metrics: [{ label: 'Databases', value: '23', unit: '' }, { label: 'Tables', value: '456', unit: '' }, { label: 'Views', value: '78', unit: '' }, { label: 'Procedures', value: '45', unit: '' }] },
          { name: 'User Privileges', metrics: [{ label: 'Users', value: '34', unit: '' }, { label: 'Roles', value: '8', unit: '' }, { label: 'Grants', value: '234', unit: '' }, { label: 'Host Restrictions', value: '18', unit: '' }] },
          { name: 'Audit Log', metrics: [{ label: 'Log Entries', value: '234K', unit: '/day' }, { label: 'Failed Logins', value: '0', unit: '' }, { label: 'Privilege Changes', value: '3', unit: '/day' }, { label: 'DDL Changes', value: '5', unit: '/day' }] },
        ]
      },
      {
        id: 'observability',
        name: 'Observability',
        tabs: [
          { name: 'Performance Schema', metrics: [{ label: 'Events', value: '89.3M', unit: '/day' }, { label: 'Table I/O', value: '234K', unit: '/s' }, { label: 'Statements', value: '12.4K', unit: '/s' }, { label: 'Errors', value: '0', unit: '' }] },
          { name: 'Information Schema', metrics: [{ label: 'Queries', value: '456K', unit: '/hour' }, { label: 'Table Count', value: '456', unit: '' }, { label: 'Column Count', value: '3,456', unit: '' }, { label: 'Key Count', value: '1,234', unit: '' }] },
          { name: 'Process List', metrics: [{ label: 'Active Processes', value: '156', unit: '' }, { label: 'Sleeping Processes', value: '45', unit: '' }, { label: 'Avg Query Time', value: '1.8', unit: 'ms' }, { label: 'Longest Query', value: '234', unit: 's' }] },
          { name: 'Error Log Analysis', metrics: [{ label: 'Log Entries', value: '234K', unit: '/day' }, { label: 'Errors', value: '12', unit: '/day' }, { label: 'Warnings', value: '45', unit: '/day' }, { label: 'Critical', value: '0', unit: '' }] },
        ]
      },
      {
        id: 'admin',
        name: 'Admin',
        tabs: [
          { name: 'Server Variables', metrics: [{ label: 'Total Vars', value: '456', unit: '' }, { label: 'Modified', value: '23', unit: '' }, { label: 'Dynamic', value: '234', unit: '' }, { label: 'Last Change', value: '2', unit: 'days' }] },
          { name: 'Backup & Recovery', metrics: [{ label: 'Last Backup', value: '2', unit: 'hours' }, { label: 'Backup Size', value: '12.3', unit: 'GB' }, { label: 'Restore Time', value: '15', unit: 'mins' }, { label: 'Backup Success', value: '100', unit: '%' }] },
          { name: 'Import/Export', metrics: [{ label: 'Imports', value: '8', unit: '/week' }, { label: 'Exports', value: '12', unit: '/week' }, { label: 'Data Transferred', value: '45.2', unit: 'GB' }, { label: 'Avg Speed', value: '45', unit: 'MB/s' }] },
          { name: 'User Management', metrics: [{ label: 'Users', value: '34', unit: '' }, { label: 'Active Sessions', value: '156', unit: '' }, { label: 'Failed Auth', value: '0', unit: '/day' }, { label: 'Password Age', value: '45', unit: 'days' }] },
        ]
      }
    ]
  },
  mssql: {
    name: 'SQL Server',
    color: DB_COLORS.mssql,
    icon: Database,
    kpis: [
      { label: 'Batch Req/s', value: '3,420', unit: '/s', status: 'healthy', sparkline: [2800, 2900, 3000, 3200, 3300, 3350, 3420] },
      { label: 'PLE', value: '48,200', unit: 's', status: 'healthy', sparkline: [40000, 42000, 44000, 46000, 47500, 48000, 48200] },
      { label: 'Connections', value: '189', unit: '', status: 'healthy', sparkline: [150, 160, 170, 180, 185, 187, 189] },
      { label: 'CPU', value: '42', unit: '%', status: 'healthy', sparkline: [30, 35, 38, 40, 41, 41.5, 42] },
      { label: 'Memory', value: '71', unit: '%', status: 'warning', sparkline: [50, 55, 60, 65, 68, 70, 71] },
    ],
    sections: [
      {
        id: 'core',
        name: 'Core Monitoring',
        tabs: [
          { name: 'Overview', metrics: [{ label: 'Batch Req/s', value: '3,420', unit: '/s' }, { label: 'Transactions/s', value: '1,234', unit: '/s' }, { label: 'Connections', value: '189', unit: '' }, { label: 'Uptime', value: '38', unit: 'days' }] },
          { name: 'Performance', metrics: [{ label: 'Page Lookups/s', value: '234K', unit: '' }, { label: 'Lock Waits/s', value: '0', unit: '' }, { label: 'Compilations/s', value: '234', unit: '' }, { label: 'Avg Batch Time', value: '1.2', unit: 'ms' }] },
          { name: 'Resources', metrics: [{ label: 'CPU Usage', value: '42', unit: '%' }, { label: 'Memory Usage', value: '71', unit: '%' }, { label: 'Disk Queue', value: '2', unit: '' }, { label: 'Avg Disk Latency', value: '5.2', unit: 'ms' }] },
          { name: 'Reliability', metrics: [{ label: 'Error Rate', value: '0.02', unit: '%' }, { label: 'Failed Transactions', value: '1', unit: '/hour' }, { label: 'Recovery Time', value: '2.5', unit: 's' }, { label: 'Availability', value: '99.98', unit: '%' }] },
          { name: 'Alerts', metrics: [{ label: 'Active Alerts', value: '1', unit: '' }, { label: 'Total Rules', value: '32', unit: '' }, { label: 'Triggered Today', value: '3', unit: '' }, { label: 'Avg Response', value: '7', unit: 'mins' }] },
        ]
      },
      {
        id: 'query',
        name: 'Query & Indexes',
        tabs: [
          { name: 'Query Store', metrics: [{ label: 'Tracked Queries', value: '2,345', unit: '' }, { label: 'Plan Variants', value: '234', unit: '' }, { label: 'Regressions', value: '0', unit: '' }, { label: 'Avg Duration', value: '3.2', unit: 'ms' }] },
          { name: 'Execution Plans', metrics: [{ label: 'Cached Plans', value: '8,234', unit: '' }, { label: 'Ad Hoc Plans', value: '234', unit: '' }, { label: 'Avg Cost', value: '234.5', unit: 'units' }, { label: 'CPU Time', value: '234', unit: 's/hour' }] },
          { name: 'Index Tuning', metrics: [{ label: 'Missing Indexes', value: '12', unit: '' }, { label: 'Unused Indexes', value: '5', unit: '' }, { label: 'Fragmentation > 10%', value: '8', unit: '' }, { label: 'Index Hit Ratio', value: '94.2', unit: '%' }] },
          { name: 'Missing Indexes', metrics: [{ label: 'Suggestions', value: '45', unit: '' }, { label: 'Est Improvement', value: '23.4', unit: '%' }, { label: 'Creation Impact', value: '1.2', unit: '%' }, { label: 'Ready to Create', value: '12', unit: '' }] },
          { name: 'Statistics', metrics: [{ label: 'Statistics', value: '678', unit: '' }, { label: 'Outdated', value: '23', unit: '' }, { label: 'Auto Update', value: 'enabled', unit: '' }, { label: 'Last Update', value: '2', unit: 'hours' }] },
        ]
      },
      {
        id: 'infra',
        name: 'Infrastructure',
        tabs: [
          { name: 'Connection Management', metrics: [{ label: 'Active Conn', value: '189', unit: '' }, { label: 'Max Pool', value: '256', unit: '' }, { label: 'Failed Conn', value: '0', unit: '/day' }, { label: 'Conn Efficiency', value: '96.8', unit: '%' }] },
          { name: 'Always On AG', metrics: [{ label: 'Replicas', value: '2', unit: '' }, { label: 'Sync Status', value: 'healthy', unit: '' }, { label: 'Replication Lag', value: '0.2', unit: 'ms' }, { label: 'Log Send Queue', value: '0', unit: 'KB' }] },
          { name: 'Transaction Log', metrics: [{ label: 'Log Size', value: '12.3', unit: 'GB' }, { label: 'Used Space', value: '78', unit: '%' }, { label: 'VLF Count', value: '234', unit: '' }, { label: 'Last Backup', value: '5', unit: 'mins' }] },
          { name: 'TempDB', metrics: [{ label: 'Size', value: '4.5', unit: 'GB' }, { label: 'Used', value: '62.3', unit: '%' }, { label: 'Contention', value: 'low', unit: '' }, { label: 'Version Store', value: '234', unit: 'MB' }] },
          { name: 'Buffer Management', metrics: [{ label: 'Buffer Pool', value: '16.0', unit: 'GB' }, { label: 'Util', value: '71.2', unit: '%' }, { label: 'Free Buffers', value: '4.6', unit: 'GB' }, { label: 'Lazy Writer', value: 'active', unit: '' }] },
        ]
      },
      {
        id: 'schema',
        name: 'Schema & Security',
        tabs: [
          { name: 'Schema Explorer', metrics: [{ label: 'Databases', value: '34', unit: '' }, { label: 'Tables', value: '567', unit: '' }, { label: 'Stored Procs', value: '234', unit: '' }, { label: 'Functions', value: '89', unit: '' }] },
          { name: 'Security Audit', metrics: [{ label: 'Logins', value: '45', unit: '' }, { label: 'Database Users', value: '234', unit: '' }, { label: 'Roles', value: '23', unit: '' }, { label: 'Failed Logins', value: '0', unit: '/day' }] },
          { name: 'Permissions Matrix', metrics: [{ label: 'Permissions', value: '456', unit: '' }, { label: 'Object Permissions', value: '234', unit: '' }, { label: 'Role Memberships', value: '189', unit: '' }, { label: 'Orphaned Permissions', value: '2', unit: '' }] },
        ]
      },
      {
        id: 'observability',
        name: 'Observability',
        tabs: [
          { name: 'Wait Statistics', metrics: [{ label: 'Total Waits', value: '234K', unit: '' }, { label: 'CPU Waits', value: '42', unit: '%' }, { label: 'I/O Waits', value: '28', unit: '%' }, { label: 'Lock Waits', value: '0.1', unit: '%' }] },
          { name: 'Extended Events', metrics: [{ label: 'Sessions', value: '8', unit: '' }, { label: 'Events Captured', value: '23.4M', unit: '/day' }, { label: 'Target Size', value: '456', unit: 'MB' }, { label: 'Avg Session Size', value: '57', unit: 'MB' }] },
          { name: 'Activity Monitor', metrics: [{ label: 'Active Sessions', value: '189', unit: '' }, { label: 'Blocking Chains', value: '0', unit: '' }, { label: 'Deadlocks', value: '0', unit: '/day' }, { label: 'Blocked Procs', value: '0', unit: '' }] },
          { name: 'DMV Explorer', metrics: [{ label: 'DMV Count', value: '234', unit: '' }, { label: 'Queries', value: '456K', unit: '/hour' }, { label: 'Avg Query Time', value: '2.3', unit: 'ms' }, { label: 'Last Refresh', value: '5', unit: 's ago' }] },
        ]
      },
      {
        id: 'admin',
        name: 'Admin',
        tabs: [
          { name: 'SQL Agent Jobs', metrics: [{ label: 'Jobs', value: '45', unit: '' }, { label: 'Running', value: '2', unit: '' }, { label: 'Failed', value: '0', unit: '/day' }, { label: 'Success Rate', value: '99.8', unit: '%' }] },
          { name: 'Backup Strategy', metrics: [{ label: 'Full Backups', value: '1', unit: '/day' }, { label: 'Diff Backups', value: '4', unit: '/day' }, { label: 'Last Backup', value: '3', unit: 'hours' }, { label: 'Restore Time', value: '12', unit: 'mins' }] },
          { name: 'Maintenance Plans', metrics: [{ label: 'Plans', value: '12', unit: '' }, { label: 'Scheduled', value: '12', unit: '' }, { label: 'Last Run', value: '2', unit: 'hours' }, { label: 'Success Rate', value: '100', unit: '%' }] },
          { name: 'Server Configuration', metrics: [{ label: 'Config Options', value: '234', unit: '' }, { label: 'Modified', value: '18', unit: '' }, { label: 'Recommended', value: '3', unit: '' }, { label: 'Last Change', value: '5', unit: 'days' }] },
        ]
      }
    ]
  },
  oracle: {
    name: 'Oracle',
    color: DB_COLORS.oracle,
    icon: Database,
    kpis: [
      { label: 'TPS', value: '4,150', unit: '/s', status: 'healthy', sparkline: [3500, 3700, 3900, 4000, 4100, 4120, 4150] },
      { label: 'SGA Hit', value: '99.1', unit: '%', status: 'healthy', sparkline: [98, 98.5, 98.8, 99, 99.05, 99.08, 99.1] },
      { label: 'Sessions', value: '312', unit: '', status: 'healthy', sparkline: [280, 290, 300, 310, 311, 311.5, 312] },
      { label: 'Redo', value: '8.2', unit: 'MB/s', status: 'healthy', sparkline: [6, 6.5, 7, 7.5, 8, 8.1, 8.2] },
      { label: 'Tablespace', value: '67', unit: '%', status: 'warning', sparkline: [45, 50, 55, 60, 65, 66, 67] },
    ],
    sections: [
      {
        id: 'core',
        name: 'Core Monitoring',
        tabs: [
          { name: 'Overview', metrics: [{ label: 'TPS', value: '4,150', unit: '/s' }, { label: 'Transactions', value: '234K', unit: '/hour' }, { label: 'Sessions', value: '312', unit: '' }, { label: 'Uptime', value: '156', unit: 'days' }] },
          { name: 'Performance', metrics: [{ label: 'CPU Usage', value: '45', unit: '%' }, { label: 'I/O Read Rate', value: '234', unit: 'MB/s' }, { label: 'I/O Write Rate', value: '89', unit: 'MB/s' }, { label: 'Avg Query Time', value: '2.1', unit: 'ms' }] },
          { name: 'Resources', metrics: [{ label: 'SGA Usage', value: '67', unit: '%' }, { label: 'PGA Usage', value: '42', unit: '%' }, { label: 'Free Space', value: '12.3', unit: 'GB' }, { label: 'Temp Space', value: '5.6', unit: 'GB' }] },
          { name: 'Reliability', metrics: [{ label: 'Error Rate', value: '0.01', unit: '%' }, { label: 'Failed Transactions', value: '0', unit: '/hour' }, { label: 'Recovery Time', value: '3.2', unit: 's' }, { label: 'Availability', value: '99.99', unit: '%' }] },
          { name: 'Alerts', metrics: [{ label: 'Active Alerts', value: '0', unit: '' }, { label: 'Total Rules', value: '42', unit: '' }, { label: 'Triggered Today', value: '0', unit: '' }, { label: 'Avg Response', value: '4', unit: 'mins' }] },
        ]
      },
      {
        id: 'query',
        name: 'Query & Indexes',
        tabs: [
          { name: 'AWR Reports', metrics: [{ label: 'Snapshots', value: '4,320', unit: '' }, { label: 'Avg Load', value: '3.2', unit: 'DB CPU' }, { label: 'Peak Load', value: '8.9', unit: 'DB CPU' }, { label: 'Reports', value: '234', unit: '' }] },
          { name: 'SQL Tuning Advisor', metrics: [{ label: 'SQL Profiles', value: '45', unit: '' }, { label: 'Active Profiles', value: '34', unit: '' }, { label: 'Recommendations', value: '12', unit: '' }, { label: 'Potential Gain', value: '23.4', unit: '%' }] },
          { name: 'Explain Plans', metrics: [{ label: 'Plans Generated', value: '234K', unit: '/day' }, { label: 'Avg Cost', value: '234.5', unit: 'units' }, { label: 'Full Scans', value: '2.3', unit: '%' }, { label: 'Index Usage', value: '97.7', unit: '%' }] },
          { name: 'Index Analysis', metrics: [{ label: 'Indexes', value: '567', unit: '' }, { label: 'Unused Indexes', value: '8', unit: '' }, { label: 'Duplicate Indexes', value: '3', unit: '' }, { label: 'Fragmentation', value: '2.1', unit: '%' }] },
          { name: 'Optimizer Stats', metrics: [{ label: 'Table Stats', value: '678', unit: '' }, { label: 'Outdated', value: '12', unit: '' }, { label: 'Auto Gather', value: 'enabled', unit: '' }, { label: 'Last Run', value: '3', unit: 'hours' }] },
        ]
      },
      {
        id: 'infra',
        name: 'Infrastructure',
        tabs: [
          { name: 'Tablespace Management', metrics: [{ label: 'Tablespaces', value: '23', unit: '' }, { label: 'Used', value: '67', unit: '%' }, { label: 'Autoextend', value: '18', unit: '' }, { label: 'Max Size', value: '500', unit: 'GB' }] },
          { name: 'Redo Logs', metrics: [{ label: 'Log Groups', value: '3', unit: '' }, { label: 'Members', value: '2', unit: '/group' }, { label: 'Redo Rate', value: '8.2', unit: 'MB/s' }, { label: 'Archive Status', value: 'enabled', unit: '' }] },
          { name: 'Data Guard', metrics: [{ label: 'Standby DBs', value: '2', unit: '' }, { label: 'Protection Mode', value: 'maximum', unit: 'availability' }, { label: 'Lag Time', value: '0.3', unit: 's' }, { label: 'Status', value: 'healthy', unit: '' }] },
          { name: 'RAC Monitor', metrics: [{ label: 'Cluster Nodes', value: '4', unit: '' }, { label: 'Instance Status', value: 'all healthy', unit: '' }, { label: 'Interconnect Util', value: '34.2', unit: '%' }, { label: 'Global Lock Waits', value: '0', unit: '%' }] },
          { name: 'Undo Management', metrics: [{ label: 'Undo Tablespace', value: '12.3', unit: 'GB' }, { label: 'Used', value: '56.2', unit: '%' }, { label: 'Retention', value: '900', unit: 's' }, { label: 'Max Extents', value: '234', unit: '' }] },
        ]
      },
      {
        id: 'schema',
        name: 'Schema & Security',
        tabs: [
          { name: 'Schema Objects', metrics: [{ label: 'Tables', value: '567', unit: '' }, { label: 'Indexes', value: '1,234', unit: '' }, { label: 'Views', value: '234', unit: '' }, { label: 'Packages', value: '89', unit: '' }] },
          { name: 'Privilege Audit', metrics: [{ label: 'Users', value: '45', unit: '' }, { label: 'Roles', value: '23', unit: '' }, { label: 'System Privileges', value: '567', unit: '' }, { label: 'Object Privileges', value: '1,234', unit: '' }] },
          { name: 'VPD Policies', metrics: [{ label: 'Policies', value: '12', unit: '' }, { label: 'Protected Tables', value: '34', unit: '' }, { label: 'Predicate Count', value: '45', unit: '' }, { label: 'Policy Rows', value: '234K', unit: '' }] },
        ]
      },
      {
        id: 'observability',
        name: 'Observability',
        tabs: [
          { name: 'ASH Analytics', metrics: [{ label: 'ASH Samples', value: '234M', unit: '/day' }, { label: 'Avg Events', value: '234K', unit: '/s' }, { label: 'Top Events', value: '8', unit: '' }, { label: 'Sampling Rate', value: '100', unit: '%' }] },
          { name: 'Alert Log', metrics: [{ label: 'Entries', value: '2.3K', unit: '/day' }, { label: 'Errors', value: '0', unit: '' }, { label: 'Warnings', value: '5', unit: '' }, { label: 'Critical', value: '0', unit: '' }] },
          { name: 'Trace Files', metrics: [{ label: 'Trace Files', value: '234', unit: '' }, { label: 'Total Size', value: '45.6', unit: 'GB' }, { label: 'Avg Size', value: '195', unit: 'MB' }, { label: 'Retention', value: '30', unit: 'days' }] },
          { name: 'Enterprise Manager Bridge', metrics: [{ label: 'EM Version', value: '13.4.0.0', unit: '' }, { label: 'Agents', value: '12', unit: '' }, { label: 'Agent Status', value: 'all up', unit: '' }, { label: 'Metrics Collected', value: '234K', unit: '/hour' }] },
        ]
      },
      {
        id: 'admin',
        name: 'Admin',
        tabs: [
          { name: 'RMAN Backup', metrics: [{ label: 'Backups', value: '234', unit: '' }, { label: 'Full Backups', value: '1', unit: '/day' }, { label: 'Backup Time', value: '45', unit: 'mins' }, { label: 'Backup Status', value: 'healthy', unit: '' }] },
          { name: 'Scheduler Jobs', metrics: [{ label: 'Jobs', value: '67', unit: '' }, { label: 'Running', value: '3', unit: '' }, { label: 'Failed', value: '0', unit: '/day' }, { label: 'Success Rate', value: '100', unit: '%' }] },
          { name: 'Data Pump', metrics: [{ label: 'Jobs', value: '12', unit: '' }, { label: 'Running', value: '1', unit: '' }, { label: 'Total Transferred', value: '234', unit: 'GB' }, { label: 'Avg Rate', value: '12', unit: 'MB/s' }] },
          { name: 'Patch Management', metrics: [{ label: 'Current Version', value: '19.18', unit: '' }, { label: 'Patches Available', value: '3', unit: '' }, { label: 'Last Patched', value: '45', unit: 'days' }, { label: 'Patch Status', value: 'up to date', unit: '' }] },
        ]
      }
    ]
  }
};

const DETAIL_WIDGETS = {
  postgresql: {
    backup: { time: '2 hours ago', size: '8.9 GB', duration: '12 min', verified: true, next: 'in 22 hours' },
    longTxns: [
      { pid: '12847', query: 'SELECT * FROM large_table WHERE...', duration: '45 min', wait: 'I/O', pct: 75 },
      { pid: '12934', query: 'UPDATE inventory SET qty=qty-1...', duration: '12 min', wait: 'Lock', pct: 40 },
      { pid: '13021', query: 'DELETE FROM audit_logs WHERE...', duration: '3 min', wait: 'CPU', pct: 15 },
    ],
    vacuum: { urgent: 5, soon: 23, healthy: 541, deadTuples: '234.5M', bloat: '12.3' },
  },
  mongodb: {
    backup: { time: '1 hour ago', size: '234 GB', duration: '15 min', verified: true, next: 'in 23 hours' },
    longTxns: [
      { pid: 'conn-456', query: 'db.users.aggregate([{$match...', duration: '23 min', wait: 'I/O', pct: 60 },
      { pid: 'conn-789', query: 'db.orders.find({status:"pen...', duration: '8 min', wait: 'Lock', pct: 30 },
      { pid: 'conn-123', query: 'db.logs.deleteMany({date:{$...', duration: '2 min', wait: 'CPU', pct: 10 },
    ],
    vacuum: { urgent: 0, soon: 12, healthy: 456, deadTuples: '12.3M', bloat: '5.2' },
  },
  mysql: {
    backup: { time: '3 hours ago', size: '12.3 GB', duration: '8 min', verified: true, next: 'in 21 hours' },
    longTxns: [
      { pid: '4567', query: 'SELECT * FROM orders JOIN...', duration: '15 min', wait: 'Row Lock', pct: 50 },
      { pid: '4589', query: 'ALTER TABLE users ADD INDEX...', duration: '5 min', wait: 'Meta Lock', pct: 25 },
    ],
    vacuum: { urgent: 2, soon: 15, healthy: 340, deadTuples: '89.2M', bloat: '8.1' },
  },
  mssql: {
    backup: { time: '4 hours ago', size: '45.2 GB', duration: '25 min', verified: true, next: 'in 20 hours' },
    longTxns: [
      { pid: 'SPID-52', query: 'EXEC sp_rebuild_indexes...', duration: '30 min', wait: 'PAGEIOLATCH', pct: 65 },
      { pid: 'SPID-78', query: 'SELECT TOP 1000 FROM Audit...', duration: '8 min', wait: 'LCK_M_S', pct: 25 },
    ],
    vacuum: { urgent: 3, soon: 18, healthy: 420, deadTuples: '156.8M', bloat: '10.5' },
  },
  oracle: {
    backup: { time: '5 hours ago', size: '89.4 GB', duration: '45 min', verified: true, next: 'in 19 hours' },
    longTxns: [
      { pid: 'SID-234', query: 'SELECT /*+ PARALLEL(8)*/...', duration: '1 hour', wait: 'db file seq', pct: 80 },
      { pid: 'SID-567', query: 'MERGE INTO fact_sales USING...', duration: '15 min', wait: 'enq: TX', pct: 35 },
    ],
    vacuum: { urgent: 0, soon: 8, healthy: 567, deadTuples: '45.6M', bloat: '3.2' },
  },
};

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function genSparkData(label, n = 10, base = 40, variance = 30) {
  let s = hashSeed(label);
  return Array.from({ length: n }, () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return base + (s % Math.round(variance));
  });
}

function genTrend(label) {
  const s = hashSeed(label);
  return { value: `+${(s % 50) / 10}%`, up: s % 3 !== 0 };
}

function genVelocityData(sectionName) {
  const s = hashSeed(sectionName);
  return Array.from({ length: 24 }, (_, i) => {
    const base = 200 + (s % 300);
    return {
      time: `${String(i).padStart(2, '0')}:00`,
      primary: base + Math.round(Math.sin(i / 3) * 80 + (hashSeed(sectionName + i) % 60)),
      secondary: Math.round((base + Math.sin(i / 3) * 80) * 0.6 + (hashSeed(sectionName + i + 's') % 40)),
    };
  });
}

function DemoStyles() {
  return (
    <style>{`
      @keyframes demoFadeIn {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes demoPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      @keyframes demoShine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .demo-card-shine::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
        animation: demoShine 4s ease-in-out infinite;
        pointer-events: none;
      }
      .demo-stagger > *:nth-child(1) { animation: demoFadeIn 0.5s ease both 0.05s; }
      .demo-stagger > *:nth-child(2) { animation: demoFadeIn 0.5s ease both 0.1s; }
      .demo-stagger > *:nth-child(3) { animation: demoFadeIn 0.5s ease both 0.15s; }
      .demo-stagger > *:nth-child(4) { animation: demoFadeIn 0.5s ease both 0.2s; }
      .demo-stagger > *:nth-child(5) { animation: demoFadeIn 0.5s ease both 0.25s; }
      .demo-stagger > *:nth-child(6) { animation: demoFadeIn 0.5s ease both 0.3s; }
      .demo-stagger > *:nth-child(7) { animation: demoFadeIn 0.5s ease both 0.35s; }
      .demo-stagger > *:nth-child(8) { animation: demoFadeIn 0.5s ease both 0.4s; }
      @keyframes demoBarGrow {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }
    `}</style>
  );
}

function Panel({ title, icon: TIcon, accentColor, rightNode, noPad, children, style = {} }) {
  return (
    <div
      style={{
        background: THEME.glass,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid ${accentColor ? `${accentColor}22` : THEME.glassBorder}`,
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: accentColor
          ? `0 0 0 1px ${accentColor}08, inset 0 1px 0 rgba(255,255,255,0.05)`
          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        ...style,
      }}
    >
      <div className="demo-card-shine" />
      {title && (
        <div
          style={{
            padding: '12px 18px',
            borderBottom: `1px solid ${THEME.glassBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            minHeight: 44,
            background: 'rgba(255,255,255,0.012)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {TIcon && (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${accentColor || THEME.textDim}14`,
                }}
              >
                <TIcon size={12} color={accentColor || THEME.textDim} />
              </div>
            )}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: THEME.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {title}
            </span>
          </div>
          {rightNode}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '16px 18px' }}>
        {children}
      </div>
    </div>
  );
}

function MiniSparkline({ data = [], color = THEME.primary, width = 64, height = 20, filled = true }) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`)
    .join(' ');
  const uid = `dsp-${color.replace(/[^a-z0-9]/gi, '')}-${width}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {filled && <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${uid})`} />}
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RingGauge({ value, color, size = 80, strokeWidth = 6, label }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (circ * Math.min(value, 100)) / 100;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={THEME.glassBorder} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)',
            filter: `drop-shadow(0 0 5px ${color}50)`,
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <span
          style={{
            fontSize: size > 70 ? 17 : 10,
            fontWeight: 700,
            color,
            lineHeight: 1,
            fontFamily: "'JetBrains Mono',monospace",
          }}
        >
          {value}%
        </span>
        {label && (
          <span
            style={{
              fontSize: 7.5,
              color: THEME.textDim,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginTop: 1,
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ label, color, pulse }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 9.5,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 6,
        background: `${color}12`,
        color,
        border: `1px solid ${color}22`,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
        fontFamily: "'JetBrains Mono',monospace",
        letterSpacing: '0.04em',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 5px ${color}70`,
          flexShrink: 0,
          animation: pulse ? 'demoPulse 1.5s ease-in-out infinite' : 'none',
        }}
      />
      {label}
    </span>
  );
}

function LiveDot({ color }) {
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}, 0 0 12px ${color}60`,
        animation: 'demoPulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   RICH WIDGETS — matching real monitoring visual style
   ═══════════════════════════════════════════════════════════════ */

function DonutWidget({ data, size = 110, innerRadius = 38, outerRadius = 50, centerLabel, centerValue, color }) {
  const RADIAN = Math.PI / 180;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ width: size, height: size, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={2} dataKey="value" stroke="none">
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'relative', top: -(size / 2 + 12), textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: color, fontFamily: "'JetBrains Mono',monospace" }}>{centerValue}</div>
          <div style={{ fontSize: 7.5, fontWeight: 600, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{centerLabel}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: THEME.textMuted }}>{d.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: THEME.textMain, fontFamily: "'JetBrains Mono',monospace", marginLeft: 'auto' }}>{d.display || d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalBarList({ items, color }) {
  const maxVal = Math.max(...items.map(i => i.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: THEME.textMuted }}>{item.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "'JetBrains Mono',monospace" }}>{item.display}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: THEME.glassBorder, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3, width: `${(item.value / maxVal) * 100}%`,
              background: `linear-gradient(90deg, ${color}, ${color}88)`,
              animation: 'demoBarGrow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
              transformOrigin: 'left',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResourceGaugeRow({ resources, color }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${resources.length}, 1fr)`, gap: 14 }}>
      {resources.map((res, i) => {
        const r = 34, sw = 7, circ = Math.PI * r;
        const filled = circ * Math.min(res.value, 100) / 100;
        const statusColor = res.value > 80 ? THEME.danger : res.value > 60 ? THEME.warning : THEME.success;
        return (
          <div key={i} style={{
            background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 14,
            padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <svg width={76} height={46} viewBox="0 0 76 46">
              <path d={`M ${38 - r} 40 A ${r} ${r} 0 0 1 ${38 + r} 40`} fill="none" stroke={`${THEME.glassBorder}`} strokeWidth={sw} strokeLinecap="round" />
              <path d={`M ${38 - r} 40 A ${r} ${r} 0 0 1 ${38 + r} 40`} fill="none" stroke={statusColor} strokeWidth={sw} strokeLinecap="round"
                strokeDasharray={`${filled} ${circ - filled}`}
                style={{ filter: `drop-shadow(0 0 4px ${statusColor}50)`, transition: 'stroke-dasharray 1s ease' }} />
              <text x="38" y="34" textAnchor="middle" fill={statusColor} fontSize="14" fontWeight="800" fontFamily="'JetBrains Mono',monospace">{res.value}%</text>
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <res.icon size={12} color={THEME.textDim} />
              <span style={{ fontSize: 10, fontWeight: 700, color: THEME.textMuted }}>{res.label}</span>
              <StatusBadge label={res.status} color={statusColor} />
            </div>
            <div style={{ fontSize: 9, color: THEME.textDim }}>{res.detail}</div>
          </div>
        );
      })}
    </div>
  );
}

function ReplicationTopology({ nodes, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '8px 0' }}>
      {nodes.map((node, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 24, height: 2, background: `linear-gradient(90deg, ${color}, ${color}40)` }} />
              <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `6px solid ${color}` }} />
            </div>
          )}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            padding: '10px 14px', borderRadius: 12, background: `${node.color || color}08`,
            border: `1px solid ${node.color || color}25`, minWidth: 90,
          }}>
            <Server size={16} color={node.color || color} />
            <span style={{ fontSize: 10, fontWeight: 700, color: THEME.textMain }}>{node.name}</span>
            <span style={{ fontSize: 9, color: THEME.textDim, fontFamily: "'JetBrains Mono',monospace" }}>lag: {node.lag}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function MultiLineChartWidget({ data, lines, color }) {
  return (
    <div style={{ height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke={THEME.glassBorder} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} width={36} />
          <Tooltip contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 10, fontSize: 11 }} />
          {lines.map((line, i) => (
            <Line key={i} type="monotone" dataKey={line.key} stroke={line.color} strokeWidth={2} dot={false} strokeDasharray={line.dashed ? '5 3' : undefined} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniBarChart({ data, color }) {
  return (
    <div style={{ height: 140 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke={THEME.glassBorder} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} axisLine={false} tickLine={false} width={36} />
          <Tooltip contentStyle={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 10, fontSize: 11 }} />
          <Bar dataKey="reads" fill={color} radius={[3, 3, 0, 0]} opacity={0.8} />
          <Bar dataKey="writes" fill={`${color}60`} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DATABASE-SPECIFIC widget data — each DB × section is unique
   ═══════════════════════════════════════════════════════════════ */

const DB_TABLE_NAMES = {
  postgresql: ['public.orders', 'public.events', 'public.sessions', 'audit.log_entries', 'public.users'],
  mysql: ['orders', 'wp_posts', 'user_sessions', 'inventory', 'wp_comments'],
  mssql: ['dbo.Transactions', 'dbo.AuditLog', 'dbo.Customers', 'dbo.Products', 'dbo.OrderItems'],
  oracle: ['HR.EMPLOYEES', 'SALES.ORDERS', 'FIN.LEDGER', 'APP.SESSIONS', 'AUDIT.TRAIL'],
  mongodb: ['users', 'orders', 'products', 'sessions', 'analytics'],
};

const DB_SLOW_QUERIES = {
  postgresql: [
    { label: 'SELECT * FROM orders JOIN...', value: 850, display: '850ms' },
    { label: 'UPDATE inventory SET qty...', value: 520, display: '520ms' },
    { label: 'VACUUM ANALYZE public.events', value: 340, display: '340ms' },
    { label: 'SELECT count(*) FROM sessions', value: 280, display: '280ms' },
  ],
  mysql: [
    { label: 'SELECT SQL_NO_CACHE * FROM wp_posts...', value: 1240, display: '1.24s' },
    { label: 'INSERT INTO orders SELECT...', value: 890, display: '890ms' },
    { label: 'ALTER TABLE inventory ADD INDEX...', value: 650, display: '650ms' },
    { label: 'UPDATE wp_comments SET status...', value: 420, display: '420ms' },
  ],
  mssql: [
    { label: 'EXEC sp_rebuild_indexes @table...', value: 2100, display: '2.1s' },
    { label: 'SELECT TOP 1000 FROM AuditLog...', value: 960, display: '960ms' },
    { label: 'MERGE INTO Customers USING...', value: 780, display: '780ms' },
    { label: 'UPDATE Statistics dbo.Products', value: 450, display: '450ms' },
  ],
  oracle: [
    { label: 'SELECT /*+ PARALLEL(8) */ FROM...', value: 3200, display: '3.2s' },
    { label: 'MERGE INTO fact_sales USING...', value: 1800, display: '1.8s' },
    { label: 'CREATE INDEX CONCURRENTLY ON...', value: 1200, display: '1.2s' },
    { label: 'ANALYZE TABLE HR.EMPLOYEES...', value: 560, display: '560ms' },
  ],
  mongodb: [
    { label: 'db.orders.aggregate([{$lookup...', value: 1560, display: '1.56s' },
    { label: 'db.analytics.find({ts:{$gte...', value: 980, display: '980ms' },
    { label: 'db.users.updateMany({active...', value: 720, display: '720ms' },
    { label: 'db.products.distinct("category")', value: 340, display: '340ms' },
  ],
};

const DB_CONN_STATS = {
  postgresql: { active: 42, idle: 58, waiting: 0, max: 100, pct: 42 },
  mysql: { active: 156, idle: 44, waiting: 3, max: 200, pct: 78 },
  mssql: { active: 189, idle: 67, waiting: 5, max: 256, pct: 74 },
  oracle: { active: 312, idle: 188, waiting: 12, max: 500, pct: 62 },
  mongodb: { active: 234, idle: 166, waiting: 8, max: 500, pct: 47 },
};

const DB_RESOURCE_STATS = {
  postgresql: { cpu: 34, mem: 62, disk: 8, cpuCores: 4, memGB: '12 / 16', diskGB: '117 / 200 SSD' },
  mysql: { cpu: 28, mem: 71, disk: 45, cpuCores: 8, memGB: '24 / 32', diskGB: '156 / 500 NVMe' },
  mssql: { cpu: 42, mem: 71, disk: 38, cpuCores: 16, memGB: '48 / 64', diskGB: '890 / 2000 SAN' },
  oracle: { cpu: 45, mem: 67, disk: 52, cpuCores: 32, memGB: '96 / 128', diskGB: '2.4T / 5T ASM' },
  mongodb: { cpu: 38, mem: 78, disk: 67, cpuCores: 8, memGB: '64 / 128', diskGB: '456 / 1000 EBS' },
};

const DB_WORKLOAD = {
  postgresql: { reads: 99, writes: 1 },
  mysql: { reads: 72, writes: 28 },
  mssql: { reads: 65, writes: 35 },
  oracle: { reads: 58, writes: 42 },
  mongodb: { reads: 81, writes: 19 },
};

const DB_REPLICATION = {
  postgresql: [
    { name: 'pg-primary', lag: '0 ms', color: null },
    { name: 'pg-replica-1', lag: '128 ms', color: null },
    { name: 'pg-replica-2', lag: '488 ms', color: null },
  ],
  mysql: [
    { name: 'mysql-source', lag: '0 ms', color: null },
    { name: 'mysql-replica', lag: '250 ms', color: null },
  ],
  mssql: [
    { name: 'sql-primary', lag: '0 ms', color: null },
    { name: 'sql-ag-sync', lag: '12 ms', color: null },
    { name: 'sql-ag-async', lag: '340 ms', color: null },
  ],
  oracle: [
    { name: 'ora-primary', lag: '0 ms', color: null },
    { name: 'ora-standby1', lag: '300 ms', color: null },
    { name: 'ora-standby2', lag: '1.2 s', color: null },
  ],
  mongodb: [
    { name: 'rs0-primary', lag: '0 ms', color: null },
    { name: 'rs0-sec-1', lag: '50 ms', color: null },
    { name: 'rs0-sec-2', lag: '120 ms', color: null },
    { name: 'rs0-arbiter', lag: 'N/A', color: null },
  ],
};

const DB_SCHEMA_OBJECTS = {
  postgresql: { tables: 234, views: 89, functions: 156, triggers: 42, total: 521 },
  mysql: { tables: 456, views: 78, functions: 45, triggers: 23, total: 602 },
  mssql: { tables: 567, views: 234, functions: 89, triggers: 67, total: 957 },
  oracle: { tables: 890, views: 345, functions: 234, triggers: 112, total: 1581 },
  mongodb: { tables: 567, views: 34, functions: 0, triggers: 0, total: 601 },
};

const DB_INDEX_STATS = {
  postgresql: { indexPct: 89, seqPct: 11 },
  mysql: { indexPct: 98, seqPct: 2 },
  mssql: { indexPct: 94, seqPct: 6 },
  oracle: { indexPct: 97, seqPct: 3 },
  mongodb: { indexPct: 85, seqPct: 15 },
};

const DB_ALERT_DIST = {
  postgresql: [{ label: 'Critical', value: 0, display: '0' }, { label: 'Warning', value: 3, display: '3' }, { label: 'Info', value: 18, display: '18' }, { label: 'Resolved', value: 145, display: '145' }],
  mysql: [{ label: 'Critical', value: 1, display: '1' }, { label: 'Warning', value: 5, display: '5' }, { label: 'Info', value: 22, display: '22' }, { label: 'Resolved', value: 189, display: '189' }],
  mssql: [{ label: 'Critical', value: 2, display: '2' }, { label: 'Warning', value: 8, display: '8' }, { label: 'Info', value: 34, display: '34' }, { label: 'Resolved', value: 267, display: '267' }],
  oracle: [{ label: 'Critical', value: 0, display: '0' }, { label: 'Warning', value: 2, display: '2' }, { label: 'Info', value: 45, display: '45' }, { label: 'Resolved', value: 312, display: '312' }],
  mongodb: [{ label: 'Critical', value: 1, display: '1' }, { label: 'Warning', value: 6, display: '6' }, { label: 'Info', value: 28, display: '28' }, { label: 'Resolved', value: 201, display: '201' }],
};

const DB_USER_DIST = {
  postgresql: { admin: 8, dev: 45, readonly: 120, service: 23, total: 196 },
  mysql: { admin: 5, dev: 34, readonly: 89, service: 12, total: 140 },
  mssql: { admin: 12, dev: 67, readonly: 234, service: 45, total: 358 },
  oracle: { admin: 15, dev: 89, readonly: 456, service: 78, total: 638 },
  mongodb: { admin: 6, dev: 28, readonly: 67, service: 18, total: 119 },
};

/* Per-section rich widget data generators — now DB-aware */
function getSectionWidgets(sectionId, db) {
  const c = db.color;
  const dbName = db.name.toLowerCase().replace(' ', '');
  /* normalize key for lookups */
  const key = dbName === 'sqlserver' ? 'mssql' : dbName;
  const conn = DB_CONN_STATS[key] || DB_CONN_STATS.postgresql;
  const res = DB_RESOURCE_STATS[key] || DB_RESOURCE_STATS.postgresql;
  const wl = DB_WORKLOAD[key] || DB_WORKLOAD.postgresql;
  const tables = DB_TABLE_NAMES[key] || DB_TABLE_NAMES.postgresql;
  const schema = DB_SCHEMA_OBJECTS[key] || DB_SCHEMA_OBJECTS.postgresql;
  const idx = DB_INDEX_STATS[key] || DB_INDEX_STATS.postgresql;
  const alerts = DB_ALERT_DIST[key] || DB_ALERT_DIST.postgresql;
  const users = DB_USER_DIST[key] || DB_USER_DIST.postgresql;
  const repl = (DB_REPLICATION[key] || DB_REPLICATION.postgresql).map((n, i) => ({
    ...n, color: i === 0 ? THEME.success : (i === (DB_REPLICATION[key] || DB_REPLICATION.postgresql).length - 1 ? THEME.warning : c),
  }));
  const seed = hashSeed(key);

  /* helper: deterministic latency-style time series */
  const mkTimeSeries = (tag, fields) => Array.from({ length: 12 }, (_, i) => {
    const s = hashSeed(key + tag + i);
    const row = { time: `${String(i * 2).padStart(2, '0')}:00` };
    fields.forEach(f => { row[f.key] = f.base + (s % f.range) / (f.div || 1); });
    return row;
  });

  /* helper: status from value */
  const st = (v, hi = 60, mid = 40) => v > hi ? 'High' : v > mid ? 'Moderate' : 'Normal';

  switch (sectionId) {
    case 'core': {
      const tblOps = [51000, 45000, 32000, 21000, 16200].map(v => v + (seed % 20000));
      return {
        pool: {
          data: [
            { name: 'Active', value: conn.active, color: c, display: `${conn.active}` },
            { name: 'Idle', value: conn.idle, color: `${c}30`, display: `${conn.idle}` },
            { name: 'Waiting', value: conn.waiting, color: THEME.warning, display: `${conn.waiting}` },
          ],
          centerValue: `${conn.pct}%`, centerLabel: 'USED',
        },
        resources: [
          { label: 'CPU Load', value: res.cpu, icon: Cpu, status: st(res.cpu), detail: `${res.cpuCores} cores` },
          { label: 'Memory', value: res.mem, icon: MemoryStick, status: st(res.mem, 75, 50), detail: `${res.memGB} GB` },
          { label: 'Disk I/O', value: res.disk, icon: HardDrive, status: st(res.disk), detail: `${res.diskGB}` },
        ],
        latencyData: mkTimeSeries('lat', [
          { key: 'p50', base: 0.5, range: 30, div: 10 },
          { key: 'p95', base: 4, range: 80, div: 10 },
          { key: 'p99', base: 12, range: 200, div: 10 },
        ]),
        workload: {
          data: [
            { name: 'Reads', value: wl.reads, color: c, display: `${wl.reads}%` },
            { name: 'Writes', value: wl.writes, color: THEME.success, display: `${wl.writes}%` },
          ],
          centerValue: `${wl.reads}%`, centerLabel: 'READS',
        },
        topTables: tables.map((t, i) => ({
          label: t, value: tblOps[i], display: `${(tblOps[i] / 1000).toFixed(1)}K ops`,
        })),
      };
    }
    case 'query': {
      const cacheHit = 70 + (seed % 25);
      const planCached = 5000 + (seed % 8000);
      const avgCost = 100 + (seed % 400);
      return {
        pool: {
          data: [
            { name: 'Index Scans', value: idx.indexPct, color: THEME.success, display: `${idx.indexPct}%` },
            { name: key === 'mongodb' ? 'Coll Scans' : 'Seq Scans', value: idx.seqPct, color: THEME.warning, display: `${idx.seqPct}%` },
          ],
          centerValue: `${idx.indexPct}%`, centerLabel: 'INDEX',
        },
        workload: {
          data: [
            { name: 'Cache Hits', value: cacheHit, color: c, display: `${cacheHit}%` },
            { name: 'Cache Miss', value: 100 - cacheHit, color: THEME.danger, display: `${100 - cacheHit}%` },
          ],
          centerValue: `${cacheHit}%`, centerLabel: 'CACHE',
        },
        topTables: (DB_SLOW_QUERIES[key] || DB_SLOW_QUERIES.postgresql),
        resources: [
          { label: 'Query Cache', value: cacheHit, icon: Zap, status: st(cacheHit, 90, 70), detail: `${planCached.toLocaleString()} plans cached` },
          { label: 'Avg Cost', value: Math.min(Math.round(avgCost / 10), 100), icon: Gauge, status: st(Math.round(avgCost / 10), 60, 30), detail: `${avgCost} cost units` },
          { label: 'Index Hit', value: idx.indexPct, icon: Database, status: st(idx.indexPct, 95, 80), detail: `${idx.indexPct}% of scans` },
        ],
        latencyData: mkTimeSeries('qry', [
          { key: 'p50', base: 0.8, range: 20, div: 10 },
          { key: 'p95', base: 5, range: 100, div: 10 },
          { key: 'p99', base: 15, range: 300, div: 10 },
        ]),
        indexUsage: {
          data: [
            { name: 'Index Scans', value: idx.indexPct, color: THEME.success, display: `${idx.indexPct}%` },
            { name: key === 'mongodb' ? 'Coll Scans' : 'Seq Scans', value: idx.seqPct, color: THEME.warning, display: `${idx.seqPct}%` },
          ],
          centerValue: `${idx.indexPct}%`, centerLabel: 'INDEX',
        },
        slowQueries: DB_SLOW_QUERIES[key] || DB_SLOW_QUERIES.postgresql,
      };
    }
    case 'infra': {
      const bufferHit = 85 + (seed % 14);
      const walRate = 2 + (seed % 18);
      const checkpointAvg = 200 + (seed % 600);
      return {
        pool: {
          data: [
            { name: 'Active', value: conn.active, color: THEME.success, display: `${conn.active}` },
            { name: 'Idle', value: conn.idle, color: `${c}40`, display: `${conn.idle}` },
            { name: 'Reserved', value: conn.waiting, color: THEME.warning, display: `${conn.waiting}` },
          ],
          centerValue: `${conn.pct}%`, centerLabel: 'POOL',
        },
        workload: {
          data: [
            { name: 'Buffer Hit', value: bufferHit, color: c, display: `${bufferHit}%` },
            { name: 'Disk Read', value: 100 - bufferHit, color: THEME.warning, display: `${100 - bufferHit}%` },
          ],
          centerValue: `${bufferHit}%`, centerLabel: 'BUFFER',
        },
        topTables: [
          { label: key === 'mssql' ? 'Buffer Pool' : key === 'oracle' ? 'SGA Cache' : key === 'mongodb' ? 'WiredTiger' : 'Shared Buffers', value: bufferHit, display: `${bufferHit}% hit` },
          { label: key === 'oracle' ? 'Redo Log' : key === 'mssql' ? 'Transaction Log' : key === 'mongodb' ? 'Oplog' : 'WAL', value: walRate, display: `${walRate} MB/s` },
          { label: 'Checkpoint Avg', value: checkpointAvg, display: `${checkpointAvg} ms` },
          { label: key === 'mongodb' ? 'Journaling' : 'Archiving', value: 99, display: 'active' },
          { label: 'Repl Lag Max', value: 488, display: repl[repl.length - 1]?.lag || '0 ms' },
        ],
        resources: [
          { label: 'Buffer Hit', value: bufferHit, icon: Layers, status: st(bufferHit, 95, 80), detail: `${bufferHit}% from cache` },
          { label: key === 'oracle' ? 'Redo Rate' : key === 'mssql' ? 'Log Writes' : key === 'mongodb' ? 'Oplog Rate' : 'WAL Rate', value: Math.min(walRate * 5, 100), icon: Radio, status: st(walRate * 5), detail: `${walRate} MB/s throughput` },
          { label: 'Disk Latency', value: res.disk, icon: HardDrive, status: st(res.disk), detail: `${res.diskGB}` },
        ],
        latencyData: mkTimeSeries('inf', [
          { key: 'p50', base: 0.3, range: 15, div: 10 },
          { key: 'p95', base: 2, range: 50, div: 10 },
          { key: 'p99', base: 8, range: 150, div: 10 },
        ]),
        connPool: {
          data: [
            { name: 'Active', value: conn.active, color: THEME.success, display: `${conn.active}` },
            { name: 'Idle', value: conn.idle, color: `${c}40`, display: `${conn.idle}` },
            { name: 'Reserved', value: conn.waiting, color: THEME.warning, display: `${conn.waiting}` },
          ],
          centerValue: `${conn.pct}%`, centerLabel: 'POOL',
        },
        replication: repl,
      };
    }
    case 'schema': {
      const objLabel = key === 'mongodb' ? 'Collections' : 'Tables';
      const obj2 = key === 'mongodb' ? 'Indexes' : 'Views';
      const obj3 = key === 'oracle' ? 'Packages' : (key === 'mongodb' ? 'Validators' : 'Functions');
      const obj4 = key === 'mssql' ? 'Stored Procs' : (key === 'mongodb' ? 'Change Streams' : 'Triggers');
      const securityScore = 75 + (seed % 24);
      const compliancePct = 80 + (seed % 19);
      return {
        pool: {
          data: [
            { name: objLabel, value: schema.tables, color: c, display: `${schema.tables}` },
            { name: obj2, value: schema.views, color: THEME.success, display: `${schema.views}` },
            { name: obj3, value: Math.max(schema.functions, 1), color: THEME.warning, display: `${schema.functions || 0}` },
          ],
          centerValue: `${schema.total}`, centerLabel: 'OBJECTS',
        },
        workload: {
          data: [
            { name: 'Compliant', value: compliancePct, color: THEME.success, display: `${compliancePct}%` },
            { name: 'Non-compliant', value: 100 - compliancePct, color: THEME.danger, display: `${100 - compliancePct}%` },
          ],
          centerValue: `${compliancePct}%`, centerLabel: 'COMPLY',
        },
        topTables: [
          { label: key === 'mongodb' ? 'users' : key === 'oracle' ? 'HR.EMPLOYEES' : key === 'mssql' ? 'dbo.Customers' : tables[0], value: 45, display: `${45 + (seed % 20)} GB` },
          { label: key === 'mongodb' ? 'orders' : key === 'oracle' ? 'SALES.ORDERS' : key === 'mssql' ? 'dbo.Transactions' : tables[1], value: 32, display: `${32 + (seed % 15)} GB` },
          { label: key === 'mongodb' ? 'analytics' : key === 'oracle' ? 'FIN.LEDGER' : key === 'mssql' ? 'dbo.AuditLog' : tables[2], value: 21, display: `${21 + (seed % 12)} GB` },
          { label: key === 'mongodb' ? 'sessions' : key === 'oracle' ? 'AUDIT.TRAIL' : key === 'mssql' ? 'dbo.Products' : tables[3], value: 15, display: `${15 + (seed % 8)} GB` },
          { label: key === 'mongodb' ? 'products' : key === 'oracle' ? 'APP.SESSIONS' : key === 'mssql' ? 'dbo.OrderItems' : tables[4], value: 9, display: `${9 + (seed % 6)} GB` },
        ],
        resources: [
          { label: 'Security Score', value: securityScore, icon: Shield, status: st(securityScore, 90, 70), detail: `${securityScore}/100 rating` },
          { label: 'Compliance', value: compliancePct, icon: Lock, status: st(compliancePct, 95, 80), detail: `${compliancePct}% compliant` },
          { label: 'Audit Coverage', value: 88 + (seed % 11), icon: Eye, status: st(88 + (seed % 11), 95, 80), detail: `${users.total} users tracked` },
        ],
        latencyData: mkTimeSeries('sch', [
          { key: 'p50', base: 1, range: 20, div: 10 },
          { key: 'p95', base: 3, range: 40, div: 10 },
          { key: 'p99', base: 8, range: 100, div: 10 },
        ]),
        distribution: {
          data: [
            { name: objLabel, value: schema.tables, color: c, display: `${schema.tables}` },
            { name: obj2, value: schema.views, color: THEME.success, display: `${schema.views}` },
            { name: obj3, value: schema.functions, color: THEME.warning, display: `${schema.functions || 0}` },
            { name: obj4, value: schema.triggers, color: THEME.danger, display: `${schema.triggers || 0}` },
          ].filter(d => d.value > 0),
          centerValue: `${schema.total}`, centerLabel: 'OBJECTS',
        },
      };
    }
    case 'observability': {
      const traceRate = 2000 + (seed % 6000);
      const errorRate = seed % 5;
      const metricCount = 500 + (seed % 1500);
      return {
        pool: {
          data: [
            { name: 'Healthy', value: 100 - errorRate, color: THEME.success, display: `${100 - errorRate}%` },
            { name: 'Degraded', value: Math.max(errorRate - 1, 0), color: THEME.warning, display: `${Math.max(errorRate - 1, 0)}%` },
            { name: 'Critical', value: Math.min(errorRate, 2), color: THEME.danger, display: `${Math.min(errorRate, 2)}%` },
          ],
          centerValue: `${100 - errorRate}%`, centerLabel: 'HEALTH',
        },
        workload: {
          data: [
            { name: 'Traces', value: 78, color: c, display: `${(traceRate / 1000).toFixed(1)}K/s` },
            { name: 'Metrics', value: 22, color: THEME.success, display: `${metricCount}` },
          ],
          centerValue: `${(traceRate / 1000).toFixed(1)}K`, centerLabel: 'TRACES/S',
        },
        topTables: alerts,
        resources: [
          { label: 'Trace Volume', value: Math.min(Math.round(traceRate / 80), 100), icon: Radio, status: st(Math.round(traceRate / 80), 80, 50), detail: `${(traceRate).toLocaleString()} traces/s` },
          { label: 'Error Rate', value: errorRate, icon: AlertTriangle, status: errorRate > 3 ? 'High' : errorRate > 1 ? 'Moderate' : 'Normal', detail: `${(errorRate / 10).toFixed(2)}% of requests` },
          { label: 'Metric Coverage', value: Math.min(Math.round(metricCount / 20), 100), icon: Eye, status: st(Math.round(metricCount / 20), 90, 70), detail: `${metricCount} active metrics` },
        ],
        latencyData: mkTimeSeries('obs', [
          { key: 'p50', base: 2000, range: 4000, div: 1 },
          { key: 'p95', base: 0, range: 30, div: 1 },
          { key: 'p99', base: 4, range: 120, div: 10 },
        ]),
        alertDist: alerts,
      };
    }
    case 'dev': {
      const apiSuccessRate = 95 + (seed % 5);
      const deployCount = 10 + (seed % 40);
      const base = key === 'oracle' ? 800 : key === 'mssql' ? 600 : key === 'mongodb' ? 900 : key === 'mysql' ? 500 : 400;
      return {
        pool: {
          data: [
            { name: 'Success', value: apiSuccessRate, color: THEME.success, display: `${apiSuccessRate}%` },
            { name: 'Errors', value: 100 - apiSuccessRate, color: THEME.danger, display: `${100 - apiSuccessRate}%` },
          ],
          centerValue: `${apiSuccessRate}%`, centerLabel: 'API',
        },
        workload: {
          data: [
            { name: 'Queries', value: 65, color: c, display: '65%' },
            { name: 'Mutations', value: 25, color: THEME.warning, display: '25%' },
            { name: 'Admin Ops', value: 10, color: THEME.success, display: '10%' },
          ],
          centerValue: '65%', centerLabel: 'QUERIES',
        },
        topTables: [
          { label: 'Deployments/week', value: deployCount, display: `${deployCount}` },
          { label: 'Open PRs', value: 8 + (seed % 15), display: `${8 + (seed % 15)}` },
          { label: 'API Latency P99', value: 150 + (seed % 200), display: `${150 + (seed % 200)} ms` },
          { label: 'Test Coverage', value: 70 + (seed % 25), display: `${70 + (seed % 25)}%` },
          { label: 'Query Optimizations', value: 5 + (seed % 20), display: `${5 + (seed % 20)}/week` },
        ],
        resources: [
          { label: 'API Uptime', value: apiSuccessRate, icon: Globe, status: st(apiSuccessRate, 99, 95), detail: `${apiSuccessRate}% success rate` },
          { label: 'Deploy Freq', value: Math.min(deployCount * 2, 100), icon: Zap, status: st(deployCount * 2, 80, 40), detail: `${deployCount} deploys/week` },
          { label: 'Query Perf', value: 85 + (seed % 12), icon: Activity, status: st(85 + (seed % 12), 95, 80), detail: 'avg 2.1ms response' },
        ],
        latencyData: mkTimeSeries('dev', [
          { key: 'p50', base: 1, range: 30, div: 10 },
          { key: 'p95', base: 6, range: 80, div: 10 },
          { key: 'p99', base: 15, range: 250, div: 10 },
        ]),
        opsData: Array.from({ length: 8 }, (_, i) => {
          const s = hashSeed(key + 'ops' + i);
          return {
            time: `${String((i + 1) * 3).padStart(2, '0')}:00`,
            reads: base + (s % (base / 2)),
            writes: Math.round(base * 0.2) + (s % Math.round(base * 0.3)),
          };
        }),
      };
    }
    case 'admin': {
      const backupHealth = 90 + (seed % 10);
      const taskSuccess = 95 + (seed % 5);
      return {
        pool: {
          data: [
            { name: 'Admin', value: users.admin, color: THEME.danger, display: `${users.admin}` },
            { name: 'Developer', value: users.dev, color: c, display: `${users.dev}` },
            { name: 'Read-only', value: users.readonly, color: THEME.success, display: `${users.readonly}` },
          ],
          centerValue: `${users.total}`, centerLabel: 'USERS',
        },
        workload: {
          data: [
            { name: 'Automated', value: 72, color: c, display: '72%' },
            { name: 'Manual', value: 28, color: THEME.warning, display: '28%' },
          ],
          centerValue: '72%', centerLabel: 'AUTO',
        },
        topTables: [
          { label: 'Scheduled Tasks', value: 34 + (seed % 20), display: `${34 + (seed % 20)} active` },
          { label: 'Backup Success', value: backupHealth, display: `${backupHealth}%` },
          { label: 'Config Changes/day', value: 5 + (seed % 15), display: `${5 + (seed % 15)}` },
          { label: 'Retention Policies', value: 8 + (seed % 10), display: `${8 + (seed % 10)} active` },
          { label: 'Custom Dashboards', value: 10 + (seed % 15), display: `${10 + (seed % 15)}` },
        ],
        resources: [
          { label: 'Backup Health', value: backupHealth, icon: HardDrive, status: st(backupHealth, 95, 85), detail: `Last: ${(seed % 4) + 1}h ago` },
          { label: 'Task Success', value: taskSuccess, icon: CheckCircle, status: st(taskSuccess, 99, 95), detail: `${taskSuccess}% success rate` },
          { label: 'System Load', value: res.cpu, icon: Cpu, status: st(res.cpu), detail: `${res.cpuCores} cores available` },
        ],
        latencyData: mkTimeSeries('adm', [
          { key: 'p50', base: 0.5, range: 15, div: 10 },
          { key: 'p95', base: 3, range: 50, div: 10 },
          { key: 'p99', base: 10, range: 150, div: 10 },
        ]),
        userDist: {
          data: [
            { name: 'Admin', value: users.admin, color: THEME.danger, display: `${users.admin}` },
            { name: 'Developer', value: users.dev, color: c, display: `${users.dev}` },
            { name: 'Read-only', value: users.readonly, color: THEME.success, display: `${users.readonly}` },
            { name: 'Service', value: users.service, color: THEME.warning, display: `${users.service}` },
          ],
          centerValue: `${users.total}`, centerLabel: 'USERS',
        },
      };
    }
    default: return {};
  }
}

/* MongoDB/MySQL/MSSQL/Oracle use generic section IDs mapped to their structures */
function mapSectionToWidgetId(sectionId) {
  const mapping = {
    'overview': 'core', 'performance': 'query', 'storage': 'infra',
    'data': 'schema', 'intelligence': 'observability', 'replication': 'infra',
    'management': 'admin',
  };
  return mapping[sectionId] || sectionId;
}

/* ── Reusable demo table component ── */
function DemoTable({ columns, rows, color }) {
  return (
    <div style={{ overflowX: 'auto', maxHeight: 300, overflowY: 'auto' }}>
      <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
            {columns.map((col, idx) => (
              <th key={idx} style={{
                padding: '8px 12px',
                textAlign: 'left',
                fontWeight: 600,
                color: THEME.textMuted,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                width: col.width,
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} style={{ borderBottom: `1px solid ${THEME.glassBorder}` }}>
              {columns.map((col, cIdx) => (
                <td key={cIdx} style={{
                  padding: '8px 12px',
                  color: THEME.textMain,
                  borderBottom: `1px solid ${THEME.glassBorder}`,
                }}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Code block component for SQL/preview ── */
function CodeBlock({ code, color }) {
  const lines = code.split('\n');
  return (
    <div style={{
      background: THEME.glass,
      border: `1px solid ${THEME.glassBorder}`,
      borderRadius: 8,
      padding: '12px 0',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      color: THEME.textDim,
      overflowX: 'auto',
      maxHeight: 180,
      overflowY: 'auto',
    }}>
      {lines.map((line, idx) => (
        <div key={idx} style={{ display: 'flex', lineHeight: '1.5' }}>
          <span style={{ color: THEME.textMuted, paddingRight: 12, paddingLeft: 8, minWidth: 30, textAlign: 'right', userSelect: 'none' }}>{idx + 1}</span>
          <span style={{ paddingRight: 8, whiteSpace: 'pre' }}>{line || ' '}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Severity/status badge for tables ── */
function SeverityBadge({ label, severity }) {
  const severityColors = {
    success: THEME.success,
    warning: THEME.warning,
    danger: THEME.danger,
    info: THEME.primary,
  };
  const color = severityColors[severity] || THEME.textMuted;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 6px',
      borderRadius: 4,
      background: `${color}20`,
      color: color,
      fontSize: 9,
      fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

/* ── Render section-specific content based on widgetId ── */
function SectionContent({ section, db }) {
  const widgetId = mapSectionToWidgetId(section.id);
  const sw = getSectionWidgets(widgetId, db);
  const dbName = db.name.toLowerCase().replace(' ', '');
  const key = dbName === 'sqlserver' ? 'mssql' : dbName;

  // Section header
  const headerNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingLeft: 16, borderLeft: `4px solid ${db.color}` }}>
      <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{section.name}</h2>
      <StatusBadge label={`${section.tabs.length} tabs`} color={db.color} />
    </div>
  );

  // Core section — keep existing layout
  const coreSection = sw.pool && sw.workload && (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
        <Panel title="Connection Pool" icon={Layers} accentColor={db.color}>
          <DonutWidget {...sw.pool} color={db.color} size={100} innerRadius={34} outerRadius={46} />
        </Panel>
        <Panel title="Workload Split" icon={BarChart3} accentColor={db.color}>
          <DonutWidget {...sw.workload} color={db.color} size={100} innerRadius={34} outerRadius={46} />
        </Panel>
        <Panel title="Top Impacted Tables" icon={Database} accentColor={db.color}>
          <HorizontalBarList items={sw.topTables} color={db.color} />
        </Panel>
      </div>

      {sw.resources && (
        <div style={{ marginBottom: 16 }}>
          <ResourceGaugeRow resources={sw.resources} color={db.color} />
        </div>
      )}

      {sw.latencyData && sw.pool && (
        <div style={{ marginBottom: 16 }}>
          <Panel title="Transaction Latency Percentiles" icon={Activity} accentColor={db.color}
            rightNode={<div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 3, background: THEME.success, borderRadius: 1 }} />P50</span>
              <span style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 3, background: THEME.warning, borderRadius: 1 }} />P95</span>
              <span style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 3, background: THEME.danger, borderRadius: 1 }} />P99</span>
            </div>}>
            <MultiLineChartWidget data={sw.latencyData} lines={[
              { key: 'p50', color: THEME.success },
              { key: 'p95', color: THEME.warning, dashed: true },
              { key: 'p99', color: THEME.danger, dashed: true },
            ]} color={db.color} />
          </Panel>
        </div>
      )}
    </div>
  );

  // Query section — SQL editor + slow queries table + index health
  const querySection = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Panel title="Query Analysis" icon={Code} accentColor={db.color}>
          <CodeBlock code={`SELECT o.order_id, o.created_at, COUNT(*) as items\nFROM orders o\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.created_at > NOW() - INTERVAL '7 days'\nGROUP BY o.order_id, o.created_at\nHAVING COUNT(*) > 5\nORDER BY items DESC LIMIT 100`} color={db.color} />
        </Panel>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Panel title="Slow Queries" icon={Clock} accentColor={THEME.warning}>
          <DemoTable
            columns={[
              { key: 'query', label: 'Query', width: '50%' },
              { key: 'avgDuration', label: 'Avg Duration', width: '25%' },
              { key: 'calls', label: 'Calls', width: '25%' },
            ]}
            rows={DB_SLOW_QUERIES[key].slice(0, 3).map(q => ({
              query: q.label.substring(0, 40) + '...',
              avgDuration: q.display,
              calls: Math.floor(Math.random() * 1000 + 100),
            }))}
            color={db.color}
          />
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <Panel title="Index Usage" icon={Gauge} accentColor={db.color}>
          <DonutWidget
            data={[
              { name: 'Index Scan', value: DB_INDEX_STATS[key].indexPct, color: THEME.success, display: `${DB_INDEX_STATS[key].indexPct}%` },
              { name: 'Seq Scan', value: DB_INDEX_STATS[key].seqPct, color: THEME.warning, display: `${DB_INDEX_STATS[key].seqPct}%` },
            ]}
            centerValue={`${DB_INDEX_STATS[key].indexPct}%`}
            centerLabel="INDEX"
            color={THEME.success}
            size={100}
            innerRadius={34}
            outerRadius={46}
          />
        </Panel>
        <Panel title="Index Health" icon={BarChart3} accentColor={db.color}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: THEME.textMuted }}>Hit Ratio</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.success }}>{DB_INDEX_STATS[key].indexPct}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: THEME.textMuted }}>Seq Scan Rate</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.warning }}>{DB_INDEX_STATS[key].seqPct}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: THEME.textMuted }}>Total Indexes</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: db.color }}>342</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: THEME.textMuted }}>Unused</span>
              <SeverityBadge label="23" severity="warning" />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );

  // Infrastructure section — KPI row + connection pool donut + replication + connection list
  const infraSection = (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
        <Panel title="Buffer Hit Rate" icon={Zap} accentColor={db.color} noPad>
          <div style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: THEME.success }}>99.2%</div>
            <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4 }}>Cache Efficiency</div>
          </div>
        </Panel>
        <Panel title="WAL Rate" icon={Activity} accentColor={db.color} noPad>
          <div style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: db.color }}>24.6 MB/s</div>
            <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4 }}>Current</div>
          </div>
        </Panel>
        <Panel title="Replication Lag" icon={Network} accentColor={db.color} noPad>
          <div style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: THEME.success }}>0.3 ms</div>
            <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4 }}>Primary</div>
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14, marginBottom: 16 }}>
        <Panel title="Connection Pool" icon={Layers} accentColor={db.color}>
          <DonutWidget {...sw.pool} color={db.color} size={100} innerRadius={34} outerRadius={46} />
        </Panel>
        <Panel title="Replication Topology" icon={GitBranch} accentColor={db.color}>
          <ReplicationTopology nodes={sw.replication} color={db.color} />
        </Panel>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Panel title="Connection List" icon={Network} accentColor={db.color}>
          <DemoTable
            columns={[
              { key: 'name', label: 'Name', width: '25%' },
              { key: 'host', label: 'Host', width: '25%' },
              { key: 'status', label: 'Status', width: '20%' },
              { key: 'poolSize', label: 'Pool Size', width: '15%' },
              { key: 'active', label: 'Active', width: '15%' },
            ]}
            rows={[
              { name: 'primary', host: 'db-1.internal', status: <SeverityBadge label="active" severity="success" />, poolSize: '100', active: '42' },
              { name: 'replica-1', host: 'db-2.internal', status: <SeverityBadge label="synced" severity="success" />, poolSize: '50', active: '8' },
              { name: 'replica-2', host: 'db-3.internal', status: <SeverityBadge label="synced" severity="success" />, poolSize: '50', active: '12' },
              { name: 'standby', host: 'db-4.internal', status: <SeverityBadge label="idle" severity="info" />, poolSize: '25', active: '0' },
            ]}
            color={db.color}
          />
        </Panel>
      </div>
    </div>
  );

  // Schema section — compliance score + schema objects donut + schema changes table
  const schemaSection = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Panel title="Compliance Score" icon={Shield} accentColor={db.color} noPad>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: THEME.success }}>88%</div>
                <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4 }}>Overall Compliance</div>
              </div>
            </div>
            <div style={{ height: 4, background: THEME.glassBorder, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: THEME.success, width: '88%' }} />
            </div>
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <Panel title="Schema Objects" icon={Layers} accentColor={db.color}>
          <DonutWidget
            data={[
              { name: 'Tables', value: DB_SCHEMA_OBJECTS[key].tables, color: db.color, display: `${DB_SCHEMA_OBJECTS[key].tables}` },
              { name: 'Views', value: DB_SCHEMA_OBJECTS[key].views, color: THEME.success, display: `${DB_SCHEMA_OBJECTS[key].views}` },
              { name: 'Functions', value: DB_SCHEMA_OBJECTS[key].functions, color: THEME.warning, display: `${DB_SCHEMA_OBJECTS[key].functions}` },
            ]}
            centerValue={`${DB_SCHEMA_OBJECTS[key].total}`}
            centerLabel="OBJECTS"
            color={db.color}
            size={100}
            innerRadius={34}
            outerRadius={46}
          />
        </Panel>
        <Panel title="Schema Changes" icon={Activity} accentColor={db.color}>
          <DemoTable
            columns={[
              { key: 'migration', label: 'Migration', width: '40%' },
              { key: 'timestamp', label: 'Timestamp', width: '35%' },
              { key: 'status', label: 'Status', width: '25%' },
            ]}
            rows={[
              { migration: 'v2.3.1_add_indexes', timestamp: '2h ago', status: <SeverityBadge label="applied" severity="success" /> },
              { migration: 'v2.3.0_schema_ext', timestamp: '1d ago', status: <SeverityBadge label="applied" severity="success" /> },
              { migration: 'v2.2.9_rollback', timestamp: '3d ago', status: <SeverityBadge label="applied" severity="success" /> },
            ]}
            color={db.color}
          />
        </Panel>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Panel title="Audit Log" icon={Eye} accentColor={db.color}>
          <DemoTable
            columns={[
              { key: 'user', label: 'User', width: '20%' },
              { key: 'action', label: 'Action', width: '25%' },
              { key: 'timestamp', label: 'Timestamp', width: '25%' },
              { key: 'target', label: 'Target', width: '30%' },
            ]}
            rows={[
              { user: 'admin', action: 'CREATE TABLE', timestamp: '2h ago', target: 'events_backup' },
              { user: 'dev_user', action: 'DROP INDEX', timestamp: '4h ago', target: 'orders.idx_status' },
              { user: 'admin', action: 'GRANT', timestamp: '1d ago', target: 'readonly_role' },
            ]}
            color={db.color}
          />
        </Panel>
      </div>
    </div>
  );

  // Observability section — metric cards with sparklines + active alerts + log patterns
  const observabilitySection = (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
        <Panel title="Trace Volume" icon={Activity} accentColor={db.color} noPad>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: db.color }}>4.5K</div>
                <div style={{ fontSize: 9, color: THEME.textMuted, marginTop: 2 }}>traces/sec</div>
              </div>
              <MiniSparkline data={[2000, 3500, 4200, 4100, 4500, 4200, 4600]} color={db.color} width={44} height={16} />
            </div>
          </div>
        </Panel>
        <Panel title="Error Rate" icon={AlertTriangle} accentColor={THEME.danger} noPad>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: THEME.success }}>0.02%</div>
                <div style={{ fontSize: 9, color: THEME.textMuted, marginTop: 2 }}>of requests</div>
              </div>
              <MiniSparkline data={[0.05, 0.04, 0.03, 0.02, 0.02, 0.03, 0.02]} color={THEME.success} width={44} height={16} />
            </div>
          </div>
        </Panel>
        <Panel title="Alert Count" icon={AlertTriangle} accentColor={THEME.warning} noPad>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: THEME.warning }}>3</div>
                <div style={{ fontSize: 9, color: THEME.textMuted, marginTop: 2 }}>active alerts</div>
              </div>
              <MiniSparkline data={[0, 1, 2, 2, 3, 3, 3]} color={THEME.warning} width={44} height={16} />
            </div>
          </div>
        </Panel>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Panel title="Active Alerts" icon={AlertTriangle} accentColor={THEME.warning}>
          <DemoTable
            columns={[
              { key: 'severity', label: 'Severity', width: '20%' },
              { key: 'message', label: 'Message', width: '40%' },
              { key: 'timestamp', label: 'Timestamp', width: '25%' },
              { key: 'status', label: 'Status', width: '15%' },
            ]}
            rows={[
              { severity: <SeverityBadge label="warning" severity="warning" />, message: 'High CPU usage', timestamp: '12m ago', status: 'firing' },
              { severity: <SeverityBadge label="info" severity="info" />, message: 'Checkpoint running', timestamp: '1h ago', status: 'resolved' },
              { severity: <SeverityBadge label="info" severity="info" />, message: 'Autovacuum active', timestamp: '2h ago', status: 'resolved' },
            ]}
            color={db.color}
          />
        </Panel>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Panel title="Log Patterns" icon={Eye} accentColor={db.color}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { pattern: 'connection timeout', count: 24, trend: [5, 8, 12, 15, 18, 22, 24] },
              { pattern: 'query slow', count: 156, trend: [120, 128, 135, 142, 150, 153, 156] },
              { pattern: 'index scan full table', count: 89, trend: [45, 52, 61, 70, 78, 84, 89] },
            ].map((entry, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${THEME.glassBorder}` }}>
                <div>
                  <div style={{ fontSize: 11, color: THEME.textMain, fontFamily: "'JetBrains Mono',monospace" }}>{entry.pattern}</div>
                  <div style={{ fontSize: 9, color: THEME.textMuted, marginTop: 2 }}>Count: {entry.count}</div>
                </div>
                <MiniSparkline data={entry.trend} color={db.color} width={50} height={20} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );

  // Developer tools section — SQL console + API endpoints + recent queries
  const devSection = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Panel title="SQL Console" icon={Code} accentColor={db.color}>
          <CodeBlock code={`-- Find top performing queries\nSELECT query_id, total_time, calls, mean_time\nFROM pg_stat_statements\nORDER BY mean_time DESC\nLIMIT 10;`} color={db.color} />
        </Panel>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Panel title="API Endpoints" icon={Globe} accentColor={db.color}>
          <DemoTable
            columns={[
              { key: 'method', label: 'Method', width: '15%' },
              { key: 'path', label: 'Path', width: '40%' },
              { key: 'avgResponse', label: 'Avg Response', width: '25%' },
              { key: 'callsHr', label: 'Calls/hr', width: '20%' },
            ]}
            rows={[
              { method: <span style={{ color: THEME.success, fontWeight: 600 }}>GET</span>, path: '/api/orders', avgResponse: '12.3ms', callsHr: '8.2K' },
              { method: <span style={{ color: THEME.warning, fontWeight: 600 }}>POST</span>, path: '/api/orders', avgResponse: '45.2ms', callsHr: '2.1K' },
              { method: <span style={{ color: THEME.success, fontWeight: 600 }}>GET</span>, path: '/api/users', avgResponse: '8.5ms', callsHr: '15.4K' },
              { method: <span style={{ color: db.color, fontWeight: 600 }}>PUT</span>, path: '/api/users/:id', avgResponse: '32.1ms', callsHr: '1.2K' },
            ]}
            color={db.color}
          />
        </Panel>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Panel title="Recent Queries" icon={Activity} accentColor={db.color}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { sql: 'SELECT * FROM orders WHERE...', timestamp: '2m ago', duration: '23.4ms' },
              { sql: 'UPDATE inventory SET qty...', timestamp: '5m ago', duration: '108.2ms' },
              { sql: 'DELETE FROM audit_log WHERE...', timestamp: '12m ago', duration: '2.1s' },
            ].map((q, idx) => (
              <div key={idx} style={{ borderLeft: `3px solid ${db.color}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 10, color: THEME.textMain, fontFamily: "'JetBrains Mono',monospace" }}>{q.sql}</div>
                <div style={{ fontSize: 9, color: THEME.textMuted, marginTop: 4, display: 'flex', gap: 12 }}>
                  <span>{q.timestamp}</span>
                  <span style={{ color: db.color }}>{q.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );

  // Admin section — users table + backup schedule + scheduled tasks + user distribution
  const adminSection = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Panel title="Users & Roles" icon={Shield} accentColor={db.color}>
          <DemoTable
            columns={[
              { key: 'username', label: 'Username', width: '25%' },
              { key: 'role', label: 'Role', width: '20%' },
              { key: 'lastLogin', label: 'Last Login', width: '25%' },
              { key: 'status', label: 'Status', width: '30%' },
            ]}
            rows={[
              { username: 'admin', role: <SeverityBadge label="admin" severity="danger" />, lastLogin: '1h ago', status: <SeverityBadge label="active" severity="success" /> },
              { username: 'dev_user', role: <SeverityBadge label="developer" severity="info" />, lastLogin: '4m ago', status: <SeverityBadge label="active" severity="success" /> },
              { username: 'readonly', role: <SeverityBadge label="read-only" severity="info" />, lastLogin: '1d ago', status: <SeverityBadge label="idle" severity="info" /> },
              { username: 'api_service', role: <SeverityBadge label="service" severity="warning" />, lastLogin: '5m ago', status: <SeverityBadge label="active" severity="success" /> },
            ]}
            color={db.color}
          />
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <Panel title="Backup Schedule" icon={HardDrive} accentColor={db.color}>
          <DemoTable
            columns={[
              { key: 'name', label: 'Name', width: '30%' },
              { key: 'schedule', label: 'Schedule', width: '30%' },
              { key: 'lastRun', label: 'Last Run', width: '25%' },
              { key: 'status', label: 'Status', width: '15%' },
            ]}
            rows={[
              { name: 'daily-full', schedule: 'Daily 2AM', lastRun: '1h ago', status: <SeverityBadge label="ok" severity="success" /> },
              { name: 'hourly-inc', schedule: 'Every hour', lastRun: '12m ago', status: <SeverityBadge label="ok" severity="success" /> },
              { name: 'weekly-arch', schedule: 'Sun 3AM', lastRun: '2d ago', status: <SeverityBadge label="ok" severity="success" /> },
            ]}
            color={db.color}
          />
        </Panel>
        <Panel title="Scheduled Tasks" icon={Activity} accentColor={db.color}>
          <DemoTable
            columns={[
              { key: 'task', label: 'Task', width: '35%' },
              { key: 'interval', label: 'Interval', width: '30%' },
              { key: 'nextRun', label: 'Next Run', width: '35%' },
            ]}
            rows={[
              { task: 'autovacuum', interval: 'Continuous', nextRun: 'Active' },
              { task: 'analyze', interval: '3 hours', nextRun: '42m' },
              { task: 'reindex', interval: 'Daily', nextRun: '18h' },
              { task: 'stats_check', interval: '15 min', nextRun: '3m' },
            ]}
            color={db.color}
          />
        </Panel>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Panel title="User Distribution" icon={Shield} accentColor={db.color}>
          <DonutWidget {...sw.userDist} color={db.color} size={110} innerRadius={38} outerRadius={50} />
        </Panel>
      </div>
    </div>
  );

  // Determine which section to render
  let middleContent;
  switch (widgetId) {
    case 'core':
      middleContent = coreSection;
      break;
    case 'query':
      middleContent = querySection;
      break;
    case 'infra':
      middleContent = infraSection;
      break;
    case 'schema':
      middleContent = schemaSection;
      break;
    case 'observability':
      middleContent = observabilitySection;
      break;
    case 'dev':
      middleContent = devSection;
      break;
    case 'admin':
      middleContent = adminSection;
      break;
    default:
      middleContent = coreSection;
  }

  return (
    <div>
      {headerNode}
      {middleContent}

      <div className="demo-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {section.tabs.map((tab, idx) => (
          <div
            key={idx}
            style={{
              background: THEME.glass,
              backdropFilter: 'blur(14px)',
              border: `1px solid ${THEME.glassBorder}`,
              borderRadius: 14,
              padding: '14px 16px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = db.color;
              e.currentTarget.style.boxShadow = `0 8px 24px ${db.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = THEME.glassBorder;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="demo-card-shine" />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${db.color}, transparent)`, opacity: 0.6 }} />
            <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: THEME.textMain }}>{tab.name}</h3>
            {tab.metrics.map((m, mIdx) => (
              <div key={mIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: mIdx < tab.metrics.length - 1 ? 10 : 0 }}>
                <span style={{ fontSize: 11.5, color: THEME.textMuted }}>{m.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: db.color, fontFamily: "'JetBrains Mono',monospace" }}>{m.value}</span>
                  <span style={{ fontSize: 10, color: THEME.textDim }}>{m.unit}</span>
                  <MiniSparkline data={genSparkData(`${tab.name}-${m.label}`)} color={db.color} width={44} height={14} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <Panel title={`${section.name} Activity`} icon={Activity} accentColor={db.color} rightNode={<StatusBadge label="DEMO" color={db.color} pulse />}>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={genVelocityData(section.name)} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id={`dg1-${section.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={db.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={db.color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`dg2-${section.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={db.color} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={db.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={THEME.glassBorder} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 9.5, fill: THEME.textDim }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9.5, fill: THEME.textDim }} axisLine={false} tickLine={false} width={36} />
                <Tooltip />
                <Area type="monotone" dataKey="primary" stroke={db.color} strokeWidth={2} fill={`url(#dg1-${section.id})`} />
                <Area type="monotone" dataKey="secondary" stroke={db.color} strokeWidth={1} fill={`url(#dg2-${section.id})`} strokeDasharray="5 3" strokeOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ── Helper: shared backup/txn/maintenance panels ── */
function OverviewPanels({ widgets, db }) {
  return (
    <div className="demo-stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
      <Panel title="Last Backup" icon={HardDrive} accentColor={THEME.success}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: THEME.textMuted }}>Completed</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain, fontFamily: "'JetBrains Mono',monospace" }}>{widgets.backup.time}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: THEME.textMuted }}>Size</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain, fontFamily: "'JetBrains Mono',monospace" }}>{widgets.backup.size}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: THEME.textMuted }}>Duration</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain, fontFamily: "'JetBrains Mono',monospace" }}>{widgets.backup.duration}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: THEME.textMuted }}>Verified</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {widgets.backup.verified && <CheckCircle size={12} color={THEME.success} />}
              <span style={{ fontSize: 11, color: THEME.success, fontWeight: 600 }}>Yes</span>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${THEME.glassBorder}`, paddingTop: 8, marginTop: 8 }}>
            <div style={{ fontSize: 10, color: THEME.textDim }}>Next: {widgets.backup.next}</div>
          </div>
        </div>
      </Panel>

      <Panel title="Long-Running Txns" icon={Hourglass} accentColor={THEME.warning}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {widgets.longTxns.map((txn, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: THEME.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{txn.pid}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textDim }}>{txn.duration}</span>
              </div>
              <div style={{ fontSize: 9, color: THEME.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{txn.query}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: THEME.glassBorder, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: THEME.warning, width: `${txn.pct}%` }} />
                </div>
                <span style={{ fontSize: 9, color: THEME.textDim, minWidth: 30 }}>{txn.wait}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Maintenance Health" icon={Leaf} accentColor={db.color}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', height: 18, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
            <div style={{ flex: widgets.vacuum.urgent, background: THEME.danger, opacity: 0.8 }} />
            <div style={{ flex: widgets.vacuum.soon, background: THEME.warning, opacity: 0.6 }} />
            <div style={{ flex: widgets.vacuum.healthy, background: THEME.success, opacity: 0.5 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 9, color: THEME.textDim }}>Urgent</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: THEME.danger }}>{widgets.vacuum.urgent}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: THEME.textDim }}>Soon</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: THEME.warning }}>{widgets.vacuum.soon}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: THEME.textDim }}>Healthy</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: THEME.success }}>{widgets.vacuum.healthy}</div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${THEME.glassBorder}`, paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: 9.5, color: THEME.textMuted, marginBottom: 4 }}>Dead Tuples</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>{widgets.vacuum.deadTuples}</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SubTabContent — Renders tab-specific widgets that differ per sub-tab
   so each tab (Overview, Performance, Resources, etc.) looks unique.
   Falls back to the section-level SectionContent for tabs without
   a custom layout.
   ══════════════════════════════════════════════════════════════════════ */
function SubTabContent({ subTabId, section, db, widgets }) {
  const dbName = db.name.toLowerCase().replace(' ', '');
  const key = dbName === 'sqlserver' ? 'mssql' : dbName;
  const sw = getSectionWidgets(mapSectionToWidgetId(section.id), db);

  /* ── Overview: full overview panels + core widgets ── */
  if (subTabId === 'overview' || !subTabId) {
    return (
      <>
        <OverviewPanels widgets={widgets} db={db} />
        <div style={{ marginTop: 16 }}>
          <SectionContent section={section} db={db} />
        </div>
      </>
    );
  }

  /* ── Performance: session traffic + query analysis ── */
  if (subTabId === 'performance') {
    const sessionData = Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      active: Math.floor(hashSeed(`${key}-sess-a-${i}`) * 30 + 5),
      idle: Math.floor(hashSeed(`${key}-sess-i-${i}`) * 15 + 2),
    }));
    return (
      <>
        <Panel title="Session Traffic" icon={Activity} accentColor={db.color}
          rightNode={<div style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 3, background: db.color, borderRadius: 1 }} />Active</span>
            <span style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 3, background: THEME.textDim, borderRadius: 1 }} />Idle</span>
          </div>}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.gridLine} />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: THEME.textDim }} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} width={30} />
              <Tooltip contentStyle={{ background: THEME.tooltipBg, border: `1px solid ${THEME.glassBorder}`, borderRadius: 8, fontSize: 10, color: THEME.textMain }} />
              <Area type="monotone" dataKey="active" stroke={db.color} fill={`${db.color}20`} strokeWidth={2} />
              <Area type="monotone" dataKey="idle" stroke={THEME.textDim} fill={`${THEME.textDim}10`} strokeWidth={1.5} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <div style={{ marginTop: 16 }}>
          <Panel title="Slow Queries" icon={Clock} accentColor={THEME.warning}>
            <DemoTable
              columns={[
                { key: 'query', label: 'Query', width: '50%' },
                { key: 'avgDuration', label: 'Avg Duration', width: '15%' },
                { key: 'calls', label: 'Calls', width: '15%' },
                { key: 'impact', label: 'Impact', width: '20%' },
              ]}
              rows={(DB_SLOW_QUERIES[key] || DB_SLOW_QUERIES.postgresql).slice(0, 5).map((q, i) => ({
                query: q.label,
                avgDuration: q.display,
                calls: Math.floor(hashSeed(`${key}-calls-${i}`) * 2000 + 100),
                impact: ['High', 'Medium', 'Low'][i % 3],
              }))}
              color={db.color}
            />
          </Panel>
        </div>
      </>
    );
  }

  /* ── Resources: CPU / Memory / Disk gauges + connection pool ── */
  if (subTabId === 'resources') {
    const cpuVal = Math.floor(hashSeed(`${key}-cpu`) * 40 + 20);
    const memVal = Math.floor(hashSeed(`${key}-mem`) * 30 + 45);
    const diskVal = Math.floor(hashSeed(`${key}-disk`) * 25 + 10);
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <Panel title="CPU Usage" icon={Cpu} accentColor={db.color}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <RingGauge value={cpuVal} color={db.color} size={100} strokeWidth={8} label="CPU" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
              <div><span style={{ color: THEME.textDim }}>Cores</span> <span style={{ color: THEME.textMain, fontWeight: 600 }}>8</span></div>
              <div><span style={{ color: THEME.textDim }}>Load Avg</span> <span style={{ color: THEME.textMain, fontWeight: 600 }}>2.4</span></div>
            </div>
          </Panel>
          <Panel title="Memory Usage" icon={MemoryStick} accentColor={db.color}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <RingGauge value={memVal} color={db.color} size={100} strokeWidth={8} label="RAM" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
              <div><span style={{ color: THEME.textDim }}>Used</span> <span style={{ color: THEME.textMain, fontWeight: 600 }}>12.4 GB</span></div>
              <div><span style={{ color: THEME.textDim }}>Buffers</span> <span style={{ color: THEME.textMain, fontWeight: 600 }}>4 GB</span></div>
            </div>
          </Panel>
          <Panel title="Connections" icon={Network} accentColor={db.color}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <RingGauge value={Math.floor(hashSeed(`${key}-conn`) * 30 + 15)} color={db.color} size={100} strokeWidth={8} label="POOL" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
              <div><span style={{ color: THEME.textDim }}>Active</span> <span style={{ color: THEME.textMain, fontWeight: 600 }}>25</span></div>
              <div><span style={{ color: THEME.textDim }}>Max</span> <span style={{ color: THEME.textMain, fontWeight: 600 }}>100</span></div>
            </div>
          </Panel>
        </div>
        <div style={{ marginTop: 16 }}>
          <Panel title="Top Tables by I/O" icon={Database} accentColor={db.color}>
            <DemoTable
              columns={[
                { key: 'table', label: 'Table', width: '30%' },
                { key: 'reads', label: 'Reads', width: '17%' },
                { key: 'writes', label: 'Writes', width: '17%' },
                { key: 'hitRatio', label: 'Hit Ratio', width: '18%' },
                { key: 'trend', label: 'Trend', width: '18%' },
              ]}
              rows={(DB_TABLE_NAMES[key] || DB_TABLE_NAMES.postgresql).slice(0, 5).map((t, i) => ({
                table: t,
                reads: `${Math.floor(hashSeed(`${key}-trd-${i}`) * 50 + 10)}K ops`,
                writes: `${Math.floor(hashSeed(`${key}-twr-${i}`) * 20 + 2)}K ops`,
                hitRatio: `${Math.floor(hashSeed(`${key}-thr-${i}`) * 10 + 90)}%`,
                trend: hashSeed(`${key}-ttr-${i}`) > 0.5 ? 'Increasing' : 'Stable',
              }))}
              color={db.color}
            />
          </Panel>
        </div>
        <div style={{ marginTop: 16 }}>
          <Panel title="Replication Status" icon={Radio} accentColor={db.color}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '8px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
                <span style={{ color: THEME.textDim }}>WAL Generation</span>
                <span style={{ color: THEME.textMain, fontWeight: 700, fontSize: 16 }}>12.4 MB/s</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
                <span style={{ color: THEME.textDim }}>Replication Lag</span>
                <span style={{ color: THEME.success, fontWeight: 700, fontSize: 16 }}>0.3 ms</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
                <span style={{ color: THEME.textDim }}>Archiving</span>
                <span style={{ color: THEME.success, fontWeight: 700, fontSize: 16 }}>Active</span>
              </div>
            </div>
          </Panel>
        </div>
      </>
    );
  }

  /* ── Reliability: error rates + availability ── */
  if (subTabId === 'reliability') {
    const reliData = Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      errors: Math.floor(hashSeed(`${key}-err-${i}`) * 5),
      recoveryTime: +(hashSeed(`${key}-rec-${i}`) * 3 + 0.5).toFixed(1),
    }));
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Panel title="Error Trend (24h)" icon={AlertTriangle} accentColor={THEME.warning}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={reliData}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.gridLine} />
                <XAxis dataKey="time" tick={{ fontSize: 8, fill: THEME.textDim }} interval={5} />
                <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} width={24} />
                <Tooltip contentStyle={{ background: THEME.tooltipBg, border: `1px solid ${THEME.glassBorder}`, borderRadius: 8, fontSize: 10, color: THEME.textMain }} />
                <Bar dataKey="errors" fill={THEME.warning} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
          <Panel title="Recovery Time (24h)" icon={Clock} accentColor={THEME.success}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={reliData}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.gridLine} />
                <XAxis dataKey="time" tick={{ fontSize: 8, fill: THEME.textDim }} interval={5} />
                <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} width={24} unit="s" />
                <Tooltip contentStyle={{ background: THEME.tooltipBg, border: `1px solid ${THEME.glassBorder}`, borderRadius: 8, fontSize: 10, color: THEME.textMain }} />
                <Line type="monotone" dataKey="recoveryTime" stroke={THEME.success} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <Panel title="SLA Breach" icon={Shield} accentColor={THEME.success}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <RingGauge value={99} color={THEME.success} size={80} strokeWidth={6} label="SLA" />
            </div>
          </Panel>
          <Panel title="Availability" icon={CheckCircle} accentColor={THEME.success}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: THEME.success, fontFamily: "'JetBrains Mono',monospace" }}>99.99%</span>
              <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>30-day rolling</div>
            </div>
          </Panel>
          <Panel title="Incidents" icon={AlertTriangle} accentColor={db.color}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: db.color, fontFamily: "'JetBrains Mono',monospace" }}>0</span>
              <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 4 }}>Last 7 days</div>
            </div>
          </Panel>
        </div>
      </>
    );
  }

  /* ── Alerts: active alerts table + rules ── */
  if (subTabId === 'alerts') {
    const alertRows = [
      { name: 'High CPU Usage', severity: 'Warning', status: 'Triggered', time: '5 min ago' },
      { name: 'Replication Lag > 1s', severity: 'Critical', status: 'Resolved', time: '2 hours ago' },
      { name: 'Disk Usage > 80%', severity: 'Warning', status: 'Active', time: '15 min ago' },
      { name: 'Connection Pool Full', severity: 'Critical', status: 'Resolved', time: '1 day ago' },
      { name: 'Slow Query > 10s', severity: 'Info', status: 'Active', time: '30 min ago' },
    ];
    return (
      <>
        <Panel title="Active Alerts" icon={AlertTriangle} accentColor={THEME.warning}>
          <DemoTable
            columns={[
              { key: 'name', label: 'Alert Rule', width: '35%' },
              { key: 'severity', label: 'Severity', width: '20%' },
              { key: 'status', label: 'Status', width: '20%' },
              { key: 'time', label: 'Last Triggered', width: '25%' },
            ]}
            rows={alertRows}
            color={db.color}
          />
        </Panel>
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Panel title="Alert Rules Summary" icon={Shield} accentColor={db.color}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <DonutWidget
                data={[
                  { name: 'Active', value: 28, color: THEME.success, display: '28' },
                  { name: 'Disabled', value: 6, color: THEME.textDim, display: '6' },
                ]}
                centerValue="34"
                centerLabel="RULES"
                color={db.color} size={100} innerRadius={34} outerRadius={46}
              />
            </div>
          </Panel>
          <Panel title="Alert Frequency (7d)" icon={Activity} accentColor={db.color}>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={[
                { day: 'Mon', count: 3 }, { day: 'Tue', count: 1 }, { day: 'Wed', count: 0 },
                { day: 'Thu', count: 2 }, { day: 'Fri', count: 1 }, { day: 'Sat', count: 0 }, { day: 'Sun', count: 0 },
              ]}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: THEME.textDim }} />
                <YAxis tick={{ fontSize: 9, fill: THEME.textDim }} width={20} />
                <Tooltip contentStyle={{ background: THEME.tooltipBg, border: `1px solid ${THEME.glassBorder}`, borderRadius: 8, fontSize: 10, color: THEME.textMain }} />
                <Bar dataKey="count" fill={db.color} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </>
    );
  }

  /* ── Default fallback: section-level content + overview panels ── */
  return (
    <>
      <OverviewPanels widgets={widgets} db={db} />
      <div style={{ marginTop: 16 }}>
        <SectionContent section={section} db={db} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <Panel title="Overall Health" icon={Shield} accentColor={db.color} style={{ maxWidth: 300 }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <RingGauge value={92} color={db.color} size={100} strokeWidth={8} label="health" />
          </div>
        </Panel>
      </div>
    </>
  );
}

/** Map subTabId to a human-readable tab name for breadcrumb matching */
const SUB_TAB_DISPLAY_NAMES = {
  overview: 'Overview', performance: 'Performance', resources: 'Resources',
  reliability: 'Reliability', alerts: 'Alerts',
  optimizer: 'Query Optimizer', indexes: 'Indexes', regression: 'Plan Regression',
  bloat: 'Bloat Analysis', table: 'Table Analysis',
  pool: 'Connection Pool', replication: 'Replication & WAL', checkpoint: 'Checkpoint Monitor',
  maintenance: 'Vacuum & Maintenance', capacity: 'Capacity Planning', backup: 'Backup & Recovery',
  schema: 'Schema & Migrations', 'schema-viz': 'Schema Visualizer', security: 'Security & Compliance',
  cloudwatch: 'CloudWatch', 'log-patterns': 'Log Pattern Analysis', 'alert-correlation': 'Alert Correlation',
  opentelemetry: 'OpenTelemetry', kubernetes: 'Kubernetes', 'status-page': 'Status Page', 'ai-monitoring': 'AI Monitoring',
  sql: 'SQL Console', api: 'API Tracing', repository: 'Repository', 'ai-advisor': 'AI Query Advisor',
  tasks: 'DBA Task Scheduler', users: 'User Management', 'admin-panel': 'Admin',
  retention: 'Data Retention', terraform: 'Terraform Export', 'custom-dashboard': 'Custom Dashboards',
};

/** Find matching tab metrics within a section by display name */
function findTabMetrics(section, subTabId) {
  if (!section || !subTabId) return null;
  const displayName = SUB_TAB_DISPLAY_NAMES[subTabId];
  if (!displayName) return null;
  return section.tabs.find(t => t.name === displayName) || section.tabs[0] || null;
}

export default function DemoDataTab({ dbKey = 'postgresql', sectionId, subTabId }) {
  const db = DATABASE_STRUCTURE[dbKey];
  const widgets = DETAIL_WIDGETS[dbKey] || DETAIL_WIDGETS.postgresql;
  if (!db) return null;

  const kpiIcons = [Activity, Zap, Database, Clock, HardDrive];

  /* When sectionId is provided, find and render only that section */
  const filteredSection = sectionId
    ? db.sections.find((s) => s.id === sectionId)
    : null;

  /* Find the specific tab within the section for tab-specific metrics */
  const activeTab = findTabMetrics(filteredSection, subTabId);
  const tabMetrics = activeTab?.metrics || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '0 0 48px 0' }}>
      <DemoStyles />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LiveDot color={db.color} />
          <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.03em' }}>
            Demo Mode
          </span>
          <StatusBadge label={db.name} color={db.color} />
          {filteredSection
            ? <StatusBadge label={filteredSection.name} color={db.color} />
            : <StatusBadge label={`${db.sections.length} sections`} color={THEME.textMuted} />
          }
        </div>
        <StatusBadge label="DEMO" color={db.color} pulse />
      </div>

      {/* ── KPI Cards: show tab-specific metrics when subTab is active, else DB-level KPIs ── */}
      {tabMetrics ? (
        <div className="demo-stagger" style={{ display: 'grid', gridTemplateColumns: `repeat(${tabMetrics.length}, 1fr)`, gap: 12 }}>
          {tabMetrics.map((m, i) => {
            const Icon = kpiIcons[i] || Activity;
            const trend = genTrend(m.label);
            return (
              <div key={i} className="demo-card-shine" style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                padding: '14px 16px', borderRadius: 14,
                background: THEME.glass, backdropFilter: 'blur(14px)',
                border: `1px solid ${THEME.glassBorder}`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${db.color}10`, border: `1px solid ${db.color}18`,
                  }}>
                    <Icon size={14} color={db.color} />
                  </div>
                  <MiniSparkline data={genSparkData(m.label)} color={db.color} width={48} height={18} />
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1, marginBottom: 5 }}>
                    {m.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: db.color, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: "'JetBrains Mono',monospace" }}>
                      {m.value}
                    </span>
                    <span style={{ fontSize: 10, color: THEME.textDim }}>{m.unit}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {trend.up ? <ArrowUpRight size={10} color={THEME.success} /> : <ArrowDownRight size={10} color={THEME.warning} />}
                  <span style={{ fontSize: 10, fontWeight: 700, color: trend.up ? THEME.success : THEME.warning, fontFamily: "'JetBrains Mono',monospace" }}>{trend.value}</span>
                  <span style={{ fontSize: 9.5, color: THEME.textDim, marginLeft: 2 }}>vs last hr</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="demo-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {db.kpis.map((kpi, i) => {
            const Icon = kpiIcons[i] || Activity;
            const trend = genTrend(kpi.label);
            return (
              <div key={i} className="demo-card-shine" style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                padding: '14px 16px', borderRadius: 14,
                background: THEME.glass, backdropFilter: 'blur(14px)',
                border: `1px solid ${THEME.glassBorder}`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${db.color}10`, border: `1px solid ${db.color}18`,
                  }}>
                    <Icon size={14} color={db.color} />
                  </div>
                  <MiniSparkline data={genSparkData(kpi.label)} color={db.color} width={48} height={18} />
                </div>
                <div>
                  <div style={{ fontSize: 9.5, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1, marginBottom: 5 }}>
                    {kpi.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: db.color, lineHeight: 1, letterSpacing: '-0.02em', fontFamily: "'JetBrains Mono',monospace" }}>
                      {kpi.value}
                    </span>
                    <span style={{ fontSize: 10, color: THEME.textDim }}>{kpi.unit}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {trend.up ? <ArrowUpRight size={10} color={THEME.success} /> : <ArrowDownRight size={10} color={THEME.warning} />}
                  <span style={{ fontSize: 10, fontWeight: 700, color: trend.up ? THEME.success : THEME.warning, fontFamily: "'JetBrains Mono',monospace" }}>{trend.value}</span>
                  <span style={{ fontSize: 9.5, color: THEME.textDim, marginLeft: 2 }}>vs last hr</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab-specific content area ── */}
      {filteredSection ? (
        <>
          {/* Show tab-specific widget based on subTabId, falling back to section-level widgets */}
          <SubTabContent subTabId={subTabId} section={filteredSection} db={db} widgets={widgets} />
        </>
      ) : (
        <>
          <OverviewPanels widgets={widgets} db={db} />
          {db.sections.map((section) => (
            <div key={section.id} style={{ marginTop: 24 }}>
              <SectionContent section={section} db={db} />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Panel title="Overall Health" icon={Shield} accentColor={db.color} style={{ maxWidth: 300 }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <RingGauge value={92} color={db.color} size={100} strokeWidth={8} label="health" />
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
