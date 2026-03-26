// ==========================================================================
//  VIGIL — Demo Mode Context
// ==========================================================================
//  When demo mode is active, API calls return realistic sample data
//  without needing a real PostgreSQL connection.
// ==========================================================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DemoContext = createContext(null);

const DEMO_USER = {
    id: 'demo-user-001',
    username: 'demo',
    name: 'Demo User',
    role: 'super_admin',
    accessLevel: 'write',
    allowedScreens: [
        'fleet-overview',
        'overview',
        'performance',
        'resources',
        'reliability',
        'alerts',
        'alert-rules',
        'alert-correlation',
        'optimizer',
        'query-plan',
        'indexes',
        'regression',
        'bloat',
        'Table',
        'schema-tree',
        'schema',
        'schema-visualizer',
        'table-dependencies',
        'chart-builder',
        'pool',
        'pool-metrics',
        'replication',
        'checkpoint',
        'maintenance',
        'capacity',
        'backup',
        'security',
        'observability-hub',
        'cloudwatch',
        'log-patterns',
        'opentelemetry',
        'kubernetes',
        'status-page',
        'ai-monitoring',
        'sql',
        'api',
        'repository',
        'ai-advisor',
        'mongo-overview',
        'mongo-performance',
        'mongo-storage',
        'mongo-replication',
        'mongo-data-tools',
        'mongo-sharding',
        'tasks',
        'UserManagement',
        'admin',
        'retention',
        'report-builder',
        'terraform',
        'custom-dashboard',
        // Demo PostgreSQL (38 tabs — mirrors real PG sections)
        'demo-pg-fleet',
        'demo-pg-overview',
        'demo-pg-performance',
        'demo-pg-resources',
        'demo-pg-reliability',
        'demo-pg-alerts',
        'demo-pg-alert-rules',
        'demo-pg-alert-correlation',
        'demo-pg-optimizer',
        'demo-pg-query-plan',
        'demo-pg-regression',
        'demo-pg-indexes',
        'demo-pg-bloat',
        'demo-pg-table',
        'demo-pg-schema-tree',
        'demo-pg-schema',
        'demo-pg-schema-viz',
        'demo-pg-table-deps',
        'demo-pg-chart-builder',
        'demo-pg-pool',
        'demo-pg-pool-metrics',
        'demo-pg-replication',
        'demo-pg-checkpoint',
        'demo-pg-maintenance',
        'demo-pg-capacity',
        'demo-pg-backup',
        'demo-pg-security',
        'demo-pg-obs-hub',
        'demo-pg-cloudwatch',
        'demo-pg-log-patterns',
        'demo-pg-opentelemetry',
        'demo-pg-kubernetes',
        'demo-pg-status-page',
        'demo-pg-ai-monitoring',
        'demo-pg-sql',
        'demo-pg-api',
        'demo-pg-repository',
        'demo-pg-ai-advisor',
        // Demo MySQL (38 tabs — mirrors real PG sections)
        'demo-mysql-fleet',
        'demo-mysql-overview',
        'demo-mysql-performance',
        'demo-mysql-resources',
        'demo-mysql-reliability',
        'demo-mysql-alerts',
        'demo-mysql-alert-rules',
        'demo-mysql-alert-correlation',
        'demo-mysql-optimizer',
        'demo-mysql-query-plan',
        'demo-mysql-regression',
        'demo-mysql-indexes',
        'demo-mysql-bloat',
        'demo-mysql-table',
        'demo-mysql-schema-tree',
        'demo-mysql-schema',
        'demo-mysql-schema-viz',
        'demo-mysql-table-deps',
        'demo-mysql-chart-builder',
        'demo-mysql-pool',
        'demo-mysql-pool-metrics',
        'demo-mysql-replication',
        'demo-mysql-checkpoint',
        'demo-mysql-maintenance',
        'demo-mysql-capacity',
        'demo-mysql-backup',
        'demo-mysql-security',
        'demo-mysql-obs-hub',
        'demo-mysql-cloudwatch',
        'demo-mysql-log-patterns',
        'demo-mysql-opentelemetry',
        'demo-mysql-kubernetes',
        'demo-mysql-status-page',
        'demo-mysql-ai-monitoring',
        'demo-mysql-sql',
        'demo-mysql-api',
        'demo-mysql-repository',
        'demo-mysql-ai-advisor',
        // Demo MongoDB (48 tabs — mirrors uploaded HTML sidebar)
        'demo-mongo-exec-dash',
        'demo-mongo-connection',
        'demo-mongo-serverinfo',
        'demo-mongo-databases',
        'demo-mongo-join-viz',
        'demo-mongo-serverstatus',
        'demo-mongo-realtimeops',
        'demo-mongo-latency',
        'demo-mongo-namespace',
        'demo-mongo-explain',
        'demo-mongo-activeops',
        'demo-mongo-slowqueries',
        'demo-mongo-profiler',
        'demo-mongo-cost',
        'demo-mongo-locks',
        'demo-mongo-anomaly',
        'demo-mongo-metrics',
        'demo-mongo-agent',
        'demo-mongo-index-advisor',
        'demo-mongo-schema',
        'demo-mongo-collstats',
        'demo-mongo-wiredtiger',
        'demo-mongo-backup',
        'demo-mongo-capacity',
        'demo-mongo-network',
        'demo-mongo-doceditor',
        'demo-mongo-pipeline',
        'demo-mongo-nl-query',
        'demo-mongo-import-export',
        'demo-mongo-sql-translator',
        'demo-mongo-schema-compare',
        'demo-mongo-geo',
        'demo-mongo-ai-hints',
        'demo-mongo-compare',
        'demo-mongo-historical',
        'demo-mongo-perf-advisor',
        'demo-mongo-trace',
        'demo-mongo-failover',
        'demo-mongo-sharding',
        'demo-mongo-oplog',
        'demo-mongo-alert-mgr',
        'demo-mongo-prometheus',
        'demo-mongo-sso',
        'demo-mongo-atlas',
        'demo-mongo-dashboards',
        'demo-mongo-reports',
        'demo-mongo-auditlog',
        'demo-mongo-users',
    ],
};

