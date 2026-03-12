import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface GymData {
  id: string;
  name: string;
  contact_phone: string | null;
  subscription_tier: string | null;
  status: string;
  created_at: string;
  memberCount: number;
  ownerEmail: string | null;
}

export default function SuperAdminDashboard() {
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ totalGyms: 0, activeGyms: 0, totalMembers: 0, totalPlans: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch gyms, global member count, plan count in parallel
      const [gymsRes, plansRes] = await Promise.all([
        supabase.from('gyms').select('id, name, contact_phone, subscription_tier, status, created_at').order('created_at', { ascending: false }),
        supabase.from('plans').select('id', { count: 'exact', head: true }),
      ]);

      if (gymsRes.error) throw gymsRes.error;
      const gymsList = gymsRes.data || [];

      // Fetch member counts per gym + owner emails per gym in parallel
      const [memberCountsRes, ownerRolesRes] = await Promise.all([
        supabase.from('members').select('gym_id'),
        supabase.from('user_roles').select('gym_id, display_name, user_id').in('role', ['OWNER']),
      ]);

      // Build member count map
      const memberCountMap: Record<string, number> = {};
      (memberCountsRes.data || []).forEach((m: any) => {
        memberCountMap[m.gym_id] = (memberCountMap[m.gym_id] || 0) + 1;
      });

      // Build owner email map (first owner per gym)
      const ownerEmailMap: Record<string, string> = {};
      (ownerRolesRes.data || []).forEach((r: any) => {
        if (!ownerEmailMap[r.gym_id]) {
          ownerEmailMap[r.gym_id] = r.display_name || r.user_id?.substring(0, 12) || 'N/A';
        }
      });

      // Also try to get emails from auth if display_name is a user_id
      // For now, use display_name which is auto-populated with email

      const totalMembers = Object.values(memberCountMap).reduce((a, b) => a + b, 0);

      const enrichedGyms: GymData[] = gymsList.map((gym: any) => ({
        ...gym,
        memberCount: memberCountMap[gym.id] || 0,
        ownerEmail: ownerEmailMap[gym.id] || null,
      }));

      setGyms(enrichedGyms);
      setMetrics({
        totalGyms: gymsList.length,
        activeGyms: gymsList.filter((g: any) => g.status === 'ACTIVE').length,
        totalMembers,
        totalPlans: plansRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching super admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Optimistic instant toggle — updates UI first, then syncs to DB
  const handleToggleStatus = async (gymId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    if (!confirm(`Are you sure you want to ${newStatus === 'LOCKED' ? 'lock' : 'unlock'} this gym?`)) return;

    // Optimistic UI update — instant feedback
    setTogglingId(gymId);
    setGyms(prev => prev.map(g => g.id === gymId ? { ...g, status: newStatus } : g));
    setMetrics(prev => ({
      ...prev,
      activeGyms: prev.activeGyms + (newStatus === 'ACTIVE' ? 1 : -1),
    }));

    try {
      const { error } = await supabase.from('gyms').update({ status: newStatus }).eq('id', gymId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating gym status:', error);
      // Revert on failure
      setGyms(prev => prev.map(g => g.id === gymId ? { ...g, status: currentStatus } : g));
      setMetrics(prev => ({
        ...prev,
        activeGyms: prev.activeGyms + (newStatus === 'ACTIVE' ? -1 : 1),
      }));
      alert('Failed to update gym status.');
    } finally {
      setTogglingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      TRIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      PAST_DUE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      LOCKED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Platform Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time performance across all gym tenants.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Gyms</p>
              <h3 className="text-3xl font-black text-neutral-text dark:text-white mt-1">{loading ? '—' : metrics.totalGyms}</h3>
            </div>
            <div className="p-3 bg-primary-default/10 text-primary-default rounded-xl"><span className="material-symbols-outlined">apartment</span></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Active Gyms</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{loading ? '—' : metrics.activeGyms}</h3>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><span className="material-symbols-outlined">check_circle</span></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Members</p>
              <h3 className="text-3xl font-black text-neutral-text dark:text-white mt-1">{loading ? '—' : metrics.totalMembers}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><span className="material-symbols-outlined">group</span></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Plans</p>
              <h3 className="text-3xl font-black text-neutral-text dark:text-white mt-1">{loading ? '—' : metrics.totalPlans}</h3>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl"><span className="material-symbols-outlined">card_membership</span></div>
          </div>
        </div>
      </div>

      {/* Gyms Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-lg font-bold text-neutral-text dark:text-white">All Gym Tenants</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Gym Name</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Owner Email</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Members</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Subscription</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <div className="flex justify-center"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
                </td></tr>
              ) : gyms.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-500">No gyms registered yet.</td></tr>
              ) : (
                gyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary-default/10 flex items-center justify-center text-primary-default font-bold text-lg">
                          {gym.name?.charAt(0) || 'G'}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-neutral-text dark:text-white">{gym.name}</span>
                          <p className="text-xs text-slate-400">{gym.contact_phone || gym.id.substring(0, 12) + '...'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{gym.ownerEmail || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-slate-400 text-base">group</span>
                        <span className="text-sm font-semibold text-neutral-text dark:text-white">{gym.memberCount}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{gym.subscription_tier || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusBadge(gym.status)}`}>{gym.status}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">
                      {new Date(gym.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(gym.id, gym.status)}
                        disabled={togglingId === gym.id}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5 disabled:opacity-60 ${gym.status === 'LOCKED'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                      >
                        {togglingId === gym.id ? (
                          <div className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-sm">{gym.status === 'LOCKED' ? 'lock_open' : 'lock'}</span>
                        )}
                        {gym.status === 'LOCKED' ? 'Unlock' : 'Lock'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <span className="text-sm text-slate-500">Showing {gyms.length} gyms</span>
        </div>
      </div>
    </div>
  );
}
