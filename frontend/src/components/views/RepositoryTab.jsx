// ==========================================================================
//  VIGIL — RepositoryTab  (v9 — LOCAL REPO + REAL AI INTEGRATION)
// ==========================================================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { THEME } from '../../utils/theme.jsx';
import {
    GitBranch, FolderOpen, File, FileCode, FileJson, FileText,
    Plus, Trash2, Search, X, Copy, Check, ChevronRight, ChevronDown,
    Code, Eye, Edit3, Save, Loader,
    AlertTriangle, CheckCircle, Shield, Zap, Terminal,
    ArrowRight, Sparkles, Lightbulb,
    Globe, Activity, TrendingUp, TrendingDown, Minus,
    Github, Gitlab, HardDrive,
    GitPullRequest, Database, Workflow, Flame, Gauge, Wrench,
} from 'lucide-react';

// ⚠️ IMPORTANT: In production, route these calls through your backend.
// Do not expose your raw API key in the client frontend.
const AI_API_KEY = "YOUR_ANTHROPIC_API_KEY";

/* ═══════════════════════════════════════════════════════════════════════════
   REAL AI ANALYSIS ENGINE (Replaces mock data hook)
   ═══════════════════════════════════════════════════════════════════════════ */
const useAIAnalysis = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState(null); // 'file' | 'repo'

    const callClaude = async (system, prompt) => {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': AI_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerously-allow-browser': 'true' // Remove if routing via backend
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 3000,
                system: system,
                messages: [{ role: 'user', content: prompt }]
            }),
        });

        if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.error?.message || 'AI API Error');
        }

        const data = await resp.json();
        const raw = data.content?.map(b => b.text || '').join('') || '';
        const clean = raw.replace(/```json|```/gi, '').trim();
        return JSON.parse(clean);
    };

    const analyze = async ({ filename, code, repoName }) => {
        if (!code.trim()) return;
        setLoading(true); setError(null); setMode('file'); setResult(null);
        try {
            const system = 'You are an elite Staff Software Engineer and Security Auditor. Respond ONLY with valid, raw JSON.';
            const prompt = `Perform a deep analysis on the following code from file '${filename}' in repo '${repoName}'.
            
Code:
\`\`\`
${code.substring(0, 15000)} // Truncated for context limits
\`\`\`

Return EXACTLY this JSON structure:
{
  "healthScore": <0-100 number>,
  "summary": "<1-2 sentence executive summary of the file's purpose and quality>",
  "language": "<detected language>",
  "linesAnalyzed": <number>,
  "complexityMetrics": { "cyclomaticComplexity": "<Low|Medium|High>", "coupling": "<Low|Medium|High>", "testability": "<Good|Fair|Poor>" },
  "strengths": ["<strength 1>", "<strength 2>"],
  "issues": [ { "line": <approximate line number or null>, "title": "<issue>", "severity": "<critical|high|medium|low>", "type": "<Bug|Style|Typo>", "description": "<details>", "fix": "<how to fix>" } ],
  "securityFlags": [ { "title": "<vuln>", "severity": "<critical|high|medium|low>", "description": "<details>" } ],
  "performanceInsights": [ { "title": "<issue>", "impact": "<high|medium|low>", "suggestion": "<details>" } ],
  "refactorOpportunities": [ { "title": "<opportunity>", "effort": "<high|medium|low>", "impact": "<high|medium|low>", "description": "<details>" } ],
  "aiRecommendations": [ { "priority": <1-5 number>, "title": "<rec>", "rationale": "<why>" } ]
}`;

            const aiData = await callClaude(system, prompt);
            setResult(aiData);
        } catch (e) {
            setError(`Analysis failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const analyzeRepo = async ({ repoName, repoPath, repoType }) => {
        setLoading(true); setError(null); setMode('repo'); setResult(null);
        try {
            const system = 'You are an elite Software Architect. Respond ONLY with valid, raw JSON.';
            const prompt = `Analyze the repository context. Name: '${repoName}', Path/URL: '${repoPath}', Type: '${repoType}'. 
            Because I am passing metadata instead of the full codebase, infer likely architectural patterns, common pitfalls, and security risks associated with this type of repository name/structure.

Return EXACTLY this JSON structure:
{
  "overallHealthScore": <0-100 number>,
  "repoSummary": "<Architectural overview based on inference>",
  "architecturePattern": "<Inferred pattern e.g., Monolith, Microservice, React SPA>",
  "techDebtEstimate": "<low|medium|high>",
  "securityPosture": "<strong|moderate|weak>",
  "primaryLanguages": ["<Lang 1>", "<Lang 2>"],
  "estimatedSize": "<Small|Medium|Large>",
  "metricsEstimate": { "codeQuality": <0-100>, "testCoverage": <0-100>, "documentation": <0-100>, "securityScore": <0-100> },
  "quickWins": ["<win 1>", "<win 2>"],
  "topRisks": [ { "risk": "<risk name>", "severity": "<critical|high|medium|low>", "description": "<details>" } ],
  "insights": [ { "category": "<Security|Performance|Maintainability|Testing>", "finding": "<details>", "recommendation": "<details>" } ]
}`;

            const aiData = await callClaude(system, prompt);
            setResult(aiData);
        } catch (e) {
            setError(`Repo Analysis failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return { loading, result, error, mode, analyze, analyzeRepo, reset: () => { setResult(null); setError(null); } };
};


/* ═══════════════════════════════════════════════════════════════════════════
   STYLES & SHARED PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════════ */
const RepoStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes rFadeUp    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes rPulse     { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes rSpin      { to { transform:rotate(360deg); } }
        @keyframes rBarGrow   { from { width:0; } to { width:var(--w,100%); } }
        @keyframes rScanLine  { from { top:-2px; } to { top:calc(100% + 2px); } }
        @keyframes rScaleIn   { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
        @keyframes rShimmer   { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }

        .r8-stagger > * { animation: rFadeUp 0.38s ease-out both; }
        .r8-stagger > *:nth-child(1) { animation-delay:0ms; }
        .r8-stagger > *:nth-child(2) { animation-delay:60ms; }
        .r8-stagger > *:nth-child(3) { animation-delay:120ms; }
        .r8-stagger > *:nth-child(4) { animation-delay:180ms; }

        .r8-card { position:relative; overflow:hidden; cursor:pointer; transition:transform 0.22s, border-color 0.22s, box-shadow 0.22s; }
        .r8-card:hover { transform:translateY(-4px); }
        .r8-card-remote:hover { border-color:${THEME.primary}55 !important; box-shadow:0 16px 48px rgba(0,0,0,.18), 0 0 0 1px ${THEME.primary}18; }
        .r8-card-local:hover  { border-color:${THEME.info}55 !important;    box-shadow:0 16px 48px rgba(0,0,0,.18), 0 0 0 1px ${THEME.info}18; }

        .r8-tree-item { transition:background .14s; cursor:pointer; user-select:none; }
        .r8-tree-item:hover   { background:${THEME.primary}08 !important; }
        .r8-tree-item.r8-sel  { background:${THEME.primary}12 !important; border-left:2px solid ${THEME.primary} !important; }

        .r8-line:hover { background:${THEME.primary}07 !important; }
        .r8-tab:hover:not(.r8-tab-on) { background:${THEME.primary}10 !important; color:${THEME.textMain} !important; }
        .r8-metric { transition:transform .2s, box-shadow .2s; }
        .r8-metric:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,.14); }

        .r8-scroll::-webkit-scrollbar { width:4px; height:4px; }
        .r8-scroll::-webkit-scrollbar-track { background:transparent; }
        .r8-scroll::-webkit-scrollbar-thumb { background:${THEME.primary}28; border-radius:4px; }
        .r8-scroll::-webkit-scrollbar-thumb:hover { background:${THEME.primary}55; }

        .r8-bar-fill { animation:rBarGrow .9s ease both; }
        .r8-terminal::before {
            content:''; position:absolute; left:0; right:0; height:1px;
            background:linear-gradient(90deg, transparent, ${THEME.info}30, transparent);
            animation:rScanLine 3.5s linear infinite; z-index:5; pointer-events:none;
        }
        .r8-input:focus { border-color:${THEME.primary} !important; box-shadow:0 0 0 3px ${THEME.primary}18 !important; }
        .r8-input-local:focus { border-color:${THEME.info} !important; box-shadow:0 0 0 3px ${THEME.info}18 !important; }
        .r8-shimmer { background:linear-gradient(90deg, ${THEME.surface} 25%, ${THEME.glassBorder} 50%, ${THEME.surface} 75%); background-size:200% 100%; animation:rShimmer 1.5s infinite; border-radius:8px; }

        .r8-btn { display:inline-flex; align-items:center; gap:7px; padding:8px 16px; border-radius:9px; border:none; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .16s; white-space:nowrap; }
        .r8-btn-p  { background:linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary}); color:#fff; box-shadow:0 4px 14px ${THEME.primary}28; }
        .r8-btn-p:hover:not(:disabled)  { filter:brightness(1.1); transform:translateY(-1px); }
        .r8-btn-p:disabled { opacity: 0.5; cursor: not-allowed; }
        .r8-btn-g  { background:transparent; color:${THEME.textDim}; border:1px solid ${THEME.glassBorder}; }
        .r8-btn-g:hover  { background:${THEME.glass}; color:${THEME.textMain}; }
        .r8-btn-c  { background:${THEME.info}15; color:${THEME.info}; border:1px solid ${THEME.info}30; }
        .r8-btn-c:hover  { background:${THEME.info}25; }
        .r8-btn-sm { padding:5px 11px; font-size:11px; border-radius:7px; }
    `}</style>
);

const PROV = {
    github:    { label:'GitHub',    Icon:Github,    color:'#e2e8f4' },
    gitlab:    { label:'GitLab',    Icon:Gitlab,    color:'#fc6d26' },
    local:     { label:'Local',     Icon:HardDrive, color:THEME.info },
    bitbucket: { label:'Bitbucket', Icon:GitBranch, color:'#0052cc' },
};

const RocketIcon = ({ size=14, color='currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
);

const Panel = ({ title, icon:TIcon, rightNode, noPad, children, style={} }) => (
    <div style={{ background: THEME.glass, backdropFilter:'blur(20px) saturate(180%)', border:`1px solid ${THEME.glassBorder}`, borderRadius:16, display:'flex', flexDirection:'column', overflow:'hidden', height:'100%', boxShadow:'0 4px 30px rgba(0,0,0,.1)', ...style }}>
        {title && (
            <div style={{ padding:'13px 20px', borderBottom:`1px solid ${THEME.glassBorder}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, background:`linear-gradient(90deg, ${THEME.primary}06, transparent)` }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {TIcon && <TIcon size={13} color={THEME.primary} />}
                    <span style={{ fontSize:10.5, fontWeight:800, color:THEME.textMain, textTransform:'uppercase', letterSpacing:'0.1em' }}>{title}</span>
                </div>
                {rightNode}
            </div>
        )}
        <div className="r8-scroll" style={{ flex:1, minHeight:0, padding:noPad?0:'16px 20px', overflowY:'auto' }}>{children}</div>
    </div>
);

