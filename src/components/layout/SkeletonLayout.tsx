import React from 'react';

export function SkeletonLayout() {
    return (
        <div className="flex flex-col h-[100dvh] bg-slate-100 dark:bg-slate-950 overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Skeleton (Hidden on mobile) */}
                <div className="hidden sm:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
                    <div className="h-16 border-b border-slate-800 p-4 flex items-center">
                        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
                    </div>
                    <div className="p-4 space-y-4 flex-1 mt-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded bg-slate-800 animate-pulse" />
                                <div className="h-3 w-24 rounded bg-slate-800 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header Skeleton */}
                    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between sm:justify-end">
                        <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse sm:hidden" />
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    </div>

                    {/* Page Content Skeleton */}
                    <main className="flex-1 p-4 sm:p-8 overflow-y-auto pb-20 sm:pb-8">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse mb-8" />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse" />
                                ))}
                            </div>
                            
                            <div className="h-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse mt-6" />
                        </div>
                    </main>
                </div>

                {/* Mobile Bottom Nav Skeleton */}
                <nav className="fixed bottom-0 left-0 right-0 h-16 sm:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom grid grid-cols-5 z-50">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex flex-col items-center justify-center gap-1 h-full">
                            <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                            <div className="w-8 h-2 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mt-1" />
                        </div>
                    ))}
                </nav>
            </div>
        </div>
    );
}
