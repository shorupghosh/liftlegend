import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const tenantNavItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/admin' },
    { label: 'Members', icon: 'group', path: '/admin/members' },
    { label: 'Plans', icon: 'card_membership', path: '/admin/plans' },
    { label: 'Attendance', icon: 'qr_code_scanner', path: '/admin/attendance' },
    { label: 'Payments', icon: 'payments', path: '/admin/payments' },
    { label: 'Analytics', icon: 'bar_chart', path: '/admin/analytics' },
    { label: 'Notifications', icon: 'notifications', path: '/admin/notifications' },
    { label: 'Staff', icon: 'badge', path: '/admin/staff' },
    { label: 'Settings', icon: 'settings', path: '/admin/settings' },
];

const superAdminNavItems = [
    { label: 'Overview', icon: 'dashboard', path: '/super-admin' },
    { label: 'Revenue', icon: 'trending_up', path: '/super-admin/revenue' },
    { label: 'Subscriptions', icon: 'card_membership', path: '/super-admin/subscriptions' },
    { label: 'Usage', icon: 'analytics', path: '/super-admin/usage' },
    { label: 'System', icon: 'monitor_heart', path: '/super-admin/system' },
    { label: 'Support', icon: 'support_agent', path: '/super-admin/support' },
    { label: 'Audit Logs', icon: 'history', path: '/super-admin/audit' },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { userRole, signOut, user } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const navItems = isSuperAdmin ? superAdminNavItems : tenantNavItems;

    // BUG-26 FIXED: Dynamic page title
    useEffect(() => {
        const currentItem = navItems.find(item =>
            item.path !== '/admin' && item.path !== '/super-admin'
                ? location.pathname.startsWith(item.path)
                : location.pathname === item.path
        );
        const pageTitle = currentItem ? currentItem.label : 'Dashboard';
        document.title = `${pageTitle} | LiftLegend`;
    }, [location.pathname, navItems]);

    const isActive = (path: string) => {
        if (path === '/admin' || path === '/super-admin') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
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
                        <img src="/main-logo.png" alt="Logo" className="h-8 object-contain" />
                        <span className="text-[10px] font-bold text-primary-default uppercase tracking-widest bg-primary-default/10 px-2 py-0.5 rounded-full">
                            {isSuperAdmin ? 'PLATFORM' : 'GYM OS'}
                        </span>
                    </div>
                    {/* Close button on mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto size-8 flex items-center justify-center text-slate-400 hover:text-slate-600 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
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
                <div className="border-t border-slate-200 dark:border-slate-800 p-4 shrink-0">
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
                            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50 transition-colors"
                            title="Sign Out"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 lg:px-8 gap-4 shrink-0 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden size-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="hidden sm:flex flex-1 max-w-md">
                        <div className="flex w-full items-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg mr-2">search</span>
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 outline-none text-neutral-text dark:text-white"
                                placeholder="Search anything..."
                            />
                        </div>
                    </div>
                    <div className="flex-1 sm:hidden" />
                    <div className="flex items-center gap-2">
                        <Link to={isSuperAdmin ? '/super-admin/support' : '/admin/notifications'} className="size-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-accent-default rounded-full" />
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
