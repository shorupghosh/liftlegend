import React from 'react';
import { Link } from 'react-router-dom';

export default function AttendanceScanner() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar-dark text-white flex flex-col fixed h-full z-20">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-primary rounded-lg p-1.5">
              <span className="material-symbols-outlined text-white text-2xl">fitness_center</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">LiftLegend</h1>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Gym Management</p>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" to="/admin">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg transition-colors" to="/admin/attendance">
              <span className="material-symbols-outlined">qr_code_scanner</span>
              <span className="font-medium">Attendance</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" to="/admin/members">
              <span className="material-symbols-outlined">group</span>
              <span className="font-medium">Members</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" to="/admin/plans">
              <span className="material-symbols-outlined">exercise</span>
              <span className="font-medium">Workouts</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" to="/admin/settings">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-medium">Settings</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-white/10">
            <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">Attendance Scanner</h2>
              <p className="text-slate-500">Scan member QR codes for facility entry</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">person</span>
                </div>
                <span className="font-medium text-sm">Admin View</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Scanner */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notifications Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Access Granted</p>
                    <p className="text-xs">Arif Rahman - Platinum Membership (Active)</p>
                  </div>
                  <button className="material-symbols-outlined text-emerald-400 hover:text-emerald-600">close</button>
                </div>
                <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl">
                  <span className="material-symbols-outlined text-rose-600">error</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Access Denied</p>
                    <p className="text-xs">Nusrat Jahan - Membership Expired (12 days ago)</p>
                  </div>
                  <button className="material-symbols-outlined text-rose-400 hover:text-rose-600">close</button>
                </div>
              </div>

              {/* Scanner UI */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl border-4 border-slate-200 dark:border-slate-800">
                {/* Placeholder for Camera Feed */}
                <img alt="Interior gym background for scanner view" className="w-full h-full object-cover opacity-60 grayscale" data-alt="Modern gym interior with weight racks and neon lights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLkesUob5NYzWjFqYnqJoFm9J9bG5hy83bJMKGbhXpmGAtMoO9d8Rqr8oKPdmN_GuB02fkV7QcZSR8S5md2Hop7V6WZgVfi9jm2UH3fVh-1r8B48sNBnHd66Gtw39D1Lmw1X2lRR9UeNVZJI_qUUThnu1P6LkFWgVAc0joG6dVwbj-dMYcebJgNnmWD4wB2LoNngaMa6HU5cjUzNWT8SaLyDGnQfvjvVEyo3T0r7pXewG5NkH_y7iuSY7TGJkY5NP0OFCEVS_rDRZf"/>
                {/* Scanner Overlays */}
                <div className="absolute inset-0 scanner-overlay"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64 border-2 border-primary/50 rounded-2xl">
                    {/* Corner Accents */}
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                    {/* Scanning Line */}
                    <div className="scan-line"></div>
                  </div>
                </div>
                {/* Scanner Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                  <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-white/20">
                    <span className="material-symbols-outlined">flash_on</span>
                  </button>
                  <button className="px-6 py-2 rounded-full bg-primary text-white font-bold shadow-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">camera_alt</span>
                    Scanning Active
                  </button>
                  <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-white/20">
                    <span className="material-symbols-outlined">flip_camera_ios</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Feed */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    Live Feed
                  </h3>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Recent Check-ins</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {/* Feed Items */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Successful Check-in */}
                    <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                          <img alt="Member profile photo" data-alt="Close up portrait of a young man smiling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu3vQ3BD4hh_oqo_3NA1rZ49e7MgQvaDYIEWBWx0tdSTLisMLIyxPX18WJCfqMeyJ1w6kEpYDUpl-2UssnLtoZDRP0OTORuKjT2aULjkoBnbdeb-EoCqV48sIH5u9SoW5JKk_h86gQktf46m8NjQ6G_gAgBE3ALNlczeFGZVecZaTVN_bMS4a-ZEFQEIK-tYJfRbkxEi9-FByTDeeJXd4XsaWoYg0gBBCWl36zBvs1ZYBKgHhI3O3NSyQzrPiT6tNUPR5nDt3Jn7Wv"/>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">Arif Rahman</p>
                        <p className="text-xs text-slate-500">Platinum Member</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">14:22:15</p>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">Success</span>
                      </div>
                    </div>
                    {/* Failed Check-in */}
                    <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-rose-50/30">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                          <img alt="Member profile photo" data-alt="Portrait of a young woman with sports gear" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgEBXPNO-zmbkNRlAn8SpgudtSWgmhyz30M-Ch_ojm6_PCntRxXL9dabHE2nw04h9il8Betcw-BpJ5uaoPNuC9XlZiR7SMwO3b4J0FEs_5DDx4vN_IpOjskwWJi4Ay5ZcL00YS9WtaGomh8c1Vbeqf7sbVqOx0n8B_b9lMyvPOEKs95h3B8YshmtmkziGlURmWLTFKrYzIB3sAkeahmHMkOdCExOkFoMvdx55Oy7XlRcdcyg2cqPryhSUmZ5Ndj_BTJjJaN4DAsub5"/>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px] text-white font-bold">close</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">Nusrat Jahan</p>
                        <p className="text-xs text-slate-500">Standard Member</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">14:18:42</p>
                        <span className="text-[10px] text-rose-600 font-bold uppercase">Expired</span>
                      </div>
                    </div>
                    {/* More Successful Check-ins */}
                    <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                          <img alt="Member profile photo" data-alt="Portrait of a middle aged man in athletic wear" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-_9lUcT-hM1asg2cgfyaM0xxuIyJscSPH2TgPS1-2zA_2tjiVH8aMNt6ZocYODJvkACO6UFUQcTBszwFCBtLyaSJCZeRStd65-fpJ5yczNWT8kDdlImuA3rnQjA8TuPwk-bu2nRDLoczZXX1ysZzTsus9bKftx8yqGElZlrsAM-QdO4OgjHXvQGsQuc3VXiwCLlS-VLSONG41f0ARzJ3sz7bSzWOpKyaUHw3jmrOdvRojAIu-wAvfaESq_QM1irLrZpwy2jjtTa1Q"/>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">Tanvir Ahmed</p>
                        <p className="text-xs text-slate-500">Day Pass Holder</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">14:05:01</p>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">Success</span>
                      </div>
                    </div>
                    <div className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                          <img alt="Member profile photo" data-alt="Portrait of a young man with a focused expression" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBl3gMTpHWcVp3ZWtZGoFeDQHJcBPDjqNfjDN71hlNT_tew1riHRE-lG4wmE58ePFtEE41e05B1lTx-5Iy96cuzoVn8kQaD8bPRoiIQsL6GldbUCf_xrMJbrHg2O7CFq677gbs4R0D9s46JdFBmxSufWpKj2lLuutNt_7zQHmK7GghFymtuzt8hzNPKRZXzsmHK5TfVgGeEatBKWrj38Wqu7lWWkWW_T4-lp6ePMNCLlQPLezRAuzqCkOB6fvUhoSm2FgJPSB2VOjyT"/>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">Samiul Haque</p>
                        <p className="text-xs text-slate-500">Platinum Member</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">13:58:22</p>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">Success</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-center">
                  <button className="text-sm text-primary font-bold hover:underline">View All History</button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview Footer */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Total Daily Check-ins</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">248</span>
                <span className="text-emerald-500 text-xs font-bold mb-1.5 flex items-center">
                  <span className="material-symbols-outlined text-sm">trending_up</span> 12%
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Active Members Now</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">42</span>
                <span className="text-slate-400 text-xs font-bold mb-1.5">/ 150 capacity</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-primary h-full w-[28%]"></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Peak Hour Status</p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-emerald-500">Steady</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Expected peak at 17:00</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Denied Access (Today)</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-rose-500">5</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">All expired memberships</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
