// @ts-nocheck
import React, { useState } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData, postData } from '../../../utils/api';
import { Sparkles, Zap, AlertTriangle, CheckCircle, Search, Lightbulb, Target, RefreshCw } from 'lucide-react';

/* ── Type Definitions ─────────────────────────────────────────────────────── */
interface QueryAnalysis {
    complexityScore: number;
    suggestions: QuerySuggestion[];
    antiPatterns: AntiPattern[];
}

interface QuerySuggestion {
    title: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation?: string;
}

interface AntiPattern {
    pattern: string;
    description: string;
}

interface DiscoveredQuery {
    query: string;
    avgDuration: number;
    calls: number;
    suggestion: string;
}

interface IndexRecommendation {
    indexName: string;
    columns: string[];
    expectedImprovementPercent: number;
}

/* ── Styles Component ─────────────────────────────────────────────────────── */
const Styles = () => (
    <style>{`
        @keyframes aqSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes aqFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .aq-card { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:12px; padding:20px; animation:aqFade .3s ease; }
        .aq-label { font-size:12px; font-weight:700; color:${THEME.textMuted}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; }
        .aq-textarea { background:${THEME.surfaceHover}; border:1px solid ${THEME.grid}; border-radius:8px; padding:12px; color:${THEME.textMain}; font-size:13px; font-family:monospace; width:100%; resize:vertical; min-height:120px; }
        .aq-textarea:focus { outline:none; border-color:${THEME.primary}; }
        .aq-button { background:${THEME.primary}; color:${THEME.textInverse}; border:none; border-radius:8px; padding:10px 16px; font-weight:700; font-size:13px; cursor:pointer; }
        .aq-button:hover { background:${THEME.primaryLight}; }
        .aq-button:disabled { opacity:0.5; cursor:not-allowed; }
        .aq-button-secondary { background:${THEME.secondary}; }
        .aq-button-secondary:hover { background:${THEME.secondaryLight}; }
        .aq-suggestion-card { background:${THEME.grid}; border-left:4px solid; border-radius:8px; padding:12px; margin-bottom:12px; }
        .aq-severity-high { border-color:${THEME.danger}; }
        .aq-severity-medium { border-color:${THEME.warning}; }
        .aq-severity-low { border-color:${THEME.success}; }
        .aq-badge { display:inline-block; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:700; margin-right:8px; }
        .aq-badge-high { background:${THEME.danger}20; color:${THEME.danger}; }
        .aq-badge-medium { background:${THEME.warning}20; color:${THEME.warning}; }
        .aq-badge-low { background:${THEME.success}20; color:${THEME.success}; }
        .aq-gauge { width:100%; height:8px; background:${THEME.grid}; border-radius:4px; overflow:hidden; }
        .aq-gauge-fill { height:100%; border-radius:4px; transition:width 0.3s; }
        .aq-spinner { animation:aqSpin 1s linear infinite; }
    `}</style>
);

/* ── Helper Functions ─────────────────────────────────────────────────────── */
const getComplexityColor = (score: number): string => {
    if (score < 30) return THEME.success;
    if (score < 70) return THEME.warning;
    return THEME.danger;
};

const fmt = (n: number | null): string => n === null ? '—' : Number(n).toLocaleString();

