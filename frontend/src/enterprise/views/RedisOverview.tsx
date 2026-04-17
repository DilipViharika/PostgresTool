// ==========================================================================
//  VIGIL — Redis Overview View
// ==========================================================================
//  Read-only overview of a Redis target: INFO sections, keyspace counts,
//  replication role. Data is served by /api/enterprise/redis/info.
// ==========================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { fetchData } from '../../utils/api';
import LicenseGate from '../components/LicenseGate';

interface RedisInfo {
    server: Record<string, string | number>;
    clients: Record<string, string | number>;
    memory: Record<string, string | number>;
    stats: Record<string, string | number>;
    replication: Record<string, string | number>;
    keyspace: Record<string, { keys: number; expires: number; avg_ttl: number }>;
}

const RedisOverviewInner: React.FC = () => {
    const [info, setInfo] = useState<RedisInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchData('/api/enterprise/redis/info');
            setInfo(data);
        } catch (err: any) {
            setError(err?.message || 'Failed to load Redis info');
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
                    <Database className="w-5 h-5 text-vigil-rose" aria-hidden />
                    <h1 className="text-xl font-semibold">Redis overview</h1>
                </div>
                <button
                    onClick={refresh}
                    className="flex items-center gap-1 px-3 py-1 border border-vigil-border rounded text-sm hover:bg-vigil-elevated"
                    aria-label="Refresh Redis info"
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

            {loading && <p className="text-sm text-vigil-muted">Loading…</p>}

            {info && (
                <>
                    <Card title="Server">
                        <KV value={info.server.redis_version} label="Version" />
                        <KV value={info.server.uptime_in_seconds} label="Uptime (s)" />
                        <KV value={info.server.os} label="OS" />
                    </Card>
                    <Card title="Clients">
                        <KV value={info.clients.connected_clients} label="Connected" />
                        <KV value={info.clients.blocked_clients} label="Blocked" />
                    </Card>
                    <Card title="Memory">
                        <KV value={info.memory.used_memory_human} label="Used" />
                        <KV value={info.memory.used_memory_peak_human} label="Peak" />
                        <KV value={info.memory.mem_fragmentation_ratio} label="Frag ratio" />
                    </Card>
                    <Card title="Replication">
                        <KV value={info.replication.role} label="Role" />
                        <KV value={info.replication.connected_slaves} label="Replicas" />
                    </Card>
                    <Card title="Keyspace">
                        {Object.keys(info.keyspace).length === 0 ? (
                            <p className="text-sm text-vigil-muted">No data in any DB.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-vigil-muted">
                                        <th className="py-1">DB</th>
                                        <th>Keys</th>
                                        <th>Expires</th>
                                        <th>Avg TTL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(info.keyspace).map(([db, v]) => (
                                        <tr key={db} className="border-t border-vigil-border">
                                            <td className="py-1 font-mono">{db}</td>
                                            <td>{v.keys}</td>
                                            <td>{v.expires}</td>
                                            <td>{v.avg_ttl}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="border border-vigil-border bg-vigil-surface rounded p-4 space-y-2">
        <h2 className="text-sm font-medium text-vigil-muted">{title}</h2>
        <div className="text-sm space-y-1">{children}</div>
    </section>
);

const KV: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-vigil-muted">{label}</span>
        <span className="font-mono">{value ?? '—'}</span>
    </div>
);

const RedisOverview: React.FC = () => (
    <LicenseGate feature="adapter_redis">
        <RedisOverviewInner />
    </LicenseGate>
);

export default RedisOverview;
