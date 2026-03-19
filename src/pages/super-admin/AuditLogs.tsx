import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/PageLoader';
import { fetchAuditEntries } from '../../lib/superAdmin';
import type { AuditLogEntry } from '../../types/superAdmin';

export default function AuditLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'IMPERSONATION' | 'STATUS' | 'SUBSCRIPTION' | 'DELETE'>('ALL');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const entries = await fetchAuditEntries();
        setLogs(entries);
      } catch (error) {
        console.error('Error loading audit logs:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return logs;
    return logs.filter((log) => {
      if (filter === 'IMPERSONATION') return log.action.includes('IMPERSONATION');
      if (filter === 'STATUS') return log.action.includes('GYM_');
      if (filter === 'SUBSCRIPTION') return log.action.includes('SUBSCRIPTION') || log.action.includes('TRIAL');
      return log.action.includes('DELETE');
    });
  }, [filter, logs]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Audit Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track critical super admin actions, impersonation sessions, and tenant control changes.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['ALL', 'IMPERSONATION', 'STATUS', 'SUBSCRIPTION', 'DELETE'].map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value as typeof filter)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              filter === value ? 'bg-primary-default text-white shadow-lg shadow-primary-default/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader label="Loading audit trail..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon="history" title="No audit logs yet" description="Super admin actions will appear here once the control center starts logging events." />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-default/10 text-primary-default">
                  <span className="material-symbols-outlined text-lg">history</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-neutral-text dark:text-white">{entry.action}</p>
                  <p className="mt-1 text-xs text-slate-500">{entry.actor} • {entry.targetGym || 'Platform'} • {new Date(entry.timestamp).toLocaleString()}</p>
                  {entry.metadata ? (
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
