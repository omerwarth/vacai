"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from './ThemeProvider';

type UserSettings = {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    location: string;
    bio: string;
    avatar: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  colorblindFilter: "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
  language: string;
  currency: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    shareData: boolean;
    analytics: boolean;
  };
  preferences: {
    defaultTransportation: string;
    budgetRange: string;
    travelStyle: string;
    accommodationType: string;
  };
  lastUpdated: string;
};

const SETTINGS_KEY = "user-settings";

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultSettings();
    const parsed = JSON.parse(raw);
    return { ...getDefaultSettings(), ...parsed };
  } catch {
    return getDefaultSettings();
  }
}

function getDefaultSettings(): UserSettings {
  return {
    id: "default",
    profile: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      location: "",
      bio: "",
      avatar: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    },
    colorblindFilter: "none",
    language: "en",
    currency: "USD",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      shareData: false,
      analytics: true,
    },
    preferences: {
      defaultTransportation: "car",
      budgetRange: "moderate",
      travelStyle: "mixed",
      accommodationType: "hotel",
    },
    lastUpdated: new Date().toISOString(),
  };
}

export default function Settings() {
  const { isDarkMode, toggleDarkMode, colorblindFilter, setColorblindFilter } = useTheme();
  const [settings, setSettings] = useState<UserSettings>(getDefaultSettings());
  const [activeTab, setActiveTab] = useState<'profile' | 'general' | 'notifications' | 'privacy' | 'preferences'>('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
    // Sync loaded colorblind filter with theme provider
    if (loadedSettings.colorblindFilter !== colorblindFilter) {
      setColorblindFilter(loadedSettings.colorblindFilter);
    }
  }, [colorblindFilter, setColorblindFilter]);

  const saveSettings = () => {
    const updatedSettings = {
      ...settings,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
    setHasChanges(false);
  };

  const resetToDefaults = () => {
    const defaultSettings = getDefaultSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    setSettings(defaultSettings);
    setHasChanges(false);
    setShowResetModal(false);
  };

  const updateSetting = (path: string, value: string | number | boolean) => {
    // Special handling for colorblind filter to sync with theme provider
    if (path === 'colorblindFilter') {
      setColorblindFilter(value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia');
    }
    
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: Record<string, unknown> = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
    
    setSettings(newSettings);
    setHasChanges(true);
  };

  const tabs = [
    { 
      id: 'profile' as const, 
      label: 'Profile', 
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    },
    { 
      id: 'general' as const, 
      label: 'General', 
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    },
    { 
      id: 'notifications' as const, 
      label: 'Notifications', 
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    },
    { 
      id: 'privacy' as const, 
      label: 'Privacy', 
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    },
    { 
      id: 'preferences' as const, 
      label: 'Travel Preferences', 
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    },
  ];

  // Inject CSS for colorblind filters and theme styles
  useEffect(() => {
    const styleId = 'settings-styles';
    const existingStyle = document.getElementById(styleId);
    
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        /* Theme Styles */
        .theme-dark {
          color-scheme: dark;
        }
        
        .theme-light {
          color-scheme: light;
        }
        
        /* Dark theme styles */
        html.dark {
          background-color: #111827;
          color: #f9fafb;
        }
        
        html.dark body {
          background-color: #111827 !important;
          color: #f9fafb !important;
        }
        
        html.dark .bg-white {
          background-color: #1f2937 !important;
        }
        
        html.dark .bg-gray-50 {
          background-color: #374151 !important;
        }
        
        html.dark .text-gray-900 {
          color: #f9fafb !important;
        }
        
        html.dark .text-gray-700 {
          color: #d1d5db !important;
        }
        
        html.dark .text-gray-600 {
          color: #9ca3af !important;
        }
        
        html.dark .text-gray-500 {
          color: #6b7280 !important;
        }
        
        html.dark .border-gray-200 {
          border-color: #374151 !important;
        }
        
        html.dark .border-gray-300 {
          border-color: #4b5563 !important;
        }
        
        html.dark .border-gray-100 {
          border-color: #374151 !important;
        }
        
        html.dark input, html.dark select, html.dark textarea {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: #f9fafb !important;
        }
        
        html.dark input:focus, html.dark select:focus, html.dark textarea:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 1px #6366f1 !important;
        }
        
        html.dark .shadow {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2) !important;
        }
        
        html.dark .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2) !important;
        }
        
        /* Colorblind Filter Styles */
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
    }
  }, []);

  return (
    <div className={`max-w-6xl mx-auto py-12 px-4 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Back Arrow Button */}
      <button
        onClick={() => window.location.assign('/')}
        className="group mb-6 flex items-center gap-2 text-gray-600 hover:text-[#0070AC] transition-all"
      >
        <svg 
          className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0070AC] to-[#005a8b] flex items-center justify-center text-white shadow-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
            <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Customize your VacAI experience and preferences</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              Last updated: {new Date(settings.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowResetModal(true)}
            className="px-6 py-2.5 rounded-full border-2 border-red-500 text-red-600 hover:bg-red-50 font-medium transition-all hover:shadow-md"
          >
            Reset to Defaults
          </button>
          {hasChanges && (
            <button
              onClick={saveSettings}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 font-medium transition-all shadow-lg hover:shadow-xl animate-pulse"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
        {/* Tab Navigation */}
        <div className={`border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r from-gray-50 to-white ${isDarkMode ? 'from-gray-800 to-gray-900' : ''}`}>
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-semibold border-b-4 transition-all ${
                  activeTab === tab.id
                    ? 'border-[#0070AC] text-[#0070AC] bg-blue-50 shadow-inner'
                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
                }`}
              >
                <span className="mr-2 inline-block">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Profile Information</h2>
              
              {/* Profile Picture Section */}
              <div className="flex items-center space-x-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border-2 border-gray-100 shadow-md">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0070AC] to-[#005a8b] flex items-center justify-center overflow-hidden shadow-lg">
                    {settings.profile.avatar ? (
                      <Image src={settings.profile.avatar} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-9 h-9 bg-gradient-to-br from-[#0070AC] to-[#005a8b] rounded-full flex items-center justify-center text-white text-sm hover:shadow-lg transition-all hover:scale-110">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-600 mt-1">Upload a profile picture or choose an avatar</p>
                  <div className="mt-3 flex gap-3">
                    <button className="px-5 py-2.5 text-sm bg-gradient-to-r from-[#0070AC] to-[#005a8b] text-white rounded-full hover:shadow-lg transition-all font-medium">
                      Upload Photo
                    </button>
                    <button className="px-5 py-2.5 text-sm border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:shadow-md transition-all font-medium">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={settings.profile.firstName}
                    onChange={(e) => updateSetting('profile.firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={settings.profile.lastName}
                    onChange={(e) => updateSetting('profile.lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSetting('profile.email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => updateSetting('profile.phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={settings.profile.dateOfBirth}
                    onChange={(e) => updateSetting('profile.dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={settings.profile.location}
                    onChange={(e) => updateSetting('profile.location', e.target.value)}
                    placeholder="City, State, Country"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  />
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea
                  value={settings.profile.bio}
                  onChange={(e) => updateSetting('profile.bio', e.target.value)}
                  placeholder="Tell us about yourself, your travel interests, and experiences..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                />
              </div>

              {/* Emergency Contact */}
              <div className="border-t-2 border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={settings.profile.emergencyContact.name}
                      onChange={(e) => updateSetting('profile.emergencyContact.name', e.target.value)}
                      placeholder="Emergency contact name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={settings.profile.emergencyContact.phone}
                      onChange={(e) => updateSetting('profile.emergencyContact.phone', e.target.value)}
                      placeholder="+1 (555) 987-6543"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                    <select
                      value={settings.profile.emergencyContact.relationship}
                      onChange={(e) => updateSetting('profile.emergencyContact.relationship', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                    >
                      <option value="">Select relationship</option>
                      <option value="parent">Parent</option>
                      <option value="spouse">Spouse/Partner</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
                  <div className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50">
                    <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                      {isDarkMode ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                      Current: {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </span>
                    <button
                      onClick={toggleDarkMode}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 hover:from-yellow-500 hover:to-yellow-600' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                      }`}
                    >
                      {isDarkMode ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Switch to Light
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          Switch to Dark
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Colorblind Filter</label>
                  <select
                    value={colorblindFilter}
                    onChange={(e) => updateSetting('colorblindFilter', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  >
                    <option value="none">None</option>
                    <option value="protanopia">Protanopia (Red-blind)</option>
                    <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                    <option value="tritanopia">Tritanopia (Blue-blind)</option>
                    <option value="achromatopsia">Achromatopsia (Total color blindness)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  >
                    <option value="America/New_York">Eastern (EST/EDT)</option>
                    <option value="America/Chicago">Central (CST/CDT)</option>
                    <option value="America/Denver">Mountain (MST/MDT)</option>
                    <option value="America/Los_Angeles">Pacific (PST/PDT)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="Europe/Paris">Paris (CET/CEST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Notification Preferences</h2>
              
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 capitalize flex items-center gap-2">
                        {key === 'email' ? (
                          <>
                            <svg className="w-5 h-5 text-[#0070AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email Notifications
                          </>
                        ) : key === 'push' ? (
                          <>
                            <svg className="w-5 h-5 text-[#0070AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Push Notifications
                          </>
                        ) : key === 'sms' ? (
                          <>
                            <svg className="w-5 h-5 text-[#0070AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            SMS Notifications
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-[#0070AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            Marketing Communications
                          </>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {key === 'email' ? 'Receive updates and reminders via email' :
                         key === 'push' ? 'Browser and app push notifications' :
                         key === 'sms' ? 'Text message alerts for important updates' :
                         'Promotional content and travel deals'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSetting(`notifications.${key}`, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0070AC]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#0070AC] peer-checked:to-[#005a8b] shadow-inner"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Privacy & Security</h2>
              
              <div className="space-y-4">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 capitalize flex items-center gap-2">
                        {key === 'profileVisible' ? (
                          <>
                            <svg className="w-5 h-5 text-[#0070AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Public Profile
                          </>
                        ) : key === 'shareData' ? (
                          <>
                            <svg className="w-5 h-5 text-[#0070AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Data Sharing
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-[#0070AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Analytics
                          </>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {key === 'profileVisible' ? 'Allow others to see your travel profile' :
                         key === 'shareData' ? 'Share anonymized data to improve services' :
                         'Help us improve by collecting usage analytics'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSetting(`privacy.${key}`, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0070AC]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#0070AC] peer-checked:to-[#005a8b] shadow-inner"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Travel Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Transportation</label>
                  <select
                    value={settings.preferences.defaultTransportation}
                    onChange={(e) => updateSetting('preferences.defaultTransportation', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  >
                    <option value="car">Car / Rental</option>
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="bus">Bus</option>
                    <option value="walking">Walking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Range</label>
                  <select
                    value={settings.preferences.budgetRange}
                    onChange={(e) => updateSetting('preferences.budgetRange', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  >
                    <option value="budget">Budget ($)</option>
                    <option value="moderate">Moderate ($$)</option>
                    <option value="luxury">Luxury ($$$)</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Style</label>
                  <select
                    value={settings.preferences.travelStyle}
                    onChange={(e) => updateSetting('preferences.travelStyle', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  >
                    <option value="relaxed">Relaxed & Slow</option>
                    <option value="mixed">Mixed Pace</option>
                    <option value="adventure">Adventure & Active</option>
                    <option value="cultural">Cultural & Educational</option>
                    <option value="party">Social & Nightlife</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Accommodation Type</label>
                  <select
                    value={settings.preferences.accommodationType}
                    onChange={(e) => updateSetting('preferences.accommodationType', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#0070AC] focus:border-[#0070AC] transition-all"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="airbnb">Airbnb / Rental</option>
                    <option value="hostel">Hostel</option>
                    <option value="resort">Resort</option>
                    <option value="camping">Camping</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 border-2 border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Reset to Defaults</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                This will reset all your settings to their default values. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={resetToDefaults}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  Reset All Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SettingsLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/settings')}
      className={className}
    >
      {children ?? 'Settings'}
    </button>
  );
}