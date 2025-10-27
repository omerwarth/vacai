# Azure Functions API Endpoints for User Profiles

This document outlines the Azure Functions endpoints for the **modernized user profile management system**.

## Modernized Architecture (October 2025)

The system has been refactored to use a **single Cosmos DB container** for user profiles, following Azure Cosmos DB best practices:

### Benefits:
- ✅ **Single container** reduces complexity and costs
- ✅ **Embedded data model** keeps related information together
- ✅ **Array-based travelers** - no additional RU costs
- ✅ **Better query performance** - single partition reads
- ✅ **Simplified API surface** - fewer endpoints to maintain

## Database Schema (Cosmos DB)

### UserProfile Collection (Single Container)

Partition Key: `userId`

```json
{
  "id": "auth0|123", // Same as userId for 1:1 relationship
  "userId": "auth0|123", // Auth0 user ID - used as partition key
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "travelers": [
    {
      "id": "traveler-uuid-1",
      "name": "John Doe",
      "relationship": "self",
      "isDefault": true,
      "preferences": {
        "transportation": "Rental Car",
        "schedule_flexibility": 3,
        "accommodation": "Hotel",
        "activities": ["Museums & Art", "Food & Wine"],
        "dietary_restrictions": ["No Restrictions"],
        "comfort_level": 4,
        "trip_length": "Short (4-7 days)",
        "trip_vibe": ["Relaxing & Scenic"]
      },
      "createdAt": "2025-10-26T12:00:00Z",
      "updatedAt": "2025-10-26T12:00:00Z"
    },
    {
      "id": "traveler-uuid-2",
      "name": "Jane Doe",
      "relationship": "spouse",
      "isDefault": false,
      "preferences": {
        "transportation": "Public Transit",
        "schedule_flexibility": 4,
        "accommodation": "Boutique Hotel",
        "activities": ["Shopping", "Spa & Wellness"],
        "dietary_restrictions": ["Vegetarian"],
        "comfort_level": 5,
        "trip_length": "Medium (8-14 days)",
        "trip_vibe": ["Luxury & Pampering"]
      },
      "createdAt": "2025-10-26T12:00:00Z",
      "updatedAt": "2025-10-26T12:00:00Z"
    }
  ],
  "createdAt": "2025-10-26T12:00:00Z",
  "updatedAt": "2025-10-26T12:00:00Z"
}
```

### Data Model Explanation

- **UserProfile**: Top-level document (one per user)
  - Stored with `id` = `userId` for easy lookups
  - Contains user account information
  
- **Travelers Array**: Embedded array of travelers
  - Each user manages multiple travelers (self + family/friends)
  - Each traveler can have their own preferences
  - No additional RU cost for array storage
  
- **Preferences**: Nested object within each traveler
  - Optional - set during onboarding
  - Contains all travel preferences for that specific traveler

## API Endpoints

### 1. User Profile Management

#### GET `/api/user-profile/{userId}`
- **Purpose**: Get the complete user profile with all travelers and preferences
- **Response**: 
```json
{
  "id": "auth0|123",
  "userId": "auth0|123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "travelers": [
    {
      "id": "traveler-uuid-1",
      "name": "John Doe",
      "relationship": "self",
      "isDefault": true,
      "preferences": { ... },
      "createdAt": "2025-10-26T12:00:00Z",
      "updatedAt": "2025-10-26T12:00:00Z"
    }
  ],
  "createdAt": "2025-10-26T12:00:00Z",
  "updatedAt": "2025-10-26T12:00:00Z"
}
```

#### POST `/api/user-profile`
- **Purpose**: Create a new user profile (called after signup)
- **Request Body**:
```json
{
  "userId": "auth0|123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Response**: Complete UserProfile object with default "self" traveler
- **Note**: Automatically creates a default traveler with relationship="self"

### 2. Traveler Management (within User Profile)

#### POST `/api/user-profile/{userId}/travelers`
- **Purpose**: Add a new traveler to the user's profile
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "relationship": "spouse",
  "isDefault": false
}
```
- **Response**: Updated UserProfile object with new traveler added

