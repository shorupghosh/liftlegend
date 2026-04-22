import React from 'react';
import { Payment } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { StatusBadge } from '../ui/StatusBadge';
import { formatBdt } from '../../lib/currency';

interface PaymentsTableProps {
  loading: boolean;
  filteredPayments: Payment[];
  paymentsLength: number;
  totalCount: number;
  totalPages: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  getPaymentDueAmount: (payment: Payment) => number;
  onViewReceipt: (payment: Payment) => void;
  onDownloadReceipt: (payment: Payment) => void;
}

function methodLabel(method: string) {
  if (method === 'BKASH') return 'bKash';
  if (method === 'BANK_TRANSFER') return 'Bank Transfer';
  return method;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  loading,
  filteredPayments,
  paymentsLength,
  totalCount,
  totalPages,
  page,
  setPage,
  ITEMS_PER_PAGE,
  getPaymentDueAmount,
  onViewReceipt,
  onDownloadReceipt,
}) => {
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="skeleton mb-2 h-3.5 w-28" />
                  <div className="skeleton h-2.5 w-20" />
                </div>
                <div className="skeleton h-5 w-20" />
              </div>
            </div>
          ))
        ) : filteredPayments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <EmptyState
              icon="payments"
              title="No payments yet"
              description="Record your first payment to see renewals, methods, and revenue history here."
            />
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const dueAmount = getPaymentDueAmount(payment);
            return (
              <div key={payment.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-text dark:text-white">
                      {payment.members?.full_name || 'Unknown'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{payment.plans?.name || 'Custom Plan'}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatBdt(Number(payment.price_paid || 0))}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    {new Date(payment.created_at).toLocaleDateString('en-GB')} at{' '}
                    {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {methodLabel(payment.payment_method)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge
                    label={dueAmount > 0 ? `Due BDT ${dueAmount.toLocaleString()}` : 'Paid in full'}
                    tone={dueAmount > 0 ? 'warning' : 'success'}
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onViewReceipt(payment)}
                      className="text-xs font-bold text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 dark:text-slate-300 dark:decoration-slate-700 dark:hover:text-white"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadReceipt(payment)}
                      className="text-xs font-bold text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 dark:text-slate-300 dark:decoration-slate-700 dark:hover:text-white"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-slate-500">{totalCount} payments</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900"
              >
                {'<'}
              </button>
              <span className="text-xs font-medium text-slate-500">
                {page + 1}/{totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900"
              >
                {'>'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[800px] whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Date/Time</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Member</th>
                <th className="hidden px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 md:table-cell">
                  Plan Details
                </th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="hidden px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 md:table-cell">
                  Method
                </th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex justify-center">
                      <div className="size-8 animate-spin rounded-full border-4 border-primary-default border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6">
                    <EmptyState
                      icon="payments"
                      title="No payments yet"
                      description="Record your first payment to start building revenue history."
                    />
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const dueAmount = getPaymentDueAmount(payment);
                  return (
                    <tr key={payment.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-neutral-text dark:text-white">
                          {new Date(payment.created_at).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-neutral-text dark:text-white">
                        {payment.members?.full_name || 'Unknown'}
                      </td>
                      <td className="hidden px-5 py-4 text-sm text-slate-600 dark:text-slate-400 md:table-cell">
                        {payment.plans?.name || 'Custom Plan'}
                        <div className="mt-0.5 text-xs text-slate-500">
                          {new Date(payment.start_date).toLocaleDateString('en-GB')} to {new Date(payment.end_date).toLocaleDateString('en-GB')}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatBdt(Number(payment.price_paid || 0))}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          label={dueAmount > 0 ? `Due BDT ${dueAmount.toLocaleString()}` : 'Paid in full'}
                          tone={dueAmount > 0 ? 'warning' : 'success'}
                        />
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {methodLabel(payment.payment_method)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => onViewReceipt(payment)}
                            className="text-xs font-bold text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 dark:text-slate-300 dark:decoration-slate-700 dark:hover:text-white"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => onDownloadReceipt(payment)}
                            className="text-xs font-bold text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 dark:text-slate-300 dark:decoration-slate-700 dark:hover:text-white"
                          >
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold">{paymentsLength === 0 ? 0 : page * ITEMS_PER_PAGE + 1}</span> to{' '}
            <span className="font-bold">{Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)}</span> of{' '}
            <span className="font-bold">{totalCount}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading || totalCount === 0}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
