"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categoryItineraries, categoryDetails } from './page';

interface CategoryPageClientProps {
  categoryId: string;
}

export default function CategoryPageClient({ categoryId }: CategoryPageClientProps) {
  const router = useRouter();
  
  const category = categoryDetails[categoryId];
  const itineraries = categoryItineraries[categoryId] || [];
  const [sortBy, setSortBy] = useState<string>("popular");

  const sortedItineraries = [...itineraries].sort((a, b) => {
    if (sortBy === "popular") return b.likes - a.likes;
    if (sortBy === "saves") return b.saves - a.saves;
    if (sortBy === "budget") return parseInt(a.budget.replace(/\D/g, '')) - parseInt(b.budget.replace(/\D/g, ''));
    return 0;
  });

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
          <button
            onClick={() => router.push('/explore')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/explore')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${category.color} py-16 px-4`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-8xl mb-6">{category.icon}</div>
          <h2 className="text-4xl font-bold text-white mb-4">{category.name}</h2>
          <p className="text-xl text-white/90 mb-8">{category.description}</p>
          <div className="flex items-center justify-center space-x-6 text-white/80">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>{itineraries.length} Itineraries</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Curated by Experts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Sort Options */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-lg font-semibold text-gray-900">
            {sortedItineraries.length} {sortedItineraries.length === 1 ? 'Itinerary' : 'Itineraries'}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="popular">Most Popular</option>
              <option value="saves">Most Saved</option>
              <option value="budget">Budget (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Itinerary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              onClick={() => router.push(`/explore/itinerary/${itinerary.id}`)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={itinerary.thumbnail}
                  alt={itinerary.destination}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-md">
                  {itinerary.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* User Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={itinerary.userAvatar}
                    alt={itinerary.userName}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{itinerary.userName}</p>
                    <p className="text-xs text-gray-500">Travel Creator</p>
                  </div>
                </div>

                {/* Destination */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{itinerary.destination}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{itinerary.description}</p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <svg className="w-4 h-4 fill-current text-red-500" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      <span className="text-sm font-medium">{itinerary.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span className="text-sm font-medium">{itinerary.saves}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{itinerary.budget}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
