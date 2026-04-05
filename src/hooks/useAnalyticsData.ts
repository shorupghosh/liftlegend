import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useDemoMode } from './useDemoMode';
import {
  classifyRetentionStatus,
  getInactivityDays,
  getMembershipState,
  RetentionMember,
  RETENTION_LOOKBACK_DAYS,
} from '../lib/retention';
import { TrendMeta, ChartPoint } from '../components/analytics/TrendBadge';

export type AnalyticsState = {
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

export function useAnalyticsData() {
  const { gymId } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsState>(initialState);

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

      if (attendanceWindowRes.error) throw attendanceWindowRes.error;
      if (membersWindowRes.error) throw membersWindowRes.error;
      if (activeMemberListRes.error) throw activeMemberListRes.error;
      if (recentAttendanceRes.error) throw recentAttendanceRes.error;
      if (retentionMembersRes.error) throw retentionMembersRes.error;
      if (retentionAttendanceRes.error) throw retentionAttendanceRes.error;

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
          if (!date) return null;
          return { date, value: getRevenueValue(row) };
        })
        .filter((row): row is { date: string; value: number } => Boolean(row));

      const currentMembersWindow = (membersWindowRes.data || []).filter((member) => {
        const rawDate = member.join_date || member.created_at;
        if (!rawDate) return false;
        const parsed = new Date(rawDate);
        return parsed >= currentPeriodStart && parsed < tomorrow;
      });

      const previousMembersWindow = (membersWindowRes.data || []).filter((member) => {
        const rawDate = member.join_date || member.created_at;
        if (!rawDate) return false;
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
          const joinDate = member.join_date || member.created_at;
          const inactivityDays = getInactivityDays(lastCheckIn, today, joinDate);
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

  return { loading, analytics };
}
