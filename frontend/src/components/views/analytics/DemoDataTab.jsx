import React, { useState } from 'react';
import {
  Database, TrendingUp, Activity, Zap, HardDrive, Cpu,
  ChevronDown, ChevronRight, AlertCircle, CheckCircle,
  Clock, BarChart3, PieChart as PieChartIcon, GitBranch,
  Shield, Settings
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════ */
/* THEME & CONSTANTS */
/* ═══════════════════════════════════════════════════════════════════════════ */

const DARK_THEME = {
  bg: '#0d1117',
  card: '#161b22',
  border: '#30363d',
  text: '#e6edf3',
  textMuted: '#8b949e',
  accent: '#58a6ff',
  success: '#3fb950',
  warning: '#d29922',
  danger: '#f85149',
  accent2: '#79c0ff',
};

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
  postgresql: [
    {
      title: 'Last Backup',
      type: 'backup',
      data: {
        time: '2 hours ago',
        size: '8.9 GB',
        duration: '12 min',
        verified: true,
        nextScheduled: 'in 22 hours'
      }
    },
    {
      title: 'Long-Running Transactions',
      type: 'transactions',
      data: [
        { pid: '12847', query: 'SELECT * FROM large_table WHERE...', duration: '45 min', waitState: 'I/O' },
        { pid: '12934', query: 'UPDATE inventory SET qty=qty-1...', duration: '12 min', waitState: 'Lock' },
        { pid: '13021', query: 'DELETE FROM audit_logs WHERE...', duration: '3 min', waitState: 'None' }
      ]
    },
    {
      title: 'Vacuum Health',
      type: 'vacuum',
      data: {
        urgent: 8,
        soon: 23,
        healthy: 541,
        deadTuples: '234.5M',
        bloatPercent: '12.3'
      }
    }
  ],
  mongodb: [
    {
      title: 'Replica Set Status',
      type: 'replica',
      data: {
        primary: 'mongod-01',
        secondaries: ['mongod-02', 'mongod-03'],
        health: 'healthy',
        syncProgress: '100%'
      }
    },
    {
      title: 'Oplog Health',
      type: 'oplog',
      data: {
        oplogSize: '5.2 GB',
        maxAge: '24 hours',
        currentSize: '4.8 GB',
        utilization: '92.3%'
      }
    },
    {
      title: 'WiredTiger Cache',
      type: 'wiredtiger',
      data: {
        cacheSize: '8.0 GB',
        evictionRate: '234/sec',
        inUse: '7.2 GB',
        available: '0.8 GB'
      }
    }
  ],
  mysql: [
    {
      title: 'InnoDB Buffer Pool',
      type: 'bufferpool',
      data: {
        size: '8.0 GB',
        utilization: '89.2%',
        hitRatio: '96.8%',
        pages: '2.1M'
      }
    },
    {
      title: 'Replication Status',
      type: 'replication',
      data: {
        role: 'Master',
        replicas: 2,
        lag: '0.5 seconds',
        binlogPos: '45234',
        status: 'healthy'
      }
    },
    {
      title: 'Slow Query Summary',
      type: 'slowquery',
      data: {
        count: '12/day',
        avgTime: '4.5 sec',
        maxTime: '23.2 sec',
        topQuery: 'SELECT * FROM orders WHERE created_at...'
      }
    }
  ],
  mssql: [
    {
      title: 'TempDB Health',
      type: 'tempdb',
      data: {
        size: '4.5 GB',
        usage: '67.2%',
        contention: 'low',
        allocation: 'normal'
      }
    },
    {
      title: 'Always On Status',
      type: 'alwayson',
      data: {
        role: 'Primary',
        replicas: 2,
        syncHealth: 'Healthy',
        syncMode: 'Synchronous'
      }
    },
    {
      title: 'Wait Statistics',
      type: 'waits',
      data: {
        topWait: 'PAGEIOLATCH_SH',
        waitTime: '234 ms',
        signalWait: '45 ms',
        resourceWait: '189 ms'
      }
    }
  ],
  oracle: [
    {
      title: 'SGA/PGA Usage',
      type: 'memory',
      data: {
        sgaTotal: '16.0 GB',
        pgaTotal: '2.5 GB',
        sgaUsed: '14.2 GB',
        pgaUsed: '2.1 GB'
      }
    },
    {
      title: 'Data Guard Status',
      type: 'dataguard',
      data: {
        primary: 'ORCL_PRIMARY',
        standby: 'ORCL_STANDBY',
        logTransport: 'Enabled',
        lag: '0.3 seconds'
      }
    },
    {
      title: 'RMAN Backup',
      type: 'rman',
      data: {
        lastBackup: '4 hours ago',
        status: 'Success',
        duration: '45 min',
        nextBackup: 'in 20 hours'
      }
    }
  ]
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* KPI CARD COMPONENT */
/* ═══════════════════════════════════════════════════════════════════════════ */

function KPICard({ label, value, unit, status, sparkline, dbColor }) {
  const statusColor = status === 'healthy' ? DARK_THEME.success :
                      status === 'warning' ? DARK_THEME.warning : DARK_THEME.danger;

  const max = Math.max(...sparkline);
  const min = Math.min(...sparkline);
  const range = max - min || 1;

  const points = sparkline.map((val, idx) => {
    const x = (idx / (sparkline.length - 1)) * 100;
    const y = 24 - ((val - min) / range) * 20;
    return `${x},${y}`;
  }).join(' ');

  const trend = sparkline[sparkline.length - 1] >= sparkline[sparkline.length - 2] ? '↑' : '↓';

  return (
    <div style={{
      background: `linear-gradient(135deg, ${DARK_THEME.card}aa 0%, rgba(22, 27, 34, 0.4) 100%)`,
      border: `1px solid ${DARK_THEME.border}`,
      borderRadius: 12,
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = statusColor;
        e.currentTarget.style.boxShadow = `0 8px 20px rgba(0, 0, 0, 0.3), 0 0 20px ${statusColor}30`;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = DARK_THEME.border;
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}>
      {/* Background accent */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        background: `radial-gradient(circle, ${statusColor}15 0%, transparent 70%)`,
        borderRadius: '50%',
      }} />

      {/* Label with icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: DARK_THEME.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {label}
        </span>
        <div style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          background: `${statusColor}30`,
          border: `1px solid ${statusColor}60`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
        }}>
          <Activity size={12} color={statusColor} />
        </div>
      </div>

      {/* Value */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: 8,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: statusColor,
        }}>
          {value}
        </div>
        {unit && (
          <div style={{
            fontSize: 11,
            color: DARK_THEME.textMuted,
            fontWeight: 500,
          }}>
            {unit}
          </div>
        )}
      </div>

      {/* Sparkline */}
      <svg width="100%" height="32" style={{ marginTop: 4, position: 'relative', zIndex: 1 }}>
        <defs>
          <linearGradient id={`sparkGrad_${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={statusColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={statusColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill={`url(#sparkGrad_${label})`}
          fillOpacity="1"
          stroke="none"
        />
        <polyline
          points={points}
          fill="none"
          stroke={statusColor}
          strokeWidth="2"
          strokeOpacity="0.8"
        />
      </svg>

      {/* Trend indicator */}
      <div style={{
        fontSize: 10,
        color: DARK_THEME.textMuted,
        marginTop: 6,
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{ color: statusColor }}>{trend} 2.3%</span> vs last hour
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* BACKUP DETAIL WIDGET */
/* ═══════════════════════════════════════════════════════════════════════════ */

function BackupWidget({ data, dbColor }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${DARK_THEME.card}aa 0%, rgba(22, 27, 34, 0.4) 100%)`,
      border: `1px solid ${DARK_THEME.border}`,
      borderRadius: 10,
      padding: '14px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: `${dbColor}30`,
          border: `1px solid ${dbColor}60`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <HardDrive size={16} color={dbColor} />
        </div>
        <h4 style={{
          fontSize: 12,
          fontWeight: 600,
          color: DARK_THEME.text,
          margin: 0,
          flex: 1,
        }}>
          Last Backup
        </h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: DARK_THEME.success,
          fontSize: 10,
        }}>
          <CheckCircle size={12} />
          Verified
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        fontSize: 11,
        color: DARK_THEME.textMuted,
      }}>
        <div>
          <div style={{ color: DARK_THEME.textMuted, marginBottom: 2 }}>Backup Time</div>
          <div style={{ color: dbColor, fontWeight: 600 }}>{data.time}</div>
        </div>
        <div>
          <div style={{ color: DARK_THEME.textMuted, marginBottom: 2 }}>Size</div>
          <div style={{ color: dbColor, fontWeight: 600 }}>{data.size}</div>
        </div>
        <div>
          <div style={{ color: DARK_THEME.textMuted, marginBottom: 2 }}>Duration</div>
          <div style={{ color: dbColor, fontWeight: 600 }}>{data.duration}</div>
        </div>
        <div>
          <div style={{ color: DARK_THEME.textMuted, marginBottom: 2 }}>Next Scheduled</div>
          <div style={{ color: dbColor, fontWeight: 600 }}>{data.nextScheduled}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* TRANSACTIONS DETAIL WIDGET */
/* ═══════════════════════════════════════════════════════════════════════════ */

function TransactionsWidget({ data, dbColor }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${DARK_THEME.card}aa 0%, rgba(22, 27, 34, 0.4) 100%)`,
      border: `1px solid ${DARK_THEME.border}`,
      borderRadius: 10,
      padding: '14px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: `${dbColor}30`,
          border: `1px solid ${dbColor}60`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Activity size={16} color={dbColor} />
        </div>
        <h4 style={{
          fontSize: 12,
          fontWeight: 600,
          color: DARK_THEME.text,
          margin: 0,
        }}>
          Long-Running Transactions
        </h4>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((txn, idx) => (
          <div key={idx} style={{ fontSize: 10 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 3,
              color: DARK_THEME.textMuted,
            }}>
              <span>PID {txn.pid}</span>
              <span style={{ color: DARK_THEME.text }}>{txn.duration}</span>
            </div>
            <div style={{
              fontSize: 9,
              color: DARK_THEME.textMuted,
              marginBottom: 3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {txn.query}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: 4,
              background: DARK_THEME.border,
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(parseInt(txn.duration) * 2, 100)}%`,
                background: `linear-gradient(90deg, ${dbColor}, ${dbColor}60)`,
                borderRadius: 2,
              }} />
            </div>
            <div style={{
              fontSize: 8,
              color: DARK_THEME.textMuted,
              marginTop: 2,
            }}>
              Wait: {txn.waitState}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* VACUUM HEALTH WIDGET */
/* ═══════════════════════════════════════════════════════════════════════════ */

function VacuumWidget({ data, dbColor }) {
  const total = data.urgent + data.soon + data.healthy;
  const urgentPct = (data.urgent / total) * 100;
  const soonPct = (data.soon / total) * 100;
  const healthyPct = (data.healthy / total) * 100;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${DARK_THEME.card}aa 0%, rgba(22, 27, 34, 0.4) 100%)`,
      border: `1px solid ${DARK_THEME.border}`,
      borderRadius: 10,
      padding: '14px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: `${dbColor}30`,
          border: `1px solid ${dbColor}60`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Zap size={16} color={dbColor} />
        </div>
        <h4 style={{
          fontSize: 12,
          fontWeight: 600,
          color: DARK_THEME.text,
          margin: 0,
        }}>
          Vacuum Health
        </h4>
      </div>

      {/* Segmented progress bar */}
      <div style={{
        display: 'flex',
        height: 12,
        background: DARK_THEME.border,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
      }}>
        <div style={{
          width: `${urgentPct}%`,
          background: DARK_THEME.danger,
          height: '100%',
        }} />
        <div style={{
          width: `${soonPct}%`,
          background: DARK_THEME.warning,
          height: '100%',
        }} />
        <div style={{
          width: `${healthyPct}%`,
          background: DARK_THEME.success,
          height: '100%',
        }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        fontSize: 10,
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8,
            height: 8,
            background: DARK_THEME.danger,
            borderRadius: 2,
          }} />
          <span style={{ color: DARK_THEME.textMuted }}>Urgent: {data.urgent}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8,
            height: 8,
            background: DARK_THEME.warning,
            borderRadius: 2,
          }} />
          <span style={{ color: DARK_THEME.textMuted }}>Soon: {data.soon}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8,
            height: 8,
            background: DARK_THEME.success,
            borderRadius: 2,
          }} />
          <span style={{ color: DARK_THEME.textMuted }}>Healthy: {data.healthy}</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        fontSize: 10,
        color: DARK_THEME.textMuted,
      }}>
        <div>
          <div style={{ marginBottom: 2 }}>Dead Tuples</div>
          <div style={{ color: dbColor, fontWeight: 600 }}>{data.deadTuples}</div>
        </div>
        <div>
          <div style={{ marginBottom: 2 }}>Bloat %</div>
          <div style={{ color: dbColor, fontWeight: 600 }}>{data.bloatPercent}%</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* GENERIC DETAIL WIDGET */
/* ═══════════════════════════════════════════════════════════════════════════ */

function GenericDetailWidget({ widget, dbColor }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${DARK_THEME.card}aa 0%, rgba(22, 27, 34, 0.4) 100%)`,
      border: `1px solid ${DARK_THEME.border}`,
      borderRadius: 10,
      padding: '14px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: `${dbColor}30`,
          border: `1px solid ${dbColor}60`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Settings size={16} color={dbColor} />
        </div>
        <h4 style={{
          fontSize: 12,
          fontWeight: 600,
          color: DARK_THEME.text,
          margin: 0,
        }}>
          {widget.title}
        </h4>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        fontSize: 10,
        color: DARK_THEME.textMuted,
      }}>
        {Object.entries(widget.data).map(([key, val]) => (
          <div key={key}>
            <div style={{ marginBottom: 2, textTransform: 'capitalize' }}>
              {key.replace(/([A-Z])/g, ' $1')}
            </div>
            <div style={{ color: dbColor, fontWeight: 600, wordBreak: 'break-word' }}>
              {typeof val === 'object' ? JSON.stringify(val).slice(0, 20) + '...' : String(val)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* THROUGHPUT AREA CHART */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ThroughputChart({ dbColor }) {
  const width = 800;
  const height = 160;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const qpsData = [450, 480, 520, 580, 620, 650, 680, 700, 720, 750, 780, 820];
  const tpsData = [180, 195, 215, 245, 280, 310, 340, 360, 380, 410, 430, 460];

  const maxQps = 850;
  const maxTps = 500;

  const qpsPoints = qpsData.map((val, idx) => {
    const x = padding + (idx / (qpsData.length - 1)) * chartWidth;
    const y = height - padding - (val / maxQps) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const tpsPoints = tpsData.map((val, idx) => {
    const x = padding + (idx / (tpsData.length - 1)) * chartWidth;
    const y = height - padding - (val / maxTps) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const qpsAreaPoints = `${padding},${height - padding} ` + qpsPoints + ` ${width - padding},${height - padding}`;
  const tpsAreaPoints = `${padding},${height - padding} ` + tpsPoints + ` ${width - padding},${height - padding}`;

  const lighterColor = dbColor + '40';

  return (
    <div style={{
      background: `linear-gradient(135deg, ${DARK_THEME.card}aa 0%, rgba(22, 27, 34, 0.4) 100%)`,
      border: `1px solid ${DARK_THEME.border}`,
      borderRadius: 12,
      padding: '16px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      marginBottom: 24,
    }}>
      <h3 style={{
        fontSize: 13,
        fontWeight: 600,
        color: DARK_THEME.text,
        margin: '0 0 12px',
      }}>
        Cluster Velocity (Last 24h)
      </h3>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ marginBottom: 8 }}>
        <defs>
          <linearGradient id="qpsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={dbColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={dbColor} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tpsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lighterColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lighterColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((val) => (
          <line
            key={`grid-${val}`}
            x1={padding}
            y1={height - padding - val * chartHeight}
            x2={width - padding}
            y2={height - padding - val * chartHeight}
            stroke={DARK_THEME.border}
            strokeWidth="1"
            strokeOpacity="0.3"
          />
        ))}

        {/* TPS Area */}
        <polygon points={tpsAreaPoints} fill="url(#tpsGrad)" stroke="none" />
        <polyline
          points={tpsPoints}
          fill="none"
          stroke={lighterColor}
          strokeWidth="2"
        />

        {/* QPS Area */}
        <polygon points={qpsAreaPoints} fill="url(#qpsGrad)" stroke="none" />
        <polyline
          points={qpsPoints}
          fill="none"
          stroke={dbColor}
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        <text x="15" y={height - padding + 4} fontSize="10" fill={DARK_THEME.textMuted} textAnchor="end">
          0
        </text>
        <text x="15" y={height - padding - chartHeight + 4} fontSize="10" fill={DARK_THEME.textMuted} textAnchor="end">
          {Math.round(maxQps)}
        </text>

        {/* X-axis labels */}
        {['0h', '6h', '12h', '18h', '24h'].map((label, idx) => (
          <text
            key={`x-${idx}`}
            x={padding + (idx / 4) * chartWidth}
            y={height - 10}
            fontSize="10"
            fill={DARK_THEME.textMuted}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>

      <div style={{
        display: 'flex',
        gap: 16,
        fontSize: 11,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 12,
            height: 2,
            background: dbColor,
          }} />
          <span style={{ color: DARK_THEME.textMuted }}>QPS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 12,
            height: 2,
            background: lighterColor,
          }} />
          <span style={{ color: DARK_THEME.textMuted }}>TPS</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* HEALTH DONUT GAUGE */
/* ═══════════════════════════════════════════════════════════════════════════ */

function HealthGauge({ health = 92, dbColor }) {
  const gaugeColor = health >= 90 ? DARK_THEME.success :
                     health >= 70 ? DARK_THEME.warning : DARK_THEME.danger;

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (health / 100) * circumference;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${DARK_THEME.card}aa 0%, rgba(22, 27, 34, 0.4) 100%)`,
      border: `1px solid ${DARK_THEME.border}`,
      borderRadius: 12,
      padding: '16px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
    }}>
      <h3 style={{
        fontSize: 13,
        fontWeight: 600,
        color: DARK_THEME.text,
        margin: '0 0 16px',
      }}>
        Overall Database Health
      </h3>

      <svg width="140" height="140" viewBox="0 0 140 140" style={{ marginBottom: 12 }}>
        {/* Background circle */}
        <circle cx="70" cy="70" r="45" fill="none" stroke={DARK_THEME.border} strokeWidth="8" />

        {/* Progress circle */}
        <circle
          cx="70"
          cy="70"
          r="45"
          fill="none"
          stroke={gaugeColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }}
        />

        {/* Center text */}
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="700" fill={gaugeColor}>
          {health}%
        </text>
        <text x="70" y="85" textAnchor="middle" fontSize="11" fill={DARK_THEME.textMuted}>
          Healthy
        </text>
      </svg>

      <div style={{
        fontSize: 11,
        color: DARK_THEME.textMuted,
      }}>
        {health >= 90 ? 'Excellent condition' : health >= 70 ? 'Monitor closely' : 'Critical attention needed'}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* TAB CARD COMPONENT */
