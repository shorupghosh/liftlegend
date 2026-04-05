import React from 'react';

export type TrendMeta = {
  value: number;
  positive: boolean;
  neutral: boolean;
};

export type ChartPoint = {
  key: string;
  label: string;
  value: number;
};

export function trendLabel(trend: TrendMeta): string {
  if (trend.neutral) {
    return '0%';
  }
  return `${trend.positive ? '+' : '-'}${trend.value}%`;
}

export function TrendBadge({ trend }: { trend: TrendMeta }) {
  const className = trend.neutral
    ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
    : trend.positive
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${className}`}>
      {trendLabel(trend)}
    </span>
  );
}
