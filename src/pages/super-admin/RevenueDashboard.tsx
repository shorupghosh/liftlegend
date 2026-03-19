import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/PageLoader';
import { fetchTenantSummaries } from '../../lib/superAdmin';
import { formatBdt } from '../../lib/currency';
import type { TenantSummary } from '../../types/superAdmin';

export default function RevenueDashboard() {
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState<TenantSummary[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const payload = await fetchTenantSummaries();
        setGyms(payload.gyms);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    const activeGyms = gyms.filter((gym) => gym.status === 'ACTIVE' || gym.status === 'TRIAL');
    const mrr = gyms.reduce((sum, gym) => sum + gym.usage.revenueMonth, 0);
    return {
      totalGyms: gyms.length,
      activeGyms: activeGyms.length,
      mrr,
      arr: mrr * 12,
      avgRevenuePerGym: gyms.length ? mrr / gyms.length : 0,
      suspendedGyms: gyms.filter((gym) => gym.status === 'SUSPENDED').length,
      activeSubscriptions: activeGyms.length,
      trialGyms: gyms.filter((gym) => gym.status === 'TRIAL').length,
    };
  }, [gyms]);

  const sortedGyms = useMemo(() => [...gyms].sort((a, b) => b.usage.revenueMonth - a.usage.revenueMonth).slice(0, 10), [gyms]);
  const maxRevenue = Math.max(...sortedGyms.map((gym) => gym.usage.revenueMonth), 1);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Revenue Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform-wide SaaS revenue and subscription health metrics.</p>
      </div>

      {loading ? (
        <PageLoader label="Loading platform revenue..." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'MRR', value: formatBdt(metrics.mrr), icon: 'payments' },
              { label: 'Projected ARR', value: formatBdt(metrics.arr), icon: 'calendar_month' },
              { label: 'Active Subscriptions', value: metrics.activeSubscriptions, icon: 'card_membership' },
              { label: 'Avg Revenue / Gym', value: formatBdt(metrics.avgRevenuePerGym), icon: 'query_stats' },
              { label: 'Total Gyms', value: metrics.totalGyms, icon: 'apartment' },
              { label: 'Active Gyms', value: metrics.activeGyms, icon: 'check_circle' },
              { label: 'Trial Gyms', value: metrics.trialGyms, icon: 'rocket_launch' },
              { label: 'Suspended / Churned', value: metrics.suspendedGyms, icon: 'pause_circle' },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                  <span className="material-symbols-outlined text-xl text-primary-default">{card.icon}</span>
                </div>
                <p className="mt-3 text-2xl font-black text-neutral-text dark:text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-neutral-text dark:text-white">Top Revenue Gyms</h2>
              <p className="text-xs text-slate-500">Sorted by monthly recurring revenue estimate.</p>
            </div>
            {sortedGyms.length === 0 ? (
              <div className="p-5">
                <EmptyState icon="payments" title="No revenue data yet" description="Once gyms start collecting payments, revenue rankings will appear here." />
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedGyms.map((gym, index) => (
                  <div key={gym.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-default/10 text-sm font-black text-primary-default">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-neutral-text dark:text-white">{gym.name}</p>
                      <p className="text-xs text-slate-500">{gym.usage.memberCount} members • {gym.subscriptionTier || 'BASIC'}</p>
                    </div>
                    <div className="hidden max-w-[220px] flex-1 sm:block">
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-primary-default" style={{ width: `${(gym.usage.revenueMonth / maxRevenue) * 100}%` }} />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatBdt(gym.usage.revenueMonth)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
