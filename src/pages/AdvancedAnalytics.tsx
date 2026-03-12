import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdvancedAnalytics() {
  const { gymId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, totalCheckins: 0, totalRevenue: 0 });
  const [dailyCheckins, setDailyCheckins] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (!gymId) return;
    fetchAnalytics();
  }, [gymId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [membersRes, activeRes, checkinsRes, revenueRes] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gymId),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'ACTIVE'),
        supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('gym_id', gymId),
        supabase.from('membership_history').select('price_paid').eq('gym_id', gymId),
      ]);

      const totalRevenue = (revenueRes.data || []).reduce((sum: number, r: any) => sum + (r.price_paid || 0), 0);
      setStats({
        totalMembers: membersRes.count || 0,
        activeMembers: activeRes.count || 0,
        totalCheckins: checkinsRes.count || 0,
        totalRevenue,
      });

      const days: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);
        const { count } = await supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .gte('check_in_time', d.toISOString())
          .lt('check_in_time', nextD.toISOString());
        days.push({ date: d.toLocaleDateString('en-US', { weekday: 'short' }), count: count || 0 });
      }
      setDailyCheckins(days);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxCheckin = Math.max(...dailyCheckins.map(d => d.count), 1);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
          Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Performance metrics and insights for your gym</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-primary-default/10 rounded-lg text-primary-default"><span className="material-symbols-outlined">groups</span></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Members</p>
          <h3 className="text-2xl font-black mt-1 text-neutral-text dark:text-white">{loading ? '—' : stats.totalMembers}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600"><span className="material-symbols-outlined">check_circle</span></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Active Members</p>
          <h3 className="text-2xl font-black mt-1 text-emerald-600">{loading ? '—' : stats.activeMembers}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600"><span className="material-symbols-outlined">fact_check</span></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Check-ins</p>
          <h3 className="text-2xl font-black mt-1 text-neutral-text dark:text-white">{loading ? '—' : stats.totalCheckins}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600"><span className="material-symbols-outlined">payments</span></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
          <h3 className="text-2xl font-black mt-1 text-neutral-text dark:text-white">৳{loading ? '—' : stats.totalRevenue.toLocaleString()}</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Check-in Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold">Weekly Check-ins</h4>
              <p className="text-slate-400 text-xs">Last 7 days member entries</p>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-3 h-64">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              dailyCheckins.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                  <span className="text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{day.count}</span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${day.count === maxCheckin ? 'bg-primary-default shadow-lg shadow-primary-default/30' : 'bg-slate-700 group-hover:bg-primary-default/50'}`}
                    style={{ height: `${Math.max((day.count / maxCheckin) * 100, 5)}%` }}
                  />
                  <span className={`text-[10px] font-bold ${day.count === maxCheckin ? 'text-primary-default' : 'text-slate-500'}`}>{day.date}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Member Status Breakdown */}
        <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
          <h4 className="text-lg font-bold mb-1">Member Status</h4>
          <p className="text-slate-400 text-xs mb-8">Active vs Inactive breakdown</p>
          <div className="relative flex justify-center py-6">
            <div className="relative size-36 rounded-full border-[14px] border-slate-700 flex items-center justify-center">
              {!loading && stats.totalMembers > 0 && (
                <div
                  className="absolute inset-[-14px] rounded-full border-[14px] border-emerald-500 border-t-transparent border-l-transparent"
                  style={{ transform: `rotate(${(stats.activeMembers / stats.totalMembers) * 360 - 90}deg)` }}
                />
              )}
              <div className="text-center">
                <span className="text-2xl font-black">{loading ? '—' : stats.totalMembers}</span>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total</p>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-emerald-500" /><span className="text-sm font-medium text-slate-300">Active</span></div>
              <span className="text-sm font-bold">{stats.activeMembers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-slate-500" /><span className="text-sm font-medium text-slate-300">Inactive</span></div>
              <span className="text-sm font-bold">{stats.totalMembers - stats.activeMembers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
