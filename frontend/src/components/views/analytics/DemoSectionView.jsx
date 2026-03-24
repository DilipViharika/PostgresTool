import React from 'react';
import DemoDataTab from './DemoDataTab.jsx';

/**
 * DemoSectionView — a single component used for ALL demo subsection tabs.
 * Reads the active tab ID from localStorage to determine which database + section to render.
 * Tab ID format: demo-{dbShort}-{sectionId}
 *   e.g. demo-pg-core, demo-mysql-query, demo-mongo-overview
 */

const DB_MAP = {
  pg: 'postgresql',
  mysql: 'mysql',
  mssql: 'mssql',
  oracle: 'oracle',
  mongo: 'mongodb',
};

export default function DemoSectionView() {
  const tabId = (() => {
    try { return localStorage.getItem('pg_monitor_active_tab') || ''; } catch { return ''; }
  })();

  // Parse: "demo-pg-core" → dbShort="pg", sectionId="core"
  // Parse: "demo-mongo-overview" → dbShort="mongo", sectionId="overview"
  const match = tabId.match(/^demo-(\w+?)-(.+)$/);
  if (!match) {
    return <DemoDataTab dbKey="postgresql" />;
  }

  const dbKey = DB_MAP[match[1]] || 'postgresql';
  const sectionId = match[2];

  return <DemoDataTab dbKey={dbKey} sectionId={sectionId} />;
}
