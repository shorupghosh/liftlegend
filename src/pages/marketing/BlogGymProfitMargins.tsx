import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';

export default function BlogGymProfitMargins() {
  useEffect(() => {
    document.title = 'How to Calculate Gym Profit Margins in Bangladesh (2026) | LiftLegend';
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', 'Learn how to calculate your gym\'s true profit margin in Bangladesh. Includes real BDT cost breakdowns, churn rate formulas, and tips to increase net profit by 30%.');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-display">
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
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Finance & Growth</span>
          <span className="text-slate-400 text-sm">April 25, 2026 · 8 min read</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
          How to Calculate Gym Profit Margins in Bangladesh (2026)
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
          Most gym owners in Dhaka think they are profitable. Then they do the real math and realize they are barely breaking even. This guide shows you exactly how to calculate your true profit — and three levers you can pull to increase it by 30% this month.
        </p>

        {/* TOC */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-12">
          <p className="font-black text-sm uppercase tracking-widest text-slate-500 mb-4">Table of Contents</p>
          <ol className="space-y-2 text-[#1978e5] font-semibold text-sm">
            <li><a href="#revenue" className="hover:underline">1. How to Calculate Your Monthly Revenue (The Right Way)</a></li>
            <li><a href="#costs" className="hover:underline">2. Your Real Monthly Costs (Fixed + Variable)</a></li>
            <li><a href="#formula" className="hover:underline">3. The Gym Profit Margin Formula</a></li>
            <li><a href="#churn" className="hover:underline">4. The Hidden Killer: Churn Rate</a></li>
            <li><a href="#levers" className="hover:underline">5. 3 Levers to Increase Profit by 30%</a></li>
          </ol>
        </div>

        {/* Section 1 */}
        <section id="revenue" className="mb-12">
          <h2 className="text-3xl font-black mb-4">1. How to Calculate Your Monthly Revenue (The Right Way)</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Most gym owners count cash collected this month as revenue. This is wrong, and it leads to bad decisions. Your real revenue is the amount <em>earned</em> this month, not just collected.
          </p>
          <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 font-mono text-sm mb-6">
            <p className="text-emerald-400 mb-2">// Correct Revenue Formula</p>
            <p className="text-white">Active Members (this month) × Average Monthly Fee</p>
            <p className="text-slate-500 mt-2">Example: 80 members × ৳ 1,400 avg = <span className="text-emerald-400 font-bold">৳ 1,12,000</span></p>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            If you collected ৳ 1,30,000 in cash this month but ৳ 20,000 was for 3-month advance payments, your <em>earned</em> revenue this month is only ৳ 1,10,000. The rest is a liability — you owe those members 2 more months of service.
          </p>
          <div className="bg-[#1978e5]/5 border-l-4 border-[#1978e5] rounded-r-xl p-5 my-6">
            <p className="font-bold text-[#1978e5] mb-1">💡 Pro Tip</p>
            <p className="text-slate-700 dark:text-slate-300 text-sm">LiftLegend automatically calculates "Monthly Recurring Revenue (MRR)" for you, separating advance payments from current-month earnings. Stop doing this math in a notebook.</p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="costs" className="mb-12">
          <h2 className="text-3xl font-black mb-4">2. Your Real Monthly Costs (Fixed + Variable)</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Here is a realistic monthly operating cost breakdown for a standard 80–120 member gym in Dhaka's mid-tier areas:
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  <th className="text-left p-4 font-bold">Cost Item</th>
                  <th className="text-right p-4 font-bold">Monthly (BDT)</th>
                  <th className="text-right p-4 font-bold">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {[
                  ['Rent', '40,000 – 70,000', 'Fixed'],
                  ['Staff Salaries (2–3 trainers)', '25,000 – 45,000', 'Fixed'],
                  ['Electricity + Generator', '8,000 – 18,000', 'Variable'],
                  ['Water + Cleaning Supplies', '2,000 – 4,000', 'Variable'],
                  ['Internet + WiFi', '1,500 – 3,000', 'Fixed'],
                  ['Equipment Maintenance', '3,000 – 8,000', 'Variable'],
                  ['Marketing (Meta Ads, Printing)', '5,000 – 15,000', 'Variable'],
                  ['Gym Management Software', '1,000 – 2,000', 'Fixed'],
                ].map(([item, cost, type]) => (
                  <tr key={item}>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{item}</td>
                    <td className="p-4 text-right font-semibold">৳ {cost}</td>
                    <td className="p-4 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${type === 'Fixed' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>{type}</span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-slate-700">
                  <td className="p-4 font-black">TOTAL MONTHLY COSTS</td>
                  <td className="p-4 text-right font-black text-red-500">৳ 85,500 – 1,65,000</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 */}
        <section id="formula" className="mb-12">
          <h2 className="text-3xl font-black mb-4">3. The Gym Profit Margin Formula</h2>
          <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 font-mono text-sm mb-6 space-y-3">
            <div>
              <p className="text-slate-500 mb-1">// Step 1: Gross Profit</p>
              <p className="text-white">Monthly Revenue <span className="text-slate-500">–</span> Total Monthly Costs <span className="text-slate-500">=</span> <span className="text-emerald-400">Gross Profit</span></p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">// Step 2: Profit Margin %</p>
              <p className="text-white">(Gross Profit <span className="text-slate-500">÷</span> Revenue) <span className="text-slate-500">×</span> 100 <span className="text-slate-500">=</span> <span className="text-emerald-400">Margin %</span></p>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <p className="text-slate-500 mb-1">// Real Example (100 members, ৳ 1,500 avg fee)</p>
              <p className="text-white">Revenue: <span className="text-emerald-400">৳ 1,50,000</span></p>
              <p className="text-white">Costs: <span className="text-red-400">৳ 1,10,000</span></p>
              <p className="text-white">Gross Profit: <span className="text-emerald-400">৳ 40,000</span></p>
              <p className="text-white">Margin: <span className="text-emerald-400 font-bold">26.7%</span></p>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            A healthy independent gym in Bangladesh should target a <strong>25–40% gross margin</strong>. If you are below 20%, you have a cost or revenue leakage problem that needs fixing immediately.
          </p>
        </section>

        {/* Section 4 */}
        <section id="churn" className="mb-12">
          <h2 className="text-3xl font-black mb-4">4. The Hidden Killer: Churn Rate</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Churn rate is the percentage of members who <em>do not renew</em> each month. Most gym owners do not track this, and it silently destroys their profit.
          </p>
          <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 font-mono text-sm mb-6">
            <p className="text-emerald-400 mb-2">// Churn Rate Formula</p>
            <p className="text-white">(Members Who Left This Month <span className="text-slate-500">÷</span> Total Members Last Month) <span className="text-slate-500">×</span> 100</p>
            <p className="text-slate-500 mt-2">Example: 8 left ÷ 100 total = <span className="text-red-400 font-bold">8% monthly churn</span></p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
            <p className="font-bold text-red-700 dark:text-red-400 mb-1">⚠️ What 8% Churn Means for You</p>
            <p className="text-red-600 dark:text-red-300 text-sm">At 8% monthly churn with 100 members, you need to acquire 8 new members <em>just to stay flat</em>. Over a year, you turn over nearly your entire member base. The industry benchmark in Bangladesh is under 5% monthly churn for a well-managed gym.</p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="levers" className="mb-12">
          <h2 className="text-3xl font-black mb-4">5. Three Levers to Increase Profit by 30%</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600">notifications_active</span>
                </div>
                <div>
                  <h3 className="text-lg font-black mb-2">Lever 1: Automated Renewal Reminders (+8–12% Revenue)</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Sending SMS reminders 3 days before a membership expires can increase renewal rates by 15–20%. If you have 100 members at ৳ 1,500 and 10 more renew because of a reminder, that is ৳ 15,000 extra every month — ৳ 1,80,000/year from a single automation.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">trending_up</span>
                </div>
                <div>
                  <h3 className="text-lg font-black mb-2">Lever 2: Annual/Quarterly Upfront Plans (+15% Cash Flow)</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Offer a 10% discount for annual payment. A member who pays ৳ 16,200 for a year (vs ৳ 1,500 × 12 = ৳ 18,000) gives you ৳ 16,200 in cash today while you give a ৳ 1,800 "discount." Your cash flow improves dramatically and churn for annual members drops to near zero.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600">lock</span>
                </div>
                <div>
                  <h3 className="text-lg font-black mb-2">Lever 3: Stop Free Entry for Expired Members (+5–10%)</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Without a proper QR system, 5–8% of members in most Dhaka gyms work out for free after their membership expires. Simply because the front desk doesn't check. With LiftLegend's QR scanner, expired members are automatically blocked. If you have 100 members and 6 are working out for free at ৳ 1,500 each, that is ৳ 9,000 you are already losing monthly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-[#1978e5] rounded-2xl p-10 text-center text-white mt-16">
          <h2 className="text-3xl font-black mb-3">See your real gym profit numbers today.</h2>
          <p className="text-blue-100 mb-8 max-w-md mx-auto">LiftLegend automatically tracks your MRR, churn, and daily collections. No more guesswork.</p>
          <Link to="/login?signup=true&plan=ADVANCED" className="inline-block bg-white text-[#1978e5] px-10 py-4 rounded-full text-lg font-black hover:scale-105 transition-transform">
            Start Free — No Card Required
          </Link>
        </div>
      </article>
    </div>
  );
}
