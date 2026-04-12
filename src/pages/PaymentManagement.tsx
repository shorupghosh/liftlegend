import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useToast } from '../components/ToastProvider';
import { PaymentModal } from '../components/payments/PaymentModal';
import { PaymentsTable } from '../components/payments/PaymentsTable';
import { ErrorState } from '../components/ui/ErrorState';
import { useDemoData } from '../contexts/DemoDataContext';
import { useDemoMode } from '../hooks/useDemoMode';
import { useDebounce } from '../hooks/useDebounce';
import { formatBdt } from '../lib/currency';
import { Payment, Member, Plan } from '../types';

const PaymentSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-1/4" />
      </div>
      <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
  </div>
);

type MemberLite = Partial<Member> & { due_amount?: number };
type ReceiptRecord = {
  id: string;
  created_at: string;
  member_name: string;
  member_phone: string;
  plan_name: string;
  amount_paid: number;
  amount_due: number;
  payment_method: string;
  start_date: string;
  end_date: string;
};

const ITEMS_PER_PAGE = 20;
const PAYMENT_METHODS = ['CASH', 'CARD', 'BKASH', 'BANK_TRANSFER'] as const;

function paymentMethodLabel(method: string) {
  if (method === 'BKASH') return 'bKash';
  if (method === 'BANK_TRANSFER') return 'Bank Transfer';
  return method;
}

function methodSortValue(method: string) {
  if (method === 'CASH') return 0;
  if (method === 'BKASH') return 1;
  if (method === 'CARD') return 2;
  return 3;
}



