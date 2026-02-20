/**
 * AuditAndSecurity.jsx — FULL REPLACEMENT
 * Path: src/usermanagement/PermissionMatrix/AuditAndSecurity.jsx
 * 100% self-contained — zero imports from ui.jsx or shared components
 */

import React, { useState, memo } from 'react';

/* ─── Theme ─────────────────────────────────────────────────────── */
const T = {
    surface:     '#12121f',
    surfaceHigh: '#1a1a2e',
    surfaceMid:  '#16162a',
    border:      '#252538',
    primary:     '#6c63ff',
    primaryDim:  '#6c63ff1a',
    success:     '#10b981',
    warning:     '#f59e0b',
    warningDim:  '#f59e0b1a',
    danger:      '#ef4444',
    text:        '#e8eaf0',
    textDim:     '#9395a5',
    textMuted:   '#565870',
};

/* ─── CSS injected once ──────────────────────────────────────────── */
const STYLE_ID = 'as2-styles';
function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = [
        '.as2 { font-family: "DM Sans","Inter",system-ui,sans-serif; color:' + T.text + '; }',
        '.as2 *, .as2 *::before, .as2 *::after { box-sizing: border-box; }',

        '.as2-btn { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:8px; border:none; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; }',
        '.as2-btn-ghost { background:transparent; color:' + T.textDim + '; border:1px solid ' + T.border + '; }',
        '.as2-btn-ghost:hover { background:' + T.surfaceHigh + '; color:' + T.text + '; }',
        '.as2-btn-danger { background:' + T.danger + '; color:#fff; }',
        '.as2-btn-danger:hover { filter:brightness(1.1); }',
        '.as2-btn-sm { padding:5px 10px; font-size:11px; }',

        '.as2-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; border:1px solid ' + T.border + '; background:transparent; color:' + T.textDim + '; font-size:12px; font-weight:500; cursor:pointer; font-family:inherit; transition:all .15s; }',
        '.as2-pill:hover { border-color:#2e2e48; color:' + T.text + '; }',
        '.as2-pill.on { font-weight:700; }',

        '.as2-card { background:' + T.surface + '; border:1px solid ' + T.border + '; border-radius:12px; }',

        '@keyframes as2-in { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }',
        '.as2-in { animation: as2-in .2s ease-out both; }',

        '@keyframes as2-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }',
        '.as2-pulse { animation: as2-pulse 2s infinite; }',
    ].join('\n');
    document.head.appendChild(el);
}

/* ─── SVG icons ──────────────────────────────────────────────────── */
function Svg(props) {
    return React.createElement('svg', {
        width: props.size || 14,
        height: props.size || 14,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: props.color || 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        style: { flexShrink: 0, display: 'inline-flex' },
    }, props.children);
}

