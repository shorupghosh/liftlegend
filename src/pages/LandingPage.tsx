import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME, COMPANY_NAME, SUPPORT_EMAIL } from '../lib/branding';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { enterDemoMode } from '../lib/demoUtils';

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
              <img src="/logo.svg" alt={APP_NAME} className="h-9 w-auto" />
            </div>
            <nav className="hidden md:flex items-center gap-10">
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#features">Features</a>
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#pricing">Pricing</a>
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#testimonials">Success Stories</a>
              <a className="text-sm font-semibold hover:text-[#1978e5] transition-colors" href="#">Support</a>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={enterDemoMode}
                className="hidden lg:flex items-center gap-2 px-5 py-2 text-sm font-bold text-[#1978e5] border border-[#1978e5]/20 hover:bg-[#1978e5]/5 rounded-full transition-all"
              >
                <span className="material-symbols-outlined text-lg">visibility</span>
                Try Demo
              </button>
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
              <button 
                onClick={() => { setIsMobileMenuOpen(false); enterDemoMode(); }}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-[#1978e5] bg-[#1978e5]/5 rounded-xl border border-[#1978e5]/10 mt-2"
              >
                <span className="material-symbols-outlined text-lg">visibility</span>
                Try Demo
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
                  #1 Gym Management Platform in Bangladesh
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                  Elevate Your <span className="text-[#1978e5]">Gym Management</span> in Bangladesh
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  LiftLegend is the all-in-one platform that helps gym owners manage members, track attendance, control staff, and grow their fitness business — all from one powerful dashboard.
                </p>
                <p className="text-md text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl -mt-4">
                  Built specifically for modern fitness centers in Dhaka, Chittagong, and across Bangladesh.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/login?signup=true" className="bg-[#1978e5] text-white h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg font-bold shadow-xl shadow-[#1978e5]/40 flex items-center justify-center gap-2 hover:bg-blue-600 transition-all cursor-pointer">
                    Start Free Trial
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                  <button onClick={enterDemoMode} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border-2">
                    <span className="material-symbols-outlined">visibility</span>
                    Try Demo
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Trusted by growing gyms across Bangladesh.</span>
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
                      <p className="font-bold text-slate-900 dark:text-white">BDT 3,500.00</p>
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
                    <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white relative z-10">{item.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm relative z-10">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Social Proof */}
          <section className="py-12 bg-white dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-6">
              <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">The gyms modernizing their operations with LiftLegend</p>
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
          <LandingFeatures />

          {/* Pricing Section */}
          <LandingPricing />

          {/* Testimonials */}
          <section className="py-24 px-6 max-w-7xl mx-auto" id="testimonials">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-6">Loved by Bangladeshi gym owners</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">See how LiftLegend is transforming gym businesses across the country.</p>
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
                  <p className="text-slate-700 dark:text-slate-300 italic mb-6">"LiftLegend completely changed how we manage our gym. Before this, everything was written in notebooks. Now we track members, attendance, and payments easily."</p>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-slate-200" data-alt="Ariful Haque Portrait" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAI92nKrVxBlPH1lmXDSyNe_qVxeROsQjLMI2fFnsr1h8ZRSTD_VqN-VgBYRU87GgxNK5S5K33pi4BdUHfEYtsBddAj-DZvOy6J1zERLoRzyGwl_EdsrwjqC7l-hSTMkLvCQKIg59g4qPH_C6M8ezSxRddf8EUeqg1k3e71NeBxEn1xX6BlGGDhF5seKuj5a6OitRcrobstUWDeqMGtRha2N7mH2vj-Hd6ZWfz14nG1nxgv836O1_-WpZ-0yeGTQq93pwM93cBnLKaw')" }}></div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">Ariful Haque</h5>
                      <p className="text-xs text-slate-500">Owner, Banani Fitness</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-700 dark:text-slate-300 italic mb-6">"The automated attendance system saved our staff hours every day. Our gym now runs much smoother."</p>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-slate-200" data-alt="Tariqul Islam Portrait" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCk6lfSCQW0LuNpKtPA9x5YAx6aNKuiZS3Z5c-xeUuNTJzfQ3_wMUjxojHrKLNto--_0eOrVbXUzKxmzumBRS8MO75d9pB7WqBrZr2stZciQMcvTJM9EvwFkZCQiykjrIe342XGILFOshWXAjMmmZFyh8LLmEhaDAGHvGBjcERGV7APR2ds_k7lp4UL7_W6VqXiupKnS4L6I4lu2xBWXDCmEAFgxPTIzvRqiWuZFg1lPtEG1c34eS9ouF-WsVl8Z4KjBn4jR7uTQ_FT')" }}></div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">Tariq Islam</h5>
                      <p className="text-xs text-slate-500">Manager, Uttara Wellness</p>
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
                  <button onClick={() => navigate('/login?signup=true')} className="bg-white text-[#1978e5] h-14 px-6 sm:px-10 rounded-full text-base sm:text-lg font-bold hover:scale-105 transition-all">Start Free Trial</button>
                  <button onClick={() => navigate('/book-demo')} className="bg-transparent text-white border-2 border-white/30 h-14 px-6 sm:px-10 rounded-full text-base sm:text-lg font-bold hover:bg-white/10 transition-all">Book a Demo</button>
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
                <img src="/logo.svg" alt={APP_NAME} className="h-9 w-auto brightness-0 invert" />
              </div>
              <h5 className="text-white font-bold mb-4">Powering the next generation of gyms in Bangladesh</h5>
              <p className="max-w-xs mb-8">LiftLegend helps gym owners simplify operations, improve member experience, and grow their business with modern management tools.</p>
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
                  {SUPPORT_EMAIL}
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Gulshan-2, Dhaka
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>(c) 2026 {COMPANY_NAME}. All rights reserved.</p>
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
