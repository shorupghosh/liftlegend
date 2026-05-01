import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';

export default function FeatureAttendance() {
  useEffect(() => {
    document.title = 'QR Code Gym Attendance in Bangladesh | LiftLegend';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Ditch the expensive fingerprint scanners. Track gym attendance instantly with 100% mobile QR code scanning built for Bangladeshi gyms.');
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
          <h1 className="text-4xl md:text-6xl font-black mt-2 mb-6">QR Code Gym Attendance in Bangladesh</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            100% Mobile Ready. Zero Hardware Required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 md:order-1 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="material-symbols-outlined text-8xl text-[#1978e5] mb-4">qr_code_scanner</span>
            <h3 className="text-2xl font-black mb-2">Scan to Enter</h3>
            <p className="text-slate-500">Trainers just use their smartphones.</p>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-4">Why buy a 15,000 BDT turnstile?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Fingerprint scanners break constantly and slow down the entrance. With LiftLegend, you can set up secure access control in 5 minutes using any smartphone.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">smartphone</span>
                <strong>Scan with any phone:</strong> Works perfectly on cheap Androids.
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">block</span>
                <strong>Auto-block unpaid members:</strong> Scanner turns red if they owe money.
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">speed</span>
                <strong>Zero Setup Time:</strong> No waiting for IT technicians.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
