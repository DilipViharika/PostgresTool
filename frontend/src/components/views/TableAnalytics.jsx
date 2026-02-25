import { useState, useEffect } from "react";

const T = {
    bg: "#070b10",
    surface: "#0e1420",
    surfaceHover: "#141c28",
    glass: "rgba(255,255,255,0.03)",
    glassBorder: "rgba(255,255,255,0.07)",
    grid: "rgba(255,255,255,0.05)",
    primary: "#4f8ef7",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#a855f7",
    teal: "#14b8a6",
    cyan: "#22d3ee",
    pink: "#ec4899",
    orange: "#f97316",
    indigo: "#6366f1",
    textMain: "#e2eaf6",
    textMuted: "#64748b",
    textDim: "#2d3748",
    mono: "'JetBrains Mono','Fira Code',monospace",
    sans: "'Outfit','DM Sans',sans-serif",
};

// ── Custom Fetch Hook ───────────────────────────────────────────────────────
function useTableData(endpoint, fallback = []) {
    const [data, setData] = useState(fallback);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('vigil_token');
                const res = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const json = await res.json();
                if (isMounted) setData(json);
            } catch (err) {
                console.error(`Error fetching ${endpoint}:`, err);
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [endpoint]);

    return { data, loading, error };
}

// ── Shared Primitives ───────────────────────────────────────────────────────
const Bar = ({ v, max, color, h = 5 }) => (
    <div style={{ width:"100%", height:h, borderRadius:h, background:T.grid, overflow:"hidden" }}>
        <div style={{ width:`${Math.min(100,max>0?(v/max)*100:0)}%`, height:"100%", background:color, borderRadius:h, transition:"width .5s ease" }} />
    </div>
);
const Pip = ({ children, color }) => (
    <span style={{ padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, background:color+"1a", color, border:`1px solid ${color}35`, whiteSpace:"nowrap" }}>{children}</span>
);
const Tag = ({ children, color }) => (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px", borderRadius:5, fontSize:10, fontWeight:700, background:color+"20", color, border:`1px solid ${color}38` }}>{children}</span>
);
const Card = ({ children, style={} }) => (
    <div style={{ background:T.glass, border:`1px solid ${T.glassBorder}`, borderRadius:13, overflow:"hidden", ...style }}>{children}</div>
);
const GridHead = ({ cols, labels }) => (
    <div style={{ display:"grid", gridTemplateColumns:cols, padding:"9px 16px", borderBottom:`1px solid ${T.grid}`, fontSize:10, fontWeight:700, color:T.textDim, textTransform:"uppercase", letterSpacing:.8, gap:8 }}>
        {labels.map(l => <span key={l}>{l}</span>)}
    </div>
);
const SectionHead = ({ icon, title, sub, right }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:T.glass, border:`1px solid ${T.glassBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
            <div>
                <div style={{ fontSize:14, fontWeight:800, color:T.textMain, letterSpacing:-.2 }}>{title}</div>
                <div style={{ fontSize:11, color:T.textDim, marginTop:2 }}>{sub}</div>
            </div>
        </div>
        {right}
    </div>
);
const Ring = ({ score, size = 46 }) => {
    const c = score > 70 ? T.success : score > 40 ? T.warning : T.danger;
    const r = size / 2 - 5; const circ = 2 * Math.PI * r; const dash = (score / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.grid} strokeWidth={4} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={4} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={c} fontSize={size*.24} fontWeight="800" fontFamily={T.mono} style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%" }}>{score}</text>
        </svg>
    );
};
const LoaderUI = () => <div style={{ padding: 30, color: T.textDim, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 14, height: 14, border: `2px solid ${T.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'rotate 1s linear infinite' }} /> Fetching live data...</div>;
const ErrorUI = ({ msg }) => <div style={{ padding: 20, color: T.danger, fontSize: 13, background: `${T.danger}15`, borderRadius: 8, border: `1px solid ${T.danger}40` }}>⚠️ Error: {msg}</div>;

// Color Helpers
const hc = s => s > 70 ? T.success : s > 40 ? T.warning : T.danger;
const dc = p => p > 20 ? T.danger : p > 10 ? T.warning : T.success;

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS (Connected to Live Endpoints)
// ══════════════════════════════════════════════════════════════════════════════

