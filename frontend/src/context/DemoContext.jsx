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
        'schema', 'security',
        'cloudwatch', 'log-patterns', 'alert-correlation',
        'opentelemetry', 'kubernetes', 'status-page',
        'sql', 'api', 'repository', 'ai-advisor',
        'tasks', 'UserManagement', 'admin',
        'retention', 'terraform', 'custom-dashboard',
    ],
};

export const DemoProvider = ({ children }) => {
    const [isDemo, setIsDemo] = useState(() => {
        try { return localStorage.getItem('vigil_demo_mode') === 'true'; }
        catch { return false; }
    });

    const enterDemo = useCallback(() => {
        localStorage.setItem('vigil_demo_mode', 'true');
        setIsDemo(true);
    }, []);

    const exitDemo = useCallback(() => {
        localStorage.removeItem('vigil_demo_mode');
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
