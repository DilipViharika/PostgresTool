// @ts-nocheck
import React, { useState, useEffect, FC } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData, postData } from '../../../utils/api';
import {
  FileText, Download, Eye, Calendar, Settings, CheckCircle,
  AlertTriangle, TrendingUp, Database, Lock, Zap, HardDrive,
  Clock, ChevronDown, ChevronUp, Plus, Trash2, Save, RefreshCw
} from 'lucide-react';

/* ── TYPE DEFINITIONS ───────────────────────────────────────────────────── */
interface Report {
    id: string;
    name: string;
    description: string;
    type: 'performance' | 'security' | 'capacity' | 'custom';
    schedule: 'daily' | 'weekly' | 'monthly' | 'manual';
    lastGenerated?: string;
    nextScheduled?: string;
}

interface ReportConfig {
    metrics: string[];
    dateRange: 'week' | 'month' | 'quarter' | 'year';
    includeCharts: boolean;
    includeRecommendations: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const Styles: FC = () => (
    <style>{`
        @keyframes rbFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .rb-container { padding:20px; max-width:1400px; }
        .rb-layout { display:grid; grid-template-columns:350px 1fr; gap:20px; }
        .rb-panel {
            background:${THEME.surface};
            border:1px solid ${THEME.grid};
            border-radius:12px;
            padding:20px;
            animation:rbFade .3s ease;
            max-height:calc(100vh - 100px);
            overflow-y:auto;
        }
        .rb-preview { background:${THEME.surfaceRaised}; border-radius:12px; }
        .rb-section-title {
            font-size:14px;
            font-weight:700;
            color:${THEME.textMuted};
            text-transform:uppercase;
            letter-spacing:0.5px;
            margin:20px 0 12px 0;
        }
        .rb-input {
            width:100%;
            background:${THEME.bg};
            border:1px solid ${THEME.grid};
            border-radius:8px;
            padding:10px 12px;
            color:${THEME.textMain};
            font-size:13px;
            margin-bottom:12px;
            font-family:inherit;
        }
        .rb-input:focus { outline:none; border-color:${THEME.primary}; box-shadow:0 0 0 2px ${THEME.primary}20; }
        .rb-button { background:${THEME.primary}; color:${THEME.textInverse}; border:none; border-radius:8px; padding:10px 16px; font-weight:700; font-size:13px; cursor:pointer; }
        .rb-button:hover { background:${THEME.primaryLight}; }
        .rb-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT BUILDER TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const ReportBuilderTab: FC = () => {
    useAdaptiveTheme();
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [config, setConfig] = useState<ReportConfig>({
        metrics: [],
        dateRange: 'month',
        includeCharts: true,
        includeRecommendations: true,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchData('/api/reports/list');
                setReports(data?.reports || []);
                if (data?.reports?.[0]) setSelectedReport(data.reports[0]);
            } catch (e) {
                console.error('Failed to load reports:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleGenerateReport = async () => {
        if (!selectedReport) return;
        try {
            const result = await postData('/api/reports/generate', {
                reportId: selectedReport.id,
                config
            });
            alert('Report generated successfully');
        } catch (e) {
            alert('Failed to generate report: ' + (e instanceof Error ? e.message : 'Unknown error'));
        }
    };

    return (
        <div className="rb-container">
            <Styles />

            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.textMain, margin: 0 }}>
                    <FileText size={24} style={{ display: 'inline-block', marginRight: '10px', verticalAlign: 'middle' }} />
                    Report Builder
                </h1>
                <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: '8px' }}>
                    Create and schedule automated reports
                </p>
            </div>

            <div className="rb-layout">
                <div className="rb-panel">
                    <div className="rb-section-title">Available Reports</div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: THEME.textMuted }}>
                            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : (
                        reports.map(report => (
                            <div
                                key={report.id}
                                onClick={() => setSelectedReport(report)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '6px',
                                    background: selectedReport?.id === report.id ? `${THEME.primary}20` : THEME.bg,
                                    border: `1px solid ${selectedReport?.id === report.id ? THEME.primary : THEME.grid}`,
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>
                                    {report.name}
                                </div>
                                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: '4px' }}>
                                    {report.type} • {report.schedule}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="rb-panel">
                    {selectedReport ? (
                        <>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, marginBottom: '16px' }}>
                                {selectedReport.name}
                            </h2>
                            <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: '20px' }}>
                                {selectedReport.description}
                            </p>

                            <div className="rb-section-title">Report Configuration</div>

                            <div className="rb-row">
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, display: 'block', marginBottom: '8px' }}>
                                        Date Range
                                    </label>
                                    <select
                                        value={config.dateRange}
                                        onChange={(e) => setConfig({ ...config, dateRange: e.target.value as any })}
                                        className="rb-input"
                                        style={{ marginBottom: 0 }}
                                    >
                                        <option value="week">Last 7 days</option>
                                        <option value="month">Last 30 days</option>
                                        <option value="quarter">Last 90 days</option>
                                        <option value="year">Last 12 months</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px', padding: '12px', background: THEME.bg, borderRadius: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.includeCharts}
                                        onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
                                    />
                                    <span style={{ fontSize: 13, color: THEME.textMain, fontWeight: 600 }}>Include Charts</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.includeRecommendations}
                                        onChange={(e) => setConfig({ ...config, includeRecommendations: e.target.checked })}
                                    />
                                    <span style={{ fontSize: 13, color: THEME.textMain, fontWeight: 600 }}>Include Recommendations</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleGenerateReport}
                                    className="rb-button"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Download size={14} />
                                    Generate & Download
                                </button>
                            </div>

                            {selectedReport.lastGenerated && (
                                <div style={{ marginTop: '20px', fontSize: 11, color: THEME.textMuted }}>
                                    <div style={{ marginBottom: '4px' }}>
                                        <strong>Last Generated:</strong> {selectedReport.lastGenerated}
                                    </div>
                                    {selectedReport.nextScheduled && (
                                        <div>
                                            <strong>Next Scheduled:</strong> {selectedReport.nextScheduled}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: THEME.textMuted }}>
                            Select a report to configure
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportBuilderTab;
