// Fixed useMockAuth hook with password validation and localStorage persistence

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEYS = {
    USER: 'pg_monitor_user',
    ALL_USERS: 'pg_monitor_all_users'
};

const ROLE_PERMISSIONS = {
    super_admin: [
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
        'demo-mssql-overview', 'demo-mssql-performance', 'demo-mssql-resources', 'demo-mssql-reliability', 'demo-mssql-alerts', 'demo-mssql-optimizer', 'demo-mssql-indexes', 'demo-mssql-regression',
        'demo-mssql-bloat', 'demo-mssql-table', 'demo-mssql-pool', 'demo-mssql-replication', 'demo-mssql-checkpoint', 'demo-mssql-maintenance', 'demo-mssql-capacity', 'demo-mssql-backup',
        'demo-mssql-schema', 'demo-mssql-schema-viz', 'demo-mssql-security', 'demo-mssql-cloudwatch', 'demo-mssql-log-patterns', 'demo-mssql-alert-correlation', 'demo-mssql-opentelemetry', 'demo-mssql-kubernetes',
        'demo-mssql-status-page', 'demo-mssql-ai-monitoring', 'demo-mssql-sql', 'demo-mssql-api', 'demo-mssql-repository', 'demo-mssql-ai-advisor', 'demo-mssql-tasks', 'demo-mssql-users',
        'demo-mssql-admin-panel', 'demo-mssql-retention', 'demo-mssql-terraform', 'demo-mssql-custom-dashboard', 'demo-oracle-overview', 'demo-oracle-performance', 'demo-oracle-resources', 'demo-oracle-reliability',
        'demo-oracle-alerts', 'demo-oracle-optimizer', 'demo-oracle-indexes', 'demo-oracle-regression', 'demo-oracle-bloat', 'demo-oracle-table', 'demo-oracle-pool', 'demo-oracle-replication',
        'demo-oracle-checkpoint', 'demo-oracle-maintenance', 'demo-oracle-capacity', 'demo-oracle-backup', 'demo-oracle-schema', 'demo-oracle-schema-viz', 'demo-oracle-security', 'demo-oracle-cloudwatch',
        'demo-oracle-log-patterns', 'demo-oracle-alert-correlation', 'demo-oracle-opentelemetry', 'demo-oracle-kubernetes', 'demo-oracle-status-page', 'demo-oracle-ai-monitoring', 'demo-oracle-sql', 'demo-oracle-api',
        'demo-oracle-repository', 'demo-oracle-ai-advisor', 'demo-oracle-tasks', 'demo-oracle-users', 'demo-oracle-admin-panel', 'demo-oracle-retention', 'demo-oracle-terraform', 'demo-oracle-custom-dashboard',
        'demo-mongo-overview', 'demo-mongo-performance', 'demo-mongo-storage', 'demo-mongo-replication', 'demo-mongo-sharding', 'demo-mongo-data-tools',
    ],
    admin: [
        'overview', 'performance', 'resources', 'reliability', 'alerts',
        'optimizer', 'indexes', 'regression', 'bloat', 'Table',
        'pool', 'replication', 'checkpoint', 'maintenance', 'capacity', 'backup',
        'schema', 'schema-visualizer', 'security',
        'cloudwatch', 'log-patterns', 'alert-correlation',
        'opentelemetry', 'kubernetes', 'status-page', 'ai-monitoring',
        'sql', 'api', 'repository', 'ai-advisor',
        'mongo-overview', 'mongo-performance', 'mongo-storage',
        'mongo-replication', 'mongo-data-tools', 'mongo-sharding',
        'tasks', 'admin',
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
        'demo-mssql-overview', 'demo-mssql-performance', 'demo-mssql-resources', 'demo-mssql-reliability', 'demo-mssql-alerts', 'demo-mssql-optimizer', 'demo-mssql-indexes', 'demo-mssql-regression',
        'demo-mssql-bloat', 'demo-mssql-table', 'demo-mssql-pool', 'demo-mssql-replication', 'demo-mssql-checkpoint', 'demo-mssql-maintenance', 'demo-mssql-capacity', 'demo-mssql-backup',
        'demo-mssql-schema', 'demo-mssql-schema-viz', 'demo-mssql-security', 'demo-mssql-cloudwatch', 'demo-mssql-log-patterns', 'demo-mssql-alert-correlation', 'demo-mssql-opentelemetry', 'demo-mssql-kubernetes',
        'demo-mssql-status-page', 'demo-mssql-ai-monitoring', 'demo-mssql-sql', 'demo-mssql-api', 'demo-mssql-repository', 'demo-mssql-ai-advisor', 'demo-mssql-tasks', 'demo-mssql-users',
        'demo-mssql-admin-panel', 'demo-mssql-retention', 'demo-mssql-terraform', 'demo-mssql-custom-dashboard', 'demo-oracle-overview', 'demo-oracle-performance', 'demo-oracle-resources', 'demo-oracle-reliability',
        'demo-oracle-alerts', 'demo-oracle-optimizer', 'demo-oracle-indexes', 'demo-oracle-regression', 'demo-oracle-bloat', 'demo-oracle-table', 'demo-oracle-pool', 'demo-oracle-replication',
        'demo-oracle-checkpoint', 'demo-oracle-maintenance', 'demo-oracle-capacity', 'demo-oracle-backup', 'demo-oracle-schema', 'demo-oracle-schema-viz', 'demo-oracle-security', 'demo-oracle-cloudwatch',
        'demo-oracle-log-patterns', 'demo-oracle-alert-correlation', 'demo-oracle-opentelemetry', 'demo-oracle-kubernetes', 'demo-oracle-status-page', 'demo-oracle-ai-monitoring', 'demo-oracle-sql', 'demo-oracle-api',
        'demo-oracle-repository', 'demo-oracle-ai-advisor', 'demo-oracle-tasks', 'demo-oracle-users', 'demo-oracle-admin-panel', 'demo-oracle-retention', 'demo-oracle-terraform', 'demo-oracle-custom-dashboard',
        'demo-mongo-overview', 'demo-mongo-performance', 'demo-mongo-storage', 'demo-mongo-replication', 'demo-mongo-sharding', 'demo-mongo-data-tools',
    ],
    user: ['overview', 'performance', 'resources', 'reliability', 'alerts', 'indexes', 'sql', 'demo-data', 'demo-pg-overview', 'demo-pg-performance', 'demo-pg-resources', 'demo-pg-reliability', 'demo-pg-alerts', 'demo-pg-optimizer', 'demo-pg-indexes', 'demo-pg-regression', 'demo-pg-bloat', 'demo-pg-table', 'demo-pg-pool', 'demo-pg-replication', 'demo-pg-checkpoint', 'demo-pg-maintenance', 'demo-pg-capacity', 'demo-pg-backup', 'demo-pg-schema', 'demo-pg-schema-viz', 'demo-pg-security', 'demo-pg-cloudwatch', 'demo-pg-log-patterns', 'demo-pg-alert-correlation', 'demo-pg-opentelemetry', 'demo-pg-kubernetes', 'demo-pg-status-page', 'demo-pg-ai-monitoring', 'demo-pg-sql', 'demo-pg-api', 'demo-pg-repository', 'demo-pg-ai-advisor', 'demo-pg-tasks', 'demo-pg-users', 'demo-pg-admin-panel', 'demo-pg-retention', 'demo-pg-terraform', 'demo-pg-custom-dashboard', 'demo-mysql-overview', 'demo-mysql-performance', 'demo-mysql-resources', 'demo-mysql-reliability', 'demo-mysql-alerts', 'demo-mysql-optimizer', 'demo-mysql-indexes', 'demo-mysql-regression', 'demo-mysql-bloat', 'demo-mysql-table', 'demo-mysql-pool', 'demo-mysql-replication', 'demo-mysql-checkpoint', 'demo-mysql-maintenance', 'demo-mysql-capacity', 'demo-mysql-backup', 'demo-mysql-schema', 'demo-mysql-schema-viz', 'demo-mysql-security', 'demo-mysql-cloudwatch', 'demo-mysql-log-patterns', 'demo-mysql-alert-correlation', 'demo-mysql-opentelemetry', 'demo-mysql-kubernetes', 'demo-mysql-status-page', 'demo-mysql-ai-monitoring', 'demo-mysql-sql', 'demo-mysql-api', 'demo-mysql-repository', 'demo-mysql-ai-advisor', 'demo-mysql-tasks', 'demo-mysql-users', 'demo-mysql-admin-panel', 'demo-mysql-retention', 'demo-mysql-terraform', 'demo-mysql-custom-dashboard', 'demo-mssql-overview', 'demo-mssql-performance', 'demo-mssql-resources', 'demo-mssql-reliability', 'demo-mssql-alerts', 'demo-mssql-optimizer', 'demo-mssql-indexes', 'demo-mssql-regression', 'demo-mssql-bloat', 'demo-mssql-table', 'demo-mssql-pool', 'demo-mssql-replication', 'demo-mssql-checkpoint', 'demo-mssql-maintenance', 'demo-mssql-capacity', 'demo-mssql-backup', 'demo-mssql-schema', 'demo-mssql-schema-viz', 'demo-mssql-security', 'demo-mssql-cloudwatch', 'demo-mssql-log-patterns', 'demo-mssql-alert-correlation', 'demo-mssql-opentelemetry', 'demo-mssql-kubernetes', 'demo-mssql-status-page', 'demo-mssql-ai-monitoring', 'demo-mssql-sql', 'demo-mssql-api', 'demo-mssql-repository', 'demo-mssql-ai-advisor', 'demo-mssql-tasks', 'demo-mssql-users', 'demo-mssql-admin-panel', 'demo-mssql-retention', 'demo-mssql-terraform', 'demo-mssql-custom-dashboard', 'demo-oracle-overview', 'demo-oracle-performance', 'demo-oracle-resources', 'demo-oracle-reliability', 'demo-oracle-alerts', 'demo-oracle-optimizer', 'demo-oracle-indexes', 'demo-oracle-regression', 'demo-oracle-bloat', 'demo-oracle-table', 'demo-oracle-pool', 'demo-oracle-replication', 'demo-oracle-checkpoint', 'demo-oracle-maintenance', 'demo-oracle-capacity', 'demo-oracle-backup', 'demo-oracle-schema', 'demo-oracle-schema-viz', 'demo-oracle-security', 'demo-oracle-cloudwatch', 'demo-oracle-log-patterns', 'demo-oracle-alert-correlation', 'demo-oracle-opentelemetry', 'demo-oracle-kubernetes', 'demo-oracle-status-page', 'demo-oracle-ai-monitoring', 'demo-oracle-sql', 'demo-oracle-api', 'demo-oracle-repository', 'demo-oracle-ai-advisor', 'demo-oracle-tasks', 'demo-oracle-users', 'demo-oracle-admin-panel', 'demo-oracle-retention', 'demo-oracle-terraform', 'demo-oracle-custom-dashboard', 'demo-mongo-overview', 'demo-mongo-performance', 'demo-mongo-storage', 'demo-mongo-replication', 'demo-mongo-sharding', 'demo-mongo-data-tools'],
    viewer: ['overview', 'performance', 'resources', 'reliability', 'demo-data', 'demo-pg-overview', 'demo-pg-performance', 'demo-pg-resources', 'demo-pg-reliability', 'demo-pg-alerts', 'demo-pg-optimizer', 'demo-pg-indexes', 'demo-pg-regression', 'demo-pg-bloat', 'demo-pg-table', 'demo-pg-pool', 'demo-pg-replication', 'demo-pg-checkpoint', 'demo-pg-maintenance', 'demo-pg-capacity', 'demo-pg-backup', 'demo-pg-schema', 'demo-pg-schema-viz', 'demo-pg-security', 'demo-pg-cloudwatch', 'demo-pg-log-patterns', 'demo-pg-alert-correlation', 'demo-pg-opentelemetry', 'demo-pg-kubernetes', 'demo-pg-status-page', 'demo-pg-ai-monitoring', 'demo-pg-sql', 'demo-pg-api', 'demo-pg-repository', 'demo-pg-ai-advisor', 'demo-pg-tasks', 'demo-pg-users', 'demo-pg-admin-panel', 'demo-pg-retention', 'demo-pg-terraform', 'demo-pg-custom-dashboard', 'demo-mysql-overview', 'demo-mysql-performance', 'demo-mysql-resources', 'demo-mysql-reliability', 'demo-mysql-alerts', 'demo-mysql-optimizer', 'demo-mysql-indexes', 'demo-mysql-regression', 'demo-mysql-bloat', 'demo-mysql-table', 'demo-mysql-pool', 'demo-mysql-replication', 'demo-mysql-checkpoint', 'demo-mysql-maintenance', 'demo-mysql-capacity', 'demo-mysql-backup', 'demo-mysql-schema', 'demo-mysql-schema-viz', 'demo-mysql-security', 'demo-mysql-cloudwatch', 'demo-mysql-log-patterns', 'demo-mysql-alert-correlation', 'demo-mysql-opentelemetry', 'demo-mysql-kubernetes', 'demo-mysql-status-page', 'demo-mysql-ai-monitoring', 'demo-mysql-sql', 'demo-mysql-api', 'demo-mysql-repository', 'demo-mysql-ai-advisor', 'demo-mysql-tasks', 'demo-mysql-users', 'demo-mysql-admin-panel', 'demo-mysql-retention', 'demo-mysql-terraform', 'demo-mysql-custom-dashboard', 'demo-mssql-overview', 'demo-mssql-performance', 'demo-mssql-resources', 'demo-mssql-reliability', 'demo-mssql-alerts', 'demo-mssql-optimizer', 'demo-mssql-indexes', 'demo-mssql-regression', 'demo-mssql-bloat', 'demo-mssql-table', 'demo-mssql-pool', 'demo-mssql-replication', 'demo-mssql-checkpoint', 'demo-mssql-maintenance', 'demo-mssql-capacity', 'demo-mssql-backup', 'demo-mssql-schema', 'demo-mssql-schema-viz', 'demo-mssql-security', 'demo-mssql-cloudwatch', 'demo-mssql-log-patterns', 'demo-mssql-alert-correlation', 'demo-mssql-opentelemetry', 'demo-mssql-kubernetes', 'demo-mssql-status-page', 'demo-mssql-ai-monitoring', 'demo-mssql-sql', 'demo-mssql-api', 'demo-mssql-repository', 'demo-mssql-ai-advisor', 'demo-mssql-tasks', 'demo-mssql-users', 'demo-mssql-admin-panel', 'demo-mssql-retention', 'demo-mssql-terraform', 'demo-mssql-custom-dashboard', 'demo-oracle-overview', 'demo-oracle-performance', 'demo-oracle-resources', 'demo-oracle-reliability', 'demo-oracle-alerts', 'demo-oracle-optimizer', 'demo-oracle-indexes', 'demo-oracle-regression', 'demo-oracle-bloat', 'demo-oracle-table', 'demo-oracle-pool', 'demo-oracle-replication', 'demo-oracle-checkpoint', 'demo-oracle-maintenance', 'demo-oracle-capacity', 'demo-oracle-backup', 'demo-oracle-schema', 'demo-oracle-schema-viz', 'demo-oracle-security', 'demo-oracle-cloudwatch', 'demo-oracle-log-patterns', 'demo-oracle-alert-correlation', 'demo-oracle-opentelemetry', 'demo-oracle-kubernetes', 'demo-oracle-status-page', 'demo-oracle-ai-monitoring', 'demo-oracle-sql', 'demo-oracle-api', 'demo-oracle-repository', 'demo-oracle-ai-advisor', 'demo-oracle-tasks', 'demo-oracle-users', 'demo-oracle-admin-panel', 'demo-oracle-retention', 'demo-oracle-terraform', 'demo-oracle-custom-dashboard', 'demo-mongo-overview', 'demo-mongo-performance', 'demo-mongo-storage', 'demo-mongo-replication', 'demo-mongo-sharding', 'demo-mongo-data-tools']
};

