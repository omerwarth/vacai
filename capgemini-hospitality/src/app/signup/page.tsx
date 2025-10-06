'use client';

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const validatePassword = (pwd: string) => {
    // Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongPwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPwdRegex.test(pwd);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
      );
      return;
    }

    // Trigger Auth0 signup
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        login_hint: email || undefined,
        redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <header className="mb-8 text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900">
          Please enter your information to create your account.
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-md flex flex-col gap-4"
      >
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="firstName" className="block text-gray-700 text-sm font-medium mb-1">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400"
              required
            />
          </div>
          <div className="flex-1">
            <label htmlFor="lastName" className="block text-gray-700 text-sm font-medium mb-1">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
