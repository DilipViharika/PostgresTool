import React, { useState, useEffect } from 'react';
import {
    Database, Plus, Edit, Trash2, Eye, EyeOff, Check, X,
    Server, Key, User, AlertCircle, CheckCircle, Link as LinkIcon,
    RefreshCw, ChevronDown
} from 'lucide-react';

// ─── Database type definitions ───────────────────────────────────────────────
const DB_TYPES = {
    postgresql: {
        label: 'PostgreSQL',
        defaultPort: 5432,
        color: '#336791',
        accent: '#4a90d9',
        icon: '🐘',
        fields: ['host', 'port', 'database', 'username', 'password', 'ssl'],
    },
    mysql: {
        label: 'MySQL',
        defaultPort: 3306,
        color: '#f29111',
        accent: '#f5a623',
        icon: '🐬',
        fields: ['host', 'port', 'database', 'username', 'password', 'ssl'],
    },
    mariadb: {
        label: 'MariaDB',
        defaultPort: 3306,
        color: '#c0765a',
        accent: '#e8956d',
        icon: '🦭',
        fields: ['host', 'port', 'database', 'username', 'password', 'ssl'],
    },
    mssql: {
        label: 'SQL Server',
        defaultPort: 1433,
        color: '#cc2927',
        accent: '#e84040',
        icon: '🪟',
        fields: ['host', 'port', 'database', 'username', 'password', 'ssl', 'instanceName'],
    },
    oracle: {
        label: 'Oracle',
        defaultPort: 1521,
        color: '#f80000',
        accent: '#ff4444',
        icon: '🔮',
        fields: ['host', 'port', 'serviceName', 'username', 'password', 'ssl'],
    },
    sqlite: {
        label: 'SQLite',
        defaultPort: null,
        color: '#0f80cc',
        accent: '#4da6ff',
        icon: '📦',
        fields: ['filePath'],
    },
    mongodb: {
        label: 'MongoDB',
        defaultPort: 27017,
        color: '#13aa52',
        accent: '#00ed64',
        icon: '🍃',
        fields: ['host', 'port', 'database', 'username', 'password', 'ssl', 'authSource', 'replicaSet'],
    },
    redis: {
        label: 'Redis',
        defaultPort: 6379,
        color: '#dc382c',
        accent: '#ff6b6b',
        icon: '⚡',
        fields: ['host', 'port', 'password', 'database', 'ssl'],
    },
    cassandra: {
        label: 'Cassandra',
        defaultPort: 9042,
        color: '#1287b1',
        accent: '#1ab8f3',
        icon: '💫',
        fields: ['host', 'port', 'keyspace', 'username', 'password', 'ssl'],
    },
    bigquery: {
        label: 'BigQuery',
        defaultPort: null,
        color: '#4285f4',
        accent: '#66a3ff',
        icon: '📊',
        fields: ['projectId', 'dataset', 'keyFile'],
    },
    snowflake: {
        label: 'Snowflake',
        defaultPort: 443,
        color: '#29b5e8',
        accent: '#7fd8f5',
        icon: '❄️',
        fields: ['account', 'warehouse', 'database', 'schema', 'username', 'password', 'role'],
    },
    clickhouse: {
        label: 'ClickHouse',
        defaultPort: 8123,
        color: '#ffcc01',
        accent: '#ffe566',
        icon: '🖱️',
        fields: ['host', 'port', 'database', 'username', 'password', 'ssl'],
    },
};

