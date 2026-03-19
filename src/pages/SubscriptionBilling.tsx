import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';
import { useToast } from '../components/ToastProvider';
import {
  PLAN_DISPLAY,
  PLAN_LIMITS,
  SubscriptionTier,
  normalizeTier,
  isUpgrade,
  TIER_ORDER,
} from '../lib/planConfig';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface GymSubscription {
  subscription_tier: string;
  status: string;
  trial_ends_at: string | null;
  next_billing_date: string | null;
  member_limit: number;
  staff_limit: number;
  location_limit: number;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  TRIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PAST_DUE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

// The 3 purchasable plan keys
const PURCHASABLE_TIERS: SubscriptionTier[] = ['BASIC', 'ADVANCED', 'PREMIUM'];

export default function SubscriptionBilling() {
  const { gymId } = useAuth();
  const { usage, usageLoaded, refreshUsage, tier: currentTier } = usePlan();
  const { showToast } = useToast();

  const [gym, setGym] = useState<GymSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePlanModal, setChangePlanModal] = useState<{ open: boolean; targetTier: SubscriptionTier | null }>({ open: false, targetTier: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchGym = useCallback(async () => {
    if (gymId === 'demo-gym-id' || !gymId) {
      setGym({
        subscription_tier: 'PREMIUM',
        status: 'TRIAL',
        trial_ends_at: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
        next_billing_date: null,
        member_limit: 99999,
        staff_limit: 99999,
        location_limit: 99,
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('subscription_tier, status, trial_ends_at, next_billing_date, member_limit, staff_limit, location_limit')
        .eq('id', gymId)
        .single();
      if (error) throw error;
      setGym(data);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      showToast('Failed to load subscription details.', 'error');
    } finally {
      setLoading(false);
    }
  }, [gymId, showToast]);

  useEffect(() => {
    fetchGym();
  }, [fetchGym]);

  const trialDaysLeft = gym?.status === 'TRIAL' && gym?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(gym.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const planDisplay = PLAN_DISPLAY[currentTier] ?? PLAN_DISPLAY.TRIAL;
  const gymStatus = gym?.status || 'TRIAL';

  // ── Change Plan Handler ──────────────────────────────────────
  const handleChangePlan = async () => {
    if (!changePlanModal.targetTier || !gymId) return;
    setSubmitting(true);
    try {
      const targetTier = changePlanModal.targetTier;
      const targetLimits = PLAN_LIMITS[targetTier];

      const { error } = await supabase.from('gyms').update({
        subscription_tier: targetTier,
        status: 'ACTIVE',
        member_limit: targetLimits.maxMembers,
        staff_limit: targetLimits.maxStaff,
        location_limit: targetLimits.maxLocations,
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq('id', gymId);

      if (error) throw error;

      showToast(`Plan changed to ${PLAN_DISPLAY[targetTier]?.name || targetTier} successfully!`, 'success');
      setChangePlanModal({ open: false, targetTier: null });
      await fetchGym();
      await refreshUsage();

      // Force reload to update auth context with new tier everywhere
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      console.error('Failed to change plan:', err);
      showToast(err.message || 'Failed to change plan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex justify-center items-center h-64">
        <div className="size-10 border-4 border-primary-default border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
          Subscription & Billing
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your plan, track usage, and upgrade your gym's capabilities.
        </p>
      </div>

      <div className="max-w-6xl space-y-8">
        {/* ═══ Section 1: Current Plan Card ═══ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary-default/40 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 opacity-[0.04] p-4">
            <span className="material-symbols-outlined text-[160px]">workspace_premium</span>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10">
                <span className="material-symbols-outlined text-3xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {planDisplay.icon}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black tracking-tight">{planDisplay.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[gymStatus] || 'bg-slate-500/20 text-slate-300'}`}>
                    {gymStatus}
                  </span>
                </div>
                <p className="text-white/60 text-sm">{planDisplay.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1.5 text-white/80">
                    <span className="material-symbols-outlined text-base">payments</span>
                    <span className="font-bold">{planDisplay.price}</span>
                    <span className="text-white/50">/month</span>
                  </div>
                  {gym?.next_billing_date && (
                    <div className="flex items-center gap-1.5 text-white/60">
                      <span className="material-symbols-outlined text-base">event</span>
                      <span>Renews {new Date(gym.next_billing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  {trialDaysLeft !== null && (
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <span className="material-symbols-outlined text-base">hourglass_top</span>
                      <span className="font-bold">Trial ends on {new Date(gym!.trial_ends_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="border-l border-white/20 pl-2 ml-1">{trialDaysLeft} days left</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Section 1.5: Billing Info ═══ */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-neutral-text dark:text-white">
            <span className="material-symbols-outlined text-primary-default">receipt_long</span>
            Billing Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Plan Name</p>
              <p className="font-semibold text-slate-900 dark:text-white">{planDisplay.name}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
              <p className="font-semibold text-slate-900 dark:text-white capitalize">{gymStatus.toLowerCase()}</p>
            </div>
            {(gymStatus === 'TRIAL' && gym?.trial_ends_at) ? (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Trial Ends On</p>
                <p className="font-semibold text-slate-900 dark:text-white">{new Date(gym.trial_ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Renewal Date</p>
                <p className="font-semibold text-slate-900 dark:text-white">{gym?.next_billing_date ? new Date(gym.next_billing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
              </div>
            )}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Method</p>
              <p className="font-semibold text-slate-500">Not added</p>
            </div>
          </div>
        </section>

        {/* ═══ Section 2: Usage Overview ═══ */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-neutral-text dark:text-white">
            <span className="material-symbols-outlined text-primary-default">monitoring</span>
            Usage Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Members */}
            <UsageMeter
              label="Members"
              icon="group"
              current={usage.members.current}
              limit={usage.members.limit}
              loaded={usageLoaded}
            />
            {/* Staff */}
            <UsageMeter
              label="Staff Accounts"
              icon="badge"
              current={usage.staff.current}
              limit={usage.staff.limit}
              loaded={usageLoaded}
            />
            {/* Locations */}
            <UsageMeter
              label="Gym Locations"
              icon="apartment"
              current={1}
              limit={PLAN_LIMITS[currentTier]?.maxLocations ?? 1}
              loaded={usageLoaded}
            />
          </div>
        </section>

        {/* ═══ Section 3: Plan Comparison ═══ */}
        <section>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-neutral-text dark:text-white">
            <span className="material-symbols-outlined text-primary-default">compare_arrows</span>
            Compare Plans
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PURCHASABLE_TIERS.map((tierKey) => {
              const plan = PLAN_DISPLAY[tierKey];
              const limits = PLAN_LIMITS[tierKey];
              const isCurrent = tierKey === currentTier;
              const isRecommended = tierKey === 'ADVANCED';
              const upgrading = isUpgrade(currentTier, tierKey);
              const downgrading = !isCurrent && !upgrading;

              return (
                <div
                  key={tierKey}
                  className={`relative flex flex-col rounded-2xl p-6 transition-all ${
                    isRecommended
                      ? 'bg-gradient-to-b from-primary-default to-blue-700 text-white ring-2 ring-primary-default shadow-xl shadow-blue-500/20 md:-mt-2 md:-mb-1'
                      : isCurrent
                      ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-600 shadow-lg shadow-emerald-500/10'
                      : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow'
                  }`}
                >
                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    {isCurrent && (
                      <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                        Current Plan
                      </span>
                    )}
                    {plan.tag && !isCurrent && (
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] ${
                        isRecommended ? 'bg-white/20 text-white' : 'bg-primary-default/10 text-primary-default'
                      }`}>
                        {plan.tag}
                      </span>
                    )}
                  </div>

                  {/* Plan Icon + Name */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`size-10 rounded-xl flex items-center justify-center ${
                      isRecommended ? 'bg-white/15' : 'bg-primary-default/10'
                    }`}>
                      <span className={`material-symbols-outlined text-xl ${isRecommended ? 'text-white' : 'text-primary-default'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {plan.icon}
                      </span>
                    </div>
                    <h3 className={`text-lg font-black tracking-tight ${isRecommended ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-3xl font-black ${isRecommended ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xs font-medium ${isRecommended ? 'text-blue-200' : 'text-slate-400'}`}>/month</span>
                  </div>
                  <p className={`text-xs mb-5 ${isRecommended ? 'text-blue-200' : 'text-slate-500'}`}>{plan.description}</p>

                  {/* Limits */}
                  <div className={`rounded-xl p-3 mb-4 ${isRecommended ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                    <div className="grid grid-cols-3 gap-2">
                      <LimitBadge label="Members" value={limits.maxMembers >= 99999 ? '∞' : limits.maxMembers.toLocaleString()} highlighted={isRecommended} />
                      <LimitBadge label="Staff" value={limits.maxStaff >= 99999 ? '∞' : String(limits.maxStaff)} highlighted={isRecommended} />
                      <LimitBadge label="Locations" value={limits.maxLocations >= 99 ? '∞' : String(limits.maxLocations)} highlighted={isRecommended} />
                    </div>
                  </div>

                  <div className={`h-px w-full mb-4 ${isRecommended ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`} />

                  {/* Features */}
                  <ul className="space-y-2 flex-1 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${isRecommended ? 'text-blue-50' : 'text-slate-700 dark:text-slate-300'}`}>
                        <span className={`material-symbols-outlined text-sm mt-0.5 shrink-0 ${isRecommended ? 'text-green-300' : 'text-green-500'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => {
                      if (!isCurrent) setChangePlanModal({ open: true, targetTier: tierKey });
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.97] ${
                      isCurrent
                        ? 'bg-emerald-100 text-emerald-600 cursor-default dark:bg-emerald-900/30 dark:text-emerald-400'
                        : isRecommended
                        ? 'bg-white text-primary-default hover:bg-blue-50 shadow-lg'
                        : upgrading
                        ? 'bg-primary-default text-white hover:brightness-110 shadow-md shadow-primary-default/20'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {isCurrent ? '✓ Current Plan' : upgrading ? 'Upgrade' : 'Downgrade'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ Info Banner ═══ */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-5 flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl mt-0.5 shrink-0">info</span>
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">No payment gateway in V1</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
              Plan changes take effect immediately. In a future update, payment processing will be integrated. For now, changes are handled directly.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Change Plan Modal ═══ */}
      {changePlanModal.open && changePlanModal.targetTier && (
        <ChangePlanModal
          currentTier={currentTier}
          targetTier={changePlanModal.targetTier}
          submitting={submitting}
          onConfirm={handleChangePlan}
          onClose={() => setChangePlanModal({ open: false, targetTier: null })}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// UsageMeter Sub-component
// ──────────────────────────────────────────────────────────────

function UsageMeter({ label, icon, current, limit, loaded }: {
  label: string; icon: string; current: number; limit: number; loaded: boolean;
}) {
  const isUnlimited = limit >= 99999;
  const rawPercent = isUnlimited ? Math.min((current/limit)*100, 100) : (current / limit) * 100;
  const percent = Math.round(rawPercent);
  const isExceeded = !isUnlimited && current > limit;
  const isAtLimit = !isUnlimited && current === limit;
  const isNearLimit = !isUnlimited && current >= limit * 0.8 && current < limit;

  let borderColor = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30';
  if (isExceeded) borderColor = 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10';
  else if (isAtLimit || isNearLimit) borderColor = 'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10';

  return (
    <div className={`rounded-xl p-5 border transition-colors ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-lg ${isExceeded ? 'text-red-500' : 'text-primary-default'}`}>{icon}</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        {isExceeded && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            Exceeded
          </span>
        )}
        {isAtLimit && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            At limit
          </span>
        )}
        {isNearLimit && !isAtLimit && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            Almost full
          </span>
        )}
      </div>

      {loaded ? (
        <>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{current.toLocaleString()}</span>
            <span className="text-slate-400 text-sm font-medium">/ {isUnlimited ? '∞' : limit.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isExceeded ? 'bg-red-500' : (isAtLimit || isNearLimit) ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(isUnlimited ? 3 : percent, 100)}%` }}
            />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <div className="skeleton w-20 h-6 rounded" />
          <div className="skeleton w-full h-2 rounded-full" />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// LimitBadge Sub-component
// ──────────────────────────────────────────────────────────────

function LimitBadge({ label, value, highlighted }: { label: string; value: string; highlighted: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-black ${highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{value}</p>
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${highlighted ? 'text-blue-200' : 'text-slate-400'}`}>{label}</p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// ChangePlanModal Sub-component
// ──────────────────────────────────────────────────────────────

function ChangePlanModal({ currentTier, targetTier, submitting, onConfirm, onClose }: {
  currentTier: SubscriptionTier;
  targetTier: SubscriptionTier;
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const currentPlan = PLAN_DISPLAY[currentTier];
  const targetPlan = PLAN_DISPLAY[targetTier];
  const targetLimits = PLAN_LIMITS[targetTier];
  const upgrading = isUpgrade(currentTier, targetTier);

  // Features that will be unlocked
  const currentFeatures = new Set(currentPlan?.features || []);
  const newFeatures = (targetPlan?.features || []).filter(f => !currentFeatures.has(f) && !f.startsWith('Everything'));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} aria-label="Close" />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl" role="dialog" aria-modal="true">
        {/* Header */}
        <div className={`px-6 py-6 ${upgrading ? 'bg-gradient-to-br from-primary-default to-blue-700' : 'bg-gradient-to-br from-slate-700 to-slate-800'} text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 opacity-[0.06] p-2">
            <span className="material-symbols-outlined text-[100px]">{upgrading ? 'upgrade' : 'download'}</span>
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-3">
              <span className="material-symbols-outlined text-xs">{upgrading ? 'arrow_upward' : 'arrow_downward'}</span>
              {upgrading ? 'Upgrade' : 'Downgrade'}
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {upgrading ? 'Upgrade' : 'Switch'} to {targetPlan?.name}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {upgrading
                ? 'Unlock more features and higher limits for your gym.'
                : 'Your limits and feature access will be adjusted.'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Plan change summary */}
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">FROM</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{currentPlan?.name}</p>
              <p className="text-xs text-slate-500">{currentPlan?.price}/mo</p>
            </div>
            <span className="material-symbols-outlined text-xl text-primary-default shrink-0">arrow_forward</span>
            <div className="flex-1 rounded-xl bg-primary-default/10 dark:bg-primary-default/20 p-3 text-center border border-primary-default/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-default mb-1">TO</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{targetPlan?.name}</p>
              <p className="text-xs text-primary-default font-semibold">{targetPlan?.price}/mo</p>
            </div>
          </div>

          {/* New limits */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">New Limits</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-black text-slate-900 dark:text-white">{targetLimits.maxMembers >= 99999 ? '∞' : targetLimits.maxMembers.toLocaleString()}</p>
                <p className="text-[10px] font-semibold uppercase text-slate-400">Members</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-900 dark:text-white">{targetLimits.maxStaff >= 99999 ? '∞' : targetLimits.maxStaff}</p>
                <p className="text-[10px] font-semibold uppercase text-slate-400">Staff</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-900 dark:text-white">{targetLimits.maxLocations >= 99 ? '∞' : targetLimits.maxLocations}</p>
                <p className="text-[10px] font-semibold uppercase text-slate-400">Locations</p>
              </div>
            </div>
          </div>

          {/* Unlocked features (upgrade only) */}
          {upgrading && newFeatures.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Features You'll Unlock</p>
              <ul className="space-y-1.5">
                {newFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-sm text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Downgrade warning */}
          {!upgrading && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 p-4 flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5 shrink-0">warning</span>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Downgrading may restrict access to some features and reduce your usage limits. If you exceed the new limits, some features will be locked.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={submitting} className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className={`flex-1 h-12 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center ${
              upgrading
                ? 'bg-gradient-to-r from-primary-default to-blue-600 text-white hover:brightness-110'
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:brightness-110'
            }`}
          >
            {submitting ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : upgrading ? (
              'Confirm Upgrade'
            ) : (
              'Confirm Downgrade'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
