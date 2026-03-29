import React, { useState } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { ChevronDown, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   DemoLayout — shared sidebar + content wrapper for all demo tabs.

   Props:
     sections:  Array of { key, label, icon, accent, items: [{ key, label }] }
     renderContent: (sectionKey, itemKey) => React.Element
     title: string — top-left sidebar label (e.g. "PostgreSQL Demo")
     accentColor: string — primary accent for the sidebar header
   ═══════════════════════════════════════════════════════════════════════════ */

const SIDEBAR_W = 240;

const DemoLayout = ({ sections = [], renderContent, title, accentColor, titleIcon: TitleIcon }) => {
    useAdaptiveTheme();

    const [activeSection, setActiveSection] = useState(sections[0]?.key || '');
    const [activeItem, setActiveItem] = useState(sections[0]?.items?.[0]?.key || '');
    const [openSections, setOpenSections] = useState(() => new Set(sections.map((s) => s.key)));

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

    return (
        <div style={{ display: 'flex', height: '100%', minHeight: '100vh', position: 'relative', background: '#020810' }}>
            <DemoStyles />

            {/* Aurora gradient background */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(0,229,255,0.055) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(79,172,254,0.05) 0%, transparent 60%), radial-gradient(ellipse 70% 40% at 50% 10%, rgba(0,255,170,0.04) 0%, transparent 50%)',
                animation: 'aurora-drift 18s ease-in-out infinite alternate',
            }} />

            {/* Dot grid overlay */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
                backgroundImage: 'radial-gradient(circle, rgba(79,172,254,0.07) 1px, transparent 1px)',
                backgroundSize: '38px 38px', opacity: 0.45,
            }} />

            {/* ── SIDEBAR ── */}
            <aside
                style={{
                    width: SIDEBAR_W,
                    minWidth: SIDEBAR_W,
                    background: 'rgba(3,9,22,0.93)',
                    backdropFilter: 'blur(28px) saturate(1.2)',
                    WebkitBackdropFilter: 'blur(28px) saturate(1.2)',
                    borderRight: '1px solid rgba(255,255,255,0.055)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    position: 'sticky',
                    top: 0,
                    alignSelf: 'flex-start',
                    height: '100vh',
                    zIndex: 2,
                    position: 'relative',
                }}
            >
                {/* Gradient edge glow on right */}
                <div style={{
                    position: 'absolute', top: 0, right: 0, width: 1, height: '100%',
                    background: 'linear-gradient(180deg, transparent, rgba(0,229,255,0.2) 25%, rgba(0,255,170,0.15) 60%, rgba(79,172,254,0.2) 80%, transparent)',
                    pointerEvents: 'none',
                }} />
                {/* header */}
                <div
                    style={{
                        padding: '16px 16px 12px',
                        borderBottom: '1px solid rgba(255,255,255,0.055)',
                        background: 'rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    {TitleIcon && (
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `${accentColor || THEME.primary}18`,
                                border: `1px solid ${accentColor || THEME.primary}30`,
                            }}
                        >
                            <TitleIcon size={15} color={accentColor || THEME.primary} />
                        </div>
                    )}
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: THEME.textMain,
                            fontFamily: THEME.fontBody,
                            letterSpacing: '0.02em',
                        }}
                    >
                        {title}
                    </span>
                </div>

                {/* nav sections */}
                <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
                    {sections.map((section, si) => {
                        const isOpen = openSections.has(section.key);
                        const SIcon = section.icon;
                        const sAccent = section.accent || accentColor || THEME.primary;
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
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            fontFamily: THEME.fontMono,
                                            color: '#1e3050',
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
                                        color="#1e3050"
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
                                            const isActive = activeSection === section.key && activeItem === item.key;
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
                                                        background: isActive
                                                            ? 'linear-gradient(90deg, rgba(0,255,170,0.1), rgba(0,255,170,0.02) 70%, transparent)'
                                                            : 'transparent',
                                                        border: 'none',
                                                        borderLeft: isActive
                                                            ? '2px solid #00ffaa'
                                                            : '2px solid rgba(0,229,255,0.3)',
                                                        boxShadow: isActive
                                                            ? 'none'
                                                            : 'none',
                                                        cursor: 'pointer',
                                                        color: isActive ? '#00ffaa' : THEME.textDim,
                                                        fontWeight: isActive ? 600 : 400,
                                                        fontSize: 12,
                                                        textAlign: 'left',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        fontFamily: THEME.fontBody,
                                                        transition:
                                                            'background 0.15s ease, color 0.15s ease, border-color 0.15s ease, text-shadow 0.15s ease',
                                                        position: 'relative',
                                                        borderRadius: 0,
                                                        textShadow: isActive ? '0 0 12px rgba(0,255,170,0.3)' : 'none',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isActive) {
                                                            e.currentTarget.style.background = 'rgba(0,229,255,0.04)';
                                                            e.currentTarget.style.color = THEME.textMuted;
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isActive) {
                                                            e.currentTarget.style.background = 'transparent';
                                                            e.currentTarget.style.color = THEME.textDim;
                                                        }
                                                    }}
                                                >
                                                    {IIcon && (
                                                        <IIcon
                                                            size={13}
                                                            style={{
                                                                flexShrink: 0,
                                                                opacity: isActive ? 1 : 0.6,
                                                                filter: isActive
                                                                    ? `drop-shadow(0 0 4px ${sAccent}80)`
                                                                    : 'none',
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
                                                    {isActive && (
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                right: 0,
                                                                top: 0,
                                                                bottom: 0,
                                                                width: 50,
                                                                background: `linear-gradient(270deg, ${sAccent}10, transparent)`,
                                                                pointerEvents: 'none',
                                                            }}
                                                        />
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
            </aside>

            {/* ── CONTENT ── */}
            <main
                style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '20px 22px 44px',
                    overflowY: 'auto',
                    position: 'relative',
                    zIndex: 5,
                }}
            >
                {renderContent(activeSection, activeItem)}
            </main>
        </div>
    );
};

