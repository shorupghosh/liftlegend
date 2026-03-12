import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useToast } from '../components/ToastProvider';
import { Member, Plan } from '../types';

const PAGE_SIZE = 50;

interface ConfirmModal {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function MembersManagement() {
  const { gymId } = useAuth();
  const { showToast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Partial<Plan>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    if (!gymId) return;
    setLoading(true);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const [membersRes, plansRes] = await Promise.all([
        supabase
          .from('members')
          .select('*, plans(name, price)', { count: 'exact' })
          .eq('gym_id', gymId)
          .order('created_at', { ascending: false })
          .range(from, to),
        supabase
          .from('plans')
          .select('id, name, price')
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
  }, [gymId, page, showToast]);

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
    if (!gymId) return;

    if (formData.full_name.trim().length < 2) {
      showToast('Name must be at least 2 characters.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMember) {
        const { error } = await supabase
          .from('members')
          .update({
            full_name: formData.full_name.trim(),
            email: formData.email || null,
            phone: formData.phone || null,
            plan_id: formData.plan_id || null,
          })
          .eq('id', editingMember.id);

        if (error) throw error;
        showToast('Member updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('members')
          .insert([{
            gym_id: gymId,
            full_name: formData.full_name.trim(),
            email: formData.email || null,
            phone: formData.phone || null,
            plan_id: formData.plan_id || null,
            status: 'ACTIVE'
          }]);

        if (error) throw error;
        showToast('Member added successfully!', 'success');
      }

      handleCloseModal();
      fetchMembers();
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
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const { error } = await supabase.from('members').delete().eq('id', member.id);
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
    if (!gymId) return;
    setIsExporting(true);
    try {
      // Fetch ALL members (not just current page)
      const { data, error } = await supabase
        .from('members')
        .select('full_name, email, phone, status, created_at, plans(name)')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        showToast('No members to export.', 'error');
        return;
      }

      const headers = ['Full Name', 'Email', 'Phone', 'Plan', 'Status', 'Joined Date'];
      const rows = data.map((m: any) => [
        `"${(m.full_name || '').replace(/"/g, '""')}"`,
        `"${(m.email || '').replace(/"/g, '""')}"`,
        `"${(m.phone || '').replace(/"/g, '""')}"`,
        `"${(m.plans?.name || 'No Plan').replace(/"/g, '""')}"`,
        m.status || 'ACTIVE',
        new Date(m.created_at).toLocaleDateString(),
      ]);

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

  const filteredMembers = members.filter(m =>
    m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone?.includes(searchQuery)
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
            Members
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Directory of all registered gym members and their subscription status.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* CSV Download */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl h-11 px-4 bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            {isExporting ? 'Exporting...' : 'Download CSV'}
          </button>

          {/* CSV Upload */}
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <button
            onClick={() => csvInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 rounded-xl h-11 px-4 bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">upload</span>
            {isImporting ? 'Importing...' : 'Upload CSV'}
          </button>

          {/* Add Member */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl h-11 px-5 bg-accent-default text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Add Member
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            id="member-search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
            placeholder="Search by name, email or phone..."
            aria-label="Search members"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Member</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell">Joined</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex justify-center"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    {searchQuery ? 'No members match your search.' : 'No members found. Add your first member!'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary-default/10 flex items-center justify-center text-primary-default font-bold text-sm">
                          {member.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <Link to={`/admin/members/${member.id}`} className="font-semibold text-sm text-primary-default hover:underline block">{member.full_name}</Link>
                          <span className="text-xs text-slate-500">{member.email || member.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {member.plans ? (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {member.plans.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No Plan</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {member.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" />Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/20 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                          <span className="size-1.5 rounded-full bg-red-500" />{member.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 text-slate-400 hover:text-primary-default hover:bg-primary-default/10 rounded-lg transition-colors"
                          title="Edit member"
                          aria-label={`Edit ${member.full_name}`}
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(member)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                          title="Delete member"
                          aria-label={`Delete ${member.full_name}`}
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer — Pagination */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <span className="text-sm text-slate-500">
            {searchQuery ? `${filteredMembers.length} results` : `${totalCount} total members`}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 id="member-modal-title" className="text-lg font-bold text-neutral-text dark:text-white">
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label htmlFor="member-name" className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  id="member-name"
                  required
                  minLength={2}
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  type="text"
                  placeholder="Enter full name"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="member-email" className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  id="member-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  type="email"
                  placeholder="Optional"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="member-phone" className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone</label>
                <input
                  id="member-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  type="tel"
                  pattern="^[+\-0-9\s]*$"
                  title="Phone number can only contain numbers, spaces, plus, and minus signs"
                  placeholder="Optional"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="member-plan" className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Plan</label>
                <select
                  id="member-plan"
                  value={formData.plan_id}
                  onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                >
                  <option value="">No Plan</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name} (৳{plan.price})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 h-11 rounded-xl font-bold text-white bg-primary-default hover:brightness-110 transition-all shadow-lg shadow-primary-default/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : editingMember ? 'Update Member' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled Confirm Modal */}
      {confirmModal.isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-600 text-2xl">delete_forever</span>
            </div>
            <h3 className="text-lg font-bold text-center text-neutral-text dark:text-white mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-slate-500 text-center mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 h-11 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