function S1_HealthScorecard() {
    const { data: tables, loading, error } = useTableData('/api/tables/stats');

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SectionHead icon="🏥" title="Table Health Scorecard" sub="Per-table health score · VACUUM recommendations" right={<Tag color={T.primary}>{tables.length} tables</Tag>} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:10 }}>
                {tables.map((t,i) => {
                    const deadPct = Number(t.deadPct);
                    // Synthetic health score based on dead tuples
                    const health = Math.max(0, Math.round(100 - (deadPct * 2)));
                    const c = hc(health);
                    const rec = deadPct > 20 ? 'VACUUM urgently' : deadPct > 10 ? 'VACUUM recommended' : 'Healthy';

                    return (
                        <Card key={i} style={{ padding:"14px 16px" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                                <div>
                                    <div style={{ fontWeight:700, fontSize:13, color:T.textMain }}>{t.name}</div>
                                    <div style={{ fontSize:10, color:T.textDim }}>{t.schema}</div>
                                </div>
                                <Ring score={health} />
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:T.textMuted }}>
                                    <span>Dead %</span><span style={{ fontFamily:T.mono, color:dc(deadPct), fontWeight:700 }}>{deadPct}%</span>
                                </div>
                                <Bar v={deadPct} max={50} color={dc(deadPct)} />
                            </div>
                            <div style={{ marginTop:10, padding:"5px 10px", borderRadius:6, background:`${c}15`, fontSize:10, fontWeight:700, color:c }}>→ {rec}</div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function S2_ColumnStats() {
    const { data: columns, loading, error } = useTableData('/api/tables/columns');

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SectionHead icon="🔬" title="Column Stats Explorer" sub="Null % · distinct values · most common values" />
            <Card style={{ overflowX: "auto", maxHeight: 500, overflowY: "auto" }}>
                <div style={{ minWidth: 600 }}>
                    <GridHead cols="1fr 1.5fr 1fr 1fr 2fr" labels={["Table", "Column", "Null %", "Distinct", "Top Values"]} />
                    <div>
                        {columns.map((col,i)=>{
                            const nullPct = Number(col.nullPct).toFixed(1);
                            const nc = nullPct > 20 ? T.danger : nullPct > 5 ? T.warning : T.success;
                            return (
                                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr 1fr 1fr 2fr", padding:"11px 16px", gap:8, alignItems:"center", borderBottom:`1px solid ${T.grid}33` }}>
                                    <span style={{ fontSize:11, color:T.textMuted }}>{col.tablename}</span>
                                    <span style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color:T.textMain }}>{col.name}</span>
                                    <div>
                                        <div style={{ fontFamily:T.mono, fontSize:11, color:nc, fontWeight:700, marginBottom:3 }}>{nullPct}%</div>
                                        <Bar v={nullPct} max={100} color={nc} h={3} />
                                    </div>
                                    <span style={{ fontFamily:T.mono, fontSize:11, color:T.textMuted }}>{Number(col.distinct).toLocaleString()}</span>
                                    <span style={{ fontSize:10, color:T.textDim, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }} title={col.topValues || "—"}>{col.topValues || "—"}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </div>
    );
}

function S3_ActivityHeatmap() {
    const { data: tables, loading, error } = useTableData('/api/tables/stats');

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    // Dynamically calculate the maximums across all tables for accurate bar charts
    const maxSeq = Math.max(...tables.map(t => Number(t.seqScans)), 1);
    const maxIdx = Math.max(...tables.map(t => Number(t.idxScans)), 1);
    const maxIns = Math.max(...tables.map(t => Number(t.inserts)), 1);

    const metrics = [
        { key:"seqScans", label:"Seq Scans", max: maxSeq, color:T.danger },
        { key:"idxScans", label:"Idx Scans", max: maxIdx, color:T.success },
        { key:"inserts", label:"Inserts", max: maxIns, color:T.primary }
    ];

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SectionHead icon="🔥" title="Table Activity Heatmap" sub="Sequential vs index scans · DML rates" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"150px repeat(3,1fr)", padding:"9px 16px", borderBottom:`1px solid ${T.grid}`, gap:8 }}>
                        <span style={{ fontSize:10, color:T.textDim, fontWeight:700, textTransform:"uppercase" }}>Table</span>
                        {metrics.map(m=><span key={m.key} style={{ fontSize:10, fontWeight:700, color:m.color, textTransform:"uppercase" }}>{m.label}</span>)}
                    </div>
                    {tables.map((t,i)=>(
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"150px repeat(3,1fr)", padding:"13px 16px", gap:8, alignItems:"center", borderBottom:`1px solid ${T.grid}33` }}>
                            <div>
                                <div style={{ fontSize:12, fontWeight:700, color:T.textMain }}>{t.name}</div>
                                <div style={{ fontSize:10, color:T.textDim }}>{t.schema}</div>
                            </div>
                            {metrics.map(m=>{
                                const val = Number(t[m.key]);
                                const pct = Math.min(100, (val/m.max)*100);
                                const hex = Math.min(255, Math.round(pct*2.2)).toString(16).padStart(2,"0");
                                return (
                                    <div key={m.key}>
                                        <div style={{ fontFamily:T.mono, fontSize:10, color:T.textMuted, marginBottom:3 }}>{val.toLocaleString()}</div>
                                        <div style={{ height:26, borderRadius:5, background:`${m.color}${hex}`, border:`1px solid ${m.color}30` }}>
                                            <div style={{ width:`${pct}%`, height:3, borderRadius:2, background:m.color+"99" }}/>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function SB_DependencyMap() {
    const { data: tablesDep, loading, error } = useTableData('/api/tables/dependencies');

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SectionHead icon="🕸" title="Table Dependency Map" sub="Foreign keys · cascade chains · drop-impact analysis" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1fr 1.5fr 1.5fr" labels={["Table", "Depends On (FK)", "Referenced By"]} />
                    {tablesDep.map((t,i) => (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr 1.5fr", padding:"12px 16px", borderBottom:`1px solid ${T.grid}33`, alignItems:"center", gap: 8 }}>
                            <div>
                                <div style={{ fontWeight:700, color:T.primary, fontSize:13 }}>{t.name}</div>
                                {t.refsBy.length > 2 && <div style={{ marginTop:4 }}><Tag color={T.danger}>Critical</Tag></div>}
                            </div>
                            <div style={{ fontSize:11, color:T.textDim }}>{t.refsTo.length ? t.refsTo.join(", ") : "None"}</div>
                            <div style={{ fontSize:11, color:T.textDim }}>{t.refsBy.length ? t.refsBy.join(", ") : "None"}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function SC_WriteAmplification() {
    const { data: tables, loading, error } = useTableData('/api/tables/stats');

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    // Filter to only show tables that are actually being written to
    const writeHeavy = tables.filter(t => Number(t.updates) > 0 || Number(t.inserts) > 0).slice(0, 10);

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SectionHead icon="✍️" title="Write Amplification" sub="HOT update % · tuple updates vs inserts" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1.5fr 1fr 1fr 1fr" labels={["Table", "Updates / hr", "Inserts / hr", "HOT Updates %"]} />
                    {writeHeavy.map((w,i) => {
                        const hotPct = Number(w.hotPct);
                        const c = hotPct > 80 ? T.success : hotPct > 30 ? T.warning : T.danger;
                        return (
                            <div key={i} style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr 1fr", padding:"12px 16px", borderBottom:`1px solid ${T.grid}33`, alignItems:"center", gap: 8 }}>
                                <div>
                                    <span style={{ fontWeight:700, fontSize:13, color:T.textMain }}>{w.name}</span>
                                    <div style={{ fontSize:10, color:T.textDim }}>{w.schema}</div>
                                </div>
                                <div style={{ fontFamily:T.mono, fontSize:12, color:T.textMuted }}>{Number(w.updates).toLocaleString()}</div>
                                <div style={{ fontFamily:T.mono, fontSize:12, color:T.textMuted }}>{Number(w.inserts).toLocaleString()}</div>
                                <div>
                                    <div style={{ fontFamily:T.mono, fontSize:12, color:c, fontWeight:700 }}>{hotPct}%</div>
                                    {hotPct < 30 && Number(w.updates) > 100 && <div style={{ fontSize: 9, color: T.danger, marginTop: 4 }}>Consider lower fillfactor</div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    );
}

function SE_ToastBloat() {
    const { data: toast, loading, error } = useTableData('/api/tables/toast');

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SectionHead icon="🍞" title="Toast Table Bloat" sub="Oversized column TOAST storage · dead chunks" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1.5fr 1.5fr 1.5fr" labels={["Main Table", "TOAST Size", "Dead Chunk %"]} />
                    {toast.map((t,i) => {
                        const deadPct = Number(t.deadPct);
                        const dc = deadPct > 20 ? T.danger : deadPct > 5 ? T.warning : T.success;
                        return (
                            <div key={i} style={{ display:"grid", gridTemplateColumns:"1.5fr 1.5fr 1.5fr", padding:"12px 16px", borderBottom:`1px solid ${T.grid}33`, alignItems:"center", gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight:700, fontSize:13 }}>{t.table}</div>
                                    <div style={{ fontSize:10, color:T.textDim, fontFamily:T.mono }}>{t.toastTable}</div>
                                </div>
                                <div style={{ fontFamily:T.mono, fontSize:12, color:T.primary, fontWeight:700 }}>{t.toastSize}</div>
                                <div>
                                    <div style={{ fontFamily:T.mono, fontSize:11, color:dc, marginBottom:3 }}>{deadPct}%</div>
                                    <Bar v={deadPct} max={40} color={dc} h={4}/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

function SF_TempTables() {
    const { data: tempTables, loading, error } = useTableData('/api/tables/temp');

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SectionHead icon="🌡" title="Temp Table Usage" sub="Temp table size per session · session age" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1fr 1fr 1fr 1fr" labels={["App / User", "PID", "Temp Size", "Session Age (sec)"]} />
                    {tempTables.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: T.textMuted, fontSize: 12 }}>No temp tables currently active in pg_temp.</div>
                    ) : tempTables.map((t,i) => (
                        <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"12px 16px", borderBottom:`1px solid ${T.grid}33`, alignItems:"center", gap: 8 }}>
                            <div>
                                <div style={{ fontSize:12, fontWeight:600 }}>{t.app || 'Unknown'}</div>
                                <div style={{ fontSize:10, color:T.textDim }}>{t.user}</div>
                            </div>
                            <span style={{ fontFamily:T.mono, fontSize:11, fontWeight:700, color:T.textMain }}>{t.pid}</span>
                            <span style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color:T.warning }}>{t.size}</span>
                            <span style={{ fontFamily:T.mono, fontSize:11, color:T.textDim }}>{t.age_sec}s</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// STATIC / MOCKED SECTIONS (Requires extensions/history to track)
// ══════════════════════════════════════════════════════════════════════════════

function SA_SchemaHistory() {
    const MOCK_DDL = [
        { ts: new Date().toISOString().split('T')[0], type:"ALTER TABLE", object:"users", schema:"public", detail:"ADD COLUMN last_login timestamptz", risk:"medium" },
        { ts: new Date().toISOString().split('T')[0], type:"CREATE INDEX", object:"idx_orders_status", schema:"public", detail:"CONCURRENTLY ON orders(status)", risk:"low" },
    ];
    return (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SectionHead icon="📝" title="Schema Change History" sub="DDL audit log (Requires pgAudit extension for live tracking)" />
            <Card style={{ padding:16 }}>
                <div style={{ position:"relative", paddingLeft:20 }}>
                    <div style={{ position:"absolute", left:6, top:0, bottom:0, width:2, background:T.grid, borderRadius:1 }}/>
                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                        {MOCK_DDL.map((e,i) => {
                            const tc = e.risk==="high"?T.danger:e.risk==="medium"?T.warning:T.success;
                            return (
                                <div key={i} style={{ position:"relative" }}>
                                    <div style={{ position:"absolute", left:-17, top:4, width:10, height:10, borderRadius:"50%", background:tc, border:`2px solid ${T.surface}` }}/>
                                    <div style={{ marginLeft:12, background:T.glass, border:`1px solid ${T.glassBorder}`, borderRadius:10, padding:"10px 14px" }}>
                                        <div style={{ display:"flex", justifyContent:"space-between", flexWrap: "wrap", gap: 8 }}>
                                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                                <Pip color={tc}>{e.type}</Pip>
                                                <span style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color:T.textMain, wordBreak:"break-all" }}>{e.schema}.{e.object}</span>
                                            </div>
                                            <span style={{ fontSize:10, color:T.textDim, fontFamily:T.mono }}>{e.ts}</span>
                                        </div>
                                        <div style={{ fontSize:11, color:T.textMuted, marginTop:5 }}>{e.detail}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </div>
    );
}

function SD_Forecast() {
    const { data: tables, loading } = useTableData('/api/tables/stats');
    if (loading) return <LoaderUI />;

    const topDead = tables.slice(0, 4);

    return (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <SectionHead icon="🔮" title="Dead Tuple Forecast" sub="Predicts autovacuum threshold hits (Uses current deadPct)" />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:10 }}>
                {topDead.map((f,i) => {
                    const deadPct = Number(f.deadPct);
                    const risk = deadPct > 20 ? "critical" : deadPct > 10 ? "high" : "low";
                    const c = risk === "critical" ? T.danger : risk === "high" ? T.warning : T.success;
                    return (
                        <Card key={i} style={{ padding:"14px" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                                <span style={{ fontWeight:700, fontSize:13, color:T.textMain }}>{f.name}</span>
                                <Pip color={c}>{risk}</Pip>
                            </div>
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:4 }}>
                                <span style={{ color:T.textDim }}>Now: <span style={{ fontFamily:T.mono, color:c, fontWeight:700 }}>{deadPct}%</span></span>
                                <span style={{ color:T.textDim }}>Target: 20%</span>
                            </div>
                            <Bar v={deadPct} max={50} color={c} h={6}/>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SHELL (Top Navigation Layout)
// ══════════════════════════════════════════════════════════════════════════════
const SECTIONS = [
    { group:"Health & Growth", label:"🏥 Health Scorecard", sub:"Health ring & VACUUM tips", component:S1_HealthScorecard },
    { group:"Health & Growth", label:"🔥 Activity Heatmap", sub:"Seq vs idx scans & DML", component:S3_ActivityHeatmap },
    { group:"Health & Growth", label:"🔮 Forecast", sub:"Dead tuple predictions", component:SD_Forecast },
    { group:"Diagnostics", label:"🔬 Column Stats", sub:"Null % & distinct values", component:S2_ColumnStats },
    { group:"Diagnostics", label:"🍞 TOAST Bloat", sub:"Oversized column chunks", component:SE_ToastBloat },
    { group:"Diagnostics", label:"🌡 Temp Tables", sub:"Session temp sizes & leaks", component:SF_TempTables },
    { group:"Architecture", label:"📝 Schema History", sub:"DDL timeline & risk", component:SA_SchemaHistory },
    { group:"Architecture", label:"🕸 Dependency Map", sub:"FK chains & cascades", component:SB_DependencyMap },
    { group:"Architecture", label:"✍️ Write Amp", sub:"WAL & tuple churn", component:SC_WriteAmplification },
];

export default function UnifiedDashboard() {
    const [active, setActive] = useState(0);
    const Preview = SECTIONS[active].component;
    const groups = [...new Set(SECTIONS.map(s => s.group))];

    return (
        <div style={{ background: T.bg, minHeight: "100vh", padding: "32px 24px", fontFamily: T.sans, color: T.textMain }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pv { animation: fadeUp .3s ease both; }
        button { outline: none; }
      `}</style>

            <div style={{ maxWidth: 1200, margin: "0 auto" }}>

                {/* Brand Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${T.primary}20`, border: `1px solid ${T.primary}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🐘</div>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: T.textMain, letterSpacing: -.5 }}>Table Analytics</div>
                        <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>Unified Dashboard</div>
                    </div>
                </div>

                {/* Top Navigation / Pills */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                    {groups.map(g => (
                        <div key={g}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>{g}</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {SECTIONS.map((s, i) => {
                                    if (s.group !== g) return null;
                                    const isA = active === i;
                                    return (
                                        <button key={i} onClick={() => setActive(i)}
                                                style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${isA ? T.primary + "55" : T.glassBorder}`, background: isA ? `${T.primary}16` : T.glass, color: isA ? T.primary : T.textMuted, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, transition: "all .2s", textAlign: "left", minWidth: 180 }}>
                                            <div>{s.label}</div>
                                            <div style={{ fontSize: 11, fontWeight: 400, color: isA ? T.primary + "88" : T.textDim, marginTop: 4 }}>{s.sub}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Active Panel Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${T.grid}` }}>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: T.textMain, letterSpacing: -.5 }}>{SECTIONS[active].label}</div>
                        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{SECTIONS[active].sub}</div>
                    </div>
                    <Tag color={T.success}>Live Data Connected</Tag>
                </div>

                {/* Active Panel Component */}
                <div key={active} className="pv" style={{ background: T.surface, border: `1px solid ${T.glassBorder}`, borderRadius: 16, padding: 24 }}>
                    <Preview />
                </div>

            </div>
        </div>
    );
}