#### PUT `/api/user-profile/{userId}/travelers/{travelerId}`
- **Purpose**: Update a traveler's basic information
- **Request Body**:
```json
{
  "name": "Jane Smith",
  "relationship": "spouse"
}
```
- **Response**: Updated UserProfile object

#### DELETE `/api/user-profile/{userId}/travelers/{travelerId}`
- **Purpose**: Remove a traveler from the profile
- **Response**: Updated UserProfile object
- **Validation**: Cannot delete the last remaining traveler or the default traveler

### 3. Traveler Preferences Management

#### PUT `/api/user-profile/{userId}/travelers/{travelerId}/preferences`
- **Purpose**: Set or update preferences for a specific traveler
- **Request Body**:
```json
{
  "transportation": "Rental Car",
  "schedule_flexibility": 3,
  "accommodation": "Hotel",
  "activities": ["Museums & Art", "Food & Wine"],
  "dietary_restrictions": ["No Restrictions"],
  "comfort_level": 4,
  "trip_length": "Short (4-7 days)",
  "trip_vibe": ["Relaxing & Scenic"]
}
```
- **Response**: Updated UserProfile object
- **Response**: Updated UserProfile object

## Implementation Guidelines for Azure Functions

### Cosmos DB Setup

1. **Container Name**: `UserProfiles`
2. **Partition Key**: `/userId`
3. **Indexing Policy**: Default (automatic indexing)
4. **Why this works well**:
   - All data for a user is in one partition (fast, cheap queries)
   - Arrays have no additional RU cost
   - Single document updates are atomic
   - Simpler to maintain than multiple containers

### Azure Function Implementation Tips

#### Cosmos DB SDK Usage
```javascript
const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database("HospitalityDB");
const container = database.container("UserProfiles");

// Get user profile (single partition read - very efficient)
async function getUserProfile(userId) {
  const { resource } = await container.item(userId, userId).read();
  return resource;
}

// Update user profile atomically
async function updateUserProfile(userId, updates) {
  const { resource: existing } = await container.item(userId, userId).read();
  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  const { resource } = await container.item(userId, userId).replace(updated);
  return resource;
}

// Add a traveler
async function addTraveler(userId, travelerData) {
  const profile = await getUserProfile(userId);
  const newTraveler = {
    id: generateUUID(),
    ...travelerData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  profile.travelers.push(newTraveler);
  profile.updatedAt = new Date().toISOString();
  const { resource } = await container.item(userId, userId).replace(profile);
  return resource;
}

// Update traveler preferences
async function updateTravelerPreferences(userId, travelerId, preferences) {
  const profile = await getUserProfile(userId);
  const traveler = profile.travelers.find(t => t.id === travelerId);
  if (!traveler) throw new Error("Traveler not found");
  
  traveler.preferences = preferences;
  traveler.updatedAt = new Date().toISOString();
  profile.updatedAt = new Date().toISOString();
  
  const { resource } = await container.item(userId, userId).replace(profile);
  return resource;
}
```

### Error Handling

All endpoints should return appropriate HTTP status codes:
- **200**: Success
- **201**: Created (for POST /api/user-profile)
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

### Authentication & Authorization

- Use Auth0 bearer tokens for authentication
- Validate that users can only access their own profile (userId match)
- Extract userId from Auth0 token claims

### Business Logic & Validation

#### User Profile Creation
- When a user signs up, automatically create a UserProfile with:
  - `id` = `userId` (for 1:1 mapping)
  - Default traveler with `relationship: "self"` and `isDefault: true`
  - User's email, firstName, lastName from signup data

#### Traveler Validation
- Users must have at least one traveler (cannot delete the last one)
- Only one traveler per user can be marked as default
- Traveler names should be unique within a user's profile
- Cannot delete a traveler that has associated itineraries (optional - depends on business rules)

