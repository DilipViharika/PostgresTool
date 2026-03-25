// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData, postData, deleteData } from '../../../utils/api';
import {
    Bell, Plus, Trash2, Edit3, Save, X, AlertTriangle, Info, AlertCircle,
    ToggleLeft, ToggleRight, Mail, MessageSquare, Monitor
} from 'lucide-react';

/* ── Types ────────────────────────────────────────────────────────────────── */
interface AlertRule {
    id?: string;
    name: string;
    metric: string;
    condition: string;
    threshold: number;
    duration: string;
    severity: 'info' | 'warning' | 'critical';
    notification_channels: string[];
    enabled: boolean;
}

interface Channel {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
}

interface RuleFormProps {
    rule?: AlertRule | null;
    onSave: (rule: AlertRule) => void;
    onCancel: () => void;
    saving: boolean;
}

interface RuleCardProps {
    rule: AlertRule;
    onEdit: (rule: AlertRule) => void;
    onDelete: (ruleId: string) => void;
    onToggle: () => void;
    deleting: boolean;
}

interface AlertRuleEditorContextType {
    rules: AlertRule[];
    loading: boolean;
    error: string | null;
    editingRule: AlertRule | null;
    showForm: boolean;
    saving: boolean;
    deleting: string | null;
}

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
const SEVERITIES: Array<'info' | 'warning' | 'critical'> = ['info', 'warning', 'critical'];
const CHANNELS: Channel[] = [
    { id: 'in-app', label: 'In-App', icon: Monitor },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'slack', label: 'Slack Webhook', icon: MessageSquare },
];

/* ── Severity color mapping ──────────────────────────────────────────────── */
const getSeverityColor = (severity: string): string => {
    switch (severity) {
        case 'info': return THEME.info;
        case 'warning': return THEME.warning;
        case 'critical': return THEME.danger;
        default: return THEME.textMuted;
    }
};

