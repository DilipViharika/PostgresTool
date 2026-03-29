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

let sentryClient: any = null;
let config: ErrorTrackerConfig = { enabled: true, debug: false };
const breadcrumbs: Breadcrumb[] = [];
const MAX_BREADCRUMBS = 20;

async function initSentry(cfg: ErrorTrackerConfig) {
  if (!cfg.dsn) return false;

  try {
    const Sentry = await import('@sentry/react');
    sentryClient = Sentry;
    Sentry.init({
      dsn: cfg.dsn,
      environment: cfg.environment || 'production',
      release: cfg.release,
      tracesSampleRate: cfg.sampleRate || 0.1,
      debug: cfg.debug || false,
    });
    if (cfg.debug) console.log('[VIGIL-ERROR] Sentry initialized');
    return true;
  } catch (error) {
    if (cfg.debug) console.warn('[VIGIL-ERROR] Sentry not available, using fallback');
    return false;
  }
}

const errorTracker: ErrorTracker = {
  init: async (cfg: ErrorTrackerConfig) => {
    config = { ...config, ...cfg };
    if (!config.enabled) return;

    if (cfg.dsn) {
      await initSentry(cfg);
    }
  },

  captureException: (error: Error, context?: Record<string, any>) => {
    if (!config.enabled) return;

    if (sentryClient) {
      sentryClient.captureException(error, { extra: context });
    } else {
      const contextStr = context ? JSON.stringify(context, null, 2) : '';
      console.error(
        `[VIGIL-ERROR] Exception: ${error.message}\n${error.stack}${contextStr ? '\nContext: ' + contextStr : ''}`
      );
    }
  },

  captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'error') => {
    if (!config.enabled) return;

    if (sentryClient) {
      sentryClient.captureMessage(message, level);
    } else {
      console[level as 'log' | 'warn' | 'error'](`[VIGIL-ERROR] ${level.toUpperCase()}: ${message}`);
    }
  },

  setUser: (user: { id: string; email?: string; username?: string } | null) => {
    if (!config.enabled) return;

    if (sentryClient) {
      if (user) {
        sentryClient.setUser(user);
      } else {
        sentryClient.setUser(null);
      }
    }
  },

  addBreadcrumb: (breadcrumb: { category: string; message: string; level?: string }) => {
    if (!config.enabled) return;

    const bc: Breadcrumb = {
      ...breadcrumb,
      timestamp: Date.now(),
    };

    breadcrumbs.push(bc);
    if (breadcrumbs.length > MAX_BREADCRUMBS) {
      breadcrumbs.shift();
    }

    if (sentryClient) {
      sentryClient.addBreadcrumb(bc);
    }
  },

  startTransaction: (name: string) => {
    const startTime = Date.now();

    if (sentryClient?.startTransaction) {
      const transaction = sentryClient.startTransaction({ name });
      return {
        finish: () => transaction.finish(),
      };
    }

    return {
      finish: () => {
        const duration = Date.now() - startTime;
        if (config.debug) console.log(`[VIGIL-ERROR] Transaction "${name}" completed in ${duration}ms`);
      },
    };
  },

  withScope: (callback: (scope: any) => void) => {
    if (sentryClient?.withScope) {
      sentryClient.withScope(callback);
    } else {
      callback({});
    }
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
