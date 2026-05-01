import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME, COMPANY_NAME, SUPPORT_EMAIL } from '../lib/branding';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingTestimonials } from '../components/landing/LandingTestimonials';
import { enterDemoMode } from '../lib/demoUtils';
import { BrandLogo } from '../components/BrandLogo';

const FAQ_ITEMS = [
  { q: 'Do I need to buy any hardware or fingerprint scanner?', a: 'No. LiftLegend is 100% software-based. You can track gym attendance using QR codes on any smartphone or tablet. No expensive turnstiles, fingerprint scanners, or any other hardware are required.' },
  { q: 'Does LiftLegend support bKash payments?', a: 'Yes. You can log bKash, cash, and card payments directly inside LiftLegend. Each transaction is recorded with the bKash transaction ID, amount, and date so you always have a clean digital record.' },
  { q: 'Is LiftLegend available in Bangla?', a: 'LiftLegend is designed for gym owners in Bangladesh and all pricing, support, and communication is done in Bangla and English. Our support team is available via WhatsApp during Dhaka business hours.' },
  { q: 'How much does LiftLegend cost in BDT?', a: 'LiftLegend plans start from ৳ 1,000/month with transparent, upfront pricing shown on our website. There are no hidden setup fees and no "inbox for price" surprises. You can start with a 30-day free trial without a credit card.' },
  { q: 'Can I manage multiple gym branches?', a: 'Yes. LiftLegend supports multi-branch management. Each branch has its own member database, attendance records, and payment tracking, all accessible from a single owner account.' },
  { q: 'What happens if I need help setting it up?', a: 'Our team provides personal onboarding support via WhatsApp. Most gyms are fully set up within one hour. We also have demo videos and a live demo mode on our website you can explore before signing up.' },
];

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

    // FAQPage JSON-LD Schema for Google rich results
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    };
    let faqScript = document.getElementById('faq-schema') as HTMLScriptElement | null;
    if (!faqScript) {
      faqScript = document.createElement('script');
      faqScript.id = 'faq-schema';
      faqScript.type = 'application/ld+json';
      document.head.appendChild(faqScript);
    }
    faqScript.textContent = JSON.stringify(faqSchema);

    return () => {
      document.getElementById('faq-schema')?.remove();
    };
  }, []);
}

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  useLandingSEO();

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#111821] text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Top Info Bar */}
        <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-6 md:px-20 hidden lg:flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-6">
              <a href="mailto:liftlegend2@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[14px]">mail</span> liftlegend2@gmail.com
              </a>
              <a href="tel:+8801756625762" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[14px]">call</span> +880 1756 625762
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/liftlegend_bd" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
                @liftlegend_bd
              </a>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111821]/80 backdrop-blur-md px-4 sm:px-6 md:px-20 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-10 sm:h-14 md:h-16 w-auto" variant="auto" />
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
              
              {/* Mobile Contact Info */}
              <div className="flex flex-col gap-3 mb-2 text-sm text-slate-600 dark:text-slate-400">
                <a href="mailto:liftlegend2@gmail.com" className="flex items-center gap-2 hover:text-[#1978e5] transition-colors">
                  <span className="material-symbols-outlined text-[16px]">mail</span> liftlegend2@gmail.com
                </a>
                <a href="tel:+8801756625762" className="flex items-center gap-2 hover:text-[#1978e5] transition-colors">
                  <span className="material-symbols-outlined text-[16px]">call</span> +880 1756 625762
                </a>
                <a href="https://instagram.com/liftlegend_bd" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#1978e5] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                  @liftlegend_bd
                </a>
              </div>
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
                  Stop Losing Money on <span className="text-[#1978e5]">Expired Gym Memberships</span>
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
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                    <span className="text-xl">🇧🇩</span> Proudly Made in Bangladesh
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                    <span className="text-xl">📱</span> 100% Mobile Ready — Zero Hardware Required
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Used by gyms moving beyond notebooks and spreadsheets.</span>
                </div>
              </div>
              <div className="relative group" role="region" aria-label="LiftLegend QR Scanner Demo Video">
                <div className="absolute -inset-4 bg-[#1978e5]/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 aspect-[4/3] flex items-center justify-center">
                  <img 
                    src="/demo-scan.gif" 
                    alt="LiftLegend QR Scanner Demo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white flex items-center gap-4">
                    <div className="size-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <span className="material-symbols-outlined text-white text-2xl">qr_code_scanner</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold">100% Mobile Ready</p>
                      <p className="text-sm opacity-90 text-emerald-100 font-medium">Member entry recorded instantly via phone.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Khata vs LiftLegend Section */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">Gym Management: আগে <span className="text-slate-400">VS</span> এখন</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">খাতার হিসাব থেকে বের হয়ে আসুন ভাই। Gym Manage করুন স্মার্টলি।</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* The Old Way */}
              <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/30 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold px-4 py-1 rounded-bl-lg">আগে (The Old Way)</div>
                <div className="size-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5">cancel</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">খাতায় Member Name</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">খুঁজে বের করতে সময় নষ্ট।</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5">cancel</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">হাতে Payment হিসাব</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">bKash না Cash? ভুল হওয়ার চান্স।</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5">cancel</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Missed Payments</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">প্রতি মাসে হাজার টাকা লস।</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5">cancel</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Month শেষে Confusion</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">হিসাব মেলাতে মাথা নষ্ট।</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* The LiftLegend Way */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-500 dark:border-emerald-500/50 rounded-2xl p-8 relative overflow-hidden shadow-lg shadow-emerald-500/10">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">এখন (LiftLegend)</div>
                <div className="size-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">phonelink_ring</span>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 mt-0.5">check_circle</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">App-এ সব Member Info</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">১ সেকেন্ডে সব হাতের মুঠোয়।</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 mt-0.5">check_circle</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Auto Payment Alerts</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Due date আসার আগেই reminder।</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 mt-0.5">check_circle</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Real-time Tracking</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">১০০% payment track হবে।</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 mt-0.5">check_circle</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">সব কিছু Clear</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Month শেষে no tension.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How LiftLegend Works */}
          <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">কিভাবে কাজ করে LiftLegend?</h2>
                <p className="text-slate-600 dark:text-slate-400">খাতায় আর কতদিন ভাই? এবার স্মার্টভাবে Gym Manage করুন।</p>
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
              <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">কেন বাংলাদেশের Gym Owner-রা LiftLegend বেছে নিচ্ছেন?</p>
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

          {/* Real Reviews */}
          <LandingTestimonials />

          {/* Buyer Checklist */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-6">কেনার আগে লাইভ দেখে নিন কিভাবে আপনার Gym-এর হিসাব মিলবে</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Gym owner ভাইদের জন্য প্রাকটিকাল চেকলিস্ট। নিজে দেখে বিশ্বাস করুন।</p>
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

          {/* FAQ Section */}
          <section className="py-20 px-6 bg-white dark:bg-slate-900/50" id="faq">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                <p className="text-slate-600 dark:text-slate-400">Everything gym owners in Bangladesh ask before switching.</p>
              </div>
              <div className="space-y-4">
                {FAQ_ITEMS.map((item, i) => (
                  <details key={i} className="group bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-bold text-slate-900 dark:text-white hover:text-[#1978e5] transition-colors gap-4">
                      <span>{item.q}</span>
                      <span className="material-symbols-outlined flex-shrink-0 text-[#1978e5] group-open:rotate-180 transition-transform duration-200">expand_more</span>
                    </summary>
                    <div className="px-5 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed text-sm border-t border-slate-200 dark:border-slate-700 pt-4">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-6">
            <div className="max-w-5xl mx-auto bg-[#1978e5] rounded-xl p-10 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f97316]/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6">খাতা-কলমের হিসাব বাদ দিন ভাই। স্মার্টলি Gym Manage করার সময় এখনই।</h2>
                <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">বাংলাদেশের সবচেয়ে দ্রুত বর্ধনশীল Gym Management Platform-এ জয়েন করুন। আজই শুরু করুন আপনার ৩০ দিনের ফ্রি ট্রায়াল।</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => navigate('/login?signup=true&plan=ADVANCED')} className="bg-white text-[#1978e5] h-14 px-6 sm:px-10 rounded-full text-base sm:text-lg font-bold hover:scale-105 transition-all">Start 30-Day Trial</button>
                  <button onClick={() => navigate('/book-demo')} className="bg-transparent text-white border-2 border-white/30 h-14 px-6 sm:px-10 rounded-full text-base sm:text-lg font-bold hover:bg-white/10 transition-all">Book a 30-Minute Demo for Your Gym</button>
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-100">
                    <span className="text-xl">🇧🇩</span> Proudly Made in Bangladesh
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-100">
                    <span className="text-xl">📱</span> 100% Mobile Ready — Zero Hardware Required
                  </div>
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
                <BrandLogo className="h-16 sm:h-20 w-auto object-contain" variant="light" />
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
                <li><Link className="hover:text-[#1978e5] transition-colors" to="/compare/mysoftheaven-alternative">vs MySoftHeaven</Link></li>
                <li><Link className="hover:text-[#1978e5] transition-colors" to="/features/gym-billing-software-bangladesh">Payment Tracking</Link></li>
                <li><Link className="hover:text-[#1978e5] transition-colors" to="/features/qr-code-gym-attendance-bangladesh">QR Attendance</Link></li>
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
                  <a href="tel:+8801756625762" className="hover:text-white transition-colors">+880 1756 625762</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <a href="mailto:liftlegend2@gmail.com" className="hover:text-white transition-colors">liftlegend2@gmail.com</a>
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
