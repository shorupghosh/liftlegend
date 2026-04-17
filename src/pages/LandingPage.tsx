import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME, COMPANY_NAME, SUPPORT_EMAIL } from '../lib/branding';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { enterDemoMode } from '../lib/demoUtils';
import { BrandLogo } from '../components/BrandLogo';

/** Set page-level SEO meta tags on mount */
function useLandingSEO() {
  useEffect(() => {
    document.title = 'LiftLegend — Gym Management Software for Bangladesh | Member Tracking, Payments, QR Attendance';
    
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setOG = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('description', 'LiftLegend is the all-in-one gym management platform built for Bangladesh. Track members, payments, attendance with QR codes, and grow your fitness business. Start your 30-day free trial today.');
    setOG('og:title', 'LiftLegend — Gym Management Software for Bangladesh');
    setOG('og:description', 'Track members, payments, and attendance. Built for modern gyms in Dhaka, Chittagong, and across Bangladesh. Start free.');
    setOG('og:url', 'https://liftlegend.com/');
  }, []);
}

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  useLandingSEO();

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#111821] text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111821]/80 backdrop-blur-md px-4 sm:px-6 md:px-20 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-14 sm:h-16 w-auto" variant="auto" />
            </div>
            <nav className="hidden md:flex items-center gap-10">
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#features">Features</a>
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#pricing">Pricing</a>
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#testimonials">Success Stories</a>
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href={`mailto:${SUPPORT_EMAIL}`}>Support</a>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={enterDemoMode}
                className="hidden lg:flex items-center gap-2 px-5 py-2 text-sm font-bold text-[#1978e5] border border-[#1978e5]/20 hover:bg-[#1978e5]/5 rounded-full transition-all"
              >
                <span className="material-symbols-outlined text-lg">visibility</span>
                Explore Live Demo
              </button>
              <Link to="/login" className="hidden sm:block px-5 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">Login</Link>
              <Link to="/login?signup=true&plan=ADVANCED" className="bg-[#1978e5] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-[#1978e5]/30 hover:shadow-xl hover:scale-105 transition-all">Start 30-Day Trial</Link>
              <button
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg py-4 px-6 flex flex-col gap-4 z-40">
              <a className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1978e5] transition-colors" href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1978e5] transition-colors" href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
              <a className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1978e5] transition-colors" href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Success Stories</a>
              <a className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1978e5] transition-colors" href={`mailto:${SUPPORT_EMAIL}`} onClick={() => setIsMobileMenuOpen(false)}>Support</a>
              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2"></div>
              <Link to="/login" className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1978e5] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); enterDemoMode(); }}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-[#1978e5] bg-[#1978e5]/5 rounded-xl border border-[#1978e5]/10 mt-2"
              >
                <span className="material-symbols-outlined text-lg">visibility</span>
                Explore Live Demo
              </button>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <main className="flex-1">
          <section className="relative px-6 py-16 md:py-28 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1978e5]/10 border border-[#1978e5]/20 text-[#1978e5] text-xs font-bold uppercase tracking-wider w-fit">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  Built for Bangladesh gym operations
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                  Elevate Your <span className="text-[#1978e5]">Gym Management</span> in Bangladesh
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  LiftLegend helps gym owners track members, payments, and renewals without paper records.
                </p>
                <p className="text-md text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl -mt-4">
                  Built specifically for modern fitness centers in Dhaka, Chittagong, and across Bangladesh.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/login?signup=true&plan=ADVANCED" className="bg-[#1978e5] text-white h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg font-bold shadow-xl shadow-[#1978e5]/40 flex items-center justify-center gap-2 hover:bg-blue-600 transition-all cursor-pointer">
                    Start 30-Day Trial
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                  <button onClick={enterDemoMode} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border-2">
                    <span className="material-symbols-outlined">visibility</span>
                    Explore Live Demo
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Used by gyms moving beyond notebooks and spreadsheets.</span>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-[#1978e5]/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Live Product Preview</p>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
                      <p className="text-xs text-slate-500">Today Collections</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">৳ 18,450</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">Cash + bKash + Card</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                        <p className="text-[11px] text-slate-500">Expiring Soon</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">12 Members</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                        <p className="text-[11px] text-slate-500">Check-ins Today</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">76</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How LiftLegend Works */}
          <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">How LiftLegend Works</h2>
                <p className="text-slate-600 dark:text-slate-400">Run your gym like a business, not a notebook.</p>
              </div>
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  { step: '01', title: 'Add your members', desc: 'Quickly import or add members with their membership details.' },
                  { step: '02', title: 'Track attendance automatically', desc: 'Secure QR scans handle check-ins instantly.' },
                  { step: '03', title: 'Monitor your gym performance', desc: 'Real-time data on active members and revenue.' },
                  { step: '04', title: 'Grow your fitness business', desc: 'Use insights to scale and improve retention.' }
                ].map((item, i) => (
                  <div key={i} className="relative p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <span className="text-5xl font-black text-[#1978e5]/10 absolute top-4 right-4">{item.step}</span>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white relative z-10">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm relative z-10">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trust Signals */}
          <section className="py-12 bg-white dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-6">
              <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">What gym owners validate before switching</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                  <p className="font-bold text-slate-900 dark:text-white">Dues Collection Ready</p>
                  <p className="text-sm text-slate-500 mt-1">Track cash, bKash, and partial payments with daily summaries.</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                  <p className="font-bold text-slate-900 dark:text-white">Mobile-Friendly for Staff</p>
                  <p className="text-sm text-slate-500 mt-1">Front desk and trainer flows are optimized for phones and tablets.</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                  <p className="font-bold text-slate-900 dark:text-white">Local Support Channel</p>
                  <p className="text-sm text-slate-500 mt-1">Call or WhatsApp support during onboarding and rollout.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <LandingFeatures />

          {/* Pricing Section */}
          <LandingPricing />

          {/* Buyer Checklist */}
          <section className="py-24 px-6 max-w-7xl mx-auto" id="testimonials">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-6">What we demo live before purchase</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">A practical checklist for owners evaluating system reliability.</p>
                <div className="flex gap-1 text-[#f97316]">
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                </div>
                <p className="text-sm font-bold mt-2">End-to-end workflows shown with real product screens</p>
              </div>
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-700 dark:text-slate-300 italic mb-6">"Show me due balances, partial payments, receipt sharing, and renewal actions in one flow."</p>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-primary-default/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-default">payments</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Payments Workflow</p>
                      <p className="text-xs text-slate-500">Collections, dues, and renewals</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-700 dark:text-slate-300 italic mb-6">"Show me staff access, mobile check-ins, and how alerts turn into real follow-up actions."</p>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-primary-default/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-default">groups</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Operations Workflow</p>
                      <p className="text-xs text-slate-500">Attendance, staff, and reminders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-6">
            <div className="max-w-5xl mx-auto bg-[#1978e5] rounded-xl p-10 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f97316]/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to run your gym like a modern business?</h2>
                <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join the fastest growing gym management platform in Bangladesh and take full control of your fitness business. Start your 30-day free trial today.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => navigate('/login?signup=true&plan=ADVANCED')} className="bg-white text-[#1978e5] h-14 px-6 sm:px-10 rounded-full text-base sm:text-lg font-bold hover:scale-105 transition-all">Start 30-Day Trial</button>
                  <button onClick={() => navigate('/book-demo')} className="bg-transparent text-white border-2 border-white/30 h-14 px-6 sm:px-10 rounded-full text-base sm:text-lg font-bold hover:bg-white/10 transition-all">Book a 30-Minute Demo for Your Gym</button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-16 px-6 md:px-20">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 text-white mb-6">
                <BrandLogo className="h-14 sm:h-16 w-auto object-contain" variant="light" />
              </div>
              <p className="text-white font-bold mb-4">Powering the next generation of gyms in Bangladesh</p>
              <p className="max-w-xs mb-8">LiftLegend helps gym owners simplify operations, improve member experience, and grow their business with modern management tools.</p>
              <div className="flex gap-4">
                <a className="size-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#1978e5] transition-colors" href="https://www.facebook.com/Liftlegendgym/" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <p className="text-white font-bold mb-6">Product</p>
              <ul className="space-y-4 text-sm">
                <li><a className="hover:text-[#1978e5] transition-colors" href="#features">Features</a></li>
                <li><a className="hover:text-[#1978e5] transition-colors" href="#pricing">Pricing</a></li>
                <li><Link className="hover:text-[#1978e5] transition-colors" to="/book-demo">Book Demo</Link></li>
                <li><button className="hover:text-[#1978e5] transition-colors text-left" onClick={enterDemoMode}>Explore Live Demo</button></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-6">Company</p>
              <ul className="space-y-4 text-sm">
                <li><a className="hover:text-[#1978e5] transition-colors" href={`mailto:${SUPPORT_EMAIL}`}>Contact Team</a></li>
                <li><a className="hover:text-[#1978e5] transition-colors" href="tel:01756625762">Call Support</a></li>
                <li><a className="hover:text-[#1978e5] transition-colors" href="https://wa.me/8801756625762" target="_blank" rel="noreferrer">WhatsApp Support</a></li>
                <li><a className="hover:text-[#1978e5] transition-colors" href={`mailto:${SUPPORT_EMAIL}?subject=LiftLegend%20Privacy%20Question`}>Privacy</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-6">Contact</p>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">call</span>
                  01756625762
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  {SUPPORT_EMAIL}
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Dhanmondi, Dhaka, Bangladesh, 1205
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>(c) 2026 {COMPANY_NAME}. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-white transition-colors" href={`mailto:${SUPPORT_EMAIL}?subject=LiftLegend%20Terms%20Request`}>Terms of Service</a>
              <a className="hover:text-white transition-colors" href={`mailto:${SUPPORT_EMAIL}?subject=LiftLegend%20Cookie%20Policy%20Request`}>Cookie Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
