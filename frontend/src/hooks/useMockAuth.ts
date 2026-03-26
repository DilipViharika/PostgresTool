// Fixed useMockAuth hook with password validation and localStorage persistence

import { useState, useCallback, useEffect } from 'react';

interface StorageKeys {
    USER: string;
    ALL_USERS: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'super_admin' | 'admin' | 'user' | 'viewer';
    status: 'active' | 'inactive';
    createdAt: string;
    allowedScreens: string[];
}

interface UserSession {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'user' | 'viewer';
    accessLevel: 'write' | 'read';
    allowedScreens: string[];
    status: 'active' | 'inactive';
}

interface RolePermissions {
    [role: string]: string[];
}

const STORAGE_KEYS: StorageKeys = {
    USER: 'pg_monitor_user',
    ALL_USERS: 'pg_monitor_all_users'
};

const ROLE_PERMISSIONS: RolePermissions = {
    super_admin: [
        'overview', 'performance', 'resources', 'reliability', 'alerts',
        'optimizer', 'indexes', 'regression', 'bloat', 'Table',
        'pool', 'replication', 'checkpoint', 'maintenance', 'capacity', 'backup',
        'schema', 'schema-visualizer', 'table-dependencies', 'security',
        'observability-hub', 'cloudwatch', 'log-patterns', 'alert-correlation',
        'opentelemetry', 'kubernetes', 'status-page', 'ai-monitoring',
        'sql', 'api', 'repository', 'ai-advisor',
        'mongo-overview', 'mongo-performance', 'mongo-storage',
        'mongo-replication', 'mongo-data-tools', 'mongo-sharding',
        'tasks', 'UserManagement', 'admin',
        'retention', 'report-builder', 'terraform', 'custom-dashboard',
    ],
    admin: [
        'overview', 'performance', 'resources', 'reliability', 'alerts',
        'optimizer', 'indexes', 'regression', 'bloat', 'Table',
        'pool', 'replication', 'checkpoint', 'maintenance', 'capacity', 'backup',
        'schema', 'schema-visualizer', 'table-dependencies', 'security',
        'observability-hub', 'cloudwatch', 'log-patterns', 'alert-correlation',
        'opentelemetry', 'kubernetes', 'status-page', 'ai-monitoring',
        'sql', 'api', 'repository', 'ai-advisor',
        'mongo-overview', 'mongo-performance', 'mongo-storage',
        'mongo-replication', 'mongo-data-tools', 'mongo-sharding',
        'tasks', 'admin',
        'retention', 'report-builder', 'terraform', 'custom-dashboard',
    ],
    user: [
        'overview', 'performance', 'resources', 'reliability', 'alerts',
        'optimizer', 'indexes', 'regression', 'bloat', 'Table',
        'pool', 'replication', 'checkpoint', 'maintenance',
        'schema', 'schema-visualizer',
        'cloudwatch', 'log-patterns',
        'sql', 'api', 'repository',
        'mongo-overview', 'mongo-performance', 'mongo-storage',
        'mongo-replication', 'mongo-data-tools', 'mongo-sharding',
    ],
    viewer: [
        'overview', 'performance', 'resources', 'reliability',
        'mongo-overview', 'mongo-performance', 'mongo-storage',
    ],
};

interface UseMockAuthReturn {
    currentUser: UserSession | null;
    isInitializing: boolean;
    loading: boolean;
    error: string | null;
    login: (loginId: string, password: string) => Promise<boolean>;
    googleLogin: (email: string, name: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (updatedData: Partial<UserSession>) => void;
    getAllUsers: () => User[];
}

export const useMockAuth = (): UseMockAuthReturn => {
    const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load current user from localStorage on mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser) as UserSession);
            }
        } catch (err) {
            console.error('Error loading current user:', err);
        } finally {
            setIsInitializing(false);
        }
    }, []);

    // Get all users from localStorage
    const getAllUsers = useCallback((): User[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
            if (stored) {
                return JSON.parse(stored) as User[];
            }
        } catch (err) {
            console.error('Error loading users:', err);
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

    const login = useCallback(async (loginId: string, password: string): Promise<boolean> => {
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
                const userSession: UserSession = {
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

    const googleLogin = useCallback(async (email: string, name: string): Promise<boolean> => {
        setLoading(true);
        return new Promise((resolve) => {
            setTimeout(() => {
                const googleUser: UserSession = {
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

    const logout = useCallback((): void => {
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
    }, []);

    const updateUser = useCallback((updatedData: Partial<UserSession>): void => {
        if (!currentUser) return;

        const updatedUser: UserSession = { ...currentUser, ...updatedData };
        setCurrentUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

        // Also update in all users list
        try {
            const allUsers = getAllUsers();
            const updatedAllUsers = allUsers.map(u =>
                u.id === currentUser.id ? { ...u, ...updatedData } as User : u
            );
            localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(updatedAllUsers));
        } catch (err) {
            console.error('Error updating user in all users list:', err);
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
