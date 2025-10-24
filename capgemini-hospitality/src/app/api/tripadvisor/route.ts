import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// TripAdvisor API base URL
const TRIPADVISOR_API_BASE = 'https://api.content.tripadvisor.com/api/v1';

interface TripAdvisorLocation {
  location_id: string;
  name: string;
  address_obj?: {
    street1?: string;
    city?: string;
    state?: string;
    country?: string;
    address_string?: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'hotels'; // hotels, restaurants, attractions
    const incomingReferer = req.headers.get('referer') || '';
    // Allow explicitly overriding the Referer/Origin sent to TripAdvisor via env var.
    // Supports a single origin or a comma-separated list (first valid match wins).
    const allowedOriginEnv = (process.env.TRIPADVISOR_ALLOWED_ORIGIN || process.env.TRIPADVISOR_ALLOWED_ORIGINS || '').toString();
    const allowedOrigins = allowedOriginEnv
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);
    
    const defaultDevOrigin = 'http://localhost:3000';
    const defaultProdOrigin = 'https://purple-sand-06148da0f.1.azurestaticapps.net';
    
    const pickOrigin = (ref: string): string => {
      // If env has explicit allowed origins, prefer the first one that matches the incoming referrer origin.
      try {
        const refOrigin = ref ? new URL(ref).origin : '';
        if (allowedOrigins.length > 0) {
          if (refOrigin && allowedOrigins.includes(refOrigin)) return refOrigin;
          return allowedOrigins[0];
        }
        return refOrigin || (process.env.NODE_ENV === 'production' ? defaultProdOrigin : defaultDevOrigin);
      } catch {
        // If ref is not a valid URL, fall back to env/defaults.
        return allowedOrigins[0] || (process.env.NODE_ENV === 'production' ? defaultProdOrigin : defaultDevOrigin);
      }
    };
    const effectiveOrigin = pickOrigin(incomingReferer);
    const effectiveReferer = incomingReferer || effectiveOrigin;
    
    console.log('🔍 TripAdvisor request debug:', {
      incomingReferer,
      allowedOrigins,
      effectiveOrigin,
      effectiveReferer
    });
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

  const apiKey = process.env.TRIPADVISOR_API_KEY;
    
    if (!apiKey) {
      console.error('❌ TRIPADVISOR_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'TripAdvisor API key not configured' },
        { status: 500 }
      );
    }

    console.log('✅ TripAdvisor API key loaded, length:', apiKey.length);

    // Use location search with category-specific queries
    // This works with the Content API tier we have access to
    let searchQuery = query;
    
    // Enhance search query based on type to get more relevant results
    if (!query.toLowerCase().includes(type)) {
      switch (type) {
        case 'restaurants':
          searchQuery = `${query} restaurants food dining`;
          break;
        case 'attractions':
          searchQuery = `${query} attractions things to do sightseeing`;
          break;
        case 'hotels':
          searchQuery = `${query} hotels accommodation lodging`;
          break;
      }
    }

    const searchUrl = `${TRIPADVISOR_API_BASE}/location/search?searchQuery=${encodeURIComponent(searchQuery)}&language=en&key=${apiKey}`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-TripAdvisor-API-Key': apiKey,
        'x-api-key': apiKey,
        'Referer': effectiveReferer,
        'Origin': effectiveOrigin,
        'User-Agent': 'capgemini-hospitality-demo/1.0'
      },
    });

    if (!searchResponse.ok) {
      const status = searchResponse.status;
      const errorText = await searchResponse.text();
      console.error('TripAdvisor search error:', errorText);
      return NextResponse.json(
        { error: 'Failed to search TripAdvisor', details: errorText },
        { status }
      );
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      return NextResponse.json({
        query,
        results: [],
        message: 'No results found for your query',
        type
      });
    }

    // Heuristic filters to improve relevance by type
    const HOTEL_RE = /\b(hotel|inn|resort|motel|hostel|lodge|lodging|suites?|apartment|residence|palace|marriott|hilton|hyatt|sheraton|westin|ritz|fairmont|four seasons|doubletree|hampton)\b/i;
    const RESTAURANT_RE = /\b(restaurant|cafe|coffee|bar|grill|bistro|pizzeria|pizza|diner|pub|steak|bbq|sushi|taco|taqueria|bakery|brasserie|eatery|kitchen|cantina|ramen|noodle|brewery|wine|brunch)\b/i;
    const ATTRACTION_RE = /\b(museum|park|garden|zoo|aquarium|gallery|monument|landmark|square|plaza|bridge|tower|beach|trail|mountain|lake|cathedral|church|temple|mosque|fort|castle|palace|market|bazaar|theater|stadium|arena|observatory|library|cemetery|memorial|waterfall|port|harbor|harbour)\b/i;

    const rawItems: TripAdvisorLocation[] = searchData.data || [];
    let items: TripAdvisorLocation[] = rawItems;

    if (type === 'restaurants') {
      // Prefer names that look like food places; always exclude obvious hotels
      const primary = rawItems.filter(it => {
        const n = (it.name || '').toLowerCase();
        return !HOTEL_RE.test(n) && RESTAURANT_RE.test(n);
      });
      items = primary.length >= 3 ? primary : rawItems.filter(it => {
        const n = (it.name || '').toLowerCase();
        return !HOTEL_RE.test(n);
      });
    } else if (type === 'attractions') {
      // Prefer attractions; exclude obvious hotels
      const primary = rawItems.filter(it => {
        const n = (it.name || '').toLowerCase();
        return !HOTEL_RE.test(n) && ATTRACTION_RE.test(n);
      });
      items = primary.length >= 3 ? primary : rawItems.filter(it => {
        const n = (it.name || '').toLowerCase();
        return !HOTEL_RE.test(n);
      });
    } else if (type === 'hotels') {
      // Prefer names that look like hotels, but if none found, return all to avoid empty state
      const primary = rawItems.filter(it => HOTEL_RE.test((it.name || '')));
      items = primary.length >= 3 ? primary : rawItems;
    }

    // Format the results from filtered items
    const results = items.slice(0, 10).map((item: TripAdvisorLocation) => {
      const addressObj = item.address_obj || {};
      const addressParts = [
        addressObj.street1,
        addressObj.city,
        addressObj.state,
        addressObj.country
      ].filter(Boolean);
      
      return {
        id: item.location_id,
        name: item.name,
        description: `Located in ${addressObj.city || addressObj.state || addressObj.country || 'Unknown'}`,
        address: addressParts.join(', ') || addressObj.address_string,
        // Note: Location search doesn't return ratings/photos, but returns valid locations
        // Users can click through to TripAdvisor for full details
      };
    });

    return NextResponse.json({
      query,
      location: searchData.data[0] ? {
        id: searchData.data[0].location_id,
        name: searchData.data[0].name,
        address: searchData.data[0].address_obj,
      } : null,
      type,
      results,
      count: results.length,
      source: 'live'
    });

  } catch (error) {
    console.error('TripAdvisor API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
