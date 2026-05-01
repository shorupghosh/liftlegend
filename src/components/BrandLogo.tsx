import React from 'react';
import { APP_NAME } from '../lib/branding';
import { useAuth } from '../contexts/AuthContext';
import { canAccessFeature } from '../lib/planConfig';

interface BrandLogoProps {
  variant?: 'dark' | 'light' | 'auto';
  className?: string;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'auto',
  className = 'h-14 w-auto',
  showText = false,
}) => {
  const { gymLogoUrl, gymName, subscriptionTier } = useAuth();
  const hasWhiteLabel = canAccessFeature(subscriptionTier, 'whiteLabel');
  const displayName = hasWhiteLabel && gymName ? gymName : APP_NAME;
  
  if (hasWhiteLabel && gymLogoUrl) {
    return (
      <div className="flex items-center gap-2">
        <img
          src={gymLogoUrl}
          alt={displayName}
          className={`${className} object-contain`}
          fetchPriority="high"
        />
        {showText && (
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {displayName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {variant === 'auto' ? (
        <>
          <img
            src="/logo.png"
            alt={`${displayName} — Gym Management Software Bangladesh`}
            className={`${className} dark:hidden block object-contain`}
            fetchPriority="high"
          />
          <img
            src="/logo-dark.png"
            alt={`${displayName} — Gym Management Software Bangladesh`}
            className={`${className} hidden dark:block object-contain`}
            fetchPriority="high"
          />
        </>
      ) : (
        <img
          src={variant === 'light' ? '/logo-dark.png' : '/logo.png'}
          alt={`${displayName} — Gym Management Software Bangladesh`}
          className={`${className} object-contain`}
          fetchPriority="high"
        />
      )}

      {showText && (
        <span className="text-xl font-bold text-slate-900 dark:text-white">
          {displayName}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
