import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#111821] text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111821]/80 backdrop-blur-md px-4 sm:px-6 md:px-20 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/main-logo.png" alt="LiftLegend Logo" className="h-10 object-contain" />
            </div>
            <nav className="hidden md:flex items-center gap-10">
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#features">Features</a>
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#pricing">Pricing</a>
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#testimonials">Success Stories</a>
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#">Support</a>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/login" className="hidden sm:block px-5 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">Login</Link>
              <Link to="/login?signup=true" className="bg-[#1978e5] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-[#1978e5]/30 hover:shadow-xl hover:scale-105 transition-all">Get Started</Link>
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
              <a className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1978e5] transition-colors" href="#" onClick={() => setIsMobileMenuOpen(false)}>Support</a>
              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2"></div>
              <Link to="/login" className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1978e5] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
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
                  #1 Gym Management Platform in Bangladesh
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                  Elevate Your <span className="text-[#1978e5]">Gym Management</span> in Bangladesh
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  The all-in-one platform to automate memberships, tracking, and growth. Built specifically for modern fitness centers in Dhaka, Chittagong, and beyond.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/login?signup=true" className="bg-[#1978e5] text-white h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg font-bold shadow-xl shadow-[#1978e5]/40 flex items-center justify-center gap-2 hover:bg-blue-600 transition-all cursor-pointer">
                    Get Started for Free
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                  <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                    <span className="material-symbols-outlined">play_circle</span>
                    Watch Demo
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex -space-x-3">
                    <div className="size-10 rounded-full border-2 border-white bg-slate-200" data-alt="User avatar 1" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCnE6bDys6WUJ8MZ_3sG-mHqXFI0d8AA_wvfreQH8Zaf6uU4b84A9mOMjnh7KeCn9qw3TKg-qFMU--B34FfufyOFsZM9NGXeextDL0Wt6ZjsyFgEDgb70wS6ShsPbElNUSYZqZlNAQpoqTcrWSUkmPyiuhhTjd5wt3Av05fQiVpbqIQ4tpHYrHCxtjnGV8bSclaGJumTTiiMR6iNRGGBs_KMZnzvmucGN2bb-Qz0Dz_Bj4DpJqD8MV5Tt54O6eUJHdxA2smRHZ35gyZ')" }}></div>
                    <div className="size-10 rounded-full border-2 border-white bg-slate-300" data-alt="User avatar 2" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCdNYwzzl4LJuJupvRRWEZqPy_xs3Hngpax7kWi2SqTI5kmSgKa4xUpmxdRMKdedm54jITV9cOMRgzoAf6CMRsTVaRIsajlLKV5W-RS1PvuGKZ02MGJFYLA6z0uqy1WiXhAd0ccr7Dw-ypyNzubCUtknfoa6a6Mf0_1YGNuxODdS9OdGi2SfXPYgQstfvIXJ-PjmdFSrzOWX6gcxqXWLMFJ90bZI0HlEihfplJWARTfKEHrXAOEKT9RcXurZ9emtL83lPLMiAPLP5US')" }}></div>
                    <div className="size-10 rounded-full border-2 border-white bg-slate-400" data-alt="User avatar 3" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMMVB5SujDJxqoIExUZv2pFfLRFQUj5AmzjiNCV8vSeWcKtpKaDHHkI-JrVLXVT9y-vfh4QTBAXgYG00XddJVT3GaIIh9QQnEYTbd5Vf5yvg_cD2pWlEzO8hI-mxB7YEFxPZ61KhC_YVdYWNuACxB5qV6lqJPDp4ZjDhFsWKlOFO_m1Cjs7A4rB54Ow9IqtOMeFkJgGa44sdD426Yohic6GrCFNfxAK9amwEX-q6VBOFey6lpgNV2Wx8EADXFxqlD79OG5Sgg1iF21')" }}></div>
                  </div>
                  <span>Joined by 200+ Gym Owners this month</span>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-[#1978e5]/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800/50">
                  <div className="h-8 bg-slate-800 flex items-center gap-1.5 px-4">
                    <div className="size-2.5 rounded-full bg-red-500"></div>
                    <div className="size-2.5 rounded-full bg-yellow-500"></div>
                    <div className="size-2.5 rounded-full bg-green-500"></div>
                  </div>
                  <div className="aspect-[16/10] bg-slate-800" data-alt="SaaS dashboard mockup with charts and member lists" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCvt00u5tx8nyBvpTdW9o4K1uI_tYNVZxaJ5ZGOry_bhQCfkSsy0iQ_0ZJQft7weFKy7CdwqZslfSSr48cX7nQkavooTBRsuJtaYuX2xJKHcfpC7kwDQyHHXPhIcKMPmrF5dhvREms9rKi_ZUBvUA6JpwM9cvpAt4YcyKxbDWi2Q1YmZQz7ZByDsfbFT6gwaoWMRSwmz5vVV3MMQLRuVkuDZBjqEDICnBvMUGrqAEs_BykRhgNuSBgFG4vHtEc_Tbo2rgu5cf3yxb44')", backgroundSize: "cover" }}></div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">New Payment</p>
                      <p className="font-bold text-slate-900 dark:text-white">৳ 3,500.00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Social Proof */}
          <section className="py-12 bg-white dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-6">
              <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Trusted by Leading Bangladeshi Gyms</p>
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="text-2xl font-black text-slate-800 dark:text-slate-200 italic">Gulshan Fitness</div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-200 italic">Banani Wellness</div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-200 italic">Dhanmondi Iron</div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-200 italic">Chittagong Power</div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-200 italic">Uttara Elite</div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 px-6 max-w-7xl mx-auto" id="features">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-[#1978e5] font-bold uppercase tracking-widest text-sm mb-4">Core Capabilities</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">Everything you need to run your facility efficiently</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-8 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#1978e5] transition-all group">
                <div className="size-14 rounded-xl bg-[#1978e5]/10 flex items-center justify-center text-[#1978e5] mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">badge</span>
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Membership Management</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Automate renewals, digital member profiles, and expiry alerts sent directly to their phones.</p>
              </div>
              <div className="p-8 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#1978e5] transition-all group">
                <div className="size-14 rounded-xl bg-[#1978e5]/10 flex items-center justify-center text-[#1978e5] mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">QR Attendance</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Eliminate physical cards. Secure and fast check-ins using dynamic QR codes on member apps.</p>
              </div>
              <div className="p-8 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#1978e5] transition-all group">
                <div className="size-14 rounded-xl bg-[#1978e5]/10 flex items-center justify-center text-[#1978e5] mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">monitoring</span>
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Real-time Analytics</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Track revenue, member growth, and peak hours with localized smart reporting.</p>
              </div>
              <div className="p-8 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-[#1978e5] transition-all group">
                <div className="size-14 rounded-xl bg-[#1978e5]/10 flex items-center justify-center text-[#1978e5] mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">forum</span>
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Communication Center</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Engage members via automated SMS, WhatsApp, and email alerts for announcements.</p>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
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
                      <span className="text-4xl font-black text-slate-900 dark:text-white uppercase">৳1,000</span>
                      <span className="text-slate-500">/mo</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-4 italic">Perfect for micro-gyms</p>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      Up to 100 Members
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      QR Code Attendance
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      Basic Analytics
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-400 line-through">
                      <span className="material-symbols-outlined">cancel</span>
                      SMS Campaigns
                    </li>
                  </ul>
                  <button onClick={() => navigate('/login?signup=true')} className="w-full py-4 rounded-full font-bold border border-[#1978e5] text-[#1978e5] hover:bg-[#1978e5]/5 transition-colors">Start 30-Day Free Trial</button>
                </div>
                <div className="p-10 bg-white dark:bg-slate-800 rounded-lg border-2 border-[#1978e5] flex flex-col relative shadow-2xl scale-105">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1978e5] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Most Popular</div>
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Power Plus</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 dark:text-white uppercase">৳1,500</span>
                      <span className="text-slate-500">/mo</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-4 italic">Designed for growing studios</p>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      Up to 500 Members
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      Everything in Starter
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      Automated SMS Alerts
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      Multi-Staff Access
                    </li>
                  </ul>
                  <button onClick={() => navigate('/login?signup=true')} className="w-full py-4 rounded-full font-bold bg-[#1978e5] text-white hover:bg-blue-600 transition-colors shadow-lg shadow-[#1978e5]/30">Get Started</button>
                </div>
                <div className="p-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col hover:shadow-2xl transition-all">
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Elite Legend</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 dark:text-white uppercase">৳2,000</span>
                      <span className="text-slate-500">/mo</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-4 italic">Unlimited power for elite centers</p>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      Unlimited Members
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      Custom API Integration
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      Priority 24/7 Support
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      Dedicated Account Manager
                    </li>
                  </ul>
                  <button onClick={() => navigate('/login?signup=true')} className="w-full py-4 rounded-full font-bold border border-slate-200 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Start 30-Day Free Trial</button>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 px-6 max-w-7xl mx-auto" id="testimonials">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-6">Loved by Bangladeshi Gym Owners</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">See how LiftLegend is transforming fitness businesses across the country.</p>
                <div className="flex gap-1 text-[#f97316]">
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                </div>
                <p className="text-sm font-bold mt-2">4.9/5 average rating from 150+ gyms</p>
              </div>
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-700 dark:text-slate-300 italic mb-6">"LiftLegend simplified my whole operation. I no longer have to worry about missing payments or manual attendance logs. The QR system is a hit with my members!"</p>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-slate-200" data-alt="Ariful Haque Portrait" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAI92nKrVxBlPH1lmXDSyNe_qVxeROsQjLMI2fFnsr1h8ZRSTD_VqN-VgBYRU87GgxNK5S5K33pi4BdUHfEYtsBddAj-DZvOy6J1zERLoRzyGwl_EdsrwjqC7l-hSTMkLvCQKIg59g4qPH_C6M8ezSxRddf8EUeqg1k3e71NeBxEn1xX6BlGGDhF5seKuj5a6OitRcrobstUWDeqMGtRha2N7mH2vj-Hd6ZWfz14nG1nxgv836O1_-WpZ-0yeGTQq93pwM93cBnLKaw')" }}></div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">Ariful Haque</h5>
                      <p className="text-xs text-slate-500">Owner, Gulshan Fitness</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-700 dark:text-slate-300 italic mb-6">"The automated SMS reminders for renewals helped us increase our member retention by 35% in just 3 months. Essential tool for any gym in Dhaka."</p>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-slate-200" data-alt="Tariqul Islam Portrait" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCk6lfSCQW0LuNpKtPA9x5YAx6aNKuiZS3Z5c-xeUuNTJzfQ3_wMUjxojHrKLNto--_0eOrVbXUzKxmzumBRS8MO75d9pB7WqBrZr2stZciQMcvTJM9EvwFkZCQiykjrIe342XGILFOshWXAjMmmZFyh8LLmEhaDAGHvGBjcERGV7APR2ds_k7lp4UL7_W6VqXiupKnS4L6I4lu2xBWXDCmEAFgxPTIzvRqiWuZFg1lPtEG1c34eS9ouF-WsVl8Z4KjBn4jR7uTQ_FT')" }}></div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">Tariqul Islam</h5>
                      <p className="text-xs text-slate-500">Director, Banani Wellness</p>
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
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to lead the fitness revolution?</h2>
                <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join the most advanced gym community in Bangladesh today. No credit card required to start.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => navigate('/login?signup=true')} className="bg-white text-[#1978e5] h-14 px-6 sm:px-10 rounded-full text-base sm:text-lg font-bold hover:scale-105 transition-all">Start 30-Day Free Trial</button>
                  <button onClick={() => navigate('/book-demo')} className="bg-transparent text-white border-2 border-white/30 h-14 px-6 sm:px-10 rounded-full text-base sm:text-lg font-bold hover:bg-white/10 transition-all">Book a Free Demo</button>
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
                <img src="/main-logo.png" alt="LiftLegend Logo" className="h-10 object-contain brightness-0 invert" />
              </div>
              <p className="max-w-xs mb-8">Modernizing the fitness industry in Bangladesh with smart, automated management solutions.</p>
              <div className="flex gap-4">
                <a className="size-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#1978e5] transition-colors" href="#"><span className="material-symbols-outlined text-sm">social_leaderboard</span></a>
                <a className="size-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#1978e5] transition-colors text-sm font-bold italic" href="#">X</a>
                <a className="size-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#1978e5] transition-colors text-sm font-bold" href="#">in</a>
              </div>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Product</h5>
              <ul className="space-y-4 text-sm">
                <li><a className="hover:text-[#1978e5] transition-colors" href="#">Features</a></li>
                <li><a className="hover:text-[#1978e5] transition-colors" href="#">Pricing</a></li>
                <li><a className="hover:text-[#1978e5] transition-colors" href="#">Integrations</a></li>
                <li><a className="hover:text-[#1978e5] transition-colors" href="#">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Company</h5>
              <ul className="space-y-4 text-sm">
                <li><a className="hover:text-[#1978e5] transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-[#1978e5] transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-[#1978e5] transition-colors" href="#">Blog</a></li>
                <li><a className="hover:text-[#1978e5] transition-colors" href="#">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Contact</h5>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">call</span>
                  +880 1700-000000
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  hello@liftlegend.com
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Gulshan-2, Dhaka
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2024 LiftLegend Technologies Ltd. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-white transition-colors" href="#">Cookie Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

