// ==========================================================================
//  VIGIL — Security & Compliance Center (v2.0)
// ==========================================================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { THEME } from '../../utils/theme.jsx';

import {
    Shield, Lock, AlertOctagon, FileText, Key, Eye,
    UserCheck, Globe, Activity, Search, AlertTriangle,
    CheckCircle, XCircle, ChevronRight, Download, RefreshCw,
    Database, Server, Fingerprint, FileCheck, ShieldAlert,
    TrendingUp, TrendingDown, Cpu, Wifi, WifiOff, Bell,
    ChevronDown, ChevronUp, Filter, MoreVertical, Zap,
    Clock, MapPin, Terminal, BarChart2, List, LayoutGrid
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    CartesianGrid, PieChart, Pie, Cell, LineChart, Line,
    AreaChart, Area, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const SecStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@600;700;800&display=swap');

        .sec-root {
            font-family: 'Syne', sans-serif;
            background: #050d18;
            min-height: 100vh;
        }

        .card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 14px;
            overflow: hidden;
            transition: border-color 0.2s, box-shadow 0.2s;
            position: relative;
        }
        .card:hover {
            border-color: rgba(99,215,255,0.2);
            box-shadow: 0 0 24px rgba(99,215,255,0.05);
        }

        .card-glow-red:hover {
            border-color: rgba(255,70,90,0.3) !important;
            box-shadow: 0 0 24px rgba(255,70,90,0.08) !important;
        }

        .mono { font-family: 'JetBrains Mono', monospace; }

        /* Scrollbar */
        .sec-scroll::-webkit-scrollbar { width: 4px; }
        .sec-scroll::-webkit-scrollbar-track { background: transparent; }
        .sec-scroll::-webkit-scrollbar-thumb { background: rgba(99,215,255,0.2); border-radius: 2px; }

        /* Tabs */
        .nav-tab {
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.04em;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            background: transparent;
            color: rgba(255,255,255,0.4);
            text-transform: uppercase;
        }
        .nav-tab:hover { color: rgba(255,255,255,0.7); }
        .nav-tab.active {
            background: rgba(99,215,255,0.1);
            color: #63d7ff;
            border: 1px solid rgba(99,215,255,0.25);
        }

        /* Threat rows */
        .threat-row {
            display: grid;
            grid-template-columns: 32px 1.8fr 1fr 90px 110px 36px;
            padding: 13px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            align-items: center;
            font-size: 12px;
            transition: background 0.15s;
            gap: 12px;
        }
        .threat-row:hover { background: rgba(255,70,90,0.04); }
        .threat-row.critical-row { border-left: 2px solid #ff465a; }
        .threat-row.high-row { border-left: 2px solid #ff8c42; }
        .threat-row.medium-row { border-left: 2px solid #f5c518; }
        .threat-row.low-row { border-left: 2px solid #63d7ff; }

        .threat-row-header {
            display: grid;
            grid-template-columns: 32px 1.8fr 1fr 90px 110px 36px;
            padding: 8px 20px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.25);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            gap: 12px;
        }

        /* Compliance items */
        .comp-item {
            display: grid;
            grid-template-columns: 20px 1fr 70px 80px;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid transparent;
            transition: all 0.2s;
            cursor: pointer;
            margin-bottom: 6px;
        }
        .comp-item:hover { border-color: rgba(99,215,255,0.15); background: rgba(99,215,255,0.03); }

        /* Pulse animation for live indicator */
        @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
        }
        .live-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: #ff465a;
            position: relative; display: inline-block;
        }
        .live-dot::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: #ff465a;
            animation: pulse-ring 1.6s ease-out infinite;
        }

        @keyframes scan-line {
            0% { top: 0%; opacity: 0.6; }
            50% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .scan-line {
            position: absolute; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(99,215,255,0.6), transparent);
            animation: scan-line 3s linear infinite;
            pointer-events: none;
        }

        @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeSlideIn 0.35s ease-out forwards; }

        /* Score ring */
        @keyframes ring-draw {
            from { stroke-dashoffset: 440; }
            to { stroke-dashoffset: var(--target-offset); }
        }
        .score-ring-circle {
            stroke-dasharray: 440;
            stroke-dashoffset: var(--target-offset);
            animation: ring-draw 1.2s cubic-bezier(0.4,0,0.2,1) forwards;
            transform-origin: center;
            transform: rotate(-90deg);
        }

        /* Badge */
        .badge {
            display: inline-flex; align-items: center;
            padding: 2px 8px; border-radius: 4px;
            font-size: 10px; font-weight: 800; letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        /* GEO heatmap cells */
        .geo-cell {
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;
            transition: all 0.2s;
        }

        /* Timeline event */
        .timeline-event {
            display: flex; gap: 12px; align-items: flex-start;
            padding-bottom: 16px;
            position: relative;
        }
        .timeline-event::before {
            content: '';
            position: absolute; left: 15px; top: 28px; bottom: 0;
            width: 1px; background: rgba(255,255,255,0.07);
        }
        .timeline-event:last-child::before { display: none; }

        /* Key vault */
        .key-item {
            padding: 12px 16px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.07);
            background: rgba(255,255,255,0.02);
            margin-bottom: 8px;
            transition: all 0.2s;
        }
        .key-item:hover { border-color: rgba(99,215,255,0.2); }

        /* Expiry progress */
        .key-progress {
            height: 3px; border-radius: 2px;
            background: rgba(255,255,255,0.06);
            margin-top: 8px; overflow: hidden;
        }
        .key-progress-fill {
            height: 100%; border-radius: 2px;
            transition: width 0.8s ease;
        }

        /* Search bar */
        .search-input {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px; padding: 8px 14px 8px 36px;
            color: #fff; font-size: 12px; width: 200px;
            outline: none; transition: all 0.2s;
            font-family: 'JetBrains Mono', monospace;
        }
        .search-input:focus {
            border-color: rgba(99,215,255,0.35);
            background: rgba(99,215,255,0.04);
            width: 260px;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.25); }

        /* MITRE ATT&CK badges */
        .mitre-tag {
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px; padding: 2px 6px; border-radius: 3px;
            background: rgba(99,215,255,0.08);
            color: rgba(99,215,255,0.7);
            border: 1px solid rgba(99,215,255,0.15);
        }

        /* Radar chart label */
        .recharts-polar-angle-axis-tick text {
            fill: rgba(255,255,255,0.4) !important;
            font-size: 11px !important;
        }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const THREAT_LOGS = [
    { id: 1, type: 'SQL Injection', source: '192.168.1.105', user: 'app_service', severity: 'critical', time: '10:42 AM', mitre: 'T1190', query: "SELECT * FROM users WHERE id='1' OR '1'='1'", geo: 'US', blocked: true },
    { id: 2, type: 'Privilege Escalation', source: 'internal', user: 'bob_dba', severity: 'high', time: '09:15 AM', mitre: 'T1078', query: "GRANT SUPERUSER TO bob_dba", geo: 'INT', blocked: false },
    { id: 3, type: 'Anomalous Data Export', source: '10.0.5.22', user: 'analytics', severity: 'medium', time: '08:30 AM', mitre: 'T1048', query: "COPY users TO STDOUT (FORMAT CSV)", geo: 'DE', blocked: false },
    { id: 4, type: 'Brute Force Auth', source: '45.33.22.11', user: 'unknown', severity: 'medium', time: '03:22 AM', mitre: 'T1110', query: "AUTH FAIL (50 attempts/min)", geo: 'RU', blocked: true },
    { id: 5, type: 'Schema Enumeration', source: '10.0.2.14', user: 'read_only', severity: 'low', time: '01:05 AM', mitre: 'T1082', query: "SELECT table_name FROM information_schema.tables", geo: 'US', blocked: false },
];

