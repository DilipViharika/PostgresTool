import React from 'react';
import DemoDataTab from './DemoDataTab';
import DemoEngineTab from '../demo/DemoEngineTab';
import DemoBigQueryFullTab   from '../demo/DemoBigQueryFullTab';
import DemoSnowflakeFullTab  from '../demo/DemoSnowflakeFullTab';
import DemoMSSQLFullTab      from '../demo/DemoMSSQLFullTab';
import DemoOracleFullTab     from '../demo/DemoOracleFullTab';
import DemoRedisFullTab      from '../demo/DemoRedisFullTab';
import DemoElasticFullTab    from '../demo/DemoElasticFullTab';
import DemoRedshiftFullTab   from '../demo/DemoRedshiftFullTab';
import DemoCassandraFullTab  from '../demo/DemoCassandraFullTab';
import DemoDynamoDBFullTab   from '../demo/DemoDynamoDBFullTab';

/**
 * DemoSectionView — a single component used for ALL demo subsection tabs.
 * Reads the active tab ID from localStorage to determine which database + section to render.
 *
 * Tab ID format: demo-{dbShort}-{subTabId}
 *   e.g. demo-pg-overview, demo-mysql-optimizer, demo-mongo-overview
 *
 * For SQL databases (pg/mysql), the subTabId is mapped to a section
 * widget ID (core, query, infra, schema, observability, dev, admin) via TAB_TO_SECTION.
 *
 * For MongoDB, the subTabId is passed through as-is because DemoDataTab already
 * handles MongoDB-specific mapping via mapSectionToWidgetId().
 *
 * For the Phase-5 engines (mssql, oracle, redis, elasticsearch, snowflake,
 * bigquery, redshift, cassandra, dynamodb) we delegate to DemoEngineTab which
 * renders a standard 11-panel layout from demoEngineData.ts.
 */

const DB_MAP = {
  pg: 'postgresql',
  mysql: 'mysql',
  mongo: 'mongodb',
};

const ENGINE_MAP = {
  mssql:         'mssql',
  oracle:        'oracle',
  redis:         'redis',
  elasticsearch: 'elasticsearch',
  es:            'elasticsearch',   // short alias
  snowflake:     'snowflake',
  sf:            'snowflake',       // short alias
  bigquery:      'bigquery',
  bq:            'bigquery',        // short alias
  redshift:      'redshift',
  rs:            'redshift',        // short alias
  cassandra:     'cassandra',
  dynamodb:      'dynamodb',
  dynamo:        'dynamodb',        // short alias
};

/** Maps individual SQL-database sub-tab IDs to section widget IDs used by DemoDataTab */
const SQL_TAB_TO_SECTION = {
  // Core Monitoring
  'overview': 'core', 'performance': 'core', 'resources': 'core',
  'reliability': 'core', 'alerts': 'core',
  // Query & Indexes
  'optimizer': 'query', 'indexes': 'query', 'regression': 'query',
  'bloat': 'query', 'table': 'query',
  // Infrastructure
  'pool': 'infra', 'replication': 'infra', 'checkpoint': 'infra',
  'maintenance': 'infra', 'capacity': 'infra', 'backup': 'infra',
  // Schema & Security
  'schema': 'schema', 'schema-viz': 'schema', 'table-deps': 'schema', 'security': 'schema',
  // Observability
  'cloudwatch': 'observability', 'log-patterns': 'observability',
  'alert-correlation': 'observability', 'opentelemetry': 'observability',
  'kubernetes': 'observability', 'status-page': 'observability',
  'ai-monitoring': 'observability',
  // Developer Tools
  'sql': 'dev', 'api': 'dev', 'repository': 'dev', 'ai-advisor': 'dev',
  // Admin
  'tasks': 'admin', 'users': 'admin', 'admin-panel': 'admin',
  'retention': 'admin', 'terraform': 'admin', 'custom-dashboard': 'admin',
  // Legacy single-section IDs (backward compat)
  'core': 'core', 'query': 'query', 'infra': 'infra',
  'observability': 'observability', 'dev': 'dev', 'admin': 'admin',
};

export default function DemoSectionView({ tabId: propTabId }) {
  // Prefer prop-based tabId (passed from App.jsx) over localStorage for reliable re-renders
  const tabId = propTabId || (() => {
    try { return localStorage.getItem('pg_monitor_active_tab') || ''; } catch { return ''; }
  })();

  // Parse: "demo-pg-overview" → dbShort="pg", subTabId="overview"
  // Parse: "demo-mongo-data-tools" → dbShort="mongo", subTabId="data-tools"
  // Parse: "demo-bigquery-waits"  → dbShort="bigquery", subTabId="waits"
  const match = tabId.match(/^demo-(\w+?)-(.+)$/);
  if (!match) {
    return <DemoDataTab dbKey="postgresql" />;
  }

  const dbShort = match[1];
  const subTabId = match[2];

  // Phase-5 engines — every one now has a dedicated bespoke tab. The
  // generic DemoEngineTab is still imported as a fallback but no longer
  // used for any known engine key; it handles only future unmapped
  // engines that get added to ENGINE_MAP before their bespoke tab ships.
  const engineKey = ENGINE_MAP[dbShort];
  if (engineKey === 'bigquery')      return <DemoBigQueryFullTab   key={tabId} subTabId={subTabId} />;
  if (engineKey === 'snowflake')     return <DemoSnowflakeFullTab  key={tabId} subTabId={subTabId} />;
  if (engineKey === 'mssql')         return <DemoMSSQLFullTab      key={tabId} subTabId={subTabId} />;
  if (engineKey === 'oracle')        return <DemoOracleFullTab     key={tabId} subTabId={subTabId} />;
  if (engineKey === 'redis')         return <DemoRedisFullTab      key={tabId} subTabId={subTabId} />;
  if (engineKey === 'elasticsearch') return <DemoElasticFullTab    key={tabId} subTabId={subTabId} />;
  if (engineKey === 'redshift')      return <DemoRedshiftFullTab   key={tabId} subTabId={subTabId} />;
  if (engineKey === 'cassandra')     return <DemoCassandraFullTab  key={tabId} subTabId={subTabId} />;
  if (engineKey === 'dynamodb')      return <DemoDynamoDBFullTab   key={tabId} subTabId={subTabId} />;
  if (engineKey) {
    return <DemoEngineTab key={tabId} engine={engineKey} subTabId={subTabId} />;
  }

  const dbKey = DB_MAP[dbShort] || 'postgresql';

  // For MongoDB, pass the subTabId as-is — DemoDataTab's mapSectionToWidgetId handles it.
  // For SQL databases, map individual tabs back to their parent section widget ID.
  const sectionId = dbShort === 'mongo'
    ? subTabId
    : (SQL_TAB_TO_SECTION[subTabId] || subTabId);

  return <DemoDataTab key={tabId} dbKey={dbKey} sectionId={sectionId} subTabId={subTabId} />;
}
