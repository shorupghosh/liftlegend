import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useToast } from '../components/ToastProvider';
import { formatBdt } from '../lib/currency';
import { useDemoMode } from '../hooks/useDemoMode';
import { useDemoData } from '../contexts/DemoDataContext';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { ConfirmModal } from '../components/ui/ConfirmModal';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function MembershipPlans() {
  const { gymId } = useAuth();
  const { showToast } = useToast();
  const { isDemoMode } = useDemoMode();
  const { state: demoState } = useDemoData();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, title: '', message: '', onConfirm: () => { } });
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_days: '30',
    duration_type: 'DAYS',
    description: '',
    is_popular: false,
  });

  const fetchPlans = useCallback(async () => {
    if (!gymId && !isDemoMode) return;
    setLoading(true);
    setTableError(null);
    try {
      if (isDemoMode) {
        setPlans(demoState.plans);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('plans')
        .select('id, name, price, duration_days, duration_type, description, is_popular')
        .eq('gym_id', gymId)
        .order('price', { ascending: true });
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setTableError((error && error.message) || 'Failed to load plans.');
      showToast('Failed to load plans.', 'error');
    } finally {
      setLoading(false);
    }
  }, [demoState.plans, gymId, isDemoMode, showToast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useRealtimeSubscription({ table: 'plans', gymId, onChange: fetchPlans, enabled: !isDemoMode });

  const openCreateModal = () => {
    if (isDemoMode) {
      showToast('Plan editing is disabled in demo mode.', 'info');
      return;
    }
    setEditingPlan(null);
    setFormData({ name: '', price: '', duration_days: '30', duration_type: 'DAYS', description: '', is_popular: false });
    setShowModal(true);
  };

  const openEditModal = (plan: any) => {
    if (isDemoMode) {
      showToast('Plan editing is disabled in demo mode.', 'info');
      return;
    }
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: String(plan.price),
      duration_days: String(plan.duration_days),
      duration_type: plan.duration_type || 'DAYS',
      description: plan.description || '',
      is_popular: plan.is_popular || false,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      showToast('Plan changes are disabled in demo mode.', 'info');
      return;
    }
    if (!gymId) return;
    setIsSubmitting(true);
    try {
      const payload = {
        gym_id: gymId,
        name: formData.name,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        duration_type: formData.duration_type,
        description: formData.description || null,
        is_popular: formData.is_popular,
      };

      if (editingPlan) {
        const { error } = await supabase.from('plans').update(payload).eq('id', editingPlan.id).eq('gym_id', gymId);
        if (error) throw error;
        showToast('Plan updated successfully!', 'success');
      } else {
        const { error } = await supabase.from('plans').insert([payload]);
        if (error) throw error;
        showToast('Plan created successfully!', 'success');
      }

      handleCloseModal();
      fetchPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      showToast(error.message || 'Failed to save plan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (plan: any) => {
    if (isDemoMode) {
      showToast('Plan deletion is disabled in demo mode.', 'info');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Delete Plan',
      // BUG-12 FIXED: styled confirm before delete
      message: `Are you sure you want to delete the "${plan.name}" plan? Members currently on this plan will lose their plan assignment.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          // BUG-12 FIXED: Check for members using this plan first
          const { count } = await supabase
            .from('members')
            .select('id', { count: 'exact', head: true })
            .eq('plan_id', plan.id)
            .eq('gym_id', gymId);

          if ((count || 0) > 0) {
            showToast(`Cannot delete - ${count} member(s) are on this plan. Reassign them first.`, 'error');
            return;
          }

          const { error } = await supabase.from('plans').delete().eq('id', plan.id).eq('gym_id', gymId);
          if (error) throw error;
          showToast('Plan deleted.', 'success');
          fetchPlans();
        } catch (error: any) {
          showToast(error.message || 'Failed to delete plan.', 'error');
        }
      },
    });
  };

  const planColors = [
    { bg: 'bg-white dark:bg-slate-900', border: 'border-slate-200 dark:border-slate-800', text: 'text-neutral-text dark:text-white', sub: 'text-slate-500', shadow: 'shadow-sm hover:shadow-xl' },
    { bg: 'bg-white dark:bg-slate-900', border: 'border-2 border-primary-default', text: 'text-neutral-text dark:text-white', sub: 'text-primary-default', shadow: 'shadow-2xl shadow-primary-default/10 scale-[1.02] z-10' },
    { bg: 'bg-slate-900', border: 'border-slate-800', text: 'text-white', sub: 'text-primary-default', shadow: 'shadow-sm hover:shadow-xl' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
            Membership Plans
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure and manage your gym's subscription tiers</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary-default hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-default/30 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Create New Plan
        </button>
      </div>

      {/* Plans Grid */}
      {tableError ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
          <ErrorState title="Plans Load Failed" message={tableError} onRetry={fetchPlans} />
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="size-10 border-4 border-primary-default border-t-transparent rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon="card_membership"
          title="No plans yet"
          description="Create your first membership plan so renewals and payment tracking stay consistent."
          actionLabel="Create plan"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const colorSet = planColors[index % planColors.length];
            // BUG-22 FIXED: "Most Popular" badge is now based on `is_popular` DB field, not hardcoded index
            const isPopular = plan.is_popular === true;
            return (
              <div key={plan.id} className={`relative flex flex-col ${colorSet.bg} rounded-2xl border ${colorSet.border} p-6 ${colorSet.shadow} transition-all duration-300`}>
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-default text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className={`text-lg font-bold ${colorSet.text}`}>{plan.name}</h3>
                    <p className={`text-xs ${colorSet.sub} uppercase tracking-widest font-bold`}>{plan.duration_days} {plan.duration_type?.toLowerCase()}</p>
                  </div>
                  <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary-default">card_membership</span>
                  </span>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${colorSet.text}`}>{formatBdt(Number(plan.price || 0))}</span>
                    <span className="text-slate-500 font-medium">/{plan.duration_days}d</span>
                  </div>
                  {plan.description && <p className="text-xs text-slate-400 mt-2">{plan.description}</p>}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="flex-1 bg-primary-default text-white py-3 rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary-default/20"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    className="w-12 bg-red-500/10 text-red-500 py-3 rounded-xl font-bold hover:bg-red-500/20 transition-all flex items-center justify-center"
                    aria-label={`Delete ${plan.name}`}
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add New Plan Card */}
          <div
            onClick={openCreateModal}
            className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 min-h-[300px] hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
          >
            <div className="size-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <span className="material-symbols-outlined text-primary-default text-3xl font-bold">add</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-neutral-text dark:text-white">Create Custom Plan</h3>
            <p className="text-sm text-slate-500 text-center max-w-[200px]">Define your own rules, features, and pricing.</p>
          </div>
        </div>
      )}

      {/* Create / Edit Modal — BUG-17 backdrop fix */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-modal-title"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 id="plan-modal-title" className="text-lg font-bold text-neutral-text dark:text-white">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" aria-label="Close modal">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* BUG-23 FIXED: htmlFor on labels */}
              <div className="space-y-1.5">
                <label htmlFor="plan-name" className="text-sm font-bold text-slate-700 dark:text-slate-300">Plan Name</label>
                <input id="plan-name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} type="text" placeholder="e.g. Premium Gold"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="plan-price" className="text-sm font-bold text-slate-700 dark:text-slate-300">Price (BDT)</label>
                  <input id="plan-price" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} type="number" min="0" step="0.01" placeholder="5000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="plan-duration" className="text-sm font-bold text-slate-700 dark:text-slate-300">Duration (days)</label>
                  <input id="plan-duration" required value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })} type="number" min="1" placeholder="30"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="plan-description" className="text-sm font-bold text-slate-700 dark:text-slate-300">Description (optional)</label>
                <textarea id="plan-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What's included in this plan?"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all min-h-[80px] resize-none" />
              </div>
              {/* BUG-22 FIXED: "Most Popular" is now a user-controlled toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  className="size-4 rounded accent-primary-default"
                />
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Mark as "Most Popular"</p>
                  <p className="text-xs text-slate-400">Displays a badge on this plan card</p>
                </div>
              </label>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button disabled={isSubmitting} type="submit" className="flex-1 h-11 rounded-xl font-bold text-white bg-primary-default hover:brightness-110 transition-all shadow-lg shadow-primary-default/20 disabled:opacity-50 flex items-center justify-center">
                  {isSubmitting ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled Confirm Modal */}
      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} requireVerification="DELETE" isDestructive={true} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
}