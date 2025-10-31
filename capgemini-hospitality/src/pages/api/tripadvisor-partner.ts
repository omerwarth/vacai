import type { NextApiRequest, NextApiResponse } from 'next';

// Diagnostic endpoint to attempt calling TripAdvisor partner/RapidAPI endpoints.
// It tries multiple common host/path/header combinations and returns the
// first successful response or a diagnostic list of failures to help identify
// the correct partner integration format.

type Diagnostic = {
  url: string;
  status?: number;
  ok?: boolean;
  bodySnippet?: string;
  error?: string;
  usedHeaders?: Record<string, string>;
};

const TA_KEY = process.env.TRIPADVISOR_API_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse<unknown>) {
  const query = (req.query.query as string) || '';

  if (!query) return res.status(400).json({ error: 'query param is required' });
  if (!TA_KEY) return res.status(500).json({ error: 'TRIPADVISOR_API_KEY not configured in environment' });

  // Candidate endpoints and their headers. We'll try each in order.
  const candidates: Array<{ url: string; headers?: Record<string, string> }> = [
    // Official partner-style header (common pattern)
    {
      url: `https://api.tripadvisor.com/api/partner/2.0/locations/search?query=${encodeURIComponent(query)}`,
      headers: { 'X-TripAdvisor-API-Key': TA_KEY },
    },
    {
      url: `https://api.tripadvisor.com/api/partner/2.0/search?query=${encodeURIComponent(query)}`,
      headers: { 'X-TripAdvisor-API-Key': TA_KEY },
    },
    {
      url: `https://api.tripadvisor.com/api/partner/2.0/locations?query=${encodeURIComponent(query)}`,
      headers: { 'X-TripAdvisor-API-Key': TA_KEY },
    },
    // RapidAPI host variants (if your key is a RapidAPI key)
    {
      url: `https://tripadvisor1.p.rapidapi.com/locations/search?query=${encodeURIComponent(query)}`,
      headers: { 'X-RapidAPI-Key': TA_KEY, 'X-RapidAPI-Host': 'tripadvisor1.p.rapidapi.com' },
    },
    {
      url: `https://tripadvisor16.p.rapidapi.com/locations/search?query=${encodeURIComponent(query)}`,
      headers: { 'X-RapidAPI-Key': TA_KEY, 'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com' },
    },
  ];

  const diagnostics: Diagnostic[] = [];

  for (const c of candidates) {
    try {
      const r = await fetch(c.url, { headers: c.headers });
      const text = await r.text();
      const snippet = text ? text.slice(0, 2000) : '';
      const diag: Diagnostic = {
        url: c.url,
        status: r.status,
        ok: r.ok,
        bodySnippet: snippet,
        usedHeaders: c.headers,
      };

      diagnostics.push(diag);

      if (r.ok) {
        // Return upstream response (try to parse JSON first)
        try {
          const json = JSON.parse(text);
          return res.status(200).json({ providerUrl: c.url, headers: c.headers, upstream: json });
        } catch (_err) {
          // JSON parse failed; include a short debug log for visibility and return raw text
          console.debug('TripAdvisor partner parse error', _err);
          return res.status(200).send({ providerUrl: c.url, headers: c.headers, upstreamText: snippet });
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      diagnostics.push({ url: c.url, error: message, usedHeaders: c.headers });
    }
  }

  // No successful candidate; return diagnostics to help debug.
  return res.status(502).json({ error: 'No TripAdvisor endpoint succeeded', diagnostics });
}
