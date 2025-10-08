# Azure Functions API Endpoints for Traveler Profiles

This document outlines the Azure Functions endpoints that need to be implemented in your separate repository to support the traveler profile management system.

## Database Schema (Cosmos DB)

### TravelerProfile Collection
```json
{
  "id": "string", // UUID
  "userId": "string", // Auth0 user ID
  "name": "string", // Display name for the profile
  "relationship": "string", // 'self', 'spouse', 'child', 'friend', etc.
  "isDefault": "boolean", // Whether this is the user's primary profile
  "createdAt": "string", // ISO date string
  "updatedAt": "string", // ISO date string
  "partitionKey": "userId" // For Cosmos DB partitioning
}
```

### TravelPreferences Collection
```json
{
  "id": "string", // UUID
  "userId": "string", // Auth0 user ID who owns this
  "profileId": "string", // Which traveler profile these preferences belong to
  "name": "string", // Traveler's name
  "transportation": "string", // e.g., "🚗 Rental Car"
  "schedule_flexibility": "number", // 1-5 scale
  "accommodation": "string", // e.g., "🏨 Hotel"
  "activities": "array", // Array of strings with emojis
  "dietary_restrictions": "array", // Array of strings with emojis
  "comfort_level": "number", // 1-5 scale
  "trip_length": "string", // e.g., "Short (4-7 days)"
  "trip_vibe": "array", // Array of strings with emojis
  "createdAt": "string", // ISO date string
  "updatedAt": "string", // ISO date string
  "partitionKey": "userId" // For Cosmos DB partitioning
}
```

## Required Azure Functions

### 1. Traveler Profile Management

#### GET `/api/traveler-profiles/{userId}`
- **Purpose**: Get all traveler profiles for a user
- **Response**: 
```json
{
  "profiles": [
    {
      "id": "uuid",
      "userId": "auth0|123",
      "name": "John Doe",
      "relationship": "self",
      "isDefault": true,
      "createdAt": "2025-10-06T12:00:00Z",
      "updatedAt": "2025-10-06T12:00:00Z"
    }
  ]
}
```

#### POST `/api/traveler-profiles`
- **Purpose**: Create a new traveler profile
- **Request Body**:
```json
{
  "userId": "auth0|123",
  "name": "Jane Doe",
  "relationship": "spouse",
  "isDefault": false
}
```
- **Response**:
```json
{
  "profile": {
    "id": "uuid",
    "userId": "auth0|123",
    "name": "Jane Doe",
    "relationship": "spouse",
    "isDefault": false,
    "createdAt": "2025-10-06T12:00:00Z",
    "updatedAt": "2025-10-06T12:00:00Z"
  }
}
```

#### PUT `/api/traveler-profiles/{profileId}`
- **Purpose**: Update an existing traveler profile
- **Request Body**: Partial TravelerProfile object
- **Response**: Updated profile object

#### DELETE `/api/traveler-profiles/{profileId}`
- **Purpose**: Delete a traveler profile (and associated preferences)
- **Response**: Success confirmation

### 2. Travel Preferences Management

#### GET `/api/user-preferences/{userId}`
- **Purpose**: Get all travel preferences for all profiles of a user
- **Response**:
```json
{
  "preferences": [
    {
      "id": "uuid",
      "userId": "auth0|123",
      "profileId": "profile-uuid",
      "name": "John Doe",
      "transportation": "🚗 Rental Car",
      "schedule_flexibility": 3,
      "accommodation": "🏨 Hotel",
      "activities": ["🖼️ Museums & Art", "🍴 Food & Wine"],
      "dietary_restrictions": ["🥓 No Restrictions"],
      "comfort_level": 4,
      "trip_length": "Short (4-7 days)",
      "trip_vibe": ["🌅 Relaxing & Scenic"],
      "createdAt": "2025-10-06T12:00:00Z",
      "updatedAt": "2025-10-06T12:00:00Z"
    }
  ]
}
```

#### GET `/api/user-preferences/{userId}/{profileId}`
- **Purpose**: Get travel preferences for a specific profile
- **Response**: Single preferences object

#### POST `/api/user-preferences`
- **Purpose**: Create/save travel preferences for a profile
- **Request Body**:
```json
{
  "userId": "auth0|123",
  "profileId": "profile-uuid",
  "name": "John Doe",
  "transportation": "🚗 Rental Car",
  "schedule_flexibility": 3,
  "accommodation": "🏨 Hotel",
  "activities": ["🖼️ Museums & Art"],
  "dietary_restrictions": ["🥓 No Restrictions"],
  "comfort_level": 4,
  "trip_length": "Short (4-7 days)",
  "trip_vibe": ["🌅 Relaxing & Scenic"]
}
```

#### PUT `/api/user-preferences/{preferencesId}`
- **Purpose**: Update existing travel preferences
- **Request Body**: Partial TravelPreferences object

#### DELETE `/api/user-preferences/{preferencesId}`
- **Purpose**: Delete travel preferences
- **Response**: Success confirmation

## Error Handling

All endpoints should return appropriate HTTP status codes:
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized
- **404**: Not Found
- **500**: Internal Server Error

Error response format:
```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": "Additional details if applicable"
}
```

## Authentication & Authorization

- Use Auth0 bearer tokens for authentication
- Validate that users can only access their own profiles and preferences
- Extract userId from Auth0 token claims

## Business Logic

### Default Profile Creation
- When a user signs up, automatically create a default profile with:
  - `name`: From user's Auth0 profile or email
  - `relationship`: "self"
  - `isDefault`: true

### Profile Validation
- Users must have at least one profile (cannot delete the last one)
- Only one profile per user can be marked as default
- Profile names should be unique within a user's account

### Preferences Validation
- Validate that slider values are between 1-5
- Ensure required fields are present
- Validate that arrays contain valid options

## Frontend Integration

The frontend is already configured to call these endpoints. The base URL is configured in:
- Development: `http://localhost:7071`
- Production: `https://capgemini-hospitality-api-cfhkgge6a0h6ach6.eastus2-01.azurewebsites.net`

You can override this with the environment variable:
```
NEXT_PUBLIC_AZURE_FUNCTIONS_URL=your-functions-app-url
```

## Testing

Once you implement these endpoints, you can test the functionality by:
1. Using the "Show Profile Manager" button in the debug section
2. Creating new traveler profiles
3. Setting preferences for each profile
4. Verifying data persistence across browser sessions