'use client';

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login',
      },
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-semibold text-blue-600">Capgemini</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
            <nav className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Help/FAQ</span>
              <span>Notifications</span>
              <span>Saved</span>
              <span>Settings</span>
              <span>Contact</span>
              <span>Profile</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="text-white">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Plan Your Perfect<br />
                Vacation<br />
                <span className="text-blue-200">with AI</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Smart Recommendations. Real-Time Deals. Personalized Just For You
              </p>
              <button
                onClick={handleLogin}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start Planning Your Journey
              </button>
            </div>

            {/* Right Login Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Sign in to start planning today.
                  </h2>
                  <p className="text-gray-600">
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => router.push('/signup')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>

                <form className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                    <input 
                      type="password" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Log In
                  </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                  <button
                    onClick={() => router.push('/signup')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign Up?
                  </button>
                  <br />
                  <button
                    onClick={() => router.push('/resetpassword')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                  Forgot Password?
                  </button>
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How VACAI Works</h2>
        </div>
      </div>
    </div>
  );
}
