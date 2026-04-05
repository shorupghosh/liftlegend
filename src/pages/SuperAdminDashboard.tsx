import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/PageLoader';
import { GymActionMenu } from '../components/super-admin/GymActionMenu';
import { GymStatusBadge } from '../components/super-admin/GymStatusBadge';
import {
  applyTenantFilters,
  fetchTenantSummaries,
  softDeleteGym,
  startImpersonation,
  updateGymLifecycleStatus,
} from '../lib/superAdmin';
import type { GymLifecycleStatus, TenantFilter, TenantSort, TenantSummary } from '../types/superAdmin';

type ConfirmState = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
};

const initialConfirm: ConfirmState = {
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  onConfirm: () => undefined,
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busyGymId, setBusyGymId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TenantFilter>('ALL');
  const [sort, setSort] = useState<TenantSort>('newest');
  const [gyms, setGyms] = useState<TenantSummary[]>([]);
  const [overview, setOverview] = useState({
    totalGyms: 0,
    activeGyms: 0,
    trialGyms: 0,
    suspendedGyms: 0,
    activeSubscriptions: 0,
    mrr: 0,
    totalMembers: 0,
    churnedGyms: 0,
  });
  const [alerts, setAlerts] = useState<Array<{ id: string; title: string; description: string; severity: 'info' | 'warning' | 'critical'; gymId?: string }>>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(initialConfirm);

  const loadData = async () => {
    setLoading(true);
    try {
      const payload = await fetchTenantSummaries();
      setGyms(payload.gyms);
      setOverview(payload.overview);
      setAlerts(payload.alerts.slice(0, 8));
    } catch (error) {
      console.error('Error fetching super admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGyms = useMemo(() => applyTenantFilters(gyms, search, filter, sort), [gyms, search, filter, sort]);

  const withBusy = async (gymId: string, action: () => Promise<void>) => {
    setBusyGymId(gymId);
    try {
      await action();
      await loadData();
    } finally {
      setBusyGymId(null);
    }
  };

  const openStatusConfirm = (gym: TenantSummary, nextStatus: GymLifecycleStatus) => {
    const labelMap: Record<GymLifecycleStatus, string> = {
      ACTIVE: 'Activate Gym',
      TRIAL: 'Set Trial',
      SUSPENDED: 'Suspend Gym',
      EXPIRED: 'Expire Gym',
      DELETED: 'Delete Gym',
      LOCKED: 'Suspend Gym',
      PAST_DUE: 'Expire Gym',
    } as Record<GymLifecycleStatus, string>;

    setConfirmState({
      isOpen: true,
      title: labelMap[nextStatus] || 'Update Gym',
      message:
        nextStatus === 'SUSPENDED'
          ? `Suspend ${gym.name}? Suspended gyms will no longer access the app normally.`
          : `Activate ${gym.name}? This gym will be able to use the app normally again.`,
      confirmLabel: nextStatus === 'SUSPENDED' ? 'Suspend' : 'Activate',
      onConfirm: async () => {
        setConfirmState(initialConfirm);
        await withBusy(gym.id, async () => {
          await updateGymLifecycleStatus(gym, nextStatus);
        });
      },
    });
  };

  const openDeleteConfirm = (gym: TenantSummary) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Gym',
      message: `Soft delete ${gym.name}? This requires confirmation and should only be used for tenant removal.`,
      confirmLabel: 'Delete Gym',
      onConfirm: async () => {
        setConfirmState(initialConfirm);
        await withBusy(gym.id, async () => {
          await softDeleteGym(gym);
        });
      },
    });
  };

  const statCards = [
    { label: 'Total Gyms', value: overview.totalGyms, icon: 'apartment', accent: 'text-primary-default', helper: 'All tenants on the platform' },
    { label: 'Active Gyms', value: overview.activeGyms, icon: 'check_circle', accent: 'text-emerald-500', helper: 'Currently active subscriptions' },
    { label: 'MRR', value: `৳${overview.mrr.toLocaleString()}`, icon: 'payments', accent: 'text-blue-500', helper: 'Last 30 days recurring revenue' },
    { label: 'Trial Gyms', value: overview.trialGyms, icon: 'rocket_launch', accent: 'text-amber-500', helper: 'Trial accounts in progress' },
    { label: 'Suspended', value: overview.suspendedGyms, icon: 'pause_circle', accent: 'text-red-500', helper: 'Require support follow-up' },
    { label: 'Total Members', value: overview.totalMembers, icon: 'group', accent: 'text-slate-700 dark:text-slate-200', helper: 'Members across all tenants' },
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Platform Control Center</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor, support, and control all gym tenants from one operational dashboard.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                <p className={`mt-2 text-2xl font-black ${card.accent}`}>{loading ? '—' : card.value}</p>
              </div>
              <span className={`material-symbols-outlined text-2xl ${card.accent}`}>{card.icon}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-lg font-bold text-neutral-text dark:text-white">Tenant Directory</h2>
            <p className="text-xs text-slate-500">Search, filter, and control every gym tenant.</p>
          </div>

          <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search gym name or owner email..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as TenantFilter)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="ALL">All</option>
              <option value="TRIAL">Trial</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
              <option value="LIMIT_REACHED">Limit Reached</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as TenantSort)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="newest">Newest</option>
              <option value="most_members">Most Members</option>
              <option value="highest_revenue">Highest Revenue</option>
              <option value="recent_activity">Recent Activity</option>
            </select>
          </div>

          {loading ? (
            <div className="p-5"><PageLoader label="Loading tenant controls..." /></div>
          ) : filteredGyms.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon="apartment"
                title="No gyms match this view"
                description="Try a different search or filter to find the tenant you need."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Gym</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden xl:table-cell">Owner</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Usage</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Revenue</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Plan</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Last Activity</th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredGyms.map((gym) => (
                    <tr key={gym.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-default/10 font-bold text-primary-default">
                            {gym.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <Link to={`/super-admin/gyms/${gym.id}`} className="text-sm font-bold text-neutral-text hover:text-primary-default dark:text-white">
                              {gym.name}
                            </Link>
                            <p className="text-xs text-slate-500">{new Date(gym.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden xl:table-cell">
                        <p className="text-sm font-medium text-neutral-text dark:text-white">{gym.ownerEmail || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{gym.contactPhone || 'No phone'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-neutral-text dark:text-white">{gym.usage.memberCount} members • {gym.usage.staffCount} staff</p>
                        {gym.usage.limitWarnings.length > 0 ? (
                          <p className="text-xs font-bold text-amber-600 dark:text-amber-300">{gym.usage.limitWarnings.join(' • ')}</p>
                        ) : (
                          <p className="text-xs text-slate-500">{gym.usage.checkinsThisWeek} check-ins this week</p>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">৳{gym.usage.revenueMonth.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">MRR snapshot</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-neutral-text dark:text-white">{gym.subscriptionTier || 'BASIC'}</p>
                        <p className="text-xs text-slate-500">{gym.trialEndsAt ? `Trial ends ${new Date(gym.trialEndsAt).toLocaleDateString()}` : 'Subscription active'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <GymStatusBadge status={gym.status} />
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-sm text-slate-500">
                        {gym.usage.lastActivityAt ? new Date(gym.usage.lastActivityAt).toLocaleDateString() : 'No recent activity'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <GymActionMenu
                          isBusy={busyGymId === gym.id}
                          canActivate={gym.status !== 'ACTIVE'}
                          canSuspend={gym.status !== 'SUSPENDED' && gym.status !== 'DELETED'}
                          onView={() => navigate(`/super-admin/gyms/${gym.id}`)}
                          onImpersonate={() => withBusy(gym.id, async () => {
                            await startImpersonation(gym);
                            window.location.href = '/admin';
                          })}
                          onSuspend={() => openStatusConfirm(gym, 'SUSPENDED')}
                          onActivate={() => openStatusConfirm(gym, 'ACTIVE')}
                          onDelete={() => openDeleteConfirm(gym)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-neutral-text dark:text-white">Action Center</h2>
              <p className="text-xs text-slate-500">Platform-wide alerts that need attention.</p>
            </div>
            <div className="space-y-3 p-5">
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-500">No urgent platform alerts right now.</p>
              ) : (
                alerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => alert.gymId && navigate(`/super-admin/gyms/${alert.gymId}`)}
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                      alert.severity === 'critical'
                        ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20'
                        : alert.severity === 'warning'
                          ? 'border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20'
                          : 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20'
                    }`}
                  >
                    <p className="text-sm font-bold text-neutral-text dark:text-white">{alert.title}</p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{alert.description}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-neutral-text dark:text-white">Support Snapshot</h2>
            </div>
            <div className="space-y-4 p-5 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Active subscriptions</span>
                <span className="font-bold text-neutral-text dark:text-white">{overview.activeSubscriptions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Churned or expired</span>
                <span className="font-bold text-neutral-text dark:text-white">{overview.churnedGyms}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Trials ending soon</span>
                <span className="font-bold text-neutral-text dark:text-white">{alerts.filter((alert) => alert.id.startsWith('trial-')).length}</span>
              </div>
              <Link to="/super-admin/subscriptions" className="inline-flex items-center gap-2 font-bold text-primary-default hover:underline">
                Manage subscriptions
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        onConfirm={() => void confirmState.onConfirm()}
        onCancel={() => setConfirmState(initialConfirm)}
      />
    </div>
  );
}
