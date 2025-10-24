# Itinerary API Specification

## Overview
This document specifies the Azure Functions API endpoints for managing travel itineraries with detailed flight, activity, accommodation, and restaurant information.

## Database Schema (Cosmos DB)

### Itinerary Container

**Container Name**: `itineraries`  
**Partition Key**: `/userId`

```json
{
  "id": "uuid",
  "userId": "auth0|123",
  "profileId": "uuid",
  "title": "Summer Vacation in Bali",
  "destination": "Bali, Indonesia",
  "startDate": "2025-07-01",
  "endDate": "2025-07-10",
  "status": "booked",
  "budget": 5000,
  "currency": "USD",
  "flights": [
    {
      "airline": "Singapore Airlines",
      "flightNumber": "SQ452",
      "departure": {
        "airport": "JFK",
        "time": "2025-07-01T22:30:00Z"
      },
      "arrival": {
        "airport": "DPS",
        "time": "2025-07-02T18:45:00Z"
      },
      "seat": "23A",
      "confirmation": "ABC123",
      "cost": 1200
    }
  ],
  "activities": [
    {
      "name": "Scuba Diving",
      "description": "Full day diving at Nusa Penida",
      "date": "2025-07-03",
      "time": "08:00",
      "location": "Nusa Penida",
      "cost": 150,
      "bookingConfirmation": "DIV789"
    }
  ],
  "accommodations": [
    {
      "name": "Ubud Resort & Spa",
      "type": "resort",
      "checkIn": "2025-07-02",
      "checkOut": "2025-07-10",
      "address": "Jl. Raya Ubud, Bali",
      "confirmation": "HOT456",
      "cost": 2000
    }
  ],
  "restaurants": [
    {
      "name": "Mozaic Restaurant",
      "cuisine": "French-Indonesian Fusion",
      "date": "2025-07-05",
      "time": "19:00",
      "address": "Jl. Raya Sanggingan, Ubud",
      "reservationConfirmation": "RES321",
      "cost": 180
    }
  ],
  "notes": "Don't forget travel insurance",
  "createdAt": "2025-10-24T12:00:00Z",
  "updatedAt": "2025-10-24T12:00:00Z"
}
```

## TypeScript Interfaces

