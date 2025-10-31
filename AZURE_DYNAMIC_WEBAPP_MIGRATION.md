# Azure Dynamic Web App (App Service) Migration

This document outlines the migration from Azure Static Web Apps to Azure App Service (Dynamic Web App) for better server-side rendering and API integration.

## Azure App Service Setup

### 1. Create Azure App Service

```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create --name your-resource-group --location "East US"

# Create App Service Plan
az appservice plan create --name your-app-service-plan --resource-group your-resource-group --sku B1 --is-linux

# Create Web App
az webapp create --resource-group your-resource-group --plan your-app-service-plan --name your-app-name --runtime "NODE:20-lts"
```

### 2. Configure App Service Settings

```bash
# Set Node.js version
az webapp config appsettings set --resource-group your-resource-group --name your-app-name --settings WEBSITE_NODE_DEFAULT_VERSION="~20"

# Set startup command
az webapp config set --resource-group your-resource-group --name your-app-name --startup-file "npm start"

# Configure environment variables
az webapp config appsettings set --resource-group your-resource-group --name your-app-name --settings \
  NODE_ENV="production" \
  NEXT_PUBLIC_AUTH0_DOMAIN="your-auth0-domain" \
  NEXT_PUBLIC_AUTH0_CLIENT_ID="your-auth0-client-id" \
  NEXT_PUBLIC_AUTH0_AUDIENCE="your-auth0-audience" \
  NEXT_PUBLIC_AZURE_FUNCTIONS_URL="your-functions-url"
```

### 3. GitHub Actions Setup

1. **Get Publish Profile:**
   ```bash
   az webapp deployment list-publishing-profiles --resource-group your-resource-group --name your-app-name --xml
   ```

2. **Add GitHub Secrets:**
   - Go to your GitHub repository settings
   - Navigate to "Secrets and variables" > "Actions"
   - Add the following secrets:
     - `AZURE_WEBAPP_PUBLISH_PROFILE`: Paste the publish profile XML
     - `NEXT_PUBLIC_AUTH0_DOMAIN`: Your Auth0 domain
     - `NEXT_PUBLIC_AUTH0_CLIENT_ID`: Your Auth0 client ID
     - `NEXT_PUBLIC_AUTH0_AUDIENCE`: Your Auth0 audience
     - `NEXT_PUBLIC_AZURE_FUNCTIONS_URL`: Your Azure Functions URL

3. **Update Workflow Variables:**
   - Edit `.github/workflows/azure-webapps-node.yml`
   - Update `AZURE_WEBAPP_NAME` to your actual app service name

## Key Differences from Static Web Apps

### Benefits of Dynamic Web Apps:
1. **Server-Side Rendering (SSR)**: Better SEO and initial page load performance
2. **API Routes**: Built-in API capabilities with Next.js API routes
3. **Environment Variables**: Server-side environment variables for sensitive data
4. **Custom Server Logic**: Ability to run custom server-side logic
5. **Database Connections**: Direct database connections from the server
6. **Authentication**: Better integration with Auth0 and other auth providers

### Configuration Changes:
- Removed `output: 'export'` from Next.js config to enable SSR
- Added startup configuration for Azure App Service
- Updated GitHub Actions workflow for proper deployment
- Environment variables now support server-side rendering

## Deployment Process

1. **Automatic Deployment**: Every push to `main` branch triggers deployment
2. **Build Process**: 
   - Install dependencies in `capgemini-hospitality` folder
   - Build Next.js application
   - Create deployment package with all necessary files
3. **Deploy**: Deploy to Azure App Service using publish profile

## Testing

After deployment, verify:
1. Application loads correctly
2. SSR is working (check page source for rendered content)
3. API routes respond properly
4. Auth0 integration works
5. Environment variables are accessible

## Troubleshooting

- **Check Application Logs**: Use Azure Portal or Azure CLI to view logs
- **Verify Environment Variables**: Ensure all required env vars are set
- **Test Locally**: Use `npm run dev` to test locally before deployment
- **Build Verification**: Ensure `npm run build` succeeds locally

## Monitoring

Set up Application Insights for monitoring:
```bash
az monitor app-insights component create --app your-app-insights --location "East US" --resource-group your-resource-group
```

Then configure the connection string in App Service settings.