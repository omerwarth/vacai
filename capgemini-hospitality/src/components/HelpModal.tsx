 'use client';

import { useEffect } from 'react';
import Help from './Help';

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with subtle blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

      <div className="relative max-w-4xl w-full mx-4">
        <div className="bg-white/95 rounded-2xl shadow-2xl overflow-hidden relative border border-gray-100 glass-card max-h-[90vh] w-full">
          {/* Fixed top-right controls styled like site buttons */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-gray-700 shadow-sm border border-gray-200"
              aria-label="Close help dialog"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Header */}
          <div className="px-8 pt-12 pb-4 border-b border-gray-100">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Help & FAQ</h2>
            <p className="text-sm text-gray-600 mt-2">Welcome — find answers to common questions and get quick help.</p>
          </div>

          {/* Scrollable content area */}
          <div className="p-8 max-h-[70vh] overflow-auto">
            <Help />
          </div>
        </div>
      </div>
    </div>
  );
}
