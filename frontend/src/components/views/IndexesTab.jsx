import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { fetchData } from '../../utils/api';
import {
    Layers, AlertTriangle, Zap, Cpu, Database, TrendingDown,
    CheckCircle, XCircle, ArrowRight, Search, Filter, Download,
    BarChart3, Activity, Clock, HardDrive, Sparkles,
    Code, X, Info, ChevronRight, Eye, Trash2,
    Settings, RefreshCw, AlertCircle, TrendingUp, Target,
    Wrench, GitBranch, RotateCcw, Terminal, Copy,
    Minimize2, Check, ChevronDown, ChevronUp,
    Shield, Flame, Crosshair, Radio, Signal,
    Play, ArrowUpRight, Plus, Minus, Hash, Star,
    BookOpen, SkipForward, Layers2, Hexagon, Waves
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS — Deep Space / Mission Control
   Pitch black substrate. Electric cyan signals. Plasma orange warnings.
   Verdant green success. Typography: IBM Plex Mono + Bebas Neue.
   ═══════════════════════════════════════════════════════════════════════════ */
const K = {
    /* Backgrounds */
    void:        '#02030a',
    deep:        '#050810',
    surface:     '#080c18',
    panel:       '#0c1020',
    raised:      '#111829',

    /* Primary signal — electric cyan */
    cyan:        '#00d4ff',
    cyanDim:     '#007a99',
    cyanGlow:    'rgba(0,212,255,0.12)',
    cyanGlowHot: 'rgba(0,212,255,0.25)',

    /* Warning — plasma orange */
    plasma:      '#ff6b1a',
    plasmaGlow:  'rgba(255,107,26,0.15)',

    /* Critical — neutron red */
    nova:        '#ff2d55',
    novaGlow:    'rgba(255,45,85,0.14)',

    /* Safe — aurora green */
    aurora:      '#00ff88',
    auroraGlow:  'rgba(0,255,136,0.10)',

    /* Stellar — soft gold */
    stellar:     '#ffd60a',
    stellarGlow: 'rgba(255,214,10,0.10)',

    /* Nebula — muted violet accent */
    nebula:      '#8b5cf6',
    nebulaGlow:  'rgba(139,92,246,0.12)',

    /* Grid / structure */
    grid:        'rgba(0,212,255,0.04)',
    gridLine:    'rgba(0,212,255,0.07)',
    border:      'rgba(0,212,255,0.10)',
    borderHot:   'rgba(0,212,255,0.30)',

    /* Text */
    textPrimary: '#e8f4f8',
    textSub:     '#5a8a99',
    textDim:     '#263340',
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPREHENSIVE MOCK DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const DATA = {
    health: {
        hitRatio: 98.2, totalIndexes: 84, totalWaste: '2.8 GB',
        avgBloat: 44, seqScanRate: 3.7, criticalCount: 2,
        indexScans: 284710, seqScans: 10922,
        history: [96.1, 96.8, 97.2, 97.5, 97.1, 97.8, 98.0, 97.6, 97.9, 98.1, 98.0, 98.2],
        seqHistory: [5.1, 4.8, 4.9, 4.2, 3.9, 4.1, 3.8, 3.9, 3.6, 3.8, 3.7, 3.7],
    },
    missing: [
        { id: 1,  table: 'orders',        schema: 'public',    column: 'customer_id, status',     severity: 'critical', seq_scan: 892400, tableSize: '4.2 GB', estSize: '210 MB', currentLatency: 350, estLatency: 12,  include: 'total_amount, created_at', partial: null,                                      writes: 420,  reads: 18200, type: 'missing', hash: '4A9F' },
        { id: 2,  table: 'audit_logs',    schema: 'public',    column: 'created_at',              severity: 'critical', seq_scan: 341000, tableSize: '12 GB',  estSize: '450 MB', currentLatency: 890, estLatency: 28,  include: null,                       partial: "created_at > NOW() - INTERVAL '1 year'",  writes: 2100, reads: 8400,  type: 'missing', hash: '7C3B' },
        { id: 3,  table: 'user_sessions', schema: 'auth',      column: 'user_id, expires_at',     severity: 'high',     seq_scan: 92000,  tableSize: '850 MB', estSize: '38 MB',  currentLatency: 210, estLatency: 8,   include: 'session_token',            partial: 'expires_at > NOW()',                      writes: 880,  reads: 6200,  type: 'missing', hash: '2E8A' },
        { id: 4,  table: 'events',        schema: 'analytics', column: 'account_id, event_type',  severity: 'high',     seq_scan: 74000,  tableSize: '8.1 GB', estSize: '320 MB', currentLatency: 680, estLatency: 40,  include: 'properties',               partial: null,                                      writes: 5400, reads: 4100,  type: 'missing', hash: '9D2C' },
        { id: 5,  table: 'products',      schema: 'inventory', column: 'category_id',             severity: 'medium',   seq_scan: 18000,  tableSize: '290 MB', estSize: '14 MB',  currentLatency: 95,  estLatency: 4,   include: 'name, price',              partial: 'is_active = true',                        writes: 120,  reads: 3800,  type: 'missing', hash: '5F1D' },
        { id: 6,  table: 'notifications', schema: 'messaging', column: 'recipient_id, read',      severity: 'medium',   seq_scan: 14200,  tableSize: '180 MB', estSize: '9 MB',   currentLatency: 78,  estLatency: 5,   include: 'created_at',               partial: 'read = false',                            writes: 740,  reads: 2900,  type: 'missing', hash: '1B6E' },
    ],
    duplicates: [
        { id: 10, indexName: 'idx_users_email_uniq',  table: 'users',         schema: 'auth',      definition: '(email)',                  shadowedBy: 'idx_users_email_name_role',   wastedSpace: '45 MB',  writes: 220, type: 'duplicates', hash: 'D4A9' },
        { id: 11, indexName: 'idx_orders_cust',       table: 'orders',        schema: 'public',    definition: '(customer_id)',             shadowedBy: 'idx_orders_cust_status_date', wastedSpace: '120 MB', writes: 420, type: 'duplicates', hash: 'F2C7' },
        { id: 12, indexName: 'idx_products_cat_old',  table: 'products',      schema: 'inventory', definition: '(category_id, created_at)', shadowedBy: 'idx_products_cat_active_ts',  wastedSpace: '31 MB',  writes: 120, type: 'duplicates', hash: '8E3B' },
        { id: 13, indexName: 'idx_sessions_user',     table: 'user_sessions', schema: 'auth',      definition: '(user_id)',                 shadowedBy: 'idx_sessions_user_expires',   wastedSpace: '18 MB',  writes: 880, type: 'duplicates', hash: 'A1F4' },
    ],
    bloat: [
        { id: 20, indexName: 'pk_transactions',   table: 'transactions', schema: 'billing',   bloatPct: 42, size: '850 MB', wastedSpace: '357 MB', fragLevel: 4, lastVacuum: '14d ago', writes: 1800, type: 'bloat', hash: '3C8D' },
        { id: 21, indexName: 'idx_logs_meta',     table: 'app_logs',     schema: 'public',    bloatPct: 65, size: '2.1 GB', wastedSpace: '1.4 GB', fragLevel: 5, lastVacuum: '28d ago', writes: 5200, type: 'bloat', hash: '6F2A' },
        { id: 22, indexName: 'idx_audit_ts',      table: 'audit_logs',   schema: 'public',    bloatPct: 38, size: '490 MB', wastedSpace: '186 MB', fragLevel: 3, lastVacuum: '7d ago',  writes: 2100, type: 'bloat', hash: 'B9E1' },
        { id: 23, indexName: 'idx_events_acct',   table: 'events',       schema: 'analytics', bloatPct: 51, size: '1.3 GB', wastedSpace: '663 MB', fragLevel: 4, lastVacuum: '21d ago', writes: 5400, type: 'bloat', hash: '4D7C' },
    ],
    unused: [
        { id: 30, indexName: 'idx_temp_fix_2023',   table: 'products',      schema: 'inventory', size: '450 MB', scans: 0, lastUsed: 'Never',   writes: 120, type: 'unused', hash: 'C2B5' },
        { id: 31, indexName: 'idx_users_legacy_id', table: 'users',         schema: 'auth',      size: '88 MB',  scans: 0, lastUsed: '180d ago', writes: 220, type: 'unused', hash: 'E8F3' },
        { id: 32, indexName: 'idx_orders_ref_code', table: 'orders',        schema: 'public',    size: '210 MB', scans: 2, lastUsed: '94d ago',  writes: 420, type: 'unused', hash: '7A1D' },
    ],
};

const genSQL = (idx) => {
    if (idx.type === 'missing') {
        const lines = [
            `CREATE INDEX CONCURRENTLY`,
            `  idx_${idx.table}_${idx.column.replace(/[, ]+/g,'_')}`,
            `  ON ${idx.schema}.${idx.table} USING btree (${idx.column})`,
            idx.include ? `  INCLUDE (${idx.include})` : null,
            idx.partial  ? `  WHERE ${idx.partial}` : null,
            `;`,
        ].filter(Boolean);
        return lines.join('\n');
    }
    if (idx.type === 'duplicates') return `-- Safely drop: fully covered by ${idx.shadowedBy}\nDROP INDEX CONCURRENTLY ${idx.indexName};`;
    if (idx.type === 'bloat')      return `-- Rebuild with zero downtime\nREINDEX INDEX CONCURRENTLY ${idx.indexName};\n\n-- Then analyze:\nANALYZE ${idx.schema}.${idx.table};`;
    if (idx.type === 'unused')     return `-- Verify zero usage, then:\nDROP INDEX CONCURRENTLY ${idx.indexName};\n\n-- Check first:\nSELECT idx_scan FROM pg_stat_user_indexes\n  WHERE indexrelname = '${idx.indexName}';`;
    return '';
};

const sevColor = s => ({ critical: K.nova, high: K.plasma, medium: K.stellar, low: K.aurora }[s] || K.textSub);
const fragColor = n => n >= 5 ? K.nova : n >= 4 ? K.plasma : n >= 3 ? K.stellar : K.aurora;

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const IdxStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800&display=swap');

        /* ── Keyframes ── */
        @keyframes idxIn      { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes idxSlideR  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
        @keyframes idxPulse   { 0%,100%{opacity:1} 50%{opacity:.18} }
        @keyframes idxScan    { 0%{transform:translateY(-100%)} 100%{transform:translateY(1400%)} }
        @keyframes idxBarGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes idxSpin    { to{transform:rotate(360deg)} }
        @keyframes idxHexSpin { to{transform:rotate(360deg)} }
        @keyframes idxBlink   { 0%,88%{opacity:1} 89%,93%{opacity:0} 94%,100%{opacity:1} }
        @keyframes idxWave    { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
        @keyframes idxFlare   { 0%,100%{opacity:.06} 50%{opacity:.18} }
        @keyframes idxOrbit   { 0%{transform:rotate(0deg) translateX(22px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(22px) rotate(-360deg)} }
        @keyframes idxCounter { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
        @keyframes idxRipple  { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.8);opacity:0} }
        @keyframes idxGlitch  { 0%,92%,100%{transform:none;clip-path:none}
                                 93%{transform:translate(-2px,0);clip-path:polygon(0 20%,100% 20%,100% 26%,0 26%)}
                                 95%{transform:translate(2px,0);clip-path:polygon(0 55%,100% 55%,100% 60%,0 60%)}
                                 97%{transform:none;clip-path:none} }
        @keyframes idxDataFlow { 0%{stroke-dashoffset:200} 100%{stroke-dashoffset:0} }
        @keyframes idxMatrixFall { 0%{transform:translateY(-20px);opacity:0} 10%{opacity:1} 90%{opacity:.6} 100%{transform:translateY(300px);opacity:0} }

        /* ── Utility classes ── */
        .idx-stagger>* { animation:idxIn .5s cubic-bezier(.22,1,.36,1) both }
        .idx-stagger>*:nth-child(1){animation-delay:.00s}
        .idx-stagger>*:nth-child(2){animation-delay:.07s}
        .idx-stagger>*:nth-child(3){animation-delay:.14s}
        .idx-stagger>*:nth-child(4){animation-delay:.21s}
        .idx-stagger>*:nth-child(5){animation-delay:.28s}
        .idx-stagger>*:nth-child(6){animation-delay:.35s}

        .idx-row { transition:all .12s; cursor:pointer; border-left:2px solid transparent; }
        .idx-row:hover { background:${K.cyanGlow} !important; border-left-color:${K.cyan} !important; }
        .idx-row:hover .idx-reveal { opacity:1 !important; }
        .idx-reveal { opacity:0; transition:opacity .15s; }

        .idx-scroll::-webkit-scrollbar { width:3px; height:3px }
        .idx-scroll::-webkit-scrollbar-thumb { background:${K.cyanDim}; border-radius:2px }
        .idx-scroll::-webkit-scrollbar-track { background:transparent }

        .idx-btn { transition:all .15s; }
        .idx-btn:hover { border-color:${K.cyan} !important; background:${K.cyanGlow} !important; color:${K.cyan} !important; box-shadow:0 0 16px ${K.cyanGlow}; }

        /* Grid background */
        .idx-grid {
            background-image:linear-gradient(${K.gridLine} 1px,transparent 1px),
                             linear-gradient(90deg,${K.gridLine} 1px,transparent 1px);
            background-size:28px 28px;
        }

        /* Scanline sweep */
        .idx-scan::after {
            content:'';position:absolute;left:0;right:0;height:100px;pointer-events:none;z-index:1;
            background:linear-gradient(to bottom,transparent,${K.cyanGlow},transparent);
            animation:idxScan 8s linear infinite;
        }

        /* Panel corner brackets */
        .idx-panel { position:relative }
        .idx-panel::before,.idx-panel::after { content:'';position:absolute;width:14px;height:14px;border-color:${K.cyan};border-style:solid }
        .idx-panel::before { top:-1px;left:-1px;border-width:1px 0 0 1px }
        .idx-panel::after  { bottom:-1px;right:-1px;border-width:0 1px 1px 0 }

        /* Animated bar */
        .idx-bar { transform-origin:left; animation:idxBarGrow 1.1s cubic-bezier(.22,1,.36,1) both }

        /* Tooltip */
        .idx-tt { position:relative;display:inline-flex }
        .idx-tt:hover .idx-tip { opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto }
        .idx-tip {
            position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);
            background:rgba(2,3,10,.98);border:1px solid ${K.border};padding:5px 10px;border-radius:2px;
            font-size:10px;white-space:nowrap;color:${K.textPrimary};pointer-events:none;opacity:0;
            transition:all .15s;z-index:9999;font-family:'IBM Plex Mono',monospace;
        }

        /* Glitch on hover */
        .idx-glitch:hover { animation:idxGlitch .5s step-end }

        /* Waveform bars */
        .idx-wave-bar { animation:idxWave 1.2s ease-in-out infinite }
        .idx-wave-bar:nth-child(2){animation-delay:.15s}
        .idx-wave-bar:nth-child(3){animation-delay:.30s}
        .idx-wave-bar:nth-child(4){animation-delay:.45s}
        .idx-wave-bar:nth-child(5){animation-delay:.60s}

        /* Cursor blink */
        .idx-cursor::after { content:'▋';animation:idxBlink 1.1s step-end infinite;margin-left:1px }

        /* Status rings */
        .idx-ring-pulse::after {
            content:'';position:absolute;inset:-5px;border-radius:50%;border:1px solid currentColor;
            animation:idxRipple 2s ease-out infinite;
        }

        /* Copy pop */
        @keyframes idxCopyPop { 0%{transform:scale(1)} 50%{transform:scale(1.35)} 100%{transform:scale(1)} }
        .idx-copy-pop { animation:idxCopyPop .3s ease }

        /* Data flow SVG */
        .idx-flow { animation:idxDataFlow 2s linear infinite }

        /* Matrix text column */
        .idx-matrix-col { animation:idxMatrixFall linear infinite; font-family:'IBM Plex Mono',monospace; font-size:9px; position:absolute; top:0; color:${K.aurora}; white-space:nowrap; user-select:none; pointer-events:none }

        /* Wide text */
        .idx-truncate { overflow:hidden;text-overflow:ellipsis;white-space:nowrap }

        /* Hexagon clip */
        .idx-hex { clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%) }

        /* Flare pulse */
        .idx-flare { animation:idxFlare 4s ease-in-out infinite }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MICRO COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

/* Status dot */
const Dot = ({ color, pulse, size = 6 }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, boxShadow: `0 0 ${size}px ${color}` }} />
        {pulse && <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1px solid ${color}80`, animation: 'idxRipple 2s ease-out infinite' }} />}
    </div>
);

/* Threat classification badge */
const ThreatBadge = ({ level, small }) => {
    const cfg = {
        critical: { label: 'CRITICAL', color: K.nova,   symbol: '◈' },
        high:     { label: 'HIGH',     color: K.plasma, symbol: '◆' },
        medium:   { label: 'MEDIUM',   color: K.stellar,symbol: '◇' },
        low:      { label: 'LOW',      color: K.aurora, symbol: '○' },
    }[level] || { label: '?', color: K.textSub, symbol: '?' };

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: small ? 8.5 : 9.5, fontWeight: 700, letterSpacing: '0.12em',
            padding: small ? '2px 6px' : '3px 9px', borderRadius: 1,
            background: `${cfg.color}12`, color: cfg.color,
            border: `1px solid ${cfg.color}28`, fontFamily: "'IBM Plex Mono',monospace",
        }}>
            <span style={{ animation: level === 'critical' ? 'idxPulse 1s infinite' : 'none', fontSize: 10 }}>{cfg.symbol}</span>
            {cfg.label}
        </span>
    );
};

/* Waveform widget */
const Waveform = ({ count = 5, color, height = 16 }) => (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center', height }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="idx-wave-bar" style={{
                width: 3, height: height * (0.3 + Math.random() * 0.7),
                background: color, borderRadius: 1, animationDelay: `${i * 0.15}s`,
                boxShadow: `0 0 4px ${color}60`,
            }} />
        ))}
    </div>
);

/* Segment bar (bloat visualization) */
const SegBar = ({ pct, color, height = 6 }) => (
    <div style={{ height, background: `${K.textDim}30`, borderRadius: 1, overflow: 'hidden', flex: 1 }}>
        <div className="idx-bar" style={{
            width: `${pct}%`, height: '100%', maxWidth: '100%',
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 8px ${color}50`,
        }} />
    </div>
);

