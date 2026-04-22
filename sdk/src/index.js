/**
 * FATHOM SDK — Lightweight JavaScript SDK for observability
 * Zero dependencies, built-in batching, auto-capture for Express
 */

import { FathomTracer } from './core/tracer.js';
import { SpanBatcher } from './core/spanBatcher.js';

// Inline EventEmitter for Node.js compatibility
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;
    this.events[event].forEach(listener => listener(...args));
    return true;
  }

  off(event, listener) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  removeAllListeners(event) {
    if (event) delete this.events[event];
    else this.events = {};
    return this;
  }
}

/**
 * FathomSDK class — Main entry point for observability
 */
class FathomSDK extends EventEmitter {
  constructor(options = {}) {
    super();

    // Required options
    if (!options.apiKey) {
      throw new Error('[FATHOM SDK] apiKey is required (e.g., sk_live_xxx)');
    }
    if (!options.endpoint) {
      throw new Error('[FATHOM SDK] endpoint is required (e.g., https://fathom.example.com)');
    }

    // Configuration
    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint.replace(/\/$/, ''); // Remove trailing slash
    this.environment = options.environment || 'production';
    this.appName = options.appName || 'unnamed-app';
    this.batchSize = options.batchSize || 50;
    this.flushInterval = options.flushInterval || 10000; // 10 seconds
    this.debug = options.debug || false;

    // Internal state
    this.queue = [];
    this.flushTimer = null;
    this.isShuttingDown = false;
    this.sessionId = this._generateId();

    // Initialize tracing
    this.tracing = new FathomTracer(this);
    this.spanBatcher = new SpanBatcher(this, 100, this.flushInterval);
    this.tracing.registerBatcher(this.spanBatcher);
    this.spanBatcher.start();

    this._log('[SDK initialized]', {
      endpoint: this.endpoint,
      appName: this.appName,
      environment: this.environment,
    });
  }

