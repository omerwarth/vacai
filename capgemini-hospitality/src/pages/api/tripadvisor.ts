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
  location: { id: string; name: string; address?: any };
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
    res.status(400).json({ error: 'query param is required' } as any);
    return;
  }

  if (!GOOGLE_KEY) {
    res.status(500).json({ error: 'Google Maps API key not configured on server' } as any);
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
      res.status(502).json({ error: `Google Places error: ${r.status} ${text}` } as any);
      return;
    }

    const data = await r.json();
    const results = (data.results || []).slice(0, 12).map((p: any) => {
      const photoRef = p.photos && p.photos[0] && p.photos[0].photo_reference;
      const photoUrl = photoRef
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${encodeURIComponent(
            photoRef
          )}&key=${encodeURIComponent(GOOGLE_KEY)}`
        : undefined;

      const out: TripAdvisorResult = {
        id: `google:${p.place_id}`,
        name: p.name,
        description: p.types ? p.types.join(', ') : undefined,
        rating: p.rating !== undefined ? String(p.rating) : undefined,
        numReviews: p.user_ratings_total !== undefined ? String(p.user_ratings_total) : undefined,
        priceLevel: p.price_level !== undefined ? String(p.price_level) : undefined,
        address: p.formatted_address,
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
  } catch (err: any) {
    console.error('TripAdvisor proxy error:', err);
    res.status(500).json({ error: err.message || 'unknown error' } as any);
  }
}
