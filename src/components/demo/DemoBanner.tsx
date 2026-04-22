import React from 'react';
import { exitDemoMode } from '../../lib/demoUtils';
import { useDemoData } from '../../contexts/DemoDataContext';

export const DemoBanner = () => {
  const { resetDemoData } = useDemoData();

  return (
    <div className="relative z-[100] flex items-center justify-between gap-3 border-b border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 px-2 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-amber-800 shadow-sm dark:border-amber-900/40 dark:from-amber-950/40 dark:via-slate-950 dark:to-amber-950/40 dark:text-amber-200">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="material-symbols-outlined text-[14px] sm:text-lg">visibility</span>
        <span className="rounded-full bg-amber-500 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white">Demo</span>
        <span className="hidden sm:inline">Explore freely. Resets on refresh.</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={resetDemoData}
          className="rounded-lg border border-amber-300 bg-white px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-amber-950/60"
        >
          <span className="hidden sm:inline">Reset</span>
          <span className="sm:hidden material-symbols-outlined text-[14px]">restart_alt</span>
        </button>
        <button 
          onClick={exitDemoMode}
          className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-amber-500 px-2 sm:px-3 py-1 font-bold text-white transition-colors hover:bg-amber-600"
        >
          <span className="material-symbols-outlined text-[14px] sm:text-sm">logout</span>
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </div>
  );
};
