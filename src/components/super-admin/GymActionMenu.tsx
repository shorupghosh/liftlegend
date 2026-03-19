import React, { useEffect, useRef, useState } from 'react';

type GymActionMenuProps = {
  onView: () => void;
  onImpersonate: () => void;
  onSuspend: () => void;
  onActivate: () => void;
  onDelete: () => void;
  isBusy?: boolean;
  canActivate: boolean;
  canSuspend: boolean;
};

export function GymActionMenu({
  onView,
  onImpersonate,
  onSuspend,
  onActivate,
  onDelete,
  isBusy,
  canActivate,
  canSuspend,
}: GymActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div className="relative inline-flex justify-end" ref={ref}>
      <button
        type="button"
        disabled={isBusy}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Open gym actions"
      >
        <span className="material-symbols-outlined text-lg">more_vert</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-20 min-w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <button type="button" onClick={() => run(onView)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-lg">visibility</span>
            View Gym
          </button>
          <button type="button" onClick={() => run(onImpersonate)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-lg">login</span>
            Login as Owner
          </button>
          {canSuspend ? (
            <button type="button" onClick={() => run(onSuspend)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40">
              <span className="material-symbols-outlined text-lg">pause_circle</span>
              Suspend Gym
            </button>
          ) : null}
          {canActivate ? (
            <button type="button" onClick={() => run(onActivate)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">
              <span className="material-symbols-outlined text-lg">play_circle</span>
              Activate Gym
            </button>
          ) : null}
          <button type="button" onClick={() => run(onDelete)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40">
            <span className="material-symbols-outlined text-lg">delete</span>
            Delete Gym
          </button>
        </div>
      ) : null}
    </div>
  );
}
