"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type SavedPlan = {
  id: string;
  title: string;
  date: string;
  status: "saved" | "favorite";
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
  const [formActivities, setFormActivities] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [priceThreshold, setPriceThreshold] = useState<number | 'all'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activePlan, setActivePlan] = useState<SavedPlan | null>(null);
  
  // Comparison feature states
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedPlansForComparison, setSelectedPlansForComparison] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Function to toggle favorite status
  const toggleFavoriteStatus = (planId: string) => {
    const updatedPlans = plans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          status: plan.status === 'favorite' ? 'saved' as const : 'favorite' as const
        };
      }
      return plan;
    });
    setPlans(updatedPlans);
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updatedPlans));
  };

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
            <p className="text-sm text-emerald-600 mt-1">Your saved vacation ideas and favorite destinations.</p>
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
          {/* Comparison Mode Toggle */}
          <button
            onClick={() => {
              setIsCompareMode(!isCompareMode);
              setSelectedPlansForComparison([]);
            }}
            className={`text-sm px-3 py-2 rounded-lg transition-colors ${
              isCompareMode 
                ? 'bg-emerald-600 dark:bg-emerald-700 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {isCompareMode ? 'Exit Compare' : 'Compare Plans'}
          </button>
          {/* Compare Button - only show in compare mode */}
          {isCompareMode && (
            <button
              onClick={() => setShowComparisonModal(true)}
              disabled={selectedPlansForComparison.length < 2}
              className={`text-sm px-3 py-2 rounded-lg transition-colors shadow-sm ${
                selectedPlansForComparison.length >= 2
                  ? 'bg-emerald-600 dark:bg-emerald-700 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Compare ({selectedPlansForComparison.length})
            </button>
          )}
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
            Create New Itinerary
          </button>
          <button
            onClick={() => setPlans(loadSavedPlans())}
            className="text-sm px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 "
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Comparison Mode Instructions */}
      {isCompareMode && visiblePlans.length > 0 && selectedPlansForComparison.length === 0 && (
        <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-700 flex items-center justify-center text-white shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200">Comparison Mode Active</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Select 2 or more plans using the checkboxes to compare them side by side.</p>
            </div>
          </div>
        </div>
      )}

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
            <article key={plan.id} className={`relative bg-white dark:bg-gray-800 border rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 ${
              isCompareMode && selectedPlansForComparison.includes(plan.id) 
                ? 'border-purple-300 dark:border-purple-500 ring-2 ring-purple-200 dark:ring-purple-600/50 bg-purple-50 dark:bg-purple-900/20 transform scale-[1.02]' 
                : 'border-emerald-50 dark:border-gray-700 hover:ring-1 hover:ring-emerald-100 dark:hover:ring-emerald-700'
            }`}>
              {/* Favorite Star Toggle */}
              {!isCompareMode && (
                <button
                  onClick={() => toggleFavoriteStatus(plan.id)}
                  className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title={plan.status === 'favorite' ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg 
                    className={`w-5 h-5 ${plan.status === 'favorite' ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} 
                    fill={plan.status === 'favorite' ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                  </svg>
                </button>
              )}
              
              {/* Comparison Mode Checkbox */}
              {isCompareMode && (
                <div className="absolute top-3 right-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedPlansForComparison.includes(plan.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlansForComparison([...selectedPlansForComparison, plan.id]);
                      } else {
                        setSelectedPlansForComparison(selectedPlansForComparison.filter(id => id !== plan.id));
                      }
                    }}
                    className="w-5 h-5 text-purple-600 dark:text-purple-500 bg-white dark:bg-gray-700 border-2 border-purple-300 dark:border-purple-500 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div>
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">{plan.title}</h3>
            {plan.location ? <div className="text-sm text-emerald-600 dark:text-emerald-300 mt-1">{plan.location}</div> : null}
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Activities:</span> {plan.description || 'No activities specified for this vacation plan.'}
              </p>

              {!isCompareMode && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setActivePlan(plan); setShowDetailModal(true); }} className="text-sm px-3 py-2 rounded-md bg-emerald-600 dark:bg-emerald-700 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors">View Details</button>
                    <button onClick={() => {
                      // delete single plan
                      const updated = plans.filter(p => p.id !== plan.id);
                      localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
                      setPlans(updated);
                    }} className="text-sm px-3 py-2 rounded-md bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-500 transition-colors">Remove</button>
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-3">
                    <span>{new Date(plan.date).toLocaleDateString()}</span>
                    {plan.price && plan.price > 0 && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(plan.price)}</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Show basic info in compare mode */}
              {isCompareMode && (
                <div className="mt-4 space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <div><strong>Status:</strong> {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}</div>
                    <div><strong>Date:</strong> {new Date(plan.date).toLocaleDateString()}</div>
                    {plan.price && plan.price > 0 && (
                      <div><strong>Price:</strong> {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(plan.price)}</div>
                    )}
                  </div>
                  <div className="flex justify-start">
                    <button 
                      onClick={() => { setActivePlan(plan); setShowDetailModal(true); }} 
                      className="text-sm px-3 py-2 rounded-md bg-emerald-600 dark:bg-emerald-700 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {/* Detail Modal */}
      {showDetailModal && activePlan && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 dark:bg-black/60">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 border dark:border-gray-700">
            <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200 mb-4">Saved Plan Details</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div><strong>Title:</strong> {activePlan.title}</div>
              <div><strong>Saved on:</strong> {new Date(activePlan.date).toLocaleString()}</div>
              <div><strong>Location:</strong> {activePlan.location || '-'}</div>
              <div><strong>Status:</strong> {activePlan.status.charAt(0).toUpperCase() + activePlan.status.slice(1)}</div>
              {activePlan.price && activePlan.price > 0 && (
                <div><strong>Est. Price:</strong> {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(activePlan.price)}</div>
              )}
              {activePlan.description && (
                <div><strong>Activities:</strong> {activePlan.description}</div>
              )}
              <div className="break-all"><strong>ID:</strong> {activePlan.id}</div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => { setShowDetailModal(false); setActivePlan(null); }} className="px-4 py-2 rounded-md border border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">Close</button>
              <button onClick={() => {
                // Move to planning (you could integrate with actual planning system)
                alert(`Starting to plan: ${activePlan.title}`);
              }} className="px-4 py-2 rounded-md bg-emerald-600 dark:bg-emerald-700 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors">Start Planning</button>
              <button onClick={() => {
                const updated = plans.filter(p => p.id !== activePlan.id);
                localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
                setPlans(updated);
                setShowDetailModal(false);
                setActivePlan(null);
              }} className="px-4 py-2 rounded-md bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors">Remove Plan</button>
            </div>
          </div>
        </div>
      )}
      {/* Add Plan Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Itinerary</h3>

            <label className="block text-sm text-gray-700">Title *</label>
            <input 
              value={formTitle} 
              onChange={(e) => setFormTitle(e.target.value)} 
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" 
              placeholder="e.g., Summer Vacation 2025" 
              required
            />

            <label className="block text-sm text-gray-700">Destination</label>
            <input 
              value={formLocation} 
              onChange={(e) => setFormLocation(e.target.value)} 
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" 
              placeholder="e.g., Paris, France" 
            />

            <label className="block text-sm text-gray-700">Start Date</label>
            <input 
              type="date" 
              value={formDate} 
              onChange={(e) => setFormDate(e.target.value)} 
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" 
            />

            <label className="block text-sm text-gray-700">Activities (comma-separated)</label>
            <input 
              value={formActivities} 
              onChange={(e) => setFormActivities(e.target.value)} 
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" 
              placeholder="e.g., sightseeing, dining, museums" 
            />

            <label className="block text-sm text-gray-700">Status</label>
            <select 
              value={formStatus} 
              onChange={(e) => setFormStatus(e.target.value as SavedPlan['status'])} 
              className="w-full mt-1 mb-4 px-3 py-2 border rounded-md"
            >
              <option value="saved">Saved</option>
              <option value="favorite">Favorite</option>
            </select>

            <label className="block text-sm text-gray-700">Estimated Budget (USD)</label>
            <input 
              type="number" 
              value={String(formPrice)} 
              onChange={(e) => setFormPrice(e.target.value)} 
              className="w-full mt-1 mb-4 px-3 py-2 border rounded-md" 
              placeholder="0" 
            />

            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowAddForm(false);
                }} 
                className="px-4 py-2 rounded-md border border-emerald-600 text-emerald-600"
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
                    description: formDescription || formActivities || ''
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
                  setFormActivities('');
                  setFormPrice(0);
                }} 
                className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                disabled={!formTitle.trim()}
              >
                Create Itinerary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Comparison Modal */}
      {showComparisonModal && selectedPlansForComparison.length >= 2 && (() => {
        const selectedPlans = plans.filter(p => selectedPlansForComparison.includes(p.id));
        
        if (selectedPlans.length < 2) return null;

        const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
        const formatPrice = (price?: number) => price && price > 0 ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(price) : 'Not specified';
        
        // Function to count attractions/activities from description
        const countAttractions = (description?: string) => {
          if (!description) return 0;
          // Split by comma and count non-empty items
          const attractions = description.split(',').map(item => item.trim()).filter(item => item.length > 0);
          return attractions.length;
        };

        // Determine grid layout based on number of plans
        const getGridCols = (count: number) => {
          if (count === 2) return 'md:grid-cols-2';
          if (count === 3) return 'md:grid-cols-3';
          if (count === 4) return 'md:grid-cols-2 lg:grid-cols-4';
          return 'md:grid-cols-2 lg:grid-cols-3'; // For 5+ plans
        };

        
        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 dark:bg-black/70">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-gray-700 dark:to-gray-600 border-b border-emerald-200 dark:border-gray-600 p-6 rounded-t-xl">
                <h2 className="text-2xl font-bold mb-2 text-emerald-800 dark:text-emerald-200">Plan Comparison</h2>
                <p className="text-emerald-700 dark:text-emerald-300">Comparing {selectedPlans.length} vacation plans</p>
              </div>

              {/* Comparison Content */}
              <div className="p-6 bg-white dark:bg-gray-800">
                <div className={`grid grid-cols-1 ${getGridCols(selectedPlans.length)} gap-6`}>
                  {(() => {
                    // First, determine which plans are special
                    const cheapestPlan = selectedPlans.reduce((prev, current) => 
                      (prev.price || 0) < (current.price || 0) ? prev : current
                    );
                    const mostActivitiesPlan = selectedPlans.reduce((prev, current) => 
                      countAttractions(prev.description) > countAttractions(current.description) ? prev : current
                    );
                    
                    // Sort plans to put special ones first
                    const sortedPlans = [...selectedPlans].sort((a, b) => {
                      const aIsCheapest = a.id === cheapestPlan.id;
                      const aHasMostActivities = a.id === mostActivitiesPlan.id;
                      const bIsCheapest = b.id === cheapestPlan.id;
                      const bHasMostActivities = b.id === mostActivitiesPlan.id;
                      
                      // Both special attributes = highest priority
                      const aSpecialCount = (aIsCheapest ? 1 : 0) + (aHasMostActivities ? 1 : 0);
                      const bSpecialCount = (bIsCheapest ? 1 : 0) + (bHasMostActivities ? 1 : 0);
                      
                      if (aSpecialCount !== bSpecialCount) {
                        return bSpecialCount - aSpecialCount; // Higher special count first
                      }
                      
                      // If same special count, maintain original order
                      return 0;
                    });
                    
                    return sortedPlans.map((plan, index) => {
                    const isCheapest = plan.id === cheapestPlan.id;
                    const hasMostActivities = plan.id === mostActivitiesPlan.id;
                    
                    // Determine card styling based on special attributes
                    let cardClasses = "";
                    let headerClasses = "";
                    let iconColor = "text-emerald-600 dark:text-emerald-400";
                    let activitiesBackground = "bg-gradient-to-r from-white/50 to-emerald-50/50 dark:from-gray-700/30 dark:to-emerald-900/30";
                    
                    if (isCheapest && hasMostActivities) {
                      // Both gold and silver - use a special gradient
                      cardClasses = "bg-gradient-to-br from-yellow-50 via-gray-50 to-yellow-100 dark:from-yellow-900/20 dark:via-gray-800/20 dark:to-yellow-800/20 rounded-lg p-6 border-2 border-yellow-400 dark:border-yellow-600 shadow-lg";
                      headerClasses = "text-yellow-800 dark:text-yellow-200";
                      iconColor = "text-yellow-600 dark:text-yellow-400";
                      activitiesBackground = "bg-gradient-to-r from-yellow-100/70 via-gray-100/60 to-yellow-100/70 dark:from-yellow-900/40 dark:via-gray-800/30 dark:to-yellow-900/40";
                    } else if (isCheapest) {
                      // Gold for cheapest
                      cardClasses = "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-6 border-2 border-yellow-400 dark:border-yellow-600 shadow-lg";
                      headerClasses = "text-yellow-800 dark:text-yellow-200";
                      iconColor = "text-yellow-600 dark:text-yellow-400";
                      activitiesBackground = "bg-gradient-to-r from-yellow-100/70 to-yellow-50/80 dark:from-yellow-900/40 dark:to-yellow-800/30";
                    } else if (hasMostActivities) {
                      // Silver for most activities
                      cardClasses = "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/20 dark:to-gray-600/20 rounded-lg p-6 border-2 border-gray-400 dark:border-gray-500 shadow-lg";
                      headerClasses = "text-gray-800 dark:text-gray-200";
                      iconColor = "text-gray-600 dark:text-gray-400";
                      activitiesBackground = "bg-gradient-to-r from-gray-100/70 to-gray-50/80 dark:from-gray-600/40 dark:to-gray-700/30";
                    } else {
                      // Default emerald styling
                      cardClasses = "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700/50";
                      headerClasses = "text-emerald-800 dark:text-emerald-200";
                      iconColor = "text-emerald-600 dark:text-emerald-400";
                      activitiesBackground = "bg-gradient-to-r from-emerald-100/70 to-emerald-50/80 dark:from-emerald-900/40 dark:to-emerald-800/30";
                    }
                    
                    return (
                    <div key={plan.id} className={cardClasses}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col">
                          <h3 className={`text-xl font-semibold ${headerClasses}`}>{plan.title}</h3>
                          {/* Special badges */}
                          <div className="flex gap-2 mt-1">
                            {isCheapest && (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
                                🏆 Best Price
                              </span>
                            )}
                            {hasMostActivities && (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                                🎯 Most Activities
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          plan.status === 'favorite' 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {plan.status === 'favorite' ? '♥ Favorite' : '📋 Saved'}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={iconColor}>📅</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(plan.date)}</span>
                        </div>
                        
                        {plan.location && (
                          <div className="flex items-center gap-2">
                            <span className={iconColor}>📍</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{plan.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className={iconColor}>💰</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{formatPrice(plan.price)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={iconColor}>🎯</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{countAttractions(plan.description)} activities</span>
                        </div>
                        
                        {plan.description && (
                          <div className="mt-4">
                            <h4 className={`text-sm font-medium ${headerClasses} mb-2`}>Activities:</h4>
                            <div className={`text-sm text-gray-600 dark:text-gray-400 ${activitiesBackground} rounded-lg p-3 max-h-32 overflow-y-auto`}>
                              {plan.description.split(',').map((activity, actIndex) => (
                                <div key={actIndex} className="mb-1">• {activity.trim()}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  });
                  })()}
                </div>

                {/* Comparison Summary */}
                {/* Comparison Summary */}
                <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📊 Comparison Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Total Plans:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedPlans.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Favorites:</span>
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {selectedPlans.filter(p => p.status === 'favorite').length}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Price Range:</span>
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          ${Math.min(...selectedPlans.map(p => p.price || 0)).toLocaleString()} - ${Math.max(...selectedPlans.map(p => p.price || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Avg. Activities:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {Math.round(selectedPlans.reduce((sum, p) => sum + countAttractions(p.description), 0) / selectedPlans.length)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Most Recent:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          {selectedPlans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.title.substring(0, 12)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Budget Option:</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold text-xs">
                          {selectedPlans.sort((a, b) => (a.price || 0) - (b.price || 0))[0]?.title.substring(0, 12)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button 
                    onClick={() => {
                      setShowComparisonModal(false);
                      setSelectedPlansForComparison([]);
                      setIsCompareMode(false);
                    }}
                    className="px-4 py-2 rounded-md border border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    Close Comparison
                  </button>
                  <button 
                    onClick={() => {
                      setShowComparisonModal(false);
                      setSelectedPlansForComparison([]);
                    }}
                    className="px-4 py-2 rounded-md bg-purple-600 dark:bg-purple-700 text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                  >
                    Compare Different Plans
                  </button>
                  <button 
                    onClick={() => {
                      // Find favorite plan or first plan
                      const favoriteplan = selectedPlans.find(p => p.status === 'favorite') || selectedPlans[0];
                      alert(`Starting to plan with: ${favoriteplan.title}`);
                    }}
                    className="px-4 py-2 rounded-md bg-emerald-600 dark:bg-emerald-700 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
                  >
                    Start Planning
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
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