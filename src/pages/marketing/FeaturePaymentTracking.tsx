import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';

export default function FeaturePaymentTracking() {
  useEffect(() => {
    document.title = 'Gym Payment Tracking Software in Bangladesh | LiftLegend';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Stop losing money on expired gym memberships. Easily track bKash, cash, and partial payments with LiftLegend gym payment tracking software.');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-display">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/"><BrandLogo className="h-12 w-auto" variant="auto" /></Link>
          <Link to="/login?signup=true&plan=ADVANCED" className="bg-[#1978e5] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-blue-600 transition-all">Start 30-Day Trial</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <span className="text-[#1978e5] font-bold tracking-wider uppercase text-sm">Feature Deep Dive</span>
          <h1 className="text-4xl md:text-6xl font-black mt-2 mb-6">Gym Payment Tracking Built for Bangladesh</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Khata and Excel sheets leak revenue. Track bKash, cash, and partial payments instantly without any math.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-4">Never miss an expired membership again.</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              When you manage 100+ members in a notebook, 10% of them will slip through the cracks and work out for free. LiftLegend automatically calculates expiration dates and flags unpaid dues.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <strong>Track bKash easily:</strong> Log bKash transaction IDs directly.
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <strong>Partial Payments:</strong> Handle split payments seamlessly.
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <strong>Automated Alerts:</strong> See who is due today at a glance.
              </li>
            </ul>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
              <p className="text-sm text-slate-500">Today's Collections</p>
              <h3 className="text-3xl font-black">৳ 18,500</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span>bKash (3 TXNs)</span>
                <span className="font-bold">৳ 6,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span>Cash (5 TXNs)</span>
                <span className="font-bold">৳ 12,500</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
