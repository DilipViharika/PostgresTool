/**
 * ConnectionStringParser.tsx
 * Parses connection strings (postgresql://, mysql://, mongodb+srv://)
 * and auto-fills wizard form fields via onChange callback.
 */
import React, { useState, useCallback } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { THEME, useAdaptiveTheme } from '../../utils/theme.jsx';

interface ParsedConnection {
  type: string;
  host: string;
  port: string | number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  sslmode: string;
  rawParams: Record<string, string>;
}

interface ConnectionStringParserProps {
  onChange?: (parsed: ParsedConnection) => void;
  onError?: (error: string) => void;
}

const ConnectionStringParser: React.FC<ConnectionStringParserProps> = ({ onChange, onError }) => {
  useAdaptiveTheme();
  const [connectionString, setConnectionString] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [focused, setFocused] = useState<boolean>(false);

  /**
   * Parse connection string formats:
   * PostgreSQL: postgresql://user:pass@host:port/database?sslmode=require
   * MySQL: mysql://user:pass@host:port/database
   * MongoDB SRV: mongodb+srv://user:pass@cluster.mongodb.net/database?retryWrites=true
   * MongoDB Standard: mongodb://user:pass@host:port/database
   */
  const parseConnectionString = useCallback((str: string): ParsedConnection | null => {
    if (!str.trim()) {
      setParsedData(null);
      setError(null);
      return null;
    }

    try {
      const url = new URL(str.trim());
      const protocol = url.protocol.replace(':', '');

      let dbType: string | null = null;
      if (protocol === 'postgresql' || protocol === 'postgres') {
        dbType = 'postgresql';
      } else if (protocol === 'mysql' || protocol === 'mysql2') {
        dbType = 'mysql';
      } else if (protocol === 'mongodb' || protocol === 'mongodb+srv') {
        dbType = 'mongodb';
      } else {
        throw new Error(`Unsupported protocol: ${protocol}`);
      }

      const username = url.username || '';
      const password = url.password || '';
      const hostname = url.hostname || '';
      const port = url.port || '';
      const database = url.pathname?.slice(1) || '';

      const params = Object.fromEntries(url.searchParams);
      const sslmode = params.sslmode || params.ssl || '';
      const useSSL = sslmode === 'require' || sslmode === 'true';

      const parsed: ParsedConnection = {
        type: dbType,
        host: hostname,
        port: port || getDefaultPort(dbType),
        username,
        password,
        database,
        ssl: useSSL,
        sslmode: sslmode,
        rawParams: params,
      };

      setParsedData(parsed);
      setError(null);

      if (onChange) {
        onChange(parsed);
      }

      return parsed;
    } catch (err) {
      const errorMsg = `Invalid connection string: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMsg);
      setParsedData(null);
      if (onError) {
        onError(errorMsg);
      }
      return null;
    }
  }, [onChange, onError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    setConnectionString(value);
    parseConnectionString(value);
  };

  const handleCopyField = (label: string, value: string): void => {
    navigator.clipboard.writeText(value);
    setCopiedIndex(label);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getDefaultPort = (dbType: string): string | number => {
    const ports: Record<string, number> = {
      postgresql: 5432,
      mysql: 3306,
      mongodb: 27017,
    };
    return ports[dbType] || '';
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '100%',
    } as React.CSSProperties,
    label: {
      fontSize: '12px',
      fontWeight: '600',
      color: THEME.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: THEME.fontMono,
    } as React.CSSProperties,
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid rgba(0, 212, 255, 0.15)`,
      background: 'rgba(18, 10, 31, 0.4)',
      color: THEME.textMain,
      fontSize: '12px',
      fontFamily: THEME.fontMono,
      lineHeight: '1.5',
      minHeight: '100px',
      resize: 'vertical',
      transition: 'all 0.2s',
      boxSizing: 'border-box',
    } as React.CSSProperties,
    textareaFocus: {
      borderColor: 'rgba(0, 212, 255, 0.4)',
      background: 'rgba(18, 10, 31, 0.6)',
      boxShadow: '0 0 12px rgba(0, 212, 255, 0.1)',
      outline: 'none',
    } as React.CSSProperties,
    errorBox: {
      padding: '12px',
      borderRadius: '8px',
      background: 'rgba(255, 69, 96, 0.08)',
      border: '1px solid rgba(255, 69, 96, 0.2)',
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-start',
    } as React.CSSProperties,
    errorText: {
      fontSize: '12px',
      color: '#FF4560',
      fontFamily: THEME.fontBody,
    } as React.CSSProperties,
    parsedSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '12px',
    } as React.CSSProperties,
    fieldCard: {
      padding: '12px',
      borderRadius: '8px',
      background: 'rgba(0, 212, 255, 0.05)',
      border: '1px solid rgba(0, 212, 255, 0.12)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    } as React.CSSProperties,
    fieldLabel: {
      fontSize: '11px',
      fontWeight: '600',
      color: THEME.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      fontFamily: THEME.fontMono,
    } as React.CSSProperties,
    fieldValue: {
      fontSize: '13px',
      color: THEME.textMain,
      fontWeight: '500',
      fontFamily: THEME.fontMono,
      wordBreak: 'break-all',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as React.CSSProperties,
    copyButton: {
      background: 'none',
      border: 'none',
      color: 'rgba(0, 212, 255, 0.6)',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s',
      flexShrink: 0,
    } as React.CSSProperties,
    copyButtonHover: {
      background: 'rgba(0, 212, 255, 0.1)',
      color: '#00D4FF',
    } as React.CSSProperties,
    successText: {
      fontSize: '11px',
      color: '#2EE89C',
      fontWeight: '500',
      fontFamily: THEME.fontMono,
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div>
        <label style={styles.label}>Connection String</label>
        <textarea
          value={connectionString}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="postgresql://user:password@host:5432/database&#10;mysql://user:password@host:3306/database&#10;mongodb+srv://user:password@cluster.mongodb.net/database"
          style={{
            ...styles.textarea,
            ...(focused ? styles.textareaFocus : {}),
          }}
        />
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={16} color="#FF4560" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={styles.errorText}>{error}</div>
        </div>
      )}

      {parsedData && (
        <div>
          <label style={styles.label}>Parsed Connection Details</label>
          <div style={styles.parsedSection}>
            {[
              { label: 'Type', value: parsedData.type, key: 'type' },
              { label: 'Host', value: parsedData.host, key: 'host' },
              { label: 'Port', value: String(parsedData.port), key: 'port' },
              { label: 'Database', value: parsedData.database, key: 'database' },
              { label: 'Username', value: parsedData.username, key: 'username' },
              { label: 'Password', value: parsedData.password ? '••••••••' : '(none)', key: 'password' },
              { label: 'SSL', value: parsedData.ssl ? 'Required' : 'Optional', key: 'ssl' },
            ].map((field) => (
              <div key={field.key} style={styles.fieldCard}>
                <div style={styles.fieldLabel}>{field.label}</div>
                <div style={styles.fieldValue}>
                  <span>{field.value}</span>
                  {field.value && field.value !== '(none)' && (
                    <button
                      onClick={() => handleCopyField(field.key, field.value)}
                      style={{
                        ...styles.copyButton,
                        ...(copiedIndex === field.key ? styles.copyButtonHover : {}),
                      }}
                      title="Copy to clipboard"
                    >
                      {copiedIndex === field.key ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>
                {copiedIndex === field.key && (
                  <div style={styles.successText}>Copied!</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStringParser;
