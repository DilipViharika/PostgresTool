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
        // Demo PostgreSQL
        'demo-pg-overview',
        'demo-pg-connections',
        'demo-pg-query-summary',
        'demo-pg-active-alerts',
        'demo-pg-rule-config',
        'demo-pg-notifications',
        'demo-pg-optimizer',
        'demo-pg-indexes',
        'demo-pg-bloat',
        'demo-pg-replication',
        'demo-pg-backup',
        'demo-pg-capacity',
        'demo-pg-audit',
        'demo-pg-encryption',
        'demo-pg-access',
        'demo-pg-sql',
        'demo-pg-users',
        'demo-pg-tasks',
        // Demo MySQL
        'demo-mysql-overview',
        'demo-mysql-connections',
        'demo-mysql-query-summary',
        'demo-mysql-active-alerts',
        'demo-mysql-rule-config',
        'demo-mysql-notifications',
        'demo-mysql-optimizer',
        'demo-mysql-indexes',
        'demo-mysql-bloat',
        'demo-mysql-replication',
        'demo-mysql-backup',
        'demo-mysql-capacity',
        'demo-mysql-audit',
        'demo-mysql-encryption',
        'demo-mysql-access',
        'demo-mysql-sql',
        'demo-mysql-users',
        'demo-mysql-tasks',
        // Demo MongoDB
        'demo-mongo-overview',
        'demo-mongo-connections',
        'demo-mongo-ops-summary',
        'demo-mongo-active-alerts',
        'demo-mongo-rule-config',
        'demo-mongo-notifications',
        'demo-mongo-storage',
        'demo-mongo-sharding',
        'demo-mongo-data-tools',
        'demo-mongo-replication',
        'demo-mongo-backup',
        'demo-mongo-capacity',
        'demo-mongo-audit',
        'demo-mongo-encryption',
        'demo-mongo-access',
        'demo-mongo-shell',
        'demo-mongo-users',
        'demo-mongo-tasks',
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
