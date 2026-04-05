import { useEffect, useRef } from 'react';

/**
 * Prefetch critical route chunks in the background after the initial page loads.
 * This means when a user taps a bottom-nav item, the JS chunk is already downloaded
 * and cached — navigation is instant with zero loading spinner.
 *
 * Strategy: Use requestIdleCallback (with setTimeout fallback) to avoid blocking
 * the main thread during initial render. Stagger imports to avoid network contention.
 */

// Route chunk importers — these match the lazy() calls in App.tsx
const CRITICAL_ROUTES = [
  () => import('../pages/AdminDashboard'),
  () => import('../pages/MembersManagement'),
  () => import('../pages/AttendanceScanner'),
  () => import('../pages/PaymentManagement'),
];

const SECONDARY_ROUTES = [
  () => import('../pages/MembershipPlans'),
  () => import('../pages/AdvancedAnalytics'),
  () => import('../pages/CommunicationCenter'),
  () => import('../pages/StaffManagement'),
  () => import('../pages/GymSettings'),
];

const DASHBOARD_CHUNKS = [
  () => import('../components/dashboard/BasicDashboard'),
  () => import('../components/dashboard/AdvancedDashboard'),
];

function scheduleIdle(fn: () => void, delayMs: number) {
  const timer = setTimeout(() => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(fn, { timeout: 3000 });
    } else {
      fn();
    }
  }, delayMs);
  return timer;
}

/**
 * Hook to prefetch route chunks in background.
 * Call once in the AdminLayout so chunks are ready before navigation.
 */
export function useRoutePrefetch() {
  const prefetched = useRef(false);

  useEffect(() => {
    if (prefetched.current) return;
    prefetched.current = true;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1: Prefetch both dashboard variants immediately (500ms after mount)
    // This makes Basic ↔ Advanced toggle instant
    timers.push(
      scheduleIdle(() => {
        DASHBOARD_CHUNKS.forEach((load) => load().catch(() => {}));
      }, 500)
    );

    // Phase 2: Prefetch bottom-nav routes (1.5s after mount)
    // Members, Attendance, Payments are the most-used after dashboard
    timers.push(
      scheduleIdle(() => {
        CRITICAL_ROUTES.forEach((load) => load().catch(() => {}));
      }, 1500)
    );

    // Phase 3: Prefetch "More" menu routes (3s after mount)
    // Plans, Analytics, Notifications, Staff, Settings
    timers.push(
      scheduleIdle(() => {
        SECONDARY_ROUTES.forEach((load) => load().catch(() => {}));
      }, 3000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);
}

/**
 * Trigger a single route's chunk download. 
 * Call on touchstart/mouseenter for instant feeling.
 */
const prefetchCache = new Set<string>();

export function prefetchRoute(routeImporter: () => Promise<any>, key: string) {
  if (prefetchCache.has(key)) return;
  prefetchCache.add(key);
  routeImporter().catch(() => {});
}

// Pre-mapped route paths to their importers for use in nav components
export const ROUTE_IMPORTERS: Record<string, () => Promise<any>> = {
  '/admin': () => import('../pages/AdminDashboard'),
  '/admin/members': () => import('../pages/MembersManagement'),
  '/admin/attendance': () => import('../pages/AttendanceScanner'),
  '/admin/payments': () => import('../pages/PaymentManagement'),
  '/admin/plans': () => import('../pages/MembershipPlans'),
  '/admin/analytics': () => import('../pages/AdvancedAnalytics'),
  '/admin/notifications': () => import('../pages/CommunicationCenter'),
  '/admin/staff': () => import('../pages/StaffManagement'),
  '/admin/settings': () => import('../pages/GymSettings'),
};
