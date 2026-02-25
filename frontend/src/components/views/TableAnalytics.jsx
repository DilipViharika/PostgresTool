import React, { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';
import { THEME, useAdaptiveTheme } from '../../utils/theme.jsx';
import { fetchData } from '../../utils/api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, CartesianGrid, PieChart, Pie, AreaChart, Area
} from 'recharts';
import {
    Layers, RefreshCw, AlertTriangle, Database, Activity, Search,
    AlertCircle, Filter, TrendingUp, Zap, Shield, ChevronUp, ChevronDown,
    Eye, ArrowRight, Clock, HardDrive, BarChart2, Cpu, Table2, GitBranch,
    Thermometer, FileText, Pen, ListChecks, Ruler
} from 'lucide-react';

// ── Filter Context ───────────────────────────────────────────────────────────
const FilterContext = createContext({ db: "", schema: "", table: "" });

// ── Safe array coercion ─────────────────────────────────────────────────────
const toArr = v => {
    if (Array.isArray(v))       return v;
    if (Array.isArray(v?.rows)) return v.rows;
    if (Array.isArray(v?.data)) return v.data;
    return [];
};

// ── Data Hook (uses shared fetchData utility) ────────────────────────────────
function useTableData(endpoint, fallback = []) {
    const [data, setData]       = useState(fallback);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const json = await fetchData(endpoint);
            setData(Array.isArray(fallback) ? toArr(json) : (json ?? fallback));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { load(); }, [load]);
    return { data, loading, error, reload: load };
}

// ── Shared Primitives ────────────────────────────────────────────────────────
const MiniBar = ({ v, max, color, h = 5 }) => (
    <div style={{ width: "100%", height: h, borderRadius: h, background: THEME.grid, overflow: "hidden" }}>
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
    <div style={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 13, overflow: "hidden", ...style }}>{children}</div>
);
const GridHead = ({ cols, labels }) => (
    <div style={{ display: "grid", gridTemplateColumns: cols, padding: "9px 16px", borderBottom: `1px solid ${THEME.grid}`, fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: 0.8, gap: 8 }}>
        {labels.map(l => <span key={l}>{l}</span>)}
    </div>
);
const SectionHead = ({ icon, title, sub, right, accent }) => {
    const ac = accent || THEME.primary;
    const iconEl = typeof icon === 'string'
        ? <span style={{ fontSize: 18 }}>{icon}</span>
        : React.isValidElement(icon)
            ? icon
            : (icon ? React.createElement(icon, { size: 18, color: ac }) : null);
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: ac + '18', border: `1px solid ${ac}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {iconEl}
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textMain, letterSpacing: -0.2 }}>{title}</div>
                    <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 2 }}>{sub}</div>
                </div>
            </div>
            {right}
        </div>
    );
};
const Ring = ({ score, size = 46 }) => {
    const c = score > 70 ? THEME.success : score > 40 ? THEME.warning : THEME.danger;
    const r = size / 2 - 5;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={THEME.grid} strokeWidth={4} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={4} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={c} fontSize={size * 0.24} fontWeight="800" fontFamily={THEME.fontMono} style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%" }}>{score}</text>
        </svg>
    );
};
const LoaderUI = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160, gap: 14, color: THEME.textMuted }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${THEME.primary}33`, borderTopColor: THEME.primary, animation: 'taSpin 1s linear infinite' }} />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5, fontFamily: THEME.fontBody }}>Fetching live data…</span>
    </div>
);
const ErrorUI = ({ msg }) => (
    <div style={{ padding: 16, color: THEME.danger + 'CC', fontSize: 13, background: THEME.danger + '1A', borderRadius: 10, border: `1px solid ${THEME.danger}4D`, display: 'flex', alignItems: 'center', gap: 9 }}>
        <AlertCircle size={16} color={THEME.danger} /> {msg}
    </div>
);
const EmptyState = ({ label }) => (
    <div style={{ padding: 32, textAlign: "center", color: THEME.textDim, fontSize: 13 }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
        <div>{label || "No data matches the current filter."}</div>
    </div>
);

// Color helpers
const hc = s => s > 70 ? THEME.success : s > 40 ? THEME.warning : THEME.danger;
const dc = p => p > 20 ? THEME.danger : p > 10 ? THEME.warning : THEME.success;

// Filter helper – returns true if row matches the active filter
const matchFilter = (row, filter, { nameKey = "name", schemaKey = "schema", dbKey = "db" } = {}) => {
    if (filter.db     && row[dbKey]     !== filter.db)     return false;
    if (filter.schema && row[schemaKey] !== filter.schema) return false;
    if (filter.table  && row[nameKey]   !== filter.table)  return false;
    return true;
};

// ── Filter Dropdown ──────────────────────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, options, placeholder, disabled }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 160 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: 0.9 }}>{label}</label>
        <div style={{ position: "relative" }}>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled || options.length === 0}
                style={{
                    width: "100%",
                    padding: "9px 32px 9px 12px",
                    borderRadius: 9,
                    border: `1px solid ${value ? THEME.primary + "55" : THEME.glassBorder}`,
                    background: value ? `${THEME.primary}12` : THEME.glass,
                    color: value ? THEME.textMain : THEME.textMuted,
                    fontFamily: THEME.fontBody,
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
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: THEME.textMuted, pointerEvents: "none", fontSize: 10 }}>▾</span>
        </div>
    </div>
);

// ── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ filter, setFilter }) {
    const { data: tables } = useTableData("/api/tables/stats");
    const { data: dbList } = useTableData("/api/databases");

    // Build cascading options
    const dbs = [...new Set(dbList && dbList.length ? dbList.map(d => d.name || d) : ["postgres"])];
    const schemas = [...new Set(
        tables
            .filter(t => !filter.db || t.db === filter.db)
            .map(t => t.schema)
            .filter(Boolean)
    )].sort();
    const filteredTables = [...new Set(
        tables
            .filter(t => !filter.db     || t.db     === filter.db)
            .filter(t => !filter.schema || t.schema === filter.schema)
            .map(t => t.name)
            .filter(Boolean)
    )].sort();

    const update = (key, val) => {
        if (key === "db") setFilter({ db: val, schema: "", table: "" });
        else if (key === "schema") setFilter(f => ({ ...f, schema: val, table: "" }));
        else setFilter(f => ({ ...f, table: val }));
    };

    const hasFilter = filter.db || filter.schema || filter.table;

    return (
        <div style={{
            background: THEME.surface,
            border: `1px solid ${THEME.glassBorder}`,
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
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${THEME.cyan}15`, border: `1px solid ${THEME.cyan}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}><Filter size={15} color={THEME.cyan} /></div>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: THEME.textMain }}>Scope</div>
                    <div style={{ fontSize: 10, color: THEME.textDim }}>Filter data</div>
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
                        <div style={{ padding: "6px 10px", borderRadius: 7, background: `${THEME.primary}12`, border: `1px solid ${THEME.primary}30`, fontSize: 11, color: THEME.primary, fontWeight: 600, fontFamily: THEME.fontMono, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {[filter.db, filter.schema, filter.table].filter(Boolean).join(" › ")}
                        </div>
                        <button
                            onClick={() => setFilter({ db: "", schema: "", table: "" })}
                            style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${THEME.glassBorder}`, background: THEME.glass, color: THEME.textMuted, cursor: "pointer", fontFamily: THEME.fontBody, fontSize: 11, fontWeight: 700, transition: "all .15s" }}
                        >✕ Clear</button>
                    </>
                ) : (
                    <div style={{ fontSize: 11, color: THEME.textDim, fontStyle: "italic" }}>Showing all data</div>
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
            <SectionHead icon={Activity} accent={THEME.success} title="Table Health Scorecard" sub="Per-table health score · VACUUM recommendations" right={<Tag color={THEME.primary}>{rows.length} table{rows.length !== 1 ? "s" : ""}</Tag>} />
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
                                    <div style={{ fontWeight: 700, fontSize: 13, color: THEME.textMain }}>{t.name}</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>{t.schema}</div>
                                </div>
                                <Ring score={health} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: THEME.textMuted }}>
                                    <span>Dead %</span>
                                    <span style={{ fontFamily: THEME.fontMono, color: dc(deadPct), fontWeight: 700 }}>{deadPct}%</span>
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
            <SectionHead icon={Search} accent={THEME.purple} title="Column Stats Explorer" sub="Null % · distinct values · most common values" right={<Tag color={THEME.purple}>{rows.length} columns</Tag>} />
            <Card style={{ overflowX: "auto", maxHeight: 500, overflowY: "auto" }}>
                <div style={{ minWidth: 600 }}>
                    <GridHead cols="1fr 1.5fr 1fr 1fr 2fr" labels={["Table", "Column", "Null %", "Distinct", "Top Values"]} />
                    {rows.map((col, i) => {
                        const nullPct = Number(col.nullPct).toFixed(1);
                        const nc = nullPct > 20 ? THEME.danger : nullPct > 5 ? THEME.warning : THEME.success;
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 2fr", padding: "11px 16px", gap: 8, alignItems: "center", borderBottom: `1px solid ${THEME.grid}33` }}>
                                <span style={{ fontSize: 11, color: THEME.textMuted }}>{col.tablename}</span>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 12, fontWeight: 700, color: THEME.textMain }}>{col.name}</span>
                                <div>
                                    <div style={{ fontFamily: THEME.fontMono, fontSize: 11, color: nc, fontWeight: 700, marginBottom: 3 }}>{nullPct}%</div>
                                    <Bar v={nullPct} max={100} color={nc} h={3} />
                                </div>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textMuted }}>{Number(col.distinct).toLocaleString()}</span>
                                <span style={{ fontSize: 10, color: THEME.textDim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={col.topValues || "—"}>{col.topValues || "—"}</span>
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
        { key: "seqScans", label: "Seq Scans", max: maxSeq, color: THEME.danger },
        { key: "idxScans", label: "Idx Scans", max: maxIdx, color: THEME.success },
        { key: "inserts", label: "Inserts", max: maxIns, color: THEME.primary },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead icon={BarChart2} accent={THEME.warning} title="Table Activity Heatmap" sub="Sequential vs index scans · DML rates" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "150px repeat(3,1fr)", padding: "9px 16px", borderBottom: `1px solid ${THEME.grid}`, gap: 8 }}>
                        <span style={{ fontSize: 10, color: THEME.textDim, fontWeight: 700, textTransform: "uppercase" }}>Table</span>
                        {metrics.map(m => <span key={m.key} style={{ fontSize: 10, fontWeight: 700, color: m.color, textTransform: "uppercase" }}>{m.label}</span>)}
                    </div>
                    {rows.map((t, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "150px repeat(3,1fr)", padding: "13px 16px", gap: 8, alignItems: "center", borderBottom: `1px solid ${THEME.grid}33` }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMain }}>{t.name}</div>
                                <div style={{ fontSize: 10, color: THEME.textDim }}>{t.schema}</div>
                            </div>
                            {metrics.map(m => {
                                const val = Number(t[m.key]);
                                const pct = Math.min(100, (val / m.max) * 100);
                                const hex = Math.min(255, Math.round(pct * 2.2)).toString(16).padStart(2, "0");
                                return (
                                    <div key={m.key}>
                                        <div style={{ fontFamily: THEME.fontMono, fontSize: 10, color: THEME.textMuted, marginBottom: 3 }}>{val.toLocaleString()}</div>
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
            <SectionHead icon={GitBranch} accent={THEME.cyan} title="Table Dependency Map" sub="Foreign keys · cascade chains · drop-impact analysis" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1fr 1.5fr 1.5fr" labels={["Table", "Depends On (FK)", "Referenced By"]} />
                    {rows.map((t, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr", padding: "12px 16px", borderBottom: `1px solid ${THEME.grid}33`, alignItems: "center", gap: 8 }}>
                            <div>
                                <div style={{ fontWeight: 700, color: THEME.primary, fontSize: 13 }}>{t.name}</div>
                                {t.refsBy?.length > 2 && <div style={{ marginTop: 4 }}><Tag color={THEME.danger}>Critical</Tag></div>}
                            </div>
                            <div style={{ fontSize: 11, color: THEME.textDim }}>{t.refsTo?.length ? t.refsTo.join(", ") : "None"}</div>
                            <div style={{ fontSize: 11, color: THEME.textDim }}>{t.refsBy?.length ? t.refsBy.join(", ") : "None"}</div>
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
            <SectionHead icon={Pen} accent={THEME.orange} title="Write Amplification" sub="HOT update % · tuple updates vs inserts" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1.5fr 1fr 1fr 1fr" labels={["Table", "Updates / hr", "Inserts / hr", "HOT Updates %"]} />
                    {rows.map((w, i) => {
                        const hotPct = Number(w.hotPct);
                        const c = hotPct > 80 ? THEME.success : hotPct > 30 ? THEME.warning : THEME.danger;
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid ${THEME.grid}33`, alignItems: "center", gap: 8 }}>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: THEME.textMain }}>{w.name}</span>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>{w.schema}</div>
                                </div>
                                <div style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.textMuted }}>{Number(w.updates).toLocaleString()}</div>
                                <div style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.textMuted }}>{Number(w.inserts).toLocaleString()}</div>
                                <div>
                                    <div style={{ fontFamily: THEME.fontMono, fontSize: 12, color: c, fontWeight: 700 }}>{hotPct}%</div>
                                    {hotPct < 30 && Number(w.updates) > 100 && <div style={{ fontSize: 9, color: THEME.danger, marginTop: 4 }}>Consider lower fillfactor</div>}
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
            <SectionHead icon={Layers} accent={THEME.warning} title="Toast Table Bloat" sub="Oversized column TOAST storage · dead chunks" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1.5fr 1.5fr 1.5fr" labels={["Main Table", "TOAST Size", "Dead Chunk %"]} />
                    {rows.map((t, i) => {
                        const deadPct = Number(t.deadPct);
                        const c = deadPct > 20 ? THEME.danger : deadPct > 5 ? THEME.warning : THEME.success;
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.5fr", padding: "12px 16px", borderBottom: `1px solid ${THEME.grid}33`, alignItems: "center", gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.table}</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>{t.toastTable}</div>
                                </div>
                                <div style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.primary, fontWeight: 700 }}>{t.toastSize}</div>
                                <div>
                                    <div style={{ fontFamily: THEME.fontMono, fontSize: 11, color: c, marginBottom: 3 }}>{deadPct}%</div>
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
            <SectionHead icon={Thermometer} accent={THEME.teal} title="Temp Table Usage" sub="Temp table size per session · session age" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1fr 1fr 1fr 1fr" labels={["App / User", "PID", "Temp Size", "Session Age (sec)"]} />
                    {tempTables.length === 0 ? (
                        <div style={{ padding: 20, textAlign: "center", color: THEME.textMuted, fontSize: 12 }}>No temp tables currently active in pg_temp.</div>
                    ) : tempTables.map((t, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid ${THEME.grid}33`, alignItems: "center", gap: 8 }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>{t.app || "Unknown"}</div>
                                <div style={{ fontSize: 10, color: THEME.textDim }}>{t.user}</div>
                            </div>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 11, fontWeight: 700, color: THEME.textMain }}>{t.pid}</span>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 12, fontWeight: 700, color: THEME.warning }}>{t.size}</span>
                            <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textDim }}>{t.age_sec}s</span>
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
            <SectionHead icon={FileText} accent={THEME.indigo} title="Schema Change History" sub="DDL audit log (Requires pgAudit extension for live tracking)" />
            {rows.length === 0 ? <EmptyState label="No DDL events found for the selected table." /> : (
                <Card style={{ padding: 16 }}>
                    <div style={{ position: "relative", paddingLeft: 20 }}>
                        <div style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 2, background: THEME.grid, borderRadius: 1 }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {rows.map((e, i) => {
                                const tc = e.risk === "high" ? THEME.danger : e.risk === "medium" ? THEME.warning : THEME.success;
                                return (
                                    <div key={i} style={{ position: "relative" }}>
                                        <div style={{ position: "absolute", left: -17, top: 4, width: 10, height: 10, borderRadius: "50%", background: tc, border: `2px solid ${THEME.surface}` }} />
                                        <div style={{ marginLeft: 12, background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 10, padding: "10px 14px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <Pip color={tc}>{e.type}</Pip>
                                                    <span style={{ fontFamily: THEME.fontMono, fontSize: 12, fontWeight: 700, color: THEME.textMain, wordBreak: "break-all" }}>{e.schema}.{e.object}</span>
                                                </div>
                                                <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: THEME.fontMono }}>{e.ts}</span>
                                            </div>
                                            <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 5 }}>{e.detail}</div>
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
            <SectionHead icon={TrendingUp} accent={THEME.danger} title="Dead Tuple Forecast" sub="Predicts autovacuum threshold hits (Uses current deadPct)" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10 }}>
                {rows.map((f, i) => {
                    const deadPct = Number(f.deadPct);
                    const risk = deadPct > 20 ? "critical" : deadPct > 10 ? "high" : "low";
                    const c = risk === "critical" ? THEME.danger : risk === "high" ? THEME.warning : THEME.success;
                    return (
                        <Card key={i} style={{ padding: "14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: THEME.textMain }}>{f.name}</span>
                                <Pip color={c}>{risk}</Pip>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                                <span style={{ color: THEME.textDim }}>Now: <span style={{ fontFamily: THEME.fontMono, color: c, fontWeight: 700 }}>{deadPct}%</span></span>
                                <span style={{ color: THEME.textDim }}>Target: 20%</span>
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
        (!filter.table  || ix.tableName === filter.table)
    );

    if (!rows.length) return <EmptyState label="No indexes found for the selected table." />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionHead
                icon={ListChecks}
                accent={THEME.indigo}
                title="Index Analysis"
                sub="Index usage · size · scan counts · unused index detection"
                right={
                    <div style={{ display: "flex", gap: 8 }}>
                        <Tag color={THEME.indigo}>{rows.length} index{rows.length !== 1 ? "es" : ""}</Tag>
                        {rows.filter(ix => Number(ix.scans ?? 0) === 0).length > 0 && (
                            <Tag color={THEME.danger}>{rows.filter(ix => Number(ix.scans ?? 0) === 0).length} unused</Tag>
                        )}
                    </div>
                }
            />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 780 }}>
                    <GridHead cols="2fr 1fr 1fr 1fr 1fr 1fr" labels={["Index Name", "Table", "Type", "Size", "Scans", "Status"]} />
                    {rows.map((ix, i) => {
                        const scans = Number(ix.scans ?? 0);
                        const isUnused = scans === 0;
                        const sizeMb = ix.sizeBytes ? (ix.sizeBytes / 1024 / 1024).toFixed(1) : "—";
                        const statusColor = isUnused ? THEME.danger : scans < 10 ? THEME.warning : THEME.success;
                        const statusLabel = isUnused ? "Unused" : scans < 10 ? "Rarely used" : "Active";
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid ${THEME.grid}33`, alignItems: "center", gap: 8 }}>
                                <div>
                                    <div style={{ fontFamily: THEME.fontMono, fontSize: 12, fontWeight: 700, color: THEME.textMain }}>{ix.name}</div>
                                    {ix.definition && (
                                        <div style={{ fontSize: 10, color: THEME.textDim, marginTop: 2, fontFamily: THEME.fontMono, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 260 }} title={ix.definition}>
                                            {ix.definition}
                                        </div>
                                    )}
                                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                                        {ix.isPrimary && <Pip color={THEME.purple}>PK</Pip>}
                                        {ix.isUnique  && <Pip color={THEME.cyan}>UQ</Pip>}
                                    </div>
                                </div>
                                <span style={{ fontSize: 11, color: THEME.textMuted, fontFamily: THEME.fontMono }}>{ix.tableName}</span>
                                <Pip color={THEME.indigo}>{(ix.type || "btree").toUpperCase()}</Pip>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.textMuted }}>{ix.size || (sizeMb !== "—" ? `${sizeMb} MB` : "—")}</span>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: isUnused ? THEME.danger : THEME.success, fontWeight: 700 }}>{scans.toLocaleString()}</span>
                                <div>
                                    <Pip color={statusColor}>{statusLabel}</Pip>
                                    {isUnused && <div style={{ fontSize: 9, color: THEME.danger, marginTop: 4 }}>Consider dropping</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
            {rows.some(ix => Number(ix.scans ?? 0) === 0) && (
                <div style={{ padding: "10px 14px", borderRadius: 9, background: `${THEME.danger}12`, border: `1px solid ${THEME.danger}30`, fontSize: 12, color: THEME.danger }}>
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
            <SectionHead icon={Ruler} accent={THEME.teal} title="Table Size Breakdown" sub="Heap · index · TOAST storage split · bloat ratio" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                {rows.map((s, i) => {
                    const heap = Number(s.heapBytes ?? 0);
                    const idx = Number(s.indexBytes ?? 0);
                    const toast = Number(s.toastBytes ?? 0);
                    const total = heap + idx + toast || 1;
                    const fmt = b => b >= 1073741824 ? `${(b / 1073741824).toFixed(2)} GB` : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${(b / 1024).toFixed(0)} KB` : `${b} B`;
                    const bloatPct = Number(s.bloatPct ?? 0);
                    const bc = bloatPct > 30 ? THEME.danger : bloatPct > 15 ? THEME.warning : THEME.success;

                    const segments = [
                        { label: "Heap", bytes: heap, color: THEME.primary },
                        { label: "Indexes", bytes: idx, color: THEME.purple },
                        { label: "TOAST", bytes: toast, color: THEME.teal },
                    ];

                    return (
                        <Card key={i} style={{ padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: THEME.textMain }}>{s.name}</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>{s.schema} · {fmt(total)} total</div>
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
                                            <span style={{ fontSize: 11, color: THEME.textMuted }}>{seg.label}</span>
                                        </div>
                                        <span style={{ fontFamily: THEME.fontMono, fontSize: 11, color: THEME.textMain }}>{fmt(seg.bytes)}</span>
                                    </div>
                                ))}
                            </div>

                            {bloatPct > 30 && (
                                <div style={{ marginTop: 10, padding: "6px 10px", borderRadius: 6, background: `${THEME.danger}15`, fontSize: 10, fontWeight: 700, color: THEME.danger }}>→ Consider VACUUM FULL or pg_repack</div>
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
            <SectionHead icon={Database} accent={THEME.primary} title="Row Count Snapshot" sub="Live vs dead tuples · estimated row counts from pg_stat_user_tables" />
            <Card style={{ overflowX: "auto" }}>
                <div style={{ minWidth: 500 }}>
                    <GridHead cols="1.5fr 1.5fr 1fr 1fr" labels={["Table", "Live Rows", "Dead Rows", "Dead Ratio"]} />
                    {rows.map((t, i) => {
                        const live = Number(t.liveRows ?? t.rows ?? 0);
                        const dead = Number(t.deadRows ?? 0);
                        const ratio = live + dead > 0 ? ((dead / (live + dead)) * 100).toFixed(1) : "0.0";
                        const rc = Number(ratio) > 20 ? THEME.danger : Number(ratio) > 10 ? THEME.warning : THEME.success;
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr", padding: "12px 16px", borderBottom: `1px solid ${THEME.grid}33`, alignItems: "center", gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: THEME.textMain }}>{t.name}</div>
                                    <div style={{ fontSize: 10, color: THEME.textDim }}>{t.schema}</div>
                                </div>
                                <div>
                                    <div style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.success, marginBottom: 3 }}>{live.toLocaleString()}</div>
                                    <Bar v={live} max={maxLive} color={THEME.success} h={4} />
                                </div>
                                <span style={{ fontFamily: THEME.fontMono, fontSize: 12, color: THEME.danger }}>{dead.toLocaleString()}</span>
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
    { group: "Table Details", label: "📑 Index Analysis", sub: "Index usage & unused detection", component: S_IndexAnalysis },
    { group: "Table Details", label: "📐 Size Breakdown", sub: "Heap / index / TOAST split", component: S_TableSizes },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SHELL
// ══════════════════════════════════════════════════════════════════════════════
export default function UnifiedDashboard() {
    useAdaptiveTheme(); // keeps THEME in sync with dark/light toggle
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
            <div style={{ background: THEME.bg, minHeight: "100vh", padding: "32px 24px", fontFamily: THEME.fontBody, color: THEME.textMain }}>
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 2px; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes taSpin { to { transform: rotate(360deg); } }
          @keyframes taFadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
          .pv { animation: fadeUp .3s ease both; }
          button { outline: none; }
          select:focus { box-shadow: 0 0 0 2px rgba(79,142,247,.3); }
        `}</style>

                <div style={{ maxWidth: 1200, margin: "0 auto" }}>

                    {/* Brand Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${THEME.primary}20`, border: `1px solid ${THEME.primary}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🐘</div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: THEME.textMain, letterSpacing: -0.5 }}>Table Analytics</div>
                            <div style={{ fontSize: 12, color: THEME.textDim, marginTop: 2 }}>Unified Dashboard</div>
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                            <Tag color={THEME.success}>Live Data Connected</Tag>
                            {filter.table && <Tag color={THEME.cyan}>🎯 Scoped to: {filter.table}</Tag>}
                        </div>
                    </div>

                    {/* ── Filter Bar ── */}
                    <FilterBar filter={filter} setFilter={(v) => {
                        setFilter(typeof v === "function" ? v(filter) : v);
                        setActive(0); // reset active section on filter change
                    }} />

                    {/* Context banner when table is selected */}
                    {filter.table && (
                        <div style={{ marginBottom: 20, padding: "10px 16px", borderRadius: 10, background: `${THEME.cyan}0a`, border: `1px solid ${THEME.cyan}25`, display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                            <span style={{ fontSize: 16 }}>💡</span>
                            <span style={{ color: THEME.textMuted }}>
                                Showing data scoped to <span style={{ color: THEME.cyan, fontFamily: THEME.fontMono, fontWeight: 700 }}>{filter.schema}.{filter.table}</span>.
                                Session-level sections (Temp Tables) are hidden.
                            </span>
                        </div>
                    )}

                    {/* Section Navigation */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                        {groups.map(g => (
                            <div key={g}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: THEME.textDim, textTransform: "uppercase", letterSpacing: 1.2 }}>{g}</div>
                                    {g === "Table Details" && <Tag color={THEME.cyan}>Table selected</Tag>}
                                </div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {SECTIONS.map((s, i) => {
                                        if (s.group !== g) return null;
                                        const isA = safeActive === i;
                                        return (
                                            <button key={i} onClick={() => setActive(i)}
                                                    style={{
                                                        padding: "10px 16px", borderRadius: 10,
                                                        border: `1px solid ${isA ? THEME.primary + "55" : THEME.glassBorder}`,
                                                        background: isA ? `${THEME.primary}16` : THEME.glass,
                                                        color: isA ? THEME.primary : THEME.textMuted,
                                                        cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
                                                        transition: "all .2s", textAlign: "left", minWidth: 180,
                                                    }}>
                                                <div>{s.label}</div>
                                                <div style={{ fontSize: 11, fontWeight: 400, color: isA ? THEME.primary + "88" : THEME.textDim, marginTop: 4 }}>{s.sub}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Active Panel Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${THEME.grid}` }}>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: THEME.textMain, letterSpacing: -0.5 }}>{SECTIONS[safeActive]?.label}</div>
                            <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>{SECTIONS[safeActive]?.sub}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {filter.schema && <Tag color={THEME.purple}>schema: {filter.schema}</Tag>}
                            {filter.table && <Tag color={THEME.teal}>table: {filter.table}</Tag>}
                        </div>
                    </div>

                    {/* Active Panel */}
                    <div key={`${safeActive}-${filter.db}-${filter.schema}-${filter.table}`} className="pv"
                         style={{ background: THEME.surface, border: `1px solid ${THEME.glassBorder}`, borderRadius: 16, padding: 24 }}>
                        {Preview && <Preview />}
                    </div>

                </div>
            </div>
        </FilterContext.Provider>
    );
}