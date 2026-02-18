import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   THEME & DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════════════════ */
const T = {
    bg: '#07080d',
    surface: '#0d0f17',
    surfaceHigh: '#131620',
    border: '#1e2235',
    borderHigh: '#2a2f47',
    primary: '#4f7cff',
    primaryDim: '#4f7cff22',
    accent: '#7c3aed',
    success: '#10d98a',
    successDim: '#10d98a18',
    warning: '#f5a623',
    warningDim: '#f5a62318',
    danger: '#ff4a6e',
    dangerDim: '#ff4a6e18',
    info: '#22d3ee',
    infoDim: '#22d3ee18',
    text: '#e8eaf6',
    textSub: '#9399b8',
    textDim: '#555a7a',
    glow: '0 0 40px rgba(79,124,255,0.12)',
};

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const ROLES = [
    { id: 'super_admin', label: 'Super Admin', color: T.danger, perms: 9, badge: '◈' },
    { id: 'admin',       label: 'Admin',       color: T.warning, perms: 7, badge: '◆' },
    { id: 'developer',   label: 'Developer',   color: T.info, perms: 6, badge: '◇' },
    { id: 'analyst',     label: 'Analyst',     color: T.accent, perms: 4, badge: '○' },
    { id: 'viewer',      label: 'Viewer',      color: T.success, perms: 2, badge: '·' },
];

const DEPARTMENTS = ['Engineering', 'Product', 'Data', 'Security', 'Operations', 'Finance'];
const LOCATIONS = ['San Francisco', 'New York', 'London', 'Tokyo', 'Berlin', 'Remote'];

const generateUsers = () => Array.from({ length: 38 }, (_, i) => {
    const role = ROLES[i === 0 ? 0 : i < 4 ? 1 : i < 12 ? 2 : i < 22 ? 3 : 4];
    const loginDays = Math.floor(Math.random() * 30);
    const failedLogins = Math.floor(Math.random() * 12);
    const riskScore = Math.min(100, failedLogins * 7 + (loginDays > 14 ? 20 : 0) + Math.floor(Math.random() * 20));
    const logins = Array.from({ length: 28 }, () => Math.floor(Math.random() * 8));
    return {
        id: i + 1,
        name: ['Alex Morgan','Jamie Chen','Sam Rivera','Jordan Park','Taylor Kim','Casey Liu','Drew Patel','Quinn Walsh','Avery Santos','Riley Cooper','Morgan Lee','Sage Thompson','Blake Williams','Charlie Davis','Frankie Brown','Hayden Miller','Skyler Wilson','Reese Anderson','Robin Thomas','Dana Jackson','Cameron White','Jordan Harris','Riley Martin','Casey Thompson','Alex Garcia','Sam Martinez','Taylor Robinson','Jordan Lewis','Morgan Clark','Casey Rodriguez','Drew Walker','Riley Hall','Quinn Allen','Avery Young','Sage Hernandez','Blake King','Charlie Wright','Frankie Lopez'][i] || `User ${i+1}`,
        email: `user${i+1}@acme.io`,
        role: role.id,
        status: i % 7 === 0 ? 'suspended' : i % 9 === 0 ? 'inactive' : 'active',
        mfa: i % 3 !== 0,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
        location: LOCATIONS[i % LOCATIONS.length],
        lastLogin: new Date(Date.now() - loginDays * 86400000).toISOString(),
        createdAt: new Date(Date.now() - (180 - i * 4) * 86400000).toISOString(),
        loginActivity: logins,
        failedLogins,
        riskScore,
        apiAccess: i % 4 === 0,
        sessions: Math.floor(Math.random() * 4) + 1,
        dataAccess: ['public', 'internal', 'confidential', 'restricted'][Math.floor(Math.random() * 4)],
    };
});

const AUDIT_EVENTS = [
    { id: 1, user: 'Alex Morgan', action: 'ROLE_CHANGED', resource: 'user:jamie_chen', level: 'warn', ts: '2025-02-17T14:32:00Z', detail: 'admin → super_admin' },
    { id: 2, user: 'System', action: 'ANOMALY_DETECTED', resource: 'auth:suspicious_ip', level: 'critical', ts: '2025-02-17T13:15:00Z', detail: '12 failed logins from 45.22.19.112' },
    { id: 3, user: 'Jamie Chen', action: 'DATA_EXPORT', resource: 'db:production', level: 'warn', ts: '2025-02-17T12:01:00Z', detail: 'Exported 28,450 rows' },
    { id: 4, user: 'Admin', action: 'USER_CREATED', resource: 'user:sam_rivera', level: 'info', ts: '2025-02-17T11:40:00Z', detail: 'Role: Analyst' },
    { id: 5, user: 'Sam Rivera', action: 'API_KEY_GENERATED', resource: 'api:prod_key_7', level: 'info', ts: '2025-02-17T10:20:00Z', detail: 'Scope: read:all' },
    { id: 6, user: 'Jordan Park', action: 'SQL_EXEC', resource: 'db:prod', level: 'warn', ts: '2025-02-17T09:55:00Z', detail: 'DROP TABLE attempted — blocked' },
    { id: 7, user: 'System', action: 'AUTO_BACKUP', resource: 'backup:2025-02-17', level: 'success', ts: '2025-02-17T00:00:00Z', detail: '1.4 GB · 100% integrity' },
    { id: 8, user: 'Taylor Kim', action: 'PERMISSION_ESCALATION', resource: 'schema:finance', level: 'critical', ts: '2025-02-16T22:10:00Z', detail: 'Unauthorized access attempt' },
];

const PERMISSIONS_MAP = {
    super_admin: { overview:['r','w','d','a'], performance:['r','w','d','a'], sql:['r','w','d','a'], api:['r','w','d','a'], users:['r','w','d','a'], billing:['r','w','d','a'], security:['r','w','d','a'] },
    admin:       { overview:['r','w','d'], performance:['r','w','d'], sql:['r','w'], api:['r','w'], users:['r','w'], billing:['r'], security:['r','w'] },
    developer:   { overview:['r','w'], performance:['r','w'], sql:['r','w'], api:['r','w'], users:['r'], billing:[], security:['r'] },
    analyst:     { overview:['r'], performance:['r'], sql:['r'], api:['r'], users:[], billing:[], security:[] },
    viewer:      { overview:['r'], performance:['r'], sql:[], api:[], users:[], billing:[], security:[] },
};

const PERM_LABELS = { r: 'Read', w: 'Write', d: 'Delete', a: 'Admin' };
const PERM_COLORS = { r: T.success, w: T.info, d: T.warning, a: T.danger };
const RESOURCE_ROWS = ['overview', 'performance', 'sql', 'api', 'users', 'billing', 'security'];

