'use client';

import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const { loginWithRedirect } = useAuth0();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'reset_password',
        login_hint: email,
      },
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-sky-300 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center opacity-40" />

      {/* Overlay Blur */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/40" />

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-center text-sky-800 mb-2">
          Reset Your Password
        </h2>
        <p className="text-sky-700 text-center mb-6">
          Enter your email below and we’ll send you a reset link.
        </p>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-sky-900 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-lg"
          >
            {loading ? 'Redirecting...' : 'Send Reset Link'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/signin')}
            className="w-full py-3 border border-sky-300 text-sky-800 rounded-lg font-medium hover:bg-sky-50 transition-colors"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
