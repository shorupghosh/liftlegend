import React from 'react';
import { usePlan } from '../../contexts/PlanContext';

interface PlanBadgeProps {
  /** Compact mode - just icon + name */
  compact?: boolean;
  className?: string;
}

export default function PlanBadge({ compact = false, className = '' }: PlanBadgeProps) {
  const { tier, planDisplay, openUpgradeModal, isBasic, trialDaysLeft } = usePlan();

  const colors: Record<string, string> = {
    TRIAL: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    FREE: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    BASIC: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    ADVANCED: 'bg-primary-default/10 text-primary-default border-primary-default/20',
    PREMIUM: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  };

  if (compact) {
    return (
      <button
        onClick={() => { if (isBasic) openUpgradeModal(); }}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 ${colors[tier] || colors.TRIAL} ${className}`}
        title={`Current plan: ${planDisplay.name}`}
      >
        <span className="material-symbols-outlined text-[10px]">{planDisplay.icon}</span>
        {planDisplay.shortName}
        {isBasic && (
          <span className="material-symbols-outlined text-[10px] text-amber-500">arrow_upward</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => { if (isBasic) openUpgradeModal(); }}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all hover:shadow-sm ${colors[tier] || colors.TRIAL} ${className}`}
    >
      <span className="material-symbols-outlined text-sm">{planDisplay.icon}</span>
      <span>{planDisplay.name} Plan</span>
      {trialDaysLeft !== null ? (
        <span className="ml-1 flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[9px] font-black text-amber-700 dark:text-amber-400">
          <span className="material-symbols-outlined text-[10px]">hourglass_top</span>
          {trialDaysLeft} Days Left
        </span>
      ) : isBasic && (
        <span className="ml-1 flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[9px] font-black text-amber-700 dark:text-amber-400">
          <span className="material-symbols-outlined text-[10px]">upgrade</span>
          Upgrade
        </span>
      )}
    </button>
  );
}
