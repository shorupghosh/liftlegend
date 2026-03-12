import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function RevenueDashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({ mrr: 0, arr: 0, totalRevenue: 0, avgRevenuePerGym: 0 });
    const [gymRevenue, setGymRevenue] = useState<any[]>([]);

    useEffect(() => {
        fetchRevenue();
    }, []);

    const fetchRevenue = async () => {
        setLoading(true);
        try {
            // Get all payments across all gyms
            const { data: payments } = await supabase
                .from('membership_history')
                .select('price_paid, gym_id, created_at, gyms(name)')
                .order('created_at', { ascending: false });

            const allPayments = payments || [];
            const totalRevenue = allPayments.reduce((sum, p) => sum + (p.price_paid || 0), 0);

            // Calculate MRR (last 30 days revenue)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentPayments = allPayments.filter(p => new Date(p.created_at) >= thirtyDaysAgo);
            const mrr = recentPayments.reduce((sum, p) => sum + (p.price_paid || 0), 0);

            // Get unique gyms count
            const { count: gymCount } = await supabase.from('gyms').select('id', { count: 'exact', head: true });

            // Revenue per gym
            const gymMap = new Map<string, { name: string; revenue: number; count: number }>();
            allPayments.forEach(p => {
                const existing = gymMap.get(p.gym_id) || { name: (p.gyms as any)?.name || 'Unknown', revenue: 0, count: 0 };
                existing.revenue += p.price_paid || 0;
                existing.count += 1;
                gymMap.set(p.gym_id, existing);
            });

            const gymRevenueList = Array.from(gymMap.entries())
                .map(([id, data]) => ({ id, ...data }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10);

            setGymRevenue(gymRevenueList);
            setMetrics({
                mrr,
                arr: mrr * 12,
                totalRevenue,
                avgRevenuePerGym: gymCount ? totalRevenue / gymCount : 0,
            });
        } catch (error) {
            console.error('Error fetching revenue data:', error);
        } finally {
            setLoading(false);
        }
    };

    const maxRevenue = Math.max(...gymRevenue.map(g => g.revenue), 1);

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Revenue Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform-wide financial performance and revenue analytics</p>
            </div>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'MRR (30 days)', value: `৳${metrics.mrr.toLocaleString()}`, icon: 'trending_up', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' },
                    { label: 'Projected ARR', value: `৳${metrics.arr.toLocaleString()}`, icon: 'calendar_month', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' },
                    { label: 'Total Revenue', value: `৳${metrics.totalRevenue.toLocaleString()}`, icon: 'account_balance', color: 'bg-primary-default/10 text-primary-default' },
                    { label: 'Avg / Gym', value: `৳${Math.round(metrics.avgRevenuePerGym).toLocaleString()}`, icon: 'store', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600' },
                ].map((card) => (
                    <div key={card.label} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-lg ${card.color}`}><span className="material-symbols-outlined text-xl">{card.icon}</span></div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">{card.label}</p>
                        <h3 className="text-2xl font-black mt-1 text-neutral-text dark:text-white">{loading ? '—' : card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Top Revenue Gyms */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg text-neutral-text dark:text-white">Top Revenue Gyms</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Ranked by total payment volume</p>
                </div>
                {loading ? (
                    <div className="flex justify-center py-12"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
                ) : gymRevenue.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No revenue data available yet.</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {gymRevenue.map((gym, idx) => (
                            <div key={gym.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <span className={`size-8 rounded-lg flex items-center justify-center text-sm font-black ${idx < 3 ? 'bg-primary-default/10 text-primary-default' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-neutral-text dark:text-white truncate">{gym.name}</p>
                                    <p className="text-xs text-slate-400">{gym.count} payments</p>
                                </div>
                                <div className="hidden sm:block flex-1 max-w-[200px]">
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                        <div className="h-full bg-primary-default rounded-full transition-all" style={{ width: `${(gym.revenue / maxRevenue) * 100}%` }} />
                                    </div>
                                </div>
                                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">৳{gym.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
