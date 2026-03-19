import React from 'react';

interface DashboardModeToggleProps {
  mode: 'basic' | 'advanced';
  userPlan: 'basic' | 'pro';
  onChange: (mode: 'basic' | 'advanced') => void;
}

export default function DashboardModeToggle({
  mode,
  userPlan,
  onChange,
}: DashboardModeToggleProps) {
  const isAdvancedLocked = userPlan === 'basic';

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => onChange('basic')}
        aria-pressed={mode === 'basic'}
        className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest transition-all sm:px-6 ${
          mode === 'basic'
            ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        Basic
      </button>

      <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />

      <button
        type="button"
        onClick={() => onChange('advanced')}
        aria-pressed={mode === 'advanced'}
        className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest transition-all sm:px-6 ${
          mode === 'advanced'
            ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <span>Advanced</span>
        {isAdvancedLocked && (
          <span className="material-symbols-outlined text-sm text-amber-500">lock</span>
        )}
      </button>
    </div>
  );
}
