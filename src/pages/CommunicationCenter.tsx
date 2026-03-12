import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

export default function CommunicationCenter() {
  const { gymId } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', method: 'EMAIL' });

  const fetchNotifications = useCallback(async () => {
    if (!gymId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, created_at, is_read')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useRealtimeSubscription({ table: 'notifications', gymId, onChange: fetchNotifications });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;
    setSending(true);
    try {
      const { error } = await supabase.from('notifications').insert([{
        gym_id: gymId,
        title: formData.title,
        message: formData.message,
        is_read: false,
      }]);
      if (error) throw error;
      setFormData({ title: '', message: '', method: 'EMAIL' });
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
          Notification Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Broadcast updates, alerts, and personalized messages to your athlete community.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Compose */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-text dark:text-white">
              <span className="material-symbols-outlined text-primary-default">edit_note</span>
              Compose Message
            </h2>
          </div>
          <form onSubmit={handleSend} className="p-5 space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Delivery Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({ ...formData, method: 'EMAIL' })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 font-semibold transition-all text-sm ${formData.method === 'EMAIL' ? 'border-primary-default bg-primary-default/5 text-primary-default' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}>
                    <span className="material-symbols-outlined text-lg">mail</span> Email
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, method: 'SMS' })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 font-semibold transition-all text-sm ${formData.method === 'SMS' ? 'border-primary-default bg-primary-default/5 text-primary-default' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}>
                    <span className="material-symbols-outlined text-lg">sms</span> SMS
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-11 px-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                  placeholder="e.g. Holiday schedule update" type="text" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message Content</label>
                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required rows={5}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all resize-none"
                  placeholder="Write your announcement here..." />
              </div>
            </div>
            <button type="submit" disabled={sending}
              className="w-full bg-accent-default hover:brightness-110 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
              {sending ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <><span className="material-symbols-outlined">send</span> Send Now</>
              )}
            </button>
          </form>
        </section>

        {/* History */}
        <section className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-text dark:text-white">
            <span className="material-symbols-outlined text-primary-default">history</span>
            Notification History
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="size-8 border-4 border-primary-default border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-2">notifications_off</span>
              <p className="font-medium">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="size-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-neutral-text dark:text-white truncate">{notif.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
