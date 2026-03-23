import React, { useState, useEffect } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { fetchData } from '../../../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Layout, Plus, Trash2, Settings, Grid, Move, Save, AlertTriangle, RefreshCw } from 'lucide-react';

/* ── Styles ───────────────────────────────────────────────────────────────── */
const Styles = () => (
    <style>{`
        @keyframes cdFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .cd-card { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:12px; padding:20px; animation:cdFade .3s ease; }
        .cd-button { background:${THEME.primary}; color:${THEME.textInverse}; border:none; border-radius:8px; padding:10px 16px; font-weight:700; font-size:13px; cursor:pointer; }
        .cd-button:hover { background:${THEME.primaryLight}; }
        .cd-button-secondary { background:${THEME.secondary}; }
        .cd-button-secondary:hover { background:${THEME.secondaryLight}; }
        .cd-button-danger { background:${THEME.danger}; }
        .cd-button-danger:hover { background:${THEME.dangerLight}; }
        .cd-select { background:${THEME.surfaceHover}; border:1px solid ${THEME.grid}; border-radius:8px; padding:10px 12px; color:${THEME.textMain}; font-size:13px; width:100%; cursor:pointer; }
        .cd-input { background:${THEME.surfaceHover}; border:1px solid ${THEME.grid}; border-radius:8px; padding:10px 12px; color:${THEME.textMain}; font-size:13px; width:100%; }
        .cd-input:focus { outline:none; border-color:${THEME.primary}; }
        .cd-label { font-size:12px; font-weight:700; color:${THEME.textMuted}; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; }
        .cd-widget { background:${THEME.grid}; border:1px solid ${THEME.grid}; border-radius:10px; padding:16px; position:relative; animation:cdFade .3s ease; cursor:grab; }
        .cd-widget:hover { border-color:${THEME.primary}40; }
        .cd-widget-drag-handle { cursor:grab; padding:8px; position:absolute; top:8px; left:8px; color:${THEME.textDim}; }
        .cd-widget-remove { cursor:pointer; padding:8px; position:absolute; top:8px; right:8px; color:${THEME.textDim}; }
        .cd-widget-remove:hover { color:${THEME.danger}; }
        .cd-modal { position:fixed; inset:0; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .cd-modal-content { background:${THEME.surface}; border:1px solid ${THEME.grid}; border-radius:12px; padding:24px; max-width:500px; width:90%; }
        .cd-modal-title { font-size:18px; font-weight:700; color:${THEME.textMain}; margin-bottom:16px; }
        .cd-modal-field { margin-bottom:16px; }
    `}</style>
);

