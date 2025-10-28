'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import ItineraryCard from '@/components/ItineraryCard';
import { Button } from '@/components/ui/button';
import { apiService, Itinerary } from '@/config/api';

export default function ItineraryPage() {
  const router = useRouter();
  const { user } = useAuth0();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItineraries() {
      if (!user?.sub) return;

      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getItineraries(user.sub);
        setItineraries(response.itineraries || []);
      } catch (err) {
        console.error('Failed to load itineraries:', err);
        setError("Failed to load itineraries.");
      } finally {
        setLoading(false);
      }
    }

    fetchItineraries();
  }, [user?.sub]);

  if (loading) return <div className="p-8">Loading your itineraries...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Your Travel Itineraries
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Review your flight details and travel information
            </p>
          </div>
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Main Content */}
        {itineraries.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No itineraries found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven&apos;t created any travel itineraries yet.
            </p>
            <Button onClick={() => router.push('/explore')}>
              Explore Destinations
            </Button>
          </div>
        ) : (
          <div className="grid gap-8">
            {itineraries.map((itinerary) => (
              <div key={itinerary.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    ✈️ {itinerary.title}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="orbit-override">
                    <ItineraryCard itinerary={itinerary} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Travel Information Grid */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Travel Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              💡 Travel Tips
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Before Departure</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Check in online 24 hours before
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Arrive 2 hours early for international flights
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Verify passport validity (6+ months remaining)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* General Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              🌍 Travel Information
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">General Tips</h4>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Keep digital copies of important documents
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Download offline maps for your destinations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Check weather forecasts before departure
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Have travel insurance coverage
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-indigo-200 dark:border-gray-600 p-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Need to make changes?
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Contact customer service or modify your booking online
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                📧 Email Itinerary
              </Button>
              <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                📱 Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
