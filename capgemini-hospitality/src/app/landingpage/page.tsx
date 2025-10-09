'use client';

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    loginWithRedirect({
      authorizationParams: {
        login_hint: email,
        redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI,
      },
    });
  };

  const handleSocialLogin = (connection: string) => {
    loginWithRedirect({
      authorizationParams: { connection },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 via-blue-400 to-emerald-300 flex flex-col items-center justify-center overflow-hidden font-sans relative">
      {/* Floating background shapes */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-16 right-16 w-56 h-56 bg-yellow-200/30 rounded-full blur-3xl animate-pulse delay-150"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        {/* Hero Section */}
        <motion.div
          className="text-white space-y-6 text-center lg:text-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-md">
            Plan Your Perfect <br /> Vacation <br />
            <span className="text-blue-100">with AI</span>
          </h1>
          <p className="text-lg text-blue-50 leading-relaxed max-w-md mx-auto lg:mx-0">
            Smart recommendations, real-time deals, and travel planning — all personalized for you.
          </p>

          <motion.button
            onClick={() => router.push('/signin')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-blue-50 transition-colors"
          >
            Start Planning Your Journey
          </motion.button>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md border border-blue-100 backdrop-blur-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
              <p className="text-gray-600">Continue to plan your dream trip</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => router.push('/resetpassword')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center justify-center">
              <span className="w-1/4 border-t border-gray-300"></span>
              <span className="mx-3 text-gray-500 text-sm">Or</span>
              <span className="w-1/4 border-t border-gray-300"></span>
            </div>

            {/* Social Logins */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSocialLogin('google-oauth2')}
                className="flex items-center justify-center gap-3 w-full py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-semibold shadow-sm transition"
              >
                {/* Google SVG */}
                <svg viewBox="0 0 48 48" className="w-5 h-5">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.2 0 6.1 1.2 8.3 3.1l6.1-6.1C34.9 2.6 29.8 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.2 5.6C11.9 13.4 17.4 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3.1-2.4 5.7-5.1 7.5l7.9 6.1C43.5 38.5 46.5 32 46.5 24.5z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M24 48c6.5 0 11.9-2.2 15.8-6l-7.9-6.1c-2.2 1.5-5 2.3-7.9 2.3-6.1 0-11.3-4.1-13.2-9.7l-7.2 5.6C6.6 42.6 14.6 48 24 48z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.8 28.5c-.5-1.5-.8-3.1-.8-4.5s.3-3.1.8-4.5l-7.2-5.6C2.6 16.9 1.5 20.4 1.5 24s1.1 7.1 3.1 10.1l6.2-5.6z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => handleSocialLogin('apple-oauth2')}
                className="flex items-center justify-center gap-3 w-full py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-semibold shadow-sm transition"
              >
                {/* Apple SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5 text-black">
                  <path d="M11.182 1.003c.022 1.001-.366 1.962-1.037 2.676-.664.707-1.585 1.125-2.589 1.052-.03-.95.384-1.948 1.05-2.654.67-.71 1.664-1.142 2.576-1.074zM13.536 11.263c-.187.423-.384.839-.604 1.238-.412.738-.893 1.473-1.573 1.481-.665.007-.88-.437-1.84-.437-.961 0-1.197.425-1.857.444-.748.02-1.321-.79-1.734-1.523-1.187-2.07-2.1-5.863-.879-8.435.603-1.29 1.682-2.112 2.931-2.131.684-.013 1.331.46 1.84.46.495 0 1.29-.57 2.18-.487.372.016 1.416.15 2.085 1.144-.054.034-1.245.73-1.228 2.176.015 1.717 1.492 2.277 1.512 2.286-.015.046-.238.85-.693 1.704z" />
                </svg>
                Continue with Apple
              </button>
            </div>

            <p className="mt-6 text-center text-gray-600 text-sm">
              Don’t have an account?{' '}
              <button
                onClick={() => router.push('/signup')}
                className="text-blue-600 font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
