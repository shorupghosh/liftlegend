import React from 'react';
import { Member, Plan } from '../../types';

interface PaymentModalProps {
  showAddModal: boolean;
  handleCloseModal: () => void;
  handleRecordPayment: (e: React.FormEvent) => Promise<void>;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  members: Partial<Member>[];
  plans: Partial<Plan>[];
  handlePlanChange: (planId: string) => void;
  handleStartDateChange: (startDate: string) => void;
  isSubmitting: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  showAddModal,
  handleCloseModal,
  handleRecordPayment,
  formData,
  setFormData,
  members,
  plans,
  handlePlanChange,
  handleStartDateChange,
  isSubmitting,
}) => {
  if (!showAddModal) return null;

  return (
    <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
        onClick={handleCloseModal}
    >
        <div
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
        >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 id="payment-modal-title" className="text-lg font-bold text-neutral-text dark:text-white">Record Payment &amp; Renewal</h3>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" aria-label="Close modal">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 overflow-y-auto">
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
                        <input id="pay-start" required type="date" value={formData.start_date}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="pay-end" className="text-sm font-bold text-slate-700 dark:text-slate-300">End Date</label>
                        <input id="pay-end" required type="date" value={formData.end_date}
                            min={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all" />
                    </div>
                </div>
                {formData.end_date && formData.start_date && formData.end_date < formData.start_date && (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        End date must be after start date.
                    </p>
                )}
                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button disabled={isSubmitting} type="submit" className="flex-1 h-11 rounded-xl font-bold text-white bg-primary-default hover:brightness-110 transition-all shadow-lg shadow-primary-default/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {isSubmitting ? (
                            <>
                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : 'Save Payment'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};
