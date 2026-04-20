/**
 * CapacityPlanningTabV2.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * A cleaner, plain-language version of the Capacity Planning view.
 *
 * Goals:
 *   • Lead with the answer ("You'll run out of storage in about X days").
 *   • Four KPI tiles, one forecast chart, simple what-if scenarios,
 *     a biggest-tables breakdown, and numbered recommendations.
 *   • No big decorative ribbons or gradients; calm visual hierarchy.
 *
 * Data:
 *   The original CapacityPlanningTab uses generated sample data because
 *   no `/api/capacity/*` endpoint is wired up server-side yet. V2 keeps the
 *   same approach (reasonable defaults + a what-if slider) so the page
 *   continues to work, while leaving room for real telemetry later.
 *
 * The original CapacityPlanningTab.tsx (~625 lines) is left untouched.
 * ──────────────────────────────────────────────────────────────────────────
 */

import React, { useMemo, useState } from 'react';
import {
    AlertTriangle,
    BarChart3,
    Calendar,
    Clock,
    DollarSign,
    HardDrive,
    Info,
    Lightbulb,
    Sliders,
    TrendingUp,
} from 'lucide-react';

import { THEME, useAdaptiveTheme } from '../../../utils/theme';

import {
    KpiCard,
    PanelCard,
    ProgressBar,
    StatusBadge,
    TremorStyles,
} from '../../ui/tremor';

/* ─────────────────────────────────────────────────────────────────────────
 * Sample data — same shape as the original, just smaller and tidier.
 * ────────────────────────────────────────────────────────────────────── */

const STORAGE_USED_GB = 287;
const STORAGE_TOTAL_GB = 500;
const GROWTH_GB_PER_DAY = 2.9;     // base measured rate
const MONTHLY_COST_USD = 412;

interface ForecastPoint {
    day: number;        // -30 → 0 historical, 0 → +60 predicted
    used: number;       // GB
    band?: number;      // confidence band thickness (GB) — only on prediction
}

const buildForecast = (growthMultiplier: number): ForecastPoint[] => {
    const today = STORAGE_USED_GB;
    const points: ForecastPoint[] = [];
    // Past 30 days — flat growth backwards.
    for (let d = -30; d <= 0; d++) {
        points.push({ day: d, used: today + d * GROWTH_GB_PER_DAY });
    }
    // Next 60 days — projected at the chosen growth multiplier.
    for (let d = 1; d <= 60; d++) {
        const proj = today + d * GROWTH_GB_PER_DAY * growthMultiplier;
        // Confidence band widens with time.
        const band = (d / 60) * 8 + 2;
        points.push({ day: d, used: proj, band });
    }
    return points;
};

const TOP_TABLES = [
    { name: 'public.events',       size: 124, share: 43 },
    { name: 'public.audit_log',    size:  68, share: 24 },
    { name: 'public.users',        size:  31, share: 11 },
    { name: 'public.orders',       size:  22, share:  8 },
    { name: 'public.line_items',   size:  17, share:  6 },
    { name: 'other',               size:  25, share:  9 },
];

interface Recommendation {
    title: string;
    detail: string;
    impact: 'high' | 'med' | 'low';
}

