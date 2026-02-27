const API_BASE = import.meta.env.VITE_API_URL || 'https://postgrestoolbackend.vercel.app';

export const fetchMetrics = async () => {
    const res = await fetch(`${API_BASE}/api/metrics`);
    return res.json();
};

function getAuthHeaders() {
    const token = localStorage.getItem('vigil_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

    const res = await fetch(url, {
        ...options,
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
}

// --- POLLING REPLACEMENT FOR WEBSOCKET ---
// WebSockets are not supported on Vercel (serverless). This polls /api/alerts/recent instead.
export function connectWS(onMessage, intervalMs = 10000) {
    const token = localStorage.getItem('vigil_token');
    if (!token) return () => {};

    let lastAlertId = null;
    let stopped = false;

    const poll = async () => {
        if (stopped) return;
        try {
            const res = await fetch(`${API_BASE}/api/alerts/recent?limit=10`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const data = await res.json();

            // Signal "connected" on first successful poll
            if (lastAlertId === null) {
                if (onMessage) onMessage({ type: 'snapshot' });
            }

            // Only fire if there are new alerts since last poll
            if (data.alerts && data.alerts.length > 0) {
                const newestId = data.alerts[0].id;
                if (newestId !== lastAlertId) {
                    if (lastAlertId !== null) {
                        // Find and emit only truly new alerts
                        const newAlerts = data.alerts.filter(a => a.id !== lastAlertId);
                        newAlerts.forEach(alert => {
                            if (onMessage) onMessage({ type: 'alert', payload: alert });
                        });
                    }
                    lastAlertId = newestId;
                }
            }
        } catch (e) {
            console.error('Alert poll error', e);
        }
    };

    // Immediate first poll
    poll();
    const timer = setInterval(poll, intervalMs);

    // Return cleanup function (mirrors old WS cleanup interface)
    return () => {
        stopped = true;
        clearInterval(timer);
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

export { API_BASE };
export default { fetchData, postData, putData, patchData, deleteData, connectWS, API_BASE };