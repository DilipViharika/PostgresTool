// @ts-nocheck
import React, { useState, useMemo, useCallback, useEffect, useRef, FC } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { postData } from '../../../utils/api';
import {
    Zap, ShieldAlert, Settings, CheckCircle, Copy, Check,
    AlertTriangle, Info, ChevronDown, ChevronRight,
    Database, HardDrive, Activity, Clock, ArrowUpRight,
    FileCode, Wrench, BarChart3, RefreshCw, Eye, X,
} from 'lucide-react';

/* ── TYPE DEFINITIONS ───────────────────────────────────────────────────── */
interface AnalysisResult {
    score: number;
    summary: string;
    language: string;
    linesAnalyzed: number;
}

interface AnalysisState {
    loading: boolean;
    result: AnalysisResult | null;
    error: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
const fmtNum = (n: any): string => {
    if (n == null) return '—';
    const v = Number(n);
    if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`;
    return String(v);
};

const fmtSize = (gb: any): string => {
    if (gb == null) return '—';
    const n = Number(gb);
    if (n >= 1024) return `${(n/1024).toFixed(1)} TB`;
    if (n >= 1) return `${n.toFixed(1)} GB`;
    if (n >= 0.001) return `${(n*1024).toFixed(0)} MB`;
    return `${(n*1048576).toFixed(0)} KB`;
};

const useCopy = () => {
    const [c, s] = useState(false);
    const fn = useCallback((t: string) => {
        navigator.clipboard?.writeText(t).catch(()=>{});
        s(true);
        setTimeout(()=>s(false),2000);
    },[]);
    return [c, fn] as const;
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const AnimCSS: FC = () => <style>{`
@keyframes vp{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes vs{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes vb{from{width:0%}}
.vfade{animation:vs .22s ease-out both}
.vsel::-webkit-scrollbar{height:4px;width:4px}
.vsel::-webkit-scrollbar-track{background:transparent}
.vsel::-webkit-scrollbar-thumb{background:${THEME.grid}40;border-radius:4px}
`}</style>;

/* ═══════════════════════════════════════════════════════════════════════════
   CODEBLOCK COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
interface CodeBlockProps {
    code: string;
    lang?: string;
    maxH?: number;
}

const CodeBlock: FC<CodeBlockProps> = ({ code, lang = 'sql', maxH = 350 }) => {
    const [cp, copy] = useCopy();
    const [exp, setExp] = useState(false);
    const lines = code.split('\n');
    const need = lines.length > 16;
    const show = need && !exp ? lines.slice(0,16) : lines;

    return (
        <div style={{position:'relative',borderRadius:8,overflow:'hidden',marginTop:8,border:`1px solid ${THEME.grid}`}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:THEME.surfaceRaised,padding:'5px 10px',borderBottom:`1px solid ${THEME.grid}`}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                    {['#ff5f56','#ffbd2e','#27c93f'].map(c=><span key={c} style={{width:7,height:7,borderRadius:'50%',background:c,display:'inline-block'}}/>)}
                    <span style={{fontSize:8.5,color:THEME.textDim,fontWeight:600,marginLeft:5,textTransform:'uppercase',letterSpacing:'.04em'}}>{lang} · {lines.length}L</span>
                </div>
                <div style={{display:'flex',gap:3}}>
                    {need && <button onClick={()=>setExp(e=>!e)} style={{background:THEME.surfaceHover,border:`1px solid ${THEME.grid}`,borderRadius:4,padding:'2px 6px',cursor:'pointer',fontSize:8.5,fontWeight:600,color:THEME.textMuted}}>
                        {exp?'Less':`${lines.length}L`}
                    </button>}
                    <button onClick={()=>copy(code)} style={{background:cp?`${THEME.success}18`:THEME.surfaceHover,border:`1px solid ${cp?`${THEME.success}40`:THEME.grid}`,borderRadius:4,padding:'2px 6px',cursor:'pointer',fontSize:8.5,fontWeight:700,color:cp?THEME.success:THEME.textMuted,transition:'all .15s'}}>
                        {cp?<Check size={7}/>:<Copy size={7}/>}
                    </button>
                </div>
            </div>
            <div style={{background:THEME.surface,maxHeight:need&&!exp?300:maxH,overflowY:'auto',overflowX:'auto',position:'relative'}}>
                <div style={{display:'flex'}}>
                    <div style={{padding:'7px 0',borderRight:`1px solid ${THEME.grid}`,userSelect:'none',flexShrink:0}}>
                        {show.map((_,i)=><div key={i} style={{padding:'0 8px',fontSize:9.5,lineHeight:1.7,color:THEME.textDim,textAlign:'right',fontFamily:THEME.fontMono}}>{i+1}</div>)}
                    </div>
                    <pre style={{margin:0,padding:'7px 11px',flex:1,fontFamily:THEME.fontMono,fontSize:10,lineHeight:1.7,color:THEME.textMain,whiteSpace:'pre',overflow:'visible'}}>
                        {show.join('\n')}
                    </pre>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const AdvancedAnalysisPanel: FC = () => {
    useAdaptiveTheme();
    const [state, setState] = useState<AnalysisState>({ loading: false, result: null, error: null });
    const [queryCode, setQueryCode] = useState('SELECT * FROM pg_stat_statements LIMIT 10;');

    const handleAnalyze = async () => {
        setState({ ...state, loading: true, error: null });
        try {
            const result = await postData('/api/analysis/query', {
                query: queryCode,
            });
            setState({ loading: false, result, error: null });
        } catch (e) {
            setState({ loading: false, result: null, error: (e as Error).message });
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1600px' }}>
            <AnimCSS />

            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.textMain, margin: 0 }}>
                    Advanced Analysis Panel
                </h1>
                <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: '8px' }}>
                    Deep dive into performance metrics and query optimization
                </p>
            </div>

            <div style={{
                background: THEME.surface,
                border: `1px solid ${THEME.grid}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
            }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, marginBottom: '16px' }}>
                    Query Analyzer
                </h3>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, display: 'block', marginBottom: '8px' }}>
                        SQL Query
                    </label>
                    <textarea
                        value={queryCode}
                        onChange={(e) => setQueryCode(e.target.value)}
                        style={{
                            width: '100%',
                            height: '120px',
                            background: THEME.bg,
                            border: `1px solid ${THEME.grid}`,
                            borderRadius: '6px',
                            padding: '12px',
                            color: THEME.textMain,
                            fontFamily: THEME.fontMono,
                            fontSize: '12px',
                            resize: 'none'
                        }}
                    />
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={state.loading}
                    style={{
                        background: THEME.primary,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 16px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: state.loading ? 'wait' : 'pointer',
                        opacity: state.loading ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {state.loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
                    {state.loading ? 'Analyzing...' : 'Analyze Query'}
                </button>
            </div>

            {state.error && (
                <div style={{
                    background: `${THEME.danger}15`,
                    border: `1px solid ${THEME.danger}40`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '24px',
                    color: THEME.danger,
                    fontSize: '13px'
                }}>
                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                    {state.error}
                </div>
            )}

            {state.result && (
                <div style={{
                    background: THEME.surface,
                    border: `1px solid ${THEME.grid}`,
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, marginBottom: '16px' }}>
                        Analysis Results
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ background: THEME.bg, padding: '16px', borderRadius: '8px' }}>
                            <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: '8px' }}>Health Score</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.primary }}>
                                {state.result.score}
                            </div>
                        </div>
                        <div style={{ background: THEME.bg, padding: '16px', borderRadius: '8px' }}>
                            <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: '8px' }}>Lines Analyzed</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.primary }}>
                                {state.result.linesAnalyzed}
                            </div>
                        </div>
                        <div style={{ background: THEME.bg, padding: '16px', borderRadius: '8px' }}>
                            <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: '8px' }}>Language</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.primary }}>
                                {state.result.language}
                            </div>
                        </div>
                    </div>
                    <div style={{ background: THEME.bg, padding: '16px', borderRadius: '8px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain, marginBottom: '8px' }}>Summary</div>
                        <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: '1.6' }}>
                            {state.result.summary}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedAnalysisPanel;