const RECOMMENDATIONS: Recommendation[] = [
    {
        title: 'Archive events older than 90 days',
        detail: 'Move cold rows from public.events to cheaper storage. Reclaims ~80 GB and slows growth by roughly a third.',
        impact: 'high',
    },
    {
        title: 'Vacuum public.audit_log',
        detail: 'A scheduled VACUUM FULL during off-hours can reclaim ~15 GB of bloat with no application changes.',
        impact: 'med',
    },
    {
        title: 'Move backups to object storage',
        detail: 'Store nightly snapshots in S3-compatible storage instead of the database volume. Frees up ~25 GB.',
        impact: 'med',
    },
    {
        title: 'Set up a storage alert at 80%',
        detail: 'Get a heads-up well before you hit the limit, so the next decision happens calmly rather than under pressure.',
        impact: 'low',
    },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────── */

const fmtGB = (v: number) => `${v.toFixed(0)} GB`;
const fmtDays = (v: number) => (v >= 365 ? `${(v / 365).toFixed(1)} yr` : `${Math.round(v)} d`);

const impactPalette = (i: Recommendation['impact']) => {
    switch (i) {
        case 'high': return { color: THEME.danger, label: 'High impact' };
        case 'med':  return { color: THEME.warning, label: 'Medium impact' };
        case 'low':  return { color: THEME.info, label: 'Low impact' };
    }
};

/* ─────────────────────────────────────────────────────────────────────────
 * Forecast chart — historical solid line, predicted dashed line, band fill.
 * ────────────────────────────────────────────────────────────────────── */

const ForecastChart: React.FC<{ data: ForecastPoint[]; capacity: number }> = ({ data, capacity }) => {
    const width = 700;
    const height = 240;
    const pad = { top: 16, right: 20, bottom: 28, left: 48 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;

    const xs = data.map((d) => d.day);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMax = Math.max(capacity * 1.1, ...data.map((d) => d.used + (d.band ?? 0)));

    const x = (day: number) => pad.left + ((day - xMin) / (xMax - xMin)) * innerW;
    const y = (gb: number) => pad.top + innerH - (gb / yMax) * innerH;

    const past = data.filter((d) => d.day <= 0);
    const future = data.filter((d) => d.day >= 0);

    const lineFor = (pts: ForecastPoint[]) =>
        pts.map((p) => `${x(p.day).toFixed(1)},${y(p.used).toFixed(1)}`).join(' ');

    // Confidence band polygon (upper edge then lower edge reversed).
    const bandTop = future.map((p) => `${x(p.day).toFixed(1)},${y(p.used + (p.band ?? 0)).toFixed(1)}`);
    const bandBot = future.slice().reverse().map((p) => `${x(p.day).toFixed(1)},${y(p.used - (p.band ?? 0)).toFixed(1)}`);
    const bandPoly = [...bandTop, ...bandBot].join(' ');

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
        gy: pad.top + innerH * (1 - p),
        gb: yMax * p,
    }));

    const capacityY = y(capacity);

    // Where the predicted line crosses the capacity line.
    const crossing = (() => {
        for (let i = 0; i < future.length - 1; i++) {
            const a = future[i];
            const b = future[i + 1];
            if (a.used <= capacity && b.used >= capacity) {
                const t = (capacity - a.used) / (b.used - a.used || 1);
                return a.day + t * (b.day - a.day);
            }
        }
        return null;
    })();

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Storage forecast">
            {/* Grid */}
            {yTicks.map((t, i) => (
                <line key={i}
                    x1={pad.left} x2={pad.left + innerW}
                    y1={t.gy} y2={t.gy}
                    stroke={THEME.grid} strokeWidth={0.5} opacity={0.5}
                />
            ))}
            {/* Y-axis labels */}
            {yTicks.map((t, i) => (
                <text key={`yl-${i}`}
                    x={pad.left - 8} y={t.gy + 4}
                    fontSize={10} fill={THEME.textDim} textAnchor="end"
                    fontFamily={THEME.fontMono}
                >
                    {t.gb.toFixed(0)} GB
                </text>
            ))}
            {/* "Today" marker */}
            <line x1={x(0)} x2={x(0)} y1={pad.top} y2={pad.top + innerH}
                stroke={THEME.textDim} strokeWidth={0.5} strokeDasharray="3 3" opacity={0.6}
            />
            <text x={x(0) + 4} y={pad.top + 12} fontSize={10} fill={THEME.textDim}>
                Today
            </text>
            {/* Capacity line */}
            <line x1={pad.left} x2={pad.left + innerW} y1={capacityY} y2={capacityY}
                stroke={THEME.danger} strokeWidth={1} strokeDasharray="4 4" opacity={0.7}
            />
            <text x={pad.left + innerW - 4} y={capacityY - 4}
                fontSize={10} fill={THEME.danger} textAnchor="end" fontFamily={THEME.fontMono}
            >
                Capacity ({capacity} GB)
            </text>
            {/* Confidence band */}
            <polygon points={bandPoly} fill={THEME.warning} opacity={0.12} />
            {/* Past line — solid indigo */}
            <polyline points={lineFor(past)} fill="none"
                stroke={THEME.primary} strokeWidth={2}
                strokeLinejoin="round" strokeLinecap="round"
            />
            {/* Future line — dashed indigo */}
            <polyline points={lineFor(future)} fill="none"
                stroke={THEME.primary} strokeWidth={2}
                strokeDasharray="5 4"
                strokeLinejoin="round" strokeLinecap="round"
                opacity={0.85}
            />
            {/* Crossing point marker */}
            {crossing != null && (
                <>
                    <circle cx={x(crossing)} cy={capacityY} r={4} fill={THEME.danger} />
                    <text x={x(crossing)} y={capacityY + 16}
                        fontSize={10} fill={THEME.danger} textAnchor="middle"
                        fontFamily={THEME.fontMono}
                    >
                        full at day +{Math.round(crossing)}
                    </text>
                </>
            )}
            {/* X-axis labels */}
            {[xMin, 0, xMax].map((d, i) => (
                <text key={`xl-${i}`}
                    x={x(d)} y={pad.top + innerH + 16}
                    fontSize={10} fill={THEME.textDim}
                    textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}
                    fontFamily={THEME.fontMono}
                >
                    {d > 0 ? `+${d}d` : d < 0 ? `${d}d` : 'now'}
                </text>
            ))}
        </svg>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
 * Main component
 * ────────────────────────────────────────────────────────────────────── */

