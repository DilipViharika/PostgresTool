import { useState, useMemo } from 'react';
import {
  Database, Server, HardDrive, Cpu, Cloud,
  ChevronDown, ChevronRight, Activity, AlertTriangle,
  CheckCircle, XCircle, Search, TrendingUp
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────── */
/* DATABASE STRUCTURE CONFIGURATION */
/* ─────────────────────────────────────────────────────────────────────────── */

const DATABASE_STRUCTURE = {
  postgresql: {
    icon: Database,
    name: 'PostgreSQL',
    color: '#6495ED',
    sections: [
      {
        id: 'core',
        name: 'Core Monitoring',
        tabs: ['Overview', 'Performance', 'Resources', 'Reliability', 'Alerts']
      },
      {
        id: 'query',
        name: 'Query & Indexes',
        tabs: ['Query Optimizer', 'Indexes', 'Plan Regression', 'Bloat Analysis', 'Table Analysis']
      },
      {
        id: 'infra',
        name: 'Infrastructure',
        tabs: ['Connection Pool', 'Replication & WAL', 'Checkpoint Monitor', 'Vacuum & Maintenance', 'Capacity Planning', 'Backup & Recovery']
      },
      {
        id: 'schema',
        name: 'Schema & Security',
        tabs: ['Schema & Migrations', 'Schema Visualizer', 'Security & Compliance']
      },
      {
        id: 'observability',
        name: 'Observability',
        tabs: ['CloudWatch', 'Log Pattern Analysis', 'Alert Correlation', 'OpenTelemetry', 'Kubernetes', 'Status Page', 'AI Monitoring']
      },
      {
        id: 'dev',
        name: 'Developer Tools',
        tabs: ['SQL Console', 'API Tracing', 'Repository', 'AI Query Advisor']
      },
      {
        id: 'admin',
        name: 'Admin',
        tabs: ['DBA Task Scheduler', 'User Management', 'Admin', 'Data Retention', 'Terraform Export', 'Custom Dashboards']
      }
    ]
  },
  mysql: {
    icon: Database,
    name: 'MySQL',
    color: '#00B4D8',
    sections: [
      {
        id: 'core',
        name: 'Core Monitoring',
        tabs: ['Overview', 'Performance', 'Resources', 'Reliability', 'Alerts']
      },
      {
        id: 'query',
        name: 'Query & Indexes',
        tabs: ['Query Optimizer', 'Slow Query Log', 'Index Statistics', 'Query Cache Analysis']
      },
      {
        id: 'infra',
        name: 'Infrastructure',
        tabs: ['Connection Pool', 'InnoDB Engine', 'Replication Status', 'Binary Log', 'Buffer Pool']
      },
      {
        id: 'schema',
        name: 'Schema & Security',
        tabs: ['Schema Browser', 'User Privileges', 'Audit Log']
      },
      {
        id: 'observability',
        name: 'Observability',
        tabs: ['Performance Schema', 'Information Schema', 'Process List', 'Error Log Analysis']
      },
      {
        id: 'admin',
        name: 'Admin',
        tabs: ['Server Variables', 'Backup & Recovery', 'Import/Export', 'User Management']
      }
    ]
  },
  mssql: {
    icon: Server,
    name: 'SQL Server',
    color: '#F97316',
    sections: [
      {
        id: 'core',
        name: 'Core Monitoring',
        tabs: ['Overview', 'Performance', 'Resources', 'Reliability', 'Alerts']
      },
      {
        id: 'query',
        name: 'Query & Indexes',
        tabs: ['Query Store', 'Execution Plans', 'Index Tuning', 'Missing Indexes', 'Statistics']
      },
      {
        id: 'infra',
        name: 'Infrastructure',
        tabs: ['Connection Management', 'Always On AG', 'Transaction Log', 'TempDB', 'Buffer Management']
      },
      {
        id: 'schema',
        name: 'Schema & Security',
        tabs: ['Schema Explorer', 'Security Audit', 'Permissions Matrix']
      },
      {
        id: 'observability',
        name: 'Observability',
        tabs: ['Wait Statistics', 'Extended Events', 'Activity Monitor', 'DMV Explorer']
      },
      {
        id: 'admin',
        name: 'Admin',
        tabs: ['SQL Agent Jobs', 'Backup Strategy', 'Maintenance Plans', 'Server Configuration']
      }
    ]
  },
  oracle: {
    icon: HardDrive,
    name: 'Oracle',
    color: '#FF4560',
    sections: [
      {
        id: 'core',
        name: 'Core Monitoring',
        tabs: ['Overview', 'Performance', 'Resources', 'Reliability', 'Alerts']
      },
      {
        id: 'query',
        name: 'Query & Indexes',
        tabs: ['AWR Reports', 'SQL Tuning Advisor', 'Explain Plans', 'Index Analysis', 'Optimizer Stats']
      },
      {
        id: 'infra',
        name: 'Infrastructure',
        tabs: ['Tablespace Management', 'Redo Logs', 'Data Guard', 'RAC Monitor', 'Undo Management']
      },
      {
        id: 'schema',
        name: 'Schema & Security',
        tabs: ['Schema Objects', 'Privilege Audit', 'VPD Policies']
      },
      {
        id: 'observability',
        name: 'Observability',
        tabs: ['ASH Analytics', 'Alert Log', 'Trace Files', 'Enterprise Manager Bridge']
      },
      {
        id: 'admin',
        name: 'Admin',
        tabs: ['RMAN Backup', 'Scheduler Jobs', 'Data Pump', 'Patch Management']
      }
    ]
  },
  mongodb: {
    icon: Cloud,
    name: 'MongoDB',
    color: '#2EE89C',
    sections: [
      {
        id: 'overview',
        name: 'Overview',
        tabs: ['Executive Dashboard', 'Connection', 'Server Info', 'Databases', 'Collection Relationships']
      },
      {
        id: 'performance',
        name: 'Performance',
        tabs: ['Server Status', 'Real-time Ops', 'Latency Percentiles', 'Namespace Insights', 'Explain Plan', 'Active Operations', 'Slow Queries', 'Query Profiler', 'Query Cost Estimator', 'Lock Analysis', 'Anomaly Detection', 'Metrics Preview', 'Live Agent']
      },
      {
        id: 'storage',
        name: 'Storage',
        tabs: ['Index Advisor', 'Schema Analyzer', 'Collection Stats', 'WiredTiger Cache', 'Backup Monitor', 'Capacity Planning', 'Network']
      },
      {
        id: 'data',
        name: 'Data',
        tabs: ['Document Editor', 'Aggregation Builder', 'NL Query Generator', 'Import/Export', 'SQL Translator', 'Schema Compare', 'Geo-spatial']
      },
      {
        id: 'intelligence',
        name: 'Intelligence',
        tabs: ['AI Hints', 'Compare Clusters', 'Historical Trends', 'Perf Advisor v2', 'Trace Correlator']
      },
      {
        id: 'replication',
        name: 'Replication',
        tabs: ['Replica Set + Failover', 'Sharding', 'Oplog Tail']
      },
      {
        id: 'management',
        name: 'Management',
        tabs: ['Alert Manager', 'Prometheus Export', 'SSO/Auth', 'Atlas API Bridge', 'Dashboards', 'Reports', 'Audit Log', 'Users']
      }
    ]
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* SAMPLE METRICS DATA FOR EACH TAB */
/* ─────────────────────────────────────────────────────────────────────────── */

const TAB_METRICS = {
  postgresql: {
    'Overview': [
      { label: 'Active Connections', value: 42, unit: 'connections', status: 'ok' },
      { label: 'TPS', value: 1247, unit: 'tx/s', status: 'ok' },
      { label: 'Cache Hit Ratio', value: 99.2, unit: '%', status: 'ok' },
      { label: 'Database Size', value: '14.8 GB', unit: '', status: 'ok' },
      { label: 'Uptime', value: '47d 12h', unit: '', status: 'ok' }
    ],
    'Performance': [
      { label: 'Avg Query Time', value: 2.4, unit: 'ms', status: 'ok' },
      { label: 'Slow Queries', value: 3, unit: 'queries', status: 'warning' },
      { label: 'Deadlocks', value: 0, unit: 'count', status: 'ok' },
      { label: 'Lock Waits', value: 12, unit: 'waits', status: 'ok' },
      { label: 'Temp Files', value: '245 MB', unit: '', status: 'ok' }
    ],
    'Resources': [
      { label: 'CPU Usage', value: 34, unit: '%', status: 'ok' },
      { label: 'Memory Usage', value: 68, unit: '%', status: 'ok' },
      { label: 'Disk I/O Read', value: '125 MB/s', unit: '', status: 'ok' },
      { label: 'Disk I/O Write', value: '48 MB/s', unit: '', status: 'ok' },
      { label: 'Disk Usage', value: 67, unit: '%', status: 'ok' }
    ],
    'Reliability': [
      { label: 'Replication Lag', value: '2.1 MB', unit: '', status: 'ok' },
      { label: 'WAL Generation', value: '8.4 MB/s', unit: '', status: 'ok' },
      { label: 'Checkpoint Duration', value: '5.2s', unit: '', status: 'ok' },
      { label: 'Failed Transactions', value: 0, unit: 'count', status: 'ok' },
      { label: 'Backup Status', value: '12h ago', unit: '', status: 'ok' }
    ],
    'Alerts': [
      { label: 'Critical Alerts', value: 0, unit: 'count', status: 'ok' },
      { label: 'Warning Alerts', value: 2, unit: 'count', status: 'warning' },
      { label: 'Info Alerts', value: 8, unit: 'count', status: 'ok' },
      { label: 'Last Alert', value: '3m ago', unit: '', status: 'ok' },
      { label: 'Alert Suppressed', value: 1, unit: 'count', status: 'ok' }
    ],
    'Query Optimizer': [
      { label: 'Planned Queries', value: 1523, unit: 'queries', status: 'ok' },
      { label: 'Seq Scans', value: 34, unit: '%', status: 'warning' },
      { label: 'Index Usage', value: 92.1, unit: '%', status: 'ok' },
      { label: 'Plan Cache Size', value: '128 MB', unit: '', status: 'ok' },
      { label: 'Avg Plan Time', value: 1.8, unit: 'ms', status: 'ok' }
    ],
    'Indexes': [
      { label: 'Total Indexes', value: 487, unit: 'count', status: 'ok' },
      { label: 'Unused Indexes', value: 12, unit: 'count', status: 'warning' },
      { label: 'Invalid Indexes', value: 0, unit: 'count', status: 'ok' },
      { label: 'Index Size', value: '2.3 GB', unit: '', status: 'ok' },
      { label: 'Bloat Ratio', value: 5.2, unit: '%', status: 'ok' }
    ],
    'Plan Regression': [
      { label: 'Detected Regressions', value: 3, unit: 'queries', status: 'warning' },
      { label: 'Cost Increase', value: '15.4%', unit: '', status: 'warning' },
      { label: 'Execution Time Increase', value: '28ms', unit: '', status: 'warning' },
      { label: 'Last Regression', value: '2h ago', unit: '', status: 'ok' },
      { label: 'Auto-Fix Applied', value: 1, unit: 'count', status: 'ok' }
    ],
    'Bloat Analysis': [
      { label: 'Bloated Tables', value: 7, unit: 'tables', status: 'warning' },
      { label: 'Avg Bloat Ratio', value: 12.3, unit: '%', status: 'warning' },
      { label: 'Total Wasted Space', value: '856 MB', unit: '', status: 'warning' },
      { label: 'Vacuum Running', value: 0, unit: 'count', status: 'ok' },
      { label: 'Autovacuum Next', value: '2.5h', unit: '', status: 'ok' }
    ],
    'Table Analysis': [
      { label: 'Total Tables', value: 142, unit: 'tables', status: 'ok' },
      { label: 'Largest Table', value: '3.2 GB', unit: '', status: 'ok' },
      { label: 'Dead Tuple Ratio', value: 6.8, unit: '%', status: 'ok' },
      { label: 'Scans (24h)', value: 45823, unit: 'scans', status: 'ok' },
      { label: 'Sequential Scans', value: 234, unit: 'scans', status: 'ok' }
    ],
    'Connection Pool': [
      { label: 'Active Connections', value: 42, unit: 'connections', status: 'ok' },
      { label: 'Idle Connections', value: 18, unit: 'connections', status: 'ok' },
      { label: 'Max Connections', value: 100, unit: 'count', status: 'ok' },
      { label: 'Connection Rate', value: 145, unit: 'conn/min', status: 'ok' },
      { label: 'Rejected Connections', value: 0, unit: 'count', status: 'ok' }
    ],
    'Replication & WAL': [
      { label: 'Replication Lag', value: '2.1 MB', unit: '', status: 'ok' },
      { label: 'Replica Count', value: 2, unit: 'replicas', status: 'ok' },
      { label: 'Sync Replicas', value: 2, unit: 'replicas', status: 'ok' },
      { label: 'WAL Files', value: 47, unit: 'files', status: 'ok' },
      { label: 'WAL Archive Status', value: 'OK', unit: '', status: 'ok' }
    ],
    'Checkpoint Monitor': [
      { label: 'Checkpoint Duration', value: '5.2s', unit: '', status: 'ok' },
      { label: 'Checkpoints/Hour', value: 12, unit: 'checkpoints', status: 'ok' },
      { label: 'Buffer Flush Rate', value: '42 MB/s', unit: '', status: 'ok' },
      { label: 'Last Checkpoint', value: '3m ago', unit: '', status: 'ok' },
      { label: 'Checkpoint Progress', value: '100%', unit: '', status: 'ok' }
    ],
    'Vacuum & Maintenance': [
      { label: 'Active Vacuums', value: 0, unit: 'count', status: 'ok' },
      { label: 'Scheduled Vacuums', value: 3, unit: 'count', status: 'ok' },
      { label: 'Analyze Operations', value: 5, unit: 'count', status: 'ok' },
      { label: 'Dead Tuples', value: '2.3M', unit: '', status: 'ok' },
      { label: 'Next Vacuum', value: '1.2h', unit: '', status: 'ok' }
    ],
    'Capacity Planning': [
      { label: 'Database Growth', value: '2.3 GB/month', unit: '', status: 'ok' },
      { label: 'Estimated Full Date', value: '18 months', unit: '', status: 'ok' },
      { label: 'Current Capacity', value: '45%', unit: '%', status: 'ok' },
      { label: 'Avg Daily Growth', value: '76 MB', unit: '', status: 'ok' },
      { label: 'Storage Health', value: 'Good', unit: '', status: 'ok' }
    ],
    'Backup & Recovery': [
      { label: 'Last Backup', value: '12h ago', unit: '', status: 'ok' },
      { label: 'Backup Size', value: '14.2 GB', unit: '', status: 'ok' },
      { label: 'Recovery Time', value: '45m', unit: '', status: 'ok' },
      { label: 'Backup Status', value: 'Healthy', unit: '', status: 'ok' },
      { label: 'Incremental Backups', value: 144, unit: 'count', status: 'ok' }
    ],
    'Schema & Migrations': [
      { label: 'Schema Objects', value: 1205, unit: 'objects', status: 'ok' },
      { label: 'Pending Migrations', value: 0, unit: 'count', status: 'ok' },
      { label: 'Failed Migrations', value: 0, unit: 'count', status: 'ok' },
      { label: 'Schema Size', value: '8.4 GB', unit: '', status: 'ok' },
      { label: 'Last Migration', value: '2d ago', unit: '', status: 'ok' }
    ],
    'Schema Visualizer': [
      { label: 'Tables Visualized', value: 142, unit: 'tables', status: 'ok' },
      { label: 'Foreign Keys', value: 287, unit: 'keys', status: 'ok' },
      { label: 'Relationships', value: 312, unit: 'relations', status: 'ok' },
      { label: 'Circular References', value: 0, unit: 'count', status: 'ok' },
      { label: 'Orphaned Tables', value: 2, unit: 'tables', status: 'warning' }
    ],
    'Security & Compliance': [
      { label: 'Security Alerts', value: 0, unit: 'count', status: 'ok' },
      { label: 'Failed Login Attempts', value: 2, unit: 'attempts', status: 'ok' },
      { label: 'Audit Events', value: '12.4K', unit: 'events', status: 'ok' },
      { label: 'Compliance Status', value: 'Pass', unit: '', status: 'ok' },
      { label: 'Last Audit', value: '7d ago', unit: '', status: 'ok' }
    ],
    'CloudWatch': [
      { label: 'Metrics Collected', value: 147, unit: 'metrics', status: 'ok' },
      { label: 'Data Points', value: '2.3M', unit: 'points', status: 'ok' },
      { label: 'Alarms Active', value: 3, unit: 'alarms', status: 'warning' },
      { label: 'Log Groups', value: 8, unit: 'groups', status: 'ok' },
      { label: 'Storage Used', value: '2.1 GB', unit: '', status: 'ok' }
    ],
    'Log Pattern Analysis': [
      { label: 'Patterns Found', value: 34, unit: 'patterns', status: 'ok' },
      { label: 'Anomalies Detected', value: 5, unit: 'anomalies', status: 'warning' },
      { label: 'Log Size', value: '842 MB', unit: '', status: 'ok' },
      { label: 'Parsing Rate', value: '125K lines/min', unit: '', status: 'ok' },
      { label: 'Error Patterns', value: 8, unit: 'patterns', status: 'ok' }
    ],
    'Alert Correlation': [
      { label: 'Correlated Events', value: 12, unit: 'events', status: 'ok' },
      { label: 'Root Causes Found', value: 3, unit: 'causes', status: 'ok' },
      { label: 'False Positives', value: 1, unit: 'count', status: 'ok' },
      { label: 'Alert Grouping', value: '92%', unit: '%', status: 'ok' },
      { label: 'MTTR', value: '8.3m', unit: '', status: 'ok' }
    ],
    'OpenTelemetry': [
      { label: 'Spans Collected', value: '4.2M', unit: 'spans', status: 'ok' },
      { label: 'Traces Sampled', value: '89%', unit: '%', status: 'ok' },
      { label: 'Metrics Exported', value: 284, unit: 'metrics', status: 'ok' },
      { label: 'Export Latency', value: '42ms', unit: '', status: 'ok' },
      { label: 'Instrumentation', value: 'Complete', unit: '', status: 'ok' }
    ],
    'Kubernetes': [
      { label: 'Pods Running', value: 5, unit: 'pods', status: 'ok' },
      { label: 'Replicas Ready', value: 5, unit: 'replicas', status: 'ok' },
      { label: 'CPU Usage', value: '2.4 cores', unit: '', status: 'ok' },
      { label: 'Memory Usage', value: '4.8 GB', unit: '', status: 'ok' },
      { label: 'Node Status', value: 'Healthy', unit: '', status: 'ok' }
    ],
    'Status Page': [
      { label: 'Status', value: 'Operational', unit: '', status: 'ok' },
      { label: 'Uptime', value: '99.98%', unit: '%', status: 'ok' },
      { label: 'Last Incident', value: '8d ago', unit: '', status: 'ok' },
      { label: 'Response Time', value: '142ms', unit: '', status: 'ok' },
      { label: 'Page Views', value: '12.4K', unit: 'views', status: 'ok' }
    ],
    'AI Monitoring': [
      { label: 'AI Models Active', value: 3, unit: 'models', status: 'ok' },
      { label: 'Anomaly Score', value: '0.12', unit: '', status: 'ok' },
      { label: 'Predictions Accuracy', value: '94.2%', unit: '%', status: 'ok' },
      { label: 'Insights Generated', value: 127, unit: 'insights', status: 'ok' },
      { label: 'Recommendations', value: 8, unit: 'recommendations', status: 'ok' }
    ],
    'SQL Console': [
      { label: 'Queries Executed', value: 1847, unit: 'queries', status: 'ok' },
      { label: 'Execution Time', value: '245ms', unit: '', status: 'ok' },
      { label: 'Avg Row Time', value: '0.8ms', unit: '', status: 'ok' },
      { label: 'Active Sessions', value: 2, unit: 'sessions', status: 'ok' },
      { label: 'Saved Queries', value: 34, unit: 'queries', status: 'ok' }
    ],
    'API Tracing': [
      { label: 'API Calls (24h)', value: '2.3M', unit: 'calls', status: 'ok' },
      { label: 'Avg Response Time', value: '125ms', unit: '', status: 'ok' },
      { label: 'Error Rate', value: '0.02%', unit: '%', status: 'ok' },
      { label: 'Slowest Endpoint', value: '/api/analytics', unit: '', status: 'ok' },
      { label: 'Throttled Requests', value: 23, unit: 'requests', status: 'ok' }
    ],
    'Repository': [
      { label: 'Objects', value: 4.2M, unit: 'objects', status: 'ok' },
      { label: 'Size', value: '18.4 GB', unit: '', status: 'ok' },
      { label: 'Commits', value: '127K', unit: 'commits', status: 'ok' },
      { label: 'Branches', value: 156, unit: 'branches', status: 'ok' },
      { label: 'Tags', value: 87, unit: 'tags', status: 'ok' }
    ],
    'AI Query Advisor': [
      { label: 'Queries Analyzed', value: 1523, unit: 'queries', status: 'ok' },
      { label: 'Optimizations Found', value: 47, unit: 'optimizations', status: 'ok' },
      { label: 'Performance Gain', value: '34.2%', unit: '%', status: 'ok' },
      { label: 'Implemented Suggestions', value: 12, unit: 'suggestions', status: 'ok' },
      { label: 'Accuracy', value: '96.8%', unit: '%', status: 'ok' }
    ],
    'DBA Task Scheduler': [
      { label: 'Scheduled Tasks', value: 28, unit: 'tasks', status: 'ok' },
      { label: 'Completed Today', value: 24, unit: 'tasks', status: 'ok' },
      { label: 'Failed Tasks', value: 0, unit: 'count', status: 'ok' },
      { label: 'Avg Execution', value: '8.3m', unit: '', status: 'ok' },
      { label: 'Next Task', value: 'in 15m', unit: '', status: 'ok' }
    ],
    'User Management': [
      { label: 'Active Users', value: 42, unit: 'users', status: 'ok' },
      { label: 'Total Users', value: 156, unit: 'users', status: 'ok' },
      { label: 'Admin Users', value: 5, unit: 'users', status: 'ok' },
      { label: 'Inactive Users', value: 8, unit: 'users', status: 'ok' },
      { label: 'New Users (30d)', value: 12, unit: 'users', status: 'ok' }
    ],
    'Admin': [
      { label: 'Configuration Items', value: 245, unit: 'items', status: 'ok' },
      { label: 'Modified (24h)', value: 3, unit: 'changes', status: 'ok' },
      { label: 'Backup Status', value: 'Healthy', unit: '', status: 'ok' },
      { label: 'License Status', value: 'Valid', unit: '', status: 'ok' },
      { label: 'Support Level', value: 'Premium', unit: '', status: 'ok' }
    ],
    'Data Retention': [
      { label: 'Retention Policies', value: 12, unit: 'policies', status: 'ok' },
      { label: 'Data Purged', value: '342 GB', unit: '', status: 'ok' },
      { label: 'Compliance Status', value: 'Pass', unit: '', status: 'ok' },
      { label: 'Data Age (max)', value: '7 years', unit: '', status: 'ok' },
      { label: 'Retention Score', value: '98.2%', unit: '%', status: 'ok' }
    ],
    'Terraform Export': [
      { label: 'Exportable Resources', value: 847, unit: 'resources', status: 'ok' },
      { label: 'Last Export', value: '2h ago', unit: '', status: 'ok' },
      { label: 'Export Size', value: '12.4 MB', unit: '', status: 'ok' },
      { label: 'Modules', value: 23, unit: 'modules', status: 'ok' },
      { label: 'Validation Status', value: 'Pass', unit: '', status: 'ok' }
    ],
    'Custom Dashboards': [
      { label: 'Dashboards Created', value: 18, unit: 'dashboards', status: 'ok' },
      { label: 'Widgets Used', value: 156, unit: 'widgets', status: 'ok' },
      { label: 'Shared Dashboards', value: 8, unit: 'dashboards', status: 'ok' },
      { label: 'View Count (30d)', value: '4.2K', unit: 'views', status: 'ok' },
      { label: 'Avg Load Time', value: '523ms', unit: '', status: 'ok' }
    ]
  },
  mysql: {
    'Overview': [
      { label: 'Active Connections', value: 38, unit: 'connections', status: 'ok' },
      { label: 'Queries/sec', value: 2145, unit: 'q/s', status: 'ok' },
      { label: 'Cache Hit Ratio', value: 97.8, unit: '%', status: 'ok' },
      { label: 'Database Size', value: '22.4 GB', unit: '', status: 'ok' },
      { label: 'Uptime', value: '32d 8h', unit: '', status: 'ok' }
    ],
    'Performance': [
      { label: 'Avg Query Time', value: 1.8, unit: 'ms', status: 'ok' },
      { label: 'Slow Queries', value: 5, unit: 'queries', status: 'warning' },
      { label: 'Lock Waits', value: 8, unit: 'waits', status: 'ok' },
      { label: 'Replication Lag', value: '0.2s', unit: '', status: 'ok' },
      { label: 'InnoDB Buffer Hit', value: 98.4, unit: '%', status: 'ok' }
    ],
    'Resources': [
      { label: 'CPU Usage', value: 42, unit: '%', status: 'ok' },
      { label: 'Memory Usage', value: 72, unit: '%', status: 'ok' },
      { label: 'Disk Read Rate', value: '98 MB/s', unit: '', status: 'ok' },
      { label: 'Disk Write Rate', value: '52 MB/s', unit: '', status: 'ok' },
      { label: 'Open Files', value: 847, unit: 'files', status: 'ok' }
    ],
    'Reliability': [
      { label: 'Failed Transactions', value: 0, unit: 'count', status: 'ok' },
      { label: 'Aborted Connections', value: 3, unit: 'connections', status: 'ok' },
      { label: 'Deadlocks', value: 0, unit: 'count', status: 'ok' },
      { label: 'Backup Status', value: 'OK', unit: '', status: 'ok' },
      { label: 'Binary Log Size', value: '1.2 GB', unit: '', status: 'ok' }
    ],
    'Alerts': [
      { label: 'Critical Alerts', value: 0, unit: 'count', status: 'ok' },
      { label: 'Warning Alerts', value: 1, unit: 'count', status: 'warning' },
      { label: 'Info Alerts', value: 5, unit: 'count', status: 'ok' },
      { label: 'Last Alert', value: '5m ago', unit: '', status: 'ok' },
      { label: 'Alert Frequency', value: '2/hour', unit: '', status: 'ok' }
    ],
    'Query Optimizer': [
      { label: 'Queries Cached', value: 89.2, unit: '%', status: 'ok' },
      { label: 'Full Table Scans', value: 24, unit: 'scans', status: 'warning' },
      { label: 'Query Hits', value: '1.2M', unit: 'hits', status: 'ok' },
      { label: 'Cache Size', value: '256 MB', unit: '', status: 'ok' },
      { label: 'Avg Query Cost', value: '4.2', unit: '', status: 'ok' }
    ],
    'Slow Query Log': [
      { label: 'Slow Queries (24h)', value: 34, unit: 'queries', status: 'warning' },
      { label: 'Slowest Query', value: '8.3s', unit: '', status: 'warning' },
      { label: 'Log Entries', value: '12.4K', unit: 'entries', status: 'ok' },
      { label: 'Threshold', value: '0.5s', unit: '', status: 'ok' },
      { label: 'Avg Duration', value: '2.1s', unit: '', status: 'ok' }
    ],
    'Index Statistics': [
      { label: 'Total Indexes', value: 342, unit: 'indexes', status: 'ok' },
      { label: 'Unused Indexes', value: 8, unit: 'indexes', status: 'warning' },
      { label: 'Duplicate Indexes', value: 3, unit: 'indexes', status: 'warning' },
      { label: 'Index Size', value: '4.2 GB', unit: '', status: 'ok' },
      { label: 'Fragmentation', value: '8.7%', unit: '%', status: 'ok' }
    ],
    'Query Cache Analysis': [
      { label: 'Cache Hit Ratio', value: 87.6, unit: '%', status: 'ok' },
      { label: 'Cache Size', value: '256 MB', unit: '', status: 'ok' },
      { label: 'Cache Used', value: '198 MB', unit: '', status: 'ok' },
      { label: 'Evictions', value: 234, unit: 'evictions', status: 'ok' },
      { label: 'Fragmentation', value: '12.3%', unit: '%', status: 'ok' }
    ],
    'Connection Pool': [
      { label: 'Active Threads', value: 38, unit: 'threads', status: 'ok' },
      { label: 'Cached Threads', value: 12, unit: 'threads', status: 'ok' },
      { label: 'Max Connections', value: 200, unit: 'count', status: 'ok' },
      { label: 'Connection Creates', value: '12/min', unit: '', status: 'ok' },
      { label: 'Rejected', value: 0, unit: 'count', status: 'ok' }
    ],
    'InnoDB Engine': [
      { label: 'InnoDB Tables', value: 287, unit: 'tables', status: 'ok' },
      { label: 'Buffer Pool Size', value: '8 GB', unit: '', status: 'ok' },
      { label: 'Buffer Pool Hit', value: 98.4, unit: '%', status: 'ok' },
      { label: 'Data Reads/sec', value: 234, unit: 'reads', status: 'ok' },
      { label: 'Data Writes/sec', value: 142, unit: 'writes', status: 'ok' }
    ],
    'Replication Status': [
      { label: 'Replication Lag', value: '0.2s', unit: '', status: 'ok' },
      { label: 'Slave Status', value: 'Running', unit: '', status: 'ok' },
      { label: 'Relay Log Size', value: '512 MB', unit: '', status: 'ok' },
      { label: 'Seconds Behind', value: 0, unit: 'seconds', status: 'ok' },
      { label: 'Last Error', value: 'None', unit: '', status: 'ok' }
    ],
    'Binary Log': [
      { label: 'Binlog Files', value: 24, unit: 'files', status: 'ok' },
      { label: 'Binlog Size', value: '1.2 GB', unit: '', status: 'ok' },
      { label: 'Write Rate', value: '8.4 MB/min', unit: '', status: 'ok' },
      { label: 'Format', value: 'ROW', unit: '', status: 'ok' },
      { label: 'Retention', value: '7 days', unit: '', status: 'ok' }
    ],
    'Buffer Pool': [
      { label: 'Total Size', value: '8 GB', unit: '', status: 'ok' },
      { label: 'Used Size', value: '6.8 GB', unit: '', status: 'ok' },
      { label: 'Hit Ratio', value: 98.4, unit: '%', status: 'ok' },
      { label: 'Dirty Pages', value: '8.2%', unit: '%', status: 'ok' },
      { label: 'Evictions/sec', value: 0.3, unit: 'evictions', status: 'ok' }
    ],
    'Schema Browser': [
      { label: 'Databases', value: 12, unit: 'databases', status: 'ok' },
      { label: 'Tables', value: 487, unit: 'tables', status: 'ok' },
      { label: 'Views', value: 34, unit: 'views', status: 'ok' },
      { label: 'Stored Procedures', value: 42, unit: 'procedures', status: 'ok' },
      { label: 'Triggers', value: 28, unit: 'triggers', status: 'ok' }
    ],
    'User Privileges': [
      { label: 'Total Users', value: 34, unit: 'users', status: 'ok' },
      { label: 'Active Users', value: 28, unit: 'users', status: 'ok' },
      { label: 'Admin Accounts', value: 3, unit: 'accounts', status: 'ok' },
      { label: 'Privilege Changes', value: 2, unit: 'changes', status: 'ok' },
      { label: 'Expired Passwords', value: 0, unit: 'accounts', status: 'ok' }
    ],
    'Audit Log': [
      { label: 'Audit Events (24h)', value: '8.2K', unit: 'events', status: 'ok' },
      { label: 'Failed Logins', value: 5, unit: 'attempts', status: 'ok' },
      { label: 'Schema Changes', value: 3, unit: 'changes', status: 'ok' },
      { label: 'Privilege Changes', value: 2, unit: 'changes', status: 'ok' },
      { label: 'Data Changes', value: '45K', unit: 'changes', status: 'ok' }
    ],
    'Performance Schema': [
      { label: 'Events Tracked', value: 284, unit: 'events', status: 'ok' },
      { label: 'Consumers Enabled', value: 18, unit: 'consumers', status: 'ok' },
      { label: 'Tables Monitored', value: 487, unit: 'tables', status: 'ok' },
      { label: 'Wait Events', value: '234K', unit: 'events', status: 'ok' },
      { label: 'Data Size', value: '1.2 GB', unit: '', status: 'ok' }
    ],
    'Information Schema': [
      { label: 'Schema Objects', value: 847, unit: 'objects', status: 'ok' },
      { label: 'Query Time', value: '245ms', unit: '', status: 'ok' },
      { label: 'Last Refresh', value: '5m ago', unit: '', status: 'ok' },
      { label: 'Indexing Status', value: '100%', unit: '%', status: 'ok' },
      { label: 'Cache Hit', value: '96.2%', unit: '%', status: 'ok' }
    ],
    'Process List': [
      { label: 'Active Processes', value: 38, unit: 'processes', status: 'ok' },
      { label: 'Longest Query', value: '4.2s', unit: '', status: 'ok' },
      { label: 'Locked Processes', value: 1, unit: 'processes', status: 'ok' },
      { label: 'Sleeping Processes', value: 12, unit: 'processes', status: 'ok' },
      { label: 'Command Count', value: 8, unit: 'commands', status: 'ok' }
    ],
    'Error Log Analysis': [
      { label: 'Errors (24h)', value: 12, unit: 'errors', status: 'warning' },
      { label: 'Warnings', value: 34, unit: 'warnings', status: 'ok' },
      { label: 'Info Messages', value: '245', unit: 'messages', status: 'ok' },
      { label: 'Error Rate', value: '0.08%', unit: '%', status: 'ok' },
      { label: 'Last Error', value: '2h ago', unit: '', status: 'ok' }
    ],
    'Server Variables': [
      { label: 'Total Variables', value: 524, unit: 'variables', status: 'ok' },
      { label: 'Modified', value: 47, unit: 'variables', status: 'ok' },
      { label: 'Default Values', value: 477, unit: 'variables', status: 'ok' },
      { label: 'Changes (24h)', value: 3, unit: 'changes', status: 'ok' },
      { label: 'Validation Status', value: 'Pass', unit: '', status: 'ok' }
    ],
    'Backup & Recovery': [
      { label: 'Last Backup', value: '8h ago', unit: '', status: 'ok' },
      { label: 'Backup Size', value: '18.2 GB', unit: '', status: 'ok' },
      { label: 'Recovery Time', value: '32m', unit: '', status: 'ok' },
      { label: 'Incremental Backups', value: 126, unit: 'backups', status: 'ok' },
      { label: 'Backup Status', value: 'Healthy', unit: '', status: 'ok' }
    ],
    'Import/Export': [
      { label: 'Last Import', value: '3d ago', unit: '', status: 'ok' },
      { label: 'Last Export', value: '1d ago', unit: '', status: 'ok' },
      { label: 'Exported Size', value: '12.4 GB', unit: '', status: 'ok' },
      { label: 'Import Success Rate', value: '100%', unit: '%', status: 'ok' },
      { label: 'Scheduled Jobs', value: 4, unit: 'jobs', status: 'ok' }
    ],
    'User Management': [
      { label: 'Total Users', value: 34, unit: 'users', status: 'ok' },
      { label: 'Active Users', value: 28, unit: 'users', status: 'ok' },
      { label: 'Admin Users', value: 3, unit: 'users', status: 'ok' },
      { label: 'Inactive (30d)', value: 4, unit: 'users', status: 'ok' },
      { label: 'New Users', value: 2, unit: 'users', status: 'ok' }
    ]
  },
  mssql: {
    'Overview': [
      { label: 'User Connections', value: 45, unit: 'connections', status: 'ok' },
      { label: 'Batch Requests/sec', value: 1842, unit: 'req/s', status: 'ok' },
      { label: 'Buffer Cache Hit', value: 98.7, unit: '%', status: 'ok' },
      { label: 'Database Size', value: '34.2 GB', unit: '', status: 'ok' },
      { label: 'Uptime', value: '21d 14h', unit: '', status: 'ok' }
    ],
    'Performance': [
      { label: 'Avg Query Time', value: 3.2, unit: 'ms', status: 'ok' },
      { label: 'Blocked Processes', value: 0, unit: 'count', status: 'ok' },
      { label: 'Lock Waits/sec', value: 12, unit: 'waits', status: 'ok' },
      { label: 'Page Life Expectancy', value: 8742, unit: 'seconds', status: 'ok' },
      { label: 'Full Scans/sec', value: 18, unit: 'scans', status: 'ok' }
    ],
    'Resources': [
      { label: 'CPU Usage', value: 38, unit: '%', status: 'ok' },
      { label: 'Memory Usage', value: 74, unit: '%', status: 'ok' },
      { label: 'Disk Read I/O', value: '112 MB/s', unit: '', status: 'ok' },
      { label: 'Disk Write I/O', value: '64 MB/s', unit: '', status: 'ok' },
      { label: 'Worker Threads', value: 184, unit: 'threads', status: 'ok' }
    ],
    'Reliability': [
      { label: 'Deadlocks/sec', value: 0, unit: 'count', status: 'ok' },
      { label: 'Failed Jobs', value: 0, unit: 'count', status: 'ok' },
      { label: 'Backup Status', value: 'Success', unit: '', status: 'ok' },
      { label: 'Log Send Queue', value: '0 bytes', unit: '', status: 'ok' },
      { label: 'Replication Lag', value: '0s', unit: '', status: 'ok' }
    ],
    'Alerts': [
      { label: 'Critical Alerts', value: 0, unit: 'count', status: 'ok' },
      { label: 'Warning Alerts', value: 2, unit: 'count', status: 'warning' },
      { label: 'Info Alerts', value: 6, unit: 'count', status: 'ok' },
      { label: 'Last Alert', value: '1h ago', unit: '', status: 'ok' },
      { label: 'Alert Policy', value: 'Active', unit: '', status: 'ok' }
    ],
    'Query Store': [
      { label: 'Tracked Queries', value: 2847, unit: 'queries', status: 'ok' },
      { label: 'Store Size', value: '542 MB', unit: '', status: 'ok' },
      { label: 'Compilation Cost', value: '2.4%', unit: '%', status: 'ok' },
      { label: 'Avg Duration', value: '2.8ms', unit: '', status: 'ok' },
      { label: 'Top Query', value: 'stored_proc_1', unit: '', status: 'ok' }
    ],
    'Execution Plans': [
      { label: 'Plans Cached', value: 1247, unit: 'plans', status: 'ok' },
      { label: 'Cache Size', value: '384 MB', unit: '', status: 'ok' },
      { label: 'Cache Hit Rate', value: 96.8, unit: '%', status: 'ok' },
      { label: 'Plan Recompiles', value: 23, unit: 'recompiles', status: 'ok' },
      { label: 'Missing Plans', value: 0, unit: 'count', status: 'ok' }
    ],
    'Index Tuning': [
      { label: 'Recommended Indexes', value: 12, unit: 'indexes', status: 'warning' },
      { label: 'Unused Indexes', value: 8, unit: 'indexes', status: 'warning' },
      { label: 'Fragmented Indexes', value: 5, unit: 'indexes', status: 'warning' },
      { label: 'Avg Fragmentation', value: 14.2, unit: '%', status: 'warning' },
      { label: 'Maintenance Status', value: 'Pending', unit: '', status: 'warning' }
    ],
    'Missing Indexes': [
      { label: 'Missing Indexes', value: 12, unit: 'indexes', status: 'warning' },
      { label: 'Potential Gain', value: '34.2%', unit: '%', status: 'warning' },
      { label: 'Impact Score', value: '87.3', unit: 'score', status: 'ok' },
      { label: 'High Impact', value: 3, unit: 'indexes', status: 'warning' },
      { label: 'Last Updated', value: '2h ago', unit: '', status: 'ok' }
    ],
    'Statistics': [
      { label: 'Total Statistics', value: 1842, unit: 'statistics', status: 'ok' },
      { label: 'Outdated Stats', value: 47, unit: 'statistics', status: 'warning' },
      { label: 'Auto Update', value: 'Enabled', unit: '', status: 'ok' },
      { label: 'Last Update', value: '30m ago', unit: '', status: 'ok' },
      { label: 'Update Frequency', value: '4/hour', unit: '', status: 'ok' }
    ],
    'Connection Management': [
      { label: 'Active Connections', value: 45, unit: 'connections', status: 'ok' },
      { label: 'Idle Connections', value: 8, unit: 'connections', status: 'ok' },
      { label: 'Max Connections', value: 100, unit: 'count', status: 'ok' },
      { label: 'Connection Rate', value: '123/min', unit: '', status: 'ok' },
      { label: 'Rejected', value: 0, unit: 'count', status: 'ok' }
    ],
    'Always On AG': [
      { label: 'Replicas', value: 2, unit: 'replicas', status: 'ok' },
      { label: 'Sync Status', value: 'Synchronized', unit: '', status: 'ok' },
      { label: 'Lag Time', value: '0ms', unit: '', status: 'ok' },
      { label: 'Health Status', value: 'Healthy', unit: '', status: 'ok' },
      { label: 'Failover Time', value: '45s', unit: '', status: 'ok' }
    ],
    'Transaction Log': [
      { label: 'Log Size', value: '2.4 GB', unit: '', status: 'ok' },
      { label: 'Log Used %', value: 38, unit: '%', status: 'ok' },
      { label: 'VLF Count', value: 847, unit: 'VLFs', status: 'ok' },
      { label: 'Flush Rate', value: '234/sec', unit: '', status: 'ok' },
      { label: 'Growth Rate', value: '128 MB/hour', unit: '', status: 'ok' }
    ],
    'TempDB': [
      { label: 'TempDB Size', value: '1.8 GB', unit: '', status: 'ok' },
      { label: 'Version Store', value: '342 MB', unit: '', status: 'ok' },
      { label: 'User Objects', value: '456 MB', unit: '', status: 'ok' },
      { label: 'Internal Objects', value: '284 MB', unit: '', status: 'ok' },
      { label: 'Contention', value: 'Low', unit: '', status: 'ok' }
    ],
    'Buffer Management': [
      { label: 'Total Buffer', value: '12 GB', unit: '', status: 'ok' },
      { label: 'Used Buffer', value: '8.9 GB', unit: '', status: 'ok' },
      { label: 'Cache Hit Rate', value: 98.7, unit: '%', status: 'ok' },
      { label: 'Lazy Writes/sec', value: 34, unit: 'writes', status: 'ok' },
      { label: 'Checkpoint Pages', value: '234/sec', unit: '', status: 'ok' }
    ],
    'Schema Explorer': [
      { label: 'Databases', value: 8, unit: 'databases', status: 'ok' },
      { label: 'Tables', value: 547, unit: 'tables', status: 'ok' },
      { label: 'Views', value: 28, unit: 'views', status: 'ok' },
      { label: 'Stored Procedures', value: 184, unit: 'procedures', status: 'ok' },
      { label: 'Functions', value: 42, unit: 'functions', status: 'ok' }
    ],
    'Security Audit': [
      { label: 'Security Events', value: '3.2K', unit: 'events', status: 'ok' },
      { label: 'Failed Logins', value: 8, unit: 'attempts', status: 'ok' },
      { label: 'Privilege Changes', value: 3, unit: 'changes', status: 'ok' },
      { label: 'Database Changes', value: 5, unit: 'changes', status: 'ok' },
      { label: 'Compliance Status', value: 'Pass', unit: '', status: 'ok' }
    ],
    'Permissions Matrix': [
      { label: 'Database Users', value: 28, unit: 'users', status: 'ok' },
      { label: 'Roles Defined', value: 12, unit: 'roles', status: 'ok' },
      { label: 'Excessive Permissions', value: 2, unit: 'users', status: 'warning' },
      { label: 'Orphaned Users', value: 0, unit: 'users', status: 'ok' },
      { label: 'Audit Coverage', value: '98.2%', unit: '%', status: 'ok' }
    ],
    'Wait Statistics': [
      { label: 'Top Wait Type', value: 'CPU', unit: '', status: 'ok' },
      { label: 'CPU Wait %', value: 42.3, unit: '%', status: 'ok' },
      { label: 'Lock Waits', value: 12.1, unit: '%', status: 'ok' },
      { label: 'I/O Waits', value: 8.4, unit: '%', status: 'ok' },
      { label: 'Other Waits', value: 37.2, unit: '%', status: 'ok' }
    ],
    'Extended Events': [
      { label: 'Sessions Created', value: 6, unit: 'sessions', status: 'ok' },
      { label: 'Events Captured', value: '2.4M', unit: 'events', status: 'ok' },
      { label: 'Storage Used', value: '542 MB', unit: '', status: 'ok' },
      { label: 'Capture Rate', value: '45K/sec', unit: '', status: 'ok' },
      { label: 'Session Status', value: 'Running', unit: '', status: 'ok' }
    ],
    'Activity Monitor': [
      { label: 'Active Sessions', value: 45, unit: 'sessions', status: 'ok' },
      { label: 'Longest Query', value: '5.2s', unit: '', status: 'ok' },
      { label: 'Blocked Sessions', value: 0, unit: 'sessions', status: 'ok' },
      { label: 'Waiting Processes', value: 2, unit: 'processes', status: 'ok' },
      { label: 'Data Read/sec', value: '45 MB/s', unit: '', status: 'ok' }
    ],
    'DMV Explorer': [
      { label: 'Views Available', value: 287, unit: 'views', status: 'ok' },
      { label: 'Query Performance', value: '234ms', unit: '', status: 'ok' },
      { label: 'Indexed Views', value: 184, unit: 'views', status: 'ok' },
      { label: 'Data Freshness', value: 'Current', unit: '', status: 'ok' },
      { label: 'Memory Used', value: '287 MB', unit: '', status: 'ok' }
    ],
    'SQL Agent Jobs': [
      { label: 'Total Jobs', value: 24, unit: 'jobs', status: 'ok' },
      { label: 'Successful', value: 24, unit: 'jobs', status: 'ok' },
      { label: 'Failed', value: 0, unit: 'jobs', status: 'ok' },
      { label: 'Avg Duration', value: '4.2m', unit: '', status: 'ok' },
      { label: 'Next Execution', value: 'in 15m', unit: '', status: 'ok' }
    ],
    'Backup Strategy': [
      { label: 'Last Backup', value: '6h ago', unit: '', status: 'ok' },
      { label: 'Backup Size', value: '28.4 GB', unit: '', status: 'ok' },
      { label: 'Backup Type', value: 'Full + Diff', unit: '', status: 'ok' },
      { label: 'Recovery Time', value: '38m', unit: '', status: 'ok' },
      { label: 'Backup Status', value: 'Healthy', unit: '', status: 'ok' }
    ],
    'Maintenance Plans': [
      { label: 'Active Plans', value: 5, unit: 'plans', status: 'ok' },
      { label: 'Success Rate', value: '100%', unit: '%', status: 'ok' },
      { label: 'Avg Runtime', value: '12.3m', unit: '', status: 'ok' },
      { label: 'Last Run', value: '2h ago', unit: '', status: 'ok' },
      { label: 'Next Maintenance', value: 'in 6h', unit: '', status: 'ok' }
    ],
    'Server Configuration': [
      { label: 'Config Options', value: 68, unit: 'options', status: 'ok' },
      { label: 'Modified', value: 12, unit: 'options', status: 'ok' },
      { label: 'Requires Restart', value: 0, unit: 'options', status: 'ok' },
      { label: 'Advanced Options', value: 'Enabled', unit: '', status: 'ok' },
      { label: 'Last Change', value: '3d ago', unit: '', status: 'ok' }
    ]
  },
  oracle: {
    'Overview': [
      { label: 'Active Sessions', value: 52, unit: 'sessions', status: 'ok' },
      { label: 'Database Time', value: '4.2s/s', unit: '', status: 'ok' },
      { label: 'SGA Hit Ratio', value: 96.8, unit: '%', status: 'ok' },
      { label: 'Database Size', value: '48.2 GB', unit: '', status: 'ok' },
      { label: 'Uptime', value: '89d 2h', unit: '', status: 'ok' }
    ],
    'Performance': [
      { label: 'Avg Query Time', value: 2.8, unit: 'ms', status: 'ok' },
      { label: 'Physical Reads/sec', value: 142, unit: 'reads', status: 'ok' },
      { label: 'Enqueue Waits', value: 5, unit: 'waits', status: 'ok' },
      { label: 'Disk Sort Ratio', value: 2.1, unit: '%', status: 'ok' },
      { label: 'Redo Writes/sec', value: 287, unit: 'writes', status: 'ok' }
    ],
    'Resources': [
      { label: 'CPU Usage', value: 45, unit: '%', status: 'ok' },
      { label: 'Memory Usage', value: 76, unit: '%', status: 'ok' },
      { label: 'PGA Usage', value: '2.3 GB', unit: '', status: 'ok' },
      { label: 'SGA Usage', value: '4.8 GB', unit: '', status: 'ok' },
      { label: 'Disk Read Rate', value: '87 MB/s', unit: '', status: 'ok' }
    ],
    'Reliability': [
      { label: 'Enqueue Deadlocks', value: 0, unit: 'count', status: 'ok' },
      { label: 'Data Guard Lag', value: '2.1s', unit: '', status: 'ok' },
      { label: 'Backup Status', value: 'OK', unit: '', status: 'ok' },
      { label: 'Archive Gap', value: 'None', unit: '', status: 'ok' },
      { label: 'Last Backup', value: '4h ago', unit: '', status: 'ok' }
    ],
    'Alerts': [
      { label: 'Critical Alerts', value: 0, unit: 'count', status: 'ok' },
      { label: 'Warning Alerts', value: 1, unit: 'count', status: 'warning' },
      { label: 'Info Alerts', value: 7, unit: 'count', status: 'ok' },
      { label: 'Last Alert', value: '30m ago', unit: '', status: 'ok' },
      { label: 'Alert Manager', value: 'Active', unit: '', status: 'ok' }
    ],
    'AWR Reports': [
      { label: 'Snapshots', value: 240, unit: 'snapshots', status: 'ok' },
      { label: 'Retention', value: '8 days', unit: '', status: 'ok' },
      { label: 'DB Time', value: '4.2s/s', unit: '', status: 'ok' },
      { label: 'Load Profile', value: '2.1 ASPM', unit: '', status: 'ok' },
      { label: 'Last Report', value: '10m ago', unit: '', status: 'ok' }
    ],
    'SQL Tuning Advisor': [
      { label: 'Workloads Analyzed', value: 47, unit: 'workloads', status: 'ok' },
      { label: 'Recommendations', value: 12, unit: 'recommendations', status: 'warning' },
      { label: 'Benefit Potential', value: '28.4%', unit: '%', status: 'ok' },
      { label: 'Profiles Created', value: 8, unit: 'profiles', status: 'ok' },
      { label: 'Last Analysis', value: '1h ago', unit: '', status: 'ok' }
    ],
    'Explain Plans': [
      { label: 'Plans Cached', value: 1847, unit: 'plans', status: 'ok' },
      { label: 'Cache Size', value: '287 MB', unit: '', status: 'ok' },
      { label: 'Avg Cost', value: '2847', unit: 'cost', status: 'ok' },
      { label: 'Full Scans', value: 34, unit: 'scans', status: 'warning' },
      { label: 'Last Generated', value: '5m ago', unit: '', status: 'ok' }
    ],
    'Index Analysis': [
      { label: 'Total Indexes', value: 542, unit: 'indexes', status: 'ok' },
      { label: 'Unused Indexes', value: 15, unit: 'indexes', status: 'warning' },
      { label: 'Oversized Indexes', value: 7, unit: 'indexes', status: 'warning' },
      { label: 'Fragmentation', value: '12.3%', unit: '%', status: 'ok' },
      { label: 'Index Size', value: '8.4 GB', unit: '', status: 'ok' }
    ],
    'Optimizer Stats': [
      { label: 'Tables Analyzed', value: 487, unit: 'tables', status: 'ok' },
      { label: 'Stale Stats', value: 23, unit: 'tables', status: 'warning' },
      { label: 'Auto Gather', value: 'Enabled', unit: '', status: 'ok' },
      { label: 'Gather Time', value: '45m', unit: '', status: 'ok' },
      { label: 'Last Gather', value: '6h ago', unit: '', status: 'ok' }
    ],
    'Tablespace Management': [
      { label: 'Total Tablespaces', value: 12, unit: 'tablespaces', status: 'ok' },
      { label: 'Used Space', value: '42.3 GB', unit: '', status: 'ok' },
      { label: 'Free Space', value: '5.9 GB', unit: '', status: 'ok' },
      { label: 'Tablespace Usage', value: '87.7%', unit: '%', status: 'warning' },
      { label: 'Autoextend Status', value: 'Enabled', unit: '', status: 'ok' }
    ],
    'Redo Logs': [
      { label: 'Log Groups', value: 3, unit: 'groups', status: 'ok' },
      { label: 'Log Files', value: 9, unit: 'files', status: 'ok' },
      { label: 'Redo Size/sec', value: '8.4 MB/s', unit: '', status: 'ok' },
      { label: 'Log Switches/hr', value: 6, unit: 'switches', status: 'ok' },
      { label: 'Checkpoint Time', value: '2.1s', unit: '', status: 'ok' }
    ],
    'Data Guard': [
      { label: 'Data Guard Status', value: 'Enabled', unit: '', status: 'ok' },
      { label: 'Standby Status', value: 'Open', unit: '', status: 'ok' },
      { label: 'Replication Lag', value: '2.1s', unit: '', status: 'ok' },
      { label: 'Archive Gap', value: 'None', unit: '', status: 'ok' },
      { label: 'Standby Count', value: 1, unit: 'standbys', status: 'ok' }
    ],
    'RAC Monitor': [
      { label: 'RAC Nodes', value: 2, unit: 'nodes', status: 'ok' },
      { label: 'Node Status', value: 'All Up', unit: '', status: 'ok' },
      { label: 'Global Cache', value: '1.2 GB', unit: '', status: 'ok' },
      { label: 'Interconnect Latency', value: '0.8ms', unit: '', status: 'ok' },
      { label: 'Cluster Health', value: 'Good', unit: '', status: 'ok' }
    ],
    'Undo Management': [
      { label: 'Undo Tablespace', value: 'UNDOTBS1', unit: '', status: 'ok' },
      { label: 'Undo Usage', value: '1.4 GB', unit: '', status: 'ok' },
      { label: 'Retention', value: '15 minutes', unit: '', status: 'ok' },
      { label: 'Active Transactions', value: 12, unit: 'transactions', status: 'ok' },
      { label: 'Space Quota', value: '2.0 GB', unit: '', status: 'ok' }
    ],
    'Schema Objects': [
      { label: 'Total Objects', value: 1247, unit: 'objects', status: 'ok' },
      { label: 'Tables', value: 287, unit: 'tables', status: 'ok' },
      { label: 'Indexes', value: 542, unit: 'indexes', status: 'ok' },
      { label: 'Sequences', value: 148, unit: 'sequences', status: 'ok' },
      { label: 'Packages', value: 42, unit: 'packages', status: 'ok' }
    ],
    'Privilege Audit': [
      { label: 'Audit Enabled', value: 'Yes', unit: '', status: 'ok' },
      { label: 'Audit Records', value: '245K', unit: 'records', status: 'ok' },
      { label: 'DBA Privileges', value: 5, unit: 'users', status: 'ok' },
      { label: 'Privilege Changes', value: 3, unit: 'changes', status: 'ok' },
      { label: 'Last Audit', value: '1h ago', unit: '', status: 'ok' }
    ],
    'VPD Policies': [
      { label: 'Policies Defined', value: 8, unit: 'policies', status: 'ok' },
      { label: 'Protected Objects', value: 34, unit: 'objects', status: 'ok' },
      { label: 'Active Policies', value: 8, unit: 'policies', status: 'ok' },
      { label: 'Policy Predicates', value: 24, unit: 'predicates', status: 'ok' },
      { label: 'Access Denied', value: 12, unit: 'denials', status: 'ok' }
    ],
    'ASH Analytics': [
      { label: 'Active Sessions', value: 52, unit: 'sessions', status: 'ok' },
      { label: 'DB Time', value: '4.2s/s', unit: '', status: 'ok' },
      { label: 'Top Wait Event', value: 'db file sequential read', unit: '', status: 'ok' },
      { label: 'Wait Time %', value: '34.2%', unit: '%', status: 'ok' },
      { label: 'Sampling Interval', value: '1 second', unit: '', status: 'ok' }
    ],
    'Alert Log': [
      { label: 'Alert Entries', value: '847', unit: 'entries', status: 'ok' },
      { label: 'Errors', value: 3, unit: 'errors', status: 'warning' },
      { label: 'Warnings', value: 12, unit: 'warnings', status: 'ok' },
      { label: 'Last Error', value: '2h ago', unit: '', status: 'ok' },
      { label: 'Log Size', value: '2.4 MB', unit: '', status: 'ok' }
    ],
    'Trace Files': [
      { label: 'Total Traces', value: 147, unit: 'traces', status: 'ok' },
      { label: 'Size', value: '8.4 GB', unit: '', status: 'ok' },
      { label: 'Collection Status', value: 'Enabled', unit: '', status: 'ok' },
      { label: 'Oldest Trace', value: '30 days', unit: '', status: 'ok' },
      { label: 'Cleanup Status', value: 'Running', unit: '', status: 'ok' }
    ],
    'Enterprise Manager Bridge': [
      { label: 'EM Status', value: 'Connected', unit: '', status: 'ok' },
      { label: 'Metrics Sent', value: '287', unit: 'metrics', status: 'ok' },
      { label: 'Last Sync', value: '5m ago', unit: '', status: 'ok' },
      { label: 'Plugin Version', value: '21c', unit: '', status: 'ok' },
      { label: 'Sync Health', value: 'Good', unit: '', status: 'ok' }
    ],
    'RMAN Backup': [
      { label: 'Last Backup', value: '2h ago', unit: '', status: 'ok' },
      { label: 'Backup Size', value: '42.1 GB', unit: '', status: 'ok' },
      { label: 'Backup Type', value: 'Full + Arch', unit: '', status: 'ok' },
      { label: 'Recovery Window', value: '7 days', unit: '', status: 'ok' },
      { label: 'Backup Status', value: 'Success', unit: '', status: 'ok' }
    ],
    'Scheduler Jobs': [
      { label: 'Total Jobs', value: 34, unit: 'jobs', status: 'ok' },
      { label: 'Running', value: 2, unit: 'jobs', status: 'ok' },
      { label: 'Success Rate', value: '99.8%', unit: '%', status: 'ok' },
      { label: 'Failed (7d)', value: 1, unit: 'jobs', status: 'ok' },
      { label: 'Next Execution', value: 'in 10m', unit: '', status: 'ok' }
    ],
    'Data Pump': [
      { label: 'Export Jobs', value: 4, unit: 'jobs', status: 'ok' },
      { label: 'Import Jobs', value: 2, unit: 'jobs', status: 'ok' },
      { label: 'Exported Size', value: '18.4 GB', unit: '', status: 'ok' },
      { label: 'Dump File Size', value: '12.1 GB', unit: '', status: 'ok' },
      { label: 'Last Export', value: '3d ago', unit: '', status: 'ok' }
    ],
    'Patch Management': [
      { label: 'Database Version', value: '21.3.0', unit: '', status: 'ok' },
      { label: 'Latest Patch', value: '21.3.1', unit: '', status: 'warning' },
      { label: 'Security Patches', value: '3 available', unit: '', status: 'warning' },
      { label: 'Last Patch Date', value: '45 days ago', unit: '', status: 'ok' },
      { label: 'Patch Status', value: 'Review Needed', unit: '', status: 'warning' }
    ]
  },
  mongodb: {
    'Executive Dashboard': [
      { label: 'Ops/sec', value: 12450, unit: 'ops/s', status: 'ok' },
      { label: 'Connections', value: 234, unit: 'connections', status: 'ok' },
      { label: 'Document Count', value: '45.2M', unit: '', status: 'ok' },
      { label: 'Avg Latency', value: '1.2ms', unit: '', status: 'ok' },
      { label: 'Memory Usage', value: '78%', unit: '%', status: 'ok' }
    ],
    'Connection': [
      { label: 'Current Connections', value: 234, unit: 'connections', status: 'ok' },
      { label: 'Available Connections', value: 266, unit: 'connections', status: 'ok' },
      { label: 'Connection Rate', value: '45/sec', unit: '', status: 'ok' },
      { label: 'Max Connections', value: 500, unit: 'count', status: 'ok' },
      { label: 'Connection Pooling', value: 'Enabled', unit: '', status: 'ok' }
    ],
    'Server Info': [
      { label: 'Uptime', value: '128d 4h', unit: '', status: 'ok' },
      { label: 'Version', value: '7.0.12', unit: '', status: 'ok' },
      { label: 'Storage Engine', value: 'WiredTiger', unit: '', status: 'ok' },
      { label: 'Server Status', value: 'OK', unit: '', status: 'ok' },
      { label: 'Replica Set', value: 'Primary', unit: '', status: 'ok' }
    ],
    'Databases': [
      { label: 'Total Databases', value: 8, unit: 'databases', status: 'ok' },
      { label: 'User Databases', value: 6, unit: 'databases', status: 'ok' },
      { label: 'System Databases', value: 2, unit: 'databases', status: 'ok' },
      { label: 'Total Collections', value: 487, unit: 'collections', status: 'ok' },
      { label: 'Database Size', value: '84.2 GB', unit: '', status: 'ok' }
    ],
    'Collection Relationships': [
      { label: 'Total Collections', value: 487, unit: 'collections', status: 'ok' },
      { label: 'Foreign Keys', value: 342, unit: 'keys', status: 'ok' },
      { label: 'Relationships', value: 287, unit: 'relations', status: 'ok' },
      { label: 'Circular References', value: 0, unit: 'count', status: 'ok' },
      { label: 'Orphaned Docs', value: 12, unit: 'documents', status: 'warning' }
    ],
    'Server Status': [
      { label: 'Uptime', value: '128d 4h', unit: '', status: 'ok' },
      { label: 'Version', value: '7.0.12', unit: '', status: 'ok' },
      { label: 'Storage Engine', value: 'WiredTiger', unit: '', status: 'ok' },
      { label: 'Connections Available', value: 51766, unit: 'count', status: 'ok' },
      { label: 'Network In', value: '845 MB/s', unit: '', status: 'ok' }
    ],
    'Real-time Ops': [
      { label: 'Insert/s', value: 1240, unit: 'ops/s', status: 'ok' },
      { label: 'Query/s', value: 8450, unit: 'ops/s', status: 'ok' },
      { label: 'Update/s', value: 2100, unit: 'ops/s', status: 'ok' },
      { label: 'Delete/s', value: 340, unit: 'ops/s', status: 'ok' },
      { label: 'Command/s', value: 15200, unit: 'ops/s', status: 'ok' }
    ],
    'Latency Percentiles': [
      { label: 'P50 Latency', value: '0.8ms', unit: '', status: 'ok' },
      { label: 'P95 Latency', value: '5.2ms', unit: '', status: 'ok' },
      { label: 'P99 Latency', value: '12.4ms', unit: '', status: 'ok' },
      { label: 'P99.9 Latency', value: '34.2ms', unit: '', status: 'ok' },
      { label: 'Max Latency', value: '128ms', unit: '', status: 'ok' }
    ],
    'Namespace Insights': [
      { label: 'Active Namespaces', value: 287, unit: 'namespaces', status: 'ok' },
      { label: 'Hottest NS', value: 'users.active', unit: '', status: 'ok' },
      { label: 'Coldest NS', value: 'archive.old', unit: '', status: 'ok' },
      { label: 'Size Range', value: '1KB - 8GB', unit: '', status: 'ok' },
      { label: 'Doc Range', value: '1 - 42M', unit: '', status: 'ok' }
    ],
    'Explain Plan': [
      { label: 'Plans Cached', value: 1847, unit: 'plans', status: 'ok' },
      { label: 'Cache Hit Rate', value: 94.2, unit: '%', status: 'ok' },
      { label: 'Full Collection Scans', value: 34, unit: 'scans', status: 'warning' },
      { label: 'Index Used %', value: 87.3, unit: '%', status: 'ok' },
      { label: 'Avg Docs Examined', value: '4.2K', unit: '', status: 'ok' }
    ],
    'Active Operations': [
      { label: 'Active Ops', value: 45, unit: 'operations', status: 'ok' },
      { label: 'Read Ops', value: 28, unit: 'operations', status: 'ok' },
      { label: 'Write Ops', value: 12, unit: 'operations', status: 'ok' },
      { label: 'Command Ops', value: 5, unit: 'operations', status: 'ok' },
      { label: 'Longest Op', value: '2.3s', unit: '', status: 'ok' }
    ],
    'Slow Queries': [
      { label: 'Slow Queries (24h)', value: 128, unit: 'queries', status: 'warning' },
      { label: 'Slowest Query', value: '8.2s', unit: '', status: 'warning' },
      { label: 'Threshold', value: '100ms', unit: '', status: 'ok' },
      { label: 'Avg Duration', value: '245ms', unit: '', status: 'warning' },
      { label: 'Trend', value: 'Increasing', unit: '', status: 'warning' }
    ],
    'Query Profiler': [
      { label: 'Profiler Level', value: '1', unit: 'level', status: 'ok' },
      { label: 'Profiled Queries', value: '8.4K', unit: 'queries', status: 'ok' },
      { label: 'Collection Size', value: '342 MB', unit: '', status: 'ok' },
      { label: 'Oldest Entry', value: '14 days', unit: '', status: 'ok' },
      { label: 'Slowest Query', value: 'aggregation pipeline', unit: '', status: 'ok' }
    ],
    'Query Cost Estimator': [
      { label: 'Estimated Cost', value: '2847', unit: 'units', status: 'ok' },
      { label: 'Actual Cost', value: '2734', unit: 'units', status: 'ok' },
      { label: 'Estimate Accuracy', value: '96.0%', unit: '%', status: 'ok' },
      { label: 'Document Scans', value: '4.2K', unit: 'docs', status: 'ok' },
      { label: 'Bytes Processed', value: '84.2 MB', unit: '', status: 'ok' }
    ],
    'Lock Analysis': [
      { label: 'Global Read Queue', value: 3, unit: 'operations', status: 'ok' },
      { label: 'Global Write Queue', value: 1, unit: 'operations', status: 'ok' },
      { label: 'Avg Lock Time', value: '0.4ms', unit: '', status: 'ok' },
      { label: 'Max Lock Time', value: '2.1ms', unit: '', status: 'ok' },
      { label: 'Lock Contentions', value: 12, unit: 'contentions', status: 'ok' }
    ],
    'Anomaly Detection': [
      { label: 'Anomalies (24h)', value: 5, unit: 'anomalies', status: 'warning' },
      { label: 'Critical Anomalies', value: 1, unit: 'anomalies', status: 'warning' },
      { label: 'Anomaly Score', value: '0.34', unit: '', status: 'warning' },
      { label: 'Baseline', value: 'Established', unit: '', status: 'ok' },
      { label: 'Last Anomaly', value: '45m ago', unit: '', status: 'ok' }
    ],
    'Metrics Preview': [
      { label: 'Metrics Collected', value: 847, unit: 'metrics', status: 'ok' },
      { label: 'Data Points', value: '4.2M', unit: 'points', status: 'ok' },
      { label: 'Time Resolution', value: '1 second', unit: '', status: 'ok' },
      { label: 'Storage Used', value: '2.4 GB', unit: '', status: 'ok' },
      { label: 'Retention', value: '30 days', unit: '', status: 'ok' }
    ],
    'Live Agent': [
      { label: 'Agent Status', value: 'Connected', unit: '', status: 'ok' },
      { label: 'Latency', value: '42ms', unit: '', status: 'ok' },
      { label: 'Health Check', value: 'Pass', unit: '', status: 'ok' },
      { label: 'Last Update', value: '2m ago', unit: '', status: 'ok' },
      { label: 'Data Freshness', value: 'Current', unit: '', status: 'ok' }
    ],
    'Index Advisor': [
      { label: 'Recommended Indexes', value: 8, unit: 'indexes', status: 'warning' },
      { label: 'Unused Indexes', value: 3, unit: 'indexes', status: 'warning' },
      { label: 'Potential Impact', value: '24.2%', unit: '%', status: 'ok' },
      { label: 'Estimated Size', value: '1.2 GB', unit: '', status: 'ok' },
      { label: 'Implementation Score', value: 87, unit: 'score', status: 'ok' }
    ],
    'Schema Analyzer': [
      { label: 'Collections Analyzed', value: 487, unit: 'collections', status: 'ok' },
      { label: 'Schema Variants', value: 34, unit: 'variants', status: 'ok' },
      { label: 'Field Coverage', value: '98.2%', unit: '%', status: 'ok' },
      { label: 'Validation Errors', value: 2, unit: 'errors', status: 'ok' },
      { label: 'Schema Quality', value: 'Good', unit: '', status: 'ok' }
    ],
    'Collection Stats': [
      { label: 'Total Collections', value: 487, unit: 'collections', status: 'ok' },
      { label: 'Total Documents', value: '45.2M', unit: '', status: 'ok' },
      { label: 'Total Size', value: '84.2 GB', unit: '', status: 'ok' },
      { label: 'Largest Collection', value: '18.4 GB', unit: '', status: 'ok' },
      { label: 'Avg Doc Size', value: '1.8 KB', unit: '', status: 'ok' }
    ],
    'WiredTiger Cache': [
      { label: 'Cache Size', value: '16 GB', unit: '', status: 'ok' },
      { label: 'Cache Used', value: '12.8 GB', unit: '', status: 'ok' },
      { label: 'Cache Hit Ratio', value: 96.8, unit: '%', status: 'ok' },
      { label: 'Dirty Pages %', value: '12.4%', unit: '%', status: 'ok' },
      { label: 'Eviction Rate', value: '0.2/sec', unit: '', status: 'ok' }
    ],
    'Backup Monitor': [
      { label: 'Last Backup', value: '6h ago', unit: '', status: 'ok' },
      { label: 'Backup Size', value: '78.2 GB', unit: '', status: 'ok' },
      { label: 'Backup Duration', value: '45m', unit: '', status: 'ok' },
      { label: 'Backup Status', value: 'Healthy', unit: '', status: 'ok' },
      { label: 'Next Backup', value: 'in 6h', unit: '', status: 'ok' }
    ],
    'Capacity Planning': [
      { label: 'Current Usage', value: '84.2 GB', unit: '', status: 'ok' },
      { label: 'Growth Rate', value: '2.3 GB/month', unit: '', status: 'ok' },
      { label: 'Capacity', value: '500 GB', unit: '', status: 'ok' },
      { label: 'Days Until Full', value: '180 days', unit: '', status: 'ok' },
      { label: 'Health', value: 'Good', unit: '', status: 'ok' }
    ],
    'Network': [
      { label: 'Network In', value: '234 MB/s', unit: '', status: 'ok' },
      { label: 'Network Out', value: '187 MB/s', unit: '', status: 'ok' },
      { label: 'Bytes In (24h)', value: '18.2 TB', unit: '', status: 'ok' },
      { label: 'Bytes Out (24h)', value: '14.8 TB', unit: '', status: 'ok' },
      { label: 'Network Health', value: 'Excellent', unit: '', status: 'ok' }
    ],
    'Document Editor': [
      { label: 'Edits Today', value: 847, unit: 'edits', status: 'ok' },
      { label: 'Validation Errors', value: 2, unit: 'errors', status: 'ok' },
      { label: 'Schema Compliance', value: '99.8%', unit: '%', status: 'ok' },
      { label: 'Avg Edit Time', value: '2.3s', unit: '', status: 'ok' },
      { label: 'Last Edit', value: '1m ago', unit: '', status: 'ok' }
    ],
    'Aggregation Builder': [
      { label: 'Pipelines Created', value: 234, unit: 'pipelines', status: 'ok' },
      { label: 'Avg Stages', value: 4.2, unit: 'stages', status: 'ok' },
      { label: 'Execution Time', value: '234ms', unit: '', status: 'ok' },
      { label: 'Error Rate', value: '0.2%', unit: '%', status: 'ok' },
      { label: 'Popular Stages', value: '$match, $group', unit: '', status: 'ok' }
    ],
    'NL Query Generator': [
      { label: 'Queries Generated', value: 147, unit: 'queries', status: 'ok' },
      { label: 'Accuracy', value: '94.2%', unit: '%', status: 'ok' },
      { label: 'Avg Latency', value: '1.2s', unit: '', status: 'ok' },
      { label: 'Model Status', value: 'OK', unit: '', status: 'ok' },
      { label: 'Feedback Score', value: '4.7/5.0', unit: '', status: 'ok' }
    ],
    'Import/Export': [
      { label: 'Imports (7d)', value: 12, unit: 'imports', status: 'ok' },
      { label: 'Exports (7d)', value: 8, unit: 'exports', status: 'ok' },
      { label: 'Total Size', value: '42.1 GB', unit: '', status: 'ok' },
      { label: 'Success Rate', value: '99.8%', unit: '%', status: 'ok' },
      { label: 'Last Operation', value: '2h ago', unit: '', status: 'ok' }
    ],
    'SQL Translator': [
      { label: 'Queries Translated', value: 234, unit: 'queries', status: 'ok' },
      { label: 'Translation Accuracy', value: '92.3%', unit: '%', status: 'ok' },
      { label: 'Avg Time', value: '0.5s', unit: '', status: 'ok' },
      { label: 'Supported Features', value: '94%', unit: '%', status: 'ok' },
      { label: 'Last Translation', value: '10m ago', unit: '', status: 'ok' }
    ],
    'Schema Compare': [
      { label: 'Schemas Compared', value: 47, unit: 'comparisons', status: 'ok' },
      { label: 'Differences Found', value: 12, unit: 'differences', status: 'ok' },
      { label: 'Sync Status', value: 'In Sync', unit: '', status: 'ok' },
      { label: 'Conflict Ratio', value: '2.3%', unit: '%', status: 'ok' },
      { label: 'Last Comparison', value: '1h ago', unit: '', status: 'ok' }
    ],
    'Geo-spatial': [
      { label: 'Geo Indexes', value: 28, unit: 'indexes', status: 'ok' },
      { label: 'Geo Queries', value: '4.2K', unit: 'queries', status: 'ok' },
      { label: 'Avg Query Time', value: '3.2ms', unit: '', status: 'ok' },
      { label: 'Index Coverage', value: '87.3%', unit: '%', status: 'ok' },
      { label: 'Data Quality', value: 'Good', unit: '', status: 'ok' }
    ],
    'AI Hints': [
      { label: 'Hints Generated', value: 287, unit: 'hints', status: 'ok' },
      { label: 'Accuracy', value: '93.2%', unit: '%', status: 'ok' },
      { label: 'Accepted Hints', value: '76%', unit: '%', status: 'ok' },
      { label: 'Performance Gain', value: '18.4%', unit: '%', status: 'ok' },
      { label: 'Model Version', value: '3.2.1', unit: '', status: 'ok' }
    ],
    'Compare Clusters': [
      { label: 'Clusters Compared', value: 2, unit: 'clusters', status: 'ok' },
      { label: 'Data Diff', value: '0 bytes', unit: '', status: 'ok' },
      { label: 'Schema Diff', value: 'None', unit: '', status: 'ok' },
      { label: 'Config Diff', value: '3 options', unit: '', status: 'ok' },
      { label: 'Sync Status', value: 'Synchronized', unit: '', status: 'ok' }
    ],
    'Historical Trends': [
      { label: 'Trend Data Points', value: '8.2K', unit: 'points', status: 'ok' },
      { label: 'Time Span', value: '90 days', unit: '', status: 'ok' },
      { label: 'Ops Trend', value: '+12.3%', unit: '%', status: 'ok' },
      { label: 'Size Trend', value: '+8.4%', unit: '%', status: 'ok' },
      { label: 'Forecast', value: 'Stable', unit: '', status: 'ok' }
    ],
    'Perf Advisor v2': [
      { label: 'Recommendations', value: 12, unit: 'recommendations', status: 'warning' },
      { label: 'Potential Gain', value: '34.2%', unit: '%', status: 'ok' },
      { label: 'High Priority', value: 3, unit: 'recommendations', status: 'warning' },
      { label: 'Implementation Rate', value: '58.3%', unit: '%', status: 'ok' },
      { label: 'Last Analysis', value: '1h ago', unit: '', status: 'ok' }
    ],
    'Trace Correlator': [
      { label: 'Traces Correlated', value: '2.3M', unit: 'traces', status: 'ok' },
      { label: 'Correlation Score', value: '0.92', unit: '', status: 'ok' },
      { label: 'Issues Found', value: 5, unit: 'issues', status: 'warning' },
      { label: 'Avg Correlation Time', value: '245ms', unit: '', status: 'ok' },
      { label: 'Latest Report', value: '5m ago', unit: '', status: 'ok' }
    ],
    'Replica Set + Failover': [
      { label: 'Replica Count', value: 3, unit: 'replicas', status: 'ok' },
      { label: 'Primary Status', value: 'OK', unit: '', status: 'ok' },
      { label: 'Replication Lag', value: '0.2s', unit: '', status: 'ok' },
      { label: 'Failover Ready', value: 'Yes', unit: '', status: 'ok' },
      { label: 'Last Election', value: '8d ago', unit: '', status: 'ok' }
    ],
    'Sharding': [
      { label: 'Shards', value: 4, unit: 'shards', status: 'ok' },
      { label: 'Mongos', value: 2, unit: 'mongos', status: 'ok' },
      { label: 'Total Chunks', value: 284, unit: 'chunks', status: 'ok' },
      { label: 'Chunk Balance', value: '94.2%', unit: '%', status: 'ok' },
      { label: 'Shard Key', value: 'user_id', unit: '', status: 'ok' }
    ],
    'Oplog Tail': [
      { label: 'Oplog Size', value: '8.4 GB', unit: '', status: 'ok' },
      { label: 'Oplog Window', value: '48 hours', unit: '', status: 'ok' },
      { label: 'Entries/sec', value: 847, unit: 'entries', status: 'ok' },
      { label: 'Last Entry', value: '1s ago', unit: '', status: 'ok' },
      { label: 'Oplog Health', value: 'Good', unit: '', status: 'ok' }
    ],
    'Alert Manager': [
      { label: 'Active Alerts', value: 5, unit: 'alerts', status: 'warning' },
      { label: 'Critical Alerts', value: 0, unit: 'alerts', status: 'ok' },
      { label: 'Alert Rules', value: 34, unit: 'rules', status: 'ok' },
      { label: 'Notification Rate', value: '2/hour', unit: '', status: 'ok' },
      { label: 'Resolution Time', value: '12.3m', unit: '', status: 'ok' }
    ],
    'Prometheus Export': [
      { label: 'Export Status', value: 'Active', unit: '', status: 'ok' },
      { label: 'Metrics Exported', value: 847, unit: 'metrics', status: 'ok' },
      { label: 'Scrape Interval', value: '30s', unit: '', status: 'ok' },
      { label: 'Data Points (24h)', value: '2.8M', unit: '', status: 'ok' },
      { label: 'Last Scrape', value: '15s ago', unit: '', status: 'ok' }
    ],
    'SSO/Auth': [
      { label: 'Auth Method', value: 'LDAP', unit: '', status: 'ok' },
      { label: 'Active Sessions', value: 28, unit: 'sessions', status: 'ok' },
      { label: 'Auth Failures', value: 2, unit: 'failures', status: 'ok' },
      { label: 'Last Auth', value: '5m ago', unit: '', status: 'ok' },
      { label: 'Password Age', value: '45 days', unit: '', status: 'ok' }
    ],
    'Atlas API Bridge': [
      { label: 'API Status', value: 'Connected', unit: '', status: 'ok' },
      { label: 'API Calls (24h)', value: '4.2K', unit: 'calls', status: 'ok' },
      { label: 'Avg Latency', value: '234ms', unit: '', status: 'ok' },
      { label: 'Last Sync', value: '2m ago', unit: '', status: 'ok' },
      { label: 'Sync Health', value: 'Good', unit: '', status: 'ok' }
    ],
    'Dashboards': [
      { label: 'Dashboards Created', value: 24, unit: 'dashboards', status: 'ok' },
      { label: 'Shared Dashboards', value: 12, unit: 'dashboards', status: 'ok' },
      { label: 'Total Widgets', value: 287, unit: 'widgets', status: 'ok' },
      { label: 'Views (30d)', value: '18.4K', unit: 'views', status: 'ok' },
      { label: 'Avg Load Time', value: '342ms', unit: '', status: 'ok' }
    ],
    'Reports': [
      { label: 'Reports Generated', value: '12/month', unit: '', status: 'ok' },
      { label: 'Report Size', value: '8.4 MB', unit: '', status: 'ok' },
      { label: 'Distribution List', value: 24, unit: 'recipients', status: 'ok' },
      { label: 'Scheduled Reports', value: 8, unit: 'reports', status: 'ok' },
      { label: 'Last Report', value: '1d ago', unit: '', status: 'ok' }
    ],
    'Audit Log': [
      { label: 'Audit Events (24h)', value: '24.2K', unit: 'events', status: 'ok' },
      { label: 'Data Changes', value: '8.2K', unit: 'changes', status: 'ok' },
      { label: 'Admin Actions', value: '342', unit: 'actions', status: 'ok' },
      { label: 'Failed Access', value: 5, unit: 'attempts', status: 'ok' },
      { label: 'Compliance', value: 'Pass', unit: '', status: 'ok' }
    ],
    'Users': [
      { label: 'Total Users', value: 42, unit: 'users', status: 'ok' },
      { label: 'Active Users', value: 38, unit: 'users', status: 'ok' },
      { label: 'Admin Users', value: 3, unit: 'users', status: 'ok' },
      { label: 'Service Accounts', value: 8, unit: 'accounts', status: 'ok' },
      { label: 'Last Login', value: '2m ago', unit: '', status: 'ok' }
    ]
  }
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* FORMAT HELPER */
/* ─────────────────────────────────────────────────────────────────────────── */

function formatValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') {
    if (value > 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value > 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toString();
  }
  return String(value);
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MAIN COMPONENT */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function DemoDataTab() {
  const [selectedDb, setSelectedDb] = useState('postgresql');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const dbConfig = DATABASE_STRUCTURE[selectedDb];

  // Count total tabs
  const totalTabs = useMemo(() => {
    return dbConfig.sections.reduce((sum, section) => sum + section.tabs.length, 0);
  }, [dbConfig]);

  // Count total metrics
  const totalMetrics = useMemo(() => {
    let count = 0;
    dbConfig.sections.forEach(section => {
      section.tabs.forEach(tab => {
        const metrics = TAB_METRICS[selectedDb][tab] || [];
        count += metrics.length;
      });
    });
    return count;
  }, [selectedDb, dbConfig]);

  // Filter sections and tabs based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return dbConfig.sections;
    }

    const query = searchQuery.toLowerCase();
    return dbConfig.sections
      .map(section => ({
        ...section,
        tabs: section.tabs.filter(tab => {
          const tabMatch = tab.toLowerCase().includes(query);
          const metricsMatch = (TAB_METRICS[selectedDb][tab] || []).some(m =>
            m.label.toLowerCase().includes(query) ||
            m.unit.toLowerCase().includes(query)
          );
          return tabMatch || metricsMatch;
        })
      }))
      .filter(section => section.tabs.length > 0);
  }, [selectedDb, searchQuery, dbConfig]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div style={{ background: '#0d1117', color: '#e6edf3', minHeight: '100vh', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>Database Demo Showcase</h1>
        <p style={{ margin: '0', fontSize: '14px', color: '#8b949e' }}>
          Comprehensive demo data for all database monitoring tabs with realistic sample metrics
        </p>
      </div>

      {/* Database Selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '28px'
      }}>
        {Object.entries(DATABASE_STRUCTURE).map(([dbKey, config]) => {
          const tabCount = config.sections.reduce((sum, s) => sum + s.tabs.length, 0);
          const isSelected = selectedDb === dbKey;
          const Icon = config.icon;

          return (
            <button
              key={dbKey}
              onClick={() => {
                setSelectedDb(dbKey);
                setSearchQuery('');
                setExpandedSections({});
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '14px',
                background: isSelected ? config.color + '15' : '#161b22',
                border: `2px solid ${isSelected ? config.color : '#30363d'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#e6edf3',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = config.color + '60';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = '#30363d';
              }}
            >
              <Icon size={22} color={config.color} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>{config.name}</span>
              <span style={{ fontSize: '10px', color: '#8b949e' }}>{tabCount} tabs</span>
            </button>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#161b22', padding: '14px', borderRadius: '8px', border: '1px solid #30363d' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '6px' }}>Sections</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#58a6ff' }}>{dbConfig.sections.length}</div>
        </div>
        <div style={{ background: '#161b22', padding: '14px', borderRadius: '8px', border: '1px solid #30363d' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '6px' }}>Total Tabs</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#58a6ff' }}>{totalTabs}</div>
        </div>
        <div style={{ background: '#161b22', padding: '14px', borderRadius: '8px', border: '1px solid #30363d' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '6px' }}>Sample Metrics</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#58a6ff' }}>{totalMetrics}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <Search size={16} style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#8b949e'
        }} />
        <input
          type="text"
          placeholder="Search tabs or metrics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '36px',
            paddingRight: '12px',
            paddingTop: '10px',
            paddingBottom: '10px',
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            color: '#e6edf3',
            fontSize: '14px',
            outline: 'none'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#30363d'}
        />
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredSections.map(section => {
          const isExpanded = expandedSections[section.id];
          const Icon = isExpanded ? ChevronDown : ChevronRight;

          return (
            <div key={section.id} style={{ background: '#161b22', borderRadius: '10px', border: '1px solid #30363d', overflow: 'hidden' }}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#e6edf3',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#0d111720'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Icon size={18} style={{ color: '#58a6ff' }} />
                <span>{section.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#8b949e' }}>
                  {section.tabs.length} tabs
                </span>
              </button>

              {/* Tabs Grid */}
              {isExpanded && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '12px',
                  padding: '12px',
                  borderTop: '1px solid #30363d'
                }}>
                  {section.tabs.map(tab => {
                    const metrics = TAB_METRICS[selectedDb][tab] || [];
                    return (
                      <div
                        key={tab}
                        style={{
                          background: '#0d1117',
                          border: '1px solid #30363d',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '13px'
                        }}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '10px', color: '#58a6ff' }}>
                          {tab}
                        </div>
                        {metrics.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {metrics.map((metric, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '12px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      background: metric.status === 'ok' ? '#55dd55' : metric.status === 'warning' ? '#ffaa55' : '#ff5555'
                                    }}
                                  />
                                  <span style={{ color: '#8b949e' }}>{metric.label}</span>
                                </div>
                                <span style={{ color: '#e6edf3', fontWeight: '500' }}>
                                  {formatValue(metric.value)} {metric.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: '#8b949e', fontSize: '12px' }}>No metrics available</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No results message */}
      {filteredSections.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#8b949e'
        }}>
          <Activity size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>No tabs or metrics match your search query.</p>
          <p style={{ fontSize: '12px' }}>Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
