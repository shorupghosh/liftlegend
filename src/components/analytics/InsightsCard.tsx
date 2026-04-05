import React from 'react';
import { TrendBadge, TrendMeta } from './TrendBadge';

export function InsightsCard({
  insights,
  newMembersLast7Days,
  newMembersTrend,
  hasAnyData,
}: {
  insights: string[];
  newMembersLast7Days: number;
  newMembersTrend: TrendMeta;
  hasAnyData: boolean;
}) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold">Insights</h4>
          <p className="text-xs text-slate-400">Decision signals from the last 7 days</p>
        </div>
        <TrendBadge trend={newMembersTrend} />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">New Members</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <span className="text-3xl font-black text-white">{newMembersLast7Days}</span>
          <span className="text-xs text-slate-400">Last 7 days</span>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-700 px-4 py-6 text-center">
          <p className="font-bold text-white">No data yet</p>
          <p className="mt-2 text-sm text-slate-400">Start by adding members or recording attendance</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {insights.map((insight) => (
            <div key={insight} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
              <span className="material-symbols-outlined mt-0.5 text-base text-primary-default">lightbulb</span>
              <p className="text-sm font-medium text-slate-200">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
