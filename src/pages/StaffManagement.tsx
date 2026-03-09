import React from 'react';
import { Link } from 'react-router-dom';

export default function StaffManagement() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="layout-container flex flex-col h-full">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-6 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-primary">
              <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined">fitness_center</span>
              </div>
              <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">LiftLegend</h2>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <nav className="flex items-center gap-2">
                <Link className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/admin">Dashboard</Link>
                <Link className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg" to="/admin/staff">Staff</Link>
                <Link className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="/admin/members">Members</Link>
                <Link className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" to="#">Classes</Link>
              </nav>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <span className="material-symbols-outlined text-sm">search</span>
              </span>
              <input className="block w-64 rounded-lg border-none bg-slate-100 dark:bg-slate-800 py-2 pl-10 pr-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary" placeholder="Search team..." type="text"/>
            </label>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="h-8 w-8 rounded-full bg-primary/20 border-2 border-primary/10 overflow-hidden ml-2" data-alt="User profile avatar circle">
                <img alt="Admin Profile" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVuxJA_LZgsufqiXCEiwPRNMpjvHyac7K_WK2aFdimJX9mJU2q9WrX0-8C5JpkKk3N4FdWsmNvdZjNbIvbCAMNKlwBR1NSBJx-fvkP2ZnvqNUglnXv5_qyotP9seU_ZKrnG8GHX1z2S9WQdsBN0MPgGWLw3SYawrVmme2JCONmALXaYOsVPbUjfTmyUzh6pWL7r71Z075w0vL5Jkuq-CkzUOuriYl0dqHQHdvpI6IQFv85jcDDNeCp_IvZG-thfwN7LcGPKtokTIxu"/>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Staff Management</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">Central hub for team orchestration and workspace permissions.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">person_add</span>
              <span>Invite Staff</span>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</p>
              <p className="text-2xl font-bold mt-1">24</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Now</p>
              <p className="text-2xl font-bold mt-1 text-emerald-500">18</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trainers</p>
              <p className="text-2xl font-bold mt-1">12</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On Vacation</p>
              <p className="text-2xl font-bold mt-1">2</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-4">
              <button className="px-6 py-4 text-sm font-bold border-b-2 border-primary text-primary">All Team</button>
              <button className="px-6 py-4 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Administrators</button>
              <button className="px-6 py-4 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Coaches</button>
              <button className="px-6 py-4 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Operations</button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Team Member</th>
                    <th className="px-6 py-4">Role &amp; Dept</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Permissions</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Staff Member 1 */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200 overflow-hidden" data-alt="Male staff member headshot portrait">
                          <img alt="Sarah Connor" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUBilUOCrKwgA3bzd9t4VLE3wFslrw_gqBa_RIJNVgLUYx5pihXFIrb9fBQO1DOQlnX5ZN24Yt5wasY1tga9PF69nTvjZ--c90V4gfg_rrxNZkP1-vNOp1Nzu7lJ3lDWpJLwx7WKnwFj5SZiJQNSL4tfldkpxgr0hlQPShDF_TNIKTLlOqgzv7IrjLYr64XUImYyA8HazyO0w7c9-6YBr4nOh9quiyFLhPOS6nwcZIkPcr5V2xYIh6llT2SGKeypAVm3ubQibFafVV"/>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">Tanvir Rahman</p>
                          <p className="text-xs text-slate-500">tanvir.rahman@liftlegend.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Managing Director</span>
                        <span className="text-xs text-slate-500">Management</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tighter">Full Access</span>
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tighter">Billing</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">edit_note</span>
                      </button>
                    </td>
                  </tr>
                  {/* Staff Member 2 */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200 overflow-hidden" data-alt="Female staff member headshot portrait">
                          <img alt="Staff Member" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiuCOMCWUCoHAIYbMKnW9ZDwb0bKwMC5tZVUOQa4CqDw-cz21kpFBBY1KAznxXbO9MAgD3zSYWT2FqxqE50vsjm563q5FCQky6JOHHHsFGwXxd8184KZymJRsdDtDQc3KwVMacG8ZtnWbBQaHUJaHtRvVEmF70_2xVD2lzlmMl7vi2nBKBfIG1fj10o-ugIrO7mtfEh-gvwyHJwTgPK-0zWHXmRuqsSq6pUqYFeMWhv8FiLlPnDWpxMbvypuq8xIoRNRjsrFoMGPpT"/>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">Ishrat Jahan</p>
                          <p className="text-xs text-slate-500">ishrat.jahan@liftlegend.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Lead Trainer</span>
                        <span className="text-xs text-slate-500">Fitness</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Schedules</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Clients</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">edit_note</span>
                      </button>
                    </td>
                  </tr>
                  {/* Staff Member 3 */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200 overflow-hidden" data-alt="Staff member smiling profile">
                          <img alt="Staff Member" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7MZA3D9x4BtVE-XaejE9ZE5cX-mgze4ko_Wrpnp26jMzfcfa4_ZKNei9q7QlO26XPRgatfFi2nXNi0UOlRkvjA-YKbLerCFnhI8mfp-MpOOZAbQD_D5DDfMNXj-In5wXD5jkbe5SeYkm2CNng_HejVOtKNLAd7aS2p4u2wtwKcG8-wa-WrJOEaWwa0aT8MrMj_SB0uRpxifAQErHASvZUCafbYXG2fGuh9irva-WLp9Etg6LvBy1K0PryD4sRdnrZYe3Gz6bKhLOP"/>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">Ariful Islam</p>
                          <p className="text-xs text-slate-500">ariful.islam@liftlegend.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Front Desk</span>
                        <span className="text-xs text-slate-500">Front Desk &amp; Admin</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <span className="size-1.5 rounded-full bg-amber-500"></span>
                        On Break
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Check-in</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">edit_note</span>
                      </button>
                    </td>
                  </tr>
                  {/* Staff Member 4 */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200 overflow-hidden" data-alt="Professional profile headshot">
                          <img alt="Staff Member" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt-387xBWuOMVuKASFIsNrx5X_Wxdh3s5wEarzE7xwwS3tpaacK0SQVbdUIaSBNIYffECPb0BauIoPGDlNtDqkjj_zM6idAL21gaRn7m3R5mU_7F9b_aZA9-_VYymGqYbvb3bw85xvxCHSU7KKOCN-DzO49Wi2A6yl1-jJoUji1ALaRmfKsGoYYdnaDsZNnp6qWIqeaI0JgQPGSnsKQJIbPkHKbesavaJwYwVkrGIsNckA4m8yl3SqsTTs_VwPExdXInSRJWCM1e-R"/>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">Sadi Mohammad</p>
                          <p className="text-xs text-slate-500">sadi.mohammad@liftlegend.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Strength Coach</span>
                        <span className="text-xs text-slate-500">Fitness</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <span className="size-1.5 rounded-full bg-slate-400"></span>
                        Offline
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Schedules</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">edit_note</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">Showing <span className="font-bold">1</span> to <span className="font-bold">4</span> of <span className="font-bold">24</span> staff members</p>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm font-semibold rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 text-sm font-semibold rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Background Decoration */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/2 bg-gradient-to-br from-primary/5 to-transparent blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-1/3 h-1/2 bg-gradient-to-tr from-primary/5 to-transparent blur-3xl pointer-events-none"></div>
    </div>
  );
}
