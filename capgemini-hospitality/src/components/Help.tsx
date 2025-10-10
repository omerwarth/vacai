 'use client';

import { useEffect } from 'react';

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Help({ showReturn = true }: { showReturn?: boolean }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-sky-50 py-20 px-4">
      <div className="max-w-4xl mx-auto p-8 rounded-2xl shadow relative bg-gradient-to-br from-white to-sky-50/60 border border-sky-100">
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

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-sky-700">Help & FAQ</h1>
          <div className="inline-flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full bg-sky-600 shadow-sm" aria-hidden="true"></span>
            <span className="text-sm text-sky-700 font-medium">VACAI Help</span>
          </div>
        </div>
        <p className="text-slate-700 mb-6">Welcome to the help page. Here you can find answers to common questions about using VACAI.</p>

        <section className="space-y-4">
          <details className="border rounded overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 bg-sky-50 hover:bg-sky-100 cursor-pointer font-medium">
              <span>How do I start planning a trip?</span>
              <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </summary>
            <div className="px-4 py-4 bg-white">
              <p className="text-gray-700">Click the "Start Planning Your Journey" button on the homepage or dashboard to begin.</p>
            </div>
          </details>

          <details className="border rounded overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 bg-rose-50 hover:bg-rose-100 cursor-pointer font-medium">
              <span>How do I sign out?</span>
              <svg className="w-4 h-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </summary>
            <div className="px-4 py-4 bg-white">
              <p className="text-gray-700">Open the Profile menu in the top-right and click "Sign Out".</p>
            </div>
          </details>

          <details className="border rounded overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 bg-emerald-50 hover:bg-emerald-100 cursor-pointer font-medium">
              <span>Still need help?</span>
              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </summary>
            <div className="px-4 py-4 bg-white">
              <p className="text-gray-700">Contact support at <a className="text-emerald-700 font-semibold underline" href="mailto:support@vacai.example">support@vacai.example</a>.</p>
            </div>
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
