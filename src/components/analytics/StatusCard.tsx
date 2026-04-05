import React from 'react';
import { EmptyState } from '../ui/EmptyState';

export function StatusCard({
  totalMembers,
  activeMembers,
  inactiveMembers,
  hasAnyData,
}: {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  hasAnyData: boolean;
}) {
  const activeRatio = totalMembers > 0 ? (activeMembers / totalMembers) * 360 : 0;

  return (
    <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
      <h4 className="text-lg font-bold">Member Status</h4>
      <p className="mb-8 text-xs text-slate-400">Active vs inactive breakdown</p>

      {!hasAnyData ? (
        <EmptyState icon="insights" title="No data yet" description="Start by adding members or recording attendance" />
      ) : (
        <>
          <div className="relative flex justify-center py-6">
            <div className="relative flex size-36 items-center justify-center rounded-full border-[14px] border-slate-700">
              <div
                className="absolute inset-[-14px] rounded-full border-[14px] border-emerald-500 border-l-transparent border-t-transparent"
                style={{ transform: `rotate(${activeRatio - 90}deg)` }}
              />
              <div className="text-center">
                <span className="text-2xl font-black">{totalMembers}</span>
                <p className="text-[10px] font-bold uppercase text-slate-500">Total</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-slate-300">Active</span>
              </div>
              <span className="text-sm font-bold">{activeMembers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-slate-500" />
                <span className="text-sm font-medium text-slate-300">Inactive</span>
              </div>
              <span className="text-sm font-bold">{inactiveMembers}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
