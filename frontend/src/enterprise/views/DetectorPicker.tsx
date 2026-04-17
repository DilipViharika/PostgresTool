// ==========================================================================
//  VIGIL — Anomaly Detector Picker
// ==========================================================================
//  Per-metric detector configuration: pick between z-score, EWMA, or MAD,
//  tune the sensitivity, save per-metric. Lists current anomaly events.
//
//  Backend: services/anomaly/*.js — detector factory + evaluator.
// ==========================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchData, postData } from '../../utils/api';
import LicenseGate from '../components/LicenseGate';

type DetectorKind = 'zscore' | 'ewma' | 'mad';

interface MetricConfig {
    metric: string;
    detector: DetectorKind;
    threshold: number;
    windowSize: number;
    enabled: boolean;
}

interface AnomalyEvent {
    id: string;
    metric: string;
    ts: string;
    value: number;
    score: number;
    detector: DetectorKind;
}

const DETECTOR_LABELS: Record<DetectorKind, string> = {
    zscore: 'Rolling z-score',
    ewma: 'EWMA (exponential weighted)',
    mad: 'MAD (median absolute deviation)',
};

const DETECTOR_HELP: Record<DetectorKind, string> = {
    zscore:
        'Simple and fast. Assumes the metric is roughly normally distributed. Good for QPS and connection-count.',
    ewma:
        'Adapts to slow trend changes. Good for metrics with time-of-day patterns.',
    mad: 'Robust to outliers. Good for latency tails.',
};

