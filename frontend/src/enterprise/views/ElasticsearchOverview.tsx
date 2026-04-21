// ==========================================================================
//  VIGIL — Elasticsearch Overview View
// ==========================================================================
//  Cluster-level health + per-index summary. Served by
//  /api/enterprise/elasticsearch/health + /indices.
// ==========================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { fetchData } from '../../utils/api';

interface ClusterHealth {
    cluster_name: string;
    status: 'green' | 'yellow' | 'red';
    number_of_nodes: number;
    number_of_data_nodes: number;
    active_primary_shards: number;
    active_shards: number;
    relocating_shards: number;
    initializing_shards: number;
    unassigned_shards: number;
}

interface IndexRow {
    index: string;
    health: 'green' | 'yellow' | 'red';
    status: 'open' | 'close';
    docs: number;
    primaries: number;
    replicas: number;
    storeSize: string;
}

const healthColor = (h: string) =>
    h === 'green'
        ? 'text-vigil-emerald'
        : h === 'yellow'
        ? 'text-vigil-amber'
        : 'text-vigil-rose';

const ElasticsearchOverviewInner: React.FC = () => {
    const [health, setHealth] = useState<ClusterHealth | null>(null);
    const [indices, setIndices] = useState<IndexRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [h, ix] = await Promise.all([
                fetchData('/api/enterprise/elasticsearch/health'),
                fetchData('/api/enterprise/elasticsearch/indices'),
            ]);
            setHealth(h);
            setIndices(ix?.indices ?? []);
        } catch (err: any) {
            setError(err?.message || 'Failed to load Elasticsearch data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <div className="p-6 space-y-6 text-vigil-text">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-vigil-amber" aria-hidden />
                    <h1 className="text-xl font-semibold">Elasticsearch overview</h1>
                </div>
                <button
                    onClick={refresh}
                    className="flex items-center gap-1 px-3 py-1 border border-vigil-border rounded text-sm hover:bg-vigil-elevated"
                    aria-label="Refresh Elasticsearch info"
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

            {health && (
                <section className="border border-vigil-border bg-vigil-surface rounded p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-medium text-vigil-muted">Cluster</h2>
                            <p className="font-mono text-xs text-vigil-muted">
                                {health.cluster_name}
                            </p>
                        </div>
                        <span className={`text-sm font-semibold ${healthColor(health.status)}`}>
                            {health.status.toUpperCase()}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <KV label="Nodes" value={health.number_of_nodes} />
                        <KV label="Data nodes" value={health.number_of_data_nodes} />
                        <KV label="Active primary shards" value={health.active_primary_shards} />
                        <KV label="Active shards" value={health.active_shards} />
                        <KV label="Relocating" value={health.relocating_shards} />
                        <KV label="Initializing" value={health.initializing_shards} />
                        <KV label="Unassigned" value={health.unassigned_shards} />
                    </div>
                </section>
            )}

            <section aria-label="Indices">
                <h2 className="text-sm font-medium mb-2 text-vigil-muted">Indices</h2>
                {loading ? (
                    <p className="text-sm text-vigil-muted">Loading…</p>
                ) : indices.length === 0 ? (
                    <p className="text-sm text-vigil-muted">No indices returned.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-vigil-border rounded">
                            <thead className="bg-vigil-surface-alt text-vigil-muted">
                                <tr>
                                    <th className="text-left p-2">Index</th>
                                    <th className="text-left p-2">Health</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-right p-2">Docs</th>
                                    <th className="text-right p-2">Primaries</th>
                                    <th className="text-right p-2">Replicas</th>
                                    <th className="text-right p-2">Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {indices.map((ix) => (
                                    <tr key={ix.index} className="border-t border-vigil-border">
                                        <td className="p-2 font-mono">{ix.index}</td>
                                        <td className={`p-2 ${healthColor(ix.health)}`}>
                                            {ix.health}
                                        </td>
                                        <td className="p-2">{ix.status}</td>
                                        <td className="p-2 text-right">{ix.docs}</td>
                                        <td className="p-2 text-right">{ix.primaries}</td>
                                        <td className="p-2 text-right">{ix.replicas}</td>
                                        <td className="p-2 text-right">{ix.storeSize}</td>
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

const KV: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
    <div className="flex justify-between border-b border-vigil-border py-1">
        <span className="text-vigil-muted">{label}</span>
        <span className="font-mono">{value}</span>
    </div>
);

const ElasticsearchOverview: React.FC = () => <ElasticsearchOverviewInner />;

export default ElasticsearchOverview;
