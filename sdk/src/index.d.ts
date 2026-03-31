/**
 * VIGIL SDK TypeScript definitions
 */

declare class VigilSDK {
  apiKey: string;
  endpoint: string;
  environment: string;
  appName: string;
  batchSize: number;
  flushInterval: number;
  debug: boolean;
  queue: Event[];
  sessionId: string;

  constructor(options: VigilOptions);

  trackAPI(options: TrackAPIOptions): void;
  trackError(options: TrackErrorOptions): void;
  trackAudit(options: TrackAuditOptions): void;
  trackMetric(options: TrackMetricOptions): void;
  track(eventType: string, options: TrackCustomOptions): void;

  expressMiddleware(): (req: any, res: any, next: any) => void;
  captureUncaughtExceptions(): void;

  start(): void;
  flush(): Promise<void>;
  heartbeat(status?: string, metadata?: Record<string, any>): Promise<void>;
  shutdown(): Promise<void>;

  on(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
  removeAllListeners(event?: string): this;
}

interface VigilOptions {
  apiKey: string;
  endpoint: string;
  appName?: string;
  environment?: string;
  batchSize?: number;
  flushInterval?: number;
  debug?: boolean;
}

interface TrackAPIOptions {
  method: string;
  endpoint: string;
  statusCode: number;
  durationMs: number;
  metadata?: Record<string, any>;
}

interface TrackErrorOptions {
  error: Error | string | Record<string, any>;
  title?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, any>;
}

interface TrackAuditOptions {
  title: string;
  message?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, any>;
}

interface TrackMetricOptions {
  title: string;
  value: number;
  unit?: string;
  metadata?: Record<string, any>;
}

interface TrackCustomOptions {
  title?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  message?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

interface Event {
  type: string;
  title: string;
  severity: string;
  metadata: Record<string, any>;
  timestamp: string;
  sessionId: string;
  appName: string;
  environment: string;
}

export default VigilSDK;
export { VigilSDK };
