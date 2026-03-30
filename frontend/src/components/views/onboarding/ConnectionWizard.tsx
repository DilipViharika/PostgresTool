/**
 * ConnectionWizard.jsx
 * Multi-step wizard for connecting a database.
 * Steps: Type → Details → Options → Test → Success
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight, ChevronLeft, CheckCircle, Loader, AlertCircle,
  Database, Key, Zap, Shield, Wifi, Globe, Lock, Plus
} from 'lucide-react';
import { postData } from '../../../utils/api';
import ConnectionStringParser from '../../shared/ConnectionStringParser';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { useNavigation } from '../../../context/NavigationContext';
import { useConnection } from '../../../context/ConnectionContext';

const DB_TYPES = {
  postgresql: {
    label: 'PostgreSQL',
    defaultPort: 5432,
    color: '#336791',
    icon: '🐘',
    description: 'Open-source relational database'
  },
  mysql: {
    label: 'MySQL',
    defaultPort: 3306,
    color: '#f29111',
    icon: '🐬',
    description: 'Popular relational database'
  },
  mongodb: {
    label: 'MongoDB',
    defaultPort: 27017,
    color: '#13aa52',
    icon: '🍃',
    description: 'Document-oriented database'
  },
};

const PROVIDER_TEMPLATES = {
  aws_rds: {
    label: 'AWS RDS',
    icon: '☁️',
    template: {
      hostPattern: '*.*.rds.amazonaws.com',
      ssl: true,
      hint: 'Use your RDS endpoint as the host'
    }
  },
  neon: {
    label: 'Neon',
    icon: '⚡',
    template: {
      hostPattern: 'pg-*.neon.tech',
      ssl: true,
      hint: 'Neon requires SSL. Use your connection string above.'
    }
  },
  supabase: {
    label: 'Supabase',
    icon: '🟢',
    template: {
      hostPattern: '*.supabase.co',
      ssl: true,
      hint: 'Supabase uses PostgreSQL. Find your credentials in Settings > Database.'
    }
  },
  planetscale: {
    label: 'PlanetScale',
    icon: '🪐',
    template: {
      hostPattern: '*.psdb.cloud',
      ssl: true,
      hint: 'PlanetScale MySQL requires SSL. Use connection string above.'
    }
  },
  mongodb_atlas: {
    label: 'MongoDB Atlas',
    icon: '🎯',
    template: {
      hostPattern: 'cluster*.mongodb.net',
      ssl: true,
      hint: 'Use mongodb+srv:// connection string from Atlas console.'
    }
  },
};

const ConnectionWizard = () => {
  useAdaptiveTheme();
  const [step, setStep] = useState(1); // 1: Type, 2: Details, 3: Options, 4: Test, 5: Success
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    type: null,
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
    ssl: false,
    sshTunnel: false,
    sshHost: '',
    sshUsername: '',
    sshPassword: '',
    sshKey: '',
  });
  const [testStatus, setTestStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [testError, setTestError] = useState(null);
  const [connectionId, setConnectionId] = useState(null);
  const [useConnectionString, setUseConnectionString] = useState(false);
  const [parsedFromString, setParsedFromString] = useState(null);

  const { goToTab } = useNavigation();
  const { refreshConnections } = useConnection();

  // Step 1: Select database type
  const handleSelectType = (type) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      type,
      port: DB_TYPES[type].defaultPort.toString(),
    }));
    setStep(2);
  };

  // Step 2: Form input changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Parse connection string
  const handleParsedConnection = (parsed) => {
    setParsedFromString(parsed);
    setFormData(prev => ({
      ...prev,
      type: parsed.type || prev.type,
      host: parsed.host,
      port: parsed.port?.toString() || prev.port,
      username: parsed.username,
      password: parsed.password,
      database: parsed.database,
      ssl: parsed.ssl || false,
    }));
  };

  // Step 3: Additional options (SSH, SSL details)
  const handleProceedToTest = () => {
    setStep(4);
  };

  // Step 4: Test connection
  const handleTestConnection = useCallback(async () => {
    setTestStatus('loading');
    setTestError(null);
    try {
      const response = await postData('/api/connections/test', {
        type: formData.type,
        host: formData.host,
        port: parseInt(formData.port),
        username: formData.username,
        password: formData.password,
        database: formData.database,
        ssl: formData.ssl,
      });

      if (response.success) {
        setTestStatus('success');
        // Create the actual connection
        handleCreateConnection();
      } else {
        setTestStatus('error');
        setTestError(response.error || 'Connection test failed');
      }
    } catch (err) {
      setTestStatus('error');
      setTestError(err.message || 'Failed to test connection');
    }
  }, [formData]);

  // Create connection in database
  const handleCreateConnection = useCallback(async () => {
    try {
      const response = await postData('/api/connections', {
        type: formData.type,
        host: formData.host,
        port: parseInt(formData.port),
        username: formData.username,
        password: formData.password,
        database: formData.database,
        ssl: formData.ssl,
        name: `${DB_TYPES[formData.type].label} - ${formData.host}/${formData.database}`,
        isDefault: true, // Make it default on creation
      });

      if (response.success) {
        setConnectionId(response.connectionId || response.id);
        setStep(5); // Success screen

        // Refresh connections in context
        setTimeout(() => {
          refreshConnections();
        }, 500);
      } else {
        setTestStatus('error');
        setTestError(response.error || 'Failed to create connection');
      }
    } catch (err) {
      setTestStatus('error');
      setTestError(err.message || 'Failed to create connection');
    }
  }, [formData, refreshConnections]);

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 4) {
        setTestStatus(null);
        setTestError(null);
      }
    }
  };

  const handleGoToDashboard = () => {
    goToTab('dashboard');
  };

  const styles = {
    container: {
      width: '100%',
      maxWidth: '700px',
      margin: '0 auto',
      padding: '40px 24px',
    },
    card: {
      padding: '32px',
      borderRadius: '16px',
      background: THEME.surface,
      border: `1px solid ${THEME.glassBorder}`,
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)',
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      position: 'relative',
    },
    stepDot: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      fontWeight: '700',
      zIndex: 2,
      transition: 'all 0.2s',
    },
    stepDotActive: {
      background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
    },
    stepDotInactive: {
      background: THEME.surfaceHover,
      border: `1px solid ${THEME.glassBorder}`,
      color: THEME.textDim,
    },
    stepDotCompleted: {
      background: THEME.success,
      color: '#ffffff',
    },
    stepLine: {
      position: 'absolute',
      top: '18px',
      left: '0',
      right: '0',
      height: '2px',
      background: THEME.glassBorder,
      zIndex: 1,
    },
    title: {
      fontSize: '22px',
      fontWeight: '700',
      color: THEME.textMain,
      marginBottom: '8px',
      fontFamily: THEME.fontBody,
    },
    description: {
      fontSize: '14px',
      color: THEME.textMuted,
      marginBottom: '24px',
      fontFamily: THEME.fontBody,
    },
    typeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px',
      marginBottom: '24px',
    },
    typeCard: {
      padding: '20px 16px',
      borderRadius: '12px',
      border: `1.5px solid ${THEME.glassBorder}`,
      background: THEME.surface,
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center',
    },
    typeCardHover: {
      borderColor: '#8b5cf6',
      background: 'rgba(139, 92, 246, 0.04)',
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.12)',
    },
    typeIcon: {
      fontSize: '36px',
      marginBottom: '10px',
    },
    typeLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: THEME.textMain,
      marginBottom: '4px',
      fontFamily: THEME.fontBody,
    },
    typeDescription: {
      fontSize: '12px',
      color: THEME.textMuted,
      fontFamily: THEME.fontBody,
    },
    formSection: {
      marginBottom: '24px',
    },
    formLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: THEME.textMuted,
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: THEME.fontMono,
      display: 'block',
    },
    formInput: {
      width: '100%',
      padding: '11px 14px',
      borderRadius: '10px',
      border: `1.5px solid ${THEME.glassBorder}`,
      background: THEME.surfaceHover,
      color: THEME.textMain,
      fontSize: '13px',
      fontFamily: THEME.fontMono,
      transition: 'all 0.2s',
      boxSizing: 'border-box',
    },
    formInputFocus: {
      borderColor: '#8b5cf6',
      background: THEME.surface,
      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
      outline: 'none',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '12px',
    },
    formFull: {
      gridColumn: '1 / -1',
    },
    toggleSection: {
      padding: '14px',
      borderRadius: '10px',
      background: THEME.surfaceHover,
      border: `1px solid ${THEME.glassBorder}`,
      marginBottom: '16px',
    },
    toggleLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      color: THEME.textMain,
      fontFamily: THEME.fontBody,
    },
    toggle: {
      width: '40px',
      height: '24px',
      borderRadius: '12px',
      background: THEME.glassBorder,
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      paddingRight: '3px',
    },
    toggleActive: {
      background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
      paddingRight: 'auto',
      paddingLeft: '3px',
    },
    toggleDot: {
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      background: '#fff',
      transition: 'all 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    },
    testStatusBox: {
      padding: '16px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
      fontFamily: THEME.fontBody,
    },
    testStatusSuccess: {
      background: 'rgba(22, 163, 74, 0.06)',
      border: '1px solid rgba(22, 163, 74, 0.2)',
      color: THEME.success,
    },
    testStatusError: {
      background: 'rgba(220, 38, 38, 0.06)',
      border: '1px solid rgba(220, 38, 38, 0.2)',
      color: THEME.danger,
    },
    testStatusLoading: {
      background: 'rgba(139, 92, 246, 0.06)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      color: '#8b5cf6',
    },
    successScreen: {
      textAlign: 'center',
    },
    successIcon: {
      fontSize: '56px',
      marginBottom: '16px',
      animation: 'pulse 2s ease-in-out infinite',
    },
    buttonsContainer: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'space-between',
      marginTop: '32px',
    },
    button: {
      padding: '11px 22px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
      fontFamily: THEME.fontBody,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    buttonSecondary: {
      background: THEME.surfaceHover,
      border: `1.5px solid ${THEME.glassBorder}`,
      color: THEME.textMuted,
    },
    buttonSecondaryHover: {
      borderColor: '#8b5cf6',
      color: THEME.textMain,
      background: 'rgba(139, 92, 246, 0.04)',
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      border: 'none',
      color: '#ffffff',
      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)',
    },
    buttonPrimaryHover: {
      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
      transform: 'translateY(-2px)',
    },
  };

  const [hoveredType, setHoveredType] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.card}>
        {/* Step Indicator */}
        {step < 5 && (
          <div style={styles.stepIndicator}>
            <div style={styles.stepLine} />
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                style={{
                  ...styles.stepDot,
                  ...(s === step
                    ? styles.stepDotActive
                    : s < step
                    ? styles.stepDotCompleted
                    : styles.stepDotInactive),
                }}
              >
                {s < step ? '✓' : s}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Choose DB Type */}
        {step === 1 && (
          <>
            <h2 style={styles.title}>Choose Database Type</h2>
            <p style={styles.description}>Select which database system you want to connect to.</p>

            <div style={styles.typeGrid}>
              {Object.entries(DB_TYPES).map(([key, db]) => (
                <div
                  key={key}
                  onClick={() => handleSelectType(key)}
                  onMouseEnter={() => setHoveredType(key)}
                  onMouseLeave={() => setHoveredType(null)}
                  style={{
                    ...styles.typeCard,
                    ...(hoveredType === key ? styles.typeCardHover : {}),
                  }}
                >
                  <div style={styles.typeIcon}>{db.icon}</div>
                  <div style={styles.typeLabel}>{db.label}</div>
                  <div style={styles.typeDescription}>{db.description}</div>
                </div>
              ))}
            </div>

            {/* Quick Provider Templates */}
            <div style={{ marginTop: '32px' }}>
              <label style={styles.formLabel}>Or use a provider template:</label>
              <div style={styles.typeGrid}>
                {Object.entries(PROVIDER_TEMPLATES).map(([key, provider]) => (
                  <div
                    key={key}
                    style={{
                      ...styles.typeCard,
                      opacity: 0.7,
                      cursor: 'help',
                    }}
                    title={provider.template.hint}
                  >
                    <div style={styles.typeIcon}>{provider.icon}</div>
                    <div style={styles.typeLabel}>{provider.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* STEP 2: Enter Connection Details */}
        {step === 2 && (
          <>
            <h2 style={styles.title}>Connection Details</h2>
            <p style={styles.description}>
              {selectedType && `Connect to your ${DB_TYPES[selectedType].label} database`}
            </p>

            {/* Connection String Option */}
            <div style={styles.toggleSection}>
              <label style={styles.toggleLabel}>
                <span>Paste connection string instead?</span>
                <button
                  onClick={() => setUseConnectionString(!useConnectionString)}
                  style={{
                    ...styles.toggle,
                    ...(useConnectionString ? styles.toggleActive : {}),
                  }}
                >
                  <div style={styles.toggleDot} />
                </button>
              </label>
            </div>

            {useConnectionString ? (
              <div style={{ marginBottom: '24px' }}>
                <ConnectionStringParser onChange={handleParsedConnection} />
              </div>
            ) : (
              <div>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.formLabel}>Host</label>
                    <input
                      type="text"
                      placeholder="localhost"
                      value={formData.host}
                      onChange={(e) => handleFormChange('host', e.target.value)}
                      onFocus={() => setFocusedInput('host')}
                      onBlur={() => setFocusedInput(null)}
                      style={{
                        ...styles.formInput,
                        ...(focusedInput === 'host' ? styles.formInputFocus : {}),
                      }}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Port</label>
                    <input
                      type="number"
                      placeholder={DB_TYPES[selectedType]?.defaultPort}
                      value={formData.port}
                      onChange={(e) => handleFormChange('port', e.target.value)}
                      onFocus={() => setFocusedInput('port')}
                      onBlur={() => setFocusedInput(null)}
                      style={{
                        ...styles.formInput,
                        ...(focusedInput === 'port' ? styles.formInputFocus : {}),
                      }}
                    />
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.formLabel}>Username</label>
                    <input
                      type="text"
                      placeholder="user"
                      value={formData.username}
                      onChange={(e) => handleFormChange('username', e.target.value)}
                      onFocus={() => setFocusedInput('username')}
                      onBlur={() => setFocusedInput(null)}
                      style={{
                        ...styles.formInput,
                        ...(focusedInput === 'username' ? styles.formInputFocus : {}),
                      }}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Password</label>
                    <input
                      type="password"
                      placeholder="••••••"
                      value={formData.password}
                      onChange={(e) => handleFormChange('password', e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      style={{
                        ...styles.formInput,
                        ...(focusedInput === 'password' ? styles.formInputFocus : {}),
                      }}
                    />
                  </div>
                </div>

                <div style={{ ...styles.formGrid, ...styles.formFull }}>
                  <label style={styles.formLabel}>Database Name</label>
                  <input
                    type="text"
                    placeholder="mydb"
                    value={formData.database}
                    onChange={(e) => handleFormChange('database', e.target.value)}
                    onFocus={() => setFocusedInput('database')}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                      ...styles.formInput,
                      ...(focusedInput === 'database' ? styles.formInputFocus : {}),
                    }}
                  />
                </div>
              </div>
            )}

            <div style={styles.buttonsContainer}>
              <button
                onClick={handleBackStep}
                onMouseEnter={() => setHoveredButton('back')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  ...(hoveredButton === 'back' ? styles.buttonSecondaryHover : {}),
                }}
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                onMouseEnter={() => setHoveredButton('next')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...(hoveredButton === 'next' ? styles.buttonPrimaryHover : {}),
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Configure Options */}
        {step === 3 && (
          <>
            <h2 style={styles.title}>Connection Options</h2>
            <p style={styles.description}>Configure SSL and advanced options (optional).</p>

            <div style={styles.toggleSection}>
              <label style={styles.toggleLabel}>
                <Shield size={16} />
                <span>Require SSL/TLS</span>
                <button
                  onClick={() => handleFormChange('ssl', !formData.ssl)}
                  style={{
                    ...styles.toggle,
                    ...(formData.ssl ? styles.toggleActive : {}),
                  }}
                >
                  <div style={styles.toggleDot} />
                </button>
              </label>
            </div>

            <div style={styles.toggleSection}>
              <label style={styles.toggleLabel}>
                <Wifi size={16} />
                <span>Use SSH Tunnel</span>
                <button
                  onClick={() => handleFormChange('sshTunnel', !formData.sshTunnel)}
                  style={{
                    ...styles.toggle,
                    ...(formData.sshTunnel ? styles.toggleActive : {}),
                  }}
                >
                  <div style={styles.toggleDot} />
                </button>
              </label>
            </div>

            {formData.sshTunnel && (
              <div style={{ ...styles.formSection, paddingLeft: '16px', borderLeft: '2px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.formLabel}>SSH Host</label>
                    <input
                      type="text"
                      placeholder="bastion.example.com"
                      value={formData.sshHost}
                      onChange={(e) => handleFormChange('sshHost', e.target.value)}
                      style={styles.formInput}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>SSH Username</label>
                    <input
                      type="text"
                      placeholder="ubuntu"
                      value={formData.sshUsername}
                      onChange={(e) => handleFormChange('sshUsername', e.target.value)}
                      style={styles.formInput}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={styles.buttonsContainer}>
              <button
                onClick={handleBackStep}
                onMouseEnter={() => setHoveredButton('back')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  ...(hoveredButton === 'back' ? styles.buttonSecondaryHover : {}),
                }}
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                onClick={handleProceedToTest}
                onMouseEnter={() => setHoveredButton('test')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...(hoveredButton === 'test' ? styles.buttonPrimaryHover : {}),
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* STEP 4: Test Connection */}
        {step === 4 && (
          <>
            <h2 style={styles.title}>Test Connection</h2>
            <p style={styles.description}>Verify that VIGIL can connect to your database.</p>

            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  ...styles.formSection,
                  padding: '16px',
                  background: 'rgba(139, 92, 246, 0.03)',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '12px', color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                  <div>Type: <strong>{DB_TYPES[formData.type]?.label}</strong></div>
                  <div>Host: <strong>{formData.host}</strong>:{formData.port}</div>
                  <div>Database: <strong>{formData.database}</strong></div>
                  <div>SSL: {formData.ssl ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </div>

            {testStatus === 'loading' && (
              <div style={{ ...styles.testStatusBox, ...styles.testStatusLoading }}>
                <Loader className="loading-spinner" size={20} />
                <span>Testing connection...</span>
              </div>
            )}

            {testStatus === 'success' && (
              <div style={{ ...styles.testStatusBox, ...styles.testStatusSuccess }}>
                <CheckCircle size={20} />
                <span>Connection successful! Creating connection...</span>
              </div>
            )}

            {testStatus === 'error' && (
              <div style={{ ...styles.testStatusBox, ...styles.testStatusError }}>
                <AlertCircle size={20} />
                <div>
                  <div>Connection failed</div>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>{testError}</div>
                </div>
              </div>
            )}

            <div style={styles.buttonsContainer}>
              <button
                onClick={handleBackStep}
                disabled={testStatus === 'loading'}
                onMouseEnter={() => setHoveredButton('back')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  ...(hoveredButton === 'back' ? styles.buttonSecondaryHover : {}),
                  opacity: testStatus === 'loading' ? 0.5 : 1,
                  cursor: testStatus === 'loading' ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'loading' || testStatus === 'success'}
                onMouseEnter={() => setHoveredButton('test')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...(hoveredButton === 'test' ? styles.buttonPrimaryHover : {}),
                  opacity: (testStatus === 'loading' || testStatus === 'success') ? 0.6 : 1,
                  cursor: (testStatus === 'loading' || testStatus === 'success') ? 'not-allowed' : 'pointer',
                }}
              >
                {testStatus === 'loading' ? (
                  <>
                    <Loader className="loading-spinner" size={16} />
                    Testing...
                  </>
                ) : testStatus === 'success' ? (
                  <>
                    <CheckCircle size={16} />
                    Success
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Test Connection
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* STEP 5: Success */}
        {step === 5 && (
          <div style={styles.successScreen}>
            <div style={styles.successIcon}>✨</div>
            <h2 style={styles.title}>Connection Established!</h2>
            <p style={styles.description}>
              Your database connection is ready. You can now start monitoring your database with VIGIL.
            </p>

            <button
              onClick={handleGoToDashboard}
              onMouseEnter={() => setHoveredButton('dashboard')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                ...(hoveredButton === 'dashboard' ? styles.buttonPrimaryHover : {}),
                marginTop: '24px',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={16} />
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionWizard;
