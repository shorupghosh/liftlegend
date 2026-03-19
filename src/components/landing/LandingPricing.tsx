import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPricing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/30 px-6" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-600 dark:text-slate-400">Choose the perfect plan for your fitness community. No hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col hover:shadow-2xl transition-all">
            <div className="mb-8">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Starter</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white uppercase">BDT 1,000</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-slate-500 mt-4 italic">Perfect for small gyms starting digital management.</p>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Up to 250 Members
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Manual Attendance
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Basic Analytics
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Member management
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Membership plans
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Payment tracking
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Membership expiry tracking
              </li>
            </ul>
            <button onClick={() => navigate('/login?signup=true')} className="w-full py-4 rounded-full font-bold border border-slate-200 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Buy Now</button>
          </div>
          <div className="p-10 bg-white dark:bg-slate-800 rounded-lg border-2 border-[#1978e5] flex flex-col relative shadow-2xl scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1978e5] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Most Popular</div>
            <div className="mb-8">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Power Plus</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white uppercase">BDT 1,500</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-slate-500 mt-4 italic">Designed for growing gyms with active members and trainers.</p>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Up to 1200 members
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                3 staff accounts
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Attendance tracking
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Advanced analytics dashboard
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Member activity tracking
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Export reports
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Priority support
              </li>
            </ul>
            <button onClick={() => navigate('/login?signup=true')} className="w-full py-4 rounded-full font-bold bg-[#1978e5] text-white hover:bg-blue-600 transition-colors shadow-lg shadow-[#1978e5]/30">Start 30-Day Free Trial</button>
          </div>
          <div className="p-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col hover:shadow-2xl transition-all">
            <div className="mb-8">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Elite Legend</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white uppercase">BDT 2,000</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-sm text-slate-500 mt-4 italic">Built for high-volume gyms and professional fitness centers.</p>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Unlimited Members & Staff
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-[#1978e5]">
                <span className="material-symbols-outlined">check_circle</span>
                Everything in Power Plus
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                QR Code Check-in System
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Full Staff Management System
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Bulk SMS & WhatsApp Marketing
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Dedicated Success Manager
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                Custom API & Integrations
              </li>
            </ul>
            <button onClick={() => navigate('/login?signup=true')} className="w-full py-4 rounded-full font-bold border border-slate-200 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Buy Now</button>
          </div>
        </div>
      </div>
    </section>
  );
};
