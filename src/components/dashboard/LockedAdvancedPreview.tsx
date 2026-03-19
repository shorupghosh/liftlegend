import React from 'react';
import AdvancedDashboard from './AdvancedDashboard';

interface LockedAdvancedPreviewProps {
  onUpgrade: () => void;
}

const previewFeatures = [
  'Analytics & charts',
  'Trainer performance',
  'Heatmaps',
  'Insights',
];

export default function LockedAdvancedPreview({ onUpgrade }: LockedAdvancedPreviewProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-950"
      role="button"
      tabIndex={0}
      onClick={onUpgrade}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onUpgrade();
        }
      }}
      aria-label="Preview advanced dashboard and open upgrade modal"
    >
      <div className="pointer-events-none select-none blur-sm saturate-[0.9]">
        <AdvancedDashboard previewUnlocked />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/72 via-slate-950/52 to-primary-default/35 backdrop-blur-[2px]" />

      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/92 p-6 text-center shadow-2xl backdrop-blur-xl transition-transform duration-200 group-hover:scale-[1.01] dark:bg-slate-900/88">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Unlock Advanced Dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Preview premium analytics now, then upgrade when you are ready to activate the full experience.
          </p>

          <div className="mt-6 grid gap-2 text-left">
            {previewFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-2xl bg-slate-100/80 px-4 py-3 dark:bg-slate-800/70"
              >
                <span className="material-symbols-outlined text-base text-primary-default">insights</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{feature}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onUpgrade}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
