import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePlan } from '../../contexts/PlanContext';
import { APP_NAME } from '../../lib/branding';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useDemoMode } from '../../hooks/useDemoMode';
import { DemoBanner } from '../demo/DemoBanner';
import { getTenantNavVisibility } from '../../lib/staffPermissions';
import { PlanFeature, canAccessFeature } from '../../lib/planConfig';

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

// Bottom nav shows 4 primary items + "More"
const tenantBottomNav = [
    { label: 'Home', icon: 'dashboard', path: '/admin' },
    { label: 'Members', icon: 'group', path: '/admin/members' },
    { label: 'Scan', icon: 'qr_code_scanner', path: '/admin/attendance' },
    { label: 'Payments', icon: 'payments', path: '/admin/payments' },
];

const superAdminBottomNav = [
    { label: 'Home', icon: 'dashboard', path: '/super-admin' },
    { label: 'Revenue', icon: 'trending_up', path: '/super-admin/revenue' },
    { label: 'Subs', icon: 'card_membership', path: '/super-admin/subscriptions' },
    { label: 'System', icon: 'monitor_heart', path: '/super-admin/system' },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { userRole, signOut, user, subscriptionTier, isImpersonating, impersonatedGymName, gymName, stopImpersonation } = useAuth();
    const { isDemoMode } = useDemoMode();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);

    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const isBasicTier = subscriptionTier === 'BASIC' || !subscriptionTier;
    const visibleLabels = getTenantNavVisibility(userRole);

    const filteredTenantNav = tenantNavItems.filter(item => {
        if (isSuperAdmin) return true;
        if (!visibleLabels.includes(item.label)) return false;
        // Show ALL items — locked ones get a lock icon instead of being hidden
        return true;
    });

    const navItems = isSuperAdmin && !isDemoMode ? superAdminNavItems : filteredTenantNav;
    const filteredBottomNav = tenantBottomNav.filter(item => {
        if (item.label === 'Home') return true;
        if (item.label === 'Members') return visibleLabels.includes('Members');
        if (item.label === 'Scan') return visibleLabels.includes('Attendance');
        if (item.label === 'Payments') return visibleLabels.includes('Payments');
        return true;
    });
    const bottomNavItems = isSuperAdmin && !isDemoMode ? superAdminBottomNav : filteredBottomNav;

    // Items that only show in "More" menu on mobile
    const moreItems = navItems.filter(
        item => !bottomNavItems.some(bn => bn.path === item.path)
    );

    // BUG-26 FIXED: Dynamic page title
    useEffect(() => {
        const currentItem = navItems.find(item =>
            item.path !== '/admin' && item.path !== '/super-admin'
                ? location.pathname.startsWith(item.path)
                : location.pathname === item.path
        );
        const pageTitle = currentItem ? currentItem.label : 'Dashboard';
        
        const hasWhiteLabel = canAccessFeature(subscriptionTier, 'whiteLabel');
        const brandName = hasWhiteLabel && gymName ? gymName : APP_NAME;
        
        document.title = `${pageTitle} | ${brandName}`;
    }, [location.pathname, navItems, gymName, subscriptionTier]);

    // Close more menu on route change
    useEffect(() => {
        setMoreMenuOpen(false);
    }, [location.pathname]);

    const isActive = (path: string) => {
        if (path === '/admin' || path === '/super-admin') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
            {isDemoMode && <DemoBanner />}
            {isImpersonating && !isDemoMode && (
                <div className="relative z-[100] flex flex-wrap items-center justify-between gap-3 border-b border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-200">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                        <span>You are viewing {impersonatedGymName || 'this gym'} as Super Admin.</span>
                    </div>
                    <button
                        type="button"
                        onClick={stopImpersonation}
                        className="rounded-lg bg-blue-600 px-3 py-1 font-bold text-white transition-colors hover:bg-blue-700"
                    >
                        Exit Impersonation
                    </button>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden">
            <AdminSidebar 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                isSuperAdmin={isSuperAdmin} 
                navItems={navItems} 
                isActive={isActive} 
                user={user} 
                userRole={userRole} 
                signOut={signOut} 
            />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader 
                    setSidebarOpen={setSidebarOpen} 
                    navItems={navItems} 
                    isActive={isActive} 
                    isSuperAdmin={isSuperAdmin} 
                    signOut={signOut} 
                />

                {/* Page content — add bottom padding on mobile for bottom nav */}
                <main className="flex-1 overflow-y-auto pb-20 sm:pb-0">
                    {children}
                </main>
            </div>

            {/* ═══ Mobile Bottom Navigation ═══ */}
            <nav className="fixed bottom-0 left-0 right-0 w-full max-w-full z-[60] sm:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
                <div className="grid h-16 w-full" style={{ gridTemplateColumns: `repeat(${bottomNavItems.length + 1}, minmax(0, 1fr))` }}>
                    {bottomNavItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center gap-1 transition-colors relative touch-manipulation w-full h-full min-h-[64px] ${
                                    active
                                        ? 'text-primary-default'
                                        : 'text-slate-400 dark:text-slate-500'
                                }`}
                            >
                                <span
                                    className="material-symbols-outlined text-2xl"
                                    style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : {}}
                                >
                                    {item.icon}
                                </span>
                                <span className={`text-[10px] font-bold tracking-tight ${active ? 'text-primary-default' : ''}`}>
                                    {item.label}
                                </span>
                                {active && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary-default rounded-full pointer-events-none" />
                                )}
                            </Link>
                        );
                    })}
                    {/* More button */}
                    <button
                        onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                        className={`flex flex-col items-center justify-center gap-1 transition-colors relative touch-manipulation w-full h-full min-h-[64px] ${
                            moreMenuOpen ? 'text-primary-default' : 'text-slate-400 dark:text-slate-500'
                        }`}
                        aria-label="Toggle more menu"
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {moreMenuOpen ? 'close' : 'more_horiz'}
                        </span>
                        <span className="text-[10px] font-bold tracking-tight">More</span>
                        {moreMenuOpen && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary-default rounded-full" />
                        )}
                    </button>
                </div>

                {/* More menu overlay */}
                {moreMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-[-1]" onClick={() => setMoreMenuOpen(false)} />
                        <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/20 rounded-t-2xl p-3 grid grid-cols-4 gap-1 animate-slide-up">
                            {moreItems.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMoreMenuOpen(false)}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl min-h-[72px] transition-colors ${
                                            active
                                                ? 'bg-primary-default/10 text-primary-default'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <span
                                            className="material-symbols-outlined text-xl"
                                            style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 500" } : {}}
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="text-[11px] font-semibold text-center leading-tight">{item.label}</span>
                                    </Link>
                                );
                            })}
                            {/* Sign out in More menu */}
                            <button
                                onClick={() => { setMoreMenuOpen(false); signOut(); }}
                                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl min-h-[72px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">logout</span>
                                <span className="text-[11px] font-semibold">Sign Out</span>
                            </button>
                        </div>
                    </>
                )}
            </nav>
            </div>
        </div>
    );
}
