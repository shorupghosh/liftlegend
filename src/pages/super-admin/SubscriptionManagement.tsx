import React, { useEffect, useMemo, useState } from 'react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/PageLoader';
import { GymStatusBadge } from '../../components/super-admin/GymStatusBadge';
import { fetchSubscriptionHistory, fetchTenantSummaries, updateGymSubscription } from '../../lib/superAdmin';
import type { GymLifecycleStatus, SubscriptionHistoryEntry, TenantSummary } from '../../types/superAdmin';

const planOptions = ['BASIC', 'ADVANCED', 'PREMIUM'];

export default function SubscriptionManagement() {
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState<TenantSummary[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'EXPIRED'>('ALL');
  const [historyGymId, setHistoryGymId] = useState<string | null>(null);
  const [history, setHistory] = useState<SubscriptionHistoryEntry[]>([]);
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => Promise<void> }>({
    open: false,
    title: '',
    message: '',
    onConfirm: async () => undefined,
  });

  const load = async () => {
    setLoading(true);
    try {
      const payload = await fetchTenantSummaries();
      setGyms(payload.gyms);
    } catch (error) {
      console.error('Error fetching gyms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!historyGymId) return;
      const entries = await fetchSubscriptionHistory(historyGymId);
      setHistory(entries);
    };
    void loadHistory();
  }, [historyGymId]);

  const filteredGyms = useMemo(() => (filter === 'ALL' ? gyms : gyms.filter((gym) => gym.status === filter)), [filter, gyms]);

  const statusCounts = {
    ALL: gyms.length,
    ACTIVE: gyms.filter((gym) => gym.status === 'ACTIVE').length,
    TRIAL: gyms.filter((gym) => gym.status === 'TRIAL').length,
    SUSPENDED: gyms.filter((gym) => gym.status === 'SUSPENDED').length,
    EXPIRED: gyms.filter((gym) => gym.status === 'EXPIRED').length,
  };

  const setStatus = (gym: TenantSummary, status: GymLifecycleStatus, title: string, message: string) => {
    setConfirmState({
      open: true,
      title,
      message,
      onConfirm: async () => {
        await updateGymSubscription(gym, { status });
        setConfirmState((current) => ({ ...current, open: false }));
        await load();
      },
    });
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Subscription Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Adjust plan tiers, extend trials, and reactivate subscriptions.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              filter === status ? 'bg-primary-default text-white shadow-lg shadow-primary-default/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {status} ({count})
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader label="Loading subscriptions..." />
      ) : filteredGyms.length === 0 ? (
        <EmptyState icon="card_membership" title="No subscriptions match this filter" description="Try another status tab to inspect a different subscription segment." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.7fr,1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Gym</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Plan</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Trial / Billing</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredGyms.map((gym) => (
                    <tr key={gym.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-neutral-text dark:text-white">{gym.name}</p>
                        <p className="text-xs text-slate-500">{gym.ownerEmail || 'Unknown owner'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={gym.subscriptionTier || 'BASIC'}
                          onChange={async (event) => {
                            await updateGymSubscription(gym, { tier: event.target.value });
                            await load();
                          }}
                          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-900"
                        >
                          {planOptions.map((plan) => (
                            <option key={plan} value={plan}>{plan}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <GymStatusBadge status={gym.status} />
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-sm text-slate-500">
                        {gym.trialEndsAt ? `Trial ends ${new Date(gym.trialEndsAt).toLocaleDateString()}` : gym.nextBillingDate ? `Billing ${new Date(gym.nextBillingDate).toLocaleDateString()}` : 'No billing date'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setStatus(gym, 'ACTIVE', 'Reactivate Subscription', `Reactivate ${gym.name} and restore normal access?`)}
                            className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                          >
                            Reactivate
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(gym, 'SUSPENDED', 'Cancel Subscription', `Suspend ${gym.name} and stop normal gym access?`)}
                            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const nextDate = new Date(gym.trialEndsAt || new Date().toISOString());
                              nextDate.setDate(nextDate.getDate() + 14);
                              await updateGymSubscription(gym, { trialEndsAt: nextDate.toISOString() });
                              await load();
                            }}
                            className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            Extend Trial
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryGymId(gym.id)}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          >
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-neutral-text dark:text-white">Subscription History</h2>
              <p className="text-xs text-slate-500">Audit-backed changes for the selected gym.</p>
            </div>
            <div className="space-y-3 p-5">
              {!historyGymId ? (
                <p className="text-sm text-slate-500">Select “History” on a gym to inspect changes.</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-slate-500">No subscription history found for this gym yet.</p>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <p className="text-sm font-bold text-neutral-text dark:text-white">{entry.action}</p>
                    <p className="mt-1 text-xs text-slate-500">{entry.actor} • {new Date(entry.timestamp).toLocaleString()}</p>
                    <p className="mt-1 text-xs text-slate-400">{entry.tier || entry.status || 'No metadata'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={confirmState.open} title={confirmState.title} message={confirmState.message} confirmLabel="Confirm" requireVerification="CONFIRM" isDestructive={true} onConfirm={() => void confirmState.onConfirm()} onCancel={() => setConfirmState((current) => ({ ...current, open: false }))} />
    </div>
  );
}