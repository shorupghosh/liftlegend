import React from 'react';

export function PageLoader({ label = 'Loading your dashboard...' }: { label?: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-6 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-4 size-12 animate-spin rounded-full border-4 border-primary-default/20 border-t-primary-default" />
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Please wait a moment.</p>
    </div>
  );
}
