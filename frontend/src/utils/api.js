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

// --- NEW FUNCTION ADDED HERE ---
export function connectWS(onMessage) {
    const token = localStorage.getItem('vigil_token');
    if (!token) return () => {};

    // Convert http(s) to ws(s)
    const wsBase = API_BASE.replace(/^http/, 'ws');
    const wsUrl = `${wsBase}/ws?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WS Connected');
        if (onMessage) onMessage({ type: 'snapshot' }); // Signal connection
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (onMessage) onMessage(data);
        } catch (e) {
            console.error('WS Parse error', e);
        }
    };

    ws.onerror = (err) => console.error('WS Error', err);

    // Return a cleanup function to close the connection
    return () => {
        if (ws.readyState === 1) ws.close();
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