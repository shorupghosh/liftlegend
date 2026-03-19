import { supabase } from './supabase';

export type NotificationItem = {
  id: string;
  gym_id: string;
  type: string;
  title: string;
  message: string;
  related_member_id: string | null;
  is_read: boolean;
  created_at: string;
};

const missingFunctionPattern = /Could not find the function public\./i;

export function formatRelativeTime(input: string) {
  const date = new Date(input);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export async function generateDynamicNotifications(gymId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const inactivityThreshold = new Date(today);
  inactivityThreshold.setDate(today.getDate() - 5);
  const soonExpiry = new Date(today);
  soonExpiry.setDate(today.getDate() + 7);
  const lookbackStart = new Date(today);
  lookbackStart.setDate(today.getDate() - 35);

  try {
    const [membersRes, attendanceRes, existingRes] = await Promise.all([
      supabase
        .from('members')
        .select('id, full_name, expiry_date, status')
        .eq('gym_id', gymId)
        .eq('status', 'ACTIVE'),
      supabase
        .from('attendance')
        .select('member_id, check_in_time')
        .eq('gym_id', gymId)
        .gte('check_in_time', lookbackStart.toISOString())
        .order('check_in_time', { ascending: false }),
      supabase
        .from('notifications')
        .select('dedupe_key')
        .eq('gym_id', gymId),
    ]);

    if (membersRes.error || attendanceRes.error || existingRes.error) {
      return;
    }

    const lastCheckInMap = new Map<string, string>();
    (attendanceRes.data || []).forEach((entry) => {
      if (!lastCheckInMap.has(entry.member_id)) {
        lastCheckInMap.set(entry.member_id, entry.check_in_time);
      }
    });

    const existingKeys = new Set((existingRes.data || []).map((item) => item.dedupe_key).filter(Boolean));
    const rowsToInsert: Array<Record<string, unknown>> = [];

    (membersRes.data || []).forEach((member) => {
      const lastCheckIn = lastCheckInMap.get(member.id) || null;
      const expiryDate = member.expiry_date ? new Date(member.expiry_date) : null;

      if (expiryDate && expiryDate >= today && expiryDate <= soonExpiry) {
        const dedupeKey = `expiry:${member.id}:${member.expiry_date}`;
        if (!existingKeys.has(dedupeKey)) {
          rowsToInsert.push({
            gym_id: gymId,
            type: 'expiry',
            title: 'Member expiring soon',
            message: `${member.full_name} expires on ${expiryDate.toLocaleDateString()}.`,
            related_member_id: member.id,
            is_read: false,
            dedupe_key: dedupeKey,
          });
        }
      }

      if (expiryDate && expiryDate <= soonExpiry) {
        const dedupeKey = `payment_due:${member.id}:${member.expiry_date || 'pending'}`;
        if (!existingKeys.has(dedupeKey)) {
          rowsToInsert.push({
            gym_id: gymId,
            type: 'payment_due',
            title: 'Payment due',
            message: `${member.full_name} is due for renewal payment soon.`,
            related_member_id: member.id,
            is_read: false,
            dedupe_key: dedupeKey,
          });
        }
      }

      if (!lastCheckIn || new Date(lastCheckIn) < inactivityThreshold) {
        const dedupeKey = `inactive:${member.id}:${today.toISOString().slice(0, 10)}`;
        if (!existingKeys.has(dedupeKey)) {
          rowsToInsert.push({
            gym_id: gymId,
            type: 'inactive',
            title: 'Inactive member detected',
            message: `${member.full_name} has not checked in for 5+ days.`,
            related_member_id: member.id,
            is_read: false,
            dedupe_key: dedupeKey,
          });
        }
      } else if (new Date(lastCheckIn) < weekStart) {
        const dedupeKey = `missing_week:${member.id}:${today.toISOString().slice(0, 10)}`;
        if (!existingKeys.has(dedupeKey)) {
          rowsToInsert.push({
            gym_id: gymId,
            type: 'inactive',
            title: 'Member missing this week',
            message: `${member.full_name} has not visited this week yet.`,
            related_member_id: member.id,
            is_read: false,
            dedupe_key: dedupeKey,
          });
        }
      }
    });

    if (rowsToInsert.length > 0) {
      await supabase.from('notifications').insert(rowsToInsert);
    }
  } catch {
    return;
  }
}

export async function fetchNotificationPayload(gymId: string, limit = 6): Promise<{
  items: NotificationItem[];
  unreadCount: number;
}> {
  const rpcResult = await supabase.rpc('get_notifications', {
    target_gym_id: gymId,
    result_limit: limit,
  });

  if (!rpcResult.error) {
    const payload = (rpcResult.data || {}) as { items?: NotificationItem[]; unread_count?: number };
    return {
      items: payload.items || [],
      unreadCount: payload.unread_count || 0,
    };
  }

  if (!missingFunctionPattern.test(rpcResult.error.message || '')) {
    throw rpcResult.error;
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('id, gym_id, type, title, message, related_member_id, is_read, created_at')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    const fallback = await supabase
      .from('notifications')
      .select('id, gym_id, title, message, is_read, created_at')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fallback.error) {
      throw fallback.error;
    }

    const items = (fallback.data || []).map((item) => ({
      ...item,
      type: 'general',
      related_member_id: null,
    })) as NotificationItem[];

    return {
      items,
      unreadCount: items.filter((item) => !item.is_read).length,
    };
  }

  return {
    items: (data || []) as NotificationItem[],
    unreadCount: (data || []).filter((item) => !item.is_read).length,
  };
}

export async function markNotificationRead(notificationId: string) {
  const rpcResult = await supabase.rpc('mark_notification_read', {
    target_notification_id: notificationId,
  });

  if (!rpcResult.error) {
    return;
  }

  if (!missingFunctionPattern.test(rpcResult.error.message || '')) {
    throw rpcResult.error;
  }

  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  if (error) {
    throw error;
  }
}

export async function markAllNotificationsRead(gymId: string) {
  const rpcResult = await supabase.rpc('mark_all_notifications_read', {
    target_gym_id: gymId,
  });

  if (!rpcResult.error) {
    return;
  }

  if (!missingFunctionPattern.test(rpcResult.error.message || '')) {
    throw rpcResult.error;
  }

  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('gym_id', gymId).eq('is_read', false);
  if (error) {
    throw error;
  }
}
