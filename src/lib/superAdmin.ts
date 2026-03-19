import { supabase } from './supabase';
import type {
  AuditLogEntry,
  GymDetailsPayload,
  GymLifecycleStatus,
  PlatformAction,
  PlatformAlert,
  PlatformOverviewMetrics,
  SubscriptionHistoryEntry,
  TenantFilter,
  TenantSort,
  TenantSummary,
  TenantUsageStats,
} from '../types/superAdmin';

const IMPERSONATION_KEY = 'liftlegend_impersonation_session';

type GymRecord = {
  id: string;
  name: string;
  contact_phone?: string | null;
  owner_user_id?: string | null;
  owner_email?: string | null;
  subscription_tier?: string | null;
  status: string;
  created_at: string;
  trial_ends_at?: string | null;
  next_billing_date?: string | null;
  suspended_at?: string | null;
  deleted_at?: string | null;
};

type ImpersonationSession = {
  gymId: string;
  gymName: string;
  ownerEmail: string | null;
  subscriptionTier: string | null;
  status: string;
  startedAt: string;
};

const PLAN_LIMITS: Record<string, { members: number; staff: number }> = {
  BASIC: { members: 150, staff: 5 },
  ADVANCED: { members: 1200, staff: 3 },
  PREMIUM: { members: 99999, staff: 99999 },
};

const statusMap = (status: string): GymLifecycleStatus => {
  if (status === 'LOCKED') return 'SUSPENDED';
  if (status === 'PAST_DUE') return 'EXPIRED';
  return (status?.toUpperCase() as GymLifecycleStatus) || 'ACTIVE';
};

const lifecycleToDbStatus = (status: GymLifecycleStatus) => {
  if (status === 'SUSPENDED') return 'LOCKED';
  if (status === 'EXPIRED') return 'PAST_DUE';
  return status;
};

const sumByGym = <T extends { gym_id: string }>(rows: T[], key: keyof T & string) => {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    map.set(row.gym_id, (map.get(row.gym_id) || 0) + Number(row[key] || 0));
  });
  return map;
};

const countByGym = <T extends { gym_id: string }>(rows: T[]) => {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    map.set(row.gym_id, (map.get(row.gym_id) || 0) + 1);
  });
  return map;
};

const getWeekStartIso = () => {
  const date = new Date();
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const getMonthStartIso = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

function buildTenantUsage(
  gymId: string,
  options: {
    memberCounts: Map<string, number>;
    staffCounts: Map<string, number>;
    activeStaffCounts: Map<string, number>;
    checkinsWeekCounts: Map<string, number>;
    revenueTotalByGym: Map<string, number>;
    revenueMonthByGym: Map<string, number>;
    recentPaymentsByGym: Map<string, number>;
    lastAttendanceByGym: Map<string, string>;
    tier: string | null;
  }
): TenantUsageStats {
  const memberCount = options.memberCounts.get(gymId) || 0;
  const staffCount = options.staffCounts.get(gymId) || 0;
  const activeStaffCount = options.activeStaffCounts.get(gymId) || 0;
  const checkinsThisWeek = options.checkinsWeekCounts.get(gymId) || 0;
  const revenueTotal = options.revenueTotalByGym.get(gymId) || 0;
  const revenueMonth = options.revenueMonthByGym.get(gymId) || 0;
  const recentPayments = options.recentPaymentsByGym.get(gymId) || 0;
  const lastActivityAt = options.lastAttendanceByGym.get(gymId) || null;
  const limitWarnings: string[] = [];
  const tierLimits = options.tier ? PLAN_LIMITS[options.tier.toUpperCase()] : undefined;

  if (tierLimits) {
    if (memberCount >= tierLimits.members) {
      limitWarnings.push('Member limit reached');
    }
    if (staffCount >= tierLimits.staff) {
      limitWarnings.push('Staff limit reached');
    }
  }

  return {
    memberCount,
    staffCount,
    activeStaffCount,
    checkinsThisWeek,
    revenueTotal,
    revenueMonth,
    recentPayments,
    limitWarnings,
    lastActivityAt,
  };
}

export function getImpersonationSession(): ImpersonationSession | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(IMPERSONATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ImpersonationSession;
  } catch {
    return null;
  }
}

