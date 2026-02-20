// ==========================================================================
//  VIGIL — RepositoryTab  (v8 — LOCAL REPO + VISUAL OVERHAUL)
// ==========================================================================
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { GlassCard } from '../ui/SharedComponents.jsx';
import {
    GitBranch, FolderOpen, File, FileCode, FileJson, FileText,
    Plus, Trash2, Search, X, Copy, Check, ChevronRight, ChevronDown,
    Code, Eye, Edit3, Save, Undo2, RefreshCw,
    AlertTriangle, CheckCircle, Shield, Zap, Terminal,
    Clock, ArrowRight, Sparkles, Lightbulb,
    Package, Globe, Activity, Braces,
    BarChart3, TrendingUp, AlertCircle,
    Github, Gitlab, HardDrive,
    GitMerge, GitPullRequest, GitCommit, Database, History,
    Workflow, TrendingDown, Minus, Users, Flame,
    Download, ChevronLeft, ChevronUp,
    Filter, Gauge, Target, Wrench, Loader,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES — Terminal-forge aesthetic, fully self-contained
   ═══════════════════════════════════════════════════════════════════════════ */
const RepoStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

        @keyframes rFadeUp    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes rSlideIn   { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:none; } }
        @keyframes rPulse     { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes rSpin      { to { transform:rotate(360deg); } }
        @keyframes rGlow      { 0%,100% { box-shadow:0 0 8px ${THEME.primary}20; } 50% { box-shadow:0 0 28px ${THEME.primary}50, 0 0 50px ${THEME.primary}18; } }
        @keyframes rShimmer   { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes rBarGrow   { from { width:0; } to { width:var(--w,100%); } }
        @keyframes rScanLine  { from { top:-2px; } to { top:calc(100% + 2px); } }
        @keyframes rScaleIn   { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }

        .r8-stagger > * { animation: rFadeUp 0.38s ease-out both; }
        .r8-stagger > *:nth-child(1) { animation-delay:0ms; }
        .r8-stagger > *:nth-child(2) { animation-delay:60ms; }
        .r8-stagger > *:nth-child(3) { animation-delay:120ms; }
        .r8-stagger > *:nth-child(4) { animation-delay:180ms; }
        .r8-stagger > *:nth-child(5) { animation-delay:240ms; }

        /* ── Repo card ─────────────────────────────── */
        .r8-card {
            position:relative; overflow:hidden; cursor:pointer;
            transition:transform 0.22s cubic-bezier(.4,0,.2,1), border-color 0.22s, box-shadow 0.22s;
        }
        .r8-card::after {
            content:''; position:absolute; inset:0; opacity:0;
            background:linear-gradient(135deg, ${THEME.primary}0a, transparent);
            transition:opacity 0.3s; border-radius:inherit; pointer-events:none;
        }
        .r8-card:hover { transform:translateY(-4px); }
        .r8-card:hover::after { opacity:1; }

        .r8-card-remote:hover { border-color:${THEME.primary}55 !important; box-shadow:0 16px 48px rgba(0,0,0,.18), 0 0 0 1px ${THEME.primary}18; }
        .r8-card-local:hover  { border-color:${THEME.info}55 !important;    box-shadow:0 16px 48px rgba(0,0,0,.18), 0 0 0 1px ${THEME.info}18; }

        /* ── Tree ──────────────────────────────────── */
        .r8-tree-item { transition:background .14s; cursor:pointer; user-select:none; }
        .r8-tree-item:hover   { background:${THEME.primary}08 !important; }
        .r8-tree-item.r8-sel  { background:${THEME.primary}12 !important; border-left:2px solid ${THEME.primary} !important; }

        /* ── Code lines ────────────────────────────── */
        .r8-line:hover { background:${THEME.primary}07 !important; }

        /* ── Tabs ──────────────────────────────────── */
        .r8-tab:hover:not(.r8-tab-on) { background:${THEME.primary}10 !important; color:${THEME.textMain} !important; }

        /* ── Metric cards ──────────────────────────── */
        .r8-metric { transition:transform .2s, box-shadow .2s; }
        .r8-metric:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,.14); }

        /* ── Scrollbar ─────────────────────────────── */
        .r8-scroll::-webkit-scrollbar { width:4px; height:4px; }
        .r8-scroll::-webkit-scrollbar-track { background:transparent; }
        .r8-scroll::-webkit-scrollbar-thumb { background:${THEME.primary}28; border-radius:4px; }
        .r8-scroll::-webkit-scrollbar-thumb:hover { background:${THEME.primary}55; }

        /* ── Progress bar ──────────────────────────── */
        .r8-bar-fill { animation:rBarGrow .9s ease both; }

        /* ── Scan line overlay ─────────────────────── */
        .r8-terminal::before {
            content:''; position:absolute; left:0; right:0; height:1px;
            background:linear-gradient(90deg, transparent, ${THEME.info}30, transparent);
            animation:rScanLine 3.5s linear infinite; z-index:5; pointer-events:none;
        }

        /* ── Path suggestion pills ─────────────────── */
        .r8-path-pill { transition:all .14s; }
        .r8-path-pill:hover { border-color:${THEME.info}60 !important; color:${THEME.info} !important; }

        /* ── Input focus glow ──────────────────────── */
        .r8-input:focus { border-color:${THEME.primary} !important; box-shadow:0 0 0 3px ${THEME.primary}18 !important; }
        .r8-input-local:focus { border-color:${THEME.info} !important; box-shadow:0 0 0 3px ${THEME.info}18 !important; }

        /* ── Shimmer skeleton ──────────────────────── */
        .r8-shimmer { background:linear-gradient(90deg, ${THEME.surface} 25%, ${THEME.glassBorder} 50%, ${THEME.surface} 75%); background-size:200% 100%; animation:rShimmer 1.5s infinite; border-radius:8px; }

        /* ── Button variants ───────────────────────── */
        .r8-btn { display:inline-flex; align-items:center; gap:7px; padding:8px 16px; border-radius:9px; border:none; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .16s; white-space:nowrap; }
        .r8-btn-p  { background:linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary}); color:#fff; box-shadow:0 4px 14px ${THEME.primary}28; }
        .r8-btn-p:hover  { filter:brightness(1.1); transform:translateY(-1px); }
        .r8-btn-g  { background:transparent; color:${THEME.textDim}; border:1px solid ${THEME.glassBorder}; }
        .r8-btn-g:hover  { background:${THEME.glass}; color:${THEME.textMain}; }
        .r8-btn-c  { background:${THEME.info}15; color:${THEME.info}; border:1px solid ${THEME.info}30; }
        .r8-btn-c:hover  { background:${THEME.info}25; }
        .r8-btn-d  { background:${THEME.danger}12; color:${THEME.danger}; border:1px solid ${THEME.danger}30; }
        .r8-btn-d:hover  { background:${THEME.danger}22; }
        .r8-btn-sm { padding:5px 11px; font-size:11px; border-radius:7px; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA  (identical to v7)
   ═══════════════════════════════════════════════════════════════════════════ */
const MOCK_FILE_TREE = [
    { id: 'src', name: 'src', type: 'folder', children: [
            { id: 'api', name: 'api', type: 'folder', children: [
                    { id: 'users.js',  name: 'users.js',  type: 'file', lang: 'js', issues: 2, lines: 148 },
                    { id: 'auth.ts',   name: 'auth.ts',   type: 'file', lang: 'ts', issues: 0, lines: 92  },
                ]},
            { id: 'services', name: 'services', type: 'folder', children: [
                    { id: 'billing.py', name: 'billing.py', type: 'file', lang: 'py', issues: 1, lines: 204 },
                    { id: 'notify.js',  name: 'notify.js',  type: 'file', lang: 'js', issues: 0, lines: 67  },
                ]},
            { id: 'models', name: 'models', type: 'folder', children: [
                    { id: 'Product.ts', name: 'Product.ts', type: 'file', lang: 'ts', issues: 0, lines: 55 },
                    { id: 'User.ts',    name: 'User.ts',    type: 'file', lang: 'ts', issues: 1, lines: 78 },
                ]},
        ]},
    { id: 'tests', name: 'tests', type: 'folder', children: [
            { id: 'api.test.js', name: 'api.test.js', type: 'file', lang: 'js', issues: 0, lines: 210 },
        ]},
    { id: 'package.json', name: 'package.json', type: 'file', lang: 'json', issues: 0, lines: 34 },
    { id: 'README.md',    name: 'README.md',    type: 'file', lang: 'md',   issues: 0, lines: 88 },
];

const MOCK_FILE_CONTENT = {
    'users.js': `// User API Handler\nimport { db } from '../db/connection';\nimport { cache } from '../utils/cache';\n\n// ⚠️ Issue: N+1 query detected on line 18\nexport async function getUsers(filters = {}) {\n  const users = await db.query(\n    'SELECT * FROM users WHERE active = $1',\n    [filters.active ?? true]\n  );\n\n  // ⚠️ Issue: Missing index on orders.user_id\n  for (const user of users) {\n    user.orders = await db.query(\n      'SELECT * FROM orders WHERE user_id = $1',\n      [user.id]\n    );\n  }\n  return users;\n}\n\nexport async function getUserById(id) {\n  const cached = await cache.get(\`user:\${id}\`);\n  if (cached) return cached;\n  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);\n  await cache.set(\`user:\${id}\`, user, 300);\n  return user;\n}`,
    'auth.ts': `import jwt from 'jsonwebtoken';\nimport bcrypt from 'bcrypt';\n\ninterface TokenPayload {\n  userId: string;\n  role: 'admin' | 'user' | 'viewer';\n}\n\nexport async function signIn(email: string, password: string) {\n  const user = await db.findOne({ email });\n  if (!user) throw new Error('Invalid credentials');\n  const valid = await bcrypt.compare(password, user.passwordHash);\n  if (!valid) throw new Error('Invalid credentials');\n  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });\n}`,
    'billing.py': `# Billing Service\nimport stripe\nfrom datetime import datetime\nfrom models import Subscription\n\n# ⚠️ Issue: Missing transaction rollback on failure\ndef process_subscription(user_id: str, plan: str):\n    customer = stripe.Customer.create(email=get_user_email(user_id))\n    sub = stripe.Subscription.create(\n        customer=customer.id,\n        items=[{'price': PLAN_PRICES[plan]}],\n    )\n    # This could fail without rolling back Stripe subscription\n    Subscription.create(user_id=user_id, stripe_id=sub.id)\n    return sub`,
};

const DEPLOYMENTS = [
    { id:'d-104', version:'v2.4.0', time:'10 min ago',  status:'success', branch:'main',    author:'Sarah J.',  latency:'45ms',  duration:'3m 40s', commit:'a1b2c3d' },
    { id:'d-103', version:'v2.3.9', time:'4 hours ago', status:'failed',  branch:'main',    author:'Mike T.',   latency:'120ms', duration:'5m 12s', commit:'f4e5d6c', failReason:'DB migration timeout' },
    { id:'d-102', version:'v2.3.8', time:'1 day ago',   status:'success', branch:'main',    author:'Sarah J.',  latency:'42ms',  duration:'3m 58s', commit:'b7c8d9e' },
    { id:'d-101', version:'v2.3.7', time:'3 days ago',  status:'success', branch:'staging', author:'Bot',       latency:'46ms',  duration:'4m 02s', commit:'1a2b3c4' },
];

const PRS = [
    { id:405, title:'Optimize User Query Performance', author:'dev-alex',   status:'open',   impact:'positive', score:92, tests:'passed', files:4,  additions:128, deletions:45  },
    { id:404, title:'Add Subscription Migration',       author:'sarah-sql', status:'review', impact:'risk',     score:45, tests:'failed', files:12, additions:340, deletions:12  },
    { id:402, title:'Update Dependencies',              author:'dependabot',status:'merged', impact:'neutral',  score:100,tests:'passed', files:1,  additions:48,  deletions:48  },
    { id:401, title:'Refactor Auth Middleware',         author:'mike-t',    status:'open',   impact:'neutral',  score:78, tests:'passed', files:6,  additions:92,  deletions:110 },
];

const MIGRATIONS = [
    { id:'m-20240219', name:'create_audit_logs',        type:'CREATE', risk:'low',    date:'2024-02-19', status:'pending', rows:null },
    { id:'m-20240215', name:'alter_users_add_column',   type:'ALTER',  risk:'medium', date:'2024-02-15', status:'applied', rows:'~2.4M' },
    { id:'m-20240210', name:'drop_legacy_tables',       type:'DROP',   risk:'high',   date:'2024-02-10', status:'applied', rows:'~8.1M' },
    { id:'m-20240201', name:'add_index_orders_user_id', type:'INDEX',  risk:'low',    date:'2024-02-01', status:'applied', rows:'~8.1M' },
];

const INSIGHTS = {
    codeHealth: 74,
    techDebt: [
        { file:'src/api/users.js',        issues:2, type:'N+1 Queries',      severity:'high',     estimatedFix:'2h'  },
        { file:'src/services/billing.py', issues:1, type:'Missing Rollback', severity:'critical', estimatedFix:'4h'  },
        { file:'src/models/User.ts',      issues:1, type:'Missing Index',    severity:'medium',   estimatedFix:'30m' },
    ],
    contributors: [
        { name:'Sarah J.',  commits:47, additions:4820, deletions:1240, avatar:'SJ' },
        { name:'Mike T.',   commits:32, additions:2100, deletions:890,  avatar:'MT' },
        { name:'dev-alex',  commits:28, additions:3600, deletions:2200, avatar:'DA' },
        { name:'sarah-sql', commits:14, additions:1800, deletions:440,  avatar:'SS' },
    ],
    codeToQueryMap: [
        { file:'src/api/users.js',         query:'SELECT * FROM users JOIN orders WHERE...', load:'High',   latency:'240ms', queryCount:12 },
        { file:'src/services/billing.py',  query:'UPDATE subscriptions SET status...',       load:'Medium', latency:'85ms',  queryCount:5  },
        { file:'src/models/Product.ts',    query:'SELECT count(*) FROM products...',         load:'Low',    latency:'12ms',  queryCount:2  },
    ],
    commitCorrelation: [
        { commit:'a1b2c3d', message:'Add user pagination',       latencyDelta:-18, date:'2d ago' },
        { commit:'f4e5d6c', message:'Eager load orders',         latencyDelta:+40, date:'4d ago' },
        { commit:'b7c8d9e', message:'Add DB index on user_id',   latencyDelta:-35, date:'7d ago' },
        { commit:'1a2b3c4', message:'Cache user queries',        latencyDelta:-22, date:'12d ago'},
    ],
    activityHeatmap: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,i) => ({ day, commits:[8,12,6,14,10,3,1][i] })),
    packageRisks: [
        { name:'lodash@4.17.11',      risk:'medium', reason:'Known prototype pollution', cve:'CVE-2019-10744' },
        { name:'axios@0.21.1',        risk:'high',   reason:'SSRF vulnerability',         cve:'CVE-2021-3749'  },
        { name:'jsonwebtoken@8.5.1',  risk:'low',    reason:'Outdated by 3 versions',     cve:null             },
    ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */
const PROV = {
    github:    { label:'GitHub',    Icon:Github,    color:'#e2e8f4', bg:'#ffffff08' },
    gitlab:    { label:'GitLab',    Icon:Gitlab,    color:'#fc6d26', bg:'#fc6d2612' },
    local:     { label:'Local',     Icon:HardDrive, color:null,      bg:null        },  // uses THEME.info
    bitbucket: { label:'Bitbucket', Icon:GitBranch, color:'#0052cc', bg:'#0052cc12' },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════════ */
const RocketIcon = ({ size=14, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
);

const Panel = ({ title, icon:TIcon, rightNode, noPad, children, style={}, className='' }) => (
    <div className={className} style={{
        background: THEME.glass, backdropFilter:'blur(20px) saturate(180%)',
        border:`1px solid ${THEME.glassBorder}`, borderRadius:16,
        display:'flex', flexDirection:'column', overflow:'hidden', height:'100%',
        boxShadow:'0 4px 30px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.03)', ...style,
    }}>
        {title && (
            <div style={{
                padding:'13px 20px', borderBottom:`1px solid ${THEME.glassBorder}`,
                display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0,
                background:`linear-gradient(90deg, ${THEME.primary}06, transparent)`,
            }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {TIcon && <TIcon size={13} color={THEME.primary} />}
                    <span style={{ fontSize:10.5, fontWeight:800, color:THEME.textMain, textTransform:'uppercase', letterSpacing:'0.1em' }}>{title}</span>
                </div>
                {rightNode}
            </div>
        )}
        <div className="r8-scroll" style={{ flex:1, minHeight:0, padding:noPad?0:'16px 20px', overflowY:'auto' }}>
            {children}
        </div>
    </div>
);

const StatusBadge = ({ label, color, pulse, size='md' }) => (
    <span style={{
        display:'inline-flex', alignItems:'center', gap:5,
        fontSize:size==='sm'?9.5:10.5, fontWeight:700,
        padding:size==='sm'?'3px 7px':'4px 10px', borderRadius:5,
        background:`${color}14`, color, border:`1px solid ${color}25`,
        lineHeight:1.2, whiteSpace:'nowrap',
    }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0, animation:pulse?'rPulse 1.5s infinite':'none' }}/>
        {label}
    </span>
);

const RiskBadge = ({ risk }) => {
    const map = { critical:THEME.danger, high:THEME.danger, medium:THEME.warning, low:THEME.success };
    return <StatusBadge label={risk.toUpperCase()} color={map[risk]||THEME.textMuted} size="sm"/>;
};

const Divider = ({ margin='14px 0' }) => <div style={{ height:1, background:`${THEME.glassBorder}`, margin }}/>;

const SectionTitle = ({ children, icon:Icon, action }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {Icon && <Icon size={12} color={THEME.primary}/>}
            <span style={{ fontSize:10.5, fontWeight:800, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.1em' }}>{children}</span>
        </div>
        {action}
    </div>
);

const MetricCard = ({ label, value, icon:Icon, color, subtext, trend }) => (
    <div className="r8-metric" style={{ padding:16, borderRadius:12, background:`${color}08`, border:`1px solid ${color}20` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
            <span style={{ fontSize:10, color:THEME.textDim, textTransform:'uppercase', fontWeight:700, letterSpacing:'0.07em' }}>{label}</span>
            {Icon && <Icon size={13} color={color}/>}
        </div>
        <div style={{ fontSize:22, fontWeight:900, color, lineHeight:1, letterSpacing:'-0.02em' }}>{value}</div>
        {(subtext||trend!==undefined) && (
            <div style={{ marginTop:7, display:'flex', alignItems:'center', gap:4 }}>
                {trend===1  && <TrendingUp   size={10} color={THEME.success}/>}
                {trend===-1 && <TrendingDown size={10} color={THEME.danger}/>}
                {trend===0  && <Minus        size={10} color={THEME.textDim}/>}
                {subtext && <span style={{ fontSize:10.5, color:THEME.textDim }}>{subtext}</span>}
            </div>
        )}
    </div>
);

const ProgressBar = ({ value, max=100, color=THEME.primary, height=6 }) => (
    <div style={{ height, borderRadius:height/2, background:`${THEME.glassBorder}`, overflow:'hidden' }}>
        <div className="r8-bar-fill" style={{
            height:'100%', borderRadius:height/2,
            width:`${(value/max)*100}%`,
            background:`linear-gradient(90deg, ${color}, ${color}cc)`,
            '--w':`${(value/max)*100}%`,
        }}/>
    </div>
);

const Avatar = ({ initials, color=THEME.primary, size=28 }) => (
    <div style={{
        width:size, height:size, borderRadius:'50%', background:`${color}18`,
        border:`1.5px solid ${color}35`, display:'flex', alignItems:'center',
        justifyContent:'center', fontSize:size*.33, fontWeight:800, color, flexShrink:0,
    }}>{initials}</div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FILE TREE
   ═══════════════════════════════════════════════════════════════════════════ */
const FILE_ICONS = { js:FileCode, ts:FileCode, py:FileCode, json:FileJson, md:FileText };

const FileTreeNode = ({ node, depth=0, selectedId, onSelect }) => {
    const [open, setOpen] = useState(depth < 1);
    if (node.type === 'folder') {
        return (
            <div>
                <div className="r8-tree-item" onClick={() => setOpen(o=>!o)}
                     style={{ display:'flex', alignItems:'center', gap:6, padding:`5px 12px 5px ${12+depth*15}px` }}>
                    {open ? <ChevronDown size={10} color={THEME.textDim}/> : <ChevronRight size={10} color={THEME.textDim}/>}
                    <FolderOpen size={12} color={open?THEME.warning:THEME.textDim}/>
                    <span style={{ fontSize:12, color:THEME.textMuted, fontWeight:500 }}>{node.name}</span>
                </div>
                {open && node.children?.map(c=><FileTreeNode key={c.id} node={c} depth={depth+1} selectedId={selectedId} onSelect={onSelect}/>)}
            </div>
        );
    }
    const Icon = FILE_ICONS[node.lang] || File;
    const sel = selectedId === node.id;
    return (
        <div className={`r8-tree-item${sel?' r8-sel':''}`} onClick={() => onSelect(node)}
             style={{ display:'flex', alignItems:'center', gap:6, padding:`5px 12px 5px ${12+depth*15}px`, borderLeft:sel?`2px solid ${THEME.primary}`:'2px solid transparent' }}>
            <Icon size={12} color={sel?THEME.primary:THEME.textDim}/>
            <span style={{ fontSize:11.5, color:sel?THEME.primary:THEME.textMuted, flex:1 }}>{node.name}</span>
            {node.issues>0 && <span style={{ fontSize:9, fontWeight:700, background:`${THEME.danger}20`, color:THEME.danger, padding:'1px 5px', borderRadius:4 }}>{node.issues}</span>}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CODE VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const CodeView = () => {
    const [selFile, setSelFile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [content, setContent] = useState('');
    const [copied, setCopied] = useState(false);

    const onSel = node => { setSelFile(node); setContent(MOCK_FILE_CONTENT[node.name]||`// ${node.name}\n// No preview available`); setEditing(false); };
    const onCopy = () => { navigator.clipboard.writeText(content).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),1800); };
    const lines = content.split('\n');

    return (
        <div style={{ display:'grid', gridTemplateColumns:'215px 1fr', gap:14, height:'100%' }}>
            <Panel title="Files" icon={FolderOpen} noPad>
                <div style={{ paddingTop:6 }}>
                    {MOCK_FILE_TREE.map(n=><FileTreeNode key={n.id} node={n} selectedId={selFile?.id} onSelect={onSel}/>)}
                </div>
            </Panel>
            <Panel title={selFile?selFile.name:'Editor'} icon={Code} noPad
                   rightNode={selFile&&(
                       <div style={{ display:'flex', gap:6 }}>
                           {selFile.issues>0 && <StatusBadge label={`${selFile.issues} Issue${selFile.issues>1?'s':''}`} color={THEME.danger} size="sm"/>}
                           <button onClick={onCopy} className="r8-btn r8-btn-g r8-btn-sm">
                               {copied?<Check size={11} color={THEME.success}/>:<Copy size={11}/>}
                               {copied?'Copied':'Copy'}
                           </button>
                           <button onClick={()=>setEditing(e=>!e)} className="r8-btn r8-btn-sm"
                                   style={{ background:editing?`${THEME.primary}15`:'transparent', color:editing?THEME.primary:THEME.textDim, border:`1px solid ${editing?THEME.primary+'40':THEME.glassBorder}` }}>
                               {editing?<><Save size={11}/> Save</>:<><Edit3 size={11}/> Edit</>}
                           </button>
                       </div>
                   )}>
                {!selFile ? (
                    <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
                        <Code size={38} color={`${THEME.textDim}30`}/>
                        <span style={{ fontSize:13, color:THEME.textDim }}>Select a file to view</span>
                    </div>
                ) : editing ? (
                    <textarea value={content} onChange={e=>setContent(e.target.value)} style={{ width:'100%', height:'100%', background:'transparent', border:'none', outline:'none', color:THEME.textMuted, fontFamily:'JetBrains Mono,monospace', fontSize:12.5, lineHeight:1.75, resize:'none', padding:'16px 20px', boxSizing:'border-box' }}/>
                ) : (
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12.5, lineHeight:1.75 }}>
                        {lines.map((line,i) => {
                            const isIssue = line.includes('⚠️');
                            return (
                                <div key={i} className="r8-line" style={{ display:'flex', padding:'0 20px', background:isIssue?`${THEME.danger}08`:'transparent', borderLeft:isIssue?`2px solid ${THEME.danger}60`:'2px solid transparent' }}>
                                    <span style={{ color:`${THEME.textDim}40`, width:32, flexShrink:0, userSelect:'none', fontSize:11 }}>{i+1}</span>
                                    <span style={{ color:isIssue?THEME.warning:THEME.textMuted }}>{line}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Panel>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CI/CD VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const CICDView = () => {
    const [expId, setExpId] = useState(null);
    return (
        <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }} className="r8-stagger">
                <MetricCard label="Success Rate" value="98.5%"  icon={CheckCircle} color={THEME.success} subtext="Last 30 days" trend={1}/>
                <MetricCard label="Avg Build"    value="4m 12s" icon={Clock}       color={THEME.primary} subtext="-18s vs last week" trend={1}/>
                <MetricCard label="Active"       value="3"      icon={Workflow}     color={THEME.info}    subtext="2 queued"/>
                <MetricCard label="Rollbacks"    value="1"      icon={Undo2}        color={THEME.warning} subtext="This month" trend={0}/>
            </div>
            <SectionTitle icon={RocketIcon}>Deployment History</SectionTitle>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {DEPLOYMENTS.map((d,i) => {
                    const exp = expId===d.id;
                    const sc = d.status==='success'?THEME.success:THEME.danger;
                    return (
                        <div key={i} style={{ borderRadius:11, border:`1px solid ${THEME.glassBorder}`, overflow:'hidden', background:THEME.surface }}>
                            <div onClick={()=>setExpId(exp?null:d.id)} style={{ padding:'13px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                    <div style={{ width:10, height:10, borderRadius:'50%', background:sc, boxShadow:`0 0 8px ${sc}60` }}/>
                                    <div>
                                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                                            <span style={{ fontSize:13.5, fontWeight:800, color:THEME.textMain, fontFamily:'JetBrains Mono,monospace' }}>{d.version}</span>
                                            <span style={{ fontSize:10, color:THEME.textDim, fontFamily:'monospace', background:`${THEME.glassBorder}`, padding:'1px 6px', borderRadius:4 }}>{d.branch}</span>
                                            <span style={{ fontSize:10, color:`${THEME.textDim}80`, fontFamily:'monospace' }}>{d.commit}</span>
                                        </div>
                                        <div style={{ fontSize:11, color:THEME.textDim }}>{d.time} · by <b style={{ color:THEME.textMuted }}>{d.author}</b> · {d.duration}</div>
                                    </div>
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                    <span style={{ fontSize:12, fontWeight:700, color:parseInt(d.latency)>100?THEME.danger:THEME.success }}>{d.latency}</span>
                                    <StatusBadge label={d.status.toUpperCase()} color={sc} size="sm"/>
                                    {d.status==='failed' && <button className="r8-btn r8-btn-d r8-btn-sm"><Undo2 size={10}/> Rollback</button>}
                                    {exp?<ChevronUp size={13} color={THEME.textDim}/>:<ChevronDown size={13} color={THEME.textDim}/>}
                                </div>
                            </div>
                            {exp && (
                                <div style={{ padding:'0 16px 14px', borderTop:`1px solid ${THEME.glassBorder}`, paddingTop:12 }}>
                                    {d.failReason && (
                                        <div style={{ display:'flex', gap:8, padding:'9px 12px', background:`${THEME.danger}10`, borderRadius:8, marginBottom:10 }}>
                                            <AlertTriangle size={12} color={THEME.danger} style={{ flexShrink:0, marginTop:1 }}/>
                                            <span style={{ fontSize:11.5, color:THEME.danger, fontWeight:600 }}>Failure: {d.failReason}</span>
                                        </div>
                                    )}
                                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7 }}>
                                        {[
                                            { label:'Tests',  value:'Passed',                                        color:THEME.success },
                                            { label:'Build',  value:'Completed',                                     color:d.status==='success'?THEME.success:THEME.danger },
                                            { label:'Deploy', value:d.status==='success'?'Live':'Failed',            color:d.status==='success'?THEME.success:THEME.danger },
                                        ].map((s,si)=>(
                                            <div key={si} style={{ padding:'8px 11px', borderRadius:7, background:`${s.color}08`, border:`1px solid ${s.color}20`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                                <span style={{ fontSize:11, color:THEME.textDim }}>{s.label}</span>
                                                <span style={{ fontSize:11, fontWeight:700, color:s.color }}>{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PULL REQUESTS VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const PullRequestView = () => {
    const [filter, setFilter] = useState('all');
    const filtered = filter==='all'?PRS:PRS.filter(p=>p.status===filter);
    const SC = { open:THEME.success, review:THEME.warning, merged:THEME.primary };

    return (
        <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
                <MetricCard label="Open PRs"   value={PRS.filter(p=>p.status==='open').length}   icon={GitPullRequest} color={THEME.success}/>
                <MetricCard label="In Review"  value={PRS.filter(p=>p.status==='review').length}  icon={Eye}           color={THEME.warning}/>
                <MetricCard label="Merged"     value={PRS.filter(p=>p.status==='merged').length}  icon={GitMerge}      color={THEME.primary}/>
                <MetricCard label="Avg Score"  value={`${Math.round(PRS.reduce((a,b)=>a+b.score,0)/PRS.length)}/100`} icon={Gauge} color={THEME.info}/>
            </div>
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
                {['all','open','review','merged'].map(f=>(
                    <button key={f} onClick={()=>setFilter(f)} style={{ padding:'5px 13px', borderRadius:6, border:`1px solid ${filter===f?(SC[f]||THEME.primary)+'40':THEME.glassBorder}`, background:filter===f?`${SC[f]||THEME.primary}14`:'transparent', color:filter===f?(SC[f]||THEME.primary):THEME.textDim, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                        {f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {filtered.map((pr,i)=>{
                    const sc=SC[pr.status]||THEME.textDim;
                    return (
                        <div key={i} style={{ padding:16, borderRadius:11, border:`1px solid ${THEME.glassBorder}`, background:THEME.surface, transition:'all .2s', cursor:'pointer' }}
                             onMouseEnter={e=>{e.currentTarget.style.borderColor=`${sc}35`;e.currentTarget.style.transform='translateY(-2px)';}}
                             onMouseLeave={e=>{e.currentTarget.style.borderColor=THEME.glassBorder;e.currentTarget.style.transform='none';}}>
                            <div style={{ display:'flex', gap:12 }}>
                                <GitPullRequest size={15} color={sc} style={{ flexShrink:0, marginTop:2 }}/>
                                <div style={{ flex:1 }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                                        <div>
                                            <span style={{ fontSize:13.5, fontWeight:700, color:THEME.textMain }}>{pr.title}</span>
                                            <span style={{ fontSize:11, color:THEME.textDim, marginLeft:7, fontFamily:'monospace' }}>#{pr.id}</span>
                                        </div>
                                        <StatusBadge label={pr.status.toUpperCase()} color={sc} size="sm"/>
                                    </div>
                                    <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', marginBottom:10 }}>
                                        <span style={{ fontSize:11, color:THEME.textDim }}>by <b style={{ color:THEME.textMuted }}>{pr.author}</b></span>
                                        <span style={{ fontSize:11, color:THEME.success, fontFamily:'monospace' }}>+{pr.additions}</span>
                                        <span style={{ fontSize:11, color:THEME.danger,  fontFamily:'monospace' }}>-{pr.deletions}</span>
                                        <span style={{ fontSize:11, color:THEME.textDim }}>{pr.files} files</span>
                                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                                            <div style={{ width:6, height:6, borderRadius:'50%', background:pr.tests==='passed'?THEME.success:THEME.danger }}/>
                                            <span style={{ fontSize:11, color:THEME.textDim }}>Tests {pr.tests}</span>
                                        </div>
                                        <span style={{ fontSize:11, fontWeight:700, color:pr.score>80?THEME.success:THEME.warning }}>Score {pr.score}/100</span>
                                    </div>
                                    <ProgressBar value={pr.score} color={pr.score>80?THEME.success:pr.score>50?THEME.warning:THEME.danger} height={4}/>
                                </div>
                                <button className="r8-btn r8-btn-g r8-btn-sm" style={{ alignSelf:'center' }}>View</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DATABASE VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const DatabaseView = () => {
    const [sql, setSql] = useState('');
    const [analysis, setAnalysis] = useState(null);

    const analyze = useCallback(() => {
        const u = sql.toUpperCase();
        let risk='LOW', msg='Standard or additive operation. Safe to run.';
        if (u.includes('DROP TABLE')||u.includes('TRUNCATE')) { risk='CRITICAL'; msg='Destructive operation — irreversible data loss possible.'; }
        else if (u.includes('DROP')||u.includes('ALTER'))    { risk='HIGH';     msg='Modifies existing schema. Ensure rollback plan exists.'; }
        else if (u.includes('UPDATE')||u.includes('DELETE')) { risk='MEDIUM';   msg='Bulk data mutation. Test on staging first.'; }
        setAnalysis({ risk, msg });
    }, [sql]);

    const RC = { CRITICAL:THEME.danger, HIGH:THEME.danger, MEDIUM:THEME.warning, LOW:THEME.success };

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                <MetricCard label="Applied"   value={MIGRATIONS.filter(m=>m.status==='applied').length} icon={CheckCircle}   color={THEME.success}/>
                <MetricCard label="Pending"   value={MIGRATIONS.filter(m=>m.status==='pending').length} icon={Clock}         color={THEME.warning}/>
                <MetricCard label="High Risk" value={MIGRATIONS.filter(m=>m.risk==='high').length}      icon={AlertTriangle} color={THEME.danger}/>
            </div>
            <div style={{ padding:16, borderRadius:12, background:THEME.glass, border:`1px solid ${THEME.glassBorder}` }}>
                <SectionTitle icon={Shield}>Migration Risk Assessment</SectionTitle>
                <div style={{ display:'flex', gap:10 }}>
                    <textarea value={sql} onChange={e=>setSql(e.target.value)} placeholder="Paste migration SQL to assess risk…"
                              style={{ flex:1, background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, borderRadius:8, padding:'10px 12px', color:THEME.textMuted, fontSize:11.5, fontFamily:'JetBrains Mono,monospace', resize:'none', height:68, outline:'none' }}/>
                    <button onClick={analyze} className="r8-btn r8-btn-c" style={{ flexShrink:0 }}>Analyze</button>
                </div>
                {analysis && (
                    <div style={{ marginTop:10, padding:'10px 12px', borderRadius:8, background:`${RC[analysis.risk]}10`, display:'flex', gap:8 }}>
                        {analysis.risk==='LOW'?<CheckCircle size={13} color={RC[analysis.risk]} style={{ marginTop:1 }}/>:<AlertTriangle size={13} color={RC[analysis.risk]} style={{ marginTop:1 }}/>}
                        <div>
                            <div style={{ fontSize:11.5, fontWeight:700, color:RC[analysis.risk] }}>Risk: {analysis.risk}</div>
                            <div style={{ fontSize:11, color:THEME.textDim, marginTop:2 }}>{analysis.msg}</div>
                        </div>
                    </div>
                )}
            </div>
            <div>
                <SectionTitle icon={History}>Schema History</SectionTitle>
                <div style={{ border:`1px solid ${THEME.glassBorder}`, borderRadius:12, overflow:'hidden' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                        <thead>
                        <tr style={{ background:THEME.glass, borderBottom:`1px solid ${THEME.glassBorder}` }}>
                            {['Migration','Type','Risk','Rows','Date','Status'].map(h=>(
                                <th key={h} style={{ textAlign:'left', padding:'9px 12px', fontSize:10, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {MIGRATIONS.map((m,i)=>(
                            <tr key={i} style={{ borderBottom:i<MIGRATIONS.length-1?`1px solid ${THEME.glassBorder}20`:'none', background:THEME.surface }}>
                                <td style={{ padding:'10px 12px', fontFamily:'JetBrains Mono,monospace', color:THEME.textMuted, fontSize:11.5 }}>{m.name}</td>
                                <td style={{ padding:'10px 12px' }}><span style={{ fontSize:10, fontWeight:700, background:`${THEME.primary}12`, color:THEME.primary, padding:'2px 6px', borderRadius:4, fontFamily:'monospace' }}>{m.type}</span></td>
                                <td style={{ padding:'10px 12px' }}><RiskBadge risk={m.risk}/></td>
                                <td style={{ padding:'10px 12px', color:THEME.textDim, fontFamily:'monospace', fontSize:11 }}>{m.rows||'—'}</td>
                                <td style={{ padding:'10px 12px', color:THEME.textDim, fontSize:11 }}>{m.date}</td>
                                <td style={{ padding:'10px 12px' }}><StatusBadge label={m.status.toUpperCase()} color={m.status==='applied'?THEME.success:THEME.warning} pulse={m.status==='pending'} size="sm"/></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   INSIGHTS VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const InsightsView = () => {
    const [tab, setTab] = useState('health');
    const healthColor = INSIGHTS.codeHealth>=80?THEME.success:INSIGHTS.codeHealth>=60?THEME.warning:THEME.danger;

    const TABS = [
        { id:'health',       label:'Code Health',  icon:Activity },
        { id:'query',        label:'Code → Query', icon:Database },
        { id:'commits',      label:'Commit Impact',icon:GitCommit },
        { id:'contributors', label:'Team',         icon:Users },
        { id:'packages',     label:'Pkg Risks',    icon:Package },
    ];
    const total = INSIGHTS.contributors.reduce((a,b)=>a+b.commits,0);

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }} className="r8-stagger">
                <MetricCard label="Code Health"  value={`${INSIGHTS.codeHealth}/100`}                      icon={Activity}  color={healthColor} subtext="3 issues open" trend={-1}/>
                <MetricCard label="Tech Debt"    value={`${INSIGHTS.techDebt.reduce((a,b)=>a+b.issues,0)} Issues`}  icon={Wrench}    color={THEME.warning} subtext="~6.5h to fix"/>
                <MetricCard label="Dependencies" value={INSIGHTS.packageRisks.length}                       icon={Package}   color={THEME.info}  subtext={`${INSIGHTS.packageRisks.filter(p=>p.risk==='high').length} high risk`}/>
                <MetricCard label="Contributors" value={INSIGHTS.contributors.length}                       icon={Users}     color={THEME.primary} subtext="Last 30 days"/>
                <MetricCard label="Commits"      value={total}                                               icon={GitCommit} color={THEME.secondary} subtext="This month" trend={1}/>
            </div>

            {/* Tab nav */}
            <div style={{ display:'flex', gap:4, padding:4, background:THEME.glass, border:`1px solid ${THEME.glassBorder}`, borderRadius:10, width:'fit-content' }}>
                {TABS.map(t=>(
                    <button key={t.id} onClick={()=>setTab(t.id)} className={`r8-tab${tab===t.id?' r8-tab-on':''}`} style={{
                        display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer',
                        background:tab===t.id?`linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`:'transparent',
                        color:tab===t.id?'#fff':THEME.textDim, fontSize:11.5, fontWeight:700,
                        boxShadow:tab===t.id?`0 3px 12px ${THEME.primary}30`:'none',
                    }}>
                        <t.icon size={11} color={tab===t.id?'#fff':THEME.textDim}/>{t.label}
                    </button>
                ))}
            </div>

            <div className="r8-scroll" style={{ flex:1, minHeight:0, overflowY:'auto' }}>
                {tab==='health' && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, height:'100%' }}>
                        <Panel title="Tech Debt Tracker" icon={Wrench}>
                            <div style={{ display:'flex', gap:16, padding:16, borderRadius:10, background:`${healthColor}08`, border:`1px solid ${healthColor}20`, marginBottom:20 }}>
                                <div style={{ fontSize:44, fontWeight:900, color:healthColor, lineHeight:1, fontFamily:'JetBrains Mono,monospace' }}>{INSIGHTS.codeHealth}</div>
                                <div>
                                    <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain }}>Code Health Score</div>
                                    <div style={{ fontSize:11, color:THEME.textDim, marginTop:2 }}>Issues, coverage & complexity</div>
                                    <div style={{ marginTop:8 }}><ProgressBar value={INSIGHTS.codeHealth} color={healthColor} height={6}/></div>
                                </div>
                            </div>
                            {INSIGHTS.techDebt.map((td,i)=>(
                                <div key={i} style={{ marginBottom:10, padding:14, borderRadius:10, border:`1px solid ${THEME.glassBorder}`, background:THEME.surface }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                        <span style={{ fontSize:11.5, fontWeight:700, color:THEME.primary, fontFamily:'JetBrains Mono,monospace' }}>{td.file}</span>
                                        <RiskBadge risk={td.severity}/>
                                    </div>
                                    <div style={{ fontSize:12, color:THEME.textMuted, marginBottom:6 }}>{td.type}</div>
                                    <div style={{ fontSize:10.5, color:THEME.textDim }}>Est. fix: <b style={{ color:THEME.textMuted }}>{td.estimatedFix}</b></div>
                                </div>
                            ))}
                        </Panel>
                        <Panel title="Activity & Health" icon={BarChart3}>
                            <SectionTitle>Commits This Week</SectionTitle>
                            <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:72, marginBottom:20 }}>
                                {INSIGHTS.activityHeatmap.map((d,i)=>(
                                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                                        <div style={{ height:60, width:'100%', display:'flex', alignItems:'flex-end' }}>
                                            <div style={{ width:'100%', borderRadius:'3px 3px 0 0', height:`${Math.max(5,(d.commits/15)*100)}%`, background:`linear-gradient(180deg, ${THEME.primary}, ${THEME.primary}60)` }}/>
                                        </div>
                                        <span style={{ fontSize:9.5, color:THEME.textDim }}>{d.day}</span>
                                    </div>
                                ))}
                            </div>
                            <Divider/>
                            {[
                                { label:'Test Coverage',  value:78, color:THEME.success },
                                { label:'Documentation',  value:55, color:THEME.warning },
                                { label:'Code Complexity',value:68, color:THEME.primary },
                                { label:'Security Score', value:82, color:THEME.info    },
                            ].map((item,i)=>(
                                <div key={i} style={{ marginBottom:12 }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                        <span style={{ fontSize:11.5, color:THEME.textMuted }}>{item.label}</span>
                                        <span style={{ fontSize:11.5, fontWeight:700, color:item.color, fontFamily:'JetBrains Mono,monospace' }}>{item.value}%</span>
                                    </div>
                                    <ProgressBar value={item.value} color={item.color} height={5}/>
                                </div>
                            ))}
                        </Panel>
                    </div>
                )}

                {tab==='query' && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                        <Panel title="File → Query Mapping" icon={Database}>
                            {INSIGHTS.codeToQueryMap.map((item,i)=>(
                                <div key={i} style={{ marginBottom:14, padding:14, borderRadius:10, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                                        <span style={{ fontSize:12, fontWeight:700, color:THEME.primary, fontFamily:'JetBrains Mono,monospace' }}>{item.file}</span>
                                        <StatusBadge label={`${item.load} Load`} color={item.load==='High'?THEME.danger:item.load==='Medium'?THEME.warning:THEME.success} size="sm"/>
                                    </div>
                                    <div style={{ fontSize:10.5, color:THEME.textDim, fontFamily:'JetBrains Mono,monospace', background:`${THEME.glassBorder}40`, padding:'8px 10px', borderRadius:6, marginBottom:8 }}>{item.query}</div>
                                    <div style={{ display:'flex', gap:14 }}>
                                        <span style={{ fontSize:11, color:THEME.textDim }}>Avg: <b style={{ color:item.load==='High'?THEME.danger:THEME.textMuted }}>{item.latency}</b></span>
                                        <span style={{ fontSize:11, color:THEME.textDim }}>Queries/min: <b style={{ color:THEME.textMuted }}>{item.queryCount}</b></span>
                                    </div>
                                </div>
                            ))}
                        </Panel>
                        <Panel title="Optimization Suggestions" icon={Lightbulb}>
                            {[
                                { title:'Fix N+1 in users.js',       desc:'Replace per-user queries with a JOIN. 90% latency reduction.',            impact:'Critical', color:THEME.danger,  icon:Zap },
                                { title:'Add index on orders.user_id',desc:'Missing index causes full table scans. B-tree index will cut scan time.', impact:'High',     color:THEME.warning, icon:TrendingUp },
                                { title:'Cache product counts',       desc:'COUNT(*) runs every request. Cache for 30s to reduce load.',              impact:'Medium',   color:THEME.primary, icon:Sparkles },
                            ].map((s,i)=>(
                                <div key={i} style={{ marginBottom:12, padding:14, borderRadius:10, background:`${s.color}06`, border:`1px solid ${s.color}18` }}>
                                    <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                                        <div style={{ width:28, height:28, borderRadius:8, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                            <s.icon size={13} color={s.color}/>
                                        </div>
                                        <div style={{ flex:1 }}>
                                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                                                <span style={{ fontSize:12.5, fontWeight:700, color:THEME.textMain }}>{s.title}</span>
                                                <StatusBadge label={s.impact} color={s.color} size="sm"/>
                                            </div>
                                            <p style={{ fontSize:11, color:THEME.textDim, margin:0, lineHeight:1.6 }}>{s.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Panel>
                    </div>
                )}

                {tab==='commits' && (
                    <Panel title="Commit → Latency Correlation" icon={GitCommit} style={{ height:'auto' }}>
                        <p style={{ fontSize:11, color:THEME.textDim, marginBottom:18, lineHeight:1.6 }}>How each commit affected production query latency. Negative delta = improvement.</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                            {INSIGHTS.commitCorrelation.map((c,i)=>{
                                const good = c.latencyDelta<0;
                                const col = good?THEME.success:THEME.danger;
                                return (
                                    <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:10, background:THEME.surface, border:`1px solid ${col}18` }}>
                                        <div style={{ width:36, height:36, borderRadius:8, background:`${col}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                            {good?<TrendingDown size={16} color={col}/>:<TrendingUp size={16} color={col}/>}
                                        </div>
                                        <div style={{ flex:1 }}>
                                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                                                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                                    <code style={{ fontSize:11, color:THEME.primary, background:`${THEME.primary}12`, padding:'2px 7px', borderRadius:4, fontFamily:'JetBrains Mono,monospace' }}>{c.commit}</code>
                                                    <span style={{ fontSize:12.5, fontWeight:600, color:THEME.textMain }}>{c.message}</span>
                                                </div>
                                                <div style={{ display:'flex', gap:8 }}>
                                                    <span style={{ fontSize:13, fontWeight:800, color:col, fontFamily:'JetBrains Mono,monospace' }}>{c.latencyDelta>0?'+':''}{c.latencyDelta}ms</span>
                                                    <span style={{ fontSize:10.5, color:THEME.textDim }}>{c.date}</span>
                                                </div>
                                            </div>
                                            <ProgressBar value={Math.abs(c.latencyDelta)} max={50} color={col} height={3}/>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>
                )}

                {tab==='contributors' && (
                    <Panel title="Team Activity" icon={Users} style={{ height:'auto' }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                            {INSIGHTS.contributors.map((c,i)=>{
                                const colors=[THEME.primary,THEME.success,THEME.secondary,THEME.info];
                                const col=colors[i%colors.length];
                                return (
                                    <div key={i} style={{ padding:'14px 16px', borderRadius:10, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                                            <Avatar initials={c.avatar} color={col}/>
                                            <div style={{ flex:1 }}>
                                                <div style={{ display:'flex', justifyContent:'space-between' }}>
                                                    <span style={{ fontSize:13, fontWeight:700, color:THEME.textMain }}>{c.name}</span>
                                                    <span style={{ fontSize:12, fontWeight:800, color:col, fontFamily:'JetBrains Mono,monospace' }}>{c.commits} commits</span>
                                                </div>
                                                <div style={{ marginTop:6 }}><ProgressBar value={c.commits} max={total} color={col} height={4}/></div>
                                            </div>
                                        </div>
                                        <div style={{ display:'flex', gap:16 }}>
                                            <span style={{ fontSize:11, color:THEME.success, fontFamily:'JetBrains Mono,monospace' }}>+{c.additions.toLocaleString()}</span>
                                            <span style={{ fontSize:11, color:THEME.danger,  fontFamily:'JetBrains Mono,monospace' }}>-{c.deletions.toLocaleString()}</span>
                                            <span style={{ fontSize:11, color:THEME.textDim }}>Net: <b style={{ color:(c.additions-c.deletions)>0?THEME.success:THEME.danger, fontFamily:'JetBrains Mono,monospace' }}>{(c.additions-c.deletions)>0?'+':''}{(c.additions-c.deletions).toLocaleString()}</b></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>
                )}

                {tab==='packages' && (
                    <Panel title="Dependency Risk Audit" icon={Package} style={{ height:'auto' }}>
                        <div style={{ padding:14, borderRadius:10, background:`${THEME.warning}08`, border:`1px solid ${THEME.warning}20`, marginBottom:18, display:'flex', gap:10 }}>
                            <AlertTriangle size={13} color={THEME.warning} style={{ flexShrink:0, marginTop:1 }}/>
                            <div>
                                <div style={{ fontSize:12.5, fontWeight:700, color:THEME.warning, marginBottom:4 }}>{INSIGHTS.packageRisks.filter(p=>p.risk!=='low').length} packages require attention</div>
                                <div style={{ fontSize:11, color:THEME.textDim }}>Known CVEs in your dependency tree. Update ASAP.</div>
                            </div>
                        </div>
                        {INSIGHTS.packageRisks.map((pkg,i)=>(
                            <div key={i} style={{ marginBottom:10, padding:14, borderRadius:10, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                                    <div>
                                        <span style={{ fontSize:12.5, fontWeight:700, color:THEME.primary, fontFamily:'JetBrains Mono,monospace' }}>{pkg.name}</span>
                                        {pkg.cve && <span style={{ marginLeft:8, fontSize:9.5, color:THEME.danger, background:`${THEME.danger}12`, padding:'2px 7px', borderRadius:4, fontFamily:'monospace' }}>{pkg.cve}</span>}
                                    </div>
                                    <RiskBadge risk={pkg.risk}/>
                                </div>
                                <p style={{ fontSize:11, color:THEME.textDim, margin:'0 0 10px' }}>{pkg.reason}</p>
                                <div style={{ display:'flex', gap:8 }}>
                                    <button className="r8-btn r8-btn-c r8-btn-sm">Update</button>
                                    <button className="r8-btn r8-btn-g r8-btn-sm">Advisory</button>
                                </div>
                            </div>
                        ))}
                    </Panel>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOCAL REPO FORM  ← NEW
   ═══════════════════════════════════════════════════════════════════════════ */
const LOCAL_PATHS = ['~/Projects/', '~/Documents/code/', '/home/dev/repos/', 'C:\\Projects\\', '/workspace/'];

const LocalRepoForm = ({ onConnect, onClose }) => {
    const [path, setPath]       = useState('');
    const [name, setName]       = useState('');
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(null);

    const scan = () => {
        if (!path.trim()) return;
        setScanning(true);
        setTimeout(() => {
            const detected = path.split('/').filter(Boolean).pop() || path.split('\\').filter(Boolean).pop() || 'local-repo';
            setScanned({ name:detected, branch:'main', files:Math.floor(Math.random()*200+50), commits:Math.floor(Math.random()*500+20), dirty:Math.random()>.6 });
            setName(detected);
            setScanning(false);
        }, 900);
    };

    const connect = () => {
        if (!path.trim()) return;
        onConnect({ path, name:name||'local-repo', scanned });
    };

    return (
        <div style={{ padding:22, display:'flex', flexDirection:'column', gap:18 }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${THEME.info}18`, border:`1px solid ${THEME.info}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <HardDrive size={18} color={THEME.info}/>
                </div>
                <div>
                    <div style={{ fontSize:14.5, fontWeight:800, color:THEME.textMain }}>Connect Local Repository</div>
                    <div style={{ fontSize:11, color:THEME.textDim, marginTop:2 }}>Enter or browse to your local Git repository path</div>
                </div>
            </div>

            {/* Terminal-styled path input */}
            <div>
                <label style={{ fontSize:10.5, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>Repository Path</label>
                <div className="r8-terminal" style={{ position:'relative', display:'flex', alignItems:'center', background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, borderRadius:10, padding:'0 12px', overflow:'hidden', transition:'border-color .18s' }}
                     onFocus={e=>e.currentTarget.style.borderColor=THEME.info}
                     onBlur={e=>e.currentTarget.style.borderColor=THEME.glassBorder}>
                    <span style={{ fontSize:13, color:THEME.info, fontFamily:'JetBrains Mono,monospace', flexShrink:0, marginRight:8, opacity:.7 }}>$</span>
                    <input value={path} onChange={e=>{ setPath(e.target.value); setScanned(null); }}
                           onKeyDown={e=>e.key==='Enter'&&scan()}
                           placeholder="/path/to/your/project  or  C:\Projects\my-app"
                           className="r8-input r8-input-local"
                           style={{ flex:1, background:'transparent', border:'none', outline:'none', padding:'12px 0', color:THEME.textMain, fontFamily:'JetBrains Mono,monospace', fontSize:12.5 }}/>
                    {path && <button onClick={()=>{setPath('');setScanned(null);}} style={{ background:'none', border:'none', cursor:'pointer', padding:4, color:THEME.textDim, display:'flex' }}><X size={12}/></button>}
                </div>
            </div>

            {/* Quick path suggestions */}
            <div>
                <div style={{ fontSize:10, fontWeight:700, color:THEME.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Common Locations</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {LOCAL_PATHS.map((p,i)=>(
                        <button key={i} className="r8-path-pill" onClick={()=>{setPath(p);setScanned(null);}}
                                style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${THEME.glassBorder}`, background:THEME.surface, color:THEME.textDim, fontSize:10.5, cursor:'pointer', fontFamily:'JetBrains Mono,monospace' }}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scan + Connect buttons */}
            <div style={{ display:'flex', gap:8 }}>
                <button onClick={scan} disabled={!path.trim()||scanning} className="r8-btn r8-btn-c" style={{ opacity:!path.trim()?0.5:1 }}>
                    {scanning?<Loader size={13} style={{ animation:'rSpin 1s linear infinite' }}/>:<Search size={13}/>}
                    {scanning?'Scanning…':'Scan Path'}
                </button>
            </div>

            {/* Scanned result */}
            {scanned && (
                <div style={{ padding:16, borderRadius:11, background:`${THEME.info}08`, border:`1px solid ${THEME.info}25`, animation:'rFadeUp .25s ease' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                        <CheckCircle size={13} color={THEME.info}/>
                        <span style={{ fontSize:12.5, fontWeight:700, color:THEME.info }}>Repository detected</span>
                        {scanned.dirty && <StatusBadge label="Uncommitted Changes" color={THEME.warning} size="sm"/>}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                        {[
                            { l:'Branch',  v:scanned.branch,               ic:GitBranch },
                            { l:'Files',   v:scanned.files+' tracked',     ic:FileCode  },
                            { l:'Commits', v:scanned.commits+' total',     ic:GitCommit },
                        ].map((s,i)=>(
                            <div key={i} style={{ padding:'9px 11px', borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
                                    <s.ic size={10} color={THEME.textDim}/>
                                    <span style={{ fontSize:9.5, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700 }}>{s.l}</span>
                                </div>
                                <span style={{ fontSize:12, fontWeight:700, color:THEME.textMain, fontFamily:'JetBrains Mono,monospace' }}>{s.v}</span>
                            </div>
                        ))}
                    </div>
                    <div>
                        <label style={{ fontSize:10.5, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Display Name</label>
                        <input value={name} onChange={e=>setName(e.target.value)} placeholder={scanned.name}
                               className="r8-input" style={{ width:'100%', padding:'9px 12px', background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, borderRadius:9, color:THEME.textMain, outline:'none', fontSize:13, fontFamily:'inherit' }}/>
                    </div>
                </div>
            )}

            {/* Action row */}
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', paddingTop:4 }}>
                <button onClick={onClose} className="r8-btn r8-btn-g">Cancel</button>
                <button onClick={connect} disabled={!path.trim()} className="r8-btn r8-btn-p" style={{ opacity:!path.trim()?.0.5:1 }}>
                    <HardDrive size={13}/> Connect Repository
                </button>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ADD REPO MODAL  (enhanced with Local tab)  ← UPGRADED
   ═══════════════════════════════════════════════════════════════════════════ */
const AddRepoModal = ({ onAdd, onClose }) => {
    const [provider, setProvider] = useState('github');
    const [url, setUrl]           = useState('');

    const providers = [
        { id:'github',    Icon:Github,    label:'GitHub',    placeholder:'https://github.com/user/repo' },
        { id:'gitlab',    Icon:Gitlab,    label:'GitLab',    placeholder:'https://gitlab.com/user/repo' },
        { id:'local',     Icon:HardDrive, label:'Local',     placeholder:'' },
        { id:'bitbucket', Icon:GitBranch, label:'Bitbucket', placeholder:'https://bitbucket.org/user/repo' },
    ];
    const cur = providers.find(p=>p.id===provider);

    const handleRemote = () => {
        if (!url.trim()) return;
        const name = url.split('/').pop().replace(/\.git$/,'') || 'repo';
        onAdd({ name, url, type:provider, branch:'main', lang:'JavaScript', lastCommit:'Just now', isLocal:false });
    };

    const handleLocal = data => {
        onAdd({ name:data.name, url:data.path, type:'local', branch:data.scanned?.branch||'main', lang:'JavaScript', lastCommit:'Just now', isLocal:true, localPath:data.path });
    };

    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.72)', backdropFilter:'blur(10px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}
             onClick={e=>e.target===e.currentTarget&&onClose()}>
            <div style={{ width:560, background:THEME.glass, backdropFilter:'blur(24px) saturate(180%)', border:`1px solid ${THEME.glassBorder}`, borderRadius:18, boxShadow:`0 28px 80px rgba(0,0,0,.55), 0 0 0 1px ${THEME.glassBorder}`, animation:'rScaleIn .22s ease', overflow:'hidden' }}>
                {/* Header */}
                <div style={{ padding:'18px 22px', borderBottom:`1px solid ${THEME.glassBorder}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:`linear-gradient(90deg, ${THEME.primary}06, transparent)` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <GitBranch size={15} color={THEME.primary}/>
                        <span style={{ fontSize:15, fontWeight:800, color:THEME.textMain }}>Connect Repository</span>
                    </div>
                    <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:THEME.textDim, display:'flex', padding:4, borderRadius:6 }}><X size={16}/></button>
                </div>

                {/* Provider tabs */}
                <div style={{ display:'flex', gap:5, padding:'14px 22px 0' }}>
                    {providers.map(p=>{
                        const prov = PROV[p.id];
                        const active = provider===p.id;
                        const col = p.id==='local'?THEME.info:prov?.color||THEME.primary;
                        return (
                            <button key={p.id} onClick={()=>setProvider(p.id)} style={{
                                display:'flex', alignItems:'center', gap:7, padding:'8px 13px', borderRadius:9,
                                border:`1px solid ${active?col+'40':THEME.glassBorder}`,
                                background:active?`${col}14`:'transparent',
                                color:active?col:THEME.textDim, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .15s',
                            }}>
                                <p.Icon size={13} color={active?col:THEME.textDim}/>{p.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {provider==='local' ? (
                    <LocalRepoForm onConnect={handleLocal} onClose={onClose}/>
                ) : (
                    <div style={{ padding:22, display:'flex', flexDirection:'column', gap:16 }}>
                        <div>
                            <label style={{ fontSize:10.5, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>Repository URL</label>
                            <div style={{ display:'flex', gap:8 }}>
                                <div style={{ flex:1, display:'flex', alignItems:'center', background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, borderRadius:9, padding:'0 12px' }}>
                                    <Globe size={13} color={THEME.textDim} style={{ flexShrink:0 }}/>
                                    <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleRemote()}
                                           placeholder={cur?.placeholder}
                                           style={{ flex:1, background:'transparent', border:'none', padding:'11px 10px', color:THEME.textMain, outline:'none', fontSize:13 }}/>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding:12, borderRadius:9, background:`${THEME.primary}06`, border:`1px solid ${THEME.primary}15`, fontSize:11, color:THEME.textDim, lineHeight:1.6 }}>
                            <b style={{ color:THEME.primary }}>Tip:</b> Use HTTPS or SSH. For private repos, ensure your access token or SSH key is configured.
                        </div>
                        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                            <button onClick={onClose} className="r8-btn r8-btn-g">Cancel</button>
                            <button onClick={handleRemote} disabled={!url.trim()} className="r8-btn r8-btn-p" style={{ opacity:!url.trim()?0.5:1 }}>
                                <Plus size={13}/> Connect
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   REPO CARD  (upgraded visuals)
   ═══════════════════════════════════════════════════════════════════════════ */
const RepoCard = ({ repo, onOpen, onDelete }) => {
    const isLocal = repo.type==='local';
    const prov    = PROV[repo.type] || PROV.github;
    const ProvIcon = prov.Icon;
    const accent  = isLocal ? THEME.info : THEME.primary;

    return (
        <div className={`r8-card r8-card-${isLocal?'local':'remote'}`} onClick={()=>onOpen(repo)}
             style={{ padding:22, borderRadius:14, background:THEME.glass, border:`1px solid ${THEME.glassBorder}`, backdropFilter:'blur(12px)' }}>
            {/* Corner glow */}
            <div style={{ position:'absolute', top:-30, right:-30, width:80, height:80, borderRadius:'50%', background:`${accent}0a`, pointerEvents:'none' }}/>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:11, background:`${accent}14`, border:`1px solid ${accent}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <ProvIcon size={18} color={accent}/>
                    </div>
                    <div>
                        <div style={{ fontSize:15, fontWeight:800, color:THEME.textMain, letterSpacing:'-0.01em' }}>{repo.name}</div>
                        {isLocal ? (
                            <div style={{ fontSize:10.5, color:THEME.textDim, fontFamily:'JetBrains Mono,monospace', marginTop:2, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{repo.url}</div>
                        ) : (
                            <div style={{ fontSize:10.5, color:THEME.textDim, fontFamily:'monospace', marginTop:2 }}>{repo.branch}</div>
                        )}
                    </div>
                </div>
                <button onClick={e=>{e.stopPropagation();onDelete(repo.id);}}
                        style={{ padding:6, background:'transparent', border:`1px solid transparent`, borderRadius:6, cursor:'pointer', opacity:.4, transition:'opacity .2s, border-color .2s' }}
                        onMouseEnter={e=>{e.currentTarget.style.opacity=1;e.currentTarget.style.borderColor=`${THEME.danger}40`;}}
                        onMouseLeave={e=>{e.currentTarget.style.opacity=.4;e.currentTarget.style.borderColor='transparent';}}>
                    <Trash2 size={12} color={THEME.danger}/>
                </button>
            </div>

            <div style={{ display:'flex', gap:7, marginBottom:14 }}>
                {/* Provider badge */}
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, fontSize:10, fontWeight:700, background:`${accent}12`, color:accent, border:`1px solid ${accent}20` }}>
                    <ProvIcon size={10}/> {prov.label}
                </span>
                <StatusBadge label={isLocal?'LOCAL':'ACTIVE'} color={isLocal?THEME.info:THEME.success} pulse={!isLocal} size="sm"/>
                {isLocal && repo.dirty && <StatusBadge label="DIRTY" color={THEME.warning} size="sm"/>}
            </div>

            <div style={{ height:1, background:`${THEME.glassBorder}`, marginBottom:12 }}/>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, color:THEME.textDim }}>
                <span>{repo.lastCommit}</span>
                <div style={{ display:'flex', alignItems:'center', gap:4, color:accent, fontWeight:600 }}>
                    Open <ArrowRight size={11}/>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const RepositoryTab = () => {
    const [view,       setView]       = useState('repos');
    const [repos,      setRepos]      = useState([]);
    const [activeRepo, setActiveRepo] = useState(null);
    const [subView,    setSubView]    = useState('code');
    const [showAdd,    setShowAdd]    = useState(false);
    const [search,     setSearch]     = useState('');

    useEffect(() => {
        try { const s=localStorage.getItem('vigil_repos_v8'); if(s) setRepos(JSON.parse(s)); } catch {}
    }, []);
    useEffect(() => {
        try { localStorage.setItem('vigil_repos_v8', JSON.stringify(repos)); } catch {}
    }, [repos]);

    const handleAdd = useCallback(data => {
        setRepos(prev=>[{ id:Date.now(), ...data }, ...prev]);
        setShowAdd(false);
    }, []);

    const handleDelete = useCallback(id => {
        setRepos(prev=>prev.filter(r=>r.id!==id));
    }, []);

    const openRepo = useCallback(repo => {
        setActiveRepo(repo);
        setView('browser');
        setSubView('code');
    }, []);

    const filtered = repos.filter(r=>r.name?.toLowerCase().includes(search.toLowerCase()));
    const localCount  = repos.filter(r=>r.type==='local').length;
    const remoteCount = repos.length - localCount;

    const NAV_TABS = [
        { id:'code',     label:'Code',          icon:Code },
        { id:'cicd',     label:'CI/CD',         icon:RocketIcon },
        { id:'prs',      label:'Pull Requests', icon:GitPullRequest },
        { id:'db',       label:'Database',      icon:Database },
        { id:'insights', label:'Insights',      icon:Activity },
    ];

    /* ── REPO LIST ── */
    if (view==='repos') {
        return (
            <div style={{ padding:'0 28px 56px' }}>
                <RepoStyles/>
                {showAdd && <AddRepoModal onAdd={handleAdd} onClose={()=>setShowAdd(false)}/>}

                {/* Page header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'26px 0 24px', flexWrap:'wrap', gap:16 }}>
                    <div>
                        <h2 style={{ fontSize:26, fontWeight:900, color:THEME.textMain, margin:0, letterSpacing:'-0.03em' }}>Repositories</h2>
                        <div style={{ fontSize:12.5, color:THEME.textDim, marginTop:5, display:'flex', gap:14 }}>
                            <span>{remoteCount} remote</span>
                            <span style={{ color:THEME.info }}>{localCount} local</span>
                            <span style={{ color:THEME.textMuted }}>{repos.length} total</span>
                        </div>
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                            <Search size={13} color={THEME.textMuted} style={{ position:'absolute', left:11, pointerEvents:'none' }}/>
                            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
                                   className="r8-input" style={{ paddingLeft:32, width:190, padding:'9px 12px 9px 32px', background:THEME.glass, border:`1px solid ${THEME.glassBorder}`, borderRadius:9, color:THEME.textMain, outline:'none', fontSize:13 }}/>
                        </div>
                        <button onClick={()=>setShowAdd(true)} className="r8-btn r8-btn-p">
                            <Plus size={14}/> Add Repository
                        </button>
                    </div>
                </div>

                {/* Quick-connect row */}
                <div style={{ display:'flex', gap:8, marginBottom:22, flexWrap:'wrap', alignItems:'center' }}>
                    {[
                        { icon:Github,    label:'GitHub',    color:THEME.textMain },
                        { icon:Gitlab,    label:'GitLab',    color:'#fc6d26' },
                        { icon:HardDrive, label:'Local',     color:THEME.info },
                        { icon:GitBranch, label:'Bitbucket', color:'#0052cc' },
                    ].map((p,i)=>(
                        <button key={i} onClick={()=>setShowAdd(true)} style={{
                            display:'flex', alignItems:'center', gap:6, padding:'6px 13px', borderRadius:8,
                            border:`1px solid ${THEME.glassBorder}`, background:THEME.glass,
                            color:THEME.textDim, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s',
                        }}
                                onMouseEnter={e=>{e.currentTarget.style.borderColor=`${p.color}50`;e.currentTarget.style.color=p.color;}}
                                onMouseLeave={e=>{e.currentTarget.style.borderColor=THEME.glassBorder;e.currentTarget.style.color=THEME.textDim;}}>
                            <p.icon size={13} color="inherit"/>{p.label}
                        </button>
                    ))}
                    <span style={{ marginLeft:'auto', fontSize:11, color:THEME.textDim, display:'flex', alignItems:'center', gap:5 }}>
                        <HardDrive size={10} color={THEME.info}/> Local repos auto-detect branch, commits & dirty state
                    </span>
                </div>

                {/* Grid */}
                {filtered.length>0 ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }} className="r8-stagger">
                        {filtered.map(repo=><RepoCard key={repo.id} repo={repo} onOpen={openRepo} onDelete={handleDelete}/>)}
                    </div>
                ) : (
                    <div style={{ padding:'72px 20px', textAlign:'center', border:`2px dashed ${THEME.glassBorder}`, borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
                        <div style={{ width:60, height:60, borderRadius:14, background:`${THEME.primary}10`, border:`1px solid ${THEME.primary}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <GitBranch size={26} color={`${THEME.primary}50`}/>
                        </div>
                        <div>
                            <div style={{ fontSize:15.5, fontWeight:700, color:THEME.textMuted, marginBottom:6 }}>
                                {search?`No repos matching "${search}"`:'No repositories connected'}
                            </div>
                            <div style={{ fontSize:12.5, color:THEME.textDim, marginBottom:20 }}>
                                {search?'Try a different term':'Connect GitHub, GitLab, Bitbucket, or a local repository'}
                            </div>
                        </div>
                        {!search && (
                            <div style={{ display:'flex', gap:10 }}>
                                <button onClick={()=>setShowAdd(true)} className="r8-btn r8-btn-p"><Plus size={13}/> Add Remote</button>
                                <button onClick={()=>setShowAdd(true)} className="r8-btn r8-btn-c"><HardDrive size={13}/> Connect Local</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    /* ── REPO BROWSER ── */
    const isLocal = activeRepo?.type==='local';

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100vh', padding:'0 28px 24px' }}>
            <RepoStyles/>

            {/* Breadcrumb */}
            <div style={{ paddingTop:14, paddingBottom:14, display:'flex', alignItems:'center', gap:10, flexShrink:0, flexWrap:'wrap' }}>
                <button onClick={()=>setView('repos')} style={{ background:'transparent', border:'none', color:THEME.textDim, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:5, padding:'5px 8px', borderRadius:7 }}
                        onMouseEnter={e=>e.currentTarget.style.background=THEME.glass}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <ChevronLeft size={13}/> Repositories
                </button>
                <ChevronRight size={11} color={THEME.textDim}/>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {isLocal?<HardDrive size={13} color={THEME.info}/>:<GitBranch size={13} color={THEME.primary}/>}
                    <span style={{ fontWeight:800, color:THEME.textMain, fontSize:14 }}>{activeRepo?.name}</span>
                </div>
                {isLocal && activeRepo?.url && (
                    <span style={{ fontSize:10.5, color:THEME.textDim, fontFamily:'JetBrains Mono,monospace', background:THEME.glass, padding:'3px 8px', borderRadius:5, border:`1px solid ${THEME.glassBorder}` }}>
                        {activeRepo.url}
                    </span>
                )}
                <StatusBadge label={isLocal?'LOCAL':'CONNECTED'} color={isLocal?THEME.info:THEME.success} pulse={!isLocal} size="sm"/>
            </div>

            {/* Sub-nav */}
            <div style={{ display:'flex', gap:4, padding:4, background:THEME.glass, border:`1px solid ${THEME.glassBorder}`, borderRadius:10, marginBottom:14, width:'fit-content', flexShrink:0 }}>
                {NAV_TABS.map(tab=>(
                    <button key={tab.id} onClick={()=>setSubView(tab.id)} className={`r8-tab${subView===tab.id?' r8-tab-on':''}`} style={{
                        display:'flex', alignItems:'center', gap:7, padding:'8px 15px', borderRadius:8, border:'none', cursor:'pointer',
                        background:subView===tab.id?`linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`:'transparent',
                        color:subView===tab.id?'#fff':THEME.textDim, fontSize:12, fontWeight:700,
                        boxShadow:subView===tab.id?`0 3px 12px ${THEME.primary}28`:'none',
                    }}>
                        <tab.icon size={12} color={subView===tab.id?'#fff':THEME.textDim}/>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ flex:1, minHeight:0, overflow:'hidden' }}>
                {subView==='code'     && <CodeView/>}
                {subView==='cicd'     && <Panel title="CI/CD Pipelines" icon={RocketIcon}><CICDView/></Panel>}
                {subView==='prs'      && <Panel title="Pull Request Analysis" icon={GitPullRequest}><PullRequestView/></Panel>}
                {subView==='db'       && <Panel title="Database & Migrations" icon={Database}><DatabaseView/></Panel>}
                {subView==='insights' && <InsightsView/>}
            </div>
        </div>
    );
};

export default RepositoryTab;