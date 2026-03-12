import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SubscriptionManagement() {
    const [loading, setLoading] = useState(true);
    const [gyms, setGyms] = useState<any[]>([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchGyms();
    }, []);

    const fetchGyms = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('gyms').select('id, name, status, created_at').order('created_at', { ascending: false });
            if (error) throw error;
            setGyms(data || []);
        } catch (error) {
            console.error('Error fetching gyms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTier = async (gymId: string, newTier: string) => {
        try {
            const { error } = await supabase.from('gyms').update({ subscription_tier: newTier }).eq('id', gymId);
            if (error) throw error;
            fetchGyms();
        } catch (error) {
            console.error('Error updating subscription:', error);
            alert('Failed to update subscription tier.');
        }
    };

    const handleUpdateStatus = async (gymId: string, newStatus: string) => {
        try {
            const { error } = await supabase.from('gyms').update({ status: newStatus }).eq('id', gymId);
            if (error) throw error;
            fetchGyms();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        }
    };

    const statusColors: Record<string, string> = {
        ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        TRIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        PAST_DUE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        LOCKED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const filteredGyms = filter === 'ALL' ? gyms : gyms.filter(g => g.status === filter);

    const statusCounts = {
        ALL: gyms.length,
        ACTIVE: gyms.filter(g => g.status === 'ACTIVE').length,
        TRIAL: gyms.filter(g => g.status === 'TRIAL').length,
        PAST_DUE: gyms.filter(g => g.status === 'PAST_DUE').length,
        LOCKED: gyms.filter(g => g.status === 'LOCKED').length,
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Subscription Management</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage gym subscriptions, tiers, and billing statuses</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                    <button key={status} onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === status
                            ? 'bg-primary-default text-white shadow-lg shadow-primary-default/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {status === 'ALL' ? 'All' : status} ({count})
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Gym</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tier</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Next Billing</th>
                                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center">
                                    <div className="flex justify-center"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
                                </td></tr>
                            ) : filteredGyms.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-500">No gyms match this filter.</td></tr>
                            ) : (
                                filteredGyms.map((gym) => (
                                    <tr key={gym.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-lg bg-primary-default/10 flex items-center justify-center text-primary-default font-bold">{gym.name?.charAt(0)}</div>
                                                <div>
                                                    <p className="font-semibold text-sm text-neutral-text dark:text-white">{gym.name}</p>
                                                    <p className="text-xs text-slate-400">{gym.id.substring(0, 12)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <select value={gym.subscription_tier || 'FREE'} onChange={(e) => handleUpdateTier(gym.id, e.target.value)}
                                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold outline-none">
                                                <option value="FREE">FREE</option>
                                                <option value="STARTER">STARTER</option>
                                                <option value="PRO">PRO</option>
                                                <option value="ENTERPRISE">ENTERPRISE</option>
                                            </select>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColors[gym.status] || 'bg-slate-100 text-slate-600'}`}>{gym.status}</span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500 hidden lg:table-cell">
                                            {gym.next_billing_date ? new Date(gym.next_billing_date).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {gym.status === 'LOCKED' ? (
                                                    <button onClick={() => handleUpdateStatus(gym.id, 'ACTIVE')}
                                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors">
                                                        Unlock
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleUpdateStatus(gym.id, 'LOCKED')}
                                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors">
                                                        Lock
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-sm text-slate-500">Showing {filteredGyms.length} of {gyms.length} gyms</span>
                </div>
            </div>
        </div>
    );
}
