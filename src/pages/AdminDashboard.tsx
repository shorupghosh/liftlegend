import React, { useEffect, useState } from 'react';
import BasicDashboard from '../components/dashboard/BasicDashboard';
import AdvancedDashboard from '../components/dashboard/AdvancedDashboard';
import DashboardModeToggle from '../components/dashboard/DashboardModeToggle';
import LockedAdvancedPreview from '../components/dashboard/LockedAdvancedPreview';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';

export default function AdminDashboard() {
  const { dashboardMode, setDashboardMode, onboardingCompleted } = useAuth();
  const { canAccess, openUpgradeModal, isBasic } = usePlan();

  const hasAdvanced = canAccess('advancedDashboard');

  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');

  useEffect(() => {
    if (hasAdvanced) {
      setMode(dashboardMode || 'advanced');
      return;
    }
    setMode((currentMode) => (currentMode === 'advanced' ? 'advanced' : 'basic'));
  }, [dashboardMode, hasAdvanced]);

  const handleModeChange = (nextMode: 'basic' | 'advanced') => {
    setMode(nextMode);
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

      <div className="max-w-full flex-1 p-4 sm:p-6 lg:p-8">{dashboardContent}</div>
    </div>
  );
}