function downloadReceipt(receipt: ReceiptRecord) {
  const lines = [
    `==============================`,
    `     GYM PAYMENT RECEIPT`,
    `==============================`,
    ``,
    `Receipt ID : ${receipt.id}`,
    `Date       : ${new Date(receipt.created_at).toLocaleString('en-GB')}`,
    `------------------------------`,
    `Member     : ${receipt.member_name}`,
    `Phone      : ${receipt.member_phone || 'N/A'}`,
    `Plan       : ${receipt.plan_name}`,
    `------------------------------`,
    `Paid       : ${formatBdt(receipt.amount_paid)}`,
    `Due        : ${formatBdt(receipt.amount_due)}`,
    `Method     : ${paymentMethodLabel(receipt.payment_method)}`,
    `------------------------------`,
    `Valid From : ${new Date(receipt.start_date).toLocaleDateString('en-GB')}`,
    `Valid To   : ${new Date(receipt.end_date).toLocaleDateString('en-GB')}`,
    ``,
    `==============================`,
    `         THANK YOU!`,
    `==============================`
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${receipt.id}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildWhatsAppReceiptMessage(receipt: ReceiptRecord) {
  return [
    `🏋️ Gym Payment Receipt`,
    `-------------------------`,
    `🔖 Receipt No: ${receipt.id}`,
    `👤 Member: ${receipt.member_name}`,
    receipt.member_phone ? `📞 Phone: ${receipt.member_phone}` : '',
    `📋 Plan: ${receipt.plan_name}`,
    `-------------------------`,
    `✅ Paid: ${formatBdt(receipt.amount_paid)}`,
    receipt.amount_due > 0 ? `⚠️ Due: ${formatBdt(receipt.amount_due)}` : `🌟 Due: Fully Paid`,
    `💳 Method: ${paymentMethodLabel(receipt.payment_method)}`,
    `📅 Valid: ${new Date(receipt.start_date).toLocaleDateString('en-GB')} to ${new Date(receipt.end_date).toLocaleDateString('en-GB')}`,
    `-------------------------`,
    `Thank you for your payment!`
  ].filter(Boolean).join('\n');
}

export default function PaymentManagement() {
  const { gymId } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { state: demoState, addPayment } = useDemoData();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<MemberLite[]>([]);
  const [plans, setPlans] = useState<Partial<Plan>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [filterMethod, setFilterMethod] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [latestReceipt, setLatestReceipt] = useState<ReceiptRecord | null>(null);
  const [formData, setFormData] = useState({
    member_id: '',
    plan_id: '',
    price_paid: '',
    payment_method: 'CASH',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const resetForm = useCallback(() => {
    setFormData({
      member_id: '',
      plan_id: '',
      price_paid: '',
      payment_method: 'CASH',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
    });
  }, []);

  const getPlanById = useCallback(
    (planId: string) => plans.find((plan) => plan.id === planId),
    [plans]
  );

  const calculateEndDate = useCallback(
    (startDateStr: string, planId: string): string => {
      const selectedPlan = getPlanById(planId);
      if (!selectedPlan || !startDateStr) return '';
      const duration = Number(selectedPlan.duration_days || 30);
      const startDate = new Date(startDateStr);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration);
      return endDate.toISOString().split('T')[0];
    },
    [getPlanById]
  );

  const planAmount = useMemo(() => {
    const selectedPlan = getPlanById(formData.plan_id);
    return Number(selectedPlan?.price || 0);
  }, [formData.plan_id, getPlanById]);

  const paidAmount = useMemo(() => Number(formData.price_paid || 0), [formData.price_paid]);
  const modalDueAmount = useMemo(() => Math.max(0, planAmount - paidAmount), [paidAmount, planAmount]);

  const memberOutstandingMap = useMemo(() => {
    const map = new Map<string, number>();

    const sorted = [...payments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    sorted.forEach((payment) => {
      if (map.has(payment.member_id)) return;
      const planPrice = Number(plans.find((plan) => plan.id === payment.plan_id)?.price || payment.price_paid);
      map.set(payment.member_id, Math.max(0, planPrice - Number(payment.price_paid || 0)));
    });

    members.forEach((member) => {
      if (!member.id || map.has(member.id)) return;
      if (typeof member.due_amount === 'number' && member.due_amount > 0) {
        map.set(member.id, member.due_amount);
      }
    });

    return map;
  }, [members, payments, plans]);

  const collectionSummary = useMemo(() => {
    const summary = new Map<string, number>();
    PAYMENT_METHODS.forEach((method) => summary.set(method, 0));

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    payments.forEach((payment) => {
      const timestamp = new Date(payment.created_at).getTime();
      if (timestamp < todayStart || timestamp >= todayEnd) return;
      summary.set(payment.payment_method, (summary.get(payment.payment_method) || 0) + Number(payment.price_paid || 0));
    });

    const items = [...summary.entries()]
      .filter(([, value]) => value > 0)
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => methodSortValue(a.method) - methodSortValue(b.method));

    const total = items.reduce((sum, entry) => sum + entry.amount, 0);
    return { items, total };
  }, [payments]);

  const fetchPayments = useCallback(async () => {
    if (!gymId && !isDemoMode) return;
    setLoading(true);
    setTableError(null);
    try {
      if (isDemoMode) {
        let filtered = demoState.payments;
        if (debouncedSearch) {
          const s = debouncedSearch.toLowerCase();
          filtered = filtered.filter(p => 
            p.id.toLowerCase().includes(s) || 
            (p as any).member_name?.toLowerCase().includes(s)
          );
        }
        setPayments(filtered);
        setTotalCount(filtered.length);
        setLoading(false);
        return;
      }

      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // START OPTIMIZED QUERY
      let query = supabase
        .from('membership_history')
        .select(`
          id, 
          created_at, 
          member_id, 
          plan_id, 
          price_paid, 
          payment_method, 
          start_date, 
          end_date, 
          members(full_name, phone), 
          plans(name, price)
        `, { count: 'exact' })
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (debouncedSearch) {
        query = query.ilike('id', `%${debouncedSearch}%`);
      }

      if (filterMethod) {
        query = query.eq('payment_method', filterMethod);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      setPayments((data || []) as any[]);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setTableError((error as any).message || 'Failed to load payments.');
      showToast('Failed to load payments.', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, demoState.payments, filterMethod, gymId, isDemoMode, page, showToast]);

  const fetchFormData = useCallback(async () => {
    if (!gymId && !isDemoMode) return;
    try {
      if (isDemoMode) {
        setMembers(
          demoState.members
            .map((member) => ({
              ...member,
              due_amount: Number((member as any).dueAmount || 0),
            }))
        );
        setPlans(demoState.plans);
        return;
      }

      const [membersRes, plansRes] = await Promise.all([
        supabase
          .from('members')
          .select('id, full_name, phone, plan_id')
          .eq('gym_id', gymId),
        supabase.from('plans').select('id, name, price, duration_days').eq('gym_id', gymId),
      ]);

      setMembers((membersRes.data || []) as MemberLite[]);
      setPlans(plansRes.data || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
      showToast('Failed to load members or plans.', 'error');
    }
  }, [demoState.members, demoState.plans, gymId, isDemoMode, showToast]);

  useEffect(() => {
    fetchPayments();
    fetchFormData();
  }, [fetchPayments, fetchFormData]);

  useRealtimeSubscription({ table: 'membership_history', gymId, onChange: fetchPayments });

  useEffect(() => {
    const memberId = searchParams.get('memberId');
    if (!memberId || members.length === 0) return;

    const targetMember = members.find((entry) => entry.id === memberId);
    if (!targetMember) return;

    const planId = targetMember.plan_id || '';
    setShowAddModal(true);
    setFormData((current) => ({
      ...current,
      member_id: memberId,
      plan_id: planId,
      price_paid: planId ? String(Number(getPlanById(planId)?.price || 0)) : current.price_paid,
      end_date: planId ? calculateEndDate(current.start_date, planId) : current.end_date,
    }));
  }, [calculateEndDate, getPlanById, members, searchParams]);

  const handlePlanChange = (planId: string) => {
    const selectedPlan = getPlanById(planId);
    setFormData((previous) => ({
      ...previous,
      plan_id: planId,
      price_paid: selectedPlan ? String(Number(selectedPlan.price || 0)) : previous.price_paid,
      end_date: calculateEndDate(previous.start_date, planId),
    }));
  };

  const handleStartDateChange = (startDate: string) => {
    setFormData((previous) => ({
      ...previous,
      start_date: startDate,
      end_date: previous.plan_id ? calculateEndDate(startDate, previous.plan_id) : previous.end_date,
    }));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const getPaymentDueAmount = useCallback(
    (payment: Payment) => {
      const planPrice = Number(plans.find((plan) => plan.id === payment.plan_id)?.price || payment.price_paid || 0);
      return Math.max(0, planPrice - Number(payment.price_paid || 0));
    },
    [plans]
  );

  const prepareReceipt = useCallback(
    (payment: Payment) => {
      const member = members.find((entry) => entry.id === payment.member_id);
      const dueAmount = getPaymentDueAmount(payment);
      return {
        id: `RCP-${new Date(payment.created_at).getTime()}`,
        created_at: payment.created_at,
        member_name: payment.members?.full_name || member?.full_name || 'Unknown Member',
        member_phone: (payment as any).members?.phone || member?.phone || '',
        plan_name: payment.plans?.name || plans.find((plan) => plan.id === payment.plan_id)?.name || 'Custom Plan',
        amount_paid: Number(payment.price_paid || 0),
        amount_due: dueAmount,
        payment_method: payment.payment_method,
        start_date: payment.start_date,
        end_date: payment.end_date,
      } satisfies ReceiptRecord;
    },
    [getPaymentDueAmount, members, plans]
  );

  const handleRecordPayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      showToast('End date cannot be before start date.', 'error');
      return;
    }

    if (Number(formData.price_paid) < 0) {
      showToast('Payment amount cannot be negative.', 'error');
      return;
    }

    if (isDemoMode) {
      addPayment({
        member_id: formData.member_id,
        plan_id: formData.plan_id,
        price_paid: Number(formData.price_paid),
        payment_method: formData.payment_method,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });

      const member = members.find((entry) => entry.id === formData.member_id);
      const plan = plans.find((entry) => entry.id === formData.plan_id);
      const demoPayment: Payment = {
        id: `demo-${Date.now()}`,
        gym_id: gymId || 'demo-gym-id',
        member_id: formData.member_id,
        plan_id: formData.plan_id,
        price_paid: Number(formData.price_paid),
        payment_method: formData.payment_method,
        start_date: formData.start_date,
        end_date: formData.end_date,
        created_at: new Date().toISOString(),
        members: { full_name: member?.full_name || 'Unknown Member' },
        plans: { name: plan?.name || 'Custom Plan' },
      };

      const receipt = prepareReceipt(demoPayment);
      setLatestReceipt(receipt);
      showToast(
        receipt.amount_due > 0
          ? `Partial payment recorded. Remaining due: ${formatBdt(receipt.amount_due)}`
          : 'Payment recorded. This is demo mode and changes are not persisted.',
        'info'
      );
      handleCloseModal();
      return;
    }

    if (!gymId) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('membership_history')
        .insert([
          {
            gym_id: gymId,
            member_id: formData.member_id,
            plan_id: formData.plan_id,
            price_paid: Number(formData.price_paid),
            payment_method: formData.payment_method,
            start_date: formData.start_date,
            end_date: formData.end_date,
          },
        ])
        .select('*, members(full_name, phone), plans(name, price)')
        .single();

      if (error) throw error;

      // Update the member's current plan, expiry, and due amount
      const { error: memberUpdateError } = await supabase
        .from('members')
        .update({
          plan_id: formData.plan_id,
          expiry_date: formData.end_date,
          due_amount: modalDueAmount,
          status: 'ACTIVE'
        })
        .eq('id', formData.member_id)
        .eq('gym_id', gymId);

      if (memberUpdateError) {
        console.error('Failed to update member status:', memberUpdateError);
      }

      await supabase.from('notifications').insert([{
        gym_id: gymId,
        type: 'payment_due',
        title: 'Payment Recorded',
        message: `A payment of BDT ${formData.price_paid} was recorded.`,
        related_member_id: formData.member_id,
        is_read: false
      }]);

      const newPayment = data as Payment;
      setPayments((current) => [newPayment, ...current]);

      const receipt = prepareReceipt(newPayment);
      setLatestReceipt(receipt);

      showToast(
        receipt.amount_due > 0
          ? `Payment recorded. Remaining due: ${formatBdt(receipt.amount_due)}`
          : 'Payment recorded successfully.',
        'success'
      );
      handleCloseModal();
    } catch (error: any) {
      console.error('Error recording payment:', error);
      showToast(error.message || 'Failed to record payment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (!searchQuery) return true;
      return payment.members?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [payments, searchQuery]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const totalOutstandingDue = useMemo(
    () => [...memberOutstandingMap.values()].reduce((sum, amount) => sum + amount, 0),
    [memberOutstandingMap]
  );

  const handleViewReceipt = (payment: Payment) => {
    setLatestReceipt(prepareReceipt(payment));
  };

  const handleShareReceipt = () => {
    if (!latestReceipt) return;
    const message = buildWhatsAppReceiptMessage(latestReceipt);
    const encoded = encodeURIComponent(message);
    const rawPhone = (latestReceipt.member_phone || '').replace(/\D/g, '');

    if (rawPhone) {
      const localPhone = rawPhone.startsWith('88') ? rawPhone : `88${rawPhone}`;
      window.open(`https://wa.me/${localPhone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
      return;
    }

    navigator.clipboard
      .writeText(message)
      .then(() => showToast('Receipt copied. Paste it into WhatsApp.', 'success'))
      .catch(() => showToast('Failed to copy receipt text.', 'error'));
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <h1 className="text-xl font-display font-extrabold tracking-tight text-neutral-text dark:text-white sm:text-2xl lg:text-3xl">
            Payments
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Record renewals, track dues, and see today&apos;s collections.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-11 items-center gap-2 self-start rounded-xl bg-primary-default px-4 text-sm font-bold text-white shadow-lg shadow-primary-default/20 transition-all hover:brightness-110 active:scale-95 sm:self-auto sm:px-5"
        >
          <span className="material-symbols-outlined text-lg">add_card</span>
          Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding dues</p>
          <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-300">{formatBdt(totalOutstandingDue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Today&apos;s collections</p>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-300">{formatBdt(collectionSummary.total)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment methods today</p>
          {collectionSummary.items.length === 0 ? (
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">No collections recorded yet.</p>
          ) : (
            <div className="mt-2 space-y-1">
              {collectionSummary.items.map((entry) => (
                <div key={entry.method} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{paymentMethodLabel(entry.method)}</span>
                  <span className="font-bold text-neutral-text dark:text-white">{formatBdt(entry.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400">search</span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by member name..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-800 dark:bg-slate-900"
          />
        </div>
        <select
          value={filterMethod}
          onChange={(event) => setFilterMethod(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-primary-default/20 dark:border-slate-800 dark:bg-slate-900"
        >
          <option value="">All Methods</option>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="BKASH">bKash</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
        </select>
      </div>

      {tableError ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
          <ErrorState title="Payments Load Failed" message={tableError} onRetry={fetchPayments} />
        </div>
      ) : (
        <PaymentsTable
          loading={loading}
          filteredPayments={filteredPayments}
          paymentsLength={payments.length}
          totalCount={totalCount}
          totalPages={totalPages}
          page={page}
          setPage={setPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          getPaymentDueAmount={getPaymentDueAmount}
          onViewReceipt={handleViewReceipt}
          onDownloadReceipt={(payment) => downloadReceipt(prepareReceipt(payment))}
        />
      )}

      {latestReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-text dark:text-white">Receipt Details</h3>
              <button
                type="button"
                onClick={() => setLatestReceipt(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Member Information</p>
                <p className="text-base font-bold text-neutral-text dark:text-white">
                  {latestReceipt.member_name}
                </p>
                <p className="text-sm text-slate-500">
                  {latestReceipt.member_phone || 'No phone number'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Payment Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Plan</p>
                    <p className="font-semibold text-neutral-text dark:text-white">{latestReceipt.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Method</p>
                    <p className="font-semibold text-neutral-text dark:text-white">{paymentMethodLabel(latestReceipt.payment_method)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Paid Amount</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatBdt(latestReceipt.amount_paid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Remaining Due</p>
                    <p className="font-bold text-amber-600 dark:text-amber-400">{formatBdt(latestReceipt.amount_due)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Start Date</p>
                    <p className="font-semibold text-neutral-text dark:text-white">{new Date(latestReceipt.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">End Date</p>
                    <p className="font-semibold text-neutral-text dark:text-white">{new Date(latestReceipt.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => downloadReceipt(latestReceipt)}
                  className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  Download
                </button>
                <button
                  type="button"
                  onClick={handleShareReceipt}
                  className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        showAddModal={showAddModal}
        handleCloseModal={handleCloseModal}
        handleRecordPayment={handleRecordPayment}
        formData={formData}
        setFormData={setFormData}
        members={members}
        plans={plans}
        handlePlanChange={handlePlanChange}
        handleStartDateChange={handleStartDateChange}
        isSubmitting={isSubmitting}
        expectedAmount={planAmount}
        dueAmount={modalDueAmount}
      />
    </div>
  );
}
