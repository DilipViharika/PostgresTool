// ==========================================================================
//  VIGIL — License Context
// ==========================================================================
//  Manages license state: tier, features, expiration, usage
//  Fetches from GET /api/license on mount
//  Caches in state, refreshes periodically (every 5 min)
// ==========================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchData } from '../../utils/api';

const API_BASE = import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';

// ═══════════════════════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const LicenseContext = createContext(null);

// Feature availability map by tier
const FEATURE_MATRIX = {
    community: {
        basic_monitoring: true,
        alerts: true,
        reports: false,
        sso_saml: false,
        advanced_analytics: false,
        backup_recovery: false,
        priority_support: false,
        api_access: false,
    },
    pro: {
        basic_monitoring: true,
        alerts: true,
        reports: true,
        sso_saml: true,
        advanced_analytics: true,
        backup_recovery: false,
        priority_support: false,
        api_access: true,
    },
    enterprise: {
        basic_monitoring: true,
        alerts: true,
        reports: true,
        sso_saml: true,
        advanced_analytics: true,
        backup_recovery: true,
        priority_support: true,
        api_access: true,
    },
};

export const LicenseProvider = ({ children }) => {
    const [license, setLicense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch license on mount ──────────────────────────────────────────────
    useEffect(() => {
        const fetchLicense = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchData('/api/license');
                setLicense(data || { tier: 'community', features: [] });
            } catch (err) {
                console.error('Failed to fetch license:', err);
                setError(err.message);
                // Fall back to community tier
                setLicense({ tier: 'community', features: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchLicense();
    }, []);

    // ── Periodic refresh (every 5 minutes) ───────────────────────────────────
    useEffect(() => {
        if (!license) return;
        const interval = setInterval(
            async () => {
                try {
                    const data = await fetchData('/api/license');
                    setLicense(data || { tier: 'community', features: [] });
                } catch (err) {
                    console.error('Failed to refresh license:', err);
                }
            },
            5 * 60 * 1000,
        ); // 5 minutes
        return () => clearInterval(interval);
    }, [license]);

    // ── Helpers ─────────────────────────────────────────────────────────────
    const isFeatureAvailable = useCallback(
        (feature) => {
            if (!license) return false;
            const tier = license.tier || 'community';
            const features = FEATURE_MATRIX[tier] || FEATURE_MATRIX.community;
            return features[feature] === true;
        },
        [license],
    );

    const refreshLicense = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchData('/api/license');
            setLicense(data || { tier: 'community', features: [] });
        } catch (err) {
            console.error('Failed to refresh license:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Tier checks ─────────────────────────────────────────────────────────
    const tier = license?.tier || 'community';
    const isEnterprise = tier === 'enterprise';
    const isPro = tier === 'pro' || isEnterprise;
    const isCommunity = tier === 'community';

    // ── Context value ──────────────────────────────────────────────────────
    const value = useMemo(
        () => ({
            license,
            tier,
            features: license?.features || [],
            isEnterprise,
            isPro,
            isCommunity,
            isFeatureAvailable,
            refreshLicense,
            loading,
            error,
        }),
        [license, tier, isEnterprise, isPro, isCommunity, isFeatureAvailable, refreshLicense, loading, error],
    );

    return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>;
};

export const useLicense = () => {
    const ctx = useContext(LicenseContext);
    if (!ctx) throw new Error('useLicense must be used within a LicenseProvider');
    return ctx;
};

export default LicenseContext;
