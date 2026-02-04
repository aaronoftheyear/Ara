// Serverless proxy for MyAnimeList API to avoid CORS and third-party proxy 403s.
// Uses MAL_CLIENT_ID from Vercel env only (no header from client) so the browser sends a simple GET and no preflight.
// Usage: GET /api/mal-proxy?path=https://api.myanimelist.net/v2/...
// Set MAL_CLIENT_ID in Vercel → Project → Settings → Environment Variables.

const MAL_BASE = 'https://api.myanimelist.net';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const method = (req && req.method || '').toUpperCase();
  if (method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const path = (req.query && req.query.path) || '';
  if (!path || typeof path !== 'string') {
    res.status(400).json({ error: 'Query parameter "path" is required' });
    return;
  }

  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: 'MAL_CLIENT_ID not set. Add it in Vercel → Project → Settings → Environment Variables.' });
    return;
  }

  const url = path.startsWith('http') ? path : MAL_BASE + (path.startsWith('/') ? path : '/' + path);
  if (!url.startsWith(MAL_BASE)) {
    res.status(400).json({ error: 'path must target api.myanimelist.net only' });
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-MAL-CLIENT-ID': clientId },
    });

    const body = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);

    if (!response.ok) {
      res.status(response.status).send(body || response.statusText);
      return;
    }
    res.status(200).send(body);
  } catch (err) {
    console.error('MAL proxy error:', err);
    res.status(502).json({ error: 'Proxy request failed', message: err.message });
  }
};
