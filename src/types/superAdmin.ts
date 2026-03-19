export type GymLifecycleStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'DELETED' | 'LOCKED' | 'PAST_DUE';

export type TenantFilter = 'ALL' | 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'LIMIT_REACHED';

export type TenantSort = 'newest' | 'most_members' | 'highest_revenue' | 'recent_activity';

export type PlatformAction =
  | 'VIEW_GYM'
  | 'IMPERSONATION_STARTED'
  | 'IMPERSONATION_ENDED'
  | 'GYM_SUSPENDED'
  | 'GYM_ACTIVATED'
  | 'GYM_DELETED'
  | 'SUBSCRIPTION_CHANGED'
  | 'TRIAL_EXTENDED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'SUBSCRIPTION_REACTIVATED';

export interface TenantUsageStats {
  memberCount: number;
  staffCount: number;
  activeStaffCount: number;
  checkinsThisWeek: number;
  revenueTotal: number;
  revenueMonth: number;
  recentPayments: number;
  limitWarnings: string[];
  lastActivityAt: string | null;
}

export interface TenantSummary {
  id: string;
  name: string;
  contactPhone: string | null;
  ownerUserId: string | null;
  ownerEmail: string | null;
  subscriptionTier: string | null;
  status: GymLifecycleStatus;
  createdAt: string;
  trialEndsAt: string | null;
  nextBillingDate: string | null;
  suspendedAt: string | null;
  deletedAt: string | null;
  usage: TenantUsageStats;
}

export interface PlatformOverviewMetrics {
  totalGyms: number;
  activeGyms: number;
  trialGyms: number;
  suspendedGyms: number;
  activeSubscriptions: number;
  mrr: number;
  totalMembers: number;
  churnedGyms: number;
}

export interface PlatformAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  gymId?: string;
}

export interface GymDetailsPayload extends TenantSummary {
  recentPayments: Array<{
    id: string;
    amount: number;
    createdAt: string;
    paymentMethod: string;
    memberName: string;
    planName: string;
  }>;
  recentStaffActions: Array<{
    id: string;
    actor: string;
    action: string;
    timestamp: string;
    metadata?: string;
  }>;
  latestNotifications: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
  }>;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  targetGym: string | null;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

export interface SubscriptionHistoryEntry {
  id: string;
  action: string;
  tier: string | null;
  status: string | null;
  timestamp: string;
  actor: string;
}
