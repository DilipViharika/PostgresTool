// ==========================================================================
//  VIGIL — License Gate Component
// ==========================================================================
//  Feature gating component that checks license tier
//  Usage: <LicenseGate feature="sso_saml" fallback={<UpgradeBanner feature="sso_saml" />}>
//           <SSOSettings />
//         </LicenseGate>
// ==========================================================================

import React from 'react';
import { useLicense } from '../context/LicenseContext';
import UpgradeBanner from './UpgradeBanner';

const LicenseGate = ({
    feature,
    tier = null,
    children,
    fallback = null,
}) => {
    const { isFeatureAvailable, tier: currentTier } = useLicense();

    // Check if feature is available
    const hasAccess = isFeatureAvailable(feature);

    // If tier is specified, check against current tier
    if (tier) {
        const tierHierarchy = { community: 0, pro: 1, enterprise: 2 };
        const requiredLevel = tierHierarchy[tier] || 0;
        const currentLevel = tierHierarchy[currentTier] || 0;
        if (currentLevel < requiredLevel) {
            return fallback || <UpgradeBanner feature={feature} tier={tier} />;
        }
    }

    // Check feature availability
    if (!hasAccess) {
        return fallback || <UpgradeBanner feature={feature} />;
    }

    // Feature is available, render children
    return children;
};

export default LicenseGate;
