import React from 'react';
import { Link } from 'react-router-dom';
import { Member } from '../../types';
import { AlertBadge } from '../ui/AlertBadge';
import { EmptyState } from '../ui/EmptyState';
import { getMemberExpiryAlert } from '../../lib/memberExpiry';

interface MembersTableProps {
  loading: boolean;
  members: Member[];
  searchQuery: string;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  loading,
  members,
  searchQuery,
  onEdit,
  onDelete,
  page,
  totalPages,
  totalCount,
  setPage
}) => {
  return (
    <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Member</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell">Joined</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden lg:table-cell">Expiry</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Alert</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex justify-center"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6">
                  <EmptyState
                    icon={searchQuery ? 'search_off' : 'group'}
                    title={searchQuery ? 'No members match this search' : 'No members yet'}
                    description={searchQuery ? 'Try a different name, email, or phone number.' : 'Add your first member to start managing plans and renewals.'}
                  />
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const alert = getMemberExpiryAlert(member.expiry_date);
                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary-default/10 flex items-center justify-center text-primary-default font-bold text-sm">
                          {member.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <Link to={`/admin/members/${member.id}`} className="font-semibold text-sm text-primary-default hover:underline block">{member.full_name}</Link>
                          <span className="text-xs text-slate-500">{member.email || member.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {member.plans ? (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {member.plans.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No Plan</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">
                      {member.join_date
                        ? new Date(member.join_date).toLocaleDateString()
                        : new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden lg:table-cell">
                      {member.expiry_date
                        ? new Date(member.expiry_date).toLocaleDateString()
                        : <span className="text-xs text-slate-400">—</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      {member.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" />Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/20 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                          <span className="size-1.5 rounded-full bg-red-500" />{member.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <AlertBadge variant={alert.variant}>{alert.label}</AlertBadge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button onClick={() => onEdit(member)} className="size-9 flex items-center justify-center text-slate-400 hover:text-primary-default hover:bg-primary-default/10 rounded-lg transition-colors" aria-label={`Edit ${member.full_name}`}>
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onClick={() => onDelete(member)} className="size-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors" aria-label={`Delete ${member.full_name}`}>
                          <span className="material-symbols-outlined text-lg">delete</span>
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
      {/* Footer — Pagination */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
        <span className="text-sm text-slate-500">
          {searchQuery ? `${members.length} results` : `${totalCount} total members`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">← Prev</button>
            <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
