// ──────────────────────────────────────────────────────────────
// Plan Feature Configuration - Centralized SaaS Access Control
// ──────────────────────────────────────────────────────────────

/**
 * All features that can be gated by plan.
 * When adding a new feature, add it here first.
 */
export type PlanFeature =
  | 'basicDashboard'
  | 'memberManagement'
  | 'membershipPlans'
  | 'paymentTracking'
  | 'expiryTracking'
  | 'attendanceTracking'
  | 'trainerManagement'
  | 'advancedDashboard'
  | 'analyticsAdvanced'
  | 'memberActivityTracking'
  | 'reports'
  | 'prioritySupport'
  | 'qrCheckin'
  | 'staffManagement'
  | 'multiGym'
  | 'notifications'
  | 'payments';

/**
 * Subscription tiers as stored in the database.
 * Maps to the `subscription_tier` enum in the `gyms` table.
 */
export type SubscriptionTier = 'TRIAL' | 'FREE' | 'BASIC' | 'ADVANCED' | 'PREMIUM';

/**
 * Feature access map per plan tier.
 * `true` = feature is accessible, `false` = locked/gated.
 *
 * Mapping:
 *   BASIC  → "Basic"
 *   ADVANCED    → "Advanced"
 *   PREMIUM → "Premium"
 */
export const PLAN_FEATURES: Record<SubscriptionTier, Record<PlanFeature, boolean>> = {
  TRIAL: {
    basicDashboard: true,
    memberManagement: true,
    membershipPlans: true,
    paymentTracking: true,
    expiryTracking: true,
    payments: true,
    attendanceTracking: true,
    trainerManagement: true,
    advancedDashboard: true,
    analyticsAdvanced: true,
    memberActivityTracking: true,
    reports: true,
    prioritySupport: true,
    qrCheckin: false,
    staffManagement: false,
    multiGym: false,
    notifications: false,
  },
  FREE: {
    basicDashboard: true,
    memberManagement: true,
    membershipPlans: true,
    paymentTracking: true,
    expiryTracking: true,
    payments: true,
    attendanceTracking: false,
    trainerManagement: false,
    advancedDashboard: false,
    analyticsAdvanced: false,
    memberActivityTracking: false,
    reports: false,
    prioritySupport: false,
    qrCheckin: false,
    staffManagement: false,
    multiGym: false,
    notifications: false,
  },
  BASIC: {
    basicDashboard: true,
    memberManagement: true,
    membershipPlans: true,
    paymentTracking: true,
    expiryTracking: true,
    payments: true,
    attendanceTracking: false,
    trainerManagement: false,
    advancedDashboard: false,
    analyticsAdvanced: false,
    memberActivityTracking: false,
    reports: false,
    prioritySupport: false,
    qrCheckin: false,
    staffManagement: false,
    multiGym: false,
    notifications: false,
  },
  ADVANCED: {
    basicDashboard: true,
    memberManagement: true,
    membershipPlans: true,
    paymentTracking: true,
    expiryTracking: true,
    payments: true,
    attendanceTracking: true,
    trainerManagement: true,
    advancedDashboard: true,
    analyticsAdvanced: true,
    memberActivityTracking: true,
    reports: true,
    prioritySupport: true,
    qrCheckin: false,
    staffManagement: false,
    multiGym: false,
    notifications: false,
  },
  PREMIUM: {
    basicDashboard: true,
    memberManagement: true,
    membershipPlans: true,
    paymentTracking: true,
    expiryTracking: true,
    payments: true,
    attendanceTracking: true,
    trainerManagement: true,
    advancedDashboard: true,
    analyticsAdvanced: true,
    memberActivityTracking: true,
    reports: true,
    prioritySupport: true,
    qrCheckin: true,
    staffManagement: true,
    multiGym: true,
    notifications: true,
  },
};

/**
 * Usage limits per plan tier.
 */
export interface PlanLimits {
  maxMembers: number;
  maxStaff: number;
  maxLocations: number;
}

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  TRIAL: { maxMembers: 1200, maxStaff: 3, maxLocations: 3 },
  FREE: { maxMembers: 100, maxStaff: 1, maxLocations: 1 },
  BASIC: { maxMembers: 250, maxStaff: 2, maxLocations: 1 },
  ADVANCED: { maxMembers: 1200, maxStaff: 3, maxLocations: 3 },
  PREMIUM: { maxMembers: 99999, maxStaff: 99999, maxLocations: 99 },
};

/**
 * Display metadata for each plan tier.
 */
export interface PlanDisplay {
  name: string;
  shortName: string;
  price: string;
  priceNumeric: number;
  tag: string;
  color: string;
  icon: string;
  description: string;
  features: string[];
}