/* ── Shared Styles ── */
const DemoStyles = () => (
    <style>{`
        @keyframes dpgFadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ovPulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes aurora-drift { 0%{opacity:1} 33%{transform:scale(1.015)} 66%{opacity:0.88} 100%{transform:scale(0.985);opacity:1} }
        @keyframes kpi-in { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes live-pulse { 0%,100%{opacity:1;box-shadow:0 0 6px #00ffaa,0 0 14px rgba(0,255,170,0.3)} 50%{opacity:.7;box-shadow:0 0 10px #00ffaa,0 0 24px rgba(0,255,170,0.5)} }
        @keyframes badge-crit { 0%,100%{opacity:1} 50%{opacity:.7} }
        .dpg-stagger > * { animation: dpgFadeIn 0.45s ease-out both; }
        .dpg-stagger > *:nth-child(1){animation-delay:0s}
        .dpg-stagger > *:nth-child(2){animation-delay:.07s}
        .dpg-stagger > *:nth-child(3){animation-delay:.14s}
        .dpg-stagger > *:nth-child(4){animation-delay:.21s}
        .dpg-stagger > *:nth-child(5){animation-delay:.28s}
        .dpg-stagger > *:nth-child(6){animation-delay:.35s}
        .dpg-card-shine { position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%); pointer-events:none; border-radius:inherit; }
        .dpg-metric { transition: transform 0.2s ease, border-color 0.2s ease; }
        .dpg-table-row { border-bottom: 1px solid ${THEME.glassBorder}; padding: 12px 0; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
        .dpg-table-row:last-child { border-bottom: none; }
        .demo-nav-item::-webkit-scrollbar { display: none; }
        .dpg-glow { animation: dpgGlowPulse 3.5s ease-in-out infinite; }
        .dpg-glow-warn { animation: dpgGlowPulseWarn 2.8s ease-in-out infinite; }
        @keyframes dpgGlowPulse { 0%,100%{box-shadow:0 0 0px rgba(14,165,233,0)} 50%{box-shadow:0 0 22px rgba(14,165,233,0.18)} }
        @keyframes dpgGlowPulseWarn { 0%,100%{box-shadow:0 0 0px rgba(251,146,60,0)} 50%{box-shadow:0 0 20px rgba(251,146,60,0.2)} }
    `}</style>
);

export default DemoLayout;

/* ── Re-usable sub-components (shared across demo tabs) ── */

