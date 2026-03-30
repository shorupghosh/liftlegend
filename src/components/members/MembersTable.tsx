import React from 'react';
import { Link } from 'react-router-dom';
import { Member } from '../../types';
import { AlertBadge } from '../ui/AlertBadge';
import { EmptyState } from '../ui/EmptyState';
import { getMemberExpiryAlert } from '../../lib/memberExpiry';
import { StatusBadge, toneFromStatus } from '../ui/StatusBadge';

interface MembersTableProps {
  loading: boolean;
  members: Member[];
  searchQuery: string;
  sortConfig: { key: string, direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
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
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  page,
  totalPages,
  totalCount,
  setPage
}) => {
  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <span className="material-symbols-outlined text-xs ml-1 opacity-0 group-hover:opacity-100 transition-opacity">unfold_more</span>;
    return <span className="material-symbols-outlined text-xs ml-1 text-primary-default">{sortConfig.direction === 'asc' ? 'expand_less' : 'expand_more'}</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th onClick={() => onSort('full_name')} className="group cursor-pointer px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-primary-default transition-colors">
                <div className="flex items-center">Member <SortIcon column="full_name" /></div>
              </th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan</th>
              <th onClick={() => onSort('join_date')} className="group cursor-pointer px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell hover:text-primary-default transition-colors">
                <div className="flex items-center">Joined <SortIcon column="join_date" /></div>
              </th>
              <th onClick={() => onSort('expiry_date')} className="group cursor-pointer px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden lg:table-cell hover:text-primary-default transition-colors">
                <div className="flex items-center">Expiry <SortIcon column="expiry_date" /></div>
              </th>
              <th onClick={() => onSort('status')} className="group cursor-pointer px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-primary-default transition-colors">
                <div className="flex items-center">Status <SortIcon column="status" /></div>
              </th>
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
                <td colSpan={7} className="p-12">
                  <EmptyState
                    icon={searchQuery ? 'search_off' : 'group'}
                    title={searchQuery ? 'No match found' : 'No members yet'}
                    description={searchQuery ? 'Try adjusting your search or filters.' : 'Your gym roster will appear here.'}
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
                        <div className="size-9 rounded-full bg-primary-default/10 flex items-center justify-center text-primary-default font-bold text-sm shrink-0">
                          {member.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/admin/members/${member.id}`} className="font-semibold text-sm text-primary-default hover:underline block truncate">{member.full_name}</Link>
                          <span className="text-xs text-slate-500 truncate block">{member.email || member.phone || '-'}</span>
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
                    <td className="px-5 py-4 text-sm text-slate-500 hidden lg:table-cell font-medium">
                      {member.expiry_date ? new Date(member.expiry_date).toLocaleDateString() : <span className="text-xs text-slate-400">-</span>}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge label={member.status || 'UNKNOWN'} tone={toneFromStatus(member.status)} />
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
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
        <span className="text-xs sm:text-sm text-slate-500">
          {searchQuery ? `${members.length} results found` : `${totalCount} total members`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm">Prev</button>
            <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
