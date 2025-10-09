'use client';

import { useState, useEffect } from 'react';
import { useAuth0, User as Auth0User } from '@auth0/auth0-react';
import { apiService, TravelerProfile } from '@/config/api';
import ImageCarousel from './ImageCarousel';
import OnboardingModal from './OnboardingModal';
import SurveyResults from './SurveyResults';
import TravelerProfileManager from './TravelerProfileManager';
import JourneyPlanner from './JourneyPlanner';
import ChatInterface from "./ChatInterface";
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

interface OnboardingData {
  [key: string]: string | string[] | number;
}

interface DashboardProps {
  user: Auth0User;
}

export default function Dashboard({ user }: DashboardProps) {
  const { logout } = useAuth0();
  const [users, setUsers] = useState<User[]>([]);
  const [hasExistingPlan, setHasExistingPlan] = useState(false);
  
  // Onboarding states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurveyResults, setShowSurveyResults] = useState(false);
  const [surveyData, setSurveyData] = useState<OnboardingData | null>(null);
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<TravelerProfile | null>(null);
  const [showJourneyPlanner, setShowJourneyPlanner] = useState(false);

  // Vacation destination images for carousel
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

  useEffect(() => {
    fetchUsers();
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
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

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
    // Implement view planning history
    console.log('Viewing planning history...');
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
      {/* Journey Planner Component */}
      {showJourneyPlanner && (
        <ChatInterface onBack={() => setShowJourneyPlanner(false)} />
      )}
      
      {!showJourneyPlanner && (
        <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="font-bold text-2xl tracking-tight" style={{ color: '#0070AC' }}>
                Capgemini<span className="text-3xl leading-none">●</span>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 hover:underline">Help/FAQ</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 hover:underline">
                Notifications
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 hover:underline">Saved</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 hover:underline">Settings</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 hover:underline">Contact</a>
              <div className="relative group">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-sm">
                  Profile
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0070AC 0%, #005a8b 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Plan Your Perfect Vacation
            <span className="block text-4xl md:text-5xl mt-2 text-blue-100">with AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Smart Recommendations. Real-Time Details. Personalized Just For You
          </p>
          <button
            onClick={handleStartPlanning}
            className="bg-white text-gray-900 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
          >
            Start Planning Your Journey
          </button>
        </div>
      </section>

      {/* Continue Existing Plan Section */}
      {hasExistingPlan && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 bg-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0070AC 0%, #005a8b 100%)' }}>
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
              
              <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                <div className="lg:w-1/2 text-center lg:text-left">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Plan in Progress
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                    Continue Your Journey?
                  </h2>
                  <p className="text-blue-100 mb-8 text-lg leading-relaxed max-w-md">
                    It looks like you already have a vacation plan in progress. Continue where you left off or start fresh with new destinations.
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={handleContinuePlanning}
                      className="block w-full lg:w-auto bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Continue Planning
                    </button>
                    <button
                      onClick={handleDeletePlan}
                      className="block w-full lg:w-auto bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300"
                    >
                      Start Fresh
                    </button>
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white border-opacity-20">
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
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Manage Travel Profiles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Create profiles for family members, friends, or travel companions and set their preferences
            </p>
          </div>
          
          <TravelerProfileManager
            onProfileSelect={(profile) => {
              setSelectedProfile(profile);
              console.log('Selected profile for planning:', profile);
            }}
          />
        </div>
      </section>

      {/* How VACAI Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How VACAI Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform makes vacation planning effortless and personalized
            </p>
          </div>
          
          <div className="rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 bg-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0070AC 0%, #005a8b 100%)' }}>
            {/* Background accent */}
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full translate-y-48 -translate-x-48"></div>
            
            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
              <div className="lg:w-1/2 order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white border-opacity-20">
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
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Need to plan a trip?
                      </h3>
                      <p className="text-blue-100 text-lg">Tell us your preferences and dream destinations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        No idea where to start?
                      </h3>
                      <p className="text-blue-100 text-lg">Our AI analyzes millions of destinations and reviews</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Get personalized recommendations
                      </h3>
                      <p className="text-blue-100 text-lg mb-6">Receive curated itineraries tailored just for you</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleStartPlanning}
                  className="bg-white text-gray-900 px-10 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Start Your Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planning History Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Planning Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your vacation planning progress and revisit your favorite destinations
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230070AC' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-8">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Access Your Planning History
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Review past vacation plans, saved destinations, and continue where you left off
              </p>
              
              <button
                onClick={handleViewHistory}
                className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #0070AC 0%, #005a8b 100%)' }}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Planning History
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Debug Section - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <section className="py-12 px-4 bg-gray-100 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Development Debug Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-700">Current User</p>
                  <p className="text-gray-600">{user.name || user.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-700">Existing Plan Status</p>
                  <p className="text-gray-600">{hasExistingPlan ? 'Active Plan Found' : 'No Active Plan'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-700">Total Users</p>
                  <p className="text-gray-600">{users.length} registered</p>
                </div>
              </div>
              
              {/* Test Buttons */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Testing Tools</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleTestOnboarding}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Test Onboarding Flow
                  </button>
                  
                  <button
                    onClick={() => setShowProfileManager(!showProfileManager)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {showProfileManager ? 'Hide' : 'Show'} Profile Manager
                  </button>
                  
                  {surveyData && (
                    <button
                      onClick={() => setShowSurveyResults(true)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all shadow-sm"
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
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
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
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
        </div>
      )}
    </>
  );
}