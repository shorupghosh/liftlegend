import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { useToast } from '../components/ToastProvider';
// html5-qrcode is dynamically imported below to avoid loading ~370KB on page mount
import { Member, Attendance } from '../types';
import { parseQrValue } from '../lib/qrCode';
import { getDaysLeft } from '../lib/memberExpiry';
import { EmptyState } from '../components/ui/EmptyState';
import { useDemoData } from '../contexts/DemoDataContext';
import { useDemoMode } from '../hooks/useDemoMode';
import { useDebounce } from '../hooks/useDebounce';
import { usePlan } from '../contexts/PlanContext';

const CheckinSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-1/4" />
      </div>
      <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
  </div>
);

export default function AttendanceScanner() {
  const { gymId } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { state: demoState, addAttendance } = useDemoData();
  const { showToast } = useToast();
  const { canAccess, openUpgradeModal } = usePlan();
  const [members, setMembers] = useState<Partial<Member>[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<Partial<Attendance>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; detail: string } | null>(null);

  const fetchData = useCallback(async () => {
    if (!gymId) return;
    setLoading(true);
    try {
      if (isDemoMode) {
        const today = new Date().toISOString().split('T')[0];
        setMembers(demoState.members);
        setRecentCheckins(
          demoState.attendance
            .filter((entry) => entry.check_in_time.startsWith(today))
            .sort((a, b) => b.check_in_time.localeCompare(a.check_in_time))
            .slice(0, 20)
        );
        setTodayCount(demoState.attendance.filter((entry) => entry.check_in_time.startsWith(today)).length);
        setTotalMembers(demoState.members.length);
        setActiveMembers(demoState.members.filter(m => m.status === 'ACTIVE').length);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [checkinsRes, countRes, totalRes, activeRes] = await Promise.all([
        supabase.from('attendance').select('*, members(full_name, email, status, plans(name))').eq('gym_id', gymId).gte('check_in_time', today.toISOString()).order('check_in_time', { ascending: false }).limit(20),
        supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('gym_id', gymId).gte('check_in_time', today.toISOString()),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gymId),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'ACTIVE'),
      ]);

      if (checkinsRes.error) throw checkinsRes.error;

      setRecentCheckins(checkinsRes.data as unknown as Partial<Attendance>[] || []);
      setTodayCount(countRes.count || 0);
      setTotalMembers(totalRes.count || 0);
      setActiveMembers(activeRes.count || 0);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      showToast('Failed to load attendance data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [demoState.attendance, demoState.members, gymId, isDemoMode, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useRealtimeSubscription({ table: 'attendance', gymId, onChange: fetchData });

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showManualModal) {
          setShowManualModal(false);
          setSearchTerm('');
        }
        if (showQrModal) {
          setShowQrModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showManualModal, showQrModal]);

  // Handle QR scanning — dynamically imports html5-qrcode only when QR modal opens
  useEffect(() => {
    if (!showQrModal || !gymId || isDemoMode) return;

    let scannerInstance: any = null;

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        scannerInstance = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);

        scannerInstance.render((decodedText: string) => {
          scannerInstance.clear();
          setShowQrModal(false);
          handleQrScan(decodedText);
        }, (_errorMessage: string) => {
          // Ignore continuous scan failures
        });
      } catch (err) {
        console.error('Failed to load QR scanner:', err);
        showToast('Failed to load QR scanner.', 'error');
      }
    };

    const timer = setTimeout(initScanner, 100);

    return () => {
      clearTimeout(timer);
      if (scannerInstance) {
        scannerInstance.clear().catch(console.error);
      }
    };
  }, [showQrModal, gymId, isDemoMode]);

  // Handle Manual Search
  const [searchingMembers, setSearchingMembers] = useState(false);
  useEffect(() => {
    if (!debouncedSearch || isDemoMode || !gymId) {
      if (isDemoMode) setMembers(demoState.members.filter(m => m.full_name.toLowerCase().includes(searchTerm.toLowerCase())));
      return;
    }

    const searchMembers = async () => {
      setSearchingMembers(true);
      try {
        const { data, error } = await supabase
          .from('members')
          .select('id, full_name, status, expiry_date, plans(name)')
          .eq('gym_id', gymId)
          .or(`full_name.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`)
          .limit(10);
        
        if (error) throw error;
        setMembers(data as any[]);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchingMembers(false);
      }
    };

    searchMembers();
  }, [debouncedSearch, gymId, isDemoMode, demoState.members, searchTerm]);

  /**
   * Handle a scanned QR code:
   * 1. Parse the QR value
   * 2. Look up member by qr_code_value in the database
   * 3. Validate membership status + expiry
   * 4. Create attendance record
   */
  const handleQrScan = async (decodedText: string) => {
    if (!gymId) return;

    if (isDemoMode) {
      const demoMember = demoState.members.find((member) => member.status === 'ACTIVE');
      if (!demoMember) {
        showToast('No active demo members available.', 'error');
        return;
      }
      handleCheckIn(demoMember, 'QR_CODE');
      return;
    }

    const parsed = parseQrValue(decodedText);

    if (!parsed) {
      setNotification({
        type: 'error',
        message: 'Invalid QR Code',
        detail: 'This QR code is not recognized. Please use a valid member QR code.',
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Validate gym match (if gym is encoded in QR)
    if (parsed.gymId && parsed.gymId !== gymId) {
      setNotification({
        type: 'error',
        message: 'Invalid QR Code',
        detail: 'This QR code belongs to a different gym.',
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Look up member by qr_code_value
    const { data: foundMember, error } = await supabase
      .from('members')
      .select('id, full_name, status, expiry_date, plans(name)')
      .eq('gym_id', gymId)
      .eq('qr_code_value', decodedText)
      .single();

    if (error || !foundMember) {
      // Fallback: try by member ID directly (legacy support)
      const { data: fallbackMember } = await supabase
        .from('members')
        .select('id, full_name, status, expiry_date, plans(name)')
        .eq('gym_id', gymId)
        .eq('id', parsed.memberId)
        .single();

      if (!fallbackMember) {
        setNotification({
          type: 'error',
          message: 'Invalid QR Code',
          detail: 'QR code did not match any member records in this gym.',
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      handleCheckIn(fallbackMember, 'QR_CODE');
      return;
    }

    handleCheckIn(foundMember, 'QR_CODE');
  };

  const handleCheckIn = async (member: any, method: 'MANUAL' | 'QR_CODE' = 'MANUAL') => {
    if (!gymId) return;

    // Block inactive members
    if (member.status !== 'ACTIVE') {
      setNotification({
        type: 'error',
        message: 'Access Denied — Inactive Member',
        detail: `${member.full_name} is marked as ${member.status}. Reactivate before checking in.`,
      });
      setShowManualModal(false);
      setShowQrModal(false);
      setSearchTerm('');
      setTimeout(() => setNotification(null), 6000);
      return;
    }

    // Check membership expiry
    const daysLeft = getDaysLeft(member.expiry_date);
    if (daysLeft !== null && daysLeft < 0) {
      setNotification({
        type: 'error',
        message: 'Membership Expired',
        detail: `${member.full_name}'s membership has expired. Please renew to check in.`,
      });
      setShowManualModal(false);
      setShowQrModal(false);
      setSearchTerm('');
      setTimeout(() => setNotification(null), 6000);
      return;
    }

    // Prevent duplicate check-ins on the same day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isDemoMode) {
      const alreadyCheckedIn = demoState.attendance.some(
        (entry) => entry.member_id === member.id && entry.check_in_time >= today.toISOString()
      );
      if (alreadyCheckedIn) {
        setNotification({
          type: 'error',
          message: 'Already Checked In Today',
          detail: `${member.full_name} has already been checked in today.`,
        });
        setShowManualModal(false);
        setShowQrModal(false);
        setSearchTerm('');
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    }

    let existingCheckin = 0;
    if (!isDemoMode) {
      const { count } = await supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .eq('member_id', member.id)
        .gte('check_in_time', today.toISOString());
      existingCheckin = count || 0;
    }

    if (existingCheckin > 0) {
      setNotification({
        type: 'error',
        message: 'Already Checked In Today',
        detail: `${member.full_name} has already been checked in today.`,
      });
      setShowManualModal(false);
      setShowQrModal(false);
      setSearchTerm('');
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    setCheckingIn(true);
    try {
      if (isDemoMode) {
        addAttendance(member.id, method);
        const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setNotification({
          type: 'success',
          message: 'Access Granted',
          detail: `${member.full_name} checked in at ${checkInTime}. This is demo mode, so changes are not saved.`,
        });
        setShowManualModal(false);
        setShowQrModal(false);
        setSearchTerm('');
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      const { error } = await supabase.from('attendance').insert([{
        gym_id: gymId,
        member_id: member.id,
        method: method,
      }]);

      if (error) throw error;

      const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setNotification({
        type: 'success',
        message: 'Access Granted ✓',
        detail: `${member.full_name} — ${member.plans?.name || 'No Plan'} • Checked in at ${checkInTime} via ${method === 'QR_CODE' ? 'QR Scan' : 'Manual'}`,
      });

      setShowManualModal(false);
      setShowQrModal(false);
      setSearchTerm('');
      fetchData();
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Error checking in member:', error);

      if (error.message?.includes('MEMBER_ALREADY_SCANNED_RECENTLY')) {
        setNotification({
          type: 'error',
          message: 'Access Denied ❌',
          detail: `${member.full_name} has already scanned in within the last 4 hours.`,
        });
        setShowManualModal(false);
        setShowQrModal(false);
        setTimeout(() => setNotification(null), 5000);
      } else {
        showToast('Failed to check in member.', 'error');
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
            Attendance Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Log member check-ins and track daily attendance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (!canAccess('qrCheckin')) {
                openUpgradeModal('qrCheckin');
                return;
              }
              setShowQrModal(true);
            }}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
            Scan QR
            {!canAccess('qrCheckin') && (
              <span className="ml-1 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                PREMIUM
              </span>
            )}
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 bg-primary-default hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-default/30 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">person_add</span>
            Manual Check-In
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`flex items-center gap-3 p-4 rounded-xl transition-all ${notification.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'}`}>
          <span className={`material-symbols-outlined ${notification.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {notification.type === 'success' ? 'check_circle' : 'cancel'}
          </span>
          <div className="flex-1">
            <p className="font-bold text-sm">{notification.message}</p>
            <p className="text-xs opacity-80">{notification.detail}</p>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 text-xs font-medium mb-1">Today's Check-ins</p>
          <span className="text-2xl font-bold text-neutral-text dark:text-white">{todayCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 text-xs font-medium mb-1">Total Members</p>
          <span className="text-2xl font-bold text-neutral-text dark:text-white">{totalMembers}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 text-xs font-medium mb-1">Active Members</p>
          <span className="text-2xl font-bold text-emerald-500">{activeMembers}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 text-xs font-medium mb-1">Inactive Members</p>
          <span className="text-2xl font-bold text-rose-500">{Math.max(0, totalMembers - activeMembers)}</span>
        </div>
      </div>

      {/* Recent Check-ins Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2 text-neutral-text dark:text-white">
            <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
            Today's Check-in Log
          </h3>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" />
          </div>
      ) : recentCheckins.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon="qr_code_scanner"
              title="No attendance yet"
              description="Start check-ins to see today's front-desk activity here."
              actionLabel="Start check-ins"
              onAction={() => setShowManualModal(true)}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentCheckins.map((checkin) => (
              <div key={checkin.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="relative">
                  <div className="size-11 rounded-full bg-primary-default/10 flex items-center justify-center text-primary-default font-bold text-lg">
                    {checkin.members?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 size-5 ${checkin.members?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'} border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-[12px] text-white font-bold">{checkin.members?.status === 'ACTIVE' ? 'check' : 'close'}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-neutral-text dark:text-white">{checkin.members?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{checkin.members?.plans?.name || 'No Plan'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-400">{checkin.check_in_time ? formatTime(checkin.check_in_time) : '—'}</p>
                  <span className={`text-[10px] font-bold uppercase ${checkin.method === 'QR_CODE' ? 'text-blue-600' : checkin.members?.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {checkin.method === 'QR_CODE' ? '📷 QR' : checkin.method || 'MANUAL'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Check-In Modal */}
      {showManualModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setShowManualModal(false); setSearchTerm(''); }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Manual member check-in"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-neutral-text dark:text-white">Manual Check-In</h3>
              <button
                onClick={() => { setShowManualModal(false); setSearchTerm(''); }}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                autoFocus
                aria-label="Search members for check-in"
              />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {searchingMembers ? (
                <div className="p-12 flex justify-center">
                  <div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon="search_off"
                    title="No members found"
                    description={debouncedSearch ? "Try a different name or email." : "Type a name to search members."}
                  />
                </div>
              ) : (
                members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleCheckIn(member)}
                    disabled={checkingIn}
                    className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left disabled:opacity-50 group"
                  >
                    <div className="size-10 rounded-full bg-primary-default/10 flex items-center justify-center text-primary-default font-bold group-hover:scale-110 transition-transform">
                      {member.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-neutral-text dark:text-white">{member.full_name}</p>
                      <p className="text-xs text-slate-500">{member.phone || 'No phone'}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${member.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                      {member.status}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={() => { setShowManualModal(false); setSearchTerm(''); }}
                className="w-full py-3 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close manual modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="QR Code Scanner"
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="font-bold text-lg text-neutral-text dark:text-white">Scan Member QR</h3>
                <p className="text-xs text-slate-500">Hold the QR code inside the frame</p>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="size-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="bg-black relative aspect-[4/3] w-full flex items-center justify-center overflow-hidden">
              {isDemoMode ? (
                <div className="flex flex-col items-center gap-4 px-6 text-center text-white">
                  <span className="material-symbols-outlined text-6xl text-white/70">qr_code_scanner</span>
                  <p className="text-sm font-semibold">Simulate a member QR scan in demo mode.</p>
                  <button
                    onClick={() => handleQrScan('DEMO_SCAN')}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 transition-transform hover:scale-[1.02]"
                  >
                    Simulate Scan
                  </button>
                </div>
              ) : (
                <div id="qr-reader" className="w-full h-full border-none [&_video]:object-cover" />
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center">
              <button
                onClick={() => setShowQrModal(false)}
                className="py-2 px-6 rounded-lg font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel Scanning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
