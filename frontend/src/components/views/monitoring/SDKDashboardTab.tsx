/**
 * SDKDashboardTab.tsx
 * Main SDK observability dashboard for VIGIL showing registered SDK applications,
 * event data, API calls, errors, audit logs, and metrics from external apps.
 *
 * Features:
 * - Overview of all registered SDK applications
 * - Real-time status indicators and heartbeat tracking
 * - Event timeline visualizations with severity filtering
 * - Top endpoints and error tracking
 * - Application registration modal with API key generation
 * - Detailed drill-down view per SDK application
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData, postData } from '../../../utils/api';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    Activity, AlertTriangle, Clock, Code, Cpu, Database, Globe,
    Layers, Plus, RefreshCw, Search, Server, Settings, Shield,
    Trash2, Zap, Eye, Copy, CheckCircle, XCircle, ArrowRight,
    ArrowLeft, Loader2, AlertCircle, TrendingUp, TrendingDown
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const Styles = () => (
    <style>{`
        @keyframes sdkFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sdkSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes sdkPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes sdkGlowPulse { 0%,100%{box-shadow:0 0 12px ${THEME.primary}30} 50%{box-shadow:0 0 24px ${THEME.primary}60} }

        .sdk-card {
            background:${THEME.surface};
            border:1px solid ${THEME.grid};
            border-radius:12px;
            padding:20px;
            animation:sdkFade .3s ease;
            transition:all 0.2s ease;
        }
        .sdk-card:hover {
            background:${THEME.surfaceHover};
            border-color:${THEME.primary}40;
            box-shadow:0 4px 16px rgba(0,0,0,0.2);
        }
        .sdk-card-active {
            border-color:${THEME.primary};
            box-shadow:0 0 24px ${THEME.primary}30, inset 0 0 20px ${THEME.primary}08;
        }
        .sdk-label { font-size:12px; font-weight:700; color:${THEME.textMuted}; text-transform:uppercase; letter-spacing:0.5px; }
        .sdk-input {
            background:${THEME.surfaceHover};
            border:1px solid ${THEME.grid};
            border-radius:8px;
            padding:10px 12px;
            color:${THEME.textMain};
            font-size:13px;
            width:100%;
            font-family:${THEME.fontBody};
        }
        .sdk-input:focus { outline:none; border-color:${THEME.primary}; }
        .sdk-select {
            background:${THEME.surfaceHover};
            border:1px solid ${THEME.grid};
            border-radius:8px;
            padding:10px 12px;
            color:${THEME.textMain};
            font-size:13px;
            width:100%;
            font-family:${THEME.fontBody};
            cursor:pointer;
        }
        .sdk-select:focus { outline:none; border-color:${THEME.primary}; }
        .sdk-button {
            background:${THEME.primary};
            color:#fff;
            border:none;
            border-radius:8px;
            padding:10px 16px;
            font-weight:700;
            font-size:13px;
            cursor:pointer;
            transition:all 0.2s ease;
            font-family:${THEME.fontBody};
        }
        .sdk-button:hover { background:${THEME.primaryLight||'#3b82f6'}; }
        .sdk-button:disabled { opacity:0.6; cursor:not-allowed; }
        .sdk-button-secondary { background:${THEME.secondary||'#818cf8'}; }
        .sdk-button-secondary:hover { background:${THEME.secondaryLight||'#6366f1'}; }
        .sdk-button-danger { background:${THEME.danger||'#ef4444'}; }
        .sdk-button-danger:hover { background:${THEME.dangerLight||'#dc2626'}; }
        .sdk-status-dot {
            display:inline-block;
            width:8px;
            height:8px;
            border-radius:50%;
            margin-right:6px;
            animation:sdkPulse 2s ease-in-out infinite;
        }
        .sdk-badge {
            display:inline-block;
            padding:4px 10px;
            border-radius:4px;
            font-size:11px;
            font-weight:700;
            text-transform:uppercase;
            letter-spacing:0.3px;
        }
        .sdk-badge-success { background:${THEME.success}20; color:${THEME.success}; }
        .sdk-badge-warning { background:${THEME.warning}20; color:${THEME.warning}; }
        .sdk-badge-danger { background:${THEME.danger}20; color:${THEME.danger}; }
        .sdk-badge-info { background:${THEME.primary}20; color:${THEME.primary}; }
        .sdk-spinner { animation:sdkSpin 1s linear infinite; }
        .sdk-stagger > * { animation:sdkFade 0.3s ease both; }
        .sdk-stagger > *:nth-child(1){animation-delay:0.0s;}
        .sdk-stagger > *:nth-child(2){animation-delay:0.07s;}
        .sdk-stagger > *:nth-child(3){animation-delay:0.14s;}
        .sdk-stagger > *:nth-child(4){animation-delay:0.21s;}
        .sdk-stagger > *:nth-child(5){animation-delay:0.28s;}
        .sdk-stagger > *:nth-child(6){animation-delay:0.35s;}
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Format relative time (e.g., "2 min ago")
 */
