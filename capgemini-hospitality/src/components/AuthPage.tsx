'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';

export default function AuthPage() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Store user's email for post-login personalization
      localStorage.setItem('userEmail', formData.username);
      
      // Use secure Auth0 Universal Login
      loginWithRedirect({
        authorizationParams: {
          screen_hint: isSignUp ? 'signup' : 'login',
          login_hint: formData.username, // Pre-fill email on Auth0 page
        }
      });
    } catch (error) {
      setIsSubmitting(false);
      setError('Authentication failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  const fallbackToRedirect = async () => {
    try {
      if (isSignUp) {
        await loginWithRedirect({
          authorizationParams: {
            screen_hint: 'signup'
          }
        });
      } else {
        await loginWithRedirect();
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Show loading state while Auth0 is determining authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show success state and redirect to dashboard
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              You're successfully signed in to Capgemini Hospitality
            </p>
          </div>

          {/* User Profile Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/20 dark:border-gray-700/20 p-8">
            <div className="text-center mb-6">
              {user.picture && (
                <div className="relative inline-block">
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name || user.email}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {user.email}
              </p>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Active Session
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:ring-4 focus:ring-red-500/25 focus:outline-none"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </div>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Session managed by Auth0</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            🔒 Your data is protected with enterprise-grade security
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show the unified login page (like your screenshot)
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Hotel Image and Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="w-full max-w-md text-center mb-8">
          {/* Capgemini Logo */}
          <div className="flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-blue-600 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Capgemini</h1>
              <p className="text-gray-600 text-lg">Hospitality</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Travel to locations Across the globe!
          </h2>
        </div>

        {/* Hotel Image */}
        <div className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl mb-6">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            alt="Luxury Hotel Pool"
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Pagination Dots */}
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
          <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
          <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
          <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo (only visible on small screens) */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <svg className="w-6 h-6 text-blue-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Capgemini</h1>
            </div>
          </div>

          {/* Auth Header */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create your account' : 'Sign in to start planning today.'}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? (
                <>
                  Already have an account,{' '}
                  <button 
                    onClick={() => setIsSignUp(false)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    sign in
                  </button>
                  .
                </>
              ) : (
                <>
                  Don't have an account,{' '}
                  <button 
                    onClick={() => setIsSignUp(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    sign up
                  </button>
                  .
                </>
              )}
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isSignUp ? 'Email' : 'Username'}
              </label>
              <input
                type={isSignUp ? 'email' : 'text'}
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={isSignUp ? 'Email' : 'Username'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors focus:ring-4 focus:ring-blue-500/25 focus:outline-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Log In'
              )}
            </button>

            <div className="text-center space-y-2">
              {!isSignUp && (
                <button 
                  type="button"
                  onClick={() => loginWithRedirect()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure authentication powered by Auth0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}