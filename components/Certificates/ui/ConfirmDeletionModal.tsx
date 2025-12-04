import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  count: number;
  itemName: string;
}

const ConfirmDeletionModal: React.FC<ConfirmDeletionModalProps> = ({
  isOpen, onClose, onConfirm, isDeleting, count, itemName,
}) => {
  const displayItemName = count > 1 ? itemName.replace(/\(s\)$/, 's') : itemName.replace(/\(s\)$/, '');
  const title = count > 1 ? `Delete ${count} items?` : `Delete this ${displayItemName}?`;
  const message = count > 1 
    ? `You are about to permanently remove ${count} ${displayItemName}.`
    : `You are about to permanently remove this ${displayItemName}.`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={!isDeleting ? onClose : undefined}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-colors"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-[90vw] sm:max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
            <button 
              onClick={onClose} disabled={isDeleting}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-0"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center p-6 sm:p-10 text-center">
              <div className="relative mb-6 group">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="absolute inset-0 rounded-full bg-red-100 opacity-50 blur-md group-hover:blur-lg transition-all duration-500"
                />
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-red-50 ring-4 ring-white shadow-sm">
                  <div className="absolute inset-0 rounded-full border border-red-100" />
                  <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600 drop-shadow-sm" strokeWidth={2} />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {message} <br />
                <span className="font-medium text-red-600/90">This action cannot be undone.</span>
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <button
                  onClick={onClose} disabled={isDeleting}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm} disabled={isDeleting}
                  className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-b from-red-600 to-red-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:to-red-600 focus:ring-2 focus:ring-red-500 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isDeleting ? (
                      <svg className="h-4 w-4 animate-spin text-white/90" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 transition-transform group-hover:-rotate-12" />
                        <span>Delete {count > 1 ? 'Items' : 'Item'}</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeletionModal;