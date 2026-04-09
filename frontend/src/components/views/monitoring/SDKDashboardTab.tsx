/**
 * SDKDashboardTab.tsx
 * SDK Integration Hub for VIGIL — register apps, ingest events, view metrics.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { THEME, useAdaptiveTheme, useGlobalRefresh } from '../../../utils/theme';
import {
    Activity, AlertTriangle, Clock, Layers, Plus, RefreshCw,
    Copy, CheckCircle, ArrowLeft, Loader2, AlertCircle, Trash2
} from 'lucide-react';

/* ── Safe fetch helpers (avoid global auth:logout on 401) ─────────────── */
function getToken() {
    try { return localStorage.getItem('vigil_token'); } catch { return null; }
}

async function sdkFetch(path) {
    const token = getToken();
    const res = await fetch(path, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || d.detail || `HTTP ${res.status}`);
    }
    return res.json();
}

async function sdkPost(path, body) {
    const token = getToken();
    const res = await fetch(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || d.detail || `HTTP ${res.status}`);
    }
    return res.json();
}

async function sdkDelete(path) {
    const token = getToken();
    const res = await fetch(path, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || d.detail || `HTTP ${res.status}`);
    }
    return res.json();
}

/* ── Copy helper ──────────────────────────────────────────────────────── */
async function copyToClipboard(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { return false; }
}

/* ── Environment color ────────────────────────────────────────────────── */
function envColor(env) {
    if (env === 'production') return '#ef4444';
    if (env === 'staging') return '#f59e0b';
    return '#6366f1';
}

/* ── App type info ────────────────────────────────────────────────────── */
function typeLabel(t) {
    const map = { salesforce:'Salesforce', mulesoft:'MuleSoft', nodejs:'Node.js', java:'Java', python:'Python', dotnet:'.NET', custom:'Custom' };
    return map[t] || 'Custom';
}

/* ══════════════════════════════════════════════════════════════════════════
   REGISTER MODAL
   ══════════════════════════════════════════════════════════════════════════ */
