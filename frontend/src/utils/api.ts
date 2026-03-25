/**
 * utils/api.ts — Typed HTTP client for VIGIL frontend
 * ────────────────────────────────────────────────────
 * Drop-in replacement for api.js with full TypeScript support.
 * Import from './utils/api' — Vite resolves .ts over .js automatically.
 *
 * Features:
 *  - Generic typed responses: fetchData<T>('/api/alerts') → Promise<T>
 *  - AbortController with configurable timeout
 *  - GET request deduplication
 *  - Auto auth header injection
 *  - connectionId routing for monitoring endpoints
 *  - 401 auto-logout
 */

import { isDemoMode, getDemoData } from './demoData.js';

/** Shape of error responses from the backend */
interface ApiError {
  error?: string;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE: string =
  import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';

const DEFAULT_TIMEOUT_MS = 30_000;

// ── Request deduplication ────────────────────────────────────────────────────
const inflightRequests = new Map<string, Promise<unknown>>();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('vigil_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getActiveConnectionId(): string | null {
  try {
    return localStorage.getItem('vigil_active_connection_id') || null;
  } catch {
    return null;
  }
}

/** Endpoints that use the admin pool (not user-connection-scoped) */
const SKIP_CONNECTION_PATTERNS: readonly string[] = [
  '/api/auth',
  '/api/connections',
  '/api/feedback',
  '/api/admin/feedback',
  '/api/users',
  '/api/sessions',
  '/api/audit',
  '/api/repo',
] as const;

function appendConnectionId(path: string): string {
  const connId = getActiveConnectionId();
  if (!connId) return path;
  if (SKIP_CONNECTION_PATTERNS.some((p) => path.startsWith(p))) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}connectionId=${connId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Options
// ─────────────────────────────────────────────────────────────────────────────

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: string;
  timeout?: number;
  signal?: AbortSignal;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Request Function
// ─────────────────────────────────────────────────────────────────────────────

async function request<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  // ── Demo mode ──────────────────────────────────────────────────────────
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, Math.random() * 300 + 100));
    return getDemoData(path) as T;
  }

  const isGet = options.method === 'GET' || !options.method;
  const resolvedPath = isGet ? appendConnectionId(path) : path;
  const url = resolvedPath.startsWith('http')
    ? resolvedPath
    : `${API_BASE}${resolvedPath}`;

  // ── Deduplicate in-flight GET requests ─────────────────────────────────
  if (isGet && inflightRequests.has(url)) {
    return inflightRequests.get(url) as Promise<T>;
  }

  // ── AbortController with timeout ───────────────────────────────────────
  const controller = new AbortController();
  const timeoutMs = options.timeout || DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const promise = (async (): Promise<T> => {
    try {
      const res = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          ...options.headers,
        },
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:logout'));
        const data: ApiError = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Session expired. Please sign in again.');
      }

      if (!res.ok) {
        const data: ApiError = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      return (await res.json()) as T;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Request to ${path} timed out after ${timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      if (isGet) inflightRequests.delete(url);
    }
  })();

  if (isGet) inflightRequests.set(url, promise);

  return promise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy fetchMetrics (kept for backward compat)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchMetrics = async <T = unknown>(): Promise<T> => {
  if (isDemoMode()) return getDemoData('/api/metrics') as T;
  const res = await fetch(`${API_BASE}/api/metrics`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  return res.json() as Promise<T>;
};

// ─────────────────────────────────────────────────────────────────────────────
// WebSocket Polling (Vercel-compatible)
// ─────────────────────────────────────────────────────────────────────────────

interface WsMessage<T = unknown> {
  type: 'snapshot' | 'alert';
  payload?: T;
}

export function connectWS(
  onMessage?: (msg: WsMessage) => void,
  intervalMs = 10000
): () => void {
  if (isDemoMode()) {
    if (onMessage) setTimeout(() => onMessage({ type: 'snapshot' }), 500);
    return () => {};
  }

  const token = localStorage.getItem('vigil_token');
  if (!token) return () => {};

  let lastAlertId: string | number | null = null;
  let stopped = false;
  let retryCount = 0;
  let reconnectDelay = 1000;
  const MAX_DELAY = 30000;
  const MAX_RETRIES = 10;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const poll = async (): Promise<void> => {
    if (stopped) return;
    try {
      const res = await fetch(`${API_BASE}/api/alerts/recent?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      retryCount = 0;
      reconnectDelay = 1000;

      if (lastAlertId === null) {
        onMessage?.({ type: 'snapshot' });
      }

      if (data.alerts?.length > 0) {
        const newestId = data.alerts[0].id;
        if (newestId !== lastAlertId) {
          if (lastAlertId !== null) {
            const cutoff = data.alerts.findIndex(
              (a: { id: string | number }) => a.id === lastAlertId
            );
            const newAlerts =
              cutoff === -1 ? data.alerts : data.alerts.slice(0, cutoff);
            newAlerts.forEach((alert: unknown) => {
              onMessage?.({ type: 'alert', payload: alert });
            });
          }
          lastAlertId = newestId;
        }
      }
    } catch (e) {
      console.error('Alert poll error', e);
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        reconnectTimer = setTimeout(poll, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, MAX_DELAY);
      }
    }
  };

  poll();
  const timer = setInterval(poll, intervalMs);

  return () => {
    stopped = true;
    clearInterval(timer);
    if (reconnectTimer) clearTimeout(reconnectTimer);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Typed HTTP Methods
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchData<T = unknown>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export async function postData<T = unknown>(
  path: string,
  body: unknown = {}
): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function putData<T = unknown>(
  path: string,
  body: unknown = {}
): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function patchData<T = unknown>(
  path: string,
  body: unknown = {}
): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function deleteData<T = unknown>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export function setActiveConnectionId(id: number | string | null): void {
  try {
    if (id == null) localStorage.removeItem('vigil_active_connection_id');
    else localStorage.setItem('vigil_active_connection_id', String(id));
  } catch {
    // localStorage unavailable (e.g., in tests)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { API_BASE };
export default {
  fetchData,
  postData,
  putData,
  patchData,
  deleteData,
  connectWS,
  API_BASE,
  setActiveConnectionId,
};
