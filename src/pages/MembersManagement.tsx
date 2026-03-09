import React from 'react';
import { Link } from 'react-router-dom';

export default function MembersManagement() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="layout-container flex h-full grow flex-col">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-6 py-4 lg:px-20">
          <div className="flex items-center gap-4">
            <div className="size-8 text-primary">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-black leading-tight tracking-tight">LiftLegend</h2>
          </div>
          <div className="flex flex-1 justify-end gap-6 items-center">
            <nav className="hidden md:flex items-center gap-8">
              <Link className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors" to="/admin">Dashboard</Link>
              <Link className="text-primary text-sm font-semibold" to="/admin/members">Members</Link>
              <Link className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors" to="/admin/staff">Staff</Link>
              <Link className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors" to="/admin/plans">Plans</Link>
            </nav>
            <div className="flex gap-3">
              <button className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-col flex-1 px-6 py-8 lg:px-20 max-w-[1440px] mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black tracking-tight">Gym Members</h1>
              <p className="text-slate-500 dark:text-slate-400 text-base">Directory of all registered gym members and their subscription status.</p>
            </div>
            <button className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-energetic-orange text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>Add Member</span>
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400">search</span>
              </div>
              <input className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl h-14 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Search by name, email or ID..." type="text"/>
            </div>
            <div className="flex gap-4">
              <div className="relative min-w-[200px]">
                <select className="w-full appearance-none bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl h-14 px-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="">All Plans</option>
                  <option value="basic">Basic Silver</option>
                  <option value="premium">Premium Gold</option>
                  <option value="elite">Elite Platinum</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400">filter_list</span>
                </div>
              </div>
              <button className="flex items-center justify-center w-14 h-14 bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Member</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Joined</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">RU</div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">Rahim Uddin</span>
                          <span className="text-xs text-slate-500">rahim.uddin@email.bd</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center rounded-md bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30">Premium Gold (৳5,000)</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">Jan 15, 2023</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-600"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                      </div>
                    </td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">FK</div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">Fatima Khatun</span>
                          <span className="text-xs text-slate-500">fatima.k@outlook.com.bd</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">Basic Silver (৳2,500)</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">Feb 10, 2023</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-600"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                      </div>
                    </td>
                  </tr>
                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">SH</div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">Sajid Hossain</span>
                          <span className="text-xs text-slate-500">sajid.h@gmail.com</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center rounded-md bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30">Premium Gold (৳5,000)</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">Nov 05, 2022</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/20 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                        <span className="size-1.5 rounded-full bg-red-600"></span>
                        Expired
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                      </div>
                    </td>
                  </tr>
                  {/* Row 4 */}
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">AT</div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">Anika Tabassum</span>
                          <span className="text-xs text-slate-500">anika.t@tech.com.bd</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center rounded-md bg-cyan-50 dark:bg-cyan-900/20 px-2 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/30">Elite Platinum (৳10,000)</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">May 20, 2023</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-600"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Pagination Component */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Showing 1 to 4 of 24 members</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="flex items-center justify-center size-9 rounded-lg bg-primary text-white font-bold text-sm">1</button>
                <button className="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-600 hover:bg-slate-100 transition-colors text-sm">2</button>
                <button className="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-600 hover:bg-slate-100 transition-colors text-sm">3</button>
                <span className="px-1 text-slate-400">...</span>
                <button className="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-600 hover:bg-slate-100 transition-colors text-sm">6</button>
                <button className="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-500 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Stats Footer Preview */}
        <footer className="mt-auto px-6 py-10 lg:px-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Members</span>
              <span className="text-2xl font-black">1,284</span>
              <div className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +12% this month
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Active Plans</span>
              <span className="text-2xl font-black">1,102</span>
              <div className="text-xs text-slate-400 font-bold">86% retention rate</div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Renewals Due</span>
              <span className="text-2xl font-black text-energetic-orange">42</span>
              <div className="text-xs text-slate-400 font-bold">Next 7 days</div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Avg. Attendance</span>
              <span className="text-2xl font-black">78%</span>
              <div className="text-xs text-slate-400 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">query_stats</span>
                Daily peak: 6PM
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
