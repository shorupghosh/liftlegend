import React, { useEffect, useState, useTransition, useRef } from 'react';
import DashboardModeToggle from '../components/dashboard/DashboardModeToggle';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';

// Lazy-load dashboard variants
const BasicDashboard = React.lazy(() => import('../components/dashboard/BasicDashboard'));
const AdvancedDashboard = React.lazy(() => import('../components/dashboard/AdvancedDashboard'));
const LockedAdvancedPreview = React.lazy(() => import('../components/dashboard/LockedAdvancedPreview'));

// Preload both dashboard chunks immediately so toggle is instant
const preloadBasic = () => import('../components/dashboard/BasicDashboard');
const preloadAdvanced = () => import('../components/dashboard/AdvancedDashboard');

export default function AdminDashboard() {
  const { dashboardMode, setDashboardMode, onboardingCompleted } = useAuth();
  const { canAccess, openUpgradeModal } = usePlan();
  const [isPending, startTransition] = useTransition();
  const preloaded = useRef(false);

  const hasAdvanced = canAccess('advancedDashboard');

  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');

  // Preload the OTHER dashboard variant on first render
  // so switching is instant with zero loading spinner
  useEffect(() => {
    if (preloaded.current) return;
    preloaded.current = true;
    // Small delay to not block initial render
    const timer = setTimeout(() => {
      preloadBasic().catch(() => {});
      preloadAdvanced().catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasAdvanced) {
      setMode(dashboardMode || 'advanced');
      return;
    }
    setMode((currentMode) => (currentMode === 'advanced' ? 'advanced' : 'basic'));
  }, [dashboardMode, hasAdvanced]);

  const handleModeChange = (nextMode: 'basic' | 'advanced') => {
    // Use startTransition so React keeps showing the current dashboard
    // while the new one renders, instead of flashing a skeleton
    startTransition(() => {
      setMode(nextMode);
    });
    if (hasAdvanced) {
      setDashboardMode(nextMode);
    }
  };

  let dashboardContent: React.ReactNode;

  if (mode === 'basic') {
    dashboardContent = <BasicDashboard />;
  } else if (hasAdvanced) {
    dashboardContent = <AdvancedDashboard />;
  } else {
    dashboardContent = <LockedAdvancedPreview onUpgrade={() => openUpgradeModal('advancedDashboard')} />;
  }

  return (
    <div className="flex min-h-screen flex-col pb-12">
      {!onboardingCompleted && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
            <span className="material-symbols-outlined text-xl">flag</span>
            <span className="text-sm font-bold">Complete your setup: We noticed you skipped the wizard.</span>
          </div>
          <button onClick={() => window.location.href='/setup'} className="text-xs font-black uppercase tracking-widest bg-amber-500 text-white px-4 py-1.5 rounded-lg shadow hover:bg-amber-600 transition-colors">
            Resume Setup
          </button>
        </div>
      )}
      <div className="flex max-w-full justify-center px-4 pt-6 sm:justify-end sm:px-6 lg:px-8">
        <DashboardModeToggle mode={mode} userPlan={hasAdvanced ? 'pro' : 'basic'} onChange={handleModeChange} />
      </div>

      <div className={`max-w-full flex-1 p-4 sm:p-6 lg:p-8 transition-opacity duration-150 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
        <React.Suspense fallback={<DashboardSkeleton />}>
          {dashboardContent}
        </React.Suspense>
      </div>
    </div>
  );
}
