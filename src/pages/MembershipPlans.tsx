import React from 'react';
import { Link } from 'react-router-dom';

export default function MembershipPlans() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="relative flex flex-col min-h-screen w-full">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-10 py-4 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="text-primary size-8">
              <span className="material-symbols-outlined text-3xl">fitness_center</span>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight">LiftLegend</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <button className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">person</span>
              </div>
              <span className="text-sm font-semibold hidden sm:block">Admin</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 md:px-10 py-8">
          {/* Sidebar & Content Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex flex-col gap-6">
              <div className="flex items-center gap-3 px-2">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-white text-2xl">admin_panel_settings</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-base font-bold">Gym Admin</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">Management Console</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all" to="/admin">
                  <span className="material-symbols-outlined">dashboard</span>
                  <span className="text-sm font-semibold">Dashboard</span>
                </Link>
                <Link className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20" to="/admin/plans">
                  <span className="material-symbols-outlined">card_membership</span>
                  <span className="text-sm font-bold">Membership Plans</span>
                </Link>
                <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all" to="/admin/members">
                  <span className="material-symbols-outlined">group</span>
                  <span className="text-sm font-semibold">Members</span>
                </Link>
                <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all" to="#">
                  <span className="material-symbols-outlined">payments</span>
                  <span className="text-sm font-semibold">Revenue</span>
                </Link>
                <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all" to="/admin/analytics">
                  <span className="material-symbols-outlined">monitoring</span>
                  <span className="text-sm font-semibold">Reports</span>
                </Link>
              </nav>
              <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-xl shadow-primary/20">
                <p className="text-xs font-medium opacity-80 mb-1">Current Billing</p>
                <p className="text-lg font-bold mb-3">৳1,24,000.00 <span className="text-xs font-normal opacity-70">this month</span></p>
                <button className="w-full py-2 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold hover:bg-white/30 transition-all">View Invoice</button>
              </div>
            </aside>

            {/* Page Content */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-1">Membership Plans</h2>
                  <p className="text-slate-500 dark:text-slate-400">Configure and manage your gym's subscription tiers</p>
                </div>
                <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                  <span className="material-symbols-outlined text-xl">add</span>
                  Create New Plan
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Basic Plan */}
                <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Basic</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Standard Access</p>
                    </div>
                    <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">fitness_center</span>
                    </span>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1"><span className="text-4xl font-black">৳1,500</span><span className="text-slate-500 font-medium">/month</span></div>
                    <p className="text-xs text-slate-400 mt-1">Billed monthly</p>
                  </div>
                  <button className="w-full bg-primary text-white py-3 rounded-xl font-bold mb-8 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20">
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Edit Plan
                  </button>
                  <div className="space-y-4 flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Included Features</p>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                      <span className="text-sm font-medium">Access to gym floor 24/7</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                      <span className="text-sm font-medium">Locker room access</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-400">
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-xl">cancel</span>
                      <span className="text-sm font-medium">Standard app features</span>
                    </div>
                  </div>
                </div>

                {/* Pro Plan (Featured) */}
                <div className="relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border-2 border-primary p-6 shadow-2xl shadow-primary/10 transition-all duration-300 transform scale-105 z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                  <div className="flex justify-between items-start mb-6 pt-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pro</h3>
                      <p className="text-xs text-primary uppercase tracking-widest font-bold">Premium Performance</p>
                    </div>
                    <span className="bg-primary/10 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-primary">bolt</span>
                    </span>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1"><span className="text-4xl font-black">৳3,000</span><span className="text-slate-500 font-medium">/month</span></div>
                    <p className="text-xs text-slate-400 mt-1">Billed monthly</p>
                  </div>
                  <button className="w-full bg-primary text-white py-3 rounded-xl font-bold mb-8 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Edit Plan
                  </button>
                  <div className="space-y-4 flex-1">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Included Features</p>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                      <span className="text-sm font-medium">All Basic features included</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                      <span className="text-sm font-medium">Unlimited group classes</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                      <span className="text-sm font-medium">1 Personal training session /mo</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                      <span className="text-sm font-medium">Guest passes (2 per month)</span>
                    </div>
                  </div>
                </div>

                {/* VIP Plan */}
                <div className="flex flex-col bg-slate-900 dark:bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">VIP</h3>
                      <p className="text-xs text-primary uppercase tracking-widest font-bold">Elite Luxury</p>
                    </div>
                    <span className="bg-slate-800 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-primary">workspace_premium</span>
                    </span>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1"><span className="text-4xl font-black">৳5,000</span><span className="text-slate-400 font-medium">/month</span></div>
                    <p className="text-xs text-slate-500 mt-1">Billed monthly</p>
                  </div>
                  <button className="w-full bg-primary text-white py-3 rounded-xl font-bold mb-8 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20">
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Edit Plan
                  </button>
                  <div className="space-y-4 flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Included Features</p>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                      <span className="text-sm font-medium text-slate-300">All Pro features included</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                      <span className="text-sm font-medium text-slate-300">Pool &amp; Sauna access</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                      <span className="text-sm font-medium text-slate-300">Unlimited guest passes</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-300">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                      <span className="text-sm font-medium">Nutrition &amp; Recovery coaching</span>
                    </div>
                  </div>
                </div>

                {/* Add New Plan Card */}
                <div className="flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 min-h-[400px] hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <span className="material-symbols-outlined text-primary text-3xl font-bold">add</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">Create Custom Plan</h3>
                  <p className="text-sm text-slate-500 text-center max-w-[200px]">Define your own rules, features, and pricing for a new membership tier.</p>
                </div>
              </div>

              {/* Additional Settings Section */}
              <div className="mt-12 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <h3 className="text-lg font-bold">Subscription Policies</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-4 rounded-xl bg-background-light dark:bg-background-dark">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Annual Discount</p>
                    <p className="text-sm font-semibold">Enabled (20% OFF)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-background-light dark:bg-background-dark">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Setup Fee</p>
                    <p className="text-sm font-semibold">$49.00 / one-time</p>
                  </div>
                  <div className="p-4 rounded-xl bg-background-light dark:bg-background-dark">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cancellation</p>
                    <p className="text-sm font-semibold">30-day notice</p>
                  </div>
                  <div className="p-4 rounded-xl bg-background-light dark:bg-background-dark">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Currency</p>
                    <p className="text-sm font-semibold">USD ($)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-6 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© 2024 LiftLegend Gym Management Systems. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-slate-500 hover:text-primary text-sm font-medium" href="#">Privacy Policy</a>
              <a className="text-slate-500 hover:text-primary text-sm font-medium" href="#">Terms of Service</a>
              <a className="text-slate-500 hover:text-primary text-sm font-medium" href="#">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