const COMPLIANCE_CHECKS = [
    { id: 'c1', cat: 'Encryption', label: 'Data at Rest Encryption', status: 'pass', standard: 'SOC2', score: 100 },
    { id: 'c2', cat: 'Encryption', label: 'TLS 1.3 In Transit', status: 'pass', standard: 'HIPAA', score: 100 },
    { id: 'c3', cat: 'Access Control', label: 'Row Level Security', status: 'warn', standard: 'GDPR', score: 60 },
    { id: 'c4', cat: 'Logging', label: 'Audit Log Retention (90d)', status: 'pass', standard: 'SOC2', score: 100 },
    { id: 'c5', cat: 'Data Privacy', label: 'PII Retention Policy', status: 'fail', standard: 'GDPR', score: 0 },
    { id: 'c6', cat: 'Network', label: 'IP Allowlist Enforced', status: 'pass', standard: 'ISO27001', score: 100 },
    { id: 'c7', cat: 'Access Control', label: 'MFA on Privileged Roles', status: 'warn', standard: 'SOC2', score: 50 },
    { id: 'c8', cat: 'Patching', label: 'PostgreSQL Latest Patch', status: 'pass', standard: 'CIS', score: 100 },
];

const ENCRYPTION_KEYS = [
    { name: 'Master Key (KMS)', algo: 'AES-256-GCM', rotated: '14 days ago', daysLeft: 351, total: 365, status: 'active' },
    { name: 'App Signing Key', algo: 'RSA-4096', rotated: '360 days ago', daysLeft: 5, total: 365, status: 'expiring' },
    { name: 'Backup Encryption Key', algo: 'AES-256-CBC', rotated: '45 days ago', daysLeft: 320, total: 365, status: 'active' },
    { name: 'JWT Secret', algo: 'HS512', rotated: '7 days ago', daysLeft: 23, total: 30, status: 'warning' },
];

