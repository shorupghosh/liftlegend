import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const benefits = [
  'Advanced analytics and custom charts',
  'Trainer performance tracking',
  'Peak-hour heatmaps',
  'Actionable gym insights',
];

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close upgrade modal"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
      >
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-primary-default px-6 py-7 text-white">
          <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-white/10">
            <span className="material-symbols-outlined text-3xl">rocket_launch</span>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white/70">Pro Plan</p>
          <h2 id="upgrade-modal-title" className="mt-2 text-3xl font-black tracking-tight">
            Unlock Advanced Dashboard
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Upgrade to access deeper visibility into performance, attendance patterns, and trainer output.
          </p>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-default/10 text-primary-default">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              Ready for billing later
            </p>
            <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-300/80">
              This modal is prepared for the SaaS upgrade flow now, without payment integration yet.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-2xl bg-slate-100 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-2xl bg-slate-900 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
