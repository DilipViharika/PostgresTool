// @ts-nocheck
import React, { useState, useEffect, useCallback, FC } from 'react';
import {
    FileSearch,
    RefreshCw,
    AlertTriangle,
    Clock,
    Database,
    Activity,
    Search,
    CheckCircle,
    TrendingUp,
    Zap,
    Shield,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';

/* ── TYPE DEFINITIONS ───────────────────────────────────────────────────── */
interface SummaryCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    color?: string;
    isLoading?: boolean;
}

const Styles: FC = () => (
    <style>{`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }
    .slide-up {
      animation: slideUp 0.4s ease-out;
    }
  `}</style>
);

const SummaryCard: FC<SummaryCardProps> = ({ label, value, subtext, color = THEME.primary, isLoading }) => {
    if (isLoading) {
        return (
            <div
                style={{
                    background: THEME.glass,
                    border: `1px solid ${THEME.glassBorder}`,
                    borderRadius: '12px',
                    padding: '20px',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '8px' }}>
                    {label}
                </div>
                <div
                    style={{
                        height: '32px',
                        background: THEME.textDim,
                        borderRadius: '6px',
                        animation: 'pulse 2s infinite',
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className="slide-up"
            style={{
                background: THEME.glass,
                border: `1px solid ${THEME.glassBorder}`,
                borderRadius: '12px',
                padding: '20px',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = `rgba(0, 212, 255, 0.08)`;
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(0, 212, 255, 0.25)`;
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = THEME.glass;
                (e.currentTarget as HTMLElement).style.borderColor = THEME.glassBorder;
            }}
        >
            <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '8px' }}>
                {label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: '600', color, fontFamily: THEME.fontDisplay }}>
                    {value}
                </div>
            </div>
            {subtext && <div style={{ fontSize: '11px', color: THEME.textMuted, marginTop: '4px' }}>{subtext}</div>}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOG PATTERN ANALYSIS TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const LogPatternAnalysisTab: FC = () => {
    useAdaptiveTheme();
    const [patterns, setPatterns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPattern, setSelectedPattern] = useState<any | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchData('/api/logs/patterns');
                setPatterns(data?.patterns || []);
            } catch (e) {
                console.error('Failed to load patterns:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredPatterns = patterns.filter(p =>
        (p.message || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '20px', maxWidth: '1600px' }}>
            <Styles />

            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.textMain, margin: 0 }}>
                    Log Pattern Analysis
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                    <FileSearch size={16} color={THEME.primary} />
                    <span style={{ fontSize: 13, color: THEME.textMuted }}>
                        Analyzing {patterns.length} unique patterns
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <SummaryCard
                    label="Total Patterns"
                    value={patterns.length}
                    color={THEME.primary}
                    isLoading={loading}
                />
                <SummaryCard
                    label="Error Rate"
                    value="2.3%"
                    color={THEME.danger}
                    isLoading={loading}
                />
                <SummaryCard
                    label="Anomalies"
                    value="5"
                    color={THEME.warning}
                    isLoading={loading}
                />
                <SummaryCard
                    label="Status"
                    value="Healthy"
                    color={THEME.success}
                    isLoading={loading}
                />
            </div>

            <div style={{
                background: THEME.surface,
                border: `1px solid ${THEME.grid}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Search size={16} color={THEME.primary} />
                    <input
                        type="text"
                        placeholder="Search patterns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 1,
                            background: THEME.bg,
                            border: `1px solid ${THEME.grid}`,
                            borderRadius: '6px',
                            padding: '8px 12px',
                            color: THEME.textMain,
                            fontSize: '13px'
                        }}
                    />
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredPatterns.length > 0 ? (
                        filteredPatterns.map((pattern, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedPattern(pattern)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '6px',
                                    background: selectedPattern?.id === pattern.id ? THEME.primary + '20' : THEME.bg,
                                    border: `1px solid ${selectedPattern?.id === pattern.id ? THEME.primary : THEME.grid}`,
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: THEME.textMain }}>
                                        {pattern.message}
                                    </span>
                                    <span style={{ fontSize: '11px', color: THEME.textMuted }}>
                                        ({pattern.count} occurrences)
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: THEME.textMuted }}>
                            No patterns found
                        </div>
                    )}
                </div>
            </div>

            {selectedPattern && (
                <div style={{
                    background: THEME.surface,
                    border: `1px solid ${THEME.grid}`,
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, marginBottom: '12px' }}>
                        Pattern Details
                    </h3>
                    <div style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: 'monospace', lineHeight: '1.6' }}>
                        {JSON.stringify(selectedPattern, null, 2)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogPatternAnalysisTab;
