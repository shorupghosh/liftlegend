import React from 'react';
import { Link } from 'react-router-dom';
import { formatRelativeTime, NotificationItem } from '../../lib/notificationCenter';

function typeIcon(type: string) {
  switch (type) {
    case 'expiry':
      return 'alarm';
    case 'payment_due':
      return 'payments';
    case 'inactive':
      return 'person_alert';
    default:
      return 'notifications';
  }
}

export default function NotificationDropdown({
  open,
  notifications,
  unreadCount,
  loading,
  viewAllPath,
  onToggle,
  onItemClick,
  onMarkAllRead,
}: {
  open: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  viewAllPath: string;
  onToggle: () => void;
  onItemClick: (notification: NotificationItem) => void;
  onMarkAllRead: () => void;
}) {
  return (
    <>
      <button
        onClick={onToggle}
        className="relative flex size-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <>
            <span className="absolute right-1.5 top-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-accent-default px-1.5 text-[10px] font-black text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 flex max-h-[85vh] w-[360px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-slate-400">{unreadCount} unread</p>
            </div>
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-500"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              Mark all as read
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="size-7 animate-spin rounded-full border-4 border-primary-default border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">notifications_off</span>
                <p className="mt-3 font-bold text-slate-900 dark:text-white">No notifications yet</p>
                <p className="mt-1 text-sm text-slate-500">New alerts will appear here when action is needed.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => onItemClick(notification)}
                  className={`flex w-full gap-4 border-b px-4 py-4 text-left transition-colors ${
                    notification.is_read
                      ? 'border-slate-100 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50'
                      : 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20'
                  }`}
                >
                  <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <span className="material-symbols-outlined text-[20px]">{typeIcon(notification.type)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h4 className="flex flex-1 items-center gap-1.5 text-sm font-bold leading-tight text-slate-900 dark:text-white">
                        {!notification.is_read && <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />}
                        {notification.title}
                      </h4>
                      <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {formatRelativeTime(notification.created_at)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-slate-600 dark:text-slate-300">{notification.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 bg-white p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
            <Link to={viewAllPath} className="block text-center text-sm font-bold text-slate-900 dark:text-white">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
