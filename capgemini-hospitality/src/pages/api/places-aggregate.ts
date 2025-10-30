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
  const dataRaw = await r.json();

  // safe access helpers
  const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
  const resultsArr: unknown[] = isRecord(dataRaw) && Array.isArray(dataRaw.results) ? (dataRaw.results as unknown[]) : [];

  const results = resultsArr.slice(0, 12).map((p: unknown) => {
    const pRec = isRecord(p) ? p : {};

    const photoRef = Array.isArray(pRec.photos) && isRecord(pRec.photos[0]) ? (pRec.photos[0] as Record<string, unknown>).photo_reference : undefined;
    const photoUrl = typeof photoRef === 'string'
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${encodeURIComponent(
          photoRef
        )}&key=${encodeURIComponent(GOOGLE_KEY)}`
      : undefined;

    const geometry = isRecord(pRec.geometry) ? (pRec.geometry as Record<string, unknown>) : undefined;
    const location = geometry && isRecord(geometry.location) ? (geometry.location as Record<string, unknown>) : undefined;
    const lat = typeof location?.lat === 'number' ? location!.lat : (typeof location?.lat === 'string' ? Number(location!.lat) : undefined);
    const lng = typeof location?.lng === 'number' ? location!.lng : (typeof location?.lng === 'string' ? Number(location!.lng) : undefined);

    const out: Place = {
      id: `google:${String(pRec.place_id ?? '')}`,
      source: 'google',
      name: typeof pRec.name === 'string' ? pRec.name : String(pRec.name ?? ''),
      address: typeof pRec.formatted_address === 'string' ? pRec.formatted_address : undefined,
      rating: typeof pRec.rating === 'number' ? pRec.rating : (typeof pRec.rating === 'string' ? Number(pRec.rating) : undefined),
      numReviews: typeof pRec.user_ratings_total === 'number' ? pRec.user_ratings_total : (typeof pRec.user_ratings_total === 'string' ? Number(pRec.user_ratings_total) : undefined),
      priceLevel: typeof pRec.price_level === 'number' ? pRec.price_level : (typeof pRec.price_level === 'string' ? Number(pRec.price_level) : undefined),
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

  const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

  for (const c of candidates) {
    try {
      const r = await fetch(c.url, { headers: c.headers });
      if (!r.ok) continue;
      const text = await r.text();
      let json: unknown = null;
      try {
        json = JSON.parse(text);
      } catch {
        // if non-json, skip
        continue;
      }

      // Attempt to find an array of items in the response
      let items: unknown[] | undefined;
      if (Array.isArray(json)) items = json as unknown[];
      else if (isRecord(json) && Array.isArray(json.results)) items = (json.results as unknown[]);
      else if (isRecord(json) && Array.isArray(json.data)) items = (json.data as unknown[]);
      else if (isRecord(json)) {
        for (const k of Object.keys(json)) {
          const v = (json as Record<string, unknown>)[k];
          if (Array.isArray(v)) {
            items = v as unknown[];
            break;
          }
        }
      }

      if (!items || items.length === 0) continue;

      // Map detected items to Place shape where possible
      const mapped: Place[] = items.slice(0, 12).map((it: unknown, idx: number) => {
        const rec = isRecord(it) ? it : {};

        const pickString = (...keys: string[]) => {
          for (const k of keys) {
            const v = rec[k];
            if (typeof v === 'string') return v;
            if (typeof v === 'number') return String(v);
          }
          return undefined as string | undefined;
        };

        const pickNumber = (...keys: string[]) => {
          for (const k of keys) {
            const v = rec[k];
            if (typeof v === 'number') return v;
            if (typeof v === 'string' && v.trim() !== '') {
              const n = Number(v);
              if (!Number.isNaN(n)) return n;
            }
          }
          return undefined as number | undefined;
        };

        const getNested = (obj: unknown, path: string[]) => {
          let cur: unknown = obj;
          for (const p of path) {
            if (!isRecord(cur)) return undefined;
            cur = cur[p];
          }
          return cur;
        };

        const idVal = pickString('location_id', 'place_id', 'id') || `${c.url}#${idx}`;
        const name = pickString('name', 'title') || (isRecord(rec.address_obj) && typeof rec.address_obj.address_string === 'string' ? rec.address_obj.address_string : undefined) || pickString('address') || '';
        const address = pickString('address') || (isRecord(rec.address_obj) && typeof rec.address_obj.address_string === 'string' ? rec.address_obj.address_string : undefined) || pickString('address_string') || pickString('formatted_address');

        const lat = pickNumber('latitude', 'lat') ?? (typeof getNested(rec.location, ['lat']) === 'number' ? (getNested(rec.location, ['lat']) as number) : (typeof getNested(rec.geo, ['latitude']) === 'number' ? (getNested(rec.geo, ['latitude']) as number) : undefined));
        const lng = pickNumber('longitude', 'lng') ?? (typeof getNested(rec.location, ['lng']) === 'number' ? (getNested(rec.location, ['lng']) as number) : (typeof getNested(rec.geo, ['longitude']) === 'number' ? (getNested(rec.geo, ['longitude']) as number) : undefined));

        // photo extraction (common patterns)
        let photoUrl: string | undefined;
        const photoRec = isRecord(rec.photo) ? rec.photo as Record<string, unknown> : undefined;
        if (photoRec) {
          const orig = getNested(photoRec, ['images', 'original', 'url']);
          const med = getNested(photoRec, ['images', 'medium', 'url']);
          if (typeof orig === 'string') photoUrl = orig;
          else if (typeof med === 'string') photoUrl = med;
        }

        const rating = pickNumber('rating');
        const numReviews = pickNumber('num_reviews');

        const out: Place = {
          id: `ta:${String(idVal)}`,
          source: 'tripadvisor',
          name: String((name || '')).trim(),
          address: typeof address === 'string' ? address.trim() : undefined,
          rating: rating !== undefined ? rating : undefined,
          numReviews: numReviews !== undefined ? numReviews : undefined,
          lat: lat !== undefined ? lat : undefined,
          lng: lng !== undefined ? lng : undefined,
          photoUrl,
        };

        return out;
      });

      return mapped;
    } catch {
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
