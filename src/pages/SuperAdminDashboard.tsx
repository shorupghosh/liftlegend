import React from 'react';
import { Link } from 'react-router-dom';

export default function SuperAdminDashboard() {
  return (
    <div className="bg-background-light text-slate-900 font-display">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-charcoal text-slate-100 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-700 flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-charcoal">
              <span className="material-symbols-outlined font-bold">fitness_center</span>
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase">LiftLegend</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-white font-medium" to="/super-admin">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" to="#">
              <span className="material-symbols-outlined">apartment</span>
              <span>Gym Clients</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" to="#">
              <span className="material-symbols-outlined">payments</span>
              <span>Revenue Tracking</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" to="#">
              <span className="material-symbols-outlined">health_and_safety</span>
              <span>System Health</span>
            </Link>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administration</p>
            </div>
            <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" to="#">
              <span className="material-symbols-outlined">settings</span>
              <span>System Settings</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" to="#">
              <span className="material-symbols-outlined">support_agent</span>
              <span>Support</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-700">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-full bg-slate-600 border-2 border-primary" data-alt="Super Admin Profile Picture" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCiRBVNuZHPCVJp4WYCeSNyceJ9Y7NOpoq416QvUAeaT66zPCiJsY2TVc_RFmLXdSzgdSP_wSA3xjQVZxqGX4e2KYRS2RJCB8uR0HHMk-xkcI2AdW5f03-5TA7d8Mg3NMlHrd0cmYRylt09N1U2qIhYsEkrLDGRMPDoe-Lnhixe-aaHoXS4tAEaX1thHN0bbEcClkORQ2Zxn8XmGP8TNvPrS8kWO9kCQnG4Jin528k35gCtYuMlj4ERKOznM7Bo_pLAL29Sg9FFqM3t')"}}></div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">Ariful Haque</p>
                  <p className="text-xs text-slate-400 truncate">Super Admin</p>
                </div>
              </div>
              <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4 w-1/3">
              <div className="relative w-full max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Search gyms, transactions, or logs..." type="text"/>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="size-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="size-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined">help</span>
              </button>
              <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
              <div className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm font-medium text-slate-700">Admin Panel</span>
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Title & Actions */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
                <p className="text-slate-500 mt-1">Real-time performance across all global gym locations.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                  Last 30 Days
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-lg">add</span>
                  Onboard New Gym
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Total Registered Gyms</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">1,284</h3>
                  </div>
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <span className="material-symbols-outlined">apartment</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex items-center text-emerald-600 text-sm font-bold">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    12%
                  </span>
                  <span className="text-slate-400 text-sm">vs last month</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Total Revenue (MRR)</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">৳425,000</h3>
                  </div>
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex items-center text-emerald-600 text-sm font-bold">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    8.4%
                  </span>
                  <span className="text-slate-400 text-sm">vs last month</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">System Uptime</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">99.99%</h3>
                  </div>
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                    <span className="material-symbols-outlined">health_and_safety</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex items-center text-slate-600 text-sm font-bold">
                    Healthy
                  </span>
                  <span className="text-slate-400 text-sm">All clusters operational</span>
                </div>
              </div>
            </div>

            {/* Main Chart Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Revenue Growth Trends</h4>
                  <p className="text-sm text-slate-500">Subscription revenue distribution across the fiscal year.</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-primary"></span>
                    <span className="text-xs font-semibold text-slate-600">Enterprise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-slate-300"></span>
                    <span className="text-xs font-semibold text-slate-600">Pro</span>
                  </div>
                </div>
              </div>
              <div className="h-64 relative">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
                  <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="1000" y1="0" y2="0"></line>
                  <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="1000" y1="25" y2="25"></line>
                  <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="1000" y1="50" y2="50"></line>
                  <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="1000" y1="75" y2="75"></line>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#4aafed" stopOpacity="0.2"></stop>
                      <stop offset="100%" stopColor="#4aafed" stopOpacity="0"></stop>
                    </linearGradient>
                  </defs>
                  <path d="M0,80 Q100,60 200,70 T400,30 T600,50 T800,20 T1000,40 L1000,100 L0,100 Z" fill="url(#areaGradient)"></path>
                  <path d="M0,80 Q100,60 200,70 T400,30 T600,50 T800,20 T1000,40" fill="none" stroke="#4aafed" strokeLinecap="round" strokeWidth="3"></path>
                  <circle cx="200" cy="70" fill="#4aafed" r="4"></circle>
                  <circle cx="400" cy="30" fill="#4aafed" r="4"></circle>
                  <circle cx="600" cy="50" fill="#4aafed" r="4"></circle>
                  <circle cx="800" cy="20" fill="#4aafed" r="4"></circle>
                </svg>
                <div className="flex justify-between mt-4 px-2">
                  <span className="text-xs font-bold text-slate-400">JAN</span>
                  <span className="text-xs font-bold text-slate-400">FEB</span>
                  <span className="text-xs font-bold text-slate-400">MAR</span>
                  <span className="text-xs font-bold text-slate-400">APR</span>
                  <span className="text-xs font-bold text-slate-400">MAY</span>
                  <span className="text-xs font-bold text-slate-400">JUN</span>
                  <span className="text-xs font-bold text-slate-400">JUL</span>
                </div>
              </div>
            </div>

            {/* Gym Clients Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-900">Gym Clients</h4>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gym Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subscription Tier</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Sync</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-slate-200" data-alt="Titan Fitness Logo" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBikRiMlXPVB9xnBjKxEgo9OLsB8v_Ig1zmRSf56EDc6r5zERy4F0c_ia5AU5Pk7INh3FwABizpSdSq7MYPhF60lcDpPIdrz7udr0JyDZwnhoiFWQ50Z5D_gbq4JnD5uFU451QvHkHAFDsqxRdH6x9IplpwH7DUEYBvj7rmqe9RLORaz5iSfy7CoVcudw4dT6Xb3uECYqkuC2bW4Wh3EG6mnZK8R-D8CXj4lEjvNfp1WXCQe-GtdAZ07jpNoeCtV5BrTmT0ubz72KqA')"}}></div>
                          <span className="font-semibold text-slate-700">Titan Fitness Dhaka</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">Enterprise</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Active</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">2 mins ago</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 font-semibold text-sm mr-4">Manage</button>
                        <button className="text-slate-400 hover:text-slate-600">
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-slate-200" data-alt="Iron Palace Logo" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4I9WW_UfBVlL5_r6UEuR0gpcWcjwXN8pTZyaeNImNphrxBpoXoUj7zvC6Awnsko8EYT8xoL0Ox-X2uU6dP0NjQjXUaL3-LvQ3-SXIqn-Iq7oFGjbIrJWFmpxjaFzQh23NwnZCUFYxxDL6-wEmjN-Yz7ZWmiJcNkMA_q5gpUS--soU1Ti66awTAhDfUkEEG8WizdjHZMxBU1gd6ZMx3c5WZM21HqPiDYt_DXaJCYzvn4kvt8wqMzoLEWiHS7k8O2zB3cGCEcL7CC0V')"}}></div>
                          <span className="font-semibold text-slate-700">Chittagong Power Gym</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">Pro</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Active</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">1 hour ago</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 font-semibold text-sm mr-4">Manage</button>
                        <button className="text-slate-400 hover:text-slate-600">
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-slate-200" data-alt="Zenith Yoga Logo" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNB15TY8rNOAgvhabtU2475dl6ElSpfo4eWGkzM9nMIW8-JB-RamUMZ1S-_sjRHyNhTEtzITdPM-1GrRaZhJKQE2Lt3MHyojNtIop_UV9S04uqvmQ6l7GJ5eE69i5BC4Zu1ulJCD-wZm3uqvX7lICsAy-GACDO8nG7DQNdQRxmVPDtVygTNmRLJfBi0hs9-bKMfCX9mJAuldwpePHxytGetsqsYkLraApQqYV5d55Jc3gjqq094OTnUCLJSThMdtV2kD7Qt2r6VjKV')"}}></div>
                          <span className="font-semibold text-slate-700">Sylhet Yoga Collective</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">Pro</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Expiring Soon</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">4 hours ago</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 font-semibold text-sm mr-4">Manage</button>
                        <button className="text-slate-400 hover:text-slate-600">
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-slate-200" data-alt="Core Strength Logo" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCnBplmTdIEn80deWvX2TbDqbhrcxt3y_sAvF03AQ06CK_WWYxH24NRUNil2xEsHS1Wsp9XFhBqNcGlKzHlWx-EJWufj9VKk5kQxip38gkgbHqjfKQu_gPks0_fpG7NfsIVRNsQwLT85Z-J8Jd-ATNEj9lBnkmfJrcjVqB0azAs5zUw8vp8U97P3STcQ9k4kSKpeihjEmc2JoGjCKaserWEmPLBfzh7PydSEi4I__tFQmmKsXp6yzU6NTAkyHUHhNJ8dsp2NQr27eoZ')"}}></div>
                          <span className="font-semibold text-slate-700">Rajshahi Strength &amp; Fitness</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">Enterprise</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">Inactive</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">2 days ago</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 font-semibold text-sm mr-4">Manage</button>
                        <button className="text-slate-400 hover:text-slate-600">
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Showing 1 to 4 of 1,284 gyms</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-white border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50">Previous</button>
                  <button className="px-3 py-1 bg-white border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-100">Next</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
