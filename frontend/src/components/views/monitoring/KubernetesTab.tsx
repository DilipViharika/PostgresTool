// @ts-nocheck
import React, { useState, useEffect, FC } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { fetchData } from '../../../utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Server, Cpu, MemoryStick, Network, Activity, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

// Types
interface PodInfo {
    name?: string;
    namespace?: string;
    node?: string;
    containerId?: string;
}

interface Resources {
    cpuUsagePercent: number;
    cpuUsage: string;
    cpuLimit: string;
    memoryUsagePercent: number;
    memoryUsage: number;
    memoryLimit: number;
}

interface Metrics {
    readinessProbe?: boolean;
    livenessProbe?: boolean;
}

interface Connection {
    podName: string;
    activeConnections: number;
    maxConnections: number;
    usagePercent: number;
}

interface Topology {
    primary: string;
    replicas?: string[];
}

interface HistoryEntry {
    timestamp: string;
    cpuPercent: number;
    memoryPercent: number;
}

const fmt = (n: number | null | undefined) => n === null || n === undefined ? '—' : Number(n).toLocaleString();

const fmtBytes = (b: number | null | undefined) => {
    if (b === null || b === undefined) return '—';
    const n = Number(b);
    if (n < 1024) return `${n}B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
    if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)}MB`;
    return `${(n / (1024 * 1024 * 1024)).toFixed(1)}GB`;
};

const ChartTip: FC<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-vigil-surface border border-vigil-accent/20 rounded-lg p-2 text-xs">
            <div className="text-vigil-muted mb-1">{label}</div>
            {payload.map((p: any) => (
                <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}%</div>
            ))}
        </div>
    );
};

