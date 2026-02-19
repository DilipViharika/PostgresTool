// ==========================================================================
//  VIGIL — RepositoryTab  (v5 — COMPLETE FIXED VERSION)
// ==========================================================================
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { THEME } from '../../utils/theme.jsx';
import FeedbackModal from './FeedbackModal.jsx';
import { GlassCard } from '../ui/SharedComponents.jsx';
import { postData } from '../../utils/api';
import {
    GitBranch, FolderOpen, FolderClosed, File, FileCode, FileJson,
    FileText, FilePlus, Plus, Trash2, Search, X, Copy, Check,
    ChevronRight, ChevronDown, Code, Eye, Edit3, Save, Undo2,
    Settings, RefreshCw, ExternalLink, Download, Upload,
    AlertTriangle, CheckCircle, XCircle, Info, Shield, Zap,
    Terminal, Clock, Layers, ArrowRight, ArrowLeft, Sparkles,
    Bug, Lightbulb, Lock, Unlock, Package, Globe, Star,
    MoreHorizontal, Play, Maximize2, Minimize2, Hash,
    Activity, Cpu, Braces, BookOpen, Puzzle, Wrench,
    Loader, BarChart3, TrendingUp, AlertCircle, CircleDot,
    Github, Gitlab, HardDrive, Cloud, Gauge, Target, Zap as ZapIcon
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const RepoStyles = () => (
    <style>{`
        @keyframes repoFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes repoPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.4; }
        }
        @keyframes repoSpin {
            to { transform: rotate(360deg); }
        }
        @keyframes repoShimmer {
            0%   { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        @keyframes repoSlideRight {
            from { opacity: 0; transform: translateX(-14px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes repoGlow {
            0%, 100% { box-shadow: 0 0 8px ${THEME.ai}20; }
            50%      { box-shadow: 0 0 20px ${THEME.ai}40, 0 0 40px ${THEME.ai}15; }
        }
        @keyframes repoScaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to   { opacity: 1; transform: scale(1); }
        }
        @keyframes repoFloatUp {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-4px); }
        }
        @keyframes repoGradientShift {
            0%, 100% { background-position: 0% 50%; }
            50%      { background-position: 100% 50%; }
        }
        @keyframes repoBorderGlow {
            0%, 100% { border-color: ${THEME.primary}30; }
            50%      { border-color: ${THEME.primary}60; }
        }
        
        .repo-stagger > * { animation: repoFadeIn 0.4s ease-out both; }
        .repo-stagger > *:nth-child(1) { animation-delay: 0.00s; }
        .repo-stagger > *:nth-child(2) { animation-delay: 0.06s; }
        .repo-stagger > *:nth-child(3) { animation-delay: 0.12s; }
        .repo-stagger > *:nth-child(4) { animation-delay: 0.18s; }
        .repo-stagger > *:nth-child(5) { animation-delay: 0.24s; }
        
        .repo-card { 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            cursor: pointer; 
            position: relative;
            overflow: hidden;
        }
        .repo-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, ${THEME.primary}05, ${THEME.secondary}05);
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        }
        .repo-card:hover::before {
            opacity: 1;
        }
        .repo-card:hover { 
            border-color: ${THEME.glassBorderHover} !important; 
            transform: translateY(-4px) scale(1.02); 
            box-shadow: 0 12px 40px ${THEME.primary}15, 0 0 0 1px ${THEME.primary}10;
        }
        
        .repo-row-hover { transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
        .repo-row-hover:hover { 
            background: linear-gradient(90deg, ${THEME.primary}08, ${THEME.primary}04) !important;
            transform: translateX(2px);
        }
        
        .repo-tree-item { 
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); 
            cursor: pointer; 
            user-select: none; 
            position: relative;
        }
        .repo-tree-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: ${THEME.primary};
            opacity: 0;
            transition: opacity 0.2s;
        }
        .repo-tree-item:hover::before {
            opacity: 1;
        }
        .repo-tree-item:hover { 
            background: linear-gradient(90deg, ${THEME.primary}10, ${THEME.primary}05) !important;
            transform: translateX(3px);
        }
        
        .repo-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .repo-scrollbar::-webkit-scrollbar-track { 
            background: ${THEME.surface}40; 
            border-radius: 4px;
        }
        .repo-scrollbar::-webkit-scrollbar-thumb { 
            background: linear-gradient(180deg, ${THEME.primary}40, ${THEME.primary}60);
            border-radius: 4px; 
            border: 2px solid transparent;
            background-clip: padding-box;
        }
        .repo-scrollbar::-webkit-scrollbar-thumb:hover { 
            background: linear-gradient(180deg, ${THEME.primary}60, ${THEME.primary}80);
            background-clip: padding-box;
        }
        
        .repo-editor-area { 
            caret-color: ${THEME.primary}; 
            resize: none; 
        }
        .repo-editor-area::selection { 
            background: ${THEME.primary}30; 
        }
        .repo-editor-area:focus { 
            outline: none; 
        }
        
        .repo-analysis-item { 
            animation: repoSlideRight 0.3s ease both; 
            transition: all 0.2s;
        }
        .repo-analysis-item:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px ${THEME.primary}10;
        }
        
        .repo-type-btn { 
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
            position: relative;
            overflow: hidden;
        }
        .repo-type-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.5s;
        }
        .repo-type-btn:hover::before {
            left: 100%;
        }
        .repo-type-btn:hover { 
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        
        .repo-metric-card {
            transition: all 0.3s;
            position: relative;
        }
        .repo-metric-card:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 16px ${THEME.primary}15;
        }
        
        .repo-gradient-text {
            background: linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .repo-glass-intense {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
        }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const Panel = ({ title, icon: TIcon, rightNode, noPad, children, style = {}, className = '' }) => (
    <div className={className} style={{
        background: THEME.glass, 
        backdropFilter: 'blur(20px) saturate(180%)', 
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${THEME.glassBorder}`, 
        borderRadius: 18,
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        height: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        ...style,
    }}>
        {title && (
            <div style={{
                padding: '15px 22px', 
                borderBottom: `1px solid ${THEME.glassBorder}`,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexShrink: 0, 
                minHeight: 50,
                background: `linear-gradient(135deg, ${THEME.primary}03, ${THEME.secondary}02)`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {TIcon && (
                        <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${THEME.primary}15, ${THEME.secondary}10)`,
                            border: `1px solid ${THEME.primary}20`,
                        }}>
                            <TIcon size={14} color={THEME.primary} />
                        </div>
                    )}
                    <span style={{ 
                        fontSize: 12.5, 
                        fontWeight: 700, 
                        color: THEME.textMain, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em' 
                    }}>{title}</span>
                </div>
                {rightNode}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, padding: noPad ? 0 : '18px 22px', position: 'relative' }}>
            {children}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const StatusBadge = ({ label, color, pulse, icon: BIcon }) => (
    <span style={{
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 6,
        fontSize: 10, 
        fontWeight: 700, 
        padding: '4px 10px', 
        borderRadius: 6,
        background: `linear-gradient(135deg, ${color}15, ${color}08)`, 
        color, 
        border: `1px solid ${color}25`,
        lineHeight: 1.2, 
        whiteSpace: 'nowrap',
        boxShadow: `0 2px 8px ${color}10`,
    }}>
        {BIcon ? <BIcon size={10} /> : (
            <span style={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                background: color, 
                boxShadow: `0 0 6px ${color}80`, 
                flexShrink: 0, 
                animation: pulse ? 'repoPulse 1.5s ease-in-out infinite' : 'none' 
            }} />
        )}
        {label}
    </span>
);

const IconBtn = ({ icon: Icon, label, onClick, color = THEME.textMuted, active, disabled, gradient }) => (
    <button onClick={onClick} disabled={disabled} title={label} style={{
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 7,
        padding: label ? '7px 14px' : '7px 10px', 
        borderRadius: 8, 
        border: active ? `1px solid ${color}30` : `1px solid transparent`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: gradient 
            ? `linear-gradient(135deg, ${THEME.ai}, ${THEME.secondary})` 
            : active 
                ? `linear-gradient(135deg, ${color}18, ${color}10)` 
                : 'rgba(255,255,255,0.04)',
        color: gradient ? '#fff' : active ? color : THEME.textDim,
        fontSize: 11.5, 
        fontWeight: 600, 
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled ? 0.35 : 1,
        boxShadow: gradient ? `0 4px 16px ${THEME.ai}30` : active ? `0 2px 8px ${color}15` : 'none',
    }}>
        <Icon size={13} />
        {label && <span>{label}</span>}
    </button>
);

const Spinner = ({ size = 16, color = THEME.primary }) => (
    <div style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        border: `2.5px solid ${color}20`, 
        borderTopColor: color, 
        animation: 'repoSpin 0.6s linear infinite', 
        flexShrink: 0 
    }} />
);

/* ═══════════════════════════════════════════════════════════════════════════
   REPOSITORY TYPE CONFIGS
   ═══════════════════════════════════════════════════════════════════════════ */
const REPO_TYPES = {
    github: {
        label: 'GitHub',
        icon: Github,
        color: '#333',
        placeholder: 'https://github.com/username/repository',
        pattern: /github\.com/
    },
    gitlab: {
        label: 'GitLab',
        icon: Gitlab,
        color: '#FC6D26',
        placeholder: 'https://gitlab.com/username/repository',
        pattern: /gitlab\.com/
    },
    bitbucket: {
        label: 'Bitbucket',
        icon: Package,
        color: '#0052CC',
        placeholder: 'https://bitbucket.org/username/repository',
        pattern: /bitbucket\.org/
    },
    azure: {
        label: 'Azure DevOps',
        icon: Cloud,
        color: '#0078D4',
        placeholder: 'https://dev.azure.com/org/project/_git/repo',
        pattern: /dev\.azure\.com|visualstudio\.com/
    },
    gitea: {
        label: 'Gitea',
        icon: GitBranch,
        color: '#609926',
        placeholder: 'https://gitea.example.com/username/repository',
        pattern: /gitea/
    },
    local: {
        label: 'Local Folder',
        icon: HardDrive,
        color: '#8B5CF6',
        placeholder: 'Select local directory or enter path',
        pattern: null
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   GITHUB API HELPER
   ═══════════════════════════════════════════════════════════════════════════ */
const fetchGitHubTree = async (repoUrl) => {
    try {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) throw new Error('Invalid GitHub URL');

        const [, owner, repo] = match;
        const cleanRepo = repo.replace(/\.git$/, '');

        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`);
        if (!repoRes.ok) throw new Error('Repository not found');
        const repoData = await repoRes.json();
        const defaultBranch = repoData.default_branch;

        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/${defaultBranch}?recursive=1`);
        if (!treeRes.ok) throw new Error('Failed to fetch repository tree');
        const treeData = await treeRes.json();

        const buildTree = (items) => {
            const tree = [];
            const pathMap = {};

            items.forEach(item => {
                const parts = item.path.split('/');
                const name = parts[parts.length - 1];

                const node = {
                    id: item.path,
                    name: name,
                    type: item.type === 'tree' ? 'dir' : 'file',
                    sha: item.sha,
                    url: item.url,
                    children: item.type === 'tree' ? [] : undefined
                };

                pathMap[item.path] = node;

                if (parts.length === 1) {
                    tree.push(node);
                } else {
                    const parentPath = parts.slice(0, -1).join('/');
                    const parent = pathMap[parentPath];
                    if (parent && parent.children) {
                        parent.children.push(node);
                    }
                }
            });

            return tree;
        };

        return {
            tree: buildTree(treeData.tree),
            branch: defaultBranch,
            files: treeData.tree.filter(i => i.type === 'blob').length,
            owner,
            repo: cleanRepo
        };
    } catch (err) {
        console.error('Error fetching GitHub tree:', err);
        throw err;
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   SYNTAX HIGHLIGHTING
   ═══════════════════════════════════════════════════════════════════════════ */
const TOKEN_COLORS = {
    keyword:     THEME.secondary,
    string:      THEME.success,
    comment:     THEME.textDim,
    number:      THEME.warning,
    function:    THEME.primary,
    type:        THEME.cyan,
    operator:    THEME.textMuted,
    punctuation: THEME.textDim,
    decorator:   THEME.orange,
    tag:         THEME.danger,
    attribute:   THEME.warning,
    property:    THEME.primaryLight,
    constant:    THEME.warningLight,
    default:     THEME.textMuted,
};

const JS_KEYWORDS = new Set([
    'const','let','var','function','return','if','else','for','while','do','switch',
    'case','break','continue','new','this','class','extends','import','export',
    'default','from','async','await','try','catch','finally','throw','typeof',
    'instanceof','in','of','delete','void','yield','static','get','set','super',
    'true','false','null','undefined','NaN','Infinity',
]);

const PY_KEYWORDS = new Set([
    'def','class','return','if','elif','else','for','while','break','continue',
    'import','from','as','try','except','finally','raise','with','yield','lambda',
    'pass','del','global','nonlocal','assert','True','False','None','and','or',
    'not','in','is','async','await','self','print',
]);

const SQL_KEYWORDS = new Set([
    'SELECT','FROM','WHERE','INSERT','UPDATE','DELETE','CREATE','DROP','ALTER',
    'TABLE','INDEX','INTO','VALUES','SET','JOIN','LEFT','RIGHT','INNER','OUTER',
    'ON','AND','OR','NOT','NULL','IS','AS','ORDER','BY','GROUP','HAVING','LIMIT',
    'OFFSET','DISTINCT','COUNT','SUM','AVG','MAX','MIN','BETWEEN','LIKE','IN',
    'EXISTS','UNION','ALL','PRIMARY','KEY','FOREIGN','REFERENCES','CASCADE',
    'BEGIN','COMMIT','ROLLBACK','GRANT','REVOKE','EXPLAIN','ANALYZE','VACUUM',
]);

const getKeywords = (lang) => {
    if (lang === 'python' || lang === 'py') return PY_KEYWORDS;
    if (lang === 'sql') return SQL_KEYWORDS;
    return JS_KEYWORDS;
};

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const highlightCode = (code, lang = 'javascript') => {
    if (!code) return '';
    const keywords = getKeywords(lang);
    const isSql = lang === 'sql';
    const isPy = lang === 'python' || lang === 'py';
    const lines = code.split('\n');
    let inBlockComment = false;

    return lines.map(line => {
        let result = '';
        let i = 0;
        const len = line.length;

        while (i < len) {
            if (inBlockComment) {
                const end = line.indexOf('*/', i);
                if (end === -1) { result += `<span style="color:${TOKEN_COLORS.comment}">${escapeHtml(line.slice(i))}</span>`; i = len; }
                else { result += `<span style="color:${TOKEN_COLORS.comment}">${escapeHtml(line.slice(i, end + 2))}</span>`; i = end + 2; inBlockComment = false; }
                continue;
            }
            if (!isSql && line[i] === '/' && line[i + 1] === '/') { result += `<span style="color:${TOKEN_COLORS.comment}">${escapeHtml(line.slice(i))}</span>`; break; }
            if (isPy && line[i] === '#') { result += `<span style="color:${TOKEN_COLORS.comment}">${escapeHtml(line.slice(i))}</span>`; break; }
            if (isSql && line[i] === '-' && line[i + 1] === '-') { result += `<span style="color:${TOKEN_COLORS.comment}">${escapeHtml(line.slice(i))}</span>`; break; }
            if (!isSql && !isPy && line[i] === '/' && line[i + 1] === '*') { inBlockComment = true; const end = line.indexOf('*/', i + 2); if (end === -1) { result += `<span style="color:${TOKEN_COLORS.comment}">${escapeHtml(line.slice(i))}</span>`; i = len; } else { result += `<span style="color:${TOKEN_COLORS.comment}">${escapeHtml(line.slice(i, end + 2))}</span>`; i = end + 2; inBlockComment = false; } continue; }
            if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
                const q = line[i]; let j = i + 1;
                while (j < len && line[j] !== q) { if (line[j] === '\\') j++; j++; }
                result += `<span style="color:${TOKEN_COLORS.string}">${escapeHtml(line.slice(i, j + 1))}</span>`;
                i = j + 1; continue;
            }
            if (/[0-9]/.test(line[i]) && (i === 0 || /[\s,([{=+\-*/<>!&|^~%:;]/.test(line[i - 1]))) {
                let j = i; while (j < len && /[0-9.xXa-fA-FeE_]/.test(line[j])) j++;
                result += `<span style="color:${TOKEN_COLORS.number}">${escapeHtml(line.slice(i, j))}</span>`;
                i = j; continue;
            }
            if (isPy && line[i] === '@') {
                let j = i + 1; while (j < len && /[a-zA-Z0-9_.]/.test(line[j])) j++;
                result += `<span style="color:${TOKEN_COLORS.decorator}">${escapeHtml(line.slice(i, j))}</span>`;
                i = j; continue;
            }
            if (/[a-zA-Z_$]/.test(line[i])) {
                let j = i; while (j < len && /[a-zA-Z0-9_$]/.test(line[j])) j++;
                const word = line.slice(i, j);
                const check = isSql ? word.toUpperCase() : word;
                if (keywords.has(check)) {
                    result += `<span style="color:${TOKEN_COLORS.keyword};font-weight:600">${escapeHtml(word)}</span>`;
                } else if (j < len && line[j] === '(') {
                    result += `<span style="color:${TOKEN_COLORS.function}">${escapeHtml(word)}</span>`;
                } else if (word[0] === word[0].toUpperCase() && /[A-Z]/.test(word[0])) {
                    result += `<span style="color:${TOKEN_COLORS.type}">${escapeHtml(word)}</span>`;
                } else if (['require', 'module', 'exports', 'console', 'process', 'Math', 'JSON', 'Object', 'Array', 'Promise', 'Error'].includes(word)) {
                    result += `<span style="color:${TOKEN_COLORS.type}">${escapeHtml(word)}</span>`;
                } else {
                    result += escapeHtml(word);
                }
                i = j; continue;
            }
            if (/[+\-*/%=<>!&|^~?:]/.test(line[i])) {
                result += `<span style="color:${TOKEN_COLORS.operator}">${escapeHtml(line[i])}</span>`;
                i++; continue;
            }
            if (/[{}()\[\];,.]/.test(line[i])) {
                result += `<span style="color:${TOKEN_COLORS.punctuation}">${escapeHtml(line[i])}</span>`;
                i++; continue;
            }
            result += escapeHtml(line[i]); i++;
        }
        return result;
    }).join('\n');
};

const detectLang = (filename) => {
    if (!filename) return 'javascript';
    const ext = filename.split('.').pop().toLowerCase();
    if (['js', 'jsx', 'ts', 'tsx', 'mjs'].includes(ext)) return 'javascript';
    if (['py', 'pyw'].includes(ext)) return 'python';
    if (ext === 'sql') return 'sql';
    if (ext === 'json') return 'javascript';
    if (ext === 'md' || ext === 'txt') return 'text';
    return 'javascript';
};

/* ═══════════════════════════════════════════════════════════════════════════
   FILE ICON HELPER
   ═══════════════════════════════════════════════════════════════════════════ */
const getFileIcon = (name, isDir) => {
    if (isDir) return FolderClosed;
    const ext = name.split('.').pop().toLowerCase();
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'go', 'rs'].includes(ext)) return FileCode;
    if (ext === 'json') return FileJson;
    if (['md', 'txt', 'yml', 'yaml', 'toml', 'env'].includes(ext)) return FileText;
    return File;
};

const getFileColor = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['js', 'jsx'].includes(ext)) return THEME.warning;
    if (['ts', 'tsx'].includes(ext)) return THEME.primary;
    if (['py'].includes(ext)) return THEME.success;
    if (ext === 'json') return THEME.warningLight;
    if (ext === 'sql') return THEME.cyan;
    if (['md', 'txt'].includes(ext)) return THEME.textMuted;
    return THEME.textDim;
};

/* ═══════════════════════════════════════════════════════════════════════════
   ADVANCED AI ANALYSIS ENGINE
   ═══════════════════════════════════════════════════════════════════════════ */

const calculateComplexity = (code) => {
    let complexity = 1;
    const controlFlow = ['if', 'else', 'elif', 'for', 'while', 'case', 'catch', '&&', '||', '?'];
    controlFlow.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b|\\${keyword}`, 'g');
        const matches = code.match(regex);
        if (matches) complexity += matches.length;
    });
    return complexity;
};

const analyzeCodeMetrics = (code, filename) => {
    const lines = code.split('\n');
    const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('#')).length;
    const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('#')).length;
    const blankLines = lines.filter(l => !l.trim()).length;
    
    const functionMatches = code.match(/function\s+\w+|def\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g);
    const functionCount = functionMatches ? functionMatches.length : 0;
    
    const complexity = calculateComplexity(code);
    
    return {
        totalLines: lines.length,
        codeLines,
        commentLines,
        blankLines,
        functionCount,
        complexity,
        commentRatio: codeLines > 0 ? (commentLines / codeLines * 100).toFixed(1) : 0
    };
};

