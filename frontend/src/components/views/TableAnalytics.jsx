import { useState, useEffect, createContext, useContext } from "react";

// ── Theme ───────────────────────────────────────────────────────────────────
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

// ── Filter Context ───────────────────────────────────────────────────────────
const FilterContext = createContext({ db: "", schema: "", table: "" });

// ── Custom Fetch Hook ────────────────────────────────────────────────────────
function useTableData(endpoint, fallback = []) {
    const [data, setData] = useState(fallback);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("vigil_token");
                const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
                const res = await fetch(`${API_BASE}${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const text = await res.text();
                try {
                    const json = JSON.parse(text);
                    if (!res.ok) throw new Error(json.error || `HTTP error ${res.status}`);
                    if (isMounted) setData(json);
                } catch {
                    throw new Error("Backend returned HTML instead of JSON. Did you restart server.js?");
                }
            } catch (err) {
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

// ── Shared Primitives ────────────────────────────────────────────────────────
const Bar = ({ v, max, color, h = 5 }) => (
    <div style={{ width: "100%", height: h, borderRadius: h, background: T.grid, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, max > 0 ? (v / max) * 100 : 0)}%`, height: "100%", background: color, borderRadius: h, transition: "width .5s ease" }} />
    </div>
);
const Pip = ({ children, color }) => (
    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: color + "1a", color, border: `1px solid ${color}35`, whiteSpace: "nowrap" }}>{children}</span>
);
const Tag = ({ children, color }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: color + "20", color, border: `1px solid ${color}38` }}>{children}</span>
);
const Card = ({ children, style = {} }) => (
    <div style={{ background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: 13, overflow: "hidden", ...style }}>{children}</div>
);
const GridHead = ({ cols, labels }) => (
    <div style={{ display: "grid", gridTemplateColumns: cols, padding: "9px 16px", borderBottom: `1px solid ${T.grid}`, fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: 0.8, gap: 8 }}>
        {labels.map(l => <span key={l}>{l}</span>)}
    </div>
);
const SectionHead = ({ icon, title, sub, right }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.glass, border: `1px solid ${T.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
            <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textMain, letterSpacing: -0.2 }}>{title}</div>
                <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{sub}</div>
            </div>
        </div>
        {right}
    </div>
);
const Ring = ({ score, size = 46 }) => {
    const c = score > 70 ? T.success : score > 40 ? T.warning : T.danger;
    const r = size / 2 - 5;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.grid} strokeWidth={4} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={4} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={c} fontSize={size * 0.24} fontWeight="800" fontFamily={T.mono} style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%" }}>{score}</text>
        </svg>
    );
};
const LoaderUI = () => (
    <div style={{ padding: 30, color: T.textDim, fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 14, height: 14, border: `2px solid ${T.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "rotate 1s linear infinite" }} />
        Fetching live data...
    </div>
);
const ErrorUI = ({ msg }) => (
    <div style={{ padding: 20, color: T.danger, fontSize: 13, background: `${T.danger}15`, borderRadius: 8, border: `1px solid ${T.danger}40` }}>
        ⚠️ Error: {msg}
    </div>
);
const EmptyState = ({ label }) => (
    <div style={{ padding: 32, textAlign: "center", color: T.textDim, fontSize: 13 }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
        <div>{label || "No data matches the current filter."}</div>
    </div>
);

// Color helpers
const hc = s => s > 70 ? T.success : s > 40 ? T.warning : T.danger;
const dc = p => p > 20 ? T.danger : p > 10 ? T.warning : T.success;

// Filter helper – returns true if row matches the active filter
const matchFilter = (row, filter, { nameKey = "name", schemaKey = "schema" } = {}) => {
    if (filter.schema && row[schemaKey] !== filter.schema) return false;
    if (filter.table && row[nameKey] !== filter.table) return false;
    return true;
};

// ── Filter Dropdown ──────────────────────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, options, placeholder, disabled }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 160 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: 0.9 }}>{label}</label>
        <div style={{ position: "relative" }}>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled || options.length === 0}
                style={{
                    width: "100%",
                    padding: "9px 32px 9px 12px",
                    borderRadius: 9,
                    border: `1px solid ${value ? T.primary + "55" : T.glassBorder}`,
                    background: value ? `${T.primary}12` : T.glass,
                    color: value ? T.textMain : T.textMuted,
                    fontFamily: T.sans,
                    fontSize: 13,
                    fontWeight: value ? 700 : 400,
                    cursor: disabled ? "not-allowed" : "pointer",
                    appearance: "none",
                    outline: "none",
                    transition: "all .2s",
                    opacity: disabled ? 0.4 : 1,
                }}
            >
                <option value="">{placeholder}</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: T.textMuted, pointerEvents: "none", fontSize: 10 }}>▾</span>
        </div>
    </div>
);

// ── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ filter, setFilter }) {
    const { data: tables } = useTableData("/api/tables/stats");
    const { data: dbList } = useTableData("/api/databases");

    // Build cascading options
    const dbs = (dbList && dbList.length ? dbList.map(d => d.name || d) : ["postgres"]);
    const schemas = [...new Set(tables.map(t => t.schema).filter(Boolean))].sort();
    const filteredTables = tables
        .filter(t => !filter.schema || t.schema === filter.schema)
        .map(t => t.name)
        .filter(Boolean)
        .sort();

    const update = (key, val) => {
        if (key === "db") setFilter({ db: val, schema: "", table: "" });
        else if (key === "schema") setFilter(f => ({ ...f, schema: val, table: "" }));
        else setFilter(f => ({ ...f, table: val }));
    };

    const hasFilter = filter.db || filter.schema || filter.table;

    return (
        <div style={{
            background: T.surface,
            border: `1px solid ${T.glassBorder}`,
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            flexWrap: "wrap",
        }}>
            {/* Icon */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 2, marginRight: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.cyan}15`, border: `1px solid ${T.cyan}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🎯</div>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: T.textMain }}>Scope</div>
                    <div style={{ fontSize: 10, color: T.textDim }}>Filter data</div>
                </div>
            </div>

            <FilterSelect
                label="Database"
                value={filter.db}
                onChange={v => update("db", v)}
                options={dbs}
                placeholder="All databases"
            />
            <FilterSelect
                label="Schema"
                value={filter.schema}
                onChange={v => update("schema", v)}
                options={schemas}
                placeholder="All schemas"
                disabled={false}
            />
            <FilterSelect
                label="Table"
                value={filter.table}
                onChange={v => update("table", v)}
                options={filteredTables}
                placeholder="All tables"
                disabled={!filter.schema && schemas.length > 1}
            />

            {/* Active scope badge + clear */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, paddingBottom: 2 }}>
                {hasFilter ? (
                    <>
                        <div style={{ padding: "6px 10px", borderRadius: 7, background: `${T.primary}12`, border: `1px solid ${T.primary}30`, fontSize: 11, color: T.primary, fontWeight: 600, fontFamily: T.mono, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {[filter.db, filter.schema, filter.table].filter(Boolean).join(" › ")}
                        </div>
                        <button
                            onClick={() => setFilter({ db: "", schema: "", table: "" })}
                            style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${T.glassBorder}`, background: T.glass, color: T.textMuted, cursor: "pointer", fontFamily: T.sans, fontSize: 11, fontWeight: 700, transition: "all .15s" }}
                        >✕ Clear</button>
                    </>
                ) : (
                    <div style={{ fontSize: 11, color: T.textDim, fontStyle: "italic" }}>Showing all data</div>
                )}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// ── Health Scorecard ─────────────────────────────────────────────────────────
function S1_HealthScorecard() {
    const filter = useContext(FilterContext);
    const { data: tables, loading, error } = useTableData("/api/tables/stats");

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    const rows = tables.filter(t => matchFilter(t, filter));
    if (!rows.length) return <EmptyState />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="🏥" title="Table Health Scorecard" sub="Per-table health score · VACUUM recommendations" right={<Tag color={T.primary}>{rows.length} table{rows.length !== 1 ? "s" : ""}</Tag>} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                {rows.map((t, i) => {
                    const deadPct = Number(t.deadPct);
                    const health = Math.max(0, Math.round(100 - deadPct * 2));
                    const c = hc(health);
                    const rec = deadPct > 20 ? "VACUUM urgently" : deadPct > 10 ? "VACUUM recommended" : "Healthy";
                    return (
                        <Card key={i} style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: T.textMain }}>{t.name}</div>
                                    <div style={{ fontSize: 10, color: T.textDim }}>{t.schema}</div>
                                </div>
                                <Ring score={health} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted }}>
                                    <span>Dead %</span>
                                    <span style={{ fontFamily: T.mono, color: dc(deadPct), fontWeight: 700 }}>{deadPct}%</span>
                                </div>
                                <Bar v={deadPct} max={50} color={dc(deadPct)} />
                            </div>
                            <div style={{ marginTop: 10, padding: "5px 10px", borderRadius: 6, background: `${c}15`, fontSize: 10, fontWeight: 700, color: c }}>→ {rec}</div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

// ── Column Stats ──────────────────────────────────────────────────────────────
function S2_ColumnStats() {
    const filter = useContext(FilterContext);
    const { data: columns, loading, error } = useTableData("/api/tables/columns");

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    const rows = columns.filter(col =>
        (!filter.schema || col.schema === filter.schema || col.tablename?.startsWith(filter.schema + ".")) &&
        (!filter.table || col.tablename === filter.table || col.tablename === `${filter.schema}.${filter.table}`)
    );
    if (!rows.length) return <EmptyState />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="🔬" title="Column Stats Explorer" sub="Null % · distinct values · most common values" right={<Tag color={T.purple}>{rows.length} columns</Tag>} />
            <Card style={{ overflowX: "auto", maxHeight: 500, overflowY: "auto" }}>
                <div style={{ minWidth: 600 }}>
                    <GridHead cols="1fr 1.5fr 1fr 1fr 2fr" labels={["Table", "Column", "Null %", "Distinct", "Top Values"]} />
                    {rows.map((col, i) => {
                        const nullPct = Number(col.nullPct).toFixed(1);
                        const nc = nullPct > 20 ? T.danger : nullPct > 5 ? T.warning : T.success;
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 2fr", padding: "11px 16px", gap: 8, alignItems: "center", borderBottom: `1px solid ${T.grid}33` }}>
                                <span style={{ fontSize: 11, color: T.textMuted }}>{col.tablename}</span>
                                <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.textMain }}>{col.name}</span>
                                <div>
                                    <div style={{ fontFamily: T.mono, fontSize: 11, color: nc, fontWeight: 700, marginBottom: 3 }}>{nullPct}%</div>
                                    <Bar v={nullPct} max={100} color={nc} h={3} />
                                </div>
                                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>{Number(col.distinct).toLocaleString()}</span>
                                <span style={{ fontSize: 10, color: T.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={col.topValues || "—"}>{col.topValues || "—"}</span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

// ── Activity Heatmap ──────────────────────────────────────────────────────────
function S3_ActivityHeatmap() {
    const filter = useContext(FilterContext);
    const { data: tables, loading, error } = useTableData("/api/tables/stats");

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    const rows = tables.filter(t => matchFilter(t, filter));
    if (!rows.length) return <EmptyState />;

    const maxSeq = Math.max(...rows.map(t => Number(t.seqScans)), 1);
    const maxIdx = Math.max(...rows.map(t => Number(t.idxScans)), 1);
    const maxIns = Math.max(...rows.map(t => Number(t.inserts)), 1);
    const metrics = [
        { key: "seqScans", label: "Seq Scans", max: maxSeq, color: T.danger },
        { key: "idxScans", label: "Idx Scans", max: maxIdx, color: T.success },
        { key: "inserts", label: "Inserts", max: maxIns, color: T.primary },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="🔥" title="Table Activity Heatmap" sub="Sequential vs index scans · DML rates" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "150px repeat(3,1fr)", padding: "9px 16px", borderBottom: `1px solid ${T.grid}`, gap: 8 }}>
                        <span style={{ fontSize: 10, color: T.textDim, fontWeight: 700, textTransform: "uppercase" }}>Table</span>
                        {metrics.map(m => <span key={m.key} style={{ fontSize: 10, fontWeight: 700, color: m.color, textTransform: "uppercase" }}>{m.label}</span>)}
                    </div>
                    {rows.map((t, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "150px repeat(3,1fr)", padding: "13px 16px", gap: 8, alignItems: "center", borderBottom: `1px solid ${T.grid}33` }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.textMain }}>{t.name}</div>
                                <div style={{ fontSize: 10, color: T.textDim }}>{t.schema}</div>
                            </div>
                            {metrics.map(m => {
                                const val = Number(t[m.key]);
                                const pct = Math.min(100, (val / m.max) * 100);
                                const hex = Math.min(255, Math.round(pct * 2.2)).toString(16).padStart(2, "0");
                                return (
                                    <div key={m.key}>
                                        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.textMuted, marginBottom: 3 }}>{val.toLocaleString()}</div>
                                        <div style={{ height: 26, borderRadius: 5, background: `${m.color}${hex}`, border: `1px solid ${m.color}30` }}>
                                            <div style={{ width: `${pct}%`, height: 3, borderRadius: 2, background: m.color + "99" }} />
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

// ── Dependency Map ────────────────────────────────────────────────────────────
function SB_DependencyMap() {
    const filter = useContext(FilterContext);
    const { data: tablesDep, loading, error } = useTableData("/api/tables/dependencies");

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    const rows = filter.table
        ? tablesDep.filter(t => t.name === filter.table || t.refsTo?.includes(filter.table) || t.refsBy?.includes(filter.table))
        : tablesDep;

    if (!rows.length) return <EmptyState />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="🕸" title="Table Dependency Map" sub="Foreign keys · cascade chains · drop-impact analysis" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1fr 1.5fr 1.5fr" labels={["Table", "Depends On (FK)", "Referenced By"]} />
                    {rows.map((t, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr", padding: "12px 16px", borderBottom: `1px solid ${T.grid}33`, alignItems: "center", gap: 8 }}>
                            <div>
                                <div style={{ fontWeight: 700, color: T.primary, fontSize: 13 }}>{t.name}</div>
                                {t.refsBy?.length > 2 && <div style={{ marginTop: 4 }}><Tag color={T.danger}>Critical</Tag></div>}
                            </div>
                            <div style={{ fontSize: 11, color: T.textDim }}>{t.refsTo?.length ? t.refsTo.join(", ") : "None"}</div>
                            <div style={{ fontSize: 11, color: T.textDim }}>{t.refsBy?.length ? t.refsBy.join(", ") : "None"}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// ── Write Amplification ───────────────────────────────────────────────────────
function SC_WriteAmplification() {
    const filter = useContext(FilterContext);
    const { data: tables, loading, error } = useTableData("/api/tables/stats");

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    const rows = tables
        .filter(t => matchFilter(t, filter))
        .filter(t => Number(t.updates) > 0 || Number(t.inserts) > 0)
        .slice(0, 10);

    if (!rows.length) return <EmptyState label="No write activity for the selected table." />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="✍️" title="Write Amplification" sub="HOT update % · tuple updates vs inserts" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1.5fr 1fr 1fr 1fr" labels={["Table", "Updates / hr", "Inserts / hr", "HOT Updates %"]} />
                    {rows.map((w, i) => {
                        const hotPct = Number(w.hotPct);
                        const c = hotPct > 80 ? T.success : hotPct > 30 ? T.warning : T.danger;
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid ${T.grid}33`, alignItems: "center", gap: 8 }}>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: T.textMain }}>{w.name}</span>
                                    <div style={{ fontSize: 10, color: T.textDim }}>{w.schema}</div>
                                </div>
                                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textMuted }}>{Number(w.updates).toLocaleString()}</div>
                                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textMuted }}>{Number(w.inserts).toLocaleString()}</div>
                                <div>
                                    <div style={{ fontFamily: T.mono, fontSize: 12, color: c, fontWeight: 700 }}>{hotPct}%</div>
                                    {hotPct < 30 && Number(w.updates) > 100 && <div style={{ fontSize: 9, color: T.danger, marginTop: 4 }}>Consider lower fillfactor</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

// ── TOAST Bloat ───────────────────────────────────────────────────────────────
function SE_ToastBloat() {
    const filter = useContext(FilterContext);
    const { data: toast, loading, error } = useTableData("/api/tables/toast");

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    const rows = filter.table ? toast.filter(t => t.table === filter.table) : toast;
    if (!rows.length) return <EmptyState label="No TOAST data for the selected table." />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="🍞" title="Toast Table Bloat" sub="Oversized column TOAST storage · dead chunks" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1.5fr 1.5fr 1.5fr" labels={["Main Table", "TOAST Size", "Dead Chunk %"]} />
                    {rows.map((t, i) => {
                        const deadPct = Number(t.deadPct);
                        const c = deadPct > 20 ? T.danger : deadPct > 5 ? T.warning : T.success;
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.5fr", padding: "12px 16px", borderBottom: `1px solid ${T.grid}33`, alignItems: "center", gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.table}</div>
                                    <div style={{ fontSize: 10, color: T.textDim, fontFamily: T.mono }}>{t.toastTable}</div>
                                </div>
                                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.primary, fontWeight: 700 }}>{t.toastSize}</div>
                                <div>
                                    <div style={{ fontFamily: T.mono, fontSize: 11, color: c, marginBottom: 3 }}>{deadPct}%</div>
                                    <Bar v={deadPct} max={40} color={c} h={4} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

// ── Temp Tables (session-level — hidden when a table is selected) ─────────────
function SF_TempTables() {
    const { data: tempTables, loading, error } = useTableData("/api/tables/temp");

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="🌡" title="Temp Table Usage" sub="Temp table size per session · session age" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1fr 1fr 1fr 1fr" labels={["App / User", "PID", "Temp Size", "Session Age (sec)"]} />
                    {tempTables.length === 0 ? (
                        <div style={{ padding: 20, textAlign: "center", color: T.textMuted, fontSize: 12 }}>No temp tables currently active in pg_temp.</div>
                    ) : tempTables.map((t, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid ${T.grid}33`, alignItems: "center", gap: 8 }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>{t.app || "Unknown"}</div>
                                <div style={{ fontSize: 10, color: T.textDim }}>{t.user}</div>
                            </div>
                            <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.textMain }}>{t.pid}</span>
                            <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.warning }}>{t.size}</span>
                            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textDim }}>{t.age_sec}s</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// ── Schema History ────────────────────────────────────────────────────────────
function SA_SchemaHistory() {
    const filter = useContext(FilterContext);
    const MOCK_DDL = [
        { ts: new Date().toISOString().split("T")[0], type: "ALTER TABLE", object: "users", schema: "public", detail: "ADD COLUMN last_login timestamptz", risk: "medium" },
        { ts: new Date().toISOString().split("T")[0], type: "CREATE INDEX", object: "idx_orders_status", schema: "public", detail: "CONCURRENTLY ON orders(status)", risk: "low" },
        { ts: new Date().toISOString().split("T")[0], type: "DROP COLUMN", object: "orders", schema: "public", detail: "removed deprecated field: legacy_ref", risk: "high" },
    ];

    const rows = MOCK_DDL.filter(e =>
        (!filter.schema || e.schema === filter.schema) &&
        (!filter.table || e.object === filter.table)
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="📝" title="Schema Change History" sub="DDL audit log (Requires pgAudit extension for live tracking)" />
            {rows.length === 0 ? <EmptyState label="No DDL events found for the selected table." /> : (
                <Card style={{ padding: 16 }}>
                    <div style={{ position: "relative", paddingLeft: 20 }}>
                        <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 2, background: T.grid, borderRadius: 1 }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {rows.map((e, i) => {
                                const tc = e.risk === "high" ? T.danger : e.risk === "medium" ? T.warning : T.success;
                                return (
                                    <div key={i} style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: -17, top: 4, width: 10, height: 10, borderRadius: "50%", background: tc, border: `2px solid ${T.surface}` }} />
                                        <div style={{ marginLeft: 12, background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: 10, padding: "10px 14px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <Pip color={tc}>{e.type}</Pip>
                                                    <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.textMain, wordBreak: "break-all" }}>{e.schema}.{e.object}</span>
                                                </div>
                                                <span style={{ fontSize: 10, color: T.textDim, fontFamily: T.mono }}>{e.ts}</span>
                                            </div>
                                            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 5 }}>{e.detail}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

// ── Dead Tuple Forecast ───────────────────────────────────────────────────────
function SD_Forecast() {
    const filter = useContext(FilterContext);
    const { data: tables, loading } = useTableData("/api/tables/stats");
    if (loading) return <LoaderUI />;

    const rows = tables.filter(t => matchFilter(t, filter)).slice(0, filter.table ? 1 : 4);
    if (!rows.length) return <EmptyState />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="🔮" title="Dead Tuple Forecast" sub="Predicts autovacuum threshold hits (Uses current deadPct)" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10 }}>
                {rows.map((f, i) => {
                    const deadPct = Number(f.deadPct);
                    const risk = deadPct > 20 ? "critical" : deadPct > 10 ? "high" : "low";
                    const c = risk === "critical" ? T.danger : risk === "high" ? T.warning : T.success;
                    return (
                        <Card key={i} style={{ padding: "14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: T.textMain }}>{f.name}</span>
                                <Pip color={c}>{risk}</Pip>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                                <span style={{ color: T.textDim }}>Now: <span style={{ fontFamily: T.mono, color: c, fontWeight: 700 }}>{deadPct}%</span></span>
                                <span style={{ color: T.textDim }}>Target: 20%</span>
                            </div>
                            <Bar v={deadPct} max={50} color={c} h={6} />
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

// ── ✨ NEW: Index Analysis (only shown when a table is selected) ──────────────
function S_IndexAnalysis() {
    const filter = useContext(FilterContext);
    const { data: indexes, loading, error } = useTableData("/api/tables/indexes");

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    const rows = indexes.filter(ix =>
        (!filter.schema || ix.schema === filter.schema) &&
        (!filter.table || ix.table === filter.table)
    );

    if (!rows.length) return <EmptyState label="No indexes found for the selected table." />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead
                icon="📑"
                title="Index Analysis"
                sub="Index usage · size · scan counts · unused index detection"
                right={<Tag color={T.indigo}>{rows.length} index{rows.length !== 1 ? "es" : ""}</Tag>}
            />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 640 }}>
                    <GridHead cols="2fr 1fr 1fr 1fr 1fr" labels={["Index Name", "Type", "Size", "Scans", "Status"]} />
                    {rows.map((ix, i) => {
                        const scans = Number(ix.scans ?? 0);
                        const isUnused = scans === 0;
                        const sizeMb = ix.sizeBytes ? (ix.sizeBytes / 1024 / 1024).toFixed(1) : "—";
                        const statusColor = isUnused ? T.danger : scans < 10 ? T.warning : T.success;
                        const statusLabel = isUnused ? "Unused" : scans < 10 ? "Rarely used" : "Active";
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid ${T.grid}33`, alignItems: "center", gap: 8 }}>
                                <div>
                                    <div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.textMain }}>{ix.name}</div>
                                    {ix.columns && <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>({ix.columns})</div>}
                                </div>
                                <Pip color={T.indigo}>{ix.type || "btree"}</Pip>
                                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.textMuted }}>{sizeMb !== "—" ? `${sizeMb} MB` : "—"}</span>
                                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.textMuted }}>{scans.toLocaleString()}</span>
                                <div>
                                    <Pip color={statusColor}>{statusLabel}</Pip>
                                    {isUnused && <div style={{ fontSize: 9, color: T.danger, marginTop: 4 }}>Consider dropping</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
            {rows.some(ix => Number(ix.scans ?? 0) === 0) && (
                <div style={{ padding: "10px 14px", borderRadius: 9, background: `${T.danger}12`, border: `1px solid ${T.danger}30`, fontSize: 12, color: T.danger }}>
                    ⚠️ <strong>Unused indexes detected.</strong> These consume write overhead with no read benefit. Review before dropping.
                </div>
            )}
        </div>
    );
}