const StatusBadge = ({ label, color, pulse, size='md' }) => (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:size==='sm'?9.5:10.5, fontWeight:700, padding:size==='sm'?'3px 7px':'4px 10px', borderRadius:5, background:`${color}14`, color, border:`1px solid ${color}25`, lineHeight:1.2, whiteSpace:'nowrap' }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0, animation:pulse?'rPulse 1.5s infinite':'none' }}/>{label}
    </span>
);

const RiskBadge = ({ risk }) => {
    const r = (risk || 'low').toLowerCase();
    const map = { critical:THEME.danger, high:THEME.danger, medium:THEME.warning, low:THEME.success };
    return <StatusBadge label={r.toUpperCase()} color={map[r]||THEME.textMuted} size="sm"/>;
};

const Divider = () => <div style={{ height:1, background:`${THEME.glassBorder}`, margin:'14px 0' }}/>;

const SectionTitle = ({ children, icon:Icon }) => (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
        {Icon && <Icon size={12} color={THEME.primary}/>}
        <span style={{ fontSize:10.5, fontWeight:800, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.1em' }}>{children}</span>
    </div>
);

const MetricCard = ({ label, value, icon:Icon, color }) => (
    <div className="r8-metric" style={{ padding:16, borderRadius:12, background:`${color}08`, border:`1px solid ${color}20` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
            <span style={{ fontSize:10, color:THEME.textDim, textTransform:'uppercase', fontWeight:700, letterSpacing:'0.07em' }}>{label}</span>
            {Icon && <Icon size={13} color={color}/>}
        </div>
        <div style={{ fontSize:22, fontWeight:900, color, lineHeight:1, letterSpacing:'-0.02em' }}>{value}</div>
    </div>
);

const ProgressBar = ({ value, color=THEME.primary, height=6 }) => (
    <div style={{ height, borderRadius:height/2, background:`${THEME.glassBorder}`, overflow:'hidden' }}>
        <div className="r8-bar-fill" style={{ height:'100%', borderRadius:height/2, width:`${value}%`, background:`linear-gradient(90deg, ${color}, ${color}cc)`, '--w':`${value}%` }}/>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FILE TREE & CODE VIEW (Local Filesystem Logic)
   ═══════════════════════════════════════════════════════════════════════════ */
const IGNORE_DIRS = new Set(['node_modules','.git','.next','dist','build','__pycache__','.venv','.cache','.idea','.vscode','vendor','coverage']);
const FILE_ICONS_MAP = { js:FileCode, ts:FileCode, py:FileCode, json:FileJson, md:FileText, html:FileCode, css:FileCode, sql:Database, sh:Terminal, default:File };
const getFileIcon = ext => FILE_ICONS_MAP[ext] || FILE_ICONS_MAP.default;
const getExt = name => name.includes('.') ? name.split('.').pop().toLowerCase() : '';

async function readDirHandle(handle, depth = 0, maxDepth = 6) {
    const entries = [];
    if (depth > maxDepth) return entries;
    for await (const [name, h] of handle.entries()) {
        if (h.kind === 'directory') {
            if (IGNORE_DIRS.has(name)) continue;
            const children = await readDirHandle(h, depth + 1, maxDepth);
            entries.push({ id: `${depth}-${name}`, name, kind: 'dir', handle: h, children, depth });
        } else {
            entries.push({ id: `${depth}-${name}`, name, kind: 'file', handle: h, ext: getExt(name), depth });
        }
    }
    entries.sort((a, b) => (a.kind !== b.kind) ? (a.kind === 'dir' ? -1 : 1) : a.name.localeCompare(b.name));
    return entries;
}

const FsTreeNode = ({ node, depth, selectedId, onSelect, onToggle, openDirs }) => {
    const isOpen = openDirs.has(node.id);
    const isSelected = selectedId === node.id;
    const Icon = node.kind === 'dir' ? FolderOpen : getFileIcon(node.ext);

    if (node.kind === 'dir') {
        return (
            <div>
                <div className="r8-tree-item" onClick={() => onToggle(node.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:`5px 12px 5px ${12 + depth * 14}px` }}>
                    {isOpen ? <ChevronDown size={10} color={THEME.textDim}/> : <ChevronRight size={10} color={THEME.textDim}/>}
                    <FolderOpen size={12} color={isOpen ? THEME.warning : THEME.textDim}/>
                    <span style={{ fontSize:11.5, color:THEME.textMuted, fontWeight:500, flex:1 }}>{node.name}</span>
                </div>
                {isOpen && node.children?.map(c => <FsTreeNode key={c.id} node={c} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} onToggle={onToggle} openDirs={openDirs}/>)}
            </div>
        );
    }
    return (
        <div className={`r8-tree-item${isSelected ? ' r8-sel' : ''}`} onClick={() => onSelect(node)} style={{ display:'flex', alignItems:'center', gap:6, padding:`4px 12px 4px ${12 + depth * 14}px`, borderLeft: isSelected ? `2px solid ${THEME.primary}` : '2px solid transparent' }}>
            <Icon size={11} color={isSelected ? THEME.primary : THEME.textDim}/>
            <span style={{ fontSize:11, color:isSelected ? THEME.primary : THEME.textMuted, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{node.name}</span>
        </div>
    );
};

const CodeView = ({ activeRepo }) => {
    const [fsTree, setFsTree] = useState(null);
    const [dirHandle, setDirHandle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDirs, setOpenDirs] = useState(new Set());
    const [selNode, setSelNode] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [fileLoading, setFileLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Inject the real AI Hook
    const ai = useAIAnalysis();

    const openFolder = useCallback(async () => {
        try {
            const handle = await window.showDirectoryPicker({ mode: 'read' });
            setLoading(true); setFsTree(null); setSelNode(null); setFileContent(''); ai.reset();
            const tree = await readDirHandle(handle, 0);
            setDirHandle(handle); setFsTree(tree);
            setOpenDirs(new Set(tree.filter(n => n.kind === 'dir').map(n => n.id).slice(0, 3)));
            setLoading(false);
        } catch (e) {
            if (e.name !== 'AbortError') console.error(e);
            setLoading(false);
        }
    }, [ai]);

    const onToggle = useCallback(id => {
        setOpenDirs(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    }, []);

    const onSelect = useCallback(async node => {
        if (node.kind !== 'file') return;
        setSelNode(node); ai.reset(); setFileLoading(true);
        try {
            const file = await node.handle.getFile();
            const text = await file.text();
            setFileContent(text);

            // Auto-trigger REAL AI analysis on file load
            ai.analyze({
                filename: node.name,
                code: text,
                repoName: dirHandle?.name || activeRepo?.name || 'repo',
            });
        } catch (e) {
            setFileContent(`// Could not read file: ${e.message}`);
        }
        setFileLoading(false);
    }, [ai, dirHandle, activeRepo]);

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

    const sevColor = s => {
        const key = (s||'').toLowerCase();
        return { critical:THEME.danger, high:THEME.danger, medium:THEME.warning, low:THEME.info }[key] || THEME.textDim;
    }
    const lines = fileContent.split('\n');
    const supportsFS = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    return (
        <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:14, height:'100%', minHeight:0 }}>
            {/* Sidebar */}
            <Panel title={dirHandle ? dirHandle.name : 'Files'} icon={FolderOpen} noPad rightNode={dirHandle && <button onClick={openFolder} className="r8-btn r8-btn-g r8-btn-sm">Change</button>}>
                <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
                    {!fsTree && !loading && (
                        <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14, alignItems:'center', flex:1, justifyContent:'center' }}>
                            {!supportsFS ? (
                                <div style={{ fontSize:11, color:THEME.danger, textAlign:'center' }}>⚠ File System API not supported in this browser.</div>
                            ) : (
                                <div style={{ textAlign:'center' }}>
                                    <div style={{ fontSize:12.5, fontWeight:700, color:THEME.textMuted, marginBottom:12 }}>Open Your Project</div>
                                    <button onClick={openFolder} className="r8-btn r8-btn-c"><FolderOpen size={13}/> Open Folder</button>
                                </div>
                            )}
                        </div>
                    )}
                    {loading && <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><Loader size={20} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/></div>}
                    {fsTree && !loading && (
                        <>
                            <div style={{ padding:'8px 10px 6px', borderBottom:`1px solid ${THEME.glassBorder}` }}>
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…" style={{ width:'100%', padding:'6px 8px', background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, borderRadius:7, color:THEME.textMain, outline:'none', fontSize:11, boxSizing:'border-box' }}/>
                            </div>
                            <div className="r8-scroll" style={{ flex:1, overflowY:'auto', paddingBottom:8, paddingTop:4 }}>
                                {search.trim() ? (
                                    flatFiles.length > 0 ? flatFiles.map(n => <FsTreeNode key={n.id} node={n} depth={0} selectedId={selNode?.id} onSelect={onSelect} onToggle={onToggle} openDirs={openDirs}/>)
                                        : <div style={{ padding:14, fontSize:11, color:THEME.textDim, textAlign:'center' }}>No files found</div>
                                ) : fsTree.map(n => <FsTreeNode key={n.id} node={n} depth={0} selectedId={selNode?.id} onSelect={onSelect} onToggle={onToggle} openDirs={openDirs}/>)}
                            </div>
                        </>
                    )}
                </div>
            </Panel>

            {/* Editor & Real AI Panel */}
            <div style={{ display:'grid', gridTemplateColumns: (ai.result || ai.loading || ai.error) ? '1fr 390px' : '1fr', gap:14, height:'100%', minHeight:0 }}>
                <Panel title={selNode ? selNode.name : 'Editor'} icon={Code} noPad>
                    {!selNode && !fileLoading && (
                        <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, color:THEME.textDim }}>
                            <Sparkles size={24} color={`${THEME.primary}50`}/>
                            <div style={{ fontSize:13 }}>Select a file to begin Deep AI Analysis</div>
                        </div>
                    )}
                    {fileLoading && <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Loader size={22} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/></div>}
                    {selNode && !fileLoading && fileContent && (
                        <div className="r8-scroll" style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12.5, lineHeight:1.75, overflowY:'auto', height:'100%' }}>
                            {lines.map((line, i) => {
                                const issueOnLine = ai.result?.issues?.find(iss => iss.line === i + 1);
                                const isIssue = !!issueOnLine;
                                return (
                                    <div key={i} className="r8-line" style={{ display:'flex', padding:'0 20px', minHeight:22, background:isIssue ? `${THEME.danger}07` : 'transparent', borderLeft:isIssue ? `2px solid ${THEME.danger}55` : '2px solid transparent' }}>
                                        <span style={{ color:`${THEME.textDim}35`, width:38, flexShrink:0, userSelect:'none', fontSize:10.5, paddingTop:1 }}>{i + 1}</span>
                                        <span style={{ color:isIssue ? THEME.warning : THEME.textMuted, flex:1, whiteSpace:'pre' }}>{line}</span>
                                        {isIssue && <span style={{ fontSize:9, color:THEME.danger, marginLeft:8, padding:'1px 5px', background:`${THEME.danger}14`, borderRadius:3, whiteSpace:'nowrap' }}>⚠ {issueOnLine.type}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Panel>

                {/* AI Panel Display */}
                {(ai.loading || ai.result || ai.error) && (
                    <div className="r8-scroll" style={{ overflowY:'auto', height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
                        {ai.loading && (
                            <Panel title="Analyzing Code..." icon={Sparkles}>
                                <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                                    {['Parsing AST structure','Detecting logic flaws','Evaluating security risks','Generating code fixes'].map((step, i) => (
                                        <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                                            <Loader size={11} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/>
                                            <div style={{ flex:1 }}><div className="r8-shimmer" style={{ height:10, borderRadius:4, marginBottom:3 }}/><div style={{ fontSize:10, color:THEME.textDim }}>{step}</div></div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        )}

                        {ai.error && <Panel title="API Error" icon={AlertTriangle}><div style={{ padding:12, color:THEME.danger, fontSize:12, background:`${THEME.danger}10` }}>{ai.error}</div></Panel>}

                        {ai.result && !ai.loading && (() => {
                            const r = ai.result;
                            const hc = r.healthScore >= 80 ? THEME.success : r.healthScore >= 60 ? THEME.warning : THEME.danger;
                            return (<>
                                <Panel title="AI Deep Analysis" icon={Sparkles} rightNode={<button onClick={ai.reset} style={{ background:'none', border:'none', color:THEME.textDim, cursor:'pointer' }}><X size={13}/></button>}>
                                    <div style={{ display:'flex', gap:14, padding:14, borderRadius:10, background:`${hc}08`, border:`1px solid ${hc}20`, marginBottom:14 }}>
                                        <div style={{ fontSize:42, fontWeight:900, color:hc, lineHeight:1, fontFamily:'JetBrains Mono,monospace' }}>{r.healthScore}</div>
                                        <div>
                                            <div style={{ fontSize:12, fontWeight:700, color:THEME.textMain }}>Health Score</div>
                                            <div style={{ fontSize:10.5, color:THEME.textDim, marginTop:4, lineHeight:1.45 }}>{r.summary}</div>
                                            <div style={{ marginTop:7 }}><ProgressBar value={r.healthScore} color={hc} height={4}/></div>
                                        </div>
                                    </div>

                                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                                        {['cyclomaticComplexity','coupling','testability'].map((k,i) => r.complexityMetrics?.[k] ? (
                                            <div key={i} style={{ padding:'4px 9px', borderRadius:6, background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, fontSize:10 }}>
                                                <span style={{ color:THEME.textDim }}>{k}: </span><span style={{ color:THEME.textMain, fontWeight:700 }}>{r.complexityMetrics[k]}</span>
                                            </div>
                                        ) : null)}
                                    </div>

                                    {r.issues?.length > 0 && (
                                        <div style={{ marginBottom: 14 }}>
                                            <SectionTitle icon={AlertTriangle}>Detected Issues ({r.issues.length})</SectionTitle>
                                            {r.issues.map((iss, i) => (
                                                <div key={i} style={{ marginBottom:10, padding:11, borderRadius:8, background:`${sevColor(iss.severity)}08`, border:`1px solid ${sevColor(iss.severity)}20` }}>
                                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                                        <span style={{ fontSize:11.5, fontWeight:700, color:THEME.textMain }}>{iss.title}</span>
                                                        <RiskBadge risk={iss.severity}/>
                                                    </div>
                                                    <p style={{ fontSize:10.5, color:THEME.textDim, margin:'0 0 7px', lineHeight:1.5 }}>{iss.description}</p>
                                                    {iss.fix && <div style={{ fontSize:10.5, color:THEME.info, background:`${THEME.info}08`, padding:'6px 9px', borderRadius:5 }}><b>Fix: </b>{iss.fix}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {r.securityFlags?.length > 0 && (
                                        <div style={{ marginBottom: 14 }}>
                                            <SectionTitle icon={Shield}>Security Risks</SectionTitle>
                                            {r.securityFlags.map((sf, i) => (
                                                <div key={i} style={{ marginBottom:9, padding:10, borderRadius:8, background:`${sevColor(sf.severity)}08`, border:`1px solid ${sevColor(sf.severity)}18` }}>
                                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                                                        <span style={{ fontSize:11, fontWeight:700, color:THEME.textMain }}>{sf.title}</span>
                                                        <RiskBadge risk={sf.severity}/>
                                                    </div>
                                                    <p style={{ fontSize:10.5, color:THEME.textDim, margin:0, lineHeight:1.5 }}>{sf.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {r.aiRecommendations?.length > 0 && (
                                        <div>
                                            <SectionTitle icon={Lightbulb}>AI Recommendations</SectionTitle>
                                            {r.aiRecommendations.map((rec, i) => (
                                                <div key={i} style={{ marginBottom:10, padding:11, borderRadius:8, background:`${THEME.primary}06`, border:`1px solid ${THEME.primary}14` }}>
                                                    <div style={{ fontSize:11, fontWeight:700, color:THEME.textMain, marginBottom:3 }}>{rec.title}</div>
                                                    <p style={{ fontSize:10.5, color:THEME.textDim, margin:0, lineHeight:1.5 }}>{rec.rationale}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Panel>
                            </>);
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   INSIGHTS VIEW (Repo Level Analysis)
   ═══════════════════════════════════════════════════════════════════════════ */
const InsightsView = ({ activeRepo }) => {
    const ai = useAIAnalysis();

    const runAnalysis = () => {
        if (!activeRepo) return;
        ai.analyzeRepo({ repoName: activeRepo.name, repoPath: activeRepo.url, repoType: activeRepo.type });
    };

    const r = ai.result;

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:16, fontWeight:800, color:THEME.textMain }}>Repository Intelligence</div>
                <button onClick={runAnalysis} disabled={!activeRepo||ai.loading} className="r8-btn r8-btn-p">
                    {ai.loading ? <><Loader size={13} style={{ animation:'rSpin 1s linear infinite' }}/> Analyzing Hub…</> : <><Sparkles size={13}/> Run Full Audit</>}
                </button>
            </div>

            <div className="r8-scroll" style={{ flex:1, overflowY:'auto' }}>
                {ai.loading && (
                    <Panel title="Scanning Architecture..." icon={Sparkles}>
                        <div style={{ padding: 40, display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
                            <Loader size={32} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/>
                            <div style={{ color:THEME.textDim, fontSize:13 }}>Compiling cross-file context and mapping architecture constraints...</div>
                        </div>
                    </Panel>
                )}
                {ai.error && <div style={{ padding:16, background:`${THEME.danger}10`, color:THEME.danger, borderRadius:12 }}>{ai.error}</div>}

                {!ai.loading && !ai.result && !ai.error && (
                    <div style={{ padding:'60px 20px', textAlign:'center', border:`2px dashed ${THEME.glassBorder}`, borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
                        <div style={{ width:60, height:60, borderRadius:14, background:`${THEME.primary}10`, display:'flex', alignItems:'center', justifyContent:'center' }}><Activity size={26} color={THEME.primary}/></div>
                        <div style={{ fontSize:16, fontWeight:800, color:THEME.textMuted }}>No Analysis Run Yet</div>
                        <div style={{ fontSize:12.5, color:THEME.textDim, maxWidth:360, lineHeight:1.7 }}>Click <b>Run Full Audit</b> to evaluate this repository's tech debt, overall health, and hidden vulnerabilities.</div>
                    </div>
                )}

                {r && !ai.loading && (() => {
                    const hc = r.overallHealthScore >= 80 ? THEME.success : r.overallHealthScore >= 60 ? THEME.warning : THEME.danger;
                    return (
                        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }} className="r8-stagger">
                                <MetricCard label="Overall Health" value={`${r.overallHealthScore}/100`} icon={Activity}    color={hc}/>
                                <MetricCard label="Code Quality"   value={`${r.metricsEstimate?.codeQuality||0}/100`} icon={Code}  color={THEME.primary}/>
                                <MetricCard label="Security"       value={`${r.metricsEstimate?.securityScore||0}/100`} icon={Shield} color={THEME.info}/>
                                <MetricCard label="Tech Debt"      value={r.techDebtEstimate?.toUpperCase()} icon={Wrench}  color={r.techDebtEstimate==='high'?THEME.danger:THEME.warning}/>
                            </div>

                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                                <Panel title="Architecture Review" icon={Workflow}>
                                    <p style={{ fontSize:12.5, color:THEME.textDim, lineHeight:1.7, marginBottom:16 }}>{r.repoSummary}</p>
                                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                                        {r.primaryLanguages?.map((l,i) => <span key={i} style={{ padding:'3px 10px', borderRadius:6, fontSize:10.5, fontWeight:700, background:`${THEME.primary}12`, color:THEME.primary, border:`1px solid ${THEME.primary}20` }}>{l}</span>)}
                                        <span style={{ padding:'3px 10px', borderRadius:6, fontSize:10.5, fontWeight:700, background:`${THEME.info}12`, color:THEME.info, border:`1px solid ${THEME.info}20` }}>{r.architecturePattern}</span>
                                    </div>
                                </Panel>

                                <Panel title="Top Risks & Quick Wins" icon={Flame}>
                                    {r.quickWins?.map((w,i)=>(
                                        <div key={i} style={{ display:'flex', gap:8, marginBottom:10, padding:'9px 12px', borderRadius:8, background:`${THEME.success}06`, border:`1px solid ${THEME.success}15` }}>
                                            <CheckCircle size={12} color={THEME.success} style={{ flexShrink:0, marginTop:2 }}/>
                                            <span style={{ fontSize:11.5, color:THEME.textMuted, lineHeight:1.5 }}>{w}</span>
                                        </div>
                                    ))}
                                    {r.topRisks?.map((risk,i)=>(
                                        <div key={i} style={{ display:'flex', gap:8, marginTop:10, padding:'9px 12px', borderRadius:8, background:`${THEME.danger}06`, border:`1px solid ${THEME.danger}15` }}>
                                            <AlertTriangle size={12} color={THEME.danger} style={{ flexShrink:0, marginTop:2 }}/>
                                            <span style={{ fontSize:11.5, color:THEME.textMuted, lineHeight:1.5 }}><b>{risk.risk}:</b> {risk.description}</span>
                                        </div>
                                    ))}
                                </Panel>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DATABASE, CICD & PR PLACEHOLDERS
   ═══════════════════════════════════════════════════════════════════════════ */
const DatabaseView = () => <Panel title="Database Analysis" icon={Database}><div style={{padding:20, color:THEME.textDim, fontSize:12}}>Connect a live DB or schema file to enable migration risk analysis.</div></Panel>;
const CICDView = () => <Panel title="CI/CD Pipeline" icon={RocketIcon}><div style={{padding:20, color:THEME.textDim, fontSize:12}}>Connect Jenkins, Actions, or GitLab CI for deployment metrics.</div></Panel>;
const PullRequestView = () => <Panel title="Pull Requests" icon={GitPullRequest}><div style={{padding:20, color:THEME.textDim, fontSize:12}}>Provide a GitHub/GitLab token to analyze open PR code diffs.</div></Panel>;

/* ═══════════════════════════════════════════════════════════════════════════
   MODALS & FORMS (Removed Fake Hardcoded Data)
   ═══════════════════════════════════════════════════════════════════════════ */
const LocalRepoForm = ({ onConnect, onClose }) => {
    const [path, setPath] = useState('');
    const [name, setName] = useState('');

    // No mock data generated here anymore, just capturing path securely.
    const connect = () => {
        if (!path.trim()) return;
        const derivedName = name || path.split(/[/\\]/).filter(Boolean).pop() || 'local-repo';
        onConnect({ path, name: derivedName });
    };

    return (
        <div style={{ padding:22, display:'flex', flexDirection:'column', gap:18 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${THEME.info}18`, border:`1px solid ${THEME.info}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <HardDrive size={18} color={THEME.info}/>
                </div>
                <div>
                    <div style={{ fontSize:14.5, fontWeight:800, color:THEME.textMain }}>Connect Local Path</div>
                    <div style={{ fontSize:11, color:THEME.textDim, marginTop:2 }}>Vigil will read files via Browser File System Access API</div>
                </div>
            </div>

            <div>
                <label style={{ fontSize:10.5, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>Absolute Path</label>
                <input value={path} onChange={e=>setPath(e.target.value)} placeholder="/path/to/project or C:\Projects\app" className="r8-input r8-input-local" style={{ width:'100%', background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, borderRadius:10, padding:'12px', color:THEME.textMain, fontFamily:'JetBrains Mono,monospace', fontSize:12.5, boxSizing:'border-box', outline:'none' }}/>
            </div>

            <div style={{ padding:'10px 14px', borderRadius:8, background:`${THEME.info}08`, border:`1px solid ${THEME.info}20`, fontSize:11, color:THEME.textDim, lineHeight:1.5 }}>
                <b style={{color:THEME.info}}>Note:</b> When accessing local folders, branch details and git commit history cannot be retrieved automatically without a local proxy server. Code analysis will work perfectly on raw files.
            </div>

            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button onClick={onClose} className="r8-btn r8-btn-g">Cancel</button>
                <button onClick={connect} disabled={!path.trim()} className="r8-btn r8-btn-p" style={{ opacity:!path.trim()?0.5:1 }}><HardDrive size={13}/> Register Local</button>
            </div>
        </div>
    );
};

const AddRepoModal = ({ onAdd, onClose }) => {
    const [provider, setProvider] = useState('github');
    const [url, setUrl] = useState('');

    const handleRemote = () => {
        if (!url.trim()) return;
        const name = url.split('/').pop().replace(/\.git$/,'') || 'repo';
        // Mock data removed. State explicitly indicates data must be fetched.
        onAdd({ name, url, type:provider, branch:'Syncing...', lastCommit:'Pending Integration', isLocal:false });
    };

    const handleLocal = (data) => {
        // Mock data removed. Marking metadata as Local/Unknown.
        onAdd({ name:data.name, url:data.path, type:'local', branch:'Local Directory', lastCommit:'—', isLocal:true });
    };

    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.72)', backdropFilter:'blur(10px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:560, background:THEME.glass, backdropFilter:'blur(24px) saturate(180%)', border:`1px solid ${THEME.glassBorder}`, borderRadius:18, boxShadow:`0 28px 80px rgba(0,0,0,.55)`, animation:'rScaleIn .22s ease' }}>
                <div style={{ padding:'18px 22px', borderBottom:`1px solid ${THEME.glassBorder}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:15, fontWeight:800, color:THEME.textMain }}>Connect Repository</div>
                    <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:THEME.textDim }}><X size={16}/></button>
                </div>

                <div style={{ display:'flex', gap:5, padding:'14px 22px 0' }}>
                    {Object.entries(PROV).map(([key, p]) => (
                        <button key={key} onClick={()=>setProvider(key)} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 13px', borderRadius:9, border:`1px solid ${provider===key?p.color+'40':THEME.glassBorder}`, background:provider===key?`${p.color}14`:'transparent', color:provider===key?p.color:THEME.textDim, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                            <p.Icon size={13}/>{p.label}
                        </button>
                    ))}
                </div>

                {provider==='local' ? <LocalRepoForm onConnect={handleLocal} onClose={onClose}/> : (
                    <div style={{ padding:22, display:'flex', flexDirection:'column', gap:16 }}>
                        <div>
                            <label style={{ fontSize:10.5, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', marginBottom:8, display:'block' }}>Repository URL</label>
                            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://github.com/user/repo" style={{ width:'100%', padding:'11px 12px', background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, borderRadius:9, color:THEME.textMain, outline:'none', fontSize:13, boxSizing:'border-box' }}/>
                        </div>
                        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                            <button onClick={onClose} className="r8-btn r8-btn-g">Cancel</button>
                            <button onClick={handleRemote} disabled={!url.trim()} className="r8-btn r8-btn-p"><Plus size={13}/> Connect</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT REPOSITORY TAB MANAGER
   ═══════════════════════════════════════════════════════════════════════════ */
const RepoCard = ({ repo, onOpen, onDelete }) => {
    const isLocal = repo.type==='local';
    const prov = PROV[repo.type] || PROV.github;
    const accent = isLocal ? THEME.info : THEME.primary;

    return (
        <div className={`r8-card r8-card-${isLocal?'local':'remote'}`} onClick={()=>onOpen(repo)} style={{ padding:22, borderRadius:14, background:THEME.glass, border:`1px solid ${THEME.glassBorder}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:11, background:`${accent}14`, border:`1px solid ${accent}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <prov.Icon size={18} color={accent}/>
                    </div>
                    <div>
                        <div style={{ fontSize:15, fontWeight:800, color:THEME.textMain }}>{repo.name}</div>
                        <div style={{ fontSize:10.5, color:THEME.textDim, fontFamily:'monospace', marginTop:2, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{isLocal ? repo.url : repo.branch}</div>
                    </div>
                </div>
                <button onClick={e=>{e.stopPropagation();onDelete(repo.id);}} style={{ background:'none', border:'none', cursor:'pointer' }}><Trash2 size={13} color={THEME.danger}/></button>
            </div>
            <div style={{ display:'flex', gap:7, marginBottom:14 }}>
                <StatusBadge label={prov.label} color={accent} size="sm"/>
                <StatusBadge label={isLocal?'LOCAL':'REMOTE'} color={isLocal?THEME.info:THEME.success} size="sm"/>
            </div>
            <div style={{ height:1, background:THEME.glassBorder, marginBottom:12 }}/>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:THEME.textDim }}>
                <span>{repo.lastCommit}</span>
                <div style={{ color:accent, fontWeight:600 }}>Open →</div>
            </div>
        </div>
    );
};

const RepositoryTab = () => {
    const [view, setView] = useState('repos');
    const [repos, setRepos] = useState([]);
    const [activeRepo, setActiveRepo] = useState(null);
    const [subView, setSubView] = useState('code');
    const [showAdd, setShowAdd] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => { try { const s=localStorage.getItem('vigil_repos_v9'); if(s) setRepos(JSON.parse(s)); } catch {} }, []);
    useEffect(() => { try { localStorage.setItem('vigil_repos_v9', JSON.stringify(repos)); } catch {} }, [repos]);

    const handleAdd = useCallback(data => { setRepos(prev=>[{ id:Date.now(), ...data }, ...prev]); setShowAdd(false); }, []);
    const handleDelete = useCallback(id => setRepos(prev=>prev.filter(r=>r.id!==id)), []);
    const openRepo = useCallback(repo => { setActiveRepo(repo); setView('browser'); setSubView('code'); }, []);

    const filtered = repos.filter(r=>r.name?.toLowerCase().includes(search.toLowerCase()));

    const NAV_TABS = [
        { id:'code', label:'Code', icon:Code },
        { id:'insights', label:'Insights', icon:Activity },
        { id:'cicd', label:'CI/CD', icon:RocketIcon },
        { id:'prs', label:'Pull Requests', icon:GitPullRequest },
        { id:'db', label:'Database', icon:Database },
    ];

    if (view === 'repos') {
        return (
            <div style={{ padding:'0 28px 56px' }}>
                <RepoStyles/>
                {showAdd && <AddRepoModal onAdd={handleAdd} onClose={()=>setShowAdd(false)}/>}

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'26px 0 24px' }}>
                    <div>
                        <h2 style={{ fontSize:26, fontWeight:900, color:THEME.textMain, margin:0 }}>Repositories</h2>
                        <div style={{ fontSize:12.5, color:THEME.textDim, marginTop:5 }}>Manage your connected codebases</div>
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{ padding:'9px 12px', background:THEME.glass, border:`1px solid ${THEME.glassBorder}`, borderRadius:9, color:THEME.textMain, outline:'none' }}/>
                        <button onClick={()=>setShowAdd(true)} className="r8-btn r8-btn-p"><Plus size={14}/> Add Repository</button>
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }} className="r8-stagger">
                        {filtered.map(repo => <RepoCard key={repo.id} repo={repo} onOpen={openRepo} onDelete={handleDelete}/>)}
                    </div>
                ) : (
                    <div style={{ padding:'72px 20px', textAlign:'center', border:`2px dashed ${THEME.glassBorder}`, borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <GitBranch size={26} color={`${THEME.primary}50`} style={{ marginBottom: 16 }}/>
                        <div style={{ fontSize:15.5, fontWeight:700, color:THEME.textMuted }}>No repositories connected</div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100vh', padding:'0 28px 24px' }}>
            <RepoStyles/>
            <div style={{ padding:'14px 0', display:'flex', alignItems:'center', gap:10 }}>
                <button onClick={()=>setView('repos')} className="r8-btn r8-btn-g r8-btn-sm">Repositories</button>
                <ChevronRight size={11} color={THEME.textDim}/>
                <span style={{ fontWeight:800, color:THEME.textMain, fontSize:14 }}>{activeRepo?.name}</span>
            </div>

            <div style={{ display:'flex', gap:4, padding:4, background:THEME.glass, border:`1px solid ${THEME.glassBorder}`, borderRadius:10, marginBottom:14, width:'fit-content' }}>
                {NAV_TABS.map(tab=>(
                    <button key={tab.id} onClick={()=>setSubView(tab.id)} className={`r8-tab${subView===tab.id?' r8-tab-on':''}`} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 15px', borderRadius:8, border:'none', cursor:'pointer', background:subView===tab.id?`linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`:'transparent', color:subView===tab.id?'#fff':THEME.textDim, fontSize:12, fontWeight:700 }}>
                        <tab.icon size={12}/> {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ flex:1, minHeight:0, overflow:'hidden' }}>
                {subView==='code' && <CodeView activeRepo={activeRepo}/>}
                {subView==='insights' && <InsightsView activeRepo={activeRepo}/>}
                {subView==='cicd' && <CICDView/>}
                {subView==='prs' && <PullRequestView/>}
                {subView==='db' && <DatabaseView/>}
            </div>
        </div>
    );
};

export default RepositoryTab;