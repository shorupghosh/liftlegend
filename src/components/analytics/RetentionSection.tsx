import React from 'react';
import {
  buildReminderMessage,
  formatDisplayDate,
  INACTIVITY_THRESHOLD_DAYS,
  RetentionMember,
  RetentionStatus,
} from '../../lib/retention';

type ReminderModalState = {
  open: boolean;
  member: RetentionMember | null;
  message: string;
};

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-10 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
        <span className="material-symbols-outlined">insights</span>
      </div>
      <p className="text-base font-bold text-white">{title}</p>
      <p className="mt-2 max-w-xs text-sm text-slate-400">{message}</p>
    </div>
  );
}

function RetentionSummaryCard({
  title,
  value,
  helper,
  icon,
  iconClassName,
}: {
  title: string;
  value: number;
  helper: string;
  icon: string;
  iconClassName: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-xl ${iconClassName}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-neutral-text dark:text-white">{title}</p>
          <p className="text-xs text-slate-400">{helper}</p>
        </div>
      </div>
      <p className="text-3xl font-black text-neutral-text dark:text-white">{value}</p>
    </div>
  );
}

function RetentionStatusBadge({ status }: { status: RetentionStatus }) {
  const styles =
    status === 'Inactive'
      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
      : status === 'At Risk'
        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${styles}`}>
      {status}
    </span>
  );
}

function ReminderActionModal({
  state,
  onClose,
  onCopy,
}: {
  state: ReminderModalState;
  onClose: () => void;
  onCopy: () => void;
}) {
  if (!state.open || !state.member) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Retention Action</p>
              <h3 className="mt-2 text-2xl font-black text-neutral-text dark:text-white">{state.member.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{state.member.phone || 'No phone available'}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status</p>
              <div className="mt-2">
                <RetentionStatusBadge status={state.member.status} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Last Visit</p>
              <p className="mt-2 text-sm font-bold text-neutral-text dark:text-white">{formatDisplayDate(state.member.lastCheckIn)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Inactivity</p>
              <p className="mt-2 text-sm font-bold text-neutral-text dark:text-white">{state.member.inactivityDays} days</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-neutral-text dark:text-white">Reminder message</p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
              {state.message}
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            V1 uses a manual contact workflow. Copy the message, then contact the member via phone, WhatsApp, or SMS.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-2xl bg-slate-100 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="h-12 flex-1 rounded-2xl bg-slate-900 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Copy Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RetentionSection({
  hasAnyData,
  inactiveCount,
  missingThisWeekCount,
  atRiskCount,
  members,
  insights,
  onCopyReminder,
}: {
  hasAnyData: boolean;
  inactiveCount: number;
  missingThisWeekCount: number;
  atRiskCount: number;
  members: RetentionMember[];
  insights: string[];
  onCopyReminder: (member: RetentionMember) => void;
}) {
  const [modalState, setModalState] = React.useState<ReminderModalState>({
    open: false,
    member: null,
    message: '',
  });

  const openReminderModal = (member: RetentionMember) => {
    setModalState({
      open: true,
      member,
      message: buildReminderMessage(member),
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-display font-extrabold tracking-tight text-neutral-text dark:text-white">
              Retention System
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Detect inactive members, review risk, and take manual follow-up actions
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Inactive after {INACTIVITY_THRESHOLD_DAYS} days
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <RetentionSummaryCard
            title="Inactive Members"
            value={inactiveCount}
            helper={`No attendance in ${INACTIVITY_THRESHOLD_DAYS}+ days`}
            icon="person_off"
            iconClassName="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
          />
          <RetentionSummaryCard
            title="Members Missing This Week"
            value={missingThisWeekCount}
            helper="No visit during the current week"
            icon="event_busy"
            iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
          />
          <RetentionSummaryCard
            title="At-Risk Members"
            value={atRiskCount}
            helper="No visit in the last 3 to 4 days"
            icon="warning"
            iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl xl:col-span-1">
            <h4 className="text-lg font-bold">Retention Insights</h4>
            <p className="mb-5 text-xs text-slate-400">Rule-based alerts from attendance behavior</p>

            {!hasAnyData ? (
              <EmptyState title="No data yet" message="Start by adding members or recording attendance" />
            ) : (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                    <span className="material-symbols-outlined mt-0.5 text-base text-primary-default">notifications_active</span>
                    <p className="text-sm font-medium text-slate-200">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h4 className="text-lg font-bold text-neutral-text dark:text-white">Retention List</h4>
              <p className="text-sm text-slate-500">Members who need a follow-up or reminder</p>
            </div>

            {!members.length ? (
              <div className="p-5">
                <EmptyState title="No retention alerts" message="Everyone has checked in recently or there is not enough data yet" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500">Member</th>
                      <th className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500">Plan</th>
                      <th className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500">Last Check-in</th>
                      <th className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500">Inactivity</th>
                      <th className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                      <th className="px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                        <td className="px-5 py-4 align-top">
                          <div>
                            <p className="text-sm font-bold text-neutral-text dark:text-white">{member.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{member.phone || 'No phone saved'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="space-y-2">
                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {member.planName}
                            </span>
                            <div>
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                                member.membershipState === 'expired-plan'
                                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                                  : member.membershipState === 'active-plan'
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {member.membershipState === 'expired-plan'
                                  ? 'Expired Plan'
                                  : member.membershipState === 'active-plan'
                                    ? 'Active Plan'
                                    : 'No Expiry'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-slate-600 dark:text-slate-300">
                          {formatDisplayDate(member.lastCheckIn)}
                        </td>
                        <td className="px-5 py-4 align-top text-sm font-bold text-neutral-text dark:text-white">
                          {member.inactivityDays} days
                        </td>
                        <td className="px-5 py-4 align-top">
                          <RetentionStatusBadge status={member.status} />
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => onCopyReminder(member)}
                              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              Copy Reminder
                            </button>
                            <button
                              type="button"
                              onClick={() => openReminderModal(member)}
                              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                            >
                              Send Reminder
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReminderActionModal
        state={modalState}
        onClose={() => setModalState({ open: false, member: null, message: '' })}
        onCopy={() => {
          if (modalState.member) {
            onCopyReminder(modalState.member);
          }
        }}
      />
    </>
  );
}
