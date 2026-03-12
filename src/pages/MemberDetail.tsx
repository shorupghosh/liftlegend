import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';

export default function MemberDetail() {
    const { memberId } = useParams<{ memberId: string }>();
    const { gymId } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [member, setMember] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [editing, setEditing] = useState(false);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [form, setForm] = useState({ full_name: '', phone: '', email: '', emergency_contact: '' });

    const fetchMember = useCallback(async () => {
        if (!memberId || !gymId) return;
        setLoading(true);
        try {
            const [memberRes, historyRes, attendanceRes] = await Promise.all([
                supabase.from('members').select('id, full_name, email, phone, emergency_contact, status, start_date, created_at, plan_id').eq('id', memberId).eq('gym_id', gymId).single(),
                supabase.from('membership_history').select('*, plans(name)').eq('member_id', memberId).order('created_at', { ascending: false }).limit(10),
                supabase.from('attendance').select('id, check_in_time, method').eq('member_id', memberId).order('check_in_time', { ascending: false }).limit(20),
            ]);
            if (memberRes.error) throw memberRes.error;
            setMember(memberRes.data);
            setForm({
                full_name: memberRes.data.full_name || '',
                phone: memberRes.data.phone || '',
                email: memberRes.data.email || '',
                emergency_contact: memberRes.data.emergency_contact || '',
            });
            setHistory(historyRes.data || []);
            setAttendance(attendanceRes.data || []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [memberId, gymId]);

    useEffect(() => { fetchMember(); }, [fetchMember]);

    const handleSave = async () => {
        if (!memberId) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('members').update(form).eq('id', memberId);
            if (error) throw error;
            setEditing(false);
            fetchMember();
            showToast('Member details saved!', 'success'); // BUG-21 FIXED
        } catch (e: any) {
            console.error(e);
            showToast(e.message || 'Failed to save.', 'error');
        } finally { setSaving(false); }
    };

    // BUG-20 FIXED: toggleStatus now goes through styled confirm modal
    const handleToggleStatus = async () => {
        setShowStatusConfirm(false);
        if (!member) return;
        const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await supabase.from('members').update({ status: newStatus }).eq('id', member.id);
            fetchMember();
            showToast(`Member marked as ${newStatus}.`, 'success');
        } catch (e: any) { showToast(e.message || 'Failed to update status.', 'error'); }
    };

    if (loading) return (
        <div className="p-6 lg:p-8 flex justify-center items-center h-64">
            <div className="size-10 border-4 border-primary-default border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!member) return (
        <div className="p-6 lg:p-8 text-center text-slate-500">
            <p className="text-lg font-bold">Member not found</p>
            <button onClick={() => navigate('/admin/members')} className="mt-4 text-primary-default font-semibold hover:underline">← Back to Members</button>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <button onClick={() => navigate('/admin/members')} className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">{member.full_name}</h1>
                    <p className="text-slate-500 text-sm">Member since {new Date(member.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {member.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-br from-primary-default to-primary-default/80 p-6 text-center">
                            <div className="size-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-black">{member.full_name?.charAt(0)}</div>
                            <h2 className="text-white font-bold text-lg mt-3">{member.full_name}</h2>
                            <p className="text-white/70 text-sm">{member.member_id || member.id.substring(0, 8)}</p>
                        </div>

                        {editing ? (
                            <div className="p-5 space-y-3">
                                {[{ label: 'Name', key: 'full_name' }, { label: 'Phone', key: 'phone' }, { label: 'Email', key: 'email' }, { label: 'Emergency Contact', key: 'emergency_contact' }].map(f => (
                                    <div key={f.key}>
                                        <label htmlFor={`detail-${f.key}`} className="text-xs font-bold text-slate-500 uppercase">{f.label}</label>
                                        <input
                                            id={`detail-${f.key}`}
                                            value={(form as any)[f.key]}
                                            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-default"
                                        />
                                    </div>
                                ))}
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm text-slate-600">Cancel</button>
                                    <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg bg-primary-default text-white font-bold text-sm disabled:opacity-50">
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-5 space-y-3">
                                {[{ icon: 'phone', label: 'Phone', value: member.phone || '—' }, { icon: 'mail', label: 'Email', value: member.email || '—' }, { icon: 'emergency', label: 'Emergency', value: member.emergency_contact || '—' }].map(item => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">{item.icon}</span>
                                        <div><p className="text-[10px] text-slate-400 uppercase font-bold">{item.label}</p><p className="text-sm font-medium text-neutral-text dark:text-white">{item.value}</p></div>
                                    </div>
                                ))}
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setEditing(true)} className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">edit</span> Edit
                                    </button>
                                    {/* BUG-20 FIXED: trigger styled confirm modal, not native confirm() */}
                                    <button onClick={() => setShowStatusConfirm(true)} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition-colors ${member.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30'}`}>
                                        {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Membership History */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-neutral-text dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-default text-xl">receipt_long</span> Membership History
                            </h3>
                        </div>
                        {history.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No membership records</div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {history.map(h => (
                                    <div key={h.id} className="p-4 flex items-center gap-4">
                                        <div className="size-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600"><span className="material-symbols-outlined text-lg">payments</span></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-neutral-text dark:text-white">{(h.plans as any)?.name || 'Plan'}</p>
                                            <p className="text-xs text-slate-500">{new Date(h.start_date).toLocaleDateString()} → {new Date(h.end_date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-600">৳{h.price_paid}</p>
                                            <p className="text-[10px] text-slate-400 uppercase">{h.payment_method}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Attendance */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-neutral-text dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-default text-xl">fact_check</span> Recent Check-ins
                            </h3>
                        </div>
                        {attendance.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No check-in records</div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {attendance.slice(0, 10).map(a => (
                                    <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">login</span>
                                            <span className="text-sm font-medium text-neutral-text dark:text-white">{new Date(a.check_in_time).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500">{new Date(a.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">{a.method || 'MANUAL'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Styled status toggle confirm modal — BUG-20 FIXED */}
            {showStatusConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowStatusConfirm(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
                        <div className={`size-12 rounded-full flex items-center justify-center mx-auto mb-4 ${member.status === 'ACTIVE' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                            <span className={`material-symbols-outlined text-2xl ${member.status === 'ACTIVE' ? 'text-red-600' : 'text-emerald-600'}`}>
                                {member.status === 'ACTIVE' ? 'person_off' : 'person'}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-center text-neutral-text dark:text-white mb-2">
                            {member.status === 'ACTIVE' ? 'Deactivate Member?' : 'Activate Member?'}
                        </h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            This will mark {member.full_name} as {member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowStatusConfirm(false)} className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleToggleStatus} className={`flex-1 h-11 rounded-xl font-bold text-white transition-colors ${member.status === 'ACTIVE' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                                {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
