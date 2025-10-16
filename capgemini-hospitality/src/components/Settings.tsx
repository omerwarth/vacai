"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserSettings = {
  id: string;
  theme: "light" | "dark" | "auto";
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
    theme: "light",
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
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'preferences'>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

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
    { id: 'general' as const, label: 'General', icon: '⚙️' },
    { id: 'notifications' as const, label: 'Notifications', icon: '🔔' },
    { id: 'privacy' as const, label: 'Privacy', icon: '🔒' },
    { id: 'preferences' as const, label: 'Travel Preferences', icon: '✈️' },
  ];

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