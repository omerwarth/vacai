# Backend Setup Guide - Itinerary Container

## Problem
The frontend is getting 404 errors when trying to access the `/api/itinerary` endpoint because the **itineraries container** doesn't exist in Cosmos DB yet.

## Error Messages
```
Failed to load resource: the server responded with a status of 404 (Not Found) (itinerary, line 0)
Failed to load itineraries: Error: Failed to fetch itineraries: Not Found
Failed to create itinerary: Error: Failed to create itinerary: Not Found
```

## Solution

### Option 1: Create Container via Azure Portal (Quick)

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your Cosmos DB account
3. Select "Data Explorer"
4. Find your database: `capgemini-hospitality`
5. Click "New Container"
6. Enter the following:
   - **Container id**: `itineraries`
   - **Partition key**: `/userId`
   - **Throughput**: `400` RU/s (or Autoscale: 400-4000)
7. Click "OK"

### Option 2: Create Container via Azure Functions Code

Add this code to your Azure Functions startup/initialization:

```typescript
import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_NAME || "capgemini-hospitality";

const client = new CosmosClient({ endpoint, key });

async function initializeDatabase() {
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  
  // Create itineraries container
  const { container } = await database.containers.createIfNotExists({
    id: "itineraries",
    partitionKey: { paths: ["/userId"] }
  });
  
  console.log("Itineraries container initialized");
}

// Call this on function app startup
initializeDatabase().catch(console.error);
```

### Option 3: Use Azure CLI

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Create the container
az cosmosdb sql container create \
  --account-name YOUR_COSMOS_ACCOUNT_NAME \
  --database-name capgemini-hospitality \
  --name itineraries \
  --partition-key-path /userId \
  --throughput 400
```

## Verify Container Creation

After creating the container, verify it exists:

1. In Azure Portal → Cosmos DB → Data Explorer
2. You should see: `capgemini-hospitality` > `itineraries`
3. The container should be empty initially

## Next Steps

Once the container is created, you need to implement the Azure Functions endpoints. See `ITINERARY_API_SPEC.md` for full API specification.

### Quick Implementation Template

Create a new file `api/itinerary.ts`:

```typescript
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_DB_ENDPOINT!;
const key = process.env.COSMOS_DB_KEY!;
const databaseId = process.env.COSMOS_DB_DATABASE_NAME || "capgemini-hospitality";
const containerId = "itineraries";

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const method = req.method;

  try {
    if (method === "GET") {
      // Get itineraries
      const userId = req.query.userId;
      const profileId = req.query.profileId;

      if (!userId) {
        context.res = {
          status: 400,
          body: { error: "userId is required" },
        };
        return;
      }

      const querySpec = {
        query: profileId
          ? "SELECT * FROM c WHERE c.userId = @userId AND c.profileId = @profileId"
          : "SELECT * FROM c WHERE c.userId = @userId",
        parameters: profileId
          ? [
              { name: "@userId", value: userId },
              { name: "@profileId", value: profileId },
            ]
          : [{ name: "@userId", value: userId }],
      };

      const { resources } = await container.items.query(querySpec).fetchAll();

      context.res = {
        status: 200,
        body: { itineraries: resources },
      };
    } else if (method === "POST") {
      // Create itinerary
      const body = req.body;

      if (!body.userId || !body.title || !body.destination) {
        context.res = {
          status: 400,
          body: { error: "userId, title, and destination are required" },
        };
        return;
      }

      const newItinerary = {
        id: require("crypto").randomUUID(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { resource } = await container.items.create(newItinerary);

      context.res = {
        status: 201,
        body: { itinerary: resource },
      };
    } else if (method === "PUT") {
      // Update itinerary
      const id = req.query.id;
      const updates = req.body;

      if (!id) {
        context.res = {
          status: 400,
          body: { error: "id is required" },
        };
        return;
      }

      // Read existing item
      const { resource: existing } = await container.item(id, updates.userId).read();

      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const { resource } = await container.item(id, updates.userId).replace(updated);

      context.res = {
        status: 200,
        body: { itinerary: resource },
      };
    } else if (method === "DELETE") {
      // Delete itinerary
      const id = req.query.id;
      const userId = req.query.userId;

      if (!id || !userId) {
        context.res = {
          status: 400,
          body: { error: "id and userId are required" },
        };
        return;
      }

      await container.item(id, userId).delete();

      context.res = {
        status: 200,
        body: { success: true, message: "Itinerary deleted successfully" },
      };
    } else {
      context.res = {
        status: 405,
        body: { error: "Method not allowed" },
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log.error("Error:", errorMessage);
    context.res = {
      status: 500,
      body: { error: "Internal server error", details: errorMessage },
    };
  }
};

export default httpTrigger;
```

Create `api/itinerary/function.json`:

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get", "post", "put", "delete"],
      "route": "itinerary"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ],
  "scriptFile": "../dist/itinerary.js"
}
```

## Testing

After deployment, test the endpoints:

```bash
# Test GET (should return empty array initially)
curl "https://capgemini-hospitality-api-cfhkgge6a0h6ach6.eastus2-01.azurewebsites.net/api/itinerary?userId=test-user"

# Test POST
curl -X POST \
  "https://capgemini-hospitality-api-cfhkgge6a0h6ach6.eastus2-01.azurewebsites.net/api/itinerary" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "title": "Test Trip",
    "destination": "Paris",
    "startDate": "2025-06-01",
    "endDate": "2025-06-10",
    "budget": 3000,
    "flights": [],
    "activities": [],
    "accommodations": [],
    "restaurants": []
  }'
```

## Documentation

Full API specification is available in:
- `ITINERARY_API_SPEC.md` - Complete API documentation with all endpoints and data structures

## Support

If you encounter issues:
1. Check Azure Portal → Cosmos DB → Data Explorer to verify container exists
2. Check Azure Functions logs for detailed error messages
3. Verify environment variables are set correctly
4. Ensure CORS is configured for your frontend domain
