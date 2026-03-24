import React, { useState } from 'react';
import {
  Database, TrendingUp, Activity, Zap, HardDrive, Cpu,
  ChevronDown, ChevronRight, AlertCircle, CheckCircle,
  Clock, BarChart3, PieChart as PieChartIcon, GitBranch,
  Shield, Zap as ZapIcon, Settings
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
    ],
  },
  mongodb: {
    name: 'MongoDB',
    color: DB_COLORS.mongodb,
    icon: Database,
    kpis: [
      { label: 'Ops/s', value: '8,234', unit: '/s', status: 'healthy', sparkline: [7500, 7800, 8000, 8100, 8234, 8200, 8150] },
      { label: 'Avg Latency', value: '1.2', unit: 'ms', status: 'healthy', sparkline: [1.5, 1.4, 1.3, 1.2, 1.2, 1.2, 1.1] },
      { label: 'Connections', value: '156', unit: '', status: 'healthy', sparkline: [120, 130, 140, 150, 155, 156, 156] },
      { label: 'Replication Lag', value: '0.1', unit: 'ms', status: 'healthy', sparkline: [0.5, 0.3, 0.2, 0.15, 0.1, 0.1, 0.1] },
      { label: 'Storage Used', value: '45.3', unit: 'GB', status: 'healthy', sparkline: [35, 37, 39, 42, 44, 45, 45.3] },
    ],
    sections: [
      {
        id: 'core',
        name: 'Core Metrics',
        tabs: [
          { name: 'Operations', metrics: [{ label: 'Insert Ops', value: '2,345', unit: '/s' }, { label: 'Query Ops', value: '5,678', unit: '/s' }, { label: 'Update Ops', value: '234', unit: '/s' }, { label: 'Delete Ops', value: '45', unit: '/s' }] },
          { name: 'Replication', metrics: [{ label: 'Replica Set Members', value: '3', unit: '' }, { label: 'Primary Uptime', value: '99.99', unit: '%' }, { label: 'Oplog Size', value: '5.2', unit: 'GB' }, { label: 'Sync Rate', value: '100', unit: '%' }] },
          { name: 'Connections', metrics: [{ label: 'Active Connections', value: '156', unit: '' }, { label: 'Queued Readers', value: '0', unit: '' }, { label: 'Queued Writers', value: '0', unit: '' }, { label: 'Connection Pool Util', value: '78.2', unit: '%' }] },
        ]
      },
      {
        id: 'storage',
        name: 'Storage',
        tabs: [
          { name: 'Collections', metrics: [{ label: 'Total Collections', value: '234', unit: '' }, { label: 'Indexes', value: '1,234', unit: '' }, { label: 'Compression Ratio', value: '2.8', unit: 'x' }, { label: 'Storage Used', value: '45.3', unit: 'GB' }] },
          { name: 'Cache', metrics: [{ label: 'Cache Hit Ratio', value: '94.5', unit: '%' }, { label: 'Cache Size', value: '8.0', unit: 'GB' }, { label: 'Evictions', value: '234', unit: '/hour' }, { label: 'Dirty Pages', value: '2.3', unit: '%' }] },
        ]
      },
    ],
  },
  mysql: {
    name: 'MySQL',
    color: DB_COLORS.mysql,
    icon: Database,
    kpis: [
      { label: 'QPS', value: '3,456', unit: '/s', status: 'healthy', sparkline: [3100, 3200, 3300, 3400, 3450, 3456, 3450] },
      { label: 'Buffer Pool Hit', value: '96.8', unit: '%', status: 'healthy', sparkline: [95, 95.5, 96, 96.5, 96.8, 96.8, 96.8] },
      { label: 'Connections', value: '87', unit: '', status: 'healthy', sparkline: [70, 75, 80, 85, 87, 87, 87] },
      { label: 'Innodb Rows', value: '234M', unit: '', status: 'healthy', sparkline: [200, 210, 220, 230, 233, 234, 234] },
      { label: 'Slow Queries', value: '12', unit: '/day', status: 'warning', sparkline: [5, 8, 10, 12, 12, 12, 12] },
    ],
    sections: [
      {
        id: 'core',
        name: 'Core',
        tabs: [
          { name: 'Throughput', metrics: [{ label: 'Reads/sec', value: '2,500', unit: '' }, { label: 'Writes/sec', value: '600', unit: '' }, { label: 'Queries/sec', value: '3,456', unit: '' }, { label: 'Slow Queries', value: '12', unit: '/day' }] },
          { name: 'Innodb', metrics: [{ label: 'Buffer Pool Size', value: '8.0', unit: 'GB' }, { label: 'Hit Ratio', value: '96.8', unit: '%' }, { label: 'Pages Read', value: '2.3M', unit: '/hour' }, { label: 'Pages Written', value: '1.2M', unit: '/hour' }] },
          { name: 'Replication', metrics: [{ label: 'Replica Status', value: 'healthy', unit: '' }, { label: 'Replication Lag', value: '0.5', unit: 's' }, { label: 'Binary Log Pos', value: '45,234', unit: '' }, { label: 'Relay Log Size', value: '234', unit: 'MB' }] },
        ]
      },
    ],
  },
  mssql: {
    name: 'SQL Server',
    color: DB_COLORS.mssql,
    icon: Database,
    kpis: [
      { label: 'Batch Reqs/s', value: '2,156', unit: '/s', status: 'healthy', sparkline: [2000, 2050, 2100, 2130, 2150, 2156, 2140] },
      { label: 'Page Life Exp', value: '8,234', unit: 's', status: 'healthy', sparkline: [8000, 8100, 8150, 8200, 8234, 8234, 8230] },
      { label: 'User Connections', value: '67', unit: '', status: 'healthy', sparkline: [50, 55, 60, 65, 66, 67, 67] },
      { label: 'Log Flush Wait', value: '0.2', unit: 'ms', status: 'healthy', sparkline: [0.5, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2] },
      { label: 'DB Size', value: '127.5', unit: 'GB', status: 'healthy', sparkline: [120, 122, 124, 126, 127, 127.5, 127.5] },
    ],
    sections: [
      {
        id: 'core',
        name: 'Performance',
        tabs: [
          { name: 'Batch Requests', metrics: [{ label: 'Batch Requests/sec', value: '2,156', unit: '' }, { label: 'SQL Compilations', value: '234', unit: '/sec' }, { label: 'SQL Re-compilations', value: '12', unit: '/sec' }, { label: 'Attention Rate', value: '0.1', unit: '/sec' }] },
          { name: 'Memory', metrics: [{ label: 'Buffer Cache Hit Ratio', value: '99.2', unit: '%' }, { label: 'Page Life Expectancy', value: '8,234', unit: 's' }, { label: 'Memory Grants', value: '45', unit: '' }, { label: 'Free Memory', value: '2.3', unit: 'GB' }] },
        ]
      },
    ],
  },
  oracle: {
    name: 'Oracle',
    color: DB_COLORS.oracle,
    icon: Database,
    kpis: [
      { label: 'Transactions/s', value: '5,678', unit: '/s', status: 'healthy', sparkline: [5200, 5300, 5400, 5500, 5600, 5678, 5650] },
      { label: 'Database CPU', value: '45.2', unit: '%', status: 'healthy', sparkline: [40, 42, 44, 45, 45.2, 45.2, 45] },
      { label: 'Logical Reads', value: '12.3M', unit: '/s', status: 'healthy', sparkline: [11.5, 11.8, 12, 12.1, 12.2, 12.3, 12.3] },
      { label: 'Redo Write Time', value: '23.4', unit: 'ms', status: 'healthy', sparkline: [25, 24, 23.5, 23.4, 23.4, 23.4, 23.5] },
      { label: 'Tablespace Util', value: '78.9', unit: '%', status: 'warning', sparkline: [70, 72, 74, 76, 77, 78.5, 78.9] },
    ],
    sections: [
      {
        id: 'core',
        name: 'Database',
        tabs: [
          { name: 'Activity', metrics: [{ label: 'Active Sessions', value: '23', unit: '' }, { label: 'Database CPU Time', value: '45.2', unit: '%' }, { label: 'Memory Sorts', value: '98.5', unit: '%' }, { label: 'Redo Writes', value: '234', unit: '/sec' }] },
          { name: 'SGA', metrics: [{ label: 'SGA Total', value: '16.0', unit: 'GB' }, { label: 'Shared Pool', value: '8.0', unit: 'GB' }, { label: 'Buffer Cache', value: '6.4', unit: 'GB' }, { label: 'Redo Log Buffer', value: '1.6', unit: 'GB' }] },
        ]
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* DETAIL WIDGETS DATA */
/* ═══════════════════════════════════════════════════════════════════════════ */

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
          <ZapIcon size={16} color={dbColor} />
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
