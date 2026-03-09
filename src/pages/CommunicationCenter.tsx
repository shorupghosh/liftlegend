import React from 'react';
import { Link } from 'react-router-dom';

export default function CommunicationCenter() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="layout-container flex h-full grow flex-col">
        {/* Top Navigation */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-10 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-primary">
              <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">exercise</span>
              </div>
              <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">LiftLegend</h2>
            </div>
            <nav className="hidden md:flex items-center gap-9">
              <Link className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" to="/admin">Dashboard</Link>
              <Link className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" to="/admin/members">Members</Link>
              <Link className="text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors" to="#">Workouts</Link>
              <Link className="text-primary text-sm font-semibold border-b-2 border-primary py-4 -mb-4" to="/admin/notifications">Notifications</Link>
            </nav>
          </div>
          <div className="flex flex-1 justify-end gap-6 items-center">
            <label className="hidden sm:flex flex-col min-w-40 !h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800">
                <div className="text-slate-400 flex items-center justify-center pl-4">
                  <span className="material-symbols-outlined text-xl">search</span>
                </div>
                <input className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-slate-400 px-4 text-sm font-normal" placeholder="Search activities..." defaultValue=""/>
              </div>
            </label>
            <div className="flex items-center gap-3">
              <button className="size-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20" data-alt="User profile avatar of the gym administrator" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAqWJGCCLavAvm9SdOpH3-TceAEpp0GDgb5PAjxO9u_V4AVhUN27vjEqTfuUSLzZak1u10wxKxULEZm87lgNcVMDAuL2x3S9VOwSHiRmPEAzA1Zmu6EmIXSjTkozhBJspzyVk4t9EzF99Ehz1SzrOvGYITb9ETaZoBjhHcWb270mzfvHdizONewIDamtcmnfjR9Xs0by2Dqm4cEhYhyEp59G6nenLpwEySnyMc_H4-C2ud2j8gNkDH4v9Rft8EA-lvYup0AlusdZHt5")'}}></div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-10 py-8">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Notification Center</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">Broadcast updates, alerts, and personalized messages to your athlete community.</p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Compose Section */}
            <section className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  Compose Message
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Delivery Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-primary bg-primary/5 text-primary font-semibold transition-all">
                        <span className="material-symbols-outlined">mail</span>
                        Email
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 font-medium transition-all">
                        <span className="material-symbols-outlined">sms</span>
                        SMS
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Recipient Group</label>
                    <select className="form-select w-full rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:border-primary focus:ring-primary">
                      <option>All Active Members</option>
                      <option>Uttara Branch Members</option>
                      <option>Dhanmondi Regulars</option>
                      <option>Personal Training Clients</option>
                      <option>Inactive Members</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                    <input className="form-input w-full rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="Update on Eid-ul-Adha holiday hours" type="text"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message Content</label>
                    <div className="relative rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                      <textarea className="form-textarea w-full border-none bg-transparent focus:ring-0 p-4 placeholder:text-slate-400 text-sm" placeholder="Write your announcement here (e.g., Friday Jumu'ah prayer timings update)... Use @name for personalization." rows={6}></textarea>
                      <div className="flex items-center gap-2 p-2 border-t border-slate-200 dark:border-slate-700">
                        <button className="p-2 text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-900 rounded transition-colors">
                          <span className="material-symbols-outlined text-xl">attach_file</span>
                        </button>
                        <button className="p-2 text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-900 rounded transition-colors">
                          <span className="material-symbols-outlined text-xl">mood</span>
                        </button>
                        <button className="p-2 text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-900 rounded transition-colors">
                          <span className="material-symbols-outlined text-xl">image</span>
                        </button>
                        <div className="flex-1"></div>
                        <span className="text-[10px] text-slate-400 font-medium px-2 uppercase tracking-wider">124 / 160 Characters</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-energetic-orange hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <span className="material-symbols-outlined">send</span>
                  Send Now
                </button>
              </div>
            </section>

            {/* Right Column: Sent History */}
            <section className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2 px-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Sent History
                </h2>
                <button className="text-sm font-semibold text-primary hover:underline">View All Report</button>
              </div>
              <div className="space-y-3">
                {/* History Item 1: Sent */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="size-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 shrink-0">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold truncate">Ramadan Flash Sale Promotion</h3>
                      <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">Sent</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">Assalamu Alaikum! Get 20% off on annual memberships this Ramadan...</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">mail</span> Email
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span> 2 hours ago
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">group</span> 1,240 Members
                      </span>
                    </div>
                  </div>
                </div>

                {/* History Item 2: Pending */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="size-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                    <span className="material-symbols-outlined">pending</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold truncate">Friday Morning Yoga Session at Banani Lake</h3>
                      <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">Pending</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">Join us for an outdoor session this Friday at 7 AM. Don't forget your mat!</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">sms</span> SMS
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span> Scheduled: 09:00 AM
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">group</span> 842 Members
                      </span>
                    </div>
                  </div>
                </div>

                {/* History Item 3: Failed */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="size-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 shrink-0">
                    <span className="material-symbols-outlined">error</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold truncate">Last Call: Dhaka Open Bench Press Championship</h3>
                      <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">Failed</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">Register now for the biggest event in Dhaka! Spots are filling fast...</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">mail</span> Email
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span> Yesterday
                      </span>
                      <button className="text-[11px] text-red-500 font-bold flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-sm">refresh</span> Retry
                      </button>
                    </div>
                  </div>
                </div>

                {/* History Item 4: Sent */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow opacity-75">
                  <div className="size-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 shrink-0">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold truncate">Zumba Party with Local Instructors</h3>
                      <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">Sent</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">Get ready for a high-energy session with our top instructors this Saturday!</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">sms</span> SMS
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span> 3 days ago
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">group</span> 450 Members
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary transition-colors text-sm font-medium rounded-xl">
                Load Older Notifications
              </button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
