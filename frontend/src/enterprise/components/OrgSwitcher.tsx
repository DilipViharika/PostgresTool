// ==========================================================================
//  VIGIL — Organization Switcher Component
// ==========================================================================
//  Organization selector dropdown for multi-tenant users
//  Shows current org name with a dropdown to switch
// ==========================================================================

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { useOrg } from '../context/OrgContext';

const OrgSwitcher = () => {
    const { currentOrg, organizations, switchOrg } = useOrg();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Hide dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Only show if user has multiple orgs
    if (organizations.length <= 1) {
        return null;
    }

    const handleSwitchOrg = (orgId) => {
        switchOrg(orgId);
        setIsOpen(false);
    };

    const styles = {
        container: {
            position: 'relative',
            display: 'inline-block',
            width: '100%',
        },
        button: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '10px 12px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            color: '#f1f5f9',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '100%',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
        },
        buttonHover: {
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(139,92,246,0.2)',
        },
        dropdown: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: '#0d1224',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '6px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            zIndex: 1000,
            minWidth: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
        },
        orgItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            color: '#94a3b8',
            fontSize: '13px',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.15s ease',
        },
        orgItemHover: {
            backgroundColor: 'rgba(139,92,246,0.1)',
            color: '#f1f5f9',
        },
        orgItemActive: {
            backgroundColor: 'rgba(139,92,246,0.15)',
            color: '#00b874',
            fontWeight: '600',
        },
        avatar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            backgroundColor: 'rgba(139,92,246,0.2)',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            flexShrink: 0,
        },
        orgInfo: {
            flex: 1,
            minWidth: 0,
        },
        orgName: {
            fontSize: '13px',
            fontWeight: '500',
            margin: '0 0 2px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        memberCount: {
            fontSize: '11px',
            opacity: '0.7',
            margin: '0',
        },
    };

    const getOrgInitials = (org) => {
        if (!org?.name) return '?';
        return org.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const [buttonHover, setButtonHover] = useState(false);

    return (
        <div style={styles.container} ref={dropdownRef}>
            <button
                style={{
                    ...styles.button,
                    ...(buttonHover ? styles.buttonHover : {}),
                }}
                onMouseEnter={() => setButtonHover(true)}
                onMouseLeave={() => setButtonHover(false)}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <Users size={16} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentOrg?.name || 'Select Organization'}
                    </span>
                </div>
                <ChevronDown
                    size={16}
                    style={{
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        flexShrink: 0,
                    }}
                />
            </button>

            {isOpen && (
                <div style={styles.dropdown}>
                    {organizations.map((org) => {
                        const [itemHover, setItemHover] = React.useState(false);
                        const isActive = currentOrg?.id === org.id;
                        return (
                            <div
                                key={org.id}
                                style={{
                                    ...styles.orgItem,
                                    ...(isActive ? styles.orgItemActive : itemHover ? styles.orgItemHover : {}),
                                }}
                                onMouseEnter={() => setItemHover(true)}
                                onMouseLeave={() => setItemHover(false)}
                                onClick={() => handleSwitchOrg(org.id)}
                            >
                                <div style={styles.avatar}>
                                    {getOrgInitials(org)}
                                </div>
                                <div style={styles.orgInfo}>
                                    <p style={styles.orgName}>{org.name}</p>
                                    <p style={styles.memberCount}>
                                        {org.memberCount || 0} members
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrgSwitcher;
