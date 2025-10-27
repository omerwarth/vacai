# Azure Functions Implementation Guide - Modernized User Profile System

## Overview

This guide provides step-by-step instructions for implementing the new consolidated user profile system in your Azure Functions backend.

---

## Step 1: Cosmos DB Setup

### Create New Container

```javascript
// In your Cosmos DB setup or via Azure Portal
Container Name: "UserProfiles"
Partition Key: "/userId"
Throughput: Start with 400 RU/s (autoscale recommended)
```

### Connection Setup

```javascript
const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database("HospitalityDB"); // Your database name
const userProfilesContainer = database.container("UserProfiles");
```

---

## Step 2: Helper Functions

Create a new file: `userProfileHelpers.js`

```javascript
const { v4: uuidv4 } = require('uuid');

/**
 * Helper to get user profile from Cosmos DB
 */
async function getUserProfile(container, userId) {
  try {
    const { resource } = await container.item(userId, userId).read();
    return resource;
  } catch (error) {
    if (error.code === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Helper to create a new user profile
 */
async function createUserProfile(container, userId, email, firstName = null, lastName = null) {
  const now = new Date().toISOString();
  
  const userProfile = {
    id: userId,
    userId: userId,
    email: email,
    firstName: firstName,
    lastName: lastName,
    travelers: [
      {
        id: uuidv4(),
        name: firstName && lastName ? `${firstName} ${lastName}` : (firstName || email),
        relationship: "self",
        isDefault: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  const { resource } = await container.items.create(userProfile);
  return resource;
}

/**
 * Helper to update user profile
 */
async function updateUserProfile(container, userId, updates) {
  const existing = await getUserProfile(container, userId);
  if (!existing) {
    throw new Error("User profile not found");
  }

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const { resource } = await container.item(userId, userId).replace(updated);
  return resource;
}

/**
 * Helper to find a traveler by ID
 */
function findTraveler(profile, travelerId) {
  return profile.travelers.find(t => t.id === travelerId);
}

/**
 * Helper to validate traveler can be deleted
 */
function canDeleteTraveler(profile, travelerId) {
  // Can't delete if it's the only traveler
  if (profile.travelers.length <= 1) {
    return { valid: false, reason: "Cannot delete the last traveler" };
  }

  const traveler = findTraveler(profile, travelerId);
  
  // Can't delete the default traveler
  if (traveler && traveler.isDefault) {
    return { valid: false, reason: "Cannot delete the default traveler" };
  }

  return { valid: true };
}

module.exports = {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  findTraveler,
  canDeleteTraveler
};
```

---

## Step 3: New Azure Functions to Create

### Function 1: GET User Profile

**File:** `getUserProfile/index.js`

```javascript
const { CosmosClient } = require("@azure/cosmos");
const { getUserProfile } = require("../shared/userProfileHelpers");

module.exports = async function (context, req) {
  const userId = req.params.userId;

  if (!userId) {
    context.res = {
      status: 400,
      body: { error: "userId is required" }
    };
    return;
  }

  try {
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const container = client.database("HospitalityDB").container("UserProfiles");

    const profile = await getUserProfile(container, userId);

    if (!profile) {
      context.res = {
        status: 404,
        body: { error: "User profile not found" }
      };
      return;
    }

    context.res = {
      status: 200,
      body: profile
    };
  } catch (error) {
    context.log.error("Error fetching user profile:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch user profile", details: error.message }
    };
  }
};
```

**function.json:**
```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get"],
      "route": "user-profile/{userId}"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

### Function 2: POST Create User Profile

**File:** `createUserProfile/index.js`

```javascript
const { CosmosClient } = require("@azure/cosmos");
const { getUserProfile, createUserProfile } = require("../shared/userProfileHelpers");