/* ── Widget Component ──────────────────────────────────────────────────────── */
const DashboardWidget = ({ widget, onRemove, data }) => {
    const renderContent = () => {
        if (!data) return <div style={{ color:THEME.textDim }}>Loading...</div>;

        if (widget.type === 'stat_card') {
            return (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                    <div style={{ fontSize:28, fontWeight:800, color:THEME.primary, marginBottom:8 }}>
                        {data.value}
                    </div>
                    <div style={{ fontSize:12, color:THEME.textMuted }}>{widget.dataSource}</div>
                </div>
            );
        }

        if (widget.type === 'metric_chart') {
            return (
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                        <XAxis dataKey="timestamp" stroke={THEME.textDim} style={{ fontSize:10 }} />
                        <YAxis stroke={THEME.textDim} style={{ fontSize:10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke={THEME.primary} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            );
        }

        if (widget.type === 'table') {
            return (
                <table style={{ width:'100%', fontSize:11 }}>
                    <tbody>
                        {(data || []).slice(0, 5).map((row, i) => (
                            <tr key={i}>
                                <td style={{ padding:'8px', borderBottom:`1px solid ${THEME.grid}40` }}>
                                    {Object.values(row)[0]}
                                </td>
                                <td style={{ padding:'8px', borderBottom:`1px solid ${THEME.grid}40`, textAlign:'right', color:THEME.primary }}>
                                    {Object.values(row)[1]}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (widget.type === 'alert_feed') {
            return (
                <div>
                    {(data || []).slice(0, 3).map((alert, i) => (
                        <div key={i} style={{
                            padding:'8px',
                            borderLeft:`3px solid ${THEME.warning}`,
                            borderRadius:4,
                            marginBottom:8,
                            fontSize:11,
                            color:THEME.textDim
                        }}>
                            {alert.title}
                        </div>
                    ))}
                </div>
            );
        }
    };

    return (
        <div className="cd-widget" style={{
            gridColumn:`span ${widget.size === 'large' ? 2 : widget.size === 'medium' ? 1 : 1}`
        }}>
            <div className="cd-widget-drag-handle" title="Drag to reorder">
                <Move size={14} />
            </div>
            <div className="cd-widget-remove" onClick={() => onRemove(widget.id)} title="Remove widget">
                <Trash2 size={14} />
            </div>
            <div style={{ marginTop:16, marginRight:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:THEME.textMain, marginBottom:12 }}>
                    {widget.title}
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

/* ── Modal for adding widgets ──────────────────────────────────────────────── */
const AddWidgetModal = ({ isOpen, onClose, onAdd, availableMetrics }) => {
    const [formData, setFormData] = useState({ type:'metric_chart', title:'', dataSource:'', size:'medium' });

    const handleAdd = () => {
        if (!formData.title || !formData.dataSource) return;
        onAdd({ ...formData, id:Date.now() });
        setFormData({ type:'metric_chart', title:'', dataSource:'', size:'medium' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="cd-modal" onClick={onClose}>
            <div className="cd-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="cd-modal-title">Add Widget</div>

                <div className="cd-modal-field">
                    <div className="cd-label">Widget Type</div>
                    <select className="cd-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type:e.target.value })}>
                        <option value="metric_chart">Metric Chart</option>
                        <option value="stat_card">Stat Card</option>
                        <option value="table">Table</option>
                        <option value="alert_feed">Alert Feed</option>
                    </select>
                </div>

                <div className="cd-modal-field">
                    <div className="cd-label">Widget Title</div>
                    <input className="cd-input" placeholder="e.g., Database Connections" value={formData.title} onChange={(e) => setFormData({ ...formData, title:e.target.value })} />
                </div>

                <div className="cd-modal-field">
                    <div className="cd-label">Data Source (Metric Name)</div>
                    <select className="cd-select" value={formData.dataSource} onChange={(e) => setFormData({ ...formData, dataSource:e.target.value })}>
                        <option value="">Select a metric...</option>
                        {availableMetrics.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                <div className="cd-modal-field">
                    <div className="cd-label">Widget Size</div>
                    <select className="cd-select" value={formData.size} onChange={(e) => setFormData({ ...formData, size:e.target.value })}>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large (2x width)</option>
                    </select>
                </div>

                <div style={{ display:'flex', gap:10, marginTop:20 }}>
                    <button className="cd-button" onClick={handleAdd}>Add Widget</button>
                    <button className="cd-button" style={{ background:THEME.surfaceHover }} onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM DASHBOARD TAB
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CustomDashboardTab() {
    useAdaptiveTheme();
    const [widgets, setWidgets] = useState(() => {
        try {
            const saved = localStorage.getItem('vigil_custom_dashboard_widgets');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [availableMetrics, setAvailableMetrics] = useState([]);
    const [widgetData, setWidgetData] = useState({});
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Load available metrics
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchData('/api/metrics/names');
                setAvailableMetrics(data?.names || []);
            } catch (e) {
                console.error('Failed to load metrics:', e);
            }
        };
        load();
    }, []);

    // Load widget data
    useEffect(() => {
        const load = async () => {
            for (const widget of widgets) {
                try {
                    const data = await fetchData(`/api/metrics/data?name=${encodeURIComponent(widget.dataSource)}&range=6h`);
                    setWidgetData(prev => ({ ...prev, [widget.id]:data }));
                } catch (e) {
                    console.error(`Failed to load data for ${widget.id}:`, e);
                }
            }
        };
        load();
    }, [widgets]);

    const handleAddWidget = (newWidget) => {
        const updated = [...widgets, newWidget];
        setWidgets(updated);
        localStorage.setItem('vigil_custom_dashboard_widgets', JSON.stringify(updated));
    };

    const handleRemoveWidget = (id) => {
        const updated = widgets.filter(w => w.id !== id);
        setWidgets(updated);
        localStorage.setItem('vigil_custom_dashboard_widgets', JSON.stringify(updated));
    };

    const applyTemplate = (template) => {
        const templateWidgets = {
            dba: [
                { id:1, type:'metric_chart', title:'Database Size Trend', dataSource:'pg_database_size_bytes', size:'large' },
                { id:2, type:'stat_card', title:'Active Connections', dataSource:'pg_stat_activity_count', size:'medium' },
                { id:3, type:'stat_card', title:'Cache Hit Ratio', dataSource:'pg_cache_hit_ratio', size:'medium' },
            ],
            performance: [
                { id:1, type:'metric_chart', title:'Query Duration', dataSource:'pg_stat_statements_mean_exec_time', size:'large' },
                { id:2, type:'stat_card', title:'Slow Queries', dataSource:'pg_slow_queries_count', size:'medium' },
                { id:3, type:'table', title:'Top Queries', dataSource:'pg_stat_statements_sorted', size:'medium' },
            ],
            capacity: [
                { id:1, type:'metric_chart', title:'Storage Growth', dataSource:'pg_database_size_bytes', size:'large' },
                { id:2, type:'stat_card', title:'Table Count', dataSource:'pg_tables_count', size:'medium' },
                { id:3, type:'alert_feed', title:'Recent Alerts', dataSource:'alerts', size:'medium' },
            ],
        };
        const newWidgets = templateWidgets[template] || [];
        setWidgets(newWidgets);
        localStorage.setItem('vigil_custom_dashboard_widgets', JSON.stringify(newWidgets));
        setSelectedTemplate(template);
    };

    return (
        <div style={{ padding:'20px', maxWidth:'1400px' }}>
            <Styles />

            {/* Header with Actions */}
            <div className="cd-card" style={{ marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:16, fontWeight:700, color:THEME.textMain }}>
                    <Layout size={18} style={{ display:'inline-block', marginRight:10, verticalAlign:'middle' }} />
                    Custom Dashboard
                </div>
                <div style={{ display:'flex', gap:10 }}>
                    <button className="cd-button" onClick={() => setModalOpen(true)}>
                        <Plus size={14} style={{ marginRight:6 }} />
                        Add Widget
                    </button>
                    <button className="cd-button cd-button-secondary" onClick={() => {
                        localStorage.setItem('vigil_custom_dashboard_widgets', JSON.stringify(widgets));
                    }}>
                        <Save size={14} style={{ marginRight:6 }} />
                        Save
                    </button>
                </div>
            </div>

            {/* Template Selection */}
            <div className="cd-card" style={{ marginBottom:20 }}>
                <div style={{ fontSize:14, fontWeight:700, color:THEME.textMain, marginBottom:12 }}>
                    <Grid size={16} style={{ display:'inline-block', marginRight:8, verticalAlign:'middle' }} />
                    Preset Templates
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
                    {['dba', 'performance', 'capacity'].map(template => (
                        <button
                            key={template}
                            className="cd-button"
                            onClick={() => applyTemplate(template)}
                            style={{
                                background:selectedTemplate === template ? THEME.primary : THEME.grid,
                                color:selectedTemplate === template ? THEME.textInverse : THEME.textMain,
                                textTransform:'capitalize'
                            }}
                        >
                            {template === 'dba' ? 'DBA Overview' : template === 'performance' ? 'Performance Focus' : 'Capacity Planning'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Widgets Grid */}
            {widgets.length > 0 ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:20, marginBottom:20 }}>
                    {widgets.map(widget => (
                        <DashboardWidget
                            key={widget.id}
                            widget={widget}
                            onRemove={handleRemoveWidget}
                            data={widgetData[widget.id]}
                        />
                    ))}
                </div>
            ) : (
                <div className="cd-card" style={{ textAlign:'center', padding:'40px 20px' }}>
                    <AlertTriangle size={32} color={THEME.textDim} style={{ margin:'0 auto 16px' }} />
                    <div style={{ color:THEME.textMuted, fontSize:13 }}>
                        No widgets added yet. Click "Add Widget" or select a template to get started.
                    </div>
                </div>
            )}

            {/* Add Widget Modal */}
            <AddWidgetModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onAdd={handleAddWidget}
                availableMetrics={availableMetrics}
            />
        </div>
    );
}
