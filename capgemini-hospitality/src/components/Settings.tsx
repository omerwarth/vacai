"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  theme: "light" | "dark" | "auto";
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
  } catch (e) {
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
    theme: "light",
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
  const [settings, setSettings] = useState<UserSettings>(getDefaultSettings());
  const [activeTab, setActiveTab] = useState<'profile' | 'general' | 'notifications' | 'privacy' | 'preferences'>('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
    
    // Apply theme immediately on component mount
    const applyInitialTheme = (theme: string) => {
      const html = document.documentElement;
      const body = document.body;
      
      // Remove existing theme classes
      html.classList.remove('theme-light', 'theme-dark', 'theme-auto');
      body.classList.remove('bg-white', 'bg-gray-900', 'text-gray-900', 'text-white');
      
      // Apply theme class to html for CSS-based theming
      html.classList.add(`theme-${theme}`);
      
      // Handle auto theme based on system preference
      const isDarkMode = theme === 'dark' || 
        (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDarkMode) {
        html.classList.add('dark');
        body.classList.add('bg-gray-900', 'text-white');
      } else {
        html.classList.remove('dark');
        body.classList.add('bg-white', 'text-gray-900');
      }
    };
    
    applyInitialTheme(loadedSettings.theme);
  }, []);

  // Apply colorblind filter to the document body
  useEffect(() => {
    const applyColorblindFilter = (filter: string) => {
      const body = document.body;
      
      // Remove existing colorblind filter classes
      body.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia', 'colorblind-achromatopsia');
      
      // Apply new filter if not 'none'
      if (filter !== 'none') {
        body.classList.add(`colorblind-${filter}`);
      }
    };

    applyColorblindFilter(settings.colorblindFilter);
  }, [settings.colorblindFilter]);

  // Apply theme to the document
  useEffect(() => {
    const applyTheme = (theme: string) => {
      const html = document.documentElement;
      const body = document.body;
      
      // Remove existing theme classes
      html.classList.remove('theme-light', 'theme-dark', 'theme-auto');
      body.classList.remove('bg-white', 'bg-gray-900', 'text-gray-900', 'text-white');
      
      // Apply theme class to html for CSS-based theming
      html.classList.add(`theme-${theme}`);
      
      // Handle auto theme based on system preference
      const isDarkMode = theme === 'dark' || 
        (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDarkMode) {
        html.classList.add('dark');
        body.classList.add('bg-gray-900', 'text-white');
      } else {
        html.classList.remove('dark');
        body.classList.add('bg-white', 'text-gray-900');
      }
    };

    applyTheme(settings.theme);

    // Listen for system theme changes when auto mode is selected
    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme(settings.theme);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

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

  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setSettings(newSettings);
    setHasChanges(true);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
    { id: 'general' as const, label: 'General', icon: '⚙️' },
    { id: 'notifications' as const, label: 'Notifications', icon: '🔔' },
    { id: 'privacy' as const, label: 'Privacy', icon: '🔒' },
    { id: 'preferences' as const, label: 'Travel Preferences', icon: '✈️' },
  ];

  // Inject CSS for colorblind filters and theme styles
  useEffect(() => {
    const styleId = 'settings-styles';
    let existingStyle = document.getElementById(styleId);
    
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
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-700">Settings</h1>
            <p className="text-sm text-indigo-600 mt-1">Customize your VacAI experience and preferences.</p>
            <p className="text-sm text-indigo-700 font-semibold mt-2">
              Last updated: {new Date(settings.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.assign('/')}
            className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Back to Home
          </button>
          <button
            onClick={() => setShowResetModal(true)}
            className="text-sm px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Reset to Defaults
          </button>
          {hasChanges && (
            <button
              onClick={saveSettings}
              className="text-sm px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 animate-pulse"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              
              {/* Profile Picture Section */}
              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                    {settings.profile.avatar ? (
                      <img src={settings.profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm hover:bg-indigo-700">
                    📷
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload a profile picture or choose an avatar</p>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                      Upload Photo
                    </button>
                    <button className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={settings.profile.firstName}
                    onChange={(e) => updateSetting('profile.firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={settings.profile.lastName}
                    onChange={(e) => updateSetting('profile.lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSetting('profile.email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => updateSetting('profile.phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={settings.profile.dateOfBirth}
                    onChange={(e) => updateSetting('profile.dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={settings.profile.location}
                    onChange={(e) => updateSetting('profile.location', e.target.value)}
                    placeholder="City, State, Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={settings.profile.bio}
                  onChange={(e) => updateSetting('profile.bio', e.target.value)}
                  placeholder="Tell us about yourself, your travel interests, and experiences..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={settings.profile.emergencyContact.name}
                      onChange={(e) => updateSetting('profile.emergencyContact.name', e.target.value)}
                      placeholder="Emergency contact name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={settings.profile.emergencyContact.phone}
                      onChange={(e) => updateSetting('profile.emergencyContact.phone', e.target.value)}
                      placeholder="+1 (555) 987-6543"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <select
                      value={settings.profile.emergencyContact.relationship}
                      onChange={(e) => updateSetting('profile.emergencyContact.relationship', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="light">🌞 Light</option>
                    <option value="dark">🌙 Dark</option>
                    <option value="auto">🔄 Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Colorblind Filter</label>
                  <select
                    value={settings.colorblindFilter}
                    onChange={(e) => updateSetting('colorblindFilter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="none">👁️ None</option>
                    <option value="protanopia">🔴 Protanopia (Red-blind)</option>
                    <option value="deuteranopia">🟢 Deuteranopia (Green-blind)</option>
                    <option value="tritanopia">🔵 Tritanopia (Blue-blind)</option>
                    <option value="achromatopsia">⚫ Achromatopsia (Total color blindness)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="de">🇩🇪 German</option>
                    <option value="ja">🇯🇵 Japanese</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="USD">💵 USD</option>
                    <option value="EUR">💶 EUR</option>
                    <option value="GBP">💷 GBP</option>
                    <option value="JPY">💴 JPY</option>
                    <option value="CAD">🍁 CAD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="America/New_York">🗽 Eastern (EST/EDT)</option>
                    <option value="America/Chicago">🌾 Central (CST/CDT)</option>
                    <option value="America/Denver">🏔️ Mountain (MST/MDT)</option>
                    <option value="America/Los_Angeles">🌴 Pacific (PST/PDT)</option>
                    <option value="Europe/London">🇬🇧 London (GMT/BST)</option>
                    <option value="Europe/Paris">🇫🇷 Paris (CET/CEST)</option>
                    <option value="Asia/Tokyo">🇯🇵 Tokyo (JST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 capitalize">
                        {key === 'email' ? '📧 Email Notifications' : 
                         key === 'push' ? '🔔 Push Notifications' :
                         key === 'sms' ? '📱 SMS Notifications' :
                         '📢 Marketing Communications'}
                      </h3>
                      <p className="text-sm text-gray-500">
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h2>
              
              <div className="space-y-4">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 capitalize">
                        {key === 'profileVisible' ? '👁️ Public Profile' :
                         key === 'shareData' ? '🤝 Data Sharing' :
                         '📊 Analytics'}
                      </h3>
                      <p className="text-sm text-gray-500">
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Travel Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Transportation</label>
                  <select
                    value={settings.preferences.defaultTransportation}
                    onChange={(e) => updateSetting('preferences.defaultTransportation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="car">🚗 Car / Rental</option>
                    <option value="flight">✈️ Flight</option>
                    <option value="train">🚆 Train</option>
                    <option value="bus">🚌 Bus</option>
                    <option value="walking">🚶 Walking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <select
                    value={settings.preferences.budgetRange}
                    onChange={(e) => updateSetting('preferences.budgetRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="budget">💰 Budget ($)</option>
                    <option value="moderate">💎 Moderate ($$)</option>
                    <option value="luxury">👑 Luxury ($$$)</option>
                    <option value="unlimited">🌟 Unlimited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
                  <select
                    value={settings.preferences.travelStyle}
                    onChange={(e) => updateSetting('preferences.travelStyle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="relaxed">😌 Relaxed & Slow</option>
                    <option value="mixed">🎯 Mixed Pace</option>
                    <option value="adventure">🏃 Adventure & Active</option>
                    <option value="cultural">🏛️ Cultural & Educational</option>
                    <option value="party">🎉 Social & Nightlife</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation Type</label>
                  <select
                    value={settings.preferences.accommodationType}
                    onChange={(e) => updateSetting('preferences.accommodationType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="hotel">🏨 Hotel</option>
                    <option value="airbnb">🏠 Airbnb / Rental</option>
                    <option value="hostel">🛖 Hostel</option>
                    <option value="resort">🏰 Resort</option>
                    <option value="camping">⛺ Camping</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset to Defaults</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will reset all your settings to their default values. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Reset All Settings
              </button>
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