import React from 'react';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn't load the data. Please try again.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-300 bg-red-50/90 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/20">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm dark:bg-slate-800 dark:text-red-400">
        <span className="material-symbols-outlined text-3xl">error</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:brightness-110 active:scale-95"
        >
          <span className="material-symbols-outlined mr-2 text-sm">refresh</span>
          Retry
        </button>
      )}
    </div>
  );
}
