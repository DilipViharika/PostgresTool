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

/* ══════════════════════════════════════════════════════════════════════════
   PROVIDER CONFIG
   ══════════════════════════════════════════════════════════════════════════ */
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
const LANG_MAP = {
    js:'js', jsx:'jsx', ts:'ts', tsx:'tsx', py:'py', go:'go', rs:'rs',
    java:'java', kt:'kt', rb:'rb', php:'php', cs:'cs', cpp:'cpp', c:'c',
    html:'html', css:'css', scss:'scss', json:'json', md:'md', yaml:'yaml',
    yml:'yaml', toml:'toml', sh:'sh', env:'env', txt:'txt', sql:'sql',
};
const IGNORE_DIRS = new Set([
    'node_modules','.git','.next','.nuxt','dist','build','out',
    '__pycache__','.venv','venv','.cache','.idea','.vscode',
    'vendor','coverage','.turbo','target','.gradle',
]);
const FILE_ICONS_MAP = {
    js:FileCode, jsx:FileCode, ts:FileCode, tsx:FileCode,
    py:FileCode, go:FileCode, rs:FileCode, java:FileCode,
    json:FileJson, md:FileText, html:FileCode, css:FileCode,
    scss:FileCode, sql:Database, sh:Terminal, default:File,
};
const getFileIcon = ext => FILE_ICONS_MAP[ext] || FILE_ICONS_MAP.default;
const getExt = name => name.includes('.') ? name.split('.').pop().toLowerCase() : '';

/* ── Read a directory handle recursively ─────────────────── */
async function readDirHandle(handle, depth = 0, maxDepth = 6) {
    const entries = [];
    if (depth > maxDepth) return entries;
    for await (const [name, h] of handle.entries()) {
        if (h.kind === 'directory') {
            if (IGNORE_DIRS.has(name)) continue;
            const children = await readDirHandle(h, depth + 1, maxDepth);
            entries.push({ id: `${depth}-${name}`, name, kind: 'dir', handle: h, children, depth });
        } else {
            const ext = getExt(name);
            entries.push({ id: `${depth}-${name}`, name, kind: 'file', handle: h, ext, depth });
        }
    }
    // Dirs first, then files — both alphabetically
    entries.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
    return entries;
}

