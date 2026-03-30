import React from 'react';
import { APP_NAME } from '../lib/branding';

interface BrandLogoProps {
  variant?: 'dark' | 'light' | 'auto';
  className?: string;
  showText?: boolean;
}

/**
 * A reusable BrandLogo component that handles theme-based visibility.
 * 'dark' variant: Best for light backgrounds (original dark logo)
 * 'light' variant: Best for dark backgrounds (uses CSS filter to invert/brighten if needed)
 * 'auto' variant: Uses Tailwind's dark mode classes to switch automatically
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'auto',
  className = 'h-11 w-auto',
  showText = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      {variant === 'auto' ? (
        <>
          <img
            src="/logo.png"
            alt={APP_NAME}
            className={`${className} dark:hidden block`}
            fetchPriority="high"
          />
          <img
            src="/logo-dark.png"
            alt={APP_NAME}
            className={`${className} hidden dark:block`}
            fetchPriority="high"
          />
        </>
      ) : (
        <img
          src={variant === 'light' ? '/logo-dark.png' : '/logo.png'}
          alt={APP_NAME}
          className={`${className}`}
          fetchPriority="high"
        />
      )}
      {showText && (
        <span className="text-xl font-bold text-slate-900 dark:text-white">
          {APP_NAME}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
