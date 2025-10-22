"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Category data with placeholder itineraries
const categories = [
  {
    id: 'beach-paradise',
    name: 'Beach Paradise',
    description: 'Relax on pristine shores and tropical getaways',
    icon: '🏖️',
    color: 'from-cyan-500 to-blue-600',
    itineraryCount: 24,
  },
  {
    id: 'cultural-heritage',
    name: 'Cultural Heritage',
    description: 'Explore historic sites and traditional experiences',
    icon: '🏛️',
    color: 'from-amber-500 to-orange-600',
    itineraryCount: 18,
  },
  {
    id: 'food-adventure',
    name: 'Food Adventure',
    description: 'Culinary journeys and gastronomic delights',
    icon: '🍜',
    color: 'from-red-500 to-pink-600',
    itineraryCount: 32,
  },
  {
    id: 'luxury-escapes',
    name: 'Luxury Escapes',
    description: 'Premium experiences and high-end destinations',
    icon: '💎',
    color: 'from-purple-500 to-indigo-600',
    itineraryCount: 15,
  },
  {
    id: 'adventure-sports',
    name: 'Adventure & Sports',
    description: 'Thrilling activities and outdoor exploration',
    icon: '⛰️',
    color: 'from-green-500 to-teal-600',
    itineraryCount: 21,
  },
  {
    id: 'city-exploration',
    name: 'City Exploration',
    description: 'Urban adventures and metropolitan experiences',
    icon: '🏙️',
    color: 'from-slate-500 to-gray-600',
    itineraryCount: 28,
  },
];

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
  const [viewMode, setViewMode] = useState<'categories' | 'all'>('categories');

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
                <h1 className="text-2xl font-bold text-gray-900">Explore by Category</h1>
                <p className="text-sm text-gray-600">Browse curated collections of travel experiences</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => router.push(`/explore/${category.id}`)}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative p-8">
                {/* Icon */}
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {category.description}
                </p>
                
                {/* Count Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    {category.itineraryCount} itineraries
                  </span>
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Decorative Corner */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${category.color} opacity-5 rounded-bl-full`}></div>
            </button>
          ))}
        </div>
        
        {/* Featured Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Trending This Week</h2>
            <p className="text-gray-600">Popular itineraries from our community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyItineraries.slice(0, 3).map((itinerary) => (
              <div
                key={itinerary.id}
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
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{itinerary.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                        <span className="text-sm font-medium">{itinerary.likes}</span>
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
    </div>
  );
}