export const Panel = ({ title, icon: TIcon, rightNode, children, noPad, accentColor, style = {} }) => (
    <div
        style={{
            background: 'rgba(6,14,32,0.72)',
            backdropFilter: 'blur(20px) saturate(1.1)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.1)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.035)',
            ...style,
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(79,172,254,0.2)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.035)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.035)';
        }}
    >
        <div className="dpg-card-shine" />
        {title && (
            <div
                style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.055)',
                    borderTop: '1px solid rgba(79,172,254,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    minHeight: 44,
                    background: 'linear-gradient(180deg, rgba(79,172,254,0.04), rgba(0,0,0,0.05))',
                    backgroundImage: 'linear-gradient(180deg, rgba(79,172,254,0.04) 0%, transparent 50%)',
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
                                background: accentColor ? `${accentColor}16` : `${THEME.textDim}12`,
                                boxShadow: accentColor ? `0 0 8px ${accentColor}20` : 'none',
                            }}
                        >
                            <TIcon size={13} color={accentColor || THEME.textDim} />
                        </div>
                    )}
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: THEME.textMuted,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
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
            border: `1px solid ${color}28`,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            fontFamily: THEME.fontMono,
            letterSpacing: '0.05em',
            boxShadow: `0 0 8px ${color}40`,
        }}
    >
        <span
            style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 8px ${color}80, 0 0 12px ${color}40`,
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
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={`${THEME.grid}45`}
                    strokeWidth={strokeWidth}
                />
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
                        filter: `drop-shadow(0 0 6px ${color}60) drop-shadow(0 0 12px ${color}30)`,
                    }}
                />
                {secondaryValue != null && (
                    <>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={r2}
                            fill="none"
                            stroke={`${THEME.grid}35`}
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
                                filter: `drop-shadow(0 0 5px ${secondaryColor}50) drop-shadow(0 0 10px ${secondaryColor}25)`,
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
                                color: THEME.textDim,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
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

export const MiniSparkline = ({ data = [], color = THEME.primary, width = 64, height = 20, filled = true }) => {
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
                    <stop offset="0%" stopColor={color} stopOpacity={0.28} />
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
            background: 'rgba(6,14,32,0.72)',
            backdropFilter: 'blur(20px) saturate(1.1)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.055)',
            padding: '14px 16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.035)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
        }}
    >
        <div className="dpg-card-shine" />
        <div
            style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${color}18, ${color}08)`,
                border: `1px solid ${color}30`,
                boxShadow: `0 0 16px ${color}15`,
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
                    color: THEME.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
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
                    color: color || THEME.textMain,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    textShadow: color ? `0 0 20px ${color}` : 'none',
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
    const isUp = trendUp !== undefined ? trendUp : (typeof trend === 'string' && !trend.startsWith('-'));
    return (
    <div
        className={`dpg-metric ${warn ? 'dpg-glow-warn' : 'dpg-glow'}`}
        style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '14px 16px',
            borderRadius: 14,
            background: 'rgba(6,14,32,0.72)',
            backdropFilter: 'blur(20px) saturate(1.1)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.1)',
            border: '1px solid rgba(255,255,255,0.055)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.035)',
            animation: 'kpi-in 0.35s cubic-bezier(.22,.68,0,1.2) both',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(79,172,254,0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.035)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.035)';
        }}
    >
        <div className="dpg-card-shine" />
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
                    color: THEME.textDim,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
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
                        textShadow: `0 0 20px ${color}`,
                    }}
                >
                    {value}
                </span>
                {subText && <span style={{ fontSize: 10, color: THEME.textDim }}>{subText}</span>}
            </div>
        </div>
        {/* Trend Indicator */}
        {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {isUp ? (
                    <ArrowUpRight size={10} color={THEME.success} />
                ) : (
                    <ArrowDownRight size={10} color={THEME.danger} />
                )}
                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: THEME.fontMono,
                        color: isUp ? THEME.success : THEME.danger,
                    }}
                >
                    {trend}
                </span>
                <span style={{ fontSize: 9.5, color: THEME.textDim, marginLeft: 2 }}>vs last hr</span>
            </div>
        )}
    </div>
    );
};