/* ═══════════════════════════════════════════════════════════════════════════
   AI QUERY ADVISOR TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const AIQueryAdvisorTab: React.FC = () => {
    useAdaptiveTheme();
    const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM pg_stat_statements LIMIT 10;');
    const [analyzing, setAnalyzing] = useState<boolean>(false);
    const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null);
    const [suggestions, setSuggestions] = useState<DiscoveredQuery[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [indexRecs, setIndexRecs] = useState<IndexRecommendation[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Auto-discover slow queries
    const handleAutoDiscover = async () => {
        setLoading(true);
        try {
            const data = await fetchData('/api/ai-query/suggestions');
            setSuggestions(data?.suggestions || []);
            setError(null);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Analyze query
    const handleAnalyze = async () => {
        if (!sqlQuery.trim()) {
            setError('Please enter a SQL query');
            return;
        }
        setAnalyzing(true);
        try {
            const result = await postData('/api/ai-query/analyze', { query: sqlQuery });
            setAnalysis(result);
            setError(null);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setAnalyzing(false);
        }
    };

    // Get index recommendations
    const handleGetIndexRecs = async () => {
        if (!selectedTable.trim()) {
            setError('Please enter a table name');
            return;
        }
        setLoading(true);
        try {
            const data = await fetchData(`/api/ai-query/indexes?table=${encodeURIComponent(selectedTable)}`);
            setIndexRecs(data?.recommendations || []);
            setError(null);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Get full report
    const handleGetReport = async () => {
        try {
            const result = await fetchData('/api/ai-query/report');
            // Trigger download
            const element = document.createElement('a');
            element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`);
            element.setAttribute('download', 'query-analysis-report.json');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1400px' }}>
            <Styles />

            {error && (
                <div style={{
                    background: `${THEME.danger}15`,
                    border: `1px solid ${THEME.danger}40`,
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 20,
                    color: THEME.danger,
                    fontSize: 13
                }}>
                    <AlertTriangle size={16} style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
                    {error}
                </div>
            )}

            {/* Query Input */}
            <div className="aq-card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, marginBottom: 12 }}>
                    <Sparkles size={18} style={{ display: 'inline-block', marginRight: 10, verticalAlign: 'middle' }} />
                    Analyze SQL Query
                </div>
                <div className="aq-label" style={{ marginBottom: 12 }}>SQL Query</div>
                <textarea
                    className="aq-textarea"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="Paste your SQL query here..."
                />
                <button className="aq-button" onClick={handleAnalyze} disabled={analyzing} style={{ marginTop: 12 }}>
                    {analyzing ? <RefreshCw size={14} className="aq-spinner" style={{ marginRight: 6 }} /> : <Zap size={14} style={{ marginRight: 6 }} />}
                    {analyzing ? 'Analyzing...' : 'Analyze Query'}
                </button>
            </div>

            {/* Analysis Results */}
            {analysis && (
                <div className="aq-card" style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, marginBottom: 20 }}>
                        <Zap size={18} style={{ display: 'inline-block', marginRight: 10, verticalAlign: 'middle' }} />
                        Analysis Results
                    </div>

                    {/* Complexity Score */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 8 }}>
                            Complexity Score: <span style={{ color: getComplexityColor(analysis.complexityScore) }}>{analysis.complexityScore}/100</span>
                        </div>
                        <div className="aq-gauge">
                            <div className="aq-gauge-fill" style={{
                                width: `${analysis.complexityScore}%`,
                                background: getComplexityColor(analysis.complexityScore)
                            }} />
                        </div>
                    </div>

                    {/* Optimization Suggestions */}
                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 12 }}>
                                <Lightbulb size={14} style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }} />
                                Optimization Suggestions
                            </div>
                            {analysis.suggestions.map((sug, i) => (
                                <div key={i} className={`aq-suggestion-card aq-severity-${sug.severity}`}>
                                    <div style={{ marginBottom: 6 }}>
                                        <span className={`aq-badge aq-badge-${sug.severity}`}>{sug.severity.toUpperCase()}</span>
                                        <span style={{ color: THEME.textMain, fontWeight: 700, fontSize: 13 }}>{sug.title}</span>
                                    </div>
                                    <div style={{ color: THEME.textDim, fontSize: 12 }}>{sug.description}</div>
                                    {sug.recommendation && (
                                        <div style={{ marginTop: 8, padding: 8, background: `${THEME.bg}40`, borderRadius: 14, fontSize: 12, color: THEME.textMuted }}>
                                            <strong>Recommendation:</strong> {sug.recommendation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Anti-patterns */}
                    {analysis.antiPatterns && analysis.antiPatterns.length > 0 && (
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 12 }}>
                                <AlertTriangle size={14} style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }} />
                                Anti-pattern Detection
                            </div>
                            {analysis.antiPatterns.map((ap, i) => (
                                <div key={i} style={{
                                    background: `${THEME.warning}15`,
                                    border: `1px solid ${THEME.warning}40`,
                                    borderRadius: 8,
                                    padding: 12,
                                    marginBottom: 12,
                                    fontSize: 12,
                                    color: THEME.warning
                                }}>
                                    <strong>{ap.pattern}</strong> - {ap.description}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Auto-Discover Slow Queries */}
            <div className="aq-card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, marginBottom: 16 }}>
                    <Search size={18} style={{ display: 'inline-block', marginRight: 10, verticalAlign: 'middle' }} />
                    Auto-Discover Slow Queries
                </div>
                <p style={{ color: THEME.textMuted, fontSize: 13, marginBottom: 12 }}>
                    Find the slowest queries in your database and get optimization suggestions.
                </p>
                <button className="aq-button aq-button-secondary" onClick={handleAutoDiscover} disabled={loading}>
                    {loading ? <RefreshCw size={14} className="aq-spinner" style={{ marginRight: 6 }} /> : <Search size={14} style={{ marginRight: 6 }} />}
                    {loading ? 'Discovering...' : 'Discover Queries'}
                </button>

                {suggestions.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        {suggestions.map((sug, i) => (
                            <div key={i} className="aq-suggestion-card aq-severity-high">
                                <div style={{ color: THEME.textMain, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                                    {sug.query.substring(0, 60)}...
                                </div>
                                <div style={{ fontSize: 12, color: THEME.textDim, marginBottom: 6 }}>
                                    Avg Duration: {fmt(sug.avgDuration)}ms | Calls: {fmt(sug.calls)}
                                </div>
                                <div style={{ fontSize: 11, color: THEME.textMuted }}>
                                    Suggestion: {sug.suggestion}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Index Recommendations */}
            <div className="aq-card" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, marginBottom: 16 }}>
                    <Target size={18} style={{ display: 'inline-block', marginRight: 10, verticalAlign: 'middle' }} />
                    Index Recommendations
                </div>
                <div className="aq-label">Table Name</div>
                <input
                    type="text"
                    style={{
                        background: THEME.surfaceHover,
                        border: `1px solid ${THEME.grid}`,
                        borderRadius: 8,
                        padding: '10px 12px',
                        color: THEME.textMain,
                        fontSize: 13,
                        width: '100%',
                        marginBottom: 12
                    }}
                    placeholder="e.g., pg_stat_statements"
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                />
                <button className="aq-button" onClick={handleGetIndexRecs} disabled={loading} style={{ marginBottom: 16 }}>
                    {loading ? <RefreshCw size={14} className="aq-spinner" style={{ marginRight: 6 }} /> : <Target size={14} style={{ marginRight: 6 }} />}
                    Get Recommendations
                </button>

                {indexRecs.length > 0 && (
                    <div>
                        {indexRecs.map((rec, i) => (
                            <div key={i} style={{
                                background: THEME.grid,
                                borderRadius: 8,
                                padding: 12,
                                marginBottom: 12,
                                borderLeft: `4px solid ${THEME.success}`
                            }}>
                                <div style={{ color: THEME.textMain, fontWeight: 700, fontSize: 12, marginBottom: 6, fontFamily: 'monospace' }}>
                                    {rec.indexName}
                                </div>
                                <div style={{ fontSize: 11, color: THEME.textDim }}>
                                    <strong>Columns:</strong> {rec.columns.join(', ')}<br />
                                    <strong>Expected Impact:</strong> {rec.expectedImprovementPercent}% faster
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Full Report */}
            <div className="aq-card">
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, marginBottom: 12 }}>
                    <CheckCircle size={18} style={{ display: 'inline-block', marginRight: 10, verticalAlign: 'middle' }} />
                    Generate Report
                </div>
                <p style={{ color: THEME.textMuted, fontSize: 13, marginBottom: 12 }}>
                    Download a comprehensive JSON report of all query analysis and recommendations.
                </p>
                <button className="aq-button aq-button-secondary" onClick={handleGetReport}>
                    <Zap size={14} style={{ marginRight: 6 }} />
                    Download Full Report
                </button>
            </div>
        </div>
    );
};

export default AIQueryAdvisorTab;
