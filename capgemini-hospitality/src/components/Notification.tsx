 'use client';

import { useEffect } from 'react';

type NotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Notification({ showReturn = true }: { showReturn?: boolean }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-sky-50 py-20 px-4">
      <div className="max-w-3xl mx-auto p-8 rounded-2xl shadow relative bg-gradient-to-br from-white to-sky-50/60 border border-sky-100">
        {showReturn && (
          <a href="/" className="absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-sky-50 text-sky-700 border border-sky-100 shadow-sm" aria-label="Return to main menu">Main menu</a>
        )}

        <h1 className="text-2xl font-extrabold text-sky-800 mb-2">Notifications</h1>
        <p className="text-slate-700 mb-6">Your recent notifications and updates.</p>

        <div className="space-y-4">
          <div className="p-4 bg-white/80 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600">System</p>
            <p className="text-lg font-medium text-sky-700">Maintenance scheduled for 11:00 PM UTC.</p>
            <p className="text-xs text-gray-500 mt-1">Oct 9, 2025</p>
          </div>

          <div className="p-4 bg-white/80 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600">Reminder</p>
            <p className="text-lg font-medium text-sky-700">You have an upcoming trip draft—review it before publishing.</p>
            <p className="text-xs text-gray-500 mt-1">Oct 6, 2025</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
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
            <button onClick={onClose} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-gray-700 shadow-sm border border-gray-200" aria-label="Close notifications dialog">✕</button>
          </div>

          <h2 className="text-xl font-extrabold text-sky-800 mb-2">Notifications</h2>
          <p className="text-sm text-sky-700 mb-4">Recent activity and system messages.</p>

          <div className="space-y-3">
            <div className="p-3 bg-white/80 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">System</p>
              <p className="text-base font-medium text-sky-700">Maintenance scheduled for 11:00 PM UTC.</p>
              <p className="text-xs text-gray-500 mt-1">Oct 9, 2025</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">Reminder</p>
              <p className="text-base font-medium text-sky-700">You have an upcoming trip draft—review it before publishing.</p>
              <p className="text-xs text-gray-500 mt-1">Oct 6, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