module.exports = async function (context, req) {
  const { userId, email, firstName, lastName } = req.body;

  if (!userId || !email) {
    context.res = {
      status: 400,
      body: { error: "userId and email are required" }
    };
    return;
  }

  try {
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const container = client.database("HospitalityDB").container("UserProfiles");

    // Check if profile already exists
    const existing = await getUserProfile(container, userId);
    if (existing) {
      context.res = {
        status: 200,
        body: existing // Return existing profile if already created
      };
      return;
    }

    // Create new profile with default "self" traveler
    const profile = await createUserProfile(container, userId, email, firstName, lastName);

    context.res = {
      status: 201,
      body: profile
    };
  } catch (error) {
    context.log.error("Error creating user profile:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to create user profile", details: error.message }
    };
  }
};
```

**function.json:**
```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "user-profile"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

### Function 3: POST Add Traveler

**File:** `addTraveler/index.js`

```javascript
const { CosmosClient } = require("@azure/cosmos");
const { v4: uuidv4 } = require('uuid');
const { getUserProfile } = require("../shared/userProfileHelpers");

module.exports = async function (context, req) {
  const userId = req.params.userId;
  const { name, relationship, isDefault } = req.body;

  if (!userId || !name || !relationship) {
    context.res = {
      status: 400,
      body: { error: "userId, name, and relationship are required" }
    };
    return;
  }

  try {
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const container = client.database("HospitalityDB").container("UserProfiles");

    const profile = await getUserProfile(container, userId);
    if (!profile) {
      context.res = {
        status: 404,
        body: { error: "User profile not found" }
      };
      return;
    }

    // Create new traveler
    const now = new Date().toISOString();
    const newTraveler = {
      id: uuidv4(),
      name: name,
      relationship: relationship,
      isDefault: isDefault || false,
      createdAt: now,
      updatedAt: now
    };

    // Add to travelers array
    profile.travelers.push(newTraveler);
    profile.updatedAt = now;

    // Replace document
    const { resource } = await container.item(userId, userId).replace(profile);

    context.res = {
      status: 200,
      body: resource
    };
  } catch (error) {
    context.log.error("Error adding traveler:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to add traveler", details: error.message }
    };
  }
};
```

**function.json:**
```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "user-profile/{userId}/travelers"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

### Function 4: PUT Update Traveler

**File:** `updateTraveler/index.js`

```javascript
const { CosmosClient } = require("@azure/cosmos");
const { getUserProfile, findTraveler } = require("../shared/userProfileHelpers");

module.exports = async function (context, req) {
  const userId = req.params.userId;
  const travelerId = req.params.travelerId;
  const updates = req.body;

  if (!userId || !travelerId) {
    context.res = {
      status: 400,
      body: { error: "userId and travelerId are required" }
    };
    return;
  }

  try {
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const container = client.database("HospitalityDB").container("UserProfiles");

    const profile = await getUserProfile(container, userId);
    if (!profile) {
      context.res = {
        status: 404,
        body: { error: "User profile not found" }
      };
      return;
    }

    const traveler = findTraveler(profile, travelerId);
    if (!traveler) {
      context.res = {
        status: 404,
        body: { error: "Traveler not found" }
      };
      return;
    }

    // Update traveler fields
    if (updates.name !== undefined) traveler.name = updates.name;
    if (updates.relationship !== undefined) traveler.relationship = updates.relationship;
    if (updates.isDefault !== undefined) traveler.isDefault = updates.isDefault;
    
    traveler.updatedAt = new Date().toISOString();
    profile.updatedAt = new Date().toISOString();

    // Replace document
    const { resource } = await container.item(userId, userId).replace(profile);

    context.res = {
      status: 200,
      body: resource
    };
  } catch (error) {
    context.log.error("Error updating traveler:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to update traveler", details: error.message }
    };
  }
};
```

**function.json:**
```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["put"],
      "route": "user-profile/{userId}/travelers/{travelerId}"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

### Function 5: DELETE Remove Traveler

**File:** `deleteTraveler/index.js`

