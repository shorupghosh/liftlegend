import React from 'react';

export const LandingFeatures: React.FC = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto" id="features">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-[#1978e5] font-bold uppercase tracking-widest text-sm mb-4 block">Core Capabilities</span>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">Built for daily gym operations</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">Record renewals, track dues, and see today's collections from one dashboard designed for gym owners.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-8 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#1978e5] transition-all group">
          <div className="size-14 rounded-xl bg-[#1978e5]/10 flex items-center justify-center text-[#1978e5] mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">badge</span>
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Membership Management</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Easily manage all your members, track active subscriptions, and monitor renewals without spreadsheets or notebooks.</p>
        </div>
        <div className="p-8 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#1978e5] transition-all group">
          <div className="size-14 rounded-xl bg-[#1978e5]/10 flex items-center justify-center text-[#1978e5] mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">QR Attendance</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Speed up gym entry with secure QR check-ins. Members scan and enter instantly, reducing front desk workload.</p>
        </div>
        <div className="p-8 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#1978e5] transition-all group">
          <div className="size-14 rounded-xl bg-[#1978e5]/10 flex items-center justify-center text-[#1978e5] mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">monitoring</span>
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Real-time Analytics</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Track gym performance with powerful dashboards showing active members, attendance trends, and revenue insights.</p>
        </div>
        <div className="p-8 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#1978e5] transition-all group">
          <div className="size-14 rounded-xl bg-[#1978e5]/10 flex items-center justify-center text-[#1978e5] mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">forum</span>
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Communication Center</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Track renewal reminders and follow-ups. SMS and WhatsApp delivery channels are being rolled out in phases.</p>
        </div>
      </div>
    </section>
  );
};
