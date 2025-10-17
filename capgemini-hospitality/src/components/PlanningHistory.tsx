"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  } catch (e) {
    // ignore
  }
  return [];
}

export default function PlanningHistory() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [period, setPeriod] = useState<'all' | 'day' | 'week' | 'month' | 'year' | '2y' | '3y' | '4y' | '5y' | '10y'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formStatus, setFormStatus] = useState<Plan['status']>('in-progress');
  const [formPrice, setFormPrice] = useState<number | string>(0);
  const [formLocation, setFormLocation] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [priceThreshold, setPriceThreshold] = useState<number | 'all'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    setPlans(loadPlans());
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
    return Boolean(inTitle || inLocation);
  });

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center text-white shadow-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3h8l-1 4H9L8 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-sky-700">Planning History</h1>
            <p className="text-sm text-sky-600 mt-1">Review your past and in-progress vacation plans.</p>
            <p className="text-sm text-sky-700 font-semibold mt-2">Total Plans: {visiblePlans.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="text-sm rounded-md border border-green-200 px-3 py-2 bg-green-50 text-green-700"
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
            className="ml-2 text-sm rounded-md border border-green-200 px-3 py-2 bg-green-50 text-green-700"
          >
            <option value="1">$1</option>
            <option value="10">$10</option>
            <option value="100">$100</option>
            <option value="500">$500</option>
            <option value="1000">$1,000</option>
            <option value="10000">$10,000</option>
            <option value="all">All</option>
          </select>
          <input
            placeholder="Search title or location"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="ml-2 text-sm rounded-md border border-green-200 px-3 py-2 bg-green-50 text-green-700"
          />
          <button
            onClick={() => window.location.assign('/')}
            className="text-sm px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
          >
            Back to Home
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 "
          >
            Add Sample Plan
          </button>
          <button
            onClick={() => setPlans(loadPlans())}
            className="text-sm px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 "
          >
            Refresh
          </button>
        </div>
      </div>

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
                  <button onClick={() => { setActivePlan(plan); setShowDetailModal(true); }} className="text-sm px-3 py-2 rounded-md bg-gradient-to-r from-sky-600 to-sky-700 text-white hover:opacity-95">Open</button>
                  <button onClick={() => {
                    // delete single plan
                    const updated = plans.filter(p => p.id !== plan.id);
                    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
                    setPlans(updated);
                  }} className="text-sm px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700">Delete</button>
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
                const updated = plans.filter(p => p.id !== activePlan.id);
                localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
                setPlans(updated);
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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a Plan</h3>

            <label className="block text-sm text-gray-700">Title</label>
            <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" />

            <label className="block text-sm text-gray-700">Date</label>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" />

            <label className="block text-sm text-gray-700">Location</label>
            <input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 border rounded-md" />

            <label className="block text-sm text-gray-700">Status</label>
            <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as Plan['status'])} className="w-full mt-1 mb-4 px-3 py-2 border rounded-md">
              <option value="in-progress">In-progress</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>

            <label className="block text-sm text-gray-700">Estimated Price (USD)</label>
            <input type="number" value={String(formPrice)} onChange={(e) => setFormPrice(e.target.value)} className="w-full mt-1 mb-4 px-3 py-2 border rounded-md" />

            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-md border border-sky-600 text-sky-600">Cancel</button>
              <button onClick={() => {
                const id = Date.now().toString();
                const sample: Plan = { id, title: formTitle || 'New Plan', date: new Date(formDate).toISOString(), status: formStatus, price: Number(formPrice) || 0, location: formLocation || '' };
                const existing = loadPlans();
                const updated = [sample, ...existing];
                localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated));
                setPlans(updated);
                setShowAddForm(false);
                setFormTitle('');
                setFormDate(new Date().toISOString().slice(0,10));
                setFormStatus('in-progress');
                setFormLocation('');
              }} className="px-4 py-2 rounded-md bg-sky-600 text-white">Add Plan</button>
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
