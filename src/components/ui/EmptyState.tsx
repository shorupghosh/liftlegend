import React from 'react';

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/90 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/60">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-primary-default shadow-sm dark:bg-slate-800">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-default px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary-default/20 transition-all hover:brightness-110 active:scale-95"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
