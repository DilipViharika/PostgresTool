// Fixed useMockAuth hook with password validation and localStorage persistence

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEYS = {
    USER: 'pg_monitor_user',
    ALL_USERS: 'pg_monitor_all_users'
};

const ROLE_PERMISSIONS = {
    super_admin: ['overview', 'performance', 'resources', 'reliability', 'indexes', 'sql', 'api', 'admin', 'UserManagement'],
    admin: ['overview', 'performance', 'resources', 'reliability', 'indexes', 'sql', 'api', 'UserManagement'],
    user: ['overview', 'performance', 'resources', 'reliability', 'indexes'],
    viewer: ['overview', 'performance', 'resources', 'reliability']
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