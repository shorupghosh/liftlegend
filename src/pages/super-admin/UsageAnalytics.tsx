import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { EmptyState } from '../../components/ui/EmptyState';

export default function UsageAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalMembers: 0, totalCheckins: 0, totalPayments: 0, newMembersThisMonth: 0 });
  const [topGyms, setTopGyms] = useState<any[]>([]);
  const [weeklyCheckins, setWeeklyCheckins] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);
      firstOfMonth.setHours(0, 0, 0, 0);

      const [membersRes, checkinsRes, paymentsRes, newMembersRes] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('attendance').select('id', { count: 'exact', head: true }),
        supabase.from('membership_history').select('id', { count: 'exact', head: true }),
        supabase.from('members').select('id', { count: 'exact', head: true }).gte('created_at', firstOfMonth.toISOString()),
      ]);

      setStats({
        totalMembers: membersRes.count || 0,
        totalCheckins: checkinsRes.count || 0,
        totalPayments: paymentsRes.count || 0,
        newMembersThisMonth: newMembersRes.count || 0,
      });

      const { data: gyms } = await supabase.from('gyms').select('id, name');
      if (gyms) {
        const gymStats = await Promise.all(
          gyms.map(async (gym) => {
            const { count } = await supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gym.id);
            return { ...gym, memberCount: count || 0 };
          })
        );
        setTopGyms(gymStats.sort((a, b) => b.memberCount - a.memberCount).slice(0, 8));
      }

      const days: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i -= 1) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        const { count } = await supabase.from('attendance').select('id', { count: 'exact', head: true })
          .gte('check_in_time', day.toISOString()).lt('check_in_time', nextDay.toISOString());
        days.push({ date: day.toLocaleDateString('en-US', { weekday: 'short' }), count: count || 0 });
      }
      setWeeklyCheckins(days);
    } catch (error) {
      console.error('Error fetching usage analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...weeklyCheckins.map((day) => day.count), 1);
  const maxMembers = Math.max(...topGyms.map((gym) => gym.memberCount), 1);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Usage Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform-wide usage patterns and engagement metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: stats.totalMembers, icon: 'group', color: 'text-primary-default' },
          { label: 'Total Check-ins', value: stats.totalCheckins, icon: 'fact_check', color: 'text-emerald-500' },
          { label: 'Total Payments', value: stats.totalPayments, icon: 'receipt_long', color: 'text-blue-500' },
          { label: 'New This Month', value: stats.newMembersThisMonth, icon: 'person_add', color: 'text-amber-500' },
        ].map((item) => (
          <div key={item.label} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined ${item.color} text-xl`}>{item.icon}</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="text-2xl font-black text-neutral-text dark:text-white">{loading ? '-' : item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
          <h3 className="font-bold text-lg mb-1">Platform Check-ins</h3>
          <p className="text-slate-400 text-xs mb-6">Last 7 days across all gyms</p>
          <div className="flex items-end justify-between gap-3 h-48">
            {loading ? (
              <div className="flex-1 flex items-center justify-center"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              weeklyCheckins.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                  <span className="text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{day.count}</span>
                  <div className={`w-full rounded-t-md transition-all duration-500 ${day.count === maxCount ? 'bg-primary-default shadow-lg shadow-primary-default/30' : 'bg-slate-700 group-hover:bg-primary-default/50'}`}
                    style={{ height: `${Math.max((day.count / maxCount) * 100, 8)}%` }} />
                  <span className={`text-[10px] font-bold ${day.count === maxCount ? 'text-primary-default' : 'text-slate-500'}`}>{day.date}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-neutral-text dark:text-white">Top Gyms by Members</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
          ) : topGyms.length === 0 ? (
            <div className="p-6">
              <EmptyState icon="query_stats" title="No gym data available" description="Usage analytics will populate once gyms start recording attendance and members." />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topGyms.map((gym, idx) => (
                <div key={gym.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <span className={`size-7 rounded-lg flex items-center justify-center text-xs font-black ${idx < 3 ? 'bg-primary-default text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-neutral-text dark:text-white truncate">{gym.name}</p>
                  </div>
                  <div className="hidden sm:block flex-1 max-w-[140px]">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div className="h-full bg-primary-default rounded-full" style={{ width: `${(gym.memberCount / maxMembers) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-neutral-text dark:text-white">{gym.memberCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