// ── ✨ NEW: Table Size Breakdown (only shown when a table is selected) ─────────
function S_TableSizes() {
    const filter = useContext(FilterContext);
    const { data: sizes, loading, error } = useTableData("/api/tables/sizes");

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    const rows = sizes.filter(s =>
        (!filter.schema || s.schema === filter.schema) &&
        (!filter.table || s.name === filter.table)
    );

    if (!rows.length) return <EmptyState label="No size data for the selected table." />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="📐" title="Table Size Breakdown" sub="Heap · index · TOAST storage split · bloat ratio" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                {rows.map((s, i) => {
                    const heap = Number(s.heapBytes ?? 0);
                    const idx = Number(s.indexBytes ?? 0);
                    const toast = Number(s.toastBytes ?? 0);
                    const total = heap + idx + toast || 1;
                    const fmt = b => b >= 1073741824 ? `${(b / 1073741824).toFixed(2)} GB` : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${(b / 1024).toFixed(0)} KB` : `${b} B`;
                    const bloatPct = Number(s.bloatPct ?? 0);
                    const bc = bloatPct > 30 ? T.danger : bloatPct > 15 ? T.warning : T.success;

                    const segments = [
                        { label: "Heap", bytes: heap, color: T.primary },
                        { label: "Indexes", bytes: idx, color: T.purple },
                        { label: "TOAST", bytes: toast, color: T.teal },
                    ];

                    return (
                        <Card key={i} style={{ padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: T.textMain }}>{s.name}</div>
                                    <div style={{ fontSize: 10, color: T.textDim }}>{s.schema} · {fmt(total)} total</div>
                                </div>
                                <Pip color={bc}>Bloat {bloatPct}%</Pip>
                            </div>

                            {/* Stacked bar */}
                            <div style={{ height: 10, borderRadius: 5, overflow: "hidden", display: "flex", marginBottom: 12 }}>
                                {segments.map(seg => (
                                    <div key={seg.label} style={{ width: `${(seg.bytes / total) * 100}%`, background: seg.color, transition: "width .5s" }} />
                                ))}
                            </div>

                            {/* Legend */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {segments.map(seg => (
                                    <div key={seg.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color }} />
                                            <span style={{ fontSize: 11, color: T.textMuted }}>{seg.label}</span>
                                        </div>
                                        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMain }}>{fmt(seg.bytes)}</span>
                                    </div>
                                ))}
                            </div>

                            {bloatPct > 30 && (
                                <div style={{ marginTop: 10, padding: "6px 10px", borderRadius: 6, background: `${T.danger}15`, fontSize: 10, fontWeight: 700, color: T.danger }}>→ Consider VACUUM FULL or pg_repack</div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

// ── ✨ NEW: Row Count Snapshot ────────────────────────────────────────────────
function S_RowCounts() {
    const filter = useContext(FilterContext);
    const { data: tables, loading, error } = useTableData("/api/tables/stats");

    if (loading) return <LoaderUI />;
    if (error) return <ErrorUI msg={error} />;

    const rows = tables.filter(t => matchFilter(t, filter));
    if (!rows.length) return <EmptyState />;

    const maxLive = Math.max(...rows.map(t => Number(t.liveRows ?? t.rows ?? 0)), 1);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon="🔢" title="Row Count Snapshot" sub="Live vs dead tuples · estimated row counts from pg_stat_user_tables" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1.5fr 1.5fr 1fr 1fr" labels={["Table", "Live Rows", "Dead Rows", "Dead Ratio"]} />
                    {rows.map((t, i) => {
                        const live = Number(t.liveRows ?? t.rows ?? 0);
                        const dead = Number(t.deadRows ?? 0);
                        const ratio = live + dead > 0 ? ((dead / (live + dead)) * 100).toFixed(1) : "0.0";
                        const rc = Number(ratio) > 20 ? T.danger : Number(ratio) > 10 ? T.warning : T.success;
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid ${T.grid}33`, alignItems: "center", gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: T.textMain }}>{t.name}</div>
                                    <div style={{ fontSize: 10, color: T.textDim }}>{t.schema}</div>
                                </div>
                                <div>
                                    <div style={{ fontFamily: T.mono, fontSize: 12, color: T.success, marginBottom: 3 }}>{live.toLocaleString()}</div>
                                    <Bar v={live} max={maxLive} color={T.success} h={4} />
                                </div>
                                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.danger }}>{dead.toLocaleString()}</span>
                                <Pip color={rc}>{ratio}%</Pip>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTIONS REGISTRY
