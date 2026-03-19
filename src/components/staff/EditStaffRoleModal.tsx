import React from 'react';
import { StaffRole } from '../../lib/staffPermissions';

interface EditStaffRoleModalProps {
  isOpen: boolean;
  currentRole: StaffRole;
  roleOptions: StaffRole[];
  isSubmitting: boolean;
  memberName: string;
  onClose: () => void;
  onSubmit: (role: StaffRole) => void;
}

export default function EditStaffRoleModal({
  isOpen,
  currentRole,
  roleOptions,
  isSubmitting,
  memberName,
  onClose,
  onSubmit,
}: EditStaffRoleModalProps) {
  const [selectedRole, setSelectedRole] = React.useState<StaffRole>(currentRole);

  React.useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="text-lg font-bold text-neutral-text dark:text-white">Edit Role</h3>
          <p className="mt-1 text-sm text-slate-500">{memberName}</p>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Role</label>
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as StaffRole)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 dark:border-slate-700 dark:bg-slate-800"
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl bg-slate-100 font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmit(selectedRole)}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-primary-default font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : 'Save Role'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
