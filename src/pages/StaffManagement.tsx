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

  const canViewPage = canAccessStaffManagement(userRole);
  const roleOptions = getAssignableRoles(userRole);

  const fetchStaff = useCallback(async () => {
    if (!gymId || !canViewPage) {
      return;
    }

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

      const { data, error } = await supabase.rpc('get_staff_management', {
        target_gym_id: gymId,
      });

      if (error) {
        if (!missingFunctionPattern.test(error.message || '')) {
          throw error;
        }

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_roles')
          .select('id, user_id, invited_email, display_name, role, status, joined_at, invited_at, created_at')
          .eq('gym_id', gymId)
          .in('role', ['OWNER', 'MANAGER', 'TRAINER'])
          .order('created_at', { ascending: true });

        if (fallbackError) {
          throw fallbackError;
        }

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

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useRealtimeSubscription({ table: 'user_roles', gymId, onChange: fetchStaff, enabled: canViewPage });

  const ownerCount = counts.owners;

  const statCards = useMemo(
    () => [
      { label: 'Total Staff', value: counts.total, accent: 'text-neutral-text dark:text-white' },
      { label: 'Owners', value: counts.owners, accent: 'text-purple-500' },
      { label: 'Managers', value: counts.managers, accent: 'text-blue-500' },
      { label: 'Trainers', value: counts.trainers, accent: 'text-emerald-500' },
    ],
    [counts]
  );

  const roleColors: Record<string, string> = {
    OWNER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    TRAINER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
    INVITED: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
    PENDING: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
  };

  const canManageStaffMember = (staff: StaffMember) => {
    if (!canManageTargetRole(userRole, staff.role)) {
      return false;
    }

    if (staff.user_id && user?.id === staff.user_id) {
      return false;
    }

    if (staff.role === 'OWNER' && ownerCount <= 1) {
      return userRole === 'OWNER';
    }

    return true;
  };

  const canEditStaffMember = (staff: StaffMember) => {
    if (!canManageStaffMember(staff)) {
      return false;
    }

    return roleOptions.length > 0;
  };

  const canRemoveStaffMember = (staff: StaffMember) => {
    if (!canManageStaffMember(staff)) {
      return false;
    }

    if (staff.role === 'OWNER' && ownerCount <= 1) {
      return false;
    }

    return true;
  };

  const resetInviteForm = () => {
    setInviteData({
      email: '',
      role: roleOptions[0] || 'TRAINER',
    });
  };

  const handleInviteStaff = async () => {
    if (!gymId) {
      return;
    }

    const normalizedEmail = inviteData.email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      showToast('Enter a valid email address.', 'error');
      return;
    }

    setIsInviteSubmitting(true);
    try {
      if (isDemoMode) {
        inviteStaff({
          email: normalizedEmail,
          role: inviteData.role as DemoStaffMember['role'],
        });
        showToast('Staff invite created. This is demo mode. Changes are not saved.', 'info');
        setShowInviteModal(false);
        resetInviteForm();
        return;
      }

      const { error } = await supabase.rpc('invite_staff_member', {
        target_gym_id: gymId,
        invite_email: normalizedEmail,
        invite_role: inviteData.role,
      });

      if (error) {
        if (!missingFunctionPattern.test(error.message || '')) {
          throw error;
        }

        const { data: existingUser } = await supabase.auth.getUser();
        const existingRecord = staffList.find((member) => member.email.toLowerCase() === normalizedEmail);
        if (existingRecord) {
          throw new Error('A staff record already exists for this email');
        }

        const { error: insertError } = await supabase.from('user_roles').insert([
          {
            gym_id: gymId,
            user_id: null,
            invited_email: normalizedEmail,
            display_name: normalizedEmail,
            role: inviteData.role,
            status: 'INVITED',
            invited_at: new Date().toISOString(),
            joined_at: new Date().toISOString(),
          },
        ]);

        if (insertError) {
          throw insertError;
        }
      }

      showToast('Staff invite created successfully.', 'success');
      setShowInviteModal(false);
      resetInviteForm();
      fetchStaff();
      refreshUsage();
    } catch (error: any) {
      console.error('Error inviting staff:', error);
      showToast(error.message || 'Failed to invite staff member.', 'error');
    } finally {
      setIsInviteSubmitting(false);
    }
  };

  const handleUpdateRole = async (role: StaffRole) => {
    if (!editingStaff) {
      return;
    }

    setIsRoleSubmitting(true);
    try {
      if (isDemoMode) {
        updateStaffRole(editingStaff.id, role as DemoStaffMember['role']);
        showToast('Staff role updated. This is demo mode. Changes are not saved.', 'info');
        setEditingStaff(null);
        return;
      }

      const { error } = await supabase.rpc('update_staff_role', {
        target_role_id: editingStaff.id,
        next_role: role,
      });

      if (error) {
        if (!missingFunctionPattern.test(error.message || '')) {
          throw error;
        }

        if (editingStaff.role === 'OWNER' && role !== 'OWNER' && ownerCount <= 1) {
          throw new Error('Cannot demote the last owner');
        }

        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('id', editingStaff.id)
          .eq('gym_id', gymId);

        if (updateError) {
          throw updateError;
        }
      }

      showToast('Staff role updated.', 'success');
      setEditingStaff(null);
      fetchStaff();
    } catch (error: any) {
      console.error('Error updating staff role:', error);
      showToast(error.message || 'Failed to update staff role.', 'error');
    } finally {
      setIsRoleSubmitting(false);
    }
  };

  const handleRemoveStaff = async () => {
    if (!removingStaff) {
      return;
    }

    setIsRemoving(true);
    try {
      if (isDemoMode) {
        removeStaff(removingStaff.id);
        showToast('Staff member removed. This is demo mode. Changes are not saved.', 'info');
        setRemovingStaff(null);
        return;
      }

      const { error } = await supabase.rpc('remove_staff_member', {
        target_role_id: removingStaff.id,
      });

      if (error) {
        if (!missingFunctionPattern.test(error.message || '')) {
          throw error;
        }

        if (removingStaff.role === 'OWNER' && ownerCount <= 1) {
          throw new Error('Cannot remove the last owner');
        }

        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('id', removingStaff.id)
          .eq('gym_id', gymId);

        if (deleteError) {
          throw deleteError;
        }
      }

      showToast('Staff member removed.', 'success');
      setRemovingStaff(null);
      fetchStaff();
      refreshUsage();
    } catch (error: any) {
      console.error('Error removing staff:', error);
      showToast(error.message || 'Failed to remove staff member.', 'error');
    } finally {
      setIsRemoving(false);
    }
  };

  if (!canViewPage) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Staff Usage Limit Banner */}
      <UsageLimitBanner resource="staff" />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-neutral-text dark:text-white lg:text-3xl">
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Central hub for team roles, invites, and permissions.
          </p>
        </div>

        {canInviteStaff(userRole) && (
          <UsageLimitGuard resource="staff">
            <button
              onClick={() => {
                resetInviteForm();
                setShowInviteModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-default px-5 py-2.5 font-bold text-white shadow-lg shadow-primary-default/20 transition-all hover:brightness-110 active:scale-95"
            >
              <span className="material-symbols-outlined">person_add</span>
              Invite Staff
            </button>
          </UsageLimitGuard>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.accent}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Status</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex justify-center">
                      <div className="size-8 animate-spin rounded-full border-4 border-primary-default border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6">
                    <EmptyState
                      icon="badge"
                      title="No staff yet"
                      description="Invite your first manager or trainer to help run daily operations."
                      actionLabel={canInviteStaff(userRole) ? 'Invite staff' : undefined}
                      onAction={canInviteStaff(userRole) ? () => setShowInviteModal(true) : undefined}
                    />
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => {
                  const assignableOptions =
                    userRole === 'OWNER' && staff.role === 'OWNER' && ownerCount > 1
                      ? ['OWNER', 'MANAGER', 'TRAINER']
                      : roleOptions;

                  return (
                    <tr key={staff.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-primary-default/10 text-sm font-bold text-primary-default">
                            {(staff.display_name || staff.email || staff.role).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-text dark:text-white">{staff.display_name || staff.email}</p>
                            <p className="text-xs text-slate-500">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${roleColors[staff.role] || 'bg-slate-100 text-slate-600'}`}>
                          {staff.role}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${statusColors[staff.status] || 'bg-slate-100 text-slate-600'}`}>
                          {staff.status}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-sm text-slate-500 md:table-cell">
                        {new Date(staff.joined_at || staff.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={!canEditStaffMember(staff)}
                            onClick={() => setEditingStaff(staff)}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            Edit Role
                          </button>
                          <button
                            type="button"
                            disabled={!canRemoveStaffMember(staff)}
                            onClick={() => setRemovingStaff(staff)}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-bold uppercase tracking-wider text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/50 dark:hover:bg-red-950/40"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold">{staffList.length}</span> staff members
          </p>
        </div>
      </div>

      <InviteStaffModal
        isOpen={showInviteModal}
        email={inviteData.email}
        role={inviteData.role}
        roleOptions={roleOptions.length ? roleOptions : ['TRAINER']}
        isSubmitting={isInviteSubmitting}
        onClose={() => setShowInviteModal(false)}
        onEmailChange={(value) => setInviteData((current) => ({ ...current, email: value }))}
        onRoleChange={(value) => setInviteData((current) => ({ ...current, role: value }))}
        onSubmit={handleInviteStaff}
      />

      <EditStaffRoleModal
        isOpen={Boolean(editingStaff)}
        currentRole={(editingStaff?.role || 'TRAINER') as StaffRole}
        roleOptions={
          editingStaff?.role === 'OWNER' && ownerCount > 1 && userRole === 'OWNER'
            ? ['OWNER', 'MANAGER', 'TRAINER']
            : roleOptions.length
              ? roleOptions
              : ['TRAINER']
        }
        isSubmitting={isRoleSubmitting}
        memberName={editingStaff?.display_name || editingStaff?.email || 'Staff Member'}
        onClose={() => setEditingStaff(null)}
        onSubmit={handleUpdateRole}
      />

      <ConfirmModal
        isOpen={Boolean(removingStaff)}
        title="Remove Staff"
        message={
          removingStaff
            ? `Remove ${removingStaff.display_name || removingStaff.email} from this gym team?`
            : ''
        }
        onConfirm={handleRemoveStaff}
        onCancel={() => setRemovingStaff(null)}
      />
    </div>
  );
}
