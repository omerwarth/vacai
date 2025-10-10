 'use client';

import { useEffect } from 'react';

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Help({ showReturn = true }: { showReturn?: boolean }) {
  return (
    <main className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow relative">
        {/* Top-right return link for when this is rendered as a standalone page */}
        {showReturn && (
          <a
            href="/"
            className="absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-sky-50 text-sky-700 border border-sky-100 shadow-sm"
            aria-label="Return to main menu"
          >
            Main menu
          </a>
        )}

        <h1 className="text-3xl font-bold mb-4">Help & FAQ</h1>
        <p className="text-gray-700 mb-6">
          Welcome to the help page. Here you can find answers to common questions about using VACAI.
        </p>

        <section className="space-y-4">
          <details className="p-4 border rounded">
            <summary className="font-medium">How do I start planning a trip?</summary>
            <p className="mt-2 text-gray-600">Click the "Start Planning Your Journey" button on the homepage or dashboard to begin.</p>
          </details>

          <details className="p-4 border rounded">
            <summary className="font-medium">How do I sign out?</summary>
            <p className="mt-2 text-gray-600">Open the Profile menu in the top-right and click "Sign Out".</p>
          </details>

          <details className="p-4 border rounded">
            <summary className="font-medium">Still need help?</summary>
            <p className="mt-2 text-gray-600">Contact support at <a className="text-sky-600 underline" href="mailto:support@vacai.example">support@vacai.example</a>.</p>
          </details>
        </section>
      </div>
    </main>
  );
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
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
          {/* Close button */}
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
            <Help showReturn={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