/* ── LiveMetric — compact metric with sparkline + progress bar (like Alerts page) ── */
export const LiveMetric = ({ icon: Icon, label, value, unit, spark, color, progress }) => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(6,14,32,0.72)',
            backdropFilter: 'blur(20px) saturate(1.1)',
            border: '1px solid rgba(255,255,255,0.055)',
            position: 'relative',
            overflow: 'hidden',
            flex: 1,
            minWidth: 120,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.035)',
        }}
    >
        <div className="dpg-card-shine" />
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
                        color: THEME.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
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
                    color: THEME.textMain,
                    lineHeight: 1,
                }}
            >
                {value}
            </span>
            {unit && <span style={{ fontSize: 10, color: THEME.textDim }}>{unit}</span>}
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

/* ── TabPills — sub-navigation pills like the actual app ── */
export const TabPills = ({ tabs, active, onChange, accentColor }) => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map((t) => {
            const isActive = t.key === active;
            const ac = accentColor || THEME.primary;
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
                        color: isActive ? '#fff' : THEME.textMuted,
                        border: `1px solid ${isActive ? ac : THEME.glassBorder}`,
                        boxShadow: isActive ? `0 2px 12px ${ac}40, 0 0 0 1px ${ac}20` : 'none',
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
                                background: isActive ? 'rgba(255,255,255,0.25)' : `${t.badgeColor || ac}25`,
                                color: isActive ? '#fff' : (t.badgeColor || ac),
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

/* ── AlertRow — an alert list item matching the actual app ── */
export const AlertRow = ({ severity, title, time, source, color }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '11px 14px',
            background: `${color}06`,
            borderBottom: `1px solid ${THEME.glassBorder}20`,
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
                boxShadow: `0 0 6px ${color}80`,
                flexShrink: 0,
                marginTop: 4,
            }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: THEME.textMain, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                <span
                    style={{
                        fontSize: 9.5,
                        fontFamily: THEME.fontMono,
                        color: THEME.textDim,
                    }}
                >
                    {time}
                </span>
                {source && <span style={{ fontSize: 9.5, color: THEME.textDim }}>{source}</span>}
            </div>
        </div>
        <span
            style={{
                fontSize: 9,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 8,
                background: `${color}18`,
                color,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
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
    <div style={{ fontSize: 12, color: THEME.textMuted }}>
        {/* header */}
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' '),
                gap: 8,
                padding: '8px 14px',
                borderBottom: '1px solid rgba(79,172,254,0.15)',
                fontWeight: 700,
                fontSize: '9.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: THEME.textDim,
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
                    borderBottom: `1px solid ${THEME.glassBorder}30`,
                    transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
                {columns.map((c, ci) => (
                    <span
                        key={ci}
                        style={{
                            textAlign: c.align || 'left',
                            fontFamily: c.mono ? THEME.fontMono : 'inherit',
                            color: row[c.key + 'Color'] || (c.mono ? THEME.textMain : THEME.textMuted),
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
                background: 'rgba(6,14,32,0.72)',
                border: '1px solid rgba(255,255,255,0.055)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                backdropFilter: 'blur(20px) saturate(1.1)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.035)',
            }}
        >
            <div
                style={{
                    color: THEME.textDim,
                    marginBottom: 5,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}
            >
                {label}
            </div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, fontFamily: THEME.fontMono, fontSize: 12 }}>
                    {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
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
            background: 'rgba(6,14,32,0.72)',
            border: '1px solid rgba(255,255,255,0.055)',
            borderRadius: 10,
            fontSize: 11,
            color: THEME.textDim,
            marginBottom: 4,
            backdropFilter: 'blur(20px) saturate(1.1)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.035)',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.success, boxShadow: `0 0 6px ${THEME.success}80` }} />
                <span style={{ fontWeight: 600, color: THEME.textMuted }}>Connected</span>
            </span>
            <span>Last sync {lastSync} ago</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Auto-refresh:
                {['10s', '30s', '1m', '5m', 'Off'].map((v, i) => (
                    <span key={i} style={{
                        padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: v === refreshInterval ? THEME.primary : 'transparent',
                        color: v === refreshInterval ? '#fff' : THEME.textDim,
                        cursor: 'pointer',
                    }}>{v}</span>
                ))}
            </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: THEME.primary, fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>
            ↻ Refresh Now
        </div>
    </div>
);

export const generateChartData = (hours = 24) =>
    Array.from({ length: hours }, (_, i) => ({ time: `${String(i).padStart(2, '0')}:00` }));
