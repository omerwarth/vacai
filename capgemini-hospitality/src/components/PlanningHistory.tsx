"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { apiService, Itinerary } from "@/config/api";

type Plan = {
  id: string;
  title: string;
  date: string;
  status: "completed" | "in-progress" | "draft";
  price?: number;
  location?: string;
};

const SAVED_PLANS_KEY = "vacation-plans";

function loadPlans(): Plan[] {
  try {
    const raw = localStorage.getItem(SAVED_PLANS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // normalize prices to numbers and ensure location exists
      return parsed.map((p) => ({
        ...p,
        price: p && typeof p.price !== 'number' ? Number(p.price) || 0 : p.price || 0,
        location: p && p.location ? String(p.location) : ''
      }));
    }
  } catch {
    // ignore
  }
  return [];
}

export default function PlanningHistory() {
  const { user } = useAuth0();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'all' | 'day' | 'week' | 'month' | 'year' | '2y' | '3y' | '4y' | '5y' | '10y'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formStatus, setFormStatus] = useState<Plan['status']>('in-progress');
  const [formPrice, setFormPrice] = useState<number | string>(0);
  const [formLocation, setFormLocation] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formActivities, setFormActivities] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [priceThreshold, setPriceThreshold] = useState<number | 'all'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load itineraries from Azure Functions API
  const loadItineraries = useCallback(async () => {
    if (!user?.sub) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getItineraries(user.sub);
      
      // Convert API itineraries to Plan format
      const apiPlans: Plan[] = (response.itineraries || []).map((itinerary: Itinerary) => ({
        id: itinerary.id || '',
        title: itinerary.title || 'Untitled Plan',
        date: itinerary.startDate || itinerary.createdAt || new Date().toISOString(),
        status: (itinerary.status === 'completed' ? 'completed' : 
                 itinerary.status === 'booked' ? 'in-progress' : 'draft') as Plan['status'],
        price: itinerary.budget || 0,
        location: itinerary.destination || '',
      }));

      setPlans(apiPlans);
    } catch (err) {
      console.error('Failed to load itineraries:', err);
      setError('Failed to load itineraries. The itinerary container may not exist in the database yet. Please check ITINERARY_API_SPEC.md');
      // Fallback to localStorage
      setPlans(loadPlans());
    } finally {
      setIsLoading(false);
    }
  }, [user?.sub]);

  useEffect(() => {
    // Load itineraries from API when component mounts
    loadItineraries();
  }, [loadItineraries]);

  // Create a new itinerary via API
  const handleCreateItinerary = async () => {
    if (!user?.sub || !formTitle.trim()) {
      setError('Please provide a title for your itinerary');
      return;
    }

    // Validate required fields
    const destination = formDestination.trim() || formLocation.trim();
    if (!destination) {
      setError('Please provide a destination for your itinerary');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const itineraryStatus: 'planning' | 'booked' | 'completed' | 'cancelled' = 
        formStatus === 'completed' ? 'completed' : 
        formStatus === 'in-progress' ? 'booked' : 'planning';

      // Calculate end date (default to same day if not specified)
      const startDate = new Date(formDate);
      const endDate = new Date(formDate);
      endDate.setDate(endDate.getDate() + 1); // Default to next day

      const newItinerary = {
        userId: user.sub,
        profileId: user.sub, // You can update this to use selected profile
        title: formTitle.trim(),
        destination: destination,
        startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        endDate: endDate.toISOString().split('T')[0],
        status: itineraryStatus,
        budget: Number(formPrice) || 0,
        currency: 'USD',
        flights: [],
        activities: formActivities ? formActivities.split(',').map(a => ({
          name: a.trim(),
          description: '',
        })) : [],
        accommodations: [],
        restaurants: [],
        notes: '',
      };

      const response = await apiService.createItinerary(newItinerary);
      
      // Add to local state
      const newPlan: Plan = {
        id: response.itinerary?.id || Date.now().toString(),
        title: formTitle,
        date: formDate,
        status: formStatus,
        price: Number(formPrice) || 0,
        location: formDestination || formLocation,
      };

      setPlans([newPlan, ...plans]);

      // Also save to localStorage as backup
      const existing = loadPlans();
      localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify([newPlan, ...existing]));

      // Reset form
      setShowAddForm(false);
      setFormTitle('');
      setFormDate(new Date().toISOString().slice(0, 10));
      setFormStatus('in-progress');
      setFormPrice(0);
      setFormLocation('');
      setFormDestination('');
      setFormActivities('');
    } catch (err) {
      console.error('Failed to create itinerary:', err);
      setError('Failed to create itinerary. The itinerary container may not exist in the database yet. Please check ITINERARY_API_SPEC.md');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete itinerary via API
  const handleDeleteItinerary = async (planId: string) => {
    if (!user?.sub) return;

    try {
      await apiService.deleteItinerary(planId, user.sub);
      
      // Remove from local state
      const updated = plans.filter(p => p.id !== planId);
      setPlans(updated);

      // Also remove from localStorage
      const localPlans = loadPlans().filter(p => p.id !== planId);
      localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(localPlans));
    } catch (err) {
      console.error('Failed to delete itinerary:', err);
      setError('Failed to delete itinerary. Please try again.');
    }
  };


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
    return Boolean(inTitle || inLocation);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Planning History</h1>
            <p className="text-gray-600 mt-1">Review your past and in-progress vacation plans</p>
            <p className="text-[#0070AC] font-semibold mt-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Total Plans: {visiblePlans.length}
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
            placeholder="Search title or location"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="text-sm rounded-full border-2 border-gray-200 px-4 py-2 bg-white text-gray-700 placeholder-gray-400 hover:border-[#0070AC] transition-all focus:ring-2 focus:ring-[#0070AC] focus:border-transparent"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm px-5 py-2 rounded-full bg-[#0070AC] hover:bg-[#005a8b] text-white transition-all shadow-md hover:shadow-lg font-semibold"
          >
            + Create New
          </button>
          <button
            onClick={loadItineraries}
            className="text-sm p-2 rounded-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#0070AC] transition-all disabled:opacity-50"
            disabled={isLoading}
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

        {(!plans || plans.length === 0) ? (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-10 text-center">
          <svg className="mx-auto mb-4 w-16 h-16 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M8 3h8l1 4H7l1-4z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved plans yet</h2>
          <p className="text-sm text-gray-600 mb-6">Start planning a trip and your plans will appear here. You can save plans to revisit later.</p>
          {/* no actions in empty state; use header Refresh or navigate home */}
        </div>
  ) : visiblePlans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-10 text-center">
          <svg className="mx-auto mb-4 w-16 h-16 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M8 3h8l1 4H7l1-4z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No plans match the selected filters</h2>
          <p className="text-sm text-gray-600 mb-6">Try a different time period, clear the location search, or add a new plan.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPeriod('all')} className="px-4 py-2 rounded-lg bg-sky-600 text-white">Show All</button>
          </div>
        </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePlans.map((plan) => (
            <article key={plan.id} className="relative bg-white border border-sky-50 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:ring-1 hover:ring-sky-100 transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div>
            <h3 className="text-lg font-semibold text-sky-800">{plan.title}</h3>
            {plan.location ? <div className="text-sm text-sky-600 mt-1">{plan.location}</div> : null}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    plan.status === 'completed' ? 'bg-green-100 text-green-800' : plan.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">A brief summary of the plan would go here. You can extend this with destinations, travelers, and notes.</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.push(`/explore/itinerary/${plan.id}`)} className="text-sm px-3 py-2 rounded-md bg-gradient-to-r from-sky-600 to-sky-700 text-white hover:opacity-95">Open</button>
                  <button onClick={() => handleDeleteItinerary(plan.id)} className="text-sm px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700">Delete</button>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-3">
                  <span>{new Date(plan.date).toLocaleDateString()}</span>
                  <span className="text-sky-700 font-semibold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(plan.price || 0)}</span>
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
            <h3 className="text-xl font-semibold text-sky-800 mb-4">Plan Details</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div><strong>Title:</strong> {activePlan.title}</div>
              <div><strong>Date:</strong> {new Date(activePlan.date).toLocaleString()}</div>
              <div><strong>Location:</strong> {activePlan.location || '-'}</div>
              <div><strong>Status:</strong> {activePlan.status}</div>
              <div><strong>Price:</strong> {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(activePlan.price || 0)}</div>
              <div className="break-all"><strong>ID:</strong> {activePlan.id}</div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => { setShowDetailModal(false); setActivePlan(null); }} className="px-4 py-2 rounded-md border border-sky-600 text-sky-600">Close</button>
              <button onClick={() => {
                handleDeleteItinerary(activePlan.id);
                setShowDetailModal(false);
                setActivePlan(null);
              }} className="px-4 py-2 rounded-md bg-red-600 text-white">Delete Plan</button>
            </div>
          </div>
        </div>
      )}
      {/* Add Plan Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Itinerary</h3>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <label className="block text-sm text-gray-700">Title *</label>
            <input 
              value={formTitle} 
              onChange={(e) => setFormTitle(e.target.value)} 
              placeholder="e.g., Summer Vacation 2025"
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" 
              required
            />

            <label className="block text-sm text-gray-700">Destination</label>
            <input 
              value={formDestination} 
              onChange={(e) => setFormDestination(e.target.value)} 
              placeholder="e.g., Paris, France"
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" 
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
              placeholder="e.g., sightseeing, dining, museums"
              className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" 
            />

            <label className="block text-sm text-gray-700">Status</label>
            <select 
              value={formStatus} 
              onChange={(e) => setFormStatus(e.target.value as Plan['status'])} 
              className="w-full mt-1 mb-4 px-3 py-2 border rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="in-progress">In-progress</option>
              <option value="completed">Completed</option>
            </select>

            <label className="block text-sm text-gray-700">Estimated Budget (USD)</label>
            <input 
              type="number" 
              value={String(formPrice)} 
              onChange={(e) => setFormPrice(e.target.value)} 
              placeholder="0"
              className="w-full mt-1 mb-4 px-3 py-2 border rounded-md" 
            />

            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setError(null);
                }} 
                className="px-4 py-2 rounded-md border border-sky-600 text-sky-600"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateItinerary}
                className="px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
                disabled={isSaving || !formTitle.trim()}
              >
                {isSaving ? 'Creating...' : 'Create Itinerary'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlanningHistoryLink({
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
      onClick={() => router.push('/planning-history')}
      className={className}
    >
      {children ?? 'View Planning History'}
    </button>
  );
}
