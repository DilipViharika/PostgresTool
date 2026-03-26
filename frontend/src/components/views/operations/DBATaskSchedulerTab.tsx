import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import {
    CalendarCheck,
    CheckCircle,
    Clock,
    TrendingUp,
    Plus,
    RotateCcw,
    Trash2,
    Edit2,
    MessageSquare,
    AlertCircle,
    type LucideIcon
} from 'lucide-react';
import { fetchData } from '../../../utils/api';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface DBTask {
    id: string;
    title: string;
    category: 'Daily' | 'Weekly' | 'Monthly' | 'Ad-hoc';
    priority: 'low' | 'medium' | 'high' | 'critical';
    recurrence: 'once' | 'daily' | 'weekly' | 'monthly';
    assignee?: string;
    dueDate?: string;
    notes?: string;
    done?: boolean;
}

interface FormData {
    title: string;
    category: 'Daily' | 'Weekly' | 'Monthly' | 'Ad-hoc';
    priority: 'low' | 'medium' | 'high' | 'critical';
    recurrence: 'once' | 'daily' | 'weekly' | 'monthly';
    assignee: string;
    dueDate: string;
    notes: string;
}

interface ExecutionHistoryEntry {
    id: string;
    taskId: string;
    taskTitle: string;
    startTime: string;
    timestamp: number;
    duration: string;
    status: 'Running' | 'Success' | 'Failed';
}

interface Stats {
    total: number;
    done: number;
    pending: number;
}

