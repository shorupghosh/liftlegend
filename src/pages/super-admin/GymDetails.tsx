import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/PageLoader';
import { GymStatusBadge } from '../../components/super-admin/GymStatusBadge';
import { formatBdt } from '../../lib/currency';
import { fetchGymDetails } from '../../lib/superAdmin';
import type { GymDetailsPayload } from '../../types/superAdmin';

export default function GymDetails() {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<GymDetailsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!gymId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGymDetails(gymId);
        setDetails(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load gym details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gymId]);

  if (loading) {
    return <div className="p-6 lg:p-8"><PageLoader label="Loading gym details..." /></div>;
  }

  if (!details || error) {
    return (
      <div className="p-6 lg:p-8">
        <EmptyState
          icon="apartment"
          title="Gym details unavailable"
          description={error || 'This gym could not be loaded.'}
          actionLabel="Back to platform overview"
          onAction={() => navigate('/super-admin')}
        />
      </div>
    );
  }

  const statCards = [
    { label: 'Members', value: details.usage.memberCount },
    { label: 'Staff', value: details.usage.staffCount },
    { label: 'Revenue', value: formatBdt(details.usage.revenueMonth) },
    { label: 'Check-ins This Week', value: details.usage.checkinsThisWeek },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link to="/super-admin" className="inline-flex items-center gap-2 text-sm font-bold text-primary-default hover:underline">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Platform Overview
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-neutral-text dark:text-white lg:text-3xl">{details.name}</h1>
            <GymStatusBadge status={details.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Owner: {details.ownerEmail || 'Unknown'} • Plan: {details.subscriptionTier || 'BASIC'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-black text-neutral-text dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <h2 className="text-lg font-bold text-neutral-text dark:text-white">Gym Snapshot</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Created</p>
              <p className="mt-1 text-sm font-semibold text-neutral-text dark:text-white">{new Date(details.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Trial End</p>
              <p className="mt-1 text-sm font-semibold text-neutral-text dark:text-white">{details.trialEndsAt ? new Date(details.trialEndsAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Last Activity</p>
              <p className="mt-1 text-sm font-semibold text-neutral-text dark:text-white">{details.usage.lastActivityAt ? new Date(details.usage.lastActivityAt).toLocaleString() : 'No recent activity'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Staff</p>
              <p className="mt-1 text-sm font-semibold text-neutral-text dark:text-white">{details.usage.activeStaffCount}</p>
            </div>
          </div>

          {details.usage.limitWarnings.length > 0 ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Plan usage warning</p>
              <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">{details.usage.limitWarnings.join(' • ')}</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-neutral-text dark:text-white">Latest Notifications</h2>
          <div className="mt-4 space-y-3">
            {details.latestNotifications.length === 0 ? (
              <p className="text-sm text-slate-500">No platform notifications.</p>
            ) : (
              details.latestNotifications.map((notification) => (
                <div key={notification.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-bold text-neutral-text dark:text-white">{notification.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{notification.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-lg font-bold text-neutral-text dark:text-white">Recent Payments</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {details.recentPayments.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No recent payments for this gym.</p>
            ) : (
              details.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-text dark:text-white">{payment.memberName}</p>
                    <p className="text-xs text-slate-500">{payment.planName} • {payment.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatBdt(payment.amount)}</p>
                    <p className="text-xs text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-lg font-bold text-neutral-text dark:text-white">Recent Staff Actions</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {details.recentStaffActions.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No recent admin actions logged yet.</p>
            ) : (
              details.recentStaffActions.map((entry) => (
                <div key={entry.id} className="px-5 py-4">
                  <p className="text-sm font-semibold text-neutral-text dark:text-white">{entry.action}</p>
                  <p className="mt-1 text-xs text-slate-500">{entry.actor} • {new Date(entry.timestamp).toLocaleString()}</p>
                  {entry.metadata ? <p className="mt-1 text-xs text-slate-400">{entry.metadata}</p> : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
