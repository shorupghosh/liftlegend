import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BrandLogo } from '../components/BrandLogo';

export default function LeaveReview() {
  const [form, setForm] = useState({
    gym_name: '',
    reviewer_name: '',
    rating: 5,
    content: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const { error } = await supabase
        .from('platform_reviews')
        .insert([form]);

      if (error) throw error;
      setStatus('success');
    } catch (err) {
      console.error('Error submitting review:', err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <div className="inline-flex items-center justify-center size-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full mb-6">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Thank You!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Your review has been successfully submitted. We deeply appreciate your feedback and support for LiftLegend!
          </p>
          <Link to="/" className="inline-block w-full bg-[#1978e5] text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full">
        <div className="flex justify-center mb-8">
          <BrandLogo className="h-12 w-auto" variant="auto" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#1978e5] to-blue-600 p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
             
             <h1 className="text-2xl font-black text-white relative z-10">Rate Your Experience</h1>
             <p className="text-blue-100 text-sm mt-2 relative z-10 max-w-sm mx-auto">
               Tell us how LiftLegend has helped you manage your fitness business.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {status === 'error' && (
              <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm font-bold flex gap-2 items-center">
                <span className="material-symbols-outlined">error</span>
                Failed to submit review. Please try again.
              </div>
            )}

            {/* Rating Stars */}
            <div className="flex flex-col items-center gap-2 pb-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setForm({ ...form, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <span 
                      className={`material-symbols-outlined text-4xl ${
                        star <= (hoverRating || form.rating) 
                          ? 'text-[#f97316]' 
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                      style={{ fontVariationSettings: star <= (hoverRating || form.rating) ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gym Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Iron Fitness Center"
                  value={form.gym_name}
                  onChange={(e) => setForm({ ...form, gym_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1978e5]/20 focus:border-[#1978e5] text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Your Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Hasan Mahmud"
                  value={form.reviewer_name}
                  onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1978e5]/20 focus:border-[#1978e5] text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Review *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How has LiftLegend helped your business?"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#1978e5]/20 focus:border-[#1978e5] text-slate-900 dark:text-white outline-none transition-all resize-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-4 mt-4 bg-[#1978e5] text-white font-black rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-[#1978e5]/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {status === 'submitting' ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Submit Review <span className="material-symbols-outlined text-sm">send</span></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