/* ─── Styles Object ────────────────────────────────────────────────────── */
const getStyles = () => ({
    container: {
        padding: '24px',
        backgroundColor: THEME.bg,
        color: THEME.textMain,
        fontFamily: THEME.fontBody,
        minHeight: '100vh',
    } as React.CSSProperties,

    header: {
        marginBottom: 32,
    } as React.CSSProperties,

    headerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    } as React.CSSProperties,

    titleSection: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    } as React.CSSProperties,

    title: {
        fontSize: 28,
        fontWeight: 700,
        margin: 0,
        color: THEME.textMain,
        fontFamily: THEME.fontDisplay || 'system-ui',
        letterSpacing: '-0.5px',
    } as React.CSSProperties,

    mainTabsContainer: {
        display: 'flex',
        gap: 12,
        marginBottom: 24,
    } as React.CSSProperties,

    mainTabButton: {
        padding: '10px 16px',
        borderRadius: 8,
        border: `1px solid ${THEME.grid}`,
        backgroundColor: THEME.surface,
        color: THEME.textMuted,
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        transition: 'all 0.15s',
    } as React.CSSProperties,

    mainTabButtonActive: {
        backgroundColor: `${THEME.primary}15`,
        borderColor: THEME.primary,
        color: THEME.primary,
    } as React.CSSProperties,

    badgeCount: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        width: 20,
        height: 20,
        borderRadius: '50%',
        backgroundColor: THEME.danger,
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
    } as React.CSSProperties,

    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
    } as React.CSSProperties,

    statCard: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px',
        borderRadius: 10,
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.grid}`,
    } as React.CSSProperties,

    statIcon: {
        fontSize: 20,
        flexShrink: 0,
    } as React.CSSProperties,

    statContent: {
        display: 'flex',
        flexDirection: 'column' as const,
    },

    statLabel: {
        fontSize: 11,
        fontWeight: 600,
        color: THEME.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    } as React.CSSProperties,

    statValue: {
        fontSize: 20,
        fontWeight: 700,
        marginTop: 2,
    } as React.CSSProperties,

    controlsRow: {
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        marginBottom: 24,
    } as React.CSSProperties,

    filterTabs: {
        display: 'flex',
        gap: 8,
    } as React.CSSProperties,

    filterTab: {
        padding: '8px 14px',
        borderRadius: 6,
        border: `1px solid ${THEME.grid}`,
        backgroundColor: 'transparent',
        color: THEME.textMuted,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.15s',
    } as React.CSSProperties,

    filterTabActive: {
        backgroundColor: `${THEME.primary}15`,
        borderColor: THEME.primary,
        color: THEME.primary,
    } as React.CSSProperties,

    searchInput: {
        flex: 1,
        padding: '9px 12px',
        borderRadius: 8,
        border: `1px solid ${THEME.grid}`,
        backgroundColor: THEME.surface,
        color: THEME.textMain,
        fontSize: 12,
        outline: 'none',
    } as React.CSSProperties,

    addButton: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 14px',
        borderRadius: 8,
        border: `1px solid ${THEME.primary}40`,
        backgroundColor: `${THEME.primary}15`,
        color: THEME.primary,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.15s',
    } as React.CSSProperties,

    resetButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        border: `1px solid ${THEME.grid}`,
        backgroundColor: THEME.surface,
        color: THEME.textMuted,
        cursor: 'pointer',
        transition: 'all 0.15s',
    } as React.CSSProperties,

    taskRow: {
        padding: '12px 16px',
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.grid}`,
        transition: 'all 0.15s',
    } as React.CSSProperties,

    taskMainRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
    } as React.CSSProperties,

    taskCheckbox: {
        width: 18,
        height: 18,
        marginTop: 2,
        cursor: 'pointer',
        accentColor: THEME.primary,
    } as React.CSSProperties,

    priorityDot: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        marginTop: 8,
        flexShrink: 0,
    } as React.CSSProperties,

    taskContent: {
        flex: 1,
    } as React.CSSProperties,

    taskTitleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    } as React.CSSProperties,

    taskTitle: {
        fontSize: 13,
        fontWeight: 600,
        color: THEME.textMain,
    } as React.CSSProperties,

    taskMeta: {
        display: 'flex',
        gap: 8,
        fontSize: 11,
        flexWrap: 'wrap' as const,
    },

    recurrenceBadge: {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: `${THEME.primary}15`,
        color: THEME.primary,
        fontWeight: 600,
    } as React.CSSProperties,

    assigneeBadge: {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: `${THEME.secondary}15`,
        color: THEME.secondary,
        fontWeight: 600,
    } as React.CSSProperties,

    dueDateBadge: {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: `${THEME.textMuted}15`,
        fontWeight: 600,
    } as React.CSSProperties,

    notesButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        border: 'none',
        backgroundColor: 'transparent',
        color: THEME.textMuted,
        cursor: 'pointer',
        transition: 'all 0.15s',
    } as React.CSSProperties,

    editButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        border: 'none',
        backgroundColor: `${THEME.warning}10`,
        color: THEME.warning,
        cursor: 'pointer',
        transition: 'all 0.15s',
    } as React.CSSProperties,

    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        border: 'none',
        backgroundColor: `${THEME.danger}10`,
        color: THEME.danger,
        cursor: 'pointer',
        transition: 'all 0.15s',
    } as React.CSSProperties,

    notesExpandedContainer: {
        marginTop: 12,
        padding: '10px 12px',
        borderRadius: 6,
        backgroundColor: `${THEME.primary}08`,
        border: `1px solid ${THEME.primary}20`,
    } as React.CSSProperties,

    notesExpanded: {
        fontSize: 12,
        color: THEME.textDim,
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap' as const,
    },

    loadingState: {
        textAlign: 'center' as const,
        padding: '40px 20px',
        color: THEME.textMuted,
        fontSize: 14,
    } as React.CSSProperties,

    errorState: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px',
        borderRadius: 8,
        backgroundColor: `${THEME.danger}10`,
        border: `1px solid ${THEME.danger}30`,
        color: THEME.danger,
        fontSize: 13,
    } as React.CSSProperties,

    emptyState: {
        textAlign: 'center' as const,
        padding: '40px 20px',
        color: THEME.textMuted,
        fontSize: 13,
    } as React.CSSProperties,

    panelContainer: {
        borderRadius: 12,
        border: `1px solid ${THEME.grid}`,
        backgroundColor: THEME.surface,
        padding: '24px',
    } as React.CSSProperties,

    panelTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: THEME.textMain,
        marginBottom: 20,
        margin: 0,
    } as React.CSSProperties,

    emptyPanelState: {
        textAlign: 'center' as const,
        padding: '40px 20px',
        color: THEME.textMuted,
    } as React.CSSProperties,

    approvalsList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 12,
    },

    approvalCard: {
        borderRadius: 10,
        border: `1px solid ${THEME.danger}30`,
        backgroundColor: `${THEME.danger}05`,
        overflow: 'hidden',
    } as React.CSSProperties,

    approvalRiskBanner: {
        padding: '10px 14px',
        backgroundColor: `${THEME.danger}15`,
        borderBottom: `1px solid ${THEME.danger}30`,
        color: THEME.danger,
        fontSize: 12,
        fontWeight: 600,
    } as React.CSSProperties,

    approvalContent: {
        padding: '16px',
    } as React.CSSProperties,

    approvalHeader: {
        marginBottom: 12,
    } as React.CSSProperties,

    approvalTaskTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: THEME.textMain,
        marginBottom: 6,
    } as React.CSSProperties,

    approvalTaskMeta: {
        display: 'flex',
        gap: 8,
        fontSize: 11,
    } as React.CSSProperties,

    approvalCategory: {
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: `${THEME.primary}15`,
        color: THEME.primary,
        fontWeight: 600,
    } as React.CSSProperties,

    approvalPriorityBadge: {
        padding: '3px 10px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
    } as React.CSSProperties,

    approvalActions: {
        display: 'flex',
        gap: 8,
    } as React.CSSProperties,

    approveButton: {
        flex: 1,
        padding: '9px 12px',
        borderRadius: 6,
        border: `1px solid ${THEME.success}40`,
        backgroundColor: `${THEME.success}15`,
        color: THEME.success,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.15s',
    } as React.CSSProperties,

    rejectButton: {
        flex: 1,
        padding: '9px 12px',
        borderRadius: 6,
        border: `1px solid ${THEME.danger}40`,
        backgroundColor: `${THEME.danger}15`,
        color: THEME.danger,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.15s',
    } as React.CSSProperties,

    historyTable: {
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${THEME.grid}`,
    } as React.CSSProperties,

    historyHeader: {
        display: 'grid',
        gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
        gap: 16,
        padding: '12px 16px',
        backgroundColor: THEME.surfaceHover,
        borderBottom: `1px solid ${THEME.grid}`,
        fontSize: 11,
        fontWeight: 700,
        color: THEME.textMuted,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    } as React.CSSProperties,

    historyRow: {
        display: 'grid',
        gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
        gap: 16,
        padding: '12px 16px',
        borderBottom: `1px solid ${THEME.grid}20`,
        fontSize: 12,
        alignItems: 'center',
    } as React.CSSProperties,

    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 10px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
    } as React.CSSProperties,

    formContainer: {
        padding: '20px',
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.grid}`,
    } as React.CSSProperties,

    formTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: THEME.textMain,
        marginBottom: 16,
        margin: 0,
    } as React.CSSProperties,

    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 16,
    } as React.CSSProperties,

    formInput: {
        padding: '9px 12px',
        borderRadius: 8,
        border: `1px solid ${THEME.grid}`,
        backgroundColor: THEME.surfaceHover,
        color: THEME.textMain,
        fontSize: 12,
        outline: 'none',
        fontFamily: 'inherit',
    } as React.CSSProperties,

    formSelect: {
        padding: '9px 12px',
        borderRadius: 8,
        border: `1px solid ${THEME.grid}`,
        backgroundColor: THEME.surfaceHover,
        color: THEME.textMain,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: 'inherit',
    } as React.CSSProperties,

    formActions: {
        display: 'flex',
        gap: 8,
        justifyContent: 'flex-end',
    } as React.CSSProperties,

    saveButton: {
        padding: '9px 16px',
        borderRadius: 6,
        border: `1px solid ${THEME.success}40`,
        backgroundColor: `${THEME.success}15`,
        color: THEME.success,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.15s',
    } as React.CSSProperties,

    cancelButton: {
        padding: '9px 16px',
        borderRadius: 6,
        border: `1px solid ${THEME.grid}`,
        backgroundColor: THEME.surface,
        color: THEME.textMuted,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.15s',
    } as React.CSSProperties,
});