export const useMockAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load current user from localStorage on mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading current user:', error);
        } finally {
            setIsInitializing(false);
        }
    }, []);

    // Get all users from localStorage
    const getAllUsers = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }

        // Return default admin if no users exist
        return [{
            id: 1,
            name: 'System Administrator',
            email: 'admin',
            password: 'admin', // Default password
            role: 'super_admin',
            status: 'active',
            createdAt: new Date().toISOString(),
            allowedScreens: ROLE_PERMISSIONS.super_admin
        }];
    }, []);

    const login = useCallback(async (loginId, password) => {
        setLoading(true);
        setError(null);

        return new Promise((resolve) => {
            setTimeout(() => {
                // Get all users from localStorage
                const allUsers = getAllUsers();

                // Find user by email or username
                const foundUser = allUsers.find(u =>
                    u.email.toLowerCase() === loginId.toLowerCase()
                );

                if (!foundUser) {
                    setError('Invalid credentials. User not found.');
                    setLoading(false);
                    resolve(false);
                    return;
                }

                // Check if user is active
                if (foundUser.status === 'inactive') {
                    setError('This account has been deactivated. Please contact an administrator.');
                    setLoading(false);
                    resolve(false);
                    return;
                }

                // Validate password
                if (foundUser.password !== password) {
                    setError('Invalid credentials. Incorrect password.');
                    setLoading(false);
                    resolve(false);
                    return;
                }

                // Create user session (without password)
                const userSession = {
                    id: foundUser.id,
                    name: foundUser.name,
                    email: foundUser.email,
                    role: foundUser.role,
                    accessLevel: foundUser.role === 'super_admin' || foundUser.role === 'admin' ? 'write' : 'read',
                    allowedScreens: foundUser.allowedScreens || [],
                    status: foundUser.status
                };

                // Save to state and localStorage
                setCurrentUser(userSession);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userSession));

                setLoading(false);
                resolve(true);
            }, 1000); // Simulate network delay
        });
    }, [getAllUsers]);

    const googleLogin = useCallback(async (email, name) => {
        setLoading(true);
        return new Promise((resolve) => {
            setTimeout(() => {
                const googleUser = {
                    id: 999 + Math.floor(Math.random() * 1000),
                    email: email || 'google_user@gmail.com',
                    name: name || 'Google User',
                    role: 'viewer',
                    accessLevel: 'read',
                    allowedScreens: ROLE_PERMISSIONS.viewer,
                    status: 'active'
                };

                setCurrentUser(googleUser);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(googleUser));
                setLoading(false);
                resolve(true);
            }, 1500);
        });
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
    }, []);

    const updateUser = useCallback((updatedData) => {
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...updatedData };
        setCurrentUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

        // Also update in all users list
        try {
            const allUsers = getAllUsers();
            const updatedAllUsers = allUsers.map(u =>
                u.id === currentUser.id ? { ...u, ...updatedData } : u
            );
            localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(updatedAllUsers));
        } catch (error) {
            console.error('Error updating user in all users list:', error);
        }
    }, [currentUser, getAllUsers]);

    return {
        currentUser,
        isInitializing,
        loading,
        error,
        login,
        googleLogin,
        logout,
        updateUser,
        getAllUsers
    };
};