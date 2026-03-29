import React from 'react';
import DemoDataTab from './DemoDataTab';

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
 */

const DB_MAP = {
  pg: 'postgresql',
  mysql: 'mysql',
  mongo: 'mongodb',
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
  const match = tabId.match(/^demo-(\w+?)-(.+)$/);
  if (!match) {
    return <DemoDataTab dbKey="postgresql" />;
  }

  const dbShort = match[1];
  const dbKey = DB_MAP[dbShort] || 'postgresql';
  const subTabId = match[2];

  // For MongoDB, pass the subTabId as-is — DemoDataTab's mapSectionToWidgetId handles it.
  // For SQL databases, map individual tabs back to their parent section widget ID.
  const sectionId = dbShort === 'mongo'
    ? subTabId
    : (SQL_TAB_TO_SECTION[subTabId] || subTabId);

  return <DemoDataTab key={tabId} dbKey={dbKey} sectionId={sectionId} subTabId={subTabId} />;
}