/* ═══════════════════════════════════════════════════════════════════════════ */

function TabCard({ tab, dbColor }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${DARK_THEME.card}dd 0%, rgba(22, 27, 34, 0.6) 100%)`,
      border: `1px solid ${DARK_THEME.border}`,
      borderRadius: 10,
      padding: '14px',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = dbColor;
        e.currentTarget.style.boxShadow = `0 8px 20px rgba(0, 0, 0, 0.3), 0 0 20px ${dbColor}30`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = DARK_THEME.border;
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}>
      {/* Accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        background: `linear-gradient(90deg, ${dbColor} 0%, ${dbColor}40 100%)`,
      }} />

      {/* Title */}
      <h4 style={{
        fontSize: 13,
        fontWeight: 600,
        color: DARK_THEME.text,
        marginBottom: 12,
        marginTop: 0,
        padding: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {tab.name}
      </h4>

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tab.metrics.map((metric, idx) => (
          <div key={idx} style={{ fontSize: 12, color: DARK_THEME.textMuted }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 3,
            }}>
              <span>{metric.label}</span>
              <span style={{ color: dbColor, fontWeight: 600 }}>
                {metric.value} {metric.unit && <span style={{ color: DARK_THEME.textMuted }}>{metric.unit}</span>}
              </span>
            </div>
            <div style={{
              height: 3,
              background: DARK_THEME.border,
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(parseInt(metric.value) % 100, 95)}%`,
                background: `linear-gradient(90deg, ${dbColor}, ${dbColor}60)`,
                borderRadius: 2,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* SECTION CARD COMPONENT */
