import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function BookDemo() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', gymName: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#111821] text-slate-900 dark:text-slate-100 font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111821]/80 backdrop-blur-md px-6 md:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/main-logo.png" alt="LiftLegend Logo" className="h-10 object-contain" />
          </Link>
          <Link to="/" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1978e5] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Info */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1978e5]/10 border border-[#1978e5]/20 text-[#1978e5] text-xs font-bold uppercase tracking-wider w-fit">
              <span className="material-symbols-outlined text-sm">event</span>
              Free Demo Session
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              Book a <span className="text-[#1978e5]">Free Demo</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              See how LiftLegend can transform your gym management. Our team will walk you through every feature and answer all your questions.
            </p>
            <div className="space-y-4 mt-4">
              {[
                { icon: 'videocam', label: 'Live 1-on-1 demo call' },
                { icon: 'timer', label: '30 minutes, no commitment' },
                { icon: 'tune', label: 'Customized to your gym needs' },
                { icon: 'credit_card_off', label: 'No credit card required' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {sent ? (
              <div className="p-10 text-center">
                <div className="inline-flex items-center justify-center size-20 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 mb-6">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Demo Request Sent!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                  We'll contact you within 24 hours to schedule your personalized demo session.
                </p>
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1978e5] text-white font-bold rounded-xl hover:bg-blue-600 transition-all">
                  <span className="material-symbols-outlined text-sm">home</span>
                  Back to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Fill in your details</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">We'll reach out to schedule your demo.</p>

                <div className="space-y-2">
                  <label htmlFor="demo-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Name *</label>
                  <input id="demo-name" name="name" type="text" required value={form.name} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#1978e5]/20 focus:border-[#1978e5] outline-none transition-all"
                    placeholder="Mohammad Ali" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="demo-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input id="demo-email" name="email" type="email" required value={form.email} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#1978e5]/20 focus:border-[#1978e5] outline-none transition-all"
                    placeholder="you@email.com" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="demo-phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input id="demo-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#1978e5]/20 focus:border-[#1978e5] outline-none transition-all"
                    placeholder="+880 1700-000000" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="demo-gym" className="text-sm font-medium text-slate-700 dark:text-slate-300">Gym Name</label>
                  <input id="demo-gym" name="gymName" type="text" value={form.gymName} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#1978e5]/20 focus:border-[#1978e5] outline-none transition-all"
                    placeholder="Your Gym Name" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="demo-message" className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Message *</label>
                  <textarea id="demo-message" name="message" required rows={4} value={form.message} onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#1978e5]/20 focus:border-[#1978e5] outline-none transition-all resize-none"
                    placeholder="Tell us about your gym and what features interest you..." />
                </div>

                <button type="submit" disabled={sending}
                  className="w-full py-3.5 px-4 bg-[#1978e5] hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#1978e5]/20 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]">
                  {sending ? (
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">send</span>
                      Send & Book Demo
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
