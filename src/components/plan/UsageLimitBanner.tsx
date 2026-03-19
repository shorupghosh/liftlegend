import React from 'react';
import { usePlan } from '../../contexts/PlanContext';

// ──────────────────────────────────────────────────────────────
// UsageLimitBanner — Shows when a resource limit is near/reached
// ──────────────────────────────────────────────────────────────

interface UsageLimitBannerProps {
  /** Which resource to check: 'members' or 'staff' */
  resource: 'members' | 'staff';
  /** Optional: custom class name */
  className?: string;
}

export default function UsageLimitBanner({ resource, className = '' }: UsageLimitBannerProps) {
  const { usage, usageLoaded, isLimitReached, getUsagePercent, openUpgradeModal, tier } = usePlan();

  if (!usageLoaded) return null;

  const percent = getUsagePercent(resource);
  const reached = isLimitReached(resource);
  const data = usage[resource];
  const isNearLimit = percent >= 80 && !reached;
  const labels = { members: 'Member', staff: 'Staff' };
  const resourceLabel = labels[resource];

  // Don't show if well under limit
  if (!reached && !isNearLimit) return null;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        reached
          ? 'border-red-200 bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/20'
          : 'border-amber-200 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${
              reached
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {reached ? 'block' : 'warning'}
            </span>
          </div>
          <div>
            <h4
              className={`text-sm font-bold ${
                reached
                  ? 'text-red-800 dark:text-red-300'
                  : 'text-amber-800 dark:text-amber-300'
              }`}
            >
              {reached
                ? `${resourceLabel} Limit Reached`
                : `${resourceLabel} Limit Almost Reached`}
            </h4>
            <p
              className={`text-xs mt-0.5 ${
                reached
                  ? 'text-red-600/80 dark:text-red-400/80'
                  : 'text-amber-600/80 dark:text-amber-400/80'
              }`}
            >
              {reached
                ? `You've used all ${data.limit} ${resource}. Upgrade your plan to add more.`
                : `${data.current} of ${data.limit} ${resource} used (${percent}%). Consider upgrading soon.`}
            </p>

            {/* Progress bar */}
            <div className="mt-2.5 flex items-center gap-3">
              <div
                className={`h-2 flex-1 max-w-[200px] rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    reached
                      ? 'bg-red-500'
                      : percent >= 90
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-black tabular-nums ${
                  reached ? 'text-red-600' : 'text-amber-600'
                }`}
              >
                {data.current}/{data.limit}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => openUpgradeModal()}
          className={`shrink-0 flex items-center gap-2 h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.97] ${
            reached
              ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-500/20'
              : 'bg-gradient-to-r from-amber-600 to-amber-500 shadow-amber-500/20'
          }`}
        >
          <span className="material-symbols-outlined text-sm">upgrade</span>
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// UsageLimitGuard — Disables button when limit is reached
// ──────────────────────────────────────────────────────────────

interface UsageLimitGuardProps {
  /** Which resource to check */
  resource: 'members' | 'staff';
  /** The element to render (typically a button) */
  children: React.ReactElement;
}

/**
 * Wraps a button element to disable it when the usage limit is reached.
 * Shows a tooltip explaining the limit.
 */
export function UsageLimitGuard({ resource, children }: UsageLimitGuardProps) {
  const { isLimitReached, usage, openUpgradeModal } = usePlan();
  const reached = isLimitReached(resource);
  const data = usage[resource];
  const labels = { members: 'member', staff: 'staff' };

  if (!reached) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      <div className="pointer-events-none opacity-40">
        {children}
      </div>
      <button
        onClick={() => openUpgradeModal()}
        className="absolute inset-0 z-10 flex items-center justify-center"
        title={`${labels[resource]} limit reached (${data.current}/${data.limit}). Upgrade to add more.`}
      >
        <span className="flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-1.5 text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider border border-red-200 dark:border-red-900/30 shadow-sm">
          <span className="material-symbols-outlined text-xs">block</span>
          Limit Reached
        </span>
      </button>
    </div>
  );
}
