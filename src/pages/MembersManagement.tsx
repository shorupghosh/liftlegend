import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { useDebounce } from '../hooks/useDebounce';
import UsageLimitBanner, { UsageLimitGuard } from '../components/plan/UsageLimitBanner';

const PAGE_SIZE = 50;

const MemberSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="size-11 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-1/3" />
      </div>
      <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
    </div>
  </div>
);

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function MembersManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { gymId, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { state: demoState, addMember, updateMember, deleteMember } = useDemoData();
  const { showToast } = useToast();
  const { isLimitReached, refreshUsage } = usePlan();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Partial<Plan>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [filterPlan, setFilterPlan] = useState('All Plans');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
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
    if (authLoading) return;
    if (!gymId && !isDemoMode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setTableError(null);
    try {
      if (isDemoMode) {
        let filtered = [...demoState.members];
        if (debouncedSearch) {
          const s = debouncedSearch.toLowerCase();
          filtered = filtered.filter(m => 
            (m.full_name || '').toLowerCase().includes(s) || 
            (m.email && m.email.toLowerCase().includes(s)) ||
            (m.phone && m.phone.includes(s))
          );
        }
        setMembers(filtered);
        setTotalCount(filtered.length);
        setPlans(demoState.plans);
        setLoading(false);
        return;
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('members')
        .select('id, gym_id, full_name, email, phone, status, join_date, expiry_date, created_at, plan_id, plans(name, price, duration_days)', { count: 'exact' })
        .eq('gym_id', gymId)
        .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

      if (debouncedSearch) {
        query = query.or(`full_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`);
      }

      if (filterPlan !== 'All Plans') {
        const planMatch = plans.find(p => p.name === filterPlan);
        if (planMatch) query = query.eq('plan_id', planMatch.id);
      }

      const todayString = new Date().toISOString().split('T')[0];
      const nextWeekString = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (filterStatus === 'Active') {
         query = query.eq('status', 'ACTIVE').or(`expiry_date.gte.${todayString},expiry_date.is.null`);
      } else if (filterStatus === 'Expired') {
         query = query.lt('expiry_date', todayString);
      } else if (filterStatus === 'Expiring Soon') {
         query = query.gte('expiry_date', todayString).lte('expiry_date', nextWeekString);
      } else if (filterStatus === 'Payment Due') {
         query = query.gt('due_amount', 0);
      }

      query = query.range(from, to);

      const [membersRes, plansRes] = await Promise.all([
        query,
        supabase.from('plans').select('id, name, price, duration_days').eq('gym_id', gymId)
      ]);

      if (membersRes.error) throw membersRes.error;
      if (plansRes.error) throw plansRes.error;

      setMembers((membersRes.data as any) || []);
      setTotalCount(membersRes.count || 0);
      setPlans(plansRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      showToast('Failed to load members.', 'error');
      setTableError(error.message || 'Error communicating with database.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, demoState.members, demoState.plans, gymId, isDemoMode, page, showToast, sortConfig, filterPlan, filterStatus, authLoading]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useRealtimeSubscription({ table: 'members', gymId, onChange: fetchMembers });

  const resetForm = () => {
    setFormData({ full_name: '', email: '', phone: '', plan_id: '' });
    setEditingMember(null);
  };

  const openAddModal = () => { resetForm(); setShowAddModal(true); };
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
  const handleCloseModal = () => { setShowAddModal(false); resetForm(); };

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
          showToast('Member updated in demo.', 'info');
        } else {
          addMember({
            full_name: formData.full_name.trim(),
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            plan_id: formData.plan_id || undefined,
          });
          showToast('Member added in demo.', 'info');
        }
        handleCloseModal();
        return;
      }
      if (!gymId) return;
      if (editingMember) {
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
        const { error } = await supabase.from('members').update(updatePayload).eq('id', editingMember.id).eq('gym_id', gymId);
        if (error) throw error;
        await supabase.from('notifications').insert([{
          gym_id: gymId, type: 'general', title: 'Member Profile Updated', message: `${formData.full_name.trim()}'s profile was updated.`
        }]);
        showToast('Member updated!', 'success');
      } else {
        const selectedPlan = formData.plan_id ? plans.find(p => p.id === formData.plan_id) : null;
        const today = new Date().toISOString().split('T')[0];
        const expiryDate = selectedPlan?.duration_days ? calculateExpiryDate(today, selectedPlan.duration_days) : null;
        const { data: newMem, error } = await supabase.from('members').insert([{
          gym_id: gymId, full_name: formData.full_name.trim(), email: formData.email || null,
          phone: formData.phone || null, plan_id: formData.plan_id || null, join_date: today,
          expiry_date: expiryDate, status: 'ACTIVE'
        }]).select();
        if (error) throw error;
        await supabase.from('notifications').insert([{
          gym_id: gymId, type: 'general', title: 'New Member Joined', message: `${formData.full_name.trim()} is now part of the gym.`, related_member_id: newMem?.[0]?.id || null
        }]);
        showToast('Member added!', 'success');
      }
      handleCloseModal();
      fetchMembers();
      refreshUsage();
    } catch (error: any) {
      showToast(error.message || 'Failed to save.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (member: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Member',
      message: `Are you sure you want to delete "${member.full_name}"?`,
      onConfirm: async () => {
        if (isDemoMode) {
          deleteMember(member.id);
          showToast('Member removed from demo.', 'info');
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
          showToast(error.message || 'Failed to delete.', 'error');
        }
      },
    });
  };

  const handleExportCSV = async () => {
    let dataToExport: any[] = [];
    if (isDemoMode) {
      dataToExport = demoState.members;
    } else {
      if (!gymId) return;
      setIsExporting(true);
      try {
        const { data, error } = await supabase.from('members').select('full_name, email, phone, status, created_at, expiry_date, plans(name)').eq('gym_id', gymId).order('created_at', { ascending: false });
        if (error) throw error;
        dataToExport = data || [];
      } catch (e) {
        showToast('Export failed.', 'error');
        setIsExporting(false);
        return;
      }
    }
    if (dataToExport.length === 0) {
      showToast('No members to export.', 'error');
      setIsExporting(false);
      return;
    }

    try {
      const headers = ['Full Name', 'Email', 'Phone', 'Plan', 'Status', 'Joined Date', 'Expiry Date', 'Alert'];
      const rows = dataToExport.map((m: any) => {
        const alert = getMemberExpiryAlert(m.expiry_date);
        return [
          `"${(m.full_name || '').replace(/"/g, '""')}"`,
          `"${(m.email || '').replace(/"/g, '""')}"`,
          `"${(m.phone || '').replace(/"/g, '""')}"`,
          `"${(m.plans?.name || 'No Plan').replace(/"/g, '""')}"`,
          m.status || 'ACTIVE',
          new Date(m.created_at).toLocaleDateString(),
          m.expiry_date ? new Date(m.expiry_date).toLocaleDateString() : 'N/A',
          alert.label,
        ];
      });
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `members_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Exported ${dataToExport.length} members.`, 'success');
    } catch (err) {
      showToast('CSV generation failed.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (isDemoMode) {
      showToast('Import disabled in demo.', 'info');
      if (csvInputRef.current) csvInputRef.current.value = '';
      return;
    }
    if (!file || !gymId) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        showToast('CSV is empty.', 'error');
        return;
      }
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const nameIdx = headers.findIndex(h => h.includes('name'));
      if (nameIdx === -1) {
        showToast('CSV needs a name column.', 'error');
        return;
      }
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const phoneIdx = headers.findIndex(h => h.includes('phone'));
      const planIdx = headers.findIndex(h => h.includes('plan'));
      const statusIdx = headers.findIndex(h => h.includes('status'));
      const planMap: Record<string, string> = {};
      plans.forEach(p => { if (p.name && p.id) planMap[p.name.toLowerCase()] = p.id; });

      const newMembers: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        const fullName = row[nameIdx]?.trim();
        if (!fullName || fullName.length < 2) continue;
        const planName = planIdx >= 0 ? row[planIdx]?.trim() : '';
        const matchedPlanId = planName ? (planMap[planName.toLowerCase()] || null) : null;
        const status = statusIdx >= 0 ? row[statusIdx]?.trim().toUpperCase() : 'ACTIVE';
        newMembers.push({
          gym_id: gymId, full_name: fullName, email: emailIdx >= 0 ? (row[emailIdx]?.trim() || null) : null,
          phone: phoneIdx >= 0 ? (row[phoneIdx]?.trim() || null) : null, plan_id: matchedPlanId,
          status: ['ACTIVE', 'INACTIVE', 'FROZEN'].includes(status) ? status : 'ACTIVE',
        });
      }
      if (newMembers.length === 0) {
        showToast('No valid members found.', 'error');
        return;
      }
      for (let i = 0; i < newMembers.length; i += 50) {
        const batch = newMembers.slice(i, i + 50);
        const { error } = await supabase.from('members').insert(batch);
        if (error) throw error;
      }
      showToast(`Imported ${newMembers.length} members!`, 'success');
      fetchMembers();
    } catch (error: any) {
      showToast(error.message || 'Import failed.', 'error');
    } finally {
      setIsImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else { current += char; }
    }
    result.push(current);
    return result;
  };

  const filteredMembers = members.filter(m => {
    if (filterPlan !== 'All Plans' && m.plans?.name !== filterPlan) return false;
    if (filterStatus === 'All Status') return true;
    const daysLeft = getDaysLeft(m.expiry_date);
    const hasExpiry = daysLeft !== null;
    switch (filterStatus) {
      case 'Active': return m.status === 'ACTIVE' && (!hasExpiry || daysLeft >= 0);
      case 'Expired': return hasExpiry && daysLeft < 0;
      case 'Expiring Soon': return hasExpiry && daysLeft >= 0 && daysLeft <= 7;
      case 'Payment Due': return ((m as any).due_amount || 0) > 0;
      default: return true;
    }
  }).sort((a, b) => {
    if (isDemoMode) {
      const { key, direction } = sortConfig;
      let valA: any = (a as any)[key] || '';
      let valB: any = (b as any)[key] || '';
      if (key === 'expiry_date' || key === 'join_date' || key === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <UsageLimitBanner resource="members" className="mb-2" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Members</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">{totalCount} registered members</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} disabled={isExporting} className="flex items-center justify-center gap-2 rounded-xl h-11 px-3 sm:px-4 bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-lg">download</span>
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          <button onClick={() => csvInputRef.current?.click()} disabled={isImporting} className="flex items-center justify-center gap-2 rounded-xl h-11 px-3 sm:px-4 bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-lg">upload</span>
            <span className="hidden sm:inline">{isImporting ? 'Importing...' : 'Import Members'}</span>
          </button>
          <UsageLimitGuard resource="members">
            <button onClick={openAddModal} className="flex items-center gap-2 rounded-xl h-11 px-4 sm:px-5 bg-accent-default text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg">person_add</span>
              <span className="hidden xs:inline">Add</span>
            </button>
          </UsageLimitGuard>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); (document.activeElement as HTMLElement)?.blur?.(); }} className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">search</span>
          <input 
            value={searchQuery} 
            onChange={(e) => { 
                const val = e.target.value;
                setSearchQuery(val); 
                setPage(1); 
                if (val) setSearchParams({ q: val }, { replace: true });
                else setSearchParams({}, { replace: true });
            }} 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all text-neutral-text dark:text-white placeholder:text-slate-400" placeholder="Search by name, email or phone..." />
        </form>
        <div className="flex gap-3">
          <div className="flex-1 sm:flex-none relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">package</span>
            <select value={filterPlan} onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }} className="w-full sm:w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all appearance-none cursor-pointer text-neutral-text dark:text-white" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}>
              <option value="All Plans">All Plans</option>
              {plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex-1 sm:flex-none relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">filter_list</span>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="w-full sm:w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all appearance-none cursor-pointer text-neutral-text dark:text-white" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}>
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Payment Due">Payment Due</option>
            </select>
          </div>
        </div>
      </div>



      {tableError ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
          <EmptyState icon="error" title="Data Load Failed" description={tableError} />
          <button onClick={() => { setTableError(null); fetchMembers(); }} className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">Try Again</button>
        </div>
      ) : (
        <MembersTable
          loading={loading} members={filteredMembers} searchQuery={searchQuery} sortConfig={sortConfig}
          onSort={(key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }))}
          onEdit={openEditModal} onDelete={handleDelete} page={page} totalPages={totalPages} totalCount={totalCount} setPage={setPage}
        />
      )}

      <MemberModal isOpen={showAddModal} isEditing={!!editingMember} formData={formData} setFormData={setFormData} plans={plans} isSubmitting={isSubmitting} onSubmit={handleSubmit} onClose={handleCloseModal} />
      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
}
