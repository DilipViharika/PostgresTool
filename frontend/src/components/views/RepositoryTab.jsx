// ==========================================================================
//  VIGIL — RepositoryTab  (v7 — COMPLETE + ENHANCED INSIGHTS)
// ==========================================================================
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { GlassCard } from '../ui/SharedComponents.jsx';
import { postData } from '../../utils/api';
import {
    GitBranch, FolderOpen, File, FileCode, FileJson, FileText,
    Plus, Trash2, Search, X, Copy, Check, ChevronRight, ChevronDown,
    Code, Eye, Edit3, Save, Undo2, Settings, RefreshCw, ExternalLink,
    AlertTriangle, CheckCircle, XCircle, Info, Shield, Zap, Terminal,
    Clock, Layers, ArrowRight, ArrowLeft, Sparkles, Bug, Lightbulb,
    Lock, Unlock, Package, Globe, Star, MoreHorizontal, Play,
    Maximize2, Minimize2, Hash, Activity, Cpu, Braces, BookOpen,
    Puzzle, Wrench, Loader, BarChart3, TrendingUp, AlertCircle,
    CircleDot, Github, Gitlab, HardDrive, Cloud, Gauge, Target,
    GitMerge, GitPullRequest, GitCommit, Database, Server, History,
    Workflow, LineChart, StopCircle, PlayCircle, Users, Flame,
    Filter, SortAsc, Download, Upload, Bell, ChevronLeft, ChevronUp,
    TrendingDown, Minus, Calendar, Tag, MessageSquare, Award, Zap as ZapIcon
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const RepoStyles = () => (
    <style>{`
        @keyframes repoFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes repoPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes repoSpin { to { transform: rotate(360deg); } }
        @keyframes repoSlideRight { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes repoGlow { 0%, 100% { box-shadow: 0 0 8px ${THEME.ai}20; } 50% { box-shadow: 0 0 20px ${THEME.ai}40, 0 0 40px ${THEME.ai}15; } }
        @keyframes repoScaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes repoShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes progressFill { from { width: 0%; } to { width: var(--target-width); } }

        .repo-stagger > * { animation: repoFadeIn 0.4s ease-out both; }
        .repo-stagger > *:nth-child(1) { animation-delay: 0.00s; }
        .repo-stagger > *:nth-child(2) { animation-delay: 0.06s; }
        .repo-stagger > *:nth-child(3) { animation-delay: 0.12s; }
        .repo-stagger > *:nth-child(4) { animation-delay: 0.18s; }
        .repo-stagger > *:nth-child(5) { animation-delay: 0.24s; }

        .repo-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; position: relative; overflow: hidden; }
        .repo-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, ${THEME.primary}06, transparent); opacity: 0; transition: opacity 0.3s; border-radius: inherit; }
        .repo-card:hover::before { opacity: 1; }
        .repo-card:hover { border-color: ${THEME.primary}40 !important; transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.15), 0 0 0 1px ${THEME.primary}15; }

        .repo-tree-item { transition: all 0.15s; cursor: pointer; user-select: none; }
        .repo-tree-item:hover { background: ${THEME.primary}08 !important; }
        .repo-tree-item.selected { background: ${THEME.primary}12 !important; border-left: 2px solid ${THEME.primary} !important; }

        .repo-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .repo-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .repo-scrollbar::-webkit-scrollbar-thumb { background: ${THEME.primary}30; border-radius: 4px; }
        .repo-scrollbar::-webkit-scrollbar-thumb:hover { background: ${THEME.primary}60; }

        .git-timeline-item { position: relative; padding-left: 24px; }
        .git-timeline-item::before { content: ''; position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: ${THEME.grid}40; }
        .git-timeline-item:last-child::before { display: none; }
        .git-timeline-dot { position: absolute; left: 0; top: 6px; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 1; }

        .stat-card { transition: all 0.2s; }
        .stat-card:hover { transform: translateY(-2px); }

        .metric-bar { height: 6px; border-radius: 3px; background: ${THEME.grid}30; overflow: hidden; }
        .metric-fill { height: 100%; border-radius: 3px; animation: progressFill 1s ease-out both; }

        .insight-highlight { background: linear-gradient(135deg, ${THEME.primary}08, ${THEME.secondary}04); border: 1px solid ${THEME.primary}20; border-radius: 10px; padding: 14px 16px; }

        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: ${THEME.primary}10 !important; color: ${THEME.textMain} !important; }

        .code-line:hover { background: ${THEME.primary}08 !important; }
        .shimmer { background: linear-gradient(90deg, ${THEME.surface} 25%, ${THEME.grid}20 50%, ${THEME.surface} 75%); background-size: 200% 100%; animation: repoShimmer 1.5s infinite; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const MOCK_FILE_TREE = [
    { id: 'src', name: 'src', type: 'folder', children: [
            { id: 'api', name: 'api', type: 'folder', children: [
                    { id: 'users.js', name: 'users.js', type: 'file', lang: 'js', issues: 2, lines: 148 },
                    { id: 'auth.ts', name: 'auth.ts', type: 'file', lang: 'ts', issues: 0, lines: 92 },
                ]},
            { id: 'services', name: 'services', type: 'folder', children: [
                    { id: 'billing.py', name: 'billing.py', type: 'file', lang: 'py', issues: 1, lines: 204 },
                    { id: 'notify.js', name: 'notify.js', type: 'file', lang: 'js', issues: 0, lines: 67 },
                ]},
            { id: 'models', name: 'models', type: 'folder', children: [
                    { id: 'Product.ts', name: 'Product.ts', type: 'file', lang: 'ts', issues: 0, lines: 55 },
                    { id: 'User.ts', name: 'User.ts', type: 'file', lang: 'ts', issues: 1, lines: 78 },
                ]},
        ]},
    { id: 'tests', name: 'tests', type: 'folder', children: [
            { id: 'api.test.js', name: 'api.test.js', type: 'file', lang: 'js', issues: 0, lines: 210 },
        ]},
    { id: 'package.json', name: 'package.json', type: 'file', lang: 'json', issues: 0, lines: 34 },
    { id: 'README.md', name: 'README.md', type: 'file', lang: 'md', issues: 0, lines: 88 },
];

const MOCK_FILE_CONTENT = {
    'users.js': `// User API Handler
import { db } from '../db/connection';
import { cache } from '../utils/cache';

// ⚠️ Issue: N+1 query detected on line 18
export async function getUsers(filters = {}) {
  const users = await db.query(
    'SELECT * FROM users WHERE active = $1', 
    [filters.active ?? true]
  );
  
  // ⚠️ Issue: Missing index on orders.user_id
  for (const user of users) {
    user.orders = await db.query(
      'SELECT * FROM orders WHERE user_id = $1',
      [user.id]
    );
  }
  
  return users;
}

export async function getUserById(id) {
  const cached = await cache.get(\`user:\${id}\`);
  if (cached) return cached;
  
  const user = await db.query(
    'SELECT * FROM users WHERE id = $1', [id]
  );
  await cache.set(\`user:\${id}\`, user, 300);
  return user;
}`,
    'auth.ts': `import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface TokenPayload {
  userId: string;
  role: 'admin' | 'user' | 'viewer';
  iat?: number;
  exp?: number;
}

export async function signIn(email: string, password: string) {
  const user = await db.findOne({ email });
  if (!user) throw new Error('Invalid credentials');
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');
  
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}`,
    'billing.py': `# Billing Service
import stripe
from datetime import datetime
from models import Subscription

# ⚠️ Issue: Missing transaction rollback on failure
def process_subscription(user_id: str, plan: str):
    customer = stripe.Customer.create(email=get_user_email(user_id))
    sub = stripe.Subscription.create(
        customer=customer.id,
        items=[{'price': PLAN_PRICES[plan]}],
    )
    
    # This could fail without rolling back Stripe subscription
    Subscription.create(user_id=user_id, stripe_id=sub.id)
    return sub`,
};

const generateDeployments = () => [
    { id: 'd-104', version: 'v2.4.0', time: '10 min ago', status: 'success', branch: 'main', author: 'Sarah J.', latency: '45ms', impact: 'positive', duration: '3m 40s', commit: 'a1b2c3d' },
    { id: 'd-103', version: 'v2.3.9', time: '4 hours ago', status: 'failed', branch: 'main', author: 'Mike T.', latency: '120ms', impact: 'negative', duration: '5m 12s', commit: 'f4e5d6c', failReason: 'DB migration timeout' },
    { id: 'd-102', version: 'v2.3.8', time: '1 day ago', status: 'success', branch: 'main', author: 'Sarah J.', latency: '42ms', impact: 'positive', duration: '3m 58s', commit: 'b7c8d9e' },
    { id: 'd-101', version: 'v2.3.7', time: '3 days ago', status: 'success', branch: 'staging', author: 'Bot', latency: '46ms', impact: 'neutral', duration: '4m 02s', commit: '1a2b3c4' },
];

const generatePRs = () => [
    { id: 405, title: 'Optimize User Query Performance', author: 'dev-alex', status: 'open', impact: 'positive', score: 92, tests: 'passed', files: 4, additions: 128, deletions: 45, reviewers: ['sarah-j', 'mike-t'] },
    { id: 404, title: 'Add Subscription Migration', author: 'sarah-sql', status: 'review', impact: 'risk', score: 45, tests: 'failed', files: 12, additions: 340, deletions: 12, reviewers: ['dev-alex'] },
    { id: 402, title: 'Update Dependencies', author: 'dependabot', status: 'merged', impact: 'neutral', score: 100, tests: 'passed', files: 1, additions: 48, deletions: 48, reviewers: [] },
    { id: 401, title: 'Refactor Auth Middleware', author: 'mike-t', status: 'open', impact: 'neutral', score: 78, tests: 'passed', files: 6, additions: 92, deletions: 110, reviewers: ['sarah-j'] },
];

const generateMigrations = () => [
    { id: 'm-20240219', name: 'create_audit_logs', type: 'CREATE', risk: 'low', date: '2024-02-19', status: 'pending', size: 'Small', rows: null },
    { id: 'm-20240215', name: 'alter_users_add_column', type: 'ALTER', risk: 'medium', date: '2024-02-15', status: 'applied', size: 'Medium', rows: '~2.4M' },
    { id: 'm-20240210', name: 'drop_legacy_tables', type: 'DROP', risk: 'high', date: '2024-02-10', status: 'applied', size: 'Large', rows: '~8.1M' },
    { id: 'm-20240201', name: 'add_index_orders_user_id', type: 'INDEX', risk: 'low', date: '2024-02-01', status: 'applied', size: 'Small', rows: '~8.1M' },
];

const generateInsightsData = () => ({
    codeHealth: 74,
    techDebt: [
        { file: 'src/api/users.js', issues: 2, type: 'N+1 Queries', severity: 'high', estimatedFix: '2h' },
        { file: 'src/services/billing.py', issues: 1, type: 'Missing Rollback', severity: 'critical', estimatedFix: '4h' },
        { file: 'src/models/User.ts', issues: 1, type: 'Missing Index', severity: 'medium', estimatedFix: '30m' },
    ],
    contributors: [
        { name: 'Sarah J.', commits: 47, additions: 4820, deletions: 1240, avatar: 'SJ' },
        { name: 'Mike T.', commits: 32, additions: 2100, deletions: 890, avatar: 'MT' },
        { name: 'dev-alex', commits: 28, additions: 3600, deletions: 2200, avatar: 'DA' },
        { name: 'sarah-sql', commits: 14, additions: 1800, deletions: 440, avatar: 'SS' },
    ],
    codeToQueryMap: [
        { file: 'src/api/users.js', query: 'SELECT * FROM users JOIN orders WHERE...', load: 'High', latency: '240ms', queryCount: 12 },
        { file: 'src/services/billing.py', query: 'UPDATE subscriptions SET status...', load: 'Medium', latency: '85ms', queryCount: 5 },
        { file: 'src/models/Product.ts', query: 'SELECT count(*) FROM products...', load: 'Low', latency: '12ms', queryCount: 2 },
    ],
    commitCorrelation: [
        { commit: 'a1b2c3d', message: 'Add user pagination', latencyDelta: -18, date: '2d ago' },
        { commit: 'f4e5d6c', message: 'Eager load orders', latencyDelta: +40, date: '4d ago' },
        { commit: 'b7c8d9e', message: 'Add DB index on user_id', latencyDelta: -35, date: '7d ago' },
        { commit: '1a2b3c4', message: 'Cache user queries', latencyDelta: -22, date: '12d ago' },
    ],
    activityHeatmap: Array.from({ length: 7 }, (_, day) => ({
        day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][day],
        commits: Math.floor(Math.random() * 15),
    })),
    packageRisks: [
        { name: 'lodash@4.17.11', risk: 'medium', reason: 'Known prototype pollution', cve: 'CVE-2019-10744' },
        { name: 'axios@0.21.1', risk: 'high', reason: 'SSRF vulnerability', cve: 'CVE-2021-3749' },
        { name: 'jsonwebtoken@8.5.1', risk: 'low', reason: 'Outdated by 3 versions', cve: null },
    ],
});

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════════ */
const Panel = ({ title, icon: TIcon, rightNode, noPad, children, style = {}, className = '' }) => (
    <div className={className} style={{
        background: THEME.glass,
        backdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: 16,
        display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)', ...style,
    }}>
        {title && (
            <div style={{
                padding: '14px 20px', borderBottom: `1px solid ${THEME.glassBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
                background: `linear-gradient(135deg, ${THEME.primary}04, transparent)`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {TIcon && <TIcon size={14} color={THEME.primary} />}
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.textMain, textTransform: 'uppercase', letterSpacing: '0.09em' }}>{title}</span>
                </div>
                {rightNode}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '16px 20px', overflowY: 'auto' }} className="repo-scrollbar">
            {children}
        </div>
    </div>
);

const StatusBadge = ({ label, color, pulse, size = 'md' }) => {
    const pad = size === 'sm' ? '3px 7px' : '4px 10px';
    const fs = size === 'sm' ? 9.5 : 10;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: fs, fontWeight: 700,
            padding: pad, borderRadius: 5, background: `${color}14`,
            color, border: `1px solid ${color}25`, lineHeight: 1.2, whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0, animation: pulse ? 'repoPulse 1.5s infinite' : 'none' }} />
            {label}
        </span>
    );
};

const RiskBadge = ({ risk }) => {
    const map = { critical: THEME.danger, high: THEME.danger, medium: THEME.warning, low: THEME.success };
    return <StatusBadge label={risk.toUpperCase()} color={map[risk] || THEME.textMuted} size="sm" />;
};

const Divider = ({ margin = '16px 0' }) => (
    <div style={{ height: 1, background: `${THEME.grid}30`, margin }} />
);

const SectionTitle = ({ children, icon: Icon, action }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {Icon && <Icon size={13} color={THEME.primary} />}
            <span style={{ fontSize: 11, fontWeight: 700, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.09em' }}>{children}</span>
        </div>
        {action}
    </div>
);

const MetricCard = ({ label, value, icon: Icon, color, subtext, trend }) => (
    <div className="stat-card" style={{
        padding: 16, borderRadius: 12,
        background: `${color}08`, border: `1px solid ${color}20`,
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <span style={{ fontSize: 10.5, color: THEME.textDim, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.07em' }}>{label}</span>
            {Icon && <Icon size={14} color={color} />}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        {(subtext || trend !== undefined) && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                {trend !== undefined && (
                    trend > 0
                        ? <TrendingUp size={11} color={THEME.success} />
                        : trend < 0
                            ? <TrendingDown size={11} color={THEME.danger} />
                            : <Minus size={11} color={THEME.textDim} />
                )}
                {subtext && <span style={{ fontSize: 10.5, color: THEME.textDim }}>{subtext}</span>}
            </div>
        )}
    </div>
);

const ProgressBar = ({ value, max = 100, color = THEME.primary, height = 6 }) => (
    <div style={{ height, borderRadius: height / 2, background: `${THEME.grid}30`, overflow: 'hidden' }}>
        <div style={{
            height: '100%', borderRadius: height / 2,
            width: `${(value / max) * 100}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            transition: 'width 1s ease',
        }} />
    </div>
);

const Avatar = ({ initials, color = THEME.primary }) => (
    <div style={{
        width: 28, height: 28, borderRadius: '50%', background: `${color}20`,
        border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 9.5, fontWeight: 800, color,
        flexShrink: 0,
    }}>{initials}</div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ROCKET ICON (SVG)
   ═══════════════════════════════════════════════════════════════════════════ */
const RocketIcon = ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FILE TREE
   ═══════════════════════════════════════════════════════════════════════════ */
const getFileIcon = (lang) => {
    const map = { js: FileCode, ts: FileCode, py: FileCode, json: FileJson, md: FileText };
    return map[lang] || File;
};

const FileTreeNode = ({ node, depth = 0, selectedId, onSelect }) => {
    const [open, setOpen] = useState(depth < 1);

    if (node.type === 'folder') {
        return (
            <div>
                <div
                    className="repo-tree-item"
                    onClick={() => setOpen(o => !o)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: `5px 12px 5px ${12 + depth * 14}px` }}
                >
                    {open ? <ChevronDown size={11} color={THEME.textDim} /> : <ChevronRight size={11} color={THEME.textDim} />}
                    {open ? <FolderOpen size={13} color={THEME.warning} /> : <FolderOpen size={13} color={THEME.textDim} />}
                    <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 500 }}>{node.name}</span>
                </div>
                {open && node.children?.map(child => (
                    <FileTreeNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
                ))}
            </div>
        );
    }

    const Icon = getFileIcon(node.lang);
    const isSelected = selectedId === node.id;
    return (
        <div
            className={`repo-tree-item${isSelected ? ' selected' : ''}`}
            onClick={() => onSelect(node)}
            style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: `5px 12px 5px ${12 + depth * 14}px`,
                borderLeft: isSelected ? `2px solid ${THEME.primary}` : '2px solid transparent',
                background: isSelected ? `${THEME.primary}10` : 'transparent',
            }}
        >
            <Icon size={12} color={isSelected ? THEME.primary : THEME.textDim} />
            <span style={{ fontSize: 11.5, color: isSelected ? THEME.primary : THEME.textMuted, flex: 1 }}>{node.name}</span>
            {node.issues > 0 && (
                <span style={{ fontSize: 9, fontWeight: 700, background: `${THEME.danger}20`, color: THEME.danger, padding: '1px 5px', borderRadius: 4 }}>{node.issues}</span>
            )}
        </div>
    );
};

