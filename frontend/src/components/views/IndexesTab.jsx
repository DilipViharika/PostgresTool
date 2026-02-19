import React, { useState, useEffect, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import FeedbackModal from './FeedbackModal.jsx';
import {
    GlassCard,
    MetricCard,
    DataTable,
    SkeletonLoader,
    EmptyState
} from '../ui/SharedComponents.jsx';
import { fetchData } from '../../utils/api';
import {
    Layers, AlertTriangle, Zap, Cpu, Database, TrendingDown,
    CheckCircle, XCircle, ArrowRight, Search, Filter, Download,
    BarChart3, PieChart, Activity, Clock, HardDrive, Sparkles,
    FileText, Code, Play, X, Info, ChevronRight, Eye, Trash2,
    Settings, RefreshCw, AlertCircle, TrendingUp, Gauge, Target,
    Lightbulb, Wrench, GitBranch, RotateCcw, Terminal
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const IndexStyles = () => (
    <style>{`
        @keyframes idxFadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes idxSlideIn {
            from { opacity: 0; transform: translateX(-16px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes idxPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.4; }
        }
        @keyframes idxSpin {
            to { transform: rotate(360deg); }
        }
        @keyframes idxGlow {
            0%, 100% { box-shadow: 0 0 4px var(--glow-color); }
            50%      { box-shadow: 0 0 16px var(--glow-color), 0 0 32px color-mix(in srgb, var(--glow-color) 30%, transparent); }
        }
        @keyframes idxBarGrow {
            from { transform: scaleX(0); }
            to   { transform: scaleX(1); }
        }
        @keyframes idxModalIn {
            from { opacity: 0; transform: scale(0.96) translateY(10px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes idxShimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        .idx-stagger > * {
            animation: idxFadeIn 0.4s ease-out both;
        }
        .idx-stagger > *:nth-child(1) { animation-delay: 0.00s; }
        .idx-stagger > *:nth-child(2) { animation-delay: 0.06s; }
        .idx-stagger > *:nth-child(3) { animation-delay: 0.12s; }
        .idx-stagger > *:nth-child(4) { animation-delay: 0.18s; }
        .idx-stagger > *:nth-child(5) { animation-delay: 0.24s; }
        .idx-stagger > *:nth-child(6) { animation-delay: 0.30s; }

        .idx-row-hover { 
            transition: all 0.15s ease;
            cursor: pointer;
        }
        .idx-row-hover:hover {
            background: ${THEME.primary}08 !important;
            transform: translateX(3px);
        }
        .idx-bar-animate {
            transform-origin: left;
            animation: idxBarGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .idx-spin { animation: idxSpin 1s linear infinite; }
        .idx-shimmer {
            background: linear-gradient(90deg, transparent, ${THEME.primary}20, transparent);
            background-size: 200% 100%;
            animation: idxShimmer 2s infinite;
        }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Animated Value */
const AnimValue = ({ value, decimals = 0, suffix = '', prefix = '' }) => {
    const [display, setDisplay] = useState(0);
    const ref = useRef();
    useEffect(() => {
        const target = Number(value) || 0;
        let startTime = null;
        const step = ts => {
            if (!startTime) startTime = ts;
            const p = Math.min((ts - startTime) / 800, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setDisplay(ease * target);
            if (p < 1) ref.current = requestAnimationFrame(step);
        };
        ref.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(ref.current);
    }, [value]);
    return <span>{prefix}{display.toFixed(decimals)}{suffix}</span>;
};

/** Severity Badge */
const SeverityBadge = ({ level }) => {
    const config = level === 'critical' ? { label: 'CRITICAL', color: THEME.danger, bg: `${THEME.danger}18` }
        : level === 'high' ? { label: 'HIGH', color: THEME.warning, bg: `${THEME.warning}15` }
            : level === 'medium' ? { label: 'MEDIUM', color: THEME.primary, bg: `${THEME.primary}12` }
                : { label: 'LOW', color: THEME.success, bg: `${THEME.success}15` };

    return (
        <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', padding: '3px 8px',
            borderRadius: 4, background: config.bg, color: config.color,
            border: `1px solid ${config.color}25`, whiteSpace: 'nowrap'
        }}>{config.label}</span>
    );
};

/** Size Bar */
const SizeBar = ({ value, max, color = THEME.primary, delay = 0 }) => (
    <div style={{ width: '100%', height: 6, background: `${THEME.grid}40`, borderRadius: 3, overflow: 'hidden' }}>
        <div className="idx-bar-animate" style={{
            width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', borderRadius: 3,
            background: `linear-gradient(90deg, ${color}70, ${color})`,
            boxShadow: `0 0 8px ${color}40`, animationDelay: `${delay}s`
        }} />
    </div>
);

/** Stat Chip */
const StatChip = ({ label, value, icon: Icon, color = THEME.textMain, small }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', gap: small ? 3 : 5,
        padding: small ? '8px 12px' : '12px 14px',
        background: THEME.surface, borderRadius: 8, border: `1px solid ${THEME.grid}40`,
        minHeight: small ? 52 : 62, justifyContent: 'center'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, lineHeight: 1 }}>
            {Icon && <Icon size={10} color={THEME.textDim} />}
            <span style={{
                fontSize: 10, color: THEME.textDim, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1
            }}>{label}</span>
        </div>
        <span style={{
            fontSize: small ? 15 : 18, fontWeight: 800, color,
            letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1
        }}>{value}</span>
    </div>
);

/** Progress Ring */
const ProgressRing = ({ value, size = 100, strokeWidth = 8, color = THEME.primary, label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${THEME.grid}40`} strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2
            }}>
                <span style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}%</span>
                {label && <span style={{ fontSize: 9, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   INDEX DETAIL MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
const IndexDetailModal = ({ index, onClose, onAction }) => {
    const [isApplying, setIsApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    const handleAction = () => {
        setIsApplying(true);
        setTimeout(() => {
            setIsApplying(false);
            setApplied(true);
            onAction?.(index);
            setTimeout(() => onClose(), 1200);
        }, 1500);
    };

    const isMissing = index.type === 'missing';
    const isUnused = index.type === 'unused';
    const actionLabel = isMissing ? 'Create Index' : 'Drop Index';
    const actionColor = isMissing ? THEME.success : THEME.danger;

    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            animation: 'idxFadeIn 0.2s ease-out'
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '92%', maxWidth: 900, maxHeight: '88vh',
                background: THEME.surface, border: `1px solid ${THEME.glassBorder}`,
                borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${THEME.glassBorder}`,
                animation: 'idxModalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px', borderBottom: `1px solid ${THEME.glassBorder}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: `linear-gradient(135deg, ${isMissing ? THEME.warning : THEME.danger}08, transparent)`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${isMissing ? THEME.warning : THEME.danger}15`,
                            border: `1px solid ${isMissing ? THEME.warning : THEME.danger}25`,
                            '--glow-color': isMissing ? THEME.warning : THEME.danger,
                            animation: 'idxGlow 3s ease-in-out infinite'
                        }}>
                            {isMissing ? <AlertTriangle size={18} color={THEME.warning} /> : <Trash2 size={18} color={THEME.danger} />}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: THEME.textMain }}>
                                    {isMissing ? 'Missing Index Detected' : 'Unused Index'}
                                </h3>
                                <SeverityBadge level={index.severity || 'medium'} />
                            </div>
                            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                                Table: <span style={{ color: THEME.primary, fontWeight: 600 }}>{index.table || index.tableName}</span>
                                {index.size && <span style={{ marginLeft: 12 }}>Size: <span style={{ color: THEME.warning, fontWeight: 600 }}>{index.size}</span></span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: 8, border: `1px solid ${THEME.grid}`,
                        background: 'transparent', color: THEME.textMuted, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                    }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${THEME.danger}20`; e.currentTarget.style.color = THEME.danger; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = THEME.textMuted; }}
                    ><X size={16} /></button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        <StatChip
                            label="Seq Scans"
                            value={(index.seq_scan || index.seqScans || 0).toLocaleString()}
                            icon={Activity}
                            color={THEME.warning}
                            small
                        />
                        <StatChip
                            label="Index Scans"
                            value={(index.idx_scan || index.idxScans || 0).toLocaleString()}
                            icon={Zap}
                            color={THEME.success}
                            small
                        />
                        <StatChip
                            label="Rows"
                            value={(index.n_live_tup || index.rows || 0).toLocaleString()}
                            icon={Database}
                            color={THEME.primary}
                            small
                        />
                        <StatChip
                            label="Impact"
                            value={index.impact || 'High'}
                            icon={Target}
                            color={THEME.danger}
                            small
                        />
                    </div>

                    {/* Analysis Section */}
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Lightbulb size={12} /> AI Analysis
                        </div>
                        <div style={{
                            padding: 16, background: `${THEME.primary}06`, borderRadius: 8,
                            border: `1px solid ${THEME.primary}15`
                        }}>
                            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: THEME.textMuted }}>
                                {isMissing ? (
                                    <>
                                        This table is experiencing <strong style={{ color: THEME.warning }}>{(index.seq_scan || 0).toLocaleString()} sequential scans</strong> with
                                        only <strong>{(index.idx_scan || 0).toLocaleString()} index scans</strong>.
                                        Creating an index on frequently queried columns will dramatically improve query performance by enabling
                                        direct lookups instead of full table scans.
                                    </>
                                ) : (
                                    <>
                                        This index consumes <strong style={{ color: THEME.warning }}>{index.size}</strong> of disk space but has
                                        been scanned <strong>{(index.idx_scan || index.idxScans || 0).toLocaleString()} times</strong>.
                                        Dropping unused indexes reduces storage costs, improves write performance, and simplifies maintenance.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Recommendation */}
                    {isMissing && (
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Code size={12} /> Recommended SQL
                            </div>
                            <div style={{
                                background: `${THEME.success}06`, border: `1px solid ${THEME.success}18`,
                                padding: '14px 16px', borderRadius: 8, fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                fontSize: 12, lineHeight: 1.7, color: '#aaffcc', position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: THEME.success, borderRadius: '8px 0 0 8px' }} />
                                <code style={{ paddingLeft: 8, display: 'block', whiteSpace: 'pre-wrap' }}>
                                    {`CREATE INDEX idx_${(index.table || index.tableName || 'table').toLowerCase()}_${(index.column || 'column').toLowerCase()}
ON ${index.table || index.tableName} (${index.column || 'column_name'});

-- Estimated improvement: ${index.improvement || '70-90% faster queries'}
-- Cost reduction: ${index.costReduction || '95% lower query cost'}`}
                                </code>
                            </div>
                        </div>
                    )}

                    {/* Performance Impact */}
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <BarChart3 size={12} /> Performance Impact
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ padding: 14, background: THEME.bg, borderRadius: 8, border: `1px solid ${THEME.grid}40` }}>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 8, fontWeight: 600 }}>Query Speed</div>
                                <ProgressRing value={isMissing ? 25 : 85} size={80} color={isMissing ? THEME.danger : THEME.success} />
                            </div>
                            <div style={{ padding: 14, background: THEME.bg, borderRadius: 8, border: `1px solid ${THEME.grid}40` }}>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 8, fontWeight: 600 }}>Resource Usage</div>
                                <ProgressRing value={isMissing ? 85 : 30} size={80} color={isMissing ? THEME.warning : THEME.success} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '16px 24px', borderTop: `1px solid ${THEME.glassBorder}`,
                    display: 'flex', gap: 8
                }}>
                    {applied ? (
                        <div style={{
                            flex: 1, padding: 12, borderRadius: 8,
                            background: `${THEME.success}15`, border: `1px solid ${THEME.success}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            color: THEME.success, fontWeight: 700, fontSize: 13,
                            animation: 'idxFadeIn 0.3s ease-out'
                        }}>
                            <CheckCircle size={16} /> Action Completed
                        </div>
                    ) : (
                        <>
                            <button style={{
                                flex: 1, padding: 11, borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12,
                                background: 'transparent', border: `1px solid ${THEME.glassBorder}`,
                                color: THEME.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                transition: 'all 0.2s'
                            }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.primary; e.currentTarget.style.color = THEME.primary; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.glassBorder; e.currentTarget.style.color = THEME.textMuted; }}
                            >
                                <Eye size={13} /> Explain Plan
                            </button>
                            <button onClick={handleAction} disabled={isApplying} style={{
                                flex: 1, padding: 11, borderRadius: 8, border: 'none', cursor: isApplying ? 'wait' : 'pointer',
                                fontWeight: 700, fontSize: 12, color: '#fff',
                                background: `linear-gradient(135deg, ${actionColor}, ${actionColor}dd)`,
                                boxShadow: `0 4px 16px ${actionColor}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                transition: 'all 0.2s', opacity: isApplying ? 0.8 : 1
                            }}>
                                {isApplying ? <RotateCcw size={13} className="idx-spin" /> : <Sparkles size={13} />}
                                {isApplying ? 'Applying...' : actionLabel}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   AI ADVISOR PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const AIAdvisorPanel = ({ type, selectedIndex }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (selectedIndex) {
            setIsAnalyzing(true);
            setTimeout(() => setIsAnalyzing(false), 1200);
        }
    }, [selectedIndex]);

    if (!selectedIndex) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center'
            }}>
                <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: `${THEME.primary}10`, border: `2px dashed ${THEME.primary}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
                }}>
                    <Cpu size={24} color={THEME.primary} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain, marginBottom: 6 }}>
                    Select an index for AI analysis
                </div>
                <div style={{ fontSize: 11, color: THEME.textDim, lineHeight: 1.6, maxWidth: 280 }}>
                    Click on any row in the table to get detailed recommendations and performance insights
                </div>
            </div>
        );
    }

    if (isAnalyzing) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', padding: 40
            }}>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                    <Cpu size={32} color={THEME.primary} className="idx-spin" />
                    <div className="idx-shimmer" style={{
                        position: 'absolute', inset: -4, borderRadius: '50%', zIndex: -1
                    }} />
                </div>
                <div style={{ fontSize: 12, color: THEME.textDim, fontWeight: 600 }}>
                    Analyzing index patterns...
                </div>
            </div>
        );
    }

    const isMissing = type === 'missing';
    const recommendations = isMissing ? [
        { icon: Database, text: 'Create composite index on frequently joined columns', priority: 'high' },
        { icon: Zap, text: 'Add partial index for active records only', priority: 'medium' },
        { icon: Target, text: 'Consider covering index for common SELECT queries', priority: 'medium' }
    ] : [
        { icon: Trash2, text: 'Safe to drop - No scans in last 30 days', priority: 'high' },
        { icon: HardDrive, text: `Will free up ${selectedIndex.size || '12 MB'}`, priority: 'medium' },
        { icon: TrendingUp, text: 'Improves write performance by 8-12%', priority: 'low' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
            {/* Header */}
            <div style={{
                padding: 12, background: `${THEME.primary}08`, borderRadius: 8,
                border: `1px solid ${THEME.primary}15`, display: 'flex', alignItems: 'center', gap: 10
            }}>
                <Cpu size={16} color={THEME.primary} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: THEME.primary }}>AI Analysis Complete</div>
                    <div style={{ fontSize: 10, color: THEME.textDim }}>
                        {selectedIndex.table || selectedIndex.tableName || selectedIndex.indexName}
                    </div>
                </div>
                <SeverityBadge level={selectedIndex.severity || 'medium'} />
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <StatChip
                    label="Impact"
                    value={isMissing ? 'High' : 'Low'}
                    icon={Activity}
                    color={isMissing ? THEME.danger : THEME.success}
                    small
                />
                <StatChip
                    label="Priority"
                    value={isMissing ? 'P1' : 'P3'}
                    icon={AlertCircle}
                    color={isMissing ? THEME.warning : THEME.primary}
                    small
                />
            </div>

            {/* Recommendations */}
            <div>
                <div style={{
                    fontSize: 10, fontWeight: 700, color: THEME.textDim,
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
                    display: 'flex', alignItems: 'center', gap: 6
                }}>
                    <Lightbulb size={12} /> Recommendations
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {recommendations.map((rec, i) => (
                        <div key={i} className="idx-row-hover" style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                            background: THEME.surface, borderRadius: 6, border: `1px solid ${THEME.grid}40`,
                            animation: `idxSlideIn 0.3s ease-out ${i * 0.1}s both`
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                background: `${THEME.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <rec.icon size={14} color={THEME.primary} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, color: THEME.textMain, lineHeight: 1.4 }}>{rec.text}</div>
                            </div>
                            <span style={{
                                fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                                background: rec.priority === 'high' ? `${THEME.danger}15` : rec.priority === 'medium' ? `${THEME.warning}15` : `${THEME.success}15`,
                                color: rec.priority === 'high' ? THEME.danger : rec.priority === 'medium' ? THEME.warning : THEME.success,
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>{rec.priority}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Button */}
            <button style={{
                marginTop: 'auto', padding: 10, borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 12, color: '#fff',
                background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary || THEME.primary})`,
                boxShadow: `0 4px 16px ${THEME.primary}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s'
            }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <ArrowRight size={13} /> View Full Analysis
            </button>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const IndexesTab = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('missing');
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [detailModal, setDetailModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const result = await fetchData('/api/indexes/analysis');
                setData(result);
            } catch (e) {
                console.error('Index load error', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div style={{ padding: 24 }}><SkeletonLoader rows={5} height={100} /></div>;
    if (!data) return null;

    const getList = () => {
        let list = data[view] || [];
        if (searchQuery) {
            list = list.filter(item =>
                JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return list;
    };

    const handleRowClick = (row) => {
        setSelectedIndex({ ...row, type: view });
        setDetailModal({ ...row, type: view });
    };

    // Column definitions
    const missingColumns = [
        {
            key: 'severity', label: '', maxWidth: 70, align: 'center',
            render: (_, row) => <SeverityBadge level={row.severity || 'medium'} />
        },
        {
            key: 'table', label: 'Table', fontWeight: 600,
            render: t => <span style={{ color: THEME.primary }}>{t}</span>
        },
        {
            key: 'seq_scan', label: 'Seq Scans', align: 'right',
            render: v => <span style={{ color: THEME.warning, fontWeight: 600 }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
            key: 'idx_scan', label: 'Idx Scans', align: 'right',
            render: v => <span style={{ color: THEME.success }}>{Number(v || 0).toLocaleString()}</span>
        },
        {
            key: 'n_live_tup', label: 'Rows', align: 'right',
            render: v => <span style={{ fontVariantNumeric: 'tabular-nums', color: THEME.textMuted }}>{Number(v || 0).toLocaleString()}</span>
        }
    ];

    const unusedColumns = [
        {
            key: 'severity', label: '', maxWidth: 70, align: 'center',
            render: () => <SeverityBadge level="low" />
        },
        {
            key: 'indexName', label: 'Index Name', fontWeight: 600, maxWidth: 200,
            render: t => <span style={{ color: THEME.primary, fontSize: 11 }}>{t}</span>
        },
        {
            key: 'tableName', label: 'Table',
            render: t => <span style={{ color: THEME.textMuted }}>{t}</span>
        },
        {
            key: 'size', label: 'Size', align: 'right',
            render: v => <span style={{ color: THEME.warning, fontWeight: 600 }}>{v}</span>
        },
        {
            key: 'idx_scan', label: 'Scans', align: 'right',
            render: v => <span style={{ color: THEME.textDim }}>{Number(v || 0).toLocaleString()}</span>
        }
    ];

    const lowHitColumns = [
        {
            key: 'severity', label: '', maxWidth: 70, align: 'center',
            render: () => <SeverityBadge level="medium" />
        },
        {
            key: 'indexName', label: 'Index Name', fontWeight: 600,
            render: t => <span style={{ color: THEME.primary }}>{t}</span>
        },
        {
            key: 'hitRatio', label: 'Hit Ratio', align: 'right',
            render: v => (
                <span style={{
                    color: Number(v) < 50 ? THEME.danger : Number(v) < 80 ? THEME.warning : THEME.success,
                    fontWeight: 700
                }}>{v}%</span>
            )
        }
    ];

    const columns = view === 'missing' ? missingColumns
        : view === 'unused' ? unusedColumns
            : lowHitColumns;

    const totalIssues = (data.missing?.length || 0) + (data.unused?.length || 0) + (data.lowHit?.length || 0);
    const maxSize = Math.max(...(data.unused || []).map(u => parseInt(u.size) || 0), 1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 24px 40px 24px' }}>
            <IndexStyles />

            {/* Overview Cards */}
            <div className="idx-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {/* Total Issues */}
                <div style={{
                    padding: 20, borderRadius: 12, background: THEME.glass,
                    backdropFilter: 'blur(16px)', border: `1px solid ${THEME.glassBorder}`,
                    display: 'flex', flexDirection: 'column', gap: 12
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: `${THEME.primary}12`, border: `1px solid ${THEME.primary}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Database size={18} color={THEME.primary} />
                        </div>
                        <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.primary, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        <AnimValue value={totalIssues} />
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted }}>Index Issues</div>
                </div>

                {/* Missing Indexes */}
                <div onClick={() => { setView('missing'); setSelectedIndex(null); }} style={{
                    padding: 20, borderRadius: 12, cursor: 'pointer',
                    background: view === 'missing' ? `${THEME.warning}12` : THEME.glass,
                    backdropFilter: 'blur(16px)', border: `1px solid ${view === 'missing' ? `${THEME.warning}30` : THEME.glassBorder}`,
                    display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s',
                    position: 'relative', overflow: 'hidden'
                }}
                     onMouseEnter={e => !view === 'missing' && (e.currentTarget.style.borderColor = `${THEME.warning}25`)}
                     onMouseLeave={e => !view === 'missing' && (e.currentTarget.style.borderColor = THEME.glassBorder)}
                >
                    {view === 'missing' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: THEME.warning }} />}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: `${THEME.warning}12`, border: `1px solid ${THEME.warning}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <AlertTriangle size={18} color={THEME.warning} />
                        </div>
                        <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase' }}>Missing</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.warning, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        <AnimValue value={data.missing?.length || 0} />
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted }}>Indexes Needed</div>
                </div>

                {/* Unused Indexes */}
                <div onClick={() => { setView('unused'); setSelectedIndex(null); }} style={{
                    padding: 20, borderRadius: 12, cursor: 'pointer',
                    background: view === 'unused' ? `${THEME.danger}12` : THEME.glass,
                    backdropFilter: 'blur(16px)', border: `1px solid ${view === 'unused' ? `${THEME.danger}30` : THEME.glassBorder}`,
                    display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s',
                    position: 'relative', overflow: 'hidden'
                }}
                     onMouseEnter={e => view !== 'unused' && (e.currentTarget.style.borderColor = `${THEME.danger}25`)}
                     onMouseLeave={e => view !== 'unused' && (e.currentTarget.style.borderColor = THEME.glassBorder)}
                >
                    {view === 'unused' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: THEME.danger }} />}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: `${THEME.danger}12`, border: `1px solid ${THEME.danger}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Zap size={18} color={THEME.danger} />
                        </div>
                        <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase' }}>Unused</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.danger, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        <AnimValue value={data.unused?.length || 0} />
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted }}>Can Be Dropped</div>
                </div>

                {/* Low Hit Ratio */}
                <div onClick={() => { setView('lowHit'); setSelectedIndex(null); }} style={{
                    padding: 20, borderRadius: 12, cursor: 'pointer',
                    background: view === 'lowHit' ? `${THEME.success}12` : THEME.glass,
                    backdropFilter: 'blur(16px)', border: `1px solid ${view === 'lowHit' ? `${THEME.success}30` : THEME.glassBorder}`,
                    display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s',
                    position: 'relative', overflow: 'hidden'
                }}
                     onMouseEnter={e => view !== 'lowHit' && (e.currentTarget.style.borderColor = `${THEME.success}25`)}
                     onMouseLeave={e => view !== 'lowHit' && (e.currentTarget.style.borderColor = THEME.glassBorder)}
                >
                    {view === 'lowHit' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: THEME.success }} />}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: `${THEME.success}12`, border: `1px solid ${THEME.success}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Layers size={18} color={THEME.success} />
                        </div>
                        <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 600, textTransform: 'uppercase' }}>Low Hit</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.success, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        <AnimValue value={data.lowHit?.length || 0} />
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted }}>Need Tuning</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="idx-stagger" style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 20,
                minHeight: 500
            }}>
                {/* List Panel - takes ~60% of width */}
                <div style={{
                    background: THEME.glass,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1px solid ${THEME.glassBorder}`,
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    flexGrow: 1.5,
                    flexShrink: 1,
                    flexBasis: 0
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: `1px solid ${THEME.glassBorder}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: THEME.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em'
                            }}>
                                {view.replace(/([A-Z])/g, ' $1').toUpperCase()} Indexes
                            </div>
                            <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2 }}>
                                {getList().length} {getList().length === 1 ? 'item' : 'items'}
                            </div>
                        </div>

                        {/* Search */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} color={THEME.textDim} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        padding: '6px 10px 6px 32px',
                                        background: THEME.surface,
                                        border: `1px solid ${THEME.grid}60`,
                                        borderRadius: 6,
                                        fontSize: 11,
                                        color: THEME.textMain,
                                        width: 180,
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <DataTable
                            columns={columns}
                            data={getList()}
                            onRowClick={handleRowClick}
                            pageSize={10}
                            compact
                            emptyText="No issues detected in this category."
                        />
                    </div>
                </div>

                {/* AI Advisor Panel - takes ~40% of width */}
                <div style={{
                    background: THEME.glass,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1px solid ${THEME.glassBorder}`,
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: 0
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: `1px solid ${THEME.glassBorder}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: THEME.textMuted,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em'
                        }}>
                            AI Advisor
                        </div>
                        <Cpu size={16} color={THEME.primary} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
                        <AIAdvisorPanel type={view} selectedIndex={selectedIndex} />
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {detailModal && (
                <IndexDetailModal
                    index={detailModal}
                    onClose={() => setDetailModal(null)}
                    onAction={(idx) => console.log('Action taken on', idx)}
                />
            )}
        </div>
    );
};

export default IndexesTab;
