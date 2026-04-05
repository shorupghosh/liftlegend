import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import { formatBdt } from '../lib/currency';
import { AlertBadge } from '../components/ui/AlertBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/PageLoader';
import { useDemoData } from '../contexts/DemoDataContext';
import { useDemoMode } from '../hooks/useDemoMode';
import { getMemberExpiryAlert } from '../lib/memberExpiry';
import { generateQrValue, generateQrDataUrl, downloadQrCode } from '../lib/qrCode';

type Tab = 'info' | 'payments' | 'attendance';

export default function MemberDetail() {
    const { memberId } = useParams<{ memberId: string }>();
    const { gymId } = useAuth();
    const { isDemoMode } = useDemoMode();
    const { state: demoState, toggleMemberStatus, updateMember } = useDemoData();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [member, setMember] = useState<any>(null);
    const [plan, setPlan] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [form, setForm] = useState({ full_name: '', phone: '', email: '', emergency_contact: '' });

    const fetchMember = useCallback(async () => {
        if (!memberId || !gymId) return;
        setLoading(true);
        try {
            if (isDemoMode) {
                const demoMember = demoState.members.find((item) => item.id === memberId) || null;
                setMember(demoMember);
                setPlan(demoMember?.plans || null);
                setForm({
                    full_name: demoMember?.full_name || '',
                    phone: demoMember?.phone || '',
                    email: demoMember?.email || '',
                    emergency_contact: (demoMember as any)?.emergency_contact || '',
                });
                setPayments(demoState.payments.filter((payment) => payment.member_id === memberId));
                setAttendance(demoState.attendance.filter((entry) => entry.member_id === memberId));
                return;
            }

            const [memberRes, paymentsRes, attendanceRes] = await Promise.all([
                supabase
                    .from('members')
                    .select('id, full_name, email, phone, emergency_contact, status, join_date, expiry_date, qr_code_value, qr_generated_at, created_at, plan_id, plans(id, name, price, duration_days)')
                    .eq('id', memberId)
                    .eq('gym_id', gymId)
                    .single(),
                supabase
                    .from('membership_history')
                    .select('*, plans(name)')
                    .eq('member_id', memberId)
                    .order('created_at', { ascending: false })
                    .limit(50),
                supabase
                    .from('attendance')
                    .select('id, check_in_time, method')
                    .eq('member_id', memberId)
                    .order('check_in_time', { ascending: false })
                    .limit(100),
            ]);

            if (memberRes.error) throw memberRes.error;
            setMember(memberRes.data);
            setPlan(memberRes.data?.plans || null);
            setForm({
                full_name: memberRes.data.full_name || '',
                phone: memberRes.data.phone || '',
                email: memberRes.data.email || '',
                emergency_contact: memberRes.data.emergency_contact || '',
            });
            setPayments(paymentsRes.data || []);
            setAttendance(attendanceRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [demoState.attendance, demoState.members, demoState.payments, gymId, isDemoMode, memberId]);

    useEffect(() => { fetchMember(); }, [fetchMember]);

    const handleSave = async () => {
        if (!memberId || !gymId) return;
        setSaving(true);
        try {
            if (isDemoMode) {
                updateMember(memberId, {
                    full_name: form.full_name,
                    phone: form.phone,
                    email: form.email,
                    ...(form.emergency_contact ? ({ emergency_contact: form.emergency_contact } as any) : {}),
                });
                setEditing(false);
                showToast('Member updated. This is demo mode. Changes are not saved.', 'info');
                return;
            }
            const { error } = await supabase.from('members').update(form).eq('id', memberId).eq('gym_id', gymId);
            if (error) throw error;
            setEditing(false);
            fetchMember();
            showToast('Member details saved!', 'success');
        } catch (e: any) {
            console.error(e);
            showToast(e.message || 'Failed to save.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        setShowStatusConfirm(false);
        if (!member) return;
        const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            if (isDemoMode) {
                toggleMemberStatus(member.id);
                showToast(`Member marked as ${newStatus}. This is demo mode. Changes are not saved.`, 'info');
                return;
            }
            await supabase.from('members').update({ status: newStatus }).eq('id', member.id).eq('gym_id', gymId);
            fetchMember();
            showToast(`Member marked as ${newStatus}.`, 'success');
        } catch (e: any) {
            showToast(e.message || 'Failed to update status.', 'error');
        }
    };

    // ─── QR Code Rendering ────────────────────────────────
    useEffect(() => {
        if (member?.qr_code_value) {
            generateQrDataUrl(member.qr_code_value).then(setQrDataUrl).catch(console.error);
        } else {
            setQrDataUrl(null);
        }
    }, [member?.qr_code_value]);

    const handleRegenerateQr = async () => {
        if (!member || !gymId || !memberId) return;
        setIsRegenerating(true);
        try {
            const newQrValue = generateQrValue(gymId, memberId);
            if (isDemoMode) {
                updateMember(memberId, {
                    qr_code_value: newQrValue,
                    qr_generated_at: new Date().toISOString(),
                } as Partial<any>);
                showToast('QR code regenerated. This is demo mode. Changes are not saved.', 'info');
                return;
            }
            const { error } = await supabase.from('members').update({
                qr_code_value: newQrValue,
                qr_generated_at: new Date().toISOString(),
            }).eq('id', memberId).eq('gym_id', gymId);
            if (error) throw error;
            showToast('QR code regenerated. Old QR is now invalid.', 'success');
            fetchMember();
        } catch (e: any) {
            showToast(e.message || 'Failed to regenerate QR.', 'error');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleDownloadQr = async () => {
        if (!member?.qr_code_value) return;
        try {
            await downloadQrCode(member.qr_code_value, member.full_name);
            showToast('QR code downloaded!', 'success');
        } catch (e: any) {
            showToast('Failed to download QR.', 'error');
        }
    };

    // ─── Computed ──────────────────────────────────────────
    const expiryAlert = getMemberExpiryAlert(member?.expiry_date);
    const totalVisits = attendance.length;
    const lastVisit = attendance.length > 0
        ? new Date(attendance[0].check_in_time)
        : null;

    // ─── Loading / Not Found ──────────────────────────────
    if (loading) return <PageLoader label="Loading member profile..." />;

    if (!member) return (
        <div className="p-4 sm:p-6 lg:p-8">
            <EmptyState
                icon="person_search"
                title="Member not found"
                description="This member may have been removed or the link is no longer valid."
                actionLabel="Back to members"
                onAction={() => navigate('/admin/members')}
            />
        </div>
    );

    // ─── Tab Configuration ────────────────────────────────
    const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
        { key: 'info', label: 'Info', icon: 'person' },
        { key: 'payments', label: 'Payments', icon: 'payments', count: payments.length },
        { key: 'attendance', label: 'Attendance', icon: 'fact_check', count: totalVisits },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-5">
            {/* ═══ Profile Header ═══ */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary-default via-primary-default/90 to-primary-default/70 px-5 sm:px-8 py-6 sm:py-8">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate('/admin/members')}
                            className="size-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors shrink-0 mt-1"
                            aria-label="Back to members"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </button>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                            <div className="size-16 sm:size-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl sm:text-4xl font-black shrink-0">
                                {member.full_name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight truncate">
                                    {member.full_name}
                                </h1>
                                <p className="text-white/60 text-sm mt-0.5">
                                    ID: {member.id.substring(0, 8).toUpperCase()}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${member.status === 'ACTIVE'
                                        ? 'bg-emerald-500/20 text-emerald-100'
                                        : 'bg-red-500/20 text-red-100'
                                        }`}>
                                        <span className={`size-1.5 rounded-full ${member.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                        {member.status}
                                    </span>
                                    {plan && (
                                        <span className="inline-flex items-center rounded-lg bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/90">
                                            {plan.name}
                                        </span>
                                    )}
                                    <AlertBadge variant={expiryAlert.variant}>{expiryAlert.label}</AlertBadge>
                                </div>
                            </div>
                        </div>
                        {/* Action buttons */}
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => { setEditing(true); setActiveTab('info'); }}
                                className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-white/15 backdrop-blur-sm text-white text-sm font-bold hover:bg-white/25 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Edit
                            </button>
                            <button
                                onClick={() => setShowStatusConfirm(true)}
                                className={`flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-bold transition-colors ${member.status === 'ACTIVE'
                                    ? 'bg-red-500/20 text-red-100 hover:bg-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                                    }`}
                            >
                                {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══ Tab Navigation ═══ */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 text-sm font-bold transition-colors relative ${activeTab === tab.key
                                ? 'text-primary-default'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            <span className="hidden xs:inline">{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-default rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══ Mobile Action Buttons ═══ */}
            <div className="sm:hidden flex gap-2">
                <button
                    onClick={() => { setEditing(true); setActiveTab('info'); }}
                    className="flex-1 flex items-center justify-center gap-1.5 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">edit</span> Edit
                </button>
                <button
                    onClick={() => setShowStatusConfirm(true)}
                    className={`flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-1 transition-colors ${member.status === 'ACTIVE'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30'
                        }`}
                >
                    {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
            </div>

            {/* ═══ Tab Content ═══ */}
            <div className="min-h-[300px]">
                {/* ── INFO TAB ── */}
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Personal Info Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-neutral-text dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary-default text-xl">badge</span>
                                    Personal Details
                                </h3>
                                {!editing && (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="text-xs text-primary-default font-bold hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Edit
                                    </button>
                                )}
                            </div>

                            {editing ? (
                                <div className="p-5 space-y-4">
                                    {[
                                        { label: 'Full Name', key: 'full_name', type: 'text', icon: 'person' },
                                        { label: 'Phone', key: 'phone', type: 'tel', icon: 'phone' },
                                        { label: 'Email', key: 'email', type: 'email', icon: 'mail' },
                                        { label: 'Emergency Contact', key: 'emergency_contact', type: 'tel', icon: 'emergency' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label htmlFor={`detail-${f.key}`} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{f.label}</label>
                                            <div className="relative mt-1.5">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">{f.icon}</span>
                                                <input
                                                    id={`detail-${f.key}`}
                                                    type={f.type}
                                                    value={(form as any)[f.key]}
                                                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default transition-all"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => { setEditing(false); fetchMember(); }} className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={handleSave} disabled={saving} className="flex-1 h-11 rounded-xl font-bold text-white bg-primary-default hover:brightness-110 transition-all shadow-lg shadow-primary-default/20 disabled:opacity-50 flex items-center justify-center">
                                            {saving ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 space-y-4">
                                    {[
                                        { icon: 'person', label: 'Full Name', value: member.full_name || '—' },
                                        { icon: 'phone', label: 'Phone', value: member.phone || '—' },
                                        { icon: 'mail', label: 'Email', value: member.email || '—' },
                                        { icon: 'emergency', label: 'Emergency Contact', value: member.emergency_contact || '—' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center gap-3">
                                            <div className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-slate-500 text-lg">{item.icon}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.label}</p>
                                                <p className="text-sm font-medium text-neutral-text dark:text-white truncate">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Membership Info Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-neutral-text dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary-default text-xl">card_membership</span>
                                    Membership
                                </h3>
                            </div>
                            <div className="p-5 space-y-4">
                                {[
                                    { icon: 'fitness_center', label: 'Plan', value: plan?.name || 'No Plan', extra: plan ? formatBdt(Number(plan.price)) : undefined },
                                    { icon: 'calendar_today', label: 'Join Date', value: member.join_date ? new Date(member.join_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date(member.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                                    { icon: 'event_busy', label: 'Expiry Date', value: member.expiry_date ? new Date(member.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                                    { icon: 'schedule', label: 'Duration', value: plan?.duration_days ? `${plan.duration_days} days` : '—' },
                                    { icon: 'toggle_on', label: 'Status', value: member.status },
                                    { icon: 'notifications_active', label: 'Alert', value: expiryAlert.label },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-slate-500 text-lg">{item.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.label}</p>
                                            {item.label === 'Status' ? (
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold mt-0.5 ${member.status === 'ACTIVE'
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                                    }`}>
                                                    <span className={`size-1.5 rounded-full ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {member.status}
                                                </span>
                                            ) : item.label === 'Alert' ? (
                                                <div className="mt-0.5">
                                                    <AlertBadge variant={expiryAlert.variant}>{expiryAlert.label}</AlertBadge>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-neutral-text dark:text-white truncate">{item.value}</p>
                                                    {item.extra && <span className="text-xs text-slate-400">({item.extra})</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* QR Code Card */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-neutral-text dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary-default text-xl">qr_code_2</span>
                                    Member QR Code
                                </h3>
                                {member.qr_generated_at && (
                                    <span className="text-xs text-slate-400">Generated {new Date(member.qr_generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                )}
                            </div>
                            <div className="p-5 flex flex-col sm:flex-row items-center gap-6">
                                {/* QR Preview */}
                                <div className="shrink-0">
                                    {qrDataUrl ? (
                                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                            <img src={qrDataUrl} alt="Member QR Code" className="size-40 sm:size-48" />
                                        </div>
                                    ) : (
                                        <div className="size-40 sm:size-48 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">qr_code</span>
                                        </div>
                                    )}
                                </div>
                                {/* QR Info & Actions */}
                                <div className="flex-1 space-y-4 text-center sm:text-left">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">QR Code Value</p>
                                        <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all mt-1">
                                            {member.qr_code_value || 'Not generated'}
                                        </p>
                                    </div>
                                    {member.qr_generated_at && (
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Generated At</p>
                                            <p className="text-sm font-medium text-neutral-text dark:text-white mt-0.5">
                                                {new Date(member.qr_generated_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                        <button
                                            onClick={handleDownloadQr}
                                            disabled={!member.qr_code_value}
                                            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-40"
                                        >
                                            <span className="material-symbols-outlined text-sm">download</span>
                                            Download
                                        </button>
                                        <button
                                            onClick={handleRegenerateQr}
                                            disabled={isRegenerating}
                                            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-amber-500 text-white text-sm font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {isRegenerating ? (
                                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <span className="material-symbols-outlined text-sm">refresh</span>
                                            )}
                                            Regenerate
                                        </button>
                                        <button
                                            disabled
                                            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold cursor-not-allowed"
                                            title="Coming soon"
                                        >
                                            <span className="material-symbols-outlined text-sm">send</span>
                                            Send QR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="lg:col-span-2 grid grid-cols-3 gap-3">
                            {[
                                { icon: 'payments', label: 'Total Payments', value: payments.length, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
                                { icon: 'fact_check', label: 'Total Visits', value: totalVisits, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
                                { icon: 'schedule', label: 'Last Visit', value: lastVisit ? lastVisit.toLocaleDateString() : 'Never', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
                            ].map(stat => (
                                <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                                            <span className="material-symbols-outlined text-xl">{stat.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">{stat.label}</p>
                                            <p className="text-lg sm:text-xl font-extrabold text-neutral-text dark:text-white">{stat.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── PAYMENTS TAB ── */}
                {activeTab === 'payments' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-neutral-text dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-default text-xl">receipt_long</span>
                                Payment History
                            </h3>
                            <span className="text-xs text-slate-500 font-medium">{payments.length} records</span>
                        </div>

                        {payments.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="size-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl text-slate-400">payments</span>
                                </div>
                                <p className="text-slate-500 font-medium">No payment records</p>
                                <p className="text-xs text-slate-400 mt-1">Payment history will appear here once payments are made.</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile cards */}
                                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                                    {payments.map(p => (
                                        <div key={p.id} className="p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm text-neutral-text dark:text-white">{(p.plans as any)?.name || 'Plan'}</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatBdt(Number(p.price_paid || 0))}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <span>{new Date(p.start_date).toLocaleDateString()} → {new Date(p.end_date).toLocaleDateString()}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{p.payment_method || 'CASH'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop table */}
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan</th>
                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Period</th>
                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Method</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {payments.map(p => (
                                                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-5 py-3.5 text-sm text-neutral-text dark:text-white font-medium">
                                                        {new Date(p.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                            {(p.plans as any)?.name || 'Plan'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs text-slate-500">
                                                        {new Date(p.start_date).toLocaleDateString()} → {new Date(p.end_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatBdt(Number(p.price_paid || 0))}</span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 uppercase">
                                                            {p.payment_method || 'CASH'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Payment Summary Footer */}
                                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-medium">Total Paid</span>
                                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {formatBdt(payments.reduce((sum: number, p: any) => sum + Number(p.price_paid || 0), 0))}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── ATTENDANCE TAB ── */}
                {activeTab === 'attendance' && (
                    <div className="space-y-5">
                        {/* Attendance Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                                        <span className="material-symbols-outlined text-xl">bar_chart</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Total Visits</p>
                                        <p className="text-xl sm:text-2xl font-extrabold text-neutral-text dark:text-white">{totalVisits}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600">
                                        <span className="material-symbols-outlined text-xl">schedule</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Last Visit</p>
                                        <p className="text-sm sm:text-base font-bold text-neutral-text dark:text-white">
                                            {lastVisit ? lastVisit.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600">
                                        <span className="material-symbols-outlined text-xl">trending_up</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">This Month</p>
                                        <p className="text-xl sm:text-2xl font-extrabold text-neutral-text dark:text-white">
                                            {attendance.filter(a => {
                                                const d = new Date(a.check_in_time);
                                                const now = new Date();
                                                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                            }).length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance History */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-neutral-text dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary-default text-xl">fact_check</span>
                                    Check-in History
                                </h3>
                                <span className="text-xs text-slate-500 font-medium">{attendance.length} records</span>
                            </div>

                            {attendance.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="size-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-3xl text-slate-400">fact_check</span>
                                    </div>
                                    <p className="text-slate-500 font-medium">No check-in records</p>
                                    <p className="text-xs text-slate-400 mt-1">Attendance will appear here when the member checks in.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {attendance.map((a, idx) => {
                                        const checkDate = new Date(a.check_in_time);
                                        const isToday = checkDate.toDateString() === new Date().toDateString();
                                        return (
                                            <div key={a.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-8 rounded-lg flex items-center justify-center text-sm font-bold ${isToday
                                                        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                        }`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-neutral-text dark:text-white">
                                                            {checkDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        {isToday && (
                                                            <span className="ml-2 text-[10px] font-bold text-emerald-600 uppercase">Today</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {checkDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                                                        {a.method || 'MANUAL'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ Status Toggle Confirm Modal ═══ */}
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
