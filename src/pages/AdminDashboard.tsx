import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

export default function AdminDashboard() {
  const { gymId } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    activeMembers: 0,
    todayCheckins: 0,
    revenue: 0,
  });
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [weeklyCheckins, setWeeklyCheckins] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!gymId) return;
    setLoading(true);
    try {
      const { count: membersCount } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .eq('status', 'ACTIVE');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: checkinsCount } = await supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .gte('check_in_time', today.toISOString());

      const { data: recentActivity } = await supabase
        .from('attendance')
        .select(`check_in_time, method, members ( full_name, plan_id, status )`)
        .eq('gym_id', gymId)
        .order('check_in_time', { ascending: false })
        .limit(5);

      const { data: totalRevenue } = await supabase.rpc('get_current_month_revenue', { gym_id_input: gymId });

      // Fetch last 7 days of check-in counts for the attendance trend chart
      const weekData: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date();
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        const { count } = await supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .gte('check_in_time', dayStart.toISOString())
          .lte('check_in_time', dayEnd.toISOString());
        weekData.push(count || 0);
      }
      setWeeklyCheckins(weekData);

      setMetrics({
        activeMembers: membersCount || 0,
        todayCheckins: checkinsCount || 0,
        revenue: Number(totalRevenue) || 0,
      });

      if (recentActivity) setRecentCheckins(recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [gymId]);

  const fetchMonthlyRevenue = useCallback(async () => {
    if (!gymId) return;
    const { data } = await supabase.rpc('get_revenue_trends', { gym_id_input: gymId, start_year: selectedYear });
    const monthlyData: number[] = [0, 0, 0, 0, 0, 0];

    if (data) {
      data.forEach((row: any) => {
        if (row.month && row.month <= 6) {
          monthlyData[row.month - 1] = Number(row.revenue) || 0;
        }
      });
    }
    setMonthlyRevenue(monthlyData);
  }, [gymId, selectedYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchMonthlyRevenue();
  }, [fetchMonthlyRevenue]);

  useRealtimeSubscription({ table: 'members', gymId, onChange: fetchDashboardData });
  useRealtimeSubscription({ table: 'attendance', gymId, onChange: fetchDashboardData });

  // Build SVG path for the weekly trend line
  const buildLinePath = (data: number[]) => {
    const maxVal = Math.max(...data, 1);
    const w = 400; const h = 130;
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * w,
      y: h - (v / maxVal) * h * 0.85 - 10,
    }));
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const midX = (pts[i - 1].x + pts[i].x) / 2;
      path += ` C ${midX} ${pts[i - 1].y}, ${midX} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
    }
    return { path, pts };
  };

  const maxRevenue = Math.max(...monthlyRevenue, 1);
  const { path: linePath, pts: linePoints } = buildLinePath(weeklyCheckins);
  const closedPath = `${linePath} L 400 150 L 0 150 Z`;
  const dayLabels = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Yesterday', 'Today'];
  const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Welcome back! Here's your gym performance at a glance.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="size-10 border-4 border-primary-default border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-primary-default">
                  <span className="material-symbols-outlined">group</span>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Members</p>
              <h3 className="text-3xl font-bold mt-1 text-neutral-text dark:text-white">{metrics.activeMembers.toLocaleString()}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-green-50 dark:bg-green-950/40 rounded-xl text-green-600">
                  <span className="material-symbols-outlined">payments</span>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Revenue this Month</p>
              <h3 className="text-3xl font-bold mt-1 text-neutral-text dark:text-white">৳{metrics.revenue.toLocaleString()}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600">
                  <span className="material-symbols-outlined">done_all</span>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Today's Check-ins</p>
              <h3 className="text-3xl font-bold mt-1 text-neutral-text dark:text-white">{metrics.todayCheckins.toLocaleString()}</h3>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Attendance Trend — Real data (last 7 days) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-lg text-neutral-text dark:text-white">Attendance Trends</h4>
                  <p className="text-sm text-slate-500">Last 7 days check-ins</p>
                </div>
                <span className="text-xs font-bold text-primary-default bg-primary-default/10 px-3 py-1 rounded-full">LIVE</span>
              </div>
              <div className="h-52 flex flex-col">
                <svg className="flex-1 w-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary-default)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--color-primary-default)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={closedPath} fill="url(#lineGradient)" />
                  <path d={linePath} fill="none" stroke="var(--color-primary-default)" strokeLinecap="round" strokeWidth="2.5" />
                  {linePoints.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="var(--color-primary-default)" />
                  ))}
                </svg>
                <div className="flex justify-between mt-3 text-xs text-slate-400 font-medium px-1">
                  {dayLabels.map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
              {/* Value labels */}
              <div className="flex justify-between mt-1 text-xs text-slate-500 font-bold px-1">
                {weeklyCheckins.map((v, i) => <span key={i}>{v}</span>)}
              </div>
            </div>

            {/* Monthly Revenue — Real data */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-lg text-neutral-text dark:text-white">Monthly Revenue</h4>
                  <p className="text-sm text-slate-500">First 6 months of {selectedYear}</p>
                </div>
                <select
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold px-3 py-1.5 outline-none text-neutral-text dark:text-white"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="h-52 flex items-end justify-between gap-3 px-2">
                {monthlyRevenue.map((revenue, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[10px] text-slate-500 font-bold">৳{revenue > 0 ? (revenue / 1000).toFixed(0) + 'k' : '0'}</span>
                    <div className="w-full rounded-t-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative" style={{ height: '160px' }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-lg bg-primary-default/50 hover:bg-primary-default transition-colors"
                        style={{ height: `${maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0}%` }}
                        title={`৳${revenue.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">{monthLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-lg text-neutral-text dark:text-white">Recent Check-ins</h4>
              {/* BUG-13 FIXED: "View all activity" now navigates to attendance page */}
              <button
                onClick={() => navigate('/admin/attendance')}
                className="text-primary-default text-sm font-semibold hover:underline transition-all"
              >
                View all activity
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentCheckins.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No recent check-ins found.</div>
              ) : (
                recentCheckins.map((checkin, idx) => (
                  /* BUG-29 FIXED: use unique compound key instead of index */
                  <div key={`${checkin.check_in_time}-${idx}`} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-primary-default/10 text-primary-default flex items-center justify-center font-bold">
                        {checkin.members?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-text dark:text-white">{checkin.members?.full_name || 'Unknown Member'}</p>
                        <p className="text-xs text-slate-500">Method: {checkin.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-text dark:text-white">
                        {new Date(checkin.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold">
                        SUCCESS
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
