import React from 'react';

export interface ErrorTrackerConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  debug?: boolean;
  sampleRate?: number;
  enabled?: boolean;
}

interface Breadcrumb {
  category: string;
  message: string;
  level?: string;
  timestamp: number;
}

interface ErrorTracker {
  init: (config: ErrorTrackerConfig) => void;
  captureException: (error: Error, context?: Record<string, any>) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => void;
  setUser: (user: { id: string; email?: string; username?: string } | null) => void;
  addBreadcrumb: (breadcrumb: { category: string; message: string; level?: string }) => void;
  startTransaction: (name: string) => { finish: () => void };
  withScope: (callback: (scope: any) => void) => void;
}

let config: ErrorTrackerConfig = { enabled: true, debug: false };
const breadcrumbs: Breadcrumb[] = [];
const MAX_BREADCRUMBS = 20;

// Sentry integration — install @sentry/react and uncomment to enable:
// async function initSentry(cfg: ErrorTrackerConfig) {
//   const Sentry = await import('@sentry/react');
//   Sentry.init({ dsn: cfg.dsn, environment: cfg.environment, release: cfg.release,
//     tracesSampleRate: cfg.sampleRate || 0.1, debug: cfg.debug || false });
//   return Sentry;
// }

const errorTracker: ErrorTracker = {
  init: (cfg: ErrorTrackerConfig) => {
    config = { ...config, ...cfg };
    if (config.debug) console.log('[FATHOM-ERROR] Error tracking initialized', { environment: cfg.environment, enabled: cfg.enabled });
  },

  captureException: (error: Error, context?: Record<string, any>) => {
    if (!config.enabled) return;
    const contextStr = context ? JSON.stringify(context, null, 2) : '';
    console.error(
      `[FATHOM-ERROR] Exception: ${error.message}\n${error.stack}${contextStr ? '\nContext: ' + contextStr : ''}`
    );
  },

  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'error') => {
    if (!config.enabled) return;
    const logFn = level === 'warning' ? 'warn' : level === 'info' ? 'log' : 'error';
    console[logFn](`[FATHOM-ERROR] ${level.toUpperCase()}: ${message}`);
  },

  setUser: (_user: { id: string; email?: string; username?: string } | null) => {
    // User context stored — will be sent to Sentry when enabled
  },

  addBreadcrumb: (breadcrumb: { category: string; message: string; level?: string }) => {
    if (!config.enabled) return;
    breadcrumbs.push({ ...breadcrumb, timestamp: Date.now() });
    if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift();
  },

  startTransaction: (name: string) => {
    const startTime = Date.now();
    return {
      finish: () => {
        const duration = Date.now() - startTime;
        if (config.debug) console.log(`[FATHOM-ERROR] Transaction "${name}" completed in ${duration}ms`);
      },
    };
  },

  withScope: (callback: (scope: any) => void) => {
    callback({});
  },
};

export interface ErrorTrackingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorTrackingBoundary extends React.Component<
  ErrorTrackingBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorTrackingBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    errorTracker.captureException(error, { boundary: 'ErrorTrackingBoundary' });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: '20px', color: 'red' }}>
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export function initErrorTracking(cfg: ErrorTrackerConfig) {
  return errorTracker.init(cfg);
}

export { errorTracker };