/* ── Get metric unit ─────────────────────────────────────────────────────── */
const getMetricUnit = (metric: string): string => {
    const units: Record<string, string> = {
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
const RuleForm: React.FC<RuleFormProps> = ({ rule, onSave, onCancel, saving }) => {
    const [form, setForm] = useState<AlertRule>(rule || {
        name: '',
        metric: 'CPU Usage',
        condition: 'Greater Than',
        threshold: 80,
        duration: '5m',
        severity: 'warning',
        notification_channels: ['in-app'],
        enabled: true,
    });

    const handleChange = (field: keyof AlertRule, value: unknown) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleChannelToggle = (channelId: string) => {
        setForm(prev => ({
            ...prev,
            notification_channels: prev.notification_channels.includes(channelId)
                ? prev.notification_channels.filter(c => c !== channelId)
                : [...prev.notification_channels, channelId],
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
                backdropFilter: 'blur(8px)',
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
                        className="w-full px-3 py-2 rounded-lg text-sm font-sans border transition-all duration-200"
                        style={{
                            background: THEME.surface,
                            borderColor: THEME.border,
                            color: THEME.textMain,
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; }}
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
                        className="w-full px-3 py-2 rounded-lg text-sm font-sans border transition-all duration-200"
                        style={{
                            background: THEME.surface,
                            borderColor: THEME.border,
                            color: THEME.textMain,
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; }}
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
                        className="w-full px-3 py-2 rounded-lg text-sm font-sans border transition-all duration-200"
                        style={{
                            background: THEME.surface,
                            borderColor: THEME.border,
                            color: THEME.textMain,
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; }}
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
                        className="w-full px-3 py-2 rounded-lg text-sm font-sans border transition-all duration-200"
                        style={{
                            background: THEME.surface,
                            borderColor: THEME.border,
                            color: THEME.textMain,
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; }}
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
                        className="w-full px-3 py-2 rounded-lg text-sm font-sans border transition-all duration-200"
                        style={{
                            background: THEME.surface,
                            borderColor: THEME.border,
                            color: THEME.textMain,
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; }}
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
                        onChange={(e) => handleChange('severity', e.target.value as 'info' | 'warning' | 'critical')}
                        className="w-full px-3 py-2 rounded-lg text-sm font-sans border transition-all duration-200"
                        style={{
                            background: THEME.surface,
                            borderColor: THEME.border,
                            color: THEME.textMain,
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = THEME.borderHot; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = THEME.border; }}
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
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200"
                                style={{
                                    background: isActive ? `${THEME.primary}20` : THEME.surface,
                                    borderColor: isActive ? THEME.borderHot : THEME.border,
                                    color: isActive ? THEME.primary : THEME.textSub,
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
                    className="border-0 cursor-pointer p-0"
                    style={{ background: 'none' }}
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
                    className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200"
                    style={{
                        background: THEME.glassLight,
                        color: THEME.textMain,
                        borderColor: THEME.border,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = THEME.borderHot;
                        e.currentTarget.style.background = THEME.border;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = THEME.border;
                        e.currentTarget.style.background = THEME.glassLight;
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border-0 transition-all duration-200"
                    style={{
                        background: THEME.primary,
                        color: THEME.void,
                        cursor: saving ? 'wait' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                        if (!saving) {
                            (e.currentTarget as HTMLButtonElement).style.background = THEME.borderGlow;
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 12px ${THEME.primary}40`;
                        }
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = THEME.primary;
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                    }}
                >
                    {saving ? <span className="are-spin inline-block">⟳</span> : <Save size={14} />}
                    {saving ? 'Saving...' : 'Save Rule'}
                </button>
            </div>
        </form>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   RULE CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const RuleCard: React.FC<RuleCardProps> = ({ rule, onEdit, onDelete, onToggle, deleting }) => {
    return (
        <div
            className="are-card flex justify-between items-start gap-4"
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
                    className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all duration-200"
                    style={{
                        background: THEME.glassLight,
                        color: THEME.textMain,
                        borderColor: THEME.border,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = THEME.borderHot;
                        e.currentTarget.style.background = THEME.border;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = THEME.border;
                        e.currentTarget.style.background = THEME.glassLight;
                    }}
                >
                    <Edit3 size={13} />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(rule.id || '')}
                    disabled={deleting}
                    className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all duration-200"
                    style={{
                        background: `${THEME.danger}15`,
                        color: THEME.danger,
                        borderColor: `${THEME.danger}40`,
                        cursor: deleting ? 'wait' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                        if (!deleting) {
                            e.currentTarget.style.background = `${THEME.danger}25`;
                            e.currentTarget.style.borderColor = `${THEME.danger}60`;
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${THEME.danger}15`;
                        e.currentTarget.style.borderColor = `${THEME.danger}40`;
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
const AlertRuleEditor: React.FC = () => {
    useAdaptiveTheme();
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    /* ── Load rules ──────────────────────────────────────────────────────── */
    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchData('/api/alerts/rules') as { rules: AlertRule[] };
            setRules(data.rules || []);
        } catch (err) {
            console.error('Failed to load rules:', err);
            setError((err as Error).message || 'Failed to load alert rules');
        } finally {
            setLoading(false);
        }
    }, []);

    /* ── Save rule ───────────────────────────────────────────────────────── */
    const handleSaveRule = useCallback(async (rule: AlertRule) => {
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
            alert(`Error: ${(err as Error).message}`);
        } finally {
            setSaving(false);
        }
    }, [editingRule, loadRules]);

    /* ── Delete rule ──────────────────────────────────────────────────────── */
    const handleDeleteRule = useCallback(async (ruleId: string) => {
        if (!confirm('Delete this alert rule? This cannot be undone.')) return;
        setDeleting(ruleId);
        try {
            await deleteData(`/api/alerts/rules/${ruleId}`);
            await loadRules();
        } catch (err) {
            console.error('Failed to delete rule:', err);
            alert(`Error: ${(err as Error).message}`);
        } finally {
            setDeleting(null);
        }
    }, [loadRules]);

    /* ── Handle edit ──────────────────────────────────────────────────────── */
    const handleEditRule = (rule: AlertRule) => {
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
        <div className="p-5">
            <Styles />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h2 className="text-2xl font-bold mb-1" style={{ color: THEME.textMain }}>
                        Alert Rules
                    </h2>
                    <p className="text-xs" style={{ color: THEME.textMuted }}>
                        Configure conditions to trigger notifications
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border-0 transition-all duration-200"
                        style={{
                            background: THEME.primary,
                            color: THEME.void,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = THEME.borderGlow;
                            e.currentTarget.style.boxShadow = `0 0 12px ${THEME.primary}40`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = THEME.primary;
                            e.currentTarget.style.boxShadow = 'none';
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
                        <div className="text-center py-10" style={{ color: THEME.textMuted }}>
                            <div className="text-sm mb-2.5">Loading alert rules...</div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div
                            className="rounded-lg p-4 mb-5 flex items-start gap-3"
                            style={{
                                background: `${THEME.danger}15`,
                                border: `1px solid ${THEME.danger}40`,
                            }}
                        >
                            <AlertTriangle size={16} color={THEME.danger} className="flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-xs font-semibold mb-1" style={{ color: THEME.danger }}>
                                    Error
                                </div>
                                <div className="text-xs" style={{ color: THEME.textMuted }}>
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
                            className="text-center py-10 rounded-lg border"
                            style={{
                                background: `linear-gradient(135deg, ${THEME.surface}80, ${THEME.elevated}80)`,
                                borderColor: THEME.grid,
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <Bell size={40} className="mx-auto mb-3" color={THEME.textMuted} style={{ opacity: 0.5 }} />
                            <div className="text-sm font-semibold mb-2" style={{ color: THEME.textMain }}>
                                No alert rules yet
                            </div>
                            <div className="text-xs mb-4" style={{ color: THEME.textMuted }}>
                                Create your first alert rule to get started
                            </div>
                            <button
                                onClick={handleAddNew}
                                className="px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 border-0 transition-all duration-200"
                                style={{
                                    background: THEME.primary,
                                    color: THEME.void,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = THEME.borderGlow;
                                    e.currentTarget.style.boxShadow = `0 0 12px ${THEME.primary}40`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = THEME.primary;
                                    e.currentTarget.style.boxShadow = 'none';
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
};

export default AlertRuleEditor;
