const API_BASE = import.meta.env.VITE_API_URL || (() => { console.warn('VITE_API_URL not set, using relative URLs'); return ''; })();

// ── Request deduplication ──────────────────────────────────────────────────
// Prevents duplicate GET requests to the same URL while one is in-flight.
const inflightRequests = new Map();

// ── Response cache (short TTL to reduce redundant fetches on tab switches) ──
// Caches GET responses for 5 seconds to avoid re-fetching when navigating between tabs
const responseCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 5_000; // 5-second cache

function getCachedResponse(url: string) {
    const entry = responseCache.get(url);
    if (entry && Date.now() < entry.expiry) return entry.data;
    if (entry) responseCache.delete(url);
    return null;
}

function setCachedResponse(url: string, data: any) {
    responseCache.set(url, { data, expiry: Date.now() + CACHE_TTL_MS });
    // Prevent unbounded cache growth
    if (responseCache.size > 100) {
        const oldest = responseCache.keys().next().value;
        responseCache.delete(oldest);
    }
}

// Invalidate cache entries matching a path prefix after mutations
function invalidateCacheFor(path: string) {
    for (const key of responseCache.keys()) {
        if (key.includes(path)) responseCache.delete(key);
    }
}

// ── Default request timeout (30 seconds) ───────────────────────────────────
const DEFAULT_TIMEOUT_MS = 30_000;

// ── SEC-015: CSRF Token Management ─────────────────────────────────────────
// Fetch a fresh CSRF token for each state-changing request (backend invalidates after use)
async function getCsrfToken() {
    try {
        const res = await fetch(`${API_BASE}/api/csrf-token`, {
            headers: getAuthHeaders(),
        });
        if (res.ok) {
            const data = await res.json();
            return data.csrfToken;
        }
    } catch {}
    return null;
}

export const fetchMetrics = async () => {
    const res = await fetch(`${API_BASE}/api/metrics`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    return res.json();
};

function getAuthHeaders() {
    const token = localStorage.getItem('fathom_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Get the currently active connectionId from localStorage.
 * The ConnectionContext persists this so API calls automatically target the right DB.
 */
function getActiveConnectionId() {
    try { return localStorage.getItem('fathom_active_connection_id') || null; }
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
        '/api/sdk',
    ];
    if (skipPatterns.some(p => path.startsWith(p))) return path;

    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}connectionId=${connId}`;
}

async function request(path, options = {}) {
    const isGet = options.method === 'GET' || !options.method;
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method);
    // Always append connectionId to every request type so the backend knows
    // which user-scoped connection to use (prevents cross-user data leakage)
    const resolvedPath = appendConnectionId(path);
    const url = resolvedPath.startsWith('http') ? resolvedPath : `${API_BASE}${resolvedPath}`;

    // ── Check response cache for GET requests ────────────────────────────
    if (isGet) {
        const cached = getCachedResponse(url);
        if (cached) return cached;
    }

    // ── Invalidate cache for state-changing requests ──────────────────────
    if (isStateChanging) {
        invalidateCacheFor(path);
    }

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
            // SEC-015: Fetch CSRF token for state-changing requests (skip for auth endpoints)
            let csrfHeaders = {};
            if (isStateChanging && !path.startsWith('/api/auth')) {
                const csrfToken = await getCsrfToken();
                if (csrfToken) {
                    csrfHeaders['X-CSRF-Token'] = csrfToken;
                }
            }

            const res = await fetch(url, {
                ...options,
                signal: options.signal || controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                    ...csrfHeaders,
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

            const jsonData = await res.json();
            // Cache successful GET responses
            if (isGet) {
                setCachedResponse(url, jsonData);
            }
            return jsonData;
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
    const token = localStorage.getItem('fathom_token');
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
    let pollInterval = setInterval(poll, intervalMs);

    // Visibility-aware polling: pause when tab is hidden, resume when visible
    const visHandler = () => {
        if (document.hidden) {
            clearInterval(pollInterval);
            pollInterval = null;
            // Clear any pending reconnect timers when tab becomes hidden
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
        } else if (!pollInterval) {
            // Do immediate poll before restarting interval when tab becomes visible
            poll();
            pollInterval = setInterval(poll, intervalMs);
        }
    };
    document.addEventListener('visibilitychange', visHandler);

    // Return cleanup function (mirrors old WS cleanup interface)
    return () => {
        stopped = true;
        if (pollInterval) clearInterval(pollInterval);
        if (reconnectTimer) clearTimeout(reconnectTimer);
        document.removeEventListener('visibilitychange', visHandler);
    };
}

/**
 * Manually invalidate the response cache.
 * If pathPrefix is provided, only invalidate entries matching that path.
 * Otherwise, clear the entire cache.
 */
export function invalidateCache(pathPrefix?: string) {
    if (pathPrefix) {
        invalidateCacheFor(pathPrefix);
    } else {
        responseCache.clear();
    }
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
        if (id == null) localStorage.removeItem('fathom_active_connection_id');
        else localStorage.setItem('fathom_active_connection_id', String(id));
    } catch {}
}

export { API_BASE };
export default { fetchData, postData, putData, patchData, deleteData, connectWS, API_BASE, setActiveConnectionId, invalidateCache };