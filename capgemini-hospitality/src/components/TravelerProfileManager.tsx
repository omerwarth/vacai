'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiService, TravelerProfile } from '@/config/api';
import OnboardingModal from './OnboardingModal';

interface OnboardingData {
  [key: string]: string | string[] | number;
}

interface TravelerProfileManagerProps {
  onProfileSelect?: (profile: TravelerProfile) => void;
}

const TravelerProfileManager: React.FC<TravelerProfileManagerProps> = ({ onProfileSelect }) => {
  const { user } = useAuth0();
  const [profiles, setProfiles] = useState<TravelerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<TravelerProfile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRelationship, setNewProfileRelationship] = useState('');

  const createDefaultProfile = useCallback(async () => {
    if (!user?.sub) return;
    
    try {
      const defaultProfile = {
        userId: user.sub,
        name: user?.name || user?.email || 'My Profile',
        relationship: 'self',
        isDefault: true
      };
      
      const response = await apiService.createTravelerProfile(defaultProfile);
      setProfiles([response.profile]);
    } catch (error) {
      console.error('Failed to create default profile:', error);
    }
  }, [user]);

  const loadTravelerProfiles = useCallback(async () => {
    if (!user?.sub) return;
    
    try {
      setLoading(true);
      const response = await apiService.getTravelerProfiles(user.sub);
      setProfiles(response.profiles || []);
      
      // If no profiles exist, create a default "self" profile
      if (!response.profiles || response.profiles.length === 0) {
        await createDefaultProfile();
      }
    } catch (error) {
      console.error('Failed to load traveler profiles:', error);
      setError('Failed to load traveler profiles');
    } finally {
      setLoading(false);
    }
  }, [user?.sub, createDefaultProfile]);

  useEffect(() => {
    if (user?.sub) {
      loadTravelerProfiles();
    }
  }, [user, loadTravelerProfiles]);

  const handleCreateProfile = async () => {
    if (!user?.sub || !newProfileName.trim()) return;
    
    try {
      const profileData = {
        userId: user.sub,
        name: newProfileName.trim(),
        relationship: newProfileRelationship || 'other',
        isDefault: false
      };
      
      const response = await apiService.createTravelerProfile(profileData);
      setProfiles([...profiles, response.profile]);
      setNewProfileName('');
      setNewProfileRelationship('');
      setShowCreateProfile(false);
    } catch (error) {
      console.error('Failed to create profile:', error);
      setError('Failed to create profile');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    
    try {
      await apiService.deleteTravelerProfile(profileId);
      setProfiles(profiles.filter(p => p.id !== profileId));
    } catch (error) {
      console.error('Failed to delete profile:', error);
      setError('Failed to delete profile');
    }
  };

  const handleSetPreferences = (profile: TravelerProfile) => {
    setSelectedProfile(profile);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user?.sub || !selectedProfile) return;
    
    try {
      // Convert onboarding data to travel preferences format
      const preferences = {
        name: data.name as string,
        transportation: data.transportation as string,
        schedule_flexibility: data.schedule_flexibility as number,
        accommodation: data.accommodation as string,
        activities: data.activities as string[],
        dietary_restrictions: data.dietary_restrictions as string[],
        comfort_level: data.comfort_level as number,
        trip_length: data.trip_length as string,
        trip_vibe: data.trip_vibe as string[]
      };
      
      await apiService.saveUserPreferences(user.sub, selectedProfile.id, preferences);
      setShowOnboarding(false);
      setSelectedProfile(null);
      
      // Optionally reload profiles to show updated status
      loadTravelerProfiles();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setError('Failed to save preferences');
    }
  };

  const relationshipOptions = [
    { value: 'self', label: 'Myself' },
    { value: 'spouse', label: 'Spouse/Partner' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading traveler profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Traveler Profiles</h2>
        <button
          onClick={() => setShowCreateProfile(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Profile
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{profile.relationship}</p>
                {profile.isDefault && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                    Default
                  </span>
                )}
              </div>
              {!profile.isDefault && (
                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => handleSetPreferences(profile)}
                className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                Set Travel Preferences
              </button>
              
              {onProfileSelect && (
                <button
                  onClick={() => onProfileSelect(profile)}
                  className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  Use for Planning
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Profile Modal */}
      {showCreateProfile && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Traveler</h3>
              <button
                onClick={() => setShowCreateProfile(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Enter traveler's name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <select
                  value={newProfileRelationship}
                  onChange={(e) => setNewProfileRelationship(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select relationship</option>
                  {relationshipOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateProfile(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && selectedProfile && (
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onCancel={() => {
            setShowOnboarding(false);
            setSelectedProfile(null);
          }}
        />
      )}
    </div>
  );
};

export default TravelerProfileManager;