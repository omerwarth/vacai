 'use client';

import { useEffect } from 'react';

type NotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

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

          <div className="space-y-3 overflow-auto max-h-[60vh] notifications-scroll pr-3">
            <div className="p-3 bg-white/80 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">System</p>
              <p className="text-base font-medium text-sky-700">Maintenance scheduled for 11:00 PM UTC.</p>
              <p className="text-xs text-gray-500 mt-1">Oct 9, 2025</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">Reminder</p>
              <p className="text-base font-medium text-sky-700">You have an upcoming trip on XX/XX/XXXX.</p>
              <p className="text-xs text-gray-500 mt-1">Oct 6, 2025</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">Reminder</p>
              <p className="text-base font-medium text-sky-700">You have an upcoming trip on XX/XX/XXXX.</p>
              <p className="text-xs text-gray-500 mt-1">Oct 6, 2025</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">Reminder</p>
              <p className="text-base font-medium text-sky-700">You have an upcoming trip on XX/XX/XXXX.</p>
              <p className="text-xs text-gray-500 mt-1">Oct 6, 2025</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">Reminder</p>
              <p className="text-base font-medium text-sky-700">You have an upcoming trip on XX/XX/XXXX.</p>
              <p className="text-xs text-gray-500 mt-1">Oct 6, 2025</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">Reminder</p>
              <p className="text-base font-medium text-sky-700">You have an upcoming trip on XX/XX/XXXX.</p>
              <p className="text-xs text-gray-500 mt-1">Oct 6, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles for custom scrollbar with visible, styled scroll wheel
// Styled to be modern and accessible with proper hover states
const _style = (`
.notifications-scroll { 
  scrollbar-width: thin; 
  scrollbar-color: rgba(148, 163, 184, 0.6) rgba(241, 245, 249, 0.3); 
}
.notifications-scroll::-webkit-scrollbar { 
  width: 12px; 
}
.notifications-scroll::-webkit-scrollbar-track { 
  background: rgba(241, 245, 249, 0.3); 
  border-radius: 6px; 
  margin: 4px 0;
}
.notifications-scroll::-webkit-scrollbar-thumb { 
  background: rgba(148, 163, 184, 0.6); 
  border-radius: 6px; 
  border: 2px solid rgba(241, 245, 249, 0.3);
  transition: background-color 0.2s ease;
}
.notifications-scroll::-webkit-scrollbar-thumb:hover { 
  background: rgba(100, 116, 139, 0.8); 
}
.notifications-scroll::-webkit-scrollbar-thumb:active { 
  background: rgba(71, 85, 105, 0.9); 
}
`);

// Inject the style tag into the document at runtime for environments that accept it.
if (typeof document !== 'undefined') {
  if (!document.getElementById('notification-scroll-style')) {
    const s = document.createElement('style');
    s.id = 'notification-scroll-style';
    s.innerHTML = _style;
    document.head.appendChild(s);
  }
}
