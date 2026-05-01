import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';

export default function CompareMySoftHeaven() {
  useEffect(() => {
    document.title = 'LiftLegend vs MySoftHeaven | Best Gym Software in Bangladesh';
    
    // Add meta description for SEO
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Looking for an alternative to MySoftHeaven for your gym? Discover why LiftLegend is the #1 mobile-first, transparently priced gym management software in Bangladesh.');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-display">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/"><BrandLogo className="h-12 w-auto" variant="auto" /></Link>
          <Link to="/login?signup=true&plan=ADVANCED" className="bg-[#1978e5] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-blue-600 transition-all">Start 30-Day Trial</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6">LiftLegend vs MySoftHeaven</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Why modern gym owners in Bangladesh are switching from corporate ERP software to a dedicated, mobile-first gym platform.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900">
                <th className="p-6 text-lg font-bold w-1/3">Feature</th>
                <th className="p-6 text-lg font-black text-[#1978e5] w-1/3 border-l border-slate-200 dark:border-slate-700">LiftLegend</th>
                <th className="p-6 text-lg font-bold text-slate-500 w-1/3 border-l border-slate-200 dark:border-slate-700">MySoftHeaven</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="p-6 font-semibold">Pricing Transparency</td>
                <td className="p-6 border-l border-slate-200 dark:border-slate-700 bg-[#1978e5]/5 font-bold text-emerald-600">Upfront BDT pricing on website</td>
                <td className="p-6 border-l border-slate-200 dark:border-slate-700 text-red-500">"Inbox for price"</td>
              </tr>
              <tr>
                <td className="p-6 font-semibold">Built For</td>
                <td className="p-6 border-l border-slate-200 dark:border-slate-700 bg-[#1978e5]/5">100% focused on Gyms & Fitness</td>
                <td className="p-6 border-l border-slate-200 dark:border-slate-700 text-slate-500">Clinics, Super Shops, and Gyms</td>
              </tr>
              <tr>
                <td className="p-6 font-semibold">Mobile Experience</td>
                <td className="p-6 border-l border-slate-200 dark:border-slate-700 bg-[#1978e5]/5">Trainers check-in members via phone</td>
                <td className="p-6 border-l border-slate-200 dark:border-slate-700 text-slate-500">Clunky desktop-first ERP</td>
              </tr>
              <tr>
                <td className="p-6 font-semibold">Hardware Needed</td>
                <td className="p-6 border-l border-slate-200 dark:border-slate-700 bg-[#1978e5]/5 font-bold text-emerald-600">Zero Hardware (QR code scanning)</td>
                <td className="p-6 border-l border-slate-200 dark:border-slate-700 text-red-500">Expensive setup required</td>
              </tr>
              <tr>
                <td className="p-6 font-semibold">Free Trial</td>
                <td className="p-6 border-l border-slate-200 dark:border-slate-700 bg-[#1978e5]/5 font-bold text-emerald-600">Instant 30-Day Free Trial</td>
                <td className="p-6 border-l border-slate-200 dark:border-slate-700 text-red-500">Requires a sales call</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-black mb-6">Stop using software built for grocery stores.</h2>
          <Link to="/login?signup=true&plan=ADVANCED" className="inline-block bg-[#1978e5] text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:scale-105 transition-transform">
            Try LiftLegend Free for 30 Days
          </Link>
        </div>
      </main>
    </div>
  );
}
