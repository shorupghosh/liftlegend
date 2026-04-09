import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationCenter } from '../hooks/useNotificationCenter';
import { formatRelativeTime, NotificationItem } from '../lib/notificationCenter';

function typeLabel(type: string) {
  switch (type) {
    case 'expiry':
      return 'Expiry';
    case 'payment_due':
      return 'Payment Due';
    case 'inactive':
      return 'Inactive';
    default:
      return 'Alert';
  }
}

export default function CommunicationCenter() {
  const { gymId } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    toggleRead,
  } = useNotificationCenter(gymId, 50);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((notification) => !notification.is_read);
    }

    if (filter === 'read') {
      return notifications.filter((notification) => notification.is_read);
    }

    return notifications;
  }, [filter, notifications]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    await markRead(notification.id);

    if (notification.related_member_id) {
      navigate(`/admin/members/${notification.related_member_id}`);
    }
  };

  const handleQuickRenew = async (notification: NotificationItem) => {
    await markRead(notification.id);
    if (!notification.related_member_id) {
      return;
    }
    navigate(`/admin/payments?memberId=${notification.related_member_id}`);
  };

  const handleCopyReminder = async (notification: NotificationItem) => {
    const text = `Reminder from your gym: ${notification.message}`;
    try {
      await navigator.clipboard.writeText(text);
      await markRead(notification.id);
    } catch {
      await markRead(notification.id);
    }
  };

  const handleWhatsAppReminder = async (notification: NotificationItem) => {
    const text = encodeURIComponent(`Reminder from Fit & Flex: ${notification.message}`);
    let phone = notification.members?.phone;
    if (phone) {
      phone = phone.replace(/\D/g, '');
      if (phone.startsWith('01')) {
          phone = '88' + phone;
      }
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
      await markRead(notification.id);
    } else {
      alert("No phone number found for this member.");
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'expiry':
      case 'payment_due':
        return { icon: 'error', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' };
      case 'inactive':
        return { icon: 'warning', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' };
      default:
        return { icon: 'notifications', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight text-neutral-text dark:text-white lg:text-3xl">
            Notification Center
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review the latest alerts, expiring members, payment reminders, and inactivity signals.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-slate-900 px-5 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <span className="material-symbols-outlined text-lg">done_all</span>
          Mark all as read
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unread</p>
          <p className="mt-1 text-3xl font-black text-accent-default">{unreadCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</p>
          <p className="mt-1 text-3xl font-black text-neutral-text dark:text-white">{notifications.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Latest refresh</p>
          <p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">Auto-refresh every minute</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'read', label: 'Read' },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key as 'all' | 'unread' | 'read')}
            className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
              filter === option.key
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-start gap-4 p-5">
                <div className="size-11 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-4 w-36 rounded-full bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div className="h-3 w-3/4 rounded bg-slate-50 dark:bg-slate-900" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-8 w-24 rounded-lg bg-slate-50 dark:bg-slate-900" />
                    <div className="h-8 w-24 rounded-lg bg-slate-50 dark:bg-slate-900" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <span className="material-symbols-outlined mb-2 text-5xl text-slate-300 dark:text-slate-600">notifications_off</span>
            <p className="font-medium">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotifications.map((notification) => {
              const styles = getNotificationStyles(notification.type);
              return (
              <div
                key={notification.id}
                className={`flex w-full items-start gap-4 p-5 text-left transition-colors ${
                  notification.is_read
                    ? 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/40 opacity-70'
                    : 'bg-emerald-50/40 hover:bg-emerald-50 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 shadow-[inset_4px_0_0_0_#10b981]'
                }`}
              >
                <div className={`mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full border ${styles.bg} ${styles.color}`}>
                  <span className="material-symbols-outlined">{styles.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {!notification.is_read && <span className="size-2 rounded-full bg-emerald-500" />}
                    <h3 className="text-sm font-bold text-neutral-text dark:text-white">{notification.title}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      {typeLabel(notification.type)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                    <span>{formatRelativeTime(notification.created_at)}</span>
                    {notification.related_member_id && <span>Open member</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {notification.related_member_id && (
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-black uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Open Profile
                      </button>
                    )}
                    {(notification.type === 'expiry' || notification.type === 'payment_due') && notification.related_member_id && (
                      <button
                        type="button"
                        onClick={() => handleQuickRenew(notification)}
                        className="inline-flex h-9 items-center rounded-lg bg-emerald-600 px-3 text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-500"
                      >
                        Renew Now
                      </button>
                    )}
                    {notification.members?.phone ? (
                       <button
                       type="button"
                       onClick={() => handleWhatsAppReminder(notification)}
                       className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:brightness-110"
                     >
                       <span className="material-symbols-outlined text-sm">chat</span>
                       WhatsApp
                     </button>
                    ) : (
                      <button
                      type="button"
                      onClick={() => handleCopyReminder(notification)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      Copy
                    </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleRead(notification.id, notification.is_read); }}
                      className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 ml-auto"
                    >
                      Mark as {notification.is_read ? 'unread' : 'read'}
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
