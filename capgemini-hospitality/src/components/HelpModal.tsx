'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Help from './Help';

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const router = useRouter();
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true"></div>

      <div className="relative max-w-4xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
          {/* Fixed top-right controls so they're always visible */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                router.push('/');
              }}
              className="bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1 rounded-md text-sm font-medium border border-sky-100 shadow-sm"
              aria-label="Return to main menu"
            >
              Main menu
            </button>

            <button
              onClick={onClose}
              className="bg-white text-gray-600 hover:bg-gray-50 px-2 py-1 rounded-md shadow-sm"
              aria-label="Close help dialog"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-6 pt-12">
            <h2 className="text-lg font-semibold">Help & FAQ</h2>
            <div className="mt-4">
              <Help />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