// ── hideWhenTable: true   → visible only when NO table is selected (session-level)
// ── tableOnly: true       → visible ONLY when a table IS selected
// ── otherwise             → always visible (data is filtered per selection)
// ══════════════════════════════════════════════════════════════════════════════
const ALL_SECTIONS = [
    { group: "Health & Growth", label: "🏥 Health Scorecard", sub: "Health ring & VACUUM tips", component: S1_HealthScorecard },
    { group: "Health & Growth", label: "🔥 Activity Heatmap", sub: "Seq vs idx scans & DML", component: S3_ActivityHeatmap },
    { group: "Health & Growth", label: "🔮 Forecast", sub: "Dead tuple predictions", component: SD_Forecast },
    { group: "Health & Growth", label: "🔢 Row Counts", sub: "Live vs dead tuple ratio", component: S_RowCounts },
    { group: "Diagnostics", label: "🔬 Column Stats", sub: "Null % & distinct values", component: S2_ColumnStats },
    { group: "Diagnostics", label: "🍞 TOAST Bloat", sub: "Oversized column chunks", component: SE_ToastBloat },
    { group: "Diagnostics", label: "🌡 Temp Tables", sub: "Session temp sizes & leaks", component: SF_TempTables, hideWhenTable: true },
    { group: "Architecture", label: "📝 Schema History", sub: "DDL timeline & risk", component: SA_SchemaHistory },
    { group: "Architecture", label: "🕸 Dependency Map", sub: "FK chains & cascades", component: SB_DependencyMap },
    { group: "Architecture", label: "✍️ Write Amp", sub: "WAL & tuple churn", component: SC_WriteAmplification },
    // Table-specific sections (only appear when a table is selected)
    { group: "Table Details", label: "📑 Index Analysis", sub: "Index usage & unused detection", component: S_IndexAnalysis, tableOnly: true },
    { group: "Table Details", label: "📐 Size Breakdown", sub: "Heap / index / TOAST split", component: S_TableSizes, tableOnly: true },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SHELL
// ══════════════════════════════════════════════════════════════════════════════
export default function UnifiedDashboard() {
    const [filter, setFilter] = useState({ db: "", schema: "", table: "" });
    const [active, setActive] = useState(0);

    // Compute visible sections based on filter state
    const SECTIONS = ALL_SECTIONS.filter(s => {
        if (s.tableOnly) return !!filter.table;
        if (s.hideWhenTable) return !filter.table;
        return true;
    });

    // Keep active index in bounds when section list changes
    const safeActive = Math.min(active, SECTIONS.length - 1);
    const Preview = SECTIONS[safeActive]?.component;
    const groups = [...new Set(SECTIONS.map(s => s.group))];

    return (
        <FilterContext.Provider value={filter}>
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
          select:focus { box-shadow: 0 0 0 2px rgba(79,142,247,.3); }
        `}</style>

                <div style={{ maxWidth: 1200, margin: "0 auto" }}>

                    {/* Brand Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${T.primary}20`, border: `1px solid ${T.primary}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🐘</div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: T.textMain, letterSpacing: -0.5 }}>Table Analytics</div>
                            <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>Unified Dashboard</div>
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                            <Tag color={T.success}>Live Data Connected</Tag>
                            {filter.table && <Tag color={T.cyan}>🎯 Scoped to: {filter.table}</Tag>}
                        </div>
                    </div>

                    {/* ── Filter Bar ── */}
                    <FilterBar filter={filter} setFilter={(v) => {
                        setFilter(typeof v === "function" ? v(filter) : v);
                        setActive(0); // reset active section on filter change
                    }} />

                    {/* Context banner when table is selected */}
                    {filter.table && (
                        <div style={{ marginBottom: 20, padding: "10px 16px", borderRadius: 10, background: `${T.cyan}0a`, border: `1px solid ${T.cyan}25`, display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                            <span style={{ fontSize: 16 }}>💡</span>
                            <span style={{ color: T.textMuted }}>
                                Showing table-specific views for <span style={{ color: T.cyan, fontFamily: T.mono, fontWeight: 700 }}>{filter.schema}.{filter.table}</span>.
                                Session-level sections (Temp Tables) are hidden. Index Analysis and Size Breakdown are now available.
                            </span>
                        </div>
                    )}

                    {/* Section Navigation */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                        {groups.map(g => (
                            <div key={g}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: 1.2 }}>{g}</div>
                                    {g === "Table Details" && <Tag color={T.cyan}>Table selected</Tag>}
                                </div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {SECTIONS.map((s, i) => {
                                        if (s.group !== g) return null;
                                        const isA = safeActive === i;
                                        return (
                                            <button key={i} onClick={() => setActive(i)}
                                                    style={{
                                                        padding: "10px 16px", borderRadius: 10,
                                                        border: `1px solid ${isA ? T.primary + "55" : T.glassBorder}`,
                                                        background: isA ? `${T.primary}16` : T.glass,
                                                        color: isA ? T.primary : T.textMuted,
                                                        cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                                                        transition: "all .2s", textAlign: "left", minWidth: 180,
                                                    }}>
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
                            <div style={{ fontSize: 20, fontWeight: 800, color: T.textMain, letterSpacing: -0.5 }}>{SECTIONS[safeActive]?.label}</div>
                            <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{SECTIONS[safeActive]?.sub}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {filter.schema && <Tag color={T.purple}>schema: {filter.schema}</Tag>}
                            {filter.table && <Tag color={T.teal}>table: {filter.table}</Tag>}
                        </div>
                    </div>

                    {/* Active Panel */}
                    <div key={`${safeActive}-${filter.db}-${filter.schema}-${filter.table}`} className="pv"
                         style={{ background: T.surface, border: `1px solid ${T.glassBorder}`, borderRadius: 16, padding: 24 }}>
                        {Preview && <Preview />}
                    </div>

                </div>
            </div>
        </FilterContext.Provider>
    );
}