const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const ms = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

/**
 * Get app type icon and color
 */
const getAppTypeInfo = (appType) => {
    const types = {
        salesforce: { icon: '☁️', color: '#00a1de', label: 'Salesforce' },
        mulesoft: { icon: '🔄', color: '#1a9fde', label: 'MuleSoft' },
        nodejs: { icon: '✦', color: '#68a063', label: 'Node.js' },
        java: { icon: '☕', color: '#f89917', label: 'Java' },
        python: { icon: '🐍', color: '#3776ab', label: 'Python' },
        dotnet: { icon: '⬜', color: '#512bd4', label: '.NET' },
        custom: { icon: '📦', color: '#8b5cf6', label: 'Custom' },
    };
    return types[appType?.toLowerCase()] || types.custom;
};

/**
 * Get environment color
 */
const getEnvironmentColor = (env) => {
    switch (env?.toLowerCase()) {
        case 'production': return THEME.danger;
        case 'staging': return THEME.warning;
        case 'development':
        default: return THEME.primary;
    }
};

/**
 * Copy to clipboard helper
 */
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const StatCard = ({ label, value, icon: Icon, trend, color }) => (
    <div className="sdk-card" style={{ textAlign: 'center', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            {Icon && <Icon size={20} color={color || THEME.primary} />}
        </div>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: THEME.textMuted }}>
            {label}
        </p>
        <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: THEME.textMain }}>
            {value}
        </p>
        {trend && (
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: trend > 0 ? THEME.danger : THEME.success }}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
        )}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   APP CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const AppCard = ({ app, onSelect, isSelected }) => {
    const typeInfo = getAppTypeInfo(app.type);
    const envColor = getEnvironmentColor(app.environment);

    return (
        <div
            className={`sdk-card ${isSelected ? 'sdk-card-active' : ''}`}
            onClick={onSelect}
            style={{ cursor: 'pointer', position: 'relative' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${THEME.grid}` }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                    <div style={{ fontSize: '20px' }}>{typeInfo.icon}</div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', color: THEME.textMain, fontSize: '14px', fontWeight: '700' }}>
                            {app.name}
                        </h4>
                        <p style={{ margin: 0, color: THEME.textMuted, fontSize: '12px' }}>
                            {typeInfo.label} • {app.id.substring(0, 8)}...
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="sdk-badge sdk-badge-info" style={{ backgroundColor: `${envColor}20`, color: envColor, textAlign: 'center' }}>
                        {app.environment}
                    </span>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                        {!app.lastHeartbeat || Date.now() - new Date(app.lastHeartbeat).getTime() > 60000
                            ? <span style={{ color: THEME.danger }}>Offline</span>
                            : <span style={{ color: THEME.success }}>Online</span>
                        }
                    </div>
                </div>
            </div>

            {/* Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '12px', color: THEME.textMuted }}>
                <span
                    className="sdk-status-dot"
                    style={{
                        background: !app.lastHeartbeat || Date.now() - new Date(app.lastHeartbeat).getTime() > 60000 ? THEME.danger : THEME.success
                    }}
                />
                Last heartbeat: {formatRelativeTime(app.lastHeartbeat)}
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>
                    <div style={{ color: THEME.textMuted, marginBottom: '4px' }}>Events/24h</div>
                    <div style={{ fontWeight: '700', color: THEME.textMain }}>
                        {app.totalEvents24h || 0}
                    </div>
                </div>
                <div>
                    <div style={{ color: THEME.textMuted, marginBottom: '4px' }}>Errors</div>
                    <div style={{ fontWeight: '700', color: app.errorCount > 0 ? THEME.danger : THEME.success }}>
                        {app.errorCount || 0}
                    </div>
                </div>
                <div>
                    <div style={{ color: THEME.textMuted, marginBottom: '4px' }}>Avg Latency</div>
                    <div style={{ fontWeight: '700', color: THEME.textMain }}>
                        {app.avgLatency || 0}ms
                    </div>
                </div>
            </div>

            {/* View Details Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                }}
                style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: `1px solid ${THEME.primary}`,
                    background: 'transparent',
                    color: THEME.primary,
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: THEME.fontBody,
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = `${THEME.primary}20`;
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                }}
            >
                View Details <ArrowRight size={12} style={{ display: 'inline', marginLeft: '4px' }} />
            </button>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   REGISTER APP MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
const RegisterAppModal = ({ isOpen, onClose, onSuccess, isSubmitting }) => {
    const [formData, setFormData] = useState({ name: '', type: 'nodejs', environment: 'staging' });
    const [generatedKey, setGeneratedKey] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;
        try {
            const result = await postData('/api/sdk/apps', formData);
            setGeneratedKey(result.apiKey);
            setFormData({ name: '', type: 'nodejs', environment: 'staging' });
            if (onSuccess) onSuccess(result);
        } catch (err) {
            console.error('Failed to register app:', err);
        }
    };

    const handleCopyKey = async () => {
        const copied = await copyToClipboard(generatedKey);
        if (copied) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
        }}>
            <div className="sdk-card" style={{ maxWidth: '500px', width: '90%' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: THEME.textMain }}>
                    Register New SDK Application
                </h3>

                {generatedKey ? (
                    <div>
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: THEME.textMuted }}>
                            Your API key has been generated. Save it securely — it will only be shown once.
                        </p>
                        <div style={{
                            background: THEME.surfaceHover,
                            border: `1px solid ${THEME.grid}`,
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: THEME.fontMono || 'monospace',
                            fontSize: '12px',
                        }}>
                            <code style={{ flex: 1, overflow: 'auto', color: THEME.textMain }}>
                                {generatedKey}
                            </code>
                            <button
                                onClick={handleCopyKey}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: THEME.primary,
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                                title="Copy to clipboard"
                            >
                                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => {
                                    setGeneratedKey(null);
                                    onClose();
                                }}
                                className="sdk-button"
                                style={{ flex: 1 }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label className="sdk-label">App Name</label>
                            <input
                                type="text"
                                className="sdk-input"
                                placeholder="My Salesforce Integration"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="sdk-label">App Type</label>
                            <select
                                className="sdk-select"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="salesforce">Salesforce</option>
                                <option value="mulesoft">MuleSoft</option>
                                <option value="nodejs">Node.js</option>
                                <option value="java">Java</option>
                                <option value="python">Python</option>
                                <option value="dotnet">.NET</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>

                        <div>
                            <label className="sdk-label">Environment</label>
                            <select
                                className="sdk-select"
                                value={formData.environment}
                                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                            >
                                <option value="development">Development</option>
                                <option value="staging">Staging</option>
                                <option value="production">Production</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.name.trim() || isSubmitting}
                                className="sdk-button"
                                style={{ flex: 1 }}
                            >
                                {isSubmitting ? 'Registering...' : 'Register Application'}
                            </button>
                            <button
                                onClick={onClose}
                                className="sdk-button-secondary"
                                style={{ padding: '10px 16px' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DETAIL VIEW COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const DetailView = ({ app, onBack }) => {
    const [detailData, setDetailData] = useState(null);
    const [statsData, setStatsData] = useState([]);
    const [events, setEvents] = useState([]);
    const [topEndpoints, setTopEndpoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eventFilter, setEventFilter] = useState({ type: 'all', severity: 'all' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadDetails = async () => {
            try {
                setLoading(true);
                const [detail, stats, eventsList] = await Promise.all([
                    fetchData(`/api/sdk/apps/${app.id}`),
                    fetchData(`/api/sdk/apps/${app.id}/stats?from=${Date.now() - 86400000}&to=${Date.now()}&groupBy=hour`),
                    fetchData(`/api/sdk/apps/${app.id}/events?page=1&limit=20`),
                ]);
                setDetailData(detail);
                setStatsData(stats?.timeline || []);
                setTopEndpoints(detail?.topEndpoints || []);
                setEvents(eventsList?.events || []);
                setError(null);
            } catch (err) {
                console.error('Failed to load app details:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadDetails();
    }, [app.id]);

    const typeInfo = getAppTypeInfo(app.type);
    const envColor = getEnvironmentColor(app.environment);

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <Loader2 size={32} color={THEME.primary} className="sdk-spinner" style={{ margin: '0 auto 16px' }} />
                <div style={{ color: THEME.textMuted }}>Loading application details...</div>
            </div>
        );
    }

    // Filter events
    const filteredEvents = events.filter(e => {
        if (eventFilter.type !== 'all' && e.type !== eventFilter.type) return false;
        if (eventFilter.severity !== 'all' && e.severity !== eventFilter.severity) return false;
        if (searchTerm && !e.message?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <div>
            {/* Back Button */}
            <button
                onClick={onBack}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    border: `1px solid ${THEME.grid}`,
                    background: 'transparent',
                    color: THEME.primary,
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: THEME.fontBody,
                }}
            >
                <ArrowLeft size={16} /> Back to Overview
            </button>

            {/* App Header */}
            <div className="sdk-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '32px' }}>{typeInfo.icon}</div>
                        <div>
                            <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: THEME.textMain }}>
                                {app.name}
                            </h2>
                            <p style={{ margin: '0', fontSize: '13px', color: THEME.textMuted }}>
                                {typeInfo.label} • {app.id}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="sdk-badge sdk-badge-info" style={{ backgroundColor: `${envColor}20`, color: envColor }}>
                            {app.environment}
                        </span>
                        <span
                            className="sdk-badge"
                            style={{
                                backgroundColor: !app.lastHeartbeat || Date.now() - new Date(app.lastHeartbeat).getTime() > 60000 ? `${THEME.danger}20` : `${THEME.success}20`,
                                color: !app.lastHeartbeat || Date.now() - new Date(app.lastHeartbeat).getTime() > 60000 ? THEME.danger : THEME.success
                            }}
                        >
                            {!app.lastHeartbeat || Date.now() - new Date(app.lastHeartbeat).getTime() > 60000 ? 'Offline' : 'Online'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <StatCard
                    label="Events/Hour"
                    value={detailData?.eventsPerHour || 0}
                    icon={Activity}
                    color={THEME.primary}
                />
                <StatCard
                    label="Error Rate"
                    value={`${detailData?.errorRate || 0}%`}
                    icon={AlertTriangle}
                    color={detailData?.errorRate > 5 ? THEME.danger : THEME.success}
                />
                <StatCard
                    label="P95 Latency"
                    value={`${detailData?.p95Latency || 0}ms`}
                    icon={Clock}
                    color={THEME.warning}
                />
                <StatCard
                    label="Active Endpoints"
                    value={detailData?.activeEndpoints || 0}
                    icon={Layers}
                    color={THEME.success}
                />
            </div>

            {/* Event Timeline Chart */}
            {statsData.length > 0 && (
                <div className="sdk-card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: THEME.textMain }}>
                        Event Timeline (24h)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={statsData}>
                            <XAxis dataKey="time" stroke={THEME.textMuted} />
                            <YAxis stroke={THEME.textMuted} />
                            <Tooltip
                                contentStyle={{
                                    background: THEME.surface,
                                    border: `1px solid ${THEME.grid}`,
                                    borderRadius: '8px',
                                }}
                                labelStyle={{ color: THEME.textMain }}
                            />
                            <Line
                                type="monotone"
                                dataKey="events"
                                stroke={THEME.primary}
                                isAnimationActive={true}
                                dot={false}
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="errors"
                                stroke={THEME.danger}
                                isAnimationActive={true}
                                dot={false}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Top Endpoints Table */}
            {topEndpoints.length > 0 && (
                <div className="sdk-card" style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: THEME.textMain }}>
                        Top Endpoints
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${THEME.grid}` }}>
                                    <th style={{ textAlign: 'left', padding: '12px', color: THEME.textMuted, fontWeight: '700' }}>Endpoint</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: THEME.textMuted, fontWeight: '700' }}>Method</th>
                                    <th style={{ textAlign: 'right', padding: '12px', color: THEME.textMuted, fontWeight: '700' }}>Calls</th>
                                    <th style={{ textAlign: 'right', padding: '12px', color: THEME.textMuted, fontWeight: '700' }}>Avg Latency</th>
                                    <th style={{ textAlign: 'right', padding: '12px', color: THEME.textMuted, fontWeight: '700' }}>Error Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topEndpoints.map((ep, idx) => (
                                    <tr key={idx} style={{ borderBottom: `1px solid ${THEME.grid}40` }}>
                                        <td style={{ padding: '12px', color: THEME.textMain, fontFamily: THEME.fontMono }}>{ep.endpoint}</td>
                                        <td style={{ padding: '12px', color: THEME.textMuted }}>{ep.method}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: THEME.textMain }}>{ep.calls}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: THEME.textMain }}>{ep.avgLatency}ms</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: ep.errorRate > 0 ? THEME.danger : THEME.success }}>
                                            {ep.errorRate}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Events */}
            <div className="sdk-card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: THEME.textMain }}>
                    Recent Events
                </h3>

                {/* Filters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div>
                        <label className="sdk-label">Event Type</label>
                        <select
                            className="sdk-select"
                            value={eventFilter.type}
                            onChange={(e) => setEventFilter({ ...eventFilter, type: e.target.value })}
                        >
                            <option value="all">All Types</option>
                            <option value="api_call">API Call</option>
                            <option value="error">Error</option>
                            <option value="audit">Audit</option>
                        </select>
                    </div>
                    <div>
                        <label className="sdk-label">Severity</label>
                        <select
                            className="sdk-select"
                            value={eventFilter.severity}
                            onChange={(e) => setEventFilter({ ...eventFilter, severity: e.target.value })}
                        >
                            <option value="all">All Severities</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                    <div>
                        <label className="sdk-label">Search</label>
                        <input
                            type="text"
                            className="sdk-input"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Events List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '12px',
                                    borderRadius: '6px',
                                    background: THEME.surfaceHover,
                                    border: `1px solid ${THEME.grid}`,
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <span
                                        className="sdk-badge"
                                        style={{
                                            backgroundColor: event.severity === 'error' ? `${THEME.danger}20` : event.severity === 'warning' ? `${THEME.warning}20` : `${THEME.success}20`,
                                            color: event.severity === 'error' ? THEME.danger : event.severity === 'warning' ? THEME.warning : THEME.success,
                                        }}
                                    >
                                        {event.severity?.toUpperCase()}
                                    </span>
                                    <span style={{ color: THEME.textMuted }}>
                                        {new Date(event.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p style={{ margin: '0 0 4px 0', color: THEME.textMain, fontWeight: '600' }}>
                                    {event.message}
                                </p>
                                {event.details && (
                                    <p style={{ margin: '0', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                                        {JSON.stringify(event.details).substring(0, 100)}...
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p style={{ color: THEME.textMuted, textAlign: 'center', margin: 0 }}>No events found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function SDKDashboardTab() {
    useAdaptiveTheme();

    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const refreshTimer = useRef(null);

    // Fetch apps list
    const fetchApps = useCallback(async () => {
        try {
            const data = await fetchData('/api/sdk/apps');
            const list = Array.isArray(data) ? data : data?.apps || [];
            setApps(list);
            setError(null);
        } catch (err) {
            console.error('[SDKDashboardTab] Failed to fetch apps:', err);
            setError(err?.message || 'Failed to fetch SDK applications');
        }
    }, []);

    // Initial load and auto-refresh
    useEffect(() => {
        fetchApps().finally(() => setLoading(false));

        // Auto-refresh every 30 seconds
        refreshTimer.current = setInterval(() => {
            setRefreshing(true);
            fetchApps().finally(() => setRefreshing(false));
        }, 30000);

        return () => {
            if (refreshTimer.current) clearInterval(refreshTimer.current);
        };
    }, [fetchApps]);

    // Manual refresh
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchApps();
        setRefreshing(false);
    }, [fetchApps]);

    // Register app success
    const handleRegisterSuccess = useCallback((newApp) => {
        setApps([...apps, newApp]);
        setShowRegisterModal(false);
    }, [apps]);

    // Calculate aggregate stats
    const stats = useMemo(() => ({
        totalApps: apps.length,
        activeApps: apps.filter(a => a.lastHeartbeat && Date.now() - new Date(a.lastHeartbeat).getTime() < 60000).length,
        totalEvents24h: apps.reduce((sum, a) => sum + (a.totalEvents24h || 0), 0),
        errorRate: apps.length > 0 ? Math.round(apps.reduce((sum, a) => sum + (a.errorCount || 0), 0) / (apps.reduce((sum, a) => sum + (a.totalEvents24h || 1), 0) / 100)) : 0,
        avgLatency: apps.length > 0 ? Math.round(apps.reduce((sum, a) => sum + (a.avgLatency || 0), 0) / apps.length) : 0,
    }), [apps]);

    const selectedApp = apps.find(a => a.id === selectedAppId);

    if (loading) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '100vh', background: THEME.bg }}>
                <Styles />
                <Loader2 size={32} color={THEME.primary} className="sdk-spinner" style={{ margin: '0 auto 16px' }} />
                <div style={{ color: THEME.textMuted }}>Loading SDK applications...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', minHeight: '100vh', background: THEME.bg, fontFamily: THEME.fontBody }}>
            <Styles />

            {selectedApp ? (
                <DetailView
                    app={selectedApp}
                    onBack={() => setSelectedAppId(null)}
                />
            ) : (
                <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '700', color: THEME.textMain }}>
                                SDK Integration Hub
                            </h2>
                            <p style={{ margin: 0, fontSize: '13px', color: THEME.textMuted }}>
                                Monitor all registered SDK applications and their event data
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: `1px solid ${THEME.grid}`,
                                    background: THEME.glass,
                                    backdropFilter: 'blur(8px)',
                                    color: THEME.primary,
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontFamily: THEME.fontBody,
                                    opacity: refreshing ? 0.6 : 1,
                                }}
                            >
                                <RefreshCw
                                    size={16}
                                    style={{ animation: refreshing ? 'sdkSpin 1s linear infinite' : 'none' }}
                                />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowRegisterModal(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    background: THEME.primary,
                                    color: '#fff',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'all 0.2s ease',
                                    fontFamily: THEME.fontBody,
                                }}
                            >
                                <Plus size={16} /> Register App
                            </button>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: `rgba(239, 68, 68, 0.1)`,
                            border: `1px solid ${THEME.danger}`,
                            color: THEME.danger,
                            marginBottom: '24px',
                            fontSize: '13px',
                        }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="sdk-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                        <StatCard
                            label="Total Applications"
                            value={stats.totalApps}
                            icon={Layers}
                            color={THEME.primary}
                        />
                        <StatCard
                            label="Total Events (24h)"
                            value={stats.totalEvents24h.toLocaleString()}
                            icon={Activity}
                            color={THEME.success}
                        />
                        <StatCard
                            label="Error Rate (24h)"
                            value={`${stats.errorRate}%`}
                            icon={AlertTriangle}
                            color={stats.errorRate > 5 ? THEME.danger : THEME.success}
                        />
                        <StatCard
                            label="Avg API Latency"
                            value={`${stats.avgLatency}ms`}
                            icon={Clock}
                            color={THEME.warning}
                        />
                    </div>

                    {/* Apps Grid */}
                    {apps.length > 0 ? (
                        <div className="sdk-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                            {apps.map(app => (
                                <AppCard
                                    key={app.id}
                                    app={app}
                                    onSelect={() => setSelectedAppId(app.id)}
                                    isSelected={selectedAppId === app.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: '60px 20px',
                            textAlign: 'center',
                            borderRadius: '12px',
                            border: `2px dashed ${THEME.grid}`,
                            background: THEME.surface,
                        }}>
                            <Layers size={48} color={THEME.textMuted} style={{ margin: '0 auto 16px' }} />
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: THEME.textMain }}>
                                No SDK Applications Yet
                            </h3>
                            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: THEME.textMuted }}>
                                Register your first SDK application to start monitoring events and metrics.
                            </p>
                            <button
                                onClick={() => setShowRegisterModal(true)}
                                className="sdk-button"
                            >
                                <Plus size={16} style={{ display: 'inline', marginRight: '6px' }} />
                                Register First Application
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Register App Modal */}
            <RegisterAppModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSuccess={handleRegisterSuccess}
                isSubmitting={isSubmittingForm}
            />
        </div>
    );
}
