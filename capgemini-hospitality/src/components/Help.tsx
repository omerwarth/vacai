 'use client';

import { useEffect } from 'react';

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function HelpFAQList() {
  return (
    <section className="space-y-4">
      <details className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-[#0070AC] transition-all group">
        <summary className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 cursor-pointer font-semibold text-gray-900 transition-all">
          <span className="flex items-center gap-3">
            <span className="w-8 h-8 bg-[#0070AC] text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            How do I start planning a trip?
          </span>
          <svg className="w-5 h-5 text-[#0070AC] group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </summary>
        <div className="px-6 py-5 bg-white border-t border-gray-100">
          <p className="text-gray-700 leading-relaxed">Click the &quot;Start Planning Your Journey&quot; button on the homepage or dashboard to begin. You can also access planning from the main navigation menu.</p>
        </div>
      </details>

      <details className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-[#0070AC] transition-all group">
        <summary className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 cursor-pointer font-semibold text-gray-900 transition-all">
          <span className="flex items-center gap-3">
            <span className="w-8 h-8 bg-[#0070AC] text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </span>
            How do I sign out?
          </span>
          <svg className="w-5 h-5 text-[#0070AC] group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </summary>
        <div className="px-6 py-5 bg-white border-t border-gray-100">
          <p className="text-gray-700 leading-relaxed">Open the Profile menu in the top-right corner and click &quot;Sign Out&quot;. Your session will be safely ended and you&apos;ll return to the login page.</p>
        </div>
      </details>

      <details className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-[#0070AC] transition-all group">
        <summary className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 cursor-pointer font-semibold text-gray-900 transition-all">
          <span className="flex items-center gap-3">
            <span className="w-8 h-8 bg-[#0070AC] text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </span>
            Still need help?
          </span>
          <svg className="w-5 h-5 text-[#0070AC] group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </summary>
        <div className="px-6 py-5 bg-white border-t border-gray-100">
          <p className="text-gray-700 leading-relaxed">Contact our support team at <a className="text-[#0070AC] font-semibold hover:underline transition-all" href="mailto:support@vacai.example">support@vacai.example</a>. We&apos;re here to help!</p>
        </div>
      </details>
    </section>
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

      <div className="relative max-w-4xl w-full mx-4">
        <div className="rounded-3xl shadow-2xl overflow-hidden relative border border-gray-200 max-h-[90vh] w-full bg-white">
          {/* Close button */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 shadow-lg border-2 border-gray-200 hover:border-[#0070AC] transition-all"
              aria-label="Close help dialog"
              title="Close"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Help & FAQ</h2>
            </div>
            <p className="text-white/90 mt-2 text-lg">Find answers to common questions and get quick help</p>
          </div>

          {/* Scrollable content area */}
          <div className="p-6 md:p-8 max-h-[calc(90vh-180px)] overflow-auto bg-gray-50">
            <HelpFAQList />
            
            {/* Additional Help Section */}
            <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-[#0070AC] shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0070AC] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Need More Assistance?</h3>
                  <p className="text-gray-600 mb-4">Our support team is available 24/7 to help you plan the perfect vacation.</p>
                  <a 
                    href="mailto:support@vacai.example"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0070AC] hover:bg-[#005a8b] text-white rounded-full font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
