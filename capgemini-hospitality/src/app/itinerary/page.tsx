'use client';

import { useRouter } from 'next/navigation';
import ItineraryCard from '@/components/ItineraryCard';
import { Button } from '@/components/ui/button';

export default function ItineraryPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Your Travel Itinerary
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
        <div className="grid gap-8">
          {/* Itinerary Card Container */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                ✈️ Flight Itinerary
              </h2>
            </div>
            <div className="p-6">
              <div className="orbit-override">
                <ItineraryCard />
              </div>
            </div>
          </div>

          {/* Travel Information Grid */}
          <div className="grid md:grid-cols-2 gap-6">
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

            {/* Destination Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🌍 Prague, Czech Republic
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Local Information</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Currency: Czech Crown (CZK)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Excellent public transport system
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      English widely spoken in tourist areas
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Time zone: CET (UTC+1)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-indigo-200 dark:border-gray-600 p-6">
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
    </div>
  );
}