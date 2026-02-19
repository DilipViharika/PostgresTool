import React, { useState } from 'react';
import { T } from '../constants/theme.js';
import { AUDIT_LEVELS, SESSION_RISK_COLORS } from '../constants/index.js';
import { Ico, StatCard, Sparkline, RiskRing, RoleBadge, StatusBadge, TagFilter } from '../generatePassword, relTime…/components/ui.jsx';

/* ─── Mock data — in production, replace with useFetch('/api/audit') ──────── */
const AUDIT_EVENTS = [
    { id: 1, user: 'Alex Morgan',  action: 'ROLE_CHANGED',          resource: 'user:jamie_chen',      level: 'warn',     ts: '2025-02-17T14:32:00Z', detail: 'admin → super_admin' },
    { id: 2, user: 'System',       action: 'ANOMALY_DETECTED',       resource: 'auth:suspicious_ip',   level: 'critical', ts: '2025-02-17T13:15:00Z', detail: '12 failed logins from 45.22.19.112' },
    { id: 3, user: 'Jamie Chen',   action: 'DATA_EXPORT',            resource: 'db:production',        level: 'warn',     ts: '2025-02-17T12:01:00Z', detail: 'Exported 28,450 rows' },
    { id: 4, user: 'Admin',        action: 'USER_CREATED',           resource: 'user:sam_rivera',      level: 'info',     ts: '2025-02-17T11:40:00Z', detail: 'Role: Analyst' },
    { id: 5, user: 'Sam Rivera',   action: 'API_KEY_GENERATED',      resource: 'api:prod_key_7',       level: 'info',     ts: '2025-02-17T10:20:00Z', detail: 'Scope: read:all' },
    { id: 6, user: 'Jordan Park',  action: 'SQL_EXEC',               resource: 'db:prod',              level: 'warn',     ts: '2025-02-17T09:55:00Z', detail: 'DROP TABLE attempted — blocked' },
    { id: 7, user: 'System',       action: 'AUTO_BACKUP',            resource: 'backup:2025-02-17',    level: 'success',  ts: '2025-02-17T00:00:00Z', detail: '1.4 GB · 100% integrity' },
    { id: 8, user: 'Taylor Kim',   action: 'PERMISSION_ESCALATION',  resource: 'schema:finance',       level: 'critical', ts: '2025-02-16T22:10:00Z', detail: 'Unauthorized access attempt' },
];

/* ─── Mock sessions — in production, replace with useFetch('/api/sessions') ─ */
const INITIAL_SESSIONS = [
    { id: 1, user: 'Alex Morgan', ip: '192.168.1.42',  device: 'Chrome 120 · macOS Ventura',   location: 'San Francisco, US', active: true,  risk: 'low' },
    { id: 2, user: 'Jamie Chen',  ip: '45.22.19.112',  device: 'Firefox 121 · Windows 11',     location: 'London, UK',        active: false, risk: 'high' },
    { id: 3, user: 'System API',  ip: '10.0.0.5',      device: 'Python SDK 3.11',              location: 'AWS us-east-1',     active: true,  risk: 'low' },
    { id: 4, user: 'Unknown',     ip: '117.45.22.188', device: 'Unknown browser',               location: 'Shenzhen, CN',      active: true,  risk: 'critical' },
];

