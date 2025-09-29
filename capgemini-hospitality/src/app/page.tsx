'use client';

import { useState } from 'react';
import LandingPage from "@/components/LandingPage";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

type PageState = 'landing' | 'auth' | 'dashboard';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageState>('landing');
  const [user, setUser] = useState<User | null>(null);

  const handleGetStarted = () => {
    setCurrentPage('auth');
  };

  const handleSignIn = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'auth':
        return <AuthPage onSignIn={handleSignIn} />;
      case 'dashboard':
        return user ? <Dashboard user={user} onSignOut={handleSignOut} /> : null;
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentPage()}
    </div>
  );
}
