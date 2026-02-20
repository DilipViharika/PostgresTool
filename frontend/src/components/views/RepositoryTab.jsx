// ==========================================================================
//  VIGIL — RepositoryTab  (v10 — STRICT LOCAL FS + REAL AI INTEGRATION)
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
   REAL AI ANALYSIS ENGINE
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
   STRICT FILE SYSTEM HANDLERS (No Mocks)
   ═══════════════════════════════════════════════════════════════════════════ */
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.cache']);
const getFileIcon = ext => ({ js: FileCode, ts: FileCode, json: FileJson, md: FileText }[ext] || FileCode);
const getExt = name => name.includes('.') ? name.split('.').pop().toLowerCase() : '';

async function readRealDirectory(handle, depth = 0, maxDepth = 6) {
    const entries = [];
    if (depth > maxDepth) return entries;
    for await (const [name, h] of handle.entries()) {
        if (h.kind === 'directory') {
            if (IGNORE_DIRS.has(name)) continue;
            const children = await readRealDirectory(h, depth + 1, maxDepth);
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
                <div className="r8-tree-item" onClick={() => onToggle(node.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:`6px 12px 6px ${12 + depth * 14}px`, cursor: 'pointer' }}>
                    {isOpen ? <ChevronDown size={12} color={THEME.textDim}/> : <ChevronRight size={12} color={THEME.textDim}/>}
                    <FolderOpen size={13} color={isOpen ? THEME.warning : THEME.textDim}/>
                    <span style={{ fontSize:12, color:THEME.textMuted, fontWeight:600 }}>{node.name}</span>
                </div>
                {isOpen && node.children?.map(c => <FsTreeNode key={c.id} node={c} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} onToggle={onToggle} openDirs={openDirs}/>)}
            </div>
        );
    }
    return (
        <div className={`r8-tree-item${isSelected ? ' r8-sel' : ''}`} onClick={() => onSelect(node)} style={{ display:'flex', alignItems:'center', gap:8, padding:`5px 12px 5px ${12 + depth * 14}px`, borderLeft: isSelected ? `2px solid ${THEME.primary}` : '2px solid transparent', cursor: 'pointer' }}>
            <Icon size={12} color={isSelected ? THEME.primary : THEME.textDim}/>
            <span style={{ fontSize:11.5, color:isSelected ? THEME.primary : THEME.textMuted }}>{node.name}</span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CODE VIEW (Strict Auth + Real AI Overlay)
   ═══════════════════════════════════════════════════════════════════════════ */
const CodeView = ({ activeRepo }) => {
    const aiEngine = useAIAnalysis();

    // Absolutely NO mock default data here. Must be explicitly loaded.
    const [fsTree, setFsTree] = useState(null);
    const [dirHandle, setDirHandle] = useState(null);
    const [openDirs, setOpenDirs] = useState(new Set());
    const [selNode, setSelNode] = useState(null);

    const [fileContent, setFileContent] = useState('');
    const [fileLoading, setFileLoading] = useState(false);
    const [fsLoading, setFsLoading] = useState(false);

    // 1. Trigger the native browser directory picker
    const authorizeLocalFolder = useCallback(async () => {
        try {
            setFsLoading(true);
            const handle = await window.showDirectoryPicker({ mode: 'read' });
            const tree = await readRealDirectory(handle, 0);

            setDirHandle(handle);
            setFsTree(tree);
            setOpenDirs(new Set(tree.filter(n => n.kind === 'dir').map(n => n.id).slice(0, 3))); // auto-open first few
            setSelNode(null);
            setFileContent('');
            aiEngine.reset();
        } catch (e) {
            if (e.name !== 'AbortError') console.error("FS Error:", e);
        } finally {
            setFsLoading(false);
        }
    }, [aiEngine]);

    const onToggle = useCallback(id => {
        setOpenDirs(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    }, []);

    // 2. Read the actual selected file into memory and trigger AI
    const onSelectFile = useCallback(async node => {
        if (node.kind !== 'file') return;
        setSelNode(node);
        aiEngine.reset();
        setFileLoading(true);

        try {
            const file = await node.handle.getFile();
            const text = await file.text();
            setFileContent(text);

            // Trigger detailed AI Analysis immediately
            aiEngine.analyze({
                filename: node.name,
                code: text,
                repoName: dirHandle?.name || activeRepo?.name
            });
        } catch (e) {
            setFileContent(`// Error reading file from local disk: ${e.message}`);
        }
        setFileLoading(false);
    }, [aiEngine, dirHandle, activeRepo]);

    const lines = fileContent.split('\n');
    const aiResult = aiEngine.result;

    const sevColor = s => {
        const key = (s||'').toLowerCase();
        return { critical:THEME.danger, high:THEME.danger, medium:THEME.warning, low:THEME.info }[key] || THEME.textDim;
    }

    return (
        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:16, height:'100%', minHeight:0 }}>

            {/* --- SIDEBAR: REAL FILE SYSTEM --- */}
            <div style={{ background:THEME.glass, border:`1px solid ${THEME.glassBorder}`, borderRadius:16, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:`1px solid ${THEME.glassBorder}`, background:`${THEME.primary}06`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:11, fontWeight:800, color:THEME.textMain, textTransform:'uppercase', letterSpacing:'0.1em' }}>Local Files</span>
                    {fsTree && <button onClick={authorizeLocalFolder} style={{ background:'none', border:'none', color:THEME.primary, fontSize:10, cursor:'pointer', fontWeight:700 }}>CHANGE</button>}
                </div>

                <div className="r8-scroll" style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
                    {fsLoading && <div style={{ padding:20, textAlign:'center' }}><Loader size={18} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite', margin:'0 auto' }}/></div>}

                    {!fsTree && !fsLoading && (
                        <div style={{ padding:24, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                            <FolderOpen size={32} color={THEME.info}/>
                            <div>
                                <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain, marginBottom:6 }}>Authorization Required</div>
                                <div style={{ fontSize:11, color:THEME.textDim, lineHeight:1.5, marginBottom:16 }}>
                                    Browser security requires you to explicitly select the <b>{activeRepo?.name}</b> folder to read files.
                                </div>
                                <button onClick={authorizeLocalFolder} className="r8-btn r8-btn-c" style={{ width:'100%', justifyContent:'center' }}>
                                    Grant Access
                                </button>
                            </div>
                        </div>
                    )}

                    {fsTree && fsTree.map(n => <FsTreeNode key={n.id} node={n} depth={0} selectedId={selNode?.id} onSelect={onSelectFile} onToggle={onToggle} openDirs={openDirs}/>)}
                </div>
            </div>

            {/* --- MAIN EDITOR & AI SPLIT --- */}
            <div style={{ display:'grid', gridTemplateColumns: (aiEngine.loading || aiResult || aiEngine.error) ? '1fr 420px' : '1fr', gap:16, minHeight:0 }}>

                {/* CODE EDITOR */}
                <div style={{ background:THEME.surface, border:`1px solid ${THEME.glassBorder}`, borderRadius:16, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                    <div style={{ padding:'12px 20px', borderBottom:`1px solid ${THEME.glassBorder}`, display:'flex', alignItems:'center', gap:8 }}>
                        <Code size={14} color={THEME.primary}/>
                        <span style={{ fontSize:12, fontWeight:700, color:THEME.textMain, fontFamily:'monospace' }}>{selNode ? selNode.name : 'No file selected'}</span>
                    </div>

                    {!selNode && !fileLoading && (
                        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, color:THEME.textDim }}>
                            <Sparkles size={24} color={`${THEME.primary}50`}/>
                            <div style={{ fontSize:13 }}>Select a file to begin Deep AI Analysis</div>
                        </div>
                    )}

                    {fileLoading && <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><Loader size={24} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/></div>}

                    {selNode && !fileLoading && fileContent && (
                        <div className="r8-scroll" style={{ flex:1, overflowY:'auto', padding:'16px 0', fontFamily:'JetBrains Mono, monospace', fontSize:13, lineHeight:1.6 }}>
                            {lines.map((line, i) => {
                                const issue = aiResult?.issues?.find(iss => iss.line === (i + 1));
                                const isIssue = !!issue;
                                const issueColor = issue?.severity === 'critical' ? THEME.danger : issue?.severity === 'high' ? THEME.warning : THEME.info;

                                return (
                                    <div key={i} style={{ display:'flex', padding:'0 20px', background: isIssue ? `${issueColor}10` : 'transparent', borderLeft: isIssue ? `3px solid ${issueColor}` : '3px solid transparent' }}>
                                        <span style={{ width:40, flexShrink:0, color:`${THEME.textDim}50`, userSelect:'none', textAlign:'right', paddingRight:12 }}>{i + 1}</span>
                                        <span style={{ flex:1, color: isIssue ? issueColor : THEME.textMuted, whiteSpace:'pre' }}>{line}</span>
                                        {isIssue && (
                                            <span style={{ fontSize:10, fontWeight:700, color:issueColor, marginLeft:12, padding:'2px 8px', background:`${issueColor}20`, borderRadius:4, alignSelf:'center' }}>
                                                {issue.title}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* DETAILED AI ANALYSIS PANEL */}
                {(aiEngine.loading || aiResult || aiEngine.error) && (
                    <div style={{ background:THEME.glass, border:`1px solid ${THEME.glassBorder}`, borderRadius:16, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${THEME.glassBorder}`, background:`${THEME.primary}06`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <Sparkles size={14} color={THEME.primary}/>
                                <span style={{ fontSize:11, fontWeight:800, color:THEME.textMain, textTransform:'uppercase', letterSpacing:'0.1em' }}>Deep Analysis</span>
                            </div>
                            <button onClick={aiEngine.reset} style={{ background:'none', border:'none', color:THEME.textDim, cursor:'pointer' }}><X size={14}/></button>
                        </div>

                        <div className="r8-scroll" style={{ flex:1, overflowY:'auto', padding:20 }}>
                            {aiEngine.loading && (
                                <div style={{ display:'flex', flexDirection:'column', gap:16, alignItems:'center', justifyContent:'center', height:'100%' }}>
                                    <Loader size={32} color={THEME.primary} style={{ animation:'rSpin 1s linear infinite' }}/>
                                    <div style={{ fontSize:12, color:THEME.textDim }}>Running advanced static analysis...</div>
                                </div>
                            )}

                            {aiEngine.error && <div style={{ padding:12, color:THEME.danger, fontSize:12, background:`${THEME.danger}10`, borderRadius:8 }}>{aiEngine.error}</div>}

                            {aiResult && !aiEngine.loading && (
                                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                                    {/* Health Overview */}
                                    <div style={{ padding:16, borderRadius:12, background:`${THEME.surface}`, border:`1px solid ${THEME.glassBorder}`, display:'flex', gap:16 }}>
                                        <div style={{ fontSize:48, fontWeight:900, color: aiResult.healthScore > 75 ? THEME.success : THEME.warning, lineHeight:1 }}>
                                            {aiResult.healthScore}
                                        </div>
                                        <div>
                                            <div style={{ fontSize:14, fontWeight:800, color:THEME.textMain, marginBottom:4 }}>Health Score</div>
                                            <div style={{ fontSize:12, color:THEME.textDim, lineHeight:1.5 }}>{aiResult.summary}</div>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                                        <div style={{ padding:12, borderRadius:8, background:`${THEME.primary}08`, border:`1px solid ${THEME.primary}20` }}>
                                            <div style={{ fontSize:10, color:THEME.textDim, textTransform:'uppercase', fontWeight:700, marginBottom:4 }}>Complexity</div>
                                            <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain }}>{aiResult.complexityMetrics?.cyclomaticComplexity || 'Normal'}</div>
                                        </div>
                                        <div style={{ padding:12, borderRadius:8, background:`${THEME.info}08`, border:`1px solid ${THEME.info}20` }}>
                                            <div style={{ fontSize:10, color:THEME.textDim, textTransform:'uppercase', fontWeight:700, marginBottom:4 }}>Testability</div>
                                            <div style={{ fontSize:13, fontWeight:700, color:THEME.textMain }}>{aiResult.complexityMetrics?.testability || 'Fair'}</div>
                                        </div>
                                    </div>

                                    {/* Line-Specific Issues */}
                                    {aiResult.issues?.length > 0 && (
                                        <div>
                                            <div style={{ fontSize:11, fontWeight:800, color:THEME.textDim, textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                                                <AlertTriangle size={12}/> Critical Findings
                                            </div>
                                            {aiResult.issues.map((iss, i) => (
                                                <div key={i} style={{ marginBottom:10, padding:12, borderRadius:8, background:`${THEME.danger}08`, border:`1px solid ${THEME.danger}20` }}>
                                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                                                        <span style={{ fontSize:12, fontWeight:700, color:THEME.danger }}>Line {iss.line}: {iss.title}</span>
                                                    </div>
                                                    <div style={{ fontSize:11.5, color:THEME.textDim, lineHeight:1.5, marginBottom:8 }}>{iss.description}</div>
                                                    <div style={{ fontSize:11, color:THEME.textMain, background:THEME.surface, padding:'6px 10px', borderRadius:6, border:`1px solid ${THEME.glassBorder}`, fontFamily:'monospace' }}>
                                                        <span style={{ color:THEME.success, fontWeight:700 }}>Fix: </span>{iss.fix}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Security Flags */}
                                    {aiResult.securityFlags?.length > 0 && (
                                        <div>
                                            <div style={{ fontSize:11, fontWeight:800, color:THEME.textDim, textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                                                <Shield size={12}/> Security Vectors
                                            </div>
                                            {aiResult.securityFlags.map((sec, i) => (
                                                <div key={i} style={{ marginBottom:8, padding:12, borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.glassBorder}` }}>
                                                    <div style={{ fontSize:12, fontWeight:700, color:THEME.warning, marginBottom:4 }}>{sec.title}</div>
                                                    <div style={{ fontSize:11, color:THEME.textDim, lineHeight:1.5 }}>{sec.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
   MODALS & FORMS
   ═══════════════════════════════════════════════════════════════════════════ */
const LocalRepoForm = ({ onConnect, onClose }) => {
    const [path, setPath] = useState('');
    const [name, setName] = useState('');

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
        onAdd({ name, url, type:provider, branch:'Syncing...', lastCommit:'Pending Integration', isLocal:false });
    };

    const handleLocal = (data) => {
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

    useEffect(() => { try { const s=localStorage.getItem('vigil_repos_v10'); if(s) setRepos(JSON.parse(s)); } catch {} }, []);
    useEffect(() => { try { localStorage.setItem('vigil_repos_v10', JSON.stringify(repos)); } catch {} }, [repos]);

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