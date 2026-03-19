import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useToast } from '../components/ToastProvider';
import { Member, Plan } from '../types';
import { formatBdt } from '../lib/currency';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { MemberModal } from '../components/members/MemberModal';
import { MembersTable } from '../components/members/MembersTable';
import { AlertBadge } from '../components/ui/AlertBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { getMemberExpiryAlert, calculateExpiryDate, getDaysLeft } from '../lib/memberExpiry';
import { useDemoData } from '../contexts/DemoDataContext';
import { useDemoMode } from '../hooks/useDemoMode';
import UsageLimitBanner, { UsageLimitGuard } from '../components/plan/UsageLimitBanner';

const PAGE_SIZE = 50;

interface ConfirmModal {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function MembersManagement() {
  const { gymId } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { state: demoState, addMember, updateMember, deleteMember } = useDemoData();
  const { showToast } = useToast();
  const { isLimitReached, refreshUsage } = usePlan();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Partial<Plan>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Members');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    plan_id: '',
  });

  const fetchMembers = useCallback(async () => {
    if (!gymId && !isDemoMode) return;
    setLoading(true);
    try {
      if (isDemoMode) {
        setMembers(demoState.members);
        setTotalCount(demoState.members.length);
        setPlans(demoState.plans);
        setLoading(false);
        return;
      }
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const [membersRes, plansRes] = await Promise.all([
        supabase
          .from('members')
          .select('*, plans(name, price, duration_days)', { count: 'exact' })
          .eq('gym_id', gymId)
          .order('created_at', { ascending: false })
          .range(from, to),
        supabase
          .from('plans')
          .select('id, name, price, duration_days')
          .eq('gym_id', gymId)
      ]);

      if (membersRes.error) throw membersRes.error;
      if (plansRes.error) throw plansRes.error;

      setMembers(membersRes.data || []);
      setTotalCount(membersRes.count || 0);
      setPlans(plansRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load members. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  }, [demoState.members, demoState.plans, gymId, isDemoMode, page, showToast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useRealtimeSubscription({ table: 'members', gymId, onChange: fetchMembers });

  const resetForm = () => {
    setFormData({ full_name: '', email: '', phone: '', plan_id: '' });
    setEditingMember(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (member: any) => {
    setEditingMember(member);
    setFormData({
      full_name: member.full_name || '',
      email: member.email || '',
      phone: member.phone || '',
      plan_id: member.plan_id || '',
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.full_name.trim().length < 2) {
      showToast('Name must be at least 2 characters.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        if (editingMember) {
          updateMember(editingMember.id, {
            full_name: formData.full_name.trim(),
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            plan_id: formData.plan_id || undefined,
          });
          showToast('Member updated. This is demo mode. Changes are not saved.', 'info');
        } else {
          addMember({
            full_name: formData.full_name.trim(),
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            plan_id: formData.plan_id || undefined,
          });
          showToast('Member added. This is demo mode. Changes are not saved.', 'info');
        }
        handleCloseModal();
        return;
      }

      if (!gymId) return;

      if (editingMember) {
        // Recalculate expiry if plan changed
        const updatePayload: any = {
          full_name: formData.full_name.trim(),
          email: formData.email || null,
          phone: formData.phone || null,
          plan_id: formData.plan_id || null,
        };

        if (formData.plan_id && formData.plan_id !== editingMember.plan_id) {
          const newPlan = plans.find(p => p.id === formData.plan_id);
          if (newPlan?.duration_days) {
            const today = new Date().toISOString().split('T')[0];
            updatePayload.expiry_date = calculateExpiryDate(today, newPlan.duration_days);
          }
        }

        const { error } = await supabase
          .from('members')
          .update(updatePayload)
          .eq('id', editingMember.id)
          .eq('gym_id', gymId);

        if (error) throw error;
        showToast('Member updated successfully!', 'success');
      } else {
        // Calculate expiry_date from plan duration
        const selectedPlan = formData.plan_id
          ? plans.find(p => p.id === formData.plan_id)
          : null;
        const today = new Date().toISOString().split('T')[0];
        const expiryDate = selectedPlan?.duration_days
          ? calculateExpiryDate(today, selectedPlan.duration_days)
          : null;

        const { error } = await supabase
          .from('members')
          .insert([{
            gym_id: gymId,
            full_name: formData.full_name.trim(),
            email: formData.email || null,
            phone: formData.phone || null,
            plan_id: formData.plan_id || null,
            join_date: today,
            expiry_date: expiryDate,
            status: 'ACTIVE'
          }]);

        if (error) throw error;

        showToast('Member added successfully!', 'success');
      }

      handleCloseModal();
      fetchMembers();
      refreshUsage(); // Refresh usage data after member add/edit
    } catch (error: any) {
      console.error('Error saving member:', error);
      showToast(error.message || 'Failed to save member.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (member: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Member',
      message: `Are you sure you want to delete "${member.full_name}"? This action cannot be undone.`,
      onConfirm: async () => {
        if (isDemoMode) {
          deleteMember(member.id);
          showToast('Member removed. This is demo mode. Changes are not saved.', 'info');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          return;
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const { error } = await supabase.from('members').delete().eq('id', member.id).eq('gym_id', gymId);
          if (error) throw error;
          showToast('Member deleted.', 'success');
          fetchMembers();
        } catch (error: any) {
          showToast(error.message || 'Failed to delete member.', 'error');
        }
      },
    });
  };

  // ─── CSV EXPORT ───────────────────────────────────────────
  const handleExportCSV = async () => {
    if (isDemoMode) {
      showToast('This is demo mode. Changes are not saved.', 'info');
      return;
    }
    if (!gymId) return;
    setIsExporting(true);
    try {
      // Fetch ALL members (not just current page)
      const { data, error } = await supabase
        .from('members')
        .select('full_name, email, phone, status, created_at, expiry_date, plans(name)')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        showToast('No members to export.', 'error');
        return;
      }

      const headers = ['Full Name', 'Email', 'Phone', 'Plan', 'Status', 'Joined Date', 'Expiry Date', 'Alert'];
      const rows = data.map((m: any) => {
        const alert = getMemberExpiryAlert(m.expiry_date);
        return [
          `"${(m.full_name || '').replace(/"/g, '""')}"`,
          `"${(m.email || '').replace(/"/g, '""')}"`,
          `"${(m.phone || '').replace(/"/g, '""')}"`,
          `"${(m.plans?.name || 'No Plan').replace(/"/g, '""')}"`,
          m.status || 'ACTIVE',
          new Date(m.created_at).toLocaleDateString(),
          m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : '',
          alert.label,
        ];
      });

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `members_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${data.length} members to CSV.`, 'success');
    } catch (error: any) {
      console.error('CSV Export error:', error);
      showToast('Failed to export members.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // ─── CSV IMPORT ───────────────────────────────────────────
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (isDemoMode) {
      showToast('This is demo mode. Changes are not saved.', 'info');
      if (csvInputRef.current) csvInputRef.current.value = '';
      return;
    }
    if (!file || !gymId) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        showToast('CSV file is empty or has no data rows.', 'error');
        return;
      }

      // Parse header
      const headerLine = lines[0].toLowerCase();
      const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

      const nameIdx = headers.findIndex(h => h.includes('name'));
      if (nameIdx === -1) {
        showToast('CSV must have a "name" or "full_name" column.', 'error');
        return;
      }
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const phoneIdx = headers.findIndex(h => h.includes('phone'));
      const planIdx = headers.findIndex(h => h.includes('plan'));
      const statusIdx = headers.findIndex(h => h.includes('status'));

      // Build a plan lookup map
      const planMap: Record<string, string> = {};
      plans.forEach(p => {
        if (p.name && p.id) planMap[p.name.toLowerCase()] = p.id;
      });

      // Parse rows
      const newMembers: any[] = [];
      let skipped = 0;

      for (let i = 1; i < lines.length; i++) {
        // Simple CSV parsing (handles quoted fields with commas)
        const row = parseCSVLine(lines[i]);
        const fullName = row[nameIdx]?.trim();
        if (!fullName || fullName.length < 2) { skipped++; continue; }

        const planName = planIdx >= 0 ? row[planIdx]?.trim() : '';
        const matchedPlanId = planName ? (planMap[planName.toLowerCase()] || null) : null;
        const status = statusIdx >= 0 ? row[statusIdx]?.trim().toUpperCase() : 'ACTIVE';

        newMembers.push({
          gym_id: gymId,
          full_name: fullName,
          email: emailIdx >= 0 ? (row[emailIdx]?.trim() || null) : null,
          phone: phoneIdx >= 0 ? (row[phoneIdx]?.trim() || null) : null,
          plan_id: matchedPlanId,
          status: ['ACTIVE', 'INACTIVE', 'FROZEN'].includes(status) ? status : 'ACTIVE',
        });
      }

      if (newMembers.length === 0) {
        showToast('No valid members found in CSV.', 'error');
        return;
      }

      // Bulk insert in batches of 50
      let inserted = 0;
      for (let i = 0; i < newMembers.length; i += 50) {
        const batch = newMembers.slice(i, i + 50);
        const { error } = await supabase.from('members').insert(batch);
        if (error) throw error;
        inserted += batch.length;
      }

      showToast(`Imported ${inserted} members successfully!${skipped > 0 ? ` (${skipped} rows skipped)` : ''}`, 'success');
      fetchMembers();
    } catch (error: any) {
      console.error('CSV Import error:', error);
      showToast(error.message || 'Failed to import CSV.', 'error');
    } finally {
      setIsImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  // Simple CSV line parser that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const filteredMembers = members.filter(m => {
    // 1. Search filter
    const query = searchQuery.toLowerCase();
    const searchMatch = !query || 
      m.full_name?.toLowerCase().includes(query) ||
      m.email?.toLowerCase().includes(query) ||
      m.phone?.includes(query);

    if (!searchMatch) return false;

    // 2. Status filter
    if (filterStatus === 'All Members') return true;

    const daysLeft = getDaysLeft(m.expiry_date);
    const hasExpiry = daysLeft !== null;

    switch (filterStatus) {
      case 'Active':
        return !hasExpiry || daysLeft >= 0;
      case 'Expired':
        return hasExpiry && daysLeft < 0;
      case 'Expiring Soon':
        return hasExpiry && daysLeft >= 3 && daysLeft <= 7;
      case 'Payment Due':
        return ((m as Member & { due_amount?: number }).due_amount || 0) > 0;
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Usage Limit Banner */}
      <UsageLimitBanner resource="members" className="mb-2" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
            Members
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            {totalCount} registered members
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* CSV Download — icon-only on mobile */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 rounded-xl h-11 px-3 sm:px-4 bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            title="Download CSV"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'CSV'}</span>
          </button>

          {/* CSV Upload — icon-only on mobile */}
          <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          <button
            onClick={() => csvInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center justify-center gap-2 rounded-xl h-11 px-3 sm:px-4 bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            title="Upload CSV"
          >
            <span className="material-symbols-outlined text-lg">upload</span>
            <span className="hidden sm:inline">{isImporting ? 'Importing...' : 'Upload'}</span>
          </button>

          {/* Add Member — gated by usage limit */}
          <UsageLimitGuard resource="members">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-xl h-11 px-4 sm:px-5 bg-accent-default text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              <span className="hidden xs:inline">Add</span>
            </button>
          </UsageLimitGuard>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            id="member-search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all text-neutral-text dark:text-white placeholder:text-slate-400"
            placeholder="Search by name, email or phone..."
            aria-label="Search members"
          />
        </div>
        
        {/* Filter Dropdown */}
        <div className="shrink-0 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">filter_list</span>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="w-full sm:w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all appearance-none cursor-pointer text-neutral-text dark:text-white"
            style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', 
              backgroundPosition: 'right 12px center', 
              backgroundRepeat: 'no-repeat', 
              backgroundSize: '16px' 
            }}
          >
            <option value="All Members">All Members</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Payment Due">Payment Due</option>
          </select>
        </div>
      </div>

      {/* ═══ Mobile Card Layout (< 640px) ═══ */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="skeleton w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1">
                  <div className="skeleton w-32 h-3.5 mb-2" />
                  <div className="skeleton w-24 h-2.5" />
                </div>
                <div className="skeleton w-16 h-6 rounded-full" />
              </div>
            </div>
          ))
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={searchQuery ? 'search_off' : 'group'}
            title={searchQuery ? 'No members match this search' : 'No members yet'}
            description={searchQuery ? 'Try a different name, email, or phone number.' : 'Add your first member to start tracking plans, renewals, and attendance.'}
            actionLabel={searchQuery ? undefined : 'Add your first member'}
            onAction={searchQuery ? undefined : openAddModal}
          />
        ) : (
          filteredMembers.map((member) => {
            const alert = getMemberExpiryAlert(member.expiry_date);
            return (
            <div key={member.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Link to={`/admin/members/${member.id}`} className="size-11 rounded-full bg-primary-default/10 flex items-center justify-center text-primary-default font-bold text-sm shrink-0">
                  {member.full_name?.charAt(0) || '?'}
                </Link>
                <Link to={`/admin/members/${member.id}`} className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-text dark:text-white truncate">{member.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{member.email || member.phone || '—'}</p>
                </Link>
                {member.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                    <span className="size-1.5 rounded-full bg-emerald-500" />Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/20 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-400 shrink-0">
                    <span className="size-1.5 rounded-full bg-red-500" />{member.status}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {member.plans ? (
                    <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      {member.plans.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">No Plan</span>
                  )}
                  <AlertBadge variant={alert.variant}>{alert.label}</AlertBadge>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditModal(member)} className="size-10 flex items-center justify-center text-slate-400 hover:text-primary-default hover:bg-primary-default/10 rounded-lg transition-colors" aria-label={`Edit ${member.full_name}`}>
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button onClick={() => handleDelete(member)} className="size-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors" aria-label={`Delete ${member.full_name}`}>
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
            );
          })
        )}
        {/* Mobile Pagination */}
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-slate-500">{searchQuery ? `${filteredMembers.length} results` : `${totalCount} total`}</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="size-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 text-sm font-bold">←</button>
              <span className="text-xs text-slate-500 font-medium">{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="size-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 text-sm font-bold">→</button>
            </div>
          )}
        </div>
      </div>

      <MembersTable
        loading={loading}
        members={filteredMembers}
        searchQuery={searchQuery}
        onEdit={openEditModal}
        onDelete={handleDelete}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        setPage={setPage}
      />

      <MemberModal
        isOpen={showAddModal}
        isEditing={!!editingMember}
        formData={formData}
        setFormData={setFormData}
        plans={plans}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