```javascript
const { CosmosClient } = require("@azure/cosmos");
const { getUserProfile, canDeleteTraveler } = require("../shared/userProfileHelpers");

module.exports = async function (context, req) {
  const userId = req.params.userId;
  const travelerId = req.params.travelerId;

  if (!userId || !travelerId) {
    context.res = {
      status: 400,
      body: { error: "userId and travelerId are required" }
    };
    return;
  }

  try {
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const container = client.database("HospitalityDB").container("UserProfiles");

    const profile = await getUserProfile(container, userId);
    if (!profile) {
      context.res = {
        status: 404,
        body: { error: "User profile not found" }
      };
      return;
    }

    // Validate deletion
    const validation = canDeleteTraveler(profile, travelerId);
    if (!validation.valid) {
      context.res = {
        status: 400,
        body: { error: validation.reason }
      };
      return;
    }

    // Remove traveler from array
    profile.travelers = profile.travelers.filter(t => t.id !== travelerId);
    profile.updatedAt = new Date().toISOString();

    // Replace document
    const { resource } = await container.item(userId, userId).replace(profile);

    context.res = {
      status: 200,
      body: resource
    };
  } catch (error) {
    context.log.error("Error deleting traveler:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to delete traveler", details: error.message }
    };
  }
};
```

**function.json:**
```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["delete"],
      "route": "user-profile/{userId}/travelers/{travelerId}"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

### Function 6: PUT Update Traveler Preferences

**File:** `updateTravelerPreferences/index.js`

```javascript
const { CosmosClient } = require("@azure/cosmos");
const { getUserProfile, findTraveler } = require("../shared/userProfileHelpers");

module.exports = async function (context, req) {
  const userId = req.params.userId;
  const travelerId = req.params.travelerId;
  const preferences = req.body;

  if (!userId || !travelerId) {
    context.res = {
      status: 400,
      body: { error: "userId and travelerId are required" }
    };
    return;
  }

  // Validate preferences
  if (!preferences || typeof preferences !== 'object') {
    context.res = {
      status: 400,
      body: { error: "Valid preferences object is required" }
    };
    return;
  }

  try {
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const container = client.database("HospitalityDB").container("UserProfiles");

    const profile = await getUserProfile(container, userId);
    if (!profile) {
      context.res = {
        status: 404,
        body: { error: "User profile not found" }
      };
      return;
    }

    const traveler = findTraveler(profile, travelerId);
    if (!traveler) {
      context.res = {
        status: 404,
        body: { error: "Traveler not found" }
      };
      return;
    }

    // Validate preference values
    if (preferences.schedule_flexibility !== undefined) {
      const val = preferences.schedule_flexibility;
      if (typeof val !== 'number' || val < 1 || val > 5) {
        context.res = {
          status: 400,
          body: { error: "schedule_flexibility must be between 1 and 5" }
        };
        return;
      }
    }

    if (preferences.comfort_level !== undefined) {
      const val = preferences.comfort_level;
      if (typeof val !== 'number' || val < 1 || val > 5) {
        context.res = {
          status: 400,
          body: { error: "comfort_level must be between 1 and 5" }
        };
        return;
      }
    }

    // Set preferences on traveler
    traveler.preferences = {
      transportation: preferences.transportation || "",
      schedule_flexibility: preferences.schedule_flexibility || 3,
      accommodation: preferences.accommodation || "",
      activities: preferences.activities || [],
      dietary_restrictions: preferences.dietary_restrictions || [],
      comfort_level: preferences.comfort_level || 3,
      trip_length: preferences.trip_length || "",
      trip_vibe: preferences.trip_vibe || []
    };

    traveler.updatedAt = new Date().toISOString();
    profile.updatedAt = new Date().toISOString();

    // Replace document
    const { resource } = await container.item(userId, userId).replace(profile);

    context.res = {
      status: 200,
      body: resource
    };
  } catch (error) {
    context.log.error("Error updating traveler preferences:", error);
    context.res = {
      status: 500,
      body: { error: "Failed to update traveler preferences", details: error.message }
    };
  }
};
```

**function.json:**
```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["put"],
      "route": "user-profile/{userId}/travelers/{travelerId}/preferences"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

## Step 4: Modify Existing Functions

### Modify `signup` Function

Update your signup function to create a UserProfile after successful signup:

