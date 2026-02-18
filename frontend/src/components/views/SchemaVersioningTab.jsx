import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { THEME } from '../../utils/theme.jsx';
import {
    GitBranch, GitCommit, GitPullRequest, History, ArrowLeftRight,
    AlertTriangle, CheckCircle, XCircle, FileCode, Database, Layers,
    Clock, ShieldAlert, Network, Play, ChevronRight, ChevronDown,
    RefreshCw, FileText, Zap, Lock, Search, Filter, ArrowRight,
    Calendar, User, Tag, GitMerge, Copy, Download, Upload,
    Trash2, Edit, Eye, Code, Terminal, PauseCircle, PlayCircle,
    SkipForward, Rewind, Settings, Info, ExternalLink, Star, StarOff
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    CartesianGrid, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM HOOKS
   ═══════════════════════════════════════════════════════════════════════════ */
const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error('useLocalStorage error:', error);
        }
    }, [key, storedValue]);
    return [storedValue, setValue];
};

// FIX 1: useWebSocket — useEffect depends on onMessage but an inline arrow fn creates
// a new reference on every render, triggering an infinite re-run loop.
// Stable ref pattern breaks the dependency cycle without removing the callback.
const useWebSocket = (_url, onMessage) => {
    const [isConnected, setIsConnected] = useState(false);
    const onMessageRef = useRef(onMessage);
    useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

    useEffect(() => {
        // Simulated WebSocket for real-time migration updates
        const interval = setInterval(() => {
            onMessageRef.current?.({ type: 'heartbeat', timestamp: Date.now() });
        }, 5000);
        setIsConnected(true);
        return () => { clearInterval(interval); setIsConnected(false); };
    }, []); // stable — no longer depends on the callback ref

    return { isConnected };
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const SchemaStyles = () => (
    <style>{`
        @keyframes slideIn { from { transform: translateX(-10px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .schema-card {
            background: ${THEME.surface};
            border: 1px solid ${THEME.border};
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: slideIn 0.3s ease-out;
        }
        .schema-card:hover {
            border-color: ${THEME.primary}50;
            box-shadow: 0 4px 12px ${THEME.primary}15;
        }
        .diff-added {
            background: ${THEME.success}15; color: ${THEME.success};
            padding: 2px 6px; border-radius: 4px; font-weight: 600;
        }
        .diff-removed {
            background: ${THEME.danger}15; color: ${THEME.danger};
            text-decoration: line-through; padding: 2px 6px; border-radius: 4px; opacity: 0.7;
        }
        .diff-changed {
            background: ${THEME.warning}15; color: ${THEME.warning};
            padding: 2px 6px; border-radius: 4px; font-weight: 600;
        }
        .timeline-node { position: relative; padding-left: 32px; margin-bottom: 20px; }
        .timeline-node::before {
            content: ''; position: absolute; left: 7px; top: 28px; bottom: -20px;
            width: 2px; background: linear-gradient(180deg, ${THEME.grid}80, ${THEME.grid}20);
        }
        .timeline-node:last-child::before { display: none; }
        .timeline-dot {
            width: 16px; height: 16px; border-radius: 50%;
            position: absolute; left: 0; top: 20px; z-index: 2;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
        }
        .timeline-dot:hover { transform: scale(1.3); }

        /* FIX 6: dep-node hover — CSS transform on SVG <g> is unreliable in Firefox/Safari.
           Scale is now handled inline via SVG transform attribute (see DependencyGraph). */
        .dep-node { cursor: pointer; }

        .drift-badge {
            font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 6px;
            text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.2s;
        }
        .drift-badge:hover { transform: translateY(-1px); }
        .migration-card {
            position: relative; display: flex; gap: 14px; padding: 16px;
            border-radius: 10px; background: ${THEME.surface};
            border: 1px solid ${THEME.border}; transition: all 0.3s ease; cursor: pointer;
        }
        .migration-card:hover {
            background: ${THEME.surfaceHigh}; border-color: ${THEME.primary}40;
            transform: translateY(-2px); box-shadow: 0 4px 12px ${THEME.primary}10;
        }
        .migration-card.is-hovered { border-color: ${THEME.primary}60; }
        .code-block {
            background: ${THEME.bg}; border: 1px solid ${THEME.border}; border-radius: 8px;
            padding: 16px; font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 12px; line-height: 1.6; color: ${THEME.textMain};
            overflow-x: auto; position: relative;
        }
        .code-block::before {
            content: 'SQL'; position: absolute; top: 8px; right: 8px; font-size: 9px;
            color: ${THEME.textDim}; background: ${THEME.surface}; padding: 2px 6px;
            border-radius: 3px; border: 1px solid ${THEME.border};
        }
        .syntax-keyword { color: #C678DD; font-weight: 600; }
        .syntax-type { color: #E5C07B; }
        .syntax-string { color: #98C379; }
        .syntax-table { color: #61AFEF; }
        .syntax-comment { color: ${THEME.textDim}; font-style: italic; }
        .filter-chip {
            display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
            border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer;
            transition: all 0.2s; border: 1px solid ${THEME.border}; background: ${THEME.surface};
        }
        .filter-chip:hover { border-color: ${THEME.primary}; background: ${THEME.primary}10; }
        .filter-chip.active { background: ${THEME.primary}; color: white; border-color: ${THEME.primary}; }
        .stat-card {
            background: linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.surfaceHigh} 100%);
            border: 1px solid ${THEME.border}; border-radius: 10px; padding: 16px; transition: all 0.3s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
        .search-input {
            width: 100%; padding: 10px 12px 10px 36px; border: 1px solid ${THEME.border};
            border-radius: 8px; background: ${THEME.surface}; color: ${THEME.textMain};
            font-size: 13px; transition: all 0.2s;
        }
        .search-input:focus { outline: none; border-color: ${THEME.primary}; box-shadow: 0 0 0 3px ${THEME.primary}10; }
        .skeleton {
            background: linear-gradient(90deg, ${THEME.surface} 0%, ${THEME.surfaceHigh} 50%, ${THEME.surface} 100%);
            background-size: 1000px 100%; animation: shimmer 2s infinite; border-radius: 4px;
        }
        .badge-online {
            width: 8px; height: 8px; background: ${THEME.success}; border-radius: 50%;
            display: inline-block; animation: pulse 2s infinite;
        }
        .expandable-content { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .expandable-content.expanded { max-height: 2000px; }
        .btn-primary {
            background: ${THEME.primary}; color: white; border: none; padding: 10px 18px;
            border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;
            transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { background: ${THEME.primary}dd; transform: translateY(-1px); box-shadow: 0 4px 12px ${THEME.primary}40; }
        .btn-primary:active { transform: translateY(0); }
        .btn-secondary {
            background: transparent; color: ${THEME.textDim}; border: 1px solid ${THEME.border};
            padding: 8px 14px; border-radius: 6px; font-weight: 600; font-size: 12px;
            cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-secondary:hover { border-color: ${THEME.primary}; color: ${THEME.primary}; background: ${THEME.primary}05; }
        .modal-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
            z-index: 999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s;
        }
        .modal-content {
            background: ${THEME.surface}; border-radius: 12px; max-width: 800px; width: 90%;
            max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .progress-bar { width: 100%; height: 6px; background: ${THEME.bg}; border-radius: 3px; overflow: hidden; position: relative; }
        .progress-fill {
            height: 100%; background: linear-gradient(90deg, ${THEME.primary}, ${THEME.success});
            transition: width 0.3s ease; position: relative; overflow: hidden;
        }
        .progress-fill::after {
            content: ''; position: absolute; inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 1.5s infinite;
        }
        .fav-btn {
            background: transparent; border: none; cursor: pointer;
            padding: 4px; border-radius: 4px; transition: all 0.2s;
            display: inline-flex; align-items: center;
        }
        .fav-btn:hover { transform: scale(1.2); }
        .tab-btn {
            display: flex; align-items: center; gap: 8px;
            padding: 10px 16px; cursor: pointer; font-size: 13px; font-weight: 700;
            border: none; border-bottom: 2px solid transparent;
            transition: all 0.2s; margin-bottom: -2px;
        }
        .tab-btn:hover { color: ${THEME.primary}; }
        .tab-btn.active {
            background: ${THEME.primary}10; color: ${THEME.primary};
            border-bottom-color: ${THEME.primary};
        }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const MIGRATIONS = [
    {
        id: 'm20260218_001', version: '1.5.2', name: 'add_user_preferences',
        author: 'alice_dev', status: 'applied', applied_at: '2026-02-18 10:30',
        duration: '45ms', type: 'safe', rollback_available: true,
        changes: [
            { type: 'create_table', target: 'user_preferences', fields: 5 },
            { type: 'create_index', target: 'idx_user_prefs_user_id' }
        ],
        dependencies: [], tags: ['feature', 'non-breaking']
    },
    {
        id: 'm20260217_005', version: '1.5.1', name: 'optimize_orders_query',
        author: 'bob_dba', status: 'applied', applied_at: '2026-02-17 16:20',
        duration: '12.5s', type: 'locking', rollback_available: true,
        changes: [{ type: 'create_index', target: 'idx_orders_customer_date', concurrent: true }],
        dependencies: ['m20260210_001'], tags: ['performance', 'index']
    },
    {
        id: 'm20260215_003', version: '1.5.0', name: 'create_audit_system',
        author: 'system', status: 'applied', applied_at: '2026-02-15 09:00',
        duration: '230ms', type: 'safe', rollback_available: true,
        changes: [
            { type: 'create_table', target: 'audit_log', fields: 8 },
            { type: 'create_trigger', target: 'trg_audit_users' }
        ],
        dependencies: [], tags: ['audit', 'compliance']
    },
    {
        id: 'm20260210_001', version: '1.4.9', name: 'alter_invoice_precision',
        author: 'charlie_dev', status: 'rolled_back', applied_at: '2026-02-10 14:15',
        duration: '5.2s', type: 'breaking', rollback_available: false,
        changes: [{ type: 'alter_column', target: 'invoices.total', from: 'decimal(10,2)', to: 'decimal(12,4)' }],
        dependencies: [], tags: ['data-type', 'breaking']
    },
    {
        id: 'm20260208_002', version: '1.4.8', name: 'add_soft_deletes',
        author: 'alice_dev', status: 'applied', applied_at: '2026-02-08 11:45',
        duration: '890ms', type: 'safe', rollback_available: true,
        changes: [
            { type: 'add_column', target: 'users.deleted_at', datatype: 'timestamptz' },
            { type: 'add_column', target: 'orders.deleted_at', datatype: 'timestamptz' }
        ],
        dependencies: [], tags: ['feature', 'soft-delete']
    }
];

const PENDING_MIGRATIONS = [
    {
        id: 'm20260219_001', version: '1.6.0', name: 'drop_legacy_columns',
        author: 'alice_dev', risk: 'high', type: 'destructive',
        estimated_time: '2m 15s', size_impact: '+0 MB',
        sql: `-- Drop deprecated authentication columns
ALTER TABLE users
  DROP COLUMN legacy_auth_token,
  DROP COLUMN old_password_hash;`,
        issues: [
            { severity: 'critical', message: 'Column removal is a breaking change', code: 'BREAKING_CHANGE' },
            { severity: 'warning', message: 'Requires exclusive lock on "users" table', code: 'LOCK_REQUIRED' },
            { severity: 'info', message: 'Backup recommended before execution', code: 'BACKUP_SUGGESTED' }
        ],
        affected_tables: ['users'], affected_rows: 125430,
        tags: ['cleanup', 'breaking'], dependencies: [],
        pre_checks: [
            { name: 'Verify no active sessions', status: 'pending' },
            { name: 'Check application compatibility', status: 'pending' },
            { name: 'Backup verification', status: 'pending' }
        ]
    },
    {
        id: 'm20260219_002', version: '1.6.1', name: 'add_payment_methods',
        author: 'dave_backend', risk: 'low', type: 'safe',
        estimated_time: '180ms', size_impact: '+2.5 MB',
        sql: `-- Create payment methods table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  method_type VARCHAR(50) NOT NULL,
  provider VARCHAR(100),
  token_hash TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = TRUE;`,
        issues: [],
        affected_tables: ['payment_methods'], affected_rows: 0,
        tags: ['feature', 'payments'], dependencies: [],
        pre_checks: [
            { name: 'Schema validation', status: 'passed' },
            { name: 'Naming convention check', status: 'passed' }
        ]
    },
    {
        id: 'm20260219_003', version: '1.6.2', name: 'partition_analytics_data',
        author: 'bob_dba', risk: 'medium', type: 'maintenance',
        estimated_time: '8m 30s', size_impact: '+0 MB (reorganization)',
        sql: `-- Convert analytics_events to partitioned table
ALTER TABLE analytics_events RENAME TO analytics_events_old;

CREATE TABLE analytics_events (
  id BIGSERIAL,
  event_type VARCHAR(100) NOT NULL,
  user_id UUID,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE analytics_events_2026_02 PARTITION OF analytics_events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

INSERT INTO analytics_events SELECT * FROM analytics_events_old;
DROP TABLE analytics_events_old;`,
        issues: [
            { severity: 'warning', message: 'Long-running operation may impact performance', code: 'PERF_IMPACT' },
            { severity: 'warning', message: 'Exclusive lock required during final swap', code: 'LOCK_REQUIRED' }
        ],
        affected_tables: ['analytics_events'], affected_rows: 2450000,
        tags: ['performance', 'partitioning'], dependencies: [],
        pre_checks: [
            { name: 'Disk space check (50GB required)', status: 'pending' },
            { name: 'Verify partition strategy', status: 'passed' }
        ]
    }
];

const SCHEMA_DIFF = [
    {
        schema: 'public', table: 'users', type: 'modified',
        changes: [
            { field: 'phone_number', status: 'added', type: 'varchar(20)', nullable: true, default: null },
            { field: 'last_login', status: 'changed', from: 'timestamp', to: 'timestamptz', nullable: false, default: 'NOW()' },
            { field: 'legacy_auth_token', status: 'pending_removal', type: 'text', nullable: true, default: null }
        ],
        indexes: [
            { name: 'idx_users_phone', status: 'added', columns: ['phone_number'], type: 'btree', unique: false }
        ],
        constraints: [
            { name: 'chk_phone_format', status: 'added', type: 'check', definition: "phone_number ~ '^\\+[0-9]{10,15}$'" }
        ]
    },
    {
        schema: 'public', table: 'temp_cache', type: 'removed',
        changes: [], reason: 'Deprecated in favor of Redis caching layer'
    },
    {
        schema: 'public', table: 'api_keys', type: 'added',
        changes: [
            { field: 'id', status: 'added', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
            { field: 'user_id', status: 'added', type: 'uuid', nullable: false, default: null },
            { field: 'key_hash', status: 'added', type: 'text', nullable: false, default: null },
            { field: 'scopes', status: 'added', type: 'text[]', nullable: true, default: 'ARRAY[]::text[]' },
            { field: 'expires_at', status: 'added', type: 'timestamptz', nullable: true, default: null },
            { field: 'created_at', status: 'added', type: 'timestamptz', nullable: false, default: 'NOW()' }
        ],
        indexes: [
            { name: 'pk_api_keys', status: 'added', columns: ['id'], type: 'btree', unique: true, primary: true },
            { name: 'idx_api_keys_user', status: 'added', columns: ['user_id'], type: 'btree', unique: false }
        ],
        constraints: [
            { name: 'fk_api_keys_user', status: 'added', type: 'foreign_key', definition: 'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE' }
        ]
    },
    {
        schema: 'public', table: 'orders', type: 'modified',
        changes: [
            { field: 'shipping_address_id', status: 'added', type: 'uuid', nullable: true, default: null }
        ],
        indexes: [
            { name: 'idx_orders_shipping', status: 'added', columns: ['shipping_address_id'], type: 'btree', unique: false }
        ],
        constraints: []
    }
];

const MIGRATION_STATS = [
    { month: 'Oct', successful: 12, failed: 1, rolled_back: 0 },
    { month: 'Nov', successful: 15, failed: 0, rolled_back: 1 },
    { month: 'Dec', successful: 18, failed: 2, rolled_back: 0 },
    { month: 'Jan', successful: 14, failed: 0, rolled_back: 0 },
    { month: 'Feb', successful: 8, failed: 0, rolled_back: 0 }
];

const DEPENDENCY_DATA = {
    nodes: [
        { id: 'users', type: 'table', level: 0, connections: 4 },
        { id: 'orders', type: 'table', level: 1, connections: 3 },
        { id: 'order_items', type: 'table', level: 2, connections: 2 },
        { id: 'products', type: 'table', level: 1, connections: 2 },
        { id: 'user_preferences', type: 'table', level: 1, connections: 1 },
        { id: 'api_keys', type: 'table', level: 1, connections: 1 },
        { id: 'view_user_stats', type: 'view', level: 2, connections: 1 },
        { id: 'view_order_summary', type: 'view', level: 3, connections: 0 },
        { id: 'func_auth_check', type: 'function', level: 2, connections: 0 }
    ],
    edges: [
        { from: 'users', to: 'orders', type: 'fk' },
        { from: 'users', to: 'user_preferences', type: 'fk' },
        { from: 'users', to: 'api_keys', type: 'fk' },
        { from: 'users', to: 'view_user_stats', type: 'depends' },
        { from: 'orders', to: 'order_items', type: 'fk' },
        { from: 'orders', to: 'view_order_summary', type: 'depends' },
        { from: 'products', to: 'order_items', type: 'fk' },
        { from: 'users', to: 'func_auth_check', type: 'depends' }
    ]
};

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */
const getSeverityColor = (severity) => {
    const colors = { critical: THEME.danger, warning: THEME.warning, info: THEME.info || THEME.primary };
    return colors[severity] || THEME.textDim;
};

// FIX 7: getNodeColor was duplicated — defined at module level AND inside DependencyGraph.
// Keeping only the module-level definition; the inner duplicate has been removed.
const getNodeColor = (type) => {
    const colors = { table: THEME.primary, view: THEME.success, function: THEME.warning };
    return colors[type] || THEME.textDim;
};

const highlightSQL = (sql) => {
    const keywords = /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|CASCADE|ON|DEFAULT|NOT|NULL|UNIQUE|CHECK|CONSTRAINT|PARTITION|BY|RANGE|FOR|VALUES|TO|AS|JSONB|TEXT|VARCHAR|UUID|BIGSERIAL|TIMESTAMPTZ|BOOLEAN|ARRAY)\b/gi;
    return sql
        .replace(keywords, '<span class="syntax-keyword">$1</span>')
        .replace(/('[^']*')/g, '<span class="syntax-string">$1</span>')
        .replace(/\b([a-z_]+\.[a-z_]+)\b/gi, '<span class="syntax-table">$1</span>')
        .replace(/(--[^\n]*)/g, '<span class="syntax-comment">$1</span>');
};

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const RiskBadge = ({ risk }) => {
    const config = {
        low: { color: THEME.success, label: 'SAFE', icon: CheckCircle },
        medium: { color: THEME.warning, label: 'CAUTION', icon: AlertTriangle },
        high: { color: THEME.danger, label: 'DESTRUCTIVE', icon: ShieldAlert }
    };
    const c = config[risk] || config.low;
    const Icon = c.icon;
    return (
        <span className="drift-badge" style={{ background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon size={10} />{c.label}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const config = {
        applied: { color: THEME.success, label: 'Applied', icon: CheckCircle },
        rolled_back: { color: THEME.danger, label: 'Rolled Back', icon: XCircle },
        pending: { color: THEME.warning, label: 'Pending', icon: Clock },
        running: { color: THEME.primary, label: 'Running', icon: PlayCircle }
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30` }}>
            <Icon size={10} />{c.label}
        </span>
    );
};

