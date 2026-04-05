import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  requireVerification?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  confirmLabel,
  isDestructive = true,
  requireVerification,
  onConfirm, 
  onCancel 
}) => {
  const [verificationInput, setVerificationInput] = React.useState('');

  // Reset input when modal opens or closes
  React.useEffect(() => {
    if (!isOpen) setVerificationInput('');
  }, [isOpen]);

  if (!isOpen) return null;

  const isVerified = requireVerification ? verificationInput === requireVerification : true;
  const autoConfirmLabel = confirmLabel || (isDestructive ? 'Delete' : 'Confirm');

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={`size-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDestructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-default/10'}`}>
          <span className={`material-symbols-outlined text-2xl ${isDestructive ? 'text-red-600' : 'text-primary-default'}`}>
            {isDestructive ? 'delete_forever' : 'warning'}
          </span>
        </div>
        <h3 className="text-lg font-bold text-center text-neutral-text dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
        
        {requireVerification && (
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 text-center uppercase tracking-wider">
              Type <span className="text-neutral-text dark:text-white font-black bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{requireVerification}</span> to confirm
            </label>
            <input
              type="text"
              value={verificationInput}
              onChange={(e) => setVerificationInput(e.target.value)}
              className="w-full h-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-center text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-default/20 transition-all"
              placeholder={requireVerification}
              autoComplete="off"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isVerified}
            className={`flex-1 h-11 rounded-xl font-bold text-white transition-all ${
              !isVerified 
                ? 'opacity-50 cursor-not-allowed bg-slate-400 dark:bg-slate-600' 
                : (isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-default hover:bg-primary-hover')
            }`}
          >
            {autoConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