export const DemoProvider = ({ children }) => {
    const [isDemo, setIsDemo] = useState(() => {
        try {
            const active = localStorage.getItem('vigil_demo_mode') === 'true';
            // Ensure CloudWatch demo instances are seeded if demo is already active
            if (active && !localStorage.getItem('vigil_cw_instances')) {
                localStorage.setItem(
                    'vigil_cw_instances',
                    JSON.stringify([
                        {
                            id: 'demo-rds-prod',
                            dbId: 'vigil-prod-db',
                            accessKey: 'DEMO_KEY',
                            secretKey: 'DEMO_SECRET',
                            region: 'us-east-1',
                        },
                        {
                            id: 'demo-rds-replica',
                            dbId: 'vigil-replica-db',
                            accessKey: 'DEMO_KEY',
                            secretKey: 'DEMO_SECRET',
                            region: 'us-east-1',
                        },
                    ]),
                );
            }
            return active;
        } catch {
            return false;
        }
    });

    const enterDemo = useCallback(() => {
        localStorage.setItem('vigil_demo_mode', 'true');
        // Seed CloudWatch demo instances so the tab renders metrics instead of "No Instances"
        if (!localStorage.getItem('vigil_cw_instances')) {
            localStorage.setItem(
                'vigil_cw_instances',
                JSON.stringify([
                    {
                        id: 'demo-rds-prod',
                        dbId: 'vigil-prod-db',
                        accessKey: 'DEMO_KEY',
                        secretKey: 'DEMO_SECRET',
                        region: 'us-east-1',
                    },
                    {
                        id: 'demo-rds-replica',
                        dbId: 'vigil-replica-db',
                        accessKey: 'DEMO_KEY',
                        secretKey: 'DEMO_SECRET',
                        region: 'us-east-1',
                    },
                ]),
            );
        }
        setIsDemo(true);
    }, []);

    const exitDemo = useCallback(() => {
        localStorage.removeItem('vigil_demo_mode');
        // Clean up demo CloudWatch instances (only remove if they are the demo ones)
        try {
            const cw = JSON.parse(localStorage.getItem('vigil_cw_instances') || '[]');
            if (cw.length && cw[0]?.id === 'demo-rds-prod') {
                localStorage.removeItem('vigil_cw_instances');
            }
        } catch {
            /* ignore */
        }
        setIsDemo(false);
    }, []);

    const value = useMemo(
        () => ({
            isDemo,
            demoUser: DEMO_USER,
            enterDemo,
            exitDemo,
        }),
        [isDemo, enterDemo, exitDemo],
    );

    return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export const useDemo = () => {
    const ctx = useContext(DemoContext);
    if (!ctx) throw new Error('useDemo must be used within a DemoProvider');
    return ctx;
};

export { DEMO_USER };
export default DemoContext;
