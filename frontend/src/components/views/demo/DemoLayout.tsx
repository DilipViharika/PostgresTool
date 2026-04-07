import React, { useState } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { useNavigation } from '../../../context/NavigationContext';
import { ChevronDown, ChevronRight, ArrowUpRight, ArrowDownRight, Bell, User, Database } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   DemoLayout — Clean Light Theme design with:
   - Top header bar (56px) with breadcrumb, title, stats, live badge, notification, avatar
   - Enhanced sidebar with logo, tier badge, active cluster dropdown, nav badges, bottom buttons
   - Bottom status bar (24px) with cluster/version info
   - Full-height layout with independent scrolling

   Props:
     sections:  Array of { key, label, icon, accent, items: [{ key, label, badge? }] }
     renderContent: (sectionKey, itemKey) => React.Element
     title: string — top-left sidebar label
     accentColor: string — primary accent color
     titleIcon: React.Component — icon for sidebar header
     headerStats: Array of { value, label, color } — right-side stat pills in header
     clusterOptions: Array of string — cluster dropdown options (default: ['Local Dev'])
     statusItems: Array of { label, value, color? } — bottom status bar items
     onRefresh: Function — callback for Refresh button
     onExport: Function — callback for Export button
   ═══════════════════════════════════════════════════════════════════════════ */

const SIDEBAR_W = 240;

const DEMO_TABS = [
    { id: 'demo-postgres', label: 'PostgreSQL', short: 'PG' },
    { id: 'demo-mysql', label: 'MySQL', short: 'MY' },
    { id: 'demo-mongodb', label: 'MongoDB', short: 'MO' },
];

/* ── Light theme color palette ── */
const LT = {
    bg: '#f0f4f8',
    surface: '#ffffff',
    surfaceHover: '#f8fafc',
    sidebarBg: '#ffffff',
    headerBg: 'rgba(255,255,255,0.92)',
    footerBg: 'rgba(248,250,252,0.95)',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderAccent: 'rgba(139,92,246,0.15)',
    text: '#0f172a',
    textMuted: '#475569',
    textDim: '#94a3b8',
    primary: '#6366f1',
    secondary: '#10b981',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#d97706',
    info: '#0284c7',
    ai: '#4f46e5',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    cardShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    cardShadowHover: '0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
    activeItemBg: 'rgba(139,92,246,0.08)',
    activeItemBorder: '#6366f1',
    hoverBg: 'rgba(139,92,246,0.04)',
    badgeBg: 'rgba(139,92,246,0.1)',
    badgeColor: '#0284c7',
    liveBg: 'rgba(22,163,74,0.08)',
    liveBorder: 'rgba(22,163,74,0.2)',
    liveColor: '#16a34a',
    buttonBg: '#f1f5f9',
    buttonHoverBg: '#e2e8f0',
    accentGradient: 'linear-gradient(135deg, #6366f1, #10b981)',
};

