import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePlan } from '../../contexts/PlanContext';
import {
  PLAN_DISPLAY,
  FEATURE_META,
  PlanFeature,
  PlanDisplay,
} from '../../lib/planConfig';

// ──────────────────────────────────────────────────────────────
// UpgradeModal — Premium plan comparison with upgrade flow
// ──────────────────────────────────────────────────────────────

export default function PlanUpgradeModal() {
  const { upgradeModalOpen, closeUpgradeModal, upgradeFeature, tier } = usePlan();

  useEffect(() => {
    if (!upgradeModalOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUpgradeModal();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [upgradeModalOpen, closeUpgradeModal]);

  if (!upgradeModalOpen) return null;

  const featureMeta = upgradeFeature ? FEATURE_META[upgradeFeature] : null;

  // Plans to show (exclude FREE and current tier)
  const plansToShow: { key: string; plan: PlanDisplay; recommended: boolean }[] = [
    { key: 'BASIC', plan: PLAN_DISPLAY.BASIC, recommended: false },
    { key: 'ADVANCED', plan: PLAN_DISPLAY.ADVANCED, recommended: true },
    { key: 'PREMIUM', plan: PLAN_DISPLAY.PREMIUM, recommended: false },
  ].filter((p) => p.key !== tier || p.key === 'ADVANCED'); // Always show ADVANCED

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={closeUpgradeModal}
        aria-label="Close"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
      >
        {/* Close button */}
        <button
          onClick={closeUpgradeModal}
          className="absolute top-4 right-4 z-10 size-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-primary-default px-6 sm:px-8 py-8 text-white">
          <div className="absolute top-0 right-0 opacity-5 p-6">
            <span className="material-symbols-outlined text-[120px]">workspace_premium</span>
          </div>

          <div className="relative z-10">
            {featureMeta && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wider text-white/80 mb-4">
                <span className="material-symbols-outlined text-sm text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                <span>Feature requires upgrade</span>
              </div>
            )}

            <h2 id="upgrade-title" className="text-2xl sm:text-3xl font-black tracking-tight">
              {featureMeta
                ? `Unlock ${featureMeta.label}`
                : 'Upgrade Your Plan'}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-white/70 leading-relaxed">
              {featureMeta
                ? featureMeta.description
                : 'Get more power, unlock premium features, and grow your gym business with the right plan.'}
            </p>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            {plansToShow.map(({ key, plan, recommended }) => {
              const isCurrent = key === tier;
              return (
                <div
                  key={key}
                  className={`relative flex flex-col rounded-2xl p-5 transition-all ${
                    recommended
                      ? 'bg-gradient-to-b from-primary-default to-blue-700 text-white ring-2 ring-primary-default shadow-xl shadow-blue-500/20 md:-mt-3 md:-mb-1'
                      : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Tags */}
                  {plan.tag && (
                    <span
                      className={`self-start text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] mb-3 ${
                        recommended
                          ? 'bg-white/20 text-white'
                          : 'bg-primary-default/10 text-primary-default'
                      }`}
                    >
                      {plan.tag}
                    </span>
                  )}
                  {isCurrent && !plan.tag && (
                    <span className="self-start text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] mb-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Current Plan
                    </span>
                  )}

                  {/* Plan name */}
                  <h3
                    className={`text-base font-bold ${
                      recommended ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mt-2 mb-4">
                    <span
                      className={`text-3xl font-black ${
                        recommended ? 'text-white' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-xs ${
                        recommended ? 'text-blue-200' : 'text-slate-500'
                      }`}
                    >
                      /month
                    </span>
                  </div>

                  <div
                    className={`h-px w-full mb-4 ${
                      recommended ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-600'
                    }`}
                  />

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={`flex items-start gap-2 text-sm ${
                          recommended
                            ? 'text-blue-50'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-sm mt-0.5 shrink-0 ${
                            recommended ? 'text-green-300' : 'text-green-500'
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={closeUpgradeModal}
                    disabled={isCurrent}
                    className={`w-full mt-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] ${
                      isCurrent
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                        : recommended
                        ? 'bg-white text-primary-default hover:bg-blue-50 shadow-lg'
                        : 'bg-primary-default text-white hover:brightness-110 shadow-md shadow-primary-default/20'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Info banner */}
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl mt-0.5 shrink-0">info</span>
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                No payment integration yet
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                Upgrade requests will be handled manually for now. Contact support to change your plan. Your features will be activated within 1 hour.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={closeUpgradeModal}
              className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={closeUpgradeModal}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 text-sm font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-[0.97] transition-all"
            >
              Contact for Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
