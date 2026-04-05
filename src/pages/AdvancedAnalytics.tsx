import React, { useCallback, useMemo } from 'react';
import { useToast } from '../components/ToastProvider';
import { formatBdt } from '../lib/currency';
import RetentionSection from '../components/analytics/RetentionSection';
import { buildReminderMessage, RetentionMember } from '../lib/retention';
import { StatCard } from '../components/analytics/StatCard';
import { BarChart } from '../components/analytics/BarChart';
import { InsightsCard } from '../components/analytics/InsightsCard';
import { StatusCard } from '../components/analytics/StatusCard';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { EmptyState } from '../components/ui/EmptyState';

export default function AdvancedAnalytics() {
  const { showToast } = useToast();
  const { loading, analytics } = useAnalyticsData();

  const copyReminder = useCallback(
    async (member: RetentionMember) => {
      const message = buildReminderMessage(member);
      try {
        await navigator.clipboard.writeText(message);
        showToast(`Reminder copied for ${member.name}.`, 'success');
      } catch {
        showToast('Failed to copy reminder.', 'error');
      }
    },
    [showToast]
  );

  const cards = useMemo(
    () => [
      {
        title: 'Total Members',
        value: analytics.totals.totalMembers.toLocaleString(),
        icon: 'groups',
        iconClassName: 'bg-primary-default/10 text-primary-default',
        trend: analytics.trends.totalMembers,
      },
      {
        title: 'Active Members',
        value: analytics.totals.activeMembers.toLocaleString(),
        icon: 'check_circle',
        iconClassName: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
        trend: analytics.trends.activeMembers,
      },
      {
        title: 'Total Check-ins',
        value: analytics.totals.totalCheckins.toLocaleString(),
        icon: 'fact_check',
        iconClassName: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
        trend: analytics.trends.totalCheckins,
      },
      {
        title: 'Total Revenue',
        value: formatBdt(analytics.totals.totalRevenue),
        icon: 'payments',
        iconClassName: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
        trend: analytics.trends.totalRevenue,
      },
    ],
    [analytics]
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-display font-extrabold tracking-tight text-neutral-text dark:text-white lg:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Performance metrics and insights for your gym
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={loading ? '—' : card.value}
            icon={card.icon}
            iconClassName={card.iconClassName}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl lg:col-span-2">
          <div className="mb-8">
            <h4 className="text-lg font-bold">Weekly Check-ins</h4>
            <p className="text-xs text-slate-400">Last 7 days attendance volume</p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-4 border-primary-default border-t-transparent" />
            </div>
          ) : analytics.hasCheckinData ? (
            <BarChart
              title="Weekly Check-ins"
              subtitle="Last 7 days attendance volume"
              points={analytics.charts.weeklyCheckins}
              valueFormatter={(value) => value.toString()}
              accentClassName={(point, maxValue) =>
                point.value === maxValue
                  ? 'bg-primary-default shadow-lg shadow-primary-default/30'
                  : 'bg-slate-700 group-hover:bg-primary-default/60'
              }
            />
          ) : (
            <EmptyState icon="insights" title="No data yet" description="Start by adding members or recording attendance" />
          )}
        </div>

        <InsightsCard
          insights={analytics.insights}
          newMembersLast7Days={analytics.memberStatus.newMembersLast7Days}
          newMembersTrend={analytics.trends.newMembers}
          hasAnyData={analytics.hasAnyData}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl lg:col-span-2">
          <div className="mb-8">
            <h4 className="text-lg font-bold">Revenue</h4>
            <p className="text-xs text-slate-400">Last 7 days collected revenue</p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-4 border-primary-default border-t-transparent" />
            </div>
          ) : analytics.hasRevenueData ? (
            <BarChart
              title="Revenue"
              subtitle="Last 7 days collected revenue"
              points={analytics.charts.weeklyRevenue}
              valueFormatter={(value) => formatBdt(value).replace('BDT ', '')}
              accentClassName={(point, maxValue) =>
                point.value === maxValue
                  ? 'bg-amber-500 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-700 group-hover:bg-amber-500/60'
              }
            />
          ) : (
           <EmptyState icon="insights" title="No data yet" description="Start by adding members or recording attendance" />
          )}
        </div>

        <StatusCard
          totalMembers={analytics.memberStatus.totalMembers}
          activeMembers={analytics.memberStatus.activeMembers}
          inactiveMembers={analytics.memberStatus.inactiveMembers}
          hasAnyData={analytics.hasAnyData}
        />
      </div>

      <RetentionSection
        hasAnyData={analytics.hasAnyData}
        inactiveCount={analytics.retention.inactiveCount}
        missingThisWeekCount={analytics.retention.missingThisWeekCount}
        atRiskCount={analytics.retention.atRiskCount}
        members={analytics.retention.members}
        insights={analytics.retention.insights}
        onCopyReminder={copyReminder}
      />
    </div>
  );
}
