import React from 'react';
import { Member, Plan } from '../../types';

interface PaymentModalProps {
  showAddModal: boolean;
  handleCloseModal: () => void;
  handleRecordPayment: (e: React.FormEvent) => Promise<void>;
  formData: {
    member_id: string;
    plan_id: string;
    price_paid: string;
    payment_method: string;
    start_date: string;
    end_date: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      member_id: string;
      plan_id: string;
      price_paid: string;
      payment_method: string;
      start_date: string;
      end_date: string;
    }>
  >;
  members: Partial<Member>[];
  plans: Partial<Plan>[];
  handlePlanChange: (planId: string) => void;
  handleStartDateChange: (startDate: string) => void;
  isSubmitting: boolean;
  expectedAmount: number;
  dueAmount: number;
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
  expectedAmount,
  dueAmount,
}) => {
  if (!showAddModal) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={handleCloseModal}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 id="payment-modal-title" className="text-lg font-bold text-neutral-text dark:text-white">
            Record Payment and Renewal
          </h3>
          <button
            onClick={handleCloseModal}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleRecordPayment} className="space-y-4 overflow-y-auto p-6">
          <div className="space-y-1.5">
            <label htmlFor="pay-member" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Select Member
            </label>
            <select
              id="pay-member"
              required
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Choose a member...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pay-plan" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Select Plan
            </label>
            <select
              id="pay-plan"
              required
              value={formData.plan_id}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Choose a plan...</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} (BDT {Number(plan.price || 0).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pay-amount" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Amount (BDT)
              </label>
              <input
                id="pay-amount"
                required
                type="number"
                min="0"
                value={formData.price_paid}
                onChange={(e) => setFormData({ ...formData, price_paid: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pay-method" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Method
              </label>
              <select
                id="pay-method"
                required
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="CASH">CASH</option>
                <option value="CARD">CARD</option>
                <option value="BKASH">BKASH</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-300">Plan amount</span>
              <span className="font-bold text-slate-700 dark:text-white">BDT {expectedAmount.toLocaleString()}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-300">Remaining due</span>
              <span
                className={`font-bold ${
                  dueAmount > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'
                }`}
              >
                BDT {Math.max(0, dueAmount).toLocaleString()}
              </span>
            </div>
            {dueAmount > 0 && (
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                This payment is partial. Record the remaining dues later for this member.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pay-start" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Start Date
              </label>
              <input
                id="pay-start"
                required
                type="date"
                value={formData.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pay-end" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                End Date
              </label>
              <input
                id="pay-end"
                required
                type="date"
                value={formData.end_date}
                min={formData.start_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          {formData.end_date && formData.start_date && formData.end_date < formData.start_date && (
            <p className="flex items-center gap-1 text-xs font-medium text-red-500">
              <span className="material-symbols-outlined text-sm">warning</span>
              End date must be after start date.
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="h-11 flex-1 rounded-xl bg-slate-100 font-bold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-default font-bold text-white shadow-lg shadow-primary-default/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
