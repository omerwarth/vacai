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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Reset Your Password
        </h2>
        <p className="text-gray-600 text-center mb-4">
          Enter your email and we’ll send you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Redirecting...' : 'Send Reset Link'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/landingpage')}
          className="w-full py-3 mt-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
}
