# Auth0 OAuth Setup Guide

This guide will help you set up Auth0 authentication for the Capgemini Hospitality application.

## Prerequisites

1. An Auth0 account (sign up at [auth0.com](https://auth0.com) if you don't have one)

## Setup Steps

### 1. Create Auth0 Application

1. Log in to your Auth0 dashboard
2. Go to **Applications** > **Applications**
3. Click **Create Application**
4. Choose a name (e.g., "Capgemini Hospitality")
5. Select **Single Page Web Applications**
6. Click **Create**

### 2. Configure Application Settings

In your newly created application:

1. Go to the **Settings** tab
2. Note down these values:
   - **Domain**: This will be something like `your-tenant.auth0.com`
   - **Client ID**: A long alphanumeric string
3. Configure **Allowed Callback URLs**: 
   ```
   http://localhost:3000
   ```
4. Configure **Allowed Logout URLs**:
   ```
   http://localhost:3000
   ```
5. Configure **Allowed Web Origins**:
   ```
   http://localhost:3000
   ```
6. Click **Save Changes**

### 3. Update Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:
   ```bash
   # Replace with your actual Auth0 domain and client ID
   NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
   NEXT_PUBLIC_AUTH0_CLIENT_ID=your-actual-client-id
   NEXT_PUBLIC_AUTH0_AUDIENCE=https://capgemini-hospitality-api
   ```

### 4. For Production Deployment

When deploying to Azure Static Web Apps, you'll need to:

1. Add your production URL to the Auth0 application settings:
   - **Allowed Callback URLs**: `https://your-app.azurestaticapps.net`
   - **Allowed Logout URLs**: `https://your-app.azurestaticapps.net`
   - **Allowed Web Origins**: `https://your-app.azurestaticapps.net`

2. Add the environment variables to your Azure Static Web App configuration:
   - Go to Azure Portal > Your Static Web App > Configuration
   - Add the same environment variables as application settings

## Features Enabled

With Auth0 OAuth, your application now has:

- ✅ **Secure Authentication**: Industry-standard OAuth 2.0 / OpenID Connect
- ✅ **Social Login**: Users can sign in with Google, GitHub, etc. (configure in Auth0)
- ✅ **Multi-factor Authentication**: Available in Auth0 dashboard
- ✅ **User Management**: Handled by Auth0
- ✅ **Password Security**: No plain text passwords in your database
- ✅ **JWT Tokens**: Secure API authentication
- ✅ **Session Management**: Automatic token refresh

## Next Steps

1. **Configure Social Connections** (optional):
   - In Auth0 dashboard, go to **Authentication** > **Social**
   - Enable Google, GitHub, or other providers

2. **Update Azure Functions** (recommended):
   - Modify your Azure Functions to validate JWT tokens from Auth0
   - Remove the custom authentication endpoints (`/signin`, `/signup`)

3. **Enable MFA** (recommended):
   - In Auth0 dashboard, go to **Security** > **Multi-factor Auth**
   - Enable SMS, Email, or App-based MFA

## Troubleshooting

- **Application won't load**: Check that all URLs in Auth0 settings match your domain
- **Login redirect fails**: Verify callback URLs are correctly configured
- **Environment variables not working**: Restart the development server after changing `.env.local`

## Security Notes

- Never commit your actual Auth0 credentials to version control
- Use different Auth0 applications for development and production
- Regularly rotate your client secrets in production