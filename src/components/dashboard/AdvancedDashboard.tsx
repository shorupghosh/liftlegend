import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { formatBdt } from '../../lib/currency';
import { useDemoData } from '../../contexts/DemoDataContext';
import { useDemoMode } from '../../hooks/useDemoMode';
import { PageLoader } from '../ui/PageLoader';

// ─── UI Components ──────────────────────────────────────────

const StatCard = React.memo(({ label, value, trend, icon, color, onClick }: {
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  icon: string;
  color: string;
  onClick?: () => void;
}) => (
  <div 
    onClick={onClick}
    className={`relative group overflow-hidden bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
  >
    <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-24 bg-${color}-500/5 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-colors pointer-events-none`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-600 dark:text-slate-400 group-hover:text-primary-default transition-colors`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${trend.positive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </span>
      )}
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">{label}</p>
    <h3 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{value}</h3>
  </div>
));

const SmartAlert = React.memo(({ type, title, desc, action, onAction }: { type: 'urgent' | 'opportunity' | 'info'; title: string; desc: string; action: string; onAction?: () => void }) => {
  const colors = {
    urgent: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400',
    opportunity: 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    info: 'border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-300'
  };
  return (
    <div className={`p-4 rounded-xl border-l-4 ${colors[type]} flex items-center justify-between gap-4 transition-all hover:brightness-95`}>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-2xl">
          {type === 'urgent' ? 'warning' : type === 'opportunity' ? 'rocket_launch' : 'info'}
        </span>
        <div className="min-w-0">
          <p className="text-base font-black truncate">{title}</p>
          <p className="text-xs sm:text-sm opacity-90 truncate">{desc}</p>
        </div>
      </div>
      <button onClick={onAction} className="text-xs font-black uppercase tracking-widest hover:underline shrink-0 text-primary-default dark:text-[#3b93ff]">{action}</button>
    </div>
  );
});

const LockedOverlay = ({ message = "Unlock Business Intelligence", plan = "ADVANCED" }: { message?: string; plan?: string }) => (
  <div className="absolute inset-x-0 inset-y-0 z-10 backdrop-blur-[2px] bg-slate-50/10 dark:bg-slate-900/10 flex items-center justify-center p-6 text-center group">
    <div className="bg-white/90 dark:bg-slate-800/90 shadow-2xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 max-w-[240px] transform transition-transform group-hover:scale-105">
      <div className="size-12 rounded-full bg-primary-default/10 text-primary-default flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-2xl">lock</span>
      </div>
      <h5 className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{message}</h5>
      <p className="text-[10px] text-slate-500 mb-4 font-bold">Expert-level analytics are available on the <span className="text-primary-default">{plan}</span> plan.</p>
      <button className="w-full py-2 bg-primary-default text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary-default/20 hover:brightness-110 active:scale-95 transition-all">
        Upgrade Now
      </button>
    </div>
  </div>
);

// ─── Main Dashboard Component ───────────────────────────────

interface AdvancedDashboardProps {
  previewUnlocked?: boolean;
}

export default function AdvancedDashboard({ previewUnlocked = false }: AdvancedDashboardProps) {
  const { gymId, subscriptionTier } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { metrics: demoMetrics, state: demoState } = useDemoData();
  const navigate = useNavigate();
  const isBasicPlan = !previewUnlocked && (subscriptionTier === 'BASIC' || !subscriptionTier);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeMembers: 0,
    todayCheckins: 0,
    revenue: 0,
    retentionRate: 88, // BI Mock
    churnRisk: 12,    // BI Mock
  });
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [weeklyCheckins, setWeeklyCheckins] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const fetchDashboardData = useCallback(async () => {
    if (!gymId && !isDemoMode) return;
    setLoading(true);
    try {
      if (isDemoMode) {
        // Return realistic mock data instantly for demo
        setMetrics({
          activeMembers: demoMetrics.activeMembers,
          todayCheckins: demoMetrics.todayCheckins,
          revenue: demoMetrics.revenue,
          retentionRate: demoMetrics.retentionRate,
          churnRisk: demoMetrics.churnRisk,
        });
        setWeeklyCheckins([48, 57, 61, 54, 70, 76, demoMetrics.todayCheckins]);
        setRecentCheckins(demoState.attendance.slice(0, 5));
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch weekly trend queries
      const dayQueries = Array.from({ length: 7 }, (_, idx) => {
        const i = 6 - idx;
        const dayStart = new Date();
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        return supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .gte('check_in_time', dayStart.toISOString())
          .lte('check_in_time', dayEnd.toISOString());
      });

      const [
        membersRes,
        checkinsRes,
        recentRes,
        revenueRes,
        ...weekRes
      ] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'ACTIVE'),
        supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('gym_id', gymId).gte('check_in_time', today.toISOString()),
        supabase.from('attendance').select('check_in_time, method, members ( full_name, plan_id, status )').eq('gym_id', gymId).order('check_in_time', { ascending: false }).limit(5),
        supabase.rpc('get_current_month_revenue', { gym_id_input: gymId }),
        ...dayQueries,
      ]);

      const weekData = weekRes.map(r => r.count || 0);
      setWeeklyCheckins(weekData);

      setMetrics(prev => ({
        ...prev,
        activeMembers: membersRes.count || 0,
        todayCheckins: checkinsRes.count || 0,
        revenue: Number(revenueRes.data) || 0,
      }));

      if (recentRes.data) setRecentCheckins(recentRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [demoMetrics.activeMembers, demoMetrics.churnRisk, demoMetrics.revenue, demoMetrics.retentionRate, demoMetrics.todayCheckins, demoState.attendance, gymId, isDemoMode]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useRealtimeSubscription({ table: 'members', gymId, onChange: fetchDashboardData });
  useRealtimeSubscription({ table: 'attendance', gymId, onChange: fetchDashboardData });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyTotal = weeklyCheckins.reduce((sum, count) => sum + count, 0);
  const weeklyMax = Math.max(...weeklyCheckins, 1);
  const busiestDayIndex = weeklyCheckins.findIndex((count) => count === weeklyMax);
  const busiestDay = dayLabels[busiestDayIndex >= 0 ? busiestDayIndex : 0];
  const todayShare = weeklyTotal > 0 ? Math.round((metrics.todayCheckins / weeklyTotal) * 100) : 0;

  if (loading) {
    return <PageLoader label="Loading analytics..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 ${isBasicPlan ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-primary-default/10 text-primary-default border-primary-default/20'} text-[10px] font-black uppercase tracking-widest rounded-full border`}>
              {isBasicPlan ? 'BASIC GYM OPS' : 'OWNER COMMAND CENTER'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
             Advanced Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Operations and growth overview for the last 7 days.</p>
        </div>
        <div className="flex items-center gap-2">
           {!isBasicPlan && (
             <button onClick={() => navigate('/admin/analytics')} className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 transition-colors shrink-0">
               <span className="material-symbols-outlined text-lg">calendar_today</span>
               Last 30 Days
             </button>
           )}
           <button onClick={() => navigate(isBasicPlan ? '/admin/settings/subscription' : '/admin/analytics')} className={`h-10 px-5 rounded-xl ${isBasicPlan ? 'bg-slate-900 dark:bg-slate-800' : 'bg-primary-default'} text-white text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg ${isBasicPlan ? '' : 'shadow-primary-default/20'} hover:brightness-110 active:scale-95 transition-all text-center`}>
             {isBasicPlan ? 'View Plans' : 'Open Analytics'}
           </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        <StatCard label="Monthly Revenue" value={formatBdt(metrics.revenue)} trend={!isBasicPlan ? { value: '12%', positive: true } : undefined} icon="payments" color="emerald" onClick={() => navigate('/admin/payments')} />
        <StatCard label="Active Members" value={metrics.activeMembers.toLocaleString()} trend={!isBasicPlan ? { value: '4%', positive: true } : undefined} icon="group" color="blue" onClick={() => navigate('/admin/members')} />
        
        {isBasicPlan ? (
          <StatCard label="Check-ins Today" value={metrics.todayCheckins.toLocaleString()} icon="done_all" color="amber" onClick={() => navigate('/admin/attendance')} />
        ) : (
          <StatCard label="Check-ins (7d)" value={weeklyTotal.toLocaleString()} icon="person_add" color="indigo" onClick={() => navigate('/admin/attendance')} />
        )}
        
        <div className="relative">
          <StatCard label="Retention Rate" value={`${metrics.retentionRate}%`} trend={!isBasicPlan ? { value: '2%', positive: true } : undefined} icon="heart_plus" color="emerald" />
          {isBasicPlan && <LockedOverlay message="Retention Tracking" />}
        </div>
        
        <div className="relative">
          <StatCard label="Churn Risk" value={metrics.churnRisk} trend={!isBasicPlan ? { value: '18%', positive: false } : undefined} icon="error" color="red" />
          {isBasicPlan && <LockedOverlay message="Churn Analysis" />}
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weekly Attendance Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm relative overflow-hidden">
          {isBasicPlan && <LockedOverlay message="Performance Roadmap" plan="ADVANCED" />}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
             <div>
               <h4 className="text-lg font-bold text-slate-900 dark:text-white">Attendance Trend (Last 7 Days)</h4>
               <p className="text-xs text-slate-500">Daily check-ins from your actual attendance records</p>
             </div>
             <div className="text-[11px] font-bold text-slate-500">
               Total: <span className="text-slate-900 dark:text-white">{weeklyTotal}</span> check-ins
             </div>
          </div>
          
          <div className="h-64 sm:h-72 flex flex-col relative">
             <div className="flex-1 flex items-end justify-between px-2 sm:px-4 border-b border-dashed border-slate-100 dark:border-slate-800 pb-1">
                {weeklyCheckins.map((count, i) => {
                  const h = Math.max(Math.round((count / weeklyMax) * 100), count > 0 ? 8 : 3);
                  return (
                  <div key={i} className="w-8 sm:w-12 bg-primary-default/10 rounded-t-lg relative group transition-all" style={{ height: `${h}%` }}>
                    <div className="absolute bottom-0 w-full bg-primary-default rounded-t-lg scale-x-75 opacity-60 group-hover:opacity-100 transition-all" style={{ height: `${h}%` }} />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">{count}</span>
                  </div>
                )})}
             </div>
             <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 px-2 uppercase">
                {dayLabels.map(d => <span key={d}>{d}</span>)}
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
             <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Busiest Day</p>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{busiestDay}</p>
             </div>
             <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Peak Count</p>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{weeklyMax}</p>
             </div>
             <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Today Share</p>
                <p className="text-base sm:text-lg font-black text-emerald-600">{todayShare}%</p>
             </div>
          </div>
        </div>

        {/* Smart Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm relative overflow-hidden">
            {isBasicPlan && <LockedOverlay message="Smart Action Center" plan="ADVANCED" />}
             <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Action Center</h4>
             <div className="space-y-4">
                <SmartAlert type="urgent" title="Expiry Alert" desc="12 members expiring in 48h." action="Review Members" onAction={() => navigate('/admin/members')} />
                <SmartAlert type="opportunity" title="Retention Win" desc="5 members reached 30 sessions." action="Open Campaigns" onAction={() => navigate('/admin/notifications')} />
                <SmartAlert type="info" title="Revenue Insight" desc="New Advanced plan is converting at 15%." action="See Data" onAction={() => navigate('/admin/analytics')} />
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
            {isBasicPlan && <LockedOverlay message="Workflow Shortcuts" plan="ADVANCED" />}
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-4">Workflow Shortcuts</h4>
            <div className="space-y-3">
              <button onClick={() => navigate('/admin/members')} className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-md active:scale-95">
                Review Expiring Members
              </button>
              <button onClick={() => navigate('/admin/payments')} className="w-full py-3 bg-primary-default text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-md active:scale-95">
                Collect Due Payments
              </button>
              <button onClick={() => navigate('/admin/staff')} className="w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95">
                Open Staff Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Check-ins (Shifted to bottom as operational log) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
         <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Live Operations Log</h4>
            <button onClick={() => navigate('/admin/attendance')} className="text-[10px] font-black uppercase tracking-widest text-primary-default hover:underline">View All Sessions</button>
         </div>
         <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
           {recentCheckins.length === 0 ? (
             <div className="p-12 text-center text-slate-500 text-sm font-medium">Monitoring active check-ins...</div>
           ) : (
             recentCheckins.map((checkin, idx) => (
               <div key={`${checkin.check_in_time}-${idx}`} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-500">
                        {checkin.members?.full_name?.charAt(0) || '?'}
                     </div>
                     <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{checkin.members?.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{checkin.method}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-black text-slate-900 dark:text-white">
                        {new Date(checkin.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </p>
                     <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Verified</span>
                  </div>
               </div>
             ))
           )}
         </div>
      </div>
    </div>
  );
}
