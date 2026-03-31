// ==========================================================================
//  VIGIL — License Status Badge Component
// ==========================================================================
//  Small status badge showing current license tier, expiry, usage stats
// ==========================================================================

import React, { useState } from 'react';
import { Badge, Calendar, Zap } from 'lucide-react';
import { useLicense } from '../context/LicenseContext';

const LicenseStatus = ({ showDetails = false }) => {
    const { tier, license, loading } = useLicense();
    const [isHovered, setIsHovered] = useState(false);

    if (loading) {
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#94a3b8',
            }}>
                <span style={{ animation: 'spin 0.6s linear infinite' }}>⟳</span>
                Loading...
            </div>
        );
    }

    const tierConfig = {
        community: {
            label: 'Community',
            color: '#64748b',
            bgColor: 'rgba(100,104,139,0.1)',
            icon: '◇',
        },
        pro: {
            label: 'Pro',
            color: '#00b874',
            bgColor: 'rgba(139,92,246,0.1)',
            icon: '◆',
        },
        enterprise: {
            label: 'Enterprise',
            color: '#00e5a0',
            bgColor: 'rgba(167,139,250,0.1)',
            icon: '◈',
        },
    };

    const config = tierConfig[tier] || tierConfig.community;

    const badgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}40`,
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
    };

    const badgeHoverStyle = {
        ...badgeStyle,
        backgroundColor: config.bgColor,
        boxShadow: `0 0 12px ${config.color}30`,
    };

    const contentStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        fontWeight: '600',
        color: config.color,
    };

    const tooltipStyle = {
        position: 'absolute',
        bottom: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#0d1224',
        border: `1px solid ${config.color}40`,
        borderRadius: '6px',
        padding: '10px',
        minWidth: '180px',
        fontSize: '11px',
        color: '#94a3b8',
        zIndex: 1000,
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
    };

    const handleClick = () => {
        window.location.href = '/#/admin/license';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No expiration';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div
            style={isHovered ? badgeHoverStyle : badgeStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            title="Click to view license details"
        >
            <div style={contentStyle}>
                <span>{config.icon}</span>
                {config.label}
            </div>

            {isHovered && showDetails && (
                <div style={tooltipStyle}>
                    <div style={{ marginBottom: '6px', fontWeight: '600', color: '#f1f5f9' }}>
                        License Details
                    </div>
                    {license?.expiresAt && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <Calendar size={10} />
                            <span>Expires: {formatDate(license.expiresAt)}</span>
                        </div>
                    )}
                    {license?.connectionsUsed !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <Zap size={10} />
                            <span>Connections: {license.connectionsUsed} used</span>
                        </div>
                    )}
                    {license?.usersCount !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Users: {license.usersCount}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LicenseStatus;
