import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-[#fdfcf9] border border-[#e2dcd0] rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              {title || 'Confirm Deletion'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              {message || 'Are you sure you want to delete this shortened URL? This action cannot be undone.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eee9de]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold text-zinc-700 hover:text-zinc-900 hover:bg-[#ede7da] rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isLoading ? 'Deleting...' : 'Delete Short URL'}
          </button>
        </div>
      </div>
    </div>
  );
}