/* ─── Mock API keys — in production, replace with useFetch('/api/api-keys') ─ */
const INITIAL_API_KEYS = [
    { id: 1, name: 'Production Backend', prefix: 'pk_live_Yz9k', scope: 'read:all write:data', created: '2024-08-15', calls: 128440, status: 'active' },
    { id: 2, name: 'Data Pipeline',      prefix: 'pk_pipe_3jHm', scope: 'read:all',            created: '2025-01-10', calls: 9820,   status: 'active' },
    { id: 3, name: 'Test Runner',        prefix: 'pk_test_7xNa', scope: 'read:staging',        created: '2025-02-01', calls: 344,    status: 'active' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   AUDIT LOG
   ───────────────────────────────────────────────────────────────────────────── */
export const AuditLog = () => {
    const [filter, setFilter] = useState('all');

    const filtered = AUDIT_EVENTS.filter(e => filter === 'all' || e.level === filter);

    return (
        <div>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {['all', 'info', 'warn', 'critical', 'success'].map(l => (
                    <TagFilter key={l} active={filter === l}
                               label={l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
                               activeColor={l !== 'all' ? AUDIT_LEVELS[l] : undefined}
                               onClick={() => setFilter(l)}
                    />
                ))}
                <button className="um-btn um-btn-ghost um-btn-sm" style={{ marginLeft: 'auto' }}>
                    <Ico name="download" size={13} /> Export
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map((entry, i) => {
                    const lc = AUDIT_LEVELS[entry.level] || T.textDim;
                    return (
                        <div key={entry.id} className="um-card"
                             style={{ animation: `umFadeUp 0.3s ease ${i * 0.04}s both`, padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                    background: `${lc}15`, border: `1px solid ${lc}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Ico
                                        name={entry.level === 'critical' || entry.level === 'warn' ? 'alert'
                                            : entry.level === 'success' ? 'check' : 'activity'}
                                        size={16} color={lc}
                                    />
                                </div>
                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 2fr 1fr', gap: 12, alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: 'Space Mono, monospace' }}>
                                            {entry.action}
                                        </div>
                                        <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
                                            {new Date(entry.ts).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: T.textSub, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Ico name="users" size={11} color={T.textDim} /> {entry.user}
                                    </div>
                                    <div style={{
                                        fontSize: 11, color: T.textDim, fontFamily: 'Space Mono, monospace',
                                        background: T.surfaceHigh, padding: '4px 8px', borderRadius: 5,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {entry.detail}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                            padding: '3px 9px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                                            background: `${lc}18`, color: lc, border: `1px solid ${lc}30`,
                                        }}>
                                            {entry.level.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SECURITY PANEL — sessions, API keys, threat alerts
   ───────────────────────────────────────────────────────────────────────────── */
export const SecurityPanel = ({ users }) => {
    const [sessions, setSessions]   = useState(INITIAL_SESSIONS);
    const [apiKeys, setApiKeys]     = useState(INITIAL_API_KEYS);

    const highRisk = users.filter(u => u.riskScore > 70);

    const revokeSession = (id)   => setSessions(prev => prev.filter(s => s.id !== id));
    const revokeAllSessions = () => setSessions([]);
    const revokeApiKey  = (id)   => setApiKeys(prev => prev.filter(k => k.id !== id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* ── High-risk user alert ──────────────────────────────────── */}
            {highRisk.length > 0 && (
                <div style={{ padding: 16, borderRadius: 12, background: `${T.danger}0d`, border: `1px solid ${T.danger}30` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <Ico name="alert" size={18} color={T.danger} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.danger }}>
                            {highRisk.length} High-Risk User{highRisk.length !== 1 ? 's' : ''} Detected
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {highRisk.map(u => (
                            <div key={u.id} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 12px', borderRadius: 8,
                                background: `${T.danger}15`, border: `1px solid ${T.danger}30`,
                            }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{u.name}</span>
                                <RiskRing score={u.riskScore} size={28} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Active sessions ───────────────────────────────────────── */}
            <section aria-labelledby="sessions-heading">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div id="sessions-heading" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: T.text }}>
                        <Ico name="globe" size={15} color={T.primary} /> Active Sessions
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 9px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                            background: T.primaryDim, color: T.primary,
                        }}>
                            {sessions.filter(s => s.active).length} live
                        </span>
                    </div>
                    <button className="um-btn um-btn-danger um-btn-sm" onClick={revokeAllSessions}>
                        <Ico name="logOut" size={12} /> Revoke All
                    </button>
                </div>

                <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
                    {sessions.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: T.textDim, fontSize: 13 }}>
                            No active sessions
                        </div>
                    ) : sessions.map((s, i) => {
                        const rc = SESSION_RISK_COLORS[s.risk] || T.textDim;
                        return (
                            <div key={s.id} style={{
                                padding: '14px 18px',
                                borderBottom: i < sessions.length - 1 ? `1px solid ${T.border}` : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: s.risk === 'critical' ? `${T.danger}08` : T.surface,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: `${rc}15`, border: `1px solid ${rc}30`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Ico name={s.device.includes('SDK') || s.device.includes('API') ? 'database' : 'phone'} size={18} color={rc} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: T.text }}>
                                            {s.user}
                                            {s.active && (
                                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.success, animation: 'umPulse 2s infinite', display: 'inline-block' }} />
                                            )}
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                padding: '2px 7px', borderRadius: 5, fontSize: 9, fontWeight: 700,
                                                background: `${rc}18`, color: rc, border: `1px solid ${rc}30`,
                                            }}>
                                                {s.risk.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 11, color: T.textDim, marginTop: 2, fontFamily: 'Space Mono, monospace' }}>
                                            {s.ip} · {s.location}
                                        </div>
                                        <div style={{ fontSize: 11, color: T.textDim }}>{s.device}</div>
                                    </div>
                                </div>
                                <button className="um-btn um-btn-danger um-btn-sm" onClick={() => revokeSession(s.id)}>
                                    Revoke
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── API Keys ──────────────────────────────────────────────── */}
            <section aria-labelledby="apikeys-heading">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div id="apikeys-heading" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: T.text }}>
                        <Ico name="key" size={15} color={T.warning} /> API Keys
                    </div>
                    <button className="um-btn um-btn-ghost um-btn-sm">
                        <Ico name="plus" size={13} /> New Key
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {apiKeys.map(key => (
                        <div key={key.id} className="um-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 9,
                                    background: T.warningDim, border: `1px solid ${T.warning}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Ico name="key" size={16} color={T.warning} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{key.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                                        <code style={{
                                            fontSize: 11, color: T.textDim, fontFamily: 'Space Mono, monospace',
                                            background: T.surfaceHigh, padding: '2px 6px', borderRadius: 4,
                                        }}>
                                            {key.prefix}••••••••••••
                                        </code>
                                        <span style={{ fontSize: 10, color: T.textDim }}>{key.scope}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: 'Space Mono, monospace' }}>
                                        {key.calls.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: 10, color: T.textDim }}>total calls</div>
                                </div>
                                <button className="um-btn um-btn-ghost um-btn-icon" aria-label={`Revoke ${key.name}`}
                                        onClick={() => revokeApiKey(key.id)}>
                                    <Ico name="trash" size={13} color={T.danger} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};