import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useToast } from '../components/ToastProvider';

import { Payment, Member, Plan } from '../types';

export default function PaymentManagement() {
    const { gymId } = useAuth();
    const { showToast } = useToast();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [members, setMembers] = useState<Partial<Member>[]>([]);
    const [plans, setPlans] = useState<Partial<Plan>[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMethod, setFilterMethod] = useState('');
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 20;
    const [formData, setFormData] = useState({
        member_id: '',
        plan_id: '',
        price_paid: '',
        payment_method: 'CASH',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
    });

    const fetchPayments = useCallback(async () => {
        if (!gymId) return;
        setLoading(true);
        try {
            // Apply filtering logic at the query level if possible, but for mixed search logic we'll fetch paginated window
            let query = supabase
                .from('membership_history')
                .select('*, members(full_name), plans(name)', { count: 'exact' })
                .eq('gym_id', gymId)
                .order('created_at', { ascending: false });

            if (filterMethod) {
                query = query.eq('payment_method', filterMethod);
            }

            const { data, count, error } = await query.range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);
            if (error) throw error;

            setPayments(data || []);
            setTotalCount(count || 0);
        } catch (error: any) {
            console.error('Error fetching payments:', error);
            showToast('Failed to load payments.', 'error');
        } finally {
            setLoading(false);
        }
    }, [gymId, showToast, page, filterMethod]);

    const fetchFormData = useCallback(async () => {
        if (!gymId) return;
        try {
            const [membersRes, plansRes] = await Promise.all([
                supabase.from('members').select('id, full_name').eq('gym_id', gymId).eq('status', 'ACTIVE'),
                supabase.from('plans').select('id, name, price, duration_days').eq('gym_id', gymId)
            ]);
            setMembers(membersRes.data || []);
            setPlans(plansRes.data || []);
        } catch (error) {
            console.error('Error fetching form data:', error);
        }
    }, [gymId]);

    useEffect(() => {
        fetchPayments();
        fetchFormData();
    }, [fetchPayments, fetchFormData]);

    useRealtimeSubscription({ table: 'membership_history', gymId, onChange: fetchPayments });

    // BUG-11 FIXED: Calculate end date from given startDate param (not stale closure)
    const calculateEndDate = (startDateStr: string, planId: string): string => {
        const selectedPlan = plans.find(p => p.id === planId);
        if (!selectedPlan || !startDateStr) return '';
        const startDate = new Date(startDateStr);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (selectedPlan.duration_days || 30));
        return endDate.toISOString().split('T')[0];
    };

    const handlePlanChange = (planId: string) => {
        const selectedPlan = plans.find(p => p.id === planId);
        setFormData(prev => ({
            ...prev,
            plan_id: planId,
            price_paid: selectedPlan ? selectedPlan.price.toString() : prev.price_paid,
            end_date: calculateEndDate(formData.start_date, planId),
        }));
    };

    const handleStartDateChange = (startDate: string) => {
        setFormData(prev => ({
            ...prev,
            start_date: startDate,
            // BUG-11 FIXED: re-calculate end using the new startDate value directly
            end_date: prev.plan_id ? calculateEndDate(startDate, prev.plan_id) : prev.end_date,
        }));
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setFormData({ member_id: '', plan_id: '', price_paid: '', payment_method: 'CASH', start_date: new Date().toISOString().split('T')[0], end_date: '' });
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gymId) return;

        // BUG-10 FIXED: Validate end date >= start date
        if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
            showToast('End date cannot be before start date.', 'error');
            return;
        }

        if (Number(formData.price_paid) < 0) {
            showToast('Payment amount cannot be negative.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('membership_history')
                .insert([{
                    gym_id: gymId,
                    member_id: formData.member_id,
                    plan_id: formData.plan_id,
                    price_paid: Number(formData.price_paid),
                    payment_method: formData.payment_method,
                    start_date: formData.start_date,
                    end_date: formData.end_date
                }])
                .select('*, members(full_name), plans(name)')
                .single();

            if (error) throw error;
            setPayments([data, ...payments]);
            handleCloseModal();
            showToast('Payment recorded successfully!', 'success');
        } catch (error: any) {
            console.error('Error recording payment:', error);
            showToast(error.message || 'Failed to record payment.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPayments = payments.filter(p => {
        const matchesSearch = !searchQuery || p.members?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
                        Payments
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track membership renewals, fees, and revenue.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 rounded-xl h-11 px-5 bg-primary-default text-white text-sm font-bold shadow-lg shadow-primary-default/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add_card</span>
                    Record Payment
                </button>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by member name..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                    />
                </div>
                <select
                    value={filterMethod}
                    onChange={e => setFilterMethod(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-sm outline-none focus:ring-2 focus:ring-primary-default/20"
                >
                    <option value="">All Methods</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BKASH">bKash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Date/Time</th>
                                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Member</th>
                                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Plan Details</th>
                                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Method</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center"><div className="flex justify-center"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div></td></tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-500">No payments found.</td></tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="text-sm font-medium text-neutral-text dark:text-white">{new Date(payment.created_at).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-500">{new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-sm text-neutral-text dark:text-white">{payment.members?.full_name || 'Unknown'}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                                            {payment.plans?.name || 'Custom Plan'}
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {new Date(payment.start_date).toLocaleDateString()} → {new Date(payment.end_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{Number(payment.price_paid).toLocaleString()}</span>
                                        </td>
                                        <td className="px-5 py-4 hidden sm:table-cell">
                                            <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                {payment.payment_method}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-500">
                        Showing <span className="font-bold">{payments.length === 0 ? 0 : (page * ITEMS_PER_PAGE) + 1}</span> to <span className="font-bold">{Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)}</span> of <span className="font-bold">{totalCount}</span> results
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || loading || totalCount === 0}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Record Payment Modal — BUG-17 backdrop fix */}
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
                        aria-labelledby="payment-modal-title"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 id="payment-modal-title" className="text-lg font-bold text-neutral-text dark:text-white">Record Payment & Renewal</h3>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" aria-label="Close modal">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleRecordPayment} className="p-6 space-y-4 overflow-y-auto">
                            {/* BUG-23 FIXED: htmlFor on all labels */}
                            <div className="space-y-1.5">
                                <label htmlFor="pay-member" className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Member</label>
                                <select id="pay-member" required value={formData.member_id} onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                                    className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all">
                                    <option value="">Choose a member...</option>
                                    {members.map(member => <option key={member.id} value={member.id}>{member.full_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="pay-plan" className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Plan</label>
                                <select id="pay-plan" required value={formData.plan_id} onChange={(e) => handlePlanChange(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all">
                                    <option value="">Choose a plan...</option>
                                    {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name} (৳{plan.price})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="pay-amount" className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount (৳)</label>
                                    <input id="pay-amount" required type="number" min="0" value={formData.price_paid} onChange={(e) => setFormData({ ...formData, price_paid: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="pay-method" className="text-sm font-bold text-slate-700 dark:text-slate-300">Method</label>
                                    <select id="pay-method" required value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all">
                                        <option value="CASH">CASH</option>
                                        <option value="CARD">CARD</option>
                                        <option value="BKASH">BKASH</option>
                                        <option value="BANK_TRANSFER">BANK TRANSFER</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="pay-start" className="text-sm font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                                    {/* BUG-11 FIXED: uses handleStartDateChange instead of stale closure */}
                                    <input id="pay-start" required type="date" value={formData.start_date}
                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="pay-end" className="text-sm font-bold text-slate-700 dark:text-slate-300">End Date</label>
                                    <input id="pay-end" required type="date" value={formData.end_date}
                                        min={formData.start_date} /* BUG-10 FIXED: prevent picking end before start */
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all" />
                                </div>
                            </div>
                            {/* BUG-10: visual warning if end < start */}
                            {formData.end_date && formData.start_date && formData.end_date < formData.start_date && (
                                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    End date must be after start date.
                                </p>
                            )}
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={handleCloseModal} className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button disabled={isSubmitting} type="submit" className="flex-1 h-11 rounded-xl font-bold text-white bg-primary-default hover:brightness-110 transition-all shadow-lg shadow-primary-default/20 disabled:opacity-50 flex items-center justify-center">
                                    {isSubmitting ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
