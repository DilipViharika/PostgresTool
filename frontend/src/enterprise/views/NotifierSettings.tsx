// ==========================================================================
//  VIGIL — Notifier Settings View
// ==========================================================================
//  Admin surface for the multi-channel notifier stack (P1 / G1).
//  Backed by /api/enterprise/notifiers.
// ==========================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { Bell, PlusCircle, RefreshCw, Send, Trash2 } from 'lucide-react';
import { fetchData, postData, deleteData } from '../../utils/api';
import LicenseGate from '../components/LicenseGate';

type NotifierKind = 'pagerduty' | 'opsgenie' | 'teams' | 'webhook';

interface NotifierRow {
    id: string;
    kind: NotifierKind;
    label: string;
    enabled: boolean;
    lastUsedAt?: string | null;
    lastStatus?: 'ok' | 'failed' | 'pending' | null;
    createdAt?: string | null;
}

const KIND_LABELS: Record<NotifierKind, string> = {
    pagerduty: 'PagerDuty',
    opsgenie: 'Opsgenie',
    teams: 'Microsoft Teams',
    webhook: 'Generic Webhook',
};

const NotifierSettingsInner: React.FC = () => {
    const [rows, setRows] = useState<NotifierRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<{ kind: NotifierKind; label: string; config: string }>({
        kind: 'webhook',
        label: '',
        config: '{}',
    });

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchData('/api/enterprise/notifiers');
            setRows(data?.notifiers ?? []);
        } catch (err: any) {
            setError(err?.message || 'Failed to load notifiers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        try {
            let configObj: Record<string, unknown>;
            try {
                configObj = JSON.parse(form.config);
            } catch {
                setError('Config must be valid JSON');
                setCreating(false);
                return;
            }
            await postData('/api/enterprise/notifiers', {
                kind: form.kind,
                label: form.label,
                config: configObj,
            });
            setForm({ kind: 'webhook', label: '', config: '{}' });
            await refresh();
        } catch (err: any) {
            setError(err?.message || 'Failed to create notifier');
        } finally {
            setCreating(false);
        }
    };

    const handleTest = async (id: string) => {
        try {
            await postData(`/api/enterprise/notifiers/${id}/test`, {});
            await refresh();
        } catch (err: any) {
            setError(err?.message || 'Test failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this notifier?')) return;
        try {
            await deleteData(`/api/enterprise/notifiers/${id}`);
            await refresh();
        } catch (err: any) {
            setError(err?.message || 'Delete failed');
        }
    };

    return (
        <div className="p-6 space-y-6 text-vigil-text">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-vigil-accent" aria-hidden />
                    <h1 className="text-xl font-semibold">Notifier settings</h1>
                </div>
                <button
                    onClick={refresh}
                    className="flex items-center gap-1 px-3 py-1 border border-vigil-border rounded text-sm hover:bg-vigil-elevated"
                    aria-label="Refresh notifier list"
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

            <section aria-label="Configured notifiers">
                <h2 className="text-sm font-medium mb-2 text-vigil-muted">Configured</h2>
                {loading ? (
                    <p className="text-sm text-vigil-muted">Loading…</p>
                ) : rows.length === 0 ? (
                    <p className="text-sm text-vigil-muted">
                        No notifiers configured yet. Add one below.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-vigil-border rounded">
                            <thead className="bg-vigil-surface-alt text-vigil-muted">
                                <tr>
                                    <th className="text-left p-2">Label</th>
                                    <th className="text-left p-2">Kind</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-left p-2">Last used</th>
                                    <th className="text-right p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.id} className="border-t border-vigil-border">
                                        <td className="p-2 font-mono">{r.label}</td>
                                        <td className="p-2">{KIND_LABELS[r.kind]}</td>
                                        <td className="p-2">
                                            {r.lastStatus ?? (r.enabled ? 'enabled' : 'disabled')}
                                        </td>
                                        <td className="p-2 text-vigil-muted">
                                            {r.lastUsedAt ?? '—'}
                                        </td>
                                        <td className="p-2 text-right space-x-2 whitespace-nowrap">
                                            <button
                                                onClick={() => handleTest(r.id)}
                                                className="inline-flex items-center gap-1 px-2 py-1 border border-vigil-border rounded text-xs hover:bg-vigil-elevated"
                                                aria-label={`Send test to ${r.label}`}
                                            >
                                                <Send className="w-3 h-3" /> Test
                                            </button>
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                className="inline-flex items-center gap-1 px-2 py-1 border border-vigil-rose/40 rounded text-xs text-vigil-rose hover:bg-vigil-rose/10"
                                                aria-label={`Remove ${r.label}`}
                                            >
                                                <Trash2 className="w-3 h-3" /> Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section aria-label="Add notifier">
                <h2 className="text-sm font-medium mb-2 flex items-center gap-1 text-vigil-muted">
                    <PlusCircle className="w-4 h-4" /> Add a notifier
                </h2>
                <form onSubmit={handleCreate} className="space-y-2 max-w-xl">
                    <div className="flex gap-2">
                        <label className="sr-only" htmlFor="notifier-kind">Kind</label>
                        <select
                            id="notifier-kind"
                            value={form.kind}
                            onChange={(e) =>
                                setForm({ ...form, kind: e.target.value as NotifierKind })
                            }
                            className="border border-vigil-border rounded p-2 text-sm bg-vigil-surface text-vigil-text"
                        >
                            <option value="webhook">Webhook</option>
                            <option value="teams">Teams</option>
                            <option value="pagerduty">PagerDuty</option>
                            <option value="opsgenie">Opsgenie</option>
                        </select>
                        <label className="sr-only" htmlFor="notifier-label">Label</label>
                        <input
                            id="notifier-label"
                            value={form.label}
                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                            placeholder="Label (e.g. prod-pager)"
                            className="flex-1 border border-vigil-border rounded p-2 text-sm bg-vigil-surface text-vigil-text"
                            required
                        />
                    </div>
                    <label className="sr-only" htmlFor="notifier-config">Config JSON</label>
                    <textarea
                        id="notifier-config"
                        value={form.config}
                        onChange={(e) => setForm({ ...form, config: e.target.value })}
                        placeholder='Config JSON (e.g. {"url":"https://...","secret":"..."})'
                        rows={4}
                        className="w-full border border-vigil-border rounded p-2 text-xs font-mono bg-vigil-surface text-vigil-text"
                    />
                    <button
                        type="submit"
                        disabled={creating}
                        className="px-3 py-1 bg-vigil-accent text-vigil-bg rounded text-sm disabled:opacity-50 font-medium"
                    >
                        {creating ? 'Creating…' : 'Create'}
                    </button>
                </form>
            </section>
        </div>
    );
};

const NotifierSettings: React.FC = () => (
    <LicenseGate feature="notifiers_webhook">
        <NotifierSettingsInner />
    </LicenseGate>
);

export default NotifierSettings;
