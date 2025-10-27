 'use client';

import { useEffect } from 'react';

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};


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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

      <div className="relative max-w-lg w-full mx-4">
        <div className="rounded-3xl shadow-2xl overflow-hidden relative border border-gray-200 w-full bg-white">
          <div className="absolute top-6 right-6 z-20">
            <button 
              onClick={onClose} 
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 shadow-lg border-2 border-gray-200 hover:border-[#0070AC] transition-all" 
              aria-label="Close contact dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="px-8 pt-10 pb-6 bg-gradient-to-br from-[#0070AC] to-[#005a8b]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Contact Support</h2>
            </div>
            <p className="text-white/90 mt-2">We&apos;re here to help — reach out anytime</p>
          </div>

          {/* Content */}
          <div className="p-8 bg-gray-50">
            <div className="space-y-4">
              {/* Email Card */}
              <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-[#0070AC] transition-all shadow-sm hover:shadow-md group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0070AC] to-[#005a8b] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Email</p>
                    <a 
                      href="mailto:support@example.fake" 
                      className="text-lg font-bold text-[#0070AC] hover:underline break-all"
                    >
                      support@example.fake
                    </a>
                    <p className="text-sm text-gray-600 mt-2">Response within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-[#0070AC] transition-all shadow-sm hover:shadow-md group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0070AC] to-[#005a8b] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Phone</p>
                    <a 
                      href="tel:+1XXXXXXXXXX" 
                      className="text-lg font-bold text-[#0070AC] hover:underline"
                    >
                      +1 (XXX) XXX-XXXX
                    </a>
                    <p className="text-sm text-gray-600 mt-2">Available Mon-Fri, 9am-6pm EST</p>
                  </div>
                </div>
              </div>

              {/* Live Chat Card */}
              <div className="p-6 bg-gradient-to-br from-[#0070AC] to-[#005a8b] rounded-2xl shadow-lg text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold uppercase tracking-wide mb-1 text-white/90">Live Chat</p>
                    <p className="text-lg font-bold mb-2">Chat with us now</p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-[#0070AC] rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
