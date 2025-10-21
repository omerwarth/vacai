// API Configuration for Azure Functions

interface ApiConfig {
  baseUrl: string;
  endpoints: {
    signin: string;
    signup: string;
    travelerProfiles: string;
    userPreferences: string;
    itineraries: string;
  };
}

const getApiConfig = (): ApiConfig => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const functionsAppUrl = process.env.NEXT_PUBLIC_AZURE_FUNCTIONS_URL;

  const defaultBaseUrl = isDevelopment
    ? "http://localhost:7071"
    : "https://capgemini-hospitality-api-cfhkgge6a0h6ach6.eastus2-01.azurewebsites.net";

  const baseUrl = functionsAppUrl || defaultBaseUrl;

  return {
    baseUrl,
    endpoints: {
      signin: `${baseUrl}/api/signin`,
      signup: `${baseUrl}/api/signup`,
      travelerProfiles: `${baseUrl}/api/traveler-profiles`,
      userPreferences: `${baseUrl}/api/user-preferences`,
      itineraries: `${baseUrl}/api/itinerary`,
    },
  };
};

export const apiConfig = getApiConfig();

export interface TravelerProfile {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TravelPreferences {
  id: string;
  userId: string;
  profileId: string;
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

export interface Itinerary {
  id: string;
  userId: string;
  profileId: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  airplane?: string;
  seat?: string;
  car?: string;
  entertainment?: string;
  accommodation?: string;
  hotel?: string;
  location?: string;
  money?: string;
  currency?: string;
  budget?: number;
  activity?: string[];
  food?: string[];
  restaurants?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const handleError = async (response: Response, fallbackMsg: string) => {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    throw new Error(data.error || fallbackMsg);
  } catch {
    throw new Error(`${fallbackMsg}: ${text || response.statusText}`);
  }
};

// API SERVICE 

export const apiService = {
  async signin(email: string, password: string) {
    const res = await fetch(apiConfig.endpoints.signin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) await handleError(res, "Failed to sign in");
    return res.json();
  },

  async signup(userData: { email: string; password: string; firstName?: string; lastName?: string }) {
    const res = await fetch(apiConfig.endpoints.signup, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) await handleError(res, "Failed to sign up");
    return res.json();
  },

  // TRAVELER PROFILES 
  async getTravelerProfiles(userId: string) {
    const url = `${apiConfig.endpoints.travelerProfiles}/${encodeURIComponent(userId)}`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) await handleError(res, "Failed to fetch traveler profiles");
    return res.json();
  },

  async createTravelerProfile(profile: Partial<TravelerProfile>) {
    const res = await fetch(apiConfig.endpoints.travelerProfiles, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) await handleError(res, "Failed to create traveler profile");
    return res.json();
  },

  async updateTravelerProfile(profileId: string, updates: Partial<TravelerProfile>) {
    const url = `${apiConfig.endpoints.travelerProfiles}/${encodeURIComponent(profileId)}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) await handleError(res, "Failed to update traveler profile");
    return res.json();
  },

  async deleteTravelerProfile(profileId: string) {
    const url = `${apiConfig.endpoints.travelerProfiles}/${encodeURIComponent(profileId)}`;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) await handleError(res, "Failed to delete traveler profile");
    return res.json();
  },

  // USER PREFERENCES
  async getUserPreferences(userId: string, profileId?: string) {
    const url = profileId
      ? `${apiConfig.endpoints.userPreferences}/${encodeURIComponent(userId)}/${encodeURIComponent(profileId)}`
      : `${apiConfig.endpoints.userPreferences}/${encodeURIComponent(userId)}`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) await handleError(res, "Failed to fetch user preferences");
    return res.json();
  },

  async saveUserPreferences(userId: string, profileId: string, prefs: Partial<TravelPreferences>) {
    const removeEmojis = (str: string = ""): string => {
      return str
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
        .replace(/\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?/gu, "")
        .trim();
    };

    const cleanedPreferences = {
      ...prefs,
      transportation: removeEmojis(prefs.transportation || ""),
      accommodation: removeEmojis(prefs.accommodation || ""),
      activities: (prefs.activities || []).map((a) => removeEmojis(a)),
      dietary_restrictions: (prefs.dietary_restrictions || []).map((r) => removeEmojis(r)),
      trip_length: removeEmojis(prefs.trip_length || ""),
      trip_vibe: (prefs.trip_vibe || []).map((v) => removeEmojis(v)),
    };

    const url = `${apiConfig.endpoints.userPreferences}/${encodeURIComponent(userId)}/${encodeURIComponent(profileId)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, profileId, ...cleanedPreferences }),
    });

    if (!res.ok) await handleError(res, "Failed to save user preferences");
    return res.json();
  },

  async updateUserPreferences(prefId: string, userId: string, prefs: Partial<TravelPreferences>) {
    const url = `${apiConfig.endpoints.userPreferences}/${encodeURIComponent(userId)}/${encodeURIComponent(prefId)}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    if (!res.ok) await handleError(res, "Failed to update user preferences");
    return res.json();
  },

  async deleteUserPreferences(prefId: string, userId: string) {
    const url = `${apiConfig.endpoints.userPreferences}/${encodeURIComponent(userId)}/${encodeURIComponent(prefId)}`;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) await handleError(res, "Failed to delete user preferences");
    return res.json();
  },

  // ITINERARIES
  async getItineraries(userId: string, profileId?: string) {
    const url = `${apiConfig.endpoints.itineraries}?userId=${encodeURIComponent(userId)}${
      profileId ? `&profileId=${encodeURIComponent(profileId)}` : ""
    }`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) await handleError(res, "Failed to fetch itineraries");
    return res.json();
  },

  async createItinerary(data: Partial<Itinerary>) {
    const res = await fetch(apiConfig.endpoints.itineraries, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) await handleError(res, "Failed to create itinerary");
    return res.json();
  },

  async updateItinerary(id: string, updates: Partial<Itinerary>) {
    const url = `${apiConfig.endpoints.itineraries}?id=${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) await handleError(res, "Failed to update itinerary");
    return res.json();
  },

  async deleteItinerary(id: string, userId: string) {
    const url = `${apiConfig.endpoints.itineraries}?id=${encodeURIComponent(id)}&userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) await handleError(res, "Failed to delete itinerary");
    return res.json();
  },
};