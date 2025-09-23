# Capgemini Hospitality - Azure Cosmos DB Integration

This Next.js application demonstrates how to integrate Azure Cosmos DB for user authentication functionality.

## Features

- **Azure Cosmos DB Integration**: Connected to Azure Cosmos DB using the official SDK
- **User Authentication**: Sign up and sign in functionality
- **Modern UI**: Responsive design with Tailwind CSS
- **API Routes**: RESTful API endpoints for authentication and user management

## Setup Instructions

### 1. Azure Cosmos DB Setup

1. Create an Azure Cosmos DB account in the Azure portal
2. Create a database called `capgemini-hospitality`
3. The application will automatically create a container called `users` with partition key `/id`
4. Get your Cosmos DB endpoint and primary key from the Azure portal

### 2. Environment Configuration

Update the `.env.local` file with your Azure Cosmos DB credentials:

```env
COSMOS_DB_ENDPOINT=https://your-cosmos-db-account.documents.azure.com:443/
COSMOS_DB_KEY=your-primary-key-here
COSMOS_DB_DATABASE_NAME=capgemini-hospitality
COSMOS_DB_CONTAINER_NAME=users
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/signin` - Sign in with existing account

### Users
- `GET /api/users` - Get all users (for testing)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signin/route.ts
│   │   │   └── signup/route.ts
│   │   └── users/route.ts
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   └── AuthPage.tsx
└── lib/
    └── cosmosdb.ts
```

## Testing the Integration

1. **Sign Up**: Create a new user account - this will create a new document in Cosmos DB
2. **Sign In**: Sign in with the created account - this will query and update the user document
3. **View Users**: Visit `/api/users` to see all created users (passwords are excluded)

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