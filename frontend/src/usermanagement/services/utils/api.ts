/**
 * API Service — all HTTP calls live here.
 *
 * In development the helpers below hit the real backend.
 * Replace the base URL or swap this file for an MSW handler in tests.
 *
 * Every function returns the parsed JSON body or throws an Error
 * with a human-readable message drawn from the server response.
 */

const BASE = '/api';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiError {
  error?: string;
}

interface User {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  [key: string]: any;
}

/**
 * Shared fetch wrapper with auth header and error normalisation
 */
async function request(path: string, options: RequestOptions = {}): Promise<any> {
  const token = localStorage.getItem('vigil_token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({})));
    throw new Error((body as ApiError).error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const UserAPI = {
  /** List all users */
  list: (): Promise<User[]> => request('/users'),

  /** Create a new user */
  create: (data: Partial<User>): Promise<any> =>
    request('/users', { method: 'POST', body: JSON.stringify(data) }),

  /** Update a user */
  update: (id: string | number, data: Partial<User>): Promise<any> =>
    request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** Delete a user */
  remove: (id: string | number): Promise<any> =>
    request(`/users/${id}`, { method: 'DELETE' }),

  /** Bulk delete users */
  bulkDelete: (ids: (string | number)[]): Promise<any> =>
    request('/users/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),

  /** Reset user password */
  resetPassword: (id: string | number, newPassword: string): Promise<any> =>
    request(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),
};

// ─── Feedback ─────────────────────────────────────────────────────────────────

interface FeedbackPayload {
  [key: string]: any;
}

interface FeedbackParams {
  [key: string]: string | number | undefined;
}

export const FeedbackAPI = {
  /** Submit feedback */
  submit: (payload: FeedbackPayload): Promise<any> =>
    request('/feedback', { method: 'POST', body: JSON.stringify(payload) }),

  /** List all feedback (admin only) */
  list: (params: FeedbackParams = {}): Promise<any> => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]))
    ).toString();
    return request(`/admin/feedback${qs ? `?${qs}` : ''}`);
  },

  /** Update feedback status */
  updateStatus: (id: string | number, status: string): Promise<any> =>
    request(`/admin/feedback/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  /** Get feedback summary */
  summary: (): Promise<any> => request('/admin/feedback/summary'),
};

// ─── Audit ────────────────────────────────────────────────────────────────────

interface AuditOptions {
  limit?: number;
  level?: string;
  [key: string]: any;
}

interface AuditEvent {
  [key: string]: any;
}

export const AuditAPI = {
  /** List audit events */
  list: (opts: AuditOptions = {}): Promise<AuditEvent[]> => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined))
    ).toString();
    return request(`/audit${qs ? `?${qs}` : ''}`);
  },
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

interface Session {
  [key: string]: any;
}

export const SessionAPI = {
  /** List all sessions */
  list: (): Promise<Session[]> => request('/sessions'),

  /** Revoke a specific session */
  revoke: (id: string | number): Promise<any> =>
    request(`/sessions/${id}`, { method: 'DELETE' }),

  /** Revoke all sessions */
  revokeAll: (): Promise<any> => request('/sessions', { method: 'DELETE' }),
};

// ─── API Keys ─────────────────────────────────────────────────────────────────

interface ApiKey {
  [key: string]: any;
}

export const ApiKeyService = {
  /** List all API keys */
  list: (): Promise<ApiKey[]> => request('/api-keys'),

  /** Create a new API key */
  create: (): Promise<ApiKey> => request('/api-keys', { method: 'POST' }),

  /** Revoke an API key */
  revoke: (id: string | number): Promise<any> =>
    request(`/api-keys/${id}`, { method: 'DELETE' }),
};
