// ==========================================================================
//  VIGIL — License Status Badge Component
// ==========================================================================
//  Small status badge showing current license tier, expiry, usage stats
// ==========================================================================

import React, { useState, CSSProperties } from 'react';
import { Badge, Calendar, Zap } from 'lucide-react';
import { useLicense } from '../context/LicenseContext';

interface LicenseStatusProps {
  showDetails?: boolean;
}

interface TierConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

const LicenseStatus: React.FC<LicenseStatusProps> = ({ showDetails = false }) => {
  const { tier, license, loading } = useLicense();
  const [isHovered, setIsHovered] = useState(false);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-700/10 text-xs text-slate-400">
        <span className="animate-spin">⟳</span>
        Loading...
      </div>
    );
  }

  const tierConfig: Record<string, TierConfig> = {
    community: {
      label: 'Community',
      color: '#64748b',
      bgColor: 'rgba(100,104,139,0.1)',
      icon: '◇',
    },
    pro: {
      label: 'Pro',
      color: '#38bdf8',
      bgColor: 'rgba(56,189,248,0.1)',
      icon: '◆',
    },
    enterprise: {
      label: 'Enterprise',
      color: '#a78bfa',
      bgColor: 'rgba(167,139,250,0.1)',
      icon: '◈',
    },
  };

  const config = tierConfig[tier] || tierConfig.community;

  const badgeStyle: CSSProperties = {
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

  const badgeHoverStyle: CSSProperties = {
    ...badgeStyle,
    boxShadow: `0 0 12px ${config.color}30`,
  };

  const contentStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: config.color,
  };

  const tooltipStyle: CSSProperties = {
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

  const formatDate = (dateStr: string | undefined) => {
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
