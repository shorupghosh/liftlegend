import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useToast } from '../components/ToastProvider';
import { PaymentModal } from '../components/payments/PaymentModal';
import { PaymentsTable } from '../components/payments/PaymentsTable';
import { useDemoData } from '../contexts/DemoDataContext';
import { useDemoMode } from '../hooks/useDemoMode';

import { Payment, Member, Plan } from '../types';

export default function PaymentManagement() {
    const { gymId } = useAuth();
    const { isDemoMode } = useDemoMode();
    const { state: demoState, addPayment } = useDemoData();
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
        if (!gymId && !isDemoMode) return;
        setLoading(true);
        try {
            if (isDemoMode) {
                setPayments(demoState.payments);
                setTotalCount(demoState.payments.length);
                setLoading(false);
                return;
            }
            // Apply filtering logic at the query level
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
    }, [demoState.payments, filterMethod, gymId, isDemoMode, page, showToast]);

    const fetchFormData = useCallback(async () => {
        if (!gymId && !isDemoMode) return;
        try {
            if (isDemoMode) {
                setMembers(demoState.members.filter(member => member.status === 'ACTIVE'));
                setPlans(demoState.plans);
                return;
            }
            const [membersRes, plansRes] = await Promise.all([
                supabase.from('members').select('id, full_name').eq('gym_id', gymId).eq('status', 'ACTIVE'),
                supabase.from('plans').select('id, name, price, duration_days').eq('gym_id', gymId)
            ]);
            setMembers(membersRes.data || []);
            setPlans(plansRes.data || []);
        } catch (error) {
            console.error('Error fetching form data:', error);
        }
    }, [demoState.members, demoState.plans, gymId, isDemoMode]);

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
        if (isDemoMode) {
            addPayment({
                member_id: formData.member_id,
                plan_id: formData.plan_id,
                price_paid: Number(formData.price_paid),
                payment_method: formData.payment_method,
                start_date: formData.start_date,
                end_date: formData.end_date,
            });
            showToast('Payment recorded. This is demo mode. Changes are not saved.', 'info');
            handleCloseModal();
            return;
        }
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
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
                        Payments
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Track membership renewals, fees, and revenue.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 rounded-xl h-11 px-4 sm:px-5 bg-primary-default text-white text-sm font-bold shadow-lg shadow-primary-default/20 hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
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

            <PaymentsTable
                loading={loading}
                filteredPayments={filteredPayments}
                paymentsLength={payments.length}
                totalCount={totalCount}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            />

            {/* Record Payment Modal — BUG-17 backdrop fix */}
            <PaymentModal
                showAddModal={showAddModal}
                handleCloseModal={handleCloseModal}
                handleRecordPayment={handleRecordPayment}
                formData={formData}
                setFormData={setFormData}
                members={members as Partial<Member>[]}
                plans={plans as Partial<Plan>[]}
                handlePlanChange={handlePlanChange}
                handleStartDateChange={handleStartDateChange}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
