import type { NextApiRequest, NextApiResponse } from 'next';

// Simple proxy to return live place data using Google Places Text Search.
// This keeps API keys server-side and returns a minimal shape compatible
// with the frontend `TripAdvisorSearch` component.

type TripAdvisorResult = {
  id: string;
  name: string;
  description?: string;
  rating?: string;
  numReviews?: string;
  priceLevel?: string;
  address?: string;
  phone?: string;
  website?: string;
  photoUrl?: string;
};

type TripAdvisorResponse = {
  query: string;
  location: { id: string; name: string; address?: string };
  type: string;
  results: TripAdvisorResult[];
  count: number;
  error?: string;
  message?: string;
};

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API || process.env.GOOGLE_MAPS_API_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse<TripAdvisorResponse | { error: string }>) {
  const query = (req.query.query as string) || '';
  const type = (req.query.type as string) || 'hotels';

  if (!query) {
    res.status(400).json({ error: 'query param is required' });
    return;
  }

  if (!GOOGLE_KEY) {
    res.status(500).json({ error: 'Google Maps API key not configured on server' });
    return;
  }

  try {
    // Use Text Search to get places matching the user's query.
    const textQuery = `${type} in ${query}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      textQuery
    )}&key=${encodeURIComponent(GOOGLE_KEY)}&language=en`;

    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      res.status(502).json({ error: `Google Places error: ${r.status} ${text}` });
      return;
    }

    const data = await r.json();

    const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
    const resultsArr: unknown[] = isRecord(data) && Array.isArray(data.results) ? (data.results as unknown[]) : [];

    const results = resultsArr.slice(0, 12).map((p: unknown) => {
      const pRec = isRecord(p) ? p : {};

      const photoRef = Array.isArray(pRec.photos) && isRecord(pRec.photos[0]) ? (pRec.photos[0] as Record<string, unknown>).photo_reference : undefined;
      const photoUrl = typeof photoRef === 'string'
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${encodeURIComponent(
            photoRef
          )}&key=${encodeURIComponent(GOOGLE_KEY)}`
        : undefined;

      const types = Array.isArray(pRec.types) ? pRec.types.filter((t) => typeof t === 'string').join(', ') : undefined;

      const out: TripAdvisorResult = {
        id: `google:${String(pRec.place_id ?? '')}`,
        name: typeof pRec.name === 'string' ? pRec.name : String(pRec.name ?? ''),
        description: types,
        rating: pRec.rating !== undefined ? String(pRec.rating) : undefined,
        numReviews: pRec.user_ratings_total !== undefined ? String(pRec.user_ratings_total) : undefined,
        priceLevel: pRec.price_level !== undefined ? String(pRec.price_level) : undefined,
        address: typeof pRec.formatted_address === 'string' ? pRec.formatted_address : undefined,
        photoUrl,
      };

      return out;
    });

    const response: TripAdvisorResponse = {
      query,
      location: { id: '', name: query },
      type,
      results,
      count: results.length,
    };

    res.status(200).json(response);
  } catch (err: unknown) {
    console.error('TripAdvisor proxy error:', err);
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err) || 'unknown error';
    res.status(500).json({ error: message });
  }
}
