// @ts-nocheck
import React, { useState, useEffect, FC, ReactNode } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Layout, Plus, Trash2, Settings, Grid, Move, Save, AlertTriangle, RefreshCw, Download, Upload, MoreVertical, Edit2 } from 'lucide-react';

/* ── TYPE DEFINITIONS ──────────────────────────────────────────────────── */
interface Widget {
    id: number;
    type: 'stat_card' | 'metric_chart' | 'gauge' | 'health_grid' | 'alert_feed' | 'sparkline' | 'text_note';
    title: string;
    subtitle?: string;
    metricId?: string;
    size: 'small' | 'medium' | 'large';
    refreshInterval?: number;
    thresholdWarning?: number;
    thresholdCritical?: number;
    content?: string;
    status?: string;
    unit?: string;
    metricLabel?: string;
}

interface Metric {
    id: string;
    label: string;
    category: string;
    description: string;
}

interface WidgetData {
    [key: number]: any;
}

interface LoadingState {
    [key: number]: boolean;
}

interface Dashboard {
    name: string;
    widgets: Widget[];
    timestamp: string;
}

interface HealthItem {
    label: string;
    status: 'ok' | 'warning';
}

interface AlertFeed {
    title: string;
    message: string;
    severity: 'critical' | 'warning' | 'success';
}

/* ── Styles ───────────────────────────────────────────────────────────────── */
const Styles: FC = () => (
    <style>{`
        @keyframes cdFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .cd-card { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:12px; padding:20px; animation:cdFade .3s ease; }
        .cd-button { background:${THEME.primary}; color:${THEME.textInverse}; border:none; border-radius:8px; padding:10px 16px; font-weight:700; font-size:13px; cursor:pointer; transition:all .2s ease; }
        .cd-button:hover { background:${THEME.primaryLight}; }
        .cd-button-secondary { background:${THEME.secondary}; }
        .cd-button-secondary:hover { background:${THEME.secondaryLight}; }
        .cd-button-danger { background:${THEME.danger}; }
        .cd-button-danger:hover { background:${THEME.dangerLight}; }
        .cd-select { background:${THEME.surfaceHover}; border:1px solid ${THEME.grid}; border-radius:8px; padding:10px 12px; color:${THEME.textMain}; font-size:13px; width:100%; cursor:pointer; }
        .cd-input { background:${THEME.surfaceHover}; border:1px solid ${THEME.grid}; border-radius:8px; padding:10px 12px; color:${THEME.textMain}; font-size:13px; width:100%; }
        .cd-input:focus { outline:none; border-color:${THEME.primary}; }
        .cd-label { font-size:12px; font-weight:700; color:${THEME.textMuted}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; }
        .cd-widget { background:${THEME.grid}; border:1px solid ${THEME.grid}; border-radius:10px; padding:16px; position:relative; animation:cdFade .3s ease; cursor:grab; transition:all .2s ease; }
        .cd-widget:hover { border-color:${THEME.primary}40; box-shadow: 0 4px 16px rgba(0, 212, 255, 0.08); }
        .cd-widget.dragging { opacity:0.7; }
        .cd-widget-drag-handle { cursor:grab; padding:8px; position:absolute; top:8px; left:8px; color:${THEME.textDim}; }
        .cd-widget-toolbar { position:absolute; top:8px; right:8px; display:flex; gap:8px; }
        .cd-widget-icon { cursor:pointer; padding:6px; color:${THEME.textDim}; transition:all .2s ease; }
        .cd-widget-icon:hover { color:${THEME.primary}; }
        .cd-widget-remove:hover { color:${THEME.danger}; }
        .cd-modal { position:fixed; inset:0; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .cd-modal-content { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:12px; padding:24px; max-width:600px; width:90%; max-height:90vh; overflow-y:auto; }
        .cd-modal-title { font-size:18px; font-weight:700; color:${THEME.textMain}; margin-bottom:16px; }
        .cd-modal-field { margin-bottom:16px; }
        .cd-modal-section { margin-bottom:24px; }
        .cd-modal-section-title { font-size:13px; font-weight:700; color:${THEME.primary}; margin-bottom:12px; text-transform:uppercase; }
        .cd-tabs { display:flex; gap:12px; margin-bottom:20px; border-bottom:1px solid ${THEME.grid}; }
        .cd-tab { padding:12px 16px; font-size:13px; font-weight:600; color:${THEME.textDim}; cursor:pointer; border-bottom:2px solid transparent; transition:all .2s ease; }
        .cd-tab.active { color:${THEME.primary}; border-bottom-color:${THEME.primary}; }
        .cd-grid { display:grid; gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))'; gap:20px; marginBottom:20px; }
        .cd-gauge-container { position:relative; width:200px; height:200px; margin:0 auto; }
        .cd-gauge-label { position:absolute; top:50%; left:50%; transform:'translate(-50%, -50%)'; textAlign:center; }
        .cd-gauge-value { fontSize:32px; fontWeight:800; color:${THEME.primary}; }
        .cd-gauge-unit { fontSize:12px; color:${THEME.textMuted}; marginTop:4px; }
        .cd-health-grid { display:grid; gridTemplateColumns:'repeat(auto-fit, minmax(80px, 1fr))'; gap:12px; }
        .cd-health-item { textAlign:center; padding:16px; borderRadius:8px; background:${THEME.surfaceHover}; }
        .cd-health-dot { fontSize:32px; marginBottom:8px; }
        .cd-health-label { fontSize:11px; color:${THEME.textMuted}; }
        .cd-spinner { animation:spin 1s linear infinite; display:inline-block; }
        .cd-templateGallery { display:grid; gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))'; gap:16px; }
        .cd-templateCard { background:${THEME.surfaceHover}; border:1px solid ${THEME.grid}; borderRadius:8px; padding:16px; cursor:pointer; transition:all .2s ease; position:relative; overflow:hidden; }
        .cd-templateCard::before { content:''; position:absolute; top:0; left:0; right:0; bottom:0; background:linear-gradient(135deg, ${THEME.primary}00 0%, ${THEME.primary}10 100%); opacity:0; transition:opacity .2s ease; pointer-events:none; }
        .cd-templateCard:hover { borderColor:${THEME.primary}; background:${THEME.surface}; box-shadow:0 4px 12px ${THEME.primary}15; }
        .cd-templateCard:hover::before { opacity:1; }
        .cd-templateCard.selected { borderColor:${THEME.primary}; background:${THEME.primary}15; box-shadow:0 0 0 2px ${THEME.primary}40; }
        .cd-templateIcon { fontSize:28px; marginBottom:12px; display:block; }
        .cd-templateName { fontSize:13px; fontWeight:700; color:${THEME.textMain}; marginBottom:8px; }
        .cd-templateDesc { fontSize:11px; color:${THEME.textMuted}; lineHeight:1.4; }
        .cd-templateBadge { display:inline-block; background:${THEME.primary}20; color:${THEME.primary}; fontSize:10px; fontWeight:700; padding:4px 8px; borderRadius:4px; marginTop:12px; }
        .cd-templateCount { fontSize:10px; color:${THEME.textDim}; marginTop:8px; }
    `}</style>
);

