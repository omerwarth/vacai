"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const categories = [
  {
    id: "beach-paradise",
    name: "Beach Paradise",
    description: "Relax on pristine shores and tropical getaways",
    icon: "🏖️",
    color: "from-cyan-400 via-sky-400 to-blue-500",
    glow: "shadow-cyan-200/60",
    itineraryCount: 24,
  },
  {
    id: "cultural-heritage",
    name: "Cultural Heritage",
    description: "Explore historic sites and traditional experiences",
    icon: "🏛️",
    color: "from-amber-400 via-orange-400 to-rose-500",
    glow: "shadow-amber-200/60",
    itineraryCount: 18,
  },
  {
    id: "food-adventure",
    name: "Food Adventure",
    description: "Culinary journeys and gastronomic delights",
    icon: "🍜",
    color: "from-pink-400 via-rose-400 to-red-500",
    glow: "shadow-pink-200/60",
    itineraryCount: 32,
  },
  {
    id: "luxury-escapes",
    name: "Luxury Escapes",
    description: "Premium experiences and high-end destinations",
    icon: "💎",
    color: "from-violet-400 via-purple-400 to-indigo-500",
    glow: "shadow-violet-200/60",
    itineraryCount: 15,
  },
  {
    id: "adventure-sports",
    name: "Adventure & Sports",
    description: "Thrilling activities and outdoor exploration",
    icon: "⛰️",
    color: "from-green-400 via-emerald-400 to-teal-500",
    glow: "shadow-green-200/60",
    itineraryCount: 21,
  },
  {
    id: "city-exploration",
    name: "City Exploration",
    description: "Urban adventures and metropolitan experiences",
    icon: "🏙️",
    color: "from-gray-400 via-slate-400 to-zinc-500",
    glow: "shadow-gray-200/60",
    itineraryCount: 28,
  },
];

const dummyItineraries = [
  {
    id: 1,
    userName: "Sarah Johnson",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    destination: "Tokyo, Japan",
    duration: "7 days",
    budget: "$2,500",
    likes: 342,
    thumbnail:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    description:
      "Amazing week exploring Tokyo's vibrant neighborhoods, from Shibuya to Akihabara!",
  },
  {
    id: 2,
    userName: "Michael Chen",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    destination: "Paris, France",
    duration: "5 days",
    budget: "$3,200",
    likes: 567,
    thumbnail:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    description:
      "Romantic getaway through the City of Lights with amazing café stops.",
  },
  {
    id: 3,
    userName: "Emma Rodriguez",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    destination: "Bali, Indonesia",
    duration: "10 days",
    budget: "$1,800",
    likes: 891,
    thumbnail:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
    description:
      "Beach paradise with yoga retreats, temple visits, and stunning sunsets.",
  },
];

export default function ExplorePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 bg-[length:400%_400%] opacity-90"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Explore by Category
                </h1>
                <p className="text-sm text-gray-600">
                  Browse curated collections of travel experiences
                </p>
              </div>
            </div>

            {/* Dashboard Button */}
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Dashboard
            </button>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Categories */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => router.push(`/explore/${category.id}`)}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.05, rotate: 0.5 }}
                whileTap={{ scale: 0.97 }}
                className={`group relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 ${category.glow}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-all duration-500`}
                />
                <div className="relative p-8 text-left">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300 text-center">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors text-center">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 text-center">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-center">
                    <span className="text-sm font-medium text-gray-700">
                      {category.itineraryCount} itineraries
                    </span>
                    <motion.svg
                      whileHover={{ x: 4 }}
                      className="w-5 h-5 text-gray-400 group-hover:text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </motion.svg>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Trending */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20"
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                🌍 Trending This Week
              </h2>
              <p className="text-gray-700">
                Discover what travelers are loving right now
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {dummyItineraries.map((itinerary, i) => (
                <motion.div
                  key={itinerary.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group border border-gray-100"
                >
                  <div className="relative h-52">
                    <Image
                      src={itinerary.thumbnail}
                      alt={itinerary.destination}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium shadow">
                      {itinerary.duration}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src={itinerary.userAvatar}
                        alt={itinerary.userName}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-indigo-100"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {itinerary.userName}
                        </p>
                        <p className="text-xs text-gray-500">Travel Creator</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {itinerary.destination}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {itinerary.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-1 text-pink-500">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                        <span className="text-sm font-medium">
                          {itinerary.likes}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {itinerary.budget}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
