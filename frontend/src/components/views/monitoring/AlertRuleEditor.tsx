import React, { useState, useEffect, useCallback } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData, postData, deleteData } from '../../../utils/api';
import {
    Bell, Plus, Trash2, Edit3, Save, X, AlertTriangle, Info, AlertCircle,
    ToggleLeft, ToggleRight, Mail, MessageSquare, Monitor
} from 'lucide-react';

/* ── Styles ───────────────────────────────────────────────────────────────── */
const Styles = () => (
    <style>{`
        @keyframes areFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes areSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .are-card { background: ${THEME.surface}; border: 1px solid ${THEME.grid}; border-radius: 12px; padding: 20px; animation: areFade 0.3s ease; }
        .are-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .are-spin { animation: areSpin 1s linear infinite; }
    `}</style>
);

/* ── Metric options ──────────────────────────────────────────────────────── */
const METRICS = ['CPU Usage', 'Memory', 'Replication Lag', 'Long Queries', 'Cache Hit Ratio', 'Connections', 'Disk Usage'];
const CONDITIONS = ['Greater Than', 'Less Than', 'Equals'];
const DURATIONS = ['1m', '5m', '15m', '30m', '1h'];
const SEVERITIES = ['info', 'warning', 'critical'];
const CHANNELS = [
    { id: 'in-app', label: 'In-App', icon: Monitor },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'slack', label: 'Slack Webhook', icon: MessageSquare },
];

/* ── Severity color mapping ──────────────────────────────────────────────── */
const getSeverityColor = (severity) => {
    switch (severity) {
        case 'info': return THEME.info;
        case 'warning': return THEME.warning;
        case 'critical': return THEME.danger;
        default: return THEME.textMuted;
    }
};

/* ── Get metric unit ─────────────────────────────────────────────────────── */
const getMetricUnit = (metric) => {
    const units = {
        'CPU Usage': '%',
        'Memory': '%',
        'Replication Lag': 'ms',
        'Long Queries': 'sec',
        'Cache Hit Ratio': '%',
        'Connections': '#',
        'Disk Usage': '%',
    };
    return units[metric] || '';
};

/* ═══════════════════════════════════════════════════════════════════════════
   RULE FORM (Edit/Create)
   ═══════════════════════════════════════════════════════════════════════════ */
