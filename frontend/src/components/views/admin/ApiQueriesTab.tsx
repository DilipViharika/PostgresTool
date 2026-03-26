// @ts-nocheck
// ==========================================================================
//  VIGIL — ApiQueriesTab (v8 — Apex Observability) [TypeScript]
// ==========================================================================
import React, { useState, useEffect, useMemo, useRef, useCallback, FC } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme';
import { fetchData } from '../../../utils/api';
import {
    Network, Cpu, ArrowRight, Search, X, TrendingUp, TrendingDown,
    Clock, Database, Zap, Activity, BarChart3, Filter, ChevronDown, ChevronRight,
    AlertTriangle, CheckCircle, ShieldAlert, Flame, Gauge, Timer,
    GitBranch, Globe, Server, Code, Terminal, Layers, Box,
    FileJson, AlignLeft, HardDrive, List, Layout, Copy, Check,
    Sparkles, MessageSquare, TerminalSquare, MousePointerClick,
    Smartphone, Lock, Eye, ScrollText, Monitor, Fingerprint,
    Wifi, RefreshCw, ArrowUpRight, ArrowDownRight, Hash, Info,
    AlertOctagon, Radio, Crosshair, LifeBuoy, BrainCircuit,
    Sigma, Binary, FlaskConical, Microscope, Radar, Waves
} from 'lucide-react';

/* ── TYPE DEFINITIONS ───────────────────────────────────────────────────── */
interface Query {
    id: string;
    name: string;
    endpoint: string;
    method: string;
    responseTime: number;
    status: 'success' | 'error' | 'warning';
    lastExecuted: string;
    executionCount: number;
}