/* ─── Components ────────────────────────────────────────────────────────── */
interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: number;
    color: string;
    suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, suffix = '' }) => {
    const styles = getStyles();
    return (
        <div style={styles.statCard}>
            <div style={{ ...styles.statIcon, color }}>
                {icon}
            </div>
            <div style={styles.statContent}>
                <div style={styles.statLabel}>{label}</div>
                <div style={{ ...styles.statValue, color }}>
                    {value}{suffix}
                </div>
            </div>
        </div>
    );
};

interface TaskRowProps {
    task: DBTask;
    isEditing: boolean;
    onToggleDone: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onUpdate: (updates: Partial<DBTask>) => void;
    onCancelEdit: () => void;
    isOverdue: boolean;
    getPriorityColor: (priority: string) => string;
    expandedNotes: string | null;
    setExpandedNotes: (id: string | null) => void;
    requiresApproval: boolean;
    onRequestApproval: () => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
    task,
    isEditing,
    onToggleDone,
    onEdit,
    onDelete,
    onUpdate,
    onCancelEdit,
    isOverdue,
    getPriorityColor,
    expandedNotes,
    setExpandedNotes,
    requiresApproval,
}) => {
    const styles = getStyles();
    const [editForm, setEditForm] = useState<DBTask>(task);

    const handleSaveEdit = () => {
        onUpdate(editForm);
    };

    if (isEditing) {
        return (
            <div style={styles.taskRow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                    <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        style={styles.formInput}
                        placeholder="Task title"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <select
                            value={editForm.priority}
                            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                            style={styles.formSelect}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                        <input
                            type="text"
                            value={editForm.assignee || ''}
                            onChange={(e) => setEditForm({ ...editForm, assignee: e.target.value })}
                            style={styles.formInput}
                            placeholder="Assignee"
                        />
                        <input
                            type="date"
                            value={editForm.dueDate || ''}
                            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                            style={styles.formInput}
                        />
                    </div>
                    <textarea
                        value={editForm.notes || ''}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        style={{ ...styles.formInput, minHeight: 80 }}
                        placeholder="Notes"
                    />
                    <div style={styles.formActions}>
                        <button onClick={handleSaveEdit} style={styles.saveButton}>
                            Save
                        </button>
                        <button onClick={onCancelEdit} style={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.taskRow}>
            <div style={styles.taskMainRow}>
                <input
                    type="checkbox"
                    checked={task.done || false}
                    onChange={onToggleDone}
                    style={styles.taskCheckbox}
                />

                <div
                    style={{
                        ...styles.priorityDot,
                        backgroundColor: getPriorityColor(task.priority),
                    }}
                />

                <div style={styles.taskContent}>
                    <div style={styles.taskTitleRow}>
                        <div
                            style={{
                                ...styles.taskTitle,
                                textDecoration: task.done ? 'line-through' : 'none',
                                opacity: task.done ? 0.6 : 1,
                            }}
                        >
                            {task.title}
                        </div>
                        {requiresApproval && (
                            <span style={{ fontSize: 11, color: THEME.danger, fontWeight: 600 }}>
                                ⚠️ Requires Approval
                            </span>
                        )}
                    </div>
                    <div style={styles.taskMeta}>
                        {task.recurrence && (
                            <span style={styles.recurrenceBadge}>{task.recurrence}</span>
                        )}
                        {task.assignee && (
                            <span style={styles.assigneeBadge}>{task.assignee}</span>
                        )}
                        {task.dueDate && (
                            <span
                                style={{
                                    ...styles.dueDateBadge,
                                    color: isOverdue ? THEME.danger : THEME.textMuted,
                                }}
                            >
                                {new Date(task.dueDate).toLocaleDateString()}
                                {isOverdue && ' (overdue)'}
                            </span>
                        )}
                    </div>
                </div>

                {task.notes && (
                    <button
                        onClick={() =>
                            setExpandedNotes(expandedNotes === task.id ? null : task.id)
                        }
                        style={styles.notesButton}
                        title="View notes"
                    >
                        <MessageSquare size={16} />
                    </button>
                )}

                <button onClick={onEdit} style={styles.editButton}>
                    <Edit2 size={16} />
                </button>

                <button onClick={onDelete} style={styles.deleteButton}>
                    <Trash2 size={16} />
                </button>
            </div>

            {expandedNotes === task.id && task.notes && (
                <div style={styles.notesExpandedContainer}>
                    <div style={styles.notesExpanded}>{task.notes}</div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DBA TASK SCHEDULER TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const DBATaskSchedulerTab: React.FC = () => {
    useAdaptiveTheme();
    const styles = getStyles();

    const [tasks, setTasks] = useState<DBTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
    const [pendingApprovals, setPendingApprovals] = useState<string[]>([]);
    const [execHistory, setExecHistory] = useState<ExecutionHistoryEntry[]>([]);
    const [activeMainTab, setActiveMainTab] = useState<'tasks' | 'approvals' | 'history'>('tasks');

    const [formData, setFormData] = useState<FormData>({
        title: '',
        category: 'Daily',
        priority: 'medium',
        recurrence: 'daily',
        assignee: '',
        dueDate: '',
        notes: '',
    });

    useEffect(() => { loadTasks(); }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchData('/api/tasks');
            setTasks(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError('Failed to load tasks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getAuthHeader = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('vigil_token')}`,
    });

    const handleAddTask = async () => {
        if (!formData.title.trim()) {
            alert('Title is required');
            return;
        }

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    priority: formData.priority,
                    recurrence: formData.recurrence,
                    assignee: formData.assignee || undefined,
                    dueDate: formData.dueDate || undefined,
                    notes: formData.notes || undefined,
                }),
            });

            if (!response.ok) throw new Error('Failed to create task');

            await loadTasks();
            resetForm();
            setShowAddForm(false);
        } catch (err: any) {
            alert('Error creating task: ' + err.message);
        }
    };

    const handleUpdateTask = async (id: string, updates: Partial<DBTask>) => {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: getAuthHeader(),
                body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error('Failed to update task');

            await loadTasks();
            setEditingId(null);
        } catch (err: any) {
            alert('Error updating task: ' + err.message);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm('Delete this task?')) return;

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });

            if (!response.ok) throw new Error('Failed to delete task');

            await loadTasks();
        } catch (err: any) {
            alert('Error deleting task: ' + err.message);
        }
    };

    const handleReset = async () => {
        if (!confirm('Reset all tasks to defaults?')) return;

        try {
            const response = await fetch('/api/tasks/reset', {
                method: 'POST',
                headers: getAuthHeader(),
            });

            if (!response.ok) throw new Error('Failed to reset tasks');

            await loadTasks();
        } catch (err: any) {
            alert('Error resetting tasks: ' + err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: 'Daily',
            priority: 'medium',
            recurrence: 'daily',
            assignee: '',
            dueDate: '',
            notes: '',
        });
    };

    const requiresApproval = (priority: string): boolean => {
        return priority === 'critical' || priority === 'high';
    };

    const handleTaskRequestApproval = (taskId: string) => {
        if (!pendingApprovals.includes(taskId)) {
            setPendingApprovals([...pendingApprovals, taskId]);
        }
    };

    const handleApproveTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const now = new Date();
            setExecHistory([{
                id: `${taskId}-${Date.now()}`,
                taskId,
                taskTitle: task.title,
                startTime: now.toLocaleString(),
                timestamp: now.getTime(),
                duration: '0s',
                status: 'Running',
            }, ...execHistory]);
            setPendingApprovals(pending => pending.filter(p => p !== taskId));
        }
    };

    const handleRejectTask = (taskId: string) => {
        setPendingApprovals(pending => pending.filter(p => p !== taskId));
    };

    const getFilteredTasks = useCallback(() => {
        let filtered = tasks;

        if (filter === 'Daily') filtered = filtered.filter(t => t.recurrence === 'daily');
        else if (filter === 'Weekly') filtered = filtered.filter(t => t.recurrence === 'weekly');
        else if (filter === 'Monthly') filtered = filtered.filter(t => t.recurrence === 'monthly');
        else if (filter === 'Completed') filtered = filtered.filter(t => t.done);

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.assignee?.toLowerCase().includes(q) ||
                t.notes?.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [tasks, filter, search]);

    const groupTasksByCategory = (taskList: DBTask[]): Record<string, DBTask[]> => {
        const groups: Record<string, DBTask[]> = {
            'Daily': [],
            'Weekly': [],
            'Monthly': [],
            'Ad-hoc': [],
        };

        taskList.forEach(task => {
            const category = task.category || 'Ad-hoc';
            if (groups[category]) {
                groups[category].push(task);
            }
        });

        return groups;
    };

    const isOverdue = (dueDate: string | undefined): boolean => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && !dueDate.endsWith('2099');
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'critical':
            case 'high': return THEME.danger;
            case 'medium': return THEME.warning;
            case 'low': return THEME.success;
            default: return THEME.textMuted;
        }
    };

    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'Daily': return THEME.primary;
            case 'Weekly': return THEME.secondary;
            case 'Monthly': return THEME.ai || THEME.primary;
            default: return THEME.textMuted;
        }
    };

    const filteredTasks = getFilteredTasks();
    const grouped = groupTasksByCategory(filteredTasks);
    const stats: Stats = {
        total: tasks.length,
        done: tasks.filter(t => t.done).length,
        pending: tasks.filter(t => !t.done).length,
    };

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .task-fade-in { animation: fadeIn 0.3s ease-in-out; }
            `}</style>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerTop}>
                    <div style={styles.titleSection}>
                        <CalendarCheck size={28} color={THEME.primary} />
                        <h1 style={styles.title}>DBA Task Scheduler</h1>
                    </div>
                </div>

                {/* Main Tab Buttons */}
                <div style={styles.mainTabsContainer}>
                    {(['tasks', 'approvals', 'history'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveMainTab(tab)}
                            style={{
                                ...styles.mainTabButton,
                                ...(activeMainTab === tab ? styles.mainTabButtonActive : {}),
                            }}
                        >
                            {tab === 'tasks' && 'Tasks'}
                            {tab === 'approvals' && 'Pending Approval'}
                            {tab === 'history' && 'Execution Log'}
                            {tab === 'approvals' && pendingApprovals.length > 0 && (
                                <span style={styles.badgeCount}>{pendingApprovals.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Stats Row */}
                <div style={styles.statsRow}>
                    <StatCard
                        icon={<CalendarCheck size={20} />}
                        label="Total Tasks"
                        value={stats.total}
                        color={THEME.primary}
                    />
                    <StatCard
                        icon={<CheckCircle size={20} />}
                        label="Completed"
                        value={stats.done}
                        color={THEME.success}
                    />
                    <StatCard
                        icon={<Clock size={20} />}
                        label="Pending"
                        value={stats.pending}
                        color={THEME.warning}
                    />
                    <StatCard
                        icon={<TrendingUp size={20} />}
                        label="Completion %"
                        value={stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}
                        color={THEME.secondary}
                        suffix="%"
                    />
                </div>
            </div>

            {/* Controls Row */}
            <div style={styles.controlsRow}>
                <div style={styles.filterTabs}>
                    {['All', 'Daily', 'Weekly', 'Monthly', 'Completed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            style={{
                                ...styles.filterTab,
                                ...(filter === tab ? styles.filterTabActive : {}),
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />

                <button
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        if (!showAddForm) resetForm();
                    }}
                    style={styles.addButton}
                >
                    <Plus size={18} />
                    Add Task
                </button>

                <button
                    onClick={handleReset}
                    style={styles.resetButton}
                    title="Reset to defaults"
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            {/* Content based on active tab */}
            {activeMainTab === 'tasks' && (
                <>
                    {/* Add Task Form */}
                    {showAddForm && (
                        <div style={styles.formContainer}>
                            <h3 style={styles.formTitle}>New Task</h3>
                            <div style={styles.formGrid}>
                                <input
                                    type="text"
                                    placeholder="Task title (required)"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    style={styles.formInput}
                                />
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    style={styles.formSelect}
                                >
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                    <option>Ad-hoc</option>
                                </select>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                    style={styles.formSelect}
                                >
                                    <option value="low">Priority: Low</option>
                                    <option value="medium">Priority: Medium</option>
                                    <option value="high">Priority: High</option>
                                    <option value="critical">Priority: Critical</option>
                                </select>
                                <select
                                    value={formData.recurrence}
                                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as any })}
                                    style={styles.formSelect}
                                >
                                    <option value="once">Once</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Assignee (optional)"
                                    value={formData.assignee}
                                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                                    style={styles.formInput}
                                />
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    style={styles.formInput}
                                />
                                <textarea
                                    placeholder="Notes (optional)"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    style={{ ...styles.formInput, gridColumn: '1 / -1', minHeight: 80 }}
                                />
                            </div>

                            <div style={styles.formActions}>
                                <button onClick={handleAddTask} style={styles.saveButton}>
                                    Save Task
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        resetForm();
                                    }}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tasks List */}
                    {loading ? (
                        <div style={styles.loadingState}>Loading tasks...</div>
                    ) : error ? (
                        <div style={styles.errorState}>
                            <AlertCircle size={20} color={THEME.danger} />
                            {error}
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div style={styles.emptyState}>
                            No tasks found. {search && 'Try adjusting your search.'}
                        </div>
                    ) : (
                        <div>
                            {Object.entries(grouped).map(([category, categoryTasks]) =>
                                categoryTasks.length > 0 ? (
                                    <div key={category}>
                                        <div style={{
                                            padding: '12px 16px',
                                            borderLeft: `3px solid ${getCategoryColor(category)}`,
                                            backgroundColor: THEME.surfaceHover,
                                            marginBottom: 12,
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: THEME.textMain,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}>
                                            <span>{category}</span>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                backgroundColor: THEME.grid,
                                                color: THEME.textMuted,
                                                fontSize: 10,
                                            }}>
                                                {categoryTasks.length}
                                            </span>
                                        </div>

                                        {categoryTasks.map(task => (
                                            <TaskRow
                                                key={task.id}
                                                task={task}
                                                isEditing={editingId === task.id}
                                                onToggleDone={() =>
                                                    handleUpdateTask(task.id, { done: !task.done })
                                                }
                                                onEdit={() => setEditingId(task.id)}
                                                onDelete={() => handleDeleteTask(task.id)}
                                                onUpdate={(updates) => {
                                                    handleUpdateTask(task.id, updates);
                                                    setEditingId(null);
                                                }}
                                                onCancelEdit={() => setEditingId(null)}
                                                isOverdue={isOverdue(task.dueDate)}
                                                getPriorityColor={getPriorityColor}
                                                expandedNotes={expandedNotes}
                                                setExpandedNotes={setExpandedNotes}
                                                requiresApproval={requiresApproval(task.priority)}
                                                onRequestApproval={() => handleTaskRequestApproval(task.id)}
                                            />
                                        ))}
                                    </div>
                                ) : null
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Pending Approvals Tab */}
            {activeMainTab === 'approvals' && (
                <div style={styles.panelContainer}>
                    <h2 style={styles.panelTitle}>Tasks Pending Approval</h2>
                    {pendingApprovals.length === 0 ? (
                        <div style={styles.emptyPanelState}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                            <div>No tasks pending approval</div>
                        </div>
                    ) : (
                        <div style={styles.approvalsList}>
                            {tasks
                                .filter(task => pendingApprovals.includes(task.id) && requiresApproval(task.priority))
                                .map(task => (
                                    <div key={task.id} style={styles.approvalCard}>
                                        <div style={styles.approvalRiskBanner}>
                                            <span>⚠️ This is a high-risk task. Review before approving.</span>
                                        </div>
                                        <div style={styles.approvalContent}>
                                            <div style={styles.approvalHeader}>
                                                <div>
                                                    <div style={styles.approvalTaskTitle}>{task.title}</div>
                                                    <div style={styles.approvalTaskMeta}>
                                                        <span style={styles.approvalCategory}>{task.category}</span>
                                                        <span
                                                            style={{
                                                                ...styles.approvalPriorityBadge,
                                                                backgroundColor: THEME.danger,
                                                                color: '#fff',
                                                            }}
                                                        >
                                                            {task.priority.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={styles.approvalActions}>
                                                <button
                                                    onClick={() => handleApproveTask(task.id)}
                                                    style={styles.approveButton}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectTask(task.id)}
                                                    style={styles.rejectButton}
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Execution Log Tab */}
            {activeMainTab === 'history' && (
                <div style={styles.panelContainer}>
                    <h2 style={styles.panelTitle}>Task Execution History</h2>
                    {execHistory.length === 0 ? (
                        <div style={styles.emptyPanelState}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                            <div>No execution history yet. Run a task to see history here.</div>
                        </div>
                    ) : (
                        <div style={styles.historyTable}>
                            <div style={styles.historyHeader}>
                                <div>Task Name</div>
                                <div>Start Time</div>
                                <div>Duration</div>
                                <div>Status</div>
                            </div>
                            {execHistory.map(entry => (
                                <div key={entry.id} style={styles.historyRow}>
                                    <div>{entry.taskTitle}</div>
                                    <div>{entry.startTime}</div>
                                    <div>{entry.duration}</div>
                                    <div>
                                        <span
                                            style={{
                                                ...styles.statusBadge,
                                                backgroundColor:
                                                    entry.status === 'Success'
                                                        ? `${THEME.success}30`
                                                        : entry.status === 'Failed'
                                                            ? `${THEME.danger}30`
                                                            : `${THEME.warning}30`,
                                                color:
                                                    entry.status === 'Success'
                                                        ? THEME.success
                                                        : entry.status === 'Failed'
                                                            ? THEME.danger
                                                            : THEME.warning,
                                            }}
                                        >
                                            {entry.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DBATaskSchedulerTab;
