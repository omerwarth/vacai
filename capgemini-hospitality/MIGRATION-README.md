# Migration to External Azure Functions App

This document explains the migration from local Azure Functions to an external Azure Functions App.

## What Changed

### Before Migration
- Azure Functions were hosted within the Static Web App (`/api` folder)
- Functions were built and deployed together with the frontend
- API calls used relative paths (`/api/signin`, `/api/signup`, `/api/users`)

### After Migration
- Azure Functions are hosted in a separate Azure Functions App
- Static Web App only contains the frontend (Next.js)
- API calls use the external Functions App URL

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Replace with your actual Azure Functions App URL
NEXT_PUBLIC_AZURE_FUNCTIONS_URL=https://your-functions-app-name.azurewebsites.net
```

### 2. Azure Static Web Apps Configuration

Add the environment variable in your Azure Static Web App:

1. Go to Azure Portal → Your Static Web App
2. Navigate to "Configuration"
3. Add the following environment variable:
   - **Name**: `NEXT_PUBLIC_AZURE_FUNCTIONS_URL`
   - **Value**: `https://your-functions-app-name.azurewebsites.net`

### 3. CORS Configuration

Ensure your Azure Functions App has CORS configured to allow your Static Web App domain:

1. Go to Azure Portal → Your Functions App
2. Navigate to "CORS"
3. Add your Static Web App URL: `https://your-static-web-app-name.azurestaticapps.net`
4. For local development, also add: `http://localhost:3000`

## Files Modified

### New Files
- `src/config/api.ts` - API configuration and service functions
- `.env.example` - Environment variables template

### Modified Files
- `src/components/AuthPage.tsx` - Updated to use new API service
- `src/components/Dashboard.tsx` - Updated to use new API service
- `staticwebapp.config.json` - Removed API routing
- `tsconfig.json` - Removed API exclusion
- `azure-static-web-apps-purple-sand-06148da0f.yml` - Removed API build configuration

### Files to Remove
- `api/` folder (entire directory) - Functions are now external
- `build-api.sh` - No longer needed

## Deployment Steps

### 1. Deploy Your External Azure Functions App
Make sure your separate Azure Functions App is deployed and accessible with the following endpoints:
- `POST /api/signin`
- `POST /api/signup`  
- `GET /api/users`

### 2. Update Static Web App Environment Variables
Set `NEXT_PUBLIC_AZURE_FUNCTIONS_URL` in your Static Web App configuration.

### 3. Deploy Static Web App
Your next deployment will only include the frontend and will call the external Functions App.

## Local Development

For local development, you have two options:

### Option 1: Point to Production Functions App
```env
NEXT_PUBLIC_AZURE_FUNCTIONS_URL=https://your-functions-app-name.azurewebsites.net
```

### Option 2: Run Functions Locally (if you have the Functions code)
```env
NEXT_PUBLIC_AZURE_FUNCTIONS_URL=http://localhost:7071
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Functions App has CORS configured for your Static Web App domain
2. **Environment Variable Not Set**: Ensure `NEXT_PUBLIC_AZURE_FUNCTIONS_URL` is set in both local and production environments
3. **Functions App Not Accessible**: Verify your Functions App is deployed and the URL is correct

### Testing the Migration

1. **Local Testing**: 
   ```bash
   npm run dev
   ```
   Test sign up, sign in, and user listing functionality

2. **Production Testing**: Deploy and test the same functionality in production

## Rollback Plan

If you need to rollback:

1. Restore the `api/` folder from version control
2. Revert the changes to the modified files
3. Redeploy

## Benefits of This Migration

- **Separation of Concerns**: Frontend and backend can be deployed independently
- **Scalability**: Functions App can be scaled independently
- **Cost Optimization**: Pay only for actual function execution
- **Flexibility**: Can reuse the Functions App for other applications