'use client';

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignUp() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const validatePassword = (pwd: string) => {
    const strongPwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwd) return null;
    if (pwd.length < 8) return "weak";
    if (strongPwdRegex.test(pwd)) return "strong";
    return "medium";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === "password") setPasswordStrength(validatePassword(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (passwordStrength !== "strong") {
      setError("Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.");
      return;
    }

    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: "signup",
          login_hint: email || undefined,
          redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI,
        },
      });
    } catch (err) {
      console.error("Signup failed:", err);
      setError("An error occurred during signup.");
    }
  };

  const strengthColor =
    passwordStrength === "strong"
      ? "text-green-600"
      : passwordStrength === "medium"
      ? "text-yellow-600"
      : passwordStrength === "weak"
      ? "text-red-500"
      : "text-gray-400";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 px-6 relative overflow-hidden">
      
      {/* Floating shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-bounce-slow"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-200 rounded-full opacity-20 animate-bounce-slow delay-150"></div>

      <header className="mb-8 text-center max-w-2xl z-10 relative">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
          Create your VACAI account
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Enter your details to start planning your perfect vacation ✈️
        </p>
      </header>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 w-full max-w-md flex flex-col gap-6 z-10 relative"
      >
        {/* Name fields */}
        <div className="flex gap-4">
          {["firstName", "lastName"].map((field) => (
            <div key={field} className="flex-1">
              <label htmlFor={field} className="block text-gray-700 text-sm font-medium mb-1 capitalize">
                {field === "firstName" ? "First Name" : "Last Name"}
              </label>
              <input
                id={field}
                type="text"
                placeholder={field === "firstName" ? "Jane" : "Doe"}
                value={formData[field as keyof typeof formData]}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
          ))}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter a strong password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
          />
          {passwordStrength && (
            <p className={`text-sm mt-1 ${strengthColor}`}>
              {passwordStrength === "strong"
                ? "✅ Strong password"
                : passwordStrength === "medium"
                ? "⚠️ Could be stronger"
                : "❌ Too weak"}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center font-medium"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-md"
        >
          Sign Up
        </button>
      </motion.form>
    </div>
  );
}
