import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { fetchData } from '../../utils/api';
import { theme } from '../../utils/theme';

const DBATaskSchedulerTab = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Daily',
    priority: 'medium',
    recurrence: 'daily',
    assignee: '',
    dueDate: '',
    notes: '',
  });

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchData('/api/tasks');
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('vigil_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

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
    } catch (err) {
      alert('Error creating task: ' + err.message);
      console.error(err);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      await loadTasks();
      setEditingId(null);
    } catch (err) {
      alert('Error updating task: ' + err.message);
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      await loadTasks();
    } catch (err) {
      alert('Error deleting task: ' + err.message);
      console.error(err);
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
    } catch (err) {
      alert('Error resetting tasks: ' + err.message);
      console.error(err);
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

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filter by recurrence/category
    if (filter === 'Daily') filtered = filtered.filter(t => t.recurrence === 'daily');
    else if (filter === 'Weekly') filtered = filtered.filter(t => t.recurrence === 'weekly');
    else if (filter === 'Monthly') filtered = filtered.filter(t => t.recurrence === 'monthly');
    else if (filter === 'Completed') filtered = filtered.filter(t => t.done);

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.assignee?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  const groupTasksByCategory = (taskList) => {
    const groups = {
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

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !dueDate.endsWith('2099');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.danger;
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return theme.textMuted;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Daily': return theme.primary;
      case 'Weekly': return theme.secondary;
      case 'Monthly': return theme.ai;
      default: return theme.textMuted;
    }
  };

  const filteredTasks = getFilteredTasks();
  const grouped = groupTasksByCategory(filteredTasks);
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.done).length,
    pending: tasks.filter(t => !t.done).length,
  };

  return (
    <div style={styles.container}>
      <Styles />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.titleSection}>
            <CalendarCheck size={28} color={theme.primary} />
            <h1 style={styles.title}>DBA Task Scheduler</h1>
          </div>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <StatCard
            icon={<CalendarCheck size={20} />}
            label="Total Tasks"
            value={stats.total}
            color={theme.primary}
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            label="Completed"
            value={stats.done}
            color={theme.success}
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Pending"
            value={stats.pending}
            color={theme.warning}
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Completion %"
            value={stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}
            color={theme.secondary}
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
          <Plus size={18} style={{ marginRight: 6 }} />
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
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={styles.formSelect}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Ad-hoc</option>
            </select>

            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              style={styles.formSelect}
            >
              <option value="low">Priority: Low</option>
              <option value="medium">Priority: Medium</option>
              <option value="high">Priority: High</option>
            </select>

            <select
              value={formData.recurrence}
              onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
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
          <AlertCircle size={20} color={theme.danger} />
          {error}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={styles.emptyState}>
          No tasks found. {search && 'Try adjusting your search.'}
        </div>
      ) : (
        <div style={styles.tasksList}>
          {Object.entries(grouped).map(([category, categoryTasks]) =>
            categoryTasks.length > 0 ? (
              <div key={category} style={styles.categoryGroup}>
                <div
                  style={{
                    ...styles.categoryHeader,
                    borderLeftColor: getCategoryColor(category),
                  }}
                >
                  <span style={styles.categoryName}>{category}</span>
                  <span style={styles.categoryCount}>{categoryTasks.length}</span>
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
                  />
                ))}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, suffix = '' }) => {
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

const TaskRow = ({
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
}) => {
  const [editForm, setEditForm] = useState(task);

  const handleSaveEdit = () => {
    onUpdate(editForm);
  };

  if (isEditing) {
    return (
      <div style={styles.taskRowEdit}>
        <div style={styles.editFormInline}>
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            style={styles.editInput}
            placeholder="Task title"
          />
          <select
            value={editForm.priority}
            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
            style={styles.editSelect}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="text"
            value={editForm.assignee || ''}
            onChange={(e) => setEditForm({ ...editForm, assignee: e.target.value })}
            style={styles.editInput}
            placeholder="Assignee"
          />
          <input
            type="date"
            value={editForm.dueDate || ''}
            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
            style={styles.editInput}
          />
          <textarea
            value={editForm.notes || ''}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            style={{ ...styles.editInput, minHeight: 60 }}
            placeholder="Notes"
          />
          <div style={styles.editActions}>
            <button onClick={handleSaveEdit} style={styles.editSaveBtn}>
              Save
            </button>
            <button onClick={onCancelEdit} style={styles.editCancelBtn}>
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
          <div
            style={{
              ...styles.taskTitle,
              textDecoration: task.done ? 'line-through' : 'none',
              opacity: task.done ? 0.6 : 1,
            }}
          >
            {task.title}
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
                  color: isOverdue ? theme.danger : theme.textMuted,
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

const Styles = () => (
  <style>{`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .task-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
  `}</style>
);

const styles = {
  container: {
    padding: '24px',
    backgroundColor: theme.bg,
    color: theme.textMain,
    fontFamily: theme.fontBody,
    minHeight: '100vh',
  },

  header: {
    marginBottom: 32,
  },

  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    color: theme.textMain,
    fontFamily: theme.fontDisplay,
    letterSpacing: '-0.5px',
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },

  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: theme.surface,
    border: `1px solid ${theme.glassBorder}`,
    borderRadius: 8,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
    cursor: 'default',
  },

  statIcon: {
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statContent: {
    flex: 1,
  },

  statLabel: {
    fontSize: 12,
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 4,
    fontWeight: 500,
  },

  statValue: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: theme.fontMono,
  },

  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    flexWrap: 'wrap',
  },

  filterTabs: {
    display: 'flex',
    gap: 8,
    flex: 1,
    minWidth: 200,
  },

  filterTab: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: `1px solid ${theme.glassBorder}`,
    color: theme.textMuted,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    fontFamily: theme.fontBody,
  },

  filterTabActive: {
    backgroundColor: theme.surface,
    color: theme.primary,
    borderColor: theme.primary,
    boxShadow: `0 0 12px ${theme.primary}40`,
  },

  searchInput: {
    padding: '8px 12px',
    backgroundColor: theme.surface,
    border: `1px solid ${theme.glassBorder}`,
    color: theme.textMain,
    borderRadius: 6,
    fontSize: 13,
    minWidth: 180,
    transition: 'all 0.2s ease',
    fontFamily: theme.fontBody,
  },

  addButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: theme.primary,
    border: 'none',
    color: theme.bg,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    fontFamily: theme.fontBody,
  },

  resetButton: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: `1px solid ${theme.textMuted}40`,
    color: theme.textMuted,
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    fontFamily: theme.fontBody,
  },

  formContainer: {
    padding: 20,
    backgroundColor: theme.surface,
    border: `1px solid ${theme.glassBorder}`,
    borderRadius: 8,
    marginBottom: 32,
    backdropFilter: 'blur(10px)',
    animation: 'slideIn 0.3s ease-out',
  },

  formTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.textMain,
    margin: '0 0 16px 0',
    fontFamily: theme.fontDisplay,
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 12,
    marginBottom: 16,
  },

  formInput: {
    padding: '8px 12px',
    backgroundColor: theme.surfaceHover,
    border: `1px solid ${theme.glassBorder}`,
    color: theme.textMain,
    borderRadius: 6,
    fontSize: 13,
    fontFamily: theme.fontBody,
    transition: 'all 0.2s ease',
  },

  formSelect: {
    padding: '8px 12px',
    backgroundColor: theme.surfaceHover,
    border: `1px solid ${theme.glassBorder}`,
    color: theme.textMain,
    borderRadius: 6,
    fontSize: 13,
    fontFamily: theme.fontBody,
    transition: 'all 0.2s ease',
  },

  formActions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
  },

  saveButton: {
    padding: '8px 20px',
    backgroundColor: theme.primary,
    border: 'none',
    color: theme.bg,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    fontFamily: theme.fontBody,
  },

  cancelButton: {
    padding: '8px 20px',
    backgroundColor: 'transparent',
    border: `1px solid ${theme.textMuted}40`,
    color: theme.textMuted,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    fontFamily: theme.fontBody,
  },

  loadingState: {
    textAlign: 'center',
    padding: 40,
    color: theme.textMuted,
    fontSize: 14,
  },

  errorState: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: `${theme.danger}20`,
    border: `1px solid ${theme.danger}40`,
    color: theme.danger,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },

  emptyState: {
    textAlign: 'center',
    padding: 60,
    color: theme.textMuted,
    fontSize: 14,
  },

  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },

  categoryGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },

  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    backgroundColor: theme.surfaceHover,
    borderRadius: 6,
    borderLeft: '4px solid',
    marginBottom: 8,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.textMain,
    flex: 1,
  },

  categoryCount: {
    fontSize: 12,
    color: theme.textMuted,
    backgroundColor: theme.surface,
    padding: '2px 8px',
    borderRadius: 4,
    fontWeight: 500,
    fontFamily: theme.fontMono,
  },

  taskRow: {
    display: 'flex',
    flexDirection: 'column',
    padding: 12,
    backgroundColor: theme.surface,
    border: `1px solid ${theme.glassBorder}`,
    borderRadius: 6,
    transition: 'all 0.2s ease',
  },

  taskMainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },

  taskCheckbox: {
    width: 18,
    height: 18,
    cursor: 'pointer',
    accentColor: theme.primary,
  },

  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },

  taskContent: {
    flex: 1,
    minWidth: 0,
  },

  taskTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: theme.textMain,
    marginBottom: 4,
    wordBreak: 'break-word',
  },

  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },

  recurrenceBadge: {
    display: 'inline-block',
    fontSize: 11,
    backgroundColor: `${theme.primary}20`,
    color: theme.primary,
    padding: '2px 8px',
    borderRadius: 3,
    fontWeight: 500,
    textTransform: 'capitalize',
  },

  assigneeBadge: {
    display: 'inline-block',
    fontSize: 11,
    backgroundColor: `${theme.secondary}20`,
    color: theme.secondary,
    padding: '2px 8px',
    borderRadius: 3,
    fontWeight: 500,
  },

  dueDateBadge: {
    display: 'inline-block',
    fontSize: 11,
    backgroundColor: `${theme.textMuted}10`,
    padding: '2px 8px',
    borderRadius: 3,
    fontWeight: 500,
  },

  notesButton: {
    padding: 6,
    backgroundColor: 'transparent',
    border: `1px solid ${theme.glassBorder}`,
    color: theme.textMuted,
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  editButton: {
    padding: 6,
    backgroundColor: 'transparent',
    border: `1px solid ${theme.glassBorder}`,
    color: theme.textMuted,
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  deleteButton: {
    padding: 6,
    backgroundColor: 'transparent',
    border: `1px solid ${theme.glassBorder}`,
    color: theme.danger,
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  notesExpandedContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: `1px solid ${theme.glassBorder}`,
  },

  notesExpanded: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 1.6,
    padding: '8px',
    backgroundColor: theme.surfaceHover,
    borderRadius: 4,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },

  taskRowEdit: {
    padding: 12,
    backgroundColor: theme.surface,
    border: `2px solid ${theme.primary}`,
    borderRadius: 6,
  },

  editFormInline: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 10,
  },

  editInput: {
    padding: '8px 10px',
    backgroundColor: theme.surfaceHover,
    border: `1px solid ${theme.glassBorder}`,
    color: theme.textMain,
    borderRadius: 4,
    fontSize: 12,
    fontFamily: theme.fontBody,
  },

  editSelect: {
    padding: '8px 10px',
    backgroundColor: theme.surfaceHover,
    border: `1px solid ${theme.glassBorder}`,
    color: theme.textMain,
    borderRadius: 4,
    fontSize: 12,
    fontFamily: theme.fontBody,
  },

  editActions: {
    display: 'flex',
    gap: 8,
    gridColumn: '1 / -1',
    justifyContent: 'flex-end',
    marginTop: 8,
  },

  editSaveBtn: {
    padding: '6px 14px',
    backgroundColor: theme.success,
    border: 'none',
    color: theme.bg,
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    fontFamily: theme.fontBody,
  },

  editCancelBtn: {
    padding: '6px 14px',
    backgroundColor: 'transparent',
    border: `1px solid ${theme.textMuted}40`,
    color: theme.textMuted,
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    fontFamily: theme.fontBody,
  },
};

export default DBATaskSchedulerTab;
