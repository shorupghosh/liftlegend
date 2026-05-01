import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useToast } from '../components/ToastProvider';
import InviteStaffModal from '../components/staff/InviteStaffModal';
import EditStaffRoleModal from '../components/staff/EditStaffRoleModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge, toneFromRole, toneFromStatus } from '../components/ui/StatusBadge';
import { useDemoData } from '../contexts/DemoDataContext';
import { useDemoMode } from '../hooks/useDemoMode';
import UsageLimitBanner, { UsageLimitGuard } from '../components/plan/UsageLimitBanner';
import type { DemoStaffMember } from '../lib/demoData';
import {
  canAccessStaffManagement,
  canInviteStaff,
  canManageTargetRole,
  getAssignableRoles,
  StaffRole,
} from '../lib/staffPermissions';

type StaffMember = {
  id: string;
  user_id: string | null;
  email: string;
  display_name: string;
  role: StaffRole;
  status: 'ACTIVE' | 'INVITED' | 'PENDING';
  joined_at: string | null;
  invited_at: string | null;
  created_at: string;
};

type StaffCounts = {
  total: number;
  owners: number;
  managers: number;
  trainers: number;
};

const emptyCounts: StaffCounts = {
  total: 0,
  owners: 0,
  managers: 0,
  trainers: 0,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const missingFunctionPattern = /Could not find the function public\./i;

export default function StaffManagement() {
  const { gymId, userRole, user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { state: demoState, inviteStaff, removeStaff, updateStaffRole } = useDemoData();
  const { showToast } = useToast();
  const { refreshUsage } = usePlan();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [counts, setCounts] = useState<StaffCounts>(emptyCounts);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isInviteSubmitting, setIsInviteSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState<{ email: string; role: StaffRole }>({
    email: '',
    role: 'TRAINER',
  });
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);
  const [removingStaff, setRemovingStaff] = useState<StaffMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const canViewPage = canAccessStaffManagement(userRole);
  const roleOptions = getAssignableRoles(userRole);

  const fetchStaff = useCallback(async () => {
    if (!gymId || !canViewPage) return;
    setLoading(true);
    try {
      if (isDemoMode) {
        const demoStaff = demoState.staff as StaffMember[];
        setStaffList(demoStaff);
        setCounts({
          total: demoStaff.length,
          owners: demoStaff.filter((item) => item.role === 'OWNER').length,
          managers: demoStaff.filter((item) => item.role === 'MANAGER').length,
          trainers: demoStaff.filter((item) => item.role === 'TRAINER').length,
        });
        return;
      }

      const { data, error } = await supabase.rpc('get_staff_management', { target_gym_id: gymId });

      if (error) {
        if (!missingFunctionPattern.test(error.message || '')) throw error;
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_roles')
          .select('id, user_id, invited_email, display_name, role, status, joined_at, invited_at, created_at')
          .eq('gym_id', gymId)
          .in('role', ['OWNER', 'MANAGER', 'TRAINER'])
          .order('created_at', { ascending: true });
        if (fallbackError) throw fallbackError;

        const staff = (fallbackData || []).map((item) => ({
          id: item.id,
          user_id: item.user_id,
          email: item.invited_email || item.display_name || 'Unknown',
          display_name: item.display_name || item.invited_email || 'Unknown',
          role: item.role as StaffRole,
          status: (item.status || (item.user_id ? 'ACTIVE' : 'INVITED')) as StaffMember['status'],
          joined_at: item.joined_at || item.created_at,
          invited_at: item.invited_at || null,
          created_at: item.created_at,
        }));
        setStaffList(staff);
        setCounts({
          total: staff.length,
          owners: staff.filter((item) => item.role === 'OWNER').length,
          managers: staff.filter((item) => item.role === 'MANAGER').length,
          trainers: staff.filter((item) => item.role === 'TRAINER').length,
        });
        return;
      }

      const payload = (data || {}) as { staff?: StaffMember[]; counts?: StaffCounts };
      setStaffList(payload.staff || []);
      setCounts(payload.counts || emptyCounts);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      showToast(error.message || 'Failed to load staff.', 'error');
    } finally {
      setLoading(false);
    }
  }, [canViewPage, demoState.staff, gymId, isDemoMode, showToast]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);
  useRealtimeSubscription({ table: 'user_roles', gymId, onChange: fetchStaff, enabled: canViewPage });

  const ownerCount = counts.owners;

  const statCards = useMemo(() => [
    { label: 'Total Staff', value: counts.total, accent: 'text-neutral-text dark:text-white' },
    { label: 'Owners', value: counts.owners, accent: 'text-purple-500' },
    { label: 'Managers', value: counts.managers, accent: 'text-blue-500' },
    { label: 'Trainers', value: counts.trainers, accent: 'text-emerald-500' },
  ], [counts]);

  const canManageMember = (staff: StaffMember) => {
    if (!canManageTargetRole(userRole, staff.role)) return false;
    if (staff.user_id && user?.id === staff.user_id) return false;
    if (staff.role === 'OWNER' && ownerCount <= 1) return userRole === 'OWNER';
    return true;
  };

  const resetInviteForm = () => { setInviteData({ email: '', role: roleOptions[0] || 'TRAINER' }); };

  const handleInviteStaff = async () => {
    if (!gymId) return;
    const normalizedEmail = inviteData.email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      showToast('Enter a valid email address.', 'error');
      return;
    }
    setIsInviteSubmitting(true);
    try {
      if (isDemoMode) {
        inviteStaff({ email: normalizedEmail, role: inviteData.role as DemoStaffMember['role'] });
        showToast('Staff invited in demo.', 'info');
        setShowInviteModal(false);
        resetInviteForm();
        return;
      }
      const { error } = await supabase.rpc('invite_staff_member', {
        target_gym_id: gymId, invite_email: normalizedEmail, invite_role: inviteData.role,
      });
      if (error) {
        if (!missingFunctionPattern.test(error.message || '')) throw error;
        const { error: insertError } = await supabase.from('user_roles').insert([{
          gym_id: gymId, invited_email: normalizedEmail, display_name: normalizedEmail,
          role: inviteData.role, status: 'INVITED', invited_at: new Date().toISOString(),
          joined_at: new Date().toISOString(),
        }]);
        if (insertError) throw insertError;
      }
      await supabase.from('notifications').insert([{
        gym_id: gymId, type: 'general', title: 'Staff Invited', message: `${normalizedEmail} was invited as ${inviteData.role}.`
      }]);
      showToast('Staff invite sent!', 'success');
      setShowInviteModal(false);
      resetInviteForm();
      fetchStaff();
      refreshUsage();
    } catch (error: any) {
      showToast(error.message || 'Invite failed.', 'error');
    } finally {
      setIsInviteSubmitting(false);
    }
  };

  const handleUpdateRole = async (role: StaffRole) => {
    if (!editingStaff) return;
    setIsRoleSubmitting(true);
    try {
      if (isDemoMode) {
        updateStaffRole(editingStaff.id, role as DemoStaffMember['role']);
        showToast('Role updated in demo.', 'info');
        setEditingStaff(null);
        return;
      }
      const { error } = await supabase.rpc('update_staff_role', { target_role_id: editingStaff.id, next_role: role });
      if (error) {
        if (!missingFunctionPattern.test(error.message || '')) throw error;
        const { error: updateError } = await supabase.from('user_roles').update({ role }).eq('id', editingStaff.id).eq('gym_id', gymId);
        if (updateError) throw updateError;
      }
      await supabase.from('notifications').insert([{
        gym_id: gymId, type: 'general', title: 'Role Changed', message: `Staff ${editingStaff.email} is now a(n) ${role}.`
      }]);
      showToast('Staff role updated.', 'success');
      setEditingStaff(null);
      fetchStaff();
    } catch (error: any) {
      showToast(error.message || 'Update failed.', 'error');
    } finally {
      setIsRoleSubmitting(false);
    }
  };

  const handleRemoveStaff = async () => {
    if (!removingStaff) return;
    setIsRemoving(true);
    try {
      if (isDemoMode) {
        removeStaff(removingStaff.id);
        showToast('Staff removed from demo.', 'info');
        setRemovingStaff(null);
        return;
      }
      const { error } = await supabase.rpc('remove_staff_member', { target_role_id: removingStaff.id });
      if (error) {
        if (!missingFunctionPattern.test(error.message || '')) throw error;
        const { error: deleteError } = await supabase.from('user_roles').delete().eq('id', removingStaff.id).eq('gym_id', gymId);
        if (deleteError) throw deleteError;
      }
      await supabase.from('notifications').insert([{
        gym_id: gymId, type: 'general', title: 'Staff Removed', message: `Staff member ${removingStaff.email} was removed.`
      }]);
      showToast('Staff removed successfully.', 'success');
      setRemovingStaff(null);
      fetchStaff();
      refreshUsage();
    } catch (error: any) {
      showToast(error.message || 'Remove failed.', 'error');
    } finally {
      setIsRemoving(false);
    }
  };

  const filteredStaff = staffList.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (s.display_name?.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  });

  if (!canViewPage) return <Navigate to="/admin" replace />;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <UsageLimitBanner resource="staff" />
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-neutral-text dark:text-white lg:text-3xl">Staff Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Team roles, invites, and permissions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search staff..." className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-default/20 outline-none transition-all dark:text-white" />
          </div>
          {canInviteStaff(userRole) && (
            <UsageLimitGuard resource="staff">
              <button onClick={() => { resetInviteForm(); setShowInviteModal(true); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-default px-5 font-bold text-white shadow-lg shadow-primary-default/20 transition-all hover:brightness-110 active:scale-95">
                <span className="material-symbols-outlined">person_add</span> Invite Staff
              </button>
            </UsageLimitGuard>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.accent}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 sm:hidden">
        {loading ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3"><div className="size-9 rounded-full bg-slate-100 dark:bg-slate-800" /><div className="h-3 w-20 bg-slate-100 dark:bg-slate-800" /></div>
          </div>
        )) : staffList.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <EmptyState icon="badge" title="No staff yet" description="Invite someone to help manage." />
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <EmptyState icon="search_off" title="No match" description="Try a different name." />
          </div>
        ) : (
          filteredStaff.map((staff) => (
            <div key={staff.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary-default/10 text-sm font-bold text-primary-default">{(staff.display_name?.[0] || 'S').toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-text dark:text-white truncate">{staff.display_name || staff.email}</p>
                  <p className="text-xs text-slate-500 truncate">{staff.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <StatusBadge label={staff.role} tone={toneFromRole(staff.role)} />
                <StatusBadge label={staff.status} tone={toneFromStatus(staff.status)} />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button disabled={!canManageMember(staff)} onClick={() => setEditingStaff(staff)} className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">Edit Role</button>
                <button disabled={!canManageMember(staff)} onClick={() => setRemovingStaff(staff)} className="h-9 px-3 rounded-lg border border-red-100 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors dark:border-red-900/50 dark:hover:bg-red-900/30">Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Status</th>
                <th className="px-5 py-3.5 hidden md:table-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="size-9 rounded-full bg-slate-100" /><div className="h-3 w-20 bg-slate-100" /></div></td>
                  <td className="px-5 py-4"><div className="h-5 w-16 bg-slate-100 rounded-full" /></td>
                  <td className="px-5 py-4 hidden md:table-cell"><div className="h-5 w-16 bg-slate-50 rounded-full" /></td>
                  <td className="px-5 py-4 text-right"><div className="h-8 w-20 bg-slate-100 ml-auto rounded-lg" /></td>
                </tr>
              )) : staffList.length === 0 ? (
                <tr><td colSpan={4} className="p-12"><EmptyState icon="badge" title="No staff yet" description="Invite someone to help manage." /></td></tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan={4} className="p-12"><EmptyState icon="search_off" title="No match" description="Try a different name." /></td></tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary-default/10 text-sm font-bold text-primary-default">{(staff.display_name?.[0] || 'S').toUpperCase()}</div>
                        <div>
                          <p className="text-sm font-bold text-neutral-text dark:text-white">{staff.display_name || staff.email}</p>
                          <p className="text-xs text-slate-500">{staff.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge label={staff.role} tone={toneFromRole(staff.role)} /></td>
                    <td className="hidden px-5 py-4 md:table-cell"><StatusBadge label={staff.status} tone={toneFromStatus(staff.status)} /></td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button disabled={!canManageMember(staff)} onClick={() => setEditingStaff(staff)} className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors dark:border-slate-700 dark:text-slate-400">Edit Role</button>
                        <button disabled={!canManageMember(staff)} onClick={() => setRemovingStaff(staff)} className="h-9 px-3 rounded-lg border border-red-100 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors dark:border-red-900/50">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-sm text-slate-500">Showing <span className="font-bold">{filteredStaff.length}</span> staff members</p>
        </div>
      </div>

      <InviteStaffModal isOpen={showInviteModal} email={inviteData.email} role={inviteData.role} roleOptions={roleOptions.length ? roleOptions : ['TRAINER']} isSubmitting={isInviteSubmitting} onClose={() => setShowInviteModal(false)} onEmailChange={(v) => setInviteData(c => ({ ...c, email: v }))} onRoleChange={(v) => setInviteData(c => ({ ...c, role: v }))} onSubmit={handleInviteStaff} />
      <EditStaffRoleModal isOpen={Boolean(editingStaff)} currentRole={(editingStaff?.role || 'TRAINER') as StaffRole} roleOptions={roleOptions.length ? roleOptions : ['TRAINER']} isSubmitting={isRoleSubmitting} memberName={editingStaff?.display_name || 'Staff Member'} onClose={() => setEditingStaff(null)} onSubmit={handleUpdateRole} />
      <ConfirmModal isOpen={Boolean(removingStaff)} title="Remove Staff" message={`Remove ${removingStaff?.display_name || removingStaff?.email} from the team?`}
        requireVerification={removingStaff?.display_name || removingStaff?.email || "REMOVE"}
        isDestructive={true} onConfirm={handleRemoveStaff} onCancel={() => setRemovingStaff(null)} />
    </div>
  );
}
