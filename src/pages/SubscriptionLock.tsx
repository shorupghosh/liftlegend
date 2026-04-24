import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PLAN_DISPLAY } from '../lib/planConfig';

type ActiveView = 'main' | 'plans' | 'renew' | 'contact';

export default function SubscriptionLock() {
    const { user, signOut, subscriptionTier, trialEndsAt } = useAuth();
    const [activeView, setActiveView] = useState<ActiveView>('main');
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [contactSent, setContactSent] = useState(false);
    const [contactSending, setContactSending] = useState(false);
    const [bkashImgError, setBkashImgError] = useState(false);

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setContactSending(true);
        setTimeout(() => {
            setContactSending(false);
            setContactSent(true);
        }, 1500);
    };

    // Plans data (Matches Landing Page exactly)
    const plans = [
        { name: 'Basic', price: 'BDT 1,000', tag: '', features: ['Up to 250 Members', 'Manual Attendance', 'Basic Analytics', 'Payment Tracking'], missing: ['Staff Accounts', 'QR Code Attendance', 'Advanced Reports'] },
        { name: 'Advanced', price: 'BDT 1,500', tag: 'Most Popular', features: ['Up to 1200 members', '3 staff accounts', 'Attendance tracking', 'Advanced Analytics', 'Priority Support'], missing: ['Custom Integrations', 'Multi-Gym'] },
        { name: 'Premium', price: 'BDT 2,000', tag: 'All Access', features: ['Unlimited Members & Staff', 'QR Code Check-in System', 'Bulk SMS & WhatsApp', 'Dedicated Manager'], missing: [] },
    ];

    const currentPlanDisplay = PLAN_DISPLAY[subscriptionTier || 'ADVANCED'] || PLAN_DISPLAY['ADVANCED'];

    return (
        <div className="min-h-screen bg-neutral-default dark:bg-neutral-dark flex flex-col items-center justify-center p-4 py-12">
            <div className={`w-full ${activeView === 'plans' ? 'max-w-4xl' : 'max-w-lg'} transition-all duration-300`}>

                {/* Main View */}
                {activeView === 'main' && (
                    <>
                        {/* Welcome / Lock Icon */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-primary-default/10 text-primary-default mb-6">
                                <span className="material-symbols-outlined text-5xl">verified</span>
                            </div>
                            <h1 className="text-3xl font-display font-extrabold text-neutral-text dark:text-white tracking-tight">
                                Welcome to LiftLegend
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md mx-auto font-medium">
                                Your 30-day trial or subscription has expired. Choose an easy-to-pay scheme to continue managing your gym seamlessly.
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
                                    <div className={`size-12 rounded-xl flex items-center justify-center ${currentPlanDisplay.priceNumeric > 0 ? 'bg-primary-default/20 text-primary-default' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                        <span className="material-symbols-outlined">{currentPlanDisplay.icon || 'workspace_premium'}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-neutral-text dark:text-white">{currentPlanDisplay.name}</p>
                                        <p className="text-slate-500 text-sm">Expired on {trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl sm:text-2xl font-black text-neutral-text dark:text-white">{currentPlanDisplay.price}</p>
                                        <p className="text-xs text-slate-500">{currentPlanDisplay.priceNumeric > 0 ? '/month' : 'Forever'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* What you're missing */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Features Locked</h3>
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
                                <p className="text-blue-100 text-sm mt-1">Select the best plan for your gym's current size.</p>
                            </div>

                            {/* Plan cards */}
                            <div className="p-6 grid md:grid-cols-3 gap-6">
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
                                            <span className={`text-2xl sm:text-3xl font-black ${i === 1 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
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
                                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-[#e2136e]/10 text-[#e2136e] mb-4">
                                    <span className="material-symbols-outlined text-4xl">qr_code_2</span>
                                </div>
                                <h2 className="text-xl font-extrabold text-neutral-text dark:text-white mb-1">Pay with bKash</h2>
                                <p className="text-slate-500 text-sm mb-6">Scan the QR code below or send money to our personal number.</p>

                                {/* bKash QR Scanner Image */}
                                <div className="mx-auto max-w-[260px] aspect-square bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center overflow-hidden mb-6 relative p-3">
                                    {bkashImgError ? (
                                        <>
                                            <span className="material-symbols-outlined text-5xl text-slate-400 mb-2">qr_code_2</span>
                                            <p className="text-xs text-slate-500 font-medium px-4 text-center">Scan via bKash app<br/>or send to the number below</p>
                                        </>
                                    ) : (
                                        <img src="/bkash-qr.jpg" alt="bKash QR Scanner" className="w-full h-full object-contain relative z-10 rounded-xl" 
                                            onError={() => setBkashImgError(true)} 
                                        />
                                    )}
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 mb-6 ring-1 ring-slate-200 dark:ring-slate-700 space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Send payment to (Personal):</p>
                                        <p className="text-3xl font-black text-[#e2136e] tracking-tight">01756-625762</p>
                                    </div>
                                    <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="flex flex-col items-center">
                                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Payment Reference / Referral Code:</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <code className="text-lg font-mono font-bold bg-white dark:bg-slate-900 px-4 py-2 rounded-lg text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm tracking-wider">
                                                {user?.id ? user.id.slice(0, 8).toUpperCase() : 'LIFT24'}
                                            </code>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">(Please include this code in your bKash reference)</p>
                                    </div>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-amber-600 text-xl mt-0.5">info</span>
                                        <div>
                                            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Next Steps</p>
                                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 leading-relaxed">After successfully sending the money, click the button below to message Support with your <b>Transaction ID</b> and Gym Name. We'll activate your subscription instantly.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
                                <button onClick={() => setActiveView('plans')} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                                    View Plans
                                </button>
                                <button onClick={() => setActiveView('contact')} className="flex-1 bg-[#1978e5] text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-all text-sm shadow-lg shadow-blue-500/20 text-center">
                                    Contact Support & Send ID
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
                                <div className="p-10 text-center flex flex-col items-center">
                                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 mb-4">
                                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-neutral-text dark:text-white mb-2">Message Sent!</h2>
                                    <p className="text-slate-500 text-sm mb-6 max-w-sm">Thank you. Our team is verifying your payment and will activate your subscription shortly. You'll receive an email confirmation.</p>
                                    <button onClick={signOut} className="bg-slate-100 dark:bg-slate-800 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-200 transition-colors">Return to Login</button>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="p-8 space-y-5">
                                    <div className="text-center mb-4">
                                        <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary-default/10 text-primary-default mb-3">
                                            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                                        </div>
                                        <h2 className="text-xl font-extrabold text-neutral-text dark:text-white">Verify Payment</h2>
                                        <p className="text-slate-500 text-sm mt-1">Send us your Transaction ID to activate your plan.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="contact-name" className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Gym Name *</label>
                                        <input id="contact-name" type="text" required value={contactForm.name}
                                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                                            placeholder="Fitness Center Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="contact-email" className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Email *</label>
                                        <input id="contact-email" type="email" required value={contactForm.email}
                                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all"
                                            placeholder="you@email.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="contact-message" className="text-sm font-bold text-slate-700 dark:text-slate-300">bKash Transaction ID *</label>
                                        <textarea id="contact-message" required rows={3} value={contactForm.message}
                                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-default/20 focus:border-primary-default outline-none transition-all resize-none font-mono text-sm"
                                            placeholder="e.g. TXN987654321..." />
                                    </div>

                                    <button type="submit" disabled={contactSending}
                                        className="w-full py-3.5 mt-2 bg-primary-default hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-primary-default/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70">
                                        {contactSending ? (
                                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">send</span>
                                                Submit & Activate Account
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer links */}
                <div className="mt-8 text-center space-y-3">
                    <p className="text-slate-500 text-xs">
                        Logged in as <span className="font-bold text-neutral-text dark:text-white">{user?.email}</span>
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/" className="text-slate-400 text-xs font-semibold hover:text-primary-default transition-colors">Go to Home</Link>
                        <button onClick={signOut} className="text-red-400 text-xs font-semibold hover:text-red-500 transition-colors">Sign Out instead</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