function RegisterAppModal({ isOpen, onClose, onSuccess }) {
    const [form, setForm] = useState({ name: '', appType: 'nodejs', environment: 'staging' });
    const [generatedKey, setGeneratedKey] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!form.name.trim()) { setError('App name is required'); return; }
        setSubmitting(true);
        setError('');
        try {
            const result = await sdkPost('/api/sdk/apps', form);
            setGeneratedKey(result.key);
            setForm({ name: '', appType: 'nodejs', environment: 'staging' });
            if (onSuccess) onSuccess(result.record || result);
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopy = async () => {
        if (await copyToClipboard(generatedKey)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const bg = THEME.surface || '#131836';
    const border = THEME.glassBorder || '#333';
    const txt = THEME.textMain || '#e2e8f0';
    const sub = THEME.textMuted || '#94a3b8';
    const accent = THEME.primary || '#6366f1';

    return (
            <div style={{ background:bg, border:`1px solid ${border}`, borderRadius: 18, padding:24, maxWidth:480, width:'90%' }}>
                <h3 style={{ margin:'0 0 16px', fontSize:18, fontWeight:700, color:txt }}>Register New SDK Application</h3>

                {generatedKey ? (
                    <div>
                        <p style={{ margin:'0 0 12px', fontSize:13, color:sub }}>Your API key (save it — shown only once):</p>
                        <div style={{ background:THEME.surfaceHover||'#1a1f45', border:`1px solid ${border}`, borderRadius: 18, padding:12, marginBottom:16, display:'flex', alignItems:'center', gap:18, fontFamily:'monospace', fontSize:12 }}>
                            <code style={{ flex:1, overflow:'auto', color:txt }}>{generatedKey}</code>
                            <button onClick={handleCopy} style={{ border:'none', background:'transparent', color:accent, cursor:'pointer', flexShrink:0 }}>
                                {copied ? <CheckCircle size={16}/> : <Copy size={16}/>}
                            </button>
                        </div>
                        <button onClick={() => { setGeneratedKey(null); onClose(); }} style={{ width:'100%', padding:'10px 16px', borderRadius: 18, border:'none', background:accent, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>Done</button>
                    </div>
                ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:700, color:sub, letterSpacing:'0.02em', marginBottom:6 }}>App Name</label>
                            <input type="text" placeholder="My Salesforce Integration" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                style={{ width:'100%', padding:'10px 12px', borderRadius: 18, border:`1px solid ${border}`, background:THEME.surfaceHover||'#1a1f45', color:txt, fontSize:13 }} />
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:700, color:sub, letterSpacing:'0.02em', marginBottom:6 }}>App Type</label>
                            <select value={form.appType} onChange={e => setForm({...form, appType: e.target.value})}
                                style={{ width:'100%', padding:'10px 12px', borderRadius: 18, border:`1px solid ${border}`, background:THEME.surfaceHover||'#1a1f45', color:txt, fontSize:13, cursor:'pointer' }}>
                                <option value="salesforce">Salesforce</option>
                                <option value="mulesoft">MuleSoft</option>
                                <option value="nodejs">Node.js</option>
                                <option value="java">Java</option>
                                <option value="python">Python</option>
                                <option value="dotnet">.NET</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:700, color:sub, letterSpacing:'0.02em', marginBottom:6 }}>Environment</label>
                            <select value={form.environment} onChange={e => setForm({...form, environment: e.target.value})}
                                style={{ width:'100%', padding:'10px 12px', borderRadius: 18, border:`1px solid ${border}`, background:THEME.surfaceHover||'#1a1f45', color:txt, fontSize:13, cursor:'pointer' }}>
                                <option value="development">Development</option>
                                <option value="staging">Staging</option>
                                <option value="production">Production</option>
                            </select>
                        </div>
                        {error && <div style={{ padding:'10px 14px', borderRadius: 18, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', fontSize:12 }}>{error}</div>}
                        <div style={{ display:'flex', gap:18 }}>
                            <button onClick={handleSubmit} disabled={submitting}
                                style={{ flex:1, padding:'10px 16px', borderRadius: 18, border:'none', background:accent, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', opacity:submitting?0.6:1 }}>
                                {submitting ? 'Registering...' : 'Register Application'}
                            </button>
                            <button onClick={onClose}
                                style={{ padding:'10px 16px', borderRadius: 18, border:`1px solid ${border}`, background:'transparent', color:sub, fontWeight:700, fontSize:13, cursor:'pointer' }}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
    );
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const Styles = () => (
    <style>{`
        .sdk-card {
            background: linear-gradient(180deg, ${THEME.surface} 0%, ${THEME.surface}f8 100%);
            border: 1px solid ${THEME.glassBorder};
            border-radius: 20px;
            padding: 20px;
            position: relative;
            overflow: hidden;
            box-shadow: ${THEME.shadowSm};
            transition: all 0.25s ease;
        }
        .sdk-card:hover {
            box-shadow: ${THEME.shadowMd};
            transform: translateY(-4px);
        }
        .sdk-card::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--tile-accent, ${THEME.primary});
            opacity: 0.7;
        }
    `}</style>
);

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export default function SDKDashboardTab() {
    useAdaptiveTheme();

    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const bg = THEME.bg || '#0a0d1e';
    const surface = THEME.surface || '#131836';
    const border = THEME.glassBorder || '#333';
    const txt = THEME.textMain || '#e2e8f0';
    const sub = THEME.textMuted || '#94a3b8';
    const accent = THEME.primary || '#6366f1';
    const green = THEME.success || '#22c55e';
    const red = THEME.danger || '#ef4444';
    const yellow = THEME.warning || '#f59e0b';

    const fetchApps = useCallback(async () => {
        try {
            const data = await sdkFetch('/api/sdk/apps');
            const list = Array.isArray(data) ? data : data?.apps || [];
            setApps(list);
            setError(null);
        } catch (err) {
            console.error('[SDK] fetch error:', err);
            setError(err.message || 'Failed to load apps');
        }
    }, []);

    useGlobalRefresh(fetchApps);

    const handleDelete = useCallback(async (appId) => {
        setDeletingId(appId);
        try {
            await sdkDelete(`/api/sdk/apps/${appId}`);
            setApps(prev => prev.filter(a => a.id !== appId));
            setConfirmDeleteId(null);
        } catch (err) {
            console.error('[SDK] delete error:', err);
            setError(err.message || 'Failed to delete app');
        } finally {
            setDeletingId(null);
        }
    }, []);

    useEffect(() => {
        let alive = true;
        fetchApps().finally(() => { if (alive) setLoading(false); });
        const iv = setInterval(() => {
            if (alive) { setRefreshing(true); fetchApps().finally(() => { if (alive) setRefreshing(false); }); }
        }, 30000);
        return () => { alive = false; clearInterval(iv); };
    }, [fetchApps]);

    const stats = useMemo(() => {
        const a = Array.isArray(apps) ? apps : [];
        return {
            total: a.length,
            events: a.reduce((s, x) => s + (x?.totalEvents24h || 0), 0),
            errors: a.length ? Math.round(a.reduce((s, x) => s + (x?.errorCount || 0), 0) / Math.max(a.reduce((s, x) => s + (x?.totalEvents24h || 1), 0) / 100, 1)) : 0,
            latency: a.length ? Math.round(a.reduce((s, x) => s + (x?.avgLatency || 0), 0) / a.length) : 0,
        };
    }, [apps]);

    if (loading) {
        return (
            <div style={{ padding:40, textAlign:'center', minHeight:'100vh', background:bg }}>
                <Loader2 size={32} color={accent} style={{ animation:'spin 1s linear infinite', margin:'0 auto 16px' }} />
                <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                <div style={{ color:sub }}>Loading SDK applications...</div>
            </div>
        );
    }

    return (
        <>
            <Styles />
            <div style={{ padding:24, minHeight:'100vh', background:bg }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <div>
                    <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:700, color:txt }}>SDK Integration Hub</h2>
                    <p style={{ margin:0, fontSize:13, color:sub }}>Monitor all registered SDK applications and their event data</p>
                </div>
                <div style={{ display:'flex', gap:18 }}>
                    <button onClick={() => setShowModal(true)}
                        style={{ display:'flex', alignItems:'center', gap:18, padding:'10px 16px', borderRadius: 18, border:'none', background:accent, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                        <Plus size={16}/> Register App
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{ display:'flex', alignItems:'center', gap:18, padding:'12px 16px', borderRadius: 18, background:'rgba(239,68,68,0.1)', border:`1px solid ${red}`, color:red, marginBottom:24, fontSize:13 }}>
                    <AlertCircle size={16}/> {error}
                </div>
            )}

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:20, marginBottom:32 }}>
                {[
                    { label:'Total Applications', value:stats.total, icon:Layers, color:accent },
                    { label:'Events (24h)', value:stats.events.toLocaleString(), icon:Activity, color:green },
                    { label:'Error Rate', value:`${stats.errors}%`, icon:AlertTriangle, color:stats.errors>5?red:green },
                    { label:'Avg Latency', value:`${stats.latency}ms`, icon:Clock, color:yellow },
                ].map((card, i) => (
                    <div key={i} style={{ background:surface, border:`1px solid ${border}`, borderRadius: 18, padding:20, textAlign:'center' }}>
                        <card.icon size={20} color={card.color} style={{ margin:'0 auto 12px' }}/>
                        <p style={{ margin:'0 0 8px', fontSize:12, color:sub }}>{card.label}</p>
                        <p style={{ margin:0, fontSize:28, fontWeight:700, color:txt }}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Apps Grid */}
            {apps.length > 0 ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:20 }}>
                    {apps.map(app => (
                        <div key={app.id} style={{ background:surface, border:`1px solid ${confirmDeleteId===app.id?red:border}`, borderRadius: 18, padding:20, transition:'all 0.2s' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${border}40` }}>
                                <div>
                                    <h4 style={{ margin:'0 0 4px', color:txt, fontSize:14, fontWeight:700 }}>{app.name}</h4>
                                    <p style={{ margin:0, color:sub, fontSize:12 }}>{typeLabel(app.app_type || app.appType)}</p>
                                </div>
                                <div style={{ display:'flex', alignItems:'flex-start', gap:18 }}>
                                    <span style={{ padding:'4px 10px', borderRadius: 16, fontSize:11, fontWeight:700, background:`${envColor(app.environment)}20`, color:envColor(app.environment) }}>
                                        {app.environment}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(confirmDeleteId === app.id ? null : app.id); }}
                                        title="Delete app"
                                        style={{ background:'transparent', border:'none', color:confirmDeleteId===app.id?red:sub, cursor:'pointer', padding:4, borderRadius: 16, transition:'color 0.2s' }}>
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            </div>

                            {/* Delete confirmation */}
                            {confirmDeleteId === app.id && (
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', marginBottom:12, borderRadius: 18, background:`${red}10`, border:`1px solid ${red}30` }}>
                                    <span style={{ fontSize:12, color:red, fontWeight:600 }}>Delete this app?</span>
                                    <div style={{ display:'flex', gap:18 }}>
                                        <button onClick={() => setConfirmDeleteId(null)}
                                            style={{ padding:'4px 12px', borderRadius: 18, border:`1px solid ${border}`, background:'transparent', color:sub, fontSize:12, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                                        <button onClick={() => handleDelete(app.id)} disabled={deletingId === app.id}
                                            style={{ padding:'4px 12px', borderRadius: 18, border:'none', background:red, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', opacity:deletingId===app.id?0.6:1 }}>
                                            {deletingId === app.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18, fontSize:12 }}>
                                <div><div style={{ color:sub, marginBottom:4 }}>Events/24h</div><div style={{ fontWeight:700, color:txt }}>{app.totalEvents24h||0}</div></div>
                                <div><div style={{ color:sub, marginBottom:4 }}>Errors</div><div style={{ fontWeight:700, color:(app.errorCount||0)>0?red:green }}>{app.errorCount||0}</div></div>
                                <div><div style={{ color:sub, marginBottom:4 }}>Latency</div><div style={{ fontWeight:700, color:txt }}>{app.avgLatency||0}ms</div></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !error && (
                <div style={{ padding:'60px 20px', textAlign:'center', borderRadius: 18, border:`2px dashed ${border}`, background:surface }}>
                    <Layers size={48} color={sub} style={{ margin:'0 auto 16px' }}/>
                    <h3 style={{ margin:'0 0 8px', fontSize:16, fontWeight:700, color:txt }}>No SDK Applications Yet</h3>
                    <p style={{ margin:'0 0 16px', fontSize:13, color:sub }}>Register your first SDK application to start monitoring events and metrics.</p>
                    <button onClick={() => setShowModal(true)}
                        style={{ padding:'10px 20px', borderRadius: 18, border:'none', background:accent, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                        <Plus size={16} style={{ display:'inline', marginRight:6, verticalAlign:'middle' }}/> Register First Application
                    </button>
                </div>
            )}

            <RegisterAppModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={(app) => { setApps([...apps, app]); setShowModal(false); }} />
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
            </div>
        </>
    );
}