const RuleForm = ({ rule, onSave, onCancel, saving }) => {
    const [form, setForm] = useState(rule || {
        name: '',
        metric: 'CPU Usage',
        condition: 'Greater Than',
        threshold: 80,
        duration: '5m',
        severity: 'warning',
        notification_channels: ['in-app'],
        enabled: true,
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleChannelToggle = (channelId) => {
        setForm(prev => ({
            ...prev,
            notification_channels: prev.notification_channels.includes(channelId)
                ? prev.notification_channels.filter(c => c !== channelId)
                : [...prev.notification_channels, channelId],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            alert('Please enter a rule name');
            return;
        }
        onSave(form);
    };

    const unit = getMetricUnit(form.metric);

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                background: `linear-gradient(135deg, ${THEME.surface}80, ${THEME.elevated}80)`,
                border: `1px solid ${THEME.grid}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
            }}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Name */}
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: THEME.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
                        Rule Name
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., High CPU Alert"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: THEME.surface,
                            border: `1px solid ${THEME.border}`,
                            borderRadius: '8px',
                            color: THEME.textMain,
                            fontSize: '13px',
                            fontFamily: THEME.fontBody,
                            transition: 'all 0.2s ease',
                            outline: 'none',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.target.style.borderColor = THEME.border; }}
                    />
                </div>

                {/* Metric */}
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: THEME.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
                        Metric
                    </label>
                    <select
                        value={form.metric}
                        onChange={(e) => handleChange('metric', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: THEME.surface,
                            border: `1px solid ${THEME.border}`,
                            borderRadius: '8px',
                            color: THEME.textMain,
                            fontSize: '13px',
                            fontFamily: THEME.fontBody,
                            transition: 'all 0.2s ease',
                            outline: 'none',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.target.style.borderColor = THEME.border; }}
                    >
                        {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {/* Condition */}
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: THEME.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
                        Condition
                    </label>
                    <select
                        value={form.condition}
                        onChange={(e) => handleChange('condition', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: THEME.surface,
                            border: `1px solid ${THEME.border}`,
                            borderRadius: '8px',
                            color: THEME.textMain,
                            fontSize: '13px',
                            fontFamily: THEME.fontBody,
                            transition: 'all 0.2s ease',
                            outline: 'none',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.target.style.borderColor = THEME.border; }}
                    >
                        {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Threshold */}
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: THEME.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
                        Threshold {unit && `(${unit})`}
                    </label>
                    <input
                        type="number"
                        placeholder="80"
                        value={form.threshold}
                        onChange={(e) => handleChange('threshold', Number(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: THEME.surface,
                            border: `1px solid ${THEME.border}`,
                            borderRadius: '8px',
                            color: THEME.textMain,
                            fontSize: '13px',
                            fontFamily: THEME.fontBody,
                            transition: 'all 0.2s ease',
                            outline: 'none',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.target.style.borderColor = THEME.border; }}
                    />
                </div>

                {/* Duration */}
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: THEME.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
                        Duration
                    </label>
                    <select
                        value={form.duration}
                        onChange={(e) => handleChange('duration', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: THEME.surface,
                            border: `1px solid ${THEME.border}`,
                            borderRadius: '8px',
                            color: THEME.textMain,
                            fontSize: '13px',
                            fontFamily: THEME.fontBody,
                            transition: 'all 0.2s ease',
                            outline: 'none',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.target.style.borderColor = THEME.border; }}
                    >
                        {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* Severity */}
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: THEME.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
                        Severity
                    </label>
                    <select
                        value={form.severity}
                        onChange={(e) => handleChange('severity', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: THEME.surface,
                            border: `1px solid ${THEME.border}`,
                            borderRadius: '8px',
                            color: THEME.textMain,
                            fontSize: '13px',
                            fontFamily: THEME.fontBody,
                            transition: 'all 0.2s ease',
                            outline: 'none',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.target.style.borderColor = THEME.border; }}
                    >
                        {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Notification Channels */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: THEME.textSub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'block' }}>
                    Notification Channels
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {CHANNELS.map(channel => {
                        const ChannelIcon = channel.icon;
                        const isActive = form.notification_channels.includes(channel.id);
                        return (
                            <button
                                key={channel.id}
                                type="button"
                                onClick={() => handleChannelToggle(channel.id)}
                                style={{
                                    padding: '8px 12px',
                                    background: isActive ? `${THEME.primary}20` : THEME.surface,
                                    border: `1px solid ${isActive ? THEME.borderHot : THEME.border}`,
                                    borderRadius: '8px',
                                    color: isActive ? THEME.primary : THEME.textSub,
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease',
                                    fontFamily: THEME.fontBody,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = THEME.borderHot;
                                    e.currentTarget.style.background = `${THEME.primary}15`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = isActive ? THEME.borderHot : THEME.border;
                                    e.currentTarget.style.background = isActive ? `${THEME.primary}20` : THEME.surface;
                                }}
                            >
                                <ChannelIcon size={14} />
                                {channel.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Enabled Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${THEME.grid}` }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: THEME.textMain }}>
                    Enable this rule
                </label>
                <button
                    type="button"
                    onClick={() => handleChange('enabled', !form.enabled)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                    }}
                >
                    {form.enabled ? (
                        <ToggleRight size={24} color={THEME.success} />
                    ) : (
                        <ToggleLeft size={24} color={THEME.textMuted} />
                    )}
                </button>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        padding: '10px 16px',
                        background: THEME.surfaceLight,
                        color: THEME.textMain,
                        border: `1px solid ${THEME.border}`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: THEME.fontBody,
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = THEME.borderHot;
                        e.target.style.background = THEME.border;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = THEME.border;
                        e.target.style.background = THEME.surfaceLight;
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    style={{
                        padding: '10px 16px',
                        background: THEME.primary,
                        color: THEME.void,
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: saving ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        fontFamily: THEME.fontBody,
                    }}
                    onMouseEnter={(e) => {
                        if (!saving) {
                            e.target.style.background = THEME.borderGlow;
                            e.target.style.boxShadow = `0 0 12px ${THEME.primary}40`;
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = THEME.primary;
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    {saving ? <span className="are-spin" style={{ display: 'inline-block' }}>⟳</span> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save Rule'}
                </button>
            </div>
        </form>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   RULE CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const RuleCard = ({ rule, onEdit, onDelete, onToggle, deleting }) => {
    return (
        <div
            className="are-card"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
            }}
        >
            <div style={{ flex: 1 }}>
                {/* Rule Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `${getSeverityColor(rule.severity)}15`,
                            border: `1px solid ${getSeverityColor(rule.severity)}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Bell size={18} color={getSeverityColor(rule.severity)} />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: THEME.textMain }}>
                            {rule.name}
                        </div>
                        <div style={{ fontSize: '12px', color: THEME.textMuted, marginTop: '2px' }}>
                            {rule.metric}
                        </div>
                    </div>
                </div>

                {/* Rule Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                    <div>
                        <div style={{ color: THEME.textMuted, marginBottom: '2px' }}>Condition</div>
                        <div style={{ color: THEME.textMain, fontWeight: 600 }}>
                            {rule.condition} {rule.threshold}{getMetricUnit(rule.metric)}
                        </div>
                    </div>
                    <div>
                        <div style={{ color: THEME.textMuted, marginBottom: '2px' }}>Duration</div>
                        <div style={{ color: THEME.textMain, fontWeight: 600 }}>
                            {rule.duration}
                        </div>
                    </div>
                </div>

                {/* Severity & Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <span
                        className="are-badge"
                        style={{
                            background: `${getSeverityColor(rule.severity)}20`,
                            color: getSeverityColor(rule.severity),
                            border: `1px solid ${getSeverityColor(rule.severity)}40`,
                        }}
                    >
                        {rule.severity}
                    </span>
                    <span
                        className="are-badge"
                        style={{
                            background: rule.enabled ? `${THEME.success}20` : `${THEME.textMuted}20`,
                            color: rule.enabled ? THEME.success : THEME.textMuted,
                            border: rule.enabled ? `1px solid ${THEME.success}40` : `1px solid ${THEME.textMuted}40`,
                        }}
                    >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <button
                    onClick={() => onEdit(rule)}
                    style={{
                        padding: '8px 12px',
                        background: THEME.surfaceLight,
                        color: THEME.textMain,
                        border: `1px solid ${THEME.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        fontFamily: THEME.fontBody,
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = THEME.borderHot;
                        e.target.style.background = THEME.border;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = THEME.border;
                        e.target.style.background = THEME.surfaceLight;
                    }}
                >
                    <Edit3 size={13} />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(rule.id)}
                    disabled={deleting}
                    style={{
                        padding: '8px 12px',
                        background: `${THEME.danger}15`,
                        color: THEME.danger,
                        border: `1px solid ${THEME.danger}40`,
                        borderRadius: '8px',
                        cursor: deleting ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        fontFamily: THEME.fontBody,
                    }}
                    onMouseEnter={(e) => {
                        if (!deleting) {
                            e.target.style.background = `${THEME.danger}25`;
                            e.target.style.borderColor = `${THEME.danger}60`;
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = `${THEME.danger}15`;
                        e.target.style.borderColor = `${THEME.danger}40`;
                    }}
                >
                    <Trash2 size={13} />
                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ALERT RULE EDITOR (Main Component)
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AlertRuleEditor() {
    useAdaptiveTheme();
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRule, setEditingRule] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);

    /* ── Load rules ──────────────────────────────────────────────────────── */
    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchData('/api/alerts/rules');
            setRules(data.rules || []);
        } catch (err) {
            console.error('Failed to load rules:', err);
            setError(err.message || 'Failed to load alert rules');
        } finally {
            setLoading(false);
        }
    }, []);

    /* ── Save rule ───────────────────────────────────────────────────────── */
    const handleSaveRule = useCallback(async (rule) => {
        setSaving(true);
        try {
            if (editingRule) {
                // Update existing rule
                await postData(`/api/alerts/rules/${editingRule.id}`, rule);
            } else {
                // Create new rule
                await postData('/api/alerts/rules', rule);
            }
            await loadRules();
            setShowForm(false);
            setEditingRule(null);
        } catch (err) {
            console.error('Failed to save rule:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    }, [editingRule, loadRules]);

    /* ── Delete rule ──────────────────────────────────────────────────────── */
    const handleDeleteRule = useCallback(async (ruleId) => {
        if (!confirm('Delete this alert rule? This cannot be undone.')) return;
        setDeleting(ruleId);
        try {
            await deleteData(`/api/alerts/rules/${ruleId}`);
            await loadRules();
        } catch (err) {
            console.error('Failed to delete rule:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setDeleting(null);
        }
    }, [loadRules]);

    /* ── Handle edit ──────────────────────────────────────────────────────── */
    const handleEditRule = (rule) => {
        setEditingRule(rule);
        setShowForm(true);
    };

    /* ── Handle add new ──────────────────────────────────────────────────── */
    const handleAddNew = () => {
        setEditingRule(null);
        setShowForm(true);
    };

    /* ── Handle cancel ───────────────────────────────────────────────────── */
    const handleCancel = () => {
        setShowForm(false);
        setEditingRule(null);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Styles />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: THEME.textMain, margin: 0, marginBottom: '4px' }}>
                        Alert Rules
                    </h2>
                    <p style={{ fontSize: '13px', color: THEME.textMuted, margin: 0 }}>
                        Configure conditions to trigger notifications
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={handleAddNew}
                        style={{
                            padding: '10px 16px',
                            background: THEME.primary,
                            color: THEME.void,
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            fontFamily: THEME.fontBody,
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = THEME.borderGlow;
                            e.target.style.boxShadow = `0 0 12px ${THEME.primary}40`;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = THEME.primary;
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <Plus size={16} />
                        Add Rule
                    </button>
                )}
            </div>

            {/* Form or Rules List */}
            {showForm ? (
                <RuleForm
                    rule={editingRule}
                    onSave={handleSaveRule}
                    onCancel={handleCancel}
                    saving={saving}
                />
            ) : (
                <>
                    {/* Loading */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: THEME.textMuted }}>
                            <div style={{ fontSize: '14px', marginBottom: '10px' }}>Loading alert rules...</div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                background: `${THEME.danger}15`,
                                border: `1px solid ${THEME.danger}40`,
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                            }}
                        >
                            <AlertTriangle size={16} color={THEME.danger} style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: THEME.danger, marginBottom: '4px' }}>
                                    Error
                                </div>
                                <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                                    {error}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rules List */}
                    {!loading && rules.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {rules.map(rule => (
                                <RuleCard
                                    key={rule.id}
                                    rule={rule}
                                    onEdit={handleEditRule}
                                    onDelete={handleDeleteRule}
                                    onToggle={() => loadRules()}
                                    deleting={deleting === rule.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && rules.length === 0 && !error && (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                background: `linear-gradient(135deg, ${THEME.surface}80, ${THEME.elevated}80)`,
                                border: `1px solid ${THEME.grid}`,
                                borderRadius: '12px',
                            }}
                        >
                            <Bell size={40} color={THEME.textMuted} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <div style={{ fontSize: '14px', fontWeight: 600, color: THEME.textMain, marginBottom: '8px' }}>
                                No alert rules yet
                            </div>
                            <div style={{ fontSize: '12px', color: THEME.textMuted, marginBottom: '16px' }}>
                                Create your first alert rule to get started
                            </div>
                            <button
                                onClick={handleAddNew}
                                style={{
                                    padding: '10px 16px',
                                    background: THEME.primary,
                                    color: THEME.void,
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease',
                                    fontFamily: THEME.fontBody,
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = THEME.borderGlow;
                                    e.target.style.boxShadow = `0 0 12px ${THEME.primary}40`;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = THEME.primary;
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <Plus size={16} />
                                Create Rule
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
