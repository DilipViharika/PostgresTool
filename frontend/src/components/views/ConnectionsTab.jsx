import React, { useState, useEffect } from 'react';

import {
  Database,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Server,
  Key,
  User,
  Hash,
  AlertCircle,
  CheckCircle,
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react';


/**
 * Connections Tab - Manage Database Connections
 * Allows users to add, edit, delete, and test database connections
 */
const ConnectionsTab = () => {
  const [connections, setConnections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [testingConnection, setTestingConnection] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    ssl: false,
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState({});

  const API_BASE = 'http://localhost:5000';
  const getAuthToken = () => localStorage.getItem('authToken');

  // Fetch connections on mount
  useEffect(() => {
    fetchConnections();
  }, []);

  // Fetch all connections
  const fetchConnections = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/connections`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.host.trim()) errors.host = 'Host is required';
    if (!formData.port) errors.port = 'Port is required';
    if (!formData.database.trim()) errors.database = 'Database name is required';
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.password.trim() && !editingConnection) errors.password = 'Password is required';
    
    const port = parseInt(formData.port);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.port = 'Port must be between 1 and 65535';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save connection (create or update)
  const saveConnection = async () => {
    if (!validateForm()) return;

    try {
      const url = editingConnection
        ? `${API_BASE}/api/connections/${editingConnection.id}`
        : `${API_BASE}/api/connections`;
      
      const method = editingConnection ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchConnections();
        closeModal();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save connection');
      }
    } catch (error) {
      console.error('Failed to save connection:', error);
      alert('Failed to save connection');
    }
  };

  // Delete connection
  const deleteConnection = async (id) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/connections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });

      if (response.ok) {
        await fetchConnections();
      } else {
        alert('Failed to delete connection');
      }
    } catch (error) {
      console.error('Failed to delete connection:', error);
      alert('Failed to delete connection');
    }
  };

  // Test connection
  const testConnection = async (connection) => {
    setTestingConnection(connection.id);
    try {
      const response = await fetch(`${API_BASE}/api/connections/${connection.id}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });

      const result = await response.json();
      if (result.success) {
        alert('Connection successful!');
      } else {
        alert(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
      alert('Failed to test connection');
    } finally {
      setTestingConnection(null);
    }
  };

  // Set as default connection
  const setDefaultConnection = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/connections/${id}/default`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });

      if (response.ok) {
        await fetchConnections();
      }
    } catch (error) {
      console.error('Failed to set default connection:', error);
    }
  };

  // Open modal for new connection
  const openNewConnectionModal = () => {
    setEditingConnection(null);
    setFormData({
      name: '',
      host: '',
      port: '5432',
      database: '',
      username: '',
      password: '',
      ssl: false,
      isDefault: false
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (connection) => {
    setEditingConnection(connection);
    setFormData({
      name: connection.name,
      host: connection.host,
      port: connection.port.toString(),
      database: connection.database,
      username: connection.username,
      password: '', // Don't pre-fill password for security
      ssl: connection.ssl || false,
      isDefault: connection.isDefault || false
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingConnection(null);
    setFormData({
      name: '',
      host: '',
      port: '5432',
      database: '',
      username: '',
      password: '',
      ssl: false,
      isDefault: false
    });
    setFormErrors({});
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Styles
  const styles = {
    card: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: 20
    },
    button: {
      background: 'rgba(99,102,241,0.15)',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: 8,
      padding: '10px 20px',
      color: '#818cf8',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    },
    input: {
      width: '100%',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8,
      padding: '10px 12px',
      color: '#e5e7eb',
      fontSize: 14,
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: '#9ca3af',
      marginBottom: 8
    },
    error: {
      color: '#ef4444',
      fontSize: 12,
      marginTop: 4
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e5e7eb', margin: 0 }}>
            Database Connections
          </h2>
          <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
            Manage your PostgreSQL database connections
          </p>
        </div>
        <button
          onClick={openNewConnectionModal}
          style={styles.button}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
        >
          <Plus size={18} />
          Add Connection
        </button>
      </div>

      {/* Connections Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: 16 
      }}>
        {connections.map(connection => (
          <div key={connection.id} style={styles.card}>
            {/* Connection Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Database size={18} color="#818cf8" />
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e5e7eb', margin: 0 }}>
                    {connection.name}
                  </h3>
                  {connection.isDefault && (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      background: 'rgba(34,197,94,0.15)',
                      color: '#4ade80',
                      border: '1px solid rgba(34,197,94,0.3)'
                    }}>
                      DEFAULT
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  {connection.host}:{connection.port}
                </div>
              </div>
            </div>

            {/* Connection Details */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Server size={14} color="#6b7280" />
                <span style={{ fontSize: 13, color: '#9ca3af' }}>Database:</span>
                <span style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 500 }}>{connection.database}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <User size={14} color="#6b7280" />
                <span style={{ fontSize: 13, color: '#9ca3af' }}>Username:</span>
                <span style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 500 }}>{connection.username}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Key size={14} color="#6b7280" />
                <span style={{ fontSize: 13, color: '#9ca3af' }}>SSL:</span>
                <span style={{ fontSize: 13, color: connection.ssl ? '#4ade80' : '#6b7280', fontWeight: 500 }}>
                  {connection.ssl ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Status */}
            {connection.lastTested && (
              <div style={{
                padding: 8,
                borderRadius: 6,
                background: connection.status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${connection.status === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {connection.status === 'success' ? (
                    <CheckCircle size={14} color="#4ade80" />
                  ) : (
                    <AlertCircle size={14} color="#ef4444" />
                  )}
                  <span style={{ 
                    fontSize: 12, 
                    color: connection.status === 'success' ? '#4ade80' : '#ef4444',
                    fontWeight: 500
                  }}>
                    {connection.status === 'success' ? 'Connected' : 'Connection Failed'}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => testConnection(connection)}
                disabled={testingConnection === connection.id}
                style={{
                  ...styles.button,
                  flex: 1,
                  justifyContent: 'center',
                  padding: '8px 12px',
                  fontSize: 12,
                  opacity: testingConnection === connection.id ? 0.5 : 1
                }}
                onMouseEnter={e => !testingConnection && (e.currentTarget.style.background = 'rgba(99,102,241,0.25)')}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
              >
                {testingConnection === connection.id ? (
                  <>
                    <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Testing...
                  </>
                ) : (
                  <>
                    <LinkIcon size={14} />
                    Test
                  </>
                )}
              </button>
              
              {!connection.isDefault && (
                <button
                  onClick={() => setDefaultConnection(connection.id)}
                  style={{
                    ...styles.button,
                    background: 'rgba(34,197,94,0.15)',
                    borderColor: 'rgba(34,197,94,0.3)',
                    color: '#4ade80',
                    padding: '8px 12px',
                    fontSize: 12
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.15)'}
                >
                  <Check size={14} />
                  Set Default
                </button>
              )}
              
              <button
                onClick={() => openEditModal(connection)}
                style={{
                  ...styles.button,
                  background: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#9ca3af',
                  padding: '8px 12px',
                  fontSize: 12
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <Edit size={14} />
              </button>
              
              <button
                onClick={() => deleteConnection(connection.id)}
                disabled={connection.isDefault}
                style={{
                  ...styles.button,
                  background: connection.isDefault ? 'rgba(107,114,128,0.1)' : 'rgba(239,68,68,0.15)',
                  borderColor: connection.isDefault ? 'rgba(107,114,128,0.2)' : 'rgba(239,68,68,0.3)',
                  color: connection.isDefault ? '#6b7280' : '#ef4444',
                  padding: '8px 12px',
                  fontSize: 12,
                  cursor: connection.isDefault ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={e => !connection.isDefault && (e.currentTarget.style.background = 'rgba(239,68,68,0.25)')}
                onMouseLeave={e => !connection.isDefault && (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {connections.length === 0 && (
          <div style={{
            ...styles.card,
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: 60
          }}>
            <Database size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#e5e7eb', marginBottom: 8 }}>
              No connections configured
            </h3>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>
              Add your first database connection to get started
            </p>
            <button
              onClick={openNewConnectionModal}
              style={styles.button}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
            >
              <Plus size={18} />
              Add Connection
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeModal}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          
          {/* Modal Content */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            background: '#1a1d2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 32,
            zIndex: 1000
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e5e7eb', margin: 0 }}>
                {editingConnection ? 'Edit Connection' : 'New Connection'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 8,
                  borderRadius: 6,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Connection Name */}
              <div>
                <label style={styles.label}>Connection Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Production DB"
                  style={{
                    ...styles.input,
                    borderColor: formErrors.name ? '#ef4444' : 'rgba(255,255,255,0.1)'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = formErrors.name ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                />
                {formErrors.name && <div style={styles.error}>{formErrors.name}</div>}
              </div>

              {/* Host */}
              <div>
                <label style={styles.label}>Host *</label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  placeholder="localhost or 192.168.1.100"
                  style={{
                    ...styles.input,
                    borderColor: formErrors.host ? '#ef4444' : 'rgba(255,255,255,0.1)'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = formErrors.host ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                />
                {formErrors.host && <div style={styles.error}>{formErrors.host}</div>}
              </div>

              {/* Port & Database */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                <div>
                  <label style={styles.label}>Port *</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    placeholder="5432"
                    style={{
                      ...styles.input,
                      borderColor: formErrors.port ? '#ef4444' : 'rgba(255,255,255,0.1)'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = formErrors.port ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                  />
                  {formErrors.port && <div style={styles.error}>{formErrors.port}</div>}
                </div>
                <div>
                  <label style={styles.label}>Database *</label>
                  <input
                    type="text"
                    value={formData.database}
                    onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                    placeholder="postgres"
                    style={{
                      ...styles.input,
                      borderColor: formErrors.database ? '#ef4444' : 'rgba(255,255,255,0.1)'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = formErrors.database ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                  />
                  {formErrors.database && <div style={styles.error}>{formErrors.database}</div>}
                </div>
              </div>

              {/* Username */}
              <div>
                <label style={styles.label}>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="postgres"
                  style={{
                    ...styles.input,
                    borderColor: formErrors.username ? '#ef4444' : 'rgba(255,255,255,0.1)'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = formErrors.username ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                />
                {formErrors.username && <div style={styles.error}>{formErrors.username}</div>}
              </div>

              {/* Password */}
              <div>
                <label style={styles.label}>
                  Password {!editingConnection && '*'}
                  {editingConnection && <span style={{ fontSize: 11, fontWeight: 400 }}> (leave blank to keep current)</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.form ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    style={{
                      ...styles.input,
                      borderColor: formErrors.password ? '#ef4444' : 'rgba(255,255,255,0.1)',
                      paddingRight: 40
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                    onBlur={e => e.currentTarget.style.borderColor = formErrors.password ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('form')}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    {showPassword.form ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formErrors.password && <div style={styles.error}>{formErrors.password}</div>}
              </div>

              {/* SSL */}
              <div>
                <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.ssl}
                    onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Enable SSL Connection
                </label>
              </div>

              {/* Set as Default */}
              {!editingConnection && (
                <div>
                  <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    Set as default connection
                  </label>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                style={{
                  ...styles.button,
                  background: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#9ca3af'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                Cancel
              </button>
              <button
                onClick={saveConnection}
                style={styles.button}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
              >
                <Check size={18} />
                {editingConnection ? 'Update Connection' : 'Add Connection'}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConnectionsTab;