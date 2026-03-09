import React from 'react';
import { Link } from 'react-router-dom';

export default function GymSettings() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-40 py-3 sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined">fitness_center</span>
              </div>
              <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">LiftLegend Settings</h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 font-bold">
                JD
              </div>
            </div>
          </header>
          <main className="flex flex-1 justify-center py-8 px-4 lg:px-40">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 gap-8">
              <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">palette</span> Gym Branding
                </h2>
                <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-slate-100 dark:bg-slate-800 bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-24 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400" data-alt="Placeholder for gym brand logo preview" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDWy3NaUC72OhLWxfxeaDyrstDXMgkJ10bir9gqlbDUwuquI5Vj5WVTmeTvGy_WgHyjwxJwVSidO-KwvdCz8ea-LEKUZAxCP_Yqc-9cuGCX9PGlrjJGz7AuyiT11p7YiadZK6PwaUfkmZBAc-UZ1_4b1r3m0mZfpFjF1y5EqMXg-cHu9tlI93zEQgPIUCyWpvfysHORFTIeX_6VrW6_AFZws6-guIC1DnOhA8GxT05LSV4SRLHtjwmXANxxoGXNpX4xR4Yu78hAFcZI")'}}>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-slate-900 dark:text-slate-100 text-base font-semibold">Gym Logo</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">PNG, JPG up to 5MB. 512x512px recommended.</p>
                      <div className="flex gap-2 mt-1">
                        <button className="flex h-9 px-4 cursor-pointer items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
                          Upload Logo
                        </button>
                        <button className="flex h-9 px-4 cursor-pointer items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="text-slate-900 dark:text-slate-100 text-sm font-bold">Primary Brand Color</p>
                    <div className="flex flex-wrap gap-3">
                      <label className="size-9 rounded-full cursor-pointer border-2 border-transparent ring-primary ring-offset-2 has-[:checked]:ring-2" style={{backgroundColor: "#4aafed"}}>
                        <input defaultChecked className="hidden" name="brand-color" type="radio"/>
                      </label>
                      <label className="size-9 rounded-full cursor-pointer border-2 border-transparent ring-primary ring-offset-2 has-[:checked]:ring-2" style={{backgroundColor: "#ef4444"}}>
                        <input className="hidden" name="brand-color" type="radio"/>
                      </label>
                      <label className="size-9 rounded-full cursor-pointer border-2 border-transparent ring-primary ring-offset-2 has-[:checked]:ring-2" style={{backgroundColor: "#22c55e"}}>
                        <input className="hidden" name="brand-color" type="radio"/>
                      </label>
                      <label className="size-9 rounded-full cursor-pointer border-2 border-transparent ring-primary ring-offset-2 has-[:checked]:ring-2" style={{backgroundColor: "#f59e0b"}}>
                        <input className="hidden" name="brand-color" type="radio"/>
                      </label>
                      <label className="size-9 rounded-full cursor-pointer border-2 border-transparent ring-primary ring-offset-2 has-[:checked]:ring-2" style={{backgroundColor: "#6366f1"}}>
                        <input className="hidden" name="brand-color" type="radio"/>
                      </label>
                      <button className="size-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-slate-700 dark:text-slate-300 text-sm font-bold uppercase tracking-wider mb-4">White-labeling Preview</h3>
                  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner">
                    <div className="h-12 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-6 bg-primary rounded-sm" data-alt="Simulated brand logo in preview"></div>
                        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="size-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="size-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col gap-4">
                      <div className="flex gap-4">
                        <div className="h-24 w-1/3 bg-primary/10 border border-primary/20 rounded-lg"></div>
                        <div className="h-24 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                        <div className="h-24 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                      </div>
                      <div className="h-32 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg"></div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 italic">This is a live preview of how your brand colors and logo will appear on member dashboards.</p>
                </div>
              </section>
              <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">domain</span> Gym Info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gym Name</label>
                    <input className="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="Titan Fitness Center" type="text"/>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input className="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="+880 1711-000000" type="tel"/>
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                    <input className="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary" placeholder="House 12, Road 5, Dhanmondi R/A, Dhaka 1205, Bangladesh" type="text"/>
                  </div>
                </div>
              </section>
              <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">credit_card</span> Subscription Details
                  </h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 font-bold">Pro Plan (Annual)</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Next billing date: Oct 12, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-primary text-sm font-bold hover:underline">Change Plan</button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                    <button className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cancel</button>
                  </div>
                </div>
              </section>
              <div className="flex items-center justify-end gap-4 pt-4 pb-12">
                <button className="px-6 py-3 rounded-lg text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Discard Changes
                </button>
                <button className="px-8 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:brightness-105 active:scale-95 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
