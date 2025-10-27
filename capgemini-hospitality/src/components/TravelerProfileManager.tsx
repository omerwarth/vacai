'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiService, UserProfile, Traveler } from '@/config/api';
import OnboardingModal from './OnboardingModal';

interface OnboardingData {
  [key: string]: string | string[] | number;
}

interface TravelerProfileManagerProps {
  onProfileSelect?: (profile: Traveler) => void;
}

const TravelerProfileManager: React.FC<TravelerProfileManagerProps> = ({ onProfileSelect }) => {
  const { user } = useAuth0();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedTraveler, setSelectedTraveler] = useState<Traveler | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRelationship, setNewProfileRelationship] = useState('');
  const [usingLegacyApi, setUsingLegacyApi] = useState(false);

  const loadUserProfile = useCallback(async () => {
    if (!user?.sub) return;
    
    try {
      setLoading(true);
      
      // Try new API first
      try {
        const profile = await apiService.getUserProfile(user.sub);
        console.log('✅ Successfully loaded user profile from new API');
        setUserProfile(profile);
        setTravelers(profile.travelers || []);
        setError('');
        setUsingLegacyApi(false);
        return;
      } catch (newApiError: any) {
        console.log('New API error:', newApiError.message);
        
        // If profile doesn't exist (404), create it
        if (newApiError.message?.includes('not found') || newApiError.message?.includes('404')) {
          console.log('User profile not found, creating new profile...');
          try {
            const newProfile = await apiService.createUserProfile({
              userId: user.sub,
              email: user.email || ''
            });
            console.log('✅ Successfully created new user profile:', newProfile);
            setUserProfile(newProfile);
            setTravelers(newProfile.travelers || []);
            setError('');
            setUsingLegacyApi(false);
            return;
          } catch (createError: any) {
            console.error('❌ Failed to create user profile:', createError.message);
            // If creation fails, try legacy API as fallback
          }
        }
        
        console.log('Falling back to legacy API...');
        
        // Fallback to legacy API
        try {
          setUsingLegacyApi(true);
          const response = await apiService.getTravelerProfiles(user.sub);
          
          // Convert legacy profiles to new structure for display
          const legacyProfiles = response.profiles || [];
          
          if (legacyProfiles.length === 0) {
            // Create default profile using legacy API
            const defaultProfile = {
              userId: user.sub,
              name: user?.name || user?.email || 'My Profile',
              relationship: 'self',
              isDefault: true
            };
            const createResponse = await apiService.createTravelerProfile(defaultProfile);
            legacyProfiles.push(createResponse.profile);
          }
          
          // Map legacy profiles to new Traveler structure
          const mappedTravelers: Traveler[] = legacyProfiles.map((profile: any) => ({
            id: profile.id,
            name: profile.name,
            relationship: profile.relationship,
            isDefault: profile.isDefault,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            // Preferences will be loaded separately if needed
          }));
          
          setTravelers(mappedTravelers);
          setError('');
          console.log('Using legacy API - some features may be limited');
        } catch (legacyError) {
          console.error('Both new and legacy APIs failed:', legacyError);
          setError('Failed to load traveler profiles');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.sub) {
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  const handleCreateProfile = async () => {
    if (!user?.sub || !newProfileName.trim()) return;
    
    try {
      const updatedProfile = await apiService.addTraveler(user.sub, {
        name: newProfileName.trim(),
        relationship: newProfileRelationship || 'other',
        isDefault: false
      });
      
      setUserProfile(updatedProfile);
      setTravelers(updatedProfile.travelers || []);
      setNewProfileName('');
      setNewProfileRelationship('');
      setShowCreateProfile(false);
    } catch (error) {
      console.error('Failed to add traveler:', error);
      setError('Failed to add traveler');
    }
  };

  const handleDeleteProfile = async (travelerId: string) => {
    if (!confirm('Are you sure you want to delete this traveler?')) return;
    if (!user?.sub) return;
    
    try {
      const updatedProfile = await apiService.deleteTraveler(user.sub, travelerId);
      setUserProfile(updatedProfile);
      setTravelers(updatedProfile.travelers || []);
    } catch (error) {
      console.error('Failed to delete traveler:', error);
      setError('Failed to delete traveler');
    }
  };

  const handleSetPreferences = (traveler: Traveler) => {
    setSelectedTraveler(traveler);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user?.sub || !selectedTraveler) return;
    
    try {
      // Convert onboarding data to travel preferences format
      const preferences = {
        transportation: data.transportation as string,
        schedule_flexibility: data.schedule_flexibility as number,
        accommodation: data.accommodation as string,
        activities: data.activities as string[],
        dietary_restrictions: data.dietary_restrictions as string[],
        comfort_level: data.comfort_level as number,
        trip_length: data.trip_length as string,
        trip_vibe: data.trip_vibe as string[]
      };
      
      const updatedProfile = await apiService.updateTravelerPreferences(
        user.sub, 
        selectedTraveler.id, 
        preferences
      );
      
      setUserProfile(updatedProfile);
      setTravelers(updatedProfile.travelers || []);
      setShowOnboarding(false);
      setSelectedTraveler(null);
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
        {travelers.map((traveler) => (
          <div key={traveler.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{traveler.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{traveler.relationship}</p>
                {traveler.isDefault && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                    Default
                  </span>
                )}
                {traveler.preferences && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1 ml-1">
                    Preferences Set
                  </span>
                )}
              </div>
              {!traveler.isDefault && (
                <button
                  onClick={() => handleDeleteProfile(traveler.id)}
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
                onClick={() => handleSetPreferences(traveler)}
                className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                {traveler.preferences ? 'Update Preferences' : 'Set Travel Preferences'}
              </button>
              
              {onProfileSelect && (
                <button
                  onClick={() => onProfileSelect(traveler)}
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
      {showOnboarding && selectedTraveler && (
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onCancel={() => {
            setShowOnboarding(false);
            setSelectedTraveler(null);
          }}
        />
      )}
    </div>
  );
};

export default TravelerProfileManager;