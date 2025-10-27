'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TripAdvisorResult {
  id: string;
  name: string;
  description?: string;
  rating?: string;
  numReviews?: string;
  priceLevel?: string;
  address?: string;
  phone?: string;
  website?: string;
  photoUrl?: string;
}

interface TripAdvisorResponse {
  query: string;
  location: {
    id: string;
    name: string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  type: string;
  results: TripAdvisorResult[];
  count: number;
  error?: string;
  message?: string;
}

export default function TripAdvisorSearch() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'hotels' | 'restaurants' | 'attractions'>('hotels');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TripAdvisorResponse | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(
        `/api/tripadvisor?query=${encodeURIComponent(query)}&type=${type}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch data from TripAdvisor');
        return;
      }

      setResults(data);
    } catch (err) {
      setError('Network error: Failed to connect to TripAdvisor API');
      console.error('TripAdvisor search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          TripAdvisor Search
        </h2>
        <p className="text-gray-600">
          Search for hotels, restaurants, or attractions anywhere in the world
        </p>
      </div>

      {/* Search Input */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are you looking for?
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., hotels in New York, restaurants in Paris"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setType('hotels')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                type === 'hotels'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hotels
            </button>
            <button
              onClick={() => setType('restaurants')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                type === 'restaurants'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Restaurants
            </button>
            <button
              onClick={() => setType('attractions')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                type === 'attractions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Attractions
            </button>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search TripAdvisor'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* No Results */}
          {results.count === 0 && (
            <div className="text-center py-8 text-gray-500">
              {results.message || 'No results found. Try a different search query.'}
            </div>
          )}

          {/* Results Grid */}
          {results.results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.results.map((result) => (
                <div
                  key={result.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  {result.photoUrl && (
                    <Image
                      src={result.photoUrl}
                      alt={result.name}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">
                    {result.name}
                  </h4>

                  {result.rating && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-500 font-semibold">
                        ⭐ {result.rating}
                      </span>
                      {result.numReviews && (
                        <span className="text-sm text-gray-600">
                          ({result.numReviews} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {result.priceLevel && (
                    <div className="text-sm text-gray-600 mb-2">
                      Price: {result.priceLevel}
                    </div>
                  )}

                  {result.address && (
                    <div className="text-sm text-gray-600 mb-2">
                      📍 {result.address}
                    </div>
                  )}

                  {result.phone && (
                    <div className="text-sm text-gray-600 mb-2">
                      📞 {result.phone}
                    </div>
                  )}

                  {result.website && (
                    <a
                      href={result.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      Visit Website
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}

                  {result.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                      {result.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