const DetectorPickerInner: React.FC = () => {
    const [configs, setConfigs] = useState<MetricConfig[]>([]);
    const [events, setEvents] = useState<AnomalyEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [c, e] = await Promise.all([
                fetchData('/api/enterprise/anomaly/configs'),
                fetchData('/api/enterprise/anomaly/events?limit=20'),
            ]);
            setConfigs(c?.configs ?? []);
            setEvents(e?.events ?? []);
        } catch (err: any) {
            setError(err?.message || 'Failed to load anomaly data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const updateConfig = (metric: string, patch: Partial<MetricConfig>) => {
        setConfigs((prev) => prev.map((c) => (c.metric === metric ? { ...c, ...patch } : c)));
    };

    const save = async (cfg: MetricConfig) => {
        setSaving(cfg.metric);
        setError(null);
        try {
            await postData(`/api/enterprise/anomaly/configs`, cfg);
        } catch (err: any) {
            setError(err?.message || 'Save failed');
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="p-6 space-y-6 text-vigil-text">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-vigil-violet" aria-hidden />
                    <h1 className="text-xl font-semibold">Anomaly detectors</h1>
                </div>
                <button
                    onClick={refresh}
                    className="flex items-center gap-1 px-3 py-1 border border-vigil-border rounded text-sm hover:bg-vigil-elevated"
                    aria-label="Refresh anomaly data"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </header>

            {error && (
                <div
                    role="alert"
                    className="p-3 bg-vigil-rose/10 text-vigil-rose rounded border border-vigil-rose/30 text-sm"
                >
                    {error}
                </div>
            )}

            <section aria-label="Per-metric configuration">
                <h2 className="text-sm font-medium mb-2 text-vigil-muted">
                    Per-metric configuration
                </h2>
                {loading ? (
                    <p className="text-sm text-vigil-muted">Loading…</p>
                ) : configs.length === 0 ? (
                    <p className="text-sm text-vigil-muted">
                        No metrics are currently being tracked for anomaly detection.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {configs.map((cfg) => (
                            <div
                                key={cfg.metric}
                                className="border border-vigil-border rounded p-3 space-y-2 bg-vigil-surface"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-sm">{cfg.metric}</span>
                                    <label className="text-xs flex items-center gap-1 text-vigil-muted">
                                        <input
                                            type="checkbox"
                                            checked={cfg.enabled}
                                            onChange={(e) =>
                                                updateConfig(cfg.metric, {
                                                    enabled: e.target.checked,
                                                })
                                            }
                                            aria-label={`Enable detector for ${cfg.metric}`}
                                        />
                                        enabled
                                    </label>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    <label className="sr-only" htmlFor={`detector-${cfg.metric}`}>
                                        Detector kind
                                    </label>
                                    <select
                                        id={`detector-${cfg.metric}`}
                                        value={cfg.detector}
                                        onChange={(e) =>
                                            updateConfig(cfg.metric, {
                                                detector: e.target.value as DetectorKind,
                                            })
                                        }
                                        className="border border-vigil-border rounded p-1 bg-vigil-surface text-vigil-text"
                                    >
                                        <option value="zscore">z-score</option>
                                        <option value="ewma">EWMA</option>
                                        <option value="mad">MAD</option>
                                    </select>
                                    <label className="sr-only" htmlFor={`threshold-${cfg.metric}`}>
                                        Threshold
                                    </label>
                                    <input
                                        id={`threshold-${cfg.metric}`}
                                        type="number"
                                        step="0.1"
                                        value={cfg.threshold}
                                        onChange={(e) =>
                                            updateConfig(cfg.metric, {
                                                threshold: Number(e.target.value),
                                            })
                                        }
                                        placeholder="threshold"
                                        className="border border-vigil-border rounded p-1 w-24 bg-vigil-surface text-vigil-text"
                                    />
                                    <label className="sr-only" htmlFor={`window-${cfg.metric}`}>
                                        Window size
                                    </label>
                                    <input
                                        id={`window-${cfg.metric}`}
                                        type="number"
                                        value={cfg.windowSize}
                                        onChange={(e) =>
                                            updateConfig(cfg.metric, {
                                                windowSize: Number(e.target.value),
                                            })
                                        }
                                        placeholder="window"
                                        className="border border-vigil-border rounded p-1 w-24 bg-vigil-surface text-vigil-text"
                                    />
                                    <button
                                        onClick={() => save(cfg)}
                                        disabled={saving === cfg.metric}
                                        className="ml-auto flex items-center gap-1 px-2 py-1 border border-vigil-border rounded text-xs hover:bg-vigil-elevated disabled:opacity-50"
                                        aria-label={`Save detector config for ${cfg.metric}`}
                                    >
                                        <Save className="w-3 h-3" />
                                        {saving === cfg.metric ? 'Saving…' : 'Save'}
                                    </button>
                                </div>
                                <p className="text-xs text-vigil-muted">
                                    {DETECTOR_LABELS[cfg.detector]} — {DETECTOR_HELP[cfg.detector]}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section aria-label="Recent anomalies">
                <h2 className="text-sm font-medium mb-2 flex items-center gap-1 text-vigil-muted">
                    <AlertTriangle className="w-4 h-4" /> Recent anomalies
                </h2>
                {events.length === 0 ? (
                    <p className="text-sm text-vigil-muted">No anomalies in the last window.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-vigil-border rounded">
                            <thead className="bg-vigil-surface-alt text-vigil-muted">
                                <tr>
                                    <th className="text-left p-2">Time</th>
                                    <th className="text-left p-2">Metric</th>
                                    <th className="text-left p-2">Detector</th>
                                    <th className="text-right p-2">Value</th>
                                    <th className="text-right p-2">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((ev) => (
                                    <tr key={ev.id} className="border-t border-vigil-border">
                                        <td className="p-2 text-vigil-muted">{ev.ts}</td>
                                        <td className="p-2 font-mono">{ev.metric}</td>
                                        <td className="p-2">{ev.detector}</td>
                                        <td className="p-2 text-right">{ev.value}</td>
                                        <td className="p-2 text-right">{ev.score.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

const DetectorPicker: React.FC = () => (
    <LicenseGate feature="anomaly_detection_suggest">
        <DetectorPickerInner />
    </LicenseGate>
);

export default DetectorPicker;