var ICONS = {
    alert: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('path', { d:'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
            React.createElement('line', { x1:'12', y1:'9', x2:'12', y2:'13' }),
            React.createElement('line', { x1:'12', y1:'17', x2:'12.01', y2:'17' })
        );
    },
    check: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('polyline', { points:'20 6 9 17 4 12' })
        );
    },
    activity: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('polyline', { points:'22 12 18 12 15 21 9 3 6 12 2 12' })
        );
    },
    users: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('path', { d:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
            React.createElement('circle', { cx:'9', cy:'7', r:'4' }),
            React.createElement('path', { d:'M23 21v-2a4 4 0 0 0-3-3.87' }),
            React.createElement('path', { d:'M16 3.13a4 4 0 0 1 0 7.75' })
        );
    },
    download: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('path', { d:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
            React.createElement('polyline', { points:'7 10 12 15 17 10' }),
            React.createElement('line', { x1:'12', y1:'15', x2:'12', y2:'3' })
        );
    },
    key: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('path', { d:'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4' })
        );
    },
    trash: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('polyline', { points:'3 6 5 6 21 6' }),
            React.createElement('path', { d:'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
        );
    },
    plus: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('line', { x1:'12', y1:'5', x2:'12', y2:'19' }),
            React.createElement('line', { x1:'5', y1:'12', x2:'19', y2:'12' })
        );
    },
    monitor: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('rect', { x:'2', y:'3', width:'20', height:'14', rx:'2', ry:'2' }),
            React.createElement('line', { x1:'8', y1:'21', x2:'16', y2:'21' }),
            React.createElement('line', { x1:'12', y1:'17', x2:'12', y2:'21' })
        );
    },
    globe: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('circle', { cx:'12', cy:'12', r:'10' }),
            React.createElement('line', { x1:'2', y1:'12', x2:'22', y2:'12' }),
            React.createElement('path', { d:'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
        );
    },
    logOut: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('path', { d:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
            React.createElement('polyline', { points:'16 17 21 12 16 7' }),
            React.createElement('line', { x1:'21', y1:'12', x2:'9', y2:'12' })
        );
    },
    shield: function(sz, c) {
        return React.createElement(Svg, { size:sz, color:c },
            React.createElement('path', { d:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
        );
    },
};

function Ico(props) {
    var fn = ICONS[props.name];
    if (!fn) return null;
    return React.createElement('span', {
        style: { display:'inline-flex', alignItems:'center', flexShrink:0 }
    }, fn(props.size || 14, props.color || 'currentColor'));
}

/* ─── Level config ───────────────────────────────────────────────── */
var LEVEL_COLOR = {
    info:     '#6c63ff',
    warn:     '#f59e0b',
    critical: '#ef4444',
    success:  '#10b981',
};

var RISK_COLOR = {
    low:      '#10b981',
    medium:   '#f59e0b',
    high:     '#ef4444',
    critical: '#ff2d6b',
};

/* ─── Mock data ──────────────────────────────────────────────────── */
var AUDIT_EVENTS = [
    { id:1, user:'Alex Morgan',  action:'ROLE_CHANGED',         resource:'user:jamie_chen',    level:'warn',     ts:'2025-02-17T14:32:00Z', detail:'admin -> super_admin' },
    { id:2, user:'System',       action:'ANOMALY_DETECTED',      resource:'auth:suspicious_ip', level:'critical', ts:'2025-02-17T13:15:00Z', detail:'12 failed logins from 45.22.19.112' },
    { id:3, user:'Jamie Chen',   action:'DATA_EXPORT',           resource:'db:production',      level:'warn',     ts:'2025-02-17T12:01:00Z', detail:'Exported 28,450 rows' },
    { id:4, user:'Admin',        action:'USER_CREATED',          resource:'user:sam_rivera',    level:'info',     ts:'2025-02-17T11:40:00Z', detail:'Role: Analyst' },
    { id:5, user:'Sam Rivera',   action:'API_KEY_GENERATED',     resource:'api:prod_key_7',     level:'info',     ts:'2025-02-17T10:20:00Z', detail:'Scope: read:all' },
    { id:6, user:'Jordan Park',  action:'SQL_EXEC',              resource:'db:prod',            level:'warn',     ts:'2025-02-17T09:55:00Z', detail:'DROP TABLE attempted -- blocked' },
    { id:7, user:'System',       action:'AUTO_BACKUP',           resource:'backup:2025-02-17',  level:'success',  ts:'2025-02-17T00:00:00Z', detail:'1.4 GB -- 100% integrity' },
    { id:8, user:'Taylor Kim',   action:'PERMISSION_ESCALATION', resource:'schema:finance',     level:'critical', ts:'2025-02-16T22:10:00Z', detail:'Unauthorized access attempt' },
];

var INITIAL_SESSIONS = [
    { id:1, user:'Alex Morgan', ip:'192.168.1.42',  device:'Chrome 120 / macOS',      location:'San Francisco, US', active:true,  risk:'low' },
    { id:2, user:'Jamie Chen',  ip:'45.22.19.112',  device:'Firefox 121 / Windows 11', location:'London, UK',        active:false, risk:'high' },
    { id:3, user:'System API',  ip:'10.0.0.5',      device:'Python SDK 3.11',          location:'AWS us-east-1',     active:true,  risk:'low' },
    { id:4, user:'Unknown',     ip:'117.45.22.188', device:'Unknown browser',           location:'Shenzhen, CN',      active:true,  risk:'critical' },
];

var INITIAL_API_KEYS = [
    { id:1, name:'Production Backend', prefix:'pk_live_Yz9k', scope:'read:all write:data', created:'2024-08-15', calls:128440, status:'active' },
    { id:2, name:'Data Pipeline',      prefix:'pk_pipe_3jHm', scope:'read:all',            created:'2025-01-10', calls:9820,   status:'active' },
    { id:3, name:'Test Runner',        prefix:'pk_test_7xNa', scope:'read:staging',        created:'2025-02-01', calls:344,    status:'active' },
];

/* ─── Audit Log ──────────────────────────────────────────────────── */
export var AuditLog = function AuditLog() {
    ensureStyles();
    var _f = useState('all');
    var filter    = _f[0];
    var setFilter = _f[1];

    var filtered = AUDIT_EVENTS.filter(function(e) {
        return filter === 'all' || e.level === filter;
    });

    return React.createElement('div', { className:'as2' },

        /* Filter bar */
        React.createElement('div', {
                style:{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }
            },
            ['all','info','warn','critical','success'].map(function(l) {
                var lc = l !== 'all' ? LEVEL_COLOR[l] : undefined;
                var isOn = filter === l;
                return React.createElement('button', {
                    key: l,
                    className: 'as2-pill' + (isOn ? ' on' : ''),
                    onClick: function() { setFilter(l); },
                    style: isOn && lc ? { borderColor:lc, color:lc, background:lc+'15' } : {},
                }, l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1));
            }),
            React.createElement('button', {
                    className:'as2-btn as2-btn-ghost as2-btn-sm',
                    style:{ marginLeft:'auto' }
                },
                React.createElement(Ico, { name:'download', size:12 }),
                ' Export'
            )
        ),

        /* Event list */
        React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
            filtered.length === 0
                ? React.createElement('div', { style:{ textAlign:'center', padding:'40px', color:T.textMuted, fontSize:13 } }, 'No events found')
                : filtered.map(function(entry, i) {
                    var lc = LEVEL_COLOR[entry.level] || T.textDim;
                    var iconName = (entry.level === 'critical' || entry.level === 'warn') ? 'alert'
                        : entry.level === 'success' ? 'check' : 'activity';
                    return React.createElement('div', {
                            key: entry.id,
                            className: 'as2-card as2-in',
                            style: { padding:'14px 16px', animationDelay: (i*40)+'ms' }
                        },
                        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:14 } },
                            /* level icon */
                            React.createElement('div', {
                                style:{ width:38, height:38, borderRadius:10, flexShrink:0,
                                    background:lc+'15', border:'1px solid '+lc+'30',
                                    display:'flex', alignItems:'center', justifyContent:'center' }
                            }, React.createElement(Ico, { name:iconName, size:16, color:lc })),

                            /* grid */
                            React.createElement('div', {
                                    style:{ flex:1, display:'grid',
                                        gridTemplateColumns:'1.4fr 1fr 2fr 90px',
                                        gap:12, alignItems:'center' }
                                },
                                /* action + time */
                                React.createElement('div', null,
                                    React.createElement('div', {
                                        style:{ fontSize:12, fontWeight:700, color:T.text,
                                            fontFamily:'"SF Mono","Fira Code",monospace' }
                                    }, entry.action),
                                    React.createElement('div', {
                                        style:{ fontSize:11, color:T.textDim, marginTop:2 }
                                    }, new Date(entry.ts).toLocaleString())
                                ),
                                /* user */
                                React.createElement('div', {
                                        style:{ fontSize:12, color:T.textDim,
                                            display:'flex', alignItems:'center', gap:5 }
                                    },
                                    React.createElement(Ico, { name:'users', size:11, color:T.textMuted }),
                                    entry.user
                                ),
                                /* detail */
                                React.createElement('div', {
                                    style:{ fontSize:11, color:T.textDim,
                                        fontFamily:'"SF Mono","Fira Code",monospace',
                                        background:T.surfaceHigh, padding:'4px 8px',
                                        borderRadius:5, overflow:'hidden',
                                        textOverflow:'ellipsis', whiteSpace:'nowrap' }
                                }, entry.detail),
                                /* badge */
                                React.createElement('div', { style:{ textAlign:'right' } },
                                    React.createElement('span', {
                                        style:{ display:'inline-flex', alignItems:'center', gap:5,
                                            padding:'3px 9px', borderRadius:6, fontSize:10,
                                            fontWeight:700, background:lc+'18', color:lc,
                                            border:'1px solid '+lc+'30' }
                                    }, entry.level.toUpperCase())
                                )
                            )
                        )
                    );
                })
        )
    );
};

