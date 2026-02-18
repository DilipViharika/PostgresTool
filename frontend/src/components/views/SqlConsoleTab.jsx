// ==========================================================================
//  VIGIL — SqlConsoleTab  (v5 — Ultra Advanced)
// ==========================================================================
import React, { useState, useEffect, useMemo, useRef, useCallback, useReducer } from 'react';
import { THEME } from '../../utils/theme.jsx';
import { postData } from '../../utils/api';
import {
    Play, Eraser, Copy, Check, ChevronDown, ChevronUp,
    Clock, Database, AlertTriangle, CheckCircle, XCircle, Search,
    Terminal, Zap, BarChart3, Table2, Download, Square,
    Trash2, ArrowUp, ArrowDown, Code, BookOpen, Star,
    ChevronRight, Timer, Layers, Eye, Keyboard, Pause,
    Maximize2, Minimize2, Hash, RefreshCw, X, History,
    Braces, FileJson, FileSpreadsheet, Columns, Shield,
    Activity, Network, HardDrive, Lock, ArrowUpRight,
    Plus, Minus, GitBranch, Diff, AlignLeft, Settings,
    Bell, Share2, Save, FolderOpen, Tag, Filter,
    ChevronLeft, MoreHorizontal, Cpu, MemoryStick,
    SplitSquareHorizontal, Bookmark, Variable, FlaskConical,
    ShieldOff, AlignJustify, ChevronLast, ChevronFirst,
    SkipBack, SkipForward, PanelRightClose, PanelRightOpen,
    Scissors, Wand2, Circle, TrendingUp, Gauge, Globe, Info
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════════════ */
const SqlStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

        @keyframes sqlFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sqlPulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        @keyframes sqlSlideIn { from{opacity:0;transform:translateX(-8px);} to{opacity:1;transform:translateX(0);} }
        @keyframes sqlSlideDown { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
        @keyframes sqlSpin { to{transform:rotate(360deg);} }
        @keyframes sqlShimmer { 0%{background-position:-400% 0;} 100%{background-position:400% 0;} }
        @keyframes sqlBarGrow { from{transform:scaleX(0);} to{transform:scaleX(1);} }
        @keyframes sqlTimerPulse { 0%,100%{opacity:1;} 50%{opacity:0.55;} }
        @keyframes sqlBlink { 0%,100%{opacity:1;} 49%{opacity:1;} 50%{opacity:0;} }
        @keyframes sqlGlow { 0%,100%{box-shadow:0 0 6px ${THEME.primary}50;} 50%{box-shadow:0 0 16px ${THEME.primary}90,0 0 32px ${THEME.primary}30;} }
        @keyframes sqlTabIn { from{opacity:0;transform:scale(0.97);} to{opacity:1;transform:scale(1);} }

        .sql-font { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
        .sql-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
        .sql-row-hover { transition: background 0.1s; }
        .sql-row-hover:hover { background: ${THEME.primary}07 !important; }
        .sql-row-hover:hover td { color: ${THEME.textMain} !important; }
        .sql-scrollbar::-webkit-scrollbar { width:5px; height:5px; }
        .sql-scrollbar::-webkit-scrollbar-track { background:transparent; }
        .sql-scrollbar::-webkit-scrollbar-thumb { background:${THEME.grid}; border-radius:3px; }
        .sql-scrollbar::-webkit-scrollbar-thumb:hover { background:${THEME.textDim}; }
        .sql-editor-area {
            width:100%; background:transparent; border:none; color:${THEME.textMain};
            font-family:'JetBrains Mono','Fira Code','Consolas',monospace;
            padding:0; outline:none; resize:none;
            font-size:13px; line-height:1.75; tab-size:2;
            caret-color:${THEME.primary};
        }
        .sql-editor-area::placeholder { color:${THEME.textDim}; font-style:italic; }
        .sql-editor-area::selection { background:${THEME.primary}28; }
        .sql-tab-btn { transition:all 0.18s; cursor:pointer; }
        .sql-tab-btn:hover { background:${THEME.primary}08 !important; }
        .sql-tab-active { background:${THEME.primary}14 !important; color:${THEME.primary} !important; outline:1px solid ${THEME.primary}25 !important; }
        .sql-icon-btn { transition:all 0.15s; cursor:pointer; }
        .sql-icon-btn:hover:not(:disabled) { background:${THEME.primary}12 !important; color:${THEME.textMain} !important; }
        .sql-history-item { transition:all 0.12s; cursor:pointer; border:1px solid ${THEME.grid}30; }
        .sql-history-item:hover { background:${THEME.primary}06 !important; border-color:${THEME.glassBorderHover} !important; }
        .sql-snippet-card { transition:all 0.15s; }
        .sql-snippet-card:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(0,0,0,0.2); }
        .sql-diff-add { background:${THEME.success}10; border-left:2px solid ${THEME.success}; }
        .sql-diff-remove { background:${THEME.danger}10; border-left:2px solid ${THEME.danger}; }
        .sql-tooltip { position:relative; }
        .sql-tooltip::after {
            content:attr(data-tip); position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%);
            padding:4px 8px; borderRadius:5px; background:rgba(0,0,0,0.85); color:#fff;
            font-size:10px; whiteSpace:nowrap; pointerEvents:none; opacity:0; transition:opacity 0.15s;
            z-index:9999;
        }
        .sql-tooltip:hover::after { opacity:1; }
        .sql-param { background:${THEME.warning}12; color:${THEME.warning}; padding:1px 5px; border-radius:3px; font-weight:600; }
        .sql-readonly-banner { animation:sqlSlideDown 0.2s ease; }
        .sql-suggest-box { animation:sqlSlideDown 0.12s ease; }
        .sql-page-btn:hover:not(:disabled) { background:${THEME.primary}14 !important; color:${THEME.primary} !important; }
    `}</style>
);

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */
const PAGE_SIZE_OPTIONS = [25, 50, 100, 250, 500];

const SQL_KEYWORDS = [
    'SELECT','FROM','WHERE','JOIN','INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL JOIN','ON',
    'GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET','WITH','AS','DISTINCT','UNION','UNION ALL',
    'INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','CREATE TABLE','DROP TABLE','ALTER TABLE',
    'CREATE INDEX','EXPLAIN','ANALYZE','VACUUM','TRUNCATE','BEGIN','COMMIT','ROLLBACK','SAVEPOINT',
    'pg_stat_activity','pg_stat_user_tables','pg_stat_user_indexes','pg_locks','pg_stat_replication',
    'pg_statio_user_tables','pg_database','pg_class','pg_namespace','information_schema',
    'current_database','now()','pg_size_pretty','pg_total_relation_size','pg_relation_size',
    'COUNT(*)','COUNT','SUM','AVG','MAX','MIN','COALESCE','NULLIF','ROUND','CAST','TO_CHAR',
    'NOT NULL','PRIMARY KEY','FOREIGN KEY','REFERENCES','DEFAULT','UNIQUE','INDEX','CONSTRAINT',
];

const TEMPLATES = [
    { label:'Active Queries', icon:Activity, group:'Monitoring', sql:`SELECT pid, state, query, now() - query_start AS duration\nFROM pg_stat_activity\nWHERE state = 'active'\nORDER BY duration DESC;` },
    { label:'Table Sizes', icon:Database, group:'Storage', sql:`SELECT schemaname, relname AS table_name,\n  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,\n  pg_size_pretty(pg_relation_size(relid)) AS data_size\nFROM pg_catalog.pg_statio_user_tables\nORDER BY pg_total_relation_size(relid) DESC\nLIMIT 20;` },
    { label:'Index Usage', icon:Zap, group:'Performance', sql:`SELECT schemaname, relname, indexrelname,\n  idx_scan, idx_tup_read, idx_tup_fetch\nFROM pg_stat_user_indexes\nORDER BY idx_scan DESC\nLIMIT 20;` },
    { label:'Lock Status', icon:Lock, group:'Monitoring', sql:`SELECT l.pid, l.mode, l.granted, a.query\nFROM pg_locks l\nJOIN pg_stat_activity a ON l.pid = a.pid\nWHERE NOT l.granted\nORDER BY l.pid;` },
    { label:'Cache Hit Ratio', icon:Shield, group:'Performance', sql:`SELECT\n  sum(heap_blks_read) AS heap_read,\n  sum(heap_blks_hit) AS heap_hit,\n  ROUND(sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100, 2) AS ratio\nFROM pg_statio_user_tables;` },
    { label:'Replication Lag', icon:Network, group:'Replication', sql:`SELECT client_addr, state, sent_lsn, write_lsn,\n  flush_lsn, replay_lsn, sync_state\nFROM pg_stat_replication;` },
    { label:'Long Queries', icon:Timer, group:'Monitoring', sql:`SELECT pid,\n  now() - pg_stat_activity.query_start AS duration,\n  query, state\nFROM pg_stat_activity\nWHERE (now() - pg_stat_activity.query_start) > interval '30 seconds'\n  AND state != 'idle'\nORDER BY duration DESC;` },
    { label:'Disk Usage', icon:HardDrive, group:'Storage', sql:`SELECT\n  pg_size_pretty(pg_database_size(current_database())) AS db_size,\n  pg_size_pretty(sum(pg_total_relation_size(c.oid))) AS total_tables\nFROM pg_class c\nWHERE c.relkind = 'r';` },
    { label:'Table Bloat', icon:TrendingUp, group:'Maintenance', sql:`SELECT schemaname, tablename,\n  n_live_tup, n_dead_tup,\n  ROUND(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) AS bloat_pct,\n  last_autovacuum, last_autoanalyze\nFROM pg_stat_user_tables\nORDER BY bloat_pct DESC NULLS LAST\nLIMIT 20;` },
    { label:'Seq Scans', icon:Gauge, group:'Performance', sql:`SELECT relname, seq_scan, seq_tup_read,\n  idx_scan, idx_tup_fetch,\n  ROUND(seq_scan::numeric / NULLIF(seq_scan + idx_scan, 0) * 100, 1) AS seq_pct\nFROM pg_stat_user_tables\nWHERE seq_scan > 0\nORDER BY seq_scan DESC\nLIMIT 20;` },
    { label:'Connections', icon:Globe, group:'Monitoring', sql:`SELECT state, count(*) AS connections,\n  max(now() - state_change) AS longest\nFROM pg_stat_activity\nGROUP BY state\nORDER BY connections DESC;` },
    { label:'Schema Tables', icon:Layers, group:'Schema', sql:`SELECT table_schema, table_name, table_type\nFROM information_schema.tables\nWHERE table_schema NOT IN ('pg_catalog','information_schema')\nORDER BY table_schema, table_name;` },
];

const SNIPPETS = [
    { id:'s1', name:'Safe Update', tag:'dml', sql:`-- Always use WHERE with UPDATE\nUPDATE :table\nSET :column = :value\nWHERE :condition;` },
    { id:'s2', name:'Count by Status', tag:'analytics', sql:`SELECT :status_col, COUNT(*) AS cnt\nFROM :table\nGROUP BY :status_col\nORDER BY cnt DESC;` },
    { id:'s3', name:'Recent Records', tag:'common', sql:`SELECT *\nFROM :table\nORDER BY created_at DESC\nLIMIT :n;` },
    { id:'s4', name:'Kill Query', tag:'admin', sql:`SELECT pg_terminate_backend(:pid);` },
    { id:'s5', name:'Partition Info', tag:'schema', sql:`SELECT inhrelid::regclass AS partition,\n  pg_get_expr(c.relpartbound, c.oid) AS bound\nFROM pg_inherits\nJOIN pg_class c ON c.oid = inhrelid\nWHERE inhparent = ':table'::regclass;` },
];

const SCHEMA_MOCK = [
    { name:'public', tables:[
            { name:'users', cols:['id','email','name','created_at','role','status'] },
            { name:'orders', cols:['id','user_id','total','status','created_at','updated_at'] },
            { name:'products', cols:['id','name','price','stock','category_id','description'] },
            { name:'events', cols:['id','type','payload','created_at','user_id','session_id'] },
        ]},
    { name:'analytics', tables:[
            { name:'metrics', cols:['id','name','value','ts','tags'] },
            { name:'sessions', cols:['id','user_id','started_at','ended_at','page_count'] },
        ]},
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
const fmtMs = (ms) => {
    if (ms == null) return '—';
    if (ms < 1) return '<1ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};
const fmtTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });
};
const fmtRows = (n) => n == null ? '—' : n.toLocaleString();

const detectWriteOp = (q) => /^\s*(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE)\s/i.test(q);

const formatSQL = (sql) => {
    // Basic formatter: uppercase keywords, consistent spacing
    const keywords = ['SELECT','FROM','WHERE','JOIN','INNER JOIN','LEFT JOIN','RIGHT JOIN','ON','GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET','WITH','AS','UNION','UNION ALL','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','AND','OR','NOT','IN','IS','NULL','BETWEEN','LIKE'];
    let out = sql;
    keywords.forEach(k => {
        out = out.replace(new RegExp(`\\b${k}\\b`, 'gi'), k);
    });
    // Newline before major clauses
    ['FROM','WHERE','JOIN','INNER JOIN','LEFT JOIN','RIGHT JOIN','GROUP BY','ORDER BY','HAVING','LIMIT','UNION','UNION ALL'].forEach(k => {
        out = out.replace(new RegExp(`\\s+${k}\\b`, 'g'), `\n${k}`);
    });
    // Indent SELECT list
    out = out.replace(/SELECT\s+/i, 'SELECT\n  ');
    out = out.replace(/,\s*/g, ',\n  ');
    return out.trim();
};

/* ═══════════════════════════════════════════════════════════════════════════
   MICRO COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const Spinner = ({ size=14, color=THEME.primary }) => (
    <div style={{ width:size, height:size, border:`2px solid ${color}30`, borderTopColor:color, borderRadius:'50%', animation:'sqlSpin 0.6s linear infinite', flexShrink:0 }} />
);

const Badge = ({ label, color, pulse, size='sm' }) => (
    <span style={{
        display:'inline-flex', alignItems:'center', gap:5,
        fontSize:size==='xs'?9:10, fontWeight:700,
        padding:size==='xs'?'2px 7px':'3px 9px', borderRadius:5,
        background:`${color}12`, color, border:`1px solid ${color}20`,
        lineHeight:1.2, whiteSpace:'nowrap',
    }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0, animation:pulse?'sqlPulse 1.5s ease-in-out infinite':'none' }} />
        {label}
    </span>
);

const Divider = ({ vertical }) => (
    <div style={vertical
        ? { width:1, height:16, background:`${THEME.grid}50`, flexShrink:0 }
        : { width:'100%', height:1, background:`${THEME.grid}30` }
    }/>
);

const Pill = ({ label, color=THEME.textDim, onRemove }) => (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:100, background:`${color}12`, color, fontSize:10, fontWeight:600, border:`1px solid ${color}20` }}>
        {label}
        {onRemove && <X size={9} style={{ cursor:'pointer' }} onClick={onRemove} />}
    </span>
);

/* ═══════════════════════════════════════════════════════════════════════════
   PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
const Panel = ({ title, icon:TIcon, rightNode, noPad, children, style={} }) => (
    <div style={{
        background:THEME.glass, backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
        border:`1px solid ${THEME.glassBorder}`, borderRadius:16,
        display:'flex', flexDirection:'column', overflow:'hidden', ...style,
    }}>
        {title && (
            <div style={{
                padding:'11px 16px', borderBottom:`1px solid ${THEME.glassBorder}`,
                display:'flex', alignItems:'center', justifyContent:'space-between',
                flexShrink:0, minHeight:42,
            }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    {TIcon && <TIcon size={12} color={THEME.textDim} />}
                    <span style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:'uppercase', letterSpacing:'0.07em' }}>{title}</span>
                </div>
                {rightNode}
            </div>
        )}
        <div style={{ flex:1, minHeight:0, padding:noPad?0:'13px 16px', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {children}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   EXPLAIN PLAN TREE
   ═══════════════════════════════════════════════════════════════════════════ */
const ExplainNode = ({ node, depth=0, maxTime }) => {
    const [expanded, setExpanded] = useState(true);
    if (!node) return null;
    const nodeType = node['Node Type'] || 'Unknown';
    const relation = node['Relation Name'] || node['Index Name'] || '';
    const cost = node['Total Cost'] != null ? node['Total Cost'].toFixed(1) : null;
    const rows = node['Actual Rows'] ?? node['Plan Rows'];
    const time = node['Actual Total Time'] != null ? Number(node['Actual Total Time']) : null;
    const plans = node['Plans'] || [];
    const buffers = (node['Shared Hit Blocks']||0) + (node['Shared Read Blocks']||0);
    const pctOfTotal = maxTime && time ? Math.min(100, (time / maxTime) * 100) : 0;
    const nodeColor = time > 100 ? THEME.danger : time > 10 ? THEME.warning : THEME.success;

    return (
        <div style={{ marginLeft:depth*20, animation:'sqlFadeIn 0.15s ease' }}>
            <div onClick={() => setExpanded(!expanded)} style={{
                display:'flex', alignItems:'center', gap:8, padding:'7px 12px',
                borderRadius:8, cursor:'pointer',
                background:time>100?`${THEME.danger}05`:THEME.surface,
                border:`1px solid ${time>100?`${THEME.danger}18`:`${THEME.grid}35`}`,
                marginBottom:3, transition:'all 0.12s', position:'relative', overflow:'hidden',
            }}>
                {/* Time bar behind */}
                {pctOfTotal > 0 && (
                    <div style={{
                        position:'absolute', left:0, top:0, bottom:0,
                        width:`${pctOfTotal}%`, background:`${nodeColor}06`,
                        pointerEvents:'none', transformOrigin:'left',
                        animation:'sqlBarGrow 0.6s ease',
                    }} />
                )}
                {plans.length > 0 && (
                    <ChevronRight size={10} color={THEME.textDim} style={{ flexShrink:0, transition:'transform 0.15s', transform:expanded?'rotate(90deg)':'none', position:'relative' }} />
                )}
                <span style={{ width:7, height:7, borderRadius:'50%', background:nodeColor, flexShrink:0, boxShadow:`0 0 5px ${nodeColor}70`, position:'relative' }} />
                <span style={{ fontSize:12, fontWeight:700, color:THEME.textMain, position:'relative' }}>{nodeType}</span>
                {relation && <span style={{ fontSize:11, color:THEME.primary, fontFamily:'monospace', fontWeight:600, position:'relative' }}>{relation}</span>}
                <div style={{ marginLeft:'auto', display:'flex', gap:10, flexShrink:0, position:'relative' }}>
                    {time != null && <span style={{ fontSize:10, fontWeight:700, color:nodeColor, fontVariantNumeric:'tabular-nums' }}>{time.toFixed(2)}ms</span>}
                    {rows != null && <span style={{ fontSize:10, color:THEME.textDim, fontVariantNumeric:'tabular-nums' }}>{Number(rows).toLocaleString()} rows</span>}
                    {cost != null && <span style={{ fontSize:10, color:THEME.textDim }}>cost {cost}</span>}
                    {buffers > 0 && <span style={{ fontSize:10, color:THEME.textDim }}>{buffers} blks</span>}
                </div>
            </div>
            {expanded && plans.map((child, i) => <ExplainNode key={i} node={child} depth={depth+1} maxTime={maxTime} />)}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DIFF VIEWER
   ═══════════════════════════════════════════════════════════════════════════ */
const DiffViewer = ({ leftRows, rightRows, leftFields, rightFields }) => {
    if (!leftRows || !rightRows) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:THEME.textDim, fontSize:12 }}>
            Run two queries on separate tabs, then diff them.
        </div>
    );
    const allKeys = [...new Set([...(leftFields||[]).map(f=>f.name), ...(rightFields||[]).map(f=>f.name)])];
    const leftSet = new Set(leftRows.map(r => JSON.stringify(r)));
    const rightSet = new Set(rightRows.map(r => JSON.stringify(r)));
    return (
        <div style={{ overflow:'auto', height:'100%' }} className="sql-scrollbar">
            <div style={{ display:'flex', gap:1 }}>
                {['Left','Right'].map((side, si) => (
                    <div key={side} style={{ flex:1, minWidth:0 }}>
                        <div style={{ padding:'6px 12px', background:THEME.surface, fontSize:10, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${THEME.grid}30` }}>
                            {side} ({si===0?leftRows.length:rightRows.length} rows)
                        </div>
                        <table style={{ width:'100%', borderCollapse:'collapse' }}>
                            <thead>
                            <tr>{allKeys.map(k=><th key={k} style={{ padding:'6px 10px', fontSize:9, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', textAlign:'left', position:'sticky', top:0, background:THEME.surface, borderBottom:`1px solid ${THEME.grid}30` }}>{k}</th>)}</tr>
                            </thead>
                            <tbody>
                            {(si===0?leftRows:rightRows).map((row,ri)=>{
                                const serialized = JSON.stringify(row);
                                const inOther = si===0 ? rightSet.has(serialized) : leftSet.has(serialized);
                                return (
                                    <tr key={ri} className={inOther?'':'sql-diff-'+(si===0?'remove':'add')}>
                                        {allKeys.map(k=><td key={k} style={{ padding:'5px 10px', fontSize:11, color:THEME.textMuted, fontFamily:'monospace', borderBottom:`1px solid ${THEME.grid}15`, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row[k]??<span style={{fontSize:9,opacity:.5}}>NULL</span>}</td>)}
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   AUTOCOMPLETE
   ═══════════════════════════════════════════════════════════════════════════ */
const AutoComplete = ({ suggestions, onSelect, anchorRect, query }) => {
    const [idx, setIdx] = useState(0);
    useEffect(() => setIdx(0), [suggestions]);
    if (!suggestions.length) return null;
    return (
        <div className="sql-suggest-box" style={{
            position:'fixed', zIndex:9999,
            top:(anchorRect?.top||0) + 20, left:(anchorRect?.left||0),
            background:THEME.surface, border:`1px solid ${THEME.primary}25`,
            borderRadius:10, overflow:'hidden', minWidth:200, maxWidth:340,
            boxShadow:`0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${THEME.primary}15`,
        }}>
            <div style={{ padding:'4px 10px', borderBottom:`1px solid ${THEME.grid}30`, fontSize:9, color:THEME.textDim, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                {suggestions.length} suggestions
            </div>
            {suggestions.slice(0,8).map((s,i) => (
                <div key={s} onMouseDown={e=>{ e.preventDefault(); onSelect(s); }}
                     style={{
                         padding:'6px 12px', fontSize:12, cursor:'pointer',
                         color:i===idx?THEME.primary:THEME.textMuted,
                         background:i===idx?`${THEME.primary}10`:'transparent',
                         fontFamily:'monospace', fontWeight:600,
                         display:'flex', alignItems:'center', gap:6,
                     }}>
                    <Code size={9} style={{ opacity:0.5 }} /> {s}
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUERY PARAMETERS
   ═══════════════════════════════════════════════════════════════════════════ */
const ParamEditor = ({ sql, params, onChange }) => {
    const paramMatches = useMemo(() => {
        const regex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
        const found = new Set();
        let m;
        while ((m = regex.exec(sql)) !== null) found.add(m[1]);
        return [...found];
    }, [sql]);
    if (paramMatches.length === 0) return null;
    return (
        <div style={{ padding:'8px 14px', borderTop:`1px solid ${THEME.glassBorder}`, background:THEME.surface, display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', animation:'sqlSlideDown 0.2s ease' }}>
            <Variable size={11} color={THEME.warning} />
            <span style={{ fontSize:10, fontWeight:700, color:THEME.warning }}>Parameters</span>
            <Divider vertical />
            {paramMatches.map(p => (
                <div key={p} style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:THEME.warning, fontFamily:'monospace' }}>:{p}</span>
                    <span style={{ fontSize:10, color:THEME.textDim }}>=</span>
                    <input
                        value={params[p]||''}
                        onChange={e => onChange({ ...params, [p]:e.target.value })}
                        placeholder="value"
                        style={{ padding:'3px 8px', borderRadius:5, border:`1px solid ${THEME.warning}25`, background:`${THEME.warning}08`, color:THEME.textMain, fontSize:11, outline:'none', fontFamily:'monospace', width:80 }}
                    />
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SCHEMA BROWSER
   ═══════════════════════════════════════════════════════════════════════════ */
const SchemaBrowser = ({ onInsert }) => {
    const [expanded, setExpanded] = useState({ public:true });
    const [search, setSearch] = useState('');
    const filtered = useMemo(() => {
        if (!search) return SCHEMA_MOCK;
        return SCHEMA_MOCK.map(s => ({
            ...s, tables:s.tables.filter(t =>
                t.name.includes(search.toLowerCase()) ||
                t.cols.some(c => c.includes(search.toLowerCase()))
            )
        })).filter(s => s.tables.length > 0);
    }, [search]);
    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            <div style={{ padding:'8px 10px', borderBottom:`1px solid ${THEME.glassBorder}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 9px', borderRadius:7, background:THEME.surface, border:`1px solid ${THEME.grid}50` }}>
                    <Search size={11} color={THEME.textDim} />
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search schema…"
                           style={{ border:'none', background:'transparent', color:THEME.textMain, outline:'none', flex:1, fontSize:11, fontFamily:'inherit' }} />
                </div>
            </div>
            <div className="sql-scrollbar" style={{ flex:1, overflowY:'auto', padding:'6px 8px' }}>
                {filtered.map(schema => (
                    <div key={schema.name}>
                        <div onClick={() => setExpanded(p=>({...p,[schema.name]:!p[schema.name]}))}
                             style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 8px', cursor:'pointer', borderRadius:6, marginBottom:2 }}>
                            <ChevronRight size={10} color={THEME.textDim} style={{ transform:expanded[schema.name]?'rotate(90deg)':'none', transition:'transform 0.15s' }} />
                            <Database size={11} color={THEME.secondary} />
                            <span style={{ fontSize:11, fontWeight:700, color:THEME.textMuted }}>{schema.name}</span>
                            <span style={{ fontSize:9, color:THEME.textDim, marginLeft:'auto' }}>{schema.tables.length}</span>
                        </div>
                        {expanded[schema.name] && schema.tables.map(table => (
                            <div key={table.name} style={{ marginLeft:16 }}>
                                <div onClick={() => onInsert(table.name)}
                                     style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 8px', cursor:'pointer', borderRadius:6 }}
                                     onMouseEnter={e=>e.currentTarget.style.background=`${THEME.primary}08`}
                                     onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                                >
                                    <Table2 size={10} color={THEME.primary} />
                                    <span style={{ fontSize:11, color:THEME.textMain }}>{table.name}</span>
                                </div>
                                {table.cols.map(col => (
                                    <div key={col} onClick={() => onInsert(col)}
                                         style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 8px 3px 24px', cursor:'pointer', borderRadius:6 }}
                                         onMouseEnter={e=>e.currentTarget.style.background=`${THEME.primary}06`}
                                         onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                                    >
                                        <Columns size={9} color={THEME.textDim} />
                                        <span style={{ fontSize:10, color:THEME.textDim, fontFamily:'monospace' }}>{col}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const SqlConsoleTab = () => {
    /* ── Tabs state ── */
    const [tabs, setTabs] = useState([{ id:1, label:'Query 1', sql:'', result:null, explainResult:null, sortCol:null, sortDir:'asc', page:1 }]);
    const [activeTab, setActiveTab] = useState(1);
    const [tabCounter, setTabCounter] = useState(2);

    const currentTab = tabs.find(t=>t.id===activeTab) || tabs[0];
    const updateTab = useCallback((id, patch) => setTabs(prev => prev.map(t => t.id===id ? {...t,...patch} : t)), []);

    /* ── Global state ── */
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeResultTab, setActiveResultTab] = useState('results');
    const [showTemplates, setShowTemplates] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showSchemaBrowser, setShowSchemaBrowser] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [editorExpanded, setEditorExpanded] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [elapsedMs, setElapsedMs] = useState(0);
    const [readOnly, setReadOnly] = useState(false);
    const [savedQueries, setSavedQueries] = useState([]);
    const [snippets, setSnippets] = useState(SNIPPETS);
    const [showSnippets, setShowSnippets] = useState(false);
    const [activePanel, setActivePanel] = useState('history'); // 'history'|'schema'|'snippets'
    const [params, setParams] = useState({});
    const [pageSize, setPageSize] = useState(50);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showDiff, setShowDiff] = useState(false);
    const [diffTabIds, setDiffTabIds] = useState([null, null]);
    const [txActive, setTxActive] = useState(false);
    const [queryTimeout, setQueryTimeout] = useState(30);
    const [showSettings, setShowSettings] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestAnchor, setSuggestAnchor] = useState(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveLabel, setSaveLabel] = useState('');
    const [filterText, setFilterText] = useState('');
    const [colFilter, setColFilter] = useState({});

    const editorRef = useRef(null);
    const timerRef = useRef(null);
    const startTsRef = useRef(null);
    const sqlRef = useRef(currentTab.sql);
    const tabsRef = useRef(tabs);

    useEffect(() => { sqlRef.current = currentTab.sql; }, [currentTab.sql]);
    useEffect(() => { tabsRef.current = tabs; }, [tabs]);

    const setSql = useCallback((val) => updateTab(activeTab, { sql:val }), [updateTab, activeTab]);

    /* ── Timer ── */
    const startTimer = useCallback(() => {
        startTsRef.current = performance.now();
        setElapsedMs(0);
        timerRef.current = setInterval(() => setElapsedMs(Math.round(performance.now() - startTsRef.current)), 50);
    }, []);
    const stopTimer = useCallback(() => { clearInterval(timerRef.current); timerRef.current = null; }, []);
    useEffect(() => () => clearInterval(timerRef.current), []);

    /* ── Auto-complete ── */
    const handleSuggest = useCallback((e) => {
        const ta = e.target;
        const val = ta.value;
        const pos = ta.selectionStart;
        const before = val.slice(0, pos);
        const lastWord = before.match(/\b(\w+)$/)?.[1] || '';
        if (lastWord.length < 2) { setSuggestions([]); return; }
        const matches = SQL_KEYWORDS.filter(k => k.toLowerCase().startsWith(lastWord.toLowerCase()) && k !== lastWord);
        setSuggestions(matches.slice(0, 8));
        if (matches.length > 0) {
            const rect = ta.getBoundingClientRect();
            // Approximate caret position
            setSuggestAnchor({ top:rect.top + 60, left:rect.left + 20 });
        }
    }, []);

    const applySuggestion = useCallback((sug) => {
        const ta = editorRef.current;
        if (!ta) return;
        const val = ta.value;
        const pos = ta.selectionStart;
        const before = val.slice(0, pos);
        const lastWordMatch = before.match(/\b\w+$/);
        if (!lastWordMatch) return;
        const start = pos - lastWordMatch[0].length;
        const newVal = val.slice(0, start) + sug + val.slice(pos);
        setSql(newVal);
        setSuggestions([]);
        requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + sug.length;
            ta.focus();
        });
    }, [setSql]);

    /* ── Resolve params ── */
    const resolvedSql = useMemo(() => {
        let q = currentTab.sql;
        Object.entries(params).forEach(([k,v]) => {
            q = q.replace(new RegExp(`:${k}\\b`, 'g'), v);
        });
        return q;
    }, [currentTab.sql, params]);

    /* ── Process data ── */
    const processData = useCallback((rows) => {
        if (!rows || !Array.isArray(rows)) return [];
        return rows.map(row => {
            const out = { ...row };
            Object.keys(out).forEach(k => {
                let v = out[k];
                if (v === null || v === undefined) { out[k] = null; return; }
                if (typeof v === 'object') { try { v = JSON.stringify(v); } catch { v = '[Object]'; } }
                else v = String(v);
                out[k] = v.length > 200 ? v.slice(0, 200) + '…' : v;
            });
            return out;
        });
    }, []);

    /* ── Processed + sorted + filtered + paginated rows ── */
    const { sortCol, sortDir, page, result } = currentTab;
    const processedRows = useMemo(() => {
        if (!result?.rows) return [];
        let rows = processData(result.rows);
        // Column filter
        Object.entries(colFilter).forEach(([col, val]) => {
            if (val) rows = rows.filter(r => String(r[col]||'').toLowerCase().includes(val.toLowerCase()));
        });
        // Global filter
        if (filterText) rows = rows.filter(r => Object.values(r).some(v => String(v||'').toLowerCase().includes(filterText.toLowerCase())));
        // Sort
        if (sortCol) {
            rows = [...rows].sort((a, b) => {
                const av = a[sortCol], bv = b[sortCol];
                if (av===null&&bv===null) return 0; if (av===null) return 1; if (bv===null) return -1;
                const na = Number(av), nb = Number(bv);
                if (!isNaN(na)&&!isNaN(nb)) return sortDir==='asc'?na-nb:nb-na;
                return sortDir==='asc'?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));
            });
        }
        return rows;
    }, [result, processData, sortCol, sortDir, filterText, colFilter]);

    const totalPages = Math.ceil(processedRows.length / pageSize);
    const pagedRows = processedRows.slice((page-1)*pageSize, page*pageSize);

    /* ── History ── */
    const addToHistory = useCallback((query, res, err) => {
        setHistory(prev => [{
            id:Date.now(), sql:query, ts:new Date().toISOString(),
            success:!err, rowCount:res?.rowCount||0, durationMs:res?.duration||0, error:err,
        }, ...prev].slice(0, 100));
    }, []);

    const filteredHistory = useMemo(() => {
        if (!historySearch.trim()) return history;
        const q = historySearch.toLowerCase();
        return history.filter(h => h.sql.toLowerCase().includes(q));
    }, [history, historySearch]);

    /* ══════════════════════════════════════════════════════════
       EXECUTE
       ══════════════════════════════════════════════════════════ */
    const handleExecute = useCallback(async (overrideSql) => {
        const query = (overrideSql || resolvedSql || '').trim();
        if (!query || loading) return;
        if (readOnly && detectWriteOp(query)) {
            updateTab(activeTab, { result:{ error:'🔒 Read-only mode is active. Disable it to run write operations.', duration:0 } });
            return;
        }
        setLoading(true);
        updateTab(activeTab, { result:null, explainResult:null, page:1 });
        setActiveResultTab('results');
        setSuggestions([]);
        startTimer();
        try {
            const res = await postData('/api/query', { sql:query, timeout:queryTimeout*1000 });
            stopTimer();
            if (res.error) throw new Error(res.error);
            if (!res.fields || !res.rows) throw new Error('Invalid response from /api/query. Expected { fields, rows, rowCount }.');
            res.duration = Math.round(performance.now() - startTsRef.current);
            updateTab(activeTab, { result:res, sortCol:null });
            addToHistory(query, res, null);
        } catch (err) {
            stopTimer();
            const msg = err?.message||String(err);
            updateTab(activeTab, { result:{ error:msg, duration:Math.round(performance.now()-startTsRef.current) } });
            addToHistory(query, null, msg);
        } finally { setLoading(false); }
    }, [loading, resolvedSql, readOnly, updateTab, activeTab, addToHistory, startTimer, stopTimer, queryTimeout]);

    /* ── Explain ── */
    const handleExplain = useCallback(async (overrideSql) => {
        const query = (overrideSql || resolvedSql || '').trim();
        if (!query || loading) return;
        setLoading(true);
        updateTab(activeTab, { explainResult:null });
        setActiveResultTab('explain');
        startTimer();
        try {
            const res = await postData('/api/query', { sql:`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}` });
            stopTimer();
            if (res.error) throw new Error(res.error);
            res.duration = Math.round(performance.now() - startTsRef.current);
            updateTab(activeTab, { explainResult:res });
        } catch (err) {
            stopTimer();
            updateTab(activeTab, { explainResult:{ error:err?.message||String(err), duration:Math.round(performance.now()-startTsRef.current) } });
        } finally { setLoading(false); }
    }, [loading, resolvedSql, updateTab, activeTab, startTimer, stopTimer]);

    /* ── Transaction control ── */
    const handleTx = useCallback(async (cmd) => {
        try { await postData('/api/query', { sql:cmd }); if (cmd==='BEGIN') setTxActive(true); else setTxActive(false); }
        catch (e) { console.error(e); }
    }, []);

    /* ── Keyboard shortcuts ── */
    const handleKeyDown = useCallback((e) => {
        if (suggestions.length > 0 && e.key === 'Escape') { setSuggestions([]); return; }
        if (suggestions.length > 0 && e.key === 'Tab') { e.preventDefault(); applySuggestion(suggestions[0]); return; }
        if ((e.ctrlKey||e.metaKey) && !e.shiftKey && e.key==='Enter') { e.preventDefault(); handleExecute(); return; }
        if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==='Enter') { e.preventDefault(); handleExplain(); return; }
        if ((e.ctrlKey||e.metaKey) && e.shiftKey && e.key==='F') { e.preventDefault(); setSql(formatSQL(currentTab.sql)); return; }
        if (e.key==='Tab') {
            e.preventDefault();
            const ta = e.target, s=ta.selectionStart, end=ta.selectionEnd, v=ta.value;
            setSql(v.substring(0,s)+'  '+v.substring(end));
            requestAnimationFrame(()=>{ ta.selectionStart=ta.selectionEnd=s+2; });
        }
    }, [handleExecute, handleExplain, setSql, currentTab.sql, suggestions, applySuggestion]);

    /* ── Export ── */
    const doExport = useCallback((fmt) => {
        if (!result?.rows?.length) return;
        let content, mime, ext;
        if (fmt==='csv') {
            const h = result.fields.map(f=>f.name).join(',');
            const rows = result.rows.map(r=>result.fields.map(f=>{ let v=r[f.name]; if(v==null)return ''; v=String(v); return(v.includes(',')||v.includes('"')||v.includes('\n'))?`"${v.replace(/"/g,'""')}"`:v; }).join(','));
            content = h+'\n'+rows.join('\n'); mime='text/csv'; ext='csv';
        } else {
            content = JSON.stringify(result.rows, null, 2); mime='application/json'; ext='json';
        }
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content],{type:mime}));
        a.download = `vigil-${Date.now()}.${ext}`; a.click();
    }, [result]);

    /* ── Clipboard ── */
    const copyText = useCallback((text, id) => {
        navigator.clipboard?.writeText(text);
        setCopiedId(id);
        setTimeout(()=>setCopiedId(null), 1500);
    }, []);

    /* ── Tabs management ── */
    const addTab = useCallback(() => {
        const id = tabCounter;
        setTabCounter(c=>c+1);
        setTabs(prev=>[...prev, { id, label:`Query ${id}`, sql:'', result:null, explainResult:null, sortCol:null, sortDir:'asc', page:1 }]);
        setActiveTab(id);
    }, [tabCounter]);

    const closeTab = useCallback((id) => {
        setTabs(prev=>{
            const next = prev.filter(t=>t.id!==id);
            if (next.length === 0) return prev;
            if (activeTab === id) setActiveTab(next[next.length-1].id);
            return next;
        });
    }, [activeTab]);

    /* ── Save query ── */
    const saveQuery = useCallback(() => {
        if (!saveLabel.trim() || !currentTab.sql.trim()) return;
        setSavedQueries(prev=>[...prev, { id:Date.now(), label:saveLabel, sql:currentTab.sql, ts:new Date().toISOString() }]);
        setSaveLabel('');
        setShowSaveDialog(false);
    }, [saveLabel, currentTab.sql]);

    /* ── Extract explain plan ── */
    const explainPlan = useMemo(() => {
        const er = currentTab.explainResult;
        if (!er?.rows?.length) return null;
        try {
            const first = er.rows[0];
            const planData = first['QUERY PLAN']||first['query plan']||first;
            if (Array.isArray(planData)) return planData[0]?.Plan||planData[0]||null;
            if (typeof planData==='object'&&planData.Plan) return planData.Plan;
            if (typeof planData==='string') { const p=JSON.parse(planData); return Array.isArray(p)?p[0]?.Plan||null:p?.Plan||null; }
            return null;
        } catch { return null; }
    }, [currentTab.explainResult]);

    const explainMaxTime = useMemo(() => {
        const calcMax = (node) => {
            if (!node) return 0;
            const t = node['Actual Total Time']||0;
            const children = (node['Plans']||[]).reduce((acc,c)=>Math.max(acc,calcMax(c)),0);
            return Math.max(t,children);
        };
        return calcMax(explainPlan);
    }, [explainPlan]);

    const lineCount = useMemo(() => Math.max((currentTab.sql.match(/\n/g)||[]).length+1,1), [currentTab.sql]);
    const editorHeight = editorExpanded ? 360 : 190;

    /* ═══════════════════════════════════════════════════════════════════
       SUB COMPONENTS
       ═══════════════════════════════════════════════════════════════════ */
    const ResultTabBtn = ({ id, label, icon:Icon, count }) => {
        const active = activeResultTab===id;
        return (
            <button onClick={()=>setActiveResultTab(id)} className={`sql-tab-btn ${active?'sql-tab-active':''}`}
                    style={{ padding:'5px 12px', borderRadius:6, border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5, fontWeight:600, fontSize:11, lineHeight:1, whiteSpace:'nowrap', background:'transparent', color:active?THEME.primary:THEME.textDim, outline:'none' }}>
                <Icon size={11} />{label}
                {count!=null&&<span style={{ fontSize:9, fontWeight:800, fontVariantNumeric:'tabular-nums', opacity:0.8 }}>({fmtRows(count)})</span>}
            </button>
        );
    };

    const SortTh = ({ field }) => {
        const active = sortCol===field;
        return (
            <th onClick={()=>{ if(active) updateTab(activeTab,{sortDir:sortDir==='asc'?'desc':'asc'}); else updateTab(activeTab,{sortCol:field,sortDir:'asc'}); }}
                style={{ padding:'8px 12px', textAlign:'left', fontSize:9, fontWeight:700, color:active?THEME.primary:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:`1px solid ${THEME.grid}40`, cursor:'pointer', userSelect:'none', whiteSpace:'nowrap', position:'sticky', top:0, background:THEME.surface, zIndex:2, transition:'color 0.15s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                    {field}
                    {active&&(sortDir==='asc'?<ArrowUp size={8}/>:<ArrowDown size={8}/>)}
                </div>
            </th>
        );
    };

    /* ═══════════════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════════════ */
    return (
        <div className="sql-font" style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 130px)', overflow:'hidden', gap:0 }}>
            <SqlStyles />

            {/* ── Transaction banner ── */}
            {txActive && (
                <div style={{ padding:'6px 16px', background:`${THEME.warning}12`, borderBottom:`1px solid ${THEME.warning}25`, display:'flex', alignItems:'center', gap:10, animation:'sqlSlideDown 0.2s ease', flexShrink:0 }}>
                    <Circle size={9} color={THEME.warning} fill={THEME.warning} style={{ animation:'sqlPulse 1.5s infinite' }} />
                    <span style={{ fontSize:11, fontWeight:600, color:THEME.warning }}>Transaction Active</span>
                    <Divider vertical />
                    <button onClick={()=>handleTx('COMMIT')} style={{ padding:'3px 10px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.success}14`, color:THEME.success, fontSize:10, fontWeight:700 }}>COMMIT</button>
                    <button onClick={()=>handleTx('ROLLBACK')} style={{ padding:'3px 10px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.danger}12`, color:THEME.danger, fontSize:10, fontWeight:700 }}>ROLLBACK</button>
                </div>
            )}

            {/* ── Read-only banner ── */}
            {readOnly && (
                <div className="sql-readonly-banner" style={{ padding:'5px 16px', background:`${THEME.danger}08`, borderBottom:`1px solid ${THEME.danger}18`, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    <Lock size={11} color={THEME.danger} />
                    <span style={{ fontSize:11, fontWeight:600, color:THEME.danger }}>Read-only mode — write operations are blocked</span>
                </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:`1fr ${sidebarCollapsed?'40px':'300px'}`, gap:14, flex:1, overflow:'hidden', padding:0 }}>

                {/* ═════════ LEFT ═════════ */}
                <div style={{ display:'flex', flexDirection:'column', gap:12, height:'100%', minWidth:0 }}>

                    {/* ── Multi-Tab Editor ── */}
                    <Panel icon={Terminal} title="SQL Editor" noPad style={{ flexShrink:0 }}>

                        {/* Tab bar */}
                        <div style={{ display:'flex', alignItems:'center', gap:0, borderBottom:`1px solid ${THEME.glassBorder}`, padding:'0 12px', overflowX:'auto', flexShrink:0 }} className="sql-scrollbar">
                            {tabs.map(t => (
                                <div key={t.id} onClick={()=>setActiveTab(t.id)}
                                     style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', cursor:'pointer', borderBottom:`2px solid ${t.id===activeTab?THEME.primary:'transparent'}`, color:t.id===activeTab?THEME.primary:THEME.textDim, fontSize:11, fontWeight:t.id===activeTab?700:500, whiteSpace:'nowrap', transition:'all 0.15s', flexShrink:0 }}>
                                    <span>{t.label}</span>
                                    {t.result && !t.result.error && <span style={{ width:5, height:5, borderRadius:'50%', background:THEME.success }}/>}
                                    {t.result?.error && <span style={{ width:5, height:5, borderRadius:'50%', background:THEME.danger }}/>}
                                    {tabs.length > 1 && (
                                        <X size={9} onClick={e=>{e.stopPropagation();closeTab(t.id);}}
                                           style={{ cursor:'pointer', opacity:0.5, transition:'opacity 0.12s' }}
                                           onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.5'}
                                        />
                                    )}
                                </div>
                            ))}
                            <button onClick={addTab} style={{ padding:'6px 10px', cursor:'pointer', background:'none', border:'none', color:THEME.textDim, display:'flex', alignItems:'center', gap:3, fontSize:11, flexShrink:0 }}>
                                <Plus size={11} /> New
                            </button>
                            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4, padding:'0 4px' }}>
                                {/* Diff */}
                                {tabs.length >= 2 && (
                                    <button onClick={()=>{setShowDiff(!showDiff);if(!showDiff)setDiffTabIds([tabs[0].id,tabs[1].id]);setActiveResultTab('diff');}}
                                            style={{ padding:'4px 8px', borderRadius:5, border:'none', cursor:'pointer', background:showDiff?`${THEME.secondary}18`:`${THEME.secondary}08`, color:showDiff?THEME.secondary:THEME.textDim, fontSize:10, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                                        <Diff size={10} /> Diff
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Shortcut hints */}
                        {showShortcuts && (
                            <div style={{ padding:'6px 16px', borderBottom:`1px solid ${THEME.glassBorder}`, background:THEME.surface, display:'flex', flexWrap:'wrap', gap:12, animation:'sqlFadeIn 0.15s ease' }}>
                                {[['Ctrl+Enter','Execute'],['Ctrl+Shift+Enter','Explain'],['Ctrl+Shift+F','Format'],['Tab','Indent'],['Tab (autocomplete)','Accept suggestion'],['Esc','Dismiss']].map(([k,a])=>(
                                    <span key={k} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, color:THEME.textDim }}>
                                        <kbd style={{ padding:'1px 5px', borderRadius:3, fontSize:9, fontWeight:700, background:`${THEME.grid}80`, border:`1px solid ${THEME.grid}`, color:THEME.textMuted, fontFamily:'monospace' }}>{k}</kbd>
                                        {a}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Template picker */}
                        {showTemplates && (
                            <div style={{ borderBottom:`1px solid ${THEME.glassBorder}`, background:THEME.surface, animation:'sqlFadeIn 0.15s ease' }}>
                                {['Monitoring','Performance','Storage','Maintenance','Replication','Schema'].map(group => {
                                    const items = TEMPLATES.filter(t=>t.group===group);
                                    if (!items.length) return null;
                                    return (
                                        <div key={group}>
                                            <div style={{ padding:'5px 16px 3px', fontSize:9, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.06em' }}>{group}</div>
                                            <div style={{ display:'flex', flexWrap:'wrap', gap:4, padding:'0 12px 8px' }}>
                                                {items.map((t,i)=>(
                                                    <button key={i} onClick={()=>{ setSql(t.sql); setShowTemplates(false); editorRef.current?.focus(); }}
                                                            style={{ padding:'5px 10px', borderRadius:7, border:'none', cursor:'pointer', background:`${THEME.secondary}07`, color:THEME.textMuted, outline:`1px solid ${THEME.secondary}12`, fontSize:10.5, fontWeight:600, display:'flex', alignItems:'center', gap:5, transition:'all 0.12s' }}
                                                            onMouseEnter={e=>{e.currentTarget.style.background=`${THEME.secondary}16`;e.currentTarget.style.color=THEME.secondary;}}
                                                            onMouseLeave={e=>{e.currentTarget.style.background=`${THEME.secondary}07`;e.currentTarget.style.color=THEME.textMuted;}}>
                                                        <t.icon size={10}/>{t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Settings panel */}
                        {showSettings && (
                            <div style={{ padding:'10px 16px', borderBottom:`1px solid ${THEME.glassBorder}`, background:THEME.surface, display:'flex', flexWrap:'wrap', gap:16, alignItems:'center', animation:'sqlFadeIn 0.15s ease' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <Timer size={11} color={THEME.textDim} />
                                    <span style={{ fontSize:10, color:THEME.textDim }}>Timeout</span>
                                    <select value={queryTimeout} onChange={e=>setQueryTimeout(Number(e.target.value))}
                                            style={{ padding:'2px 6px', borderRadius:5, border:`1px solid ${THEME.grid}50`, background:THEME.surface, color:THEME.textMain, fontSize:10, outline:'none' }}>
                                        {[5,10,15,30,60,120,300].map(v=><option key={v} value={v}>{v}s</option>)}
                                    </select>
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <Hash size={11} color={THEME.textDim} />
                                    <span style={{ fontSize:10, color:THEME.textDim }}>Page size</span>
                                    <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));updateTab(activeTab,{page:1});}}
                                            style={{ padding:'2px 6px', borderRadius:5, border:`1px solid ${THEME.grid}50`, background:THEME.surface, color:THEME.textMain, fontSize:10, outline:'none' }}>
                                        {PAGE_SIZE_OPTIONS.map(v=><option key={v} value={v}>{v} rows</option>)}
                                    </select>
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                    {readOnly
                                        ? <button onClick={()=>setReadOnly(false)} style={{ padding:'3px 10px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.danger}12`, color:THEME.danger, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}><Lock size={10}/> Unlock Writes</button>
                                        : <button onClick={()=>setReadOnly(true)} style={{ padding:'3px 10px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.success}10`, color:THEME.success, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}><ShieldOff size={10}/> Enable Read-only</button>
                                    }
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                    {txActive
                                        ? <span style={{ fontSize:10, color:THEME.warning, fontWeight:600 }}>TX Active</span>
                                        : <button onClick={()=>handleTx('BEGIN')} style={{ padding:'3px 10px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.warning}12`, color:THEME.warning, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}><GitBranch size={10}/> BEGIN TX</button>
                                    }
                                </div>
                            </div>
                        )}

                        {/* Save dialog */}
                        {showSaveDialog && (
                            <div style={{ padding:'8px 16px', borderBottom:`1px solid ${THEME.glassBorder}`, background:THEME.surface, display:'flex', alignItems:'center', gap:8, animation:'sqlSlideDown 0.15s ease' }}>
                                <Bookmark size={11} color={THEME.secondary} />
                                <input value={saveLabel} onChange={e=>setSaveLabel(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveQuery()} placeholder="Query name…"
                                       style={{ flex:1, padding:'4px 10px', borderRadius:6, border:`1px solid ${THEME.secondary}30`, background:THEME.surface, color:THEME.textMain, fontSize:11, outline:'none' }} autoFocus />
                                <button onClick={saveQuery} style={{ padding:'4px 12px', borderRadius:6, border:'none', cursor:'pointer', background:`${THEME.secondary}18`, color:THEME.secondary, fontSize:10, fontWeight:700 }}>Save</button>
                                <button onClick={()=>setShowSaveDialog(false)} style={{ background:'none', border:'none', cursor:'pointer', color:THEME.textDim, display:'flex' }}><X size={12}/></button>
                            </div>
                        )}

                        {/* Editor body */}
                        <div style={{ display:'flex', height:editorHeight, transition:'height 0.25s ease' }}>
                            {/* Gutter */}
                            <div style={{ width:40, flexShrink:0, padding:'12px 0', background:THEME.surface, borderRight:`1px solid ${THEME.grid}30`, overflow:'hidden', userSelect:'none' }}>
                                {Array.from({ length:Math.max(lineCount, Math.ceil(editorHeight/23)) }, (_,i)=>(
                                    <div key={i} style={{ height:23, lineHeight:'23px', fontSize:10, color:i<lineCount?THEME.textDim:'transparent', textAlign:'right', paddingRight:8, fontFamily:'monospace', fontVariantNumeric:'tabular-nums' }}>{i+1}</div>
                                ))}
                            </div>
                            {/* Textarea */}
                            <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
                                <textarea
                                    ref={editorRef}
                                    value={currentTab.sql}
                                    onChange={e=>{ setSql(e.target.value); handleSuggest(e); }}
                                    onKeyDown={handleKeyDown}
                                    onBlur={()=>setTimeout(()=>setSuggestions([]),200)}
                                    placeholder="SELECT * FROM pg_stat_activity LIMIT 10;\n\n-- Tip: Use :param_name for parameters, Ctrl+Shift+F to format"
                                    spellCheck={false}
                                    className="sql-editor-area sql-scrollbar"
                                    style={{ width:'100%', height:'100%', padding:'12px 14px', lineHeight:'23px', overflowY:'auto' }}
                                />
                                {loading && (
                                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent 0%, ${THEME.primary} 50%, transparent 100%)`, backgroundSize:'400% 100%', animation:'sqlShimmer 1s linear infinite', borderRadius:2 }}/>
                                )}
                                {/* Autocomplete */}
                                {suggestions.length > 0 && (
                                    <AutoComplete suggestions={suggestions} onSelect={applySuggestion} anchorRect={suggestAnchor} />
                                )}
                            </div>
                        </div>

                        {/* Parameter editor */}
                        <ParamEditor sql={currentTab.sql} params={params} onChange={setParams} />

                        {/* Action bar */}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', borderTop:`1px solid ${THEME.glassBorder}`, background:'rgba(10,18,36,0.5)', flexWrap:'wrap', gap:6 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                                {/* Execute */}
                                <button onClick={()=>handleExecute()} disabled={loading||!currentTab.sql.trim()} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:8, border:'none', cursor:(loading||!currentTab.sql.trim())?'not-allowed':'pointer', background:loading?`${THEME.primary}50`:`linear-gradient(135deg,${THEME.primary},${THEME.primaryDark})`, color:'#fff', fontSize:11.5, fontWeight:700, boxShadow:loading?'none':`0 2px 12px ${THEME.primary}35`, transition:'all 0.2s', opacity:!currentTab.sql.trim()?0.4:1 }}>
                                    {loading?<Spinner size={11} color="#fff"/>:<Play size={11} fill="white"/>}
                                    {loading?'Running…':'Execute'}
                                </button>
                                {/* Explain */}
                                <button onClick={()=>handleExplain()} disabled={loading||!currentTab.sql.trim()} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:8, border:'none', cursor:(loading||!currentTab.sql.trim())?'not-allowed':'pointer', background:`${THEME.secondary}12`, color:THEME.secondary, outline:`1px solid ${THEME.secondary}20`, fontSize:11, fontWeight:700, transition:'all 0.2s', opacity:!currentTab.sql.trim()?0.4:1 }}>
                                    <BarChart3 size={11}/> Explain
                                </button>
                                <Divider vertical />
                                {/* Format */}
                                <button onClick={()=>setSql(formatSQL(currentTab.sql))} disabled={!currentTab.sql.trim()} title="Format SQL (Ctrl+Shift+F)" style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 9px', borderRadius:6, border:'none', cursor:'pointer', background:`${THEME.textDim}08`, color:THEME.textDim, fontSize:10, fontWeight:600, transition:'all 0.15s', opacity:!currentTab.sql.trim()?0.3:1 }}>
                                    <AlignJustify size={11}/> Format
                                </button>
                                <button onClick={()=>setShowSaveDialog(true)} disabled={!currentTab.sql.trim()} title="Save query" style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 9px', borderRadius:6, border:'none', cursor:'pointer', background:`${THEME.textDim}08`, color:THEME.textDim, fontSize:10, fontWeight:600, transition:'all 0.15s', opacity:!currentTab.sql.trim()?0.3:1 }}>
                                    <Save size={11}/> Save
                                </button>
                                <button onClick={()=>{ setSql(''); updateTab(activeTab,{result:null,explainResult:null}); }} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 9px', borderRadius:6, border:'none', cursor:'pointer', background:`${THEME.textDim}08`, color:THEME.textDim, fontSize:10, fontWeight:600 }}>
                                    <Eraser size={11}/> Clear
                                </button>
                                <button onClick={()=>copyText(currentTab.sql,'sql')} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 9px', borderRadius:6, border:'none', cursor:'pointer', background:`${THEME.textDim}08`, color:THEME.textDim, fontSize:10, fontWeight:600 }}>
                                    {copiedId==='sql'?<><Check size={11}/> Copied</>:<><Copy size={11}/> Copy</>}
                                </button>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                {loading && (
                                    <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:`${THEME.primary}12`, fontSize:10, fontWeight:700, color:THEME.primary, fontVariantNumeric:'tabular-nums', animation:'sqlTimerPulse 1s ease-in-out infinite' }}>
                                        <Spinner size={9}/> {fmtMs(elapsedMs)}
                                    </div>
                                )}
                                {/* Toolbar toggles */}
                                {[
                                    { icon:BookOpen, active:showTemplates, onClick:()=>setShowTemplates(!showTemplates), title:'Templates' },
                                    { icon:Keyboard, active:showShortcuts, onClick:()=>setShowShortcuts(!showShortcuts), title:'Shortcuts' },
                                    { icon:Settings, active:showSettings, onClick:()=>setShowSettings(!showSettings), title:'Settings' },
                                    { icon:editorExpanded?Minimize2:Maximize2, active:false, onClick:()=>setEditorExpanded(!editorExpanded), title:'Toggle size' },
                                ].map(({icon:Icon,active,onClick,title})=>(
                                    <button key={title} onClick={onClick} title={title} className="sql-icon-btn"
                                            style={{ display:'inline-flex', alignItems:'center', padding:'5px', borderRadius:6, border:'none', cursor:'pointer', background:active?`${THEME.primary}14`:`${THEME.textDim}06`, color:active?THEME.primary:THEME.textDim, transition:'all 0.15s', outline:active?`1px solid ${THEME.primary}22`:'none' }}>
                                        <Icon size={12}/>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Panel>

                    {/* ── Results Panel ── */}
                    <Panel noPad style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>
                        {/* Result tab bar + actions */}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 14px', borderBottom:`1px solid ${THEME.glassBorder}`, flexShrink:0, gap:6, flexWrap:'wrap' }}>
                            <div style={{ display:'flex', gap:2 }}>
                                <ResultTabBtn id="results" label="Results" icon={Table2} count={result?.rowCount}/>
                                <ResultTabBtn id="explain" label="Explain" icon={BarChart3}/>
                                <ResultTabBtn id="messages" label="Log" icon={Terminal}/>
                                <ResultTabBtn id="saved" label="Saved" icon={Bookmark} count={savedQueries.length||null}/>
                                {showDiff && <ResultTabBtn id="diff" label="Diff" icon={Diff}/>}
                            </div>
                            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                                {result?.rows?.length > 0 && (
                                    <>
                                        {/* Column filter toggle */}
                                        <button onClick={()=>setColFilter({})} title="Clear filters" style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'3px 8px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.textDim}08`, color:THEME.textDim, fontSize:10, fontWeight:600 }}>
                                            <Filter size={10}/> Filter
                                        </button>
                                        <input value={filterText} onChange={e=>{ setFilterText(e.target.value); updateTab(activeTab,{page:1}); }} placeholder="Search rows…"
                                               style={{ padding:'3px 10px', borderRadius:6, border:`1px solid ${THEME.grid}50`, background:THEME.surface, color:THEME.textMain, fontSize:10, outline:'none', width:120 }} />
                                        <Divider vertical/>
                                        <button onClick={()=>doExport('csv')} style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'3px 8px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.textDim}08`, color:THEME.textDim, fontSize:10, fontWeight:600 }}><FileSpreadsheet size={10}/> CSV</button>
                                        <button onClick={()=>doExport('json')} style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'3px 8px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.textDim}08`, color:THEME.textDim, fontSize:10, fontWeight:600 }}><FileJson size={10}/> JSON</button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ flex:1, minHeight:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                            {loading ? (
                                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:14 }}>
                                    <Spinner size={30}/>
                                    <div style={{ textAlign:'center' }}>
                                        <div style={{ fontSize:13, fontWeight:600, color:THEME.textMuted }}>Executing…</div>
                                        <div style={{ fontSize:22, fontWeight:800, color:THEME.primary, fontVariantNumeric:'tabular-nums', marginTop:6, animation:'sqlTimerPulse 1s ease-in-out infinite' }}>{fmtMs(elapsedMs)}</div>
                                        <div style={{ fontSize:10, color:THEME.textDim, marginTop:4 }}>Timeout: {queryTimeout}s · PostgreSQL</div>
                                    </div>
                                </div>

                            ) : activeResultTab === 'results' ? (
                                result?.error ? (
                                    <div style={{ padding:18, animation:'sqlFadeIn 0.2s ease', overflow:'auto' }} className="sql-scrollbar">
                                        <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'16px 18px', borderRadius:12, background:`${THEME.danger}06`, border:`1px solid ${THEME.danger}20` }}>
                                            <XCircle size={17} color={THEME.danger} style={{ flexShrink:0, marginTop:1 }}/>
                                            <div style={{ flex:1 }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                                                    <span style={{ fontSize:12, fontWeight:700, color:THEME.danger }}>Query Error</span>
                                                    {result.duration && <span style={{ fontSize:10, color:THEME.textDim }}>after {fmtMs(result.duration)}</span>}
                                                </div>
                                                <pre style={{ fontSize:12, color:THEME.textMuted, fontFamily:"'JetBrains Mono',monospace", whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0, lineHeight:1.6, padding:'12px 14px', borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.grid}30` }}>{result.error}</pre>
                                            </div>
                                        </div>
                                    </div>
                                ) : result?.rows ? (
                                    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
                                        {/* Stats bar */}
                                        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'7px 14px', borderBottom:`1px solid ${THEME.grid}25`, fontSize:10, flexShrink:0, flexWrap:'wrap', gap:10 }}>
                                            {[{icon:CheckCircle,label:'Success',color:THEME.success},{icon:Layers,label:`${fmtRows(result.rowCount)} rows`,color:THEME.textMuted},{icon:Columns,label:`${result.fields?.length||0} cols`,color:THEME.textMuted},{icon:Timer,label:fmtMs(result.duration),color:THEME.primary}].map((s,i)=>(
                                                <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:4, color:s.color, fontWeight:600 }}><s.icon size={10}/>{s.label}</span>
                                            ))}
                                            {processedRows.length !== result.rowCount && (
                                                <span style={{ color:THEME.warning, fontWeight:600 }}><Filter size={9}/> {processedRows.length} filtered</span>
                                            )}
                                            {sortCol && <button onClick={()=>updateTab(activeTab,{sortCol:null})} style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'2px 7px', borderRadius:4, border:'none', cursor:'pointer', background:`${THEME.primary}10`, color:THEME.primary, fontSize:9, fontWeight:700 }}><X size={8}/> Clear sort</button>}
                                        </div>

                                        {/* Table */}
                                        <div className="sql-scrollbar" style={{ flex:1, overflow:'auto' }}>
                                            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'100%' }}>
                                                <thead>
                                                <tr>
                                                    <th style={{ padding:'8px 10px', textAlign:'right', width:40, fontSize:9, fontWeight:700, color:THEME.textDim, borderBottom:`1px solid ${THEME.grid}40`, position:'sticky', top:0, background:THEME.surface, zIndex:2 }}>#</th>
                                                    {result.fields.map(f=><SortTh key={f.name} field={f.name}/>)}
                                                </tr>
                                                {/* Column filter row */}
                                                <tr>
                                                    <td style={{ background:THEME.surface, position:'sticky', top:36, zIndex:1 }}/>
                                                    {result.fields.map(f=>(
                                                        <td key={f.name} style={{ padding:'2px 8px', background:THEME.surface, position:'sticky', top:36, zIndex:1 }}>
                                                            <input value={colFilter[f.name]||''} onChange={e=>{setColFilter(p=>({...p,[f.name]:e.target.value}));updateTab(activeTab,{page:1});}}
                                                                   placeholder="filter…"
                                                                   style={{ width:'100%', padding:'2px 6px', borderRadius:4, border:`1px solid ${THEME.grid}40`, background:THEME.surface, color:THEME.textDim, fontSize:9, outline:'none', fontFamily:'monospace' }}/>
                                                        </td>
                                                    ))}
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {pagedRows.map((row,ri)=>(
                                                    <tr key={ri} className="sql-row-hover">
                                                        <td style={{ padding:'6px 10px', textAlign:'right', fontSize:10, color:THEME.textDim, fontVariantNumeric:'tabular-nums', borderBottom:`1px solid ${THEME.grid}12`, fontFamily:'monospace' }}>{(page-1)*pageSize+ri+1}</td>
                                                        {result.fields.map(f=>{
                                                            const v = row[f.name];
                                                            const isNull = v===null;
                                                            return (
                                                                <td key={f.name} title={isNull?'NULL':String(v)} style={{ padding:'6px 12px', fontSize:11.5, color:isNull?THEME.textDim:THEME.textMuted, fontFamily:'monospace', fontStyle:isNull?'italic':'normal', borderBottom:`1px solid ${THEME.grid}12`, maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                                    {isNull?(<span style={{ padding:'1px 5px', borderRadius:3, background:`${THEME.textDim}10`, fontSize:9, fontWeight:700 }}>NULL</span>):v}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px', borderTop:`1px solid ${THEME.grid}25`, flexShrink:0, fontSize:10, color:THEME.textDim }}>
                                                <span style={{ fontVariantNumeric:'tabular-nums' }}>
                                                    Showing {((page-1)*pageSize+1).toLocaleString()}–{Math.min(page*pageSize,processedRows.length).toLocaleString()} of {processedRows.length.toLocaleString()}
                                                </span>
                                                <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                                                    {[{icon:ChevronFirst,fn:()=>updateTab(activeTab,{page:1}),dis:page<=1},{icon:ChevronLeft,fn:()=>updateTab(activeTab,{page:page-1}),dis:page<=1},{icon:null,label:`${page} / ${totalPages}`},{icon:ChevronRight,fn:()=>updateTab(activeTab,{page:page+1}),dis:page>=totalPages},{icon:ChevronLast,fn:()=>updateTab(activeTab,{page:totalPages}),dis:page>=totalPages}].map((btn,i)=>(
                                                        btn.icon ? (
                                                            <button key={i} onClick={btn.fn} disabled={btn.dis} className="sql-page-btn" style={{ padding:'3px 6px', borderRadius:5, border:'none', cursor:btn.dis?'not-allowed':'pointer', background:THEME.surface, color:THEME.textDim, display:'flex', alignItems:'center', opacity:btn.dis?0.3:1, transition:'all 0.12s' }}>
                                                                <btn.icon size={12}/>
                                                            </button>
                                                        ) : (
                                                            <span key={i} style={{ padding:'3px 8px', fontSize:10, fontWeight:700, color:THEME.textMuted, fontVariantNumeric:'tabular-nums', minWidth:50, textAlign:'center' }}>{btn.label}</span>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:14, opacity:0.45 }}>
                                        <div style={{ width:54, height:54, borderRadius:16, background:`${THEME.primary}08`, border:`1px solid ${THEME.primary}12`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                            <Terminal size={22} color={THEME.primary}/>
                                        </div>
                                        <div style={{ textAlign:'center' }}>
                                            <div style={{ fontSize:13, fontWeight:600, color:THEME.textMuted }}>Run a query to see results</div>
                                            <div style={{ fontSize:10, color:THEME.textDim, marginTop:4 }}>
                                                <kbd style={{ padding:'1px 5px', borderRadius:3, background:`${THEME.grid}80`, border:`1px solid ${THEME.grid}`, fontSize:9, fontFamily:'monospace' }}>Ctrl+Enter</kbd> execute ·{' '}
                                                <kbd style={{ padding:'1px 5px', borderRadius:3, background:`${THEME.grid}80`, border:`1px solid ${THEME.grid}`, fontSize:9, fontFamily:'monospace' }}>Ctrl+Shift+Enter</kbd> explain
                                            </div>
                                        </div>
                                    </div>
                                )

                            ) : activeResultTab === 'explain' ? (
                                currentTab.explainResult?.error ? (
                                    <div style={{ padding:16, overflow:'auto' }} className="sql-scrollbar">
                                        <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px', borderRadius:10, background:`${THEME.danger}06`, border:`1px solid ${THEME.danger}20` }}>
                                            <XCircle size={16} color={THEME.danger} style={{ flexShrink:0 }}/>
                                            <pre style={{ fontSize:11, color:THEME.textMuted, fontFamily:'monospace', whiteSpace:'pre-wrap', margin:0 }}>{currentTab.explainResult.error}</pre>
                                        </div>
                                    </div>
                                ) : explainPlan ? (
                                    <div className="sql-scrollbar" style={{ padding:14, overflow:'auto', height:'100%' }}>
                                        {/* Summary */}
                                        {currentTab.explainResult?.rows?.[0] && (() => {
                                            const root = currentTab.explainResult.rows[0]?.['QUERY PLAN']?.[0] || currentTab.explainResult.rows[0];
                                            const planTime = root?.['Planning Time'], execTime = root?.['Execution Time'];
                                            return (planTime||execTime)?(
                                                <div style={{ display:'flex', gap:20, padding:'9px 14px', borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.grid}35`, marginBottom:12, fontSize:11 }}>
                                                    {planTime&&<span style={{ color:THEME.textDim }}>Plan: <strong style={{ color:THEME.secondary, fontVariantNumeric:'tabular-nums' }}>{planTime}ms</strong></span>}
                                                    {execTime&&<span style={{ color:THEME.textDim }}>Execute: <strong style={{ color:THEME.primary, fontVariantNumeric:'tabular-nums' }}>{execTime}ms</strong></span>}
                                                    {explainMaxTime>0&&<span style={{ color:THEME.textDim }}>Slowest node: <strong style={{ color:THEME.danger, fontVariantNumeric:'tabular-nums' }}>{explainMaxTime.toFixed(2)}ms</strong></span>}
                                                </div>
                                            ):null;
                                        })()}
                                        <div style={{ fontSize:10, fontWeight:700, color:THEME.textDim, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                                            <BarChart3 size={11} color={THEME.secondary}/> Execution Plan Tree
                                        </div>
                                        <ExplainNode node={explainPlan} depth={0} maxTime={explainMaxTime}/>
                                        <details style={{ marginTop:14 }}>
                                            <summary style={{ fontSize:10, color:THEME.textDim, cursor:'pointer', userSelect:'none' }}>Raw JSON</summary>
                                            <pre style={{ fontSize:11, color:THEME.textDim, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.6, margin:'8px 0 0', whiteSpace:'pre-wrap', padding:12, borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.grid}25`, maxHeight:280, overflow:'auto' }}>
                                                {JSON.stringify(currentTab.explainResult.rows, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                ) : (
                                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:10, opacity:0.45 }}>
                                        <BarChart3 size={26} color={THEME.textDim}/>
                                        <span style={{ fontSize:12, color:THEME.textDim }}>Click "Explain" to analyze the query plan</span>
                                    </div>
                                )

                            ) : activeResultTab === 'messages' ? (
                                <div className="sql-scrollbar" style={{ padding:12, overflow:'auto', height:'100%' }}>
                                    {history.length === 0 ? (
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', opacity:0.4 }}>
                                            <span style={{ fontSize:12, color:THEME.textDim }}>No messages yet</span>
                                        </div>
                                    ) : (
                                        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                                            {history.slice(0,40).map(h=>(
                                                <div key={h.id} style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 11px', borderRadius:7, background:THEME.surface, border:`1px solid ${THEME.grid}20`, animation:'sqlSlideIn 0.14s ease' }}>
                                                    {h.success?<CheckCircle size={10} color={THEME.success} style={{flexShrink:0}}/>:<XCircle size={10} color={THEME.danger} style={{flexShrink:0}}/>}
                                                    <span style={{ fontSize:9.5, color:THEME.textDim, fontVariantNumeric:'tabular-nums', flexShrink:0, width:56 }}>{fmtTime(h.ts)}</span>
                                                    <span style={{ fontSize:11, color:h.success?THEME.textMuted:THEME.danger, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'monospace' }}>
                                                        {h.success?`OK — ${fmtRows(h.rowCount)} rows (${fmtMs(h.durationMs)})`:`ERR — ${h.error}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            ) : activeResultTab === 'saved' ? (
                                <div className="sql-scrollbar" style={{ padding:12, overflow:'auto', height:'100%' }}>
                                    {savedQueries.length === 0 ? (
                                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:8, opacity:0.4 }}>
                                            <Bookmark size={24} color={THEME.textDim}/>
                                            <span style={{ fontSize:12, color:THEME.textDim }}>No saved queries yet. Click "Save" in the editor.</span>
                                        </div>
                                    ) : (
                                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                            {savedQueries.map(q=>(
                                                <div key={q.id} style={{ padding:'10px 13px', borderRadius:10, background:THEME.surface, border:`1px solid ${THEME.grid}30` }}>
                                                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                                                        <Bookmark size={11} color={THEME.secondary}/>
                                                        <span style={{ fontSize:12, fontWeight:700, color:THEME.textMain }}>{q.label}</span>
                                                        <span style={{ fontSize:9.5, color:THEME.textDim, marginLeft:'auto' }}>{fmtTime(q.ts)}</span>
                                                    </div>
                                                    <pre style={{ fontSize:10, color:THEME.textDim, fontFamily:'monospace', margin:'0 0 8px', whiteSpace:'pre-wrap', overflow:'hidden', maxHeight:50 }}>{q.sql}</pre>
                                                    <div style={{ display:'flex', gap:5 }}>
                                                        <button onClick={()=>setSql(q.sql)} style={{ padding:'3px 9px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.primary}12`, color:THEME.primary, fontSize:9.5, fontWeight:700, display:'inline-flex', alignItems:'center', gap:3 }}><Code size={9}/> Load</button>
                                                        <button onClick={()=>{ setSql(q.sql); requestAnimationFrame(()=>handleExecute(q.sql)); }} style={{ padding:'3px 9px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.success}10`, color:THEME.success, fontSize:9.5, fontWeight:700, display:'inline-flex', alignItems:'center', gap:3 }}><Play size={9}/> Run</button>
                                                        <button onClick={()=>setSavedQueries(prev=>prev.filter(s=>s.id!==q.id))} style={{ padding:'3px 9px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.danger}08`, color:THEME.danger, fontSize:9.5, fontWeight:700, display:'inline-flex', alignItems:'center', gap:3 }}><Trash2 size={9}/> Delete</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            ) : activeResultTab === 'diff' ? (
                                <DiffViewer
                                    leftRows={tabs.find(t=>t.id===diffTabIds[0])?.result?.rows}
                                    rightRows={tabs.find(t=>t.id===diffTabIds[1])?.result?.rows}
                                    leftFields={tabs.find(t=>t.id===diffTabIds[0])?.result?.fields}
                                    rightFields={tabs.find(t=>t.id===diffTabIds[1])?.result?.fields}
                                />
                            ) : null}
                        </div>
                    </Panel>
                </div>

                {/* ═════════ RIGHT SIDEBAR ═════════ */}
                <div style={{ display:'flex', flexDirection:'column', height:'100%', minWidth:0, overflow:'hidden' }}>
                    {sidebarCollapsed ? (
                        /* Collapsed rail */
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'10px 6px', background:THEME.glass, backdropFilter:'blur(18px)', border:`1px solid ${THEME.glassBorder}`, borderRadius:14, height:'100%' }}>
                            <button onClick={()=>setSidebarCollapsed(false)} style={{ padding:6, borderRadius:8, border:'none', cursor:'pointer', background:`${THEME.primary}12`, color:THEME.primary, display:'flex' }}><PanelRightOpen size={14}/></button>
                            <Divider/>
                            {[{icon:History,id:'history'},{icon:Database,id:'schema'},{icon:Scissors,id:'snippets'}].map(({icon:Icon,id})=>(
                                <button key={id} onClick={()=>{setSidebarCollapsed(false);setActivePanel(id);}} title={id}
                                        style={{ padding:7, borderRadius:8, border:'none', cursor:'pointer', background:activePanel===id?`${THEME.primary}14`:'transparent', color:activePanel===id?THEME.primary:THEME.textDim, display:'flex' }}>
                                    <Icon size={14}/>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <Panel noPad
                               rightNode={
                                   <div style={{ display:'flex', gap:3, alignItems:'center' }}>
                                       {[{icon:History,id:'history',label:'History'},{icon:Database,id:'schema',label:'Schema'},{icon:Scissors,id:'snippets',label:'Snippets'}].map(({icon:Icon,id,label})=>(
                                           <button key={id} onClick={()=>setActivePanel(id)} title={label}
                                                   style={{ padding:'4px 8px', borderRadius:6, border:'none', cursor:'pointer', background:activePanel===id?`${THEME.primary}14`:'transparent', color:activePanel===id?THEME.primary:THEME.textDim, display:'flex', alignItems:'center', gap:4, fontSize:10, fontWeight:600, transition:'all 0.15s' }}>
                                               <Icon size={11}/> {label}
                                           </button>
                                       ))}
                                       <Divider vertical/>
                                       <button onClick={()=>setSidebarCollapsed(true)} style={{ padding:4, borderRadius:6, border:'none', cursor:'pointer', background:'transparent', color:THEME.textDim, display:'flex' }}><PanelRightClose size={12}/></button>
                                   </div>
                               }
                               style={{ flex:1, overflow:'hidden' }}
                        >
                            {/* ── History panel ── */}
                            {activePanel === 'history' && (
                                <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
                                    {/* Search */}
                                    <div style={{ padding:'0 0 10px', flexShrink:0 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 10px', borderRadius:8, background:THEME.surface, border:`1px solid ${THEME.grid}50` }}>
                                            <Search size={11} color={THEME.textDim}/>
                                            <input value={historySearch} onChange={e=>setHistorySearch(e.target.value)} placeholder="Search history…"
                                                   style={{ border:'none', background:'transparent', color:THEME.textMain, outline:'none', flex:1, fontSize:11, fontFamily:'inherit' }}/>
                                            {historySearch&&<X size={10} color={THEME.textDim} style={{ cursor:'pointer' }} onClick={()=>setHistorySearch('')}/>}
                                        </div>
                                    </div>

                                    {/* List */}
                                    <div className="sql-scrollbar" style={{ flex:1, overflowY:'auto' }}>
                                        {filteredHistory.length === 0 ? (
                                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'36px 14px', gap:8 }}>
                                                <Clock size={22} color={THEME.textDim} style={{ opacity:0.25 }}/>
                                                <span style={{ fontSize:11, color:THEME.textDim, textAlign:'center' }}>{history.length===0?'Execute a query to build history':'No matches'}</span>
                                            </div>
                                        ) : (
                                            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                                                {filteredHistory.map(h=>{
                                                    const sel = selectedHistoryId===h.id;
                                                    const isFav = favorites.includes(h.id);
                                                    return (
                                                        <div key={h.id} className="sql-history-item"
                                                             onClick={()=>setSelectedHistoryId(sel?null:h.id)}
                                                             style={{ padding:'9px 11px', borderRadius:10, background:sel?`${THEME.primary}06`:THEME.surface, border:`1px solid ${sel?`${THEME.primary}18`:`${THEME.grid}35`}` }}>
                                                            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                                                                {h.success?<CheckCircle size={10} color={THEME.success} style={{flexShrink:0}}/>:<XCircle size={10} color={THEME.danger} style={{flexShrink:0}}/>}
                                                                <span style={{ fontSize:9, color:THEME.textDim, fontVariantNumeric:'tabular-nums' }}>{fmtTime(h.ts)}</span>
                                                                {h.success&&<><span style={{ fontSize:9, color:THEME.primary, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{fmtRows(h.rowCount)}r</span><span style={{ fontSize:9, color:THEME.textDim, fontVariantNumeric:'tabular-nums' }}>{fmtMs(h.durationMs)}</span></>}
                                                                <button onClick={e=>{e.stopPropagation();toggleFav(h.id);}} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex' }}>
                                                                    <Star size={10} color={isFav?THEME.warning:THEME.textDim} fill={isFav?THEME.warning:'none'} style={{ transition:'all 0.15s' }}/>
                                                                </button>
                                                            </div>
                                                            <div style={{ fontSize:10, color:THEME.textMuted, fontFamily:'monospace', lineHeight:1.5, overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:sel?10:2, WebkitBoxOrient:'vertical', wordBreak:'break-all' }}>
                                                                {h.sql}
                                                            </div>
                                                            {!h.success&&h.error&&<div style={{ fontSize:9.5, color:THEME.danger, marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.error}</div>}
                                                            {sel && (
                                                                <div style={{ display:'flex', gap:4, marginTop:7, animation:'sqlFadeIn 0.15s ease' }}>
                                                                    {[
                                                                        {label:'Load',icon:Code,color:THEME.primary,fn:()=>{setSql(h.sql);editorRef.current?.focus();}},
                                                                        {label:'Run',icon:Play,color:THEME.success,fn:()=>{setSql(h.sql);requestAnimationFrame(()=>handleExecute(h.sql));}},
                                                                        {label:copiedId===h.id?'Copied':'Copy',icon:copiedId===h.id?Check:Copy,color:THEME.textDim,fn:()=>copyText(h.sql,h.id)},
                                                                    ].map(b=>(
                                                                        <button key={b.label} onClick={e=>{e.stopPropagation();b.fn();}} style={{ padding:'3px 9px', borderRadius:5, border:'none', cursor:'pointer', background:`${b.color}10`, color:b.color, fontSize:9.5, fontWeight:700, display:'inline-flex', alignItems:'center', gap:3 }}>
                                                                            <b.icon size={9}/>{b.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer stats */}
                                    {history.length > 0 && (
                                        <div style={{ paddingTop:10, borderTop:`1px solid ${THEME.glassBorder}`, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, fontSize:9, flexShrink:0, marginTop:8 }}>
                                            {[{label:'Total',value:history.length,color:THEME.textMuted},{label:'OK',value:history.filter(h=>h.success).length,color:THEME.success},{label:'Err',value:history.filter(h=>!h.success).length,color:THEME.danger}].map((s,i)=>(
                                                <div key={i} style={{ textAlign:'center' }}>
                                                    <div style={{ color:THEME.textDim, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:1 }}>{s.label}</div>
                                                    <div style={{ fontSize:15, fontWeight:800, color:s.color, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{s.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {history.length > 0 && (
                                        <div style={{ marginTop:8, flexShrink:0 }}>
                                            <button onClick={()=>{setHistory([]);setFavorites([]);setSelectedHistoryId(null);}} style={{ width:'100%', padding:'5px', borderRadius:6, border:`1px solid ${THEME.danger}18`, cursor:'pointer', background:`${THEME.danger}06`, color:THEME.danger, fontSize:9.5, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                                                <Trash2 size={10}/> Clear history
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Schema Browser ── */}
                            {activePanel === 'schema' && (
                                <div style={{ height:'100%', overflow:'hidden', display:'flex', flexDirection:'column', margin:'-13px -16px' }}>
                                    <SchemaBrowser onInsert={(text)=>{
                                        const ta = editorRef.current;
                                        if (!ta) return;
                                        const pos = ta.selectionStart;
                                        const val = ta.value;
                                        setSql(val.slice(0,pos)+text+val.slice(pos));
                                        requestAnimationFrame(()=>{ ta.selectionStart=ta.selectionEnd=pos+text.length; ta.focus(); });
                                    }}/>
                                </div>
                            )}

                            {/* ── Snippets ── */}
                            {activePanel === 'snippets' && (
                                <div style={{ display:'flex', flexDirection:'column', gap:6, height:'100%', overflow:'auto' }} className="sql-scrollbar">
                                    {snippets.map(s=>(
                                        <div key={s.id} className="sql-snippet-card" style={{ padding:'10px 12px', borderRadius:10, background:THEME.surface, border:`1px solid ${THEME.grid}30`, cursor:'pointer', transition:'all 0.15s' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                                                <Scissors size={10} color={THEME.secondary}/>
                                                <span style={{ fontSize:11, fontWeight:700, color:THEME.textMain }}>{s.name}</span>
                                                <Pill label={s.tag} color={THEME.secondary}/>
                                            </div>
                                            <pre style={{ fontSize:9.5, color:THEME.textDim, fontFamily:'monospace', margin:'0 0 7px', whiteSpace:'pre-wrap', lineHeight:1.5 }}>{s.sql}</pre>
                                            <button onClick={()=>setSql(s.sql)} style={{ padding:'3px 9px', borderRadius:5, border:'none', cursor:'pointer', background:`${THEME.secondary}12`, color:THEME.secondary, fontSize:9.5, fontWeight:700, display:'inline-flex', alignItems:'center', gap:3 }}>
                                                <Code size={9}/> Insert
                                            </button>
                                        </div>
                                    ))}
                                    <div style={{ fontSize:10, color:THEME.textDim, textAlign:'center', padding:'8px 0' }}>
                                        Use <span className="sql-param">:param_name</span> for substitutable values
                                    </div>
                                </div>
                            )}
                        </Panel>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SqlConsoleTab;