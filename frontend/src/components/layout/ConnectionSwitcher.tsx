// @ts-nocheck
/**
 * ConnectionSwitcher.tsx
 * Dropdown widget for the top navigation bar showing the active connection with quick-switch.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { THEME, useAdaptiveTheme } from '../../utils/theme.jsx';
import { useConnection } from '../../context/ConnectionContext';
import {
  Database, ChevronDown, Search, Check, Loader2,
  Server, AlertCircle, CheckCircle, AlertTriangle
} from 'lucide-react';

interface Connection {
  id: string;
  name: string;
  host: string;
  port: string | number;
  database: string;
  dbType?: string;
}

const ConnectionSwitcher: React.FC = () => {
  useAdaptiveTheme();

  const { connections, activeConnectionId, switchConnection } = useConnection();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeConnection = connections.find((c: Connection) => c.id === activeConnectionId);

  const filteredConnections = connections.filter((c: Connection) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.database.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByType: Record<string, Connection[]> = {
    postgresql: filteredConnections.filter((c: Connection) => (c.dbType || 'postgresql').toLowerCase().includes('postgres')),
    mysql: filteredConnections.filter((c: Connection) => (c.dbType || '').toLowerCase().includes('mysql')),
    mongodb: filteredConnections.filter((c: Connection) => (c.dbType || '').toLowerCase().includes('mongo')),
    other: filteredConnections.filter((c: Connection) =>
      !['postgresql', 'mysql', 'mongodb'].some(t =>
        (c.dbType || 'postgresql').toLowerCase().includes(t)
      )
    ),
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSwitch = useCallback(async (connId: string): Promise<void> => {
    setIsSwitching(true);
    try {
      await switchConnection(connId);
      setIsOpen(false);
      setSearchTerm('');
    } catch (err) {
      console.error('[ConnectionSwitcher] Failed to switch:', err);
    } finally {
      setIsSwitching(false);
    }
  }, [switchConnection]);

  const getDBTypeIcon = (dbType?: string): React.ReactNode => {
    switch ((dbType || 'postgresql').toLowerCase()) {
      case 'mysql': return <Database size={14} color="#00D4FF" />;
      case 'mongodb': return <Server size={14} color="#00D4FF" />;
      case 'postgresql':
      default: return <Database size={14} color="#00D4FF" />;
    }
  };

  const getDBTypeLabel = (dbType?: string): string => {
    const type = (dbType || 'postgresql').toLowerCase();
    if (type.includes('mysql')) return 'MySQL';
    if (type.includes('mongo')) return 'MongoDB';
    return 'PostgreSQL';
  };

  if (!activeConnection) {
    return (
      <div style={styles.emptyState}>
        <Database size={14} color={THEME.textMuted} />
        <span>No connection</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes rotation {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .cs-dropdown {
          animation: dropdownSlide 0.2s ease-out;
        }
        .cs-item {
          transition: all 0.15s ease;
        }
        .cs-item:hover {
          background: ${THEME.surfaceHover};
        }
      `}</style>

      <div style={styles.wrapper} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSwitching || connections.length <= 1}
          style={{
            ...styles.button,
            opacity: isSwitching ? 0.6 : 1,
          }}
          title={`Active: ${activeConnection.name} (Ctrl+K to switch)`}
        >
          <div style={styles.buttonContent}>
            <div style={styles.iconWrapper}>
              {getDBTypeIcon(activeConnection.dbType)}
            </div>
            <span style={styles.buttonLabel}>{activeConnection.name}</span>
            {isSwitching ? (
              <Loader2 size={14} style={{ animation: 'rotation 1s linear infinite' }} />
            ) : (
              <ChevronDown
                size={14}
                style={{
                  transition: 'transform 0.2s ease',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            )}
          </div>
        </button>

        {isOpen && connections.length > 1 && (
          <div style={styles.dropdown} className="cs-dropdown">
            <div style={styles.searchContainer}>
              <Search size={14} color={THEME.textMuted} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.itemsContainer}>
              {Object.entries(groupedByType).map(([type, group]) => {
                if (group.length === 0) return null;

                return (
                  <div key={type}>
                    <div style={styles.groupHeader}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>

                    {group.map((conn: Connection) => (
                      <button
                        key={conn.id}
                        onClick={() => handleSwitch(conn.id)}
                        disabled={isSwitching || conn.id === activeConnectionId}
                        style={{
                          ...styles.item,
                          ...(conn.id === activeConnectionId ? styles.itemActive : {}),
                        }}
                        className="cs-item"
                      >
                        <div style={styles.itemLeft}>
                          <div style={styles.itemIconWrapper}>
                            {getDBTypeIcon(conn.dbType)}
                          </div>
                          <div style={styles.itemTextContent}>
                            <div style={styles.itemName}>
                              {conn.name}
                            </div>
                            <div style={styles.itemHost}>
                              {conn.host}:{conn.port}
                            </div>
                          </div>
                        </div>

                        <div style={styles.itemRight}>
                          {conn.id === activeConnectionId ? (
                            <Check size={14} color={THEME.primary} />
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}

              {filteredConnections.length === 0 && (
                <div style={styles.noResults}>
                  No connections found
                </div>
              )}
            </div>

            <div style={styles.footer}>
              <kbd style={styles.shortcutKey}>Ctrl+K</kbd>
              <span>to toggle</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${THEME.glassBorder}`,
    background: THEME.glass,
    backdropFilter: 'blur(8px)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: THEME.fontBody,
    fontSize: '13px',
    fontWeight: '500',
    color: THEME.textMain,
    minWidth: '180px',
    maxWidth: '220px',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    background: `rgba(0, 212, 255, 0.08)`,
    flexShrink: 0,
  },
  buttonLabel: {
    flex: 1,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '8px',
    width: '280px',
    maxHeight: '420px',
    borderRadius: '10px',
    background: THEME.surface,
    border: `1px solid ${THEME.glassBorder}`,
    backdropFilter: 'blur(12px)',
    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000,
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderBottom: `1px solid ${THEME.glassBorder}`,
    background: THEME.surfaceHover,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    color: THEME.textMain,
    fontSize: '12px',
    fontFamily: THEME.fontBody,
    outline: 'none',
    padding: 0,
  },
  itemsContainer: {
    flex: 1,
    overflowY: 'auto',
  },
  groupHeader: {
    padding: '10px 12px 6px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: THEME.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderTop: `1px solid ${THEME.glassBorder}`,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    color: THEME.textMain,
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: THEME.fontBody,
    textAlign: 'left',
  },
  itemActive: {
    background: `rgba(0, 212, 255, 0.08)`,
    border: `1px solid ${THEME.primary}`,
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  itemIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: `rgba(0, 212, 255, 0.06)`,
    flexShrink: 0,
  },
  itemTextContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden',
  },
  itemName: {
    fontSize: '12px',
    fontWeight: '600',
    color: THEME.textMain,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemHost: {
    fontSize: '11px',
    color: THEME.textMuted,
    fontFamily: THEME.fontMono,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  noResults: {
    padding: '20px 12px',
    textAlign: 'center',
    fontSize: '12px',
    color: THEME.textMuted,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderTop: `1px solid ${THEME.glassBorder}`,
    fontSize: '11px',
    color: THEME.textMuted,
    background: THEME.surfaceHover,
  },
  shortcutKey: {
    padding: '2px 6px',
    borderRadius: '4px',
    border: `1px solid ${THEME.glassBorder}`,
    background: THEME.glass,
    fontFamily: THEME.fontMono,
    fontSize: '10px',
    color: THEME.textMain,
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${THEME.glassBorder}`,
    background: THEME.glass,
    fontSize: '13px',
    color: THEME.textMuted,
    opacity: 0.6,
  },
};

export default ConnectionSwitcher;
