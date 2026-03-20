import React from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const toneStyles: Record<BadgeTone, { badge: string; dot: string }> = {
  neutral: {
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-500',
  },
  success: {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  danger: {
    badge: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
  },
  info: {
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
};

const statusToneMap: Record<string, BadgeTone> = {
  ACTIVE: 'success',
  TRIAL: 'warning',
  INVITED: 'warning',
  PENDING: 'warning',
  UNREAD: 'info',
  IN_PROGRESS: 'info',
  EXPIRED: 'danger',
  LOCKED: 'danger',
  SUSPENDED: 'danger',
  PAST_DUE: 'danger',
  INACTIVE: 'danger',
};

const roleToneMap: Record<string, BadgeTone> = {
  OWNER: 'purple',
  MANAGER: 'info',
  TRAINER: 'success',
};

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ label, tone = 'neutral', showDot = true, className = '' }: StatusBadgeProps) {
  const styles = toneStyles[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${styles.badge} ${className}`}>
      {showDot ? <span className={`size-1.5 rounded-full ${styles.dot}`} /> : null}
      {label}
    </span>
  );
}

export function toneFromStatus(status: string | null | undefined): BadgeTone {
  if (!status) return 'neutral';
  return statusToneMap[status.toUpperCase()] || 'neutral';
}

export function toneFromRole(role: string | null | undefined): BadgeTone {
  if (!role) return 'neutral';
  return roleToneMap[role.toUpperCase()] || 'neutral';
}

