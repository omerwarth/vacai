"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { allItineraries } from './data';

interface ItineraryDetailClientProps {
  itineraryId: string;
}

export default function ItineraryDetailClient({ itineraryId }: ItineraryDetailClientProps) {
  const router = useRouter();
  const itinerary = allItineraries[itineraryId];
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Itinerary not found</h1>
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
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-gray-700 font-medium">Back</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-medium">{isLiked ? itinerary.likes + 1 : itinerary.likes}</span>
              </button>
              
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaved ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="font-medium">Save</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-96">
        <Image
          src={itinerary.thumbnail}
          alt={itinerary.destination}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800">
                {itinerary.category}
              </span>
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800">
                {itinerary.duration}
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">{itinerary.destination}</h1>
            <p className="text-xl text-white/90">{itinerary.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Creator Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Image
                    src={itinerary.userAvatar}
                    alt={itinerary.userName}
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-gray-200"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{itinerary.userName}</h3>
                    <p className="text-sm text-gray-600">Travel Creator • 24 trips shared</p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Follow
                </button>
              </div>
            </div>

            {/* Placeholder Content */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Overview</h2>
              <div className="prose max-w-none text-gray-700">
                <p className="mb-4">
                  This is a placeholder itinerary detail page. In the full version, this would include:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>📍 Day-by-day itinerary with activities and locations</li>
                  <li>🏨 Accommodation recommendations</li>
                  <li>🍽️ Restaurant and dining suggestions</li>
                  <li>🎯 Must-see attractions and hidden gems</li>
                  <li>💡 Travel tips and insider advice</li>
                  <li>🗺️ Interactive maps</li>
                  <li>📸 Photo gallery</li>
                  <li>💬 Reviews and comments from other travelers</li>
                </ul>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="text-blue-900 font-medium">
                    🚀 This feature is coming soon! We&apos;re building a comprehensive itinerary view with all trip details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">{itinerary.duration}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-semibold text-green-600">{itinerary.budget}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold text-gray-900">{itinerary.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Saves</span>
                  <span className="font-semibold text-gray-900">{itinerary.saves}</span>
                </div>
              </div>
              
              <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-md">
                Use This Itinerary
              </button>
              
              <button className="w-full mt-3 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                Share Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
