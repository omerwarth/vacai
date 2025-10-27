# 🏖️ Itinerary System - Quick Start

## 🔴 The Problem You're Seeing

```
[Error] Failed to load resource: the server responded with a status of 404 (Not Found) (itinerary, line 0)
```

**Why?** The `itineraries` container doesn't exist in Cosmos DB yet.

## ✅ The Solution

### For Backend Team (5 minutes)

**Quick Fix - Create Container in Azure Portal:**

1. Go to [Azure Portal](https://portal.azure.com)
2. Open your Cosmos DB account
3. Go to Data Explorer
4. Click "New Container"
5. Fill in:
   - Container id: `itineraries`
   - Partition key: `/userId`
   - Throughput: `400` RU/s
6. Click OK

**Then implement the API** - see full template in [`BACKEND_SETUP.md`](./BACKEND_SETUP.md)

---

### For Frontend (Already Done! ✨)

The frontend code is already updated and ready to work once the backend is set up.

## 📊 What Changed

### Before (Simple Strings)
```typescript
{
  id: "123",
  title: "Bali Trip",
  activity: ["diving", "temple visit"],  // ❌ Just strings
  food: ["restaurant1", "restaurant2"]   // ❌ No details
}
```

### After (Rich Structured Data)
```typescript
{
  id: "123",
  title: "Summer in Bali",
  destination: "Bali, Indonesia",
  startDate: "2025-07-01",
  endDate: "2025-07-10",
  budget: 5000,
  currency: "USD",
  
  flights: [
    {
      airline: "Singapore Airlines",
      flightNumber: "SQ452",
      departure: { airport: "JFK", time: "2025-07-01T22:30:00Z" },
      arrival: { airport: "DPS", time: "2025-07-02T18:45:00Z" },
      seat: "23A",
      cost: 1200
    }
  ],
  
  activities: [
    {
      name: "Scuba Diving",
      description: "Full day diving at Nusa Penida",
      date: "2025-07-03",
      time: "08:00",
      location: "Nusa Penida",
      cost: 150,
      bookingConfirmation: "DIV789"
    }
  ],
  
  accommodations: [
    {
      name: "Ubud Resort & Spa",
      type: "resort",
      checkIn: "2025-07-02",
      checkOut: "2025-07-10",
      cost: 2000,
      confirmation: "HOT456"
    }
  ],
  
  restaurants: [
    {
      name: "Mozaic Restaurant",
      cuisine: "French-Indonesian Fusion",
      date: "2025-07-05",
      time: "19:00",
      cost: 180,
      reservationConfirmation: "RES321"
    }
  ]
}
```

## 🎯 Key Benefits

1. **💰 Low-Cost Storage**: Arrays of detailed objects per itinerary
2. **📝 Rich Details**: Store confirmations, costs, times, locations
3. **🤖 AI-Ready**: Structured data for AI recommendations
4. **💵 Cost Tracking**: Track costs per item, compare to budget
5. **🔍 Searchable**: Filter by destination, dates, budget

## 📚 Documentation

| File | Purpose |
|------|---------|
| [`ITINERARY_API_SPEC.md`](./ITINERARY_API_SPEC.md) | Complete API specification with all endpoints |
| [`BACKEND_SETUP.md`](./BACKEND_SETUP.md) | Quick setup guide with implementation template |
| [`ITINERARY_UPDATES.md`](./ITINERARY_UPDATES.md) | Detailed summary of what changed |
| `src/config/api.ts` | TypeScript interfaces (source of truth) |

## 🚀 Quick Test

Once backend is ready, test with:

```bash
# Should return empty array (not 404!)
curl "https://capgemini-hospitality-api-cfhkgge6a0h6ach6.eastus2-01.azurewebsites.net/api/itinerary?userId=test"

# Create test itinerary
curl -X POST \
  "https://capgemini-hospitality-api-cfhkgge6a0h6ach6.eastus2-01.azurewebsites.net/api/itinerary" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
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

## 🎨 UI Preview

The PlanningHistory page now:
- ✅ Fetches itineraries from API
- ✅ Shows rich destination info
- ✅ Displays budget and dates
- ✅ Allows filtering by time and price
- ✅ Creates structured itineraries
- ✅ Falls back to localStorage if API is unavailable

## ❓ Still Getting 404?

The container doesn't exist yet. Backend team needs to:

1. Create the `itineraries` container (see instructions above)
2. Deploy the Azure Function endpoints
3. Verify with test curl commands

**Frontend is ready and waiting! 🎉**

## 📝 Example Usage

### Creating an Itinerary (Frontend)

```typescript
import { apiService } from '@/config/api';

const newTrip = {
  userId: user.sub,
  title: "Summer in Bali",
  destination: "Bali, Indonesia",
  startDate: "2025-07-01",
  endDate: "2025-07-10",
  budget: 5000,
  currency: "USD",
  flights: [],
  activities: [
    {
      name: "Scuba Diving",
      description: "Full day diving",
      cost: 150
    }
  ],
  accommodations: [],
  restaurants: []
};

const response = await apiService.createItinerary(newTrip);
console.log('Created:', response.itinerary);
```

### Fetching Itineraries

```typescript
const itineraries = await apiService.getItineraries(userId);
console.log('My trips:', itineraries);
```

### Updating with Flights

```typescript
await apiService.updateItinerary(itineraryId, {
  flights: [
    {
      airline: "Singapore Airlines",
      flightNumber: "SQ452",
      departure: { airport: "JFK", time: "2025-07-01T22:30:00Z" },
      arrival: { airport: "DPS", time: "2025-07-02T18:45:00Z" },
      cost: 1200
    }
  ]
});
```

## 🆘 Need Help?

1. **Backend Setup**: Read [`BACKEND_SETUP.md`](./BACKEND_SETUP.md)
2. **API Details**: Read [`ITINERARY_API_SPEC.md`](./ITINERARY_API_SPEC.md)
3. **What Changed**: Read [`ITINERARY_UPDATES.md`](./ITINERARY_UPDATES.md)
4. **Code Reference**: Check `src/config/api.ts` for TypeScript interfaces
