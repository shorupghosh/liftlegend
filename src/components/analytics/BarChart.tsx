import React from 'react';
import { ChartPoint } from './TrendBadge';

export function BarChart({
  title,
  subtitle,
  points,
  accentClassName,
  valueFormatter,
}: {
  title: string;
  subtitle: string;
  points: ChartPoint[];
  accentClassName: (point: ChartPoint, maxValue: number) => string;
  valueFormatter: (value: number) => string;
}) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="flex h-64 items-end justify-between gap-3">
      {points.map((point) => {
        const height = Math.max((point.value / maxValue) * 100, point.value > 0 ? 10 : 5);
        return (
          <div key={point.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-bold text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
              {valueFormatter(point.value)}
            </span>
            <div
              className={`w-full rounded-t-md transition-all duration-300 ${accentClassName(point, maxValue)}`}
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] font-bold text-slate-500">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}
