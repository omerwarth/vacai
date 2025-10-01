'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

export default function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN!;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!;
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

  // Debug logging for troubleshooting
  console.log('Auth0 Environment Variables:', {
    domain: domain || 'MISSING',
    clientId: clientId ? 'SET' : 'MISSING',
    audience: audience || 'MISSING',
    nodeEnv: process.env.NODE_ENV
  });

  // Safety check - prevent app from breaking if env vars are missing
  if (!domain || !clientId) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-gray-600 mb-4">
            Auth0 environment variables are missing. Please check your Azure Static Web App configuration.
          </p>
          <div className="text-left text-sm text-gray-500">
            <p>Missing: {!domain && 'NEXT_PUBLIC_AUTH0_DOMAIN'} {!clientId && 'NEXT_PUBLIC_AUTH0_CLIENT_ID'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the current URL for redirects - handle both development and production
  const getRedirectUri = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    // Fallback for server-side rendering
    return process.env.NODE_ENV === 'production' 
      ? 'https://purple-sand-06148da0f.1.azurestaticapps.net'
      : 'http://localhost:3001';
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: getRedirectUri(),
        scope: "openid profile email"
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}