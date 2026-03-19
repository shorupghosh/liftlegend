import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { useDemoMode } from '../hooks/useDemoMode';
import {
  PlanFeature,
  SubscriptionTier,
  canAccessFeature,
  getPlanLimits,
  getPlanDisplay,
  isBasicTier,
  normalizeTier,
  PlanLimits,
  PlanDisplay,
  FEATURE_META,
} from '../lib/planConfig';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface UsageData {
  members: { current: number; limit: number; remaining: number };
  staff: { current: number; limit: number; remaining: number };
}

interface PlanContextType {
  /** Current normalized tier */
  tier: SubscriptionTier;
  /** Whether the current plan is a basic/free/trial tier */
  isBasic: boolean;
  /** Display info for the current plan */
  planDisplay: PlanDisplay;
  /** Plan limits */
  limits: PlanLimits;
  /** Current usage data */
  usage: UsageData;
  /** Trial days left (if on trial) */
  trialDaysLeft: number | null;
  /** Whether usage data has loaded */
  usageLoaded: boolean;
  /** Check if a feature is accessible on the current plan */
  canAccess: (feature: PlanFeature) => boolean;
  /** Check if a resource limit has been reached */
  isLimitReached: (resource: 'members' | 'staff') => boolean;
  /** Get usage percentage for a resource */
  getUsagePercent: (resource: 'members' | 'staff') => number;
  /** Open the upgrade modal */
  openUpgradeModal: (feature?: PlanFeature) => void;
  /** Close the upgrade modal */
  closeUpgradeModal: () => void;
  /** Whether the upgrade modal is open */
  upgradeModalOpen: boolean;
  /** The feature that triggered the upgrade modal */
  upgradeFeature: PlanFeature | null;
  /** Refresh usage data */
  refreshUsage: () => Promise<void>;
}

const defaultUsage: UsageData = {
  members: { current: 0, limit: 250, remaining: 250 },
  staff: { current: 0, limit: 2, remaining: 2 },
};

const PlanContext = createContext<PlanContextType>({
  tier: 'TRIAL',
  isBasic: true,
  planDisplay: getPlanDisplay('TRIAL'),
  limits: getPlanLimits('TRIAL'),
  usage: defaultUsage,
  trialDaysLeft: null,
  usageLoaded: false,
  canAccess: () => false,
  isLimitReached: () => false,
  getUsagePercent: () => 0,
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
  upgradeModalOpen: false,
  upgradeFeature: null,
  refreshUsage: async () => {},
});

export const usePlan = () => useContext(PlanContext);

// ──────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { gymId, subscriptionTier } = useAuth();
  const { isDemoMode } = useDemoMode();

  const tier = normalizeTier(subscriptionTier);
  const basic = isBasicTier(subscriptionTier);
  const display = getPlanDisplay(subscriptionTier);
  const limits = getPlanLimits(subscriptionTier);

  const [usage, setUsage] = useState<UsageData>(defaultUsage);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [usageLoaded, setUsageLoaded] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<PlanFeature | null>(null);

  // Fetch live usage from DB
  const refreshUsage = useCallback(async () => {
    if (isDemoMode) {
      // Demo mode: use mock data
      setUsage({
        members: { current: 47, limit: 99999, remaining: 99952 },
        staff: { current: 3, limit: 99999, remaining: 99996 },
      });
      setTrialDaysLeft(29);
      setUsageLoaded(true);
      return;
    }

    if (!gymId) return;

    try {
      const [memberRes, staffRes, gymRes] = await Promise.all([
        supabase
          .from('members')
          .select('id', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .eq('status', 'ACTIVE'),
        supabase
          .from('user_roles')
          .select('id', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .in('role', ['MANAGER', 'TRAINER']),
        supabase
          .from('gyms')
          .select('member_limit, staff_limit, trial_ends_at')
          .eq('id', gymId)
          .maybeSingle(),
      ]);

      const memberCount = memberRes.count ?? 0;
      const staffCount = staffRes.count ?? 0;
      const memberLimit = gymRes.data?.member_limit ?? limits.maxMembers;
      const staffLimit = gymRes.data?.staff_limit ?? limits.maxStaff;

      setUsage({
        members: {
          current: memberCount,
          limit: memberLimit,
          remaining: Math.max(0, memberLimit - memberCount),
        },
        staff: {
          current: staffCount,
          limit: staffLimit,
          remaining: Math.max(0, staffLimit - staffCount),
        },
      });
      
      if (gymRes.data?.trial_ends_at) {
         setTrialDaysLeft(Math.max(0, Math.ceil((new Date(gymRes.data.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))));
      } else {
         setTrialDaysLeft(null);
      }
    } catch (err) {
      console.error('Failed to fetch usage data:', err);
    } finally {
      setUsageLoaded(true);
    }
  }, [gymId, isDemoMode, limits.maxMembers, limits.maxStaff]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  const canAccess = useCallback(
    (feature: PlanFeature) => {
      if (isDemoMode) return true; // Demo mode has all features
      return canAccessFeature(subscriptionTier, feature);
    },
    [isDemoMode, subscriptionTier]
  );

  const isLimitReached = useCallback(
    (resource: 'members' | 'staff') => {
      if (isDemoMode) return false;
      return usage[resource].current >= usage[resource].limit;
    },
    [isDemoMode, usage]
  );

  const getUsagePercent = useCallback(
    (resource: 'members' | 'staff') => {
      const { current, limit } = usage[resource];
      if (limit === 0) return 100;
      return Math.round((current / limit) * 100);
    },
    [usage]
  );

  const openUpgradeModal = useCallback((feature?: PlanFeature) => {
    setUpgradeFeature(feature ?? null);
    setUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setUpgradeModalOpen(false);
    setUpgradeFeature(null);
  }, []);

  return (
    <PlanContext.Provider
      value={{
        tier,
        isBasic: basic,
        planDisplay: display,
        limits,
        usage,
        trialDaysLeft,
        usageLoaded,
        canAccess,
        isLimitReached,
        getUsagePercent,
        openUpgradeModal,
        closeUpgradeModal,
        upgradeModalOpen,
        upgradeFeature,
        refreshUsage,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};