/* Frag level indicator (5 segments) */
const FragMeter = ({ level }) => (
    <div style={{ display: 'flex', gap: 2 }}>
        {[1,2,3,4,5].map(i => (
            <div key={i} style={{
                width: 6, height: 10, borderRadius: 1,
                background: i <= level ? fragColor(level) : `${K.textDim}35`,
                boxShadow: i <= level ? `0 0 4px ${fragColor(level)}80` : 'none',
                transition: 'all .3s',
            }} />
        ))}
    </div>
);

/* Mini sparkline — SVG */
const Spark = ({ data, color, w = 80, h = 28, fill = false }) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    const last = pts.split(' ').pop().split(',');
    return (
        <svg width={w} height={h} style={{ overflow: 'visible', display: 'block' }}>
            {fill && <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`${color}14`} />}
            <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5}
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ filter: `drop-shadow(0 0 3px ${color}60)` }} />
            <circle cx={last[0]} cy={last[1]} r={2.8} fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
        </svg>
    );
};

/* SQL syntax highlighter */
const SqlBlock = ({ sql }) => {
    const [copied, setCopied] = useState(false);
    const tokens = sql
        .replace(/(CREATE|DROP|REINDEX|VACUUM|ANALYZE|SELECT|FROM|WHERE|INDEX|ON|USING|CONCURRENTLY|INCLUDE|AND|OR|SET|TABLE|INTO)\b/g,
            `<span style="color:${K.cyan};font-weight:600">$1</span>`)
        .replace(/(btree|hash|gin|gist)/gi,
            `<span style="color:${K.nebula}">$1</span>`)
        .replace(/('.*?')/g,
            `<span style="color:${K.aurora}">$1</span>`)
        .replace(/(--.*$)/gm,
            `<span style="color:${K.textSub}">$1</span>`)
        .replace(/\b(\d+)\b/g,
            `<span style="color:${K.stellar}">$1</span>`);
    return (
        <div style={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${K.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: K.void, borderBottom: `1px solid ${K.border}` }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Terminal size={11} color={K.cyanDim} />
                    <span style={{ fontSize: 9, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em' }}>SQL · PostgreSQL 14+</span>
                </div>
                <button onClick={() => { navigator.clipboard?.writeText(sql); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className={copied ? 'idx-copy-pop' : ''}
                        style={{ background: 'none', border: `1px solid ${K.border}`, borderRadius: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: copied ? K.aurora : K.textSub, fontSize: 9.5, fontFamily: "'IBM Plex Mono',monospace", padding: '2px 8px', transition: 'all .2s' }}>
                    {copied ? <><Check size={10} />COPIED</> : <><Copy size={10} />COPY</>}
                </button>
            </div>
            <pre style={{ margin: 0, padding: '14px 16px', fontSize: 11.5, lineHeight: 1.75, background: K.void, color: K.textPrimary, fontFamily: "'IBM Plex Mono',monospace", overflowX: 'auto', tabSize: 2 }}>
                <code dangerouslySetInnerHTML={{ __html: tokens }} />
            </pre>
        </div>
    );
};

/* Radial arc gauge */
const ArcGauge = ({ value, max = 100, color, size = 120, label, sub }) => {
    const sw = 8, r = (size - sw) / 2, circ = 2 * Math.PI * r;
    const filled = circ * Math.min(value, max) / max;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}18`} strokeWidth={sw} />
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
                        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
                        transform={`rotate(-90 ${size/2} ${size/2})`}
                        style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.22,1,.36,1)', filter: `drop-shadow(0 0 8px ${color}70)` }} />
                {/* Tick marks */}
                {[0,25,50,75].map(pct => {
                    const angle = (pct / 100) * 360 - 90;
                    const rad = angle * Math.PI / 180;
                    const x1 = size/2 + (r - sw/2 - 3) * Math.cos(rad);
                    const y1 = size/2 + (r - sw/2 - 3) * Math.sin(rad);
                    const x2 = size/2 + (r + sw/2 + 2) * Math.cos(rad);
                    const y2 = size/2 + (r + sw/2 + 2) * Math.sin(rad);
                    return <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${color}30`} strokeWidth={1} />;
                })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <span style={{ fontSize: size > 80 ? 22 : 14, fontWeight: 900, color, fontFamily: "'Bebas Neue',monospace", lineHeight: 1 }}>{value}{max !== 100 ? '' : '%'}</span>
                {label && <span style={{ fontSize: 8.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center' }}>{label}</span>}
                {sub && <span style={{ fontSize: 7.5, color: `${color}80`, fontFamily: "'IBM Plex Mono',monospace" }}>{sub}</span>}
            </div>
        </div>
    );
};

/* Metric tile */
const MetTile = ({ label, value, color = K.cyan, icon: Icon, sub, spark, trend }) => (
    <div style={{
        padding: '16px 18px', background: K.panel,
        border: `1px solid ${color}18`, borderRadius: 2,
        position: 'relative', overflow: 'hidden',
        boxShadow: `0 0 20px ${color}06`,
    }} className="idx-panel">
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `${color}06`, filter: 'blur(25px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ padding: 7, borderRadius: 1, background: `${color}12`, border: `1px solid ${color}20` }}>
                    {Icon && <Icon size={14} color={color} />}
                </div>
                {trend != null && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: trend > 0 ? K.aurora : K.nova, display: 'flex', alignItems: 'center', gap: 2, fontFamily: "'IBM Plex Mono',monospace" }}>
                        {trend > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "'Bebas Neue',sans-serif", lineHeight: 1, letterSpacing: '.02em', marginBottom: 4 }} className="idx-stat-num">{value}</div>
            <div style={{ fontSize: 9.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: spark ? 8 : 0 }}>{label}</div>
            {sub && <div style={{ fontSize: 9.5, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace", marginBottom: spark ? 6 : 0 }}>{sub}</div>}
            {spark && <Spark data={spark} color={color} w={130} h={28} fill />}
        </div>
    </div>
);

/* Hash chip */
const HashChip = ({ code }) => (
    <span style={{ fontSize: 8.5, fontFamily: "'IBM Plex Mono',monospace", color: K.textDim, background: K.void, border: `1px solid ${K.border}`, padding: '1px 6px', borderRadius: 1, letterSpacing: '.1em' }}>
        #{code}
    </span>
);

/* IO ticker */
const IOTicker = ({ writes, reads }) => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace" }}>W <span style={{ color: K.plasma }}>{writes.toLocaleString()}</span>/m</span>
        <span style={{ width: 1, height: 8, background: K.border }} />
        <span style={{ fontSize: 9, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace" }}>R <span style={{ color: K.cyan }}>{reads.toLocaleString()}</span>/m</span>
    </div>
);

/* Radar polygon chart */
const RadarChart = ({ d, size = 160 }) => {
    const cx = size / 2, cy = size / 2, r = size * 0.36;
    const axes = [
        { label: 'Hit Rate',    val: d.hitRatio / 100 },
        { label: 'Low Bloat',   val: 1 - d.avgBloat / 100 },
        { label: 'Efficiency',  val: 1 - d.seqScanRate / 20 },
        { label: 'Coverage',    val: 0.88 },
        { label: 'Freshness',   val: 0.76 },
        { label: 'Perf',        val: 0.82 },
    ];
    const pt = (i, frac) => {
        const a = (i / axes.length) * Math.PI * 2 - Math.PI / 2;
        return [cx + frac * r * Math.cos(a), cy + frac * r * Math.sin(a)];
    };
    const webPts = axes.map((a, i) => pt(i, a.val).join(',')).join(' ');
    const rings = [.25, .5, .75, 1];
    return (
        <svg width={size} height={size}>
            {rings.map(fr => (
                <polygon key={fr} points={axes.map((_, i) => pt(i, fr).join(',')).join(' ')}
                         fill="none" stroke={K.gridLine} strokeWidth={.8} />
            ))}
            {axes.map((_, i) => {
                const [x, y] = pt(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={K.gridLine} strokeWidth={.8} />;
            })}
            <polygon points={webPts} fill={`${K.cyan}14`} stroke={K.cyan} strokeWidth={1.5}
                     style={{ filter: `drop-shadow(0 0 8px ${K.cyan}50)` }} />
            {axes.map((a, i) => {
                const [x, y] = pt(i, 1.28);
                return (
                    <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                          fill={K.textSub} fontSize={7.5} fontFamily="'IBM Plex Mono',monospace">
                        {a.label}
                    </text>
                );
            })}
        </svg>
    );
};

/* Latency comparison visual */
const LatencyViz = ({ before, after }) => {
    const gain = Math.round(((before - after) / before) * 100);
    const bars = 24;
    const Bar = ({ max, val, color, label }) => (
        <div style={{ flex: 1, padding: '14px 12px', background: `${color}07`, border: `1px solid ${color}20`, borderRadius: 2 }}>
            <div style={{ fontSize: 8.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color, fontFamily: "'Bebas Neue',sans-serif", lineHeight: 1, marginBottom: 10 }}>{val}<span style={{ fontSize: 13, fontWeight: 400 }}>ms</span></div>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 32 }}>
                {Array.from({ length: bars }).map((_, i) => {
                    const h = 4 + (i / bars) * 28;
                    const active = i < Math.ceil((val / max) * bars);
                    return <div key={i} style={{ flex: 1, height: active ? h : 4, background: active ? color : `${K.textDim}40`, borderRadius: '1px 1px 0 0', transition: `height .5s ease ${i*.02}s`, minWidth: 2 }} />;
                })}
            </div>
        </div>
    );
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10 }}>
                <Bar max={before} val={before} color={K.nova}   label="CURRENT LATENCY" />
                <Bar max={before} val={after}  color={K.aurora} label="PROJECTED LATENCY" />
            </div>
            <div style={{ textAlign: 'center', padding: '14px', background: `${K.aurora}08`, border: `1px solid ${K.aurora}20`, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${K.aurora}04, transparent)` }} />
                <div style={{ position: 'relative' }}>
                    <div style={{ fontSize: 40, fontWeight: 900, color: K.aurora, fontFamily: "'Bebas Neue',sans-serif", lineHeight: 1 }}>{gain}%</div>
                    <div style={{ fontSize: 9, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.12em', marginTop: 3 }}>PERFORMANCE GAIN</div>
                </div>
            </div>
        </div>
    );
};

/* Tooltip wrapper */
const Tip = ({ content, children }) => (
    <div className="idx-tt" style={{ display: 'inline-flex' }}>
        {children}
        <div className="idx-tip">{content}</div>
    </div>
);
/* ═══════════════════════════════════════════════════════════════════════════
   MATRIX RAIN BACKGROUND (decorative)
   ═══════════════════════════════════════════════════════════════════════════ */
const MatrixRain = () => {
    const cols = 8;
    const chars = '01ABCDEF∑∆∏∫Ω≈≤≥±√';
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.18, pointerEvents: 'none' }}>
            {Array.from({ length: cols }).map((_, i) => (
                <div key={i} className="idx-matrix-col" style={{
                    left: `${(i / cols) * 100}%`,
                    animationDuration: `${4 + Math.random() * 6}s`,
                    animationDelay: `${Math.random() * 4}s`,
                }}>
                    {Array.from({ length: 18 }).map((_, j) => (
                        <div key={j} style={{ opacity: 1 - j * 0.05 }}>
                            {chars[Math.floor(Math.random() * chars.length)]}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   NODE MAP — visual index topology
   ═══════════════════════════════════════════════════════════════════════════ */
const NodeMap = ({ data }) => {
    const nodes = [
        { id: 'core', label: 'Primary', x: 110, y: 90, color: K.cyan, size: 18 },
        ...data.missing.slice(0,3).map((d, i) => ({
            id: `m${d.id}`, label: d.table, x: 30 + i * 70, y: 38,
            color: sevColor(d.severity), size: 10,
        })),
        ...data.bloat.slice(0,3).map((d, i) => ({
            id: `b${d.id}`, label: d.table, x: 40 + i * 65, y: 148,
            color: K.plasma, size: 9,
        })),
    ];
    const edges = [
        ...data.missing.slice(0,3).map((d, i) => ({ from: 'core', to: `m${d.id}` })),
        ...data.bloat.slice(0,3).map((d, i) => ({ from: 'core', to: `b${d.id}` })),
    ];
    const getNode = id => nodes.find(n => n.id === id);
    return (
        <svg width="100%" height={180} style={{ overflow: 'visible' }}>
            <defs>
                <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            {edges.map((e, i) => {
                const a = getNode(e.from), b = getNode(e.to);
                if (!a || !b) return null;
                const color = b.color;
                return (
                    <g key={i}>
                        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={`${color}30`} strokeWidth={1} strokeDasharray="4 3">
                            <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.5s" repeatCount="indefinite" />
                        </line>
                        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={.5} opacity={.4} />
                    </g>
                );
            })}
            {nodes.map(n => (
                <g key={n.id} filter="url(#glow)">
                    <circle cx={n.x} cy={n.y} r={n.size} fill={`${n.color}14`} stroke={n.color} strokeWidth={1.2} />
                    <circle cx={n.x} cy={n.y} r={n.size * .45} fill={n.color} opacity={.9} />
                    {n.size > 12 && (
                        <circle cx={n.x} cy={n.y} r={n.size + 5} fill="none" stroke={n.color} strokeWidth={.6} opacity={.4}>
                            <animate attributeName="r" values={`${n.size+4};${n.size+8};${n.size+4}`} dur="3s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values=".4;0;.4" dur="3s" repeatCount="indefinite" />
                        </circle>
                    )}
                    <text x={n.x} y={n.y + n.size + 9} textAnchor="middle" fill={n.color} fontSize={7.5} fontFamily="'IBM Plex Mono',monospace" opacity={.8}>{n.label}</text>
                </g>
            ))}
        </svg>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMMAND PALETTE
   ═══════════════════════════════════════════════════════════════════════════ */
const CmdPalette = ({ onClose, data, onSelect }) => {
    const [q, setQ] = useState('');
    const ref = useRef();
    useEffect(() => { ref.current?.focus(); }, []);
    useEffect(() => {
        const h = e => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, [onClose]);

    const all = useMemo(() => [
        ...data.missing.map(d    => ({ ...d, _group: 'MISSING',    _color: K.plasma })),
        ...data.duplicates.map(d => ({ ...d, _group: 'DUPLICATE',  _color: K.nova   })),
        ...data.bloat.map(d      => ({ ...d, _group: 'BLOAT',      _color: K.plasma })),
        ...data.unused.map(d     => ({ ...d, _group: 'UNUSED',     _color: K.textSub })),
    ], [data]);

    const hits = q
        ? all.filter(i => JSON.stringify(i).toLowerCase().includes(q.toLowerCase()))
        : all.slice(0, 9);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,3,10,.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 10001, paddingTop: '14vh' }}
             onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                width: 580, background: K.panel, border: `1px solid ${K.borderHot}`,
                borderRadius: 2, overflow: 'hidden', animation: 'idxIn .2s ease',
                boxShadow: `0 40px 80px rgba(0,0,0,.9), 0 0 60px ${K.cyanGlow}`,
            }} className="idx-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: K.void, borderBottom: `1px solid ${K.border}` }}>
                    <Crosshair size={14} color={K.cyan} style={{ animation: 'idxSpin 4s linear infinite', flexShrink: 0 }} />
                    <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Search indexes, tables, columns…"
                           style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: K.textPrimary, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5 }} />
                    <span style={{ fontSize: 9, color: K.textDim, border: `1px solid ${K.border}`, padding: '1px 5px', borderRadius: 1, fontFamily: "'IBM Plex Mono',monospace" }}>ESC</span>
                </div>
                <div className="idx-scroll" style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {hits.map(item => (
                        <div key={item.id} onClick={() => { onSelect(item); onClose(); }}
                             style={{ padding: '11px 16px', borderBottom: `1px solid ${K.border}`, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', transition: 'background .1s' }}
                             onMouseEnter={e => e.currentTarget.style.background = K.cyanGlow}
                             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ width: 3, height: 28, background: item._color, borderRadius: 2, flexShrink: 0, boxShadow: `0 0 6px ${item._color}` }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: K.textPrimary, fontFamily: "'IBM Plex Mono',monospace" }} className="idx-truncate">
                                    {item.table || item.indexName}
                                    {item.column && <span style={{ color: K.cyanDim, marginLeft: 8 }}>· {item.column}</span>}
                                </div>
                                <div style={{ fontSize: 9.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", marginTop: 2, display: 'flex', gap: 10 }}>
                                    <span>{item.schema}</span>
                                    <span style={{ color: item._color }}>{item._group}</span>
                                    {item.hash && <span style={{ color: K.textDim }}>#{item.hash}</span>}
                                </div>
                            </div>
                            <ArrowRight size={11} color={K.textDim} />
                        </div>
                    ))}
                </div>
                <div style={{ padding: '7px 16px', borderTop: `1px solid ${K.border}`, display: 'flex', gap: 14, fontSize: 9, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>
                    <span>↑↓ navigate</span><span>↵ open</span><span>ESC dismiss</span>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DETAIL PANEL (side drawer, slides in from right)
   ═══════════════════════════════════════════════════════════════════════════ */
const DetailPanel = ({ index, onClose }) => {
    const [tab, setTab] = useState('overview');
    if (!index) return null;

    const isMissing   = index.type === 'missing';
    const isDuplicate = index.type === 'duplicates';
    const isBloated   = index.type === 'bloat';
    const isUnused    = index.type === 'unused';
    const sql = genSQL(index);
    const TABS = ['overview', 'sql', 'impact', 'activity'];

    const riskRows = [
        { label: 'Downtime Risk',  val: 'NONE',   note: 'CONCURRENTLY prevents table lock',   color: K.aurora },
        { label: 'Rollback',       val: 'INSTANT', note: 'DROP INDEX reverts immediately',      color: K.aurora },
        { label: 'Write Overhead', val: (index.writes || 0) > 1000 ? 'MEDIUM' : 'LOW', note: `${index.writes || 0} writes/min`, color: (index.writes || 0) > 1000 ? K.stellar : K.aurora },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', pointerEvents: 'none' }}>
            <div style={{ flex: 1, background: 'rgba(2,3,10,.65)', pointerEvents: 'auto' }} onClick={onClose} />
            <div style={{ width: 520, background: K.panel, borderLeft: `1px solid ${K.borderHot}`, display: 'flex', flexDirection: 'column', pointerEvents: 'auto', animation: 'idxSlideR .28s cubic-bezier(.22,1,.36,1)', boxShadow: `-20px 0 80px rgba(0,0,0,.9), -2px 0 30px ${K.cyanGlow}`, position: 'relative', overflow: 'hidden' }}>
                {/* Corner brackets */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: `2px solid ${K.cyan}`, borderLeft: `2px solid ${K.cyan}`, zIndex: 2 }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderBottom: `2px solid ${K.cyanDim}`, borderRight: `2px solid ${K.cyanDim}`, zIndex: 2 }} />

                {/* Header */}
                <div style={{ padding: '22px 24px 16px', background: K.void, borderBottom: `1px solid ${K.border}`, flexShrink: 0, position: 'relative', overflow: 'hidden' }} className="idx-scan">
                    <div className="idx-grid" style={{ position: 'absolute', inset: 0 }} />
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                                    {index.severity && <ThreatBadge level={index.severity} />}
                                    {index.hash && <HashChip code={index.hash} />}
                                    <span style={{ fontSize: 9, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace", background: `${K.cyan}08`, border: `1px solid ${K.border}`, padding: '1px 6px', borderRadius: 1 }}>{index.type?.toUpperCase()}</span>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: K.textPrimary, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '.06em', lineHeight: 1.2 }}>
                                    {index.indexName || `${index.schema}.${index.table}`}
                                </div>
                                <div style={{ fontSize: 10.5, color: K.cyanDim, fontFamily: "'IBM Plex Mono',monospace", marginTop: 4 }}>
                                    {index.schema}.{index.table}{index.column && <span style={{ color: K.textSub }}> · {index.column}</span>}
                                </div>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: `1px solid ${K.border}`, borderRadius: 1, cursor: 'pointer', color: K.textSub, padding: '4px 9px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 9.5, fontFamily: "'IBM Plex Mono',monospace", transition: 'all .15s' }}
                                    className="idx-btn">
                                <X size={11} /> CLOSE
                            </button>
                        </div>
                        {(index.writes != null) && <IOTicker writes={index.writes} reads={index.reads || 0} />}
                    </div>
                </div>

                {/* Tab bar */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${K.border}`, flexShrink: 0, background: K.void }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            flex: 1, padding: '11px 4px', background: tab === t ? `${K.cyan}0c` : 'transparent',
                            border: 'none', borderBottom: tab === t ? `2px solid ${K.cyan}` : '2px solid transparent',
                            color: tab === t ? K.cyan : K.textSub, fontSize: 9, fontWeight: 700, cursor: 'pointer',
                            textTransform: 'uppercase', letterSpacing: '.12em', fontFamily: "'IBM Plex Mono',monospace",
                            transition: 'all .15s',
                        }}>{t}</button>
                    ))}
                </div>

                {/* Content */}
                <div className="idx-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {tab === 'overview' && <>
                        {/* Key metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {[
                                isMissing   && { l: 'TABLE SIZE',   v: index.tableSize,   c: K.cyan   },
                                isMissing   && { l: 'EST. INDEX',   v: index.estSize,     c: K.stellar },
                                isMissing   && { l: 'SEQ SCANS',   v: index.seq_scan?.toLocaleString(), c: K.nova },
                                isMissing   && { l: 'CUR LATENCY', v: `${index.currentLatency}ms`, c: K.plasma },
                                isBloated   && { l: 'INDEX SIZE',  v: index.size,        c: K.cyan   },
                                isBloated   && { l: 'WASTED',      v: index.wastedSpace, c: K.nova   },
                                isBloated   && { l: 'BLOAT',       v: `${index.bloatPct}%`, c: K.nova },
                                isBloated   && { l: 'LAST VACUUM', v: index.lastVacuum,  c: K.textSub },
                                isDuplicate && { l: 'WASTED',      v: index.wastedSpace, c: K.nova   },
                                isDuplicate && { l: 'WRITES/MIN',  v: index.writes,      c: K.plasma },
                                isUnused    && { l: 'INDEX SIZE',  v: index.size,        c: K.cyan   },
                                isUnused    && { l: 'TOTAL SCANS', v: index.scans,       c: K.nova   },
                            ].filter(Boolean).map((m, i) => (
                                <div key={i} style={{ padding: '12px 14px', background: `${m.c}06`, border: `1px solid ${m.c}16`, borderRadius: 2 }}>
                                    <div style={{ fontSize: 8.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em', marginBottom: 5 }}>{m.l}</div>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: m.c, fontFamily: "'Bebas Neue',sans-serif", lineHeight: 1 }}>{m.v}</div>
                                </div>
                            ))}
                        </div>

                        {/* Frag meter */}
                        {isBloated && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ fontSize: 9, color: K.textSub, letterSpacing: '.1em', fontFamily: "'IBM Plex Mono',monospace" }}>FRAGMENTATION LEVEL</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <FragMeter level={index.fragLevel} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: fragColor(index.fragLevel), fontFamily: "'IBM Plex Mono',monospace" }}>
                                        {['','LOW','LOW','MEDIUM','HIGH','CRITICAL'][index.fragLevel]}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Duplicate shadow info */}
                        {isDuplicate && (
                            <div style={{ padding: '12px 14px', background: `${K.stellar}08`, border: `1px solid ${K.stellar}20`, borderRadius: 2 }}>
                                <div style={{ fontSize: 9, color: K.stellarGlow, marginBottom: 5, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em' }}>COVERED BY</div>
                                <code style={{ fontSize: 11.5, color: K.aurora, fontFamily: "'IBM Plex Mono',monospace" }}>{index.shadowedBy}</code>
                                <div style={{ fontSize: 10, color: K.textSub, marginTop: 6, lineHeight: 1.5 }}>Dropping this index will not affect any queries. The covering index handles all patterns.</div>
                            </div>
                        )}

                        {/* Partial / Include info */}
                        {isMissing && index.partial && (
                            <div style={{ padding: '10px 14px', background: `${K.aurora}06`, border: `1px solid ${K.aurora}18`, borderRadius: 2 }}>
                                <div style={{ fontSize: 9, color: K.textSub, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em' }}>PARTIAL CONDITION</div>
                                <code style={{ fontSize: 11, color: K.aurora, fontFamily: "'IBM Plex Mono',monospace" }}>{index.partial}</code>
                            </div>
                        )}
                        {isMissing && index.include && (
                            <div style={{ padding: '10px 14px', background: `${K.nebula}06`, border: `1px solid ${K.nebula}18`, borderRadius: 2 }}>
                                <div style={{ fontSize: 9, color: K.textSub, marginBottom: 4, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em' }}>COVERING COLUMNS (INCLUDE)</div>
                                <code style={{ fontSize: 11, color: K.nebula, fontFamily: "'IBM Plex Mono',monospace" }}>{index.include}</code>
                            </div>
                        )}

                        {/* Risk assessment */}
                        <div style={{ padding: '12px 14px', background: K.void, border: `1px solid ${K.border}`, borderRadius: 2 }}>
                            <div style={{ fontSize: 9, color: K.cyanDim, marginBottom: 10, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Shield size={10} color={K.cyanDim} /> RISK ASSESSMENT
                            </div>
                            {riskRows.map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < riskRows.length - 1 ? `1px solid ${K.border}` : 'none' }}>
                                    <span style={{ fontSize: 10, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace" }}>{row.label}</span>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 10.5, fontWeight: 700, color: row.color, fontFamily: "'IBM Plex Mono',monospace" }}>{row.val}</div>
                                        <div style={{ fontSize: 8.5, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>{row.note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>}

                    {tab === 'sql' && <>
                        <SqlBlock sql={sql} />
                        <div style={{ padding: '10px 13px', background: `${K.nebula}06`, border: `1px solid ${K.nebula}16`, borderRadius: 2, display: 'flex', gap: 8 }}>
                            <Info size={12} color={K.nebula} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontSize: 10.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.7 }}>
                                {isMissing    && 'CONCURRENTLY allows building without locking. Estimated build time: 2–5 min per GB of table data.'}
                                {isDuplicate  && 'Dropping is instant. Postgres automatically reroutes queries to the covering index with no planner hints needed.'}
                                {isBloated    && 'REINDEX CONCURRENTLY rebuilds in-place. Requires ~3x index size in temp tablespace. Plan accordingly.'}
                                {isUnused     && 'Zero usage confirmed. Safe to drop. Keep the DROP in a transaction and verify pg_stat_user_indexes first.'}
                            </span>
                        </div>
                        <div style={{ padding: '10px 13px', background: `${K.cyan}06`, border: `1px solid ${K.cyan}14`, borderRadius: 2 }}>
                            <div style={{ fontSize: 9, color: K.cyanDim, marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em' }}>EXPECTED PLAN CHANGE</div>
                            <pre style={{ fontSize: 10, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", margin: 0, lineHeight: 1.7 }}>
{`Seq Scan on ${index.table}  [BEFORE]
  cost=0.00..${(index.currentLatency * 4.2).toFixed(0)}
→ Index Scan using new_idx  [AFTER]
  cost=0.43..8.45`}
                            </pre>
                        </div>
                    </>}

                    {tab === 'impact' && <>
                        {isMissing   && <LatencyViz before={index.currentLatency} after={index.estLatency} />}
                        {isBloated   && <LatencyViz before={Math.round(120 * (1 + index.bloatPct / 100))} after={120} />}
                        {isDuplicate && (
                            <div style={{ textAlign: 'center', padding: '24px', background: `${K.aurora}08`, border: `1px solid ${K.aurora}20`, borderRadius: 2 }}>
                                <div style={{ fontSize: 48, fontWeight: 900, color: K.aurora, fontFamily: "'Bebas Neue',sans-serif", lineHeight: 1 }}>ZERO</div>
                                <div style={{ fontSize: 10, color: K.textSub, marginTop: 6, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em' }}>QUERY PERFORMANCE IMPACT · Queries auto-rerouted</div>
                            </div>
                        )}
                        <div style={{ padding: '14px', background: `${K.stellar}06`, border: `1px solid ${K.stellar}16`, borderRadius: 2 }}>
                            <div style={{ fontSize: 9, color: K.stellarGlow, marginBottom: 8, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em', display: 'flex', gap: 6, alignItems: 'center' }}>
                                <Sparkles size={10} color={K.stellar} style={{ animation: 'idxPulse 2s infinite' }} /> AI PREDICTION · 7-DAY ANALYSIS
                            </div>
                            <p style={{ margin: 0, fontSize: 11, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.75 }}>
                                {isMissing    && `Based on ${index.seq_scan?.toLocaleString()} detected sequential scans and ${index.reads?.toLocaleString()} reads/min, this index will reduce CPU load ~${14 + Math.floor(Math.random()*10)}% during peak hours and eliminate full table scan contention on ${index.table}.`}
                                {isBloated    && `Rebuilding ${index.indexName} reclaims ${index.wastedSpace} disk space. Expect ${10 + Math.floor(index.bloatPct / 5)}% faster range scans and reduced buffer cache evictions post-rebuild.`}
                                {isDuplicate  && `Dropping reduces INSERT/UPDATE overhead by ~${3 + Math.floor(Math.random()*4)}% (${index.writes} writes/min). No query regressions expected — ${index.shadowedBy} covers all access patterns.`}
                                {isUnused     && `Zero utilization confirmed over 90-day window. Dropping eliminates one B-tree maintenance operation per write cycle on ${index.table}.`}
                            </p>
                        </div>
                    </>}

                    {tab === 'activity' && <>
                        <div style={{ fontSize: 9, color: K.textSub, letterSpacing: '.1em', fontFamily: "'IBM Plex Mono',monospace" }}>WRITE PRESSURE · 24-HOUR HISTOGRAM</div>
                        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 60, padding: '4px 0' }}>
                            {Array.from({ length: 24 }).map((_, i) => {
                                const h = 15 + Math.sin(i * 0.5) * 20 + Math.random() * 30;
                                return <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '1px 1px 0 0', background: h > 55 ? `${K.nova}80` : h > 35 ? `${K.plasma}80` : `${K.cyan}50`, minWidth: 3, transition: `height .5s ease ${i * .02}s` }} />;
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -6 }}>
                            <span style={{ fontSize: 8.5, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>00:00</span>
                            <span style={{ fontSize: 8.5, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>12:00</span>
                            <span style={{ fontSize: 8.5, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>NOW</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {[
                                { l: 'WRITES/MIN', v: (index.writes||0).toLocaleString(), c: K.plasma },
                                { l: 'READS/MIN',  v: (index.reads||0).toLocaleString(),  c: K.cyan },
                                { l: 'LOCK WAIT',  v: '0.2ms', c: K.aurora },
                                { l: 'DEAD TUPLES',v: '~4.1K', c: K.textSub },
                            ].map((m, i) => (
                                <div key={i} style={{ padding: '10px 12px', background: `${m.c}06`, border: `1px solid ${m.c}16`, borderRadius: 2 }}>
                                    <div style={{ fontSize: 8.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", marginBottom: 4 }}>{m.l}</div>
                                    <div style={{ fontSize: 16, fontWeight: 900, color: m.c, fontFamily: "'Bebas Neue',sans-serif" }}>{m.v}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '12px 14px', background: K.void, border: `1px solid ${K.border}`, borderRadius: 2 }}>
                            <div style={{ fontSize: 9, color: K.cyanDim, marginBottom: 8, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em' }}>AUTOVACUUM LOG</div>
                            {['2026-02-17 02:14 UTC', '2026-02-10 03:02 UTC', '2026-02-03 02:59 UTC'].map((d, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 2 ? `1px solid ${K.border}` : 'none', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}>
                                    <span style={{ color: K.textSub }}>{d}</span>
                                    <span style={{ color: K.aurora }}>✓ COMPLETE</span>
                                </div>
                            ))}
                        </div>
                    </>}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: `1px solid ${K.border}`, background: K.void, display: 'flex', gap: 10, flexShrink: 0 }}>
                    <button style={{ flex: 2, padding: '11px', borderRadius: 1, background: `linear-gradient(135deg, ${K.cyan}, ${K.cyanDim})`, border: 'none', color: K.void, fontWeight: 900, cursor: 'pointer', fontSize: 12, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: '.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: `0 4px 20px ${K.cyanGlow}` }}>
                        <Play size={13} /> APPLY FIX
                    </button>
                    <button className="idx-btn" style={{ flex: 1, padding: '11px', borderRadius: 1, background: 'transparent', border: `1px solid ${K.border}`, color: K.textSub, cursor: 'pointer', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.06em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Download size={12} /> EXPORT SQL
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE VIEWS
   ═══════════════════════════════════════════════════════════════════════════ */
const IndexTable = ({ rows, view, onSelect }) => {
    const [sort, setSort] = useState({ field: null, dir: 'desc' });
    const [filter, setFilter] = useState('');

    const sorted = useMemo(() => {
        let list = [...rows];
        if (filter) list = list.filter(r => JSON.stringify(r).toLowerCase().includes(filter.toLowerCase()));
        if (sort.field) list.sort((a, b) => {
            const av = a[sort.field], bv = b[sort.field];
            const cmp = typeof av === 'number' ? av - bv : String(av||'').localeCompare(String(bv||''));
            return sort.dir === 'asc' ? cmp : -cmp;
        });
        return list;
    }, [rows, filter, sort]);

    const toggleSort = f => setSort(s => ({ field: f, dir: s.field === f && s.dir === 'asc' ? 'desc' : 'asc' }));

    const TH = ({ field, children, right }) => (
        <th onClick={() => field && toggleSort(field)} style={{
            padding: '10px 14px', textAlign: right ? 'right' : 'left', fontSize: 8.5,
            fontWeight: 700, color: sort.field === field ? K.cyan : K.textSub,
            cursor: field ? 'pointer' : 'default', fontFamily: "'IBM Plex Mono',monospace",
            letterSpacing: '.12em', textTransform: 'uppercase', userSelect: 'none',
            borderBottom: `1px solid ${K.border}`, background: K.void, whiteSpace: 'nowrap',
        }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {children}
                {field && sort.field === field && (sort.dir === 'asc' ? <ChevronUp size={9}/> : <ChevronDown size={9}/>)}
            </span>
        </th>
    );

    return (
        <>
            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: `1px solid ${K.border}`, background: K.void }}>
                <Search size={11} color={K.textDim} />
                <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="filter…"
                       style={{ flex: 1, background: 'none', border: 'none', outline: 'none',  fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: K.textSub }} />
                {filter && <button onClick={() => setFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: K.textDim }}><X size={10} /></button>}
                <span style={{ fontSize: 8.5, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>{sorted.length} rows</span>
            </div>
            <div className="idx-scroll" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                    <thead>
                    <tr>
                        {view === 'missing' && <>
                            <TH>Threat</TH><TH field="table">Table</TH><TH>Columns</TH>
                            <TH field="seq_scan" right>Seq Scans</TH><TH field="currentLatency" right>Latency</TH><TH>Gain</TH><TH></TH>
                        </>}
                        {view === 'bloat' && <>
                            <TH field="indexName">Index</TH><TH field="table">Table</TH>
                            <TH field="bloatPct" right>Bloat</TH><TH field="size">Size</TH><TH field="wastedSpace">Wasted</TH><TH>Health</TH><TH></TH>
                        </>}
                        {view === 'duplicates' && <>
                            <TH field="indexName">Redundant Index</TH><TH field="table">Table</TH>
                            <TH>Covered By</TH><TH field="wastedSpace" right>Wasted</TH><TH></TH>
                        </>}
                        {view === 'unused' && <>
                            <TH field="indexName">Index</TH><TH field="table">Table</TH>
                            <TH field="size">Size</TH><TH field="scans" right>Scans</TH><TH field="lastUsed">Last Used</TH><TH></TH>
                        </>}
                    </tr>
                    </thead>
                    <tbody>
                    {sorted.map((row, idx) => (
                        <tr key={row.id} className="idx-row"
                            onClick={() => onSelect(row)}
                            style={{ borderBottom: `1px solid ${K.border}22`, animationDelay: `${idx * .04}s` }}>
                            {view === 'missing' && <>
                                <td style={{ padding: '12px 14px' }}><ThreatBadge level={row.severity} small /></td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div style={{ fontWeight: 700, color: K.textPrimary, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14 }}>{row.table}</div>
                                    <div style={{ fontSize: 9, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>{row.schema}</div>
                                </td>
                                <td style={{ padding: '12px 14px', maxWidth: 180 }}>
                                    <code style={{ fontSize: 10, color: K.aurora, fontFamily: "'IBM Plex Mono',monospace", background: `${K.aurora}08`, padding: '2px 6px', borderRadius: 1, display: 'block' }} className="idx-truncate">{row.column}</code>
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, fontWeight: 900, color: row.seq_scan > 100000 ? K.nova : K.plasma }}>{row.seq_scan.toLocaleString()}</td>
                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, fontWeight: 700, color: K.nova }}>{row.currentLatency}ms</div>
                                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: K.aurora }}>→ {row.estLatency}ms</div>
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <div style={{ fontSize: 9, color: K.aurora, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>
                                            {Math.round(((row.currentLatency - row.estLatency) / row.currentLatency) * 100)}%↑
                                        </div>
                                        <SegBar pct={(row.estLatency / row.currentLatency) * 100} color={K.aurora} height={4} />
                                    </div>
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div className="idx-reveal" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <HashChip code={row.hash} />
                                        <Wrench size={11} color={K.cyan} />
                                    </div>
                                </td>
                            </>}

                            {view === 'bloat' && <>
                                <td style={{ padding: '12px 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: K.textPrimary }}>{row.indexName}</td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div style={{ fontWeight: 700, color: K.textSub, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13 }}>{row.table}</div>
                                    <div style={{ fontSize: 9, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>{row.schema}</div>
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontWeight: 900, fontSize: 18, color: row.bloatPct > 50 ? K.nova : K.plasma }}>{row.bloatPct}%</span>
                                </td>
                                <td style={{ padding: '12px 14px', color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5 }}>{row.size}</td>
                                <td style={{ padding: '12px 14px', color: K.nova, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, fontWeight: 700 }}>{row.wastedSpace}</td>
                                <td style={{ padding: '12px 14px' }}><FragMeter level={row.fragLevel} /></td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div className="idx-reveal"><HashChip code={row.hash} /></div>
                                </td>
                            </>}

                            {view === 'duplicates' && <>
                                <td style={{ padding: '12px 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: K.nova }}>{row.indexName}</td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div style={{ fontWeight: 700, color: K.textSub, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13 }}>{row.table}</div>
                                    <div style={{ fontSize: 9, color: K.textDim }}>{row.schema}</div>
                                </td>
                                <td style={{ padding: '12px 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: K.aurora }}>{row.shadowedBy}</td>
                                <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, color: K.plasma }}>{row.wastedSpace}</td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div className="idx-reveal"><HashChip code={row.hash} /></div>
                                </td>
                            </>}

                            {view === 'unused' && <>
                                <td style={{ padding: '12px 14px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: K.textPrimary }}>{row.indexName}</td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div style={{ fontWeight: 700, color: K.textSub, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13 }}>{row.table}</div>
                                    <div style={{ fontSize: 9, color: K.textDim }}>{row.schema}</div>
                                </td>
                                <td style={{ padding: '12px 14px', color: K.cyan, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5 }}>{row.size}</td>
                                <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, fontWeight: 900, color: row.scans === 0 ? K.nova : K.textSub }}>{row.scans}</td>
                                <td style={{ padding: '12px 14px', color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5 }}>{row.lastUsed}</td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div className="idx-reveal"><HashChip code={row.hash} /></div>
                                </td>
                            </>}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const IndexesTab = () => {
    const [view, setView]       = useState('missing');
    const [data, setData]       = useState({ missing: [], duplicates: [], bloat: [], unused: [], health: DATA.health });
    const [detail, setDetail]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [cmdOpen, setCmdOpen] = useState(false);
    const [live, setLive]       = useState(true);
    const [tick, setTick]       = useState(0);

    useEffect(() => {
        const t = setTimeout(() => { setData(DATA); setLoading(false); }, 700);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!live) return;
        const id = setInterval(() => setTick(t => t + 1), 3000);
        return () => clearInterval(id);
    }, [live]);

    useEffect(() => {
        const h = e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(p => !p); }
            if (e.key === 'Escape') setCmdOpen(false);
        };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, []);

    const currentRows = data[view] || [];
    const totalIssues = data.missing.length + data.duplicates.length + data.bloat.length + data.unused.length;

    const VIEWS = [
        { id: 'missing',    label: 'MISSING',   icon: Target,    color: K.plasma, count: data.missing.length,    sub: 'Critical · High' },
        { id: 'bloat',      label: 'BLOAT',     icon: Flame,     color: K.nova,   count: data.bloat.length,      sub: 'Fragmented' },
        { id: 'duplicates', label: 'DUPES',     icon: Layers,    color: K.stellar, count: data.duplicates.length, sub: 'Redundant' },
        { id: 'unused',     label: 'UNUSED',    icon: Activity,  color: K.textSub, count: data.unused.length,    sub: 'Dormant' },
    ];

    const advisorText = {
        missing:    `${data.missing.length} sequential scan patterns active. Top priority: orders.customer_id composite index — 14x projected latency reduction. Partial index on status='active' saves 40% size.`,
        bloat:      `Avg fragmentation: ${data.health.avgBloat}%. Schedule REINDEX CONCURRENTLY during off-peak (02:00–04:00 UTC). ${data.bloat.filter(b=>b.bloatPct>50).length} indexes exceed 50% bloat threshold.`,
        duplicates: `${data.duplicates.length} indexes fully shadowed by wider covering indexes. Safe to drop all — zero query regression risk. Estimated ${data.duplicates.reduce((s,d)=>s+parseFloat(d.wastedSpace),0).toFixed(0)} MB savings.`,
        unused:     `${data.unused.length} dormant indexes confirmed with zero read utilization. Each wastes write cycles per transaction. Confirm 90-day window then drop for write throughput gains.`,
    };

    return (
        <div style={{ background: K.void, minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: "'Barlow Condensed',sans-serif" }}>
            <IdxStyles />

            {/* Background grid */}
            <div className="idx-grid" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

            {/* Edge accent lines */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${K.cyan}60, transparent)`, zIndex: 1 }} />
            <div style={{ position: 'fixed', top: 0, left: 0, width: 1, height: '100%', background: `linear-gradient(180deg, ${K.cyan}40, transparent 40%)`, zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2, padding: '0 28px 48px' }}>

                {/* ─── TOP BAR ─── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 20px', borderBottom: `1px solid ${K.border}`, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        {/* Logo / title */}
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: K.cyan, fontFamily: "'Bebas Neue',monospace", letterSpacing: '.04em', lineHeight: 1, textShadow: `0 0 20px ${K.cyan}60` }} className="idx-glitch">
                                INDEX INTELLIGENCE
                            </div>
                            <div style={{ fontSize: 8.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.14em', marginTop: 2 }}>
                                VIGIL · DEEP ANALYSIS ENGINE · v4.1.0
                            </div>
                        </div>
                        {/* Status pill */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', background: data.health.criticalCount > 0 ? `${K.nova}0e` : `${K.aurora}08`, border: `1px solid ${data.health.criticalCount > 0 ? K.nova+'30' : K.aurora+'20'}`, borderRadius: 1 }}>
                            <Dot color={data.health.criticalCount > 0 ? K.nova : K.aurora} pulse size={7} />
                            <span style={{ fontSize: 9, color: data.health.criticalCount > 0 ? K.nova : K.aurora, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, letterSpacing: '.08em' }}>
                                {data.health.criticalCount > 0 ? `${data.health.criticalCount} CRITICAL` : 'ALL NOMINAL'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => setCmdOpen(true)} className="idx-btn"
                                style={{ display: 'flex', gap: 7, alignItems: 'center', padding: '7px 14px', border: `1px solid ${K.border}`, borderRadius: 1, background: 'transparent', cursor: 'pointer', color: K.textSub, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace' " }}>
                            <Crosshair size={12} /> SEARCH <span style={{ border: `1px solid ${K.border}`, padding: '1px 5px', fontSize: 8.5, borderRadius: 1 }}>⌘K</span>
                        </button>
                        <button onClick={() => setLive(l => !l)} className="idx-btn"
                                style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '7px 12px', border: `1px solid ${live ? K.aurora+'30' : K.border}`, borderRadius: 1, background: live ? `${K.aurora}08` : 'transparent', cursor: 'pointer', color: live ? K.aurora : K.textSub, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}>
                            <Radio size={11} style={{ animation: live ? 'idxPulse 1.5s infinite' : 'none' }} /> {live ? 'LIVE' : 'PAUSED'}
                        </button>
                        <button className="idx-btn" style={{ padding: '7px 12px', border: `1px solid ${K.border}`, borderRadius: 1, background: 'transparent', cursor: 'pointer', color: K.textSub, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Download size={12} /> EXPORT
                        </button>
                    </div>
                </div>

                {/* ─── METRIC ROW ─── */}
                <div className="idx-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
                    <MetTile label="Index Hit Ratio" value={`${data.health.hitRatio}%`} color={K.aurora}  icon={CheckCircle} spark={data.health.history}  trend={0.4} />
                    <MetTile label="Open Issues"     value={totalIssues}                color={K.plasma}  icon={AlertTriangle} sub={`${data.health.criticalCount} critical`} />
                    <MetTile label="Total Indexes"   value={data.health.totalIndexes}   color={K.cyan}    icon={Database} sub="across all schemas" />
                    <MetTile label="Wasted Space"     value={data.health.totalWaste}    color={K.nova}    icon={HardDrive} sub="recoverable now" />
                    <MetTile label="Seq Scan Rate"   value={`${data.health.seqScanRate}%`} color={K.stellar} icon={Zap} spark={data.health.seqHistory} trend={-0.3} />
                </div>

                {/* ─── MAIN LAYOUT ─── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 268px', gap: 16, alignItems: 'flex-start' }}>

                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Tab selector */}
                        <div style={{ display: 'flex', gap: 3 }}>
                            {VIEWS.map(v => (
                                <button key={v.id} onClick={() => setView(v.id)} style={{
                                    flex: 1, padding: '12px 8px',
                                    background: view === v.id ? `${v.color}0e` : K.panel,
                                    border: `1px solid ${view === v.id ? v.color + '40' : K.border}`,
                                    borderTop: view === v.id ? `2px solid ${v.color}` : `2px solid transparent`,
                                    borderRadius: '1px 1px 0 0', cursor: 'pointer', transition: 'all .15s',
                                    boxShadow: view === v.id ? `0 0 24px ${v.color}10` : 'none',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                                        <v.icon size={12} color={view === v.id ? v.color : K.textDim} />
                                        <span style={{ fontSize: 11, fontWeight: 800, color: view === v.id ? v.color : K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em' }}>{v.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 900, color: view === v.id ? v.color : K.textDim, fontFamily: "'Bebas Neue',sans-serif" }}>{v.count}</span>
                                    </div>
                                    <div style={{ fontSize: 8.5, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace", marginTop: 3 }}>{v.sub}</div>
                                </button>
                            ))}
                        </div>

                        {/* Table panel */}
                        <div style={{ background: K.panel, border: `1px solid ${K.border}`, borderRadius: '0 0 2px 2px', borderTop: 'none', position: 'relative', overflow: 'hidden' }} className="idx-panel idx-scan">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: `1px solid ${K.border}`, background: K.void, position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <span style={{ fontSize: 8.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.12em' }}>
                                        {VIEWS.find(v => v.id === view)?.label} INDEXES
                                    </span>
                                    <Waveform count={5} color={live ? K.aurora : K.textDim} height={14} />
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="idx-btn" style={{ display: 'flex', gap: 5, alignItems: 'center', background: 'transparent', border: `1px solid ${K.border}`, borderRadius: 1, padding: '4px 8px', cursor: 'pointer', color: K.textSub, fontSize: 9, fontFamily: "'IBM Plex Mono',monospace" }}>
                                        <RefreshCw size={10} /> REFRESH
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div style={{ padding: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 2 }}>
                                    <MatrixRain />
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${K.cyan}`, borderTopColor: 'transparent', animation: 'idxSpin .8s linear infinite' }} />
                                    <span style={{ fontSize: 10, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.14em' }} className="idx-cursor">SCANNING INDEX CATALOG</span>
                                </div>
                            ) : (
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    <IndexTable rows={currentRows} view={view} onSelect={setDetail} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                        {/* Health radar */}
                        <div style={{ background: K.panel, border: `1px solid ${K.border}`, borderRadius: 2, padding: '16px', position: 'relative', overflow: 'hidden' }} className="idx-panel">
                            <div className="idx-grid" style={{ position: 'absolute', inset: 0 }} />
                            <div style={{ position: 'relative' }}>
                                <div style={{ fontSize: 8.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.12em', marginBottom: 12 }}>HEALTH RADAR</div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <RadarChart d={data.health} size={160} />
                                </div>
                                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                    {[
                                        { l: 'Hit Rate', v: `${data.health.hitRatio}%`, c: K.aurora },
                                        { l: 'Bloat',    v: `${data.health.avgBloat}%`,  c: K.plasma },
                                        { l: 'Seq Rate', v: `${data.health.seqScanRate}%`, c: K.stellar },
                                        { l: 'Indexes',  v: data.health.totalIndexes, c: K.cyan },
                                    ].map(m => (
                                        <div key={m.l} style={{ padding: '7px 9px', background: `${m.c}07`, border: `1px solid ${m.c}16`, borderRadius: 1 }}>
                                            <div style={{ fontSize: 8, color: K.textDim, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.06em' }}>{m.l}</div>
                                            <div style={{ fontSize: 14, fontWeight: 900, color: m.c, fontFamily: "'Bebas Neue',sans-serif" }}>{m.v}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Node topology map */}
                        <div style={{ background: K.panel, border: `1px solid ${K.border}`, borderRadius: 2, padding: '16px', position: 'relative', overflow: 'hidden' }} className="idx-panel">
                            <div style={{ fontSize: 8.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.12em', marginBottom: 8 }}>INDEX TOPOLOGY</div>
                            <NodeMap data={data} />
                        </div>

                        {/* AI Advisor */}
                        <div style={{ background: K.panel, border: `1px solid ${K.stellar}20`, borderRadius: 2, overflow: 'hidden' }} className="idx-panel">
                            <div style={{ padding: '11px 14px', borderBottom: `1px solid ${K.border}`, background: K.void, display: 'flex', gap: 8, alignItems: 'center' }}>
                                <Sparkles size={12} color={K.stellar} style={{ animation: 'idxPulse 2s infinite' }} />
                                <span style={{ fontSize: 9, color: K.stellar, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em' }}>AI ADVISOR</span>
                                <Waveform count={4} color={K.stellar} height={12} />
                            </div>
                            <div style={{ padding: '14px' }}>
                                <p style={{ margin: '0 0 12px', fontSize: 10.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1.8 }}>{advisorText[view]}</p>
                                <button onClick={() => currentRows[0] && setDetail(currentRows[0])}
                                        className="idx-btn" style={{ width: '100%', padding: '9px', background: `${K.stellar}0e`, border: `1px solid ${K.stellar}28`, borderRadius: 1, cursor: 'pointer', color: K.stellar, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}>
                                    <Target size={12} /> OPEN TOP PRIORITY
                                </button>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div style={{ background: K.panel, border: `1px solid ${K.border}`, borderRadius: 2, padding: 14 }} className="idx-panel">
                            <div style={{ fontSize: 8.5, color: K.textSub, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '.12em', marginBottom: 10 }}>QUICK ACTIONS</div>
                            {[
                                { label: 'Export SQL Bundle',   icon: Download,  color: K.cyan   },
                                { label: 'Schedule Rebuild',    icon: Clock,     color: K.nebula },
                                { label: 'Generate Report',     icon: BookOpen,  color: K.textSub },
                                { label: 'Apply All Safe Fixes', icon: Play,     color: K.aurora },
                            ].map(a => (
                                <button key={a.label} className="idx-btn"
                                        style={{ width: '100%', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px', background: 'transparent', cursor: 'pointer', color: a.color, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", borderRadius: 1, border: `1px solid ${K.border}`, textAlign: 'left' }}>
                                    <a.icon size={12} /> {a.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlays */}
            {cmdOpen && <CmdPalette onClose={() => setCmdOpen(false)} data={data} onSelect={r => { setDetail(r); setView(r.type); }} />}
            {detail   && <DetailPanel index={detail} onClose={() => setDetail(null)} />}
        </div>
    );
};

export default IndexesTab;