const PII_ACCESS = [
    { table: 'customers', col: 'credit_card', user: 'payment_svc', hits: 1450, trend: 12, risk: 'high' },
    { table: 'users', col: 'ssn_hash', user: 'admin', hits: 5, trend: 0, risk: 'critical' },
    { table: 'patients', col: 'diagnosis', user: 'dr_smith', hits: 24, trend: -5, risk: 'medium' },
    { table: 'employees', col: 'salary', user: 'hr_api', hits: 88, trend: 3, risk: 'medium' },
];

const GEO_THREATS = [
    { country: 'Russia', code: 'RU', count: 142, pct: 38, color: '#ff465a' },
    { country: 'China', code: 'CN', count: 98, pct: 26, color: '#ff8c42' },
    { country: 'USA', code: 'US', count: 44, pct: 12, color: '#f5c518' },
    { country: 'Germany', code: 'DE', count: 31, pct: 8, color: '#63d7ff' },
    { country: 'Other', code: '—', count: 60, pct: 16, color: '#888' },
];

const THREAT_TIMELINE = Array.from({ length: 24 }, (_, i) => ({
    h: `${i}:00`, threats: Math.floor(Math.random() * 18 + 2),
    blocked: Math.floor(Math.random() * 10 + 1),
}));

const RADAR_DATA = [
    { axis: 'Access Ctrl', val: 78 },
    { axis: 'Encryption', val: 95 },
    { axis: 'Auditing', val: 90 },
    { axis: 'Patching', val: 82 },
    { axis: 'Network', val: 88 },
    { axis: 'Data Privacy', val: 55 },
];

