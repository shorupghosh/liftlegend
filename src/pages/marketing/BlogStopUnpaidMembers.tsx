import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';

export default function BlogStopUnpaidMembers() {
  useEffect(() => {
    document.title = 'How to Stop Members Using Your Gym Without Paying in Bangladesh | LiftLegend';
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', 'Stop revenue leakage in your gym. Learn how to identify members working out for free, automate SMS reminders, and use QR access control — no hardware needed in Bangladesh.');
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
          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Revenue Protection</span>
          <span className="text-slate-400 text-sm">April 15, 2026 · 7 min read</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
          How to Stop Members Using Your Gym Without Paying
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          If you manage your gym with a khata or WhatsApp, between 5–12% of your members are probably working out for free right now. Here is exactly why it happens and how to stop it permanently.
        </p>

        {/* Pain stat callout */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-12 text-center">
          <p className="text-5xl font-black text-red-500 mb-2">৳ 9,000+</p>
          <p className="text-red-700 dark:text-red-300 font-semibold">Lost every month by an average 100-member Dhaka gym</p>
          <p className="text-red-400 text-sm mt-1">That is ৳ 1,08,000/year in silent revenue leakage.</p>
        </div>

        {/* TOC */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-12">
          <p className="font-black text-sm uppercase tracking-widest text-slate-500 mb-4">Table of Contents</p>
          <ol className="space-y-2 text-[#1978e5] font-semibold text-sm">
            <li><a href="#why" className="hover:underline">1. Why This Happens (The 3 Root Causes)</a></li>
            <li><a href="#howmuch" className="hover:underline">2. How to Calculate How Much You Are Losing Right Now</a></li>
            <li><a href="#sms" className="hover:underline">3. Fix 1 — Automated SMS Reminders Before Expiry</a></li>
            <li><a href="#qr" className="hover:underline">4. Fix 2 — QR Code Access Control (No Hardware Needed)</a></li>
            <li><a href="#dashboard" className="hover:underline">5. Fix 3 — Expired Member Dashboard</a></li>
          </ol>
        </div>

        {/* Section 1 */}
        <section id="why" className="mb-12">
          <h2 className="text-3xl font-black mb-4">1. Why This Happens (The 3 Root Causes)</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Revenue leakage from unpaid members is not because gym owners are careless. It is a systems problem. Here are the 3 root causes:
          </p>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-sm">book</span>
              </div>
              <div>
                <p className="font-bold mb-1">Root Cause 1: The Khata Can't Warn You</p>
                <p className="text-slate-500 text-sm leading-relaxed">A notebook does not send you an alert when Raju's membership expired yesterday. You would have to manually cross-check every single entry — which no gym owner has time for when 60 members walk in on a Saturday morning.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-sm">people</span>
              </div>
              <div>
                <p className="font-bold mb-1">Root Cause 2: Front Desk Staff Don't Check</p>
                <p className="text-slate-500 text-sm leading-relaxed">When it is rush hour (7–9am or 6–9pm), front desk staff are too busy to manually check every member against a notebook or Excel sheet. They wave people through, and expired members slip in.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-sm">social_distance</span>
              </div>
              <div>
                <p className="font-bold mb-1">Root Cause 3: Social Awkwardness</p>
                <p className="text-slate-500 text-sm leading-relaxed">In Bangladesh's mahalla culture, it is genuinely uncomfortable for a trainer to stop a long-time member at the door and say "Bhai, payment diben." This social pressure means expired members continue for days or weeks before anyone says anything.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section id="howmuch" className="mb-12">
          <h2 className="text-3xl font-black mb-4">2. How to Calculate How Much You Are Losing Right Now</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Before fixing the problem, you need to know its size. Pull up your khata or Excel sheet right now and answer:
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-4 w-4 text-[#1978e5] rounded border-slate-300" readOnly />
              <p className="text-slate-700 dark:text-slate-300 text-sm">How many members walked in today? <strong>___</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-4 w-4 text-[#1978e5] rounded border-slate-300" readOnly />
              <p className="text-slate-700 dark:text-slate-300 text-sm">How many of them have a valid, paid-up membership? <strong>___</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-4 w-4 text-[#1978e5] rounded border-slate-300" readOnly />
              <p className="text-slate-700 dark:text-slate-300 text-sm">Difference (free riders today) × ৳ 1,500 avg fee ÷ 30 days = <strong>Daily Revenue Loss</strong></p>
            </div>
          </div>
          <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-6 font-mono text-sm mb-4">
            <p className="text-slate-500 mb-2">// Quick Loss Calculator</p>
            <p className="text-white">6 free-riders × ৳ 1,500 avg fee = <span className="text-red-400">৳ 9,000/month lost</span></p>
            <p className="text-white">৳ 9,000 × 12 months = <span className="text-red-400 font-bold">৳ 1,08,000/year</span></p>
            <p className="text-emerald-400 mt-2">// LiftLegend costs ৳ 1,500/month → ROI in Week 1.</p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="sms" className="mb-12">
          <h2 className="text-3xl font-black mb-4">3. Fix 1 — Automated SMS Reminders Before Expiry</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            The single most effective intervention is a well-timed SMS reminder. Not a WhatsApp blast — a direct, personal-feeling SMS from your gym's number.
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <p className="text-xs font-bold uppercase text-slate-500 mb-4">Example SMS Templates That Convert</p>
            <div className="space-y-4">
              <div className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 mb-2">3 Days Before Expiry:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">"Raju bhai, আপনার Iron Body Gym membership ৩ দিন পরে শেষ হচ্ছে। Renew করতে: 01756-625762। — Iron Body Gym"</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 mb-2">On Expiry Day:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">"Raju bhai, আজকে আপনার membership শেষ হয়ে গেছে। আপনার জন্য আজকে বিশেষ সুযোগ — আজই renew করুন এবং ২ দিন extra পান। 01756-625762"</p>
              </div>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            LiftLegend sends these reminders automatically — you set them up once. Research from gym operators in Dhaka shows automated reminders increase same-week renewal rates by 18–25%.
          </p>
        </section>

        {/* Section 4 */}
        <section id="qr" className="mb-12">
          <h2 className="text-3xl font-black mb-4">4. Fix 2 — QR Code Access Control (No Hardware Needed)</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            The second line of defence is access control at the entrance. But you do NOT need to spend ৳ 15,000–50,000 on fingerprint scanners or turnstile hardware. You just need any Android phone at the front desk.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
              <p className="font-bold text-red-700 dark:text-red-400 mb-3">❌ Old Way (Hardware)</p>
              <ul className="space-y-2 text-sm text-red-600 dark:text-red-300">
                <li>৳ 20,000–50,000 upfront cost</li>
                <li>Breaks constantly in Dhaka's heat/humidity</li>
                <li>Technician visit needed to fix it</li>
                <li>Slow — backs up the queue at peak hours</li>
                <li>Cannot work if power is out</li>
              </ul>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
              <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-3">✅ LiftLegend QR Way</p>
              <ul className="space-y-2 text-sm text-emerald-600 dark:text-emerald-300">
                <li>Zero hardware cost — use any phone</li>
                <li>Never breaks (it's software)</li>
                <li>Fix any issue by yourself in 30 seconds</li>
                <li>Instant scan — no queue at the entrance</li>
                <li>Works on mobile data if WiFi is down</li>
              </ul>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            When a member with an expired membership scans their QR code, the front desk screen turns <strong className="text-red-500">red</strong>. The staff doesn't need to confront anyone — the system does it for them. No more social awkwardness.
          </p>
        </section>

        {/* Section 5 */}
        <section id="dashboard" className="mb-12">
          <h2 className="text-3xl font-black mb-4">5. Fix 3 — Expired Member Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Even with SMS reminders and QR control, you still need a way to proactively hunt down and recover expired members. LiftLegend's dashboard shows you:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex gap-3 items-center">
              <span className="material-symbols-outlined text-[#1978e5]">table_view</span>
              <span className="text-slate-700 dark:text-slate-300"><strong>Expired this week:</strong> A list of every member whose membership lapsed in the last 7 days, sorted by how much they owe.</span>
            </li>
            <li className="flex gap-3 items-center">
              <span className="material-symbols-outlined text-[#1978e5]">trending_down</span>
              <span className="text-slate-700 dark:text-slate-300"><strong>At-risk members:</strong> Members who have not scanned their QR code in 7+ days — potential churners before they even leave.</span>
            </li>
            <li className="flex gap-3 items-center">
              <span className="material-symbols-outlined text-[#1978e5]">notifications</span>
              <span className="text-slate-700 dark:text-slate-300"><strong>Renewal pipeline:</strong> Members expiring in the next 3, 7, and 14 days — so you can proactively reach out before they slip away.</span>
            </li>
          </ul>
          <div className="bg-[#1978e5]/5 border-l-4 border-[#1978e5] rounded-r-xl p-5">
            <p className="font-bold text-[#1978e5] mb-1">The Result</p>
            <p className="text-slate-700 dark:text-slate-300 text-sm">Gym owners using LiftLegend in Dhaka report a 15–22% improvement in monthly renewal rates within the first 60 days — simply by acting on the data the dashboard puts in front of them.</p>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-black mb-4">Summary: Your 3-Step Action Plan</h2>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Enable Automated SMS Reminders', desc: 'Set at 3 days before, on the day of, and 1 day after expiry.', time: 'Takes 5 minutes to set up.' },
              { step: '2', title: 'Set Up QR Code Scanning at the Door', desc: 'Mount a cheap phone at the entrance. Train staff on the red/green indicator.', time: 'Takes 10 minutes to set up.' },
              { step: '3', title: 'Review the Expired Dashboard Daily', desc: 'Spend 5 minutes every morning calling or WhatsApp-ing the top expired members.', time: '5 minutes daily.' },
            ].map(item => (
              <div key={item.step} className="flex gap-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1978e5] text-white flex items-center justify-center font-black text-sm">{item.step}</div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                  <p className="text-[#1978e5] text-xs font-bold mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-[#1978e5] rounded-2xl p-10 text-center text-white mt-16">
          <h2 className="text-3xl font-black mb-3">Stop the revenue leak starting today.</h2>
          <p className="text-blue-100 mb-8 max-w-md mx-auto">LiftLegend gives you automated SMS reminders, QR access control, and the expired member dashboard — all in one platform. Under ৳ 2,000/month.</p>
          <Link to="/login?signup=true&plan=ADVANCED" className="inline-block bg-white text-[#1978e5] px-10 py-4 rounded-full text-lg font-black hover:scale-105 transition-transform">
            Start 30-Day Free Trial
          </Link>
        </div>
      </article>
    </div>
  );
}