/* ═══════════════════════════════════════════════════════════════════════════
   CSS INJECTION
   ═══════════════════════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .um-root {
      font-family: 'Outfit', sans-serif;
      color: ${T.text};
      background: ${T.bg};
      min-height: 100vh;
    }

    @keyframes umFadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes umFadeIn  { from { opacity:0; } to { opacity:1; } }
    @keyframes umSlideRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
    @keyframes umSlideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes umPulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    @keyframes umSpin  { to { transform:rotate(360deg); } }
    @keyframes umBlink { 0%,100% { opacity:1; } 50% { opacity:0; } }
    @keyframes umShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes umGlow {
      0%,100% { box-shadow: 0 0 12px ${T.primary}44; }
      50% { box-shadow: 0 0 28px ${T.primary}88; }
    }
    @keyframes umBarGrow { from { width:0; } to { width:var(--w); } }
    @keyframes umRipple { to { transform:scale(3); opacity:0; } }

    .um-stagger > * { animation: umFadeUp 0.4s ease both; }
    .um-stagger > *:nth-child(1) { animation-delay:0.00s; }
    .um-stagger > *:nth-child(2) { animation-delay:0.05s; }
    .um-stagger > *:nth-child(3) { animation-delay:0.10s; }
    .um-stagger > *:nth-child(4) { animation-delay:0.15s; }
    .um-stagger > *:nth-child(5) { animation-delay:0.20s; }

    .um-row {
      display:grid;
      align-items:center;
      padding: 0 20px;
      height: 62px;
      border-bottom: 1px solid ${T.border};
      transition: background 0.15s, border-color 0.15s;
      cursor:pointer;
    }
    .um-row:hover { background: ${T.primary}08; border-color: ${T.primary}20; }
    .um-row.selected { background: ${T.primary}12; border-color: ${T.primary}30; }
    .um-row:last-child { border-bottom:none; }

    .um-btn {
      display:inline-flex; align-items:center; gap:7px;
      padding: 8px 16px; border-radius:8px; border:none;
      font-family:'Outfit',sans-serif; font-size:13px; font-weight:600;
      cursor:pointer; transition:all 0.15s; white-space:nowrap; outline:none;
    }
    .um-btn:active { transform:scale(0.97); }
    .um-btn-primary { background:${T.primary}; color:#fff; }
    .um-btn-primary:hover { background:#6b8fff; box-shadow:0 0 20px ${T.primary}55; }
    .um-btn-ghost { background:transparent; color:${T.textSub}; border:1px solid ${T.border}; }
    .um-btn-ghost:hover { border-color:${T.primary}; color:${T.primary}; background:${T.primaryDim}; }
    .um-btn-danger { background:${T.dangerDim}; color:${T.danger}; border:1px solid ${T.danger}44; }
    .um-btn-danger:hover { background:${T.danger}; color:#fff; }
    .um-btn-sm { padding:5px 10px; font-size:11px; border-radius:6px; }
    .um-btn-icon { padding:7px; border-radius:7px; }

    .um-input {
      background:${T.surface}; border:1px solid ${T.border}; border-radius:8px;
      color:${T.text}; font-family:'Outfit',sans-serif; font-size:13px; outline:none;
      padding:9px 12px; transition:border 0.2s, box-shadow 0.2s; width:100%;
    }
    .um-input:focus { border-color:${T.primary}; box-shadow:0 0 0 3px ${T.primary}18; }
    .um-input::placeholder { color:${T.textDim}; }

    .um-tab {
      display:flex; align-items:center; gap:8px;
      padding:11px 18px; border:none; border-bottom:2px solid transparent;
      background:transparent; font-family:'Outfit',sans-serif; font-size:13px; font-weight:600;
      color:${T.textDim}; cursor:pointer; transition:all 0.2s; white-space:nowrap;
    }
    .um-tab.active { color:${T.primary}; border-bottom-color:${T.primary}; }
    .um-tab:hover:not(.active) { color:${T.textSub}; background:${T.primaryDim}; }

    .um-card {
      background:${T.surface}; border:1px solid ${T.border}; border-radius:14px;
      padding:20px; transition:border-color 0.2s;
    }
    .um-card:hover { border-color:${T.borderHigh}; }

    .um-overlay {
      position:fixed; inset:0; background:rgba(4,5,10,0.85); backdrop-filter:blur(12px);
      z-index:2000; animation:umFadeIn 0.2s ease;
      display:flex; align-items:center; justify-content:center;
    }

    .um-drawer {
      position:fixed; top:0; right:0; bottom:0; width:580px; max-width:95vw;
      background:${T.surface}; border-left:1px solid ${T.border};
      box-shadow:-30px 0 80px rgba(0,0,0,0.6);
      animation:umSlideRight 0.32s cubic-bezier(0.16,1,0.3,1);
      display:flex; flex-direction:column; z-index:2000;
    }

    .um-modal {
      background:${T.surface}; border:1px solid ${T.borderHigh}; border-radius:18px;
      box-shadow:0 32px 80px rgba(0,0,0,0.7); overflow:hidden;
      animation:umFadeUp 0.3s cubic-bezier(0.16,1,0.3,1);
    }

    .um-scroll { overflow-y:auto; }
    .um-scroll::-webkit-scrollbar { width:4px; }
    .um-scroll::-webkit-scrollbar-track { background:transparent; }
    .um-scroll::-webkit-scrollbar-thumb { background:${T.border}; border-radius:2px; }
    .um-scroll::-webkit-scrollbar-thumb:hover { background:${T.borderHigh}; }

    .um-badge {
      display:inline-flex; align-items:center; gap:5px;
      padding:3px 9px; border-radius:6px; font-size:11px; font-weight:700; letter-spacing:0.02em;
    }

    .um-checkbox {
      width:17px; height:17px; cursor:pointer; accent-color:${T.primary};
      border-radius:4px; border:1px solid ${T.border}; background:${T.bg};
    }

    .um-sparkline { display:flex; align-items:flex-end; gap:2px; height:28px; }
    .um-sparkline-bar { flex:1; min-width:3px; border-radius:2px; transition:height 0.3s; }

    .um-risk-ring { position:relative; display:inline-flex; align-items:center; justify-content:center; }

    .um-tooltip { position:relative; }
    .um-tooltip:hover .um-tooltip-text { opacity:1; pointer-events:auto; transform:translateY(0); }
    .um-tooltip-text {
      position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%) translateY(4px);
      background:#1a1e30; border:1px solid ${T.border}; border-radius:7px;
      padding:6px 10px; font-size:11px; color:${T.textSub}; white-space:nowrap;
      opacity:0; pointer-events:none; transition:all 0.15s; z-index:100;
    }

    .um-mono { font-family:'Space Mono', monospace; }

    .um-perm-chip {
      padding:3px 7px; border-radius:5px; font-size:10px; font-weight:700;
      letter-spacing:0.06em; font-family:'Space Mono',monospace;
    }

    .um-timeline-dot {
      width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:4px;
    }

    .um-search-highlight { background:${T.primary}33; border-radius:3px; padding:0 2px; }

    .tag-filter {
      display:inline-flex; align-items:center; gap:6px;
      padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600;
      cursor:pointer; transition:all 0.15s; border:1px solid transparent;
    }
    .tag-filter.active { border-color:${T.primary}; color:${T.primary}; background:${T.primaryDim}; }
    .tag-filter:not(.active) { color:${T.textDim}; border-color:${T.border}; }
    .tag-filter:hover:not(.active) { border-color:${T.borderHigh}; color:${T.textSub}; }

    .heat-cell {
      width:12px; height:12px; border-radius:3px; display:inline-block;
    }

    .shimmer-skeleton {
      background:linear-gradient(90deg, ${T.surface} 25%, ${T.surfaceHigh} 50%, ${T.surface} 75%);
      background-size:200% 100%;
      animation:umShimmer 1.5s infinite;
      border-radius:6px;
    }

    .glitch-hover:hover {
      text-shadow:1px 0 ${T.danger}44, -1px 0 ${T.info}44;
    }

    .um-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
    .um-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    .um-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const Icon = ({ d, size=16, color='currentColor', style={} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,...style}}>
        <path d={d}/>
    </svg>
);

const ICONS = {
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
    plus: "M12 5v14M5 12h14",
    search: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    x: "M18 6 6 18M6 6l12 12",
    check: "M20 6 9 17l-5-5",
    chevRight: "M9 18l6-6-6-6",
    chevLeft: "M15 18l-6-6 6-6",
    chevDown: "M6 9l6 6 6-6",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
    key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
    refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    eyeOff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
    copy: "M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 0 2 2v1",
    alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
    database: "M12 2C6.48 2 2 4.02 2 6.5v11C2 19.98 6.48 22 12 22s10-2.02 10-4.5v-11C22 4.02 17.52 2 12 2zm0 2c4.42 0 8 1.57 8 3.5S16.42 11 12 11 4 9.43 4 7.5 7.58 4 12 4z",
    logOut: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
    filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    sort: "M3 6h18M7 12h10M11 18h2",
    clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
    globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.4 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
    more: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    arrowUp: "M12 19V5M5 12l7-7 7 7",
    arrowDown: "M12 5v14M5 12l7 7 7-7",
    save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    trend: "M23 6l-9.5 9.5-5-5L1 18",
    cpu: "M12 2a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v4h2a2 2 0 0 1 0 4h-2v4a2 2 0 0 1-2 2h-4v2a2 2 0 0 1-4 0v-2H6a2 2 0 0 1-2-2v-4H2a2 2 0 0 1 0-4h2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2z",
};

const Ico = ({ name, size=16, color='currentColor', style={} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,...style}}>
        <path d={ICONS[name]||''}/>
    </svg>
);

/* mini helper: display time as relative */
const relTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff/60000);
    if (m<1) return 'Just now';
    if (m<60) return `${m}m ago`;
    const h = Math.floor(m/60);
    if (h<24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
};

/* ═══════════════════════════════════════════════════════════════════════════
   MINI SPARKLINE
   ═══════════════════════════════════════════════════════════════════════════ */