// FIX 2: isHovered was declared but the value was never used to drive any style/class.
// Now wired to migration-card className so hover state is actually reflected in the UI.
// FIX 3 (partial): selectedMigration / showModal are now wired into MigrationCard via
// the onSelect prop so they can be set from the parent SchemaVersioningTab.
const MigrationCard = ({ mig, pending = false, onExpand, expanded = false, isFavorite, onToggleFavorite, onSelect }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="timeline-node">
            <div
                className={`migration-card${isHovered ? ' is-hovered' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => onExpand?.(mig.id)}
            >
                {/* FIX: timeline-dot was left:-24px which was calculated from inside the flex child,
                    but .timeline-node has padding-left:32px so the dot's absolute parent is
                    .timeline-node. Corrected to left:0 which lands at the left edge of .timeline-node. */}
                <div
                    className="timeline-dot"
                    style={{
                        background: pending ? THEME.warning : THEME.success,
                        border: `3px solid ${pending ? THEME.warning : THEME.success}30`,
                        boxShadow: pending
                            ? `0 0 0 4px ${THEME.warning}10`
                            : `0 0 0 4px ${THEME.success}10`
                    }}
                />

                <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, fontFamily: 'monospace' }}>{mig.version}</span>
                                <span style={{ color: THEME.textDim }}>•</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain }}>{mig.name}</span>
                            </div>
                            <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: 'monospace' }}>{mig.id}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* Favorite button — wires up the previously unused favorites state */}
                            <button
                                className="fav-btn"
                                onClick={e => { e.stopPropagation(); onToggleFavorite?.(mig.id); }}
                                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                {isFavorite
                                    ? <Star size={14} color={THEME.warning} fill={THEME.warning} />
                                    : <StarOff size={14} color={THEME.textDim} />
                                }
                            </button>
                            {pending ? <RiskBadge risk={mig.risk} /> : <StatusBadge status={mig.status} />}
                            {expanded
                                ? <ChevronDown size={16} color={THEME.textDim} />
                                : <ChevronRight size={16} color={THEME.textDim} />
                            }
                        </div>
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, fontSize: 11, color: THEME.textDim, marginBottom: 8 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} />{mig.author}</span>
                        {mig.applied_at && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{mig.applied_at}</span>}
                        {mig.duration && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={11} color={THEME.warning} />{mig.duration}</span>}
                        {mig.estimated_time && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} color={THEME.warning} />~{mig.estimated_time}</span>}
                        {mig.size_impact && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Database size={11} />{mig.size_impact}</span>}
                    </div>

                    {/* Tags */}
                    {mig.tags?.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                            {mig.tags.map(tag => (
                                <span key={tag} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: THEME.bg, color: THEME.textDim, border: `1px solid ${THEME.border}`, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Expandable */}
                    <div className={`expandable-content ${expanded ? 'expanded' : ''}`}>
                        {mig.changes?.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>Changes:</div>
                                {mig.changes.map((change, idx) => (
                                    <div key={idx} style={{ fontSize: 11, color: THEME.textDim, marginLeft: 12, padding: '4px 8px', background: THEME.bg, borderRadius: 4, marginBottom: 4, fontFamily: 'monospace' }}>
                                        • {change.type}: <span style={{ color: THEME.textMain }}>{change.target}</span>
                                        {change.fields && ` (${change.fields} fields)`}
                                        {change.concurrent && <span style={{ color: THEME.success }}> [CONCURRENT]</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {mig.sql && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>SQL:</div>
                                <div
                                    className="code-block"
                                    dangerouslySetInnerHTML={{ __html: highlightSQL(mig.sql.slice(0, 300) + (mig.sql.length > 300 ? '...' : '')) }}
                                    style={{ maxHeight: 150, overflowY: 'auto' }}
                                />
                            </div>
                        )}

                        {pending && mig.issues?.length > 0 && (
                            <div style={{ padding: 12, borderRadius: 8, background: `${THEME.danger}08`, border: `1px solid ${THEME.danger}20`, marginBottom: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.danger, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ShieldAlert size={14} />Issues Detected ({mig.issues.length})
                                </div>
                                {mig.issues.map((issue, idx) => (
                                    <div key={idx} style={{ fontSize: 11, marginBottom: 6, paddingLeft: 20, position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: 0, top: 2, width: 12, height: 12, borderRadius: '50%', background: getSeverityColor(issue.severity), opacity: 0.3 }} />
                                        <div style={{ color: THEME.textMain, fontWeight: 600 }}>[{issue.severity.toUpperCase()}] {issue.code}</div>
                                        <div style={{ color: THEME.textDim, marginTop: 2 }}>{issue.message}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {pending && mig.pre_checks && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>Pre-flight Checks:</div>
                                {mig.pre_checks.map((check, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: THEME.bg, borderRadius: 4, marginBottom: 4, fontSize: 11 }}>
                                        <span style={{ color: THEME.textDim }}>{check.name}</span>
                                        <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', background: check.status === 'passed' ? `${THEME.success}15` : `${THEME.warning}15`, color: check.status === 'passed' ? THEME.success : THEME.warning }}>{check.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            {pending ? (
                                <>
                                    <button className="btn-primary" style={{ flex: 1 }} onClick={e => e.stopPropagation()}>
                                        <Play size={14} />Execute Migration
                                    </button>
                                    <button className="btn-secondary" onClick={e => e.stopPropagation()}><Eye size={14} />Dry Run</button>
                                    <button
                                        className="btn-secondary"
                                        onClick={e => { e.stopPropagation(); onSelect?.(mig); }}
                                        title="View full details"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button className="btn-secondary" style={{ color: THEME.danger, borderColor: `${THEME.danger}40` }} onClick={e => e.stopPropagation()}>
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    {mig.rollback_available && (
                                        <button className="btn-secondary" onClick={e => e.stopPropagation()}><Rewind size={14} />Rollback</button>
                                    )}
                                    <button className="btn-secondary" onClick={e => { e.stopPropagation(); onSelect?.(mig); }}><Eye size={14} />Details</button>
                                    <button className="btn-secondary" onClick={e => e.stopPropagation()}><Download size={14} />Export</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// FIX 3 (implementation): Migration Detail Modal — previously showModal/selectedMigration
// states were declared in SchemaVersioningTab but setShowModal(true) was never called
// and no modal JSX existed. Modal is now fully implemented and wired up.
const MigrationDetailModal = ({ migration, onClose }) => {
    if (!migration) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ padding: '24px 28px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: THEME.textMain, margin: 0 }}>{migration.name}</h2>
                        <div style={{ fontSize: 11, color: THEME.textDim, fontFamily: 'monospace', marginTop: 4 }}>{migration.id}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {migration.status
                            ? <StatusBadge status={migration.status} />
                            : <RiskBadge risk={migration.risk} />
                        }
                        <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 10px' }}>✕</button>
                    </div>
                </div>
                <div style={{ padding: 28 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                        {[
                            { label: 'Author', value: migration.author },
                            { label: 'Version', value: migration.version },
                            { label: 'Duration', value: migration.duration || migration.estimated_time || '—' },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ padding: 14, background: THEME.bg, borderRadius: 8, border: `1px solid ${THEME.border}` }}>
                                <div style={{ fontSize: 10, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, fontFamily: 'monospace' }}>{value}</div>
                            </div>
                        ))}
                    </div>

                    {migration.sql && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 8 }}>Full SQL</div>
                            <div
                                className="code-block"
                                dangerouslySetInnerHTML={{ __html: highlightSQL(migration.sql) }}
                                style={{ maxHeight: 300, overflowY: 'auto' }}
                            />
                        </div>
                    )}

                    {migration.issues?.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 8 }}>Issues</div>
                            {migration.issues.map((issue, i) => (
                                <div key={i} style={{ padding: '10px 14px', marginBottom: 6, borderRadius: 6, background: `${getSeverityColor(issue.severity)}08`, border: `1px solid ${getSeverityColor(issue.severity)}25`, fontSize: 12 }}>
                                    <span style={{ fontWeight: 700, color: getSeverityColor(issue.severity) }}>[{issue.severity.toUpperCase()}]</span>
                                    <span style={{ color: THEME.textDim, marginLeft: 8 }}>{issue.message}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: `1px solid ${THEME.border}` }}>
                        <button className="btn-secondary" onClick={onClose}>Close</button>
                        <button className="btn-secondary"><Copy size={14} />Copy SQL</button>
                        <button className="btn-secondary"><Download size={14} />Export</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// FIX 6: DependencyGraph — removed inner getNodeColor duplicate (was shadowing module-level fn).
// FIX 6 cont'd: SVG <g> hover scaling now uses a React state-driven SVG `transform` attribute
// instead of CSS `transform` (CSS transforms on SVG elements are unreliable in Firefox/Safari).
const DependencyGraph = ({ data }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);

    const positions = useMemo(() => {
        const nodeMap = {};
        data.nodes.forEach((node, i) => {
            nodeMap[node.id] = {
                x: 100 + (i % 3) * 180,
                y: 80 + Math.floor(i / 3) * 100,
                ...node
            };
        });
        return nodeMap;
    }, [data]);

    return (
        <div style={{ position: 'relative', height: 400, background: `${THEME.bg}95`, borderRadius: 10, overflow: 'hidden' }}>
            <svg width="100%" height="100%" viewBox="0 0 600 400" style={{ cursor: 'grab' }}>
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill={THEME.grid} />
                    </marker>
                    <filter id="glow-dep">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                <g opacity="0.6">
                    {data.edges.map((edge, i) => {
                        const from = positions[edge.from];
                        const to = positions[edge.to];
                        if (!from || !to) return null;
                        const dx = to.x - from.x, dy = to.y - from.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const ox = (dx / dist) * 35, oy = (dy / dist) * 35;
                        return (
                            <line key={i}
                                  x1={from.x + ox} y1={from.y + oy}
                                  x2={to.x - ox} y2={to.y - oy}
                                  stroke={THEME.grid} strokeWidth="2"
                                  markerEnd="url(#arrowhead)" opacity="0.5"
                            />
                        );
                    })}
                </g>

                {Object.values(positions).map((node) => {
                    const isSelected = node.id === selectedNode;
                    const isHov = node.id === hoveredNode;
                    // FIX 6: Use SVG transform attribute for scale — reliable cross-browser
                    const scale = isSelected || isHov ? 1.08 : 1;
                    const tx = node.x * (1 - scale);
                    const ty = node.y * (1 - scale);
                    return (
                        <g
                            key={node.id}
                            className="dep-node"
                            onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            transform={`translate(${tx}, ${ty}) scale(${scale})`}
                            filter={isSelected ? 'url(#glow-dep)' : ''}
                        >
                            <circle
                                cx={node.x} cy={node.y}
                                r={isSelected ? 35 : 30}
                                fill={THEME.surface}
                                stroke={getNodeColor(node.type)}
                                strokeWidth={isSelected ? 3 : 2}
                                opacity={isSelected ? 1 : 0.9}
                            />
                            <text x={node.x} y={node.y - 2} textAnchor="middle" fill={THEME.textMain} fontSize="11" fontWeight="600">
                                {node.id.length > 12 ? node.id.slice(0, 10) + '…' : node.id}
                            </text>
                            <text x={node.x} y={node.y + 10} textAnchor="middle" fill={THEME.textDim} fontSize="9">{node.type}</text>
                            {node.connections > 0 && (
                                <g>
                                    <circle cx={node.x + 20} cy={node.y - 20} r="10" fill={getNodeColor(node.type)} opacity="0.9" />
                                    <text x={node.x + 20} y={node.y - 17} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">{node.connections}</text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div style={{ position: 'absolute', top: 12, right: 12, background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 10, fontSize: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: THEME.textMain }}>Legend</div>
                {[['Table', 'table'], ['View', 'view'], ['Function', 'function']].map(([label, type]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, background: getNodeColor(type), borderRadius: '50%' }} />
                        <span style={{ color: THEME.textDim }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Selected node info */}
            {selectedNode && (
                <div style={{ position: 'absolute', bottom: 12, left: 12, background: THEME.surface, border: `2px solid ${getNodeColor(positions[selectedNode].type)}`, borderRadius: 8, padding: 12, minWidth: 200 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain, marginBottom: 4 }}>{selectedNode}</div>
                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 4 }}>Type: <span style={{ color: THEME.textMain }}>{positions[selectedNode].type}</span></div>
                    <div style={{ fontSize: 10, color: THEME.textDim }}>Outgoing deps: <span style={{ color: THEME.textMain }}>{positions[selectedNode].connections}</span></div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const SchemaVersioningTab = () => {
    const [view, setView] = useState('timeline');
    const [envDiff, setEnvDiff] = useState({ source: 'staging', target: 'production' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTags, setFilterTags] = useState([]);
    const [expandedMigrations, setExpandedMigrations] = useState([]);

    // FIX 3: showModal and selectedMigration are now fully wired up:
    //   - selectedMigration is set via onSelect prop on MigrationCard
    //   - showModal derives from selectedMigration !== null (no separate boolean needed)
    const [selectedMigration, setSelectedMigration] = useState(null);

    // FIX 4: favorites state is now consumed by MigrationCard (star/unstar UI)
    const [favorites, setFavorites] = useLocalStorage('vigil_favorite_migrations', []);

    const debouncedSearch = useDebounce(searchQuery, 300);

    // FIX 1: useWebSocket — callback is now a stable ref inside the hook, so we can
    // pass an inline function here without triggering the infinite-loop bug.
    const { isConnected } = useWebSocket('ws://localhost:8080', (msg) => {
        // Handle live migration status updates here
        if (msg.type !== 'heartbeat') console.log('Migration WS event:', msg);
    });

    const allTags = useMemo(() => {
        const tags = new Set();
        [...MIGRATIONS, ...PENDING_MIGRATIONS].forEach(m => m.tags?.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, []);

    const filteredMigrations = useMemo(() => {
        let filtered = [...MIGRATIONS, ...PENDING_MIGRATIONS];
        if (debouncedSearch) {
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                m.version.includes(debouncedSearch) ||
                m.author.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
        }
        if (filterTags.length > 0) {
            filtered = filtered.filter(m => m.tags?.some(t => filterTags.includes(t)));
        }
        return filtered;
    }, [debouncedSearch, filterTags]);

    const toggleExpanded = useCallback((id) => {
        setExpandedMigrations(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }, []);

    const toggleFilter = useCallback((tag) => {
        setFilterTags(prev => prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag]);
    }, []);

    // FIX 4: favorites toggle handler
    const toggleFavorite = useCallback((id) => {
        setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }, [setFavorites]);

    // FIX 5: URL.createObjectURL blob was never revoked — memory leak.
    // Now uses a click-then-revoke pattern to clean up immediately.
    const handleExportSchema = useCallback(() => {
        const blob = new Blob(
            [JSON.stringify({ migrations: MIGRATIONS, diff: SCHEMA_DIFF }, null, 2)],
            { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schema_export_${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url); // FIX 5: revoke immediately after triggering download
    }, []);

    const pendingIds = useMemo(() => new Set(PENDING_MIGRATIONS.map(p => p.id)), []);
    const appliedIds = useMemo(() => new Set(MIGRATIONS.map(m => m.id)), []);

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            className={`tab-btn${view === id ? ' active' : ''}`}
            onClick={() => setView(id)}
            style={{ background: view === id ? `${THEME.primary}10` : 'transparent', color: view === id ? THEME.primary : THEME.textDim }}
        >
            <Icon size={16} />{label}
        </button>
    );

    return (
        <div style={{ padding: '0 24px 40px', maxWidth: 1600, margin: '0 auto' }}>
            <SchemaStyles />

            {/* FIX 3: Modal is now rendered and wired to selectedMigration state */}
            {selectedMigration && (
                <MigrationDetailModal
                    migration={selectedMigration}
                    onClose={() => setSelectedMigration(null)}
                />
            )}

            {/* ── Header ── */}
            <div style={{ marginTop: 16, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                        {/* FIX 8: Bare & replaced with &amp; */}
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: THEME.textMain, margin: 0, marginBottom: 8 }}>
                            Schema Versioning &amp; Migrations
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: THEME.textDim, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <GitBranch size={14} color={THEME.primary} />
                                Version: <span style={{ color: THEME.textMain, fontWeight: 700, fontFamily: 'monospace' }}>1.5.2</span>
                            </span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                Drift Status: <span style={{ color: THEME.success, fontWeight: 600 }}>✓ Synced</span>
                            </span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Database size={14} />
                                {MIGRATIONS.length} applied, {PENDING_MIGRATIONS.length} pending
                            </span>
                            {isConnected && (
                                <>
                                    <span>•</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div className="badge-online" />Live Updates
                                    </span>
                                </>
                            )}
                            {favorites.length > 0 && (
                                <>
                                    <span>•</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: THEME.warning }}>
                                        <Star size={12} fill={THEME.warning} />{favorites.length} starred
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-secondary" onClick={handleExportSchema}><Download size={14} />Export</button>
                        <button className="btn-secondary"><Upload size={14} />Import</button>
                        <button className="btn-primary"><GitCommit size={14} />New Migration</button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                    {[
                        { label: 'Success Rate', value: '98.5%', sub: 'Last 90 days', icon: CheckCircle, color: THEME.success },
                        { label: 'Avg Duration', value: '2.3s', sub: 'Per migration', icon: Zap, color: THEME.warning },
                        { label: 'Pending Review', value: PENDING_MIGRATIONS.length, sub: '1 high-risk', icon: AlertTriangle, color: THEME.warning },
                        { label: 'Schema Objects', value: DEPENDENCY_DATA.nodes.length, sub: `${DEPENDENCY_DATA.edges.length} dependencies`, icon: Layers, color: THEME.primary },
                    ].map(({ label, value, sub, icon: Icon, color }) => (
                        <div key={label} className="stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{label}</div>
                                <Icon size={16} color={color} />
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.textMain, marginBottom: 4 }}>{value}</div>
                            <div style={{ fontSize: 10, color: THEME.textDim }}>{sub}</div>
                        </div>
                    ))}
                </div>

                {/* View Tabs */}
                <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${THEME.border}` }}>
                    <TabButton id="timeline" icon={History} label="Migration Timeline" />
                    <TabButton id="diff" icon={ArrowLeftRight} label="Schema Diff" />
                    <TabButton id="graph" icon={Network} label="Dependencies" />
                    <TabButton id="analytics" icon={Database} label="Analytics" />
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                TIMELINE VIEW
            ══════════════════════════════════════════════════════════════ */}
            {view === 'timeline' && (
                <div>
                    {/* Search + Filters */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <Search size={16} color={THEME.textDim} style={{ position: 'absolute', left: 12, top: 12 }} />
                            <input
                                type="text"
                                placeholder="Search migrations by name, version, or author…"
                                className="search-input"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Filter size={14} color={THEME.textDim} />
                            <span style={{ fontSize: 11, color: THEME.textDim, fontWeight: 600 }}>Filter by tags:</span>
                            {allTags.map(tag => (
                                <div key={tag} className={`filter-chip ${filterTags.includes(tag) ? 'active' : ''}`} onClick={() => toggleFilter(tag)}>
                                    <Tag size={10} />{tag}
                                </div>
                            ))}
                            {filterTags.length > 0 && (
                                <button onClick={() => setFilterTags([])} style={{ background: 'transparent', border: 'none', color: THEME.textDim, fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                        {/* Migration list */}
                        <div className="schema-card" style={{ padding: 24, maxHeight: 800, overflowY: 'auto' }}>
                            {/* Pending queue */}
                            {filteredMigrations.some(m => pendingIds.has(m.id)) && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Clock size={18} color={THEME.warning} />
                                            Migration Queue
                                            <span style={{ fontSize: 11, background: `${THEME.warning}15`, color: THEME.warning, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                                                {filteredMigrations.filter(m => pendingIds.has(m.id)).length}
                                            </span>
                                        </h3>
                                        <button className="btn-secondary" style={{ fontSize: 11 }}><PlayCircle size={12} />Execute All Safe</button>
                                    </div>
                                    {filteredMigrations.filter(m => pendingIds.has(m.id)).map(mig => (
                                        <MigrationCard
                                            key={mig.id}
                                            mig={mig}
                                            pending
                                            expanded={expandedMigrations.includes(mig.id)}
                                            onExpand={toggleExpanded}
                                            isFavorite={favorites.includes(mig.id)}
                                            onToggleFavorite={toggleFavorite}
                                            onSelect={setSelectedMigration}
                                        />
                                    ))}
                                    <div style={{ borderTop: `2px dashed ${THEME.border}`, margin: '24px 0' }} />
                                </>
                            )}

                            {/* Applied history */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <CheckCircle size={18} color={THEME.success} />Applied History
                                </h3>
                                <button className="btn-secondary" style={{ fontSize: 11 }}><Download size={12} />Export Log</button>
                            </div>
                            {filteredMigrations.filter(m => appliedIds.has(m.id)).map(mig => (
                                <MigrationCard
                                    key={mig.id}
                                    mig={mig}
                                    expanded={expandedMigrations.includes(mig.id)}
                                    onExpand={toggleExpanded}
                                    isFavorite={favorites.includes(mig.id)}
                                    onToggleFavorite={toggleFavorite}
                                    onSelect={setSelectedMigration}
                                />
                            ))}

                            {filteredMigrations.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: THEME.textDim }}>
                                    <Search size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No migrations found</div>
                                    <div style={{ fontSize: 12 }}>Try adjusting your search or filters</div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Risk analysis */}
                            <div className="schema-card" style={{ padding: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                    <AlertTriangle size={20} color={THEME.warning} />
                                    <span style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>Risk Analysis</span>
                                </div>
                                <div style={{ fontSize: 12, color: THEME.textDim, lineHeight: 1.6, marginBottom: 12 }}>
                                    Automated analysis detected <b style={{ color: THEME.danger }}>2 high-risk operations</b> in migration{' '}
                                    <code style={{ background: THEME.bg, padding: '2px 6px', borderRadius: 3 }}>1.6.0</code>:
                                </div>
                                <ul style={{ margin: '0 0 14px', paddingLeft: 20, fontSize: 12, color: THEME.textDim, lineHeight: 1.8 }}>
                                    <li>DROP COLUMN requires exclusive table lock</li>
                                    <li>Data type change may cause truncation</li>
                                </ul>
                                <div className="progress-bar" style={{ marginBottom: 10 }}>
                                    <div className="progress-fill" style={{ width: '35%', background: THEME.danger }} />
                                </div>
                                <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 12 }}>
                                    Risk Score: <b style={{ color: THEME.danger }}>7.5/10</b>
                                </div>
                                <button className="btn-primary" style={{ width: '100%', background: THEME.warning }}>
                                    <ShieldAlert size={14} />Run Pre-flight Checks
                                </button>
                            </div>

                            {/* Starred migrations */}
                            {favorites.length > 0 && (
                                <div className="schema-card" style={{ padding: 20 }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Star size={15} color={THEME.warning} fill={THEME.warning} />Starred ({favorites.length})
                                    </h4>
                                    {[...MIGRATIONS, ...PENDING_MIGRATIONS]
                                        .filter(m => favorites.includes(m.id))
                                        .map(m => (
                                            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${THEME.border}`, fontSize: 12 }}>
                                                <span style={{ fontFamily: 'monospace', color: THEME.textMain }}>{m.name}</span>
                                                <span style={{ color: THEME.textDim }}>{m.version}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            {/* Quick actions */}
                            <div className="schema-card" style={{ padding: 20 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Zap size={16} />Quick Actions
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        [FileText, 'Generate Data Dictionary'],
                                        [Network, 'Export ER Diagram'],
                                        [GitMerge, 'Compare Environments'],
                                        [Terminal, 'Open SQL Console'],
                                    ].map(([Icon, label]) => (
                                        <button key={label} className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                                            <Icon size={14} />{label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Activity chart */}
                            <div className="schema-card" style={{ padding: 20 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 14 }}>Recent Activity</h4>
                                <ResponsiveContainer width="100%" height={150}>
                                    <AreaChart data={MIGRATION_STATS}>
                                        <defs>
                                            <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.success} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.3} />
                                        <XAxis dataKey="month" stroke={THEME.textDim} fontSize={10} />
                                        <YAxis stroke={THEME.textDim} fontSize={10} />
                                        <Tooltip contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 11 }} />
                                        <Area type="monotone" dataKey="successful" stroke={THEME.success} fillOpacity={1} fill="url(#colorSuccess)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Resources */}
                            <div className="schema-card" style={{ padding: 20 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Info size={16} />Resources
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                                    {['Migration Best Practices', 'Rollback Strategies', 'Zero-Downtime Migrations'].map(link => (
                                        <a key={link} href="#" style={{ color: THEME.primary, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                                            <ExternalLink size={12} />{link}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                DIFF VIEW
            ══════════════════════════════════════════════════════════════ */}
            {view === 'diff' && (
                <div className="schema-card" style={{ minHeight: 600, display: 'flex', flexDirection: 'column' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '18px 24px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', gap: 20, background: THEME.surfaceHigh, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Source', key: 'source', options: [['dev', 'Development'], ['staging', 'Staging'], ['uat', 'UAT']] },
                            { label: 'Target', key: 'target', options: [['production', 'Production'], ['dr', 'DR Site'], ['staging', 'Staging']] },
                        ].map(({ label, key, options }, i) => (
                            <React.Fragment key={key}>
                                {i > 0 && <ArrowRight size={18} color={THEME.primary} strokeWidth={2.5} />}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 12, color: THEME.textDim, fontWeight: 600 }}>{label}:</span>
                                    <select
                                        value={envDiff[key]}
                                        onChange={e => setEnvDiff({ ...envDiff, [key]: e.target.value })}
                                        style={{ background: THEME.bg, color: THEME.textMain, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                                    </select>
                                </div>
                            </React.Fragment>
                        ))}
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                            <button className="btn-secondary"><RefreshCw size={14} />Refresh</button>
                            <button className="btn-primary"><Code size={14} />Generate Sync Script</button>
                        </div>
                    </div>

                    <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
                        {/* Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
                            {[
                                { label: 'Added', count: SCHEMA_DIFF.filter(d => d.type === 'added').length, color: THEME.success },
                                { label: 'Modified', count: SCHEMA_DIFF.filter(d => d.type === 'modified').length, color: THEME.warning },
                                { label: 'Removed', count: SCHEMA_DIFF.filter(d => d.type === 'removed').length, color: THEME.danger },
                                { label: 'Total Changes', count: SCHEMA_DIFF.reduce((s, d) => s + (d.changes?.length || 0), 0), color: THEME.primary },
                            ].map(({ label, count, color }) => (
                                <div key={label} style={{ padding: 12, background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 8 }}>
                                    <div style={{ fontSize: 10, color: THEME.textDim, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color }}>{count}</div>
                                </div>
                            ))}
                        </div>

                        {/* Diff items */}
                        {SCHEMA_DIFF.map((item, i) => (
                            <div key={i} style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${THEME.border}` }}>
                                    {item.type === 'added' && <CheckCircle size={18} color={THEME.success} />}
                                    {item.type === 'removed' && <XCircle size={18} color={THEME.danger} />}
                                    {item.type === 'modified' && <RefreshCw size={18} color={THEME.warning} />}
                                    <span style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain, fontFamily: 'monospace' }}>{item.schema}.{item.table}</span>
                                    <span style={{
                                        fontSize: 10, padding: '3px 8px', borderRadius: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                                        background: item.type === 'added' ? `${THEME.success}15` : item.type === 'removed' ? `${THEME.danger}15` : `${THEME.warning}15`,
                                        color: item.type === 'added' ? THEME.success : item.type === 'removed' ? THEME.danger : THEME.warning,
                                        border: `1px solid ${item.type === 'added' ? THEME.success : item.type === 'removed' ? THEME.danger : THEME.warning}30`
                                    }}>{item.type}</span>
                                    {item.reason && <span style={{ fontSize: 11, color: THEME.textDim, fontStyle: 'italic' }}>— {item.reason}</span>}
                                </div>

                                {/* Columns */}
                                {item.changes?.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain, marginBottom: 8, marginLeft: 4 }}>Columns:</div>
                                        <div style={{ background: THEME.bg, borderRadius: 8, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
                                            {item.changes.map((c, j) => (
                                                <div key={j} style={{
                                                    display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, padding: '10px 14px',
                                                    borderBottom: j < item.changes.length - 1 ? `1px solid ${THEME.border}` : 'none',
                                                    fontSize: 12, fontFamily: 'monospace',
                                                    background: c.status === 'added' ? `${THEME.success}03` : c.status === 'removed' ? `${THEME.danger}03` : c.status === 'pending_removal' ? `${THEME.warning}03` : 'transparent'
                                                }}>
                                                    <span style={{ color: THEME.textMain, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {c.status === 'added' && <span style={{ color: THEME.success }}>+</span>}
                                                        {c.status === 'removed' && <span style={{ color: THEME.danger }}>-</span>}
                                                        {c.status === 'changed' && <span style={{ color: THEME.warning }}>~</span>}
                                                        {c.field}
                                                    </span>
                                                    {c.status === 'added' && <span className="diff-added">{c.type} {c.nullable ? 'NULL' : 'NOT NULL'}{c.default && ` DEFAULT ${c.default}`}</span>}
                                                    {c.status === 'removed' && <span className="diff-removed">{c.type}</span>}
                                                    {c.status === 'changed' && (
                                                        <span className="diff-changed" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{c.from}</span>
                                                            <ArrowRight size={12} />
                                                            <span style={{ fontWeight: 700 }}>{c.to}</span>
                                                        </span>
                                                    )}
                                                    {c.status === 'pending_removal' && (
                                                        <span style={{ background: `${THEME.warning}15`, color: THEME.warning, padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                            <Clock size={10} />Scheduled for removal • {c.type}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Indexes */}
                                {item.indexes?.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain, marginBottom: 8, marginLeft: 4 }}>Indexes:</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {item.indexes.map((idx, j) => (
                                                <div key={j} style={{ padding: '8px 12px', background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: THEME.textMain }}>
                                                        {idx.status === 'added' && <span style={{ color: THEME.success, marginRight: 6 }}>+</span>}
                                                        {idx.name} <span style={{ color: THEME.textDim }}>({idx.columns.join(', ')})</span>
                                                    </span>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: THEME.surface, color: THEME.textDim, textTransform: 'uppercase' }}>{idx.type}</span>
                                                        {idx.unique && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${THEME.primary}15`, color: THEME.primary, textTransform: 'uppercase' }}>UNIQUE</span>}
                                                        {idx.primary && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${THEME.success}15`, color: THEME.success, textTransform: 'uppercase' }}>PRIMARY</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Constraints */}
                                {item.constraints?.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textMain, marginBottom: 8, marginLeft: 4 }}>Constraints:</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {item.constraints.map((con, j) => (
                                                <div key={j} style={{ padding: '8px 12px', background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 11, fontFamily: 'monospace' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <span style={{ color: THEME.textMain }}>
                                                            {con.status === 'added' && <span style={{ color: THEME.success, marginRight: 6 }}>+</span>}
                                                            {con.name}
                                                        </span>
                                                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: THEME.surface, color: THEME.textDim, textTransform: 'uppercase' }}>{con.type.replace('_', ' ')}</span>
                                                    </div>
                                                    <div style={{ fontSize: 10, color: THEME.textDim, fontStyle: 'italic' }}>{con.definition}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                DEPENDENCY GRAPH VIEW
            ══════════════════════════════════════════════════════════════ */}
            {view === 'graph' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="schema-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain, margin: 0 }}>Schema Dependency Topology</h3>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-secondary"><Download size={14} />Export SVG</button>
                                <button className="btn-secondary"><Settings size={14} />Layout Settings</button>
                            </div>
                        </div>
                        <DependencyGraph data={DEPENDENCY_DATA} />
                        <div style={{ marginTop: 20, padding: 16, background: `${THEME.warning}08`, border: `1px solid ${THEME.warning}20`, borderRadius: 10, fontSize: 12, color: THEME.textMain, lineHeight: 1.6 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <Info size={16} color={THEME.warning} style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Impact Analysis</div>
                                    Modifying table <code style={{ background: THEME.surface, padding: '2px 6px', borderRadius: 3, fontFamily: 'monospace' }}>users</code> will trigger cascading invalidation affecting:
                                    <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                                        <li><code>view_user_stats</code> (materialized view, ~5s rebuild time)</li>
                                        <li><code>func_auth_check</code> (function, requires recompilation)</li>
                                        <li><code>orders</code>, <code>api_keys</code>, <code>user_preferences</code> (foreign key constraints)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dependency matrix */}
                    <div className="schema-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain, marginBottom: 16 }}>Dependency Matrix</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                                <thead>
                                <tr style={{ background: THEME.surfaceHigh }}>
                                    {['Object', 'Type', 'Dependencies', 'Dependents', 'Risk Level'].map(h => (
                                        <th key={h} style={{ padding: 10, textAlign: ['Object', 'Risk Level'].includes(h) ? 'left' : 'center', borderBottom: `2px solid ${THEME.border}`, fontWeight: 700 }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {DEPENDENCY_DATA.nodes.map(node => {
                                    const deps = DEPENDENCY_DATA.edges.filter(e => e.from === node.id).length;
                                    const dependents = DEPENDENCY_DATA.edges.filter(e => e.to === node.id).length;
                                    const riskLevel = deps > 3 ? 'high' : deps > 1 ? 'medium' : 'low';
                                    return (
                                        <tr key={node.id}
                                            style={{ borderBottom: `1px solid ${THEME.border}`, transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = THEME.surfaceHigh}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: 10, fontFamily: 'monospace', fontWeight: 600 }}>{node.id}</td>
                                            <td style={{ padding: 10, textAlign: 'center' }}>
                                                <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', background: `${getNodeColor(node.type)}15`, color: getNodeColor(node.type) }}>{node.type}</span>
                                            </td>
                                            <td style={{ padding: 10, textAlign: 'center', color: THEME.textDim }}>{deps}</td>
                                            <td style={{ padding: 10, textAlign: 'center', color: THEME.textDim }}>{dependents}</td>
                                            <td style={{ padding: 10 }}><RiskBadge risk={riskLevel} /></td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                ANALYTICS VIEW
            ══════════════════════════════════════════════════════════════ */}
            {view === 'analytics' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="schema-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain, marginBottom: 16 }}>Migration Success Rate (90d)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={MIGRATION_STATS}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.3} />
                                <XAxis dataKey="month" stroke={THEME.textDim} fontSize={11} />
                                <YAxis stroke={THEME.textDim} fontSize={11} />
                                <Tooltip contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 11 }} />
                                <Line type="monotone" dataKey="successful" stroke={THEME.success} strokeWidth={2} dot={{ fill: THEME.success, r: 4 }} name="Successful" />
                                <Line type="monotone" dataKey="failed" stroke={THEME.danger} strokeWidth={2} dot={{ fill: THEME.danger, r: 4 }} name="Failed" />
                                <Line type="monotone" dataKey="rolled_back" stroke={THEME.warning} strokeWidth={2} dot={{ fill: THEME.warning, r: 4 }} name="Rolled Back" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="schema-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain, marginBottom: 16 }}>Migration Types Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Safe', value: 45 },
                                        { name: 'Locking', value: 30 },
                                        { name: 'Breaking', value: 15 },
                                        { name: 'Maintenance', value: 10 }
                                    ]}
                                    cx="50%" cy="50%" outerRadius={80}
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    dataKey="value"
                                >
                                    {[THEME.success, THEME.warning, THEME.danger, THEME.primary].map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="schema-card" style={{ padding: 24, gridColumn: 'span 2' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain, marginBottom: 16 }}>Migration Volume by Month</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={MIGRATION_STATS}>
                                <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} opacity={0.3} />
                                <XAxis dataKey="month" stroke={THEME.textDim} fontSize={11} />
                                <YAxis stroke={THEME.textDim} fontSize={11} />
                                <Tooltip contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 11 }} />
                                <Bar dataKey="successful" stackId="a" fill={THEME.success} name="Successful" />
                                <Bar dataKey="failed" stackId="a" fill={THEME.danger} name="Failed" />
                                <Bar dataKey="rolled_back" stackId="a" fill={THEME.warning} radius={[4, 4, 0, 0]} name="Rolled Back" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchemaVersioningTab;