import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatBdt } from '../lib/currency';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useDemoMode } from '../hooks/useDemoMode';
import { useToast } from '../components/ToastProvider';
import RetentionSection from '../components/analytics/RetentionSection';
import {
  buildReminderMessage,
  classifyRetentionStatus,
  getInactivityDays,
  getMembershipState,
  RetentionMember,
  RETENTION_LOOKBACK_DAYS,
} from '../lib/retention';

type ChartPoint = {
  key: string;
  label: string;
  value: number;
};

type TrendMeta = {
  value: number;
  positive: boolean;
  neutral: boolean;
};

type AnalyticsState = {
  totals: {
    totalMembers: number;
    activeMembers: number;
    totalCheckins: number;
    totalRevenue: number;
  };
  trends: {
    totalMembers: TrendMeta;
    activeMembers: TrendMeta;
    totalCheckins: TrendMeta;
    totalRevenue: TrendMeta;
    newMembers: TrendMeta;
  };
  charts: {
    weeklyCheckins: ChartPoint[];
    weeklyRevenue: ChartPoint[];
  };
  memberStatus: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    newMembersLast7Days: number;
  };
  insights: string[];
  retention: {
    inactiveCount: number;
    missingThisWeekCount: number;
    atRiskCount: number;
    members: RetentionMember[];
    insights: string[];
  };
  hasCheckinData: boolean;
  hasRevenueData: boolean;
  hasAnyData: boolean;
};

type RevenueRow = {
  created_at?: string;
  payment_date?: string;
  paid_at?: string;
  date?: string;
  price_paid?: number | string | null;
  amount?: number | string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const initialState: AnalyticsState = {
  totals: {
    totalMembers: 0,
    activeMembers: 0,
    totalCheckins: 0,
    totalRevenue: 0,
  },
  trends: {
    totalMembers: { value: 0, positive: false, neutral: true },
    activeMembers: { value: 0, positive: false, neutral: true },
    totalCheckins: { value: 0, positive: false, neutral: true },
    totalRevenue: { value: 0, positive: false, neutral: true },
    newMembers: { value: 0, positive: false, neutral: true },
  },
  charts: {
    weeklyCheckins: [],
    weeklyRevenue: [],
  },
  memberStatus: {
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    newMembersLast7Days: 0,
  },
  insights: [],
  retention: {
    inactiveCount: 0,
    missingThisWeekCount: 0,
    atRiskCount: 0,
    members: [],
    insights: [],
  },
  hasCheckinData: false,
  hasRevenueData: false,
  hasAnyData: false,
};

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatShortDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function buildDaySeries(days: number, endDate = new Date()): ChartPoint[] {
  const today = startOfDay(endDate);
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - (days - 1));
    return {
      key: formatDateKey(date),
      label: formatShortDay(date),
      value: 0,
    };
  });
}

function sumValues(items: ChartPoint[]): number {
  return items.reduce((sum, item) => sum + item.value, 0);
}

function calculateTrend(current: number, previous: number): TrendMeta {
  if (current === 0 && previous === 0) {
    return { value: 0, positive: false, neutral: true };
  }

  if (previous === 0) {
    return { value: 100, positive: true, neutral: false };
  }

  const raw = ((current - previous) / previous) * 100;
  const rounded = Math.round(raw);

  if (rounded === 0) {
    return { value: 0, positive: false, neutral: true };
  }

  return {
    value: Math.abs(rounded),
    positive: rounded > 0,
    neutral: false,
  };
}

function trendLabel(trend: TrendMeta): string {
  if (trend.neutral) {
    return '0%';
  }

  return `${trend.positive ? '+' : '-'}${trend.value}%`;
}

function fillSeriesFromRecords(
  series: ChartPoint[],
  records: Array<{ date: string; value: number }>
): ChartPoint[] {
  const map = new Map(series.map((point) => [point.key, point.value]));

  records.forEach((record) => {
    if (map.has(record.date)) {
      map.set(record.date, (map.get(record.date) || 0) + record.value);
    }
  });

  return series.map((point) => ({
    ...point,
    value: map.get(point.key) || 0,
  }));
}