/* ─── Security Panel ─────────────────────────────────────────────── */
export var SecurityPanel = function SecurityPanel(props) {
    ensureStyles();
    var users = props.users || [];

    var _s = useState(INITIAL_SESSIONS);
    var sessions    = _s[0];
    var setSessions = _s[1];

    var _k = useState(INITIAL_API_KEYS);
    var apiKeys    = _k[0];
    var setApiKeys = _k[1];

    var highRisk = users.filter(function(u) { return (u.riskScore || 0) > 70; });

    var revokeSession    = function(id) { setSessions(function(p) { return p.filter(function(s) { return s.id !== id; }); }); };
    var revokeAll        = function()   { setSessions([]); };
    var revokeApiKey     = function(id) { setApiKeys(function(p)   { return p.filter(function(k) { return k.id !== id; }); }); };

    return React.createElement('div', { className:'as2', style:{ display:'flex', flexDirection:'column', gap:24 } },

        /* High-risk alert */
        highRisk.length > 0 && React.createElement('div', {
                style:{ padding:16, borderRadius:12,
                    background:T.danger+'0d', border:'1px solid '+T.danger+'30' }
            },
            React.createElement('div', {
                    style:{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }
                },
                React.createElement(Ico, { name:'alert', size:18, color:T.danger }),
                React.createElement('div', {
                    style:{ fontSize:14, fontWeight:700, color:T.danger }
                }, highRisk.length + ' High-Risk User' + (highRisk.length !== 1 ? 's' : '') + ' Detected')
            ),
            React.createElement('div', { style:{ display:'flex', flexWrap:'wrap', gap:8 } },
                highRisk.map(function(u) {
                    return React.createElement('div', {
                            key: u.id,
                            style:{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px',
                                borderRadius:8, background:T.danger+'15', border:'1px solid '+T.danger+'30' }
                        },
                        React.createElement('span', {
                            style:{ fontSize:13, fontWeight:600, color:T.text }
                        }, u.name),
                        React.createElement('span', {
                            style:{ fontSize:11, fontWeight:700, color:T.danger,
                                background:T.danger+'20', padding:'2px 6px', borderRadius:4 }
                        }, 'Risk: ' + u.riskScore)
                    );
                })
            )
        ),

        /* Active Sessions */
        React.createElement('section', null,
            React.createElement('div', {
                    style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }
                },
                React.createElement('div', {
                        style:{ display:'flex', alignItems:'center', gap:8,
                            fontSize:14, fontWeight:700, color:T.text }
                    },
                    React.createElement(Ico, { name:'globe', size:15, color:T.primary }),
                    'Active Sessions',
                    React.createElement('span', {
                        style:{ display:'inline-flex', padding:'3px 9px', borderRadius:6,
                            fontSize:10, fontWeight:700,
                            background:T.primaryDim, color:T.primary }
                    }, sessions.filter(function(s) { return s.active; }).length + ' live')
                ),
                React.createElement('button', {
                        className:'as2-btn as2-btn-danger as2-btn-sm',
                        onClick: revokeAll
                    },
                    React.createElement(Ico, { name:'logOut', size:12, color:'#fff' }),
                    ' Revoke All'
                )
            ),

            React.createElement('div', {
                    style:{ border:'1px solid '+T.border, borderRadius:12, overflow:'hidden',
                        background:T.surface }
                },
                sessions.length === 0
                    ? React.createElement('div', {
                        style:{ padding:32, textAlign:'center', color:T.textDim, fontSize:13 }
                    }, 'No active sessions')
                    : sessions.map(function(s, i) {
                        var rc = RISK_COLOR[s.risk] || T.textDim;
                        return React.createElement('div', {
                                key: s.id,
                                style:{ padding:'14px 18px',
                                    borderBottom: i < sessions.length-1 ? '1px solid '+T.border : 'none',
                                    display:'flex', alignItems:'center', justifyContent:'space-between',
                                    background: s.risk === 'critical' ? T.danger+'08' : T.surface }
                            },
                            React.createElement('div', {
                                    style:{ display:'flex', alignItems:'center', gap:14 }
                                },
                                /* device icon */
                                React.createElement('div', {
                                    style:{ width:40, height:40, borderRadius:10,
                                        background:rc+'15', border:'1px solid '+rc+'30',
                                        display:'flex', alignItems:'center', justifyContent:'center' }
                                }, React.createElement(Ico, { name:'monitor', size:18, color:rc })),

                                React.createElement('div', null,
                                    React.createElement('div', {
                                            style:{ display:'flex', alignItems:'center', gap:8,
                                                fontSize:13, fontWeight:600, color:T.text }
                                        },
                                        s.user,
                                        s.active && React.createElement('span', {
                                            className:'as2-pulse',
                                            style:{ width:7, height:7, borderRadius:'50%',
                                                background:T.success, display:'inline-block' }
                                        }),
                                        React.createElement('span', {
                                            style:{ display:'inline-flex', padding:'2px 7px',
                                                borderRadius:5, fontSize:9, fontWeight:700,
                                                background:rc+'18', color:rc, border:'1px solid '+rc+'30' }
                                        }, s.risk.toUpperCase())
                                    ),
                                    React.createElement('div', {
                                        style:{ fontSize:11, color:T.textDim, marginTop:2,
                                            fontFamily:'"SF Mono","Fira Code",monospace' }
                                    }, s.ip + ' · ' + s.location),
                                    React.createElement('div', {
                                        style:{ fontSize:11, color:T.textDim }
                                    }, s.device)
                                )
                            ),
                            React.createElement('button', {
                                className:'as2-btn as2-btn-danger as2-btn-sm',
                                onClick: function() { revokeSession(s.id); }
                            }, 'Revoke')
                        );
                    })
            )
        ),

        /* API Keys */
        React.createElement('section', null,
            React.createElement('div', {
                    style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }
                },
                React.createElement('div', {
                        style:{ display:'flex', alignItems:'center', gap:8,
                            fontSize:14, fontWeight:700, color:T.text }
                    },
                    React.createElement(Ico, { name:'key', size:15, color:T.warning }),
                    'API Keys'
                ),
                React.createElement('button', { className:'as2-btn as2-btn-ghost as2-btn-sm' },
                    React.createElement(Ico, { name:'plus', size:13 }),
                    ' New Key'
                )
            ),

            React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
                apiKeys.map(function(key) {
                    return React.createElement('div', {
                            key: key.id,
                            className: 'as2-card',
                            style:{ display:'flex', alignItems:'center',
                                justifyContent:'space-between', padding:'14px 16px' }
                        },
                        React.createElement('div', {
                                style:{ display:'flex', alignItems:'center', gap:14 }
                            },
                            React.createElement('div', {
                                style:{ width:36, height:36, borderRadius:9,
                                    background:T.warningDim, border:'1px solid '+T.warning+'30',
                                    display:'flex', alignItems:'center', justifyContent:'center' }
                            }, React.createElement(Ico, { name:'key', size:16, color:T.warning })),

                            React.createElement('div', null,
                                React.createElement('div', {
                                    style:{ fontSize:13, fontWeight:600, color:T.text }
                                }, key.name),
                                React.createElement('div', {
                                        style:{ display:'flex', alignItems:'center', gap:8, marginTop:3 }
                                    },
                                    React.createElement('code', {
                                        style:{ fontSize:11, color:T.textDim,
                                            fontFamily:'"SF Mono","Fira Code",monospace',
                                            background:T.surfaceHigh, padding:'2px 6px', borderRadius:4 }
                                    }, key.prefix + '............'),
                                    React.createElement('span', {
                                        style:{ fontSize:10, color:T.textDim }
                                    }, key.scope)
                                )
                            )
                        ),

                        React.createElement('div', {
                                style:{ display:'flex', alignItems:'center', gap:12 }
                            },
                            React.createElement('div', { style:{ textAlign:'right' } },
                                React.createElement('div', {
                                    style:{ fontSize:12, fontWeight:700, color:T.text,
                                        fontFamily:'"SF Mono","Fira Code",monospace' }
                                }, key.calls.toLocaleString()),
                                React.createElement('div', {
                                    style:{ fontSize:10, color:T.textDim }
                                }, 'total calls')
                            ),
                            React.createElement('button', {
                                className:'as2-btn as2-btn-ghost as2-btn-sm',
                                'aria-label': 'Revoke ' + key.name,
                                onClick: function() { revokeApiKey(key.id); },
                                style:{ padding:'5px 8px' }
                            }, React.createElement(Ico, { name:'trash', size:13, color:T.danger }))
                        )
                    );
                })
            )
        ),

        /* Security overview footer */
        React.createElement('div', {
                style:{ padding:'16px 20px', borderRadius:12,
                    background:T.surfaceMid, border:'1px solid '+T.border,
                    display:'flex', alignItems:'center', gap:12 }
            },
            React.createElement(Ico, { name:'shield', size:16, color:T.primary }),
            React.createElement('div', null,
                React.createElement('div', {
                    style:{ fontSize:13, fontWeight:600, color:T.text }
                }, 'Security Status'),
                React.createElement('div', {
                    style:{ fontSize:11, color:T.textDim, marginTop:2 }
                }, sessions.filter(function(s) { return s.risk === 'critical'; }).length + ' critical sessions · ' + apiKeys.length + ' active API keys · ' + highRisk.length + ' high-risk users')
            )
        )
    );
};