const AUDIT_EVENTS = [
    { ts: '10:44 AM', user: 'admin', action: 'Role Modified', target: 'analyst_role', severity: 'high' },
    { ts: '10:12 AM', user: 'deploy_bot', action: 'Schema Migration', target: 'public.orders', severity: 'info' },
    { ts: '09:55 AM', user: 'bob_dba', action: 'Grant Attempted', target: 'SUPERUSER', severity: 'critical' },
    { ts: '09:20 AM', user: 'backup_svc', action: 'Backup Created', target: 'pg_dump v16', severity: 'info' },
    { ts: '08:01 AM', user: 'app_service', action: 'Failed Login x12', target: 'auth endpoint', severity: 'medium' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
const SEV_COLORS = {
    critical: '#ff465a',
    high: '#ff8c42',
    medium: '#f5c518',
    low: '#63d7ff',
    info: 'rgba(255,255,255,0.3)',
};

const Badge = ({ label, color }) => (
    <span className="badge" style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
        {label}
    </span>
);

const ThreatBadge = ({ severity }) => (
    <Badge label={severity} color={SEV_COLORS[severity] || '#888'} />
);

const SectionHeader = ({ icon: Icon, title, iconColor, right }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#fff', letterSpacing: '0.02em' }}>
            <Icon size={15} color={iconColor || '#63d7ff'} />
            {title}
        </h3>
        {right}
    </div>
);

const MiniStat = ({ label, value, sub, color, icon: Icon }) => (
    <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.025)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            {Icon && <Icon size={12} color={color} />} {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: color || '#fff', lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>{sub}</div>}
    </div>
);

/* Score Ring SVG */
const ScoreRing = ({ score }) => {
    const r = 68, circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 80 ? '#4ade80' : score >= 60 ? '#f5c518' : '#ff465a';
    return (
        <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
                <circle
                    cx="80" cy="80" r={r}
                    stroke={color} strokeWidth="8" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                />
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                <circle cx="80" cy="80" r={r} stroke={color} strokeWidth="2" fill="none"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        transform="rotate(-90 80 80)" filter="url(#glow)" opacity="0.4"
                />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginTop: 4 }}>SECURITY</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>SCORE</div>
            </div>
        </div>
    );
};

