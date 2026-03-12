import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SupportTicket } from '../../types';

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
                // If table doesn't exist, we fallback to an empty UI array rather than failing silently completely
                if (error.code === '42P01') {
                    console.warn('support_tickets table not found! Please run the setup SQL.');
                } else {
                    throw error;
                }
            }

            // Map the data shaping the gym name
            const activeTickets = (data || []).map((t: any) => ({
                ...t,
                gym_name: t.gyms?.name || 'Unknown Gym'
            }));

            setTickets(activeTickets);
            setTotalCount(count || 0);
        } catch (e) {
            console.error('Error fetching tickets:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, s: string) => {
        try {
            const { error } = await supabase.from('support_tickets').update({ status: s }).eq('id', id);
            if (error) throw error;

            // Optimistic update
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status: s } : t));
        } catch (error) {
            console.error('Error updating ticket status:', error);
            alert('Failed to update ticket status.');
        }
    };

    const pColors: Record<string, string> = { HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    const sColors: Record<string, string> = { OPEN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', CLOSED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    const sIcons: Record<string, string> = { OPEN: 'error', IN_PROGRESS: 'pending', CLOSED: 'check_circle' };

    // Note: To make global counts scalable, they should be RPCs. 
    // We display 'Current View' quantities here since full array is no longer downloaded.
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
                {['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === s ? 'bg-primary-default text-white shadow-lg shadow-primary-default/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                        {s === 'IN_PROGRESS' ? 'In Progress' : s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="flex justify-center py-12"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
            ) : tickets.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">No tickets match this filter.</div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(t => (
                        <div key={t.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${sColors[t.status]}`}><span className="material-symbols-outlined text-lg">{sIcons[t.status]}</span></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="font-bold text-sm text-neutral-text dark:text-white truncate">{t.subject}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${pColors[t.priority]}`}>{t.priority}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500"><span>{t.gym_name}</span><span>•</span><span>{t.category}</span><span>•</span><span>{new Date(t.created_at).toLocaleDateString()}</span></div>
                            </div>
                            <select value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold outline-none shrink-0">
                                <option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="CLOSED">Closed</option>
                            </select>
                        </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-between items-center py-4 px-2">
                        <span className="text-sm text-slate-500">Showing {Math.min((page * ITEMS_PER_PAGE) + 1, totalCount)} to {Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)} of {totalCount} tickets</span>
                        <div className="flex gap-2">
                            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50">Prev</button>
                            <button disabled={page >= totalPages - 1 || totalCount === 0} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50">Next</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
