'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type ColorblindFilter = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colorblindFilter: ColorblindFilter;
  setColorblindFilter: (filter: ColorblindFilter) => void;
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
  const [colorblindFilter, setColorblindFilter] = useState<ColorblindFilter>('none');

  // Load saved preferences on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedColorblindFilter = localStorage.getItem('colorblindFilter') as ColorblindFilter;
    
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
    
    if (savedColorblindFilter && savedColorblindFilter !== 'none') {
      setColorblindFilter(savedColorblindFilter);
    }
  }, []);

  // Colorblind filter CSS injection with modal protection
  useEffect(() => {
    console.log('Applying colorblind filter:', colorblindFilter);
    const applyColorblindFilter = () => {
      const filterId = 'colorblind-filter-styles';
      const svgId = 'colorblind-svg-filters';
      const existingFilter = document.getElementById(filterId);
      const existingSvg = document.getElementById(svgId);
      
      if (existingFilter) {
        document.head.removeChild(existingFilter);
      }
      if (existingSvg) {
        document.body.removeChild(existingSvg);
      }
      
      if (colorblindFilter === 'none') {
        console.log('No colorblind filter selected, removing any existing filters');
        return;
      }
      
      console.log('Creating SVG filters for:', colorblindFilter);
      
      // Create SVG element with filters and add to DOM
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgElement.id = svgId;
      svgElement.style.position = 'absolute';
      svgElement.style.width = '0';
      svgElement.style.height = '0';
      svgElement.setAttribute('aria-hidden', 'true');
      
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      
      // Protanopia (Red-blind) filter
      const protanopiaFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      protanopiaFilter.id = 'protanopia';
      const protanopiaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
      protanopiaMatrix.setAttribute('type', 'matrix');
      protanopiaMatrix.setAttribute('values', '0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0');
      protanopiaFilter.appendChild(protanopiaMatrix);
      defs.appendChild(protanopiaFilter);
      
      // Deuteranopia (Green-blind) filter
      const deuteranopiaFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      deuteranopiaFilter.id = 'deuteranopia';
      const deuteranopiaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
      deuteranopiaMatrix.setAttribute('type', 'matrix');
      deuteranopiaMatrix.setAttribute('values', '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0');
      deuteranopiaFilter.appendChild(deuteranopiaMatrix);
      defs.appendChild(deuteranopiaFilter);
      
      // Tritanopia (Blue-blind) filter
      const tritanopiaFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      tritanopiaFilter.id = 'tritanopia';
      const tritanopiaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
      tritanopiaMatrix.setAttribute('type', 'matrix');
      tritanopiaMatrix.setAttribute('values', '0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0');
      tritanopiaFilter.appendChild(tritanopiaMatrix);
      defs.appendChild(tritanopiaFilter);
      
      // Achromatopsia (Complete color blindness) filter
      const achromatopsiaFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      achromatopsiaFilter.id = 'achromatopsia';
      const achromatopsiaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
      achromatopsiaMatrix.setAttribute('type', 'matrix');
      achromatopsiaMatrix.setAttribute('values', '0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0');
      achromatopsiaFilter.appendChild(achromatopsiaMatrix);
      defs.appendChild(achromatopsiaFilter);
      
      svgElement.appendChild(defs);
      document.body.appendChild(svgElement);
      
      const style = document.createElement('style');
      style.id = filterId;
      
      // CSS that applies the filter to the whole body but excludes modals
      style.innerHTML = `
        /* COLORBLIND FILTER APPLICATION - Simple approach */
        html {
          filter: url(#${colorblindFilter}) !important;
        }
        
        /* MODAL SAFETY: Exclude modals and overlays from filter */
        .fixed,
        .absolute,
        [class*="z-5"],
        [class*="z-6"],
        [role="dialog"],
        [aria-modal="true"] {
          filter: none !important;
        }
        
        /* Specifically exclude common modal backdrop classes */
        .bg-black\\/50,
        .bg-gray-900\\/50,
        .backdrop-blur-sm,
        .backdrop-blur-xl {
          filter: none !important;
        }
        
        /* Target specific components that might be modals */
        .rounded-2xl.shadow-2xl,
        .border.shadow-lg.bg-white,
        .bg-white.rounded-lg.shadow-xl {
          filter: none !important;
        }
      `;
      
      document.head.appendChild(style);
      console.log('Colorblind filter applied successfully:', colorblindFilter);
    };
    
    applyColorblindFilter();
    
    // Set up mutation observer to protect dynamically added modals
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if it's a modal or overlay
            if (
              element.classList.contains('fixed') ||
              element.classList.contains('absolute') ||
              element.getAttribute('role') === 'dialog' ||
              element.getAttribute('aria-modal') === 'true' ||
              Array.from(element.classList).some(cls => cls.includes('z-'))
            ) {
              // Ensure no filter is applied
              (element as HTMLElement).style.filter = 'none';
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      const filterToRemove = document.getElementById('colorblind-filter-styles');
      const svgToRemove = document.getElementById('colorblind-svg-filters');
      if (filterToRemove) {
        document.head.removeChild(filterToRemove);
      }
      if (svgToRemove) {
        document.body.removeChild(svgToRemove);
      }
      observer.disconnect();
    };
  }, [colorblindFilter]);

  // MODAL-SAFE CSS injection
  useEffect(() => {
    const styleId = 'global-theme-styles';
    const existingStyle = document.getElementById(styleId);
    
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
    colorblindFilter,
    setColorblindFilter: (filter: ColorblindFilter) => {
      console.log('Setting colorblind filter to:', filter);
      setColorblindFilter(filter);
      localStorage.setItem('colorblindFilter', filter);
    },
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