function setImpersonationSession(session: ImpersonationSession | null) {
  if (typeof window === 'undefined') return;
  if (!session) {
    window.sessionStorage.removeItem(IMPERSONATION_KEY);
    return;
  }
  window.sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify(session));
}

export async function fetchTenantSummaries() {
  const monthStart = getMonthStartIso();
  const weekStart = getWeekStartIso();

  const [
    gymsRes,
    membersRes,
    staffRes,
    paymentsRes,
    weekAttendanceRes,
    latestAttendanceRes,
    ownersRes,
  ] = await Promise.all([
    supabase
      .from('gyms')
      .select('id, name, contact_phone, owner_user_id, owner_email, subscription_tier, status, created_at, trial_ends_at, next_billing_date, suspended_at, deleted_at')
      .order('created_at', { ascending: false }),
    supabase.from('members').select('gym_id, created_at'),
    supabase.from('user_roles').select('gym_id, role, status, display_name, invited_email'),
    supabase.from('membership_history').select('gym_id, price_paid, created_at'),
    supabase.from('attendance').select('gym_id, check_in_time').gte('check_in_time', weekStart),
    supabase.from('attendance').select('gym_id, check_in_time').order('check_in_time', { ascending: false }).limit(500),
    supabase.from('user_roles').select('gym_id, user_id, display_name, invited_email').eq('role', 'OWNER'),
  ]);

  if (gymsRes.error) throw gymsRes.error;
  if (membersRes.error) throw membersRes.error;
  if (staffRes.error) throw staffRes.error;
  if (paymentsRes.error) throw paymentsRes.error;
  if (weekAttendanceRes.error) throw weekAttendanceRes.error;
  if (latestAttendanceRes.error) throw latestAttendanceRes.error;
  if (ownersRes.error) throw ownersRes.error;

  const memberCounts = countByGym((membersRes.data || []) as Array<{ gym_id: string }>);
  const staffCounts = countByGym((staffRes.data || []) as Array<{ gym_id: string }>);
  const activeStaffCounts = countByGym(
    ((staffRes.data || []) as Array<{ gym_id: string; status?: string; role?: string }>).filter(
      (row) => row.role !== 'SUPER_ADMIN' && (row.status || 'ACTIVE') === 'ACTIVE'
    )
  );
  const weekCheckins = countByGym((weekAttendanceRes.data || []) as Array<{ gym_id: string }>);
  const revenueTotalByGym = sumByGym((paymentsRes.data || []) as Array<{ gym_id: string; price_paid: number }>, 'price_paid');
  const revenueMonthByGym = sumByGym(
    ((paymentsRes.data || []) as Array<{ gym_id: string; price_paid: number; created_at: string }>).filter(
      (row) => row.created_at >= monthStart
    ),
    'price_paid'
  );
  const recentPaymentsByGym = countByGym(
    ((paymentsRes.data || []) as Array<{ gym_id: string; created_at: string }>).filter((row) => row.created_at >= monthStart)
  );
  const lastAttendanceByGym = new Map<string, string>();
  ((latestAttendanceRes.data || []) as Array<{ gym_id: string; check_in_time: string }>).forEach((row) => {
    if (!lastAttendanceByGym.has(row.gym_id)) {
      lastAttendanceByGym.set(row.gym_id, row.check_in_time);
    }
  });
  const ownerMap = new Map<string, { userId: string | null; email: string | null }>();
  ((ownersRes.data || []) as Array<{ gym_id: string; user_id?: string | null; display_name?: string | null; invited_email?: string | null }>).forEach((row) => {
    if (!ownerMap.has(row.gym_id)) {
      ownerMap.set(row.gym_id, {
        userId: row.user_id || null,
        email: row.display_name || row.invited_email || null,
      });
    }
  });

  const gyms: TenantSummary[] = ((gymsRes.data || []) as GymRecord[]).map((gym) => {
    const owner = ownerMap.get(gym.id);
    return {
      id: gym.id,
      name: gym.name,
      contactPhone: gym.contact_phone || null,
      ownerUserId: gym.owner_user_id || owner?.userId || null,
      ownerEmail: gym.owner_email || owner?.email || null,
      subscriptionTier: gym.subscription_tier || 'BASIC',
      status: statusMap(gym.status),
      createdAt: gym.created_at,
      trialEndsAt: gym.trial_ends_at || null,
      nextBillingDate: gym.next_billing_date || null,
      suspendedAt: gym.suspended_at || null,
      deletedAt: gym.deleted_at || null,
      usage: buildTenantUsage(gym.id, {
        memberCounts,
        staffCounts,
        activeStaffCounts,
        checkinsWeekCounts: weekCheckins,
        revenueTotalByGym,
        revenueMonthByGym,
        recentPaymentsByGym,
        lastAttendanceByGym,
        tier: gym.subscription_tier || 'BASIC',
      }),
    };
  });

  const overview: PlatformOverviewMetrics = {
    totalGyms: gyms.length,
    activeGyms: gyms.filter((gym) => gym.status === 'ACTIVE').length,
    trialGyms: gyms.filter((gym) => gym.status === 'TRIAL').length,
    suspendedGyms: gyms.filter((gym) => gym.status === 'SUSPENDED').length,
    activeSubscriptions: gyms.filter((gym) => ['ACTIVE', 'TRIAL'].includes(gym.status)).length,
    mrr: gyms.reduce((sum, gym) => sum + gym.usage.revenueMonth, 0),
    totalMembers: gyms.reduce((sum, gym) => sum + gym.usage.memberCount, 0),
    churnedGyms: gyms.filter((gym) => gym.status === 'EXPIRED' || gym.status === 'DELETED').length,
  };

  const alerts: PlatformAlert[] = [];
  gyms.forEach((gym) => {
    if (gym.usage.limitWarnings.length > 0) {
      alerts.push({
        id: `limit-${gym.id}`,
        title: gym.name,
        description: gym.usage.limitWarnings.join(' • '),
        severity: 'warning',
        gymId: gym.id,
      });
    }
    if (gym.status === 'TRIAL' && gym.trialEndsAt) {
      const diffDays = Math.ceil((new Date(gym.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        alerts.push({
          id: `trial-${gym.id}`,
          title: 'Trial ending soon',
          description: `${gym.name} trial ends in ${Math.max(diffDays, 0)} day(s).`,
          severity: diffDays <= 2 ? 'critical' : 'warning',
          gymId: gym.id,
        });
      }
    }
    if (gym.status === 'SUSPENDED') {
      alerts.push({
        id: `suspended-${gym.id}`,
        title: 'Suspended gym',
        description: `${gym.name} is currently suspended.`,
        severity: 'info',
        gymId: gym.id,
      });
    }
    if (!gym.usage.lastActivityAt || Date.now() - new Date(gym.usage.lastActivityAt).getTime() > 1000 * 60 * 60 * 24 * 14) {
      alerts.push({
        id: `inactive-${gym.id}`,
        title: 'Inactive gym',
        description: `${gym.name} has low or no recent attendance activity.`,
        severity: 'warning',
        gymId: gym.id,
      });
    }
  });

  return { gyms, overview, alerts };
}

export function applyTenantFilters(
  gyms: TenantSummary[],
  searchQuery: string,
  filter: TenantFilter,
  sort: TenantSort
) {
  const query = searchQuery.trim().toLowerCase();
  let filtered = gyms.filter((gym) => {
    const matchesSearch =
      !query ||
      gym.name.toLowerCase().includes(query) ||
      (gym.ownerEmail || '').toLowerCase().includes(query);
    if (!matchesSearch) return false;
    switch (filter) {
      case 'TRIAL':
        return gym.status === 'TRIAL';
      case 'ACTIVE':
        return gym.status === 'ACTIVE';
      case 'SUSPENDED':
        return gym.status === 'SUSPENDED';
      case 'EXPIRED':
        return gym.status === 'EXPIRED';
      case 'LIMIT_REACHED':
        return gym.usage.limitWarnings.length > 0;
      default:
        return true;
    }
  });

  filtered = filtered.sort((a, b) => {
    switch (sort) {
      case 'most_members':
        return b.usage.memberCount - a.usage.memberCount;
      case 'highest_revenue':
        return b.usage.revenueMonth - a.usage.revenueMonth;
      case 'recent_activity':
        return new Date(b.usage.lastActivityAt || 0).getTime() - new Date(a.usage.lastActivityAt || 0).getTime();
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return filtered;
}

export async function fetchGymDetails(gymId: string): Promise<GymDetailsPayload> {
  const { gyms } = await fetchTenantSummaries();
  const summary = gyms.find((gym) => gym.id === gymId);
  if (!summary) {
    throw new Error('Gym not found');
  }

  const [paymentsRes, notificationsRes, auditRes] = await Promise.all([
    supabase
      .from('membership_history')
      .select('id, price_paid, created_at, payment_method, members(full_name), plans(name)')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('notifications')
      .select('id, title, message, is_read, created_at')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('admin_audit_logs')
      .select('id, actor_email, action, created_at, metadata')
      .eq('target_gym_id', gymId)
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  if (paymentsRes.error) throw paymentsRes.error;
  if (notificationsRes.error && notificationsRes.error.code !== '42P01') throw notificationsRes.error;
  if (auditRes.error && auditRes.error.code !== '42P01') throw auditRes.error;

  return {
    ...summary,
    recentPayments: (paymentsRes.data || []).map((payment: any) => ({
      id: payment.id,
      amount: payment.price_paid || 0,
      createdAt: payment.created_at,
      paymentMethod: payment.payment_method || 'CASH',
      memberName: payment.members?.full_name || 'Unknown member',
      planName: payment.plans?.name || 'Plan',
    })),
    recentStaffActions: (auditRes.data || []).map((entry: any) => ({
      id: entry.id,
      actor: entry.actor_email || 'System',
      action: entry.action,
      timestamp: entry.created_at,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined,
    })),
    latestNotifications: (notificationsRes.data || []).map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      createdAt: notification.created_at,
      isRead: notification.is_read,
    })),
  };
}

async function getCurrentActorEmail() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email || 'superadmin@platform';
}

export async function logPlatformAudit(action: PlatformAction, gym: TenantSummary | { id: string; name: string }, metadata?: Record<string, unknown>) {
  const actorEmail = await getCurrentActorEmail();
  const { error } = await supabase.from('admin_audit_logs').insert([
    {
      actor_email: actorEmail,
      action,
      target_gym_id: gym.id,
      target_gym_name: gym.name,
      metadata: metadata || {},
    },
  ]);
  if (error && error.code !== '42P01') {
    throw error;
  }
}

export async function updateGymLifecycleStatus(gym: TenantSummary, status: GymLifecycleStatus) {
  const { error } = await supabase.rpc('admin_update_gym_status', {
    target_gym_id: gym.id,
    next_status: lifecycleToDbStatus(status),
  });

  if (error && error.code === '42883') {
    const updates: Record<string, unknown> = {
      status: lifecycleToDbStatus(status),
      suspended_at: status === 'SUSPENDED' ? new Date().toISOString() : null,
      deleted_at: status === 'DELETED' ? new Date().toISOString() : null,
    };
    const fallback = await supabase.from('gyms').update(updates).eq('id', gym.id);
    if (fallback.error) throw fallback.error;
    await logPlatformAudit(status === 'SUSPENDED' ? 'GYM_SUSPENDED' : 'GYM_ACTIVATED', gym, { status });
    return;
  }

  if (error) throw error;
}

export async function softDeleteGym(gym: TenantSummary) {
  const { error } = await supabase.rpc('admin_delete_gym', {
    target_gym_id: gym.id,
  });

  if (error && error.code === '42883') {
    const fallback = await supabase
      .from('gyms')
      .update({ status: 'DELETED', deleted_at: new Date().toISOString() })
      .eq('id', gym.id);
    if (fallback.error) throw fallback.error;
    await logPlatformAudit('GYM_DELETED', gym);
    return;
  }

  if (error) throw error;
}

export async function updateGymSubscription(
  gym: TenantSummary,
  payload: { tier?: string; status?: GymLifecycleStatus; trialEndsAt?: string | null }
) {
  const { error } = await supabase.rpc('admin_update_subscription', {
    target_gym_id: gym.id,
    next_tier: payload.tier || null,
    next_status: payload.status ? lifecycleToDbStatus(payload.status) : null,
    next_trial_ends_at: payload.trialEndsAt || null,
  });

  if (error && error.code === '42883') {
    const updates: Record<string, unknown> = {};
    if (payload.tier) updates.subscription_tier = payload.tier;
    if (payload.status) updates.status = lifecycleToDbStatus(payload.status);
    if (payload.trialEndsAt !== undefined) updates.trial_ends_at = payload.trialEndsAt;
    const fallback = await supabase.from('gyms').update(updates).eq('id', gym.id);
    if (fallback.error) throw fallback.error;
    await logPlatformAudit('SUBSCRIPTION_CHANGED', gym, payload);
    return;
  }

  if (error) throw error;
}

export async function startImpersonation(gym: TenantSummary) {
  const actorEmail = await getCurrentActorEmail();
  const { error } = await supabase.rpc('admin_start_impersonation', {
    target_gym_id: gym.id,
  });

  if (error && error.code !== '42883') {
    throw error;
  }

  setImpersonationSession({
    gymId: gym.id,
    gymName: gym.name,
    ownerEmail: gym.ownerEmail,
    subscriptionTier: gym.subscriptionTier,
    status: lifecycleToDbStatus(gym.status),
    startedAt: new Date().toISOString(),
  });

  await logPlatformAudit('IMPERSONATION_STARTED', gym, { actorEmail });
}

export async function endImpersonation() {
  const session = getImpersonationSession();
  if (!session) return;
  const { error } = await supabase.rpc('admin_end_impersonation', {
    target_gym_id: session.gymId,
  });
  if (error && error.code !== '42883') {
    throw error;
  }
  await logPlatformAudit('IMPERSONATION_ENDED', { id: session.gymId, name: session.gymName });
  setImpersonationSession(null);
}

export async function fetchAuditEntries(): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('id, actor_email, action, target_gym_name, created_at, metadata')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error && error.code === '42P01') {
    return [];
  }
  if (error) throw error;

  return (data || []).map((entry: any) => ({
    id: entry.id,
    actor: entry.actor_email || 'System',
    action: entry.action,
    targetGym: entry.target_gym_name || null,
    timestamp: entry.created_at,
    metadata: entry.metadata || null,
  }));
}

export async function fetchSubscriptionHistory(gymId: string): Promise<SubscriptionHistoryEntry[]> {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('id, action, created_at, actor_email, metadata')
    .eq('target_gym_id', gymId)
    .in('action', ['SUBSCRIPTION_CHANGED', 'TRIAL_EXTENDED', 'SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_REACTIVATED'])
    .order('created_at', { ascending: false });

  if (error && error.code === '42P01') {
    return [];
  }
  if (error) throw error;

  return (data || []).map((entry: any) => ({
    id: entry.id,
    action: entry.action,
    tier: entry.metadata?.tier || entry.metadata?.next_tier || null,
    status: entry.metadata?.status || entry.metadata?.next_status || null,
    timestamp: entry.created_at,
    actor: entry.actor_email || 'System',
  }));
}