#### Preferences Validation
- Validate that slider values are between 1-5
- Ensure required fields are present
- Validate that arrays contain valid options
- Strip emojis from preference values before storage

#### Data Size Considerations
- Each UserProfile document should stay well under 2MB
- Monitor document size if users have many travelers
- Typical document size: ~5-10KB per traveler
- Safe limit: ~200 travelers per user (unlikely to be reached)

---

## Migration from Legacy System

If you have existing data in separate `TravelerProfile` and `TravelPreferences` containers:

### Migration Strategy

1. **Create new UserProfiles container**
2. **Run migration script** to:
   - Group TravelerProfiles by userId
   - Match TravelPreferences to travelers by profileId
   - Create consolidated UserProfile documents
3. **Update frontend** to use new API endpoints
4. **Test thoroughly** in staging environment
5. **Deploy and monitor**
6. **Archive old containers** after validation period

### Migration Script Pseudocode

```javascript
async function migrateToConsolidatedModel() {
  const users = await getUserIds(); // Get all unique userIds
  
  for (const userId of users) {
    // Get all profiles for this user
    const profiles = await queryTravelerProfiles(userId);
    
    // Get all preferences for this user
    const preferences = await queryTravelPreferences(userId);
    
    // Build travelers array
    const travelers = profiles.map(profile => {
      const prefs = preferences.find(p => p.profileId === profile.id);
      return {
        id: profile.id,
        name: profile.name,
        relationship: profile.relationship,
        isDefault: profile.isDefault,
        preferences: prefs ? {
          transportation: prefs.transportation,
          schedule_flexibility: prefs.schedule_flexibility,
          accommodation: prefs.accommodation,
          activities: prefs.activities,
          dietary_restrictions: prefs.dietary_restrictions,
          comfort_level: prefs.comfort_level,
          trip_length: prefs.trip_length,
          trip_vibe: prefs.trip_vibe
        } : undefined,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };
    });
    
    // Create consolidated user profile
    const userProfile = {
      id: userId,
      userId: userId,
      email: await getUserEmail(userId),
      firstName: await getUserFirstName(userId),
      lastName: await getUserLastName(userId),
      travelers: travelers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert into new container
    await createUserProfile(userProfile);
  }
}
```

---

## Legacy API Endpoints (Deprecated)

**These endpoints are maintained for backward compatibility during migration.**
**New implementations should use the consolidated `/api/user-profile` endpoints above.**

### GET `/api/traveler-profiles/{userId}` - DEPRECATED
### POST `/api/traveler-profiles` - DEPRECATED  
### PUT `/api/traveler-profiles/{profileId}` - DEPRECATED
### DELETE `/api/traveler-profiles/{profileId}` - DEPRECATED
### GET `/api/user-preferences/{userId}` - DEPRECATED
### GET `/api/user-preferences/{userId}/{profileId}` - DEPRECATED
### POST `/api/user-preferences` - DEPRECATED
### PUT `/api/user-preferences/{preferencesId}` - DEPRECATED
### DELETE `/api/user-preferences/{preferencesId}` - DEPRECATED

---

## Frontend Integration

The frontend is configured to call these endpoints. The base URL is configured in:
- Development: `http://localhost:7071`
- Production: `https://capgemini-hospitality-api-cfhkgge6a0h6ach6.eastus2-01.azurewebsites.net`

You can override this with the environment variable:
```
NEXT_PUBLIC_AZURE_FUNCTIONS_URL=your-functions-app-url
```

## Testing

Once you implement these endpoints, you can test the functionality by:
1. Sign up a new user or sign in with an existing account
2. The system should automatically create a UserProfile with a default "self" traveler
3. Use the "Show Profile Manager" to add additional travelers
4. Set preferences for each traveler via the onboarding flow
5. Verify all data persists across browser sessions
6. Test that travelers can be edited and deleted
7. Verify that itineraries can be associated with specific travelers