const KubernetesTab: FC = () => {
    useAdaptiveTheme();
    const [podInfo, setPodInfo] = useState<PodInfo | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [resources, setResources] = useState<Resources | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [topology, setTopology] = useState<Topology | null>(null);
    const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [k8sDetected, setK8sDetected] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [pods, met, res, conns, topo, hist] = await Promise.all([
                    fetchData('/api/k8s/pod-info').catch(() => null),
                    fetchData('/api/k8s/metrics').catch(() => null),
                    fetchData('/api/k8s/resources').catch(() => null),
                    fetchData('/api/k8s/connections').catch(() => null),
                    fetchData('/api/k8s/topology').catch(() => null),
                    fetchData('/api/k8s/resources?history=true').catch(() => null),
                ]);

                if (!pods && !met) {
                    setK8sDetected(false);
                    setError(null);
                } else {
                    setPodInfo(pods);
                    setMetrics(met);
                    setResources(res);
                    setConnections(conns?.connections || []);
                    setTopology(topo);
                    setHistoryData(hist?.history || []);
                    setError(null);
                }
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="p-5 text-center">
                <RefreshCw size={32} className="text-vigil-cyan mx-auto mb-4" style={{ animation: 'spin 1s linear infinite' }} />
                <div className="text-vigil-muted">Loading Kubernetes data...</div>
            </div>
        );
    }

    if (!k8sDetected) {
        return (
            <div className="p-5 text-center">
                <style>{`
                    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                `}</style>
                <AlertTriangle size={48} className="text-vigil-amber mx-auto mb-4" />
                <div className="text-base font-bold text-vigil-text mb-2">
                    Not Detected
                </div>
                <div className="text-vigil-muted text-xs">
                    PostgreSQL is not running in a Kubernetes cluster. This monitoring view is only available for containerized deployments.
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-5xl mx-auto">
            <style>{`
                @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>

            {error && (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-vigil-rose/10 border border-vigil-rose/30 text-vigil-rose text-xs font-semibold mb-5">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Pod Info Card */}
            {podInfo && (
                <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-vigil-text mb-4">
                        <Box size={18} />
                        Pod Information
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs font-semibold text-vigil-muted uppercase tracking-wider mb-1">Pod Name</div>
                            <div className="text-sm text-vigil-text font-semibold">{podInfo.name || '—'}</div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-vigil-muted uppercase tracking-wider mb-1">Namespace</div>
                            <div className="text-sm text-vigil-text font-semibold">{podInfo.namespace || '—'}</div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-vigil-muted uppercase tracking-wider mb-1">Node</div>
                            <div className="text-sm text-vigil-text font-semibold">{podInfo.node || '—'}</div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-vigil-muted uppercase tracking-wider mb-1">Container ID</div>
                            <div className="text-xs text-vigil-muted font-mono">{podInfo.containerId?.substring(0, 20)}...</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resource Gauges */}
            {resources && (
                <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-vigil-text mb-4">
                        <Activity size={18} />
                        Resource Usage
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-vigil-accent/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Cpu size={16} className="text-vigil-cyan" />
                                    <div className="text-xs font-semibold text-vigil-muted uppercase">CPU Usage</div>
                                </div>
                                <div className="text-base font-black text-vigil-cyan">
                                    {fmt(resources.cpuUsagePercent)}%
                                </div>
                            </div>
                            <div className="w-full h-2 bg-vigil-accent/20 rounded-full overflow-hidden mb-1">
                                <div
                                    className="h-full transition-all duration-300"
                                    style={{
                                        width: `${Math.min(resources.cpuUsagePercent, 100)}%`,
                                        background: resources.cpuUsagePercent > 80 ? THEME.danger : THEME.primary,
                                    }}
                                />
                            </div>
                            <div className="text-xs text-vigil-muted">
                                {resources.cpuUsage}m / {resources.cpuLimit}m
                            </div>
                        </div>

                        <div className="bg-vigil-accent/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <MemoryStick size={16} className="text-vigil-secondary" />
                                    <div className="text-xs font-semibold text-vigil-muted uppercase">Memory Usage</div>
                                </div>
                                <div className="text-base font-black text-vigil-secondary">
                                    {fmt(resources.memoryUsagePercent)}%
                                </div>
                            </div>
                            <div className="w-full h-2 bg-vigil-accent/20 rounded-full overflow-hidden mb-1">
                                <div
                                    className="h-full transition-all duration-300"
                                    style={{
                                        width: `${Math.min(resources.memoryUsagePercent, 100)}%`,
                                        background: resources.memoryUsagePercent > 80 ? THEME.danger : THEME.secondary,
                                    }}
                                />
                            </div>
                            <div className="text-xs text-vigil-muted">
                                {fmtBytes(resources.memoryUsage)} / {fmtBytes(resources.memoryLimit)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Health Status */}
            {metrics && (
                <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-vigil-text mb-4">
                        <Server size={18} />
                        Health Check Status
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-vigil-accent/5 rounded-lg p-3">
                            <div className="text-xs font-bold text-vigil-text mb-2">Readiness Probe</div>
                            <div className="flex items-center gap-2">
                                {metrics.readinessProbe ? (
                                    <>
                                        <CheckCircle size={20} className="text-vigil-emerald" />
                                        <span className="text-vigil-emerald font-bold">Ready</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={20} className="text-vigil-rose" />
                                        <span className="text-vigil-rose font-bold">Not Ready</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="bg-vigil-accent/5 rounded-lg p-3">
                            <div className="text-xs font-bold text-vigil-text mb-2">Liveness Probe</div>
                            <div className="flex items-center gap-2">
                                {metrics.livenessProbe ? (
                                    <>
                                        <CheckCircle size={20} className="text-vigil-emerald" />
                                        <span className="text-vigil-emerald font-bold">Healthy</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={20} className="text-vigil-rose" />
                                        <span className="text-vigil-rose font-bold">Unhealthy</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Connections by Pod */}
            {connections.length > 0 && (
                <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-vigil-text mb-4">
                        <Network size={18} />
                        Connections by Pod
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-vigil-accent/10">
                                    <th className="text-left p-3 font-semibold text-vigil-muted">Pod Name</th>
                                    <th className="text-left p-3 font-semibold text-vigil-muted">Active Connections</th>
                                    <th className="text-left p-3 font-semibold text-vigil-muted">Max Connections</th>
                                    <th className="text-left p-3 font-semibold text-vigil-muted">Usage %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {connections.map((conn, i) => (
                                    <tr key={i} className="border-b border-vigil-accent/10 last:border-b-0 hover:bg-vigil-accent/5 transition-colors">
                                        <td className="p-3 text-vigil-text">{conn.podName}</td>
                                        <td className="p-3 text-vigil-text">{fmt(conn.activeConnections)}</td>
                                        <td className="p-3 text-vigil-text">{fmt(conn.maxConnections)}</td>
                                        <td className="p-3" style={{ color: conn.usagePercent > 80 ? THEME.warning : THEME.textMain }}>
                                            {fmt(conn.usagePercent)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Replica Topology */}
            {topology && (
                <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-vigil-text mb-4">
                        <Server size={18} />
                        Replica Topology
                    </div>
                    <div className="bg-vigil-accent/5 rounded-lg p-4 text-center">
                        <div className="text-xs font-bold text-vigil-cyan mb-1">
                            {topology.primary}
                        </div>
                        <div className="text-xs text-vigil-muted mb-3">Primary</div>
                        {topology.replicas && topology.replicas.length > 0 && (
                            <>
                                <div className="text-xl text-vigil-muted mb-3">↓</div>
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(topology.replicas.length, 3)}, 1fr)`, gap: 12 }}>
                                    {topology.replicas.map((rep, i) => (
                                        <div key={i} className="bg-vigil-surface rounded-lg p-2 text-xs text-vigil-secondary font-semibold">
                                            {rep}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs text-vigil-muted mt-3">
                                    {topology.replicas.length} Replicas
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Resource History Chart */}
            {historyData.length > 0 && (
                <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-vigil-text mb-4">
                        <Activity size={18} />
                        Resource History (24h)
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={historyData}>
                            <XAxis dataKey="timestamp" stroke={THEME.textDim} style={{ fontSize: 12 }} />
                            <YAxis stroke={THEME.textDim} style={{ fontSize: 12 }} />
                            <Tooltip content={<ChartTip />} />
                            <Line type="monotone" dataKey="cpuPercent" stroke={THEME.primary} dot={false} name="CPU %" isAnimationActive={false} />
                            <Line type="monotone" dataKey="memoryPercent" stroke={THEME.secondary} dot={false} name="Memory %" isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default KubernetesTab;
