import React from 'react';

type ImportSummaryData = {
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
};

type ImportSummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: ImportSummaryData | null;
  onDownloadErrors: () => void;
};

export function ImportSummaryModal({ isOpen, onClose, summary, onDownloadErrors }: ImportSummaryModalProps) {
  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <span className="material-symbols-outlined text-3xl">cloud_done</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-text dark:text-white">Import Complete</h3>
          <p className="mt-1 text-sm text-slate-500">Here is the summary of your file import.</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Total</p>
              <p className="text-2xl font-black mt-1 text-slate-700 dark:text-slate-300">{summary.total}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Imported</p>
              <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{summary.imported}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-amber-500 font-bold">Skipped</p>
              <p className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">{summary.skipped}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-red-500 font-bold">Failed</p>
              <p className="text-2xl font-black mt-1 text-red-600 dark:text-red-400">{summary.failed}</p>
            </div>
          </div>

          {summary.errors.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="font-bold text-rose-700 dark:text-rose-400">Issues found ({summary.errors.length})</span>
                <button 
                  onClick={onDownloadErrors}
                  className="font-bold text-rose-700 underline decoration-rose-300 underline-offset-2 hover:text-rose-900 dark:text-rose-400 dark:decoration-rose-700 dark:hover:text-rose-300"
                >
                  Download Log
                </button>
              </div>
              <ul className="max-h-32 overflow-y-auto space-y-1 text-xs text-rose-600 dark:text-rose-400/80 pr-2">
                {summary.errors.map((err, i) => (
                  <li key={i} className="flex gap-2">
                    <span>•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full flex-1 h-11 rounded-xl bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