/* ═══════════════════════════════════════════════════════════════════════════ */

function SectionCard({ section, tabs, dbColor, isExpanded, onToggle }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${DARK_THEME.card}88 0%, rgba(22, 27, 34, 0.5) 100%)`,
      border: `1px solid ${DARK_THEME.border}`,
      borderRadius: 12,
      backdropFilter: 'blur(10px)',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    }}>
      {/* Section Header */}
      <div
        onClick={onToggle}
        style={{
          padding: '14px 16px',
          background: `linear-gradient(90deg, ${DARK_THEME.card} 0%, ${DARK_THEME.card}40 100%)`,
          borderBottom: `1px solid ${DARK_THEME.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `linear-gradient(90deg, ${DARK_THEME.card} 0%, ${DARK_THEME.card}60 100%)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `linear-gradient(90deg, ${DARK_THEME.card} 0%, ${DARK_THEME.card}40 100%)`;
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 4,
            height: 20,
            background: dbColor,
            borderRadius: 2,
          }} />
          <h3 style={{
            fontSize: 13,
            fontWeight: 700,
            color: DARK_THEME.text,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {section.name}
          </h3>
          <span style={{
            fontSize: 11,
            background: `${dbColor}30`,
            color: dbColor,
            padding: '2px 8px',
            borderRadius: 4,
            fontWeight: 600,
          }}>
            {tabs.length} tabs
          </span>
        </div>
        <div style={{
          transition: 'transform 0.2s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <ChevronDown size={18} color={dbColor} />
        </div>
      </div>

      {/* Section Content - Collapsible */}
      {isExpanded && (
        <div style={{
          padding: '16px',
          borderTop: `1px solid ${DARK_THEME.border}`,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {tabs.map((tab, idx) => (
              <TabCard key={idx} tab={tab} dbColor={dbColor} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* DATABASE DASHBOARD COMPONENT */
/* ═══════════════════════════════════════════════════════════════════════════ */

function DatabaseDashboard({ db }) {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const widgets = DETAIL_WIDGETS[Object.keys(DATABASE_STRUCTURE).find(key => DATABASE_STRUCTURE[key] === db)] || [];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* KPI Hero Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        {db.kpis.map((kpi, idx) => (
          <KPICard
            key={idx}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            status={kpi.status}
            sparkline={kpi.sparkline}
            dbColor={db.color}
          />
        ))}
      </div>

      {/* Detail Widgets Row */}
      {widgets.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}>
          {widgets.map((widget, idx) => {
            if (widget.type === 'backup') {
              return <BackupWidget key={idx} data={widget.data} dbColor={db.color} />;
            } else if (widget.type === 'transactions') {
              return <TransactionsWidget key={idx} data={widget.data} dbColor={db.color} />;
            } else if (widget.type === 'vacuum') {
              return <VacuumWidget key={idx} data={widget.data} dbColor={db.color} />;
            } else {
              return <GenericDetailWidget key={idx} widget={widget} dbColor={db.color} />;
            }
          })}
        </div>
      )}

      {/* Throughput Chart */}
      <ThroughputChart dbColor={db.color} />

      {/* Health Gauge */}
      <div style={{ marginBottom: 24 }}>
        <HealthGauge health={92} dbColor={db.color} />
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {db.sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            tabs={section.tabs}
            dbColor={db.color}
            isExpanded={expandedSections[section.id]}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function DemoDataTab({ dbKey = 'postgresql' }) {
  const currentDb = DATABASE_STRUCTURE[dbKey];
  if (!currentDb) return null;

  return (
    <div style={{
      background: DARK_THEME.bg,
      color: DARK_THEME.text,
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Page Title */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `linear-gradient(135deg, ${currentDb.color}30, ${currentDb.color}10)`,
          border: `1px solid ${currentDb.color}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <currentDb.icon size={22} style={{ color: currentDb.color }} />
        </div>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 700, margin: 0, color: DARK_THEME.text,
          }}>
            {currentDb.name} Overview
          </h1>
          <p style={{
            fontSize: 13, color: DARK_THEME.textMuted, margin: '2px 0 0',
          }}>
            Real-time monitoring dashboard with rich analytics
          </p>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        <DatabaseDashboard db={currentDb} />
      </div>
    </div>
  );
}
