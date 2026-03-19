import React from 'react';
import { StaffRole } from '../../lib/staffPermissions';

interface InviteStaffModalProps {
  isOpen: boolean;
  email: string;
  role: StaffRole;
  roleOptions: StaffRole[];
  isSubmitting: boolean;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: StaffRole) => void;
  onSubmit: () => void;
}

export default function InviteStaffModal({
  isOpen,
  email,
  role,
  roleOptions,
  isSubmitting,
  onClose,
  onEmailChange,
  onRoleChange,
  onSubmit,
}: InviteStaffModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="text-lg font-bold text-neutral-text dark:text-white">Invite Staff Member</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm text-slate-500">
            Add a staff record now. If the user already has an account, access becomes active immediately. Otherwise the record stays invited until they join.
          </p>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              type="email"
              placeholder="staff@example.com"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Role</label>
            <select
              value={role}
              onChange={(event) => onRoleChange(event.target.value as StaffRole)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-800"
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl bg-slate-100 font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting || !email.trim()}
              onClick={onSubmit}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-primary-default font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : 'Send Invite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
