import React from 'react';
import { Payment } from '../../types';
import { EmptyState } from '../ui/EmptyState';

interface PaymentsTableProps {
  loading: boolean;
  filteredPayments: Payment[];
  paymentsLength: number;
  totalCount: number;
  totalPages: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  loading,
  filteredPayments,
  paymentsLength,
  totalCount,
  totalPages,
  page,
  setPage,
  ITEMS_PER_PAGE
}) => {
  return (
    <>
      {/* ═══ Mobile Card Layout (< 640px) ═══ */}
      <div className="sm:hidden space-y-3">
          {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                      <div className="flex items-center justify-between">
                          <div className="flex-1">
                              <div className="skeleton w-28 h-3.5 mb-2" />
                              <div className="skeleton w-20 h-2.5" />
                          </div>
                          <div className="skeleton w-20 h-5" />
                          </div>
                  </div>
              ))
          ) : filteredPayments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <EmptyState
                      icon="payments"
                      title="No payments yet"
                      description="Record your first payment to see renewals, methods, and revenue history here."
                  />
              </div>
          ) : (
              filteredPayments.map((payment) => (
                  <div key={payment.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                      <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                              <p className="font-semibold text-sm text-neutral-text dark:text-white truncate">{payment.members?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{payment.plans?.name || 'Custom Plan'}</p>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm shrink-0">৳{Number(payment.price_paid).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs text-slate-500">{new Date(payment.created_at).toLocaleDateString()} · {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                              {payment.payment_method}
                          </span>
                      </div>
                  </div>
              ))
          )}
          {/* Mobile Pagination */}
          <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500">{totalCount} payments</span>
              {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="size-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 text-sm font-bold">←</button>
                      <span className="text-xs text-slate-500 font-medium">{page + 1}/{totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading} className="size-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 text-sm font-bold">→</button>
                  </div>
              )}
          </div>
      </div>

      {/* ═══ Desktop Table Layout (>= 640px) ═══ */}
      <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Date/Time</th>
                          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Member</th>
                          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Plan Details</th>
                          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Method</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {loading ? (
                          <tr><td colSpan={5} className="py-12 text-center"><div className="flex justify-center"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div></td></tr>
                      ) : filteredPayments.length === 0 ? (
                          <tr><td colSpan={5} className="p-6"><EmptyState icon="payments" title="No payments yet" description="Record your first payment to start building revenue history." /></td></tr>
                      ) : (
                          filteredPayments.map((payment) => (
                              <tr key={payment.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                  <td className="px-5 py-4">
                                      <div className="text-sm font-medium text-neutral-text dark:text-white">{new Date(payment.created_at).toLocaleDateString()}</div>
                                      <div className="text-xs text-slate-500">{new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                  </td>
                                  <td className="px-5 py-4 font-semibold text-sm text-neutral-text dark:text-white">{payment.members?.full_name || 'Unknown'}</td>
                                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                                      {payment.plans?.name || 'Custom Plan'}
                                      <div className="text-xs text-slate-500 mt-0.5">
                                          {new Date(payment.start_date).toLocaleDateString()} → {new Date(payment.end_date).toLocaleDateString()}
                                      </div>
                                  </td>
                                  <td className="px-5 py-4">
                                      <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{Number(payment.price_paid).toLocaleString()}</span>
                                  </td>
                                  <td className="px-5 py-4 hidden md:table-cell">
                                      <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                                          {payment.payment_method}
                                      </span>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500">
                  Showing <span className="font-bold">{paymentsLength === 0 ? 0 : (page * ITEMS_PER_PAGE) + 1}</span> to <span className="font-bold">{Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)}</span> of <span className="font-bold">{totalCount}</span> results
              </p>
              <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">Previous</button>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading || totalCount === 0} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">Next</button>
              </div>
          </div>
      </div>
    </>
  );
};
