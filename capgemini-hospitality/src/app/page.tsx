'use client';

import { useAuth0 } from '@auth0/auth0-react';
import LandingPage from "@/app/landingpage/page";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  // Show loading state while Auth0 is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen">
        <Dashboard user={user} />
      </div>
    );
  }

  // If user is not authenticated, show landing page with direct auth
  return (
    <div className="min-h-screen">
      <LandingPage />
    </div>
  );
}
