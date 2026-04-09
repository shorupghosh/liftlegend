import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
import { ImportSummaryModal } from '../components/members/ImportSummaryModal';
import { MembersTable } from '../components/members/MembersTable';
import { AlertBadge } from '../components/ui/AlertBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { getMemberExpiryAlert, calculateExpiryDate, getDaysLeft } from '../lib/memberExpiry';
import { useDemoData } from '../contexts/DemoDataContext';
import { useDemoMode } from '../hooks/useDemoMode';
import { useDebounce } from '../hooks/useDebounce';
import UsageLimitBanner, { UsageLimitGuard } from '../components/plan/UsageLimitBanner';

const PAGE_SIZE = 50;



interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  requireVerification?: string;
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
  const [importSummary, setImportSummary] = useState<any>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    member_number: '',
    plan_id: '',
    join_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
  });

  useEffect(() => {
    // Standard effect: when plan OR join_date changes, we update the expiry_date automatically
    // BUT only if calculating it yields a different result than what's already there (to avoid infinite loops)
    const selectedPlan = plans.find(p => p.id === formData.plan_id);
    if (selectedPlan?.duration_days && formData.join_date) {
      const calculatedExpiry = calculateExpiryDate(formData.join_date, selectedPlan.duration_days);
      // We only auto-fill if it's currently empty (e.g. adding new member) or if the plan has changed
      // To keep it simple: if plan exists, we show it.
      if (!formData.expiry_date || (editingMember ? (editingMember.plan_id !== formData.plan_id) : true)) {
         setFormData(prev => ({ ...prev, expiry_date: calculatedExpiry }));
      }
    }
  }, [formData.plan_id, formData.join_date, plans, editingMember]);

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
        .select('id, gym_id, full_name, email, phone, status, join_date, expiry_date, created_at, member_number, plan_id, plan_name, plans(name, price, duration_days)', { count: 'exact' })
        .eq('gym_id', gymId)
        .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

      if (debouncedSearch) {
        query = query.or(`full_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`);
      }

      if (filterPlan !== 'All Plans') {
        if (filterPlan === 'No Plan') {
          query = query.is('plan_id', null);
        } else {
          const planMatch = plans.find(p => p.name === filterPlan);
          if (planMatch) query = query.eq('plan_id', planMatch.id);
        }
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
         const { data: unpaidMembers } = await supabase.rpc('get_unpaid_member_ids', { gym_id_input: gymId });
         const unpaidIds = unpaidMembers?.map((r: any) => r.member_id) || [];
         if (unpaidIds.length > 0) {
           query = query.in('id', unpaidIds);
         } else {
           query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // Force no results
         }
      }

      query = query.range(from, to);

      const [membersRes, plansRes] = await Promise.all([
        query,
        supabase.from('plans').select('id, name, price, duration_days').eq('gym_id', gymId)
      ]);

      if (membersRes.error) throw membersRes.error;
      if (plansRes.error) throw plansRes.error;

      // Fetch last payment for each member from membership_history
      const memberIds = (membersRes.data || []).map((m: any) => m.id);
      let paymentMap: Record<string, number> = {};
      if (memberIds.length > 0) {
        const { data: payments } = await supabase
          .from('membership_history')
          .select('member_id, price_paid, created_at')
          .eq('gym_id', gymId)
          .in('member_id', memberIds)
          .order('created_at', { ascending: false });
        if (payments) {
          for (const p of payments) {
            if (!paymentMap[p.member_id]) {
              paymentMap[p.member_id] = Number(p.price_paid);
            }
          }
        }
      }

      const membersWithPayment = (membersRes.data || []).map((m: any) => ({
        ...m,
        last_payment: paymentMap[m.id] ?? undefined,
      }));

      setMembers(membersWithPayment);
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
    setFormData({ full_name: '', email: '', phone: '', member_number: '', plan_id: '', join_date: new Date().toISOString().split('T')[0], expiry_date: '' });
    setEditingMember(null);
  };

  const openAddModal = async () => {
    resetForm();
    setShowAddModal(true);
    
    // Auto-detect next member number (Starting from 001)
    try {
      let nextNum = 1;
      if (isDemoMode) {
        const numbers = demoState.members
          .map(m => parseInt(m.member_number?.replace(/[^0-9]/g, '') || '0'))
          .filter(n => !isNaN(n) && n > 0);
        if (numbers.length > 0) {
          nextNum = Math.max(0, ...numbers) + 1;
        }
      } else if (gymId) {
        const { data } = await supabase
          .from('members')
          .select('member_number')
          .eq('gym_id', gymId)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (data && data.length > 0) {
          const numbers = data
            .map(m => parseInt(m.member_number?.replace(/[^0-9]/g, '') || '0'))
            .filter(n => !isNaN(n) && n > 0);
          if (numbers.length > 0) {
            nextNum = Math.max(0, ...numbers) + 1;
          }
        }
      }
      // Pad to 3 digits (e.g., 001, 002)
      setFormData(prev => ({ ...prev, member_number: nextNum.toString().padStart(3, '0') }));
    } catch (err) {
      console.warn('Could not auto-generate member ID', err);
    }
  };
  const openEditModal = (member: any) => {
    setEditingMember(member);
    setFormData({
      full_name: member.full_name || '',
      email: member.email || '',
      phone: member.phone || '',
      member_number: member.member_number || '',
      plan_id: member.plan_id || '',
      join_date: member.join_date ? member.join_date.split('T')[0] : new Date().toISOString().split('T')[0],
      expiry_date: member.expiry_date ? member.expiry_date.split('T')[0] : '',
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
            member_number: formData.member_number || undefined,
            plan_id: formData.plan_id || undefined,
            join_date: formData.join_date,
            expiry_date: formData.expiry_date || undefined,
          });
          showToast('Member updated in demo.', 'info');
        } else {
          addMember({
            full_name: formData.full_name.trim(),
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            member_number: formData.member_number || undefined,
            plan_id: formData.plan_id || undefined,
            join_date: formData.join_date,
            expiry_date: formData.expiry_date || undefined,
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
          member_number: formData.member_number || null,
          plan_id: formData.plan_id || null,
          join_date: formData.join_date || null,
          expiry_date: formData.expiry_date || null,
          status: 'ACTIVE',
        };
        const { error } = await supabase.from('members').update(updatePayload).eq('id', editingMember.id).eq('gym_id', gymId);
        if (error) throw error;
        await supabase.from('notifications').insert([{
          gym_id: gymId, type: 'general', title: 'Member Profile Updated', message: `${formData.full_name.trim()}'s profile was updated.`
        }]);
        showToast('Member updated!', 'success');
      } else {
        const { data: newMem, error } = await supabase.from('members').insert([{
          gym_id: gymId,
          full_name: formData.full_name.trim(),
          email: formData.email || null,
          phone: formData.phone || null,
          member_number: formData.member_number || null,
          plan_id: formData.plan_id || null,
          join_date: formData.join_date,
          expiry_date: formData.expiry_date || null,
          status: 'ACTIVE'
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
      const { generateCSVContent, triggerCSVDownload } = await import('../utils/csv');
      const headers = ['Full Name', 'Email', 'Phone', 'Plan', 'Status', 'Joined Date', 'Expiry Date', 'Alert'];
      const rows = dataToExport.map((m: any) => {
        const alert = getMemberExpiryAlert(m.expiry_date);
        return [
          m.full_name || '',
          m.email || '',
          m.phone || '',
          m.plans?.name || 'No Plan',
          m.status || 'ACTIVE',
          new Date(m.created_at).toLocaleDateString('en-GB'),
          m.expiry_date ? new Date(m.expiry_date).toLocaleDateString('en-GB') : 'N/A',
          alert.label,
        ];
      });
      const csvContent = generateCSVContent(headers, rows);
      triggerCSVDownload(csvContent, `members_${new Date().toISOString().slice(0, 10)}.csv`);
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
      const { parseCSVLine } = await import('../utils/csv');
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
      const memberIdIdx = headers.findIndex(h => h === 'id' || h === 'no' || h === 'number' || h.includes('member id') || h.includes('member no') || h.includes('member number'));
      const joinDateIdx = headers.findIndex(h => h.includes('join') || h.includes('start') || h.includes('date'));
      const expiryDateIdx = headers.findIndex(h => h.includes('expiry') || h.includes('end') || h.includes('valid'));
      const paidIdx = headers.findIndex(h => h.includes('paid') || h.includes('amount') || h.includes('payment') || h.includes('price'));
      const planMap: Record<string, Partial<Plan>> = {};
      plans.forEach(p => { if (p.name && p.id) planMap[p.name.toLowerCase()] = p; });

      const emailRegex = /^\S+@\S+\.\S+$/;
      const phoneSet = new Set(members.map(m => m.phone).filter(Boolean));
      const emailSet = new Set(members.map(m => m.email).filter(Boolean));

      const stats = { total: lines.length - 1, imported: 0, skipped: 0, failed: 0, unrecognizedPlans: 0, errors: [] as string[] };
      const newMembers: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        const fullName = row[nameIdx]?.trim();
        const email = emailIdx >= 0 ? (row[emailIdx]?.trim() || null) : null;
        let phone = phoneIdx >= 0 ? (row[phoneIdx]?.trim() || null) : null;
        const planName = planIdx >= 0 ? row[planIdx]?.trim() : '';
        const memberNumber = memberIdIdx >= 0 ? row[memberIdIdx]?.trim() : null;
        const rawJoinDate = joinDateIdx >= 0 ? row[joinDateIdx]?.trim() : '';
        const rawExpiryDate = expiryDateIdx >= 0 ? row[expiryDateIdx]?.trim() : '';
        const rawPaid = paidIdx >= 0 ? row[paidIdx]?.trim() : '';

        if (!fullName || fullName.length < 2) {
          stats.failed++;
          stats.errors.push(`Row ${i + 1}: Missing or invalid full name`);
          continue;
        }

        if (email && !emailRegex.test(email)) {
          stats.failed++;
          stats.errors.push(`Row ${i + 1} (${fullName}): Invalid email format`);
          continue;
        }

        // Basic phone cleanup - allow empty or short phones
        if (phone) {
          phone = phone.replace(/[^0-9+]/g, '');
          if (phone.length === 0) phone = null;
        }

        if (phone && phoneSet.has(phone)) {
          stats.skipped++;
          stats.errors.push(`Row ${i + 1} (${fullName}): Duplicate phone number`);
          continue;
        }

        if (email && emailSet.has(email)) {
          stats.skipped++;
          stats.errors.push(`Row ${i + 1} (${fullName}): Duplicate email`);
          continue;
        }

        // Match plan by name if possible, otherwise just store as plan_name text
        const matchedPlan = planName && planMap[planName.toLowerCase()] ? planMap[planName.toLowerCase()] : null;
        const matchedPlanId = matchedPlan?.id || null;
        const status = statusIdx >= 0 ? row[statusIdx]?.trim().toUpperCase() : 'ACTIVE';

        if (planName && !matchedPlanId) {
          stats.unrecognizedPlans++;
          stats.errors.push(`Row ${i + 1} (${fullName}): Plan "${planName}" not recognized. Please link via "Edit Member" later.`);
        }

        // Parse join date - try multiple formats (DD/MM/YYYY, YYYY-MM-DD, MM/DD/YYYY)
        let joinDate: string | null = null;
        if (rawJoinDate) {
          // Try DD/MM/YYYY or DD-MM-YYYY
          const ddmmyyyy = rawJoinDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
          if (ddmmyyyy) {
            const [, dd, mm, yyyy] = ddmmyyyy;
            joinDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
          } else {
            // Try YYYY-MM-DD
            const isoMatch = rawJoinDate.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
            if (isoMatch) {
              const [, yyyy, mm, dd] = isoMatch;
              joinDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
            }
          }
        }

        const finalJoinDate = joinDate || new Date().toISOString().split('T')[0];

        // Parse expiry date if in CSV
        let expiryDate: string | null = null;
        if (rawExpiryDate) {
          const ddmmyyyy = rawExpiryDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
          if (ddmmyyyy) {
            const [, dd, mm, yyyy] = ddmmyyyy;
            expiryDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
          } else {
            const isoMatch = rawExpiryDate.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
            if (isoMatch) {
              const [, yyyy, mm, dd] = isoMatch;
              expiryDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
            }
          }
        }

        // Auto-calculate expiry if not in CSV or invalid
        if (!expiryDate && finalJoinDate) {
          let duration = matchedPlan?.duration_days;
          if (!duration) {
            const lowerPlan = (planName || '').toLowerCase();
            if (lowerPlan.includes('one month')) duration = 30;
            else if (lowerPlan.includes('three month')) duration = 90;
            else if (lowerPlan.includes('six month')) duration = 180;
            else if (lowerPlan.includes('one year')) duration = 365;
            else if (lowerPlan.includes('165')) duration = 165;
            else duration = 30; // Final default
          }
          expiryDate = calculateExpiryDate(finalJoinDate, duration);
        }

        if (phone) phoneSet.add(phone);
        if (email) emailSet.add(email);
        stats.imported++;

        // Parse paid amount
        let paidAmount: number | null = null;
        if (rawPaid) {
          const cleaned = rawPaid.replace(/[^0-9.]/g, '');
          const parsed = parseFloat(cleaned);
          if (!isNaN(parsed) && parsed > 0) paidAmount = parsed;
        }

        const memberRecord: any = {
          gym_id: gymId, full_name: fullName, email,
          phone: phone || null,
          member_number: memberNumber,
          plan_id: matchedPlanId,
          plan_name: planName || null,
          join_date: finalJoinDate,
          expiry_date: expiryDate,
          status: ['ACTIVE', 'INACTIVE', 'FROZEN'].includes(status) ? status : 'ACTIVE',
        };

        newMembers.push({ memberRecord, paidAmount });
      }

      if (newMembers.length > 0) {
        let allImported: any[] = [];

        if (isDemoMode) {
          // In demo mode, simulate the insertion and update local state via context
          newMembers.forEach(({ memberRecord, paidAmount }) => {
            const added = addMember({
              full_name: memberRecord.full_name,
              email: memberRecord.email || undefined,
              phone: memberRecord.phone || undefined,
              member_number: memberRecord.member_number || undefined,
              plan_id: memberRecord.plan_id || undefined,
              join_date: memberRecord.join_date,
            });
            // We manually override the expiry if provided or calculated
            if (memberRecord.expiry_date) {
               updateMember(added.id, { expiry_date: memberRecord.expiry_date, plan_name: memberRecord.plan_name });
            }
            allImported.push({ ...added, plan_id: memberRecord.plan_id, join_date: memberRecord.join_date, expiry_date: memberRecord.expiry_date, paidAmount });
          });
          showToast(`Imported ${newMembers.length} members to demo data.`, 'success');
        } else {
          const allInserted: any[] = [];
          for (let i = 0; i < newMembers.length; i += 50) {
            const batch = newMembers.slice(i, i + 50).map((item: any) => item.memberRecord);
            const { data: inserted, error } = await supabase.from('members').insert(batch).select('id, plan_id, join_date, expiry_date, plan_name');
            if (error) throw error;
            if (inserted) allInserted.push(...inserted.map((m: any, idx: number) => ({ ...m, paidAmount: newMembers[i + idx].paidAmount })));
          }

          // Insert payment records into membership_history for members that had a paid amount
          const paymentRecords = allInserted
            .filter((m: any) => m.paidAmount && m.paidAmount > 0)
            .map((m: any) => ({
              gym_id: gymId,
              member_id: m.id,
              plan_id: m.plan_id || null,
              start_date: m.join_date,
              end_date: m.join_date, // This is just recording the payment date
              price_paid: m.paidAmount,
              payment_method: 'CASH',
            }));

          if (paymentRecords.length > 0) {
            for (let i = 0; i < paymentRecords.length; i += 50) {
              const batch = paymentRecords.slice(i, i + 50);
              await supabase.from('membership_history').insert(batch);
            }
          }
          fetchMembers();
        }
      }
      setImportSummary(stats);

    } catch (error: any) {
      showToast(error.message || 'Import failed.', 'error');
    } finally {
      setIsImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (filterPlan !== 'All Plans') {
        if (filterPlan === 'No Plan') {
          if (m.plans?.name || m.plan_id) return false;
        } else {
          if (m.plans?.name !== filterPlan) return false;
        }
      }
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
  }, [members, filterPlan, filterStatus, isDemoMode, sortConfig]);

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
        {(filterPlan !== 'All Plans' || filterStatus !== 'All Status' || searchQuery !== '') && (
          <button 
            onClick={() => { setFilterPlan('All Plans'); setFilterStatus('All Status'); setSearchQuery(''); setPage(1); setSearchParams({}, { replace: true }); }}
            className="flex items-center justify-center h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
          >
            <span className="material-symbols-outlined mr-2">restart_alt</span>
            Reset
          </button>
        )}
        <div className="flex gap-3">
          <div className="flex-1 sm:flex-none relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">package</span>
            <select value={filterPlan} onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }} className="w-full sm:w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 pl-10 pr-10 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all appearance-none cursor-pointer text-neutral-text dark:text-white" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}>
              <option value="All Plans">All Plans</option>
              <option value="No Plan">No Plan</option>
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
          <ErrorState title="Data Load Failed" message={tableError} onRetry={() => { setTableError(null); fetchMembers(); }} />

        </div>
      ) : (
        <MembersTable
          loading={loading} members={filteredMembers} searchQuery={searchQuery} sortConfig={sortConfig}
          onSort={(key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }))}
          onEdit={openEditModal} onDelete={handleDelete} page={page} totalPages={totalPages} totalCount={totalCount} setPage={setPage}
        />
      )}

      <MemberModal isOpen={showAddModal} isEditing={!!editingMember} formData={formData} setFormData={setFormData} plans={plans} isSubmitting={isSubmitting} onSubmit={handleSubmit} onClose={handleCloseModal} />
      <ImportSummaryModal
        isOpen={!!importSummary}
        summary={importSummary}
        onClose={() => setImportSummary(null)}
        onDownloadErrors={() => {
          const blob = new Blob([importSummary.errors.join('\n')], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'import-errors.txt';
          a.click();
        }}
      />
      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} requireVerification={confirmModal.requireVerification} isDestructive={true} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
}
