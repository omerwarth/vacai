// API Configuration for External Azure Functions App
// This file manages the endpoints for your separate Azure Functions App

interface ApiConfig {
  baseUrl: string;
  endpoints: {
    signin: string;
    signup: string;
    users: string;
    travelerProfiles: string;
    userPreferences: string;
  };
}

// Configure your Azure Functions App URL
// Replace 'your-functions-app-name' with your actual Azure Functions App name
const getApiConfig = (): ApiConfig => {
  // In development, you might want to use localhost or a dev Functions App
  // In production, use your production Azure Functions App URL
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Option 1: Use environment variables (recommended)
  const functionsAppUrl = process.env.NEXT_PUBLIC_AZURE_FUNCTIONS_URL;
  
  // Option 2: Hardcode for different environments (fallback)
  const defaultBaseUrl = isDevelopment 
    ? 'http://localhost:7000' // Local development - Updated to match your Azure Functions port
    : 'https://capgemini-hospitality-api-cfhkgge6a0h6ach6.eastus2-01.azurewebsites.net'; // Production Functions App
  
  const baseUrl = functionsAppUrl || defaultBaseUrl;
  
  return {
    baseUrl,
    endpoints: {
      signin: `${baseUrl}/api/signin`,
      signup: `${baseUrl}/api/signup`,
      users: `${baseUrl}/api/users`,
      travelerProfiles: `${baseUrl}/api/traveler-profiles`,
      userPreferences: `${baseUrl}/api/user-preferences`
    }
  };
};

export const apiConfig = getApiConfig();