const FIELD_META = {
    host:         { label: 'Host',              placeholder: 'localhost',               type: 'text' },
    port:         { label: 'Port',              placeholder: '',                         type: 'number' },
    database:     { label: 'Database',          placeholder: 'my_database',             type: 'text' },
    username:     { label: 'Username',          placeholder: 'admin',                   type: 'text' },
    password:     { label: 'Password',          placeholder: '••••••••',               type: 'password' },
    ssl:          { label: 'Enable SSL',        type: 'checkbox' },
    filePath:     { label: 'File Path',         placeholder: '/path/to/db.sqlite',      type: 'text' },
    instanceName: { label: 'Instance Name',     placeholder: 'MSSQLSERVER',             type: 'text', optional: true },
    serviceName:  { label: 'Service Name',      placeholder: 'ORCLCDB',                 type: 'text' },
    authSource:   { label: 'Auth Source',       placeholder: 'admin',                   type: 'text', optional: true },
    replicaSet:   { label: 'Replica Set',       placeholder: 'rs0',                     type: 'text', optional: true },
    keyspace:     { label: 'Keyspace',          placeholder: 'my_keyspace',             type: 'text' },
    projectId:    { label: 'Project ID',        placeholder: 'my-gcp-project',          type: 'text' },
    dataset:      { label: 'Dataset',           placeholder: 'my_dataset',              type: 'text' },
    keyFile:      { label: 'Service Account JSON', placeholder: 'Paste JSON key here', type: 'textarea' },
    account:      { label: 'Account',           placeholder: 'xy12345.us-east-1',       type: 'text' },
    warehouse:    { label: 'Warehouse',         placeholder: 'COMPUTE_WH',              type: 'text' },
    schema:       { label: 'Schema',            placeholder: 'PUBLIC',                  type: 'text', optional: true },
    role:         { label: 'Role',              placeholder: 'SYSADMIN',                type: 'text', optional: true },
};

