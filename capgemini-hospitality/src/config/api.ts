// API Configuration for External Azure Functions App
// This file manages the endpoints for your separate Azure Functions App

interface ApiConfig {
  baseUrl: string;
  endpoints: {
    signin: string;
    signup: string;
    users: string;
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
    ? 'http://localhost:7071' // Local development
    : 'capgemini-hospitality-api-cfhkgge6a0h6ach6.eastus2-01.azurewebsites.net'; // Production Functions App
  
  const baseUrl = functionsAppUrl || defaultBaseUrl;
  
  return {
    baseUrl,
    endpoints: {
      signin: `${baseUrl}/api/signin`,
      signup: `${baseUrl}/api/signup`,
      users: `${baseUrl}/api/users`
    }
  };
};

export const apiConfig = getApiConfig();

// API service functions
export const apiService = {
  async signin(email: string, password: string) {
    console.log('🔍 Signing in with:', { email, endpoint: apiConfig.endpoints.signin });
    
    const response = await fetch(apiConfig.endpoints.signin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      } catch (parseError) {
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
  }
};