function getDateStringFromRevenueRow(row: RevenueRow): string | null {
  const raw = row.created_at || row.payment_date || row.paid_at || row.date;
  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatDateKey(parsed);
}

function getRevenueValue(row: RevenueRow): number {
  return Number(row.price_paid ?? row.amount ?? 0);
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
        <span className="material-symbols-outlined">insights</span>
      </div>
      <p className="text-base font-bold text-white">{title}</p>
      <p className="mt-2 max-w-xs text-sm text-slate-400">{message}</p>
    </div>
  );
}

function TrendBadge({ trend }: { trend: TrendMeta }) {
  const className = trend.neutral
    ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
    : trend.positive
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${className}`}>
      {trendLabel(trend)}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClassName,
  trend,
}: {
  title: string;
  value: string | number;
  icon: string;
  iconClassName: string;
  trend: TrendMeta;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className={`flex size-11 items-center justify-center rounded-xl ${iconClassName}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <TrendBadge trend={trend} />
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-black text-neutral-text dark:text-white">{value}</h3>
      <p className="mt-2 text-xs text-slate-400">Current 7 days vs previous 7 days</p>
    </div>
  );
}

function BarChart({
  title,
  subtitle,
  points,
  accentClassName,
  valueFormatter,
}: {
  title: string;
  subtitle: string;
  points: ChartPoint[];
  accentClassName: (point: ChartPoint, maxValue: number) => string;
  valueFormatter: (value: number) => string;
}) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="flex h-64 items-end justify-between gap-3">
      {points.map((point) => {
        const height = Math.max((point.value / maxValue) * 100, point.value > 0 ? 10 : 5);
        return (
          <div key={point.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-bold text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
              {valueFormatter(point.value)}
            </span>
            <div
              className={`w-full rounded-t-md transition-all duration-300 ${accentClassName(point, maxValue)}`}
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] font-bold text-slate-500">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function InsightsCard({
  insights,
  newMembersLast7Days,
  newMembersTrend,
  hasAnyData,
}: {
  insights: string[];
  newMembersLast7Days: number;
  newMembersTrend: TrendMeta;
  hasAnyData: boolean;
}) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold">Insights</h4>
          <p className="text-xs text-slate-400">Decision signals from the last 7 days</p>
        </div>
        <TrendBadge trend={newMembersTrend} />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">New Members</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <span className="text-3xl font-black text-white">{newMembersLast7Days}</span>
          <span className="text-xs text-slate-400">Last 7 days</span>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-700 px-4 py-6 text-center">
          <p className="font-bold text-white">No data yet</p>
          <p className="mt-2 text-sm text-slate-400">Start by adding members or recording attendance</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {insights.map((insight) => (
            <div key={insight} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
              <span className="material-symbols-outlined mt-0.5 text-base text-primary-default">lightbulb</span>
              <p className="text-sm font-medium text-slate-200">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusCard({
  totalMembers,
  activeMembers,
  inactiveMembers,
  hasAnyData,
}: {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  hasAnyData: boolean;
}) {
  const activeRatio = totalMembers > 0 ? (activeMembers / totalMembers) * 360 : 0;

  return (
    <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
      <h4 className="text-lg font-bold">Member Status</h4>
      <p className="mb-8 text-xs text-slate-400">Active vs inactive breakdown</p>

      {!hasAnyData ? (
        <EmptyState title="No data yet" message="Start by adding members or recording attendance" />
      ) : (
        <>
          <div className="relative flex justify-center py-6">
            <div className="relative flex size-36 items-center justify-center rounded-full border-[14px] border-slate-700">
              <div
                className="absolute inset-[-14px] rounded-full border-[14px] border-emerald-500 border-l-transparent border-t-transparent"
                style={{ transform: `rotate(${activeRatio - 90}deg)` }}
              />
              <div className="text-center">
                <span className="text-2xl font-black">{totalMembers}</span>
                <p className="text-[10px] font-bold uppercase text-slate-500">Total</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-slate-300">Active</span>
              </div>
              <span className="text-sm font-bold">{activeMembers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-slate-500" />
                <span className="text-sm font-medium text-slate-300">Inactive</span>
              </div>
              <span className="text-sm font-bold">{inactiveMembers}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

async function fetchRevenueRows(gymId: string, rangeStartIso: string, rangeEndIso: string): Promise<RevenueRow[]> {
  const paymentsResponse = await supabase
    .from('payments')
    .select('created_at, payment_date, paid_at, amount, price_paid')
    .eq('gym_id', gymId)
    .gte('created_at', rangeStartIso)
    .lt('created_at', rangeEndIso);

  if (!paymentsResponse.error) {
    return paymentsResponse.data || [];
  }

  const historyResponse = await supabase
    .from('membership_history')
    .select('created_at, price_paid')
    .eq('gym_id', gymId)
    .gte('created_at', rangeStartIso)
    .lt('created_at', rangeEndIso);

  if (historyResponse.error) {
    throw historyResponse.error;
  }

  return historyResponse.data || [];
}

async function fetchAllRevenueRows(gymId: string): Promise<RevenueRow[]> {
  const paymentsResponse = await supabase
    .from('payments')
    .select('amount, price_paid')
    .eq('gym_id', gymId);

  if (!paymentsResponse.error) {
    return paymentsResponse.data || [];
  }

  const historyResponse = await supabase
    .from('membership_history')
    .select('price_paid')
    .eq('gym_id', gymId);

  if (historyResponse.error) {
    throw historyResponse.error;
  }

  return historyResponse.data || [];
}

export default function AdvancedAnalytics() {
  const { gymId } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsState>(initialState);

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

  const fetchAnalytics = useCallback(async () => {
    if (!gymId && !isDemoMode) {
      return;
    }

    setLoading(true);

    try {
      if (isDemoMode) {
        const mockCheckins = [24, 31, 28, 40, 44, 38, 52];
        const mockRevenue = [6000, 4000, 7500, 8200, 9000, 6800, 10400];
        const mockPrevCheckins = 182;
        const mockCurrentCheckins = mockCheckins.reduce((sum, value) => sum + value, 0);
        const mockPrevRevenue = 39000;
        const mockCurrentRevenue = mockRevenue.reduce((sum, value) => sum + value, 0);
        const demoSeries = buildDaySeries(7);
        const weeklyCheckins = demoSeries.map((point, index) => ({ ...point, value: mockCheckins[index] }));
        const weeklyRevenue = demoSeries.map((point, index) => ({ ...point, value: mockRevenue[index] }));
        const insights = [
          'Peak traffic on Friday',
          'Low activity on Tuesday',
          '3 members expiring within 7 days',
          '5 members inactive for 5+ days',
        ];
        const retentionMembers: RetentionMember[] = [
          {
            id: '1',
            name: 'Ahmed Sharif',
            phone: '01711000000',
      planName: 'Premium',
            lastCheckIn: addDays(new Date(), -6).toISOString(),
            inactivityDays: 6,
            status: 'Inactive',
            membershipState: 'active-plan',
          },
          {
            id: '2',
            name: 'Nusrat Jahan',
            phone: '01811000000',
      planName: 'Advanced',
            lastCheckIn: addDays(new Date(), -4).toISOString(),
            inactivityDays: 4,
            status: 'At Risk',
            membershipState: 'active-plan',
          },
          {
            id: '3',
            name: 'Tanvir Rahman',
            phone: '01911000000',
      planName: 'Basic',
            lastCheckIn: addDays(new Date(), -8).toISOString(),
            inactivityDays: 8,
            status: 'Missing This Week',
            membershipState: 'expired-plan',
          },
        ];

        setAnalytics({
          totals: {
            totalMembers: 342,
            activeMembers: 287,
            totalCheckins: 4120,
            totalRevenue: 325000,
          },
          trends: {
            totalMembers: calculateTrend(18, 11),
            activeMembers: calculateTrend(14, 9),
            totalCheckins: calculateTrend(mockCurrentCheckins, mockPrevCheckins),
            totalRevenue: calculateTrend(mockCurrentRevenue, mockPrevRevenue),
            newMembers: calculateTrend(18, 11),
          },
          charts: {
            weeklyCheckins,
            weeklyRevenue,
          },
          memberStatus: {
            totalMembers: 342,
            activeMembers: 287,
            inactiveMembers: 55,
            newMembersLast7Days: 18,
          },
          insights,
          retention: {
            inactiveCount: 5,
            missingThisWeekCount: 12,
            atRiskCount: 4,
            members: retentionMembers,
            insights: [
              'Attendance dropped this week',
              'Most inactive members are from expired plans',
              '3 active-plan members have not visited in 5+ days',
            ],
          },
          hasCheckinData: true,
          hasRevenueData: true,
          hasAnyData: true,
        });
        return;
      }

      const today = startOfDay(new Date());
      const tomorrow = addDays(today, 1);
      const currentPeriodStart = addDays(today, -6);
      const previousPeriodStart = addDays(today, -13);
      const retentionLookbackStart = addDays(today, -RETENTION_LOOKBACK_DAYS);
      const weekStart = addDays(today, -today.getDay());
      const inactiveThreshold = addDays(today, -5);

      const previousPeriodStartIso = previousPeriodStart.toISOString();
      const inactiveThresholdIso = inactiveThreshold.toISOString();
      const retentionLookbackStartIso = retentionLookbackStart.toISOString();
      const tomorrowIso = tomorrow.toISOString();

      const [
        totalMembersRes,
        activeMembersRes,
        totalCheckinsRes,
        allRevenueRows,
        attendanceWindowRes,
        membersWindowRes,
        activeMemberListRes,
        recentAttendanceRes,
        expiringMembersRes,
        revenueWindowRows,
        retentionMembersRes,
        retentionAttendanceRes,
      ] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gymId),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'ACTIVE'),
        supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('gym_id', gymId),
        fetchAllRevenueRows(gymId!),
        supabase
          .from('attendance')
          .select('check_in_time, member_id')
          .eq('gym_id', gymId)
          .gte('check_in_time', previousPeriodStartIso)
          .lt('check_in_time', tomorrowIso),
        supabase
          .from('members')
          .select('id, status, created_at, join_date, expiry_date')
          .eq('gym_id', gymId)
          .gte('created_at', previousPeriodStartIso),
        supabase
          .from('members')
          .select('id')
          .eq('gym_id', gymId)
          .eq('status', 'ACTIVE'),
        supabase
          .from('attendance')
          .select('member_id')
          .eq('gym_id', gymId)
          .gte('check_in_time', inactiveThresholdIso)
          .lt('check_in_time', tomorrowIso),
        supabase
          .from('members')
          .select('id', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .gte('expiry_date', formatDateKey(today))
          .lte('expiry_date', formatDateKey(addDays(today, 7))),
        fetchRevenueRows(gymId!, previousPeriodStartIso, tomorrowIso),
        supabase
          .from('members')
          .select('id, full_name, phone, status, created_at, join_date, expiry_date, plans(name)')
          .eq('gym_id', gymId)
          .eq('status', 'ACTIVE'),
        supabase
          .from('attendance')
          .select('member_id, check_in_time')
          .eq('gym_id', gymId)
          .gte('check_in_time', retentionLookbackStartIso)
          .lt('check_in_time', tomorrowIso)
          .order('check_in_time', { ascending: false }),
      ]);

      if (attendanceWindowRes.error) {
        throw attendanceWindowRes.error;
      }

      if (membersWindowRes.error) {
        throw membersWindowRes.error;
      }

      if (activeMemberListRes.error) {
        throw activeMemberListRes.error;
      }

      if (recentAttendanceRes.error) {
        throw recentAttendanceRes.error;
      }

      if (retentionMembersRes.error) {
        throw retentionMembersRes.error;
      }

      if (retentionAttendanceRes.error) {
        throw retentionAttendanceRes.error;
      }

      const totalRevenue = allRevenueRows.reduce((sum, row) => sum + getRevenueValue(row), 0);

      const currentCheckinSeries = buildDaySeries(7);
      const previousCheckinSeries = buildDaySeries(7, addDays(currentPeriodStart, -1));
      const currentRevenueSeries = buildDaySeries(7);
      const previousRevenueSeries = buildDaySeries(7, addDays(currentPeriodStart, -1));

      const attendanceRecords = (attendanceWindowRes.data || []).map((row) => ({
        date: formatDateKey(new Date(row.check_in_time)),
        value: 1,
        memberId: row.member_id,
      }));

      const revenueRecords = revenueWindowRows
        .map((row) => {
          const date = getDateStringFromRevenueRow(row);
          if (!date) {
            return null;
          }

          return {
            date,
            value: getRevenueValue(row),
          };
        })
        .filter((row): row is { date: string; value: number } => Boolean(row));

      const currentMembersWindow = (membersWindowRes.data || []).filter((member) => {
        const rawDate = member.join_date || member.created_at;
        if (!rawDate) {
          return false;
        }

        const parsed = new Date(rawDate);
        return parsed >= currentPeriodStart && parsed < tomorrow;
      });

      const previousMembersWindow = (membersWindowRes.data || []).filter((member) => {
        const rawDate = member.join_date || member.created_at;
        if (!rawDate) {
          return false;
        }

        const parsed = new Date(rawDate);
        return parsed >= previousPeriodStart && parsed < currentPeriodStart;
      });

      const currentActiveWindow = currentMembersWindow.filter((member) => member.status === 'ACTIVE').length;
      const previousActiveWindow = previousMembersWindow.filter((member) => member.status === 'ACTIVE').length;

      const weeklyCheckins = fillSeriesFromRecords(
        currentCheckinSeries,
        attendanceRecords.filter((record) => record.date >= currentCheckinSeries[0].key)
      );
      const previousWeeklyCheckins = fillSeriesFromRecords(
        previousCheckinSeries,
        attendanceRecords.filter((record) => record.date <= previousCheckinSeries[previousCheckinSeries.length - 1].key)
      );

      const weeklyRevenue = fillSeriesFromRecords(
        currentRevenueSeries,
        revenueRecords.filter((record) => record.date >= currentRevenueSeries[0].key)
      );
      const previousWeeklyRevenue = fillSeriesFromRecords(
        previousRevenueSeries,
        revenueRecords.filter((record) => record.date <= previousRevenueSeries[previousRevenueSeries.length - 1].key)
      );

      const currentCheckins = sumValues(weeklyCheckins);
      const previousCheckins = sumValues(previousWeeklyCheckins);
      const currentRevenue = sumValues(weeklyRevenue);
      const previousRevenue = sumValues(previousWeeklyRevenue);
      const newMembersLast7Days = currentMembersWindow.length;
      const previousNewMembers = previousMembersWindow.length;

      const peakDay = weeklyCheckins.reduce((best, point) => (point.value > best.value ? point : best), weeklyCheckins[0] || { key: '', label: 'N/A', value: 0 });
      const lowestDay = weeklyCheckins.reduce((best, point) => (point.value < best.value ? point : best), weeklyCheckins[0] || { key: '', label: 'N/A', value: 0 });

      const activeMemberIds = new Set((activeMemberListRes.data || []).map((member) => member.id));
      const recentlySeenMemberIds = new Set((recentAttendanceRes.data || []).map((entry) => entry.member_id));
      let inactiveMembers = 0;
      activeMemberIds.forEach((memberId) => {
        if (!recentlySeenMemberIds.has(memberId)) {
          inactiveMembers += 1;
        }
      });

      const lastCheckInMap = new Map<string, string>();
      (retentionAttendanceRes.data || []).forEach((entry) => {
        if (!lastCheckInMap.has(entry.member_id)) {
          lastCheckInMap.set(entry.member_id, entry.check_in_time);
        }
      });

      const retentionMembers = ((retentionMembersRes.data || []) as Array<{
        id: string;
        full_name: string;
        phone: string | null;
        status: string;
        created_at: string;
        join_date: string | null;
        expiry_date: string | null;
        plans?: { name?: string | null } | null;
      }>)
        .map((member) => {
          const lastCheckIn = lastCheckInMap.get(member.id) || null;
          const inactivityDays = getInactivityDays(lastCheckIn, today);
          const retentionStatus = classifyRetentionStatus(lastCheckIn, inactivityDays, weekStart);

          if (!retentionStatus) {
            return null;
          }

          return {
            id: member.id,
            name: member.full_name,
            phone: member.phone || '',
            planName: member.plans?.name || 'No Plan',
            lastCheckIn,
            inactivityDays,
            status: retentionStatus,
            membershipState: getMembershipState(member.expiry_date, today),
          } satisfies RetentionMember;
        })
        .filter((member): member is RetentionMember => Boolean(member))
        .sort((a, b) => b.inactivityDays - a.inactivityDays);

      const inactiveCount = retentionMembers.filter((member) => member.status === 'Inactive').length;
      const atRiskCount = retentionMembers.filter((member) => member.status === 'At Risk').length;
      const missingThisWeekCount = retentionMembers.filter((member) => member.status === 'Missing This Week').length;
      const expiredInactiveCount = retentionMembers.filter(
        (member) => member.status === 'Inactive' && member.membershipState === 'expired-plan'
      ).length;
      const activePlanInactiveCount = retentionMembers.filter(
        (member) => member.status === 'Inactive' && member.membershipState === 'active-plan'
      ).length;

      const inactiveTotal = Math.max((totalMembersRes.count || 0) - (activeMembersRes.count || 0), 0);
      const insights = [
        currentCheckins > 0 ? `Peak traffic on ${peakDay.label}` : 'Peak traffic data will appear after check-ins are recorded',
        currentCheckins > 0 ? `Low activity on ${lowestDay.label}` : 'Low activity data will appear after check-ins are recorded',
        `${expiringMembersRes.count || 0} members expiring within 7 days`,
        `${inactiveMembers} members inactive for 5+ days`,
      ];
      const retentionInsights = [
        currentCheckins < previousCheckins ? 'Attendance dropped this week' : 'Attendance is stable or improving this week',
        expiredInactiveCount > activePlanInactiveCount
          ? 'Most inactive members are from expired plans'
          : `${activePlanInactiveCount} active-plan members have not visited in 5+ days`,
        `${missingThisWeekCount} members did not visit this week`,
      ];

      setAnalytics({
        totals: {
          totalMembers: totalMembersRes.count || 0,
          activeMembers: activeMembersRes.count || 0,
          totalCheckins: totalCheckinsRes.count || 0,
          totalRevenue,
        },
        trends: {
          totalMembers: calculateTrend(newMembersLast7Days, previousNewMembers),
          activeMembers: calculateTrend(currentActiveWindow, previousActiveWindow),
          totalCheckins: calculateTrend(currentCheckins, previousCheckins),
          totalRevenue: calculateTrend(currentRevenue, previousRevenue),
          newMembers: calculateTrend(newMembersLast7Days, previousNewMembers),
        },
        charts: {
          weeklyCheckins,
          weeklyRevenue,
        },
        memberStatus: {
          totalMembers: totalMembersRes.count || 0,
          activeMembers: activeMembersRes.count || 0,
          inactiveMembers: inactiveTotal,
          newMembersLast7Days,
        },
        insights,
        retention: {
          inactiveCount,
          missingThisWeekCount,
          atRiskCount,
          members: retentionMembers,
          insights: retentionInsights,
        },
        hasCheckinData: currentCheckins > 0,
        hasRevenueData: currentRevenue > 0,
        hasAnyData:
          (totalMembersRes.count || 0) > 0 ||
          (activeMembersRes.count || 0) > 0 ||
          currentCheckins > 0 ||
          currentRevenue > 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(initialState);
    } finally {
      setLoading(false);
    }
  }, [gymId, isDemoMode]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useRealtimeSubscription({ table: 'attendance', gymId, onChange: fetchAnalytics, enabled: !isDemoMode });
  useRealtimeSubscription({ table: 'members', gymId, onChange: fetchAnalytics, enabled: !isDemoMode });
  useRealtimeSubscription({ table: 'membership_history', gymId, onChange: fetchAnalytics, enabled: !isDemoMode });

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
            <EmptyState title="No data yet" message="Start by adding members or recording attendance" />
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
            <EmptyState title="No data yet" message="Start by adding members or recording attendance" />
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
