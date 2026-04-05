import React from 'react';
import { TrendBadge, TrendMeta } from './TrendBadge';

export function StatCard({
  title,
  value,
  icon,
  iconClassName,
  trend,
}: {
  title: string;
  value: string | number;
  icon: string;
  iconClassName: string;
  trend: TrendMeta;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className={`flex size-11 items-center justify-center rounded-xl ${iconClassName}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <TrendBadge trend={trend} />
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-black text-neutral-text dark:text-white">{value}</h3>
      <p className="mt-2 text-xs text-slate-400">Current 7 days vs previous 7 days</p>
    </div>
  );
}
