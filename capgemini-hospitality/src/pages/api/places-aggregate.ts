import type { NextApiRequest, NextApiResponse } from 'next';

// Aggregator endpoint: calls Google Places Text Search and attempts TripAdvisor
// partner endpoints, normalizes results and deduplicates by name+address.

type Place = {
  id: string;
  source: 'google' | 'tripadvisor' | string;
  name: string;
  address?: string;
  rating?: number;
  numReviews?: number;
  priceLevel?: number;
  lat?: number;
  lng?: number;
  photoUrl?: string;
};

type AggregateResponse = {
  query: string;
  type: string;
  results: Place[];
  count: number;
};

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API || process.env.GOOGLE_MAPS_API_KEY || '';
const TA_KEY = process.env.TRIPADVISOR_API_KEY || '';

async function fetchGooglePlaces(textQuery: string) {
  if (!GOOGLE_KEY) return [] as Place[];

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    textQuery
  )}&key=${encodeURIComponent(GOOGLE_KEY)}&language=en`;

  const r = await fetch(url);
  if (!r.ok) return [] as Place[];
  const data = await r.json();
  const results = (data.results || []).slice(0, 12).map((p: any) => {
    const photoRef = p.photos && p.photos[0] && p.photos[0].photo_reference;
    const photoUrl = photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${encodeURIComponent(
          photoRef
        )}&key=${encodeURIComponent(GOOGLE_KEY)}`
      : undefined;

    const lat = p.geometry?.location?.lat;
    const lng = p.geometry?.location?.lng;

    const out: Place = {
      id: `google:${p.place_id}`,
      source: 'google',
      name: p.name,
      address: p.formatted_address,
      rating: p.rating !== undefined ? Number(p.rating) : undefined,
      numReviews: p.user_ratings_total !== undefined ? Number(p.user_ratings_total) : undefined,
      priceLevel: p.price_level !== undefined ? Number(p.price_level) : undefined,
      lat,
      lng,
      photoUrl,
    };

    return out;
  });

  return results as Place[];
}

async function fetchTripAdvisorPlaces(textQuery: string) {
  if (!TA_KEY) return [] as Place[];

  const candidates: Array<{ url: string; headers?: Record<string, string> }> = [
    { url: `https://api.tripadvisor.com/api/partner/2.0/locations/search?query=${encodeURIComponent(textQuery)}`, headers: { 'X-TripAdvisor-API-Key': TA_KEY } },
    { url: `https://api.tripadvisor.com/api/partner/2.0/search?query=${encodeURIComponent(textQuery)}`, headers: { 'X-TripAdvisor-API-Key': TA_KEY } },
    { url: `https://api.tripadvisor.com/api/partner/2.0/locations?query=${encodeURIComponent(textQuery)}`, headers: { 'X-TripAdvisor-API-Key': TA_KEY } },
    { url: `https://tripadvisor1.p.rapidapi.com/locations/search?query=${encodeURIComponent(textQuery)}`, headers: { 'X-RapidAPI-Key': TA_KEY, 'X-RapidAPI-Host': 'tripadvisor1.p.rapidapi.com' } },
    { url: `https://tripadvisor16.p.rapidapi.com/locations/search?query=${encodeURIComponent(textQuery)}`, headers: { 'X-RapidAPI-Key': TA_KEY, 'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com' } },
  ];

  for (const c of candidates) {
    try {
      const r = await fetch(c.url, { headers: c.headers });
      if (!r.ok) continue;
      const text = await r.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        // if non-json, skip
        continue;
      }

      // Attempt to find an array of items in the response
      let items: any[] | undefined;
      if (Array.isArray(json.results)) items = json.results;
      else if (Array.isArray(json.data)) items = json.data;
      else if (Array.isArray(json)) items = json;
      else {
        // try to find first array field
        for (const k of Object.keys(json)) {
          if (Array.isArray(json[k])) {
            items = json[k];
            break;
          }
        }
      }

      if (!items || items.length === 0) continue;

      // Map detected items to Place shape where possible
      const mapped: Place[] = items.slice(0, 12).map((it: any, idx: number) => {
        const id = it.location_id || it.place_id || it.id || `${c.url}#${idx}`;
        const name = it.name || it.title || it.address_obj?.address_string || it.address || '';
        const address = it.address || it.address_obj?.address_string || it.address_string || it.formatted_address || undefined;
        const rating = it.rating !== undefined ? Number(it.rating) : (it.raw_ranking ? undefined : undefined);
        const numReviews = it.num_reviews !== undefined ? Number(it.num_reviews) : it.num_reviews || undefined;
        const lat = it.latitude || it.lat || it.location?.lat || (it.geo && it.geo.latitude) || undefined;
        const lng = it.longitude || it.lng || it.location?.lng || (it.geo && it.geo.longitude) || undefined;
        const photoUrl = it.photo?.images?.original?.url || it.photo?.images?.medium?.url || undefined;

        const out: Place = {
          id: `ta:${id}`,
          source: 'tripadvisor',
          name: String(name || '').trim(),
          address: address ? String(address).trim() : undefined,
          rating: rating !== undefined ? rating : undefined,
          numReviews: numReviews !== undefined ? Number(numReviews) : undefined,
          lat: lat !== undefined ? Number(lat) : undefined,
          lng: lng !== undefined ? Number(lng) : undefined,
          photoUrl,
        };

        return out;
      });

      return mapped;
    } catch (err) {
      // try next candidate
      continue;
    }
  }

  return [] as Place[];
}

function dedupePlaces(places: Place[]) {
  const seen = new Map<string, Place>();
  for (const p of places) {
    const key = (p.name || '').toLowerCase().replace(/\s+/g, ' ').trim() + '|' + ((p.address || '') as string).toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seen.has(key)) seen.set(key, p);
    else {
      // merge fields preferring richer data
      const existing = seen.get(key)!;
      existing.photoUrl = existing.photoUrl || p.photoUrl;
      existing.rating = existing.rating || p.rating;
      existing.numReviews = existing.numReviews || p.numReviews;
      existing.lat = existing.lat || p.lat;
      existing.lng = existing.lng || p.lng;
      // prefer google id as canonical id
      if (existing.id.startsWith('ta:') && p.id.startsWith('google:')) existing.id = p.id;
    }
  }
  return Array.from(seen.values());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AggregateResponse | { error: string }>) {
  const query = (req.query.query as string) || '';
  const type = (req.query.type as string) || 'hotels';

  if (!query) return res.status(400).json({ error: 'query param is required' });

  const textQuery = `${type} in ${query}`;

  const [google, tripadvisor] = await Promise.all([fetchGooglePlaces(textQuery), fetchTripAdvisorPlaces(textQuery)]);

  // combine and dedupe
  const combined = dedupePlaces([...google, ...tripadvisor]);

  const response: AggregateResponse = {
    query,
    type,
    results: combined,
    count: combined.length,
  };

  res.status(200).json(response);
}
