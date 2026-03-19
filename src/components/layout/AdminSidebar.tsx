import React from 'react';
import { Link } from 'react-router-dom';
import { usePlan } from '../../contexts/PlanContext';
import PlanBadge from '../plan/PlanBadge';
import type { PlanFeature } from '../../lib/planConfig';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isSuperAdmin: boolean;
  navItems: Array<{ label: string; icon: string; path: string }>;
  isActive: (path: string) => boolean;
  user: any;
  userRole: string | null;
  signOut: () => Promise<void>;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  isSuperAdmin,
  navItems,
  isActive,
  user,
  userRole,
  signOut
}) => {
  const { canAccess, openUpgradeModal } = usePlan();

  // Map nav labels to plan features for gating
  const navFeatureMap: Record<string, PlanFeature> = {
    'Staff': 'staffManagement',
    'Analytics': 'analyticsAdvanced',
    'Notifications': 'notifications',
    'Attendance': 'qrCheckin',
  };
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, shown on lg+ */}
      <aside
          className={`
    fixed lg:static inset-y-0 left-0 z-50
    w-[260px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
    flex flex-col
    transform transition-transform duration-300 ease-out
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `}
      >
          {/* Logo area */}
          <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                  <img src="/logo.svg" alt="LiftLegend" className="h-9 w-auto" />
                  <span className="text-[10px] font-bold text-primary-default uppercase tracking-widest bg-primary-default/10 px-2 py-0.5 rounded-full">
                      {isSuperAdmin ? 'PLATFORM' : 'GYM OS'}
                  </span>
              </div>
              {/* Close button on mobile */}
              <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-auto size-10 flex items-center justify-center text-slate-400 hover:text-slate-600 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                  <span className="material-symbols-outlined text-xl">close</span>
              </button>
          </div>

           <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                  const active = isActive(item.path);
                  const gatedFeature = navFeatureMap[item.label];
                  const isLocked = gatedFeature && !isSuperAdmin && !canAccess(gatedFeature);

                  if (isLocked) {
                    return (
                      <button
                        key={item.path}
                        onClick={() => openUpgradeModal(gatedFeature)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group min-h-[44px] w-full text-left text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-500 dark:hover:text-slate-400"
                      >
                        <span className="material-symbols-outlined text-xl text-slate-300 dark:text-slate-600">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                      </button>
                    );
                  }

                  return (
                      <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`
            flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group min-h-[44px]
            ${active
                                  ? 'bg-primary-default/10 text-primary-default font-semibold shadow-sm'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-neutral-text dark:hover:text-white'
                              }
          `}
                      >
                          <span
                              className={`material-symbols-outlined text-xl transition-colors ${active ? 'text-primary-default' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-default/70'
                                  }`}
                              style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 500" } : {}}
                          >
                              {item.icon}
                          </span>
                          {item.label}
                          {active && (
                              <div className="ml-auto size-1.5 bg-primary-default rounded-full" />
                          )}
                      </Link>
                  );
              })}
          </nav>

          {/* User area */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 shrink-0 space-y-3">
              {!isSuperAdmin && <PlanBadge className="w-full justify-center" />}
              <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-gradient-to-br from-primary-default to-accent-default flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-text dark:text-white truncate">
                          {user?.email || 'User'}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {userRole || 'Member'}
                      </p>
                  </div>
                  <button
                      onClick={signOut}
                      className="size-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50 transition-colors"
                      title="Sign Out"
                  >
                      <span className="material-symbols-outlined text-xl">logout</span>
                  </button>
              </div>
          </div>
      </aside>
    </>
  );
};
