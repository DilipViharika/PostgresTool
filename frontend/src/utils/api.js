import { isDemoMode, getDemoData } from './demoData.js';

const API_BASE = import.meta.env.VITE_API_URL || (() => { console.warn('VITE_API_URL not set, using relative URLs'); return ''; })();

// ── Request deduplication ──────────────────────────────────────────────────
// Prevents duplicate GET requests to the same URL while one is in-flight.
const inflightRequests = new Map();

// ── Default request timeout (30 seconds) ───────────────────────────────────
const DEFAULT_TIMEOUT_MS = 30_000;

export const fetchMetrics = async () => {
    if (isDemoMode()) return getDemoData('/api/metrics');
    const res = await fetch(`${API_BASE}/api/metrics`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    return res.json();
};

function getAuthHeaders() {
    const token = localStorage.getItem('vigil_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Get the currently active connectionId from localStorage.
 * The ConnectionContext persists this so API calls automatically target the right DB.
 */
function getActiveConnectionId() {
    try { return localStorage.getItem('vigil_active_connection_id') || null; }
    catch { return null; }
}

/**
 * Append ?connectionId=X to a path, if an active connection is set and
 * the path is a monitoring endpoint (not auth / connections / feedback / admin-meta).
 */
function appendConnectionId(path) {
    const connId = getActiveConnectionId();
    if (!connId) return path;

    // Don't forward connectionId to these endpoints (they use the app's own pool)
    const skipPatterns = [
        '/api/auth',
        '/api/connections',
        '/api/feedback',
        '/api/admin/feedback',
        '/api/users',
        '/api/sessions',
        '/api/audit',
        '/api/repo',
    ];
    if (skipPatterns.some(p => path.startsWith(p))) return path;

    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}connectionId=${connId}`;
}

async function request(path, options = {}) {
    // ── Demo mode: return mock data without hitting backend ──────────────
    if (isDemoMode()) {
        // Simulate a small network delay for realism
        await new Promise(r => setTimeout(r, Math.random() * 300 + 100));
        return getDemoData(path);
    }

    const isGet = options.method === 'GET' || !options.method;
    const resolvedPath = isGet ? appendConnectionId(path) : path;
    const url = resolvedPath.startsWith('http') ? resolvedPath : `${API_BASE}${resolvedPath}`;

    // ── Deduplicate identical in-flight GET requests ─────────────────────
    if (isGet && inflightRequests.has(url)) {
        return inflightRequests.get(url).catch(err => { inflightRequests.delete(url); throw err; });
    }

    // ── AbortController with configurable timeout ───────────────────────
    const controller = new AbortController();
    const timeoutMs = options.timeout || DEFAULT_TIMEOUT_MS;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const promise = (async () => {
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
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Session expired. Please sign in again.');
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Request failed (${res.status})`);
            }

            return res.json();
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error(`Request to ${path} timed out after ${timeoutMs}ms`);
            }
            throw err;
        } finally {
            clearTimeout(timeoutId);
            if (isGet) inflightRequests.delete(url);
        }
    })();

    // Store the promise so duplicate GET calls share the same in-flight request
    if (isGet) inflightRequests.set(url, promise);

    return promise;
}

// --- POLLING REPLACEMENT FOR WEBSOCKET ---
// WebSockets are not supported on Vercel (serverless). This polls /api/alerts/recent instead.
export function connectWS(onMessage, intervalMs = 10000) {
    // Demo mode: simulate a connected state with no real alerts
    if (isDemoMode()) {
        if (onMessage) setTimeout(() => onMessage({ type: 'snapshot' }), 500);
        return () => {};
    }

    const token = localStorage.getItem('vigil_token');
    if (!token) return () => {};

    let lastAlertId = null;
    let stopped = false;

    // Exponential backoff state
    let retryCount = 0;
    let reconnectDelay = 1000; // Start with 1 second
    const MAX_DELAY = 30000; // Max 30 seconds
    const MAX_RETRIES = 10;
    let reconnectTimer = null;

    const poll = async () => {
        if (stopped) return;
        try {
            const res = await fetch(`${API_BASE}/api/alerts/recent?limit=10`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: AbortSignal.timeout(10000),
            });
            if (!res.ok) return;
            const data = await res.json();

            // Connection successful: reset backoff state
            retryCount = 0;
            reconnectDelay = 1000;

            // Signal "connected" on first successful poll
            if (lastAlertId === null) {
                if (onMessage) onMessage({ type: 'snapshot' });
            }

            // Only fire if there are new alerts since last poll
            if (data.alerts && data.alerts.length > 0) {
                const newestId = data.alerts[0].id;
                if (newestId !== lastAlertId) {
                    if (lastAlertId !== null) {
                        // Emit only alerts that appeared AFTER the last-seen alert.
                        // data.alerts is sorted newest-first; slice up to the position of
                        // lastAlertId so we never re-emit already-seen entries.
                        const cutoff = data.alerts.findIndex(a => a.id === lastAlertId);
                        const newAlerts = cutoff === -1
                            ? data.alerts            // entire window is new (edge case: window scrolled)
                            : data.alerts.slice(0, cutoff);
                        newAlerts.forEach(alert => {
                            if (onMessage) onMessage({ type: 'alert', payload: alert });
                        });
                    }
                    lastAlertId = newestId;
                }
            }
        } catch (e) {
            console.error('Alert poll error', e);

            // Connection failed: apply exponential backoff
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                reconnectTimer = setTimeout(poll, reconnectDelay);
                // Double the delay up to max
                reconnectDelay = Math.min(reconnectDelay * 2, MAX_DELAY);
            } else {
                console.warn(`Alert poll: max retries (${MAX_RETRIES}) exceeded, stopping reconnection attempts`);
            }
        }
    };

    // Immediate first poll
    poll();
    const timer = setInterval(poll, intervalMs);

    // Return cleanup function (mirrors old WS cleanup interface)
    return () => {
        stopped = true;
        clearInterval(timer);
        if (reconnectTimer) clearTimeout(reconnectTimer);
    };
}

export async function fetchData(path) {
    return request(path, { method: 'GET' });
}

export async function postData(path, body = {}) {
    return request(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function putData(path, body = {}) {
    return request(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function patchData(path, body = {}) {
    return request(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function deleteData(path) {
    return request(path, { method: 'DELETE' });
}

/**
 * Persist the active connectionId so all subsequent fetchData calls target that DB.
 * Called by ConnectionContext when the user switches connections.
 */
export function setActiveConnectionId(id) {
    try {
        if (id == null) localStorage.removeItem('vigil_active_connection_id');
        else localStorage.setItem('vigil_active_connection_id', String(id));
    } catch {}
}

export { API_BASE };
export default { fetchData, postData, putData, patchData, deleteData, connectWS, API_BASE, setActiveConnectionId };