interface ApiQueryTabProps {}

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════════════════ */
const T = {
    get bg()          { return THEME.bg; },
    get surface()     { return THEME.surface; },
    get raised()      { return THEME.surfaceRaised; },
    get border()      { return THEME.grid; },
    get borderHover() { return THEME.gridAlt; },
    get primary()     { return THEME.primary; },
    get primaryGlow() { return `${THEME.primary}40`; },
    get secondary()   { return THEME.ai; },
    get success()     { return THEME.success; },
    get warning()     { return THEME.warning; },
    get danger()      { return THEME.danger; },
    get ai()          { return THEME.ai; },
    get text1()       { return THEME.textMain; },
    get text2()       { return THEME.textMuted; },
    get text3()       { return THEME.textDim; },
    get cyan()        { return THEME.primary; },
    get orange()      { return THEME.warning; },
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const GlobalStyles: FC = () => (
    <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .vigil-root { font-family: ${THEME.fontMono}; background: ${T.bg}; color: ${T.text1}; min-height: 100vh; }

        @keyframes fadeUp    { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes scanline  { 0% { transform:translateY(-100%); } 100% { transform:translateY(400%); } }
        @keyframes ripple    { 0% { transform:scale(0); opacity:0.6; } 100% { transform:scale(3); opacity:0; } }
        @keyframes shimmer   { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes barGrow   { from { transform:scaleX(0); } to { transform:scaleX(1); } }
        @keyframes tickIn    { from { opacity:0; transform:translateX(-4px); } to { opacity:1; transform:translateX(0); } }
        @keyframes anomalyPop{ 0%,100%{box-shadow:0 0 0 0 ${T.danger}50;} 50%{box-shadow:0 0 0 8px ${T.danger}00;} }

        .stagger > * { animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .stagger > *:nth-child(1){animation-delay:0.00s}
        .stagger > *:nth-child(2){animation-delay:0.06s}
        .stagger > *:nth-child(3){animation-delay:0.12s}
        .stagger > *:nth-child(4){animation-delay:0.18s}
        .stagger > *:nth-child(5){animation-delay:0.24s}

        .row-item {
            transition: background 0.15s, border-color 0.15s, transform 0.15s;
            border-left: 2px solid transparent;
            cursor: pointer;
        }
        .row-item:hover { background: ${T.raised} !important; border-left-color: ${T.primary}60; transform: translateX(1px); }
        .row-item.selected { background: ${T.raised} !important; border-left-color: ${T.primary}; }

        .tab-btn {
            display:flex; align-items:center; gap:6px;
            padding:8px 14px; border:none; border-radius:6px;
            font-size:10px; font-weight:700; letter-spacing:0.07em;
            text-transform:uppercase; cursor:pointer; transition:all 0.15s;
            font-family: ${THEME.fontMono};
            color:${T.text2}; background:transparent;
            border-bottom: 2px solid transparent;
        }
        .tab-btn:hover { color:${T.text1}; background:${T.raised}; }
        .tab-btn.active { color:${T.primary}; background:${T.primary}10; border-bottom-color:${T.primary}; }

        .span-bar {
            transform-origin:left;
            animation: barGrow 0.7s cubic-bezier(0.22,1,0.36,1) both;
            transition: filter 0.15s;
        }
        .span-bar:hover { filter: brightness(1.3); }

        .scroll-thin::-webkit-scrollbar { width:4px; height:4px; }
        .scroll-thin::-webkit-scrollbar-track { background:transparent; }
        .scroll-thin::-webkit-scrollbar-thumb { background:${T.border}; border-radius:2px; }
        .scroll-thin::-webkit-scrollbar-thumb:hover { background:${T.border}aa; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   API QUERIES TAB
   ═══════════════════════════════════════════════════════════════════════════ */
const ApiQueriesTab: FC<ApiQueryTabProps> = () => {
    useAdaptiveTheme();
    const [queries, setQueries] = useState<Query[]>([]);
    const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMethod, setFilterMethod] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchData('/api/queries');
                setQueries(data?.queries || []);
            } catch (e) {
                console.error('Failed to load queries:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredQueries = useMemo(() => {
        return queries.filter(q => {
            const matchesSearch = q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 q.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMethod = filterMethod === 'all' || q.method === filterMethod;
            return matchesSearch && matchesMethod;
        });
    }, [queries, searchTerm, filterMethod]);

    const getMethods = () => [...new Set(queries.map(q => q.method))];

    return (
        <div style={{ padding: '20px', maxWidth: '1600px' }}>
            <GlobalStyles />

            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text1, margin: 0 }}>
                    API Queries & Endpoints
                </h1>
                <p style={{ fontSize: 13, color: T.text2, marginTop: '8px' }}>
                    Monitor and analyze API query patterns
                </p>
            </div>

            <div style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="Search queries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 1,
                            background: T.bg,
                            border: `1px solid ${T.border}`,
                            borderRadius: '6px',
                            padding: '8px 12px',
                            color: T.text1,
                            fontSize: '13px'
                        }}
                    />
                    <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                        style={{
                            background: T.bg,
                            border: `1px solid ${T.border}`,
                            borderRadius: '6px',
                            padding: '8px 12px',
                            color: T.text1,
                            fontSize: '13px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Methods</option>
                        {getMethods().map(method => (
                            <option key={method} value={method}>{method}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ color: T.text2 }}>Loading API queries...</div>
                    </div>
                ) : (
                    <div style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'hidden' }}>
                        {filteredQueries.length > 0 ? (
                            filteredQueries.map(query => (
                                <div
                                    key={query.id}
                                    className="row-item"
                                    onClick={() => setSelectedQuery(query)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '6px',
                                        background: selectedQuery?.id === query.id ? `${T.primary}10` : 'transparent',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: query.status === 'success' ? T.success : query.status === 'warning' ? T.warning : T.danger
                                    }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>
                                            {query.name}
                                        </div>
                                        <div style={{ fontSize: 11, color: T.text2, marginTop: '2px' }}>
                                            {query.method} {query.endpoint}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text1 }}>
                                            {query.responseTime}ms
                                        </div>
                                        <div style={{ fontSize: 10, color: T.text3 }}>
                                            {query.executionCount} calls
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: T.text2 }}>
                                No queries found
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedQuery && (
                <div style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text1, marginBottom: '16px' }}>
                        Query Details: {selectedQuery.name}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        <div style={{ background: T.bg, padding: '12px', borderRadius: '6px' }}>
                            <div style={{ fontSize: 10, color: T.text3, marginBottom: '4px' }}>Method</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{selectedQuery.method}</div>
                        </div>
                        <div style={{ background: T.bg, padding: '12px', borderRadius: '6px' }}>
                            <div style={{ fontSize: 10, color: T.text3, marginBottom: '4px' }}>Response Time</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{selectedQuery.responseTime}ms</div>
                        </div>
                        <div style={{ background: T.bg, padding: '12px', borderRadius: '6px' }}>
                            <div style={{ fontSize: 10, color: T.text3, marginBottom: '4px' }}>Executions</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{selectedQuery.executionCount}</div>
                        </div>
                        <div style={{ background: T.bg, padding: '12px', borderRadius: '6px' }}>
                            <div style={{ fontSize: 10, color: T.text3, marginBottom: '4px' }}>Status</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: selectedQuery.status === 'success' ? T.success : T.warning }}>
                                {selectedQuery.status.toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '12px', padding: '12px', background: T.bg, borderRadius: '6px', fontFamily: THEME.fontMono, fontSize: '12px', color: T.text2, overflow: 'auto' }}>
                        {selectedQuery.endpoint}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiQueriesTab;
