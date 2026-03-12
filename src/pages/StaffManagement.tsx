import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

export default function StaffManagement() {
  const { gymId, userRole } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'TRAINER' });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, user_id, role, display_name, created_at')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setStaffList(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gymId) return;
    fetchStaff();
  }, [gymId]);

  useRealtimeSubscription({ table: 'user_roles', gymId, onChange: fetchStaff });

  const handleRemoveStaff = async (roleId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const { error } = await supabase.from('user_roles').delete().eq('id', roleId);
      if (error) throw error;
      fetchStaff();
    } catch (error) {
      console.error('Error removing staff:', error);
      alert('Failed to remove staff member.');
    }
  };

  const handleChangeRole = async (roleId: string, newRole: string) => {
    try {
      const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('id', roleId);
      if (error) throw error;
      fetchStaff();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role.');
    }
  };

  const roleColors: Record<string, string> = {
    OWNER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    TRAINER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    SUPER_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Staff Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Central hub for team orchestration and permissions.</p>
        </div>
        {userRole === 'OWNER' && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-default hover:brightness-110 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-default/20 active:scale-95"
          >
            <span className="material-symbols-outlined">person_add</span>
            Invite Staff
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</p>
          <p className="text-2xl font-bold mt-1 text-neutral-text dark:text-white">{staffList.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Owners</p>
          <p className="text-2xl font-bold mt-1 text-purple-500">{staffList.filter(s => s.role === 'OWNER').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Managers</p>
          <p className="text-2xl font-bold mt-1 text-blue-500">{staffList.filter(s => s.role === 'MANAGER').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trainers</p>
          <p className="text-2xl font-bold mt-1 text-emerald-500">{staffList.filter(s => s.role === 'TRAINER').length}</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Joined</th>
                {userRole === 'OWNER' && <th className="px-5 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center">
                  <div className="flex justify-center"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
                </td></tr>
              ) : staffList.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-slate-500">No staff members found</td></tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary-default/10 flex items-center justify-center text-primary-default font-bold text-sm">
                          {(staff.display_name || staff.role)?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-neutral-text dark:text-white">{staff.display_name || staff.user_id.substring(0, 8) + '...'}</p>
                          <p className="text-xs text-slate-500">{staff.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {userRole === 'OWNER' && staff.role !== 'OWNER' ? (
                        <select
                          value={staff.role}
                          onChange={(e) => handleChangeRole(staff.id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold outline-none"
                        >
                          <option value="TRAINER">TRAINER</option>
                          <option value="MANAGER">MANAGER</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-bold ${roleColors[staff.role] || 'bg-slate-100 text-slate-600'}`}>
                          {staff.role}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">
                      {new Date(staff.created_at).toLocaleDateString()}
                    </td>
                    {userRole === 'OWNER' && (
                      <td className="px-5 py-4 text-right">
                        {staff.role !== 'OWNER' && (
                          <button onClick={() => handleRemoveStaff(staff.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-lg">person_remove</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">Showing <span className="font-bold">{staffList.length}</span> staff members</p>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-neutral-text dark:text-white">Invite Staff Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">The invited user must already have a LiftLegend account. Enter their email to assign a role.</p>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input value={inviteData.email} onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  type="email" placeholder="staff@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Role</label>
                <select value={inviteData.role} onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all">
                  <option value="TRAINER">Trainer</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button disabled={isSubmitting || !inviteData.email}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      alert('In production, this would resolve the user email via an Edge Function and insert into user_roles.');
                      setShowInviteModal(false);
                    } finally { setIsSubmitting(false); }
                  }}
                  className="flex-1 h-11 rounded-xl font-bold text-white bg-primary-default hover:brightness-110 transition-all shadow-lg shadow-primary-default/20 disabled:opacity-50 flex items-center justify-center">
                  {isSubmitting ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
