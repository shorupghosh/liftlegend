import React from 'react';
import { Plan } from '../../types';
import { formatBdt } from '../../lib/currency';

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  plan_id: string;
}

interface MemberModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: FormData;
  setFormData: (data: FormData) => void;
  plans: Partial<Plan>[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  isEditing,
  formData,
  setFormData,
  plans,
  isSubmitting,
  onSubmit,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 id="member-modal-title" className="text-lg font-bold text-neutral-text dark:text-white">
            {isEditing ? 'Edit Member' : 'Add New Member'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto">
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
                <option key={plan.id} value={plan.id}>{plan.name} ({formatBdt(Number(plan.price))})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              className="flex-1 h-11 rounded-xl font-bold text-white bg-primary-default hover:brightness-110 transition-all shadow-lg shadow-primary-default/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : isEditing ? 'Update Member' : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
