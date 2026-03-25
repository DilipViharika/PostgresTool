/**
 * NoConnectionBanner.tsx
 * Reusable component shown when no database is connected.
 * Matches VIGIL design with glassmorphism, cyan accents, and animations.
 */
import React, { useState, useEffect } from 'react';
import { Database, Plus, Shield, Key, Wifi, Zap } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useConnection } from '../../context/ConnectionContext';
import { THEME, useAdaptiveTheme } from '../../utils/theme.jsx';

interface NoConnectionBannerProps {
  title?: string;
  description?: string;
  showAddButton?: boolean;
}

const NoConnectionBanner: React.FC<NoConnectionBannerProps> = ({
  title = 'No Database Connected',
  description = 'Create a new connection or select an existing one to get started.',
  showAddButton = true,
}) => {
  useAdaptiveTheme();
  const { goToTab } = useNavigation();
  const { connections } = useConnection();
  const [borderGlow, setBorderGlow] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBorderGlow(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddConnection = (): void => {
    goToTab('pool');
  };

  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      margin: '20px 0',
      padding: '24px',
      borderRadius: '12px',
      background: `linear-gradient(135deg, rgba(0, 212, 255, 0.03) 0%, rgba(42, 255, 212, 0.02) 100%)`,
      border: `1.5px solid ${borderGlow ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 212, 255, 0.12)'}`,
      backdropFilter: 'blur(8px)',
      boxShadow: borderGlow
        ? '0 0 20px rgba(0, 212, 255, 0.15), inset 0 0 20px rgba(0, 212, 255, 0.05)'
        : '0 8px 32px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      overflow: 'hidden',
    } as React.CSSProperties,
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      position: 'relative',
      zIndex: 2,
    } as React.CSSProperties,
    iconWrapper: {
      position: 'relative',
      flexShrink: 0,
      width: '56px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      background: 'rgba(0, 212, 255, 0.08)',
      border: '1px solid rgba(0, 212, 255, 0.2)',
      animation: borderGlow ? 'pulse 2s ease-in-out infinite' : 'none',
    } as React.CSSProperties,
    textContent: {
      flex: 1,
    } as React.CSSProperties,
    title: {
      fontSize: '16px',
      fontWeight: '600',
      color: THEME.textMain,
      margin: '0 0 6px 0',
      fontFamily: THEME.fontBody,
    } as React.CSSProperties,
    description: {
      fontSize: '13px',
      color: THEME.textMuted,
      margin: '0 0 12px 0',
      lineHeight: '1.5',
      fontFamily: THEME.fontBody,
    } as React.CSSProperties,
    chipsContainer: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      margin: '12px 0 0 0',
    } as React.CSSProperties,
    chip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '500',
      background: 'rgba(0, 212, 255, 0.05)',
      border: '1px solid rgba(0, 212, 255, 0.15)',
      color: THEME.textMuted,
      fontFamily: THEME.fontMono,
    } as React.CSSProperties,
    buttonsContainer: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexShrink: 0,
    } as React.CSSProperties,
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
      fontFamily: THEME.fontBody,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,
    buttonPrimary: {
      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(42, 255, 212, 0.1) 100%)',
      border: '1px solid rgba(0, 212, 255, 0.4)',
      color: '#00D4FF',
    } as React.CSSProperties,
    buttonPrimaryHover: {
      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.35) 0%, rgba(42, 255, 212, 0.2) 100%)',
      border: '1px solid rgba(0, 212, 255, 0.6)',
      boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
      transform: 'translateY(-2px)',
    } as React.CSSProperties,
    decorativeBackground: {
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(circle 600px at 20% 50%, rgba(0, 212, 255, 0.04) 0%, transparent 100%)`,
      pointerEvents: 'none',
      zIndex: 1,
    } as React.CSSProperties,
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .no-conn-banner-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
          animation: shimmer 3s infinite;
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.decorativeBackground} />
        <div className="no-conn-banner-shimmer" />

        <div style={styles.content}>
          <div style={styles.iconWrapper}>
            <Database size={28} color="#00D4FF" strokeWidth={1.5} />
          </div>

          <div style={styles.textContent}>
            <h3 style={styles.title}>{title}</h3>
            <p style={styles.description}>{description}</p>
            <div style={styles.chipsContainer}>
              <div style={styles.chip}>
                <Shield size={12} />
                Host & Port
              </div>
              <div style={styles.chip}>
                <Database size={12} />
                Database Name
              </div>
              <div style={styles.chip}>
                <Key size={12} />
                Credentials
              </div>
              <div style={styles.chip}>
                <Wifi size={12} />
                SSL Optional
              </div>
            </div>
          </div>

          {showAddButton && (
            <div style={styles.buttonsContainer}>
              <button
                onClick={handleAddConnection}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...(isHovering ? styles.buttonPrimaryHover : {}),
                }}
              >
                <Plus size={16} />
                Add Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NoConnectionBanner;
