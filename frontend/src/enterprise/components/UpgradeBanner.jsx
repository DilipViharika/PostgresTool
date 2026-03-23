// ==========================================================================
//  VIGIL — Upgrade Banner Component
// ==========================================================================
//  Shows a styled banner when a feature requires a higher tier
// ==========================================================================

import React, { useMemo } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

const FEATURE_NAMES = {
    sso_saml: 'Single Sign-On (SAML)',
    advanced_analytics: 'Advanced Analytics',
    backup_recovery: 'Backup & Recovery',
    priority_support: 'Priority Support',
    api_access: 'API Access',
    reports: 'Custom Reports',
    basic_monitoring: 'Basic Monitoring',
    alerts: 'Alerts',
};

const FEATURE_DESCRIPTIONS = {
    sso_saml: 'Enable enterprise SSO and SAML authentication for your team',
    advanced_analytics: 'Unlock deep insights with advanced analytics and custom dashboards',
    backup_recovery: 'Automated backup management and point-in-time recovery',
    priority_support: 'Get priority support from our engineering team',
    api_access: 'Full API access for integration with your tools',
    reports: 'Generate and schedule custom reports',
};

const UpgradeBanner = ({ feature = 'advanced_features', tier = 'pro', ds = 'auto' }) => {
    // Determine if we're in dark mode
    const isDark = useMemo(() => {
        if (ds === 'auto') {
            try {
                const stored = localStorage.getItem('vigil_theme');
                return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
            } catch {
                return true;
            }
        }
        return ds === 'dark';
    }, [ds]);

    const featureName = FEATURE_NAMES[feature] || feature.replace(/_/g, ' ');
    const featureDesc = FEATURE_DESCRIPTIONS[feature] || `Upgrade to ${tier} tier to unlock this feature`;
    const tierDisplay = tier?.charAt(0).toUpperCase() + tier?.slice(1) || 'Pro';

    const styles = isDark ? {
        bg: '#0d1224',
        border: 'rgba(56,189,248,0.2)',
        text: '#f0f4ff',
        muted: '#94a3b8',
        accent: '#38bdf8',
        accentDark: '#0ea5e9',
    } : {
        bg: '#f8fafc',
        border: 'rgba(99,102,241,0.2)',
        text: '#1e293b',
        muted: '#64748b',
        accent: '#6366f1',
        accentDark: '#4f46e5',
    };

    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: '8px',
        marginBottom: '16px',
        width: '100%',
        boxSizing: 'border-box',
    };

    const iconContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        backgroundColor: `${styles.accent}20`,
        borderRadius: '6px',
        flexShrink: 0,
    };

    const contentStyle = {
        flex: 1,
        minWidth: 0,
    };

    const titleStyle = {
        fontSize: '14px',
        fontWeight: '600',
        color: styles.text,
        margin: '0 0 4px 0',
    };

    const descStyle = {
        fontSize: '13px',
        color: styles.muted,
        margin: '0',
        lineHeight: '1.4',
    };

    const buttonStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        backgroundColor: styles.accent,
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.2s ease',
    };

    const buttonHoverStyle = {
        ...buttonStyle,
        backgroundColor: styles.accentDark,
        transform: 'translateX(2px)',
    };

    const [isHovered, setIsHovered] = React.useState(false);

    const handleUpgradeClick = () => {
        // Navigate to license management or upgrade page
        window.location.href = '/#/admin/license';
    };

    return (
        <div style={containerStyle}>
            <div style={iconContainerStyle}>
                <Lock size={20} color={styles.accent} />
            </div>
            <div style={contentStyle}>
                <p style={titleStyle}>
                    {featureName} is available in {tierDisplay} and above
                </p>
                <p style={descStyle}>
                    {featureDesc}
                </p>
            </div>
            <button
                style={isHovered ? buttonHoverStyle : buttonStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleUpgradeClick}
                title={`Upgrade to ${tierDisplay}`}
            >
                Upgrade
                <ArrowRight size={16} />
            </button>
        </div>
    );
};

export default UpgradeBanner;
