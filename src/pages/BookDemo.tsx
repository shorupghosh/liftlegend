import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';

export default function BookDemo() {
  useEffect(() => {
    document.title = 'Book a Demo | LiftLegend Gym Management Software Bangladesh';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Schedule a 30-minute personalized demo of LiftLegend, the top gym management software in Bangladesh. See features like QR attendance and payment tracking.');
  }, []);

  // You can replace this URL with your actual Calendly, Cal.com, or Google Calendar booking link.
  // We use Calendly here because it automatically handles email notifications to both you and the customer.
  const CALENDAR_URL = "https://calendly.com/liftlegend2/30min"; 

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#111821] text-slate-900 dark:text-slate-100 font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111821]/80 backdrop-blur-md px-6 md:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo className="h-14 sm:h-16 w-auto object-contain mx-auto" variant="auto" />
          </Link>
          <Link to="/" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1978e5] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-16 items-start">
          {/* Left: Info */}
          <div className="flex flex-col gap-6 lg:col-span-2 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1978e5]/10 border border-[#1978e5]/20 text-[#1978e5] text-xs font-bold uppercase tracking-wider w-fit">
              <span className="material-symbols-outlined text-sm">event</span>
              30-Minute Demo Session
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              Book a <span className="text-[#1978e5]">30-Minute Demo</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Select a date and time from the calendar to schedule a live walkthrough. Once booked, you'll instantly receive a confirmation email with the meeting link.
            </p>
            <div className="space-y-4 mt-4 hidden lg:block">
              {[
                { icon: 'videocam', label: 'Live 1-on-1 demo call' },
                { icon: 'event_available', label: 'Instant calendar confirmation' },
                { icon: 'notifications_active', label: 'Automated email reminders' },
                { icon: 'tune', label: 'Customized to your gym needs' },
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

          {/* Right: Calendar Embed */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[700px]">
            {/* Loading placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 z-0">
                <div className="size-10 border-4 border-[#1978e5]/30 border-t-[#1978e5] rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500">Loading Calendar...</p>
            </div>
            
            {/* Calendar Iframe */}
            <iframe 
              src={CALENDAR_URL}
              width="100%" 
              height="100%" 
              frameBorder="0" 
              title="Schedule a Demo"
              className="relative z-10 w-full h-[700px] sm:h-[750px] bg-transparent"
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}