// Type definitions for traveler profiles and preferences
export interface TravelerProfile {
  id: string;
  userId: string; // Auth0 user ID who owns this profile
  name: string;
  relationship: string; // 'self', 'spouse', 'child', 'friend', etc.
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TravelPreferences {
  id: string;
  userId: string; // Auth0 user ID who owns this
  profileId: string; // Which traveler profile these preferences belong to
  name: string;
  transportation: string;
  schedule_flexibility: number;
  accommodation: string;
  activities: string[];
  dietary_restrictions: string[];
  comfort_level: number;
  trip_length: string;
  trip_vibe: string[];
  createdAt: string;
  updatedAt: string;
}

// API service functions
export const apiService = {
  async signin(email: string, password: string) {
    const response = await fetch(apiConfig.endpoints.signin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      } catch {
        throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`);
      }
    }
    
    return response.json();
  },

  async signup(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const response = await fetch(apiConfig.endpoints.signup, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Sign up failed');
    }
    
    return response.json();
  },

  async getUsers() {
    const response = await fetch(apiConfig.endpoints.users, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to fetch users');
    }
    
    return response.json();
  },

  // Traveler Profile Management
  async getTravelerProfiles(userId: string) {
    const encodedUserId = encodeURIComponent(userId);
    
    const response = await fetch(`${apiConfig.endpoints.travelerProfiles}/${encodedUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Failed to fetch traveler profiles: ${response.status}`);
      } catch {
        throw new Error(`Failed to fetch traveler profiles (${response.status}): ${errorText || 'Unknown error'}`);
      }
    }
    
    return response.json();
  },

  async createTravelerProfile(userId: string, profileData: Omit<TravelerProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const encodedUserId = encodeURIComponent(userId);
    
    const response = await fetch(`${apiConfig.endpoints.travelerProfiles}/${encodedUserId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, ...profileData }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Failed to create traveler profile: ${response.status}`);
      } catch {
        throw new Error(`Failed to create traveler profile (${response.status}): ${errorText || 'Unknown error'}`);
      }
    }
    
    return response.json();
  },

  async updateTravelerProfile(profileId: string, profileData: Partial<TravelerProfile>) {
    const response = await fetch(`${apiConfig.endpoints.travelerProfiles}/${profileData.userId}/${profileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Update Profile Error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Failed to update traveler profile: ${response.status}`);
      } catch {
        throw new Error(`Failed to update traveler profile (${response.status}): ${errorText || 'Unknown error'}`);
      }
    }
    
    return response.json();
  },

  async deleteTravelerProfile(profileId: string, userId: string) {
    const response = await fetch(`${apiConfig.endpoints.travelerProfiles}/${userId}/${profileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Delete Profile Error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Failed to delete traveler profile: ${response.status}`);
      } catch {
        throw new Error(`Failed to delete traveler profile (${response.status}): ${errorText || 'Unknown error'}`);
      }
    }
    
    return response.json();
  },

  // Travel Preferences Management
  async getTravelPreferences(userId: string, profileId?: string) {
    const url = profileId 
      ? `${apiConfig.endpoints.userPreferences}/${userId}/${profileId}`
      : `${apiConfig.endpoints.userPreferences}/${userId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get Preferences Error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Failed to fetch travel preferences: ${response.status}`);
      } catch {
        throw new Error(`Failed to fetch travel preferences (${response.status}): ${errorText || 'Unknown error'}`);
      }
    }
    
    return response.json();
  },

  async saveTravelPreferences(userId: string, profileId: string, preferences: Omit<TravelPreferences, 'id' | 'userId' | 'profileId' | 'createdAt' | 'updatedAt'>) {
    // Helper function to remove emojis from strings - comprehensive emoji removal
    const removeEmojis = (str: string): string => {
      return str
        // Remove most common emoji ranges
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Miscellaneous Symbols and Pictographs
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map Symbols
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Regional Indicator Symbols
        .replace(/[\u{2600}-\u{26FF}]/gu, '') // Miscellaneous Symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
        .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
        .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
        .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
        .replace(/[\u{FE00}-\u{FE0F}]/gu, '') // Variation Selectors
        .replace(/[\u{200D}]/gu, '') // Zero Width Joiner
        .trim();
    };
    
    // Clean preferences by removing emojis
    const cleanedPreferences = {
      ...preferences,
      transportation: removeEmojis(preferences.transportation),
      accommodation: removeEmojis(preferences.accommodation),
      activities: preferences.activities.map(activity => removeEmojis(activity)),
      dietary_restrictions: preferences.dietary_restrictions.map(restriction => removeEmojis(restriction)),
      trip_length: removeEmojis(preferences.trip_length),
      trip_vibe: preferences.trip_vibe.map(vibe => removeEmojis(vibe))
    };
    
    const requestBody = { userId, profileId, ...cleanedPreferences };
    
    // Validate required fields before sending
    if (!requestBody.name) {
      throw new Error('Preferences name is required');
    }
    
    // URL encode the userId to handle special characters like | in auth0|123456
    const encodedUserId = encodeURIComponent(userId);
    const encodedProfileId = encodeURIComponent(profileId);
    const fullUrl = `${apiConfig.endpoints.userPreferences}/${encodedUserId}/${encodedProfileId}`;
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      let errorText;
      try {
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } else {
          errorText = await response.text();
        }
      } catch {
        errorText = 'Could not parse error response';
      }
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Failed to save travel preferences: ${response.status}`);
      } catch {
        throw new Error(`Failed to save travel preferences (${response.status}): ${errorText || 'Unknown error'}`);
      }
    }
    
    return response.json();
  },

  async updateTravelPreferences(preferencesId: string, preferences: Partial<TravelPreferences>) {
    const { userId, profileId } = preferences;

    // ✅ Require both userId and profileId for clarity and proper routing
    if (!userId || !profileId) {
      throw new Error('Both userId and profileId are required to update travel preferences');
    }

    const encodedUserId = encodeURIComponent(userId);
    const encodedProfileId = encodeURIComponent(profileId);

    const response = await fetch(`${apiConfig.endpoints.userPreferences}/${encodedUserId}/${encodedProfileId}/${preferencesId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Update Preferences Error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Failed to update travel preferences: ${response.status}`);
      } catch {
        throw new Error(`Failed to update travel preferences (${response.status}): ${errorText || 'Unknown error'}`);
      }
    }

    return response.json();
  },

  async deleteTravelPreferences(preferencesId: string, userId: string, profileId: string) {
    if (!userId || !profileId) {
      throw new Error('Both userId and profileId are required to delete travel preferences');
    }

    const encodedUserId = encodeURIComponent(userId);
    const encodedProfileId = encodeURIComponent(profileId);

    const response = await fetch(`${apiConfig.endpoints.userPreferences}/${encodedUserId}/${encodedProfileId}/${preferencesId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Delete Preferences Error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Failed to delete travel preferences: ${response.status}`);
      } catch {
        throw new Error(`Failed to delete travel preferences (${response.status}): ${errorText || 'Unknown error'}`);
      }
    }
    return response.json();
  }
};