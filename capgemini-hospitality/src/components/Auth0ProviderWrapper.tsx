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