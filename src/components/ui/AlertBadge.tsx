import React from 'react';
import { AlertVariant } from '../../lib/memberExpiry';

interface AlertBadgeProps {
  variant: AlertVariant;
  children: React.ReactNode;
}

const variantStyles: Record<AlertVariant, string> = {
  danger:
    'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  warning:
    'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  info:
    'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  success:
    'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
};

const dotStyles: Record<AlertVariant, string> = {
  danger: 'bg-red-500',
  warning: 'bg-orange-500',
  info: 'bg-amber-500',
  success: 'bg-emerald-500',
};

export const AlertBadge: React.FC<AlertBadgeProps> = ({ variant, children }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${variantStyles[variant]}`}
    >
      <span className={`size-1.5 rounded-full ${dotStyles[variant]}`} />
      {children}
    </span>
  );
};