const generateAdvancedAnalysis = (code, filename) => {
    const issues = [];
    const lines = code.split('\n');
    const metrics = analyzeCodeMetrics(code, filename);
    
    // ═══ SECURITY ANALYSIS ═══
    
    // Hardcoded secrets and credentials
    if (/SECRET\s*=\s*['"`]|API_KEY\s*=\s*['"`]|PASSWORD\s*=\s*['"`]/.test(code)) {
        const line = lines.findIndex(l => /SECRET\s*=\s*['"`]|API_KEY\s*=\s*['"`]|PASSWORD\s*=\s*['"`]/.test(l)) + 1;
        issues.push({
            severity: 'critical',
            line,
            title: '🔐 Hardcoded Secret/API Key Detected',
            description: 'Sensitive credentials are hardcoded in source code. This creates a severe security risk if the code is committed to version control or shared.',
            fix: `Move all secrets to environment variables:\n\n// ❌ Bad\nconst API_KEY = "sk_live_abc123xyz";\n\n// ✅ Good\nconst API_KEY = process.env.API_KEY;`,
            category: 'Security',
            impact: 'CRITICAL - Potential full system compromise',
            effort: 'Low - 10-15 minutes to refactor'
        });
    }
    
    // SQL Injection
    if (code.includes('.query(') && (code.includes('${') || code.includes('+ ') || code.includes('` +'))){
        const line = lines.findIndex(l => l.includes('.query(') && (l.includes('${') || l.includes('+'))) + 1;
        issues.push({
            severity: 'critical',
            line,
            title: '💉 SQL Injection Vulnerability',
            description: 'SQL queries are constructed using string interpolation. This allows attackers to inject malicious SQL code.',
            fix: `Use parameterized queries:\n\n// ❌ VULNERABLE\nconst query = \`SELECT * FROM users WHERE id = '\${userId}'\`;\n\n// ✅ SECURE\nconst query = 'SELECT * FROM users WHERE id = $1';\nawait db.query(query, [userId]);`,
            category: 'Security',
            impact: 'CRITICAL - Database breach, data theft',
            effort: 'Medium - 30-60 minutes'
        });
    }
    
    // Missing error handling
    if (!code.includes('try') && (code.includes('await') || code.includes('.then(') || code.includes('.query'))) {
        const line = lines.findIndex(l => (l.includes('await') || l.includes('.then(')) && !l.includes('try')) + 1;
        issues.push({
            severity: 'high',
            line: line || 1,
            title: '🔄 Missing Error Handling',
            description: 'Async operations lack try-catch blocks. Unhandled promise rejections can crash the application.',
            fix: `Add try-catch blocks:\n\ntry {\n  const data = await fetchData();\n  await processData(data);\n} catch (error) {\n  logger.error('Error:', error);\n  res.status(500).json({ error: 'Internal error' });\n}`,
            category: 'Reliability',
            impact: 'HIGH - Application crashes, resource leaks',
            effort: 'Medium - 1-2 hours'
        });
    }
    
    // High complexity
    if (metrics.complexity > 15) {
        issues.push({
            severity: 'warning',
            line: 0,
            title: '🔧 High Cyclomatic Complexity',
            description: `Code complexity score is ${metrics.complexity} (threshold: 15). High complexity makes code difficult to test and maintain.`,
            fix: `Refactor using early returns and extract helper functions:\n\n// Use guard clauses\nif (!user.verified) return;\nif (user.role === 'admin') return handleAdmin(user);\n\n// Extract complex logic\nfunction processUser(user) {\n  return strategies[user.role](user);\n}`,
            category: 'Code Quality',
            impact: 'MEDIUM - Harder to maintain',
            effort: 'High - 3-4 hours'
        });
    }
    
    // Low comment ratio
    if (metrics.commentRatio < 5 && metrics.codeLines > 50) {
        issues.push({
            severity: 'info',
            line: 0,
            title: '📝 Low Documentation Coverage',
            description: `Comment ratio is ${metrics.commentRatio}%. Complex logic should be documented for maintainability.`,
            fix: `Add JSDoc comments:\n\n/**\n * Calculate final price with discounts\n * @param {number} basePrice - Base price\n * @param {boolean} isPremium - Premium status\n * @returns {number} Final price\n */\nfunction calculatePrice(basePrice, isPremium) {\n  // Premium users get 5% off\n  return isPremium ? basePrice * 0.95 : basePrice;\n}`,
            category: 'Code Quality',
            impact: 'LOW - Harder to understand',
            effort: 'Low - 30-60 minutes'
        });
    }
    
    // Console logging
    if (code.includes('console.log') || code.includes('console.error')) {
        const line = lines.findIndex(l => /console\.(log|error)/.test(l)) + 1;
        issues.push({
            severity: 'info',
            line,
            title: '🔍 Console Logging Detected',
            description: 'Console statements lack context and are not suitable for production. Use a structured logger instead.',
            fix: `Use winston or similar:\n\nconst logger = winston.createLogger({\n  level: 'info',\n  format: winston.format.json()\n});\n\nlogger.info('User logged in', { userId, ip });`,
            category: 'Best Practice',
            impact: 'LOW - Harder to debug',
            effort: 'Low - 1 hour'
        });
    }
    
    // ═══ FINAL SCORE CALCULATION ═══
    
    const critCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    const warnCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;
    
    let score = 100;
    score -= critCount * 25;
    score -= highCount * 15;
    score -= warnCount * 8;
    score -= infoCount * 3;
    
    if (metrics.commentRatio > 15) score += 5;
    if (metrics.complexity < 10) score += 5;
    if (code.includes('try') && code.includes('catch')) score += 5;
    
    score = Math.max(0, Math.min(100, score));
    
    if (issues.length === 0) {
        issues.push({
            severity: 'info',
            line: 0,
            title: '✅ Excellent Code Quality',
            description: `This file demonstrates strong coding practices. No critical security vulnerabilities, proper error handling, and reasonable complexity (${metrics.complexity}).`,
            fix: `Continue following best practices:\n\n• Keep functions focused\n• Maintain complexity below 15\n• Add JSDoc comments\n• Write unit tests\n• Use TypeScript for type safety`,
            category: 'General',
            impact: 'N/A',
            effort: 'N/A'
        });
    }
    
    return {
        issues,
        score,
        metrics,
        summary: `Analyzed ${metrics.totalLines} lines (${metrics.codeLines} code, ${metrics.commentLines} comments). Found ${critCount} critical, ${highCount} high, ${warnCount} warning, ${infoCount} info issues. Complexity: ${metrics.complexity}.`,
        filename,
        recommendations: generateRecommendations(score, issues, metrics)
    };
};

const generateRecommendations = (score, issues, metrics) => {
    const recommendations = [];
    
    if (score < 50) {
        recommendations.push({
            priority: 'URGENT',
            text: 'Address all critical and high severity issues immediately.',
            icon: AlertTriangle
        });
    } else if (score < 70) {
        recommendations.push({
            priority: 'HIGH',
            text: 'Focus on fixing critical issues first.',
            icon: AlertCircle
        });
    } else if (score < 85) {
        recommendations.push({
            priority: 'MEDIUM',
            text: 'Good foundation. Address remaining warnings.',
            icon: Target
        });
    } else {
        recommendations.push({
            priority: 'LOW',
            text: 'Excellent work! Consider info-level suggestions.',
            icon: CheckCircle
        });
    }
    
    if (metrics.complexity > 20) {
        recommendations.push({
            priority: 'HIGH',
            text: 'Refactor complex functions for better testability.',
            icon: Wrench
        });
    }
    
    const hasSecurityIssues = issues.some(i => i.category === 'Security' && (i.severity === 'critical' || i.severity === 'high'));
    if (hasSecurityIssues) {
        recommendations.push({
            priority: 'URGENT',
            text: 'Schedule security code review immediately.',
            icon: Shield
        });
    }
    
    return recommendations;
};

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED FILE TREE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const FileTree = ({ nodes, onSelect, selectedFile, depth = 0 }) => {
    const [expanded, setExpanded] = useState({});

    const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

    return (
        <div>
            {nodes.map(node => {
                const isDir = node.type === 'dir';
                const isOpen = expanded[node.id];
                const isSelected = selectedFile === node.id;
                const FIcon = isDir ? (isOpen ? FolderOpen : FolderClosed) : getFileIcon(node.name, false);
                const fColor = isDir ? THEME.primary : getFileColor(node.name);

                return (
                    <div key={node.id}>
                        <div 
                            className="repo-tree-item" 
                            onClick={() => { if (isDir) toggle(node.id); else onSelect(node.id, node.name); }}
                            style={{
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 8,
                                padding: '6px 12px 6px ' + (14 + depth * 18) + 'px',
                                borderRadius: 7, 
                                margin: '2px 6px',
                                background: isSelected 
                                    ? `linear-gradient(90deg, ${THEME.primary}15, ${THEME.primary}08)` 
                                    : 'transparent',
                                borderLeft: isSelected ? `3px solid ${THEME.primary}` : '3px solid transparent',
                                boxShadow: isSelected ? `0 2px 8px ${THEME.primary}10` : 'none',
                            }}
                        >
                            {isDir && (
                                <ChevronRight 
                                    size={11} 
                                    color={THEME.primary} 
                                    style={{ 
                                        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                                        transform: isOpen ? 'rotate(90deg)' : 'none', 
                                        flexShrink: 0 
                                    }} 
                                />
                            )}
                            {!isDir && <span style={{ width: 11 }} />}
                            <FIcon size={14} color={fColor} style={{ flexShrink: 0 }} />
                            <span style={{ 
                                fontSize: 12.5, 
                                color: isSelected ? THEME.primary : THEME.textMuted, 
                                fontWeight: isSelected ? 700 : 500, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap' 
                            }}>{node.name}</span>
                        </div>
                        {isDir && isOpen && node.children && (
                            <FileTree nodes={node.children} onSelect={onSelect} selectedFile={selectedFile} depth={depth + 1} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED AI ANALYSIS PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const AnalysisPanel = ({ analysis, onClose, onGoToLine }) => {
    if (!analysis) return null;

    const severityConfig = {
        critical: { color: THEME.danger, icon: XCircle, label: 'CRITICAL' },
        high:     { color: THEME.orange, icon: AlertTriangle, label: 'HIGH' },
        warning:  { color: THEME.warning, icon: AlertCircle, label: 'WARNING' },
        info:     { color: THEME.info, icon: Info, label: 'INFO' },
    };

    const scoreColor = analysis.score >= 80 ? THEME.success : analysis.score >= 50 ? THEME.warning : THEME.danger;
    const scoreGrade = analysis.score >= 90 ? 'A+' : analysis.score >= 80 ? 'A' : analysis.score >= 70 ? 'B' : analysis.score >= 60 ? 'C' : analysis.score >= 50 ? 'D' : 'F';

    return (
        <div style={{
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            animation: 'repoSlideRight 0.3s ease',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px', 
                borderBottom: `1px solid ${THEME.glassBorder}`,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexShrink: 0,
                background: `linear-gradient(135deg, ${THEME.ai}08, ${THEME.secondary}05)`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 10, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: `linear-gradient(135deg, ${THEME.ai}, ${THEME.secondary})`,
                        boxShadow: `0 4px 16px ${THEME.ai}30`,
                    }}>
                        <Sparkles size={16} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>AI Code Analysis</div>
                        <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: 'monospace' }}>{analysis.filename}</div>
                    </div>
                </div>
                <button onClick={onClose} style={{ 
                    background: `${THEME.danger}10`, 
                    border: `1px solid ${THEME.danger}20`, 
                    borderRadius: 7,
                    cursor: 'pointer', 
                    padding: 6, 
                    display: 'flex',
                    transition: 'all 0.2s',
                }}>
                    <X size={14} color={THEME.danger} />
                </button>
            </div>

            {/* Score Section - Enhanced */}
            <div style={{ 
                padding: '18px 20px', 
                borderBottom: `1px solid ${THEME.glassBorder}`, 
                flexShrink: 0, 
                background: `linear-gradient(135deg, ${scoreColor}06, ${scoreColor}02)`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ 
                        fontSize: 11, 
                        fontWeight: 700, 
                        color: THEME.textDim, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.06em' 
                    }}>Quality Score</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            fontSize: 32,
                            fontWeight: 900,
                            background: `linear-gradient(135deg, ${scoreColor}, ${scoreColor}80)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontVariantNumeric: 'tabular-nums',
                        }}>{analysis.score}</div>
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: 8,
                            background: `linear-gradient(135deg, ${scoreColor}20, ${scoreColor}10)`,
                            border: `1px solid ${scoreColor}30`,
                        }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{scoreGrade}</span>
                            <span style={{ fontSize: 8, color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade</span>
                        </div>
                    </div>
                </div>
                
                {/* Progress Bar - Enhanced */}
                <div style={{ 
                    height: 8, 
                    borderRadius: 4, 
                    background: `${THEME.grid}40`, 
                    overflow: 'hidden', 
                    marginBottom: 14,
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <div style={{ 
                        width: `${analysis.score}%`, 
                        height: '100%', 
                        borderRadius: 4, 
                        background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}cc)`,
                        transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 0 12px ${scoreColor}40`,
                    }} />
                </div>
                
                {/* Metrics Grid - Enhanced */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                    {[
                        { label: 'Complexity', value: analysis.metrics.complexity, color: analysis.metrics.complexity > 15 ? THEME.warning : THEME.success, icon: Activity },
                        { label: 'Functions', value: analysis.metrics.functionCount, color: THEME.primary, icon: Braces },
                        { label: 'Comments', value: `${analysis.metrics.commentRatio}%`, color: THEME.info, icon: BookOpen },
                        { label: 'Issues', value: analysis.issues.length, color: THEME.textMain, icon: Bug },
                    ].map((metric, i) => {
                        const MetricIcon = metric.icon;
                        return (
                            <div key={i} className="repo-metric-card" style={{ 
                                padding: '10px 12px', 
                                borderRadius: 8, 
                                background: `linear-gradient(135deg, ${metric.color}08, ${metric.color}04)`,
                                border: `1px solid ${metric.color}15`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <MetricIcon size={11} color={metric.color} />
                                    <div style={{ fontSize: 9.5, color: THEME.textDim }}>{metric.label}</div>
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: metric.color }}>{metric.value}</div>
                            </div>
                        );
                    })}
                </div>
                
                <p style={{ 
                    fontSize: 10.5, 
                    color: THEME.textDim, 
                    lineHeight: 1.6, 
                    margin: '12px 0 0',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: THEME.surface,
                }}>{analysis.summary}</p>
            </div>

            {/* Recommendations - Enhanced */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div style={{ 
                    padding: '14px 20px', 
                    borderBottom: `1px solid ${THEME.glassBorder}`, 
                    flexShrink: 0 
                }}>
                    <div style={{ 
                        fontSize: 11, 
                        fontWeight: 700, 
                        color: THEME.textDim, 
                        marginBottom: 10, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.06em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}>
                        <Target size={12} color={THEME.primary} />
                        Recommendations
                    </div>
                    {analysis.recommendations.map((rec, i) => {
                        const RecIcon = rec.icon;
                        const priorityColor = rec.priority === 'URGENT' ? THEME.danger : rec.priority === 'HIGH' ? THEME.warning : rec.priority === 'MEDIUM' ? THEME.primary : THEME.info;
                        return (
                            <div key={i} style={{ 
                                display: 'flex', 
                                gap: 10, 
                                padding: '8px 10px', 
                                borderRadius: 8, 
                                background: `linear-gradient(135deg, ${priorityColor}08, ${priorityColor}03)`,
                                border: `1px solid ${priorityColor}15`,
                                marginBottom: 8,
                                transition: 'all 0.2s',
                            }}>
                                <div style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 7,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `${priorityColor}15`,
                                    flexShrink: 0,
                                }}>
                                    <RecIcon size={14} color={priorityColor} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontSize: 9.5, 
                                        fontWeight: 800, 
                                        color: priorityColor, 
                                        marginBottom: 3,
                                        letterSpacing: '0.04em',
                                    }}>{rec.priority}</div>
                                    <div style={{ fontSize: 11, color: THEME.textMuted, lineHeight: 1.5 }}>{rec.text}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Issues List - Enhanced */}
            <div className="repo-scrollbar" style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '12px 14px' 
            }}>
                {analysis.issues.map((issue, i) => {
                    const sev = severityConfig[issue.severity] || severityConfig.info;
                    const SevIcon = sev.icon;
                    return (
                        <div key={i} className="repo-analysis-item" style={{ 
                            marginBottom: 14, 
                            borderRadius: 12, 
                            border: `1px solid ${sev.color}20`, 
                            background: `linear-gradient(135deg, ${sev.color}06, ${sev.color}02)`,
                            overflow: 'hidden', 
                            animationDelay: `${i * 0.06}s`,
                            boxShadow: `0 2px 8px ${sev.color}08`,
                        }}>
                            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ 
                                    width: 28, 
                                    height: 28, 
                                    borderRadius: 8, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    background: `linear-gradient(135deg, ${sev.color}20, ${sev.color}10)`,
                                    border: `1px solid ${sev.color}25`,
                                    flexShrink: 0, 
                                    marginTop: 1,
                                    boxShadow: `0 2px 8px ${sev.color}15`,
                                }}>
                                    <SevIcon size={13} color={sev.color} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>
                                        {issue.title}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                                        <StatusBadge label={sev.label} color={sev.color} />
                                        {issue.line > 0 && (
                                            <button onClick={() => onGoToLine && onGoToLine(issue.line)} style={{
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: 4,
                                                fontSize: 10, 
                                                fontWeight: 700, 
                                                padding: '3px 8px', 
                                                borderRadius: 5,
                                                background: `linear-gradient(135deg, ${THEME.primary}15, ${THEME.primary}08)`,
                                                color: THEME.primary, 
                                                border: `1px solid ${THEME.primary}25`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}>
                                                <Hash size={9} />
                                                Line {issue.line}
                                            </button>
                                        )}
                                        <StatusBadge label={issue.category} color={THEME.textDim} />
                                    </div>
                                    <p style={{ 
                                        fontSize: 11.5, 
                                        color: THEME.textMuted, 
                                        lineHeight: 1.7, 
                                        margin: '0 0 10px' 
                                    }}>{issue.description}</p>
                                    
                                    {/* Impact & Effort - Enhanced */}
                                    {(issue.impact || issue.effort) && (
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: 14, 
                                            marginBottom: 10, 
                                            fontSize: 10.5,
                                            padding: '6px 0',
                                        }}>
                                            {issue.impact && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <div style={{
                                                        width: 18,
                                                        height: 18,
                                                        borderRadius: 4,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: `${THEME.warning}12`,
                                                    }}>
                                                        <ZapIcon size={10} color={THEME.warning} />
                                                    </div>
                                                    <span style={{ color: THEME.textDim }}>
                                                        <span style={{ color: THEME.textMuted, fontWeight: 700 }}>{issue.impact}</span>
                                                    </span>
                                                </div>
                                            )}
                                            {issue.effort && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <div style={{
                                                        width: 18,
                                                        height: 18,
                                                        borderRadius: 4,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: `${THEME.primary}12`,
                                                    }}>
                                                        <Clock size={10} color={THEME.primary} />
                                                    </div>
                                                    <span style={{ color: THEME.textDim }}>
                                                        <span style={{ color: THEME.textMuted, fontWeight: 700 }}>{issue.effort}</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {issue.fix && (
                                <div style={{ padding: '0 16px 12px 56px' }}>
                                    <div style={{ 
                                        borderRadius: 10, 
                                        background: THEME.surface, 
                                        border: `1px solid ${THEME.grid}50`, 
                                        overflow: 'hidden',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                                    }}>
                                        <div style={{ 
                                            padding: '8px 14px', 
                                            borderBottom: `1px solid ${THEME.grid}40`, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 7,
                                            background: `linear-gradient(135deg, ${THEME.success}05, transparent)`,
                                        }}>
                                            <div style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `${THEME.success}15`,
                                            }}>
                                                <Lightbulb size={11} color={THEME.success} />
                                            </div>
                                            <span style={{ 
                                                fontSize: 10.5, 
                                                fontWeight: 800, 
                                                color: THEME.success, 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '0.05em' 
                                            }}>Solution</span>
                                        </div>
                                        <pre className="repo-scrollbar" style={{
                                            margin: 0, 
                                            padding: '12px 14px', 
                                            fontSize: 10.5, 
                                            lineHeight: 1.7,
                                            color: THEME.textMuted, 
                                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                                            whiteSpace: 'pre-wrap', 
                                            wordBreak: 'break-word', 
                                            maxHeight: 320, 
                                            overflowY: 'auto',
                                        }}>{issue.fix}</pre>
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
   MAIN — REPOSITORY TAB (COMPLETE FIXED VERSION)
   ═══════════════════════════════════════════════════════════════════════════ */
const RepositoryTab = () => {
    const [view, setView]               = useState('repos');
    const [repos, setRepos]             = useState(() => {
        try {
            const saved = localStorage.getItem('vigil_repos');
            return saved ? JSON.parse(saved) : [];
        } catch (err) {
            console.error('Failed to load repos:', err);
            return [];
        }
    });
    const [activeRepo, setActiveRepo]   = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [editedContent, setEditedContent] = useState('');
    const [isEditing, setIsEditing]     = useState(false);
    const [analysis, setAnalysis]       = useState(null);
    const [analyzing, setAnalyzing]     = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [showAddRepo, setShowAddRepo] = useState(false);
    const [newRepoUrl, setNewRepoUrl]   = useState('');
    const [repoType, setRepoType]       = useState('github');
    const [repoSearch, setRepoSearch]   = useState('');
    const [copiedId, setCopiedId]       = useState(null);
    const [unsaved, setUnsaved]         = useState(false);
    const [highlightLine, setHighlightLine] = useState(null);
    const [loading, setLoading]         = useState(false);
    const [fileTree, setFileTree]       = useState([]);

    const editorRef = useRef(null);
    const lineNumbersRef = useRef(null);
    const fileInputRef = useRef(null);

    // FIXED: Save repos with tree preserved but remove handles
    useEffect(() => {
        try {
            // Recursively remove handles from tree nodes
            const cleanTree = (nodes) => {
                if (!nodes) return nodes;
                return nodes.map(node => ({
                    ...node,
                    handle: undefined, // Remove the handle
                    children: node.children ? cleanTree(node.children) : undefined
                }));
            };

            const reposToSave = repos.map(r => ({
                ...r,
                dirHandle: undefined,
                tree: r.tree ? cleanTree(r.tree) : r.tree,
                // Keep tree for all repos, mark local ones as needing reconnect
                needsReconnect: r.type === 'local' && r.dirHandle ? false : (r.type === 'local')
            }));
            localStorage.setItem('vigil_repos', JSON.stringify(reposToSave));
        } catch (err) {
            console.error('Failed to save repos:', err);
        }
    }, [repos]);

    const lang = detectLang(selectedFileName);
    const lineCount = useMemo(() => (editedContent || '').split('\n').length, [editedContent]);

    const highlighted = useMemo(() => {
        if (lang === 'text') return escapeHtml(editedContent || '');
        return highlightCode(editedContent || '', lang);
    }, [editedContent, lang]);

    const filteredRepos = useMemo(() => {
        if (!repoSearch.trim()) return repos;
        const q = repoSearch.toLowerCase();
        return repos.filter(r => r.name.toLowerCase().includes(q) || r.lang.toLowerCase().includes(q));
    }, [repos, repoSearch]);

    const readLocalDirectory = useCallback(async (dirHandle) => {
        const buildTree = async (handle, path = '') => {
            const children = [];

            if (handle.kind === 'directory') {
                for await (const entry of handle.values()) {
                    const childPath = path ? `${path}/${entry.name}` : entry.name;

                    if (entry.kind === 'directory') {
                        const subTree = await buildTree(entry, childPath);
                        children.push({
                            id: childPath,
                            name: entry.name,
                            type: 'dir',
                            handle: entry,
                            children: subTree.children
                        });
                    } else {
                        children.push({
                            id: childPath,
                            name: entry.name,
                            type: 'file',
                            handle: entry
                        });
                    }
                }
            }

            return { children };
        };

        const tree = await buildTree(dirHandle);
        return tree.children;
    }, []);

    // FIXED: Handle local repo reconnection
    const openRepo = useCallback(async (repo) => {
        // If it's a local repo that needs reconnection
        if (repo.type === 'local' && repo.needsReconnect) {
            const reconnect = confirm(`This local repository needs to be reconnected. Would you like to select the folder again?`);
            if (reconnect) {
                try {
                    const dirHandle = await window.showDirectoryPicker();
                    const tree = await readLocalDirectory(dirHandle);
                    
                    // Update the repo with new handle and tree
                    setRepos(prev => prev.map(r => 
                        r.id === repo.id 
                            ? { ...r, tree, dirHandle, needsReconnect: false }
                            : r
                    ));
                    
                    // Now open it with the updated tree
                    setActiveRepo({ ...repo, tree, dirHandle, needsReconnect: false });
                    setFileTree(tree);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        alert('Failed to reconnect: ' + err.message);
                    }
                    return;
                }
            } else {
                return;
            }
        } else {
            setActiveRepo(repo);
            setFileTree(repo.tree || []);
        }
        
        setView('browser');
        setSelectedFile(null);
        setSelectedFileName('');
        setFileContent('');
        setEditedContent('');
        setAnalysis(null);
        setShowAnalysis(false);
        setIsEditing(false);
        setUnsaved(false);
    }, [readLocalDirectory]);

    const openFile = useCallback(async (fileId, fileName) => {
        const findNode = (nodes, id) => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children) {
                    const found = findNode(node.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const node = findNode(fileTree, fileId);

        if (node && node.type === 'file') {
            try {
                let content = '';

                if (node.handle) {
                    // Check if handle is valid (has the getFile method)
                    if (typeof node.handle.getFile !== 'function') {
                        // Handle is invalid (probably after page reload)
                        alert('This local repository needs to be reconnected. Please go back to repositories and reconnect it.');
                        return;
                    }
                    
                    const file = await node.handle.getFile();
                    content = await file.text();
                }
                else if (node.url) {
                    const res = await fetch(node.url);
                    const data = await res.json();
                    content = atob(data.content);
                }

                setSelectedFile(fileId);
                setSelectedFileName(fileName);
                setFileContent(content);
                setEditedContent(content);
                setIsEditing(false);
                setAnalysis(null);
                setShowAnalysis(false);
                setUnsaved(false);
                setHighlightLine(null);
            } catch (err) {
                console.error('Error reading file:', err);
                
                // Check if it's a handle permission error
                if (err.name === 'NotAllowedError') {
                    alert('Permission denied. Please reconnect this repository from the repositories list.');
                } else {
                    alert('Failed to read file: ' + err.message + '\n\nIf this is a local repository, try reconnecting it.');
                }
            }
        }
    }, [fileTree]);

    const handleEdit = useCallback((val) => {
        setEditedContent(val);
        setUnsaved(val !== fileContent);
    }, [fileContent]);

    const handleSave = useCallback(async () => {
        const findNode = (nodes, id) => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children) {
                    const found = findNode(node.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const node = findNode(fileTree, selectedFile);

        if (node && node.handle && node.type === 'file') {
            try {
                const writable = await node.handle.createWritable();
                await writable.write(editedContent);
                await writable.close();
                setFileContent(editedContent);
                setUnsaved(false);
                alert('File saved successfully!');
            } catch (err) {
                console.error('Error saving file:', err);
                alert('Failed to save file: ' + err.message);
            }
        } else {
            setFileContent(editedContent);
            setUnsaved(false);
        }
    }, [editedContent, fileTree, selectedFile]);

    const handleUndo = useCallback(() => {
        setEditedContent(fileContent);
        setUnsaved(false);
    }, [fileContent]);

    const handleAnalyze = useCallback(async () => {
        if (!editedContent.trim()) return;
        setAnalyzing(true);
        setShowAnalysis(true);
        await new Promise(r => setTimeout(r, 2200));
        const result = generateAdvancedAnalysis(editedContent, selectedFileName);
        setAnalysis(result);
        setAnalyzing(false);
    }, [editedContent, selectedFileName]);

    // FIXED: Mark new local repos as not needing reconnect
    const handleBrowseLocal = useCallback(async () => {
        try {
            const dirHandle = await window.showDirectoryPicker();
            setLoading(true);

            const tree = await readLocalDirectory(dirHandle);
            const fileCount = (nodes) => nodes.reduce((acc, n) => acc + (n.type === 'file' ? 1 : n.children ? fileCount(n.children) : 0), 0);

            const newRepo = {
                id: Date.now(),
                name: dirHandle.name,
                url: 'local://' + dirHandle.name,
                type: 'local',
                branch: 'local',
                lang: 'Mixed',
                langColor: REPO_TYPES.local.color,
                files: fileCount(tree),
                lastCommit: 'just now',
                author: 'you',
                status: 'clean',
                stars: 0,
                tree: tree,
                dirHandle: dirHandle,
                needsReconnect: false // New repos don't need reconnection
            };

            setRepos(prev => [newRepo, ...prev]);
            setNewRepoUrl('');
            setShowAddRepo(false);
            setLoading(false);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting directory:', err);
                alert('Failed to open directory: ' + err.message);
            }
            setLoading(false);
        }
    }, [readLocalDirectory]);

    const handleAddRepo = useCallback(async () => {
        if (repoType === 'local') {
            handleBrowseLocal();
            return;
        }

        if (!newRepoUrl.trim()) return;

        setLoading(true);

        try {
            const name = newRepoUrl.split('/').pop().replace(/\.git$/, '') || 'new-repo';
            const config = REPO_TYPES[repoType];

            let treeData = { tree: [], branch: 'main', files: 0 };

            if (repoType === 'github') {
                treeData = await fetchGitHubTree(newRepoUrl);
            }

            const newRepo = {
                id: Date.now(),
                name,
                url: newRepoUrl.replace(/^https?:\/\//, ''),
                type: repoType,
                branch: treeData.branch,
                lang: 'Unknown',
                langColor: config.color,
                files: treeData.files,
                lastCommit: 'just now',
                author: 'you',
                status: 'clean',
                stars: 0,
                tree: treeData.tree
            };

            setRepos(p => [newRepo, ...p]);
            setNewRepoUrl('');
            setShowAddRepo(false);
        } catch (err) {
            alert('Failed to fetch repository: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [newRepoUrl, repoType, handleBrowseLocal]);

    const goToLine = useCallback((line) => {
        setHighlightLine(line);
        if (editorRef.current) {
            const lineH = 22.1;
            editorRef.current.scrollTop = Math.max(0, (line - 5) * lineH);
        }
        setTimeout(() => setHighlightLine(null), 3000);
    }, []);

    // FIXED: Sync line numbers with editor scroll
    const handleEditorScroll = useCallback(() => {
        if (editorRef.current && lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
        }
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const t = e.target;
            const start = t.selectionStart;
            const end = t.selectionEnd;
            const val = t.value;
            t.value = val.substring(0, start) + '  ' + val.substring(end);
            t.selectionStart = t.selectionEnd = start + 2;
            handleEdit(t.value);
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
    }, [handleEdit, handleSave]);

    const copyToClipboard = useCallback((text, id) => {
        navigator.clipboard?.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    }, []);

    const deleteRepo = useCallback((repoId, e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to remove this repository?')) {
            setRepos(prev => prev.filter(r => r.id !== repoId));
            if (activeRepo?.id === repoId) {
                setView('repos');
                setActiveRepo(null);
            }
        }
    }, [activeRepo]);

    const breadcrumbs = useMemo(() => {
        const crumbs = [{ label: 'Repositories', action: () => { setView('repos'); setActiveRepo(null); setSelectedFile(null); } }];
        if (activeRepo) crumbs.push({ label: activeRepo.name, action: () => { setSelectedFile(null); setSelectedFileName(''); setShowAnalysis(false); } });
        if (selectedFileName) crumbs.push({ label: selectedFileName });
        return crumbs;
    }, [activeRepo, selectedFileName]);

    if (view === 'repos') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 28px 48px' }}>
                <RepoStyles />

                {/* Header - Enhanced */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }}>
                    <div>
                        <h2 style={{ 
                            fontSize: 24, 
                            fontWeight: 900, 
                            margin: 0, 
                            letterSpacing: '-0.03em',
                            background: `linear-gradient(135deg, ${THEME.textMain}, ${THEME.textMuted})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>Repositories</h2>
                        <p style={{ fontSize: 13, color: THEME.textDim, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <GitBranch size={12} color={THEME.primary} />
                            {repos.length} connected {repos.length === 1 ? 'repository' : 'repositories'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {/* Enhanced Search */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 8, 
                            padding: '9px 14px', 
                            borderRadius: 10, 
                            background: `linear-gradient(135deg, ${THEME.surface}, ${THEME.surface}dd)`,
                            border: `1px solid ${THEME.grid}70`, 
                            width: 260,
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                        }}>
                            <Search size={14} color={THEME.textDim} />
                            <input 
                                value={repoSearch} 
                                onChange={e => setRepoSearch(e.target.value)} 
                                placeholder="Search repositories…" 
                                style={{ 
                                    border: 'none', 
                                    background: 'transparent', 
                                    color: THEME.textMain, 
                                    outline: 'none', 
                                    flex: 1, 
                                    fontSize: 12.5,
                                    fontWeight: 500,
                                }} 
                            />
                            {repoSearch && (
                                <button 
                                    onClick={() => setRepoSearch('')} 
                                    style={{ 
                                        background: `${THEME.danger}12`, 
                                        border: 'none', 
                                        borderRadius: 5,
                                        cursor: 'pointer', 
                                        padding: 4, 
                                        display: 'flex',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <X size={12} color={THEME.danger} />
                                </button>
                            )}
                        </div>
                        
                        {/* Enhanced Add Button */}
                        <button onClick={() => setShowAddRepo(true)} style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 8, 
                            padding: '10px 20px', 
                            borderRadius: 10, 
                            border: 'none', 
                            cursor: 'pointer',
                            background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
                            color: '#fff', 
                            fontSize: 13, 
                            fontWeight: 700, 
                            boxShadow: `0 4px 20px ${THEME.primary}35`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}>
                            <Plus size={15} strokeWidth={3} /> 
                            Add Repository
                        </button>
                    </div>
                </div>

                {/* Add Repo Panel - Enhanced */}
                {showAddRepo && (
                    <Panel 
                        title="Connect Repository" 
                        icon={GitBranch} 
                        className="repo-glass-intense"
                        style={{ animation: 'repoScaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        rightNode={
                            <button 
                                onClick={() => setShowAddRepo(false)} 
                                style={{ 
                                    background: `${THEME.danger}10`, 
                                    border: `1px solid ${THEME.danger}20`,
                                    borderRadius: 7,
                                    cursor: 'pointer', 
                                    padding: 5, 
                                    display: 'flex',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <X size={13} color={THEME.danger} />
                            </button>
                        }
                    >
                        <div style={{ marginBottom: 18 }}>
                            <div style={{ 
                                fontSize: 11.5, 
                                fontWeight: 700, 
                                color: THEME.textDim, 
                                marginBottom: 10, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.06em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}>
                                <Globe size={11} color={THEME.primary} />
                                Repository Source
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                                {Object.entries(REPO_TYPES).map(([key, config]) => {
                                    const Icon = config.icon;
                                    const isActive = repoType === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setRepoType(key)}
                                            className="repo-type-btn"
                                            style={{
                                                padding: '12px 14px',
                                                borderRadius: 10,
                                                border: `2px solid ${isActive ? config.color : THEME.grid}40`,
                                                background: isActive 
                                                    ? `linear-gradient(135deg, ${config.color}12, ${config.color}06)` 
                                                    : THEME.surface,
                                                color: isActive ? config.color : THEME.textMuted,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 8,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                boxShadow: isActive ? `0 4px 16px ${config.color}15` : 'none',
                                            }}
                                        >
                                            <Icon size={18} />
                                            {config.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {repoType === 'local' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <button onClick={handleBrowseLocal} disabled={loading} style={{
                                    padding: '14px 24px', 
                                    borderRadius: 10, 
                                    border: 'none', 
                                    cursor: loading ? 'wait' : 'pointer',
                                    background: `linear-gradient(135deg, ${REPO_TYPES.local.color}, ${THEME.secondary})`,
                                    color: '#fff', 
                                    fontSize: 14, 
                                    fontWeight: 700,
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: 10,
                                    boxShadow: `0 4px 20px ${REPO_TYPES.local.color}30`,
                                }}>
                                    {loading ? <Spinner size={16} color="#fff" /> : <HardDrive size={16} />}
                                    {loading ? 'Loading Directory...' : 'Browse Local Folder'}
                                </button>
                                <p style={{ 
                                    fontSize: 11, 
                                    color: THEME.textDim, 
                                    margin: 0, 
                                    textAlign: 'center',
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    background: THEME.surface,
                                }}>
                                    Select a local directory to browse its files
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 10, 
                                    padding: '11px 16px', 
                                    borderRadius: 10, 
                                    background: THEME.surface, 
                                    border: `1px solid ${THEME.grid}70`, 
                                    flex: 1,
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                                }}>
                                    <Globe size={15} color={REPO_TYPES[repoType].color} />
                                    <input
                                        value={newRepoUrl}
                                        onChange={e => setNewRepoUrl(e.target.value)}
                                        placeholder={REPO_TYPES[repoType].placeholder}
                                        onKeyDown={e => e.key === 'Enter' && handleAddRepo()}
                                        style={{ 
                                            border: 'none', 
                                            background: 'transparent', 
                                            color: THEME.textMain, 
                                            outline: 'none', 
                                            flex: 1, 
                                            fontSize: 12.5, 
                                            fontFamily: 'monospace',
                                            fontWeight: 500,
                                        }}
                                    />
                                </div>
                                <button onClick={handleAddRepo} disabled={!newRepoUrl.trim() || loading} style={{
                                    padding: '11px 26px', 
                                    borderRadius: 10, 
                                    border: 'none', 
                                    cursor: (newRepoUrl.trim() && !loading) ? 'pointer' : 'not-allowed',
                                    background: (newRepoUrl.trim() && !loading) 
                                        ? `linear-gradient(135deg, ${THEME.success}, ${THEME.teal})` 
                                        : THEME.surface,
                                    color: '#fff', 
                                    fontSize: 13, 
                                    fontWeight: 700, 
                                    opacity: (newRepoUrl.trim() && !loading) ? 1 : 0.4,
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 7,
                                    boxShadow: (newRepoUrl.trim() && !loading) ? `0 4px 16px ${THEME.success}30` : 'none',
                                }}>
                                    {loading && <Spinner size={13} color="#fff" />}
                                    Connect
                                </button>
                            </div>
                        )}
                    </Panel>
                )}

                {/* Repository Cards - Enhanced */}
                <div className="repo-stagger" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
                    gap: 18 
                }}>
                    {filteredRepos.map(repo => {
                        const RepoIcon = REPO_TYPES[repo.type]?.icon || GitBranch;
                        return (
                            <div key={repo.id} className="repo-card" onClick={() => openRepo(repo)} style={{
                                padding: '24px 26px', 
                                borderRadius: 18,
                                background: `linear-gradient(135deg, ${THEME.glass}, ${THEME.glass}dd)`,
                                backdropFilter: 'blur(16px)',
                                border: `1px solid ${THEME.glassBorder}`,
                                position: 'relative',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                            }}>
                                {/* Delete Button - Enhanced */}
                                <button
                                    onClick={(e) => deleteRepo(repo.id, e)}
                                    style={{
                                        position: 'absolute',
                                        top: 14,
                                        right: 14,
                                        background: `${THEME.danger}12`,
                                        border: `1px solid ${THEME.danger}25`,
                                        borderRadius: 7,
                                        padding: '5px 7px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        opacity: 0.5,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                                >
                                    <Trash2 size={13} color={THEME.danger} />
                                </button>

                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ 
                                            width: 42, 
                                            height: 42, 
                                            borderRadius: 12, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            background: `linear-gradient(135deg, ${repo.langColor}18, ${repo.langColor}08)`,
                                            border: `1px solid ${repo.langColor}25`,
                                            boxShadow: `0 4px 12px ${repo.langColor}15`,
                                        }}>
                                            <RepoIcon size={20} color={repo.langColor} />
                                        </div>
                                        <div>
                                            <div style={{ 
                                                fontSize: 16, 
                                                fontWeight: 800, 
                                                color: THEME.textMain, 
                                                marginBottom: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}>
                                                {repo.name}
                                                {repo.needsReconnect && (
                                                    <span style={{
                                                        fontSize: 9,
                                                        padding: '2px 6px',
                                                        borderRadius: 4,
                                                        background: `${THEME.warning}15`,
                                                        color: THEME.warning,
                                                        fontWeight: 700,
                                                        border: `1px solid ${THEME.warning}30`,
                                                    }}>RECONNECT</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 11, color: THEME.textDim, fontFamily: 'monospace', fontWeight: 600 }}>{repo.branch}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ 
                                    fontSize: 11.5, 
                                    color: THEME.textDim, 
                                    fontFamily: 'monospace', 
                                    marginBottom: 16, 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    background: THEME.surface,
                                    fontWeight: 500,
                                }}>{repo.url}</div>

                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 18, 
                                    paddingTop: 14, 
                                    borderTop: `1px solid ${THEME.grid}40` 
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: THEME.textMuted, fontWeight: 600 }}>
                                        <span style={{ 
                                            width: 10, 
                                            height: 10, 
                                            borderRadius: '50%', 
                                            background: `linear-gradient(135deg, ${repo.langColor}, ${repo.langColor}cc)`,
                                            boxShadow: `0 0 8px ${repo.langColor}40`,
                                        }} />
                                        {repo.lang}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: THEME.textDim, fontWeight: 600 }}>
                                        <File size={11} /> {repo.files} files
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: THEME.textDim, fontWeight: 600 }}>
                                        <Clock size={11} /> {repo.lastCommit}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State - Enhanced */}
                {filteredRepos.length === 0 && (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: '100px 0', 
                        gap: 18 
                    }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${THEME.primary}08, ${THEME.secondary}05)`,
                            border: `1px solid ${THEME.primary}15`,
                        }}>
                            <GitBranch size={40} color={THEME.textDim} style={{ opacity: 0.3 }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>
                                {repoSearch ? 'No matching repositories' : 'No repositories connected'}
                            </div>
                            <div style={{ fontSize: 13, color: THEME.textDim }}>
                                {repoSearch ? 'Try a different search term' : 'Add your first repository to get started'}
                            </div>
                        </div>
                        {!repoSearch && (
                            <button 
                                onClick={() => setShowAddRepo(true)} 
                                style={{ 
                                    padding: '10px 24px', 
                                    borderRadius: 10, 
                                    border: 'none',
                                    background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
                                    color: '#fff', 
                                    fontSize: 13, 
                                    fontWeight: 700, 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    boxShadow: `0 4px 20px ${THEME.primary}30`,
                                }}
                            >
                                <Plus size={15} />
                                Add Repository
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            height: '100vh',
            padding: '0 28px 28px'
        }}>
            <RepoStyles />

            {/* Breadcrumbs - Enhanced */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '12px 0 16px', 
                flexShrink: 0,
                borderBottom: `1px solid ${THEME.grid}30`,
                marginBottom: 16,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {breadcrumbs.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            {i > 0 && <ChevronRight size={12} color={THEME.textDim} />}
                            {c.action ? (
                                <button onClick={c.action} style={{ 
                                    background: `${THEME.primary}08`, 
                                    border: `1px solid ${THEME.primary}15`,
                                    borderRadius: 6,
                                    cursor: 'pointer', 
                                    fontSize: 12.5, 
                                    fontWeight: 700, 
                                    color: THEME.primary, 
                                    padding: '5px 10px',
                                    transition: 'all 0.2s',
                                }}>{c.label}</button>
                            ) : (
                                <span style={{ 
                                    fontSize: 12.5, 
                                    fontWeight: 700, 
                                    color: THEME.textMain, 
                                    padding: '5px 10px',
                                    borderRadius: 6,
                                    background: THEME.surface,
                                }}>{c.label}</span>
                            )}
                        </div>
                    ))}
                    {unsaved && <StatusBadge label="Unsaved Changes" color={THEME.warning} pulse />}
                </div>
                
                {/* Toolbar - Enhanced */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {selectedFile && (
                        <>
                            {isEditing ? (
                                <>
                                    <IconBtn icon={Save} label="Save" onClick={handleSave} color={THEME.success} active={unsaved} disabled={!unsaved} />
                                    <IconBtn icon={Undo2} label="Undo" onClick={handleUndo} disabled={!unsaved} />
                                    <IconBtn icon={Eye} label="View" onClick={() => setIsEditing(false)} />
                                </>
                            ) : (
                                <IconBtn icon={Edit3} label="Edit" onClick={() => setIsEditing(true)} color={THEME.primary} />
                            )}
                            <IconBtn 
                                icon={copiedId === 'code' ? Check : Copy} 
                                label={copiedId === 'code' ? 'Copied!' : 'Copy'} 
                                onClick={() => copyToClipboard(editedContent, 'code')}
                                color={copiedId === 'code' ? THEME.success : THEME.textMuted}
                            />
                            <div style={{ width: 1, background: THEME.grid, margin: '0 6px' }} />
                            <button onClick={handleAnalyze} disabled={analyzing || !editedContent.trim()} style={{
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 8,
                                padding: '8px 18px', 
                                borderRadius: 10, 
                                border: 'none', 
                                cursor: analyzing ? 'wait' : 'pointer',
                                background: `linear-gradient(135deg, ${THEME.ai}, ${THEME.secondary})`,
                                color: '#fff', 
                                fontSize: 13, 
                                fontWeight: 700,
                                boxShadow: `0 4px 18px ${THEME.ai}35`,
                                opacity: analyzing || !editedContent.trim() ? 0.6 : 1,
                                animation: analyzing ? 'repoGlow 2s ease-in-out infinite' : 'none',
                                transition: 'all 0.3s',
                            }}>
                                {analyzing ? <Spinner size={14} color="#fff" /> : <Sparkles size={14} />}
                                {analyzing ? 'Analyzing…' : 'AI Analysis'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: showAnalysis ? '240px 1fr 420px' : '240px 1fr',
                gap: 16,
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
                {/* File Tree Panel - Enhanced */}
                <Panel title="Files" icon={FolderOpen} noPad style={{ overflow: 'hidden' }}>
                    <div className="repo-scrollbar" style={{ height: '100%', overflowY: 'auto', padding: '8px 0' }}>
                        {activeRepo?.needsReconnect ? (
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '100%', 
                                gap: 16, 
                                padding: 24 
                            }}>
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 14,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `${THEME.warning}12`,
                                    border: `1px solid ${THEME.warning}25`,
                                }}>
                                    <AlertTriangle size={28} color={THEME.warning} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain, marginBottom: 6 }}>
                                        Repository Needs Reconnection
                                    </div>
                                    <div style={{ fontSize: 11, color: THEME.textDim, lineHeight: 1.6, maxWidth: 180 }}>
                                        This local repository needs to be reconnected to access files.
                                    </div>
                                </div>
                                <button 
                                    onClick={async () => {
                                        try {
                                            const dirHandle = await window.showDirectoryPicker();
                                            const tree = await readLocalDirectory(dirHandle);
                                            
                                            setRepos(prev => prev.map(r => 
                                                r.id === activeRepo.id 
                                                    ? { ...r, tree, dirHandle, needsReconnect: false }
                                                    : r
                                            ));
                                            
                                            setActiveRepo({ ...activeRepo, tree, dirHandle, needsReconnect: false });
                                            setFileTree(tree);
                                        } catch (err) {
                                            if (err.name !== 'AbortError') {
                                                alert('Failed to reconnect: ' + err.message);
                                            }
                                        }
                                    }}
                                    style={{ 
                                        padding: '8px 16px', 
                                        borderRadius: 8, 
                                        border: 'none',
                                        background: `linear-gradient(135deg, ${THEME.warning}, ${THEME.orange})`,
                                        color: '#fff', 
                                        fontSize: 12, 
                                        fontWeight: 700, 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        boxShadow: `0 4px 16px ${THEME.warning}30`,
                                    }}
                                >
                                    <HardDrive size={14} />
                                    Reconnect Folder
                                </button>
                            </div>
                        ) : fileTree.length > 0 ? (
                            <FileTree nodes={fileTree} onSelect={openFile} selectedFile={selectedFile} />
                        ) : (
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '100%', 
                                gap: 12, 
                                padding: 24 
                            }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `${THEME.primary}08`,
                                    border: `1px solid ${THEME.primary}15`,
                                }}>
                                    <FolderOpen size={24} color={THEME.textDim} style={{ opacity: 0.4 }} />
                                </div>
                                <div style={{ fontSize: 11.5, color: THEME.textDim, textAlign: 'center', lineHeight: 1.6 }}>
                                    No files available
                                </div>
                            </div>
                        )}
                    </div>
                </Panel>

                {/* Editor Panel - FIXED SCROLLING */}
                <Panel noPad style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {selectedFile ? (
                        <>
                            {/* File Header - Enhanced */}
                            <div style={{
                                padding: '10px 18px', 
                                borderBottom: `1px solid ${THEME.glassBorder}`,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                flexShrink: 0,
                                background: `linear-gradient(135deg, ${getFileColor(selectedFileName)}05, transparent)`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {React.createElement(getFileIcon(selectedFileName, false), { 
                                        size: 15, 
                                        color: getFileColor(selectedFileName) 
                                    })}
                                    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>{selectedFileName}</span>
                                    <span style={{ 
                                        fontSize: 10, 
                                        padding: '3px 9px', 
                                        borderRadius: 5, 
                                        background: `linear-gradient(135deg, ${getFileColor(selectedFileName)}15, ${getFileColor(selectedFileName)}08)`,
                                        color: getFileColor(selectedFileName), 
                                        fontWeight: 800, 
                                        fontFamily: 'monospace',
                                        border: `1px solid ${getFileColor(selectedFileName)}20`,
                                    }}>{lang.toUpperCase()}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 10.5, color: THEME.textDim, fontWeight: 600 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Hash size={10} />
                                        {lineCount} lines
                                    </span>
                                    <span>{editedContent.length.toLocaleString()} chars</span>
                                    {isEditing && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ 
                                                fontSize: 9, 
                                                padding: '2px 6px', 
                                                borderRadius: 4, 
                                                background: THEME.surface, 
                                                border: `1px solid ${THEME.grid}50`, 
                                                fontFamily: 'monospace',
                                                fontWeight: 700,
                                            }}>Ctrl+S</span> 
                                            to save
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* FIXED SCROLLING EDITOR CONTAINER */}
                            <div style={{ 
                                flex: 1, 
                                display: 'flex', 
                                minHeight: 0, 
                                position: 'relative', 
                                overflow: 'hidden',
                                background: THEME.surface,
                            }}>
                                {/* Line Numbers - synced scroll, no direct scroll */}
                                <div 
                                    ref={lineNumbersRef} 
                                    className="repo-scrollbar" 
                                    style={{
                                        width: 56, 
                                        flexShrink: 0, 
                                        overflowY: 'hidden', 
                                        overflowX: 'hidden',
                                        background: `linear-gradient(135deg, ${THEME.surface}, ${THEME.surface}dd)`,
                                        borderRight: `1px solid ${THEME.grid}50`,
                                        padding: '14px 0', 
                                        userSelect: 'none', 
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <div>
                                        {Array.from({ length: lineCount }, (_, i) => (
                                            <div key={i} style={{
                                                height: 22.1, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'flex-end',
                                                paddingRight: 14, 
                                                fontSize: 11.5, 
                                                fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
                                                color: highlightLine === i + 1 ? THEME.danger : THEME.textDim,
                                                fontWeight: highlightLine === i + 1 ? 800 : 600,
                                                fontVariantNumeric: 'tabular-nums', 
                                                lineHeight: '22.1px',
                                                background: highlightLine === i + 1 ? `${THEME.danger}12` : 'transparent',
                                                transition: 'all 0.25s',
                                            }}>{i + 1}</div>
                                        ))}
                                    </div>
                                </div>

                                {/* CRITICAL: Single scrollable editor container - COMPLETELY FIXED */}
                                <div 
                                    ref={editorRef} 
                                    className="repo-scrollbar" 
                                    onScroll={handleEditorScroll} 
                                    style={{
                                        flex: 1, 
                                        position: 'relative', 
                                        overflow: 'auto',
                                        minHeight: 0,
                                    }}
                                >
                                    {/* Wrapper with FIXED HEIGHT - this is critical for scrolling */}
                                    <div style={{
                                        position: 'relative',
                                        height: `${lineCount * 22.1 + 28}px`, // Use height, not minHeight!
                                        width: '100%',
                                    }}>
                                        {/* Highlight Line Overlay */}
                                        {highlightLine && (
                                            <div style={{
                                                position: 'absolute', 
                                                left: 0, 
                                                right: 0,
                                                top: 14 + (highlightLine - 1) * 22.1,
                                                height: 22.1, 
                                                background: `linear-gradient(90deg, ${THEME.danger}10, ${THEME.danger}05)`,
                                                borderLeft: `3px solid ${THEME.danger}`,
                                                pointerEvents: 'none', 
                                                zIndex: 1,
                                                transition: 'all 0.3s ease',
                                                boxShadow: `0 0 20px ${THEME.danger}15`,
                                            }} />
                                        )}

                                        {/* Syntax Highlighting Overlay */}
                                        <pre style={{
                                            position: 'absolute', 
                                            top: 0, 
                                            left: 0, 
                                            right: 0,
                                            margin: 0, 
                                            padding: '14px 18px',
                                            fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
                                            fontSize: 13, 
                                            lineHeight: '22.1px', 
                                            whiteSpace: 'pre',
                                            color: THEME.textMuted, 
                                            background: 'transparent',
                                            pointerEvents: 'none', 
                                            zIndex: 2,
                                            wordWrap: 'normal', 
                                            tabSize: 2,
                                        }} dangerouslySetInnerHTML={{ __html: highlighted + '\n' }} />

                                        {/* Editor Textarea (when editing) */}
                                        {isEditing && (
                                            <textarea
                                                value={editedContent}
                                                onChange={e => handleEdit(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                spellCheck={false}
                                                className="repo-editor-area"
                                                style={{
                                                    position: 'absolute', 
                                                    top: 0, 
                                                    left: 0, 
                                                    right: 0,
                                                    padding: '14px 18px', 
                                                    margin: 0,
                                                    fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
                                                    fontSize: 13, 
                                                    lineHeight: '22.1px',
                                                    color: 'transparent', 
                                                    background: 'transparent',
                                                    border: 'none',
                                                    height: '100%',
                                                    width: '100%',
                                                    whiteSpace: 'pre', 
                                                    resize: 'none',
                                                    zIndex: 3, 
                                                    tabSize: 2, 
                                                    wordWrap: 'normal',
                                                    overflow: 'hidden',
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            height: '100%', 
                            gap: 18 
                        }}>
                            <div style={{
                                width: 72, 
                                height: 72, 
                                borderRadius: 18,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${THEME.primary}10, ${THEME.primary}05)`,
                                border: `1px solid ${THEME.primary}20`,
                                boxShadow: `0 4px 20px ${THEME.primary}10`,
                            }}>
                                <FileCode size={32} color={THEME.primary} style={{ opacity: 0.5 }} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: THEME.textMuted, marginBottom: 6 }}>
                                    Select a file to view
                                </div>
                                <div style={{ fontSize: 12, color: THEME.textDim, lineHeight: 1.6 }}>
                                    Choose a file from the tree to open the editor
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                                {[
                                    { icon: Code, label: 'Syntax Highlighting' },
                                    { icon: Edit3, label: 'Live Editing' },
                                    { icon: Sparkles, label: 'AI Analysis' },
                                ].map((f, i) => (
                                    <div key={i} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 6, 
                                        fontSize: 10.5, 
                                        color: THEME.textDim, 
                                        padding: '6px 12px', 
                                        borderRadius: 8, 
                                        background: `linear-gradient(135deg, ${THEME.surface}, ${THEME.surface}dd)`,
                                        border: `1px solid ${THEME.grid}40`,
                                        fontWeight: 600,
                                    }}>
                                        <f.icon size={11} /> {f.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Panel>

                {/* Analysis Panel - Enhanced */}
                {showAnalysis && (
                    <Panel noPad style={{ overflow: 'hidden', animation: 'repoSlideRight 0.3s ease' }}>
                        {analyzing ? (
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '100%', 
                                gap: 20, 
                                padding: 24 
                            }}>
                                <div style={{
                                    width: 64, 
                                    height: 64, 
                                    borderRadius: 16,
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    background: `linear-gradient(135deg, ${THEME.ai}20, ${THEME.secondary}15)`,
                                    border: `1px solid ${THEME.ai}30`,
                                    animation: 'repoGlow 2s ease-in-out infinite',
                                    boxShadow: `0 8px 32px ${THEME.ai}20`,
                                }}>
                                    <Sparkles size={28} color={THEME.ai} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textMain, marginBottom: 8 }}>
                                        Analyzing Code…
                                    </div>
                                    <div style={{ fontSize: 11.5, color: THEME.textDim, lineHeight: 1.7, maxWidth: 260 }}>
                                        Running deep security scan, performance analysis, and best practices check
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 6 }}>
                                    {['Security', 'Performance', 'Quality', 'Best Practices'].map((s, i) => (
                                        <span key={i} style={{
                                            fontSize: 9.5, 
                                            padding: '4px 10px', 
                                            borderRadius: 6,
                                            background: `linear-gradient(135deg, ${THEME.ai}12, ${THEME.ai}06)`,
                                            color: THEME.ai, 
                                            fontWeight: 700,
                                            border: `1px solid ${THEME.ai}20`,
                                            animation: `repoPulse 1.5s ease-in-out infinite`,
                                            animationDelay: `${i * 0.3}s`,
                                            letterSpacing: '0.03em',
                                        }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <AnalysisPanel analysis={analysis} onClose={() => setShowAnalysis(false)} onGoToLine={goToLine} />
                        )}
                    </Panel>
                )}
            </div>
        </div>
    );
};

export default RepositoryTab;