import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { useNotificationCenter } from '../../hooks/useNotificationCenter';
import { NotificationItem } from '../../lib/notificationCenter';
import { useDemoMode } from '../../hooks/useDemoMode';
import { usePlan } from '../../contexts/PlanContext';

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void;
  navItems: Array<{ label: string; icon: string; path: string }>;
  isActive: (path: string) => boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  setSidebarOpen,
  navItems,
  isActive,
  isSuperAdmin,
  signOut
}) => {
  const { gymId } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { trialDaysLeft } = usePlan();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
  } = useNotificationCenter(gymId, 6);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [location.pathname]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    await markRead(notification.id);
    setNotificationsOpen(false);

    if (notification.related_member_id) {
      navigate(`/admin/members/${notification.related_member_id}`);
      return;
    }

    navigate(isSuperAdmin ? '/super-admin/support' : '/admin/notifications');
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const normalized = q.replace(/\s+/g, '');
    const quickMap: Array<{ keywords: string[]; path: string }> = [
      { keywords: ['dashboard', 'home'], path: '/admin' },
      { keywords: ['member', 'members'], path: '/admin/members' },
      { keywords: ['payment', 'payments', 'dues', 'cash'], path: '/admin/payments' },
      { keywords: ['attendance', 'checkin', 'check-in', 'qr'], path: '/admin/attendance' },
      { keywords: ['plan', 'plans', 'membership'], path: '/admin/plans' },
      { keywords: ['staff', 'trainer', 'team'], path: '/admin/staff' },
      { keywords: ['analytics', 'report', 'insight'], path: '/admin/analytics' },
      { keywords: ['settings', 'subscription', 'billing'], path: '/admin/settings' },
      { keywords: ['notification', 'notifications', 'alert'], path: '/admin/notifications' },
    ];

    const mapped = quickMap.find((item) => item.keywords.some((keyword) => normalized.includes(keyword.replace(/\s+/g, ''))));
    if (mapped) {
      navigate(mapped.path);
      return;
    }

    const navMatch = navItems.find((item) => item.label.toLowerCase().includes(q));
    if (navMatch) {
      navigate(navMatch.path);
      return;
    }

    // If not a specific page, treat as a member search
    navigate(`/admin/members?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 sm:h-16 sm:px-4 lg:px-8">
      <button
        onClick={() => setSidebarOpen(true)}
        className="flex size-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {!['/admin/members', '/admin/staff', '/admin/attendance', '/admin/payments', '/admin/plans'].some(path => location.pathname.startsWith(path)) && (
        <div className="hidden max-w-md flex-1 sm:flex">
          <form onSubmit={handleSearch} className="flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <span className="material-symbols-outlined mr-2 text-lg text-slate-400">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none bg-transparent text-sm text-neutral-text outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white"
              placeholder="Search or jump to... (Press Enter)"
              aria-label="Global navigation search"
            />
          </form>
        </div>
      )}

      {/* Title for mobile */}
      <div className="flex-1 sm:hidden min-w-0">
        <h2 className="truncate text-base font-bold text-neutral-text dark:text-white">
          {navItems.find(i => isActive(i.path))?.label || 'Dashboard'}
        </h2>
      </div>

      {isDemoMode && (
        <div className="hidden rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 sm:inline-flex">
          Demo Mode
        </div>
      )}

      {trialDaysLeft !== null && trialDaysLeft > 0 && !isDemoMode && !isSuperAdmin && (
        <button 
           onClick={() => navigate('/admin/settings/subscription')}
           className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/60"
        >
          <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
          {trialDaysLeft} Days Left
        </button>
      )}

      {trialDaysLeft === 0 && !isDemoMode && !isSuperAdmin && (
        <button 
           onClick={() => navigate('/admin/settings/subscription')}
           className="hidden sm:flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-red-700 hover:bg-red-100 transition-colors dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/60"
        >
          <span className="material-symbols-outlined text-[14px]">warning</span>
          Trial Expired
        </button>
      )}

      {!isSuperAdmin && (
        <button 
           onClick={() => navigate('/leave-review')}
           className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
           title="Leave a review for LiftLegend"
        >
          <span className="material-symbols-outlined text-[14px]">rate_review</span>
          Review Us
        </button>
      )}

      <div className="relative flex items-center gap-1" ref={notificationsRef}>
        <NotificationDropdown
          open={notificationsOpen}
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          viewAllPath={isSuperAdmin ? '/super-admin/support' : '/admin/notifications'}
          onToggle={() => setNotificationsOpen(!notificationsOpen)}
          onItemClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
        />
      </div>

      <button
        onClick={signOut}
        className="flex size-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden"
        title="Sign Out"
      >
        <span className="material-symbols-outlined">logout</span>
      </button>
    </header>
  );
};
