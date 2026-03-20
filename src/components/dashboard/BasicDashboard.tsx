import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useDemoData } from '../../contexts/DemoDataContext';
import { useDemoMode } from '../../hooks/useDemoMode';
import { formatBdt } from '../../lib/currency';
import { PageLoader } from '../ui/PageLoader';
import { EmptyState } from '../ui/EmptyState';

const StatCard = React.memo(({ label, value, icon, color, onClick, isLoading }: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  onClick?: () => void;
  isLoading?: boolean;
}) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all ${onClick && !isLoading ? 'cursor-pointer hover:shadow-md' : ''} ${isLoading ? 'animate-pulse' : ''}`}
  >
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg text-${color}-600 dark:text-${color}-400`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">{label}</p>
      {isLoading ? (
        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
      ) : (
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{value}</h3>
      )}
    </div>
  </div>
));

export default function BasicDashboard() {
  const { gymId } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { metrics: demoMetrics, state: demoState } = useDemoData();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiringSoon: 0,
    revenue: 0,
  });
  const [recentMembers, setRecentMembers] = useState<any[]>([]);

  const fetchBasicData = useCallback(async () => {
    if (!gymId && !isDemoMode) return;
    setLoading(true);
    try {
      if (isDemoMode) {
        setMetrics({
          totalMembers: demoMetrics.totalMembers,
          activeMembers: demoMetrics.activeMembers,
          expiringSoon: demoMetrics.expiringSoon,
          revenue: demoMetrics.revenue,
        });
        setRecentMembers(demoState.members.slice(0, 5));
        setLoading(false);
        return;
      }

      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const [
        totalRes,
        activeRes,
        expiringRes,
        revenueRes,
        recentRes
      ] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gymId),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'ACTIVE'),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'ACTIVE').lte('expiry_date', nextWeek.toISOString()),
        supabase.rpc('get_current_month_revenue', { gym_id_input: gymId }),
        supabase.from('members').select('id, full_name, phone, status, join_date').eq('gym_id', gymId).order('join_date', { ascending: false }).limit(5)
      ]);

      setMetrics({
        totalMembers: totalRes.count || 0,
        activeMembers: activeRes.count || 0,
        expiringSoon: expiringRes.count || 0,
        revenue: Number(revenueRes.data) || 0,
      });

      if (recentRes.data) setRecentMembers(recentRes.data);
    } catch (error) {
      console.error('Error fetching basic dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [demoMetrics.activeMembers, demoMetrics.expiringSoon, demoMetrics.revenue, demoMetrics.totalMembers, demoState.members, gymId, isDemoMode]);

  useEffect(() => {
    fetchBasicData();
  }, [fetchBasicData]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mt-1 text-sm">
          A lightweight view of your core operations and metrics. 
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard isLoading={loading} label="Total Members" value={metrics.totalMembers.toLocaleString()} icon="group" color="slate" onClick={() => navigate('/admin/members')} />
        <StatCard isLoading={loading} label="Active Members" value={metrics.activeMembers.toLocaleString()} icon="how_to_reg" color="emerald" onClick={() => navigate('/admin/members?status=ACTIVE')} />
        <StatCard isLoading={loading} label="Expiring Soon" value={metrics.expiringSoon.toLocaleString()} icon="warning" color="amber" onClick={() => navigate('/admin/members?status=EXPIRING_SOON')} />
        <StatCard isLoading={loading} label="Revenue (Month)" value={formatBdt(metrics.revenue)} icon="payments" color="blue" onClick={() => navigate('/admin/payments')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Simple Alerts */}
         <div className="md:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Needs Attention</h3>
            {metrics.expiringSoon > 0 ? (
                <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-500/10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-600">
                        <span className="material-symbols-outlined">notification_important</span>
                        <span className="font-bold">{metrics.expiringSoon} Members Expiring Soon</span>
                    </div>
                    <button onClick={() => navigate('/admin/members?status=EXPIRING_SOON')} className="self-start text-xs font-bold text-amber-600 hover:underline">View Members</button>
                </div>
            ) : (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center text-slate-500">
                    No urgent alerts.
                </div>
            )}
            
            <div className="p-4 rounded-xl border-l-4 border-slate-300 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined">receipt_long</span>
                    <span className="font-bold">Payment Due Check</span>
                </div>
                <button onClick={() => navigate('/admin/members?status=PAYMENT_DUE')} className="self-start text-xs font-bold text-slate-600 dark:text-slate-400 hover:underline">View Unpaid</button>
            </div>
         </div>

         {/* Simple Table */}
         <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="font-bold text-slate-900 dark:text-white">Recent Members</h3>
                 <button onClick={() => navigate('/admin/members')} className="text-xs text-primary-default font-bold hover:underline">View All</button>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase">
                         <tr>
                             <th className="px-5 py-3 font-medium">Name</th>
                             <th className="px-5 py-3 font-medium">Phone</th>
                             <th className="px-5 py-3 font-medium">Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {recentMembers.map(member => (
                             <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                 <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{member.full_name}</td>
                                 <td className="px-5 py-3 text-slate-500">{member.phone || 'N/A'}</td>
                                 <td className="px-5 py-3">
                                     <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                         {member.status}
                                     </span>
                                 </td>
                             </tr>
                         ))}
                         {recentMembers.length === 0 && (
                             <tr>
                                 <td colSpan={3} className="px-5 py-8">
                                   <EmptyState
                                     icon="group"
                                     title="No members yet"
                                     description="Add your first member to unlock your recent activity feed."
                                     actionLabel="Add your first member"
                                     onAction={() => navigate('/admin/members')}
                                   />
                                 </td>
                             </tr>
                         )}
                     </tbody>
                 </table>
             </div>
         </div>
      </div>
    </div>
  );
}
