'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colorblindFilter: string;
  setColorblindFilter: (filter: string) => void;
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
  const [colorblindFilter, setColorblindFilter] = useState('none');

  // Load saved preferences on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedColorblindFilter = localStorage.getItem('colorblindFilter');
    
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
    
    if (savedColorblindFilter) {
      setColorblindFilter(savedColorblindFilter);
      document.documentElement.className = document.documentElement.className.replace(/colorblind-\S+/g, '');
      if (savedColorblindFilter !== 'none') {
        document.documentElement.classList.add(`colorblind-${savedColorblindFilter}`);
      }
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
      
      /* COMPLETELY AVOID: .bg-white, .bg-blue-900, .z-50, .z-60, .fixed, .absolute */
      /* These are critical for modal functionality */
      
      /* Only safe background changes - exclude modal-related positioning */
      html.dark .bg-gray-50:not([class*="fixed"]):not([class*="absolute"]):not([class*="z-"]) {
        background-color: #374151 !important;
      }
      
      html.dark .bg-gray-100:not([class*="fixed"]):not([class*="absolute"]):not([class*="z-"]) {
        background-color: #374151 !important;
      }
      
      /* Safe text colors - exclude modal content */
      html.dark .text-gray-900:not(.fixed .text-gray-900):not(.absolute .text-gray-900) {
        color: #f9fafb !important;
      }
      
      html.dark .text-gray-700:not(.fixed .text-gray-700):not(.absolute .text-gray-700) {
        color: #d1d5db !important;
      }
      
      html.dark .text-gray-600:not(.fixed .text-gray-600):not(.absolute .text-gray-600) {
        color: #9ca3af !important;
      }
      
      html.dark .text-gray-500:not(.fixed .text-gray-500):not(.absolute .text-gray-500) {
        color: #6b7280 !important;
      }
      
      /* Safe borders - exclude modals */
      html.dark .border-gray-200:not(.fixed .border-gray-200):not(.absolute .border-gray-200) {
        border-color: #374151 !important;
      }
      
      html.dark .border-gray-300:not(.fixed .border-gray-300):not(.absolute .border-gray-300) {
        border-color: #4b5563 !important;
      }
      
      /* Colorblind accessibility filters */
      .colorblind-protanopia {
        filter: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><defs><filter id='protanopia'><feColorMatrix type='matrix' values='0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0'/></filter></defs></svg>#protanopia");
      }
      
      .colorblind-deuteranopia {
        filter: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><defs><filter id='deuteranopia'><feColorMatrix type='matrix' values='0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0'/></filter></defs></svg>#deuteranopia");
      }
      
      .colorblind-tritanopia {
        filter: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><defs><filter id='tritanopia'><feColorMatrix type='matrix' values='0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0'/></filter></defs></svg>#tritanopia");
      }
      
      .colorblind-achromatopsia {
        filter: grayscale(100%);
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
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const handleColorblindFilterChange = (filter: string) => {
    setColorblindFilter(filter);
    localStorage.setItem('colorblindFilter', filter);
    
    // Remove any existing colorblind filter classes
    document.documentElement.className = document.documentElement.className.replace(/colorblind-\S+/g, '');
    
    // Add the new filter class if it's not 'none'
    if (filter !== 'none') {
      document.documentElement.classList.add(`colorblind-${filter}`);
    }
  };

  const contextValue: ThemeContextType = {
    isDarkMode,
    toggleDarkMode,
    colorblindFilter,
    setColorblindFilter: handleColorblindFilterChange,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
