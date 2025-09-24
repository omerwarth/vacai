# Capgemini Hospitality - Azure Cosmos DB with Azure Functions

This Next.js application demonstrates how to integrate Azure Cosmos DB for user authentication functionality using Azure Functions for the backend API.

## Features

- **Azure Cosmos DB Integration**: Connected to Azure Cosmos DB using the official SDK
- **Azure Functions API**: Serverless backend functions for authentication
- **User Authentication**: Sign up and sign in functionality
- **Static Web App**: Optimized for Azure Static Web Apps deployment
- **Modern UI**: Responsive design with Tailwind CSS

## Setup Instructions

### 1. Azure Cosmos DB Setup

1. Create an Azure Cosmos DB account in the Azure portal
2. Create a database called `capgemini-hospitality`
3. The application will automatically create a container called `users` with partition key `/id`
4. Get your Cosmos DB endpoint and primary key from the Azure portal

### 2. Environment Configuration

Update the `.env.local` file for the Next.js app (frontend environment variables):

```env
# These are not used in production since we use Azure Functions
COSMOS_DB_ENDPOINT=https://your-cosmos-db-account.documents.azure.com:443/
COSMOS_DB_KEY=your-primary-key-here
COSMOS_DB_DATABASE_NAME=capgemini-hospitality
COSMOS_DB_CONTAINER_NAME=users
```

Update the `api/local.settings.json` file for local Azure Functions development:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_DB_ENDPOINT": "https://your-cosmos-db-account.documents.azure.com:443/",
    "COSMOS_DB_KEY": "your-primary-key-here",
    "COSMOS_DB_DATABASE_NAME": "capgemini-hospitality",
    "COSMOS_DB_CONTAINER_NAME": "users"
  }
}
```

### 3. Install Dependencies

Install Next.js dependencies:
```bash
npm install
```

Install Azure Functions dependencies:
```bash
cd api
npm install
cd ..
```

### 4. Run the Application

For local development, you need to run both the Next.js app and Azure Functions:

```bash
# Terminal 1 - Run Next.js app
npm run dev

# Terminal 2 - Run Azure Functions
cd api
npm start
```

The Next.js application will be available at `http://localhost:3000`
The Azure Functions will be available at `http://localhost:7071`

## API Endpoints (Azure Functions)

### Authentication
- `POST /api/signup` - Create a new user account
- `POST /api/signin` - Sign in with existing account

### Users
- `GET /api/users` - Get all users (for testing)

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── components/
│       └── AuthPage.tsx
├── api/
│   ├── cosmosdb.ts
│   ├── signup.ts
│   ├── signin.ts
│   ├── users.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── host.json
│   └── local.settings.json
├── staticwebapp.config.json
└── next.config.ts
```

## Deployment to Azure Static Web Apps

1. **Push to GitHub**: Make sure your code is in a GitHub repository
2. **Create Azure Static Web App**: In Azure portal, create a new Static Web App
3. **Configure Build**: Set the following build configuration:
   - **App location**: `/` (root)
   - **API location**: `/api`
   - **Output location**: `out`
4. **Environment Variables**: Add your Cosmos DB credentials in the Azure portal under Configuration
5. **Deploy**: The GitHub Action will automatically build and deploy your app

## Local Development vs Production

- **Local**: Uses `local.settings.json` for Azure Functions environment variables
- **Production**: Uses Azure Static Web Apps configuration settings
- **Frontend**: Next.js static export for optimal performance
- **Backend**: Azure Functions for serverless API endpoints

## Important Notes

- **Security**: This is a demo application. In production, passwords should be hashed using bcrypt or similar
- **Validation**: Additional validation and error handling should be implemented
- **Authentication**: This demo doesn't include JWT tokens or session management
- **CORS**: Configure CORS settings for production deployment

## Dependencies

- `@azure/cosmos` - Azure Cosmos DB SDK
- `next` - Next.js framework
- `react` - React library
- `tailwindcss` - CSS framework