const Sparkline = ({ data, color=T.primary, height=28 }) => {
    const max = Math.max(...data, 1);
    return (
        <div className="um-sparkline" style={{height}}>
            {data.map((v,i) => (
                <div key={i} className="um-sparkline-bar" style={{
                    height:`${(v/max)*100}%`,
                    background: v === 0 ? T.border : `${color}${v > max*0.7 ? 'dd' : '66'}`,
                    minWidth:3,
                }}/>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   RISK RING
   ═══════════════════════════════════════════════════════════════════════════ */
const RiskRing = ({ score, size=44 }) => {
    const color = score > 70 ? T.danger : score > 40 ? T.warning : T.success;
    const r = (size/2)-4;
    const circ = 2*Math.PI*r;
    const dash = (score/100)*circ;
    return (
        <div className="um-risk-ring" style={{width:size,height:size}}>
            <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth="3"/>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
                        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                        style={{transition:'stroke-dasharray 0.6s ease'}}
                />
            </svg>
            <span style={{position:'absolute',fontSize:11,fontWeight:700,color,fontFamily:'Space Mono,monospace'}}>{score}</span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   HEAT MAP CALENDAR
   ═══════════════════════════════════════════════════════════════════════════ */
const LoginHeatmap = ({ data }) => {
    const weeks = [];
    for (let w=0; w<4; w++) weeks.push(data.slice(w*7, w*7+7));
    return (
        <div style={{display:'flex',gap:3}}>
            {weeks.map((week,wi) => (
                <div key={wi} style={{display:'flex',flexDirection:'column',gap:3}}>
                    {week.map((val,di) => (
                        <div key={di} className="heat-cell um-tooltip" style={{
                            background: val===0 ? T.border : val<3 ? `${T.primary}44` : val<6 ? `${T.primary}88` : T.primary,
                        }}>
                            <span className="um-tooltip-text">{val} logins</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
    const cfg = {
        active:    { color:T.success, bg:T.successDim, dot:'•', label:'Active' },
        inactive:  { color:T.textDim, bg:`${T.textDim}18`, dot:'○', label:'Inactive' },
        suspended: { color:T.danger,  bg:T.dangerDim,  dot:'✕', label:'Suspended' },
    }[status] || { color:T.textDim, bg:T.border, dot:'?', label:status };
    return (
        <span className="um-badge" style={{background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.color}30`}}>
      <span style={{fontSize:8, animation: status==='active' ? 'umPulse 2s infinite' : 'none'}}>{cfg.dot}</span>
            {cfg.label}
    </span>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ROLE BADGE
   ═══════════════════════════════════════════════════════════════════════════ */
const RoleBadge = ({ roleId, size='md' }) => {
    const role = ROLES.find(r=>r.id===roleId)||ROLES[4];
    const sm = size==='sm';
    return (
        <div style={{display:'flex',alignItems:'center',gap:sm?5:7}}>
      <span style={{
          fontFamily:'Space Mono,monospace',
          fontSize: sm?10:11,
          fontWeight:700,
          color:role.color,
          background:`${role.color}18`,
          border:`1px solid ${role.color}35`,
          borderRadius:5,
          padding: sm?'2px 6px':'3px 8px',
      }}>{role.badge} {role.label}</span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MFA BADGE
   ═══════════════════════════════════════════════════════════════════════════ */
const MfaBadge = ({ enabled }) => (
    <span className="um-badge" style={{
        background: enabled ? T.successDim : T.dangerDim,
        color: enabled ? T.success : T.danger,
        border:`1px solid ${enabled?T.success:T.danger}30`,
        fontSize:10,
    }}>
    <Ico name={enabled?'shield':'alert'} size={10}/>
        {enabled?'MFA':'No MFA'}
  </span>
);

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const StatCard = ({ label, value, sub, icon, color=T.primary, trend, sparkData, onClick }) => (
    <div className="um-card" onClick={onClick} style={{cursor:onClick?'pointer':'default',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-10,right:-10,opacity:0.06,transform:'scale(2.5)'}}>
            <Ico name={icon} size={48} color={color}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
            <div style={{width:36,height:36,borderRadius:9,background:`${color}18`,border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Ico name={icon} size={16} color={color}/>
            </div>
            {trend !== undefined && (
                <span style={{fontSize:11,fontWeight:700,color: trend>=0?T.success:T.danger,display:'flex',alignItems:'center',gap:3}}>
          <Ico name={trend>=0?'arrowUp':'arrowDown'} size={11} color={trend>=0?T.success:T.danger}/>
                    {Math.abs(trend)}%
        </span>
            )}
        </div>
        <div style={{fontSize:28,fontWeight:800,color:T.text,letterSpacing:'-0.02em',lineHeight:1}}>{value}</div>
        <div style={{fontSize:12,color:T.textSub,marginTop:4,fontWeight:500}}>{label}</div>
        {sub && <div style={{fontSize:11,color:T.textDim,marginTop:3}}>{sub}</div>}
        {sparkData && <div style={{marginTop:12}}><Sparkline data={sparkData} color={color} height={24}/></div>}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   TOP BAR ANALYTICS
   ═══════════════════════════════════════════════════════════════════════════ */
const AnalyticsHeader = ({ users }) => {
    const active = users.filter(u=>u.status==='active').length;
    const noMfa = users.filter(u=>!u.mfa).length;
    const highRisk = users.filter(u=>u.riskScore>70).length;
    const weekLogins = users.reduce((s,u)=>s+u.loginActivity.slice(-7).reduce((a,b)=>a+b,0),0);

    const spark24 = Array.from({length:24},(_,i)=>Math.floor(Math.sin(i/3)*30+40+Math.random()*20));

    return (
        <div className="um-grid-4 um-stagger" style={{marginBottom:24}}>
            <StatCard label="Total Users" value={users.length} sub={`${active} active`} icon="users" color={T.primary} trend={12} sparkData={spark24}/>
            <StatCard label="No MFA Enabled" value={noMfa} sub="Security risk" icon="shield" color={T.warning} trend={-3}/>
            <StatCard label="High Risk Users" value={highRisk} sub="Score > 70" icon="alert" color={T.danger} trend={highRisk>3?5:-8}/>
            <StatCard label="Weekly Logins" value={weekLogins.toLocaleString()} sub="Across all users" icon="activity" color={T.info} sparkData={Array.from({length:7},()=>Math.floor(Math.random()*1000+500))}/>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   USERS TABLE
   ═══════════════════════════════════════════════════════════════════════════ */
const UsersTable = ({ users, onSelectUser, onDeleteUser, onEditUser }) => {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState({ key:'name', dir:'asc' });
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showBulkMenu, setShowBulkMenu] = useState(false);
    const PER_PAGE = 8;

    const toggleSort = (key) => setSort(s => ({ key, dir: s.key===key && s.dir==='asc' ? 'desc' : 'asc' }));

    const filtered = useMemo(() => {
        let r = users.filter(u => {
            const q = search.toLowerCase();
            const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
            const matchRole = roleFilter==='all' || u.role===roleFilter;
            const matchStatus = statusFilter==='all' || u.status===statusFilter;
            return matchQ && matchRole && matchStatus;
        });
        r.sort((a,b) => {
            let av = a[sort.key], bv = b[sort.key];
            if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
            return sort.dir==='asc' ? (av<bv?-1:av>bv?1:0) : (av>bv?-1:av<bv?1:0);
        });
        return r;
    }, [users, search, sort, roleFilter, statusFilter]);

    const pages = Math.ceil(filtered.length / PER_PAGE);
    const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
    const allSelected = paged.length > 0 && paged.every(u => selected.includes(u.id));

    const SortIcon = ({ k }) => {
        if (sort.key !== k) return <Ico name="sort" size={12} color={T.textDim}/>;
        return <Ico name={sort.dir==='asc'?'arrowUp':'arrowDown'} size={12} color={T.primary}/>;
    };

    const cols = '40px 2.2fr 1.2fr 1fr 0.9fr 1fr 80px 44px';

    return (
        <div>
            {/* Toolbar */}
            <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
                <div style={{position:'relative',flex:1,minWidth:220,maxWidth:360}}>
                    <Ico name="search" size={15} color={T.textDim} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}}/>
                    <input className="um-input" placeholder="Search name, email, department…" value={search}
                           onChange={e=>{setSearch(e.target.value);setPage(1);}}
                           style={{paddingLeft:38}}
                    />
                </div>

                {/* Role Filter Pills */}
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {['all',...ROLES.map(r=>r.id)].map(r=>(
                        <button key={r} className={`tag-filter${roleFilter===r?' active':''}`}
                                onClick={()=>{setRoleFilter(r);setPage(1);}}>
                            {r==='all'?'All Roles':ROLES.find(x=>x.id===r)?.label||r}
                        </button>
                    ))}
                </div>

                <div style={{display:'flex',gap:8,marginLeft:'auto'}}>
                    {selected.length > 0 && (
                        <div style={{position:'relative'}}>
                            <button className="um-btn um-btn-danger" onClick={()=>setShowBulkMenu(v=>!v)}>
                                <Ico name="more" size={14}/> Bulk ({selected.length}) <Ico name="chevDown" size={12}/>
                            </button>
                            {showBulkMenu && (
                                <div style={{position:'absolute',right:0,top:'calc(100% + 6px)',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:10,padding:6,zIndex:100,minWidth:160}}>
                                    {[
                                        {label:'Export Selected',icon:'download'},
                                        {label:'Reset Passwords',icon:'key'},
                                        {label:'Revoke Sessions',icon:'logOut'},
                                        {label:'Delete Users',icon:'trash',danger:true},
                                    ].map(item=>(
                                        <button key={item.label} className="um-btn um-btn-ghost"
                                                onClick={()=>{ if(item.danger) onDeleteUser(selected); setShowBulkMenu(false); }}
                                                style={{width:'100%',justifyContent:'flex-start',borderRadius:7,border:'none',color:item.danger?T.danger:T.textSub,background:'transparent',gap:10}}>
                                            <Ico name={item.icon} size={13} color={item.danger?T.danger:T.textDim}/> {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <button className="um-btn um-btn-ghost" onClick={()=>{}}>
                        <Ico name="download" size={14}/> Export
                    </button>
                    <button className="um-btn um-btn-primary" onClick={()=>onEditUser(null)}>
                        <Ico name="plus" size={15}/> Add User
                    </button>
                </div>
            </div>

            {/* Status filter row */}
            <div style={{display:'flex',gap:8,marginBottom:14}}>
                {['all','active','inactive','suspended'].map(s=>(
                    <button key={s} className={`tag-filter${statusFilter===s?' active':''}`}
                            onClick={()=>{setStatusFilter(s);setPage(1);}}>
                        {s==='all'?'All Status':s.charAt(0).toUpperCase()+s.slice(1)}
                    </button>
                ))}
                <span style={{marginLeft:'auto',fontSize:12,color:T.textDim,alignSelf:'center'}}>
          {filtered.length} result{filtered.length!==1?'s':''}
        </span>
            </div>

            {/* Table */}
            <div style={{border:`1px solid ${T.border}`,borderRadius:12,overflow:'hidden'}}>
                {/* Header */}
                <div style={{display:'grid',gridTemplateColumns:cols,padding:'10px 20px',background:T.surfaceHigh,borderBottom:`1px solid ${T.border}`}}>
                    <div style={{display:'flex',alignItems:'center'}}>
                        <input type="checkbox" className="um-checkbox"
                               checked={allSelected}
                               onChange={()=>setSelected(allSelected ? [] : paged.map(u=>u.id))}
                        />
                    </div>
                    {[['name','User'],['role','Role'],['status','Status'],['department','Dept'],['lastLogin','Last Login']].map(([k,label])=>(
                        <button key={k} onClick={()=>toggleSort(k)}
                                style={{display:'flex',alignItems:'center',gap:5,background:'none',border:'none',cursor:'pointer',
                                    fontSize:11,fontWeight:700,color:sort.key===k?T.primary:T.textDim,letterSpacing:'0.06em',textTransform:'uppercase',
                                    fontFamily:'Outfit,sans-serif',padding:0}}>
                            {label} <SortIcon k={k}/>
                        </button>
                    ))}
                    <div style={{fontSize:11,fontWeight:700,color:T.textDim,letterSpacing:'0.06em',textTransform:'uppercase'}}>RISK</div>
                    <div/>
                </div>

                {/* Rows */}
                {paged.length === 0 ? (
                    <div style={{padding:'48px 20px',textAlign:'center',color:T.textDim}}>
                        <Ico name="search" size={28} color={T.textDim} style={{marginBottom:12}}/>
                        <div style={{fontSize:14}}>No users match your filters</div>
                    </div>
                ) : paged.map(user=>(
                    <div key={user.id} className={`um-row${selected.includes(user.id)?' selected':''}`}
                         style={{gridTemplateColumns:cols}} onClick={()=>onSelectUser(user)}>

                        <div onClick={e=>e.stopPropagation()}>
                            <input type="checkbox" className="um-checkbox"
                                   checked={selected.includes(user.id)}
                                   onChange={()=>setSelected(s=>s.includes(user.id)?s.filter(x=>x!==user.id):[...s,user.id])}
                            />
                        </div>

                        <div style={{display:'flex',alignItems:'center',gap:12,overflow:'hidden'}}>
                            <div style={{
                                width:36,height:36,borderRadius:10,flexShrink:0,
                                background:`${ROLES.find(r=>r.id===user.role)?.color||T.primary}22`,
                                border:`1px solid ${ROLES.find(r=>r.id===user.role)?.color||T.primary}40`,
                                display:'flex',alignItems:'center',justifyContent:'center',
                                fontSize:14,fontWeight:700,color:ROLES.find(r=>r.id===user.role)?.color||T.primary,
                            }}>{user.name.charAt(0)}</div>
                            <div style={{overflow:'hidden'}}>
                                <div style={{fontSize:13,fontWeight:600,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user.name}</div>
                                <div style={{fontSize:11,color:T.textDim,overflow:'hidden',textOverflow:'ellipsis'}}>{user.email}</div>
                            </div>
                        </div>

                        <div><RoleBadge roleId={user.role} size="sm"/></div>
                        <div><StatusBadge status={user.status}/></div>
                        <div style={{fontSize:12,color:T.textSub}}>{user.department}</div>
                        <div style={{fontSize:11,color:T.textDim}}>{relTime(user.lastLogin)}</div>

                        <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <RiskRing score={user.riskScore} size={36}/>
                        </div>

                        <div onClick={e=>e.stopPropagation()} style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                            <button className="um-btn um-btn-ghost um-btn-icon" onClick={e=>{e.stopPropagation();onEditUser(user);}}>
                                <Ico name="edit" size={13} color={T.textDim}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0 0'}}>
                <div style={{fontSize:12,color:T.textDim}}>
                    Showing <span style={{color:T.textSub,fontWeight:600}}>{paged.length}</span> of <span style={{color:T.textSub,fontWeight:600}}>{filtered.length}</span> users
                </div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <button className="um-btn um-btn-ghost um-btn-icon" disabled={page===1} onClick={()=>setPage(p=>p-1)}
                            style={{opacity:page===1?0.4:1}}>
                        <Ico name="chevLeft" size={15}/>
                    </button>
                    {Array.from({length:Math.min(pages,5)},(_,i)=>{
                        const p = i+1;
                        return (
                            <button key={p} className="um-btn" onClick={()=>setPage(p)}
                                    style={{
                                        minWidth:32,padding:'5px 0',
                                        background:page===p?T.primary:'transparent',
                                        color:page===p?'#fff':T.textSub,
                                        border:`1px solid ${page===p?T.primary:T.border}`,
                                        borderRadius:7,fontSize:13,fontWeight:600,
                                    }}>
                                {p}
                            </button>
                        );
                    })}
                    <button className="um-btn um-btn-ghost um-btn-icon" disabled={page===pages} onClick={()=>setPage(p=>p+1)}
                            style={{opacity:page===pages||pages===0?0.4:1}}>
                        <Ico name="chevRight" size={15}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PERMISSION MATRIX
   ═══════════════════════════════════════════════════════════════════════════ */
const PermissionMatrix = () => {
    const [activeRole, setActiveRole] = useState('admin');
    const [perms, setPerms] = useState(
        Object.fromEntries(Object.entries(PERMISSIONS_MAP).map(([r,v])=>[r,JSON.parse(JSON.stringify(v))]))
    );

    const toggle = (resource, action) => {
        setPerms(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            const arr = copy[activeRole][resource] || [];
            copy[activeRole][resource] = arr.includes(action) ? arr.filter(a=>a!==action) : [...arr, action];
            return copy;
        });
    };

    const currentPerms = perms[activeRole] || {};

    return (
        <div>
            {/* Role Selector */}
            <div style={{display:'flex',gap:10,marginBottom:24,padding:'16px',background:T.surfaceHigh,borderRadius:12,border:`1px solid ${T.border}`}}>
                {ROLES.map(role=>{
                    const active = activeRole===role.id;
                    return (
                        <button key={role.id} onClick={()=>setActiveRole(role.id)} className="um-btn"
                                style={{
                                    flex:1,flexDirection:'column',gap:6,padding:'12px 8px',
                                    background:active?`${role.color}18`:'transparent',
                                    border:`1px solid ${active?role.color:T.border}`,
                                    color:active?role.color:T.textDim,
                                    borderRadius:10,
                                }}>
                            <div style={{fontSize:18}}>{role.badge}</div>
                            <div style={{fontSize:12,fontWeight:700}}>{role.label}</div>
                            <div style={{fontSize:10,color:active?role.color:T.textDim}}>{role.perms} perms</div>
                        </button>
                    );
                })}
            </div>

            {/* Matrix Grid */}
            <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'separate',borderSpacing:'0 6px'}}>
                    <thead>
                    <tr>
                        <th style={{textAlign:'left',padding:'8px 16px',fontSize:11,fontWeight:700,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.06em'}}>Resource</th>
                        {Object.entries(PERM_LABELS).map(([k,label])=>(
                            <th key={k} style={{padding:'8px 16px',fontSize:11,fontWeight:700,color:PERM_COLORS[k],textTransform:'uppercase',letterSpacing:'0.06em',textAlign:'center'}}>
                                {label}
                            </th>
                        ))}
                        <th style={{textAlign:'right',padding:'8px 16px',fontSize:11,fontWeight:700,color:T.textDim,textTransform:'uppercase',letterSpacing:'0.06em'}}>Coverage</th>
                    </tr>
                    </thead>
                    <tbody>
                    {RESOURCE_ROWS.map(res=>{
                        const hasPerms = currentPerms[res]||[];
                        const coverage = Math.round((hasPerms.length/4)*100);
                        return (
                            <tr key={res} style={{background:T.surface}}>
                                <td style={{padding:'14px 16px',borderRadius:'9px 0 0 9px',border:`1px solid ${T.border}`,borderRight:'none'}}>
                                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                                        <Ico name="database" size={14} color={T.textDim}/>
                                        <span style={{fontSize:13,fontWeight:600,color:T.text,textTransform:'capitalize'}}>{res}</span>
                                    </div>
                                </td>
                                {['r','w','d','a'].map(action=>{
                                    const checked = hasPerms.includes(action);
                                    return (
                                        <td key={action} style={{padding:'14px 16px',border:`1px solid ${T.border}`,borderLeft:'none',borderRight:'none',textAlign:'center'}}>
                                            <button onClick={()=>toggle(res,action)}
                                                    style={{
                                                        width:28,height:28,borderRadius:7,border:`1px solid ${checked?PERM_COLORS[action]:T.border}`,
                                                        background:checked?`${PERM_COLORS[action]}20`:'transparent',
                                                        cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',
                                                        transition:'all 0.15s',
                                                    }}>
                                                {checked && <Ico name="check" size={13} color={PERM_COLORS[action]}/>}
                                            </button>
                                        </td>
                                    );
                                })}
                                <td style={{padding:'14px 16px',borderRadius:'0 9px 9px 0',border:`1px solid ${T.border}`,borderLeft:'none',textAlign:'right'}}>
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:8}}>
                                        <div style={{width:60,height:4,borderRadius:2,background:T.border,overflow:'hidden'}}>
                                            <div style={{height:'100%',width:`${coverage}%`,background: coverage===100?T.success:coverage>50?T.warning:T.danger,borderRadius:2,transition:'width 0.3s'}}/>
                                        </div>
                                        <span style={{fontSize:11,color:T.textDim,fontFamily:'Space Mono,monospace',minWidth:28,textAlign:'right'}}>{coverage}%</span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   AUDIT LOG
   ═══════════════════════════════════════════════════════════════════════════ */
const AuditLog = () => {
    const [filter, setFilter] = useState('all');
    const levels = { info:T.info, warn:T.warning, critical:T.danger, success:T.success };
    const filtered = AUDIT_EVENTS.filter(e => filter==='all' || e.level===filter);

    return (
        <div>
            <div style={{display:'flex',gap:8,marginBottom:16,alignItems:'center'}}>
                {['all','info','warn','critical','success'].map(l=>(
                    <button key={l} className={`tag-filter${filter===l?' active':''}`}
                            onClick={()=>setFilter(l)}
                            style={{color:l!=='all'&&filter===l?levels[l]:undefined, borderColor:l!=='all'&&filter===l?levels[l]:undefined, background:l!=='all'&&filter===l?`${levels[l]}15`:undefined}}>
                        {l==='all'?'All':l.charAt(0).toUpperCase()+l.slice(1)}
                    </button>
                ))}
                <button className="um-btn um-btn-ghost um-btn-sm" style={{marginLeft:'auto'}}>
                    <Ico name="download" size={13}/> Export
                </button>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {filtered.map((log,i)=>{
                    const lc = levels[log.level]||T.textDim;
                    return (
                        <div key={log.id} className="um-card" style={{animation:`umFadeUp 0.3s ease ${i*0.04}s both`,padding:'14px 16px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:14}}>
                                <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:`${lc}15`,border:`1px solid ${lc}30`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                                    <Ico name={log.level==='critical'||log.level==='warn'?'alert':log.level==='success'?'check':'activity'} size={16} color={lc}/>
                                </div>
                                <div style={{flex:1,display:'grid',gridTemplateColumns:'1.4fr 1.2fr 2fr 1fr',gap:12,alignItems:'center'}}>
                                    <div>
                                        <div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:'Space Mono,monospace',fontSize:12}}>{log.action}</div>
                                        <div style={{fontSize:11,color:T.textDim,marginTop:2}}>{new Date(log.ts).toLocaleString()}</div>
                                    </div>
                                    <div style={{fontSize:12,color:T.textSub,display:'flex',alignItems:'center',gap:6}}>
                                        <Ico name="users" size={11} color={T.textDim}/>{log.user}
                                    </div>
                                    <div style={{fontSize:11,color:T.textDim,fontFamily:'Space Mono,monospace',background:T.surfaceHigh,padding:'4px 8px',borderRadius:5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                        {log.detail}
                                    </div>
                                    <div style={{textAlign:'right'}}>
                    <span className="um-badge" style={{background:`${lc}18`,color:lc,border:`1px solid ${lc}30`,fontSize:10}}>
                      {log.level.toUpperCase()}
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

/* ═══════════════════════════════════════════════════════════════════════════
   SECURITY PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const SecurityPanel = ({ users }) => {
    const [sessions, setSessions] = useState([
        { id:1, user:'Alex Morgan', ip:'192.168.1.42', device:'Chrome 120 · macOS Ventura', location:'San Francisco, US', active:true, risk:'low' },
        { id:2, user:'Jamie Chen', ip:'45.22.19.112', device:'Firefox 121 · Windows 11', location:'London, UK', active:false, risk:'high' },
        { id:3, user:'System API', ip:'10.0.0.5', device:'Python SDK 3.11', location:'AWS us-east-1', active:true, risk:'low' },
        { id:4, user:'Unknown', ip:'117.45.22.188', device:'Unknown browser', location:'Shenzhen, CN', active:true, risk:'critical' },
    ]);
    const [apiKeys, setApiKeys] = useState([
        { id:1, name:'Production Backend', prefix:'pk_live_Yz9k', scope:'read:all write:data', created:'2024-08-15', calls:128440, status:'active' },
        { id:2, name:'Data Pipeline', prefix:'pk_pipe_3jHm', scope:'read:all', created:'2025-01-10', calls:9820, status:'active' },
        { id:3, name:'Test Runner', prefix:'pk_test_7xNa', scope:'read:staging', created:'2025-02-01', calls:344, status:'active' },
    ]);

    const riskCfg = { low:T.success, medium:T.warning, high:T.danger, critical:T.danger };
    const highRisk = users.filter(u=>u.riskScore>70);

    return (
        <div style={{display:'flex',flexDirection:'column',gap:24}}>
            {/* Threat Overview */}
            {highRisk.length > 0 && (
                <div style={{padding:16,borderRadius:12,background:`${T.danger}0d`,border:`1px solid ${T.danger}30`}}>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                        <Ico name="alert" size={18} color={T.danger}/>
                        <div style={{fontSize:14,fontWeight:700,color:T.danger}}>
                            {highRisk.length} High-Risk User{highRisk.length!==1?'s':''} Detected
                        </div>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                        {highRisk.map(u=>(
                            <div key={u.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',borderRadius:8,background:`${T.danger}15`,border:`1px solid ${T.danger}30`}}>
                                <span style={{fontSize:13,fontWeight:600,color:T.text}}>{u.name}</span>
                                <RiskRing score={u.riskScore} size={28}/>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Sessions */}
            <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:700,color:T.text}}>
                        <Ico name="globe" size={15} color={T.primary}/> Active Sessions
                        <span className="um-badge" style={{background:T.primaryDim,color:T.primary,fontSize:10}}>{sessions.filter(s=>s.active).length} live</span>
                    </div>
                    <button className="um-btn um-btn-danger um-btn-sm">
                        <Ico name="logOut" size={12}/> Revoke All
                    </button>
                </div>
                <div style={{border:`1px solid ${T.border}`,borderRadius:12,overflow:'hidden'}}>
                    {sessions.map((s,i)=>{
                        const rc = riskCfg[s.risk]||T.textDim;
                        return (
                            <div key={s.id} style={{padding:'14px 18px',borderBottom:i<sessions.length-1?`1px solid ${T.border}`:'none',display:'flex',alignItems:'center',justifyContent:'space-between',background:s.risk==='critical'?`${T.danger}08`:T.surface}}>
                                <div style={{display:'flex',alignItems:'center',gap:14}}>
                                    <div style={{width:40,height:40,borderRadius:10,background:`${rc}15`,border:`1px solid ${rc}30`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                                        <Ico name={s.device.includes('SDK')||s.device.includes('API')?'database':'phone'} size={18} color={rc}/>
                                    </div>
                                    <div>
                                        <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,fontWeight:600,color:T.text}}>
                                            {s.user}
                                            {s.active && <span style={{width:7,height:7,borderRadius:'50%',background:T.success,animation:'umPulse 2s infinite',display:'inline-block'}}/>}
                                            <span className="um-badge" style={{background:`${rc}18`,color:rc,fontSize:9,border:`1px solid ${rc}30`}}>{s.risk.toUpperCase()}</span>
                                        </div>
                                        <div style={{fontSize:11,color:T.textDim,marginTop:2,fontFamily:'Space Mono,monospace'}}>
                                            {s.ip} · {s.location}
                                        </div>
                                        <div style={{fontSize:11,color:T.textDim}}>{s.device}</div>
                                    </div>
                                </div>
                                <button className="um-btn um-btn-danger um-btn-sm" onClick={()=>setSessions(p=>p.filter(x=>x.id!==s.id))}>
                                    Revoke
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* API Keys */}
            <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:700,color:T.text}}>
                        <Ico name="key" size={15} color={T.warning}/> API Keys
                    </div>
                    <button className="um-btn um-btn-ghost um-btn-sm">
                        <Ico name="plus" size={13}/> New Key
                    </button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {apiKeys.map(key=>(
                        <div key={key.id} className="um-card" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:14}}>
                                <div style={{width:36,height:36,borderRadius:9,background:T.warningDim,border:`1px solid ${T.warning}30`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                                    <Ico name="key" size={16} color={T.warning}/>
                                </div>
                                <div>
                                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>{key.name}</div>
                                    <div style={{display:'flex',alignItems:'center',gap:8,marginTop:3}}>
                                        <code style={{fontSize:11,color:T.textDim,fontFamily:'Space Mono,monospace',background:T.surfaceHigh,padding:'2px 6px',borderRadius:4}}>
                                            {key.prefix}••••••••••••
                                        </code>
                                        <span style={{fontSize:10,color:T.textDim}}>{key.scope}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:12}}>
                                <div style={{textAlign:'right'}}>
                                    <div style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:'Space Mono,monospace'}}>{key.calls.toLocaleString()}</div>
                                    <div style={{fontSize:10,color:T.textDim}}>total calls</div>
                                </div>
                                <button className="um-btn um-btn-ghost um-btn-icon" onClick={()=>setApiKeys(p=>p.filter(k=>k.id!==key.id))}>
                                    <Ico name="trash" size={13} color={T.danger}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   USER DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════════════════ */
const UserDrawer = ({ user, onClose, onEdit, onResetPassword }) => {
    const [drawerTab, setDrawerTab] = useState('overview');
    if (!user) return null;

    const role = ROLES.find(r=>r.id===user.role)||ROLES[4];
    const riskColor = user.riskScore>70?T.danger:user.riskScore>40?T.warning:T.success;

    return (
        <div style={{position:'fixed',inset:0,background:'rgba(4,5,10,0.75)',backdropFilter:'blur(8px)',zIndex:2000,animation:'umFadeIn 0.2s ease'}}
             onClick={onClose}>
            <div className="um-drawer" onClick={e=>e.stopPropagation()}>

                {/* Header */}
                <div style={{padding:'24px',borderBottom:`1px solid ${T.border}`,background:`linear-gradient(to bottom, ${T.surfaceHigh}, ${T.surface})`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
                        <div style={{display:'flex',gap:16,alignItems:'center'}}>
                            <div style={{
                                width:60,height:60,borderRadius:18,flexShrink:0,
                                background:`${role.color}20`,border:`2px solid ${role.color}50`,
                                display:'flex',alignItems:'center',justifyContent:'center',
                                fontSize:24,fontWeight:800,color:role.color,
                            }}>{user.name.charAt(0)}</div>
                            <div>
                                <div style={{fontSize:20,fontWeight:800,color:T.text,letterSpacing:'-0.01em'}}>{user.name}</div>
                                <div style={{fontSize:13,color:T.textSub,marginTop:3}}>{user.email}</div>
                                <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>
                                    <RoleBadge roleId={user.role}/>
                                    <StatusBadge status={user.status}/>
                                    <MfaBadge enabled={user.mfa}/>
                                </div>
                            </div>
                        </div>
                        <button className="um-btn um-btn-ghost um-btn-icon" onClick={onClose}>
                            <Ico name="x" size={16}/>
                        </button>
                    </div>

                    {/* Actions */}
                    <div style={{display:'flex',gap:8}}>
                        <button className="um-btn um-btn-ghost" style={{flex:1}} onClick={()=>onEdit(user)}>
                            <Ico name="edit" size={14}/> Edit
                        </button>
                        <button className="um-btn um-btn-ghost" style={{flex:1}} onClick={()=>onResetPassword(user)}>
                            <Ico name="key" size={14}/> Reset Pass
                        </button>
                        <button className="um-btn um-btn-ghost" style={{flex:1}}>
                            <Ico name="mail" size={14}/> Email
                        </button>
                        <button className="um-btn um-btn-danger um-btn-icon">
                            <Ico name="logOut" size={14}/>
                        </button>
                    </div>
                </div>

                {/* Sub Tabs */}
                <div style={{display:'flex',borderBottom:`1px solid ${T.border}`,paddingLeft:8}}>
                    {['overview','sessions','activity'].map(t=>(
                        <button key={t} className={`um-tab${drawerTab===t?' active':''}`} onClick={()=>setDrawerTab(t)}>
                            {t.charAt(0).toUpperCase()+t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="um-scroll" style={{flex:1,padding:24}}>
                    {drawerTab==='overview' && (
                        <div style={{display:'flex',flexDirection:'column',gap:20}}>
                            {/* Risk Score */}
                            <div style={{padding:16,borderRadius:12,background:`${riskColor}0d`,border:`1px solid ${riskColor}30`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                <div style={{display:'flex',alignItems:'center',gap:14}}>
                                    <RiskRing score={user.riskScore} size={56}/>
                                    <div>
                                        <div style={{fontSize:14,fontWeight:700,color:riskColor}}>Security Risk Score</div>
                                        <div style={{fontSize:12,color:T.textDim,marginTop:2}}>
                                            {user.failedLogins} failed logins · {user.sessions} active sessions
                                        </div>
                                        {!user.mfa && <div style={{fontSize:11,color:T.danger,marginTop:4}}>⚠ MFA not enabled</div>}
                                    </div>
                                </div>
                                <div style={{textAlign:'right'}}>
                                    <div style={{fontSize:11,color:T.textDim}}>Data Access Level</div>
                                    <span className="um-badge" style={{
                                        background: user.dataAccess==='restricted'?T.dangerDim:user.dataAccess==='confidential'?T.warningDim:T.successDim,
                                        color: user.dataAccess==='restricted'?T.danger:user.dataAccess==='confidential'?T.warning:T.success,
                                        border:`1px solid ${user.dataAccess==='restricted'?T.danger:user.dataAccess==='confidential'?T.warning:T.success}30`,
                                        marginTop:6,
                                    }}>
                    {user.dataAccess}
                  </span>
                                </div>
                            </div>

                            {/* User Info Grid */}
                            <div className="um-grid-2">
                                {[
                                    {label:'Department', value:user.department, icon:'grid'},
                                    {label:'Location', value:user.location, icon:'globe'},
                                    {label:'Created', value:new Date(user.createdAt).toLocaleDateString(), icon:'clock'},
                                    {label:'Last Login', value:relTime(user.lastLogin), icon:'activity'},
                                    {label:'API Access', value:user.apiAccess?'Enabled':'Disabled', icon:'key'},
                                    {label:'Active Sessions', value:user.sessions, icon:'phone'},
                                ].map(({label,value,icon})=>(
                                    <div key={label} style={{padding:'12px 14px',borderRadius:10,background:T.surfaceHigh,border:`1px solid ${T.border}`}}>
                                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                                            <Ico name={icon} size={13} color={T.textDim}/>
                                            <span style={{fontSize:11,color:T.textDim,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</span>
                                        </div>
                                        <div style={{fontSize:14,fontWeight:600,color:T.text}}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Login Heatmap */}
                            <div style={{padding:16,borderRadius:12,background:T.surfaceHigh,border:`1px solid ${T.border}`}}>
                                <div style={{fontSize:12,fontWeight:700,color:T.textDim,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>28-Day Login Activity</div>
                                <LoginHeatmap data={user.loginActivity.slice(0,28)}/>
                                <div style={{display:'flex',gap:6,marginTop:10,alignItems:'center'}}>
                                    <span style={{fontSize:11,color:T.textDim}}>Less</span>
                                    {[T.border,`${T.primary}44`,`${T.primary}88`,T.primary].map((c,i)=>(
                                        <div key={i} className="heat-cell" style={{background:c}}/>
                                    ))}
                                    <span style={{fontSize:11,color:T.textDim}}>More</span>
                                </div>
                            </div>

                            {/* Permitted Screens */}
                            <div>
                                <div style={{fontSize:12,fontWeight:700,color:T.textDim,marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>Resource Permissions</div>
                                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                                    {Object.entries(PERMISSIONS_MAP[user.role]||{}).map(([res,actions])=>(
                                        <div key={res} style={{padding:'5px 10px',borderRadius:7,background:T.surfaceHigh,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:8}}>
                                            <span style={{fontSize:12,color:T.textSub,textTransform:'capitalize'}}>{res}</span>
                                            <div style={{display:'flex',gap:3}}>
                                                {actions.map(a=>(
                                                    <span key={a} className="um-perm-chip" style={{background:`${PERM_COLORS[a]}18`,color:PERM_COLORS[a]}}>
                            {a}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {drawerTab==='sessions' && (
                        <div style={{display:'flex',flexDirection:'column',gap:10}}>
                            <div style={{fontSize:13,color:T.textDim,marginBottom:4}}>{user.sessions} active session{user.sessions!==1?'s':''}</div>
                            {Array.from({length:user.sessions},(_,i)=>(
                                <div key={i} style={{padding:'14px 16px',borderRadius:10,background:T.surfaceHigh,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                                        <div style={{width:36,height:36,borderRadius:9,background:T.primaryDim,display:'flex',alignItems:'center',justifyContent:'center'}}>
                                            <Ico name="phone" size={16} color={T.primary}/>
                                        </div>
                                        <div>
                                            <div style={{fontSize:13,fontWeight:600,color:T.text}}>Chrome on macOS</div>
                                            <div style={{fontSize:11,color:T.textDim,fontFamily:'Space Mono,monospace'}}>
                                                192.168.{i+1}.1 · {user.location}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                                        {i===0 && <span style={{fontSize:11,color:T.success,fontWeight:700,display:'flex',alignItems:'center',gap:5}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:T.success,animation:'umPulse 2s infinite',display:'inline-block'}}/>CURRENT
                    </span>}
                                        <button className="um-btn um-btn-danger um-btn-sm">Revoke</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {drawerTab==='activity' && (
                        <div>
                            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>Login Timeline</div>
                            <div style={{position:'relative',paddingLeft:24}}>
                                <div style={{position:'absolute',left:8,top:0,bottom:0,width:1,background:T.border}}/>
                                {AUDIT_EVENTS.slice(0,5).map((e,i)=>(
                                    <div key={e.id} style={{position:'relative',marginBottom:16,animation:`umFadeUp 0.3s ease ${i*0.06}s both`}}>
                                        <div style={{position:'absolute',left:-20,top:4,width:10,height:10,borderRadius:'50%',
                                            background: e.level==='critical'||e.level==='warn'?T.danger:T.success,
                                            border:`2px solid ${T.surface}`,
                                        }}/>
                                        <div style={{padding:'12px 14px',borderRadius:10,background:T.surfaceHigh,border:`1px solid ${T.border}`}}>
                                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                                                <span style={{fontSize:12,fontWeight:700,color:T.text,fontFamily:'Space Mono,monospace',letterSpacing:'-0.02em'}}>{e.action}</span>
                                                <span style={{fontSize:11,color:T.textDim}}>{relTime(e.ts)}</span>
                                            </div>
                                            <div style={{fontSize:11,color:T.textDim}}>{e.detail}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   USER FORM MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
const UserFormModal = ({ user, onSave, onCancel }) => {
    const isEdit = !!user;
    const [form, setForm] = useState({
        name: user?.name||'', email: user?.email||'', role: user?.role||'user',
        department: user?.department||DEPARTMENTS[0], location: user?.location||LOCATIONS[0],
        mfa: user?.mfa??true, status: user?.status||'active', apiAccess: user?.apiAccess||false,
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('info');

    const validate = () => {
        const e = {};
        if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        await new Promise(r=>setTimeout(r,600));
        onSave(form);
        setSaving(false);
    };

    const F = ({label,error,children}) => (
        <div>
            <label style={{display:'block',fontSize:11,fontWeight:700,color:error?T.danger:T.textDim,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>
            {children}
            {error && <div style={{fontSize:11,color:T.danger,marginTop:4}}>{error}</div>}
        </div>
    );

    return (
        <div className="um-overlay" onClick={onCancel}>
            <div className="um-modal" onClick={e=>e.stopPropagation()} style={{width:'90%',maxWidth:720,maxHeight:'88vh',display:'flex',flexDirection:'column'}}>
                {/* Header */}
                <div style={{padding:'20px 24px',borderBottom:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:`linear-gradient(135deg, ${T.primary}08, transparent)`}}>
                    <div style={{display:'flex',alignItems:'center',gap:14}}>
                        <div style={{width:40,height:40,borderRadius:12,background:T.primaryDim,border:`1px solid ${T.primary}40`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Ico name={isEdit?'edit':'plus'} size={18} color={T.primary}/>
                        </div>
                        <div>
                            <div style={{fontSize:16,fontWeight:800,color:T.text}}>{isEdit?'Edit User':'Create New User'}</div>
                            <div style={{fontSize:12,color:T.textDim,marginTop:2}}>{isEdit?`Editing ${user.name}`:'Add a new user to the system'}</div>
                        </div>
                    </div>
                    <button className="um-btn um-btn-ghost um-btn-icon" onClick={onCancel}><Ico name="x" size={16}/></button>
                </div>

                {/* Modal Tabs */}
                <div style={{display:'flex',borderBottom:`1px solid ${T.border}`,paddingLeft:8}}>
                    {['info','access','security'].map(t=>(
                        <button key={t} className={`um-tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>
                            {t.charAt(0).toUpperCase()+t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div className="um-scroll" style={{flex:1,padding:24}}>
                    {tab==='info' && (
                        <div style={{display:'flex',flexDirection:'column',gap:18}}>
                            <div className="um-grid-2">
                                <F label="Full Name *" error={errors.name}>
                                    <input className="um-input" placeholder="Jane Doe" value={form.name}
                                           onChange={e=>setForm({...form,name:e.target.value})}
                                           style={{borderColor:errors.name?T.danger:undefined}}/>
                                </F>
                                <F label="Email Address *" error={errors.email}>
                                    <input className="um-input" type="email" placeholder="jane@acme.io" value={form.email}
                                           onChange={e=>setForm({...form,email:e.target.value})}
                                           style={{borderColor:errors.email?T.danger:undefined}}/>
                                </F>
                            </div>
                            <div className="um-grid-2">
                                <F label="Department">
                                    <select className="um-input" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>
                                        {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                                    </select>
                                </F>
                                <F label="Location">
                                    <select className="um-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}>
                                        {LOCATIONS.map(l=><option key={l} value={l}>{l}</option>)}
                                    </select>
                                </F>
                            </div>
                            <F label="Status">
                                <div style={{display:'flex',gap:10}}>
                                    {['active','inactive','suspended'].map(s=>(
                                        <button key={s} onClick={()=>setForm({...form,status:s})} className="um-btn"
                                                style={{
                                                    flex:1,
                                                    background:form.status===s?({active:T.successDim,inactive:`${T.textDim}18`,suspended:T.dangerDim}[s]):T.surface,
                                                    border:`1px solid ${form.status===s?{active:T.success,inactive:T.textDim,suspended:T.danger}[s]:T.border}`,
                                                    color:form.status===s?{active:T.success,inactive:T.textSub,suspended:T.danger}[s]:T.textDim,
                                                }}>
                                            {s.charAt(0).toUpperCase()+s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </F>
                        </div>
                    )}

                    {tab==='access' && (
                        <div>
                            <div style={{marginBottom:20,fontSize:13,color:T.textDim}}>Select a role to assign default permissions. You can customize them individually on the Permissions Matrix tab.</div>
                            <div style={{display:'flex',flexDirection:'column',gap:10}}>
                                {ROLES.map(role=>{
                                    const active = form.role===role.id;
                                    return (
                                        <button key={role.id} onClick={()=>setForm({...form,role:role.id})} className="um-btn"
                                                style={{
                                                    width:'100%',justifyContent:'flex-start',gap:16,padding:16,borderRadius:12,
                                                    background:active?`${role.color}12`:T.surfaceHigh,
                                                    border:`1px solid ${active?role.color:T.border}`,
                                                    color:active?role.color:T.textSub,
                                                }}>
                                            <div style={{width:40,height:40,borderRadius:10,background:`${role.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{role.badge}</div>
                                            <div style={{textAlign:'left',flex:1}}>
                                                <div style={{fontSize:14,fontWeight:700}}>{role.label}</div>
                                                <div style={{fontSize:11,color:T.textDim,marginTop:2}}>
                                                    {role.perms} permissions · {RESOURCE_ROWS.filter(r=>(PERMISSIONS_MAP[role.id]?.[r]||[]).length>0).length} resources
                                                </div>
                                            </div>
                                            <div style={{display:'flex',gap:4,flexWrap:'wrap',justifyContent:'flex-end',maxWidth:160}}>
                                                {Object.entries(PERMISSIONS_MAP[role.id]||{}).slice(0,4).map(([res,acts])=>acts.length>0&&(
                                                    <span key={res} style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:`${role.color}18`,color:role.color,fontWeight:700,textTransform:'uppercase'}}>{res}</span>
                                                ))}
                                            </div>
                                            {active && <Ico name="check" size={18} color={role.color}/>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {tab==='security' && (
                        <div style={{display:'flex',flexDirection:'column',gap:18}}>
                            <div className="um-card" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                <div>
                                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>Multi-Factor Authentication</div>
                                    <div style={{fontSize:12,color:T.textDim,marginTop:3}}>Require 2FA for this user's account</div>
                                </div>
                                <button onClick={()=>setForm(f=>({...f,mfa:!f.mfa}))}
                                        style={{
                                            width:48,height:26,borderRadius:13,cursor:'pointer',
                                            background:form.mfa?T.success:T.border,border:'none',
                                            position:'relative',transition:'background 0.2s',
                                        }}>
                                    <div style={{
                                        width:20,height:20,borderRadius:10,background:'white',
                                        position:'absolute',top:3,transition:'left 0.2s',
                                        left:form.mfa?24:4,
                                        boxShadow:'0 2px 4px rgba(0,0,0,0.3)',
                                    }}/>
                                </button>
                            </div>
                            <div className="um-card" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                <div>
                                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>API Access</div>
                                    <div style={{fontSize:12,color:T.textDim,marginTop:3}}>Allow user to generate API keys</div>
                                </div>
                                <button onClick={()=>setForm(f=>({...f,apiAccess:!f.apiAccess}))}
                                        style={{
                                            width:48,height:26,borderRadius:13,cursor:'pointer',
                                            background:form.apiAccess?T.primary:T.border,border:'none',
                                            position:'relative',transition:'background 0.2s',
                                        }}>
                                    <div style={{
                                        width:20,height:20,borderRadius:10,background:'white',
                                        position:'absolute',top:3,transition:'left 0.2s',
                                        left:form.apiAccess?24:4,
                                        boxShadow:'0 2px 4px rgba(0,0,0,0.3)',
                                    }}/>
                                </button>
                            </div>
                            <div className="um-card" style={{background:T.dangerDim,borderColor:`${T.danger}30`}}>
                                <div style={{fontSize:13,fontWeight:700,color:T.danger,marginBottom:8}}>Danger Zone</div>
                                <div style={{display:'flex',gap:10}}>
                                    <button className="um-btn um-btn-danger um-btn-sm">Force Password Reset</button>
                                    <button className="um-btn um-btn-danger um-btn-sm">Revoke All Sessions</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{padding:'16px 24px',borderTop:`1px solid ${T.border}`,display:'flex',gap:10}}>
                    <button className="um-btn um-btn-ghost" onClick={onCancel} style={{flex:1}} disabled={saving}>
                        <Ico name="x" size={14}/> Cancel
                    </button>
                    <button className="um-btn um-btn-primary" onClick={handleSave} style={{flex:2}} disabled={saving}>
                        {saving
                            ? <><Ico name="refresh" size={14} style={{animation:'umSpin 1s linear infinite'}}/> Saving…</>
                            : <><Ico name="save" size={14}/> {isEdit?'Update User':'Create User'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PASSWORD RESET MODAL
   ═══════════════════════════════════════════════════════════════════════════ */
const PasswordModal = ({ user, onClose }) => {
    const gen = () => {
        const s='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
        return Array.from({length:14},()=>s[Math.floor(Math.random()*s.length)]).join('');
    };
    const [pw, setPw] = useState(gen);
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);

    const copy = () => { navigator.clipboard.writeText(pw); setCopied(true); setTimeout(()=>setCopied(false),2000); };

    const strength = pw.length >= 12 && /[!@#$%^&*]/.test(pw) && /[0-9]/.test(pw) && /[A-Z]/.test(pw)
        ? {label:'Strong',color:T.success} : pw.length >= 8 ? {label:'Medium',color:T.warning} : {label:'Weak',color:T.danger};

    return (
        <div className="um-overlay" onClick={onClose}>
            <div className="um-modal" onClick={e=>e.stopPropagation()} style={{width:'90%',maxWidth:460}}>
                <div style={{padding:'20px 24px',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:14,background:`linear-gradient(135deg,${T.warningDim},transparent)`}}>
                    <div style={{width:40,height:40,borderRadius:12,background:T.warningDim,border:`1px solid ${T.warning}40`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <Ico name="key" size={18} color={T.warning}/>
                    </div>
                    <div>
                        <div style={{fontSize:16,fontWeight:800,color:T.text}}>Reset Password</div>
                        <div style={{fontSize:12,color:T.textDim}}>{user.name}</div>
                    </div>
                    <button className="um-btn um-btn-ghost um-btn-icon" onClick={onClose} style={{marginLeft:'auto'}}>
                        <Ico name="x" size={16}/>
                    </button>
                </div>
                <div style={{padding:24,display:'flex',flexDirection:'column',gap:16}}>
                    <div>
                        <label style={{display:'block',fontSize:11,fontWeight:700,color:T.textDim,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.06em'}}>New Password</label>
                        <div style={{position:'relative'}}>
                            <input className="um-input um-mono" type={show?'text':'password'} value={pw}
                                   onChange={e=>setPw(e.target.value)} style={{paddingRight:80,fontSize:14,letterSpacing:show?'0.04em':'0.2em'}}/>
                            <div style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',display:'flex',gap:4}}>
                                <button className="um-btn um-btn-ghost um-btn-icon" onClick={()=>setShow(v=>!v)} style={{width:28,height:28,padding:0}}>
                                    <Ico name={show?'eyeOff':'eye'} size={13}/>
                                </button>
                                <button className="um-btn um-btn-ghost um-btn-icon" onClick={copy}
                                        style={{width:28,height:28,padding:0,background:copied?T.successDim:undefined,borderColor:copied?`${T.success}40`:undefined}}>
                                    <Ico name={copied?'check':'copy'} size={13} color={copied?T.success:undefined}/>
                                </button>
                            </div>
                        </div>
                        {/* Strength Bar */}
                        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
                            <div style={{flex:1,height:3,borderRadius:2,background:T.border,overflow:'hidden'}}>
                                <div style={{height:'100%',width:strength.label==='Strong'?'100%':strength.label==='Medium'?'60%':'30%',background:strength.color,transition:'all 0.3s',borderRadius:2}}/>
                            </div>
                            <span style={{fontSize:11,fontWeight:700,color:strength.color}}>{strength.label}</span>
                        </div>
                    </div>
                    <button className="um-btn um-btn-ghost" onClick={()=>setPw(gen())}>
                        <Ico name="refresh" size={13}/> Generate New Password
                    </button>
                </div>
                <div style={{padding:'16px 24px',borderTop:`1px solid ${T.border}`,display:'flex',gap:10}}>
                    <button className="um-btn um-btn-ghost" onClick={onClose} style={{flex:1}}><Ico name="x" size={14}/> Cancel</button>
                    <button className="um-btn" onClick={onClose}
                            style={{flex:2,background:`linear-gradient(135deg,${T.warning},#e08800)`,color:'#fff'}}>
                        <Ico name="key" size={14}/> Set New Password
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════════════════════ */
const Toast = ({ toasts }) => (
    <div style={{position:'fixed',top:24,right:24,zIndex:9999,display:'flex',flexDirection:'column',gap:8}}>
        {toasts.map(t=>(
            <div key={t.id} style={{
                padding:'12px 18px',borderRadius:10,
                background: t.type==='success'?T.successDim:t.type==='error'?T.dangerDim:T.primaryDim,
                border:`1px solid ${t.type==='success'?T.success:t.type==='error'?T.danger:T.primary}40`,
                display:'flex',alignItems:'center',gap:10,
                boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
                animation:'umSlideRight 0.3s ease',
                backdropFilter:'blur(12px)',
            }}>
                <Ico name={t.type==='success'?'check':t.type==='error'?'x':'activity'} size={15}
                     color={t.type==='success'?T.success:t.type==='error'?T.danger:T.primary}/>
                <span style={{fontSize:13,fontWeight:600,color:T.text}}>{t.message}</span>
            </div>
        ))}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const UserManagementTab = () => {
    const [users, setUsers] = useState(generateUsers);
    const [activeTab, setActiveTab] = useState('users');
    const [drawerUser, setDrawerUser] = useState(null);
    const [editUser, setEditUser] = useState(undefined); // undefined=closed, null=new, obj=edit
    const [resetUser, setResetUser] = useState(null);
    const [toasts, setToasts] = useState([]);

    const toast = useCallback((message, type='success') => {
        const id = Date.now();
        setToasts(t=>[...t,{id,message,type}]);
        setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);
    },[]);

    const handleSaveUser = useCallback((data) => {
        if (editUser) {
            setUsers(u=>u.map(x=>x.id===editUser.id?{...x,...data}:x));
            toast(`${data.name} updated successfully`);
        } else {
            const newUser = {
                ...data, id:Date.now(), createdAt:new Date().toISOString(),
                loginActivity:Array.from({length:28},()=>Math.floor(Math.random()*6)),
                failedLogins:0, riskScore:5, sessions:1, dataAccess:'internal',
            };
            setUsers(u=>[newUser,...u]);
            toast(`${data.name} created successfully`);
        }
        setEditUser(undefined);
    },[editUser,toast]);

    const handleDeleteUsers = useCallback((ids) => {
        const arr = Array.isArray(ids)?ids:[ids];
        setUsers(u=>u.filter(x=>!arr.includes(x.id)));
        toast(`${arr.length} user${arr.length>1?'s':''} removed`,'error');
    },[toast]);

    const TABS = [
        { id:'users',    label:'Users',       icon:'users'    },
        { id:'matrix',   label:'Permissions', icon:'shield'   },
        { id:'audit',    label:'Audit Log',   icon:'activity' },
        { id:'security', label:'Security',    icon:'lock'     },
    ];

    return (
        <div className="um-root" style={{padding:'28px 28px 48px'}}>
            <GlobalStyles/>
            <Toast toasts={toasts}/>

            {/* Page Header */}
            <div style={{marginBottom:28,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                    <h1 style={{fontSize:26,fontWeight:900,color:T.text,letterSpacing:'-0.03em',margin:0}}>
                        User Management
                    </h1>
                    <div style={{fontSize:13,color:T.textDim,marginTop:4}}>
                        Manage access, permissions, and security across your organization
                    </div>
                </div>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <div style={{fontSize:12,color:T.textDim,fontFamily:'Space Mono,monospace',padding:'6px 12px',background:T.surfaceHigh,borderRadius:8,border:`1px solid ${T.border}`}}>
                        {users.length} users · {users.filter(u=>u.status==='active').length} active
                    </div>
                    <button className="um-btn um-btn-primary" onClick={()=>setEditUser(null)}>
                        <Ico name="plus" size={15}/> New User
                    </button>
                </div>
            </div>

            {/* Analytics Row */}
            <AnalyticsHeader users={users}/>

            {/* Main Card */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,overflow:'visible'}}>
                {/* Tabs */}
                <div style={{display:'flex',borderBottom:`1px solid ${T.border}`,paddingLeft:8,background:T.surfaceHigh,borderRadius:'16px 16px 0 0'}}>
                    {TABS.map(t=>(
                        <button key={t.id} className={`um-tab${activeTab===t.id?' active':''}`} onClick={()=>setActiveTab(t.id)}>
                            <Ico name={t.icon} size={14}/> {t.label}
                        </button>
                    ))}
                </div>

                <div style={{padding:24}}>
                    {activeTab==='users' && (
                        <UsersTable
                            users={users}
                            onSelectUser={setDrawerUser}
                            onDeleteUser={handleDeleteUsers}
                            onEditUser={(u)=>setEditUser(u===null?null:u)}
                        />
                    )}
                    {activeTab==='matrix' && <PermissionMatrix/>}
                    {activeTab==='audit' && <AuditLog/>}
                    {activeTab==='security' && <SecurityPanel users={users}/>}
                </div>
            </div>

            {/* Drawer */}
            {drawerUser && (
                <UserDrawer
                    user={drawerUser}
                    onClose={()=>setDrawerUser(null)}
                    onEdit={(u)=>{ setDrawerUser(null); setEditUser(u); }}
                    onResetPassword={(u)=>{ setDrawerUser(null); setResetUser(u); }}
                />
            )}

            {/* Modals */}
            {editUser !== undefined && (
                <UserFormModal user={editUser} onSave={handleSaveUser} onCancel={()=>setEditUser(undefined)}/>
            )}
            {resetUser && (
                <PasswordModal user={resetUser} onClose={()=>{ setResetUser(null); toast('Password reset link sent'); }}/>
            )}
        </div>
    );
};

export default UserManagementTab;