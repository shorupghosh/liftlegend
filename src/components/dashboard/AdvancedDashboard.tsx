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

const SmartAlert = React.memo(({ type, title, desc, action }: { type: 'urgent' | 'opportunity' | 'info'; title: string; desc: string; action: string }) => {
  const colors = {
    urgent: 'border-red-500/20 bg-red-500/5 text-red-600',
    opportunity: 'border-blue-500/20 bg-blue-500/5 text-blue-600',
    info: 'border-slate-500/20 bg-slate-500/5 text-slate-600'
  };
  return (
    <div className={`p-4 rounded-xl border-l-4 ${colors[type]} flex items-center justify-between gap-4 transition-all hover:brightness-95`}>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-xl">
          {type === 'urgent' ? 'warning' : type === 'opportunity' ? 'rocket_launch' : 'info'}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{title}</p>
          <p className="text-[10px] sm:text-xs opacity-70 truncate">{desc}</p>
        </div>
      </div>
      <button className="text-[10px] font-black uppercase tracking-widest hover:underline shrink-0 text-primary-default">{action}</button>
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  // Heatmap Data
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];

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
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
             Real-time intelligence and operational control for your gym.
          </p>
        </div>
        <div className="flex items-center gap-2">
           {!isBasicPlan && (
             <button className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 transition-colors shrink-0">
               <span className="material-symbols-outlined text-lg">calendar_today</span>
               Last 30 Days
             </button>
           )}
           <button className={`h-10 px-5 rounded-xl ${isBasicPlan ? 'bg-slate-900 dark:bg-slate-800' : 'bg-primary-default'} text-white text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg ${isBasicPlan ? '' : 'shadow-primary-default/20'} hover:brightness-110 active:scale-95 transition-all text-center`}>
             {isBasicPlan ? 'View Plans' : 'Export BI Report'}
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
          <StatCard label="New Members" value="+24" trend={{ value: '15%', positive: true }} icon="person_add" color="indigo" onClick={() => navigate('/admin/members')} />
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
        {/* Growth Trends Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm relative overflow-hidden">
          {isBasicPlan && <LockedOverlay message="Performance Roadmap" plan="ADVANCED" />}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
             <div>
               <h4 className="text-lg font-bold text-slate-900 dark:text-white">Performance Roadmap</h4>
               <p className="text-xs text-slate-500">Revenue and membership growth velocity</p>
             </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 font-bold text-[10px] text-slate-400"><div className="size-2 bg-primary-default rounded-full" /> REVENUE</div>
               <div className="flex items-center gap-2 font-bold text-[10px] text-slate-400"><div className="size-2 bg-blue-400 rounded-full" /> MEMBERS</div>
             </div>
          </div>
          
          <div className="h-64 sm:h-72 flex flex-col relative">
             <div className="flex-1 flex items-end justify-between px-2 sm:px-4 border-b border-dashed border-slate-100 dark:border-slate-800 pb-1">
                {[45, 60, 55, 80, 75, 90, 85].map((h, i) => (
                  <div key={i} className="w-8 sm:w-12 bg-primary-default/10 rounded-t-lg relative group transition-all" style={{ height: `${h}%` }}>
                    <div className="absolute bottom-0 w-full bg-primary-default rounded-t-lg scale-x-75 opacity-40 group-hover:opacity-100 transition-all" style={{ height: `${h-25}%` }} />
                  </div>
                ))}
             </div>
             <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 px-2 uppercase">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d}>{d}</span>)}
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
             <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg. LTV</p>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{isBasicPlan ? 'BDT ----' : 'BDT 8.5K'}</p>
             </div>
             <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CAC</p>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{isBasicPlan ? 'BDT ---' : 'BDT 420'}</p>
             </div>
             <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Net Growth</p>
                <p className={`text-base sm:text-lg font-black ${isBasicPlan ? 'text-slate-300' : 'text-emerald-600'}`}>{isBasicPlan ? '+ --.-%' : '+24.5%'}</p>
             </div>
          </div>
        </div>

        {/* Smart Actions & AI Insights */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm relative overflow-hidden">
            {isBasicPlan && <LockedOverlay message="Smart Action Center" plan="ADVANCED" />}
             <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Action Center</h4>
             <div className="space-y-4">
                <SmartAlert type="urgent" title="Expiry Alert" desc="12 members expiring in 48h." action="Automate SMS" />
                <SmartAlert type="opportunity" title="Retention Win" desc="5 members reached 30 sessions." action="Send Gift" />
                <SmartAlert type="info" title="Revenue Insight" desc="New 'Elite' plan is converting at 15%." action="See Data" />
             </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-primary-default rounded-2xl p-6 text-white shadow-xl shadow-primary-default/20 relative overflow-hidden group">
            {isBasicPlan && <LockedOverlay message="AI Growth Insights" plan="PREMIUM" />}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <span className="material-symbols-outlined text-6xl">auto_awesome</span>
            </div>
             <div className="flex items-center gap-2 mb-3">
               <span className="material-symbols-outlined text-lg">psychology</span>
               <h4 className="font-bold text-sm uppercase tracking-wider">Strategic Recommendation</h4>
             </div>
             <p className="text-xs sm:text-sm opacity-90 leading-relaxed mb-6 font-medium">
               High traffic detected on Friday evenings. Suggest adding a "Power HIIT" class at 7PM to increase capacity by 20% and member satisfaction.
             </p>
             <button className="w-full py-3 bg-white text-primary-default font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-md active:scale-95">
               Apply to Schedule
             </button>
          </div>
        </div>
      </div>

      {/* Operational Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         {/* Peak Hours Heatmap */}
         <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm overflow-hidden relative">
            {isBasicPlan && <LockedOverlay message="Peak Visitor Analytics" plan="PREMIUM" />}
            <div className="flex items-center justify-between mb-6">
               <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Peak Visitor Heatmap</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black">Capacity Utilization</p>
               </div>
               <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map(i => <div key={i} className={`size-3 rounded-sm bg-primary-default opacity-${i*20}`} />)}
               </div>
            </div>
            
            <div className="overflow-x-auto pb-2">
               <div className="min-w-[450px]">
                  <div className="grid grid-cols-8 gap-2 mb-3">
                     <div />
                     {days.map(d => <div key={d} className="text-[10px] font-black text-slate-400 text-center uppercase tracking-tighter">{d}</div>)}
                  </div>
                  {hours.map(h => (
                    <div key={h} className="grid grid-cols-8 gap-2 mb-2">
                       <div className="text-[9px] font-black text-slate-400 flex items-center">{h}</div>
                       {days.map(d => {
                          const intensity = Math.floor(Math.random() * 5);
                          return (
                             <div key={d} className={`h-8 rounded-lg bg-primary-default transition-all hover:scale-110 cursor-pointer opacity-${intensity === 0 ? '5' : intensity * 20} shadow-sm border border-black/5`} />
                          );
                       })}
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Trainer Leaderboard */}
         <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col relative overflow-hidden">
            {isBasicPlan && <LockedOverlay message="Trainer KPIs" plan="ADVANCED" />}
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-lg font-bold text-slate-900 dark:text-white">Trainer Performance</h4>
               <button className="text-[10px] font-black text-primary-default uppercase tracking-widest hover:underline">Commission Report</button>
            </div>
            <div className="space-y-5 flex-1">
               {[
                 { name: 'Sagar Ahmed', role: 'Head Coach', rating: 4.9, sessions: 142, growth: '+12%' },
                 { name: 'Nasrin Sultana', role: 'Senior Trainer', rating: 4.8, sessions: 98, growth: '+5%' },
                 { name: 'Arif Islam', role: 'Strength Coach', rating: 4.7, sessions: 112, growth: '+8%' }
               ].map((t, i) => (
                 <div key={i} className="flex items-center justify-between group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                    <div className="flex items-center gap-3">
                       <div className="size-10 rounded-full bg-primary-default/10 text-primary-default flex items-center justify-center font-black text-sm border border-primary-default/20">
                         {t.name.split(' ').map(n => n[0]).join('')}
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.name}</p>
                         <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t.role}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right hidden sm:block">
                         <p className="text-xs font-black text-slate-900 dark:text-white">{t.sessions} <span className="text-[9px] opacity-50">SESS</span></p>
                         <div className="flex items-center justify-end gap-0.5">
                            <span className="material-symbols-outlined text-[10px] text-amber-500">star</span>
                            <span className="text-[10px] font-black text-slate-500">{t.rating}</span>
                         </div>
                       </div>
                       <span className="text-xs font-black text-emerald-600 group-hover:scale-110 transition-transform">{t.growth}</span>
                    </div>
                 </div>
               ))}
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