type ScenarioKey = 'slow' | 'current' | 'spike';
const SCENARIOS: Record<ScenarioKey, { label: string; description: string; multiplier: number }> = {
    slow:    { label: 'Slow growth',       description: 'Growth at 50% of current rate', multiplier: 0.5 },
    current: { label: 'Current pace',      description: 'Growth as observed today',      multiplier: 1.0 },
    spike:   { label: 'Launch spike',      description: 'Growth at 2× current rate',     multiplier: 2.0 },
};

const CapacityPlanningTabV2: React.FC = () => {
    useAdaptiveTheme();
    const [scenario, setScenario] = useState<ScenarioKey>('current');

    const forecast = useMemo(() => buildForecast(SCENARIOS[scenario].multiplier), [scenario]);

    const usedPct = (STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100;
    const dailyGrowth = GROWTH_GB_PER_DAY * SCENARIOS[scenario].multiplier;
    const remainingGB = STORAGE_TOTAL_GB - STORAGE_USED_GB;
    const daysToFull = remainingGB / dailyGrowth;
    const fullDate = new Date(Date.now() + daysToFull * 24 * 60 * 60 * 1000);
    const fullDateLabel = fullDate.toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
    });

    const urgency: { tone: 'ok' | 'warn' | 'bad'; color: string; title: string; message: string } =
        daysToFull < 30
            ? { tone: 'bad', color: THEME.danger, title: 'Action needed soon', message: `You'll run out of storage in about ${Math.round(daysToFull)} days.` }
            : daysToFull < 90
                ? { tone: 'warn', color: THEME.warning, title: 'Plan ahead', message: `You'll run out of storage in about ${Math.round(daysToFull)} days — well within planning range.` }
                : { tone: 'ok',  color: THEME.success, title: 'On track', message: `You'll run out of storage in about ${fmtDays(daysToFull)} — comfortably ahead.` };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 0 40px' }}>
            <TremorStyles />

            {/* Header */}
            <header>
                <div style={{ fontSize: 22, fontWeight: 700, color: THEME.textMain, letterSpacing: '-0.02em' }}>
                    Capacity planning
                </div>
                <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
                    A simple forecast of where storage and cost are heading,
                    so you can act early instead of late.
                </div>
            </header>

            {/* Headline banner */}
            <div
                role="status"
                aria-live="polite"
                style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 12,
                    background: `${urgency.color}10`,
                    border: `1px solid ${urgency.color}33`,
                }}
            >
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${urgency.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <AlertTriangle size={20} color={urgency.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>
                        {urgency.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: THEME.textMuted, marginTop: 2 }}>
                        {urgency.message}
                    </div>
                </div>
            </div>

            {/* KPI tiles */}
            <section
                aria-label="Capacity summary"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 12,
                }}
            >
                <KpiCard
                    label="Storage used"
                    value={fmtGB(STORAGE_USED_GB)}
                    sub={`of ${fmtGB(STORAGE_TOTAL_GB)}`}
                    icon={HardDrive}
                    color={usedPct > 80 ? THEME.danger : usedPct > 60 ? THEME.warning : THEME.primary}
                    healthy={usedPct < 80}
                    detail={`${usedPct.toFixed(0)}% full`}
                />
                <KpiCard
                    label="Growth rate"
                    value={`${dailyGrowth.toFixed(1)}`}
                    sub="GB / day"
                    icon={TrendingUp}
                    color={THEME.info}
                    healthy={dailyGrowth < 5}
                    detail={dailyGrowth < 3 ? 'Steady' : dailyGrowth < 6 ? 'Active' : 'Heavy'}
                />
                <KpiCard
                    label="Full in"
                    value={fmtDays(daysToFull)}
                    sub={`around ${fullDateLabel}`}
                    icon={Clock}
                    color={urgency.color}
                    healthy={daysToFull > 90}
                    detail={daysToFull > 90 ? 'On track' : daysToFull > 30 ? 'Plan ahead' : 'Soon'}
                />
                <KpiCard
                    label="Estimated monthly cost"
                    value={`$${MONTHLY_COST_USD}`}
                    sub="storage + compute"
                    icon={DollarSign}
                    color={THEME.success}
                    healthy
                    detail="Within budget"
                />
            </section>

            {/* Forecast + scenarios */}
            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
                    gap: 18,
                }}
            >
                <PanelCard
                    title="Storage forecast"
                    icon={Calendar}
                    accentColor={THEME.primary}
                    rightNode={
                        <div style={{ fontSize: 11, color: THEME.textDim, fontFamily: THEME.fontMono }}>
                            {SCENARIOS[scenario].label}
                        </div>
                    }
                >
                    <ForecastChart data={forecast} capacity={STORAGE_TOTAL_GB} />
                </PanelCard>

                <PanelCard title="What if…" icon={Sliders} accentColor={THEME.info}>
                    <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
                        Try a different growth assumption to see how the forecast changes.
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(Object.keys(SCENARIOS) as ScenarioKey[]).map((k) => {
                            const s = SCENARIOS[k];
                            const active = scenario === k;
                            return (
                                <button
                                    key={k}
                                    type="button"
                                    onClick={() => setScenario(k)}
                                    style={{
                                        textAlign: 'left',
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        border: `1px solid ${active ? THEME.primary : THEME.glassBorder}`,
                                        background: active ? `${THEME.primary}12` : THEME.surface,
                                        cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', gap: 2,
                                    }}
                                >
                                    <span style={{
                                        fontSize: 12.5, fontWeight: 700,
                                        color: active ? THEME.primary : THEME.textMain,
                                    }}>
                                        {s.label}
                                    </span>
                                    <span style={{ fontSize: 11, color: THEME.textMuted }}>
                                        {s.description}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </PanelCard>
            </section>

            {/* Biggest tables + recommendations */}
            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 1fr)',
                    gap: 18,
                }}
            >
                <PanelCard title="Biggest tables" icon={BarChart3} accentColor={THEME.warning}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {TOP_TABLES.map((t) => (
                            <div key={t.name}>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    fontSize: 12, marginBottom: 4,
                                }}>
                                    <span style={{ color: THEME.textMain, fontWeight: 600 }}>{t.name}</span>
                                    <span style={{ color: THEME.textMuted, fontFamily: THEME.fontMono }}>
                                        {fmtGB(t.size)} • {t.share}%
                                    </span>
                                </div>
                                <ProgressBar value={t.share * 2.3 /* scale to feel meaningful */} color={THEME.warning} showLabel={false} />
                            </div>
                        ))}
                    </div>
                </PanelCard>

                <PanelCard title="What to do next" icon={Lightbulb} accentColor={THEME.success}>
                    <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {RECOMMENDATIONS.map((r, i) => {
                            const tag = impactPalette(r.impact);
                            return (
                                <li
                                    key={r.title}
                                    style={{
                                        display: 'flex', gap: 10,
                                        padding: 10, borderRadius: 10,
                                        background: `${tag.color}0D`,
                                        border: `1px solid ${tag.color}25`,
                                    }}
                                >
                                    <div
                                        aria-hidden
                                        style={{
                                            width: 26, height: 26, borderRadius: 8,
                                            background: tag.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0,
                                        }}
                                    >
                                        {i + 1}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            gap: 8, marginBottom: 4, flexWrap: 'wrap',
                                        }}>
                                            <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.textMain }}>
                                                {r.title}
                                            </span>
                                            <StatusBadge label={tag.label} color={tag.color} />
                                        </div>
                                        <div style={{ fontSize: 11.5, color: THEME.textMuted, lineHeight: 1.5 }}>
                                            {r.detail}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </PanelCard>
            </section>

            <p style={{
                fontSize: 11, color: THEME.textDim, margin: 0,
                display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
                <Info size={12} /> Forecasts use the last 30 days of growth. The
                shaded band shows uncertainty — wider further out.
            </p>
        </div>
    );
};

export default React.memo(CapacityPlanningTabV2);
