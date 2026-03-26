// @ts-nocheck
import React, { useState, useEffect, FC } from 'react';
import { THEME, useAdaptiveTheme } from '../../../utils/theme.jsx';
import { fetchData, postData, putData } from '../../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Globe, CheckCircle, AlertTriangle, XCircle, Clock, Shield, PlusCircle, RefreshCw, Edit, Trash2 } from 'lucide-react';

// Types
interface StatusData {
    status: 'operational' | 'degraded' | 'outage';
    uptime30d: number;
    lastUpdate?: string;
    components?: Component[];
}

interface Component {
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    description: string;
}

interface UptimeEntry {
    date: string;
    uptime: number;
}

interface Incident {
    id: string;
    title: string;
    description?: string;
    severity: 'degraded' | 'outage';
    status: 'active' | 'resolved';
    createdAt?: string;
}

const fmtDate = (d: string | Date | null) => d ? new Date(d).toLocaleString() : '—';

const StatusIndicator: FC<{ status: string }> = ({ status }) => {
    if (status === 'operational') return <CheckCircle size={16} className="text-vigil-emerald" />;
    if (status === 'degraded') return <AlertTriangle size={16} className="text-vigil-amber" />;
    return <XCircle size={16} className="text-vigil-rose" />;
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

const StatusPageTab: FC = () => {
    useAdaptiveTheme();
    const [status, setStatus] = useState<StatusData | null>(null);
    const [components, setComponents] = useState<Component[]>([]);
    const [uptimeHistory, setUptimeHistory] = useState<UptimeEntry[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showIncidentForm, setShowIncidentForm] = useState(false);
    const [incidentForm, setIncidentForm] = useState({ title: '', description: '', severity: 'degraded' as const });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [s, uptime, inc] = await Promise.all([
                    fetchData('/api/status/public'),
                    fetchData('/api/status/uptime'),
                    fetchData('/api/status/incidents'),
                ]);
                setStatus(s);
                setComponents(s?.components || []);
                setUptimeHistory(uptime?.data || []);
                setIncidents(inc?.incidents || []);
                setError(null);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleCreateIncident = async () => {
        if (!incidentForm.title.trim()) {
            setError('Please enter an incident title');
            return;
        }
        setSubmitting(true);
        try {
            const result = await postData('/api/status/incidents', incidentForm);
            setIncidents([result, ...incidents]);
            setIncidentForm({ title: '', description: '', severity: 'degraded' });
            setShowIncidentForm(false);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResolveIncident = async (id: string) => {
        try {
            await putData(`/api/status/incidents/${id}`, { status: 'resolved' });
            setIncidents(incidents.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
            setError(null);
        } catch (e: any) {
            setError(e.message);
        }
    };

    if (loading) {
        return (
            <div className="p-5 text-center">
                <RefreshCw size={32} className="text-vigil-cyan mx-auto mb-4" style={{ animation: 'spin 1s linear infinite' }} />
                <div className="text-vigil-muted">Loading status page...</div>
            </div>
        );
    }

    const statusColor = status?.status === 'operational'
        ? 'text-vigil-emerald'
        : status?.status === 'degraded'
        ? 'text-vigil-amber'
        : 'text-vigil-rose';

    return (
        <div className="p-5 max-w-5xl mx-auto">
            <style>{`
                @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>

            {error && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-vigil-rose/10 border border-vigil-rose/30 text-vigil-rose text-xs mb-5 font-semibold">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Overall Status */}
            <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Globe size={32} className={statusColor} />
                        <div>
                            <div className="text-xs font-bold text-vigil-muted uppercase mb-1">
                                System Status
                            </div>
                            <div className={`text-2xl font-bold capitalize ${statusColor}`}>
                                {status?.status || 'Unknown'}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-vigil-muted mb-1">Uptime (30d)</div>
                        <div className="text-2xl font-bold text-vigil-cyan">{status?.uptime30d || 0}%</div>
                    </div>
                </div>

                {status?.lastUpdate && (
                    <div className="mt-4 flex items-center gap-1 text-xs text-vigil-muted">
                        <Clock size={12} />
                        Last updated: {fmtDate(status.lastUpdate)}
                    </div>
                )}

                <div className="mt-3 flex items-center gap-1.5 text-xs text-vigil-muted">
                    <Shield size={12} />
                    Public Status Page: <a href="#" className="text-vigil-cyan hover:underline">status.example.com</a>
                </div>
            </div>

            {/* Component Status */}
            <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                <div className="flex items-center gap-2.5 text-sm font-bold text-vigil-text mb-4">
                    <Shield size={18} />
                    Component Status
                </div>
                {components.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border-b border-vigil-accent/10 last:border-b-0">
                        <div className="flex items-center gap-3">
                            <StatusIndicator status={comp.status} />
                            <div>
                                <div className="text-xs font-bold text-vigil-text">{comp.name}</div>
                                <div className="text-xs text-vigil-muted">{comp.description}</div>
                            </div>
                        </div>
                        <div className="text-xs text-vigil-muted capitalize">
                            {comp.status}
                        </div>
                    </div>
                ))}
            </div>

            {/* Uptime History Chart */}
            {uptimeHistory.length > 0 && (
                <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5 mb-5">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-vigil-text mb-4">
                        <Clock size={18} />
                        Uptime History (Last 30 Days)
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={uptimeHistory}>
                            <XAxis dataKey="date" stroke={THEME.textDim} style={{ fontSize: 11 }} />
                            <YAxis stroke={THEME.textDim} style={{ fontSize: 11 }} domain={[0, 100]} />
                            <Tooltip content={<ChartTip />} />
                            <Bar dataKey="uptime" radius={[4, 4, 0, 0]}>
                                {uptimeHistory.map((entry, i) => (
                                    <Cell
                                        key={i}
                                        fill={entry.uptime > 99 ? THEME.success : entry.uptime > 95 ? THEME.warning : THEME.danger}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Incidents */}
            <div className="bg-vigil-surface border border-vigil-accent/10 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-vigil-text">
                        <AlertTriangle size={18} />
                        Incidents
                    </div>
                    <button
                        onClick={() => setShowIncidentForm(!showIncidentForm)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vigil-cyan/20 border border-vigil-cyan/40 text-vigil-cyan text-xs font-semibold hover:bg-vigil-cyan/30 transition-colors"
                    >
                        <PlusCircle size={14} />
                        Create Incident
                    </button>
                </div>

                {showIncidentForm && (
                    <div className="bg-vigil-accent/5 rounded-xl p-4 mb-4">
                        <div className="mb-3">
                            <div className="text-xs font-bold text-vigil-muted uppercase mb-2">Incident Title</div>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-vigil-surface border border-vigil-accent/10 rounded-lg text-vigil-text text-xs"
                                placeholder="e.g., Database connectivity issue"
                                value={incidentForm.title}
                                onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                            />
                        </div>

                        <div className="mb-3">
                            <div className="text-xs font-bold text-vigil-muted uppercase mb-2">Description</div>
                            <textarea
                                className="w-full px-3 py-2 bg-vigil-surface border border-vigil-accent/10 rounded-lg text-vigil-text text-xs min-h-20 resize-vertical"
                                placeholder="Describe the incident..."
                                value={incidentForm.description}
                                onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                            />
                        </div>

                        <div className="mb-4">
                            <div className="text-xs font-bold text-vigil-muted uppercase mb-2">Severity</div>
                            <select
                                className="w-full px-3 py-2 bg-vigil-surface border border-vigil-accent/10 rounded-lg text-vigil-text text-xs cursor-pointer"
                                value={incidentForm.severity}
                                onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value as 'degraded' | 'outage' })}
                            >
                                <option value="degraded">Degraded Performance</option>
                                <option value="outage">Outage</option>
                            </select>
                        </div>

                        <div className="flex gap-2.5">
                            <button
                                onClick={handleCreateIncident}
                                disabled={submitting}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vigil-cyan/20 border border-vigil-cyan/40 text-vigil-cyan text-xs font-semibold hover:bg-vigil-cyan/30 transition-colors disabled:opacity-50"
                            >
                                {submitting ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <PlusCircle size={12} />}
                                {submitting ? 'Creating...' : 'Create Incident'}
                            </button>
                            <button
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vigil-accent/5 border border-vigil-accent/10 text-vigil-muted text-xs font-semibold hover:bg-vigil-accent/10 transition-colors"
                                onClick={() => setShowIncidentForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {incidents.length > 0 ? (
                    incidents.map((incident, i) => (
                        <div key={i} className="bg-vigil-accent/5 border-l-4 border-vigil-amber rounded-lg p-3 mb-3">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-xs font-bold text-vigil-text mb-1">
                                        {incident.title}
                                    </div>
                                    <div className="text-xs text-vigil-muted">
                                        {fmtDate(incident.createdAt)}
                                    </div>
                                </div>
                                <div
                                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                                        incident.status === 'resolved'
                                            ? 'bg-vigil-emerald/20 text-vigil-emerald'
                                            : 'bg-vigil-rose/20 text-vigil-rose'
                                    }`}
                                >
                                    {incident.status}
                                </div>
                            </div>

                            {incident.description && (
                                <div className="text-xs text-vigil-muted mb-2">
                                    {incident.description}
                                </div>
                            )}

                            {incident.status !== 'resolved' && (
                                <button
                                    onClick={() => handleResolveIncident(incident.id)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-vigil-emerald/20 border border-vigil-emerald/40 text-vigil-emerald text-xs font-semibold hover:bg-vigil-emerald/30 transition-colors"
                                >
                                    <CheckCircle size={12} />
                                    Mark Resolved
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center p-5 text-vigil-muted text-xs">
                        No incidents reported
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusPageTab;
