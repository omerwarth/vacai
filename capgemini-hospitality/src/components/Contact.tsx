 'use client';

import { useEffect } from 'react';

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Contact({ showReturn = true }: { showReturn?: boolean }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-sky-50 py-20 px-4">
      <div className="max-w-3xl mx-auto p-8 rounded-2xl shadow relative bg-gradient-to-br from-white to-sky-50/60 border border-sky-100">
        {showReturn && (
          <a href="/" className="absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-sky-50 text-sky-700 border border-sky-100 shadow-sm" aria-label="Return to main menu">Main menu</a>
        )}

        <h1 className="text-2xl font-extrabold text-sky-800 mb-2">Contact Support</h1>
        <p className="text-slate-700 mb-6">If you need help, reach out to our support team.</p>

        <div className="space-y-4">
          <div className="p-4 bg-white/80 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-medium text-emerald-700">support@example.fake</p>
          </div>

          <div className="p-4 bg-white/80 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600">Phone</p>
            <p className="text-lg font-medium text-emerald-700">+1 (XXX) XXX-XXXX</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

      <div className="relative max-w-md w-full mx-4">
        <div className="rounded-2xl shadow-2xl overflow-hidden relative border border-sky-100 max-h-[80vh] w-full bg-gradient-to-br from-white/60 to-sky-50/40 backdrop-blur-sm p-6">
          <div className="absolute top-4 right-4 z-20">
            <button onClick={onClose} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-gray-700 shadow-sm border border-gray-200" aria-label="Close contact dialog">✕</button>
          </div>

          <h2 className="text-xl font-extrabold text-sky-800 mb-2">Contact Support</h2>
          <p className="text-sm text-sky-700 mb-4">We're here to help — reach out using the information below.</p>

          <div className="space-y-3">
            <div className="p-3 bg-white/80 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-emerald-700">support@example.fake</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-base font-medium text-emerald-700">+1 (XXX) XXX-XXXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
