// ==========================================================================
//  VIGIL — Trace Detail View
// ==========================================================================
//  Given a W3C traceparent (or just a trace id), show all Postgres queries
//  correlated to it. Backed by services/traceContext.js →
//  getQueriesForTrace() + summariseTrace().
// ==========================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { Link as LinkIcon, RefreshCw, ExternalLink } from 'lucide-react';
import { fetchData } from '../../utils/api';
import LicenseGate from '../components/LicenseGate';

interface TraceQuery {
    traceId: string;
    spanId: string;
    queryId: string;
    sqlPreview: string;
    meanExecMs: number;
    rows: number;
    ts: string;
}

interface TraceSummary {
    traceId: string;
    queryCount: number;
    totalExecMs: number;
    slowestQueryId?: string;
    firstSeen: string;
    lastSeen: string;
}

// Accept either a raw 32-hex trace id or a full W3C traceparent
// (00-<trace>-<span>-<flags>). Returns just the trace id.
export const normaliseTraceInput = (raw: string): string => {
    const trimmed = (raw || '').trim();
    if (!trimmed) return '';
    return trimmed.includes('-') ? trimmed.split('-')[1] ?? '' : trimmed;
};

const TraceDetailInner: React.FC<{ initialTraceId?: string }> = ({ initialTraceId = '' }) => {
    const [traceInput, setTraceInput] = useState(initialTraceId);
    const [queries, setQueries] = useState<TraceQuery[]>([]);
    const [summary, setSummary] = useState<TraceSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (traceId: string) => {
        if (!traceId) return;
        setLoading(true);
        setError(null);
        try {
            const [q, s] = await Promise.all([
                fetchData(`/api/enterprise/trace/${traceId}/queries`),
                fetchData(`/api/enterprise/trace/${traceId}/summary`),
            ]);
            setQueries(q?.queries ?? []);
            setSummary(s ?? null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load trace');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialTraceId) load(normaliseTraceInput(initialTraceId));
    }, [initialTraceId, load]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        load(normaliseTraceInput(traceInput));
    };

    return (
        <div className="p-6 space-y-6 text-vigil-text">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-vigil-cyan" aria-hidden />
                    <h1 className="text-xl font-semibold">Trace detail</h1>
                </div>
                <button
                    onClick={() => load(normaliseTraceInput(summary?.traceId ?? traceInput))}
                    className="flex items-center gap-1 px-3 py-1 border border-vigil-border rounded text-sm hover:bg-vigil-elevated"
                    aria-label="Refresh trace"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </header>

            <form onSubmit={onSubmit} className="flex gap-2 max-w-2xl" aria-label="Load trace">
                <label className="sr-only" htmlFor="trace-input">
                    Traceparent or trace id
                </label>
                <input
                    id="trace-input"
                    value={traceInput}
                    onChange={(e) => setTraceInput(e.target.value)}
                    placeholder="traceparent or 32-char trace id"
                    className="flex-1 border border-vigil-border rounded p-2 text-sm font-mono bg-vigil-surface text-vigil-text"
                />
                <button
                    type="submit"
                    className="px-3 py-1 bg-vigil-accent text-vigil-bg rounded text-sm font-medium"
                >
                    Load
                </button>
            </form>

            {error && (
                <div
                    role="alert"
                    className="p-3 bg-vigil-rose/10 text-vigil-rose rounded border border-vigil-rose/30 text-sm"
                >
                    {error}
                </div>
            )}

            {loading && <p className="text-sm text-vigil-muted">Loading…</p>}

            {summary && (
                <section
                    aria-label="Trace summary"
                    className="border border-vigil-border bg-vigil-surface rounded p-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm"
                >
                    <KV label="Trace id" value={summary.traceId} mono />
                    <KV label="Queries" value={summary.queryCount} />
                    <KV label="Total exec (ms)" value={summary.totalExecMs.toFixed(1)} />
                    <KV label="First seen" value={summary.firstSeen} />
                    <KV label="Last seen" value={summary.lastSeen} />
                    {summary.slowestQueryId && (
                        <KV label="Slowest query" value={summary.slowestQueryId} mono />
                    )}
                </section>
            )}

            {queries.length > 0 ? (
                <section aria-label="Correlated queries">
                    <h2 className="text-sm font-medium mb-2 text-vigil-muted">
                        Correlated queries
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-vigil-border rounded">
                            <thead className="bg-vigil-surface-alt text-vigil-muted">
                                <tr>
                                    <th className="text-left p-2">Time</th>
                                    <th className="text-left p-2">Span</th>
                                    <th className="text-left p-2">SQL</th>
                                    <th className="text-right p-2">Mean (ms)</th>
                                    <th className="text-right p-2">Rows</th>
                                    <th className="text-right p-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {queries.map((q) => (
                                    <tr
                                        key={`${q.spanId}-${q.queryId}`}
                                        className="border-t border-vigil-border"
                                    >
                                        <td className="p-2 text-vigil-muted">{q.ts}</td>
                                        <td className="p-2 font-mono text-xs">
                                            {q.spanId.slice(0, 8)}
                                        </td>
                                        <td className="p-2 font-mono text-xs truncate max-w-md">
                                            {q.sqlPreview}
                                        </td>
                                        <td className="p-2 text-right">
                                            {q.meanExecMs.toFixed(1)}
                                        </td>
                                        <td className="p-2 text-right">{q.rows}</td>
                                        <td className="p-2 text-right">
                                            <a
                                                href={`#/queries/${q.queryId}`}
                                                className="text-vigil-accent inline-flex items-center gap-1 text-xs"
                                            >
                                                View <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : summary && !loading ? (
                <p className="text-sm text-vigil-muted">
                    No correlated queries found for this trace.
                </p>
            ) : null}
        </div>
    );
};

const KV: React.FC<{ label: string; value: string | number; mono?: boolean }> = ({
    label,
    value,
    mono,
}) => (
    <div className="flex flex-col">
        <span className="text-xs text-vigil-muted">{label}</span>
        <span className={mono ? 'font-mono text-xs' : 'text-sm'}>{value}</span>
    </div>
);

const TraceDetail: React.FC<{ initialTraceId?: string }> = (props) => (
    <LicenseGate feature="trace_correlation">
        <TraceDetailInner {...props} />
    </LicenseGate>
);

export default TraceDetail;
