import { useCallback, useEffect, useState } from 'react';
import {
  fetchNotificationPayload,
  generateDynamicNotifications,
  markAllNotificationsRead as markAllNotificationsReadApi,
  markNotificationRead as markNotificationReadApi,
  toggleNotificationRead as toggleNotificationReadApi,
  NotificationItem,
} from '../lib/notificationCenter';
import { useDemoData } from '../contexts/DemoDataContext';
import { useDemoMode } from './useDemoMode';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useNotificationCenter(gymId: string | null, limit = 6) {
  const { isDemoMode } = useDemoMode();
  const { state: demoState, markAllNotificationsRead, markNotificationRead } = useDemoData();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!gymId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isDemoMode) {
        const items = demoState.notifications
          .slice(0, limit)
          .map((item) => ({
            id: item.id,
            gym_id: gymId,
            type: 'demo',
            title: item.title,
            message: item.body,
            related_member_id: item.related_member_id || null,
            is_read: item.read,
            created_at: item.created_at,
          }));
        setNotifications(items);
        setUnreadCount(items.filter((item) => !item.is_read).length);
        return;
      }

      await generateDynamicNotifications(gymId);
      const payload = await fetchNotificationPayload(gymId, limit);
      setNotifications(payload.items);
      setUnreadCount(payload.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [demoState.notifications, gymId, isDemoMode, limit]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useRealtimeSubscription({
    table: 'notifications',
    gymId,
    onChange: loadNotifications,
    enabled: !!gymId && !isDemoMode
  });

  useEffect(() => {
    if (!gymId) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 60000);

    return () => window.clearInterval(interval);
  }, [gymId, loadNotifications]);

  const handleMarkRead = useCallback(
    async (notificationId: string) => {
      if (isDemoMode) {
        markNotificationRead(notificationId);
        return;
      }
      await markNotificationReadApi(notificationId);
      await loadNotifications();
    },
    [isDemoMode, loadNotifications, markNotificationRead]
  );

  const handleMarkAllRead = useCallback(async () => {
    if (!gymId) return;
    if (isDemoMode) {
      markAllNotificationsRead();
      return;
    }
    await markAllNotificationsReadApi(gymId);
    await loadNotifications();
  }, [gymId, isDemoMode, loadNotifications, markAllNotificationsRead]);

  const handleToggleRead = useCallback(
    async (notificationId: string, currentStatus: boolean) => {
      if (isDemoMode) {
        // Quick toggle in demo mode could just mark as read if it was unread
        if (!currentStatus) markNotificationRead(notificationId);
        return;
      }
      await toggleNotificationReadApi(notificationId, currentStatus);
      await loadNotifications();
    },
    [isDemoMode, loadNotifications, markNotificationRead]
  );

  return {
    notifications,
    unreadCount,
    loading,
    refresh: loadNotifications,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    toggleRead: handleToggleRead,
  };
}
