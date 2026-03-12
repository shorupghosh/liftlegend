import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AuditLogs() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [filterType, setFilterType] = useState('ALL');

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const [membersRes, paymentsRes, attendanceRes] = await Promise.all([
                supabase.from('members').select('id, full_name, created_at, gym_id, gyms(name)').order('created_at', { ascending: false }).limit(10),
                supabase.from('membership_history').select('id, price_paid, created_at, gym_id, members(full_name), gyms(name)').order('created_at', { ascending: false }).limit(10),
                supabase.from('attendance').select('id, check_in_time, method, gym_id, members(full_name), gyms(name)').order('check_in_time', { ascending: false }).limit(10),
            ]);

            const allLogs = [
                ...(membersRes.data || []).map(m => ({ id: m.id, type: 'MEMBER', action: 'Member registered', detail: m.full_name, gym: (m.gyms as any)?.name, timestamp: m.created_at })),
                ...(paymentsRes.data || []).map(p => ({ id: p.id, type: 'PAYMENT', action: 'Payment recorded', detail: `৳${p.price_paid} by ${(p.members as any)?.full_name || 'Unknown'}`, gym: (p.gyms as any)?.name, timestamp: p.created_at })),
                ...(attendanceRes.data || []).map(a => ({ id: a.id, type: 'ATTENDANCE', action: `Check-in (${a.method || 'MANUAL'})`, detail: (a.members as any)?.full_name || 'Unknown', gym: (a.gyms as any)?.name, timestamp: a.check_in_time })),
            ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setLogs(allLogs);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const typeColors: Record<string, string> = {
        MEMBER: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        PAYMENT: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        ATTENDANCE: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    };
    const typeIcons: Record<string, string> = { MEMBER: 'person_add', PAYMENT: 'payments', ATTENDANCE: 'fact_check' };
    const filtered = filterType === 'ALL' ? logs : logs.filter(l => l.type === filterType);

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Audit Logs</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Chronological record of all platform activities</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {['ALL', 'MEMBER', 'PAYMENT', 'ATTENDANCE'].map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === t ? 'bg-primary-default text-white shadow-lg shadow-primary-default/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                        {t === 'ALL' ? 'All Events' : t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12"><div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No audit logs found.</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map((log, i) => (
                            <div key={`${log.id}-${log.type}-${i}`} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[log.type]}`}>
                                    <span className="material-symbols-outlined text-lg">{typeIcons[log.type]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-neutral-text dark:text-white">{log.action}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                        <span>{log.detail}</span>
                                        {log.gym && <><span>•</span><span className="font-medium">{log.gym}</span></>}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-medium text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-sm text-slate-500">Showing {filtered.length} entries</span>
                </div>
            </div>
        </div>
    );
}
