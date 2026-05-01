import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import { useDemoMode } from '../hooks/useDemoMode';
import { useDemoData } from '../contexts/DemoDataContext';
import { usePlan } from '../contexts/PlanContext';
import { PLAN_DISPLAY, normalizeTier } from '../lib/planConfig';
import { StatusBadge, toneFromStatus } from '../components/ui/StatusBadge';

export default function GymSettings() {
  const { gymId, user } = useAuth();
  const { showToast } = useToast();
  const { isDemoMode } = useDemoMode();
  const { canAccess, openUpgradeModal } = usePlan();
  const { state: demoState } = useDemoData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [gym, setGym] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', contact_phone: '', address: '', logo_url: '' });

  useEffect(() => {
    if (!gymId && !isDemoMode) return;
    fetchGym();
  }, [gymId, isDemoMode]);

  const fetchGym = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        const demoGym = {
          id: 'demo-gym-id',
          name: demoState.gymName,
          contact_phone: '+880 1712-345678',
          branding: { address: 'Banani, Dhaka', logo_url: '' },
          subscription_tier: 'PREMIUM',
          status: 'ACTIVE',
          next_billing_date: new Date(Date.now() + (23 * 24 * 60 * 60 * 1000)).toISOString(),
        };
        setGym(demoGym);
        setFormData({
          name: demoGym.name,
          contact_phone: demoGym.contact_phone,
          address: demoGym.branding.address,
          logo_url: demoGym.branding.logo_url,
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('gyms')
        .select('id, name, contact_phone, branding, subscription_tier, status, next_billing_date')
        .eq('id', gymId)
        .single();
      if (error) throw error;
      setGym(data);
      setFormData({
        name: data.name || '',
        contact_phone: data.contact_phone || '',
        address: data.branding?.address || '',
        logo_url: data.branding?.logo_url || '',
      });
    } catch (error) {
      console.error('Error fetching gym:', error);
      showToast('Failed to load settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (isDemoMode) {
      showToast('Settings are read-only in demo mode.', 'info');
      return;
    }
    if (!gymId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('gyms').update({
        name: formData.name,
        contact_phone: formData.contact_phone,
        branding: { ...(gym?.branding || {}), address: formData.address, logo_url: formData.logo_url },
      }).eq('id', gymId);
      if (error) throw error;

      showToast('Settings saved successfully!', 'success');
      fetchGym();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showToast(error.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (isDemoMode) {
      showToast('Password reset is disabled in demo mode.', 'info');
      return;
    }
    if (!user?.email) return;
    setSendingReset(true);
    try {
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${appUrl}/login`,
      });
      if (error) throw error;
      showToast('Password reset link sent to your email!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to send reset link.', 'error');
    } finally {
      setSendingReset(false);
    }
  };

  const normalizedTier = normalizeTier(gym?.subscription_tier || 'PREMIUM');
  const planName = PLAN_DISPLAY[normalizedTier]?.name || 'Premium';

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="size-10 border-4 border-primary-default border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your gym profile, subscription, and account settings.</p>
      </div>

      <div className="max-w-5xl space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Current Plan</p>
            <p className="mt-2 text-lg font-black text-neutral-text dark:text-white">{planName}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Gym Status</p>
            <div className="mt-2">
              <StatusBadge label={gym?.status || 'UNKNOWN'} tone={toneFromStatus(gym?.status)} />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Support</p>
            <p className="mt-2 text-sm font-semibold text-neutral-text dark:text-white">WhatsApp and phone onboarding available</p>
          </div>
        </section>

        {/* Gym Profile */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-neutral-text dark:text-white">
            <span className="material-symbols-outlined text-primary-default">domain</span> Gym Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <div className="flex items-center gap-2">
                <label htmlFor="gym-logo" className="text-sm font-medium text-slate-700 dark:text-slate-300">Logo URL (Optional)</label>
                {!canAccess('whiteLabel') && (
                  <button onClick={() => openUpgradeModal('whiteLabel')} className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-amber-100 transition-colors">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    PREMIUM
                  </button>
                )}
              </div>
              <div className="flex gap-4 items-center">
                <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Gym Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-slate-300">image</span>
                  )}
                </div>
                <input id="gym-logo" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  disabled={!canAccess('whiteLabel')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-4 py-3 text-sm focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900 cursor-not-allowed"
                  placeholder="https://example.com/logo.png" type="url" />


              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <label htmlFor="gym-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Gym Name</label>
                {!canAccess('whiteLabel') && (
                  <button onClick={() => openUpgradeModal('whiteLabel')} className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-amber-100 transition-colors">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    PREMIUM
                  </button>
                )}
              </div>
              <input id="gym-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!canAccess('whiteLabel')}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-4 py-3 text-sm focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 outline-none transition-all disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900 cursor-not-allowed"
                placeholder="Your Gym Name" type="text" />


            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gym-phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
              <input id="gym-phone" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-4 py-3 text-sm focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 outline-none transition-all"
                placeholder="+880 1711-000000" type="tel" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="gym-address" className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
              <input id="gym-address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 px-4 py-3 text-sm focus:border-primary-default focus:ring-2 focus:ring-primary-default/20 outline-none transition-all"
                placeholder="Dhaka, Bangladesh" type="text" />
            </div>
          </div>
        </section>

        {/* Account & Security */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-neutral-text dark:text-white">
            <span className="material-symbols-outlined text-primary-default">lock</span> Security
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <span className="material-symbols-outlined">key</span>
              </div>
              <div>
                <p className="font-bold text-neutral-text dark:text-white">Account Password</p>
                <p className="text-slate-500 text-sm">Send a password reset link to {user?.email || 'your email'}</p>
              </div>
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={sendingReset}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {sendingReset ? 'Sending...' : 'Reset Password'}
            </button>
          </div>
        </section>

        {/* Subscription Info */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-text dark:text-white">
              <span className="material-symbols-outlined text-primary-default">credit_card</span> Subscription
            </h2>
            <StatusBadge label={gym?.status || 'UNKNOWN'} tone={toneFromStatus(gym?.status)} />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary-default/20 flex items-center justify-center text-primary-default">
                <span className="material-symbols-outlined">workspace_premium</span>
              </div>
              <div>
                <p className="font-bold text-neutral-text dark:text-white">{planName} Plan</p>
                <p className="text-slate-500 text-sm">
                  {gym?.next_billing_date ? `Next billing: ${new Date(gym.next_billing_date).toLocaleDateString()}` : 'No billing date set'}
                </p>
              </div>
            </div>
            <a href="/admin/settings/subscription" className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"> Manage </a>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-primary-default text-white font-bold shadow-lg shadow-primary-default/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