export const PLAN_DISPLAY: Record<string, PlanDisplay> = {
  TRIAL: {
    name: 'Advanced (Trial)',
    shortName: 'Trial',
    price: 'Free',
    priceNumeric: 0,
    tag: '30 Days Free',
    color: 'slate',
    icon: 'hourglass_top',
    description: 'Try all the Advanced Plan features free for 30 days.',
    features: [
      'Up to 1200 members',
      '3 staff accounts',
      'Attendance tracking',
      'Advanced analytics dashboard',
      'Trainer management',
      'Export reports',
      'Priority support',
    ],
  },
  FREE: {
    name: 'Free',
    shortName: 'Free',
    price: '৳0',
    priceNumeric: 0,
    tag: '',
    color: 'slate',
    icon: 'volunteer_activism',
    description: 'Get started at no cost',
    features: ['Basic Dashboard', 'Up to 100 Members', 'Member Management', 'Payments'],
  },
  BASIC: {
    name: 'Basic',
    shortName: 'Basic',
    price: 'BDT 1,000',
    priceNumeric: 1000,
    tag: '',
    color: 'blue',
    icon: 'rocket_launch',
    description: 'Essential tools for gym management.',
    features: [
      'Up to 250 Members',
      'Basic dashboard',
      'Manual Attendance',
      'Basic Analytics',
      'Member management',
      'Membership plans',
      'Payment tracking',
      'Membership expiry tracking',
    ],
  },
  ADVANCED: {
    name: 'Advanced',
    shortName: 'Advanced',
    price: 'BDT 1,500',
    priceNumeric: 1500,
    tag: 'Most Popular',
    color: 'primary',
    icon: 'bolt',
    description: 'Designed for growing gyms with active members and trainers.',
    features: [
      'Up to 1200 members',
      '3 staff accounts',
      'Attendance tracking',
      'Advanced analytics dashboard',
      'Trainer management',
      'Export reports',
      'Priority support',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    shortName: 'Premium',
    price: 'BDT 2,000',
    priceNumeric: 2000,
    tag: 'All Access',
    color: 'indigo',
    icon: 'workspace_premium',
    description: 'Built for high-volume gyms and professional fitness centers.',
    features: [
      'Unlimited Members & Staff',
      'Everything in Advanced Plan',
      'QR Code Check-in System',
      'Multi-Gym Management',
      'Bulk SMS & WhatsApp Marketing',
      'Dedicated Success Manager',
      'Custom API & Integrations',
    ],
  },
};

/**
 * Feature metadata for display in locked overlays.
 */
export interface FeatureMeta {
  label: string;
  description: string;
  icon: string;
  requiredPlan: SubscriptionTier;
}

export const FEATURE_META: Record<PlanFeature, FeatureMeta> = {
  advancedDashboard: {
    label: 'Advanced Dashboard',
    description: 'Deep analytics, heatmaps, trainer KPIs, and AI-powered insights',
    icon: 'dashboard_customize',
    requiredPlan: 'ADVANCED',
  },
  qrCheckin: {
    label: 'QR Code Check-in',
    description: 'Scan QR codes for instant member check-in and attendance tracking',
    icon: 'qr_code_scanner',
    requiredPlan: 'PREMIUM',
  },
  staffManagement: {
    label: 'Staff Management',
    description: 'Invite and manage staff with role-based access control',
    icon: 'badge',
    requiredPlan: 'PREMIUM',
  },
  analyticsAdvanced: {
    label: 'Advanced Analytics',
    description: 'Revenue trends, retention analysis, and predictive insights',
    icon: 'bar_chart',
    requiredPlan: 'ADVANCED',
  },
  reports: {
    label: 'Reports',
    description: 'Generate detailed business and member reports',
    icon: 'summarize',
    requiredPlan: 'ADVANCED',
  },
  notifications: {
    label: 'Notifications & Campaigns',
    description: 'Automated SMS alerts and targeted member campaigns',
    icon: 'notifications',
    requiredPlan: 'PREMIUM',
  },
  memberManagement: {
    label: 'Member Management',
    description: 'Add, edit, and manage your gym members',
    icon: 'group',
    requiredPlan: 'TRIAL',
  },
  payments: {
    label: 'Payment Tracking',
    description: 'Track memberships and payments',
    icon: 'payments',
    requiredPlan: 'TRIAL',
  },
  paymentTracking: {
    label: 'Payment Tracking',
    description: 'Track and manage membership payments',
    icon: 'payments',
    requiredPlan: 'TRIAL',
  },
  basicDashboard: {
    label: 'Basic Dashboard',
    description: 'Essential metrics and quick overview',
    icon: 'dashboard',
    requiredPlan: 'TRIAL',
  },
  membershipPlans: {
    label: 'Membership Plans',
    description: 'Create and manage subscription plans',
    icon: 'card_membership',
    requiredPlan: 'TRIAL',
  },
  expiryTracking: {
    label: 'Expiry Tracking',
    description: 'Track when memberships are due to expire',
    icon: 'event_busy',
    requiredPlan: 'TRIAL',
  },
  attendanceTracking: {
    label: 'Attendance Tracking',
    description: 'Track member check-ins and attendance patterns',
    icon: 'fact_check',
    requiredPlan: 'ADVANCED',
  },
  trainerManagement: {
    label: 'Trainer Management',
    description: 'Manage trainers, assignments, and performance',
    icon: 'fitness_center',
    requiredPlan: 'ADVANCED',
  },
  memberActivityTracking: {
    label: 'Member Activity',
    description: 'Detailed activity logs and member behavior insights',
    icon: 'timeline',
    requiredPlan: 'ADVANCED',
  },
  prioritySupport: {
    label: 'Priority Support',
    description: 'Get faster response and dedicated support',
    icon: 'support_agent',
    requiredPlan: 'ADVANCED',
  },
  multiGym: {
    label: 'Multi-Gym / Multi-Branch',
    description: 'Manage multiple gym locations from one account',
    icon: 'apartment',
    requiredPlan: 'PREMIUM',
  },
};

// ──────────────────────────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────────────────────────

/**
 * Normalizes the DB subscription tier string to a valid SubscriptionTier.
 */
export function normalizeTier(tier: string | null | undefined): SubscriptionTier {
  if (!tier) return 'TRIAL';
  const upper = tier.toUpperCase();
  if (upper in PLAN_FEATURES) return upper as SubscriptionTier;
  // Legacy mapping
  if (upper === 'STARTER') return 'BASIC';
  if (upper === 'PRO' || upper === 'POWER PLUS' || upper === 'POWER_PLUS' || upper === 'ADVANCED') return 'ADVANCED';
  if (upper === 'ENTERPRISE' || upper === 'ELITE LEGEND' || upper === 'ELITE_LEGEND' || upper === 'PREMIUM') return 'PREMIUM';
  return 'TRIAL';
}

/**
 * Checks if a given plan tier has access to a specific feature.
 */
export function canAccessFeature(tier: string | null | undefined, feature: PlanFeature): boolean {
  const normalizedTier = normalizeTier(tier);
  return PLAN_FEATURES[normalizedTier]?.[feature] ?? false;
}

/**
 * Gets the usage limits for a plan tier.
 */
export function getPlanLimits(tier: string | null | undefined): PlanLimits {
  const normalizedTier = normalizeTier(tier);
  return PLAN_LIMITS[normalizedTier] ?? PLAN_LIMITS.TRIAL;
}

/**
 * Gets the display metadata for a plan tier.
 */
export function getPlanDisplay(tier: string | null | undefined): PlanDisplay {
  const normalizedTier = normalizeTier(tier);
  return PLAN_DISPLAY[normalizedTier] ?? PLAN_DISPLAY.TRIAL;
}

/**
 * Checks if a plan tier is a "basic" tier (no premium features).
 */
export function isBasicTier(tier: string | null | undefined): boolean {
  const normalizedTier = normalizeTier(tier);
  return normalizedTier === 'TRIAL' || normalizedTier === 'FREE' || normalizedTier === 'BASIC';
}

/**
 * Gets the minimum plan required for a feature.
 */
export function getRequiredPlan(feature: PlanFeature): SubscriptionTier {
  return FEATURE_META[feature]?.requiredPlan ?? 'ADVANCED';
}

/**
 * Returns all features that are locked for the given plan.
 */
export function getLockedFeatures(tier: string | null | undefined): PlanFeature[] {
  const normalizedTier = normalizeTier(tier);
  const features = PLAN_FEATURES[normalizedTier];
  if (!features) return [];
  return (Object.entries(features) as [PlanFeature, boolean][])
    .filter(([, allowed]) => !allowed)
    .map(([feature]) => feature);
}

/**
 * Ordered list of tiers for comparison logic.
 */
export const TIER_ORDER: SubscriptionTier[] = ['TRIAL', 'FREE', 'BASIC', 'ADVANCED', 'PREMIUM'];

/**
 * Compare two tiers. Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareTiers(a: SubscriptionTier, b: SubscriptionTier): number {
  return TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b);
}

/**
 * Check if upgrading from current to target is an upgrade (target is higher).
 */
export function isUpgrade(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
  return compareTiers(targetTier, currentTier) > 0;
}
