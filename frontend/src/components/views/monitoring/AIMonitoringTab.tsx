// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef, FC } from 'react';
import { THEME } from '../../../utils/theme.jsx';
import { fetchData, postData } from '../../../utils/api';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    Brain, AlertTriangle, TrendingUp, Zap, Lock, Database, CheckCircle,
    RefreshCw, Send, ChevronRight, Lightbulb, Shield, Activity,
    AlertCircle, Search, Clock, BarChart2
} from 'lucide-react';

// Types
interface HealthScore {
    score: number;
    components?: Record<string, number>;
}

interface Anomaly {
    description: string;
    value: number;
    zScore: number;
    timestamp: string;
    severity: 'critical' | 'warning' | 'info';
}

interface Suggestion {
    id: string;
    title: string;
    description: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
    actions?: string[];
}

interface Pattern {
    id: string;
    name: string;
    description: string;
    impact: string;
    recommendation: string;
}

interface QueryResult {
    interpretation?: string;
    explanation?: string;
    results?: any[];
    error?: string;
}

interface Recommendation {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    estimatedImprovement: string;
    category: 'Performance' | 'Security' | 'Maintenance' | 'Optimization';
    suggestedAction?: string;
}

interface PredictiveInsight {
    id: string;
    title: string;
    value: string;
    confidence: number;
    recommendation: string;
    status: 'low' | 'medium' | 'high';
}

interface QueryOptimization {
    id: string;
    query: string;
    estimatedImprovement: string;
    suggestedIndex?: string;
    suggestedRewrite?: string;
}

const fmt = (n: number | null) => n === null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });

const ChartTooltip: FC<any> = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-vigil-surface border border-vigil-accent/20 rounded-lg p-3 text-xs">
            {payload.map((p: any) => (
                <div key={p.name} className="font-semibold mb-1" style={{ color: p.color }}>
                    {p.name}: {fmt(p.value)}
                </div>
            ))}
        </div>
    );
};

const getHealthColor = (score: number) => {
    if (score >= 90) return '#00ff88';
    if (score >= 75) return '#ffaa00';
    if (score >= 50) return '#ff6633';
    return '#ff3344';
};

