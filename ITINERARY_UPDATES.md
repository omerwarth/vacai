# Itinerary System Updates - Summary

## Issue
Getting 404 errors when trying to fetch or create itineraries because the `itineraries` container doesn't exist in Cosmos DB yet.

## What Was Changed

### 1. Updated Data Model (`src/config/api.ts`)

**Before:** Simple flat structure with string arrays
```typescript
interface Itinerary {
  id: string;
  userId: string;
  title?: string;
  location?: string;
  activity?: string[];
  food?: string[];
  // ... simple fields
}
```

**After:** Rich structured data with detailed arrays
```typescript
interface Flight {
  airline: string;
  flightNumber: string;
  departure: { airport: string; time: string; };
  arrival: { airport: string; time: string; };
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
  type: string; // 'hotel', 'airbnb', 'resort'
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

### 2. Updated PlanningHistory Component

- Updated to use new `destination` field instead of `location`
- Map itinerary `status` to Plan `status` correctly
- Create activities as proper Activity objects instead of strings
- Improved error messages to mention `ITINERARY_API_SPEC.md`

### 3. Created Documentation

#### `ITINERARY_API_SPEC.md`
Complete API specification including:
- Full TypeScript interfaces for all data types
- All CRUD endpoints with request/response examples
- Cosmos DB schema and container setup
- Business logic and validation rules
- Error handling guidelines
- Testing checklist

#### `BACKEND_SETUP.md`
Quick setup guide for backend team:
- Three options to create the container (Portal, Code, CLI)
- Complete Azure Function implementation template
- Testing instructions
- Troubleshooting steps

## Benefits of New Structure

### 1. Cost-Effective Storage
Each itinerary stores arrays of detailed objects, making it a "low-cost array per itinerary" as requested:

```json
{
  "id": "trip-123",
  "flights": [{ ... }, { ... }],      // Array of flight details
  "activities": [{ ... }, { ... }],   // Array of activities
  "accommodations": [{ ... }],        // Array of hotels/stays
  "restaurants": [{ ... }, { ... }]   // Array of dining
}
```

### 2. Rich Data Structure
Instead of storing `activity: ["Scuba Diving", "Museum"]`, you now store:
```json
{
  "name": "Scuba Diving",
  "description": "Full day diving at Nusa Penida",
  "date": "2025-07-03",
  "time": "08:00",
  "location": "Nusa Penida",
  "cost": 150,
  "bookingConfirmation": "DIV789"
}
```

### 3. Ready for AI Integration
The structured format makes it easy for AI assistants to:
- Parse and understand itinerary details
- Make recommendations based on activities
- Calculate total costs
- Check booking confirmations
- Suggest similar experiences

### 4. Flexible and Extensible
- Optional fields allow gradual data entry
- Can track costs per item for budget analysis
- Supports booking confirmations for reference
- Easy to add more fields without breaking existing data

## What Needs to Be Done (Backend)

### Step 1: Create Container
Choose one method from `BACKEND_SETUP.md`:
- Azure Portal (easiest)
- Azure Functions code
- Azure CLI

Container settings:
- **Name**: `itineraries`
- **Partition Key**: `/userId`
- **Throughput**: 400 RU/s

### Step 2: Implement Endpoints
Create Azure Function with 4 operations:
- **GET** `/api/itinerary?userId=X` - List itineraries
- **POST** `/api/itinerary` - Create new itinerary
- **PUT** `/api/itinerary?id=X` - Update itinerary
- **DELETE** `/api/itinerary?id=X&userId=Y` - Delete itinerary

See `BACKEND_SETUP.md` for complete implementation template.

### Step 3: Test
Use the testing section in `BACKEND_SETUP.md` to verify all endpoints work.

## Frontend Integration

The frontend is already updated and ready to use the new structure:

### Creating an Itinerary
```typescript
const newItinerary = {
  userId: user.sub,
  title: "Summer in Bali",
  destination: "Bali, Indonesia",
  startDate: "2025-07-01",
  endDate: "2025-07-10",
  status: "planning",
  budget: 5000,
  currency: "USD",
  flights: [],
  activities: [
    {
      name: "Scuba Diving",
      description: "Full day diving",
    }
  ],
  accommodations: [],
  restaurants: [],
};

await apiService.createItinerary(newItinerary);
```

### Displaying Itineraries
The PlanningHistory component automatically:
- Fetches all itineraries for the logged-in user
- Displays them in a card grid
- Shows budget, dates, and destination
- Allows filtering by time period and budget

## Example Data Flow

1. **User creates itinerary** through PlanningHistory form
2. **Frontend sends** POST request with structured data
3. **Backend stores** in Cosmos DB `itineraries` container
4. **User can later add** flights, activities, hotels, restaurants
5. **AI assistant can read** and make recommendations
6. **Total cost** can be calculated from all item costs

## Testing Without Backend

The frontend has localStorage fallback, so you can:
- Create itineraries locally
- Test the UI and workflow
- See how data is structured

Once backend is ready, it will automatically sync to Cosmos DB.

## Files Changed

1. `src/config/api.ts` - Updated interfaces
2. `src/components/PlanningHistory.tsx` - Updated to use new structure
3. `ITINERARY_API_SPEC.md` - NEW: Complete API documentation
4. `BACKEND_SETUP.md` - NEW: Quick setup guide

## Next Steps

1. **Backend Team**: Follow `BACKEND_SETUP.md` to create container and implement endpoints
2. **Frontend**: Already done! Will work once backend is ready
3. **AI Integration**: Use structured data to enhance Journey Planner
4. **Testing**: Use checklist in `ITINERARY_API_SPEC.md`

## Questions?

- Check `ITINERARY_API_SPEC.md` for detailed API documentation
- Check `BACKEND_SETUP.md` for setup instructions
- The new data structure is in `src/config/api.ts`
