import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SupportTicket } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function SupportTickets() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => { fetchTickets(); }, [filter, page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('support_tickets')
        .select('id, subject, priority, status, category, created_at, updated_at, gym_id, gyms(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (filter !== 'ALL') {
        query = query.eq('status', filter);
      }

      const { data, count, error } = await query;

      if (error) {
        if (error.code === '42P01') {
          console.warn('support_tickets table not found. Run the setup SQL.');
        } else {
          throw error;
        }
      }

      const activeTickets = (data || []).map((ticket: any) => ({
        ...ticket,
        gym_name: ticket.gyms?.name || 'Unknown Gym',
      }));

      setTickets(activeTickets);
      setTotalCount(count || 0);
    } catch (e) {
      console.error('Error fetching tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
      if (error) throw error;

      setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)));
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Failed to update ticket status.');
    }
  };

  const priorityTone: Record<string, 'danger' | 'warning' | 'info'> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'info',
  };
  const statusTone: Record<string, 'danger' | 'warning' | 'success'> = {
    OPEN: 'danger',
    IN_PROGRESS: 'warning',
    CLOSED: 'success',
  };
  const statusIcon: Record<string, string> = {
    OPEN: 'error',
    IN_PROGRESS: 'pending',
    CLOSED: 'check_circle',
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Support Tickets</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and resolve gym owner support requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1 md:col-span-2 lg:col-span-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Total Matches</p>
            <p className="text-2xl font-black mt-1 text-neutral-text dark:text-white">{totalCount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'].map((status) => (
          <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === status ? 'bg-primary-default text-white shadow-lg shadow-primary-default/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
            {status === 'IN_PROGRESS' ? 'In Progress' : status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
      ) : tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <EmptyState icon="support_agent" title="No tickets match this filter" description="Try another status to review a different queue segment." />
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="size-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800">
                <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-300">{statusIcon[ticket.status]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm text-neutral-text dark:text-white truncate">{ticket.subject}</h3>
                  <StatusBadge label={ticket.priority} tone={priorityTone[ticket.priority]} />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{ticket.gym_name}</span>
                  <span>-</span>
                  <span>{ticket.category}</span>
                  <span>-</span>
                  <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge label={ticket.status.replace('_', ' ')} tone={statusTone[ticket.status]} />
                <select value={ticket.status} onChange={(e) => handleStatusChange(ticket.id, e.target.value)} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold outline-none shrink-0">
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center py-4 px-2">
            <span className="text-sm text-slate-500">Showing {Math.min((page * ITEMS_PER_PAGE) + 1, totalCount)} to {Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)} of {totalCount} tickets</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50">Prev</button>
              <button disabled={page >= totalPages - 1 || totalCount === 0} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

