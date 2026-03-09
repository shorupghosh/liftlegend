import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div className="flex min-h-screen">
        {/* Side Navigation */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined">fitness_center</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">LiftLegend</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Elite Gym Admin</p>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-semibold" to="/admin">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/admin/members">
              <span className="material-symbols-outlined">group</span>
              <span>Members</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/admin/plans">
              <span className="material-symbols-outlined">card_membership</span>
              <span>Plans</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/admin/attendance">
              <span className="material-symbols-outlined">qr_code_scanner</span>
              <span>Attendance</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/admin/analytics">
              <span className="material-symbols-outlined">monitoring</span>
              <span>Analytics</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/admin/notifications">
              <span className="material-symbols-outlined">forum</span>
              <span>Notifications</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/admin/staff">
              <span className="material-symbols-outlined">badge</span>
              <span>Staff</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/admin/settings">
              <span className="material-symbols-outlined">settings</span>
              <span>Settings</span>
            </Link>
            <div className="mt-4 flex items-center gap-3 px-4 py-2">
              <div className="size-8 rounded-full bg-slate-200" data-alt="User profile avatar of gym administrator" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvoYTam-SmV_GWlehbyZIRqViIbnEZ6StM4jJPD3GLxf1iWXF9unA40Pm6IhnCDyDPemeF3AUMxJcXVM09XEtIYNsszyaVIuX1wctp0ZbFNUIs38x7_uO8pzIhI4f5xXrJcsu87BxJNAZdn3WBlVXHcZD1SFcK3buajHnd-_pAuj3tjFdzY9g-CoDcgDHLNFKXzpvHRfJu7gKxuh_yrC5efgkElV9XTnXUb1muDLNcVcryk_s6v8lPp1PyQK3NiTjfrBu2CGMOTJP3')"}}></div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">Alex Johnson</p>
                <p className="text-xs text-slate-500 truncate">Manager</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Search members, plans, or transactions..." type="text"/>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="size-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="size-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined">dark_mode</span>
              </button>
            </div>
          </header>

          <div className="p-8 space-y-8 overflow-y-auto">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined">group</span>
                  </div>
                  <span className="text-emerald-500 text-sm font-semibold flex items-center">
                    <span className="material-symbols-outlined text-sm">trending_up</span> 5.2%
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Members</p>
                <h3 className="text-3xl font-bold mt-1">1,284</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <span className="text-emerald-500 text-sm font-semibold flex items-center">
                    <span className="material-symbols-outlined text-sm">trending_up</span> 12.4%
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Revenue this Month</p>
                <h3 className="text-3xl font-bold mt-1">৳42,500</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined">done_all</span>
                  </div>
                  <span className="text-emerald-500 text-sm font-semibold flex items-center">
                    <span className="material-symbols-outlined text-sm">trending_up</span> 8.1%
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Today's Check-ins</p>
                <h3 className="text-3xl font-bold mt-1">156</h3>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Line Chart Component */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-bold text-lg">Attendance Trends</h4>
                    <p className="text-sm text-slate-500">Last 30 days performance</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">4,120</p>
                    <p className="text-xs text-emerald-500 font-semibold">Total Visits</p>
                  </div>
                </div>
                <div className="h-64 flex flex-col">
                  <svg className="flex-1 w-full" preserveAspectRatio="none" viewBox="0 0 400 150">
                    <defs>
                      <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4aafed" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#4aafed" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M0 120 Q 50 110, 80 80 T 150 70 T 220 100 T 300 40 T 400 30 V 150 H 0 Z" fill="url(#lineGradient)"></path>
                    <path d="M0 120 Q 50 110, 80 80 T 150 70 T 220 100 T 300 40 T 400 30" fill="none" stroke="#4aafed" strokeLinecap="round" strokeWidth="3"></path>
                  </svg>
                  <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium px-1">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Component */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-bold text-lg">Monthly Revenue</h4>
                    <p className="text-sm text-slate-500">Yearly comparison</p>
                  </div>
                  <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold px-3 py-1 outline-none">
                    <option>2023</option>
                    <option>2024</option>
                  </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-2 px-2">
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group">
                      <div className="absolute bottom-0 w-full bg-primary/40 rounded-t-lg transition-all h-[40%] group-hover:bg-primary/60"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">JAN</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group h-full">
                      <div className="absolute bottom-0 w-full bg-primary/40 rounded-t-lg transition-all h-[65%] group-hover:bg-primary/60"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">FEB</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group h-full">
                      <div className="absolute bottom-0 w-full bg-primary/40 rounded-t-lg transition-all h-[55%] group-hover:bg-primary/60"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">MAR</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group h-full">
                      <div className="absolute bottom-0 w-full bg-primary/40 rounded-t-lg transition-all h-[80%] group-hover:bg-primary/60"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">APR</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group h-full">
                      <div className="absolute bottom-0 w-full bg-primary/80 rounded-t-lg transition-all h-[95%]"></div>
                    </div>
                    <span className="text-[10px] text-slate-900 dark:text-slate-100 font-bold">MAY</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group h-full">
                      <div className="absolute bottom-0 w-full bg-primary/40 rounded-t-lg transition-all h-[30%] group-hover:bg-primary/60"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">JUN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h4 className="font-bold text-lg">Recent Check-ins</h4>
                <button className="text-primary text-sm font-semibold hover:underline transition-all">View all activity</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Activity Item */}
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full overflow-hidden bg-slate-100" data-alt="Profile photo of active gym member" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC13G8hEQ-6H51xDQ2VCqTOjo13B8Nrr6bZMUMN5US8fudYmA1EJIfRDNzktiII0PO0LXtrrKUQ9YBLGEOtCiXELJkHVlgkHRuzC8gdv9i7_WdomJR388-1LWLxEnMJ8NNuLcDNXkj_KnMsmaxMSGkODcMbrm0m8P7AKkZXfymAfEtwmDcjt9CDPZ_b59vjOembNZg_lTN_N9taDyAZJsIvmrNcIlbVTO9RG1IVCvoziJkfV5S8P8nty_NnGTBnVvlc3qEpATJ_LQoZ')"}}></div>
                    <div>
                      <p className="text-sm font-semibold">Arif Ahmed</p>
                      <p className="text-xs text-slate-500">Premium Member • Dhaka Central Zone</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">10:24 AM</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold">SUCCESS</span>
                  </div>
                </div>
                {/* Activity Item */}
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full overflow-hidden bg-slate-100" data-alt="Profile photo of active gym member" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnJ-LCPJXPmiv-uHDOazjNs4vfWGSYPnuIcxtNtfhb8HXJld3XTjA6FDyJxhZCj4LdO5XaYsib1Th1Ds9c9yFTzFhTgw695zBdo78hzYTIeiW76Vm96ZRPJCy9yg1UqPf_f5k4iervl-yss55vveOnYlwl1HN52WVWrOdlqWDGagSeVMPi1lTF29hGlzpbUZrIjhZTbcill7aw-toL2q0v38XYeI3PeTDiDhTvBjhzWOYFLH4-jfAt8t_DQpsCP_0PpUaO3tWFpSwn')"}}></div>
                    <div>
                      <p className="text-sm font-semibold">Nusrat Jahan</p>
                      <p className="text-xs text-slate-500">Standard Plan • Banani Studio</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">10:12 AM</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold">SUCCESS</span>
                  </div>
                </div>
                {/* Activity Item */}
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full overflow-hidden bg-slate-100" data-alt="Profile photo of active gym member" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-juaC7EzbXNZH4JeeL2RAJ149V59DkxRtjVTepvGn0oQk3_sFxD042v3Mc0go-uJBkhC8NRpXXMbvwfaPlFCNeqrGG0O_zi03KIQ95KmnA7aBn4gOVwPfjObkgbF_WmWKeLYrDa37DXABoOHvup4OMqUxKax9hIuDP9_L6aqCwHiak58m6QQ7xgJqOQ-oRckzYwpuMpPRk-HvQLPAyhzRs7go0_hJAOgWvp9zfEpRd1b3Dk3pF4DTLeTnEYiTTTzjHqN64MP8ocIo')"}}></div>
                    <div>
                      <p className="text-sm font-semibold">Tanveer Hossain</p>
                      <p className="text-xs text-slate-500">Trial Member • Uttara Branch</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">09:58 AM</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold">EXPIRING SOON</span>
                  </div>
                </div>
                {/* Activity Item */}
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full overflow-hidden bg-slate-100" data-alt="Profile photo of active gym member" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUvBNHFhlxQ_-VH9oXt2lYsyLyYAJrb3U3dCrHDJ3w3aESjR-vP2NU9LlDd7HSFnliuz6RsUpZEtM_xMm6wRUpS1rGwiTDrnGqKOq2cv62XUdPINYtmAXyRixxyLOkAefftvLXCx-DItRnOY_1G9DNrwf8p73aOI_j4rNsCp9DnilS0S4HHRfuw7JmBC8AqWOlnKJvelXHqiTfocJjCZRYVPuwcUn11Tok71dK_axfeC8ULklQEAAs_raIoArqqXjJ68yssvsrZ2bR')"}}></div>
                    <div>
                      <p className="text-sm font-semibold">Farzana Akter</p>
                      <p className="text-xs text-slate-500">Premium Member • Gulshan Cardio Zone</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">09:45 AM</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold">SUCCESS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