const defaultFormData = (dbType = 'postgresql') => {
    const meta = DB_TYPES[dbType];
    return {
        name: '',
        dbType,
        host: '',
        port: meta.defaultPort ? String(meta.defaultPort) : '',
        database: '',
        username: '',
        password: '',
        ssl: false,
        isDefault: false,
        filePath: '',
        instanceName: '',
        serviceName: '',
        authSource: '',
        replicaSet: '',
        keyspace: '',
        projectId: '',
        dataset: '',
        keyFile: '',
        account: '',
        warehouse: '',
        schema: '',
        role: '',
    };
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
    root: {
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        minHeight: '100vh',
        background: '#0d0f1a',
        color: '#c9d1d9',
        padding: '32px 28px',
    },
    card: (accent) => ({
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(255,255,255,0.06)`,
        borderTop: `2px solid ${accent}55`,
        borderRadius: 10,
        padding: 20,
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
    }),
    badge: (color) => ({
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
        background: `${color}22`, color: color,
        border: `1px solid ${color}44`, letterSpacing: '0.05em',
    }),
    btn: (bg, border, color) => ({
        background: bg, border: `1px solid ${border}`, borderRadius: 7,
        padding: '8px 14px', color, cursor: 'pointer', fontSize: 12, fontWeight: 600,
        transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
        letterSpacing: '0.02em',
    }),
    input: (hasError) => ({
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 7, padding: '9px 12px', color: '#e5e7eb', fontSize: 13,
        outline: 'none', transition: 'border-color 0.2s',
        fontFamily: 'inherit',
    }),
    label: {
        display: 'block', fontSize: 11, fontWeight: 700,
        color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em',
    },
};

// ─── DB Type Selector ─────────────────────────────────────────────────────────
const DBTypeSelector = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const current = DB_TYPES[value];

    return (
        <div style={{ position: 'relative' }}>
            <label style={S.label}>Database Type *</label>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    ...S.btn('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.12)', '#e5e7eb'),
                    width: '100%', justifyContent: 'space-between', padding: '10px 14px', fontSize: 14,
                }}
            >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{current.icon}</span>
          <span style={{ fontWeight: 600 }}>{current.label}</span>
          <span style={S.badge(current.accent)}>:{current.defaultPort || 'N/A'}</span>
        </span>
                <ChevronDown size={16} style={{ color: '#6b7280', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
                    background: '#151726', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxHeight: 360, overflowY: 'auto' }}>
                        {Object.entries(DB_TYPES).map(([key, db]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => { onChange(key); setOpen(false); }}
                                style={{
                                    background: key === value ? `${db.accent}15` : 'transparent',
                                    border: 'none',
                                    borderLeft: key === value ? `3px solid ${db.accent}` : '3px solid transparent',
                                    padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                                    display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = `${db.accent}12`}
                                onMouseLeave={e => e.currentTarget.style.background = key === value ? `${db.accent}15` : 'transparent'}
                            >
                                <span style={{ fontSize: 18 }}>{db.icon}</span>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: key === value ? db.accent : '#e5e7eb' }}>{db.label}</div>
                                    <div style={{ fontSize: 11, color: '#6b7280' }}>port {db.defaultPort || '—'}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Dynamic Form Fields ──────────────────────────────────────────────────────
const DynamicFields = ({ dbType, formData, setFormData, formErrors, showPassword, togglePasswordVisibility }) => {
    const fields = DB_TYPES[dbType].fields;
    const rows = [];

    // Group host+port together, port+database together, etc.
    let i = 0;
    while (i < fields.length) {
        const f = fields[i];
        const meta = FIELD_META[f];

        if (meta.type === 'checkbox') {
            rows.push(
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                        type="checkbox"
                        id={`chk-${f}`}
                        checked={!!formData[f]}
                        onChange={e => setFormData(p => ({ ...p, [f]: e.target.checked }))}
                        style={{ cursor: 'pointer', accentColor: '#818cf8', width: 16, height: 16 }}
                    />
                    <label htmlFor={`chk-${f}`} style={{ ...S.label, margin: 0, textTransform: 'none', fontSize: 13, cursor: 'pointer', color: '#9ca3af' }}>
                        {meta.label}
                    </label>
                </div>
            );
            i++;
            continue;
        }

        if (meta.type === 'textarea') {
            rows.push(
                <div key={f}>
                    <label style={S.label}>{meta.label} {!meta.optional && '*'}</label>
                    <textarea
                        value={formData[f] || ''}
                        onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))}
                        placeholder={meta.placeholder}
                        rows={5}
                        style={{ ...S.input(!!formErrors[f]), resize: 'vertical', lineHeight: 1.5 }}
                        onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                        onBlur={e => e.currentTarget.style.borderColor = formErrors[f] ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                    />
                    {formErrors[f] && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{formErrors[f]}</div>}
                </div>
            );
            i++;
            continue;
        }

        // Pair host+port side by side
        if (f === 'host' && fields[i + 1] === 'port') {
            rows.push(
                <div key="host-port" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                    {['host', 'port'].map(field => {
                        const m = FIELD_META[field];
                        return (
                            <div key={field}>
                                <label style={S.label}>{m.label} *</label>
                                <input
                                    type={m.type}
                                    value={formData[field] || ''}
                                    onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                                    placeholder={field === 'port' ? (DB_TYPES[dbType].defaultPort || '') : m.placeholder}
                                    style={S.input(!!formErrors[field])}
                                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onBlur={e => e.currentTarget.style.borderColor = formErrors[field] ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                                />
                                {formErrors[field] && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{formErrors[field]}</div>}
                            </div>
                        );
                    })}
                </div>
            );
            i += 2;
            continue;
        }

        // Password field with toggle
        if (meta.type === 'password') {
            rows.push(
                <div key={f}>
                    <label style={S.label}>{meta.label} *</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData[f] || ''}
                            onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))}
                            placeholder={meta.placeholder}
                            style={{ ...S.input(!!formErrors[f]), paddingRight: 42 }}
                            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                            onBlur={e => e.currentTarget.style.borderColor = formErrors[f] ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            style={{
                                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4,
                            }}
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                    {formErrors[f] && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{formErrors[f]}</div>}
                </div>
            );
            i++;
            continue;
        }

        // Default text/number field
        rows.push(
            <div key={f}>
                <label style={S.label}>{meta.label} {!meta.optional ? '*' : <span style={{ color: '#4b5563', textTransform: 'none', fontSize: 10 }}>(optional)</span>}</label>
                <input
                    type={meta.type || 'text'}
                    value={formData[f] || ''}
                    onChange={e => setFormData(p => ({ ...p, [f]: e.target.value }))}
                    placeholder={meta.placeholder}
                    style={S.input(!!formErrors[f])}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = formErrors[f] ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                />
                {formErrors[f] && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{formErrors[f]}</div>}
            </div>
        );
        i++;
    }

    return <>{rows}</>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ConnectionsTab = () => {
    const [connections, setConnections] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingConnection, setEditingConnection] = useState(null);
    const [testingConnection, setTestingConnection] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState(defaultFormData());
    const [formErrors, setFormErrors] = useState({});

    const API_BASE = 'http://localhost:5000';
    const getAuthToken = () => localStorage.getItem('authToken');

    useEffect(() => { fetchConnections(); }, []);

    const fetchConnections = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/connections`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            if (res.ok) setConnections(await res.json());
        } catch (e) { console.error(e); }
    };

    const validateForm = () => {
        const errors = {};
        const dbMeta = DB_TYPES[formData.dbType];
        const fields = dbMeta.fields.filter(f => FIELD_META[f].type !== 'checkbox');

        if (!formData.name.trim()) errors.name = 'Name is required';

        fields.forEach(f => {
            const meta = FIELD_META[f];
            if (meta.optional || meta.type === 'checkbox') return;
            if (f === 'password' && editingConnection) return; // allow blank on edit
            const val = formData[f];
            if (!val || (typeof val === 'string' && !val.trim())) {
                errors[f] = `${meta.label} is required`;
            }
        });

        if (formData.port) {
            const p = parseInt(formData.port);
            if (isNaN(p) || p < 1 || p > 65535) errors.port = 'Port must be 1–65535';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const saveConnection = async () => {
        if (!validateForm()) return;
        try {
            const url = editingConnection
                ? `${API_BASE}/api/connections/${editingConnection.id}`
                : `${API_BASE}/api/connections`;
            const res = await fetch(url, {
                method: editingConnection ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) { await fetchConnections(); closeModal(); }
            else { const e = await res.json(); alert(e.error || 'Failed to save'); }
        } catch (e) { alert('Failed to save connection'); }
    };

    const deleteConnection = async (id) => {
        if (!confirm('Delete this connection?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/connections/${id}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            if (res.ok) fetchConnections();
            else alert('Failed to delete');
        } catch (e) { console.error(e); }
    };

    const testConnection = async (conn) => {
        setTestingConnection(conn.id);
        try {
            const res = await fetch(`${API_BASE}/api/connections/${conn.id}/test`, {
                method: 'POST', headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            const r = await res.json();
            alert(r.success ? '✅ Connection successful!' : `❌ Failed: ${r.error}`);
        } catch (e) { alert('Failed to test'); }
        finally { setTestingConnection(null); }
    };

    const setDefaultConnection = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/connections/${id}/default`, {
                method: 'POST', headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
            if (res.ok) fetchConnections();
        } catch (e) { console.error(e); }
    };

    const openNew = () => {
        setEditingConnection(null);
        setFormData(defaultFormData());
        setFormErrors({});
        setShowPassword(false);
        setShowModal(true);
    };

    const openEdit = (conn) => {
        setEditingConnection(conn);
        setFormData({ ...defaultFormData(conn.dbType || 'postgresql'), ...conn, password: '' });
        setFormErrors({});
        setShowPassword(false);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingConnection(null);
        setFormData(defaultFormData());
        setFormErrors({});
    };

    const handleDbTypeChange = (type) => {
        setFormData(prev => ({
            ...defaultFormData(type),
            name: prev.name, // preserve connection name
        }));
        setFormErrors({});
    };

    return (
        <div style={S.root}>
            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f0', margin: 0, letterSpacing: '-0.02em' }}>
                        Database Connections
                    </h2>
                    <p style={{ fontSize: 13, color: '#4b5563', marginTop: 4, fontWeight: 500 }}>
                        {connections.length} connection{connections.length !== 1 ? 's' : ''} · PostgreSQL, MySQL, MongoDB, Redis & more
                    </p>
                </div>
                <button
                    onClick={openNew}
                    style={S.btn('rgba(99,102,241,0.18)', 'rgba(99,102,241,0.4)', '#a5b4fc')}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.28)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.18)'}
                >
                    <Plus size={16} />
                    New Connection
                </button>
            </div>

            {/* ── Cards Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                {connections.map(conn => {
                    const dbMeta = DB_TYPES[conn.dbType] || DB_TYPES.postgresql;
                    return (
                        <div key={conn.id} style={S.card(dbMeta.accent)}>
                            {/* Subtle glow top-left */}
                            <div style={{
                                position: 'absolute', top: -40, left: -40, width: 120, height: 120,
                                borderRadius: '50%', background: `${dbMeta.accent}08`, pointerEvents: 'none',
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 24 }}>{dbMeta.icon}</span>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>{conn.name}</span>
                                            {conn.isDefault && <span style={S.badge('#4ade80')}>DEFAULT</span>}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>
                                            <span style={{ color: dbMeta.accent }}>{dbMeta.label}</span>
                                            {conn.host && ` · ${conn.host}${conn.port ? `:${conn.port}` : ''}`}
                                            {conn.filePath && ` · ${conn.filePath}`}
                                            {conn.account && ` · ${conn.account}`}
                                            {conn.projectId && ` · ${conn.projectId}`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key-value details */}
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 12 }}>
                                {conn.database && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: '#4b5563' }}>database</span>
                                        <span style={{ color: '#9ca3af' }}>{conn.database}</span>
                                    </div>
                                )}
                                {conn.username && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: '#4b5563' }}>user</span>
                                        <span style={{ color: '#9ca3af' }}>{conn.username}</span>
                                    </div>
                                )}
                                {conn.keyspace && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: '#4b5563' }}>keyspace</span>
                                        <span style={{ color: '#9ca3af' }}>{conn.keyspace}</span>
                                    </div>
                                )}
                                {conn.warehouse && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: '#4b5563' }}>warehouse</span>
                                        <span style={{ color: '#9ca3af' }}>{conn.warehouse}</span>
                                    </div>
                                )}
                                {conn.dataset && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ color: '#4b5563' }}>dataset</span>
                                        <span style={{ color: '#9ca3af' }}>{conn.dataset}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#4b5563' }}>ssl</span>
                                    <span style={{ color: conn.ssl ? '#4ade80' : '#374151' }}>{conn.ssl ? 'on' : 'off'}</span>
                                </div>
                            </div>

                            {/* Last test status */}
                            {conn.lastTested && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 10px', borderRadius: 6, marginBottom: 14,
                                    background: conn.status === 'success' ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
                                    border: `1px solid ${conn.status === 'success' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)'}`,
                                }}>
                                    {conn.status === 'success'
                                        ? <CheckCircle size={13} color="#4ade80" />
                                        : <AlertCircle size={13} color="#ef4444" />}
                                    <span style={{ fontSize: 11, color: conn.status === 'success' ? '#4ade80' : '#ef4444', fontWeight: 600 }}>
                    {conn.status === 'success' ? 'Last test passed' : 'Last test failed'}
                  </span>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => testConnection(conn)}
                                    disabled={testingConnection === conn.id}
                                    style={{
                                        ...S.btn('rgba(99,102,241,0.12)', 'rgba(99,102,241,0.25)', '#818cf8'),
                                        flex: 1, justifyContent: 'center', opacity: testingConnection === conn.id ? 0.5 : 1,
                                    }}
                                    onMouseEnter={e => testingConnection !== conn.id && (e.currentTarget.style.background = 'rgba(99,102,241,0.22)')}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
                                >
                                    {testingConnection === conn.id
                                        ? <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Testing…</>
                                        : <><LinkIcon size={12} /> Test</>}
                                </button>

                                {!conn.isDefault && (
                                    <button
                                        onClick={() => setDefaultConnection(conn.id)}
                                        style={S.btn('rgba(74,222,128,0.1)', 'rgba(74,222,128,0.25)', '#4ade80')}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.1)'}
                                        title="Set as default"
                                    >
                                        <Check size={12} />
                                    </button>
                                )}

                                <button
                                    onClick={() => openEdit(conn)}
                                    style={S.btn('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.1)', '#9ca3af')}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    title="Edit"
                                >
                                    <Edit size={12} />
                                </button>

                                <button
                                    onClick={() => deleteConnection(conn.id)}
                                    disabled={conn.isDefault}
                                    style={{
                                        ...S.btn(
                                            conn.isDefault ? 'rgba(107,114,128,0.06)' : 'rgba(239,68,68,0.1)',
                                            conn.isDefault ? 'rgba(107,114,128,0.15)' : 'rgba(239,68,68,0.25)',
                                            conn.isDefault ? '#374151' : '#ef4444'
                                        ),
                                        cursor: conn.isDefault ? 'not-allowed' : 'pointer',
                                    }}
                                    onMouseEnter={e => !conn.isDefault && (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                                    onMouseLeave={e => !conn.isDefault && (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                                    title={conn.isDefault ? "Can't delete default" : 'Delete'}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Empty state */}
                {connections.length === 0 && (
                    <div style={{
                        gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px',
                        background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.07)',
                        borderRadius: 10,
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔌</div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e5e7eb', marginBottom: 8 }}>No connections yet</h3>
                        <p style={{ fontSize: 13, color: '#4b5563', marginBottom: 20 }}>
                            Connect to PostgreSQL, MySQL, MongoDB, Redis, Snowflake and more
                        </p>
                        <button
                            onClick={openNew}
                            style={S.btn('rgba(99,102,241,0.18)', 'rgba(99,102,241,0.4)', '#a5b4fc')}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.28)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.18)'}
                        >
                            <Plus size={16} /> Add First Connection
                        </button>
                    </div>
                )}
            </div>

            {/* ── Modal ── */}
            {showModal && (
                <>
                    <div onClick={closeModal} style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(6px)', zIndex: 999,
                    }} />
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto',
                        background: '#111420',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderTop: `2px solid ${DB_TYPES[formData.dbType].accent}66`,
                        borderRadius: 14, padding: 30, zIndex: 1000,
                        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}>
                        {/* Modal header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f0f0f0', margin: 0 }}>
                                {editingConnection ? '✏️ Edit Connection' : '🔌 New Connection'}
                            </h2>
                            <button
                                onClick={closeModal}
                                style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 6, borderRadius: 6 }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {/* DB Type selector */}
                            <DBTypeSelector value={formData.dbType} onChange={handleDbTypeChange} />

                            {/* Connection name */}
                            <div>
                                <label style={S.label}>Connection Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder={`My ${DB_TYPES[formData.dbType].label} DB`}
                                    style={S.input(!!formErrors.name)}
                                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onBlur={e => e.currentTarget.style.borderColor = formErrors.name ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                                />
                                {formErrors.name && <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{formErrors.name}</div>}
                            </div>

                            {/* Dynamic fields per DB type */}
                            <DynamicFields
                                dbType={formData.dbType}
                                formData={formData}
                                setFormData={setFormData}
                                formErrors={formErrors}
                                showPassword={showPassword}
                                togglePasswordVisibility={() => setShowPassword(p => !p)}
                            />

                            {/* Set as default */}
                            {!editingConnection && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onChange={e => setFormData(p => ({ ...p, isDefault: e.target.checked }))}
                                        style={{ cursor: 'pointer', accentColor: '#818cf8', width: 16, height: 16 }}
                                    />
                                    <label htmlFor="isDefault" style={{ ...S.label, margin: 0, textTransform: 'none', fontSize: 13, cursor: 'pointer', color: '#9ca3af' }}>
                                        Set as default connection
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
                            <button
                                onClick={closeModal}
                                style={S.btn('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.1)', '#9ca3af')}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveConnection}
                                style={S.btn('rgba(99,102,241,0.2)', 'rgba(99,102,241,0.45)', '#a5b4fc')}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.32)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                            >
                                <Check size={16} />
                                {editingConnection ? 'Update' : 'Add Connection'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
        </div>
    );
};

export default ConnectionsTab;