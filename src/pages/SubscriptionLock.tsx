import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type ActiveView = 'main' | 'plans' | 'renew' | 'contact';

export default function SubscriptionLock() {
    const { user, signOut } = useAuth();
    const [activeView, setActiveView] = useState<ActiveView>('main');
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [contactSent, setContactSent] = useState(false);
    const [contactSending, setContactSending] = useState(false);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setContactSending(true);
        setTimeout(() => {
            setContactSending(false);
            setContactSent(true);
        }, 1500);
    };

    // Plans data
    const plans = [
        { name: 'Starter', price: '৳1,000', tag: '', features: ['Up to 100 Members', 'QR Code Attendance', 'Basic Analytics'], missing: ['SMS Campaigns', 'Multi-Staff Access'] },
        { name: 'Power Plus', price: '৳1,500', tag: 'Most Popular', features: ['Up to 500 Members', 'Everything in Starter', 'Automated SMS Alerts', 'Multi-Staff Access'], missing: [] },
        { name: 'Elite Legend', price: '৳2,000', tag: '', features: ['Unlimited Members', 'Custom API Integration', 'Priority 24/7 Support', 'Dedicated Account Manager'], missing: [] },
    ];

    return (
        <div className="min-h-screen bg-neutral-default dark:bg-neutral-dark flex items-center justify-center p-4">
            <div className={`w-full ${activeView === 'plans' ? 'max-w-3xl' : 'max-w-lg'} transition-all duration-300`}>

                {/* Main View */}
                {activeView === 'main' && (
                    <>
                        {/* Lock Icon */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-red-100 dark:bg-red-950/30 text-red-500 mb-6">
                                <span className="material-symbols-outlined text-5xl">lock</span>
                            </div>
                            <h1 className="text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
                                Account Locked
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md mx-auto">
                                Your gym's subscription has expired or been suspended. Please renew your plan to continue using LiftLegend.
                            </p>
                        </div>

                        {/* Plan Details Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-lg text-neutral-text dark:text-white">Current Plan</h2>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        Expired
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="size-12 rounded-xl bg-primary-default/20 flex items-center justify-center text-primary-default">
                                        <span className="material-symbols-outlined">workspace_premium</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-neutral-text dark:text-white">Professional Plan</p>
                                        <p className="text-slate-500 text-sm">Expired on {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-neutral-text dark:text-white">৳2,999</p>
                                        <p className="text-xs text-slate-500">/month</p>
                                    </div>
                                </div>
                            </div>

                            {/* What you're missing */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">What you're missing</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: 'group', label: 'Member Management' },
                                        { icon: 'payments', label: 'Payment Tracking' },
                                        { icon: 'qr_code_scanner', label: 'Attendance Scanner' },
                                        { icon: 'monitoring', label: 'Analytics Dashboard' },
                                        { icon: 'notifications', label: 'Notifications' },
                                        { icon: 'people', label: 'Staff Management' },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">{item.icon}</span>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 space-y-3">
                                <button onClick={() => setActiveView('renew')} className="w-full bg-primary-default hover:brightness-110 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-default/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                    <span className="material-symbols-outlined">credit_card</span>
                                    Renew Subscription
                                </button>
                                <div className="flex gap-3">
                                    <button onClick={() => setActiveView('plans')} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                                        View Plans
                                    </button>
                                    <button onClick={() => setActiveView('contact')} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                                        Contact Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ===== VIEW PLANS ===== */}
                {activeView === 'plans' && (
                    <div className="space-y-6">
                        <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-sm font-semibold text-primary-default hover:underline">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>Back
                        </button>

                        {/* Plans container card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#1978e5] to-blue-600 px-8 py-8 text-center">
                                <h2 className="text-2xl font-extrabold text-white tracking-tight">Choose Your Plan</h2>
                                <p className="text-blue-100 text-sm mt-1">No hidden fees. Cancel anytime.</p>
                            </div>

                            {/* Plan cards */}
                            <div className="p-6 grid md:grid-cols-3 gap-4">
                                {plans.map((plan, i) => (
                                    <div key={plan.name}
                                        className={`rounded-xl p-5 flex flex-col relative transition-all ${
                                            i === 1
                                                ? 'bg-gradient-to-b from-[#1978e5] to-blue-700 text-white ring-2 ring-[#1978e5] shadow-lg shadow-blue-500/20 md:-mt-4 md:-mb-2 md:py-7'
                                                : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        {plan.tag && (
                                            <span className={`self-start text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 ${
                                                i === 1 ? 'bg-white/20 text-white' : 'bg-[#1978e5]/10 text-[#1978e5]'
                                            }`}>{plan.tag}</span>
                                        )}

                                        <h3 className={`text-base font-bold ${i === 1 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>

                                        <div className="flex items-baseline gap-1 mt-2 mb-5">
                                            <span className={`text-3xl font-black ${i === 1 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                                            <span className={`text-xs ${i === 1 ? 'text-blue-200' : 'text-slate-500'}`}>/month</span>
                                        </div>

                                        <div className={`h-px w-full mb-4 ${i === 1 ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-600'}`} />

                                        <ul className="space-y-2.5 flex-1">
                                            {plan.features.map((f) => (
                                                <li key={f} className={`flex items-center gap-2 text-sm ${i === 1 ? 'text-blue-50' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    <span className={`material-symbols-outlined text-sm ${i === 1 ? 'text-green-300' : 'text-green-500'}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                    {f}
                                                </li>
                                            ))}
                                            {plan.missing.map((f) => (
                                                <li key={f} className={`flex items-center gap-2 text-sm line-through ${i === 1 ? 'text-blue-300/50' : 'text-slate-400'}`}>
                                                    <span className={`material-symbols-outlined text-sm ${i === 1 ? 'text-blue-300/40' : 'text-slate-300 dark:text-slate-600'}`}>cancel</span>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => setActiveView('renew')}
                                            className={`w-full mt-5 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-[0.97] ${
                                                i === 1
                                                    ? 'bg-white text-[#1978e5] hover:bg-blue-50 shadow-md'
                                                    : 'bg-[#1978e5] text-white hover:bg-blue-600 shadow-sm'
                                            }`}
                                        >
                                            Select & Pay
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== RENEW / bKash QR ===== */}
                {activeView === 'renew' && (
                    <div className="space-y-6">
                        <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-sm font-semibold text-primary-default hover:underline">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>Back
                        </button>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
                            <div className="p-8 text-center">
                                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-pink-100 dark:bg-pink-900/20 text-pink-600 mb-4">
                                    <span className="material-symbols-outlined text-4xl">qr_code_2</span>
                                </div>
                                <h2 className="text-xl font-extrabold text-neutral-text dark:text-white mb-1">Pay with bKash</h2>
                                <p className="text-slate-500 text-sm mb-6">Scan the QR code below with your bKash app to renew your subscription.</p>

                                {/* bKash QR Placeholder */}
                                <div className="mx-auto w-56 h-56 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/10 rounded-2xl border-2 border-dashed border-pink-300 dark:border-pink-800 flex flex-col items-center justify-center gap-3 mb-6">
                                    <span className="material-symbols-outlined text-6xl text-pink-500">qr_code_scanner</span>
                                    <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Demo QR Code</span>
                                    <span className="text-[10px] text-pink-400">bKash Payment</span>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Send payment to:</p>
                                    <p className="text-xl font-black text-neutral-text dark:text-white">01700-000000</p>
                                    <p className="text-xs text-slate-500 mt-1">bKash Personal Number</p>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left">
                                    <div className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5">info</span>
                                        <div>
                                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">After Payment</p>
                                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">Send your bKash Transaction ID to our support team via the Contact Support page. We'll activate your subscription within 1 hour.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 pb-8 flex gap-3">
                                <button onClick={() => setActiveView('plans')} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                                    View Plans
                                </button>
                                <button onClick={() => setActiveView('contact')} className="flex-1 bg-primary-default text-white font-bold py-3 rounded-xl hover:brightness-110 transition-all text-sm shadow-lg shadow-primary-default/20">
                                    Send Transaction ID
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== CONTACT SUPPORT ===== */}
                {activeView === 'contact' && (
                    <div className="space-y-6">
                        <button onClick={() => { setActiveView('main'); setContactSent(false); }} className="flex items-center gap-2 text-sm font-semibold text-primary-default hover:underline">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>Back
                        </button>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
                            {contactSent ? (
                                <div className="p-10 text-center">
                                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 mb-4">
                                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-neutral-text dark:text-white mb-2">Message Sent!</h2>
                                    <p className="text-slate-500 text-sm">We'll get back to you within 24 hours. Thank you!</p>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="p-8 space-y-5">
                                    <div className="text-center mb-2">
                                        <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary-default/10 text-primary-default mb-3">
                                            <span className="material-symbols-outlined text-3xl">support_agent</span>
                                        </div>
                                        <h2 className="text-xl font-extrabold text-neutral-text dark:text-white">Contact Support</h2>
                                        <p className="text-slate-500 text-sm mt-1">Send us a message and we'll respond quickly.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="contact-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Name *</label>
                                        <input id="contact-name" type="text" required value={contactForm.name}
                                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                                            placeholder="Your name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="contact-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email *</label>
                                        <input id="contact-email" type="email" required value={contactForm.email}
                                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                                            placeholder="you@email.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="contact-message" className="text-sm font-medium text-slate-700 dark:text-slate-300">Message *</label>
                                        <textarea id="contact-message" required rows={4} value={contactForm.message}
                                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all resize-none"
                                            placeholder="Describe your issue or paste your bKash Transaction ID..." />
                                    </div>

                                    <button type="submit" disabled={contactSending}
                                        className="w-full py-3.5 bg-primary-default hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-primary-default/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70">
                                        {contactSending ? (
                                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">send</span>
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer links */}
                <div className="mt-6 text-center space-y-3">
                    <p className="text-slate-500 text-sm">
                        Logged in as <span className="font-medium text-neutral-text dark:text-white">{user?.email}</span>
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/" className="text-primary-default text-sm font-semibold hover:underline">Home</Link>
                        <button onClick={signOut} className="text-slate-500 text-sm font-semibold hover:text-red-500 transition-colors">Sign Out</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