const AIMonitoringTab: FC = () => {
    const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
    const [queryOptimizations, setQueryOptimizations] = useState<QueryOptimization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [question, setQuestion] = useState('');
    const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
    const [queryLoading, setQueryLoading] = useState(false);

    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
    const [remediationModal, setRemediationModal] = useState<string | null>(null);
    const [remediating, setRemediating] = useState(false);

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [h, a, s, p, rec, pred, qopt] = await Promise.all([
                    fetchData('/api/ai-monitoring/health-score'),
                    fetchData('/api/ai-monitoring/anomalies'),
                    fetchData('/api/ai-monitoring/suggestions'),
                    fetchData('/api/ai-monitoring/patterns'),
                    fetchData('/api/ai-monitoring/recommendations').catch(() => ({ recommendations: [] })),
                    fetchData('/api/ai-monitoring/predictive-insights').catch(() => ({ insights: [] })),
                    fetchData('/api/ai-monitoring/query-optimizations').catch(() => ({ optimizations: [] })),
                ]);

                setHealthScore(h);
                setAnomalies(a?.anomalies || []);
                setSuggestions(s?.suggestions || []);
                setPatterns(p?.patterns || []);
                setRecommendations(rec?.recommendations || []);
                setPredictiveInsights(pred?.insights || []);
                setQueryOptimizations(qopt?.optimizations || []);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load monitoring data');
                console.error('Failed to load AI monitoring data', { error: err.message });
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
        pollIntervalRef.current = setInterval(loadInitialData, 30000);
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    const handleAskQuestion = useCallback(async () => {
        if (!question.trim()) return;

        try {
            setQueryLoading(true);
            const result = await postData('/api/ai-monitoring/ask', { question });
            setQueryResults(result);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to process question', { error: err.message });
        } finally {
            setQueryLoading(false);
        }
    }, [question]);

    const handleRemediate = useCallback(async (action: string) => {
        try {
            setRemediating(true);
            const result = await postData('/api/ai-monitoring/remediate', { action, confirm: true });
            alert(`Remediation: ${result.message}`);
            setRemediationModal(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setRemediating(false);
        }
    }, []);

    const suggestedQuestions = [
        'What are the slowest queries?',
        'Show me table bloat',
        'Check replication lag',
        'How many active connections?',
        'Database health status',
    ];

    if (loading) {
        return (
            <div className="p-10 text-center">
                <style>{`
                    @keyframes aimFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                    @keyframes aimPulse { 0%{opacity:1} 50%{opacity:0.6} 100%{opacity:1} }
                    @keyframes aimSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .aim-spinner { animation: aimSpin 1s linear infinite; }
                `}</style>
                <div className="flex items-center justify-center gap-2">
                    <Brain className="aim-spinner" size={20} />
                    <span className="text-vigil-muted">Loading AI monitoring...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-6xl mx-auto">
            <style>{`
                @keyframes aimFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes aimPulse { 0%{opacity:1} 50%{opacity:0.6} 100%{opacity:1} }
                @keyframes aimSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .aim-card { background: var(--surface); border: 1px solid var(--grid); border-radius: 12px; padding: 20px; animation: aimFade 0.3s ease; }
                .aim-spinner { animation: aimSpin 1s linear infinite; }
                .aim-section { margin-bottom: 24px; }
                .aim-section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
                .aim-health-gauge { position: relative; width: 200px; height: 200px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
                .aim-health-value { font-size: 48px; font-weight: 800; z-index: 2; }
                .aim-health-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .aim-anomaly-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-right: 8px; border-left: 3px solid; }
                .aim-severity-critical { background: #ff3344 20%; color: #ff3344; border-left-color: #ff3344; }
                .aim-severity-warning { background: #ffaa00 20%; color: #ffaa00; border-left-color: #ffaa00; }
                .aim-severity-info { background: #00d4ff 20%; color: #00d4ff; border-left-color: #00d4ff; }
                .aim-input-group { display: flex; gap: 10px; align-items: stretch; }
                .aim-input { flex: 1; background: var(--surfaceHover); border: 1px solid var(--grid); border-radius: 8px; padding: 12px 16px; font-size: 14px; }
                .aim-input:focus { outline: none; border-color: #00d4ff; box-shadow: 0 0 0 2px #00d4ff20; }
                .aim-btn { background: #00d4ff; color: var(--surface); border: none; border-radius: 8px; padding: 12px 20px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; transition: all 0.2s; }
                .aim-btn:hover { background: #00d4ffcc; transform: translateY(-2px); }
                .aim-suggestion-card { background: var(--surfaceHover); border: 1px solid var(--grid); border-left: 3px solid #00d4ff; border-radius: 8px; padding: 16px; margin-bottom: 12px; animation: aimFade 0.3s ease; }
                .aim-suggestion-title { font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
                .aim-suggestion-desc { font-size: 13px; margin-bottom: 12px; line-height: 1.4; }
                .aim-action-tag { display: inline-block; padding: 4px 10px; background: var(--grid); border-radius: 4px; font-size: 12px; margin-right: 8px; margin-bottom: 8px; }
                .aim-query-chip { display: inline-block; padding: 8px 14px; background: var(--grid); border: 1px solid var(--grid); border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; margin-right: 8px; margin-bottom: 8px; }
                .aim-query-chip:hover { background: var(--surfaceHover); border-color: #00d4ff; color: #00d4ff; }
                .aim-error { background: #ff3344 15%; border: 1px solid #ff3344; border-radius: 8px; padding: 16px; color: #ff3344; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
            `}</style>

            {/* Error Banner */}
            {error && (
                <div className="aim-error">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Health Score Panel */}
            <div className="aim-section">
                <div className="aim-section-title text-vigil-text">
                    <Activity size={16} /> Database Health
                </div>
                <div className="aim-card text-center p-7">
                    <div
                        className="aim-health-gauge"
                        style={{
                            background: `conic-gradient(${getHealthColor(healthScore?.score || 0)} 0deg ${(healthScore?.score || 0) * 3.6}deg, var(--grid) ${(healthScore?.score || 0) * 3.6}deg 360deg)`,
                        }}
                    >
                        <div style={{ position: 'absolute', width: 160, height: 160, background: THEME.surface, borderRadius: '50%' }} />
                        <div style={{ position: 'relative', textAlign: 'center' }}>
                            <div className="aim-health-value text-vigil-cyan">{healthScore?.score || 0}</div>
                            <div className="aim-health-label text-vigil-muted">Health Score</div>
                        </div>
                    </div>

                    {/* Component breakdown */}
                    <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                        {healthScore?.components && Object.entries(healthScore.components).map(([key, value]) => (
                            <div key={key} className="p-3 bg-vigil-accent/10 rounded-lg">
                                <div className="text-xs text-vigil-muted mb-1 capitalize font-semibold">{key}</div>
                                <div className="text-lg font-bold" style={{ color: getHealthColor(value as number) }}>{Math.round(value as number)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Smart Recommendations Panel */}
            <div className="aim-section">
                <div className="aim-section-title text-vigil-text">
                    <Lightbulb size={16} /> Smart Recommendations
                </div>
                {recommendations.length === 0 ? (
                    <div className="aim-card text-center p-7 text-vigil-muted">
                        <CheckCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                        <div>No recommendations at this time</div>
                    </div>
                ) : (
                    <div>
                        {recommendations.slice(0, 5).map((rec) => (
                            <div key={rec.id} className="aim-suggestion-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div className="aim-suggestion-title text-vigil-text">
                                            {rec.severity === 'critical' && <AlertTriangle size={14} style={{ color: '#ff3344', display: 'inline-block', marginRight: 8 }} />}
                                            {rec.severity === 'warning' && <AlertTriangle size={14} style={{ color: '#ffaa00', display: 'inline-block', marginRight: 8 }} />}
                                            {rec.severity === 'info' && <Lightbulb size={14} style={{ color: '#00d4ff', display: 'inline-block', marginRight: 8 }} />}
                                            {rec.title}
                                        </div>
                                        <div className="aim-suggestion-desc text-vigil-muted">{rec.description}</div>
                                        <div className="text-xs text-vigil-cyan mb-3">
                                            <strong>Estimated Improvement:</strong> {rec.estimatedImprovement}
                                        </div>
                                        <div className="aim-action-tag text-vigil-muted">{rec.category}</div>
                                    </div>
                                    <button className="aim-btn" style={{ marginLeft: 16, whiteSpace: 'nowrap' }}>
                                        Apply
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Predictive Insights */}
            <div className="aim-section">
                <div className="aim-section-title text-vigil-text">
                    <TrendingUp size={16} /> Predictive Insights
                </div>
                {predictiveInsights.length === 0 ? (
                    <div className="aim-card text-center p-7 text-vigil-muted">
                        No predictive insights available
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        {predictiveInsights.map((insight) => (
                            <div key={insight.id} className="aim-card">
                                <div className="font-bold text-vigil-text mb-3">{insight.title}</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: THEME.primary, marginBottom: 8 }}>
                                    {insight.value}
                                </div>
                                <div className="text-xs text-vigil-muted mb-4">
                                    <strong>Confidence:</strong> {Math.round(insight.confidence * 100)}%
                                </div>
                                <div style={{
                                    background: insight.status === 'high' ? '#ff334420' : insight.status === 'medium' ? '#ffaa0020' : '#00d4ff20',
                                    borderRadius: 6,
                                    padding: 8,
                                    marginBottom: 12,
                                    fontSize: 12,
                                    color: insight.status === 'high' ? '#ff3344' : insight.status === 'medium' ? '#ffaa00' : '#00d4ff'
                                }}>
                                    Status: <strong>{insight.status.toUpperCase()}</strong>
                                </div>
                                <div className="text-xs text-vigil-cyan">
                                    <strong>Action:</strong> {insight.recommendation}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Query Optimization Suggestions */}
            <div className="aim-section">
                <div className="aim-section-title text-vigil-text">
                    <Zap size={16} /> Query Optimization Suggestions
                </div>
                {queryOptimizations.length === 0 ? (
                    <div className="aim-card text-center p-7 text-vigil-muted">
                        All queries are well-optimized
                    </div>
                ) : (
                    <div>
                        {queryOptimizations.slice(0, 5).map((qopt, idx) => (
                            <div key={qopt.id} className="aim-card mb-3">
                                <div className="font-bold text-vigil-text mb-2">
                                    Query {idx + 1}
                                </div>
                                <div style={{ background: THEME.surface, borderRadius: 6, padding: 12, marginBottom: 12, fontSize: 12, fontFamily: 'monospace', color: THEME.textMuted, overflow: 'auto', maxHeight: 100 }}>
                                    {qopt.query}
                                </div>
                                <div className="text-xs text-vigil-cyan mb-2">
                                    <strong>Estimated Improvement:</strong> {qopt.estimatedImprovement}
                                </div>
                                {qopt.suggestedIndex && (
                                    <div className="text-xs text-vigil-muted mb-2 p-2 bg-vigil-accent/10 rounded">
                                        <strong>Suggested Index:</strong> {qopt.suggestedIndex}
                                    </div>
                                )}
                                {qopt.suggestedRewrite && (
                                    <div className="text-xs text-vigil-muted p-2 bg-vigil-accent/10 rounded">
                                        <strong>Query Rewrite:</strong> {qopt.suggestedRewrite}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Anomalies Feed */}
            <div className="aim-section">
                <div className="aim-section-title text-vigil-text">
                    <AlertTriangle size={16} /> Detected Anomalies ({anomalies.length})
                </div>
                {anomalies.length === 0 ? (
                    <div className="aim-card text-center p-10 text-vigil-muted">
                        <CheckCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                        <div>No anomalies detected</div>
                    </div>
                ) : (
                    <div>
                        {anomalies.map((anom, idx) => (
                            <div key={idx} className="aim-card mb-3">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div>
                                        <div className="font-bold text-vigil-text mb-1">
                                            {anom.description}
                                        </div>
                                        <div className="text-xs text-vigil-muted">
                                            Value: {fmt(anom.value)} • Z-Score: {anom.zScore} • {new Date(anom.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <div className={`aim-anomaly-badge aim-severity-${anom.severity}`}>
                                        {anom.severity.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Remediation & Optimization */}
            <div className="aim-section">
                <div className="aim-section-title text-vigil-text">
                    <Lightbulb size={16} /> Optimization Suggestions
                </div>
                {suggestions.length === 0 ? (
                    <div className="aim-card text-center p-7 text-vigil-muted">
                        No suggestions available
                    </div>
                ) : (
                    <div>
                        {suggestions.map((sugg) => (
                            <div key={sugg.id} className="aim-suggestion-card">
                                <div className="aim-suggestion-title text-vigil-text">
                                    <Zap size={14} style={{ color: sugg.priority === 'high' ? '#ff3344' : sugg.priority === 'medium' ? '#ffaa00' : '#00d4ff' }} />
                                    {sugg.title}
                                </div>
                                <div className="aim-suggestion-desc text-vigil-muted">{sugg.description}</div>
                                <div className="text-xs text-vigil-muted mb-3">
                                    <strong>Impact:</strong> {sugg.impact}
                                </div>
                                <div>
                                    {sugg.actions?.map((action, idx) => (
                                        <div key={idx} className="aim-action-tag text-vigil-muted">{action}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detected Patterns */}
            <div className="aim-section">
                <div className="aim-section-title text-vigil-text">
                    <TrendingUp size={16} /> Detected Patterns
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {patterns.map((pattern) => (
                        <div key={pattern.id} className="aim-card">
                            <div className="font-bold text-vigil-text mb-2">{pattern.name}</div>
                            <div className="text-xs text-vigil-muted mb-3 leading-relaxed">
                                {pattern.description}
                            </div>
                            <div className="text-xs p-2 bg-vigil-accent/10 rounded mb-2 text-vigil-muted">
                                <strong>Impact:</strong> {pattern.impact}
                            </div>
                            <div className="text-xs text-vigil-cyan">
                                <strong>Recommendation:</strong> {pattern.recommendation}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Natural Language Query Interface */}
            <div className="aim-section">
                <div className="aim-section-title text-vigil-text">
                    <Search size={16} /> Ask Database
                </div>
                <div className="aim-card">
                    <div className="aim-input-group mb-4">
                        <input
                            type="text"
                            className="aim-input text-vigil-text"
                            placeholder="Ask a question about your database..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                        />
                        <button
                            className="aim-btn"
                            onClick={handleAskQuestion}
                            disabled={queryLoading}
                        >
                            {queryLoading ? <RefreshCw size={16} style={{ animation: 'aimSpin 1s linear infinite' }} /> : <Send size={16} />}
                            Ask
                        </button>
                    </div>

                    {/* Suggested questions */}
                    <div className="mb-4">
                        <div className="text-xs text-vigil-muted mb-2">Try asking:</div>
                        <div>
                            {suggestedQuestions.map((q) => (
                                <div
                                    key={q}
                                    className="aim-query-chip text-vigil-text"
                                    onClick={() => {
                                        setQuestion(q);
                                    }}
                                >
                                    {q}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Query results */}
                    {queryResults && (
                        <div className="mt-5 p-4 bg-vigil-accent/5 rounded-lg">
                            <div className="font-bold text-vigil-text mb-2">
                                {queryResults.interpretation || queryResults.error || 'Result'}
                            </div>
                            {queryResults.explanation && (
                                <div className="text-xs text-vigil-muted mb-3">
                                    {queryResults.explanation}
                                </div>
                            )}
                            {queryResults.results && (
                                <div className="text-xs text-vigil-text font-mono overflow-x-auto">
                                    <pre>{JSON.stringify(queryResults.results.slice(0, 5), null, 2)}</pre>
                                </div>
                            )}
                            {queryResults.error && (
                                <div className="text-vigil-rose">{queryResults.error}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIMonitoringTab;