/* ── File tree node ──────────────────────────────────────── */
const FsTreeNode = ({ node, depth, selectedId, onSelect, onToggle, openDirs }) => {
    const isOpen = openDirs.has(node.id);
    const isSelected = selectedId === node.id;
    const Icon = node.kind === 'dir' ? FolderOpen : getFileIcon(node.ext);
    const accent = isSelected ? THEME.primary : THEME.textDim;

    if (node.kind === 'dir') {
        return (
            <div>
                <div className="r8-tree-item" onClick={() => onToggle(node.id)}
                     style={{ display:'flex', alignItems:'center', gap:6, padding:`5px 12px 5px ${12 + depth * 14}px`, cursor:'pointer' }}>
                    {isOpen
                        ? <ChevronDown size={10} color={THEME.textDim}/>
                        : <ChevronRight size={10} color={THEME.textDim}/>}
                    <FolderOpen size={12} color={isOpen ? THEME.warning : THEME.textDim}/>
                    <span style={{ fontSize:11.5, color:THEME.textMuted, fontWeight:500, flex:1 }}>{node.name}</span>
                    {node.children?.length > 0 && (
                        <span style={{ fontSize:9, color:THEME.textDim }}>{node.children.length}</span>
                    )}
                </div>
                {isOpen && node.children?.map(c => (
                    <FsTreeNode key={c.id} node={c} depth={depth + 1} selectedId={selectedId}
                                onSelect={onSelect} onToggle={onToggle} openDirs={openDirs}/>
                ))}
            </div>
        );
    }

    return (
        <div className={`r8-tree-item${isSelected ? ' r8-sel' : ''}`}
             onClick={() => onSelect(node)}
             style={{ display:'flex', alignItems:'center', gap:6, padding:`4px 12px 4px ${12 + depth * 14}px`,
                 borderLeft: isSelected ? `2px solid ${THEME.primary}` : '2px solid transparent' }}>
            <Icon size={11} color={isSelected ? THEME.primary : THEME.textDim}/>
            <span style={{ fontSize:11, color:isSelected ? THEME.primary : THEME.textMuted, flex:1,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{node.name}</span>
            {node.ext && (
                <span style={{ fontSize:8.5, color:THEME.textDim, background:THEME.glass,
                    padding:'1px 4px', borderRadius:3, flexShrink:0 }}>{node.ext}</span>
            )}
        </div>
    );
};

/* ── Main CodeView ───────────────────────────────────────── */
const CodeView = ({ activeRepo }) => {
    const [fsTree,      setFsTree]      = useState(null);   // real file tree
    const [dirHandle,   setDirHandle]   = useState(null);   // root dir handle
    const [loading,     setLoading]     = useState(false);
    const [openDirs,    setOpenDirs]    = useState(new Set());
    const [selNode,     setSelNode]     = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [fileLoading, setFileLoading] = useState(false);
    const [editing,     setEditing]     = useState(false);
    const [copied,      setCopied]      = useState(false);
    const [search,      setSearch]      = useState('');
    const ai = useAIAnalysis();

    /* ── Open folder picker ────────────────────────────── */
    const openFolder = useCallback(async () => {
        try {
            const handle = await window.showDirectoryPicker({ mode: 'read' });
            setLoading(true);
            setFsTree(null);
            setSelNode(null);
            setFileContent('');
            ai.reset();
            const tree = await readDirHandle(handle, 0);
            setDirHandle(handle);
            setFsTree(tree);
            // Auto-open first directory level
            const firstDirs = tree.filter(n => n.kind === 'dir').map(n => n.id);
            setOpenDirs(new Set(firstDirs.slice(0, 3)));
            setLoading(false);
        } catch (e) {
            if (e.name !== 'AbortError') console.error(e);
            setLoading(false);
        }
    }, []);

    /* ── Toggle dir open/close ─────────────────────────── */
    const onToggle = useCallback(id => {
        setOpenDirs(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    /* ── Select & load a file ──────────────────────────── */
    const onSelect = useCallback(async node => {
        if (node.kind !== 'file') return;
        setSelNode(node);
        setEditing(false);
        ai.reset();
        setFileLoading(true);
        try {
            const file = await node.handle.getFile();
            const text = await file.text();
            setFileContent(text);
            // Auto-trigger AI analysis
            ai.analyze({
                filename: node.name,
                code: text,
                repoName: dirHandle?.name || activeRepo?.name || 'repo',
                repoPath: activeRepo?.url || dirHandle?.name || '',
            });
        } catch (e) {
            setFileContent(`// Could not read file: ${e.message}`);
        }
        setFileLoading(false);
    }, [ai, dirHandle, activeRepo]);

    /* ── Copy ──────────────────────────────────────────── */
    const onCopy = () => {
        navigator.clipboard.writeText(fileContent).catch(()=>{});
        setCopied(true); setTimeout(() => setCopied(false), 1800);
    };

    /* ── Flatten tree for search ───────────────────────── */
    const flatFiles = useMemo(() => {
        if (!fsTree || !search.trim()) return [];
        const result = [];
        const walk = nodes => nodes.forEach(n => {
            if (n.kind === 'file' && n.name.toLowerCase().includes(search.toLowerCase())) result.push(n);
            if (n.children) walk(n.children);
        });
        walk(fsTree);
        return result.slice(0, 50);
    }, [fsTree, search]);

    const sevColor = s => ({ critical:THEME.danger, high:THEME.danger, medium:THEME.warning, low:THEME.info }[s] || THEME.textDim);
    const lines = fileContent.split('\n');
    const supportsFS = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    return (
        <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:14, height:'100%', minHeight:0 }}>

            {/* ── Sidebar ── */}
            <Panel title={dirHandle ? dirHandle.name : 'Files'} icon={FolderOpen} noPad
                   rightNode={dirHandle && (
                       <button onClick={openFolder} className="r8-btn r8-btn-g r8-btn-sm" title="Open different folder">
                           <RefreshCw size={10}/> Change
                       </button>
                   )}>
                <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

                    {/* Open folder button — shown when no folder loaded */}
                    {!fsTree && !loading && (
                        <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14, alignItems:'center', flex:1, justifyContent:'center' }}>
                            {!supportsFS ? (
                                <div style={{ textAlign:'center' }}>
                                    <div style={{ fontSize:11, color:THEME.danger, marginBottom:8 }}>
                                        ⚠ File System API not supported in this browser.
                                    </div>
                                    <div style={{ fontSize:10.5, color:THEME.textDim, lineHeight:1.6 }}>
                                        Use Chrome or Edge for local folder access.
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ width:48, height:48, borderRadius:12, background:`${THEME.info}14`,
                                        border:`1px solid ${THEME.info}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                        <FolderOpen size={22} color={THEME.info}/>
                                    </div>
                                    <div style={{ textAlign:'center' }}>
                                        <div style={{ fontSize:12.5, fontWeight:700, color:THEME.textMuted, marginBottom:5 }}>Open Your Project</div>
                                        <div style={{ fontSize:11, color:THEME.textDim, lineHeight:1.6, marginBottom:12 }}>
                                            Browse your local filesystem and analyze any file with AI
                                        </div>
                                        <button onClick={openFolder} className="r8-btn r8-btn-c" style={{ width:'100%', justifyContent:'center' }}>
                                            <FolderOpen size={13}/> Open Folder
                                        </button>
                                    </div>
                                    {activeRepo?.type === 'local' && activeRepo?.url && (
                                        <div style={{ padding:'8px 10px', borderRadius:7, background:`${THEME.info}08`,
                                            border:`1px solid ${THEME.info}18`, width:'100%' }}>
                                            <div style={{ fontSize:9.5, color:THEME.info, fontWeight:700, marginBottom:3 }}>CONNECTED REPO</div>
                                            <div style={{ fontSize:10, color:THEME.textDim, fontFamily:'JetBrains Mono,monospace',
                                                wordBreak:'break-all', lineHeight:1.5 }}>{activeRepo.url}</div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Loading spinner */}
                    {loading && (
                        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10 }}>
                            <Loader size={20} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/>
                            <span style={{ fontSize:11, color:THEME.textDim }}>Reading directory…</span>
                        </div>
                    )}

                    {/* File tree */}
                    {fsTree && !loading && (
                        <>
                            {/* Search */}
                            <div style={{ padding:'8px 10px 6px', borderBottom:`1px solid ${THEME.glassBorder}` }}>
                                <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                                    <Search size={11} color={THEME.textDim} style={{ position:'absolute', left:8, pointerEvents:'none' }}/>
                                    <input value={search} onChange={e => setSearch(e.target.value)}
                                           placeholder="Search files…"
                                           style={{ width:'100%', paddingLeft:26, padding:'6px 8px 6px 26px',
                                               background:THEME.surface, border:`1px solid ${THEME.glassBorder}`,
                                               borderRadius:7, color:THEME.textMain, outline:'none', fontSize:11 }}/>
                                    {search && (
                                        <button onClick={() => setSearch('')} style={{ position:'absolute', right:6, background:'none', border:'none', cursor:'pointer', padding:2, color:THEME.textDim }}>
                                            <X size={10}/>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tree or search results */}
                            <div className="r8-scroll" style={{ flex:1, overflowY:'auto', paddingBottom:8, paddingTop:4 }}>
                                {search.trim() ? (
                                    flatFiles.length > 0 ? flatFiles.map(n => (
                                        <FsTreeNode key={n.id} node={n} depth={0} selectedId={selNode?.id}
                                                    onSelect={onSelect} onToggle={onToggle} openDirs={openDirs}/>
                                    )) : (
                                        <div style={{ padding:14, fontSize:11, color:THEME.textDim, textAlign:'center' }}>No files match "{search}"</div>
                                    )
                                ) : (
                                    fsTree.map(n => (
                                        <FsTreeNode key={n.id} node={n} depth={0} selectedId={selNode?.id}
                                                    onSelect={onSelect} onToggle={onToggle} openDirs={openDirs}/>
                                    ))
                                )}
                            </div>

                            {/* Stats footer */}
                            <div style={{ padding:'6px 12px', borderTop:`1px solid ${THEME.glassBorder}`, fontSize:10, color:THEME.textDim, display:'flex', justifyContent:'space-between' }}>
                                <span>{dirHandle?.name}</span>
                                <span>{fsTree.length} items</span>
                            </div>
                        </>
                    )}
                </div>
            </Panel>

            {/* ── Editor + AI panel ── */}
            <div style={{ display:'grid', gridTemplateColumns: (ai.result || ai.loading || ai.error) ? '1fr 390px' : '1fr', gap:14, height:'100%', minHeight:0 }}>

                {/* Editor */}
                <Panel title={selNode ? selNode.name : 'Editor'} icon={Code} noPad
                       rightNode={(
                           <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                               {fileLoading && <Loader size={12} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/>}
                               {selNode && fileContent && !fileLoading && (
                                   <>
                                       <button onClick={() => ai.analyze({ filename:selNode.name, code:fileContent, repoName:dirHandle?.name||activeRepo?.name, repoPath:activeRepo?.url||'' })}
                                               disabled={ai.loading} className="r8-btn r8-btn-p r8-btn-sm">
                                           {ai.loading
                                               ? <><Loader size={11} style={{ animation:'rSpin 1s linear infinite' }}/> Analyzing…</>
                                               : <><Sparkles size={11}/> Re-analyze</>}
                                       </button>
                                       <button onClick={onCopy} className="r8-btn r8-btn-g r8-btn-sm">
                                           {copied ? <Check size={11} color={THEME.success}/> : <Copy size={11}/>}
                                           {copied ? 'Copied' : 'Copy'}
                                       </button>
                                       <button onClick={() => setEditing(e => !e)} className="r8-btn r8-btn-sm"
                                               style={{ background:editing?`${THEME.primary}15`:'transparent', color:editing?THEME.primary:THEME.textDim, border:`1px solid ${editing?THEME.primary+'40':THEME.glassBorder}` }}>
                                           {editing ? <><Save size={11}/> Done</> : <><Edit3 size={11}/> Edit</>}
                                       </button>
                                   </>
                               )}
                           </div>
                       )}>
                    {/* Empty state */}
                    {!selNode && !fileLoading && (
                        <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
                            <div style={{ width:56, height:56, borderRadius:14, background:`${THEME.primary}10`, border:`1px solid ${THEME.primary}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Sparkles size={24} color={`${THEME.primary}50`}/>
                            </div>
                            <div style={{ textAlign:'center' }}>
                                <div style={{ fontSize:14, fontWeight:700, color:THEME.textMuted, marginBottom:6 }}>
                                    {fsTree ? 'Select a file' : 'Open a folder to begin'}
                                </div>
                                <div style={{ fontSize:12, color:THEME.textDim, maxWidth:300, lineHeight:1.6 }}>
                                    {fsTree
                                        ? 'Click any file in the tree to load it and get instant AI code analysis.'
                                        : 'Click "Open Folder" in the sidebar to browse your local project files.'}
                                </div>
                            </div>
                            {!fsTree && supportsFS && (
                                <button onClick={openFolder} className="r8-btn r8-btn-c">
                                    <FolderOpen size={13}/> Open Folder
                                </button>
                            )}
                        </div>
                    )}

                    {/* Loading file */}
                    {fileLoading && (
                        <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10 }}>
                            <Loader size={22} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/>
                            <span style={{ fontSize:12, color:THEME.textDim }}>Loading {selNode?.name}…</span>
                        </div>
                    )}

                    {/* Edit mode */}
                    {selNode && !fileLoading && editing && (
                        <textarea value={fileContent} onChange={e => setFileContent(e.target.value)}
                                  style={{ width:'100%', height:'100%', background:'transparent', border:'none', outline:'none',
                                      color:THEME.textMuted, fontFamily:'JetBrains Mono,monospace', fontSize:12.5,
                                      lineHeight:1.75, resize:'none', padding:'16px 20px', boxSizing:'border-box' }}/>
                    )}

                    {/* View mode */}
                    {selNode && !fileLoading && !editing && fileContent && (
                        <div className="r8-scroll" style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12.5, lineHeight:1.75, overflowY:'auto', height:'100%' }}>
                            {lines.map((line, i) => {
                                const issueOnLine = ai.result?.issues?.find(iss => iss.line === i + 1);
                                const isIssue = !!issueOnLine;
                                return (
                                    <div key={i} className="r8-line" title={issueOnLine ? `${issueOnLine.title}: ${issueOnLine.description}` : undefined}
                                         style={{ display:'flex', padding:'0 20px', minHeight:22,
                                             background:isIssue ? `${THEME.danger}07` : 'transparent',
                                             borderLeft:isIssue ? `2px solid ${THEME.danger}55` : '2px solid transparent',
                                             cursor:isIssue ? 'help' : 'default' }}>
                                        <span style={{ color:`${THEME.textDim}35`, width:38, flexShrink:0, userSelect:'none', fontSize:10.5, paddingTop:1 }}>{i + 1}</span>
                                        <span style={{ color:isIssue ? THEME.warning : THEME.textMuted, flex:1, whiteSpace:'pre' }}>{line}</span>
                                        {isIssue && (
                                            <span style={{ fontSize:9, color:THEME.danger, marginLeft:8, flexShrink:0, alignSelf:'center',
                                                padding:'1px 5px', background:`${THEME.danger}14`, borderRadius:3, whiteSpace:'nowrap' }}>
                                                ⚠ {issueOnLine.type}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Panel>

                {/* ── AI Panel ── */}
                {(ai.loading || ai.result || ai.error) && (
                    <div className="r8-scroll" style={{ overflowY:'auto', height:'100%', display:'flex', flexDirection:'column', gap:12, animation:'rSlideIn .25s ease' }}>

                        {/* Loading skeleton */}
                        {ai.loading && (
                            <Panel title="Analyzing…" icon={Sparkles}>
                                <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                                    {['Parsing structure','Detecting issues','Security scan','Performance review','Generating recommendations'].map((step, i) => (
                                        <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                                            <Loader size={11} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite', flexShrink:0 }}/>
                                            <div style={{ flex:1 }}>
                                                <div className="r8-shimmer" style={{ height:10, borderRadius:4, marginBottom:3 }}/>
                                                <div style={{ fontSize:10, color:THEME.textDim }}>{step}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        )}

                        {/* Error */}
                        {ai.error && (
                            <Panel title="Analysis Error" icon={AlertCircle}
                                   rightNode={<button onClick={ai.reset} style={{ background:'none', border:'none', cursor:'pointer', color:THEME.textDim, padding:4 }}><X size={13}/></button>}>
                                <div style={{ padding:12, borderRadius:8, background:`${THEME.danger}10`, border:`1px solid ${THEME.danger}20`, fontSize:12, color:THEME.danger }}>{ai.error}</div>
                            </Panel>
                        )}

                        {/* Results */}
                        {ai.result && !ai.loading && (() => {
                            const r = ai.result;
                            const hc = r.healthScore >= 80 ? THEME.success : r.healthScore >= 60 ? THEME.warning : THEME.danger;
                            return (<>
                                {/* Score card */}
                                <Panel title="AI Analysis" icon={Sparkles}
                                       rightNode={<button onClick={ai.reset} style={{ background:'none', border:'none', cursor:'pointer', color:THEME.textDim, padding:4, borderRadius:5 }}><X size={13}/></button>}>
                                    <div style={{ display:'flex', gap:14, padding:14, borderRadius:10, background:`${hc}08`, border:`1px solid ${hc}20`, marginBottom:14 }}>
                                        <div style={{ fontSize:42, fontWeight:900, color:hc, lineHeight:1, fontFamily:'JetBrains Mono,monospace', flexShrink:0 }}>{r.healthScore}</div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ fontSize:12, fontWeight:700, color:THEME.textMain }}>Health Score</div>
                                            <div style={{ fontSize:10.5, color:THEME.textDim, marginTop:2, lineHeight:1.45 }}>{r.summary}</div>
                                            <div style={{ marginTop:7 }}><ProgressBar value={r.healthScore} color={hc} height={4}/></div>
                                        </div>
                                    </div>
                                    {/* Metrics chips */}
                                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:r.strengths?.length ? 12 : 0 }}>
                                        {[
                                            { l:'Lang',       v:r.language },
                                            { l:'Lines',      v:r.linesAnalyzed },
                                            { l:'Complexity', v:r.complexityMetrics?.cyclomaticComplexity },
                                            { l:'Coupling',   v:r.complexityMetrics?.coupling },
                                            { l:'Testability',v:r.complexityMetrics?.testability },
                                        ].filter(m => m.v).map((m, i) => (
                                            <div key={i} style={{ padding:'4px 9px', borderRadius:6, background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, fontSize:10 }}>
                                                <span style={{ color:THEME.textDim }}>{m.l}: </span>
                                                <span style={{ color:THEME.textMain, fontWeight:700, fontFamily:'JetBrains Mono,monospace' }}>{m.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Strengths */}
                                    {r.strengths?.length > 0 && (
                                        <div style={{ marginTop:10 }}>
                                            <div style={{ fontSize:9.5, fontWeight:700, color:THEME.success, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>✓ Strengths</div>
                                            {r.strengths.map((s, i) => (
                                                <div key={i} style={{ fontSize:11, color:THEME.textMuted, marginBottom:4, paddingLeft:8, borderLeft:`2px solid ${THEME.success}30`, lineHeight:1.5 }}>{s}</div>
                                            ))}
                                        </div>
                                    )}
                                </Panel>

                                {/* Issues — highlighted in editor */}
                                {r.issues?.length > 0 && (
                                    <Panel title={`Issues (${r.issues.length})`} icon={AlertTriangle}>
                                        {r.issues.map((iss, i) => (
                                            <div key={i} style={{ marginBottom:10, padding:11, borderRadius:8, background:`${sevColor(iss.severity)}08`, border:`1px solid ${sevColor(iss.severity)}20` }}>
                                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:5, gap:6 }}>
                                                    <span style={{ fontSize:11.5, fontWeight:700, color:THEME.textMain, flex:1 }}>{iss.title}</span>
                                                    <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                                                        {iss.line && <span style={{ fontSize:9, color:THEME.textDim, fontFamily:'monospace', background:THEME.glass, padding:'2px 5px', borderRadius:3, alignSelf:'center' }}>L{iss.line}</span>}
                                                        <RiskBadge risk={iss.severity}/>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize:10.5, color:THEME.textDim, margin:'0 0 7px', lineHeight:1.5 }}>{iss.description}</p>
                                                <div style={{ fontSize:10.5, color:THEME.info, background:`${THEME.info}08`, padding:'6px 9px', borderRadius:5 }}>
                                                    <b>Fix: </b>{iss.fix}
                                                </div>
                                            </div>
                                        ))}
                                    </Panel>
                                )}

                                {/* Security */}
                                {r.securityFlags?.length > 0 && (
                                    <Panel title="Security" icon={Shield}>
                                        {r.securityFlags.map((sf, i) => (
                                            <div key={i} style={{ marginBottom:9, padding:10, borderRadius:8, background:`${sevColor(sf.severity)}08`, border:`1px solid ${sevColor(sf.severity)}18` }}>
                                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                                                    <span style={{ fontSize:11, fontWeight:700, color:THEME.textMain }}>{sf.title}</span>
                                                    <RiskBadge risk={sf.severity}/>
                                                </div>
                                                <p style={{ fontSize:10.5, color:THEME.textDim, margin:0, lineHeight:1.5 }}>{sf.description}</p>
                                            </div>
                                        ))}
                                    </Panel>
                                )}

                                {/* Performance */}
                                {r.performanceInsights?.length > 0 && (
                                    <Panel title="Performance" icon={Zap}>
                                        {r.performanceInsights.map((p, i) => (
                                            <div key={i} style={{ marginBottom:9, padding:10, borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                                                    <span style={{ fontSize:11, fontWeight:700, color:THEME.textMain }}>{p.title}</span>
                                                    <StatusBadge label={p.impact} color={p.impact==='high'?THEME.danger:p.impact==='medium'?THEME.warning:THEME.success} size="sm"/>
                                                </div>
                                                <p style={{ fontSize:10.5, color:THEME.textDim, margin:0, lineHeight:1.5 }}>{p.suggestion}</p>
                                            </div>
                                        ))}
                                    </Panel>
                                )}

                                {/* Refactor */}
                                {r.refactorOpportunities?.length > 0 && (
                                    <Panel title="Refactor Opportunities" icon={Wrench}>
                                        {r.refactorOpportunities.map((rf, i) => (
                                            <div key={i} style={{ marginBottom:9, padding:10, borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, gap:6 }}>
                                                    <span style={{ fontSize:11, fontWeight:700, color:THEME.textMain, flex:1 }}>{rf.title}</span>
                                                    <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                                                        <StatusBadge label={rf.effort} color={rf.effort==='low'?THEME.success:rf.effort==='medium'?THEME.warning:THEME.danger} size="sm"/>
                                                        <StatusBadge label={rf.impact} color={rf.impact==='high'?THEME.primary:THEME.secondary} size="sm"/>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize:10.5, color:THEME.textDim, margin:0, lineHeight:1.5 }}>{rf.description}</p>
                                            </div>
                                        ))}
                                    </Panel>
                                )}

                                {/* Top Recommendations */}
                                {r.aiRecommendations?.length > 0 && (
                                    <Panel title="Recommendations" icon={Lightbulb}>
                                        {r.aiRecommendations.sort((a, b) => a.priority - b.priority).map((rec, i) => (
                                            <div key={i} style={{ marginBottom:10, padding:11, borderRadius:8, background:`${THEME.primary}06`, border:`1px solid ${THEME.primary}14` }}>
                                                <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                                                    <div style={{ width:18, height:18, borderRadius:5, background:`${THEME.primary}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:9, fontWeight:800, color:THEME.primary, marginTop:1 }}>{rec.priority}</div>
                                                    <div>
                                                        <div style={{ fontSize:11, fontWeight:700, color:THEME.textMain, marginBottom:3 }}>{rec.title}</div>
                                                        <p style={{ fontSize:10.5, color:THEME.textDim, margin:0, lineHeight:1.5 }}>{rec.rationale}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Panel>
                                )}
                            </>);
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};


/* ═══════════════════════════════════════════════════════════════════════════
   CI/CD VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const CICDView = ({ activeRepo }) => {
    const ai = useAIAnalysis();
    const hasData = false; // No live CI/CD data without an integration

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ padding:20, borderRadius:14, background:`${THEME.primary}06`, border:`1px solid ${THEME.primary}18`, display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{ width:44, height:44, borderRadius:11, background:`${THEME.primary}14`, border:`1px solid ${THEME.primary}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <RocketIcon size={20} color={THEME.primary}/>
                </div>
                <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:THEME.textMain, marginBottom:4 }}>CI/CD Pipeline Analysis</div>
                    <div style={{ fontSize:12, color:THEME.textDim, lineHeight:1.6, marginBottom:12 }}>
                        Connect a live CI/CD integration (GitHub Actions, GitLab CI, CircleCI, Jenkins) to see real deployment history, build metrics, and failure analysis.
                        Meanwhile, use AI to analyze a pipeline config file.
                    </div>
                    {activeRepo && (
                        <button onClick={()=>ai.analyzeRepo({ repoName: activeRepo.name, repoPath: activeRepo.url, repoType: activeRepo.type })}
                                disabled={ai.loading} className="r8-btn r8-btn-p">
                            {ai.loading ? <><Loader size={13} style={{ animation:'rSpin 1s linear infinite' }}/> Analyzing repo…</> : <><Sparkles size={13}/> AI Pipeline Analysis</>}
                        </button>
                    )}
                </div>
            </div>

            {ai.loading && (
                <Panel title="Analyzing Repository…" icon={Sparkles}>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {['Inferring build pipeline','Estimating deployment patterns','Checking CI/CD health'].map((s,i)=>(
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <Loader size={12} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/>
                                <div className="r8-shimmer" style={{ height:12, flex:1, borderRadius:4 }}/>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}

            {ai.error && (
                <Panel title="Error" icon={AlertCircle}>
                    <div style={{ padding:12, borderRadius:8, background:`${THEME.danger}10`, fontSize:12, color:THEME.danger }}>{ai.error}</div>
                </Panel>
            )}

            {ai.result && ai.mode === 'repo' && (() => {
                const r = ai.result;
                const hc = r.overallHealthScore >= 80 ? THEME.success : r.overallHealthScore >= 60 ? THEME.warning : THEME.danger;
                return (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                            <MetricCard label="Health Score"    value={`${r.overallHealthScore}/100`} icon={Activity}  color={hc}/>
                            <MetricCard label="Architecture"    value={r.architecturePattern}          icon={Workflow}  color={THEME.primary}/>
                            <MetricCard label="Tech Debt"       value={r.techDebtEstimate}             icon={Wrench}    color={THEME.warning}/>
                            <MetricCard label="Security"        value={r.securityPosture}              icon={Shield}    color={THEME.info}/>
                        </div>
                        <Panel title="AI Pipeline Insights" icon={Sparkles}
                               rightNode={<button onClick={ai.reset} style={{ background:'none', border:'none', cursor:'pointer', color:THEME.textDim, padding:4, borderRadius:5 }}><X size={13}/></button>}>
                            <p style={{ fontSize:12, color:THEME.textDim, marginBottom:16, lineHeight:1.6 }}>{r.repoSummary}</p>
                            <SectionTitle icon={Lightbulb}>Quick Wins</SectionTitle>
                            {r.quickWins?.map((w,i)=>(
                                <div key={i} style={{ display:'flex', gap:10, marginBottom:10, padding:'9px 12px', borderRadius:8, background:`${THEME.success}06`, border:`1px solid ${THEME.success}15` }}>
                                    <CheckCircle size={13} color={THEME.success} style={{ flexShrink:0, marginTop:1 }}/>
                                    <span style={{ fontSize:11.5, color:THEME.textMuted }}>{w}</span>
                                </div>
                            ))}
                        </Panel>
                        {r.topRisks?.length > 0 && (
                            <Panel title="Top Risks" icon={AlertTriangle}>
                                {r.topRisks.map((risk,i)=>{
                                    const col = {critical:THEME.danger,high:THEME.danger,medium:THEME.warning,low:THEME.info}[risk.severity]||THEME.textDim;
                                    return (
                                        <div key={i} style={{ marginBottom:10, padding:12, borderRadius:9, background:`${col}08`, border:`1px solid ${col}20` }}>
                                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                                <span style={{ fontSize:12, fontWeight:700, color:THEME.textMain }}>{risk.risk}</span>
                                                <RiskBadge risk={risk.severity}/>
                                            </div>
                                            <p style={{ fontSize:11, color:THEME.textDim, margin:0, lineHeight:1.5 }}>{risk.description}</p>
                                        </div>
                                    );
                                })}
                            </Panel>
                        )}
                    </div>
                );
            })()}

            {!ai.loading && !ai.result && !ai.error && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
                    <Panel title="Connect CI/CD" icon={Workflow}>
                        {['GitHub Actions', 'GitLab CI', 'CircleCI', 'Jenkins', 'Buildkite'].map((ci,i)=>(
                            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, marginBottom:8 }}>
                                <span style={{ fontSize:12.5, fontWeight:600, color:THEME.textMuted }}>{ci}</span>
                                <button className="r8-btn r8-btn-g r8-btn-sm">Connect</button>
                            </div>
                        ))}
                    </Panel>
                    <Panel title="What you'll see" icon={Eye}>
                        {['Real-time build status & logs','Deployment history & rollback','Test coverage trends','Build time metrics','Failure root-cause analysis'].map((f,i)=>(
                            <div key={i} style={{ display:'flex', gap:8, marginBottom:9, padding:'8px 10px', borderRadius:7, background:`${THEME.primary}06` }}>
                                <CheckCircle size={12} color={THEME.primary} style={{ flexShrink:0, marginTop:1 }}/>
                                <span style={{ fontSize:11.5, color:THEME.textMuted }}>{f}</span>
                            </div>
                        ))}
                    </Panel>
                </div>
            )}
        </div>
    );
};


/* ═══════════════════════════════════════════════════════════════════════════
   PULL REQUESTS VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const PullRequestView = ({ activeRepo }) => {
    const ai = useAIAnalysis();

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ padding:20, borderRadius:14, background:`${THEME.primary}06`, border:`1px solid ${THEME.primary}18`, display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{ width:44, height:44, borderRadius:11, background:`${THEME.primary}14`, border:`1px solid ${THEME.primary}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <GitPullRequest size={20} color={THEME.primary}/>
                </div>
                <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:THEME.textMain, marginBottom:4 }}>Pull Request Intelligence</div>
                    <div style={{ fontSize:12, color:THEME.textDim, lineHeight:1.6, marginBottom:12 }}>
                        Connect your GitHub/GitLab token to pull live PR data. AI can score PRs, detect risk, and flag breaking changes automatically.
                        Use AI Repo Analysis to get estimated PR health based on your repository.
                    </div>
                    {activeRepo && (
                        <button onClick={()=>ai.analyzeRepo({ repoName: activeRepo.name, repoPath: activeRepo.url, repoType: activeRepo.type })}
                                disabled={ai.loading} className="r8-btn r8-btn-p">
                            {ai.loading ? <><Loader size={13} style={{ animation:'rSpin 1s linear infinite' }}/> Analyzing…</> : <><Sparkles size={13}/> AI PR Risk Analysis</>}
                        </button>
                    )}
                </div>
            </div>

            {ai.loading && (
                <Panel title="Analyzing…" icon={Sparkles}>
                    {['Estimating PR patterns','Scanning for risk factors','Evaluating code churn'].map((s,i)=>(
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                            <Loader size={12} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/>
                            <div className="r8-shimmer" style={{ height:12, flex:1, borderRadius:4 }}/>
                        </div>
                    ))}
                </Panel>
            )}
            {ai.error && <Panel title="Error" icon={AlertCircle}><div style={{ padding:12, borderRadius:8, background:`${THEME.danger}10`, fontSize:12, color:THEME.danger }}>{ai.error}</div></Panel>}

            {ai.result && ai.mode === 'repo' && (() => {
                const r = ai.result;
                return (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                        <Panel title="AI PR Insights" icon={Sparkles}
                               rightNode={<button onClick={ai.reset} style={{ background:'none', border:'none', cursor:'pointer', color:THEME.textDim, padding:4, borderRadius:5 }}><X size={13}/></button>}>
                            <p style={{ fontSize:12, color:THEME.textDim, marginBottom:14, lineHeight:1.6 }}>{r.repoSummary}</p>
                            {r.insights?.filter(i=>i.category==='Maintainability'||i.category==='Testing').map((ins,i)=>(
                                <div key={i} style={{ marginBottom:10, padding:12, borderRadius:9, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                    <div style={{ fontSize:9.5, fontWeight:700, color:THEME.primary, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{ins.category}</div>
                                    <div style={{ fontSize:12, fontWeight:600, color:THEME.textMain, marginBottom:4 }}>{ins.finding}</div>
                                    <div style={{ fontSize:11, color:THEME.info }}>{ins.recommendation}</div>
                                </div>
                            ))}
                        </Panel>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                            <MetricCard label="Code Quality"  value={`${r.metricsEstimate?.codeQuality}/100`}  icon={Activity} color={THEME.primary}/>
                            <MetricCard label="Test Coverage" value={`${r.metricsEstimate?.testCoverage}%`}    icon={CheckCircle} color={THEME.success}/>
                            <MetricCard label="Documentation" value={`${r.metricsEstimate?.documentation}%`}   icon={FileText} color={THEME.warning}/>
                            <MetricCard label="Security"      value={`${r.metricsEstimate?.securityScore}/100`} icon={Shield}  color={THEME.info}/>
                        </div>
                    </div>
                );
            })()}

            {!ai.loading && !ai.result && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <Panel title="Connect GitHub / GitLab" icon={Github}>
                        <div style={{ fontSize:12, color:THEME.textDim, marginBottom:14, lineHeight:1.6 }}>
                            Provide a personal access token to enable live PR data, automated scoring, and review assignment AI.
                        </div>
                        <div style={{ marginBottom:10 }}>
                            <label style={{ fontSize:10.5, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Access Token</label>
                            <input placeholder="ghp_xxxxxxxxxxxx" style={{ width:'100%', padding:'9px 12px', background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, borderRadius:8, color:THEME.textMain, outline:'none', fontSize:12, fontFamily:'JetBrains Mono,monospace', boxSizing:'border-box' }}/>
                        </div>
                        <button className="r8-btn r8-btn-p"><Github size={13}/> Connect GitHub</button>
                    </Panel>
                    <Panel title="AI PR Scoring" icon={Gauge}>
                        {['Risk impact detection (breaking changes, DB migrations)','Auto-labelling by domain & complexity','Test coverage delta calculation','Security vulnerability scanning','Reviewer recommendation engine'].map((f,i)=>(
                            <div key={i} style={{ display:'flex', gap:8, marginBottom:9 }}>
                                <Sparkles size={11} color={THEME.primary} style={{ flexShrink:0, marginTop:2 }}/>
                                <span style={{ fontSize:11.5, color:THEME.textMuted }}>{f}</span>
                            </div>
                        ))}
                    </Panel>
                </div>
            )}
        </div>
    );
};


/* ═══════════════════════════════════════════════════════════════════════════
   DATABASE VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const DatabaseView = ({ activeRepo }) => {
    const [sql, setSql]             = useState('');
    const [analysis, setAnalysis]   = useState(null);
    const [aiMigration, setAiMig]   = useState({ loading:false, result:null, error:null });

    const analyzeSQL = useCallback(() => {
        const u = sql.toUpperCase();
        let risk='LOW', msg='Standard or additive operation. Safe to run.';
        if (u.includes('DROP TABLE')||u.includes('TRUNCATE')) { risk='CRITICAL'; msg='Destructive operation — irreversible data loss possible.'; }
        else if (u.includes('DROP')||u.includes('ALTER'))    { risk='HIGH';     msg='Modifies existing schema. Ensure rollback plan exists.'; }
        else if (u.includes('UPDATE')||u.includes('DELETE')) { risk='MEDIUM';   msg='Bulk data mutation. Test on staging first.'; }
        setAnalysis({ risk, msg });
    }, [sql]);

    const aiAnalyzeSQL = useCallback(async () => {
        if (!sql.trim()) return;
        setAiMig({ loading:true, result:null, error:null });
        try {
            const system = 'You are a database expert. Respond with valid JSON only — no markdown.';
            const prompt = `Analyze this SQL migration:
\`\`\`sql
${sql.slice(0, 2000)}
\`\`\`

Respond with JSON:
{
  "risk": "LOW|MEDIUM|HIGH|CRITICAL",
  "summary": "<what this migration does>",
  "concerns": ["<concern1>", "<concern2>"],
  "rollbackPlan": "<how to safely rollback>",
  "bestPractices": ["<recommendation1>", "<recommendation2>"],
  "estimatedDuration": "<for tables with millions of rows>",
  "lockingImpact": "<table-level lock|row-level lock|no lock>",
  "safeToRunLive": <true|false>
}`;
            const resp = await fetch('https://api.anthropic.com/v1/messages', {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, system, messages:[{role:'user',content:prompt}] }),
            });
            const data = await resp.json();
            const raw = data.content?.map(b=>b.text||'').join('') || '';
            const clean = raw.replace(/```json|```/g,'').trim();
            const result = JSON.parse(clean);
            setAiMig({ loading:false, result, error:null });
        } catch(e) {
            setAiMig({ loading:false, result:null, error:e.message });
        }
    }, [sql]);

    const RC = { CRITICAL:THEME.danger, HIGH:THEME.danger, MEDIUM:THEME.warning, LOW:THEME.success };

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ padding:16, borderRadius:12, background:THEME.glass, border:`1px solid ${THEME.glassBorder}` }}>
                <SectionTitle icon={Shield}>Migration Risk Assessment</SectionTitle>
                <div style={{ fontSize:12, color:THEME.textDim, marginBottom:12, lineHeight:1.6 }}>
                    Paste any SQL migration below for instant risk scoring plus AI-powered deep analysis with rollback planning.
                </div>
                <div style={{ marginBottom:10 }}>
                    <textarea value={sql} onChange={e=>setSql(e.target.value)} placeholder="Paste migration SQL to assess risk…"
                              style={{ width:'100%', background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, borderRadius:8, padding:'10px 12px', color:THEME.textMuted, fontSize:11.5, fontFamily:'JetBrains Mono,monospace', resize:'none', height:90, outline:'none', boxSizing:'border-box' }}/>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                    <button onClick={analyzeSQL} disabled={!sql.trim()} className="r8-btn r8-btn-c" style={{ opacity:!sql.trim()?0.5:1 }}><Shield size={13}/> Quick Check</button>
                    <button onClick={aiAnalyzeSQL} disabled={!sql.trim()||aiMigration.loading} className="r8-btn r8-btn-p" style={{ opacity:!sql.trim()?0.5:1 }}>
                        {aiMigration.loading ? <><Loader size={13} style={{ animation:'rSpin 1s linear infinite' }}/> AI Analyzing…</> : <><Sparkles size={13}/> AI Deep Analysis</>}
                    </button>
                </div>

                {analysis && !aiMigration.result && (
                    <div style={{ marginTop:10, padding:'10px 12px', borderRadius:8, background:`${RC[analysis.risk]}10`, display:'flex', gap:8 }}>
                        {analysis.risk==='LOW'?<CheckCircle size={13} color={RC[analysis.risk]} style={{ marginTop:1 }}/>:<AlertTriangle size={13} color={RC[analysis.risk]} style={{ marginTop:1 }}/>}
                        <div>
                            <div style={{ fontSize:11.5, fontWeight:700, color:RC[analysis.risk] }}>Risk: {analysis.risk}</div>
                            <div style={{ fontSize:11, color:THEME.textDim, marginTop:2 }}>{analysis.msg}</div>
                        </div>
                    </div>
                )}

                {aiMigration.loading && (
                    <div style={{ marginTop:10, padding:12, borderRadius:8, background:`${THEME.primary}06`, border:`1px solid ${THEME.primary}15`, display:'flex', gap:10, alignItems:'center' }}>
                        <Loader size={14} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite', flexShrink:0 }}/>
                        <span style={{ fontSize:12, color:THEME.textDim }}>AI is analyzing your migration for risks, locking behavior, and rollback options…</span>
                    </div>
                )}

                {aiMigration.error && (
                    <div style={{ marginTop:10, padding:10, borderRadius:8, background:`${THEME.danger}10`, fontSize:11.5, color:THEME.danger }}>{aiMigration.error}</div>
                )}

                {aiMigration.result && (() => {
                    const r = aiMigration.result;
                    const col = RC[r.risk] || THEME.textDim;
                    return (
                        <div style={{ marginTop:10 }}>
                            <div style={{ padding:12, borderRadius:8, background:`${col}10`, border:`1px solid ${col}20`, marginBottom:10 }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                                    <span style={{ fontSize:13, fontWeight:800, color:col }}>Risk: {r.risk}</span>
                                    <div style={{ display:'flex', gap:8 }}>
                                        <StatusBadge label={r.lockingImpact} color={THEME.warning} size="sm"/>
                                        <StatusBadge label={r.safeToRunLive?'Safe Live':'Risky Live'} color={r.safeToRunLive?THEME.success:THEME.danger} size="sm"/>
                                    </div>
                                </div>
                                <p style={{ fontSize:12, color:THEME.textMuted, margin:'0 0 8px', lineHeight:1.5 }}>{r.summary}</p>
                                <div style={{ fontSize:11, color:THEME.textDim }}>Est. duration: <b style={{ color:THEME.textMuted }}>{r.estimatedDuration}</b></div>
                            </div>
                            {r.concerns?.length > 0 && (
                                <div style={{ marginBottom:10 }}>
                                    <div style={{ fontSize:10, fontWeight:700, color:THEME.warning, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Concerns</div>
                                    {r.concerns.map((c,i)=>(
                                        <div key={i} style={{ display:'flex', gap:7, marginBottom:5, fontSize:11.5, color:THEME.textMuted }}>
                                            <AlertTriangle size={11} color={THEME.warning} style={{ flexShrink:0, marginTop:2 }}/>{c}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ padding:10, borderRadius:8, background:`${THEME.info}08`, border:`1px solid ${THEME.info}18` }}>
                                <div style={{ fontSize:10, fontWeight:700, color:THEME.info, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>Rollback Plan</div>
                                <p style={{ fontSize:11.5, color:THEME.textMuted, margin:0, lineHeight:1.5 }}>{r.rollbackPlan}</p>
                            </div>
                        </div>
                    );
                })()}
            </div>

            <Panel title="Database Migrations" icon={Database}>
                <div style={{ padding:14, borderRadius:10, background:`${THEME.primary}06`, border:`1px solid ${THEME.primary}15`, display:'flex', gap:10, alignItems:'flex-start' }}>
                    <Database size={14} color={THEME.primary} style={{ flexShrink:0, marginTop:2 }}/>
                    <div>
                        <div style={{ fontSize:12.5, fontWeight:700, color:THEME.primary, marginBottom:4 }}>No migration history connected</div>
                        <div style={{ fontSize:11.5, color:THEME.textDim, lineHeight:1.6 }}>
                            Connect a database (PostgreSQL, MySQL, SQLite) or migration tool (Flyway, Liquibase, Alembic, Prisma) to see applied migrations, pending changes, and schema history.
                        </div>
                    </div>
                </div>
                <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                    {['PostgreSQL', 'MySQL / MariaDB', 'SQLite', 'MongoDB', 'Prisma', 'Alembic'].map((db,i)=>(
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                            <span style={{ fontSize:12, fontWeight:600, color:THEME.textMuted }}>{db}</span>
                            <button className="r8-btn r8-btn-g r8-btn-sm">Connect</button>
                        </div>
                    ))}
                </div>
            </Panel>
        </div>
    );
};


/* ═══════════════════════════════════════════════════════════════════════════
   INSIGHTS VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const InsightsView = ({ activeRepo }) => {
    const ai = useAIAnalysis();
    const [tab, setTab] = useState('overview');

    const TABS = [
        { id:'overview',  label:'Overview',     icon:Activity },
        { id:'security',  label:'Security',     icon:Shield },
        { id:'perf',      label:'Performance',  icon:Zap },
        { id:'ai',        label:'AI Analysis',  icon:Sparkles },
    ];

    const runAnalysis = () => {
        if (!activeRepo) return;
        ai.analyzeRepo({ repoName: activeRepo.name, repoPath: activeRepo.url, repoType: activeRepo.type });
    };

    const r = ai.result;

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
            {/* Header row */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
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
                <button onClick={runAnalysis} disabled={!activeRepo||ai.loading} className="r8-btn r8-btn-p" style={{ opacity:!activeRepo?0.5:1 }}>
                    {ai.loading ? <><Loader size={13} style={{ animation:'rSpin 1s linear infinite' }}/> Analyzing…</> : <><Sparkles size={13}/> Run AI Analysis</>}
                </button>
            </div>

            <div className="r8-scroll" style={{ flex:1, minHeight:0, overflowY:'auto' }}>
                {/* Loading */}
                {ai.loading && (
                    <Panel title="AI is analyzing your repository…" icon={Sparkles}>
                        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                            {['Scanning code patterns','Evaluating security posture','Measuring complexity metrics','Estimating tech debt','Generating recommendations'].map((s,i)=>(
                                <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                                    <Loader size={12} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite', flexShrink:0 }}/>
                                    <div className="r8-shimmer" style={{ height:14, flex:1, borderRadius:4 }}/>
                                </div>
                            ))}
                        </div>
                    </Panel>
                )}

                {/* Error */}
                {ai.error && (
                    <Panel title="Analysis Error" icon={AlertCircle}>
                        <div style={{ padding:12, borderRadius:8, background:`${THEME.danger}10`, fontSize:12, color:THEME.danger }}>{ai.error}</div>
                    </Panel>
                )}

                {/* Empty state */}
                {!ai.loading && !ai.result && !ai.error && (
                    <div style={{ padding:'60px 20px', textAlign:'center', border:`2px dashed ${THEME.glassBorder}`, borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
                        <div style={{ width:60, height:60, borderRadius:14, background:`${THEME.primary}10`, border:`1px solid ${THEME.primary}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Sparkles size={26} color={`${THEME.primary}60`}/>
                        </div>
                        <div>
                            <div style={{ fontSize:16, fontWeight:800, color:THEME.textMuted, marginBottom:8 }}>AI-Powered Repository Insights</div>
                            <div style={{ fontSize:12.5, color:THEME.textDim, marginBottom:20, maxWidth:360, lineHeight:1.7 }}>
                                Click <b style={{ color:THEME.primary }}>Run AI Analysis</b> to get a comprehensive review of your repository including code health, security posture, tech debt, performance patterns, and prioritized recommendations.
                            </div>
                            {!activeRepo && <div style={{ fontSize:11.5, color:THEME.warning, padding:'8px 14px', borderRadius:8, background:`${THEME.warning}10`, border:`1px solid ${THEME.warning}20` }}>Select a repository first</div>}
                        </div>
                    </div>
                )}

                {/* Results */}
                {r && !ai.loading && (() => {
                    const hc = r.overallHealthScore >= 80 ? THEME.success : r.overallHealthScore >= 60 ? THEME.warning : THEME.danger;

                    if (tab === 'overview') return (
                        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                            {/* Score cards */}
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }} className="r8-stagger">
                                <MetricCard label="Overall Health" value={`${r.overallHealthScore}/100`} icon={Activity}    color={hc}/>
                                <MetricCard label="Code Quality"   value={`${r.metricsEstimate?.codeQuality}/100`} icon={Code}  color={THEME.primary}/>
                                <MetricCard label="Security"       value={`${r.metricsEstimate?.securityScore}/100`} icon={Shield} color={THEME.info}/>
                                <MetricCard label="Tech Debt"      value={r.techDebtEstimate}              icon={Wrench}   color={THEME.warning}/>
                            </div>

                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                                <Panel title="Repository Summary" icon={Activity}>
                                    <p style={{ fontSize:12.5, color:THEME.textDim, lineHeight:1.7, marginBottom:16 }}>{r.repoSummary}</p>
                                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                                        {r.primaryLanguages?.map((l,i)=>(
                                            <span key={i} style={{ padding:'3px 10px', borderRadius:6, fontSize:10.5, fontWeight:700, background:`${THEME.primary}12`, color:THEME.primary, border:`1px solid ${THEME.primary}20` }}>{l}</span>
                                        ))}
                                        <span style={{ padding:'3px 10px', borderRadius:6, fontSize:10.5, fontWeight:700, background:`${THEME.info}12`, color:THEME.info, border:`1px solid ${THEME.info}20` }}>{r.architecturePattern}</span>
                                    </div>
                                    <Divider/>
                                    {[
                                        { label:'Test Coverage',   value: r.metricsEstimate?.testCoverage,  color: THEME.success },
                                        { label:'Documentation',   value: r.metricsEstimate?.documentation, color: THEME.warning },
                                        { label:'Code Quality',    value: r.metricsEstimate?.codeQuality,   color: THEME.primary },
                                        { label:'Security Score',  value: r.metricsEstimate?.securityScore, color: THEME.info    },
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

                                <Panel title="Quick Wins & Insights" icon={Lightbulb}>
                                    <SectionTitle>Quick Wins</SectionTitle>
                                    {r.quickWins?.map((w,i)=>(
                                        <div key={i} style={{ display:'flex', gap:8, marginBottom:10, padding:'9px 12px', borderRadius:8, background:`${THEME.success}06`, border:`1px solid ${THEME.success}15` }}>
                                            <CheckCircle size={12} color={THEME.success} style={{ flexShrink:0, marginTop:2 }}/>
                                            <span style={{ fontSize:11.5, color:THEME.textMuted, lineHeight:1.5 }}>{w}</span>
                                        </div>
                                    ))}
                                    <Divider/>
                                    <SectionTitle>Top Insights</SectionTitle>
                                    {r.insights?.slice(0,3).map((ins,i)=>(
                                        <div key={i} style={{ marginBottom:10, padding:11, borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                            <div style={{ fontSize:9.5, fontWeight:700, color:THEME.primary, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>{ins.category}</div>
                                            <div style={{ fontSize:12, fontWeight:600, color:THEME.textMain, marginBottom:4 }}>{ins.finding}</div>
                                            <div style={{ fontSize:11, color:THEME.info }}>{ins.recommendation}</div>
                                        </div>
                                    ))}
                                </Panel>
                            </div>
                        </div>
                    );

                    if (tab === 'security') return (
                        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                                <MetricCard label="Security Score"  value={`${r.metricsEstimate?.securityScore}/100`} icon={Shield} color={THEME.info}/>
                                <MetricCard label="Security Posture" value={r.securityPosture} icon={AlertTriangle} color={r.securityPosture==='strong'?THEME.success:r.securityPosture==='moderate'?THEME.warning:THEME.danger}/>
                                <MetricCard label="Critical Risks"  value={r.topRisks?.filter(x=>x.severity==='critical'||x.severity==='high').length||0} icon={Flame} color={THEME.danger}/>
                            </div>
                            <Panel title="Risk Analysis" icon={AlertTriangle}>
                                {r.topRisks?.length > 0 ? r.topRisks.map((risk,i)=>{
                                    const col = {critical:THEME.danger,high:THEME.danger,medium:THEME.warning,low:THEME.info}[risk.severity]||THEME.textDim;
                                    return (
                                        <div key={i} style={{ marginBottom:12, padding:14, borderRadius:10, background:`${col}08`, border:`1px solid ${col}20` }}>
                                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                                                <span style={{ fontSize:13, fontWeight:700, color:THEME.textMain }}>{risk.risk}</span>
                                                <RiskBadge risk={risk.severity}/>
                                            </div>
                                            <p style={{ fontSize:11.5, color:THEME.textDim, margin:0, lineHeight:1.6 }}>{risk.description}</p>
                                        </div>
                                    );
                                }) : (
                                    <div style={{ padding:14, borderRadius:10, background:`${THEME.success}08`, border:`1px solid ${THEME.success}20`, display:'flex', gap:10 }}>
                                        <CheckCircle size={13} color={THEME.success}/>
                                        <span style={{ fontSize:12, color:THEME.success, fontWeight:600 }}>No critical security risks detected</span>
                                    </div>
                                )}
                            </Panel>
                            <Panel title="Security Insights" icon={Shield}>
                                {r.insights?.filter(i=>i.category==='Security').map((ins,i)=>(
                                    <div key={i} style={{ marginBottom:10, padding:12, borderRadius:9, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                        <div style={{ fontSize:12, fontWeight:600, color:THEME.textMain, marginBottom:4 }}>{ins.finding}</div>
                                        <div style={{ fontSize:11, color:THEME.info }}>{ins.recommendation}</div>
                                    </div>
                                ))}
                            </Panel>
                        </div>
                    );

                    if (tab === 'perf') return (
                        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                            <Panel title="Performance Insights" icon={Zap}>
                                {r.insights?.filter(i=>i.category==='Performance').length > 0
                                    ? r.insights.filter(i=>i.category==='Performance').map((ins,i)=>(
                                        <div key={i} style={{ marginBottom:10, padding:12, borderRadius:9, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                            <div style={{ fontSize:12, fontWeight:600, color:THEME.textMain, marginBottom:4 }}>{ins.finding}</div>
                                            <div style={{ fontSize:11, color:THEME.info }}>{ins.recommendation}</div>
                                        </div>
                                    ))
                                    : <div style={{ fontSize:12, color:THEME.textDim, padding:12 }}>No specific performance findings — paste code in the Code tab for file-level performance analysis.</div>
                                }
                            </Panel>
                            <Panel title="Maintainability" icon={Wrench}>
                                {r.insights?.filter(i=>i.category==='Maintainability').map((ins,i)=>(
                                    <div key={i} style={{ marginBottom:10, padding:12, borderRadius:9, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                        <div style={{ fontSize:12, fontWeight:600, color:THEME.textMain, marginBottom:4 }}>{ins.finding}</div>
                                        <div style={{ fontSize:11, color:THEME.info }}>{ins.recommendation}</div>
                                    </div>
                                ))}
                                <div style={{ marginTop:12 }}>
                                    {[
                                        { label:'Code Quality',  value:r.metricsEstimate?.codeQuality,  color:THEME.primary },
                                        { label:'Test Coverage', value:r.metricsEstimate?.testCoverage, color:THEME.success },
                                        { label:'Documentation', value:r.metricsEstimate?.documentation,color:THEME.warning },
                                    ].map((item,i)=>(
                                        <div key={i} style={{ marginBottom:12 }}>
                                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                                <span style={{ fontSize:11.5, color:THEME.textMuted }}>{item.label}</span>
                                                <span style={{ fontSize:11.5, fontWeight:700, color:item.color, fontFamily:'JetBrains Mono,monospace' }}>{item.value}%</span>
                                            </div>
                                            <ProgressBar value={item.value} color={item.color} height={5}/>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        </div>
                    );

                    if (tab === 'ai') return (
                        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                            <Panel title="Full AI Report" icon={Sparkles}
                                   rightNode={<button onClick={ai.reset} style={{ background:'none', border:'none', cursor:'pointer', color:THEME.textDim, padding:4, borderRadius:5 }}><X size={13}/></button>}>
                                <p style={{ fontSize:13, color:THEME.textDim, lineHeight:1.7, marginBottom:16 }}>{r.repoSummary}</p>
                                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                                    <StatusBadge label={`${r.estimatedSize} repo`} color={THEME.primary} size="sm"/>
                                    <StatusBadge label={r.architecturePattern} color={THEME.secondary} size="sm"/>
                                    <StatusBadge label={`Tech debt: ${r.techDebtEstimate}`} color={r.techDebtEstimate==='low'?THEME.success:r.techDebtEstimate==='medium'?THEME.warning:THEME.danger} size="sm"/>
                                    <StatusBadge label={`Security: ${r.securityPosture}`} color={r.securityPosture==='strong'?THEME.success:r.securityPosture==='moderate'?THEME.warning:THEME.danger} size="sm"/>
                                </div>
                            </Panel>
                            <Panel title="All Insights" icon={Activity}>
                                {r.insights?.map((ins,i)=>(
                                    <div key={i} style={{ marginBottom:12, padding:12, borderRadius:9, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                            <span style={{ fontSize:9.5, fontWeight:700, color:THEME.primary, textTransform:'uppercase', letterSpacing:'0.07em' }}>{ins.category}</span>
                                        </div>
                                        <div style={{ fontSize:12, fontWeight:600, color:THEME.textMain, marginBottom:4 }}>{ins.finding}</div>
                                        <div style={{ fontSize:11, color:THEME.info, padding:'6px 9px', borderRadius:6, background:`${THEME.info}08` }}>{ins.recommendation}</div>
                                    </div>
                                ))}
                            </Panel>
                        </div>
                    );

                    return null;
                })()}
            </div>
        </div>
    );
};


const LOCAL_PATHS = ['~/Projects/', '~/Documents/code/', '/home/dev/repos/', 'C:\\Projects\\', '/workspace/'];

const LocalRepoForm = ({ onConnect, onClose }) => {
    const [path, setPath]       = useState('');
    const [name, setName]       = useState('');
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(null);

    const scan = () => {
        if (!path.trim()) return;
        setScanning(true);
        // Derive repo name from the path — no fake data injected
        setTimeout(() => {
            const trimmed = path.trim().replace(/[/\\]+$/, '');
            const detected = trimmed.split(/[/\\]/).filter(Boolean).pop() || 'local-repo';
            // Only record what we can actually know from the path
            setScanned({ name: detected, path: trimmed });
            setName(detected);
            setScanning(false);
        }, 400);
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
                        <span style={{ fontSize:12.5, fontWeight:700, color:THEME.info }}>Path accepted</span>
                    </div>
                    <div style={{ padding:'9px 11px', borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, marginBottom:14 }}>
                        <div style={{ fontSize:9.5, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700, marginBottom:4 }}>Resolved Path</div>
                        <span style={{ fontSize:12, fontWeight:700, color:THEME.textMain, fontFamily:'JetBrains Mono,monospace', wordBreak:'break-all' }}>{scanned.path}</span>
                    </div>
                    <div style={{ padding:'9px 11px', borderRadius:8, background:`${THEME.info}06`, border:`1px solid ${THEME.info}15`, marginBottom:14, fontSize:11.5, color:THEME.textDim, lineHeight:1.6 }}>
                        <b style={{ color:THEME.info }}>Note:</b> Git metadata (branch, commits, file count) will be read from the repository on your local machine at runtime.
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
                <button onClick={connect} disabled={!path.trim()} className="r8-btn r8-btn-p" style={{ opacity:!path.trim() ? 0.5 : 1 }}>
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
                {subView==='code'     && <CodeView activeRepo={activeRepo}/>}
                {subView==='cicd'     && <Panel title="CI/CD Pipelines" icon={RocketIcon} style={{ height:'100%', overflowY:'auto' }}><CICDView activeRepo={activeRepo}/></Panel>}
                {subView==='prs'      && <Panel title="Pull Request Analysis" icon={GitPullRequest} style={{ height:'100%', overflowY:'auto' }}><PullRequestView activeRepo={activeRepo}/></Panel>}
                {subView==='db'       && <Panel title="Database & Migrations" icon={Database} style={{ height:'100%', overflowY:'auto' }}><DatabaseView activeRepo={activeRepo}/></Panel>}
                {subView==='insights' && <InsightsView activeRepo={activeRepo}/>}
            </div>
        </div>
    );
};

export default RepositoryTab;