const FileTree = ({ onSelect, selectedId }) => (
    <div style={{ paddingTop: 8 }}>
        {MOCK_FILE_TREE.map(node => (
            <FileTreeNode key={node.id} node={node} selectedId={selectedId} onSelect={onSelect} />
        ))}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   CODE VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const CodeView = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSelect = (node) => {
        setSelectedFile(node);
        setContent(MOCK_FILE_CONTENT[node.name] || `// ${node.name}\n// No preview available`);
        setIsEditing(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const lines = content.split('\n');

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, height: '100%' }}>
            <Panel title="Files" icon={FolderOpen} noPad>
                <FileTree onSelect={handleSelect} selectedId={selectedFile?.id} />
            </Panel>

            <Panel
                title={selectedFile ? selectedFile.name : 'Editor'}
                icon={Code}
                noPad
                rightNode={selectedFile && (
                    <div style={{ display: 'flex', gap: 6 }}>
                        {selectedFile.issues > 0 && (
                            <StatusBadge label={`${selectedFile.issues} Issue${selectedFile.issues > 1 ? 's' : ''}`} color={THEME.danger} size="sm" />
                        )}
                        <button onClick={handleCopy} style={{ padding: '5px 10px', background: 'transparent', border: `1px solid ${THEME.grid}50`, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: THEME.textDim }}>
                            {copied ? <Check size={11} color={THEME.success} /> : <Copy size={11} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                        <button onClick={() => setIsEditing(e => !e)} style={{ padding: '5px 10px', background: isEditing ? `${THEME.primary}15` : 'transparent', border: `1px solid ${isEditing ? THEME.primary + '40' : THEME.grid + '50'}`, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: isEditing ? THEME.primary : THEME.textDim }}>
                            {isEditing ? <><Save size={11} /> Save</> : <><Edit3 size={11} /> Edit</>}
                        </button>
                    </div>
                )}
            >
                {!selectedFile ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: THEME.textDim }}>
                        <Code size={36} color={`${THEME.textDim}40`} />
                        <span style={{ fontSize: 13 }}>Select a file to view</span>
                    </div>
                ) : isEditing ? (
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        style={{
                            width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none',
                            color: THEME.textMuted, fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.7,
                            resize: 'none', padding: '16px 20px', boxSizing: 'border-box',
                        }}
                    />
                ) : (
                    <div style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.7 }}>
                        {lines.map((line, i) => {
                            const isIssue = line.includes('⚠️');
                            return (
                                <div
                                    key={i}
                                    className="code-line"
                                    style={{
                                        display: 'flex', gap: 0, padding: '0 20px',
                                        background: isIssue ? `${THEME.danger}08` : 'transparent',
                                        borderLeft: isIssue ? `2px solid ${THEME.danger}60` : '2px solid transparent',
                                    }}
                                >
                                    <span style={{ color: `${THEME.textDim}50`, width: 32, flexShrink: 0, userSelect: 'none', fontSize: 11 }}>{i + 1}</span>
                                    <span style={{ color: isIssue ? THEME.warning : THEME.textMuted }}>{line}</span>
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
    const deployments = generateDeployments();
    const [expandedId, setExpandedId] = useState(null);

    return (
        <div>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }} className="repo-stagger">
                <MetricCard label="Success Rate" value="98.5%" icon={CheckCircle} color={THEME.success} subtext="Last 30 days" trend={1} />
                <MetricCard label="Avg Build Time" value="4m 12s" icon={Clock} color={THEME.primary} subtext="-18s vs last week" trend={1} />
                <MetricCard label="Active Pipelines" value="3" icon={Workflow} color={THEME.info} subtext="2 queued" />
                <MetricCard label="Rollbacks" value="1" icon={Undo2} color={THEME.warning} subtext="This month" trend={0} />
            </div>

            <SectionTitle icon={RocketIcon}>Deployment History</SectionTitle>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {deployments.map((deploy, i) => {
                    const isExpanded = expandedId === deploy.id;
                    const statusColor = deploy.status === 'success' ? THEME.success : THEME.danger;

                    return (
                        <div key={i} style={{ borderRadius: 10, border: `1px solid ${THEME.glassBorder}`, overflow: 'hidden', background: THEME.surface }}>
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : deploy.id)}
                                style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}60` }} />
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                            <span style={{ fontSize: 13.5, fontWeight: 700, color: THEME.textMain }}>{deploy.version}</span>
                                            <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: 'monospace', background: `${THEME.grid}40`, padding: '1px 6px', borderRadius: 4 }}>
                                                {deploy.branch}
                                            </span>
                                            <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: 'monospace' }}>{deploy.commit}</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: THEME.textDim }}>
                                            {deploy.time} · by <b style={{ color: THEME.textMuted }}>{deploy.author}</b> · {deploy.duration}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: deploy.latency > '100ms' ? THEME.danger : THEME.success }}>
                                        {deploy.latency}
                                    </span>
                                    <StatusBadge label={deploy.status.toUpperCase()} color={statusColor} size="sm" />
                                    {deploy.status === 'failed' && (
                                        <button style={{ padding: '5px 10px', background: `${THEME.danger}12`, color: THEME.danger, border: `1px solid ${THEME.danger}30`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Undo2 size={11} /> Rollback
                                        </button>
                                    )}
                                    {isExpanded ? <ChevronUp size={14} color={THEME.textDim} /> : <ChevronDown size={14} color={THEME.textDim} />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${THEME.grid}20`, paddingTop: 12 }}>
                                    {deploy.failReason && (
                                        <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: `${THEME.danger}10`, borderRadius: 8, marginBottom: 10 }}>
                                            <AlertTriangle size={13} color={THEME.danger} style={{ flexShrink: 0, marginTop: 1 }} />
                                            <span style={{ fontSize: 11.5, color: THEME.danger, fontWeight: 600 }}>Failure reason: {deploy.failReason}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                                        {[
                                            { label: 'Tests', value: 'Passed', color: THEME.success },
                                            { label: 'Build', value: 'Completed', color: deploy.status === 'success' ? THEME.success : THEME.danger },
                                            { label: 'Deploy', value: deploy.status === 'success' ? 'Live' : 'Failed', color: deploy.status === 'success' ? THEME.success : THEME.danger },
                                        ].map((step, si) => (
                                            <div key={si} style={{ padding: '8px 12px', borderRadius: 6, background: `${step.color}08`, border: `1px solid ${step.color}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 11, color: THEME.textDim }}>{step.label}</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: step.color }}>{step.value}</span>
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
    const prs = generatePRs();
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? prs : prs.filter(p => p.status === filter);

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
                <MetricCard label="Open PRs" value={prs.filter(p => p.status === 'open').length} icon={GitPullRequest} color={THEME.success} />
                <MetricCard label="In Review" value={prs.filter(p => p.status === 'review').length} icon={Eye} color={THEME.warning} />
                <MetricCard label="Merged" value={prs.filter(p => p.status === 'merged').length} icon={GitMerge} color={THEME.primary} />
                <MetricCard label="Avg Score" value={`${Math.round(prs.reduce((a,b) => a + b.score, 0) / prs.length)}/100`} icon={Gauge} color={THEME.info} />
            </div>

            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {['all', 'open', 'review', 'merged'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '5px 12px', borderRadius: 6, border: `1px solid ${filter === f ? THEME.primary + '40' : THEME.grid + '50'}`,
                        background: filter === f ? `${THEME.primary}14` : 'transparent',
                        color: filter === f ? THEME.primary : THEME.textDim, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map((pr, i) => {
                    const statusColors = { open: THEME.success, review: THEME.warning, merged: THEME.primary };
                    const sc = statusColors[pr.status] || THEME.textMuted;
                    return (
                        <div key={i} className="repo-card" style={{
                            padding: 16, borderRadius: 10, border: `1px solid ${THEME.glassBorder}`,
                            background: THEME.surface,
                        }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <GitPullRequest size={16} color={sc} style={{ flexShrink: 0, marginTop: 2 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <div>
                                            <span style={{ fontSize: 13.5, fontWeight: 700, color: THEME.textMain }}>{pr.title}</span>
                                            <span style={{ fontSize: 11, color: THEME.textDim, marginLeft: 6 }}>#{pr.id}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <StatusBadge label={pr.status.toUpperCase()} color={sc} size="sm" />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, color: THEME.textDim }}>by <b style={{ color: THEME.textMuted }}>{pr.author}</b></span>
                                        <span style={{ fontSize: 11, color: THEME.success }}>+{pr.additions}</span>
                                        <span style={{ fontSize: 11, color: THEME.danger }}>-{pr.deletions}</span>
                                        <span style={{ fontSize: 11, color: THEME.textDim }}>{pr.files} files</span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: pr.tests === 'passed' ? THEME.success : THEME.danger }} />
                                            <span style={{ fontSize: 11, color: THEME.textDim }}>Tests {pr.tests}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Activity size={11} color={pr.impact === 'positive' ? THEME.success : pr.impact === 'risk' ? THEME.danger : THEME.textMuted} />
                                            <span style={{ fontSize: 11, color: pr.impact === 'positive' ? THEME.success : pr.impact === 'risk' ? THEME.danger : THEME.textMuted }}>
                                                {pr.impact === 'positive' ? 'Perf improved' : pr.impact === 'risk' ? 'Perf risk' : 'No impact'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Gauge size={11} color={pr.score > 80 ? THEME.success : THEME.warning} />
                                            <span style={{ fontSize: 11, color: THEME.textDim }}>Score {pr.score}/100</span>
                                        </div>
                                    </div>

                                    {/* Score bar */}
                                    <div style={{ marginTop: 10 }}>
                                        <ProgressBar value={pr.score} color={pr.score > 80 ? THEME.success : pr.score > 50 ? THEME.warning : THEME.danger} height={4} />
                                    </div>
                                </div>

                                <button style={{ alignSelf: 'center', padding: '6px 12px', background: 'transparent', border: `1px solid ${THEME.grid}60`, borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: THEME.textDim }}>
                                    View
                                </button>
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
    const migrations = generateMigrations();
    const [sql, setSql] = useState('');
    const [analysis, setAnalysis] = useState(null);

    const analyzeMigration = useCallback(() => {
        const upper = sql.toUpperCase();
        let risk = 'LOW', message = 'Standard or additive operation. Safe to run.';
        if (upper.includes('DROP TABLE') || upper.includes('TRUNCATE')) { risk = 'CRITICAL'; message = 'Destructive operation. Irreversible data loss possible.'; }
        else if (upper.includes('DROP') || upper.includes('ALTER')) { risk = 'HIGH'; message = 'Modifies existing schema. Ensure rollback plan exists.'; }
        else if (upper.includes('UPDATE') || upper.includes('DELETE')) { risk = 'MEDIUM'; message = 'Bulk data mutation. Test on staging first.'; }
        setAnalysis({ risk, message });
    }, [sql]);

    const riskColor = { CRITICAL: THEME.danger, HIGH: THEME.danger, MEDIUM: THEME.warning, LOW: THEME.success };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <MetricCard label="Applied" value={migrations.filter(m => m.status === 'applied').length} icon={CheckCircle} color={THEME.success} />
                <MetricCard label="Pending" value={migrations.filter(m => m.status === 'pending').length} icon={Clock} color={THEME.warning} pulse />
                <MetricCard label="High Risk" value={migrations.filter(m => m.risk === 'high').length} icon={AlertTriangle} color={THEME.danger} />
            </div>

            {/* Risk Tool */}
            <div style={{ padding: 16, borderRadius: 12, background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}>
                <SectionTitle icon={Shield}>Migration Risk Assessment</SectionTitle>
                <div style={{ display: 'flex', gap: 10 }}>
                    <textarea
                        value={sql} onChange={e => setSql(e.target.value)}
                        placeholder="Paste migration SQL here to assess risk…"
                        style={{
                            flex: 1, background: THEME.surface, border: `1px solid ${THEME.grid}40`, borderRadius: 8,
                            padding: '10px 12px', color: THEME.textMuted, fontSize: 11.5, fontFamily: 'monospace',
                            resize: 'none', height: 68, outline: 'none',
                        }}
                    />
                    <button onClick={analyzeMigration} style={{
                        padding: '0 20px', background: `${THEME.primary}15`, color: THEME.primary,
                        border: `1px solid ${THEME.primary}30`, borderRadius: 8, cursor: 'pointer',
                        fontWeight: 700, fontSize: 12, flexShrink: 0,
                    }}>Analyze</button>
                </div>
                {analysis && (
                    <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: `${riskColor[analysis.risk]}10`, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        {analysis.risk === 'CRITICAL' || analysis.risk === 'HIGH'
                            ? <AlertTriangle size={13} color={riskColor[analysis.risk]} style={{ marginTop: 1 }} />
                            : <CheckCircle size={13} color={riskColor[analysis.risk]} style={{ marginTop: 1 }} />}
                        <div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: riskColor[analysis.risk] }}>Risk: {analysis.risk}</div>
                            <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 2 }}>{analysis.message}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Migration History Table */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="repo-scrollbar">
                <SectionTitle icon={History}>Schema History</SectionTitle>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                    <thead>
                    <tr style={{ color: THEME.textDim, borderBottom: `1px solid ${THEME.grid}40` }}>
                        {['Migration', 'Type', 'Risk', 'Rows Affected', 'Date', 'Status'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {migrations.map((m, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${THEME.grid}15`, transition: 'background 0.15s' }}>
                            <td style={{ padding: '10px', fontFamily: 'monospace', color: THEME.textMuted }}>{m.name}</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, background: `${THEME.primary}12`, color: THEME.primary, padding: '2px 6px', borderRadius: 4 }}>{m.type}</span>
                            </td>
                            <td style={{ padding: '10px' }}><RiskBadge risk={m.risk} /></td>
                            <td style={{ padding: '10px', color: THEME.textDim, fontFamily: 'monospace', fontSize: 11 }}>{m.rows || '—'}</td>
                            <td style={{ padding: '10px', color: THEME.textDim }}>{m.date}</td>
                            <td style={{ padding: '10px' }}>
                                <StatusBadge
                                    label={m.status.toUpperCase()}
                                    color={m.status === 'applied' ? THEME.success : THEME.warning}
                                    pulse={m.status === 'pending'}
                                    size="sm"
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   INSIGHTS VIEW — GREATLY ENHANCED
   ═══════════════════════════════════════════════════════════════════════════ */
const InsightsView = () => {
    const data = useMemo(() => generateInsightsData(), []);
    const [activeInsight, setActiveInsight] = useState('health');

    const insightTabs = [
        { id: 'health', label: 'Code Health', icon: Activity },
        { id: 'query', label: 'Code → Query', icon: Database },
        { id: 'commits', label: 'Commit Impact', icon: GitCommit },
        { id: 'contributors', label: 'Contributors', icon: Users },
        { id: 'packages', label: 'Pkg Risks', icon: Package },
    ];

    const healthColor = data.codeHealth >= 80 ? THEME.success : data.codeHealth >= 60 ? THEME.warning : THEME.danger;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
            {/* Top Summary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }} className="repo-stagger">
                <MetricCard label="Code Health" value={`${data.codeHealth}/100`} icon={Activity} color={healthColor} subtext="3 issues open" trend={-1} />
                <MetricCard label="Tech Debt" value={`${data.techDebt.reduce((a,b)=>a+b.issues,0)} Issues`} icon={Wrench} color={THEME.warning} subtext="~6.5h to fix" />
                <MetricCard label="Dependencies" value={data.packageRisks.length} icon={Package} color={THEME.info} subtext={`${data.packageRisks.filter(p=>p.risk==='high').length} high risk`} />
                <MetricCard label="Contributors" value={data.contributors.length} icon={Users} color={THEME.primary} subtext="Last 30 days" />
                <MetricCard label="Commits" value={data.contributors.reduce((a,b)=>a+b.commits,0)} icon={GitCommit} color={THEME.secondary} subtext="This month" trend={1} />
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: 4, padding: '4px', background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 10, width: 'fit-content' }}>
                {insightTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveInsight(tab.id)} className="tab-btn" style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                        background: activeInsight === tab.id ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})` : 'transparent',
                        color: activeInsight === tab.id ? '#fff' : THEME.textDim,
                        fontSize: 11.5, fontWeight: 700, transition: 'all 0.2s',
                        boxShadow: activeInsight === tab.id ? `0 3px 10px ${THEME.primary}30` : 'none',
                    }}>
                        <tab.icon size={12} color={activeInsight === tab.id ? '#fff' : THEME.textDim} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Insight Content */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }} className="repo-scrollbar">

                {/* HEALTH TAB */}
                {activeInsight === 'health' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '100%' }}>
                        <Panel title="Tech Debt Tracker" icon={Wrench}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, borderRadius: 10, background: `${healthColor}08`, border: `1px solid ${healthColor}20` }}>
                                <div style={{ fontSize: 42, fontWeight: 900, color: healthColor }}>{data.codeHealth}</div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>Code Health Score</div>
                                    <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 2 }}>Based on issues, coverage & complexity</div>
                                    <div style={{ marginTop: 8 }}>
                                        <ProgressBar value={data.codeHealth} color={healthColor} height={6} />
                                    </div>
                                </div>
                            </div>

                            {data.techDebt.map((issue, i) => (
                                <div key={i} style={{ marginBottom: 10, padding: 14, borderRadius: 10, border: `1px solid ${THEME.glassBorder}`, background: THEME.surface }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, fontFamily: 'monospace', marginBottom: 2 }}>{issue.file}</div>
                                            <div style={{ fontSize: 11.5, color: THEME.textMuted }}>{issue.type}</div>
                                        </div>
                                        <RiskBadge risk={issue.severity} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                        <span style={{ fontSize: 10.5, color: THEME.textDim }}>
                                            <b style={{ color: THEME.textMuted }}>{issue.issues}</b> issue{issue.issues > 1 ? 's' : ''}
                                        </span>
                                        <span style={{ fontSize: 10.5, color: THEME.textDim }}>
                                            Est. fix: <b style={{ color: THEME.textMuted }}>{issue.estimatedFix}</b>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </Panel>

                        <Panel title="Activity Heatmap" icon={BarChart3}>
                            <div style={{ marginBottom: 20 }}>
                                <SectionTitle>Commits Per Day (This Week)</SectionTitle>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
                                    {data.activityHeatmap.map((d, i) => (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <div style={{ height: 60, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                                                <div style={{
                                                    width: '100%', borderRadius: '4px 4px 0 0',
                                                    height: `${Math.max(4, (d.commits / 15) * 100)}%`,
                                                    background: `linear-gradient(180deg, ${THEME.primary}, ${THEME.primary}70)`,
                                                    transition: 'height 1s ease',
                                                    title: `${d.commits} commits`,
                                                }} />
                                            </div>
                                            <span style={{ fontSize: 9.5, color: THEME.textDim }}>{d.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Divider />

                            <SectionTitle>Health Breakdown</SectionTitle>
                            {[
                                { label: 'Test Coverage', value: 78, color: THEME.success },
                                { label: 'Documentation', value: 55, color: THEME.warning },
                                { label: 'Code Complexity', value: 68, color: THEME.primary },
                                { label: 'Security Score', value: 82, color: THEME.info },
                            ].map((item, i) => (
                                <div key={i} style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <span style={{ fontSize: 11.5, color: THEME.textMuted }}>{item.label}</span>
                                        <span style={{ fontSize: 11.5, fontWeight: 700, color: item.color }}>{item.value}%</span>
                                    </div>
                                    <ProgressBar value={item.value} color={item.color} height={5} />
                                </div>
                            ))}
                        </Panel>
                    </div>
                )}

                {/* CODE → QUERY TAB */}
                {activeInsight === 'query' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '100%' }}>
                        <Panel title="File → Query Mapping" icon={Database}>
                            <p style={{ fontSize: 11, color: THEME.textDim, marginBottom: 16 }}>
                                Files generating the most database load, ranked by latency.
                            </p>
                            {data.codeToQueryMap.map((item, i) => (
                                <div key={i} style={{ marginBottom: 14, padding: 14, borderRadius: 10, background: THEME.surface, border: `1px solid ${THEME.glassBorder}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, fontFamily: 'monospace' }}>{item.file}</span>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <StatusBadge label={`${item.load} Load`} color={item.load === 'High' ? THEME.danger : item.load === 'Medium' ? THEME.warning : THEME.success} size="sm" />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 10.5, color: THEME.textDim, fontFamily: 'monospace', background: `${THEME.grid}20`, padding: '8px 10px', borderRadius: 6, marginBottom: 8 }}>
                                        {item.query}
                                    </div>
                                    <div style={{ display: 'flex', gap: 14 }}>
                                        <span style={{ fontSize: 11, color: THEME.textDim }}>Avg latency: <b style={{ color: item.load === 'High' ? THEME.danger : THEME.textMuted }}>{item.latency}</b></span>
                                        <span style={{ fontSize: 11, color: THEME.textDim }}>Queries/min: <b style={{ color: THEME.textMuted }}>{item.queryCount}</b></span>
                                    </div>
                                </div>
                            ))}
                        </Panel>

                        <Panel title="Optimization Suggestions" icon={Lightbulb}>
                            {[
                                {
                                    title: 'Fix N+1 in users.js',
                                    desc: 'Replace per-user order queries with a single JOIN. Estimated 90% latency reduction.',
                                    impact: 'Critical',
                                    color: THEME.danger,
                                    icon: Zap,
                                },
                                {
                                    title: 'Add index on orders.user_id',
                                    desc: 'Missing index causes full table scans. A B-tree index will cut scan time significantly.',
                                    impact: 'High',
                                    color: THEME.warning,
                                    icon: TrendingUp,
                                },
                                {
                                    title: 'Cache product counts',
                                    desc: 'COUNT(*) queries run every request. Cache result for 30s to reduce DB load.',
                                    impact: 'Medium',
                                    color: THEME.primary,
                                    icon: Sparkles,
                                },
                            ].map((s, i) => (
                                <div key={i} style={{ marginBottom: 12, padding: 14, borderRadius: 10, background: `${s.color}06`, border: `1px solid ${s.color}18` }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <s.icon size={13} color={s.color} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain }}>{s.title}</span>
                                                <StatusBadge label={s.impact} color={s.color} size="sm" />
                                            </div>
                                            <p style={{ fontSize: 11, color: THEME.textDim, margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Panel>
                    </div>
                )}

                {/* COMMIT IMPACT TAB */}
                {activeInsight === 'commits' && (
                    <Panel title="Commit → Latency Correlation" icon={GitCommit} style={{ height: 'auto' }}>
                        <p style={{ fontSize: 11, color: THEME.textDim, marginBottom: 18 }}>
                            Tracks how each commit affected average query latency in production. Positive delta = regression, negative = improvement.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.commitCorrelation.map((c, i) => {
                                const isGood = c.latencyDelta < 0;
                                const color = isGood ? THEME.success : THEME.danger;
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, background: THEME.surface, border: `1px solid ${color}20` }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 8, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {isGood ? <TrendingDown size={16} color={color} /> : <TrendingUp size={16} color={color} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: THEME.primary, background: `${THEME.primary}12`, padding: '2px 7px', borderRadius: 4 }}>{c.commit}</span>
                                                    <span style={{ fontSize: 12.5, fontWeight: 600, color: THEME.textMain }}>{c.message}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <span style={{ fontSize: 13, fontWeight: 800, color }}>{c.latencyDelta > 0 ? '+' : ''}{c.latencyDelta}ms</span>
                                                    <span style={{ fontSize: 10.5, color: THEME.textDim }}>{c.date}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <div style={{ flex: 1, height: 4, borderRadius: 2, background: `${THEME.grid}30`, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${Math.abs(c.latencyDelta) / 50 * 100}%`, background: color, borderRadius: 2 }} />
                                                </div>
                                                <span style={{ fontSize: 10, color: THEME.textDim, minWidth: 80, textAlign: 'right' }}>
                                                    {isGood ? 'Improvement' : 'Regression'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>
                )}

                {/* CONTRIBUTORS TAB */}
                {activeInsight === 'contributors' && (
                    <Panel title="Team Activity" icon={Users} style={{ height: 'auto' }}>
                        <p style={{ fontSize: 11, color: THEME.textDim, marginBottom: 18 }}>Contributor breakdown for this repository over the last 30 days.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.contributors.map((c, i) => {
                                const colors = [THEME.primary, THEME.success, THEME.secondary, THEME.info];
                                const color = colors[i % colors.length];
                                const totalCommits = data.contributors.reduce((a, b) => a + b.commits, 0);
                                return (
                                    <div key={i} style={{ padding: '14px 16px', borderRadius: 10, background: THEME.surface, border: `1px solid ${THEME.glassBorder}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                            <Avatar initials={c.avatar} color={color} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>{c.name}</span>
                                                    <span style={{ fontSize: 11.5, fontWeight: 700, color }}>{c.commits} commits</span>
                                                </div>
                                                <div style={{ marginTop: 6 }}>
                                                    <ProgressBar value={c.commits} max={totalCommits} color={color} height={4} />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <span style={{ fontSize: 11, color: THEME.success }}>+{c.additions.toLocaleString()} additions</span>
                                            <span style={{ fontSize: 11, color: THEME.danger }}>-{c.deletions.toLocaleString()} deletions</span>
                                            <span style={{ fontSize: 11, color: THEME.textDim }}>Net: {(c.additions - c.deletions) > 0 ? '+' : ''}{(c.additions - c.deletions).toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>
                )}

                {/* PACKAGES TAB */}
                {activeInsight === 'packages' && (
                    <Panel title="Dependency Risk Audit" icon={Package} style={{ height: 'auto' }}>
                        <div style={{ padding: 14, borderRadius: 10, background: `${THEME.warning}08`, border: `1px solid ${THEME.warning}20`, marginBottom: 18, display: 'flex', gap: 10 }}>
                            <AlertTriangle size={14} color={THEME.warning} style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <div style={{ fontSize: 12.5, fontWeight: 700, color: THEME.warning, marginBottom: 4 }}>
                                    {data.packageRisks.filter(p => p.risk !== 'low').length} packages require attention
                                </div>
                                <div style={{ fontSize: 11, color: THEME.textDim }}>
                                    Known CVEs detected in your dependency tree. Update or patch as soon as possible.
                                </div>
                            </div>
                        </div>

                        {data.packageRisks.map((pkg, i) => (
                            <div key={i} style={{ marginBottom: 10, padding: 14, borderRadius: 10, background: THEME.surface, border: `1px solid ${THEME.glassBorder}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <div>
                                        <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.primary, fontFamily: 'monospace' }}>{pkg.name}</span>
                                        {pkg.cve && (
                                            <span style={{ marginLeft: 8, fontSize: 10, color: THEME.danger, background: `${THEME.danger}12`, padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace' }}>
                                                {pkg.cve}
                                            </span>
                                        )}
                                    </div>
                                    <RiskBadge risk={pkg.risk} />
                                </div>
                                <p style={{ fontSize: 11, color: THEME.textDim, margin: '0 0 10px' }}>{pkg.reason}</p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button style={{ padding: '5px 12px', background: `${THEME.primary}12`, color: THEME.primary, border: `1px solid ${THEME.primary}25`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                        Update Package
                                    </button>
                                    <button style={{ padding: '5px 12px', background: 'transparent', color: THEME.textDim, border: `1px solid ${THEME.grid}50`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                        View Advisory
                                    </button>
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
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const RepositoryTab = () => {
    const [view, setView]             = useState('repos');
    const [repos, setRepos]           = useState([]);
    const [activeRepo, setActiveRepo] = useState(null);
    const [subView, setSubView]       = useState('code');
    const [showAddRepo, setShowAddRepo] = useState(false);
    const [newRepoUrl, setNewRepoUrl] = useState('');
    const [repoType, setRepoType]     = useState('github');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('vigil_repos');
            if (saved) setRepos(JSON.parse(saved));
        } catch {}
    }, []);

    useEffect(() => {
        try { localStorage.setItem('vigil_repos', JSON.stringify(repos)); } catch {}
    }, [repos]);

    const handleAddRepo = useCallback(() => {
        if (!newRepoUrl.trim()) return;
        const name = newRepoUrl.split('/').pop().replace(/\.git$/, '') || 'unnamed-repo';
        setRepos(prev => [{
            id: Date.now(), name, url: newRepoUrl, type: repoType,
            branch: 'main', lang: 'JavaScript', lastCommit: 'Just now',
        }, ...prev]);
        setShowAddRepo(false);
        setNewRepoUrl('');
    }, [newRepoUrl, repoType]);

    const handleDeleteRepo = useCallback((id, e) => {
        e.stopPropagation();
        setRepos(prev => prev.filter(r => r.id !== id));
    }, []);

    const openRepo = useCallback((repo) => {
        setActiveRepo(repo);
        setView('browser');
        setSubView('code');
    }, []);

    const NAV_TABS = [
        { id: 'code', label: 'Code', icon: Code },
        { id: 'cicd', label: 'CI/CD', icon: RocketIcon },
        { id: 'prs', label: 'Pull Requests', icon: GitPullRequest },
        { id: 'db', label: 'Database', icon: Database },
        { id: 'insights', label: 'Insights', icon: Activity },
    ];

    const RepoNavigation = () => (
        <div style={{ display: 'flex', gap: 4, padding: '4px', background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 10, margin: '0 0 16px', width: 'fit-content' }}>
            {NAV_TABS.map(tab => (
                <button key={tab.id} onClick={() => setSubView(tab.id)} className="tab-btn" style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8,
                    border: 'none', cursor: 'pointer',
                    background: subView === tab.id ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})` : 'transparent',
                    color: subView === tab.id ? '#fff' : THEME.textDim,
                    fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                    boxShadow: subView === tab.id ? `0 4px 12px ${THEME.primary}30` : 'none',
                }}>
                    <tab.icon size={13} color={subView === tab.id ? '#fff' : THEME.textDim} />
                    {tab.label}
                </button>
            ))}
        </div>
    );

    // ── REPO LIST ──
    if (view === 'repos') {
        return (
            <div style={{ padding: '0 28px 48px' }}>
                <RepoStyles />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 24px' }}>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: THEME.textMain, margin: 0 }}>Repositories</h2>
                        <div style={{ fontSize: 13, color: THEME.textDim, marginTop: 4 }}>Manage connected codebases</div>
                    </div>
                    <button onClick={() => setShowAddRepo(true)} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                        background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
                        color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer',
                        boxShadow: `0 4px 14px ${THEME.primary}30`,
                    }}>
                        <Plus size={15} /> Add Repository
                    </button>
                </div>

                {showAddRepo && (
                    <div style={{ marginBottom: 22, padding: 18, borderRadius: 14, background: THEME.glass, border: `1px solid ${THEME.glassBorder}` }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textDim, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Connect Repository</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {/* Provider tabs */}
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                {[{ id: 'github', icon: Github }, { id: 'gitlab', icon: Gitlab }].map(p => (
                                    <button key={p.id} onClick={() => setRepoType(p.id)} style={{
                                        padding: '10px', background: repoType === p.id ? `${THEME.primary}14` : 'transparent',
                                        border: `1px solid ${repoType === p.id ? THEME.primary + '40' : THEME.grid + '50'}`,
                                        borderRadius: 8, cursor: 'pointer',
                                    }}>
                                        <p.icon size={16} color={repoType === p.id ? THEME.primary : THEME.textDim} />
                                    </button>
                                ))}
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: THEME.surface, border: `1px solid ${THEME.grid}40`, borderRadius: 8, padding: '0 12px' }}>
                                <Globe size={14} color={THEME.textDim} />
                                <input
                                    value={newRepoUrl}
                                    onChange={e => setNewRepoUrl(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddRepo()}
                                    placeholder="https://github.com/username/repo-name"
                                    style={{ flex: 1, background: 'transparent', border: 'none', padding: '11px 10px', color: THEME.textMain, outline: 'none', fontSize: 13 }}
                                />
                            </div>
                            <button onClick={handleAddRepo} style={{ padding: '0 22px', background: THEME.primary, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                                Connect
                            </button>
                            <button onClick={() => setShowAddRepo(false)} style={{ padding: '0 12px', background: 'transparent', border: `1px solid ${THEME.grid}50`, borderRadius: 8, cursor: 'pointer' }}>
                                <X size={15} color={THEME.textDim} />
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }} className="repo-stagger">
                    {repos.map(repo => (
                        <div key={repo.id} className="repo-card" onClick={() => openRepo(repo)} style={{
                            padding: 22, borderRadius: 14, background: THEME.glass, border: `1px solid ${THEME.glassBorder}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${THEME.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <GitBranch size={18} color={THEME.primary} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: THEME.textMain }}>{repo.name}</div>
                                        <div style={{ fontSize: 10.5, color: THEME.textDim, fontFamily: 'monospace', marginTop: 1 }}>{repo.branch}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={e => handleDeleteRepo(repo.id, e)}
                                    style={{ padding: 6, background: 'transparent', border: `1px solid transparent`, borderRadius: 6, cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                >
                                    <Trash2 size={13} color={THEME.danger} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                                <StatusBadge label={repo.type.toUpperCase()} color={THEME.primary} size="sm" />
                                <StatusBadge label="Active" color={THEME.success} pulse size="sm" />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: THEME.textDim, borderTop: `1px solid ${THEME.grid}25`, paddingTop: 12 }}>
                                <span>{repo.lastCommit}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ArrowRight size={11} />
                                    <span>Open</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {repos.length === 0 && (
                        <div style={{ gridColumn: '1/-1', padding: 60, textAlign: 'center', color: THEME.textDim, border: `2px dashed ${THEME.grid}30`, borderRadius: 16 }}>
                            <GitBranch size={32} color={`${THEME.textDim}40`} style={{ marginBottom: 12 }} />
                            <div style={{ fontSize: 14, fontWeight: 600, color: THEME.textMuted, marginBottom: 6 }}>No repositories connected</div>
                            <div style={{ fontSize: 12 }}>Click "Add Repository" to get started</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── REPO BROWSER ──
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0 28px 24px' }}>
            <RepoStyles />

            {/* Breadcrumb */}
            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                    onClick={() => setView('repos')}
                    style={{ background: 'transparent', border: 'none', color: THEME.textDim, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                    <ChevronLeft size={14} /> Repositories
                </button>
                <ChevronRight size={12} color={THEME.textDim} />
                <span style={{ fontWeight: 700, color: THEME.textMain, fontSize: 13 }}>{activeRepo?.name}</span>
                <StatusBadge label="CONNECTED" color={THEME.success} pulse size="sm" />
            </div>

            <RepoNavigation />

            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {subView === 'code' && <CodeView />}
                {subView === 'cicd' && (
                    <Panel title="CI/CD Pipelines & Deployments" icon={RocketIcon}>
                        <CICDView />
                    </Panel>
                )}
                {subView === 'prs' && (
                    <Panel title="Pull Request Analysis" icon={GitPullRequest}>
                        <PullRequestView />
                    </Panel>
                )}
                {subView === 'db' && (
                    <Panel title="Database & Migrations" icon={Database}>
                        <DatabaseView />
                    </Panel>
                )}
                {subView === 'insights' && <InsightsView />}
            </div>
        </div>
    );
};

export default RepositoryTab;