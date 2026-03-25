// ==========================================================================
//  VIGIL — Demo Mode Context
// ==========================================================================
//  When demo mode is active, API calls return realistic sample data
//  without needing a real PostgreSQL connection.
// ==========================================================================

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface DemoUser {
    id: string;
    username: string;
    name: string;
    role: string;
    accessLevel: 'read' | 'write';
    allowedScreens: string[];
}

interface DemoContextValue {
    isDemo: boolean;
    demoUser: DemoUser;
    enterDemo: () => void;
    exitDemo: () => void;
}

interface DemoProviderProps {
    children: ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
//  DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════

const DEMO_USER: DemoUser = {
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
        'demo-pg-overview', 'demo-pg-performance', 'demo-pg-resources', 'demo-pg-reliability', 'demo-pg-alerts', 'demo-pg-optimizer', 'demo-pg-indexes', 'demo-pg-regression',
        'demo-pg-bloat', 'demo-pg-table', 'demo-pg-pool', 'demo-pg-replication', 'demo-pg-checkpoint', 'demo-pg-maintenance', 'demo-pg-capacity', 'demo-pg-backup',
        'demo-pg-schema', 'demo-pg-schema-viz', 'demo-pg-security', 'demo-pg-cloudwatch', 'demo-pg-log-patterns', 'demo-pg-alert-correlation', 'demo-pg-opentelemetry', 'demo-pg-kubernetes',
        'demo-pg-status-page', 'demo-pg-ai-monitoring', 'demo-pg-sql', 'demo-pg-api', 'demo-pg-repository', 'demo-pg-ai-advisor', 'demo-pg-tasks', 'demo-pg-users',
        'demo-pg-admin-panel', 'demo-pg-retention', 'demo-pg-terraform', 'demo-pg-custom-dashboard', 'demo-mysql-overview', 'demo-mysql-performance', 'demo-mysql-resources', 'demo-mysql-reliability',
        'demo-mysql-alerts', 'demo-mysql-optimizer', 'demo-mysql-indexes', 'demo-mysql-regression', 'demo-mysql-bloat', 'demo-mysql-table', 'demo-mysql-pool', 'demo-mysql-replication',
        'demo-mysql-checkpoint', 'demo-mysql-maintenance', 'demo-mysql-capacity', 'demo-mysql-backup', 'demo-mysql-schema', 'demo-mysql-schema-viz', 'demo-mysql-security', 'demo-mysql-cloudwatch',
        'demo-mysql-log-patterns', 'demo-mysql-alert-correlation', 'demo-mysql-opentelemetry', 'demo-mysql-kubernetes', 'demo-mysql-status-page', 'demo-mysql-ai-monitoring', 'demo-mysql-sql', 'demo-mysql-api',
        'demo-mysql-repository', 'demo-mysql-ai-advisor', 'demo-mysql-tasks', 'demo-mysql-users', 'demo-mysql-admin-panel', 'demo-mysql-retention', 'demo-mysql-terraform', 'demo-mysql-custom-dashboard',
        'demo-mongo-overview', 'demo-mongo-performance', 'demo-mongo-storage', 'demo-mongo-replication', 'demo-mongo-sharding', 'demo-mongo-data-tools',
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const DemoContext = createContext<DemoContextValue | null>(null);

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
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

    const value = useMemo<DemoContextValue>(() => ({
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

export const useDemo = (): DemoContextValue => {
    const ctx = useContext(DemoContext);
    if (!ctx) throw new Error('useDemo must be used within a DemoProvider');
    return ctx;
};

export { DEMO_USER };
export default DemoContext;
