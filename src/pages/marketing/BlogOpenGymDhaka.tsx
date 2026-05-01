import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';

export default function BlogOpenGymDhaka() {
  useEffect(() => {
    document.title = 'How to Open a Gym in Dhaka in 2026 — The Complete Guide | LiftLegend';
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', 'Step-by-step guide to opening a gym in Dhaka, Bangladesh in 2026. Learn the real costs, best locations, equipment list, and how to manage members from Day 1.');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-display">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/"><BrandLogo className="h-12 w-auto" variant="auto" /></Link>
          <div className="flex items-center gap-4">
            <Link to="/blog" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1978e5]">← All Articles</Link>
            <Link to="/login?signup=true&plan=ADVANCED" className="bg-[#1978e5] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-blue-600 transition-all">Start 30-Day Trial</Link>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-[#1978e5]/10 text-[#1978e5] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Gym Business</span>
          <span className="text-slate-400 text-sm">May 1, 2026 · 9 min read</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
          How to Open a Gym in Dhaka in 2026 — The Complete Guide
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
          Opening a gym in Dhaka has never been more profitable — or more competitive. Here is exactly what you need to do, how much it will cost, and what most new gym owners get wrong in the first 90 days.
        </p>

        {/* TOC */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-12">
          <p className="font-black text-sm uppercase tracking-widest text-slate-500 mb-4">Table of Contents</p>
          <ol className="space-y-2 text-[#1978e5] font-semibold text-sm">
            <li><a href="#market" className="hover:underline">1. Why Dhaka is a Gold Mine for Gyms Right Now</a></li>
            <li><a href="#location" className="hover:underline">2. Choosing the Right Location (The 3 Rules)</a></li>
            <li><a href="#costs" className="hover:underline">3. Real Startup Costs in BDT (No Sugarcoating)</a></li>
            <li><a href="#equipment" className="hover:underline">4. Your Minimum Viable Equipment List</a></li>
            <li><a href="#members" className="hover:underline">5. Getting Your First 50 Members</a></li>
            <li><a href="#management" className="hover:underline">6. Managing Operations from Day 1</a></li>
          </ol>
        </div>

        {/* Section 1 */}
        <section id="market" className="mb-12">
          <h2 className="text-3xl font-black mb-4">1. Why Dhaka is a Gold Mine for Gyms Right Now</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Bangladesh's fitness industry is at an inflection point. A growing urban middle class, rising health consciousness after the pandemic, and an explosion of social media fitness culture (YouTube, Instagram Reels) have created massive demand for quality gyms — especially in Dhaka.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            The opportunity is real: Most gyms in areas like Mirpur, Mohammadpur, and Uttara are still operating on notebooks and WhatsApp groups. The ones that look professional — with proper member cards, automated SMS reminders, and digital attendance — win the premium market almost by default.
          </p>
          <div className="bg-[#1978e5]/5 border-l-4 border-[#1978e5] rounded-r-xl p-5 my-6">
            <p className="font-bold text-[#1978e5] mb-1">Market Insight</p>
            <p className="text-slate-700 dark:text-slate-300 text-sm">Dhaka has an estimated 3,000+ independent gyms and fitness centers, with less than 5% using any form of dedicated management software. The market is wide open.</p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="location" className="mb-12">
          <h2 className="text-3xl font-black mb-4">2. Choosing the Right Location (The 3 Rules)</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Location is your biggest lever for success. A mediocre gym in a great location will outperform a great gym in a bad location every single time. Follow these three rules:
          </p>
          <div className="space-y-4 my-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="font-bold mb-1">Rule 1: The 5-Minute Walk Test 🚶</p>
              <p className="text-slate-500 text-sm">Your target member must be able to walk from their home, office, or university in under 5 minutes. Residential areas in Dhanmondi, Banani, Uttara, and Mirpur are ideal. If they need a CNG ride, your retention will suffer.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="font-bold mb-1">Rule 2: Ground Floor or First Floor Only 🏢</p>
              <p className="text-slate-500 text-sm">Every floor above the ground level you go, you lose 20-30% of potential walk-in traffic. If you must go higher, the building must have a functioning lift. Stairs are a conversion killer in Dhaka's heat.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="font-bold mb-1">Rule 3: Scout Your Competition Within 500m 🗺️</p>
              <p className="text-slate-500 text-sm">Open Google Maps and count gyms within a 500-metre radius. If there are 3 or more, you need a clear differentiator (e.g., women-only section, 24-hour access, premium equipment). If there are zero, validate that there is actual population density first.</p>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Top Dhaka Areas (2026 Ranking):</strong> Dhanmondi &gt; Banani &gt; Uttara &gt; Mirpur 10/11 &gt; Mohammadpur &gt; Bashundhara R/A. Each area has a different income segment, so price your membership accordingly.
          </p>
        </section>

        {/* Section 3 */}
        <section id="costs" className="mb-12">
          <h2 className="text-3xl font-black mb-4">3. Real Startup Costs in BDT (No Sugarcoating)</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Most people underestimate the startup cost by 40%. Here is an honest breakdown for a mid-sized gym (1,500–2,500 sq ft) in a mid-tier Dhaka area:
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  <th className="text-left p-4 font-bold">Cost Item</th>
                  <th className="text-right p-4 font-bold">Estimated Cost (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {[
                  ['Advance Rent (3–6 months)', '1,50,000 – 4,00,000'],
                  ['Interior Fit-Out & AC', '2,00,000 – 5,00,000'],
                  ['Cardio Equipment (Treadmills, Bikes)', '1,50,000 – 4,00,000'],
                  ['Free Weights & Racks', '80,000 – 2,00,000'],
                  ['Mirrors & Flooring (Rubber Mats)', '60,000 – 1,50,000'],
                  ['Changing Rooms & Washroom Fit-Out', '50,000 – 1,50,000'],
                  ['Reception Desk & Furniture', '20,000 – 60,000'],
                  ['CCTV & Security', '20,000 – 50,000'],
                  ['Gym Management Software (LiftLegend)', '1,000 – 2,000/mo'],
                  ['Marketing Budget (Month 1)', '20,000 – 50,000'],
                ].map(([item, cost]) => (
                  <tr key={item}>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{item}</td>
                    <td className="p-4 text-right font-semibold">৳ {cost}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-slate-700">
                  <td className="p-4 font-black">TOTAL ESTIMATE</td>
                  <td className="p-4 text-right font-black text-[#1978e5]">৳ 7,30,000 – 18,10,000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <p className="font-bold text-amber-800 dark:text-amber-400 mb-1">⚠️ Hidden Cost Warning</p>
            <p className="text-amber-700 dark:text-amber-300 text-sm">Most first-time gym owners forget generator/IPS costs (BDT 80,000–1,50,000). In Dhaka, without backup power, you will lose members fast. Budget for it from Day 1.</p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="equipment" className="mb-12">
          <h2 className="text-3xl font-black mb-4">4. Your Minimum Viable Equipment List</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Do not buy everything at once. Start lean, get your first 50 members, then reinvest profits into new equipment. Here is the absolute minimum to open professionally:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            {[
              { category: 'Cardio', items: ['2x Treadmills', '2x Stationary Bikes', '1x Elliptical'] },
              { category: 'Free Weights', items: ['Full Dumbbell Set (5kg–40kg)', '2x Barbells with Weight Plates', 'EZ Curl Bar'] },
              { category: 'Strength', items: ['1x Power Rack / Squat Rack', '1x Adjustable Bench', '1x Cable Crossover Machine'] },
              { category: 'Accessories', items: ['Resistance Bands', 'Yoga Mats (5–10)', 'Pull-up Bar & Dip Station'] },
            ].map(section => (
              <div key={section.category} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <p className="font-bold mb-3 text-[#1978e5]">{section.category}</p>
                <ul className="space-y-1">
                  {section.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-emerald-500 text-sm">check</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 */}
        <section id="members" className="mb-12">
          <h2 className="text-3xl font-black mb-4">5. Getting Your First 50 Members</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Your first 50 members are the hardest — and most important. Here is the exact playbook used by top-performing gyms in Dhaka:
          </p>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1978e5] text-white flex items-center justify-center font-black text-sm">1</div>
              <div>
                <p className="font-bold mb-1">Founding Member Offer (1 week before opening)</p>
                <p className="text-slate-500 text-sm">Offer the first 30 members a "Founding Member" rate — e.g., ৳ 800/month locked in forever (vs. your standard ৳ 1,500). Create urgency. Post in local Facebook groups.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1978e5] text-white flex items-center justify-center font-black text-sm">2</div>
              <div>
                <p className="font-bold mb-1">Partner with Local Influencers (1K–30K followers)</p>
                <p className="text-slate-500 text-sm">Give 3–5 local fitness trainers or lifestyle micro-influencers a free 3-month membership in exchange for honest Reels. Real testimonials from local faces convert 3x better than paid ads in BD.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1978e5] text-white flex items-center justify-center font-black text-sm">3</div>
              <div>
                <p className="font-bold mb-1">Refer-a-Friend Campaign</p>
                <p className="text-slate-500 text-sm">Offer your first members one free week for every friend they refer who pays. Word-of-mouth in Dhaka's mahalla culture is still your highest-ROI marketing channel.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1978e5] text-white flex items-center justify-center font-black text-sm">4</div>
              <div>
                <p className="font-bold mb-1">Meta Lead Gen Ads at BDT 300/day</p>
                <p className="text-slate-500 text-sm">Target within a 2km radius of your gym. Use a short Reel showing your clean equipment and the offer. The hook: "চলুন, প্রথম মাসটা free-তে try করি।" (Let's try the first month free.)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section id="management" className="mb-12">
          <h2 className="text-3xl font-black mb-4">6. Managing Operations from Day 1</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            The biggest mistake new gym owners make is managing members in a notebook or WhatsApp group. You will lose money — guaranteed. Here is why digital management from Day 1 is critical:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex gap-3"><span className="material-symbols-outlined text-red-400">cancel</span><span className="text-slate-600 dark:text-slate-400"><strong>With a Khata:</strong> You forget who expired 3 days ago. 5–10% of members work out for free every month.</span></li>
            <li className="flex gap-3"><span className="material-symbols-outlined text-red-400">cancel</span><span className="text-slate-600 dark:text-slate-400"><strong>With WhatsApp:</strong> bKash payments get mixed up. You can't tell if someone paid for 1 month or 3.</span></li>
            <li className="flex gap-3"><span className="material-symbols-outlined text-emerald-500">check_circle</span><span className="text-slate-600 dark:text-slate-400"><strong>With LiftLegend:</strong> Every member has a digital file. Automated alerts fire 3 days before expiry. bKash transactions are logged with IDs. You see today's revenue in one tap.</span></li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Software like LiftLegend starts at under ৳ 1,500/month — less than one member's fee. The ROI from stopping payment leakage alone pays for it in Week 1.
          </p>
        </section>

        {/* CTA */}
        <div className="bg-[#1978e5] rounded-2xl p-10 text-center text-white mt-16">
          <h2 className="text-3xl font-black mb-3">Ready to open your gym the right way?</h2>
          <p className="text-blue-100 mb-8 max-w-md mx-auto">Start with the management system that grows with you. 30-day free trial. No credit card. No hardware required.</p>
          <Link to="/login?signup=true&plan=ADVANCED" className="inline-block bg-white text-[#1978e5] px-10 py-4 rounded-full text-lg font-black hover:scale-105 transition-transform">
            Start Free Trial
          </Link>
        </div>
      </article>
    </div>
  );
}