const DemoLayout = ({
    sections = [],
    renderContent,
    title,
    accentColor,
    titleIcon: TitleIcon,
    headerStats = [],
    clusterOptions = ['Local Dev'],
    statusItems = [],
    onRefresh,
    onExport,
    activeDemo = 'demo-postgres',
}) => {
    useAdaptiveTheme();
    let goToTab = null;
    try {
        const nav = useNavigation();
        goToTab = nav?.goToTab;
    } catch (e) {
        /* outside NavigationContext */
    }

    const [activeSection, setActiveSection] = useState(sections[0]?.key || '');
    const [activeItem, setActiveItem] = useState(sections[0]?.items?.[0]?.key || '');
    const [openSections, setOpenSections] = useState(() => new Set(sections.map((s) => s.key)));
    const [activeCluster, setActiveCluster] = useState(clusterOptions[0] || 'Local Dev');

    const toggleSection = (key) => {
        setOpenSections((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const handleItemClick = (sectionKey, itemKey) => {
        setActiveSection(sectionKey);
        setActiveItem(itemKey);
        if (!openSections.has(sectionKey)) {
            setOpenSections((prev) => new Set(prev).add(sectionKey));
        }
    };

    const activeItemData = sections.find((s) => s.key === activeSection)?.items?.find((i) => i.key === activeItem);

    return (
        <div
            style={{
                display: 'flex',
                height: '100%',
                minHeight: '100vh',
                position: 'relative',
                background: LT.bg,
                flexDirection: 'column',
            }}
        >
            <DemoStyles />

            {/* Main flex wrapper for sidebar + content */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                {/* ── SIDEBAR ── */}
                <aside
                    style={{
                        width: SIDEBAR_W,
                        minWidth: SIDEBAR_W,
                        background: LT.sidebarBg,
                        borderRight: `1px solid ${LT.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        position: 'sticky',
                        top: 0,
                        alignSelf: 'flex-start',
                        height: '100vh',
                        zIndex: 2,
                        boxShadow: '1px 0 3px rgba(0,0,0,0.04)',
                    }}
                >
                    {/* Logo + Title + Demo Switcher */}
                    <div
                        style={{
                            padding: '12px 14px',
                            borderBottom: `1px solid ${LT.border}`,
                            background: LT.surface,
                            flexShrink: 0,
                        }}
                    >
                        {/* Title row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            {goToTab && (
                                <button
                                    onClick={() => goToTab('connections')}
                                    title="Back to main menu"
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 7,
                                        border: `1px solid ${LT.border}`,
                                        background: LT.buttonBg,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        padding: 0,
                                        transition: 'all 0.15s ease',
                                        fontSize: 14,
                                        color: LT.textMuted,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = LT.buttonHoverBg;
                                        e.currentTarget.style.color = LT.text;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = LT.buttonBg;
                                        e.currentTarget.style.color = LT.textMuted;
                                    }}
                                >
                                    ←
                                </button>
                            )}
                            {TitleIcon && (
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: `${accentColor || LT.primary}12`,
                                        border: `1px solid ${accentColor || LT.primary}20`,
                                    }}
                                >
                                    <TitleIcon size={16} color={accentColor || LT.primary} />
                                </div>
                            )}
                            <span
                                style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: LT.text,
                                    fontFamily: THEME.fontBody,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {title}
                            </span>
                        </div>
                        {/* Demo tab switcher */}
                        <div style={{ display: 'flex', gap: 4 }}>
                            {DEMO_TABS.map((dt) => {
                                const isActive = dt.id === activeDemo;
                                return (
                                    <button
                                        key={dt.id}
                                        onClick={() => goToTab && goToTab(dt.id)}
                                        style={{
                                            flex: 1,
                                            padding: '6px 4px',
                                            fontSize: 10,
                                            fontWeight: isActive ? 700 : 500,
                                            fontFamily: THEME.fontBody,
                                            borderRadius: 6,
                                            border: isActive ? `1px solid ${LT.primary}` : `1px solid ${LT.border}`,
                                            background: isActive ? `${LT.primary}10` : LT.buttonBg,
                                            color: isActive ? LT.primary : LT.textMuted,
                                            cursor: isActive ? 'default' : 'pointer',
                                            transition: 'all 0.15s ease',
                                            letterSpacing: '0.02em',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = LT.buttonHoverBg;
                                                e.currentTarget.style.color = LT.text;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = LT.buttonBg;
                                                e.currentTarget.style.color = LT.textMuted;
                                            }
                                        }}
                                    >
                                        {dt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Accent stripe */}
                    <div
                        style={{
                            height: 2,
                            background: LT.accentGradient,
                            opacity: 0.4,
                            flexShrink: 0,
                        }}
                    />

                    {/* Active Cluster Dropdown */}
                    <div
                        style={{
                            padding: '12px 14px',
                            borderBottom: `1px solid ${LT.border}`,
                            flexShrink: 0,
                        }}
                    >
                        <label
                            style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                color: LT.textDim,
                                
                                letterSpacing: '0.12em',
                                display: 'block',
                                marginBottom: 6,
                                fontFamily: THEME.fontMono,
                            }}
                        >
                            ACTIVE CLUSTER
                        </label>
                        <select
                            value={activeCluster}
                            onChange={(e) => setActiveCluster(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: 6,
                                background: LT.buttonBg,
                                border: `1px solid ${LT.border}`,
                                color: LT.textMuted,
                                fontSize: 11,
                                fontFamily: THEME.fontBody,
                                cursor: 'pointer',
                                fontWeight: 500,
                            }}
                        >
                            {clusterOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* nav sections */}
                    <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
                        {sections.map((section, si) => {
                            const isOpen = openSections.has(section.key);
                            const SIcon = section.icon;
                            const sAccent = section.accent || accentColor || LT.primary;
                            const hasCurrent = section.items?.some(
                                (it) => it.key === activeItem && section.key === activeSection,
                            );

                            return (
                                <div key={section.key} style={{ marginBottom: 2 }}>
                                    {/* section header */}
                                    <button
                                        onClick={() => toggleSection(section.key)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '7px 14px 5px 14px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            borderRadius: 0,
                                            marginTop: si === 0 ? 2 : 6,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: '8.5px',
                                                fontWeight: 700,
                                                letterSpacing: '0.02em',
                                                
                                                fontFamily: THEME.fontMono,
                                                color: LT.textDim,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                            }}
                                        >
                                            {SIcon && <SIcon size={11} />}
                                            {section.label}
                                        </span>
                                        <ChevronDown
                                            size={12}
                                            color={LT.textDim}
                                            style={{
                                                transition: 'transform 0.2s ease',
                                                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                flexShrink: 0,
                                            }}
                                        />
                                    </button>

                                    {/* items */}
                                    {isOpen && (
                                        <div>
                                            {section.items?.map((item) => {
                                                const isActive =
                                                    activeSection === section.key && activeItem === item.key;
                                                const IIcon = item.icon;
                                                return (
                                                    <button
                                                        key={item.key}
                                                        onClick={() => handleItemClick(section.key, item.key)}
                                                        className="demo-nav-item"
                                                        style={{
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            padding: '7px 14px 7px 28px',
                                                            background: isActive ? LT.activeItemBg : 'transparent',
                                                            border: 'none',
                                                            borderLeft: isActive
                                                                ? `2px solid ${sAccent}`
                                                                : `2px solid transparent`,
                                                            cursor: 'pointer',
                                                            color: isActive ? sAccent : LT.textMuted,
                                                            fontWeight: isActive ? 600 : 400,
                                                            fontSize: 12,
                                                            textAlign: 'left',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            fontFamily: THEME.fontBody,
                                                            transition:
                                                                'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                                                            position: 'relative',
                                                            borderRadius: 0,
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isActive) {
                                                                e.currentTarget.style.background = LT.hoverBg;
                                                                e.currentTarget.style.color = LT.text;
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isActive) {
                                                                e.currentTarget.style.background = 'transparent';
                                                                e.currentTarget.style.color = LT.textMuted;
                                                            }
                                                        }}
                                                    >
                                                        {IIcon && (
                                                            <IIcon
                                                                size={13}
                                                                style={{
                                                                    flexShrink: 0,
                                                                    opacity: isActive ? 1 : 0.6,
                                                                }}
                                                            />
                                                        )}
                                                        <span
                                                            style={{
                                                                flex: 1,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            {item.label}
                                                        </span>
                                                        {item.badge && (
                                                            <span
                                                                style={{
                                                                    fontSize: '7.5px',
                                                                    fontWeight: 700,
                                                                    
                                                                    background: LT.badgeBg,
                                                                    color: LT.badgeColor,
                                                                    borderRadius: 4,
                                                                    padding: '1px 6px',
                                                                    flexShrink: 0,
                                                                    fontFamily: THEME.fontMono,
                                                                    letterSpacing: '0.02em',
                                                                }}
                                                            >
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Sidebar bottom buttons */}
                    <div
                        style={{
                            padding: '12px 10px',
                            borderTop: `1px solid ${LT.border}`,
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                        }}
                    >
                        <button
                            onClick={onRefresh}
                            style={{
                                width: '100%',
                                padding: '6px 10px',
                                fontSize: 11,
                                fontWeight: 500,
                                borderRadius: 6,
                                border: `1px solid ${LT.border}`,
                                background: LT.buttonBg,
                                color: LT.textMuted,
                                cursor: onRefresh ? 'pointer' : 'not-allowed',
                                fontFamily: THEME.fontBody,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (onRefresh) {
                                    e.currentTarget.style.background = LT.buttonHoverBg;
                                    e.currentTarget.style.color = LT.text;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = LT.buttonBg;
                                e.currentTarget.style.color = LT.textMuted;
                            }}
                        >
                            Refresh data
                        </button>
                        {activeDemo === 'demo-mongodb' && (
                            <>
                                <button
                                    onClick={onExport}
                                    style={{
                                        width: '100%',
                                        padding: '6px 10px',
                                        fontSize: 11,
                                        fontWeight: 500,
                                        borderRadius: 6,
                                        border: `1px solid ${LT.border}`,
                                        background: LT.buttonBg,
                                        color: LT.textMuted,
                                        cursor: onExport ? 'pointer' : 'not-allowed',
                                        fontFamily: THEME.fontBody,
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (onExport) {
                                            e.currentTarget.style.background = LT.buttonHoverBg;
                                            e.currentTarget.style.color = LT.text;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = LT.buttonBg;
                                        e.currentTarget.style.color = LT.textMuted;
                                    }}
                                >
                                    Export JSON
                                </button>
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        borderRadius: 6,
                                        border: 'none',
                                        background: LT.accentGradient,
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        fontFamily: THEME.fontBody,
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.9';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                >
                                    + Add cluster
                                </button>
                            </>
                        )}
                    </div>
                </aside>

                {/* ── CONTENT COLUMN (header + main) ── */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    {/* TOP HEADER BAR */}
                    <header
                        style={{
                            height: 56,
                            background: LT.headerBg,
                            borderBottom: `1px solid ${LT.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 20px',
                            gap: 24,
                            position: 'relative',
                            zIndex: 10,
                            flexShrink: 0,
                        }}
                    >
                        {/* Left: Breadcrumb + Title */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: LT.textDim,
                                    fontFamily: THEME.fontMono,
                                    letterSpacing: '0.02em',
                                    marginBottom: 2,
                                    
                                }}
                            >
                                {title}{' '}
                                {activeSection && (
                                    <span style={{ color: LT.textMuted }}>
                                        &gt; {sections.find((s) => s.key === activeSection)?.label}
                                    </span>
                                )}
                            </div>
                            <div
                                style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: LT.text,
                                    fontFamily: THEME.fontBody,
                                    letterSpacing: '-0.04em',
                                }}
                            >
                                {activeItemData?.label ||
                                    sections.find((s) => s.key === activeSection)?.label ||
                                    'Dashboard'}
                            </div>
                        </div>

                        {/* Right: Stats, Live Badge, Notification, Avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
                            {/* Stat Pills */}
                            {headerStats && headerStats.length > 0 && (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {headerStats.map((stat, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                padding: '6px 12px',
                                                background: `${stat.color || LT.primary}10`,
                                                borderRadius: 8,
                                                border: `1px solid ${stat.color || LT.primary}20`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    color: stat.color || LT.primary,
                                                    fontFamily: THEME.fontMono,
                                                }}
                                            >
                                                {stat.value}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 8,
                                                    color: LT.textDim,
                                                    fontWeight: 600,
                                                    
                                                    letterSpacing: '0.02em',
                                                    marginTop: 1,
                                                }}
                                            >
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Live Badge */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '5px 12px',
                                    background: LT.liveBg,
                                    borderRadius: 20,
                                    border: `1px solid ${LT.liveBorder}`,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: LT.liveColor,
                                    fontFamily: THEME.fontMono,
                                }}
                            >
                                <span
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: LT.liveColor,
                                        animation: 'live-pulse 1.5s ease-in-out infinite',
                                    }}
                                />
                                Live
                            </div>

                            {/* Notification Bell */}
                            <button
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    background: LT.buttonBg,
                                    border: `1px solid ${LT.border}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = LT.buttonHoverBg;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = LT.buttonBg;
                                }}
                            >
                                <Bell size={16} color={LT.textDim} />
                            </button>

                            {/* User Avatar */}
                            <button
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 50,
                                    background: LT.accentGradient,
                                    border: `1px solid ${LT.border}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 0 8px rgba(139,92,246,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <User size={16} color="#ffffff" />
                            </button>
                        </div>
                    </header>

                    {/* MAIN CONTENT AREA */}
                    <main
                        style={{
                            flex: 1,
                            minHeight: 0,
                            minWidth: 0,
                            padding: '20px 22px 24px',
                            overflowY: 'auto',
                            position: 'relative',
                            zIndex: 5,
                        }}
                    >
                        {renderContent(activeSection, activeItem)}
                    </main>
                </div>

                {/* BOTTOM STATUS BAR */}
                <footer
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 24,
                        background: LT.footerBg,
                        borderTop: `1px solid ${LT.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: SIDEBAR_W,
                        paddingRight: 20,
                        gap: 18,
                        fontSize: 10,
                        fontFamily: THEME.fontMono,
                        color: LT.textDim,
                        zIndex: 11,
                    }}
                >
                    {statusItems && statusItems.length > 0 ? (
                        statusItems.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ color: item.color || LT.textDim }}>{item.label}:</span>
                                <span style={{ fontWeight: 600, color: item.color || LT.textMuted }}>{item.value}</span>
                            </div>
                        ))
                    ) : (
                        <>
                            <span>Status: Ready</span>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
};

/* ── Shared Styles ── */
const DemoStyles = () => (
    <style>{`
        @keyframes dpgFadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ovPulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes kpi-in { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes live-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes badge-crit { 0%,100%{opacity:1} 50%{opacity:.7} }
        .dpg-stagger > * { animation: dpgFadeIn 0.45s ease-out both; }
        .dpg-stagger > *:nth-child(1){animation-delay:0s}
        .dpg-stagger > *:nth-child(2){animation-delay:.07s}
        .dpg-stagger > *:nth-child(3){animation-delay:.14s}
        .dpg-stagger > *:nth-child(4){animation-delay:.21s}
        .dpg-stagger > *:nth-child(5){animation-delay:.28s}
        .dpg-stagger > *:nth-child(6){animation-delay:.35s}
        .dpg-card-shine { position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%); pointer-events:none; border-radius:inherit; opacity:0.3; }
        .dpg-metric { transition: transform 0.2s ease, border-color 0.2s ease; }
        .dpg-table-row { border-bottom: 1px solid #e2e8f0; padding: 12px 0; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
        .dpg-table-row:last-child { border-bottom: none; }
        .demo-nav-item::-webkit-scrollbar { display: none; }
        @keyframes dpgGlowPulse { 0%,100%{box-shadow:0 1px 3px rgba(0,0,0,0.08)} 50%{box-shadow:0 2px 8px rgba(139,92,246,0.12)} }
        @keyframes dpgGlowPulseWarn { 0%,100%{box-shadow:0 1px 3px rgba(0,0,0,0.08)} 50%{box-shadow:0 2px 8px rgba(217,119,6,0.12)} }
    `}</style>
);

export default DemoLayout;

/* ── Re-usable sub-components (shared across demo tabs) ── */

export const Panel = ({ title, icon: TIcon, rightNode, children, noPad, accentColor, style = {} }) => (
    <div
        style={{
            background: LT.cardBg,
            border: `1px solid ${LT.cardBorder}`,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: LT.cardShadow,
            ...style,
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${accentColor || LT.primary}30`;
            e.currentTarget.style.boxShadow = LT.cardShadowHover;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = LT.cardBorder;
            e.currentTarget.style.boxShadow = LT.cardShadow;
        }}
    >
        {title && (
            <div
                style={{
                    padding: '14px 20px',
                    borderBottom: `1px solid ${LT.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    minHeight: 44,
                    background: LT.surfaceHover,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {TIcon && (
                        <div
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: accentColor ? `${accentColor}12` : `${LT.textDim}12`,
                            }}
                        >
                            <TIcon size={13} color={accentColor || LT.textDim} />
                        </div>
                    )}
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: LT.textMuted,
                            
                            letterSpacing: '0.02em',
                            fontFamily: THEME.fontBody,
                        }}
                    >
                        {title}
                    </span>
                </div>
                {rightNode}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '16px 18px' }}>{children}</div>
    </div>
);

export const StatusBadge = ({ label, color, pulse }) => (
    <span
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 9.5,
            fontWeight: 700,
            padding: '4px 11px',
            borderRadius: 12,
            background: `${color}12`,
            color,
            border: `1px solid ${color}20`,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            fontFamily: THEME.fontMono,
            letterSpacing: '0.02em',
        }}
    >
        <span
            style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
                animation: pulse ? 'ovPulse 1.5s ease-in-out infinite' : 'none',
            }}
        />
        {label}
    </span>
);

export const RingGauge = ({
    value,
    color,
    size = 80,
    strokeWidth = 6,
    label,
    showValue = true,
    secondaryValue,
    secondaryColor,
}) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const filled = (circ * Math.min(value, 100)) / 100;
    const r2 = r - strokeWidth - 3;
    const circ2 = 2 * Math.PI * r2;
    const filled2 = secondaryValue != null ? (circ2 * Math.min(secondaryValue, 100)) / 100 : 0;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${filled} ${circ - filled}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{
                        transition: 'stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                />
                {secondaryValue != null && (
                    <>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={r2}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth={strokeWidth - 1.5}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={r2}
                            fill="none"
                            stroke={secondaryColor}
                            strokeWidth={strokeWidth - 1.5}
                            strokeDasharray={`${filled2} ${circ2 - filled2}`}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            style={{
                                transition: 'stroke-dasharray 1.3s cubic-bezier(0.22, 1, 0.36, 1) 0.1s',
                            }}
                        />
                    </>
                )}
            </svg>
            {showValue && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                    }}
                >
                    <span
                        style={{
                            fontSize: size > 70 ? 17 : 10,
                            fontWeight: 700,
                            color,
                            lineHeight: 1,
                            fontFamily: THEME.fontMono,
                        }}
                    >
                        {value}%
                    </span>
                    {label && (
                        <span
                            style={{
                                fontSize: 7.5,
                                color: LT.textDim,
                                fontWeight: 600,
                                
                                letterSpacing: '0.02em',
                                marginTop: 1,
                            }}
                        >
                            {label}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export const MiniSparkline = ({ data = [], color = LT.primary, width = 64, height = 20, filled = true }) => {
    if (!data || data.length < 2) return <div style={{ width, height }} />;
    const min = Math.min(...data),
        max = Math.max(...data),
        range = max - min || 1;
    const pts = data
        .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`)
        .join(' ');
    const uid = `dpgsp-${color.replace(/[^a-z0-9]/gi, '')}-${width}-${Math.random().toString(36).slice(2, 6)}`;
    return (
        <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
                <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            {filled && <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${uid})`} />}
            <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export const HeroMetric = ({ icon: Icon, label, value, trend, color, sparkData }) => (
    <div
        style={{
            background: LT.cardBg,
            borderRadius: 12,
            border: `1px solid ${LT.cardBorder}`,
            padding: '14px 16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: LT.cardShadow,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
        }}
    >
        <div
            style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${color}12`,
                border: `1px solid ${color}20`,
                flexShrink: 0,
            }}
        >
            <Icon size={18} color={color} />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
            <div
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: LT.textMuted,
                    
                    letterSpacing: '0.02em',
                    marginBottom: 4,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: THEME.fontMono,
                    color: color || LT.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}
            >
                {value}
                {sparkData && <MiniSparkline data={sparkData} color={color} width={48} height={16} />}
            </div>
        </div>
    </div>
);

/* ── MetricCard — matches the actual app's KPI card design exactly ── */
export const MetricCard = ({ icon: Icon, label, value, sub, subtitle, color, spark, trend, trendUp = true, warn }) => {
    const subText = sub || subtitle;
    const isUp = trendUp !== undefined ? trendUp : typeof trend === 'string' && !trend.startsWith('-');
    return (
        <div
            className={`dpg-metric ${warn ? 'dpg-glow-warn' : 'dpg-glow'}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '14px 16px',
                borderRadius: 14,
                background: LT.cardBg,
                border: `1px solid ${LT.cardBorder}`,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: LT.cardShadow,
                animation: 'kpi-in 0.35s cubic-bezier(.22,.68,0,1.2) both',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color || LT.primary}30`;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = LT.cardShadowHover;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = LT.cardBorder;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = LT.cardShadow;
            }}
        >
            {/* Icon + Sparkline Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${color}10`,
                        border: `1px solid ${color}18`,
                    }}
                >
                    {Icon && <Icon size={14} color={color} />}
                </div>
                {spark && <MiniSparkline data={spark} color={color} width={48} height={18} />}
            </div>
            {/* Label + Value + Sub */}
            <div>
                <div
                    style={{
                        fontSize: 9.5,
                        color: LT.textDim,
                        fontWeight: 600,
                        
                        letterSpacing: '0.02em',
                        lineHeight: 1,
                        marginBottom: 5,
                    }}
                >
                    {label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: color,
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                            fontFamily: THEME.fontMono,
                        }}
                    >
                        {value}
                    </span>
                    {subText && <span style={{ fontSize: 10, color: LT.textDim }}>{subText}</span>}
                </div>
            </div>
            {/* Trend Indicator */}
            {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {isUp ? (
                        <ArrowUpRight size={10} color={LT.success} />
                    ) : (
                        <ArrowDownRight size={10} color={LT.danger} />
                    )}
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            fontFamily: THEME.fontMono,
                            color: isUp ? LT.success : LT.danger,
                        }}
                    >
                        {trend}
                    </span>
                    <span style={{ fontSize: 9.5, color: LT.textDim, marginLeft: 2 }}>vs last hr</span>
                </div>
            )}
        </div>
    );
};