/* ── Widget Component ──────────────────────────────────────────────────── */
interface DashboardWidgetProps {
    widget: Widget;
    onRemove: (id: number) => void;
    onEdit: (widget: Widget) => void;
    data?: any;
    loading?: boolean;
}

const DashboardWidget: FC<DashboardWidgetProps> = ({ widget, onRemove, onEdit, data, loading }) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleEditClick = () => onEdit(widget);

    const renderContent = (): ReactNode => {
        if (loading) return <div style={{ color:THEME.textDim, textAlign:'center', padding:'20px 0' }}>
            <RefreshCw size={16} className="cd-spinner" style={{ marginRight:8 }} />
            Loading...
        </div>;

        if (widget.type === 'stat_card') {
            if (!data && !widget.metricId) {
                return <div style={{ color:THEME.textMuted, textAlign:'center', padding:'20px 0', fontSize:12 }}>
                    <div style={{ marginBottom:8 }}>Configure metric</div>
                    <button className="cd-button" style={{ fontSize:11, padding:'6px 12px' }} onClick={handleEditClick}>
                        Edit Widget
                    </button>
                </div>;
            }
            const healthColor = widget.status === 'critical' ? THEME.danger : widget.status === 'warning' ? THEME.warning : THEME.success;
            return (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                    <div style={{ fontSize:28, fontWeight:800, color:healthColor, marginBottom:8 }}>
                        {data !== undefined && data !== null ? (typeof data === 'object' ? data.value || 'N/A' : data) : 'N/A'} {widget.unit || ''}
                    </div>
                    <div style={{ fontSize:12, color:THEME.textMuted }}>{widget.metricLabel}</div>
                </div>
            );
        }

        if (widget.type === 'metric_chart') {
            if (!data && !widget.metricId) {
                return <div style={{ color:THEME.textMuted, textAlign:'center', padding:'40px 20px', fontSize:12 }}>
                    <div style={{ marginBottom:8 }}>Configure metric to display chart</div>
                    <button className="cd-button" style={{ fontSize:11, padding:'6px 12px' }} onClick={handleEditClick}>
                        Edit Widget
                    </button>
                </div>;
            }
            const chartData = Array.isArray(data) ? data : [];
            return (
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="timestamp" stroke={THEME.textDim} style={{ fontSize:10 }} />
                        <YAxis stroke={THEME.textDim} style={{ fontSize:10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke={THEME.primary} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            );
        }

        if (widget.type === 'gauge') {
            if (!data && !widget.metricId) {
                return <div style={{ color:THEME.textMuted, textAlign:'center', padding:'40px 20px', fontSize:12 }}>
                    <div style={{ marginBottom:8 }}>Configure metric for gauge</div>
                    <button className="cd-button" style={{ fontSize:11, padding:'6px 12px' }} onClick={handleEditClick}>
                        Edit Widget
                    </button>
                </div>;
            }
            const percentage = typeof data === 'number' ? Math.min(Math.max(data, 0), 100) : 0;
            const gaugeColor = percentage > (widget.thresholdCritical || 95) ? THEME.danger : percentage > (widget.thresholdWarning || 80) ? THEME.warning : THEME.success;
            return (
                <div className="cd-gauge-container">
                    <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:`3px solid ${THEME.grid}`, position:'relative' }}>
                        <div style={{
                            position:'absolute',
                            top:0,
                            left:0,
                            width:'100%',
                            height:'100%',
                            borderRadius:'50%',
                            background:`conic-gradient(${gaugeColor} ${percentage}%, ${THEME.grid} ${percentage}%)`,
                        }} />
                    </div>
                    <div className="cd-gauge-label">
                        <div className="cd-gauge-value">{percentage.toFixed(1)}</div>
                        <div className="cd-gauge-unit">{widget.unit}</div>
                    </div>
                </div>
            );
        }

        if (widget.type === 'health_grid') {
            const items: HealthItem[] = [
                { label: 'Performance', status: data?.performance > 80 ? 'ok' : 'warning' },
                { label: 'Connections', status: data?.connections < 80 ? 'ok' : 'warning' },
                { label: 'Cache', status: data?.cache > 90 ? 'ok' : 'warning' },
                { label: 'Replication', status: data?.replication < 5 ? 'ok' : 'warning' },
            ];
            return (
                <div className="cd-health-grid">
                    {items.map((item, i) => (
                        <div key={i} className="cd-health-item">
                            <div className="cd-health-dot">
                                {item.status === 'ok' ? '🟢' : item.status === 'warning' ? '🟡' : '🔴'}
                            </div>
                            <div className="cd-health-label">{item.label}</div>
                        </div>
                    ))}
                </div>
            );
        }

        if (widget.type === 'alert_feed') {
            const alerts = Array.isArray(data) ? data : [];
            if (alerts.length === 0 && !data) {
                return <div style={{ color:THEME.textMuted, textAlign:'center', padding:'20px', fontSize:12 }}>
                    No alerts to display
                </div>;
            }
            return (
                <div style={{ maxHeight:'250px', overflowY:'auto' }}>
                    {alerts.slice(0, 5).map((alert: AlertFeed, i: number) => (
                        <div key={i} style={{
                            padding:'8px',
                            borderLeft:`3px solid ${alert.severity === 'critical' ? THEME.danger : alert.severity === 'warning' ? THEME.warning : THEME.success}`,
                            borderRadius:4,
                            marginBottom:8,
                            fontSize:11,
                            color:THEME.textDim
                        }}>
                            <div style={{ fontWeight:700, marginBottom:2 }}>{alert.title}</div>
                            <div style={{ fontSize:10, color:THEME.textMuted }}>{alert.message}</div>
                        </div>
                    ))}
                </div>
            );
        }

        if (widget.type === 'sparkline') {
            if (!data && !widget.metricId) {
                return <div style={{ color:THEME.textMuted, textAlign:'center', padding:'20px', fontSize:12 }}>
                    Configure metric for sparkline
                </div>;
            }
            const chartData = Array.isArray(data) ? data : [];
            return (
                <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={chartData}>
                        <Line type="monotone" dataKey="value" stroke={THEME.primary} dot={false} isAnimationActive={false} strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            );
        }

        if (widget.type === 'text_note') {
            if (!widget.content) {
                return <div style={{ color:THEME.textMuted, textAlign:'center', padding:'20px', fontSize:12 }}>
                    <div style={{ marginBottom:8 }}>No content added</div>
                    <button className="cd-button" style={{ fontSize:11, padding:'6px 12px' }} onClick={handleEditClick}>
                        Edit Widget
                    </button>
                </div>;
            }
            return (
                <div style={{ fontSize:13, color:THEME.textDim, lineHeight:'1.6', fontFamily:'monospace' }}>
                    {widget.content}
                </div>
            );
        }

        return <div style={{ color:THEME.textMuted, textAlign:'center', padding:'20px', fontSize:12 }}>
            Unknown widget type: {widget.type}
        </div>;
    };

    return (
        <div className="cd-widget" style={{
            gridColumn:`span ${widget.size === 'large' ? 2 : widget.size === 'medium' ? 1 : 1}`
        }}>
            <div className="cd-widget-drag-handle" title="Drag to reorder">
                <Move size={14} />
            </div>
            <div className="cd-widget-toolbar">
                <div
                    className="cd-widget-icon"
                    onClick={() => onEdit(widget)}
                    title="Edit widget"
                    style={{ cursor:'pointer' }}
                >
                    <Edit2 size={14} />
                </div>
                <div style={{ position:'relative' }}>
                    <MoreVertical
                        size={14}
                        className="cd-widget-icon"
                        onClick={() => setShowMenu(!showMenu)}
                        title="More options"
                        style={{ cursor:'pointer' }}
                    />
                    {showMenu && (
                        <div style={{
                            position:'absolute',
                            top:'100%',
                            right:0,
                            background:THEME.surface,
                            border:`1px solid ${THEME.grid}`,
                            borderRadius:6,
                            minWidth:150,
                            zIndex:100,
                        }}>
                            <div
                                style={{
                                    padding:'8px 12px',
                                    cursor:'pointer',
                                    color:THEME.danger,
                                    fontSize:12,
                                    borderRadius:4,
                                    transition:'all .2s ease',
                                }}
                                onClick={() => {
                                    onRemove(widget.id);
                                    setShowMenu(false);
                                }}
                                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = THEME.surfaceHover}
                                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                            >
                                Remove Widget
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div style={{ marginTop:16, marginRight:24 }}>
                <div style={{ fontSize:12, fontWeight:700, color:THEME.textMain, marginBottom:12 }}>
                    {widget.title}
                </div>
                {widget.subtitle && <div style={{ fontSize:11, color:THEME.textMuted, marginBottom:8 }}>{widget.subtitle}</div>}
                {renderContent()}
            </div>
        </div>
    );
};

