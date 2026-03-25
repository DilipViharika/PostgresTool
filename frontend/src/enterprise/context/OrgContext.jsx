// ==========================================================================
//  VIGIL — Organization Context
// ==========================================================================
//  Manages multi-tenant organization state
//  Fetches from GET /api/organizations on mount
//  Persists active org in localStorage as 'vigil_active_org'
// ==========================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchData, postData } from '../../utils/api';

const API_BASE = import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';
const STORAGE_KEY = 'vigil_active_org';

// ═══════════════════════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const OrgContext = createContext(null);

export const OrgProvider = ({ children }) => {
    const [organizations, setOrganizations] = useState([]);
    const [currentOrg, setCurrentOrg] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch organizations on mount ────────────────────────────────────────
    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchData('/api/organizations');
                const orgs = Array.isArray(data) ? data : data?.organizations || [];
                setOrganizations(orgs);

                // Restore active org from localStorage or use first
                const savedOrgId = localStorage.getItem(STORAGE_KEY);
                const active = orgs.find((o) => o.id === savedOrgId) || orgs[0] || null;
                setCurrentOrg(active);

                // Fetch members for current org
                if (active?.id) {
                    try {
                        const membersData = await fetchData(`/api/organizations/${active.id}/members`);
                        setMembers(Array.isArray(membersData) ? membersData : membersData?.members || []);
                    } catch (err) {
                        console.error('Failed to fetch members:', err);
                        setMembers([]);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch organizations:', err);
                setError(err.message);
                setOrganizations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrgs();
    }, []);

    // ── Switch organization ─────────────────────────────────────────────────
    const switchOrg = useCallback(
        async (orgId) => {
            try {
                const org = organizations.find((o) => o.id === orgId);
                if (!org) throw new Error('Organization not found');

                setCurrentOrg(org);
                localStorage.setItem(STORAGE_KEY, orgId);

                // Fetch members for new org
                try {
                    const membersData = await fetchData(`/api/organizations/${orgId}/members`);
                    setMembers(Array.isArray(membersData) ? membersData : membersData?.members || []);
                } catch (err) {
                    console.error('Failed to fetch members:', err);
                    setMembers([]);
                }
            } catch (err) {
                console.error('Failed to switch organization:', err);
                setError(err.message);
            }
        },
        [organizations],
    );

    // ── Refresh organizations ───────────────────────────────────────────────
    const refreshOrgs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchData('/api/organizations');
            const orgs = Array.isArray(data) ? data : data?.organizations || [];
            setOrganizations(orgs);

            // Refresh current org if still valid
            if (currentOrg?.id) {
                const updated = orgs.find((o) => o.id === currentOrg.id);
                if (updated) {
                    setCurrentOrg(updated);
                    // Refresh members
                    try {
                        const membersData = await fetchData(`/api/organizations/${currentOrg.id}/members`);
                        setMembers(Array.isArray(membersData) ? membersData : membersData?.members || []);
                    } catch (err) {
                        console.error('Failed to refresh members:', err);
                    }
                } else {
                    // Current org no longer exists, switch to first
                    const active = orgs[0] || null;
                    setCurrentOrg(active);
                    if (active?.id) {
                        localStorage.setItem(STORAGE_KEY, active.id);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to refresh organizations:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentOrg]);

    // ── Context value ──────────────────────────────────────────────────────
    const value = useMemo(
        () => ({
            currentOrg,
            organizations,
            switchOrg,
            refreshOrgs,
            members,
            loading,
            error,
        }),
        [currentOrg, organizations, switchOrg, refreshOrgs, members, loading, error],
    );

    return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export const useOrg = () => {
    const ctx = useContext(OrgContext);
    if (!ctx) throw new Error('useOrg must be used within an OrgProvider');
    return ctx;
};

export default OrgContext;