```javascript
// In your signup/index.js

// After successful user creation in Auth0:
const { createUserProfile } = require("../shared/userProfileHelpers");

// ... existing signup code ...

try {
  // Your existing Auth0 signup logic here
  
  // After successful signup, create user profile
  const container = client.database("HospitalityDB").container("UserProfiles");
  const profile = await createUserProfile(
    container,
    newUser.user_id, // Auth0 user ID
    email,
    firstName,
    lastName
  );
  
  context.res = {
    status: 201,
    body: {
      message: "User created successfully",
      userId: newUser.user_id,
      profile: profile
    }
  };
} catch (error) {
  // error handling
}
```

---

## Step 5: Functions to Keep (Legacy Support)

### Keep These Functions During Migration:

1. `GET /api/traveler-profiles/{userId}` - Keep for backward compatibility
2. `POST /api/traveler-profiles` - Keep for backward compatibility
3. `PUT /api/traveler-profiles/{profileId}` - Keep for backward compatibility
4. `DELETE /api/traveler-profiles/{profileId}` - Keep for backward compatibility
5. `GET /api/user-preferences/{userId}` - Keep for backward compatibility
6. `POST /api/user-preferences` - Keep for backward compatibility
7. `PUT /api/user-preferences/{preferencesId}` - Keep for backward compatibility
8. `DELETE /api/user-preferences/{preferencesId}` - Keep for backward compatibility

### Add Deprecation Headers:

```javascript
context.res = {
  status: 200,
  headers: {
    "X-Deprecated": "true",
    "X-Deprecation-Message": "Use /api/user-profile endpoints instead"
  },
  body: result
};
```

---

## Step 6: Functions to Eventually Delete

After migration is complete and tested (give it 2-4 weeks), you can delete:

- All `/api/traveler-profiles/*` functions
- All `/api/user-preferences/*` functions
- Old `TravelerProfile` and `TravelPreferences` Cosmos DB containers

---

## Testing Checklist

### Test New Endpoints:

```bash
# 1. Create user profile
curl -X POST http://localhost:7071/api/user-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "auth0|test123",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'

# 2. Get user profile
curl http://localhost:7071/api/user-profile/auth0|test123

# 3. Add traveler
curl -X POST http://localhost:7071/api/user-profile/auth0|test123/travelers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "relationship": "spouse",
    "isDefault": false
  }'

# 4. Update traveler preferences
curl -X PUT http://localhost:7071/api/user-profile/auth0|test123/travelers/{travelerId}/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "transportation": "Rental Car",
    "schedule_flexibility": 3,
    "accommodation": "Hotel",
    "activities": ["Museums", "Food & Wine"],
    "dietary_restrictions": ["No Restrictions"],
    "comfort_level": 4,
    "trip_length": "Short (4-7 days)",
    "trip_vibe": ["Relaxing"]
  }'

# 5. Update traveler info
curl -X PUT http://localhost:7071/api/user-profile/auth0|test123/travelers/{travelerId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith"
  }'

# 6. Delete traveler
curl -X DELETE http://localhost:7071/api/user-profile/auth0|test123/travelers/{travelerId}
```

---

## Deployment Steps

1. **Create UserProfiles container** in Cosmos DB
2. **Deploy helper functions** (`userProfileHelpers.js` to `shared/` folder)
3. **Deploy all 6 new functions** (getUserProfile, createUserProfile, addTraveler, updateTraveler, deleteTraveler, updateTravelerPreferences)
4. **Update signup function** to create UserProfile
5. **Test thoroughly** in development
6. **Deploy to staging** for validation
7. **Update frontend** to use new API methods
8. **Monitor** for errors
9. **Run migration script** for existing data
10. **After 2-4 weeks**, deprecate old functions

---

## Summary

**Functions to CREATE:** 6 new functions  
**Functions to MODIFY:** 1 (signup)  
**Functions to KEEP:** 9 (legacy endpoints)  
**Functions to DELETE (later):** 9 (after migration)  

**Key Pattern:** All new functions follow "read → modify → replace" pattern on a single UserProfile document.
