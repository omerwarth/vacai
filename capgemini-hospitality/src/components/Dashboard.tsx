'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0, User as Auth0User } from '@auth0/auth0-react';
import { TravelerProfile } from '@/config/api';
import ImageCarousel from './ImageCarousel';
import OnboardingModal from './OnboardingModal';
import SurveyResults from './SurveyResults';
import TravelerProfileManager from './TravelerProfileManager';
import JourneyPlanner from './JourneyPlanner';
import { HelpModal } from './Help';
import { ContactModal } from './Contact';
import { NotificationModal } from './Notification';
import { SavedPlansLink } from './SavedPlans';
import { SettingsLink } from './Settings';
import { useTheme } from './ThemeProvider';

interface OnboardingData {
  [key: string]: string | string[] | number;
}

interface DashboardProps {
  user: Auth0User;
}

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter();
  const { logout } = useAuth0();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  // const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [hasExistingPlan, setHasExistingPlan] = useState(false);
  
  // Onboarding states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurveyResults, setShowSurveyResults] = useState(false);
  const [surveyData, setSurveyData] = useState<OnboardingData | null>(null);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<TravelerProfile | null>(null);
  const [showJourneyPlanner, setShowJourneyPlanner] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // Vacation destination images for carousel (still used by ImageCarousel)
  const vacationImages = [
    '/pexels-pixabay-208701.jpg',
    '/pexels-pixabay-38238.jpg',
    '/pexels-thorsten-technoman-109353-338504.jpg',
    '/pexels-freestockpro-1004584.jpg',
    '/pexels-asadphoto-457882.jpg',
    '/pexels-vincent-gerbouin-445991-1174732.jpg',
    '/pexels-recalmedia-60217.jpg',
    '/pexels-jimmy-teoh-294331-1010657.jpg'
  ];

  // helper to pick section background images cyclically from vacationImages
  const getSectionBg = (index: number) => {
    const img = vacationImages[index % vacationImages.length];
    return {
      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.12)), url(${img})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    } as React.CSSProperties;
  };

  useEffect(() => {
    // Check if user has existing vacation plans
    checkExistingPlans();
    
    // Load existing onboarding data if available
    const existingOnboardingData = localStorage.getItem('onboarding-data');
    if (existingOnboardingData) {
      try {
        setSurveyData(JSON.parse(existingOnboardingData));
      } catch (error) {
        console.error('Failed to parse onboarding data:', error);
      }
    }

    // Auto-rotate hero images
    const heroInterval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % vacationImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(heroInterval);
  }, [vacationImages.length]);

  const checkExistingPlans = () => {
    // Mock check for existing plans - replace with actual API call
    const existingPlans = localStorage.getItem('vacation-plans');
    setHasExistingPlan(!!existingPlans);
  };

  const handleStartPlanning = () => {
    setShowJourneyPlanner(true);
  };

  const handleContinuePlanning = () => {
    // Implement continue existing plan flow
    console.log('Continuing existing vacation plan...');
  };

  const handleDeletePlan = () => {
    // Implement delete plan functionality
    localStorage.removeItem('vacation-plans');
    setHasExistingPlan(false);
    console.log('Plan deleted');
  };

  const handleViewHistory = () => {
    // Navigate to planning history page
    try {
      router.push('/planning-history');
    } catch {
      console.log('Viewing planning history...');
    }
  };

  // Onboarding handlers
  const handleTestOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data);
    setSurveyData(data);
    setShowOnboarding(false);
    
    // Store onboarding data in localStorage for persistence
    localStorage.setItem('onboarding-data', JSON.stringify(data));
    
    // Show survey results immediately after onboarding completion
    setTimeout(() => {
      setShowSurveyResults(true);
    }, 300); // Small delay for smooth transition
  };

  const handleOnboardingCancel = () => {
    setShowOnboarding(false);
  };

  const handleSurveyResultsClose = () => {
    setShowSurveyResults(false);
  };

  return (
    <>
      <style>{`
        /* subtle fade-in for sections */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeInUp 700ms ease both;
        }

        /* gentle button hover-bounce */
        @keyframes hoverPop {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }
        .btn-hover-pop:hover {
          animation: hoverPop 400ms ease;
        }

        /* parallax-ish background movement for hero */
        .parallax-bg {
          transform: translateZ(0);
          will-change: transform;
        }

        /* subtle glass card backdrop blur for readability */
        .glass-card {
          background: rgba(255,255,255,0.64);
          backdrop-filter: blur(6px);
        }

        /* make section images slightly zoom on hover for a lively feel (non-intrusive) */
        .section-bg-zoom { transition: transform 14s linear; transform-origin: center; }
        .section:hover .section-bg-zoom { transform: scale(1.06); transition-duration: 10s; }

        /* small pill dot for icon accent */
        .accent-dot {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
        }

        /* keep dropdown profile accessible on hover for keyboard users too */
        .profile-dropdown:focus-within > .dropdown-menu,
        .profile-dropdown:hover > .dropdown-menu {
          display: block;
        }
      `}</style>

      {/* Journey Planner Component */}
      {showJourneyPlanner && (
        <JourneyPlanner onBack={() => setShowJourneyPlanner(false)} />
      )}
      
      {!showJourneyPlanner && (
        <div className="min-h-screen bg-white">
      {/* Header - Hopper Style */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - VACAI Style */}
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                <span className="font-bold text-xl text-gray-900">VACAI</span>
              </div>
            </div>
            
            {/* Desktop Navigation - Minimalist Pills */}
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => router.push('/explore')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Stays
              </button>
              <button
                onClick={handleStartPlanning}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Flights
              </button>
              <button
                onClick={handleViewHistory}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                My Trips
              </button>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <button
                onClick={(e) => { e.preventDefault(); setShowNotificationModal(true); }}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              <div className="relative group profile-dropdown">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0070AC] hover:bg-[#005a8b] rounded-full transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Account
                </button>
                <div className="dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 hidden z-50 overflow-hidden">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); setShowHelpModal(true); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Help/FAQ
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); setShowContactModal(true); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Contact
                    </button>
                    <SavedPlansLink className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                      Saved Plans
                    </SavedPlansLink>
                    <SettingsLink className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                      Settings
                    </SettingsLink>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden text-gray-700 hover:text-gray-900 p-2"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={() => { router.push('/explore'); setShowMobileMenu(false); }}
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Stays
            </button>
            <button
              onClick={() => { handleStartPlanning(); setShowMobileMenu(false); }}
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Flights
            </button>
            <button
              onClick={() => { handleViewHistory(); setShowMobileMenu(false); }}
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              My Trips
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setShowHelpModal(true); setShowMobileMenu(false); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Help/FAQ
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setShowContactModal(true); setShowMobileMenu(false); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Contact
            </button>
            <SavedPlansLink className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
              Saved Plans
            </SavedPlansLink>
            <SettingsLink className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
              Settings
            </SettingsLink>
            
            {/* Mobile Profile Section */}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="px-3 py-2 text-gray-500 text-xs font-medium uppercase">
                Account
              </div>
              <div className="px-3 py-2 text-gray-700 text-sm">
                <p className="font-medium">{user.name || 'User'}</p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  logout({ logoutParams: { returnTo: window.location.origin } });
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Large Clean Carousel like Hopper */}
      <section className="relative h-[700px] overflow-hidden mx-4 mt-4 rounded-3xl">
        {/* Carousel Images */}
        {vacationImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === heroImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${image})`,
              }}
            />
          </div>
        ))}
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
        
        {/* Search Card Overlay - Centered like Hopper */}
        <div className="relative z-10 flex items-center justify-center h-full px-4">
          <div className="w-full max-w-4xl">
            {/* Search Tabs */}
            <div className="flex gap-2 mb-4">
              <button className="px-6 py-2 bg-white text-gray-900 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Stays
              </button>
              <button 
                onClick={handleStartPlanning}
                className="px-6 py-2 bg-white/80 text-gray-700 rounded-full text-sm font-medium hover:bg-white transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Flights
              </button>
              <button className="px-6 py-2 bg-white/80 text-gray-700 rounded-full text-sm font-medium hover:bg-white transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Deals
              </button>
            </div>
            
            {/* Main Search Bar */}
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Where</label>
                  <input 
                    type="text"
                    placeholder="Search destination"
                    className="w-full text-gray-900 placeholder-gray-400 text-lg font-medium focus:outline-none bg-transparent"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Dates</label>
                  <input 
                    type="text"
                    placeholder="Add dates"
                    className="w-full text-gray-900 placeholder-gray-400 text-lg font-medium focus:outline-none bg-transparent"
                  />
                </div>
                
                <div className="space-y-1 flex items-end">
                  <div className="w-full">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Guests</label>
                    <button className="w-full text-left text-gray-900 text-lg font-medium">
                      2 guests
                    </button>
                  </div>
                  <button 
                    onClick={handleStartPlanning}
                    className="ml-4 bg-[#0070AC] hover:bg-[#005a8b] text-white p-4 rounded-full transition-all shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* CTA Below Search */}
            <div className="text-center mt-6">
              <p className="text-white text-lg font-medium drop-shadow-lg mb-3">
                Plan your perfect vacation with VACAI&apos;s AI-powered recommendations
              </p>
              <button
                onClick={handleTestOnboarding}
                className="inline-flex items-center px-6 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-full text-sm font-semibold transition-all shadow-lg"
              >
                ✨ Take Quick Survey
              </button>
            </div>
          </div>
        </div>
        
        {/* Location Label & Carousel Indicators - Bottom Right like Hopper */}
        <div className="absolute bottom-6 right-6 z-20">
          <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-3">
            <span>
              {heroImageIndex === 0 && 'Seattle, WA, USA'}
              {heroImageIndex === 1 && 'Miami, FL, USA'}
              {heroImageIndex === 2 && 'Paris, France'}
              {heroImageIndex === 3 && 'Bali, Indonesia'}
              {heroImageIndex === 4 && 'Tokyo, Japan'}
              {heroImageIndex === 5 && 'Barcelona, Spain'}
              {heroImageIndex === 6 && 'Dubai, UAE'}
              {heroImageIndex === 7 && 'New York, NY, USA'}
            </span>
            <div className="flex gap-1.5">
              {vacationImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setHeroImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === heroImageIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations - Hopper Style Cards */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured destinations
            </h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-full border border-gray-300 hover:border-gray-400 bg-white">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 rounded-full border border-gray-300 hover:border-gray-400 bg-white">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div 
              onClick={() => router.push('/explore')}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="aspect-[4/3] relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{ backgroundImage: `url(${vacationImages[1]})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">Queensland</h3>
                <p className="text-sm opacity-90">$200 off flights to Cairns with Fiji</p>
              </div>
              <div className="absolute top-4 right-4 bg-[#0070AC] text-white px-3 py-1 rounded-full text-xs font-semibold">
                Launchpad
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="aspect-[4/3] relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{ backgroundImage: `url(${vacationImages[2]})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">Las Vegas</h3>
                <p className="text-sm opacity-90">Save up to 40% on top hotels</p>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="aspect-[4/3] relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{ backgroundImage: `url(${vacationImages[3]})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">New York City</h3>
                <p className="text-sm opacity-90">Explore the city that never sleeps</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Existing Plan Section */}
      {hasExistingPlan && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 shadow-lg">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2 text-center lg:text-left">
                  <div className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-semibold text-[#0070AC] mb-4 shadow-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Plan in Progress
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Continue Your Journey?
                  </h2>
                  <p className="text-gray-700 mb-8 text-lg">
                    Pick up where you left off, or start a new adventure.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleContinuePlanning}
                      className="px-8 py-3 bg-[#0070AC] hover:bg-[#005a8b] text-white rounded-full font-semibold transition-all shadow-lg"
                    >
                      Continue Planning
                    </button>
                    <button
                      onClick={handleDeletePlan}
                      className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-gray-400 transition-all"
                    >
                      Start Fresh
                    </button>
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <ImageCarousel
                      images={vacationImages}
                      autoPlay={true}
                      autoPlayInterval={4000}
                      className="w-full h-80 md:h-96"
                      showIndicators={true}
                      showNavigation={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Traveler Profile Management Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Manage Travel Profiles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create profiles for family members, friends, or travel companions
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
            <TravelerProfileManager
              onProfileSelect={(profile) => {
                setSelectedProfile(profile);
                console.log('Selected profile for planning:', profile);
              }}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section - Hopper Style */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How VACAI works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI-powered platform that designs the perfect trip for you
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <ImageCarousel
                    images={vacationImages}
                    autoPlay={true}
                    autoPlayInterval={5000}
                    className="w-full h-80 md:h-96"
                    showIndicators={true}
                    showNavigation={true}
                  />
                </div>
              </div>
              <div className="lg:w-1/2 space-y-8 order-1 lg:order-2">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#0070AC] text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Need to plan a trip?
                    </h3>
                    <p className="text-gray-600">Tell us your preferences and dream destinations.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#0070AC] text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No idea where to start?
                    </h3>
                    <p className="text-gray-600">Our AI analyzes millions of destinations and reviews.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#0070AC] text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Get personalized recommendations
                    </h3>
                    <p className="text-gray-600 mb-4">Receive curated itineraries tailored just for you.</p>
                  </div>
                </div>
                
                <button
                  onClick={handleStartPlanning}
                  className="px-8 py-3 bg-[#0070AC] hover:bg-[#005a8b] text-white rounded-full font-semibold transition-all shadow-lg"
                >
                  Start Your Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planning History Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-[#0070AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Your Planning Journey
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Track your vacation planning progress and revisit your favorite destinations
            </p>
            
            <button
              onClick={handleViewHistory}
              className="inline-flex items-center px-8 py-3 bg-[#0070AC] hover:bg-[#005a8b] text-white rounded-full font-semibold transition-all shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Planning History
            </button>
          </div>
        </div>
      </section>

      {/* Debug Section - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <section className="py-12 px-4 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Development Debug Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="font-semibold text-gray-700">Current User</p>
                  <p className="text-gray-600">{user.name || user.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="font-semibold text-gray-700">Existing Plan Status</p>
                  <p className="text-gray-600">{hasExistingPlan ? 'Active Plan Found' : 'No Active Plan'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="font-semibold text-gray-700">Account Status</p>
                  <p className="text-gray-600">Active</p>
                </div>
              </div>
              
              {/* Test Buttons */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Testing Tools</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleTestOnboarding}
                    className="inline-flex items-center px-4 py-2 bg-[#0070AC] text-white rounded-full text-sm font-medium hover:bg-[#005a8b] transition-all"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Test Onboarding Flow
                  </button>
                  
                  <button
                    onClick={() => setShowProfileManager(!showProfileManager)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-all"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {showProfileManager ? 'Hide' : 'Show'} Profile Manager
                  </button>

                  <button
                    onClick={() => router.push('/itinerary')}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-all"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    View Itinerary
                  </button>
                  
                  {surveyData && (
                    <button
                      onClick={() => setShowSurveyResults(true)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-all"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      View Last Survey Results
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Profile Manager Debug Section */}
      {process.env.NODE_ENV === 'development' && showProfileManager && (
        <section className="py-12 px-4 bg-blue-50 border-t border-blue-200">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200">
              <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Development Profile Manager
              </h3>
              
              <TravelerProfileManager
                onProfileSelect={(profile) => {
                  setSelectedProfile(profile);
                  console.log('Selected profile for planning:', profile);
                  alert(`Selected ${profile.name} for trip planning!`);
                }}
              />
              
              {selectedProfile && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-800 font-medium">
                    Currently selected for planning: {selectedProfile.name} ({selectedProfile.relationship})
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      
      
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onCancel={handleOnboardingCancel}
      />
      
      {/* Survey Results Modal */}
      {surveyData && showSurveyResults && (
        <SurveyResults
          data={surveyData}
          onClose={handleSurveyResultsClose}
        />
      )}
      
      {/* Modals */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
      <NotificationModal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} />
      
      {/* Footer - Hopper Style */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Travel</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => router.push('/explore')} className="hover:text-white transition-colors">Hotels</button></li>
                <li><button onClick={handleStartPlanning} className="hover:text-white transition-colors">Flights</button></li>
                <li><button onClick={handleViewHistory} className="hover:text-white transition-colors">My Trips</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={(e) => { e.preventDefault(); setShowContactModal(true); }} className="hover:text-white transition-colors">About</button></li>
                <li><button className="hover:text-white transition-colors">Careers</button></li>
                <li><button onClick={(e) => { e.preventDefault(); setShowContactModal(true); }} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={(e) => { e.preventDefault(); setShowHelpModal(true); }} className="hover:text-white transition-colors">Help Center</button></li>
                <li><SavedPlansLink className="hover:text-white transition-colors cursor-pointer">Saved Plans</SavedPlansLink></li>
                <li><SettingsLink className="hover:text-white transition-colors cursor-pointer">Settings</SettingsLink></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get the app</h4>
              <p className="text-sm text-gray-400 mb-4">Join millions of travelers</p>
              <div className="flex gap-2">
                <button className="text-2xl hover:scale-110 transition-transform">📱</button>
                <button className="text-2xl hover:scale-110 transition-transform">💻</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="text-xl">🌍</span>
              <span className="font-bold text-white">VACAI</span>
            </div>
            <p>© 2025 VACAI by Capgemini. All rights reserved.</p>
          </div>
        </div>
      </footer>
        </div>
      )}
    </>
  );
}