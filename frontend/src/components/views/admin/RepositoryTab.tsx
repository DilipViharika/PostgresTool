// @ts-nocheck
// ==========================================================================
//  VIGIL — RepositoryTab (v11 — FIXED API INTEGRATION) [TypeScript]
// ==========================================================================
import React, { useState, useEffect, useMemo, useCallback, FC } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { postData } from '../../../utils/api';
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

/* ── TYPE DEFINITIONS ───────────────────────────────────────────────────── */
interface AnalysisIssue {
    line?: number | null;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: string;
    description: string;
    fix: string;
}

interface AnalysisResult {
    healthScore: number;
    summary: string;
    language: string;
    linesAnalyzed: number;
    complexityMetrics?: {
        cyclomaticComplexity: string;
        coupling: string;
        testability: string;
    };
    strengths?: string[];
    issues?: AnalysisIssue[];
    securityFlags?: any[];
    performanceInsights?: any[];
}

interface FileNode {
    name: string;
    type: 'file' | 'folder';
    path: string;
    children?: FileNode[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   AI ANALYSIS ENGINE
   ═══════════════════════════════════════════════════════════════════════════ */
const useAIAnalysis = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'file' | 'repo' | null>(null);

    const callClaude = async (system: string, prompt: string): Promise<AnalysisResult> => {
        const data = await postData('/api/ai/chat', {
            max_tokens: 4000,
            system,
            messages: [{ role: 'user', content: prompt }],
        });

        const raw = data.content?.map((b: any) => b.text || '').join('') || '';
        const stripped = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        const jsonMatch = stripped.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI returned a non-JSON response. Try again.");
        return JSON.parse(jsonMatch[0]);
    };

    const analyze = async ({ filename, code, repoName }: { filename: string; code: string; repoName: string }): Promise<void> => {
        if (!code.trim()) return;
        setLoading(true);
        setError(null);
        setMode('file');
        setResult(null);
        try {
            const system = 'You are an elite Staff Software Engineer and Security Auditor. You MUST respond ONLY with a single valid raw JSON object.';
            const prompt = `Perform a deep analysis on the following code from file '${filename}' in repo '${repoName}'.

Code:
${code.substring(0, 12000)}

Return EXACTLY this JSON object (raw JSON only):
{
  "healthScore": <0-100 number>,
  "summary": "<1-2 sentence executive summary>",
  "language": "<detected language>",
  "linesAnalyzed": <number>,
  "complexityMetrics": { "cyclomaticComplexity": "<Low|Medium|High>", "coupling": "<Low|Medium|High>", "testability": "<Good|Fair|Poor>" },
  "strengths": ["<strength 1>", "<strength 2>"],
  "issues": [
    {
      "line": <line number or null>,
      "title": "<short issue title>",
      "severity": "<critical|high|medium|low>",
      "type": "<Bug|Security|Performance|Style>",
      "description": "<what is wrong and why it matters>",
      "fix": "<the actual corrected code or exact command>"
    }
  ],
  "securityFlags": [ { "title": "<vuln>", "severity": "<critical|high|medium|low>", "description": "<details>" } ],
  "performanceInsights": [ { "title": "<issue>", "impact": "<high|medium|low>", "suggestion": "<concrete suggestion>" } ]
}`;

            const aiData = await callClaude(system, prompt);
            setResult(aiData);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return { loading, result, error, analyze, mode };
};

/* ═══════════════════════════════════════════════════════════════════════════
   REPOSITORY TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const RepositoryTab: FC = () => {
    useAdaptiveTheme();
    const { loading, result, error, analyze } = useAIAnalysis();
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [fileContent, setFileContent] = useState<string>('');
    const [repoName, setRepoName] = useState<string>('my-repo');
    const [files, setFiles] = useState<FileNode[]>([]);

    const handleAnalyzeFile = async () => {
        if (!selectedFile || !fileContent) {
            alert('Please select a file and view its content');
            return;
        }
        await analyze({
            filename: selectedFile,
            code: fileContent,
            repoName: repoName
        });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1600px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.textMain, margin: 0 }}>
                    Repository Analysis
                </h1>
                <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: '8px' }}>
                    AI-powered code analysis and optimization recommendations
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px' }}>
                <div style={{
                    background: THEME.surface,
                    border: `1px solid ${THEME.grid}`,
                    borderRadius: '12px',
                    padding: '16px',
                    height: 'fit-content'
                }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', marginBottom: '12px' }}>
                        <GitBranch size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        Repository
                    </div>
                    <input
                        type="text"
                        placeholder="Repo name..."
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        style={{
                            width: '100%',
                            background: THEME.bg,
                            border: `1px solid ${THEME.grid}`,
                            borderRadius: '6px',
                            padding: '8px 12px',
                            color: THEME.textMain,
                            fontSize: '12px',
                            marginBottom: '12px'
                        }}
                    />
                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', marginBottom: '12px' }}>
                        Files
                    </div>
                    <div style={{ fontSize: 12, color: THEME.textMuted, textAlign: 'center', padding: '20px 0' }}>
                        No files loaded
                    </div>
                </div>

                <div>
                    {selectedFile && (
                        <>
                            <div style={{
                                background: THEME.surface,
                                border: `1px solid ${THEME.grid}`,
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '24px'
                            }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, marginBottom: '12px' }}>
                                    File: {selectedFile}
                                </h3>
                                <textarea
                                    value={fileContent}
                                    onChange={(e) => setFileContent(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '250px',
                                        background: THEME.bg,
                                        border: `1px solid ${THEME.grid}`,
                                        borderRadius: '6px',
                                        padding: '12px',
                                        color: THEME.textMain,
                                        fontFamily: THEME.fontMono,
                                        fontSize: '12px',
                                        resize: 'vertical'
                                    }}
                                />
                                <button
                                    onClick={handleAnalyzeFile}
                                    disabled={loading}
                                    style={{
                                        marginTop: '12px',
                                        background: THEME.primary,
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '10px 16px',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        cursor: loading ? 'wait' : 'pointer',
                                        opacity: loading ? 0.6 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
                                    {loading ? 'Analyzing...' : 'Analyze Code'}
                                </button>
                            </div>

                            {error && (
                                <div style={{
                                    background: `${THEME.danger}15`,
                                    border: `1px solid ${THEME.danger}40`,
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    marginBottom: '24px',
                                    color: THEME.danger,
                                    fontSize: '13px'
                                }}>
                                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: '8px' }} />
                                    {error}
                                </div>
                            )}

                            {result && (
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
                                        gap: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ background: THEME.bg, padding: '12px', borderRadius: '6px' }}>
                                            <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: '4px' }}>Health Score</div>
                                            <div style={{ fontSize: 20, fontWeight: 800, color: THEME.primary }}>
                                                {result.healthScore}
                                            </div>
                                        </div>
                                        <div style={{ background: THEME.bg, padding: '12px', borderRadius: '6px' }}>
                                            <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: '4px' }}>Language</div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: THEME.primary }}>
                                                {result.language}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ background: THEME.bg, padding: '12px', borderRadius: '6px' }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain, marginBottom: '8px' }}>Summary</div>
                                        <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: '1.6' }}>
                                            {result.summary}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RepositoryTab;
