'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDarkMode !== null) {
      const darkMode = savedDarkMode === 'true';
      setIsDarkMode(darkMode);
      document.documentElement.classList.toggle('dark', darkMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  // MODAL-SAFE CSS injection
  useEffect(() => {
    const styleId = 'global-theme-styles';
    let existingStyle = document.getElementById(styleId);
    
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      /* MODAL-SAFE DARK THEME - Carefully avoids modal classes */
      
      /* Basic theme setup */
      .theme-dark {
        color-scheme: dark;
      }
      
      .theme-light {
        color-scheme: light;
      }
      
      /* Dark theme for body - modals are positioned outside normal flow */
      html.dark {
        background-color: #111827;
        color: #f9fafb;
      }
      
      html.dark body {
        background-color: #111827 !important;
        color: #f9fafb !important;
      }
      
      /* MODAL SAFETY: Avoid .bg-white, .bg-blue-900, .z-50, .z-60, .fixed, .absolute */
      
      /* === LIGHT MODE - Keep original Tailwind styling intact === */
      /* Only remove dark mode body styling when not in dark mode */
      html:not(.dark) body {
        background-color: unset !important;
        color: unset !important;
      }
      
      /* === COMPREHENSIVE DARK THEME FOR ENTIRE APPLICATION === */
      
      /* Main page backgrounds - Cards, sections, panels */
      html.dark .bg-white:not(.fixed):not(.absolute):not([class*="z-"]):not(.rounded-2xl.shadow-2xl) {
        background-color: #1f2937 !important;
      }
      
      html.dark .bg-gray-50:not(.fixed):not(.absolute):not([class*="z-"]) {
        background-color: #374151 !important;
      }
      
      html.dark .bg-gray-100:not(.fixed):not(.absolute):not([class*="z-"]) {
        background-color: #4b5563 !important;
      }
      
      html.dark .bg-gray-200:not(.fixed):not(.absolute):not([class*="z-"]) {
        background-color: #6b7280 !important;
      }
      
      /* Header backgrounds */
      html.dark header:not(.fixed):not(.absolute) {
        background-color: #1f2937 !important;
        border-color: #374151 !important;
      }
      
      html.dark .bg-white\\/80:not(.fixed):not(.absolute) {
        background-color: rgba(31, 41, 55, 0.8) !important;
      }
      
      /* Card and panel styling */
      html.dark .shadow:not(.fixed .shadow):not(.absolute .shadow) {
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3) !important;
      }
      
      html.dark .shadow-sm:not(.fixed .shadow-sm):not(.absolute .shadow-sm) {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.4) !important;
      }
      
      html.dark .shadow-lg:not(.fixed .shadow-lg):not(.absolute .shadow-lg) {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3) !important;
      }
      
      /* Text colors - comprehensive coverage */
      html.dark .text-gray-900:not(.fixed .text-gray-900):not(.absolute .text-gray-900) {
        color: #f9fafb !important;
      }
      
      html.dark .text-gray-800:not(.fixed .text-gray-800):not(.absolute .text-gray-800) {
        color: #f3f4f6 !important;
      }
      
      html.dark .text-gray-700:not(.fixed .text-gray-700):not(.absolute .text-gray-700) {
        color: #e5e7eb !important;
      }
      
      html.dark .text-gray-600:not(.fixed .text-gray-600):not(.absolute .text-gray-600) {
        color: #d1d5db !important;
      }
      
      html.dark .text-gray-500:not(.fixed .text-gray-500):not(.absolute .text-gray-500) {
        color: #9ca3af !important;
      }
      
      html.dark .text-gray-400:not(.fixed .text-gray-400):not(.absolute .text-gray-400) {
        color: #6b7280 !important;
      }
      
      /* Slate text colors - for Continue Your Journey section */
      html.dark .text-slate-700:not(.fixed .text-slate-700):not(.absolute .text-slate-700) {
        color: #f1f5f9 !important;
      }
      
      html.dark .text-slate-600:not(.fixed .text-slate-600):not(.absolute .text-slate-600) {
        color: #f8fafc !important;
      }
      
      html.dark .text-slate-900:not(.fixed .text-slate-900):not(.absolute .text-slate-900) {
        color: #ffffff !important;
      }
      
      /* Border colors */
      html.dark .border-gray-100:not(.fixed .border-gray-100):not(.absolute .border-gray-100) {
        border-color: #374151 !important;
      }
      
      html.dark .border-gray-200:not(.fixed .border-gray-200):not(.absolute .border-gray-200) {
        border-color: #4b5563 !important;
      }
      
      html.dark .border-gray-300:not(.fixed .border-gray-300):not(.absolute .border-gray-300) {
        border-color: #6b7280 !important;
      }
      
      /* Form elements */
      html.dark input:not(.fixed input):not(.absolute input),
      html.dark select:not(.fixed select):not(.absolute select),
      html.dark textarea:not(.fixed textarea):not(.absolute textarea) {
        background-color: #374151 !important;
        border-color: #6b7280 !important;
        color: #f9fafb !important;
      }
      
      html.dark input::placeholder:not(.fixed input::placeholder):not(.absolute input::placeholder),
      html.dark textarea::placeholder:not(.fixed textarea::placeholder):not(.absolute textarea::placeholder) {
        color: #9ca3af !important;
      }
      
      html.dark input:focus:not(.fixed input:focus):not(.absolute input:focus),
      html.dark select:focus:not(.fixed select:focus):not(.absolute select:focus),
      html.dark textarea:focus:not(.fixed textarea:focus):not(.absolute textarea:focus) {
        border-color: #3b82f6 !important;
        ring-color: #3b82f6 !important;
      }
      
      /* Button enhancements - Dark mode - Only for buttons that should have backgrounds */
      html.dark button.bg-gray-100:not(.fixed button):not(.absolute button),
      html.dark button.bg-gray-200:not(.fixed button):not(.absolute button),
      html.dark button:not(.fixed button):not(.absolute button):not([class*="bg-"]):not(.hover\\:underline):not(.text-gray-300):not(.text-gray-600) {
        background-color: #374151 !important;
        color: #f9fafb !important;
        border-color: #6b7280 !important;
      }
      
      /* Fix specific button styling in dark mode */
      html.dark button.bg-white.text-slate-900:not(.fixed button):not(.absolute button) {
        background-color: #1f2937 !important;
        color: #ffffff !important;
        border-color: #4b5563 !important;
      }
      
      html.dark button.bg-white.text-slate-900:hover:not(.fixed button):not(.absolute button) {
        background-color: #374151 !important;
      }
      
      /* Help Modal specific styling for dark mode */
      html.dark .bg-gradient-to-br.from-white\\/60.to-sky-50\\/40 {
        background: linear-gradient(to bottom right, rgba(31, 41, 55, 0.95), rgba(55, 65, 81, 0.9)) !important;
        border-color: #4b5563 !important;
      }
      
      html.dark .text-sky-800 {
        color: #93c5fd !important;
      }
      
      html.dark .text-sky-700 {
        color: #bfdbfe !important;
      }
      
      html.dark .bg-sky-50 {
        background-color: #374151 !important;
      }
      
      html.dark .hover\\:bg-sky-100:hover {
        background-color: #4b5563 !important;
      }
      
      html.dark .bg-rose-50 {
        background-color: #374151 !important;
      }
      
      html.dark .hover\\:bg-rose-100:hover {
        background-color: #4b5563 !important;
      }
      
      html.dark .bg-emerald-50 {
        background-color: #374151 !important;
      }
      
      html.dark .hover\\:bg-emerald-100:hover {
        background-color: #4b5563 !important;
      }
      
      html.dark .text-sky-600,
      html.dark .text-rose-600,
      html.dark .text-emerald-600 {
        color: #93c5fd !important;
      }
      
      html.dark .text-emerald-700 {
        color: #86efac !important;
      }
      
      html.dark .border {
        border-color: #4b5563 !important;
      }
      
      html.dark button.bg-white.text-gray-700 {
        background-color: #374151 !important;
        color: #f9fafb !important;
        border-color: #6b7280 !important;
      }
      
      /* Help modal solution text in dark mode */
      html.dark .text-gray-700 {
        color: #f9fafb !important;
      }
      
      html.dark details div p {
        color: #f9fafb !important;
      }
      
      html.dark button:hover:not(.fixed button:hover):not(.absolute button:hover) {
        filter: brightness(1.2);
      }
      
      /* Gradient backgrounds */
      html.dark .bg-gradient-to-br:not(.fixed):not(.absolute) {
        background: linear-gradient(to bottom right, #374151, #1f2937) !important;
      }
      
      html.dark .bg-gradient-to-r:not(.fixed):not(.absolute) {
        background: linear-gradient(to right, #374151, #4b5563) !important;
      }
      
      /* Specific component styling */
      html.dark .backdrop-blur-sm:not(.fixed):not(.absolute) {
        backdrop-filter: blur(4px) !important;
        background-color: rgba(31, 41, 55, 0.8) !important;
      }
      
      html.dark .backdrop-blur-xl:not(.fixed):not(.absolute) {
        backdrop-filter: blur(24px) !important;
        background-color: rgba(31, 41, 55, 0.9) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    console.log('Toggling theme to:', newDarkMode ? 'DARK' : 'LIGHT');
    
    // Force remove dark class first, then conditionally add it
    document.documentElement.classList.remove('dark');
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      console.log('Added .dark class to html');
      // Apply dark mode body styling
      const body = document.body;
      body.style.backgroundColor = '#111827';
      body.style.color = '#f9fafb';
    } else {
      console.log('Removed .dark class from html');
      // Remove inline styles to let original Tailwind classes work
      const body = document.body;
      body.style.backgroundColor = '';
      body.style.color = '';
    }
    
    console.log('HTML classes:', document.documentElement.className);
  };

  const contextValue: ThemeContextType = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
