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
        'overview', 'performance', 'resources', 'reliability', 'alerts',
        'optimizer', 'indexes', 'regression', 'bloat', 'Table',
        'pool', 'replication', 'checkpoint', 'maintenance', 'capacity', 'backup',
        'schema', 'schema-visualizer', 'security',
        'cloudwatch', 'log-patterns', 'alert-correlation',
        'opentelemetry', 'kubernetes', 'status-page', 'ai-monitoring',
        'sql', 'api', 'repository', 'ai-advisor',
        'mongo-overview', 'mongo-performance', 'mongo-storage',
        'mongo-replication', 'mongo-data-tools', 'mongo-sharding',
        'tasks', 'UserManagement', 'admin',
        'retention', 'terraform', 'custom-dashboard', 'demo-data',
        'demo-pg-core', 'demo-pg-query', 'demo-pg-infra', 'demo-pg-schema', 'demo-pg-observability', 'demo-pg-dev', 'demo-pg-admin',
        'demo-mysql-core', 'demo-mysql-query', 'demo-mysql-infra', 'demo-mysql-schema', 'demo-mysql-observability', 'demo-mysql-admin',
        'demo-mssql-core', 'demo-mssql-query', 'demo-mssql-infra', 'demo-mssql-schema', 'demo-mssql-observability', 'demo-mssql-admin',
        'demo-oracle-core', 'demo-oracle-query', 'demo-oracle-infra', 'demo-oracle-schema', 'demo-oracle-observability', 'demo-oracle-admin',
        'demo-mongo-overview', 'demo-mongo-performance', 'demo-mongo-storage', 'demo-mongo-data', 'demo-mongo-intelligence', 'demo-mongo-replication', 'demo-mongo-management',
    ],
};

export const DemoProvider = ({ children }) => {
    const [isDemo, setIsDemo] = useState(() => {
        try {
            const active = localStorage.getItem('vigil_demo_mode') === 'true';
            // Ensure CloudWatch demo instances are seeded if demo is already active
            if (active && !localStorage.getItem('vigil_cw_instances')) {
                localStorage.setItem('vigil_cw_instances', JSON.stringify([
                    { id: 'demo-rds-prod', dbId: 'vigil-prod-db', accessKey: 'DEMO_KEY', secretKey: 'DEMO_SECRET', region: 'us-east-1' },
                    { id: 'demo-rds-replica', dbId: 'vigil-replica-db', accessKey: 'DEMO_KEY', secretKey: 'DEMO_SECRET', region: 'us-east-1' },
                ]));
            }
            return active;
        }
        catch { return false; }
    });

    const enterDemo = useCallback(() => {
        localStorage.setItem('vigil_demo_mode', 'true');
        // Seed CloudWatch demo instances so the tab renders metrics instead of "No Instances"
        if (!localStorage.getItem('vigil_cw_instances')) {
            localStorage.setItem('vigil_cw_instances', JSON.stringify([
                { id: 'demo-rds-prod', dbId: 'vigil-prod-db', accessKey: 'DEMO_KEY', secretKey: 'DEMO_SECRET', region: 'us-east-1' },
                { id: 'demo-rds-replica', dbId: 'vigil-replica-db', accessKey: 'DEMO_KEY', secretKey: 'DEMO_SECRET', region: 'us-east-1' },
            ]));
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
        } catch { /* ignore */ }
        setIsDemo(false);
    }, []);

    const value = useMemo(() => ({
        isDemo,
        demoUser: DEMO_USER,
        enterDemo,
        exitDemo,
    }), [isDemo, enterDemo, exitDemo]);

    return (
        <DemoContext.Provider value={value}>
            {children}
        </DemoContext.Provider>
    );
};

export const useDemo = () => {
    const ctx = useContext(DemoContext);
    if (!ctx) throw new Error('useDemo must be used within a DemoProvider');
    return ctx;
};

export { DEMO_USER };
export default DemoContext;
