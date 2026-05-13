import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { THEME, useAdaptiveTheme } from '../../utils/theme';

/**
 * HighchartsChart
 * ────────────────
 * A theme-aware Highcharts wrapper for FATHOM.
 *
 * - Reads colors from the project's THEME tokens so charts stay consistent
 *   with the rest of the UI (and switch on light/dark adaptive theme).
 * - Provides sane defaults (transparent background, FATHOM color palette,
 *   tooltip + axis styling) so callers can pass minimal options.
 * - Caller-provided `options` are deep-merged on top of the defaults and win.
 *
 * Usage:
 *
 *   <HighchartsChart
 *       options={{
 *           title: { text: 'Query latency (ms)' },
 *           xAxis: { categories: ['00:00', '00:05', '00:10'] },
 *           series: [{ type: 'line', name: 'p95', data: [12, 18, 14] }],
 *       }}
 *       height={320}
 *   />
 */

export interface HighchartsChartProps {
    options: Highcharts.Options;
    height?: number | string;
    className?: string;
    constructorType?: 'chart' | 'stockChart' | 'mapChart' | 'ganttChart';
    callback?: Highcharts.ChartCallbackFunction;
}

// FATHOM color palette pulled from THEME so light/dark adapts automatically.
const buildPalette = () => [
    THEME.primary,
    THEME.info,
    THEME.success,
    THEME.warning,
    THEME.danger,
    THEME.secondary,
];

const buildBaseOptions = (): Highcharts.Options => ({
    chart: {
        backgroundColor: 'transparent',
        style: {
            fontFamily:
                "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        spacing: [12, 12, 12, 12],
    },
    colors: buildPalette(),
    credits: { enabled: false },
    title: {
        text: undefined,
        style: { color: THEME.textMain, fontSize: '14px', fontWeight: '600' },
    },
    subtitle: {
        style: { color: THEME.textMuted, fontSize: '12px' },
    },
    legend: {
        itemStyle: { color: THEME.textMain, fontWeight: '500' },
        itemHoverStyle: { color: THEME.primary },
    },
    tooltip: {
        backgroundColor: THEME.surface,
        borderColor: THEME.glassBorder,
        borderRadius: 8,
        style: { color: THEME.textMain, fontSize: '12px' },
    },
    xAxis: {
        lineColor: THEME.glassBorder,
        tickColor: THEME.glassBorder,
        gridLineColor: THEME.glassBorder,
        labels: { style: { color: THEME.textMuted, fontSize: '11px' } },
        title: { style: { color: THEME.textMuted } },
    },
    yAxis: {
        lineColor: THEME.glassBorder,
        tickColor: THEME.glassBorder,
        gridLineColor: THEME.glassBorder,
        labels: { style: { color: THEME.textMuted, fontSize: '11px' } },
        title: { style: { color: THEME.textMuted } },
    },
    plotOptions: {
        series: {
            animation: { duration: 400 },
            marker: { enabled: false, states: { hover: { enabled: true } } },
        },
        area: { fillOpacity: 0.25 },
        column: { borderWidth: 0, borderRadius: 4 },
        bar: { borderWidth: 0, borderRadius: 4 },
        pie: {
            borderWidth: 0,
            dataLabels: {
                style: {
                    color: THEME.textMain,
                    textOutline: 'none',
                    fontWeight: '500',
                },
            },
        },
    },
    accessibility: { enabled: false },
});

// Shallow-deep merge tuned for Highcharts option trees (objects merge, arrays replace).
const mergeOptions = (
    base: Highcharts.Options,
    override: Highcharts.Options,
): Highcharts.Options => {
    const out: Record<string, unknown> = { ...base };
    Object.keys(override).forEach((key) => {
        const k = key as keyof Highcharts.Options;
        const overrideVal = override[k] as unknown;
        const baseVal = (base as Record<string, unknown>)[key];
        if (
            overrideVal &&
            typeof overrideVal === 'object' &&
            !Array.isArray(overrideVal) &&
            baseVal &&
            typeof baseVal === 'object' &&
            !Array.isArray(baseVal)
        ) {
            out[key] = mergeOptions(
                baseVal as Highcharts.Options,
                overrideVal as Highcharts.Options,
            );
        } else if (overrideVal !== undefined) {
            out[key] = overrideVal;
        }
    });
    return out as Highcharts.Options;
};

const HighchartsChart: React.FC<HighchartsChartProps> = ({
    options,
    height = 320,
    className,
    constructorType = 'chart',
    callback,
}) => {
    useAdaptiveTheme();

    const mergedOptions = useMemo(() => {
        const base = buildBaseOptions();
        const merged = mergeOptions(base, options || {});
        // Ensure the chart picks up the requested height.
        merged.chart = {
            ...(merged.chart || {}),
            height,
        };
        return merged;
    }, [options, height]);

    return (
        <div className={className} style={{ width: '100%' }}>
            <HighchartsReact
                highcharts={Highcharts}
                options={mergedOptions}
                constructorType={constructorType}
                callback={callback}
            />
        </div>
    );
};

export default HighchartsChart;
