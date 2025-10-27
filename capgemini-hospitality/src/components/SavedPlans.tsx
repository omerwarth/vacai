"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type SavedPlan = {
  id: string;
  title: string;
  date: string;
  status: "saved" | "favorite" | "wishlist";
  price?: number;
  location?: string;
  description?: string;
};

const SAVED_PLANS_KEY = "saved-vacation-plans";

function loadSavedPlans(): SavedPlan[] {
  try {
    const raw = localStorage.getItem(SAVED_PLANS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // normalize prices to numbers and ensure location exists
      return parsed.map((p) => ({
        ...p,
        price: p && typeof p.price !== 'number' ? Number(p.price) || 0 : p.price || 0,
        location: p && p.location ? String(p.location) : '',
        description: p && p.description ? String(p.description) : ''
      }));
    }
  } catch {
    // ignore
  }
  return [];
}

export default function SavedPlans() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [period, setPeriod] = useState<'all' | 'day' | 'week' | 'month' | 'year' | '2y' | '3y' | '4y' | '5y' | '10y'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formStatus, setFormStatus] = useState<SavedPlan['status']>('saved');
  const [formPrice, setFormPrice] = useState<number | string>(0);
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [priceThreshold, setPriceThreshold] = useState<number | 'all'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activePlan, setActivePlan] = useState<SavedPlan | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    setPlans(loadSavedPlans());
  }, []);

  // compute filtered plans based on selected period
  const periodFilteredPlans = plans.filter((plan) => {
    if (period === 'all') return true;
    const planDate = new Date(plan.date).getTime();
    const now = Date.now();
    let cutoff = now;
    if (period === 'day') cutoff = now - 24 * 60 * 60 * 1000;
    if (period === 'week') cutoff = now - 7 * 24 * 60 * 60 * 1000;
    if (period === 'month') cutoff = now - 30 * 24 * 60 * 60 * 1000;
    if (period === 'year') cutoff = now - 365 * 24 * 60 * 60 * 1000;
    if (period === '2y') cutoff = now - 2 * 365 * 24 * 60 * 60 * 1000;
    if (period === '3y') cutoff = now - 3 * 365 * 24 * 60 * 60 * 1000;
    if (period === '4y') cutoff = now - 4 * 365 * 24 * 60 * 60 * 1000;
    if (period === '5y') cutoff = now - 5 * 365 * 24 * 60 * 60 * 1000;
    if (period === '10y') cutoff = now - 10 * 365 * 24 * 60 * 60 * 1000;
    return planDate >= cutoff;
  });

  // apply price filtering (fixed to work independently)
  const priceFilteredPlans = periodFilteredPlans.filter((plan) => {
    if (priceThreshold === 'all') return true;
    return (plan.price || 0) >= priceThreshold;
  });

  // apply search filter (case-insensitive substring) against title OR location
  const visiblePlans = priceFilteredPlans.filter((plan) => {
    if (!locationQuery) return true;
    const q = locationQuery.toLowerCase();
    const inTitle = plan.title && plan.title.toLowerCase().includes(q);
    const inLocation = plan.location && plan.location.toLowerCase().includes(q);
    const inDescription = plan.description && plan.description.toLowerCase().includes(q);
    return Boolean(inTitle || inLocation || inDescription);
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Back Button */}
      <button
        onClick={() => window.location.assign('/')}
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-[#0070AC] transition-colors group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0070AC] to-[#005a8b] flex items-center justify-center text-white shadow-lg">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Saved Plans</h1>
            <p className="text-gray-600 mt-1">Your saved vacation ideas and wishlist destinations</p>
            <p className="text-[#0070AC] font-semibold mt-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Total Saved: {visiblePlans.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'all' | 'day' | 'week' | 'month' | 'year' | '2y' | '3y' | '4y' | '5y' | '10y')}
            className="text-sm rounded-full border-2 border-gray-200 px-4 py-2 bg-white text-gray-700 hover:border-[#0070AC] transition-all focus:ring-2 focus:ring-[#0070AC] focus:border-transparent"
          >
            <option value="day">Day Ago</option>
            <option value="week">Week Ago</option>
            <option value="month">Month Ago</option>
            <option value="year">Year Ago</option>
            <option value="2y">2 Years Ago</option>
            <option value="3y">3 Years Ago</option>
            <option value="4y">4 Years Ago</option>
            <option value="5y">5 Years Ago</option>
            <option value="10y">10 Years Ago</option>
            <option value="all">All Time</option>
          </select>
          <select
            value={priceThreshold === 'all' ? 'all' : String(priceThreshold)}
            onChange={(e) => setPriceThreshold(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-sm rounded-full border-2 border-gray-200 px-4 py-2 bg-white text-gray-700 hover:border-[#0070AC] transition-all focus:ring-2 focus:ring-[#0070AC] focus:border-transparent"
          >
            <option value="1">≥ $1</option>
            <option value="10">≥ $10</option>
            <option value="100">≥ $100</option>
            <option value="500">≥ $500</option>
            <option value="1000">≥ $1,000</option>
            <option value="10000">≥ $10,000</option>
            <option value="all">All Prices</option>
          </select>
          <input
            placeholder="Search saved plans..."
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="text-sm rounded-full border-2 border-gray-200 px-4 py-2 bg-white text-gray-700 placeholder-gray-400 hover:border-[#0070AC] transition-all focus:ring-2 focus:ring-[#0070AC] focus:border-transparent"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm px-5 py-2 rounded-full bg-[#0070AC] hover:bg-[#005a8b] text-white transition-all shadow-md hover:shadow-lg font-semibold"
          >
            + Save New Plan
          </button>
          <button
            onClick={() => setPlans(loadSavedPlans())}
            className="text-sm p-2 rounded-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#0070AC] transition-all"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

        {(!plans || plans.length === 0) ? (
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#0070AC] to-[#005a8b] rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No saved plans yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Start saving vacation ideas, destinations, and dream trips for future reference.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-[#0070AC] hover:bg-[#005a8b] text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Save Your First Plan
          </button>
        </div>
  ) : visiblePlans.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No plans match your filters</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Try adjusting your time period, price range, or search query to see more results.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPeriod('all')} className="px-6 py-3 bg-[#0070AC] hover:bg-[#005a8b] text-white rounded-full font-semibold transition-all shadow-md">Show All Time</button>
            <button onClick={() => { setPriceThreshold('all'); setLocationQuery(''); }} className="px-6 py-3 bg-white border-2 border-gray-200 hover:border-[#0070AC] text-gray-700 rounded-full font-semibold transition-all">Clear Filters</button>
          </div>
        </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePlans.map((plan) => (
            <article key={plan.id} className="relative bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:border-[#0070AC] transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.title}</h3>
            {plan.location ? <div className="text-sm text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {plan.location}
            </div> : null}
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                  plan.status === 'favorite' ? 'bg-red-100 text-red-800' : plan.status === 'saved' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {plan.status === 'favorite' ? '❤️ Favorite' : plan.status === 'saved' ? '💾 Saved' : '🌟 Wishlist'}
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-600 line-clamp-3">{plan.description || 'A saved vacation idea. Click to view details and plan your next adventure.'}</p>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(plan.date).toLocaleDateString()}
                  </span>
                  {plan.price && plan.price > 0 && (
                    <span className="text-[#0070AC] font-bold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(plan.price)}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => { setActivePlan(plan); setShowDetailModal(true); }} className="flex-1 text-sm px-4 py-2.5 rounded-full bg-[#0070AC] hover:bg-[#005a8b] text-white font-semibold transition-all shadow-md hover:shadow-lg">View Details</button>
                  <button onClick={() => {
                    // delete single plan
                    const updated = plans.filter(p => p.id !== plan.id);
                    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
                    setPlans(updated);
                  }} className="text-sm p-2.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="Remove">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {/* Detail Modal */}
      {showDetailModal && activePlan && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-[#0070AC] to-[#005a8b]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-3xl font-bold text-white">Plan Details</h3>
                <button 
                  onClick={() => { setShowDetailModal(false); setActivePlan(null); }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-white/90">Review your saved vacation plan</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Title</p>
                <p className="text-lg font-bold text-gray-900">{activePlan.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Saved On</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(activePlan.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    activePlan.status === 'favorite' ? 'bg-red-100 text-red-800' : activePlan.status === 'saved' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {activePlan.status === 'favorite' ? '❤️ Favorite' : activePlan.status === 'saved' ? '💾 Saved' : '🌟 Wishlist'}
                  </span>
                </div>
              </div>

              {activePlan.location && (
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#0070AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {activePlan.location}
                  </p>
                </div>
              )}

              {activePlan.price && activePlan.price > 0 && (
                <div className="bg-gradient-to-br from-[#0070AC] to-[#005a8b] rounded-2xl p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-white/80">Estimated Price</p>
                  <p className="text-2xl font-bold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(activePlan.price)}</p>
                </div>
              )}

              {activePlan.description && (
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{activePlan.description}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Plan ID</p>
                <p className="text-xs text-gray-500 font-mono break-all">{activePlan.id}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 flex items-center justify-end gap-3">
              <button 
                onClick={() => { setShowDetailModal(false); setActivePlan(null); }} 
                className="px-6 py-2.5 rounded-full border-2 border-gray-200 text-gray-700 hover:border-[#0070AC] hover:text-[#0070AC] font-semibold transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  alert(`Starting to plan: ${activePlan.title}`);
                }} 
                className="px-6 py-2.5 rounded-full bg-[#0070AC] hover:bg-[#005a8b] text-white font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Start Planning
              </button>
              <button 
                onClick={() => {
                  const updated = plans.filter(p => p.id !== activePlan.id);
                  localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
                  setPlans(updated);
                  setShowDetailModal(false);
                  setActivePlan(null);
                }} 
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Remove Plan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Plan Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-[#0070AC] to-[#005a8b]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-3xl font-bold text-white">Save New Plan</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-white/90">Create a new saved vacation plan</p>
            </div>

            {/* Form */}
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                <input 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)} 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0070AC] focus:border-transparent transition-all text-gray-900 placeholder-gray-400" 
                  placeholder="e.g. Dream Trip to Japan" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Saved</label>
                  <input 
                    type="date" 
                    value={formDate} 
                    onChange={(e) => setFormDate(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0070AC] focus:border-transparent transition-all text-gray-900" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value as SavedPlan['status'])} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0070AC] focus:border-transparent transition-all text-gray-900"
                  >
                    <option value="saved">💾 Saved</option>
                    <option value="favorite">❤️ Favorite</option>
                    <option value="wishlist">🌟 Wishlist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input 
                  value={formLocation} 
                  onChange={(e) => setFormLocation(e.target.value)} 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0070AC] focus:border-transparent transition-all text-gray-900 placeholder-gray-400" 
                  placeholder="e.g. Tokyo, Japan" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  value={formDescription} 
                  onChange={(e) => setFormDescription(e.target.value)} 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0070AC] focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none" 
                  rows={3}
                  placeholder="Brief description of the plan..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <input 
                    type="number" 
                    value={String(formPrice)} 
                    onChange={(e) => setFormPrice(e.target.value)} 
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0070AC] focus:border-transparent transition-all text-gray-900" 
                    placeholder="0" 
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowAddForm(false)} 
                className="px-6 py-2.5 rounded-full border-2 border-gray-200 text-gray-700 hover:border-[#0070AC] hover:text-[#0070AC] font-semibold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const id = Date.now().toString();
                  const sample: SavedPlan = { 
                    id, 
                    title: formTitle || 'New Saved Plan', 
                    date: new Date(formDate).toISOString(), 
                    status: formStatus, 
                    price: Number(formPrice) || 0, 
                    location: formLocation || '',
                    description: formDescription || ''
                  };
                  const existing = loadSavedPlans();
                  const updated = [sample, ...existing];
                  localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
                  setPlans(updated);
                  setShowAddForm(false);
                  setFormTitle('');
                  setFormDate(new Date().toISOString().slice(0,10));
                  setFormStatus('saved');
                  setFormLocation('');
                  setFormDescription('');
                  setFormPrice(0);
                }} 
                className="px-6 py-2.5 rounded-full bg-[#0070AC] hover:bg-[#005a8b] text-white font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SavedPlansLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/saved-plans')}
      className={className}
    >
      {children ?? 'View Saved Plans'}
    </button>
  );
}