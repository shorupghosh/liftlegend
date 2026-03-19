import React from 'react';
import FeatureGate from '../plan/FeatureGate';
import type { PlanFeature } from '../../lib/planConfig';

/**
 * FeatureRoute — wraps a page-level component with FeatureGate.
 * If the feature is locked, the entire page shows the locked overlay.
 */
interface FeatureRouteProps {
  feature: PlanFeature;
  children: React.ReactNode;
}

export default function FeatureRoute({ feature, children }: FeatureRouteProps) {
  return (
    <div className="min-h-screen">
      <FeatureGate feature={feature} showPreview={false}>
        {children}
      </FeatureGate>
    </div>
  );
}