  /**
   * Track an API call
   */
  trackAPI({ method, endpoint, statusCode, durationMs, metadata = {} }) {
    this._enqueue({
      type: 'api',
      title: `${method} ${endpoint}`,
      severity: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warning' : 'info',
      metadata: {
        method,
        endpoint,
        statusCode,
        durationMs,
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track an error
   */
  trackError({ error, title, severity = 'error', metadata = {} }) {
    // Extract error details if error is an Error object
    let errorDetails = {};
    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      title = title || error.message || 'Unknown Error';
    } else if (typeof error === 'string') {
      errorDetails = { message: error };
      title = title || error;
    } else if (error && typeof error === 'object') {
      errorDetails = error;
      title = title || JSON.stringify(error);
    }

    this._enqueue({
      type: 'error',
      title: title || 'Error',
      severity,
      metadata: {
        ...errorDetails,
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track an audit event
   */
  trackAudit({ title, message, metadata = {}, severity = 'info' }) {
    this._enqueue({
      type: 'audit',
      title: title || 'Audit Event',
      severity,
      metadata: {
        message,
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track a custom metric
   */
  trackMetric({ title, value, unit = '', metadata = {} }) {
    this._enqueue({
      type: 'metric',
      title: title || 'Metric',
      severity: 'info',
      metadata: {
        value,
        unit,
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track a custom event
   */
  track(eventType, { title, severity = 'info', message, metadata = {}, tags = [] } = {}) {
    this._enqueue({
      type: eventType,
      title: title || 'Custom Event',
      severity,
      metadata: {
        message,
        tags,
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Express middleware — auto-track all HTTP requests
   */
  expressMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      const originalEnd = res.end;

      res.end = (...args) => {
        const duration = Date.now() - start;
        const endpoint = req.originalUrl || req.url;

        this.trackAPI({
          method: req.method,
          endpoint,
          statusCode: res.statusCode,
          durationMs: duration,
          metadata: {
            userAgent: req.headers?.['user-agent'] || 'unknown',
            ip: req.ip || req.connection?.remoteAddress || 'unknown',
            contentLength: res.getHeader?.('content-length') || 0,
          },
        });

        originalEnd.apply(res, args);
      };

      next();
    };
  }

  /**
   * Capture uncaught exceptions and unhandled rejections (Node.js only)
   */
  captureUncaughtExceptions() {
    if (typeof process === 'undefined' || !process.on) {
      this._log('[captureUncaughtExceptions] Not in Node.js environment, skipping');
      return;
    }

    process.on('uncaughtException', (err) => {
      this.trackError({
        error: err,
        severity: 'critical',
        title: 'Uncaught Exception',
        metadata: { type: 'uncaughtException' },
      });
      this.flush(); // Flush immediately for critical errors
    });

    process.on('unhandledRejection', (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.trackError({
        error,
        severity: 'error',
        title: 'Unhandled Rejection',
        metadata: { type: 'unhandledRejection' },
      });
    });

    this._log('[SDK] Uncaught exception handlers installed');
  }

  /**
   * Internal: enqueue an event
   */
  _enqueue(event) {
    if (this.isShuttingDown) {
      this._log('[WARN] SDK is shutting down, event dropped:', event.type);
      return;
    }

    this.queue.push({
      ...event,
      sessionId: this.sessionId,
      appName: this.appName,
      environment: this.environment,
    });

    this._log(`[Queue] Event added (${this.queue.length}/${this.batchSize}):`, event.type);

    // Auto-flush if queue exceeds batchSize
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush all queued events to FATHOM
   */
  async flush() {
    if (this.queue.length === 0) {
      this._log('[Flush] Queue is empty, nothing to send');
      return;
    }

    const batch = this.queue.splice(0, this.batchSize);
    this._log(`[Flush] Sending ${batch.length} events to FATHOM`);

    try {
      const response = await fetch(`${this.endpoint}/api/sdk/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SDK-Key': this.apiKey,
        },
        body: JSON.stringify({ events: batch }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      this._log(`[Flush] Success (${batch.length} events)`);
      this.emit('flush', { count: batch.length, timestamp: new Date() });
    } catch (error) {
      this._log('[ERROR] Flush failed:', error.message);
      // Re-queue events on failure
      this.queue.unshift(...batch);
      this.emit('error', { error, batch });
    }
  }

  /**
   * Send a heartbeat to FATHOM
   */
  async heartbeat(status = 'healthy', metadata = {}) {
    this._log('[Heartbeat] Sending heartbeat:', status);

    try {
      const response = await fetch(`${this.endpoint}/api/sdk/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SDK-Key': this.apiKey,
        },
        body: JSON.stringify({
          status,
          sessionId: this.sessionId,
          appName: this.appName,
          environment: this.environment,
          queueSize: this.queue.length,
          timestamp: new Date().toISOString(),
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this._log('[Heartbeat] Success');
      this.emit('heartbeat', { status, timestamp: new Date() });
    } catch (error) {
      this._log('[WARN] Heartbeat failed:', error.message);
    }
  }

  /**
   * Start the auto-flush timer
   */
  start() {
    if (this.flushTimer) {
      this._log('[WARN] Auto-flush already running');
      return;
    }

    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);

    this._log(`[Start] Auto-flush enabled (interval: ${this.flushInterval}ms)`);
  }

  /**
   * Stop the auto-flush timer and flush remaining events
   */
  async shutdown() {
    this._log('[Shutdown] Initiating SDK shutdown...');
    this.isShuttingDown = true;

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush any remaining events
    if (this.queue.length > 0) {
      await this.flush();
    }

    // Flush any remaining spans
    await this.spanBatcher.shutdown();

    this._log('[Shutdown] Complete');
    this.emit('shutdown', { timestamp: new Date() });
  }

  /**
   * Internal: generate a unique ID
   */
  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Internal: debug logging
   */
  _log(...args) {
    if (this.debug) {
      console.log('[FATHOM]', ...args);
    }
  }
}

export default FathomSDK;
export { FathomSDK };
