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
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-emerald-700">Saved Plans</h1>
            <p className="text-sm text-emerald-600 mt-1">Your saved vacation ideas and wishlist destinations.</p>
            <p className="text-sm text-emerald-700 font-semibold mt-2">Total Saved: {visiblePlans.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'all' | 'day' | 'week' | 'month' | 'year' | '2y' | '3y' | '4y' | '5y' | '10y')}
            className="text-sm rounded-md border border-emerald-200 px-3 py-2 bg-emerald-50 text-emerald-700"
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
            className="ml-2 text-sm rounded-md border border-emerald-200 px-3 py-2 bg-emerald-50 text-emerald-700"
          >
            <option value="1">≥ $1</option>
            <option value="10">≥ $10</option>
            <option value="100">≥ $100</option>
            <option value="500">≥ $500</option>
            <option value="1000">≥ $1,000</option>
            <option value="10000">≥ $10,000</option>
            <option value="all">All</option>
          </select>
          <input
            placeholder="Search saved plans..."
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="ml-2 text-sm rounded-md border border-emerald-200 px-3 py-2 bg-emerald-50 text-emerald-700 placeholder-emerald-500"
          />
          <button
            onClick={() => window.location.assign('/')}
            className="text-sm px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Back to Home
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 "
          >
            Save New Plan
          </button>
          <button
            onClick={() => setPlans(loadSavedPlans())}
            className="text-sm px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 "
          >
            Refresh
          </button>
        </div>
      </div>

        {(!plans || plans.length === 0) ? (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-10 text-center">
          <svg className="mx-auto mb-4 w-16 h-16 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved plans yet</h2>
          <p className="text-sm text-gray-600 mb-6">Start saving vacation ideas, destinations, and dream trips for future reference.</p>
        </div>
  ) : visiblePlans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-10 text-center">
          <svg className="mx-auto mb-4 w-16 h-16 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved plans match the selected filters</h2>
          <p className="text-sm text-gray-600 mb-6">Try a different time period, clear the search, or save a new plan.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPeriod('all')} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Show All</button>
          </div>
        </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePlans.map((plan) => (
            <article key={plan.id} className="relative bg-white border border-emerald-50 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:ring-1 hover:ring-emerald-100 transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div>
            <h3 className="text-lg font-semibold text-emerald-800">{plan.title}</h3>
            {plan.location ? <div className="text-sm text-emerald-600 mt-1">{plan.location}</div> : null}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    plan.status === 'favorite' ? 'bg-red-100 text-red-800' : plan.status === 'saved' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {plan.status === 'favorite' ? '❤️ Favorite' : plan.status === 'saved' ? '💾 Saved' : '🌟 Wishlist'}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">{plan.description || 'A saved vacation idea. Click to view details and plan your next adventure.'}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setActivePlan(plan); setShowDetailModal(true); }} className="text-sm px-3 py-2 rounded-md bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:opacity-95">View Details</button>
                  <button onClick={() => {
                    // delete single plan
                    const updated = plans.filter(p => p.id !== plan.id);
                    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
                    setPlans(updated);
                  }} className="text-sm px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">Remove</button>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-3">
                  <span>{new Date(plan.date).toLocaleDateString()}</span>
                  {plan.price && plan.price > 0 && (
                    <span className="text-emerald-700 font-semibold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(plan.price)}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {/* Detail Modal */}
      {showDetailModal && activePlan && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold text-emerald-800 mb-4">Saved Plan Details</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div><strong>Title:</strong> {activePlan.title}</div>
              <div><strong>Saved on:</strong> {new Date(activePlan.date).toLocaleString()}</div>
              <div><strong>Location:</strong> {activePlan.location || '-'}</div>
              <div><strong>Status:</strong> {activePlan.status}</div>
              {activePlan.price && activePlan.price > 0 && (
                <div><strong>Est. Price:</strong> {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(activePlan.price)}</div>
              )}
              {activePlan.description && (
                <div><strong>Description:</strong> {activePlan.description}</div>
              )}
              <div className="break-all"><strong>ID:</strong> {activePlan.id}</div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => { setShowDetailModal(false); setActivePlan(null); }} className="px-4 py-2 rounded-md border border-emerald-600 text-emerald-600">Close</button>
              <button onClick={() => {
                // Move to planning (you could integrate with actual planning system)
                alert(`Starting to plan: ${activePlan.title}`);
              }} className="px-4 py-2 rounded-md bg-emerald-600 text-white">Start Planning</button>
              <button onClick={() => {
                const updated = plans.filter(p => p.id !== activePlan.id);
                localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
                setPlans(updated);
                setShowDetailModal(false);
                setActivePlan(null);
              }} className="px-4 py-2 rounded-md bg-red-600 text-white">Remove Plan</button>
            </div>
          </div>
        </div>
      )}
      {/* Add Plan Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save New Plan</h3>

            <label className="block text-sm text-gray-700">Title</label>
            <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" placeholder="e.g. Dream Trip to Japan" />

            <label className="block text-sm text-gray-700">Date Saved</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" />

            <label className="block text-sm text-gray-700">Location</label>
            <input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" placeholder="e.g. Tokyo, Japan" />

            <label className="block text-sm text-gray-700">Status</label>
            <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as SavedPlan['status'])} className="w-full mt-1 mb-4 px-3 py-2 border rounded-md">
              <option value="saved">💾 Saved</option>
              <option value="favorite">❤️ Favorite</option>
              <option value="wishlist">🌟 Wishlist</option>
            </select>

            <label className="block text-sm text-gray-700">Description</label>
            <textarea 
              value={formDescription} 
              onChange={(e) => setFormDescription(e.target.value)} 
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" 
              rows={3}
              placeholder="Brief description of the plan..."
            />

            <label className="block text-sm text-gray-700">Estimated Price (USD)</label>
            <input type="number" value={String(formPrice)} onChange={(e) => setFormPrice(e.target.value)} className="w-full mt-1 mb-4 px-3 py-2 border rounded-md" placeholder="0" />

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-md border border-emerald-600 text-emerald-600">Cancel</button>
              <button onClick={() => {
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
              }} className="px-4 py-2 rounded-md bg-emerald-600 text-white">Save Plan</button>
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