/* ── LiveMetric — compact metric with sparkline + progress bar ── */
export const LiveMetric = ({ icon: Icon, label, value, unit, spark, color, progress }) => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: '12px 14px',
            borderRadius: 12,
            background: LT.cardBg,
            border: `1px solid ${LT.cardBorder}`,
            position: 'relative',
            overflow: 'hidden',
            flex: 1,
            minWidth: 120,
            boxShadow: LT.cardShadow,
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {Icon && (
                    <div
                        style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `${color}12`,
                        }}
                    >
                        <Icon size={11} color={color} />
                    </div>
                )}
                <span
                    style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        color: LT.textMuted,
                        
                        letterSpacing: '0.02em',
                    }}
                >
                    {label}
                </span>
            </div>
            {spark && <MiniSparkline data={spark} color={color} width={40} height={14} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span
                style={{
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: THEME.fontMono,
                    color: LT.text,
                    lineHeight: 1,
                }}
            >
                {value}
            </span>
            {unit && <span style={{ fontSize: 10, color: LT.textDim }}>{unit}</span>}
        </div>
        {progress != null && (
            <div
                style={{
                    height: 3,
                    borderRadius: 2,
                    background: `${color}15`,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${Math.min(progress, 100)}%`,
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        transition: 'width 1s ease',
                    }}
                />
            </div>
        )}
    </div>
);

/* ── TabPills — sub-navigation pills ── */
export const TabPills = ({ tabs, active, onChange, accentColor }) => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map((t) => {
            const isActive = t.key === active;
            const ac = accentColor || LT.primary;
            return (
                <button
                    key={t.key}
                    onClick={() => onChange(t.key)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11.5,
                        fontWeight: isActive ? 700 : 500,
                        padding: '8px 18px',
                        borderRadius: 22,
                        background: isActive ? ac : 'transparent',
                        color: isActive ? '#fff' : LT.textMuted,
                        border: `1px solid ${isActive ? ac : LT.border}`,
                        boxShadow: isActive ? `0 2px 8px ${ac}30` : 'none',
                        cursor: 'pointer',
                        fontFamily: THEME.fontBody,
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.02em',
                    }}
                >
                    {t.icon && <t.icon size={13} />}
                    {t.label}
                    {t.badge && (
                        <span
                            style={{
                                fontSize: 9,
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: 8,
                                background: isActive ? 'rgba(255,255,255,0.25)' : `${t.badgeColor || ac}15`,
                                color: isActive ? '#fff' : t.badgeColor || ac,
                            }}
                        >
                            {t.badge}
                        </span>
                    )}
                </button>
            );
        })}
    </div>
);

/* ── AlertRow — an alert list item ── */
export const AlertRow = ({ severity, title, time, source, color }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '11px 14px',
            background: `${color}06`,
            borderBottom: `1px solid ${LT.border}`,
            borderLeft: `2px solid ${color}`,
            borderRadius: '0 8px 8px 0',
            marginBottom: 4,
        }}
    >
        <div
            style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
                marginTop: 4,
            }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: LT.text, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                <span
                    style={{
                        fontSize: 9.5,
                        fontFamily: THEME.fontMono,
                        color: LT.textDim,
                    }}
                >
                    {time}
                </span>
                {source && <span style={{ fontSize: 9.5, color: LT.textDim }}>{source}</span>}
            </div>
        </div>
        <span
            style={{
                fontSize: 9,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 8,
                background: `${color}12`,
                color,
                
                letterSpacing: '0.02em',
                fontFamily: THEME.fontMono,
                flexShrink: 0,
            }}
        >
            {severity}
        </span>
    </div>
);

/* ── TableRow — consistent table row style ── */
export const DataTable = ({ columns, rows, accentColor }) => (
    <div style={{ fontSize: 12, color: LT.textMuted }}>
        {/* header */}
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' '),
                gap: 8,
                padding: '8px 14px',
                borderBottom: `1px solid ${LT.border}`,
                fontWeight: 700,
                fontSize: '9.5px',
                
                letterSpacing: '0.02em',
                color: LT.textDim,
            }}
        >
            {columns.map((c, i) => (
                <span key={i} style={{ textAlign: c.align || 'left' }}>
                    {c.label}
                </span>
            ))}
        </div>
        {/* rows */}
        {rows.map((row, ri) => (
            <div
                key={ri}
                style={{
                    display: 'grid',
                    gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' '),
                    gap: 8,
                    padding: '10px 14px',
                    borderBottom: `1px solid ${LT.borderLight}`,
                    transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = LT.surfaceHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
                {columns.map((c, ci) => (
                    <span
                        key={ci}
                        style={{
                            textAlign: c.align || 'left',
                            fontFamily: c.mono ? THEME.fontMono : 'inherit',
                            color: row[c.key + 'Color'] || (c.mono ? LT.text : LT.textMuted),
                            fontWeight: ci === 0 ? 600 : 400,
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {row[c.key]}
                    </span>
                ))}
            </div>
        ))}
    </div>
);

export const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: LT.cardBg,
                border: `1px solid ${LT.cardBorder}`,
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 12,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}
        >
            {label && (
                <div style={{ fontSize: 10, color: LT.textDim, marginBottom: 6, fontFamily: THEME.fontMono }}>
                    {label}
                </div>
            )}
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: p.color || p.stroke || LT.primary,
                            flexShrink: 0,
                        }}
                    />
                    <span style={{ color: LT.textMuted, fontSize: 11 }}>{p.name || p.dataKey}:</span>
                    <span style={{ color: LT.text, fontWeight: 600, fontFamily: THEME.fontMono, fontSize: 11 }}>
                        {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ── ConnectionBar — mimics the real app's connection/refresh status bar ── */
export const ConnectionBar = ({ lastSync = '8s', refreshInterval = '30s' }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            background: LT.cardBg,
            border: `1px solid ${LT.cardBorder}`,
            borderRadius: 10,
            fontSize: 11,
            color: LT.textDim,
            marginBottom: 4,
            boxShadow: LT.cardShadow,
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: LT.success,
                    }}
                />
                <span style={{ fontWeight: 600, color: LT.textMuted }}>Connected</span>
            </span>
            <span>Last sync {lastSync} ago</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Auto-refresh:
                {['10s', '30s', '1m', '5m', 'Off'].map((v, i) => (
                    <span
                        key={i}
                        style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                            background: v === refreshInterval ? LT.primary : 'transparent',
                            color: v === refreshInterval ? '#fff' : LT.textDim,
                            cursor: 'pointer',
                        }}
                    >
                        {v}
                    </span>
                ))}
            </span>
        </div>
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: LT.primary,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 11,
            }}
        >
            ↻ Refresh Now
        </div>
    </div>
);

export const generateChartData = (hours = 24) =>
    Array.from({ length: hours }, (_, i) => ({ time: `${String(i).padStart(2, '0')}:00` }));

/* ── ExecStatCard — Large hero KPI card ── */
export const ExecStatCard = ({ value, label, subtitle, color }) => (
    <div
        style={{
            background: LT.cardBg,
            borderRadius: 16,
            padding: '24px 20px',
            border: `1px solid ${LT.cardBorder}`,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: LT.cardShadow,
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = LT.cardShadowHover;
            e.currentTarget.style.borderColor = `${color}30`;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = LT.cardShadow;
            e.currentTarget.style.borderColor = LT.cardBorder;
        }}
    >
        <div
            style={{
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color,
                marginBottom: 8,
                fontFamily: THEME.fontMono,
            }}
        >
            {value}
        </div>
        <div
            style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.02em',
                
                color: LT.textDim,
                marginBottom: 4,
            }}
        >
            {label}
        </div>
        {subtitle && <div style={{ fontSize: 10.5, color: LT.textDim }}>{subtitle}</div>}
    </div>
);