/* ── Widget Configuration Modal ───────────────────────────────────────── */
interface WidgetConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: Widget) => void;
    widget?: Widget;
    metrics: Metric[];
    categories: string[];
}

const WidgetConfigModal: FC<WidgetConfigModalProps> = ({ isOpen, onClose, onSave, widget, metrics, categories }) => {
    const [config, setConfig] = useState<Widget>(widget || {
        type:'stat_card',
        title:'',
        subtitle:'',
        metricId:'',
        size:'medium',
        refreshInterval:30000,
        thresholdWarning:80,
        thresholdCritical:95,
        content:'',
        id: 0,
    });

    const handleSave = () => {
        if (!config.title || !config.metricId) {
            alert('Title and Metric are required');
            return;
        }
        onSave(config);
        onClose();
    };

    if (!isOpen) return null;

    const selectedMetric = metrics.find(m => m.id === config.metricId);

    return (
        <div className="cd-modal" onClick={onClose}>
            <div className="cd-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="cd-modal-title">{widget ? 'Edit Widget' : 'Add Widget'}</div>

                <div className="cd-modal-section">
                    <div className="cd-modal-section-title">Widget Type</div>
                    <select
                        className="cd-select"
                        value={config.type}
                        onChange={(e) => setConfig({ ...config, type: e.target.value as Widget['type'] })}
                    >
                        <option value="stat_card">Stat Card</option>
                        <option value="metric_chart">Metric Chart (Line)</option>
                        <option value="gauge">Gauge</option>
                        <option value="health_grid">Health Grid</option>
                        <option value="alert_feed">Alert Feed</option>
                        <option value="sparkline">Sparkline</option>
                        <option value="text_note">Text Note</option>
                    </select>
                </div>

                <div className="cd-modal-section">
                    <div className="cd-modal-field">
                        <div className="cd-label">Widget Title</div>
                        <input
                            className="cd-input"
                            placeholder="e.g., Cache Hit Ratio"
                            value={config.title}
                            onChange={(e) => setConfig({ ...config, title:e.target.value })}
                        />
                    </div>
                    <div className="cd-modal-field">
                        <div className="cd-label">Subtitle (Optional)</div>
                        <input
                            className="cd-input"
                            placeholder="e.g., PostgreSQL Instance"
                            value={config.subtitle || ''}
                            onChange={(e) => setConfig({ ...config, subtitle:e.target.value })}
                        />
                    </div>
                </div>

                {config.type !== 'text_note' && (
                    <div className="cd-modal-section">
                        <div className="cd-modal-section-title">Metric Source</div>
                        <div className="cd-modal-field">
                            <div className="cd-label">Select Metric</div>
                            <select
                                className="cd-select"
                                value={config.metricId}
                                onChange={(e) => setConfig({ ...config, metricId:e.target.value })}
                            >
                                <option value="">Choose a metric...</option>
                                {categories.map(cat => (
                                    <optgroup key={cat} label={cat}>
                                        {metrics.filter(m => m.category === cat).map(m => (
                                            <option key={m.id} value={m.id}>{m.label}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        {selectedMetric && (
                            <div style={{ fontSize:11, color:THEME.textMuted, marginTop:8, padding:8, background:THEME.surfaceHover, borderRadius:6 }}>
                                {selectedMetric.description}
                            </div>
                        )}
                    </div>
                )}

                {config.type === 'text_note' && (
                    <div className="cd-modal-section">
                        <div className="cd-modal-field">
                            <div className="cd-label">Content (Markdown)</div>
                            <textarea
                                className="cd-input"
                                placeholder="Enter markdown content..."
                                value={config.content || ''}
                                onChange={(e) => setConfig({ ...config, content:e.target.value })}
                                style={{ minHeight:'100px', fontFamily:'monospace', fontSize:12 }}
                            />
                        </div>
                    </div>
                )}

                <div className="cd-modal-section">
                    <div className="cd-modal-section-title">Display Settings</div>
                    <div className="cd-modal-field">
                        <div className="cd-label">Widget Size</div>
                        <select
                            className="cd-select"
                            value={config.size}
                            onChange={(e) => setConfig({ ...config, size: e.target.value as Widget['size'] })}
                        >
                            <option value="small">Small (1 column)</option>
                            <option value="medium">Medium (1 column)</option>
                            <option value="large">Large (2 columns)</option>
                        </select>
                    </div>
                    <div className="cd-modal-field">
                        <div className="cd-label">Refresh Interval (ms)</div>
                        <select
                            className="cd-select"
                            value={config.refreshInterval}
                            onChange={(e) => setConfig({ ...config, refreshInterval:parseInt(e.target.value) })}
                        >
                            <option value={5000}>5 seconds</option>
                            <option value={15000}>15 seconds</option>
                            <option value={30000}>30 seconds</option>
                            <option value={60000}>1 minute</option>
                            <option value={300000}>5 minutes</option>
                        </select>
                    </div>
                </div>

                {['gauge', 'metric_chart'].includes(config.type) && (
                    <div className="cd-modal-section">
                        <div className="cd-modal-section-title">Thresholds</div>
                        <div className="cd-modal-field">
                            <div className="cd-label">Warning Threshold</div>
                            <input
                                className="cd-input"
                                type="number"
                                value={config.thresholdWarning}
                                onChange={(e) => setConfig({ ...config, thresholdWarning:parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="cd-modal-field">
                            <div className="cd-label">Critical Threshold</div>
                            <input
                                className="cd-input"
                                type="number"
                                value={config.thresholdCritical}
                                onChange={(e) => setConfig({ ...config, thresholdCritical:parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                )}

                <div style={{ display:'flex', gap:10, marginTop:20 }}>
                    <button className="cd-button" onClick={handleSave}>{widget ? 'Update Widget' : 'Add Widget'}</button>
                    <button className="cd-button" style={{ background:THEME.surfaceHover }} onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

/* ── Template Gallery Modal ───────────────────────────────────────────── */
interface Template {
    id: string;
    name: string;
    icon: string;
    description: string;
    widgets: Widget[];
}

interface TemplateGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (widgets: Widget[]) => void;
}

const TemplateGalleryModal: FC<TemplateGalleryModalProps> = ({ isOpen, onClose, onApply }) => {
    const templates: Template[] = [
        {
            id:'blank',
            name:'Blank Canvas',
            icon:'📋',
            description:'Start from scratch with an empty dashboard',
            widgets:[]
        },
        {
            id:'dba-overview',
            name:'DBA Overview',
            icon:'🗄️',
            description:'Essential metrics for database administrators',
            widgets:[
                { id:1, type:'stat_card', title:'Active Connections', metricId:'connections_active', size:'medium' },
                { id:2, type:'stat_card', title:'Cache Hit Ratio', metricId:'cache_hit_ratio', size:'medium' },
                { id:3, type:'stat_card', title:'Transactions/sec', metricId:'tps', size:'medium' },
                { id:4, type:'stat_card', title:'Replication Lag', metricId:'replication_lag', size:'medium' },
                { id:5, type:'metric_chart', title:'Query Performance', metricId:'query_time_avg', size:'large' },
                { id:6, type:'metric_chart', title:'Connection Pool', metricId:'connections_active', size:'large' },
                { id:7, type:'alert_feed', title:'Recent Alerts', size:'large' },
                { id:8, type:'health_grid', title:'System Health', size:'large' },
            ]
        },
        {
            id:'performance',
            name:'Performance Monitor',
            icon:'⚡',
            description:'Deep-dive into query and system performance',
            widgets:[
                { id:1, type:'gauge', title:'CPU Usage', metricId:'cpu_usage', size:'medium' },
                { id:2, type:'gauge', title:'Memory Usage', metricId:'memory_usage', size:'medium' },
                { id:3, type:'gauge', title:'Disk I/O', metricId:'disk_io', size:'medium' },
                { id:4, type:'gauge', title:'Cache Hit', metricId:'cache_hit_ratio', size:'medium' },
                { id:5, type:'metric_chart', title:'Query Latency (P99)', metricId:'query_time_p99', size:'large' },
                { id:6, type:'metric_chart', title:'Throughput', metricId:'tps', size:'large' },
                { id:7, type:'sparkline', title:'Slow Queries', metricId:'slow_queries', size:'large' },
                { id:8, type:'sparkline', title:'Lock Waits', metricId:'lock_waits', size:'large' },
            ]
        },
        {
            id:'capacity',
            name:'Capacity Planning',
            icon:'💾',
            description:'Storage, growth trends and resource utilization',
            widgets:[
                { id:1, type:'stat_card', title:'Database Size', metricId:'db_size', size:'medium' },
                { id:2, type:'stat_card', title:'Table Count', metricId:'table_count', size:'medium' },
                { id:3, type:'stat_card', title:'Index Size', metricId:'index_size', size:'medium' },
                { id:4, type:'stat_card', title:'Dead Tuples', metricId:'dead_tuples', size:'medium' },
                { id:5, type:'metric_chart', title:'Storage Growth', metricId:'db_size', size:'large' },
                { id:6, type:'health_grid', title:'Table Health', size:'large' },
                { id:7, type:'metric_chart', title:'Bloat Trend', metricId:'bloat_ratio', size:'large' },
            ]
        },
        {
            id:'security',
            name:'Security & Compliance',
            icon:'🔒',
            description:'Authentication events, access patterns and alerts',
            widgets:[
                { id:1, type:'stat_card', title:'Failed Logins', metricId:'failed_logins', size:'medium' },
                { id:2, type:'stat_card', title:'Active Users', metricId:'active_users', size:'medium' },
                { id:3, type:'stat_card', title:'Open Alerts', metricId:'open_alerts', size:'medium' },
                { id:4, type:'stat_card', title:'Compliance Score', metricId:'compliance_score', size:'medium' },
                { id:5, type:'alert_feed', title:'Security Alerts', size:'large' },
                { id:6, type:'metric_chart', title:'Auth Events', metricId:'auth_events', size:'large' },
            ]
        },
        {
            id:'replication',
            name:'Replication Monitor',
            icon:'🔄',
            description:'Monitor replica health, lag and WAL metrics',
            widgets:[
                { id:1, type:'stat_card', title:'Replicas', metricId:'replica_count', size:'medium' },
                { id:2, type:'stat_card', title:'Max Lag', metricId:'replication_lag', size:'medium' },
                { id:3, type:'stat_card', title:'WAL Rate', metricId:'wal_rate', size:'medium' },
                { id:4, type:'stat_card', title:'Sync Status', metricId:'sync_state', size:'medium' },
                { id:5, type:'metric_chart', title:'Replication Lag History', metricId:'replication_lag', size:'large' },
                { id:6, type:'health_grid', title:'Replica Health', size:'large' },
                { id:7, type:'metric_chart', title:'WAL Generation', metricId:'wal_rate', size:'large' },
            ]
        },
        {
            id:'executive',
            name:'Executive Summary',
            icon:'📊',
            description:'High-level KPIs for management reporting',
            widgets:[
                { id:1, type:'stat_card', title:'Uptime', metricId:'uptime', size:'medium' },
                { id:2, type:'stat_card', title:'Avg Response', metricId:'query_time_avg', size:'medium' },
                { id:3, type:'stat_card', title:'Error Rate', metricId:'error_rate', size:'medium' },
                { id:4, type:'stat_card', title:'SLA Status', metricId:'sla_score', size:'medium' },
                { id:5, type:'gauge', title:'Overall Health', metricId:'health_score', size:'large' },
                { id:6, type:'metric_chart', title:'Availability Trend', metricId:'uptime', size:'large' },
            ]
        },
        {
            id:'mongodb',
            name:'MongoDB Monitor',
            icon:'🍃',
            description:'Monitor MongoDB connections, operations and storage',
            widgets:[
                { id:1, type:'stat_card', title:'Connections', metricId:'connections_active', size:'medium' },
                { id:2, type:'stat_card', title:'Ops/sec', metricId:'tps', size:'medium' },
                { id:3, type:'stat_card', title:'Data Size', metricId:'db_size', size:'medium' },
                { id:4, type:'stat_card', title:'Cache Usage', metricId:'cache_hit_ratio', size:'medium' },
                { id:5, type:'metric_chart', title:'Operation Types', metricId:'tps', size:'large' },
                { id:6, type:'metric_chart', title:'WiredTiger Cache', metricId:'cache_hit_ratio', size:'large' },
            ]
        },
    ];

    if (!isOpen) return null;

    return (
        <div className="cd-modal" onClick={onClose}>
            <div className="cd-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth:900, maxHeight:'85vh' }}>
                <div className="cd-modal-title" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                    <Grid size={20} />
                    Dashboard Templates
                </div>
                <div style={{ fontSize:12, color:THEME.textMuted, marginBottom:20 }}>
                    Choose a template to pre-populate your dashboard with relevant widgets, or start with a blank canvas.
                </div>
                <div className="cd-templateGallery">
                    {templates.map(t => (
                        <div
                            key={t.id}
                            className="cd-templateCard"
                            onClick={() => {
                                onApply(t.widgets);
                                onClose();
                            }}
                            title={t.description}
                        >
                            <div className="cd-templateIcon">{t.icon}</div>
                            <div className="cd-templateName">{t.name}</div>
                            <div className="cd-templateDesc">{t.description}</div>
                            <div className="cd-templateCount">
                                {t.widgets.length === 0 ? 'Empty template' : `${t.widgets.length} widget${t.widgets.length !== 1 ? 's' : ''}`}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop:24, display:'flex', justifyContent:'flex-end', gap:10 }}>
                    <button className="cd-button" style={{ background:THEME.surfaceHover }} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM DASHBOARD TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const CustomDashboardTab: FC = () => {
    useAdaptiveTheme();
    const [widgets, setWidgets] = useState<Widget[]>(() => {
        try {
            const saved = localStorage.getItem('vigil_custom_dashboards');
            if (saved) {
                const dashboards: Dashboard[] = JSON.parse(saved);
                const activeName = localStorage.getItem('vigil_active_dashboard');
                const active = dashboards.find(d => d.name === activeName);
                return active ? active.widgets : [];
            }
            return [];
        } catch {
            return [];
        }
    });

    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [widgetData, setWidgetData] = useState<WidgetData>({});
    const [loadingWidgets, setLoadingWidgets] = useState<LoadingState>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
    const [dashboardName, setDashboardName] = useState('Custom Dashboard');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchData('/api/metrics/registry');
                setMetrics(data?.metrics || []);
                const cats = await fetchData('/api/metrics/categories');
                setCategories(cats?.categories || []);
            } catch (e) {
                console.error('Failed to load metrics:', e);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            for (const widget of widgets) {
                if (!widget.metricId) continue;

                setLoadingWidgets(prev => ({ ...prev, [widget.id]:true }));
                try {
                    let data;
                    if (widget.type === 'metric_chart' || widget.type === 'sparkline') {
                        data = await fetchData(`/api/metrics/history/${widget.metricId}?hours=24`);
                        data = data?.history || [];
                    } else {
                        const current = await fetchData('/api/metrics/current');
                        data = current?.current?.[widget.metricId]?.value;
                    }
                    setWidgetData(prev => ({ ...prev, [widget.id]:data }));
                } catch (e) {
                    console.error(`Failed to load data for widget ${widget.id}:`, e);
                }
                setLoadingWidgets(prev => ({ ...prev, [widget.id]:false }));
            }
        };

        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [widgets]);

    const saveDashboard = () => {
        try {
            const dashboards: Dashboard[] = localStorage.getItem('vigil_custom_dashboards')
                ? JSON.parse(localStorage.getItem('vigil_custom_dashboards')!)
                : [];

            const existingIndex = dashboards.findIndex(d => d.name === dashboardName);
            const dashboard: Dashboard = { name:dashboardName, widgets, timestamp:new Date().toISOString() };

            if (existingIndex >= 0) {
                dashboards[existingIndex] = dashboard;
            } else {
                dashboards.push(dashboard);
            }

            localStorage.setItem('vigil_custom_dashboards', JSON.stringify(dashboards));
            localStorage.setItem('vigil_active_dashboard', dashboardName);
            alert('Dashboard saved successfully');
        } catch (e) {
            alert('Failed to save dashboard: ' + (e instanceof Error ? e.message : 'Unknown error'));
        }
    };

    const handleAddWidget = (config: Widget) => {
        const newWidget: Widget = {
            ...config,
            id: Date.now(),
        };
        setWidgets([...widgets, newWidget]);
    };

    const handleEditWidget = (widget: Widget) => {
        setEditingWidget(widget);
        setModalOpen(true);
    };

    const handleUpdateWidget = (config: Widget) => {
        setWidgets(widgets.map(w => w.id === editingWidget?.id ? { ...config, id:w.id } : w));
        setEditingWidget(null);
    };

    const handleRemoveWidget = (id: number) => {
        setWidgets(widgets.filter(w => w.id !== id));
    };

    const applyTemplate = (templateWidgets: Widget[]) => {
        setWidgets(templateWidgets.map(w => ({ ...w, id:Date.now() + 0 })));
    };

    const exportDashboard = () => {
        try {
            const data = JSON.stringify({ name:dashboardName, widgets }, null, 2);
            const element = document.createElement('a');
            element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(data));
            element.setAttribute('download', `dashboard-${dashboardName}.json`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (e) {
            alert('Failed to export: ' + (e instanceof Error ? e.message : 'Unknown error'));
        }
    };

    return (
        <div style={{ padding:'20px', maxWidth:'1600px' }}>
            <Styles />

            <div className="cd-card" style={{ marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                    <div style={{ fontSize:18, fontWeight:700, color:THEME.textMain, display:'flex', alignItems:'center', gap:10 }}>
                        <Layout size={20} />
                        Custom Dashboard
                    </div>
                    <input
                        className="cd-input"
                        placeholder="Dashboard name..."
                        value={dashboardName}
                        onChange={(e) => setDashboardName(e.target.value)}
                        style={{ width:'300px', marginTop:10, fontSize:12 }}
                    />
                </div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'flex-end' }}>
                    <button className="cd-button" onClick={() => setTemplateGalleryOpen(true)}>
                        <Grid size={14} style={{ marginRight:6 }} />
                        Templates
                    </button>
                    <button className="cd-button" onClick={() => setModalOpen(true)}>
                        <Plus size={14} style={{ marginRight:6 }} />
                        Add Widget
                    </button>
                    <button className="cd-button cd-button-secondary" onClick={saveDashboard}>
                        <Save size={14} style={{ marginRight:6 }} />
                        Save
                    </button>
                    <button className="cd-button cd-button-secondary" onClick={exportDashboard}>
                        <Download size={14} style={{ marginRight:6 }} />
                        Export
                    </button>
                </div>
            </div>

            {widgets.length > 0 ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:20, marginBottom:20 }}>
                    {widgets.map(widget => (
                        <DashboardWidget
                            key={widget.id}
                            widget={widget}
                            onRemove={handleRemoveWidget}
                            onEdit={handleEditWidget}
                            data={widgetData[widget.id]}
                            loading={loadingWidgets[widget.id]}
                        />
                    ))}
                </div>
            ) : (
                <div className="cd-card" style={{ textAlign:'center', padding:'60px 20px' }}>
                    <AlertTriangle size={40} color={THEME.textDim} style={{ margin:'0 auto 16px' }} />
                    <div style={{ color:THEME.textMuted, fontSize:14, marginBottom:20 }}>
                        No widgets added yet. Create your custom dashboard to get started.
                    </div>
                    <button className="cd-button" onClick={() => setTemplateGalleryOpen(true)}>
                        <Grid size={14} style={{ marginRight:6 }} />
                        Browse Templates
                    </button>
                </div>
            )}

            <WidgetConfigModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingWidget(null);
                }}
                onSave={editingWidget ? handleUpdateWidget : handleAddWidget}
                widget={editingWidget || undefined}
                metrics={metrics}
                categories={categories}
            />

            <TemplateGalleryModal
                isOpen={templateGalleryOpen}
                onClose={() => setTemplateGalleryOpen(false)}
                onApply={applyTemplate}
            />
        </div>
    );
};

export default CustomDashboardTab;
