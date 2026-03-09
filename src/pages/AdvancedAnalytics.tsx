import React from 'react';
import { Link } from 'react-router-dom';

export default function AdvancedAnalytics() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="flex h-full min-h-screen w-full flex-col">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined">monitoring</span>
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight tracking-tight">LiftLegend <span className="text-primary">Analytics</span></h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Performance Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button className="px-4 py-1.5 text-sm font-semibold rounded-md bg-white dark:bg-slate-700 shadow-sm">Real-time</button>
              <button className="px-4 py-1.5 text-sm font-semibold text-slate-500">Historical</button>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center justify-center rounded-lg size-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="flex items-center justify-center rounded-lg size-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-primary overflow-hidden">
              <img className="w-full h-full object-cover" data-alt="User profile avatar of fitness manager" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp83TXly_CaYY1CVcRQaXIVrTQqDU2TcWtotgJPIWJkQ_Rh780to58SOVE7peigLN01cKiIq4_xFrliR0eF2UEcEWmzhN_wRrHbgS8HHnBcb5V-XMH70qwiFPyUpWymfj5l6lvpu89cY3WaRBLccHZX-jB1H1YglS21JXGaBV5ZKCgB7OdIAMC8-SjSUJldrwDewNtpvu7xtTtf1WHLtsMKSBkNZge5A17Ejiu88rBfu5ck-l7YZBo7dNgHeyYjnp6EX_6xhwOUq0U"/>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
          {/* Controls Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tight">System Overview</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Aggregated data across all active gym locations.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 gap-2">
                <span className="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
                <span className="text-sm font-medium">Oct 01, 2023 - Oct 31, 2023</span>
                <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
              </div>
              <button className="bg-primary text-white font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-sm">download</span>
                Export Report
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">+12%</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Members</p>
              <h3 className="text-3xl font-black mt-1">4,829</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">+8.4%</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monthly Revenue</p>
              <h3 className="text-3xl font-black mt-1">৳124,500</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">-2.1%</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Workout</p>
              <h3 className="text-3xl font-black mt-1">54m</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">+15%</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Conversion Rate</p>
              <h3 className="text-3xl font-black mt-1">24.2%</h3>
            </div>
          </div>

          {/* Primary Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Peak Hours Bar Chart */}
            <div className="lg:col-span-2 bg-chart-dark p-6 rounded-2xl text-white flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-lg font-bold">Peak Traffic Hours</h4>
                  <p className="text-slate-400 text-xs">Hourly member entries throughout the day</p>
                </div>
                <select className="bg-slate-700 text-xs font-bold border-none rounded-lg focus:ring-primary">
                  <option>Weekdays</option>
                  <option>Weekends</option>
                </select>
              </div>
              <div className="flex-1 flex items-end justify-between gap-2 h-64">
                {/* Bar Chart Implementation with CSS */}
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-slate-700 rounded-t-sm h-[20%] group-hover:bg-primary/50 transition-colors"></div>
                  <span className="text-[10px] text-slate-500 font-bold">06</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-slate-700 rounded-t-sm h-[45%] group-hover:bg-primary/50 transition-colors"></div>
                  <span className="text-[10px] text-slate-500 font-bold">08</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-primary rounded-t-sm h-[95%] shadow-lg shadow-primary/30"></div>
                  <span className="text-[10px] text-primary font-bold">10</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-slate-700 rounded-t-sm h-[70%] group-hover:bg-primary/50 transition-colors"></div>
                  <span className="text-[10px] text-slate-500 font-bold">12</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-slate-700 rounded-t-sm h-[40%] group-hover:bg-primary/50 transition-colors"></div>
                  <span className="text-[10px] text-slate-500 font-bold">14</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-slate-700 rounded-t-sm h-[65%] group-hover:bg-primary/50 transition-colors"></div>
                  <span className="text-[10px] text-slate-500 font-bold">16</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-primary rounded-t-sm h-[100%] shadow-lg shadow-primary/30"></div>
                  <span className="text-[10px] text-primary font-bold">18</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-slate-700 rounded-t-sm h-[85%] group-hover:bg-primary/50 transition-colors"></div>
                  <span className="text-[10px] text-slate-500 font-bold">20</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="w-full bg-slate-700 rounded-t-sm h-[30%] group-hover:bg-primary/50 transition-colors"></div>
                  <span className="text-[10px] text-slate-500 font-bold">22</span>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown Doughnut Chart */}
            <div className="bg-chart-dark p-6 rounded-2xl text-white shadow-xl">
              <h4 className="text-lg font-bold mb-1">Plan Revenue</h4>
              <p className="text-slate-400 text-xs mb-8">Monthly share by membership type</p>
              <div className="relative flex justify-center py-6">
                {/* Circular Progress Doughnut Visual */}
                <div className="relative size-40 rounded-full border-[16px] border-slate-700 flex items-center justify-center">
                  <div className="absolute inset-[-16px] rounded-full border-[16px] border-primary border-t-transparent border-l-transparent border-r-transparent transform -rotate-45"></div>
                  <div className="absolute inset-[-16px] rounded-full border-[16px] border-blue-400 border-b-transparent border-l-transparent border-r-transparent transform rotate-12"></div>
                  <div className="text-center">
                    <span className="text-3xl font-black">৳124K</span>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Total</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium text-slate-300">Premium Elite</span>
                  </div>
                  <span className="text-sm font-bold">58%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-blue-400"></div>
                    <span className="text-sm font-medium text-slate-300">Basic Strength</span>
                  </div>
                  <span className="text-sm font-bold">32%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-slate-500"></div>
                    <span className="text-sm font-medium text-slate-300">Corporate</span>
                  </div>
                  <span className="text-sm font-bold">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Frequency Heat Map */}
          <div className="bg-chart-dark p-6 rounded-2xl text-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg font-bold">Attendance Intensity</h4>
                <p className="text-slate-400 text-xs">Heat map of daily member frequency</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Low</span>
                  <div className="flex gap-1">
                    <div className="size-3 rounded bg-slate-800"></div>
                    <div className="size-3 rounded bg-orange-900/50"></div>
                    <div className="size-3 rounded bg-orange-700/60"></div>
                    <div className="size-3 rounded bg-primary/80"></div>
                    <div className="size-3 rounded bg-primary"></div>
                  </div>
                  <span className="text-[10px] text-slate-500">High</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[auto_repeat(31,1fr)] gap-2">
                  {/* Header: Dates */}
                  <div className="w-8"></div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">01</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">02</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">03</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">04</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">05</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">06</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center text-primary">07</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">08</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">09</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">10</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">11</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">12</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">13</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center text-primary">14</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">15</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">16</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">17</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">18</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">19</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">20</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center text-primary">21</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">22</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">23</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">24</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">25</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">26</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">27</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center text-primary">28</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">29</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">30</div>
                  <div className="text-[10px] text-slate-600 font-bold text-center">31</div>
                  {/* Monday */}
                  <div className="text-[10px] text-slate-500 font-bold leading-8 h-8 flex items-center">Mon</div>
                  <div className="h-8 rounded-sm bg-slate-800"></div>
                  <div className="h-8 rounded-sm bg-orange-900/40"></div>
                  <div className="h-8 rounded-sm bg-orange-700/60"></div>
                  <div className="h-8 rounded-sm bg-primary/80"></div>
                  <div className="h-8 rounded-sm bg-primary"></div>
                  <div className="h-8 rounded-sm bg-primary/70"></div>
                  <div className="h-8 rounded-sm bg-primary/90"></div>
                  {/* ... more days simulated ... */}
                  <div className="col-span-24 grid grid-cols-24 gap-2">
                    <div className="h-8 w-full rounded-sm bg-slate-800"></div><div className="h-8 w-full rounded-sm bg-orange-900/40"></div><div className="h-8 w-full rounded-sm bg-orange-700/60"></div><div className="h-8 w-full rounded-sm bg-primary/80"></div><div className="h-8 w-full rounded-sm bg-primary"></div><div className="h-8 w-full rounded-sm bg-primary/70"></div><div className="h-8 w-full rounded-sm bg-primary/90"></div><div className="h-8 w-full rounded-sm bg-slate-800"></div><div className="h-8 w-full rounded-sm bg-orange-900/40"></div><div className="h-8 w-full rounded-sm bg-orange-700/60"></div><div className="h-8 w-full rounded-sm bg-primary/80"></div><div className="h-8 w-full rounded-sm bg-primary"></div><div className="h-8 w-full rounded-sm bg-primary/70"></div><div className="h-8 w-full rounded-sm bg-primary/90"></div><div className="h-8 w-full rounded-sm bg-slate-800"></div><div className="h-8 w-full rounded-sm bg-orange-900/40"></div><div className="h-8 w-full rounded-sm bg-orange-700/60"></div><div className="h-8 w-full rounded-sm bg-primary/80"></div><div className="h-8 w-full rounded-sm bg-primary"></div><div className="h-8 w-full rounded-sm bg-primary/70"></div><div className="h-8 w-full rounded-sm bg-primary/90"></div><div className="h-8 w-full rounded-sm bg-slate-800"></div><div className="h-8 w-full rounded-sm bg-orange-900/40"></div><div className="h-8 w-full rounded-sm bg-orange-700/60"></div>
                  </div>
                  {/* Wednesday */}
                  <div className="text-[10px] text-slate-500 font-bold leading-8 h-8 flex items-center">Wed</div>
                  <div className="col-span-31 grid grid-cols-31 gap-2">
                    <div className="h-8 rounded-sm bg-primary"></div><div className="h-8 rounded-sm bg-primary/90"></div><div className="h-8 rounded-sm bg-primary/80"></div><div className="h-8 rounded-sm bg-primary/70"></div><div className="h-8 rounded-sm bg-orange-700/60"></div><div className="h-8 rounded-sm bg-orange-900/40"></div><div className="h-8 rounded-sm bg-slate-800"></div><div className="h-8 rounded-sm bg-primary"></div><div className="h-8 rounded-sm bg-primary/90"></div><div className="h-8 rounded-sm bg-primary/80"></div><div className="h-8 rounded-sm bg-primary/70"></div><div className="h-8 rounded-sm bg-orange-700/60"></div><div className="h-8 rounded-sm bg-orange-900/40"></div><div className="h-8 rounded-sm bg-slate-800"></div><div className="h-8 rounded-sm bg-primary"></div><div className="h-8 rounded-sm bg-primary/90"></div><div className="h-8 rounded-sm bg-primary/80"></div><div className="h-8 rounded-sm bg-primary/70"></div><div className="h-8 rounded-sm bg-orange-700/60"></div><div className="h-8 rounded-sm bg-orange-900/40"></div><div className="h-8 rounded-sm bg-slate-800"></div><div className="h-8 rounded-sm bg-primary"></div><div className="h-8 rounded-sm bg-primary/90"></div><div className="h-8 rounded-sm bg-primary/80"></div><div className="h-8 rounded-sm bg-primary/70"></div><div className="h-8 rounded-sm bg-orange-700/60"></div><div className="h-8 rounded-sm bg-orange-900/40"></div><div className="h-8 rounded-sm bg-slate-800"></div><div className="h-8 rounded-sm bg-primary"></div><div className="h-8 rounded-sm bg-primary/90"></div><div className="h-8 rounded-sm bg-primary/80"></div>
                  </div>
                  {/* Friday */}
                  <div className="text-[10px] text-slate-500 font-bold leading-8 h-8 flex items-center">Fri</div>
                  <div className="col-span-31 grid grid-cols-31 gap-2">
                    <div className="h-8 rounded-sm bg-orange-900/40"></div><div className="h-8 rounded-sm bg-orange-700/60"></div><div className="h-8 rounded-sm bg-slate-800"></div><div className="h-8 rounded-sm bg-primary/90"></div><div className="h-8 rounded-sm bg-primary"></div><div className="h-8 rounded-sm bg-primary/70"></div><div className="h-8 rounded-sm bg-primary/80"></div><div className="h-8 rounded-sm bg-orange-900/40"></div><div className="h-8 rounded-sm bg-orange-700/60"></div><div className="h-8 rounded-sm bg-slate-800"></div><div className="h-8 rounded-sm bg-primary/90"></div><div className="h-8 rounded-sm bg-primary"></div><div className="h-8 rounded-sm bg-primary/70"></div><div className="h-8 rounded-sm bg-primary/80"></div><div className="h-8 rounded-sm bg-orange-900/40"></div><div className="h-8 rounded-sm bg-orange-700/60"></div><div className="h-8 rounded-sm bg-slate-800"></div><div className="h-8 rounded-sm bg-primary/90"></div><div className="h-8 rounded-sm bg-primary"></div><div className="h-8 rounded-sm bg-primary/70"></div><div className="h-8 rounded-sm bg-primary/80"></div><div className="h-8 rounded-sm bg-orange-900/40"></div><div className="h-8 rounded-sm bg-orange-700/60"></div><div className="h-8 rounded-sm bg-slate-800"></div><div className="h-8 rounded-sm bg-primary/90"></div><div className="h-8 rounded-sm bg-primary"></div><div className="h-8 rounded-sm bg-primary/70"></div><div className="h-8 rounded-sm bg-primary/80"></div><div className="h-8 rounded-sm bg-orange-900/40"></div><div className="h-8 rounded-sm bg-orange-700/60"></div><div className="h-8 rounded-sm bg-slate-800"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Insights and Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-lg font-bold mb-4">Top Growth Locations</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">1</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Gulshan Fitness Elite</p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1">
                      <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-500">+24%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">2</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Banani Wellness Club</p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1">
                      <div className="bg-primary h-2 rounded-full w-[62%]"></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-500">+18%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">3</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Dhanmondi Health Hub</p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1">
                      <div className="bg-primary h-2 rounded-full w-[45%]"></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">+5%</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-lg font-bold mb-4">AI Business Insights</h4>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                    <span className="text-xs font-bold text-primary uppercase">Strategy Alert</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Peak hour congestion detected between 5-7 PM. Consider offering 'Off-Peak' discounts to balance traffic.</p>
                </div>
                <div className="p-4 bg-blue-500/5 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-blue-500 text-sm">groups</span>
                    <span className="text-xs font-bold text-blue-500 uppercase">Retention Note</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">"Basic" plan users show 40% higher churn rate. Targeted "Premium Upgrade" emails recommended.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Action */}
        <footer className="p-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">© 2023 LiftLegend Enterprise. All data reflects GMT standard time.</p>
        </footer>
      </div>
    </div>
  );
}
