import React, { useState } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
        <div style={{ display: 'flex', height: '100%', minHeight: '100vh', position: 'relative' }}>
            <DemoStyles />

            {/* ── SIDEBAR ── */}
            <aside
                style={{
                    width: SIDEBAR_W,
                    minWidth: SIDEBAR_W,
                    background: `linear-gradient(180deg, ${THEME.glass}, rgba(10,6,18,0.85))`,
                    borderRight: `1px solid ${THEME.glassBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    position: 'sticky',
                    top: 0,
                    alignSelf: 'flex-start',
                    height: '100vh',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    zIndex: 2,
                }}
            >
                {/* header */}
                <div
                    style={{
                        padding: '16px 16px 12px',
                        borderBottom: `1px solid ${THEME.glassBorder}`,
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
                <nav style={{ flex: 1, padding: '8px 0' }}>
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
                                            fontSize: 10,
                                            fontWeight: 700,
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            fontFamily: THEME.fontMono,
                                            color: hasCurrent ? sAccent : THEME.textDim,
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
                                        color={hasCurrent ? sAccent : THEME.textDim}
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
                                                            ? `linear-gradient(90deg, ${sAccent}25 0%, ${sAccent}08 60%, transparent 100%)`
                                                            : 'transparent',
                                                        border: 'none',
                                                        borderLeft: isActive
                                                            ? `3px solid ${sAccent}`
                                                            : '3px solid transparent',
                                                        boxShadow: isActive
                                                            ? `inset 0 0 24px ${sAccent}10, 0 0 12px ${sAccent}08`
                                                            : 'none',
                                                        cursor: 'pointer',
                                                        color: isActive ? sAccent : THEME.textDim,
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
                                                            e.currentTarget.style.background = `${THEME.glassBorder}50`;
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
                    padding: '24px 28px',
                    overflowY: 'auto',
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
    `}</style>
);

export default DemoLayout;

/* ── Re-usable sub-components (shared across demo tabs) ── */

export const Panel = ({ title, icon: TIcon, rightNode, children, noPad, accentColor, style = {} }) => (
    <div
        style={{
            background: THEME.glass,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: `1px solid ${accentColor ? `${accentColor}22` : THEME.glassBorder}`,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: accentColor
                ? `0 0 0 1px ${accentColor}12, 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 2px rgba(255,255,255,0.08)`
                : `0 0 0 1px ${THEME.glassBorder}, 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.06)`,
            ...style,
        }}
    >
        <div className="dpg-card-shine" />
        {title && (
            <div
                style={{
                    padding: '14px 20px',
                    borderBottom: `1px solid ${accentColor ? `${accentColor}18` : THEME.glassBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    minHeight: 44,
                    background: accentColor ? `${accentColor}06` : 'rgba(255,255,255,0.02)',
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
            background: THEME.glass,
            backdropFilter: 'blur(16px)',
            borderRadius: 12,
            border: `1px solid ${THEME.glassBorder}`,
            padding: '14px 16px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 0 0 1px ${THEME.glassBorder}, 0 4px 12px rgba(0,0,0,0.08)`,
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
                    color: THEME.textMain,
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

export const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: THEME.glass,
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                backdropFilter: 'blur(12px)',
                boxShadow: THEME.shadowMd,
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

export const generateChartData = (hours = 24) =>
    Array.from({ length: hours }, (_, i) => ({ time: `${String(i).padStart(2, '0')}:00` }));
