// @ts-nocheck
import React from 'react';
import { THEME } from '../../utils/theme.jsx';
import { AlertTriangle, AlertCircle, Wifi, Lock, Clock, Server, RotateCcw, Home } from 'lucide-react';

interface SectionErrorBoundaryProps {
  children?: React.ReactNode;
  sectionName?: string;
  onRetry?: () => void;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  category: string | null;
  retryCount: number;
}

interface ErrorCategory {
  type: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

interface ErrorInfo {
  title: string;
  message: string;
  recovery: string;
}

const categorizeError = (error: Error | null): ErrorCategory => {
  const msg = error?.message?.toLowerCase() || '';
  const icons = {
    connection_lost: Wifi,
    permission_denied: Lock,
    query_timeout: Clock,
    server_unavailable: Server,
    unknown: AlertTriangle,
  };

  if (msg.includes('connection') || msg.includes('network') || msg.includes('timeout')) {
    return { type: 'connection_lost', icon: icons.connection_lost };
  }
  if (msg.includes('permission') || msg.includes('forbidden') || msg.includes('401') || msg.includes('403')) {
    return { type: 'permission_denied', icon: icons.permission_denied };
  }
  if (msg.includes('timeout') || msg.includes('504') || msg.includes('took too long')) {
    return { type: 'query_timeout', icon: icons.query_timeout };
  }
  if (msg.includes('server') || msg.includes('500') || msg.includes('502') || msg.includes('503')) {
    return { type: 'server_unavailable', icon: icons.server_unavailable };
  }

  return { type: 'unknown', icon: icons.unknown };
};

const getErrorInfo = (category: string): ErrorInfo => {
  const info: Record<string, ErrorInfo> = {
    connection_lost: {
      title: 'Connection Lost',
      message: 'Unable to reach the database. Check your network connection and try again.',
      recovery: 'Check your internet connection and refresh the page.',
    },
    permission_denied: {
      title: 'Permission Denied',
      message: 'You do not have permission to access this resource.',
      recovery: 'Contact your administrator to request access.',
    },
    query_timeout: {
      title: 'Query Timeout',
      message: 'The request took too long to complete.',
      recovery: 'Try again or simplify your query parameters.',
    },
    server_unavailable: {
      title: 'Server Unavailable',
      message: 'The server is temporarily unavailable.',
      recovery: 'Wait a moment and try again. If the issue persists, contact support.',
    },
    unknown: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred in this section.',
      recovery: 'Try refreshing or contact support if the problem continues.',
    },
  };
  return info[category] || info.unknown;
};

class SectionErrorBoundary extends React.Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      category: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Pick<SectionErrorBoundaryState, 'hasError' | 'error'> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const category = categorizeError(error);
    this.setState({
      error,
      errorInfo,
      category: category.type,
    });
    console.error(`[${this.props.sectionName}] Error:`, error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      category: null,
      retryCount: prevState.retryCount + 1,
    }));
    this.props.onRetry?.();
  };

  handleGoToOverview = (): void => {
    window.location.hash = '#overview';
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const errCategory = this.state.category || 'unknown';
    const categoryInfo = categorizeError(this.state.error);
    const ErrorIcon = categoryInfo.icon;
    const info = getErrorInfo(errCategory);

    return (
      <div
        style={{
          width: '100%',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: `linear-gradient(135deg, ${THEME.surface}80, ${THEME.elevated}80)`,
          border: `1px solid ${THEME.borderHot}`,
          borderRadius: '12px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              background: `${THEME.danger}15`,
              borderRadius: '10px',
              border: `1px solid ${THEME.danger}40`,
            }}
          >
            <ErrorIcon size={28} color={THEME.danger} />
          </div>

          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: THEME.textMain,
              marginBottom: '8px',
              fontFamily: THEME.fontBody,
            }}
          >
            {info.title}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: THEME.textMuted,
              marginBottom: '16px',
              lineHeight: '1.5',
              fontFamily: THEME.fontBody,
            }}
          >
            {info.message}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              background: `${THEME.warning}08`,
              border: `1px solid ${THEME.warning}20`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} color={THEME.warning} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div
              style={{
                fontSize: '12px',
                color: THEME.textSub,
                lineHeight: '1.4',
                textAlign: 'left',
                fontFamily: THEME.fontBody,
              }}
            >
              {info.recovery}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={this.handleRetry}
              style={{
                padding: '10px 16px',
                background: THEME.primary,
                color: THEME.void,
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                fontFamily: THEME.fontBody,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = THEME.borderGlow;
                (e.target as HTMLButtonElement).style.boxShadow = `0 0 12px ${THEME.primary}40`;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = THEME.primary;
                (e.target as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <RotateCcw size={14} />
              Retry
            </button>

            <button
              onClick={this.handleGoToOverview}
              style={{
                padding: '10px 16px',
                background: THEME.glassLight,
                color: THEME.textMain,
                border: `1px solid ${THEME.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                fontFamily: THEME.fontBody,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = THEME.border;
                (e.target as HTMLButtonElement).style.borderColor = THEME.borderHot;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = THEME.glassLight;
                (e.target as HTMLButtonElement).style.borderColor = THEME.border;
              }}
            >
              <Home size={14} />
              Overview
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: THEME.void,
                border: `1px solid ${THEME.grid}`,
                borderRadius: '6px',
                fontSize: '10px',
                color: THEME.textMuted,
                fontFamily: THEME.fontMono,
                textAlign: 'left',
                maxHeight: '100px',
                overflow: 'auto',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default SectionErrorBoundary;
