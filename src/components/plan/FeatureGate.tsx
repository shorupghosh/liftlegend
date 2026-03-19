import React, { useState } from 'react';
import { usePlan } from '../../contexts/PlanContext';
import { PlanFeature, FEATURE_META, PLAN_DISPLAY } from '../../lib/planConfig';

// ──────────────────────────────────────────────────────────────
// FeatureGate — Wraps children with plan-based access check
// ──────────────────────────────────────────────────────────────

interface FeatureGateProps {
  /** The feature key to check access for */
  feature: PlanFeature;
  /** Content to render if allowed */
  children: React.ReactNode;
  /** Optional: render a completely custom locked view instead of default */
  fallback?: React.ReactNode;
  /** If true, show a blurred preview instead of the alternative fallback */
  showPreview?: boolean;
}

export default function FeatureGate({ feature, children, fallback, showPreview = true }: FeatureGateProps) {
  const { canAccess, openUpgradeModal } = usePlan();

  // If feature is accessible, render children
  if (canAccess(feature)) {
    return <>{children}</>;
  }

  // If a custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: show locked overlay (optionally with blurred preview)
  return (
    <LockedFeatureView
      feature={feature}
      showPreview={showPreview}
      onUpgrade={() => openUpgradeModal(feature)}
    >
      {children}
    </LockedFeatureView>
  );
}

// ──────────────────────────────────────────────────────────────
// LockedFeatureView — Blurred preview with upgrade overlay
// ──────────────────────────────────────────────────────────────

interface LockedFeatureViewProps {
  feature: PlanFeature;
  showPreview: boolean;
  onUpgrade: () => void;
  children: React.ReactNode;
}

function LockedFeatureView({ feature, showPreview, onUpgrade, children }: LockedFeatureViewProps) {
  const meta = FEATURE_META[feature];
  const requiredPlanDisplay = PLAN_DISPLAY[meta.requiredPlan];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800"
      role="button"
      tabIndex={0}
      onClick={onUpgrade}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onUpgrade(); } }}
      aria-label={`${meta.label} is locked. Click to upgrade.`}
    >
      {/* Blurred preview */}
      {showPreview && (
        <div className="pointer-events-none select-none blur-[6px] saturate-[0.6] opacity-60" aria-hidden="true">
          {children}
        </div>
      )}

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-slate-950/60 via-slate-900/40 to-primary-default/20 backdrop-blur-[2px] ${!showPreview ? 'relative min-h-[280px]' : ''}`} />

      {/* Lock card */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/95 dark:bg-slate-900/95 p-7 text-center shadow-2xl backdrop-blur-xl transition-transform duration-300 group-hover:scale-[1.02]">
          {/* Lock icon */}
          <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary-default text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-xs">{meta.icon}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Upgrade to Unlock
          </h3>
          <p className="mt-1 text-sm font-semibold text-primary-default">
            {meta.label}
          </p>

          {/* Description */}
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {meta.description}
          </p>

          {/* Required plan badge */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-default/10 px-4 py-1.5">
            <span className="material-symbols-outlined text-sm text-primary-default">{requiredPlanDisplay?.icon || 'bolt'}</span>
            <span className="text-xs font-black uppercase tracking-widest text-primary-default">
              {requiredPlanDisplay?.name || 'Advanced'} Plan
            </span>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onUpgrade(); }}
            className="mt-5 w-full h-12 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 text-sm font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-[0.97] transition-all"
          >
            View Plans & Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// FeatureGateInline — Inline lock for buttons / small elements
// ──────────────────────────────────────────────────────────────

interface FeatureGateInlineProps {
  feature: PlanFeature;
  children: React.ReactNode;
}

/**
 * Use this for inline elements like buttons/links.
 * If locked: disables the element and shows a lock icon.
 * Clicking opens the upgrade modal.
 */
export function FeatureGateInline({ feature, children }: FeatureGateInlineProps) {
  const { canAccess, openUpgradeModal } = usePlan();
  const meta = FEATURE_META[feature];

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      <div className="pointer-events-none opacity-50 blur-[1px]">
        {children}
      </div>
      <button
        onClick={() => openUpgradeModal(feature)}
        className="absolute inset-0 z-10 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        title={`Upgrade to ${meta.requiredPlan} to access ${meta.label}`}
      >
        <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{meta.requiredPlan}</span>
      </button>
    </div>
  );
}