```typescript
interface Flight {
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
  };
  arrival: {
    airport: string;
    time: string;
  };
  seat?: string;
  confirmation?: string;
  cost?: number;
}

interface Activity {
  name: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  cost?: number;
  bookingConfirmation?: string;
}

interface Accommodation {
  name: string;
  type: string; // 'hotel', 'airbnb', 'resort', etc.
  checkIn: string;
  checkOut: string;
  address?: string;
  confirmation?: string;
  cost?: number;
}

interface Restaurant {
  name: string;
  cuisine?: string;
  date?: string;
  time?: string;
  address?: string;
  reservationConfirmation?: string;
  cost?: number;
}

interface Itinerary {
  id: string;
  userId: string;
  profileId?: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status?: 'planning' | 'booked' | 'completed' | 'cancelled';
  budget?: number;
  currency?: string;
  flights?: Flight[];
  activities?: Activity[];
  accommodations?: Accommodation[];
  restaurants?: Restaurant[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## API Endpoints

### 1. Get Itineraries

**GET** `/api/itinerary?userId={userId}&profileId={profileId}`

Query Parameters:
- `userId` (required): The Auth0 user ID
- `profileId` (optional): Filter by specific traveler profile

Response:
```json
{
  "itineraries": [
    {
      "id": "uuid",
      "userId": "auth0|123",
      "title": "Summer Vacation in Bali",
      "destination": "Bali, Indonesia",
      "startDate": "2025-07-01",
      "endDate": "2025-07-10",
      "status": "booked",
      "budget": 5000,
      "flights": [...],
      "activities": [...],
      "accommodations": [...],
      "restaurants": [...],
      "createdAt": "2025-10-24T12:00:00Z",
      "updatedAt": "2025-10-24T12:00:00Z"
    }
  ]
}
```

### 2. Create Itinerary

**POST** `/api/itinerary`

Request Body:
```json
{
  "userId": "auth0|123",
  "profileId": "uuid",
  "title": "Summer Vacation in Bali",
  "destination": "Bali, Indonesia",
  "startDate": "2025-07-01",
  "endDate": "2025-07-10",
  "status": "planning",
  "budget": 5000,
  "currency": "USD",
  "flights": [],
  "activities": [],
  "accommodations": [],
  "restaurants": [],
  "notes": ""
}
```

Response:
```json
{
  "itinerary": {
    "id": "generated-uuid",
    "userId": "auth0|123",
    "title": "Summer Vacation in Bali",
    "destination": "Bali, Indonesia",
    "startDate": "2025-07-01",
    "endDate": "2025-07-10",
    "status": "planning",
    "budget": 5000,
    "currency": "USD",
    "flights": [],
    "activities": [],
    "accommodations": [],
    "restaurants": [],
    "notes": "",
    "createdAt": "2025-10-24T12:00:00Z",
    "updatedAt": "2025-10-24T12:00:00Z"
  }
}
```

### 3. Update Itinerary

**PUT** `/api/itinerary?id={itineraryId}`

Query Parameters:
- `id` (required): The itinerary ID

Request Body (partial update):
```json
{
  "title": "Updated Title",
  "flights": [
    {
      "airline": "Singapore Airlines",
      "flightNumber": "SQ452",
      "departure": {
        "airport": "JFK",
        "time": "2025-07-01T22:30:00Z"
      },
      "arrival": {
        "airport": "DPS",
        "time": "2025-07-02T18:45:00Z"
      }
    }
  ],
  "activities": [
    {
      "name": "Scuba Diving",
      "date": "2025-07-03",
      "cost": 150
    }
  ]
}
```

Response:
```json
{
  "itinerary": {
    "id": "uuid",
    "userId": "auth0|123",
    "title": "Updated Title",
    "destination": "Bali, Indonesia",
    "startDate": "2025-07-01",
    "endDate": "2025-07-10",
    "flights": [...],
    "activities": [...],
    "updatedAt": "2025-10-24T13:00:00Z"
  }
}
```

### 4. Delete Itinerary

**DELETE** `/api/itinerary?id={itineraryId}&userId={userId}`

Query Parameters:
- `id` (required): The itinerary ID
- `userId` (required): The user ID for authorization

Response:
```json
{
  "success": true,
  "message": "Itinerary deleted successfully"
}
```

## Implementation Notes

### Cosmos DB Setup

1. Create container in Azure Portal:
   ```bash
   Container Name: itineraries
   Partition Key: /userId
   Throughput: 400 RU/s (or autoscale)
   ```

2. Or use Azure Functions code to auto-create:
   ```typescript
   const { container } = await database.containers.createIfNotExists({
     id: 'itineraries',
     partitionKey: '/userId'
   });
   ```

### Business Logic

1. **Validation**:
   - Ensure userId matches authenticated user
   - Validate date formats (ISO 8601)
   - Ensure startDate < endDate
   - Validate status enum values

2. **Cost Calculation**:
   - Consider auto-calculating total cost from flights + activities + accommodations + restaurants
   - Compare against budget field

3. **Authorization**:
   - Users can only access their own itineraries
   - Validate userId from Auth0 token

### Error Handling

Standard error responses:
```json
{
  "error": "Description of error",
  "code": "ERROR_CODE",
  "details": "Additional information"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Frontend Integration

The frontend is already configured to call these endpoints:
- Base URL: `https://capgemini-hospitality-api-cfhkgge6a0h6ach6.eastus2-01.azurewebsites.net`
- Endpoint: `/api/itinerary`

Frontend API service methods are defined in:
- `src/config/api.ts`

## Testing Checklist

- [ ] Create itinerary container in Cosmos DB
- [ ] Test GET endpoint with no itineraries
- [ ] Test POST to create new itinerary
- [ ] Test GET to retrieve created itinerary
- [ ] Test PUT to update itinerary with flights
- [ ] Test PUT to add activities
- [ ] Test PUT to add accommodations
- [ ] Test PUT to add restaurants
- [ ] Test DELETE endpoint
- [ ] Verify authorization (user can only access own data)
- [ ] Test with multiple profiles
- [ ] Test date validation
- [ ] Test cost aggregation

## Migration from Old Schema

If you have existing itineraries with the old schema, you can migrate them:

```typescript
// Old schema fields mapping to new schema
{
  location -> destination,
  activity (string[]) -> activities (Activity[]),
  food/restaurants (string[]) -> restaurants (Restaurant[]),
  accommodation/hotel -> accommodations (Accommodation[]),
  airplane/seat -> flights (Flight[])
}
```
