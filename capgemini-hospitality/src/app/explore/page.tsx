"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ItineraryCard from '@/components/ItineraryCard';

// Dummy user data
const dummyItineraries = [
  {
    id: 1,
    userName: "Sarah Johnson",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    destination: "Tokyo, Japan",
    duration: "7 days",
    budget: "$2,500",
    likes: 342,
    saves: 128,
    tags: ["Cultural", "Food", "Shopping"],
    thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    description: "Amazing week exploring Tokyo's vibrant neighborhoods, from Shibuya to Akihabara!",
  },
  {
    id: 2,
    userName: "Michael Chen",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    destination: "Paris, France",
    duration: "5 days",
    budget: "$3,200",
    likes: 567,
    saves: 234,
    tags: ["Romance", "Art", "Food"],
    thumbnail: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    description: "Romantic getaway through the City of Lights with amazing café stops.",
  },
  {
    id: 3,
    userName: "Emma Rodriguez",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    destination: "Bali, Indonesia",
    duration: "10 days",
    budget: "$1,800",
    likes: 891,
    saves: 456,
    tags: ["Beach", "Wellness", "Adventure"],
    thumbnail: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
    description: "Beach paradise with yoga retreats, temple visits, and stunning sunsets.",
  },
  {
    id: 4,
    userName: "David Kim",
    userAvatar: "https://i.pravatar.cc/150?img=8",
    destination: "New York City, USA",
    duration: "4 days",
    budget: "$2,800",
    likes: 423,
    saves: 189,
    tags: ["City", "Shopping", "Entertainment"],
    thumbnail: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
    description: "Fast-paced NYC adventure covering all the iconic spots and hidden gems!",
  },
  {
    id: 5,
    userName: "Olivia Martinez",
    userAvatar: "https://i.pravatar.cc/150?img=9",
    destination: "Santorini, Greece",
    duration: "6 days",
    budget: "$3,500",
    likes: 1024,
    saves: 567,
    tags: ["Luxury", "Beach", "Romance"],
    thumbnail: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
    description: "Luxury escape in the Greek islands with breathtaking views and amazing food.",
  },
  {
    id: 6,
    userName: "James Wilson",
    userAvatar: "https://i.pravatar.cc/150?img=11",
    destination: "Dubai, UAE",
    duration: "5 days",
    budget: "$4,000",
    likes: 678,
    saves: 301,
    tags: ["Luxury", "Shopping", "Modern"],
    thumbnail: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    description: "Ultra-modern Dubai experience with luxury hotels and world-class dining.",
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  const filters = ["all", "Cultural", "Beach", "Food", "Adventure", "Luxury", "Romance"];

  const filteredItineraries = selectedFilter === "all" 
    ? dummyItineraries 
    : dummyItineraries.filter(item => item.tags.includes(selectedFilter));

  const sortedItineraries = [...filteredItineraries].sort((a, b) => {
    if (sortBy === "popular") return b.likes - a.likes;
    if (sortBy === "saves") return b.saves - a.saves;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Explore Itineraries</h1>
                <p className="text-sm text-gray-600">Discover trips created by our community</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Sort */}
        <div className="mb-8 space-y-4">
          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {sortedItineraries.length} itineraries found
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="saves">Most Saved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Itinerary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={() => {/* Future: navigate to itinerary detail */}}
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
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{itinerary.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {itinerary.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Budget */}
                <div className="flex items-center mb-4">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">{itinerary.budget}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm font-medium">{itinerary.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span className="text-sm font-medium">{itinerary.saves}</span>
                    </button>
                  </div>
                  <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedItineraries.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No itineraries found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
}