/* Custom Tooltip */
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0d1b2a', border: '1px solid rgba(99,215,255,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color || '#63d7ff' }}>{p.name}: <strong>{p.value}</strong></div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PANELS
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Threat Monitor ─────────────────────────────────────────────────────── */
const ThreatMonitor = ({ search }) => {
    const [expanded, setExpanded] = useState(null);
    const filtered = THREAT_LOGS.filter(t =>
        !search || t.type.toLowerCase().includes(search.toLowerCase()) ||
        t.user.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="card card-glow-red">
            <SectionHeader
                icon={AlertOctagon}
                title="Live Threat Monitor"
                iconColor="#ff465a"
                right={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="live-dot" />
                        <span style={{ fontSize: 11, color: '#ff465a', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>LIVE</span>
                    </div>
                }
            />
            <div className="threat-row-header">
                <div />
                <div>Threat / Query</div>
                <div>Actor</div>
                <div>MITRE</div>
                <div>Severity</div>
                <div />
            </div>
            <div className="sec-scroll" style={{ maxHeight: 340, overflowY: 'auto' }}>
                {filtered.map(log => (
                    <React.Fragment key={log.id}>
                        <div
                            className={`threat-row ${log.severity}-row`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        >
                            <ShieldAlert size={14} color={SEV_COLORS[log.severity]} />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{log.type}</div>
                                <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                                    {log.query}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{log.user}</div>
                                <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{log.source}</div>
                            </div>
                            <span className="mitre-tag">{log.mitre}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <ThreatBadge severity={log.severity} />
                                {log.blocked && <Badge label="blocked" color="#4ade80" />}
                            </div>
                            <ChevronDown size={14} color="rgba(255,255,255,0.2)"
                                         style={{ transform: expanded === log.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                        {expanded === log.id && (
                            <div className="fade-in" style={{ padding: '12px 20px 16px 52px', background: `${SEV_COLORS[log.severity]}06`, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <div className="mono" style={{ fontSize: 11, color: '#63d7ff', padding: '8px 12px', background: 'rgba(0,0,0,0.4)', borderRadius: 6, border: '1px solid rgba(99,215,255,0.15)', marginBottom: 10 }}>
                                    {log.query}
                                </div>
                                <div style={{ display: 'flex', gap: 24, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                                    <span>Time: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{log.time}</strong></span>
                                    <span>Origin: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{log.geo}</strong></span>
                                    <span>Status: <strong style={{ color: log.blocked ? '#4ade80' : '#ff465a' }}>{log.blocked ? 'Blocked' : 'Allowed'}</strong></span>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

/* ── Threat Timeline Chart ──────────────────────────────────────────────── */
const ThreatTimeline = () => (
    <div className="card">
        <SectionHeader icon={Activity} title="Threat Activity (24h)" iconColor="#ff8c42"
                       right={<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>threats / hour</span>} />
        <div style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={THREAT_TIMELINE} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff465a" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ff465a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="h" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="threats" name="Threats" stroke="#ff465a" fill="url(#tGrad)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="blocked" name="Blocked" stroke="#4ade80" fill="url(#bGrad)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);

/* ── GEO Threat Map ─────────────────────────────────────────────────────── */
const GeoThreatPanel = () => (
    <div className="card" style={{ padding: 20 }}>
        <SectionHeader icon={Globe} title="Attack Origin" iconColor="#63d7ff"
                       right={<Badge label="last 24h" color="#63d7ff" />} />
        <div style={{ marginTop: 16 }}>
            {GEO_THREATS.map((g, i) => (
                <div key={i} className="geo-cell" style={{ background: `${g.color}08`, border: `1px solid ${g.color}15` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: g.color, width: 24 }}>{g.code}</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{g.country}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                            <div style={{ width: `${g.pct}%`, height: '100%', background: g.color, borderRadius: 2 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: g.color, width: 28, textAlign: 'right' }}>{g.count}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/* ── Compliance Panel ───────────────────────────────────────────────────── */
const CompliancePanel = () => {
    const [filter, setFilter] = useState('all');
    const standards = ['all', 'SOC2', 'GDPR', 'HIPAA', 'ISO27001', 'CIS'];
    const filtered = filter === 'all' ? COMPLIANCE_CHECKS : COMPLIANCE_CHECKS.filter(c => c.standard === filter);
    const passCount = COMPLIANCE_CHECKS.filter(c => c.status === 'pass').length;

    return (
        <div className="card">
            <SectionHeader icon={FileCheck} title="Compliance Posture"
                           right={
                               <div className="mono" style={{ fontSize: 12, color: '#4ade80', fontWeight: 700 }}>
                                   {passCount}/{COMPLIANCE_CHECKS.length} Pass
                               </div>
                           }
            />
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 4, overflowX: 'auto' }}>
                {standards.map(s => (
                    <button key={s} className={`nav-tab ${filter === s ? 'active' : ''}`}
                            style={{ padding: '4px 10px', fontSize: 10 }}
                            onClick={() => setFilter(s)}>{s}</button>
                ))}
            </div>
            <div className="sec-scroll" style={{ maxHeight: 320, overflowY: 'auto', padding: '10px 14px' }}>
                {filtered.map(item => {
                    const color = item.status === 'pass' ? '#4ade80' : item.status === 'fail' ? '#ff465a' : '#f5c518';
                    const Icon = item.status === 'pass' ? CheckCircle : item.status === 'fail' ? XCircle : AlertTriangle;
                    return (
                        <div key={item.id} className="comp-item">
                            <Icon size={16} color={color} />
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{item.label}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{item.cat}</div>
                            </div>
                            <Badge label={item.standard} color="rgba(255,255,255,0.4)" />
                            <Badge label={item.status} color={color} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ── Security Radar ─────────────────────────────────────────────────────── */
const SecurityRadar = () => (
    <div className="card" style={{ padding: '0 0 12px' }}>
        <SectionHeader icon={BarChart2} title="Security Posture Radar" iconColor="#a78bfa" />
        <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius={75}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="val" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} />
            </RadarChart>
        </ResponsiveContainer>
    </div>
);

/* ── PII Access Log ─────────────────────────────────────────────────────── */
const PIIAccessLog = () => (
    <div className="card">
        <SectionHeader icon={Fingerprint} title="PII / Sensitive Access" iconColor="#f472b6"
                       right={<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono' }}>last 24h</span>} />
        <div style={{ padding: '12px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 60px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8, marginBottom: 4 }}>
                <div>Resource · Accessor</div>
                <div>Hits</div>
                <div>Trend</div>
                <div>Risk</div>
            </div>
            {PII_ACCESS.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 60px', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', fontSize: 12 }}>
                    <div>
                        <div>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{a.table}</span>
                            <span style={{ color: '#f472b6', fontWeight: 700 }}>.{a.col}</span>
                        </div>
                        <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{a.user}</div>
                    </div>
                    <div className="mono" style={{ fontWeight: 700, color: '#fff' }}>{a.hits.toLocaleString()}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {a.trend > 0
                            ? <TrendingUp size={12} color="#f5c518" />
                            : a.trend < 0
                                ? <TrendingDown size={12} color="#4ade80" />
                                : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>—</span>}
                        <span className="mono" style={{ fontSize: 11, color: a.trend > 0 ? '#f5c518' : a.trend < 0 ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                            {a.trend !== 0 ? `${a.trend > 0 ? '+' : ''}${a.trend}%` : ''}
                        </span>
                    </div>
                    <ThreatBadge severity={a.risk} />
                </div>
            ))}
        </div>
    </div>
);

/* ── Encryption Key Vault ───────────────────────────────────────────────── */
const KeyVault = () => {
    const statusColors = { active: '#4ade80', expiring: '#ff465a', warning: '#f5c518' };
    return (
        <div className="card" style={{ padding: 0 }}>
            <SectionHeader icon={Key} title="Encryption Key Vault" iconColor="#fbbf24"
                           right={
                               <button style={{ fontSize: 11, color: '#63d7ff', background: 'rgba(99,215,255,0.08)', border: '1px solid rgba(99,215,255,0.2)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                                   Rotate Keys
                               </button>
                           }
            />
            <div style={{ padding: '12px 16px' }}>
                {ENCRYPTION_KEYS.map((k, i) => {
                    const color = statusColors[k.status];
                    const pct = (k.daysLeft / k.total) * 100;
                    return (
                        <div key={i} className="key-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{k.name}</div>
                                    <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{k.algo}</div>
                                </div>
                                <Badge label={k.status} color={color} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                                <span>Rotated {k.rotated}</span>
                                <span style={{ color }}>
                                    {k.daysLeft < 30 ? `⚠ ${k.daysLeft}d left` : `${k.daysLeft}d left`}
                                </span>
                            </div>
                            <div className="key-progress">
                                <div className="key-progress-fill" style={{ width: `${pct}%`, background: pct > 60 ? color : pct > 20 ? '#f5c518' : '#ff465a' }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ── Audit Timeline ─────────────────────────────────────────────────────── */
const AuditTimeline = () => (
    <div className="card" style={{ padding: 0 }}>
        <SectionHeader icon={Clock} title="Audit Events" iconColor="#63d7ff"
                       right={<button style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>Export</button>} />
        <div style={{ padding: '16px 20px' }}>
            {AUDIT_EVENTS.map((ev, i) => {
                const color = SEV_COLORS[ev.severity] || '#888';
                return (
                    <div key={i} className="timeline-event">
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}15`, border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Activity size={12} color={color} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{ev.action}</span>
                                <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{ev.ts}</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                                <span style={{ color: '#63d7ff' }}>{ev.user}</span> → {ev.target}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const SecurityComplianceTab = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [search, setSearch] = useState('');
    const [score] = useState(88);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'threats', label: 'Threats' },
        { id: 'compliance', label: 'Compliance' },
        { id: 'encryption', label: 'Encryption' },
        { id: 'audit', label: 'Audit Log' },
    ];

    return (
        <div className="sec-root" style={{ padding: '0 0 60px' }}>
            <SecStyles />

            {/* ── Header ── */}
            <div style={{ padding: '16px 24px 0', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <Shield size={22} color="#63d7ff" />
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                                Security & Compliance
                            </h1>
                            <Badge label="Protected" color="#4ade80" />
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
                            Last scan: 12m ago &nbsp;·&nbsp; 4 active threats &nbsp;·&nbsp; 1 critical
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <Search size={13} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input className="search-input" placeholder="Search threats..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <button style={{ background: 'rgba(255,70,90,0.12)', color: '#ff465a', border: '1px solid rgba(255,70,90,0.3)', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center', fontFamily: 'Syne, sans-serif' }}>
                            <AlertOctagon size={13} /> Run Scan
                        </button>
                        <button style={{ background: '#63d7ff', color: '#050d18', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center', fontFamily: 'Syne, sans-serif' }}>
                            <FileText size={13} /> Export Report
                        </button>
                    </div>
                </div>

                {/* Sub-nav */}
                <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
                    {tabs.map(t => (
                        <button key={t.id} className={`nav-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
                <div style={{ padding: '0 24px' }} className="fade-in">
                    {/* Metric bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
                        <MiniStat label="Security Score" value={score} sub="↑ +3 from last week" color="#4ade80" icon={Shield} />
                        <MiniStat label="Active Threats" value="4" sub="1 critical, 2 medium" color="#ff465a" icon={AlertOctagon} />
                        <MiniStat label="Failed Logins" value="42" sub="last 24 hours" color="#f5c518" icon={UserCheck} />
                        <MiniStat label="PII Accesses" value="1.5k" sub="tracked resources" color="#f472b6" icon={Eye} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                        <ThreatMonitor search={search} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 18, alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ScoreRing score={score} />
                                </div>
                                <SecurityRadar />
                            </div>
                            <GeoThreatPanel />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                        <ThreatTimeline />
                        <PIIAccessLog />
                    </div>
                </div>
            )}

            {/* ── Threats ── */}
            {activeTab === 'threats' && (
                <div style={{ padding: '0 24px' }} className="fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <ThreatMonitor search={search} />
                            <ThreatTimeline />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <GeoThreatPanel />
                            <AuditTimeline />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Compliance ── */}
            {activeTab === 'compliance' && (
                <div style={{ padding: '0 24px' }} className="fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
                        <CompliancePanel />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <SecurityRadar />
                            <PIIAccessLog />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Encryption ── */}
            {activeTab === 'encryption' && (
                <div style={{ padding: '0 24px' }} className="fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                        <KeyVault />
                        <div className="card" style={{ padding: 20 }}>
                            <SectionHeader icon={Lock} title="TLS Certificate Status" iconColor="#4ade80" />
                            <div style={{ padding: '16px 0' }}>
                                {[
                                    { domain: 'db.internal.company.com', expires: '2026-09-12', days: 207, status: 'valid' },
                                    { domain: 'replica-01.db.internal', expires: '2025-07-30', days: 12, status: 'expiring' },
                                    { domain: 'analytics.db.internal', expires: '2026-08-01', days: 165, status: 'valid' },
                                ].map((cert, i) => (
                                    <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div className="mono" style={{ fontSize: 12, color: '#fff' }}>{cert.domain}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Expires {cert.expires}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span className="mono" style={{ fontSize: 11, color: cert.days < 30 ? '#ff465a' : '#4ade80' }}>{cert.days}d</span>
                                            <Badge label={cert.status} color={cert.status === 'valid' ? '#4ade80' : '#ff465a'} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Audit Log ── */}
            {activeTab === 'audit' && (
                <div style={{ padding: '0 24px' }} className="fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
                        <AuditTimeline />
                        <PIIAccessLog />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityComplianceTab;